"use client";

import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InputArea() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');

    const tokenCount = Math.ceil(text.length / 4);
    const cost = (tokenCount / 1_000_000) * 0.10; // ~$0.10 per 1M tokens (Gemini Flash input estimate)

    const handleIngest = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setStatus('idle');
        try {
            const res = await fetch('/api/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    metadata: {
                        title: 'User Input',
                        source: 'Paste'
                    }
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to ingest');
            setStatus('success');
            setMsg(`Indexed ${data.chunks} chunks successfully.`);
            setText(''); // Clear input on success
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err: any) {
            setStatus('error');
            setMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto rounded-3xl border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative"
        >
            {/* Gradient glow effect */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />

            <div className="p-6 md:p-8 relative">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Upload className="w-5 h-5" />
                    </div>
                    Ingest Knowledge
                </h2>

                <div className="relative group">
                    <textarea
                        className="w-full h-40 p-4 rounded-2xl border border-white/10 bg-black/20 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                        placeholder="Paste your text here (articles, notes, documentation)..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-muted-foreground/50 pointer-events-none">
                        <span>{text.length} chars</span>
                        {text.length > 0 && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/10">
                                ~{tokenCount} tokens (${cost.toFixed(5)})
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm min-h-[24px]">
                        <AnimatePresence mode="wait">
                            {status === 'success' && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-green-500 flex items-center gap-2 font-medium"
                                >
                                    <CheckCircle className="w-4 h-4" /> {msg}
                                </motion.span>
                            )}
                            {status === 'error' && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-destructive flex items-center gap-2 font-medium"
                                >
                                    <AlertCircle className="w-4 h-4" /> {msg}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleIngest}
                        disabled={loading || !text.trim()}
                        className="relative overflow-hidden group bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/25"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ingest Text'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
