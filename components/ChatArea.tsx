"use client";

import { useState } from 'react';
import { Search, Loader2, Sparkles, Clock, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatArea() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [citations, setCitations] = useState<any[]>([]);
    const [time, setTime] = useState<number | null>(null);
    const [error, setError] = useState('');

    const tokenCount = Math.ceil(query.length / 4);
    const cost = (tokenCount / 1_000_000) * 0.10;

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setAnswer(null);

        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Query failed');

            setAnswer(data.answer);
            setCitations(data.citations);
            setTime(data.time);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full h-full rounded-3xl border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative flex flex-col"
        >
            {/* Gradient glow effect */}
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="p-6 md:p-8 relative flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-3 text-foreground">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        Ask AI
                    </h2>
                    {query.length > 0 && (
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20">
                            ~{tokenCount} tokens (${cost.toFixed(6)})
                        </span>
                    )}
                </div>

                <form onSubmit={handleQuery} className="flex gap-3 mb-8">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            className="w-full p-4 pl-12 rounded-2xl border border-white/10 bg-black/20 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Ask a question about the ingested text..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-indigo-600 text-white px-6 rounded-xl font-medium hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center min-w-[60px]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </form>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-destructive text-sm mb-4 bg-destructive/10 p-3 rounded-xl border border-destructive/20"
                        >
                            Error: {error}
                        </motion.div>
                    )}

                    {!loading && !answer && !error && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-muted-foreground/50 py-12"
                        >
                            {/* Empty state or 'No Answer' state handling could go here closer to input if desired, 
                               but here we handle the explicit null answer from API */}
                        </motion.div>
                    )}

                    {/* Explicit no answer state */}
                    {answer === null && !loading && !error && citations.length === 0 && query && (
                        <motion.div
                            key="no-answer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center"
                        >
                            <p className="text-muted-foreground">
                                I couldn't find any relevant information in the ingested content to answer your question.
                            </p>
                        </motion.div>
                    )}

                    {answer && (
                        <motion.div
                            key="answer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Answer Box */}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles className="w-24 h-24" />
                                </div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Answer</h3>
                                    {time && (
                                        <span className="text-xs text-muted-foreground/70 flex items-center gap-1 bg-white/5 py-1 px-2 rounded-lg border border-white/5">
                                            <Clock className="w-3 h-3" /> {time}ms
                                        </span>
                                    )}
                                </div>
                                <div className="prose prose-invert text-sm leading-relaxed whitespace-pre-wrap relative z-10 text-slate-200">
                                    {answer}
                                </div>
                            </div>

                            {/* Citations Box */}
                            {citations.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 ml-1 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Sources & Citations
                                    </h3>
                                    <div className="grid gap-3">
                                        {citations.map((c, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="group bg-black/20 hover:bg-white/5 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-default"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                                        [{i + 1}]
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {(c.score * 100).toFixed(1)}% Match
                                                    </span>
                                                    {c.metadata?.source && (
                                                        <span className="text-[10px] text-muted-foreground border-l border-white/10 pl-2 ml-1 truncate max-w-[200px]">
                                                            {c.metadata.title || c.metadata.source}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground/80 italic line-clamp-2 group-hover:text-slate-300 transition-colors">
                                                    "{c.text}"
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
