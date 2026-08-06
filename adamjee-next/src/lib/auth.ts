import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User';
import { IS_PROD } from './security';

/**
 * JWT signing key.
 *
 * There is deliberately no hardcoded fallback: a predictable secret lets anyone
 * mint a token with {role:'admin'} and take over the dashboard. In production a
 * missing/weak secret is a hard failure; in development we generate an ephemeral
 * one so `next dev` still runs (tokens simply do not survive a restart).
 */
const MIN_SECRET_LENGTH = 32;
const WEAK_SECRETS = new Set(['secret', 'changeme', 'your_jwt_secret_key_here', 'jwt_secret']);

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const isWeak =
    !secret || secret.length < MIN_SECRET_LENGTH || WEAK_SECRETS.has(secret.trim().toLowerCase());

  if (isWeak) {
    if (IS_PROD) {
      throw new Error(
        `JWT_SECRET is missing or too weak. Set a random value of at least ${MIN_SECRET_LENGTH} characters.`
      );
    }
    console.warn(
      `⚠️  JWT_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} chars. ` +
        'Using a random development-only secret; all sessions reset on restart.'
    );
    return require('crypto').randomBytes(48).toString('hex');
  }
  return secret;
}

export const JWT_SECRET: string = ((global as any).__jwtSecret ??= resolveJwtSecret());

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export async function getAuthenticatedUser(req: Request): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7).trim();
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || typeof decoded.id !== 'string') return null;

    // Identity is only ever established against the database. With no
    // connection there is nothing to verify a token's subject against, so the
    // request is treated as unauthenticated rather than trusted on its claims.
    if (mongoose.connection.readyState !== 1) {
      return null;
    }

    // Role always comes from the database, never from the token, so a demotion
    // or deactivation takes effect immediately.
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return null;
    if (!user.isActive) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  } catch (err) {
    return null;
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

/** Convenience guard: resolves the caller and asserts the admin role. */
export async function requireAdmin(req: Request): Promise<AuthUser | null> {
  const user = await getAuthenticatedUser(req);
  return isAdmin(user) ? user : null;
}
