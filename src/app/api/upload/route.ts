import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { requireAdmin } from '@/lib/auth';
import { forbidden, rateLimit, serverError } from '@/lib/security';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Only raster/vector-free image formats. `.svg` is deliberately excluded: SVGs
// are executable documents and serving one from our own origin is stored XSS.
const ALLOWED: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

// Magic-byte prefixes, so a renamed .html cannot pass by claiming image/png.
function sniff(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buffer.toString('ascii', 4, 8) === 'ftyp' && buffer.toString('ascii', 8, 12).startsWith('avif')) return 'image/avif';
  return null;
}

export async function POST(req: Request) {
  try {
    // Writing into public/ is a privileged operation: it publishes content on
    // our own origin. Admins only.
    if (!(await requireAdmin(req))) return forbidden();

    const limited = rateLimit(req, 'upload', 60, 60_000);
    if (limited) return limited;

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Image is too large (5 MB maximum).' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ success: false, message: 'Image is too large (5 MB maximum).' }, { status: 413 });
    }

    const detected = sniff(buffer);
    if (!detected || !ALLOWED[detected]) {
      return NextResponse.json(
        { success: false, message: 'Unsupported file type. Upload a PNG, JPEG, WebP, GIF or AVIF image.' },
        { status: 415 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Filename is generated entirely server-side — the client's name (and any
    // traversal sequence or double extension in it) is never used.
    const filename = `image-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ALLOWED[detected]}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded',
      image: `/uploads/${filename}`,
    });
  } catch (err: any) {
    return serverError('POST /api/upload', err);
  }
}
