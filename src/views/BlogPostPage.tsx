'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock, Share2, MessageSquare, ThumbsUp, CheckCircle, Sparkles, Send } from 'lucide-react';


export default function BlogPostPage() {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Comment section state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ name: string; date: string; text: string }>>([
    { name: 'Sameer Khan', date: 'May 11, 2026', text: 'Super helpful walkthrough! My custom build booted on the first try thanks to your airflow tips.' },
    { name: 'Bilal Ahmed', date: 'May 12, 2026', text: 'Great benchmark insights! Are you planning a comparison with AMD RX 7900 XTX next?' }
  ]);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/blogs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.blog) {
          setPost({
            title: data.blog.title,
            content: data.blog.content,
            image: data.blog.image || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1400&q=80',
            images: data.blog.images || data.blog.additionalImages || [],
            category: data.blog.category || 'Guides',
            date: new Date(data.blog.publishedAt || data.blog.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: data.blog.author || 'Adamjee Team',
            readTime: `${Math.max(3, Math.ceil((data.blog.content || '').length / 400))} min read`
          });
          setLoading(false);
          return;
        }
        
        // Not in the database — there is no local copy to fall back to.
        setPost(null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch blog post:", err);
        setPost(null);
        setLoading(false);
      });
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setComments(prev => [
      {
        name: commentName,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        text: commentText
      },
      ...prev
    ]);
    setCommentName('');
    setCommentEmail('');
    setCommentText('');
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#f8fafc] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#164475] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-[#0a1b2d] mb-4">Article Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">The requested tech article may have been removed or updated.</p>
        <Link href="/blog" className="px-6 py-2.5 bg-[#164475] text-white text-xs font-bold rounded-full">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#f8fafc]">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-extrabold text-[#164475] hover:text-[#0f2a4a] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to All Articles
          </Link>
        </div>

        {/* Article Container Card */}
        <article className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm p-6 md:p-12 mb-12">
          
          {/* Category & Title */}
          <div className="mb-6">
            <span className="inline-block bg-[#164475] text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-[#0a1b2d] leading-tight mb-6">
              {post.title}
            </h1>
            
            {/* Author & Meta Details Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#164475] text-white flex items-center justify-center font-bold text-sm">
                  {post.author ? post.author.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="font-bold text-[#0a1b2d]">{post.author}</p>
                  <p className="text-[10px] text-slate-400">Adamjee Tech Editorial</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime || '5 min read'}</span>
                <button onClick={handleShare} className="flex items-center gap-1.5 text-[#164475] hover:text-[#0f2a4a] font-bold">
                  <Share2 className="w-4 h-4" /> {copied ? 'Copied Link!' : 'Share'}
                </button>
              </div>
            </div>
          </div>

          {/* Featured Hero Cover Image */}
          <div className="mb-10 rounded-3xl overflow-hidden aspect-video border border-slate-100 shadow-sm">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Multiple Gallery Images Grid (If post has images) */}
          {Array.isArray(post.images) && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {post.images.map((imgUrl: string, idx: number) => (
                <div key={idx} className="rounded-2xl overflow-hidden aspect-square border border-slate-200">
                  <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          )}

          {/* Formatted Article Body */}
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-6 text-sm md:text-base">
            {post.content.split('\n\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xl md:text-2xl font-black text-[#0a1b2d] mt-8 mb-4">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="my-6 p-6 border-l-4 border-[#164475] bg-slate-50 rounded-r-2xl font-medium text-slate-800 italic text-base">
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Author Bio Footer Card */}
          <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#164475] text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
              {post.author ? post.author.charAt(0) : 'A'}
            </div>
            <div>
              <h4 className="font-bold text-[#0a1b2d] text-sm">{post.author}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Senior Hardware Engineer & Tech Journalist at Adamjee Computers. Specialist in GPU architectures and high-end PC builds.
              </p>
            </div>
          </div>

        </article>

        {/* Interactive Comments Section (Matching Reference Dribbble Design) */}
        <section className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-10 shadow-sm mb-12 space-y-8">
          <h3 className="text-xl font-extrabold text-[#0a1b2d] flex items-center gap-2 border-b pb-4">
            <MessageSquare className="w-5 h-5 text-[#164475]" /> Join Discussion ({comments.length})
          </h3>

          {/* Write a Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-[#0a1b2d] uppercase tracking-wider">Leave a Comment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                placeholder="Your Name *"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#164475]"
              />
              <input
                type="email"
                value={commentEmail}
                onChange={e => setCommentEmail(e.target.value)}
                placeholder="Your Email *"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#164475]"
              />
            </div>
            <textarea
              rows={3}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share your thoughts on this article..."
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#164475]"
            ></textarea>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#164475] hover:bg-[#0f2a4a] text-white text-xs font-extrabold px-6 py-2.5 rounded-full transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Post Comment
            </button>
          </form>

          {/* Posted Comments List */}
          <div className="space-y-4">
            {comments.map((c, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0a1b2d]">{c.name}</span>
                  <span className="text-slate-400 text-[10px] font-semibold">{c.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
