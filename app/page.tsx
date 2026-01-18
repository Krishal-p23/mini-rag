import InputArea from '@/components/InputArea';
import ChatArea from '@/components/ChatArea';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(60,20,150,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 right-0 h-[500px] w-full bg-gradient-to-b from-primary/5 to-transparent -z-10 blur-3xl ml-[-50%] w-[200%]" />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              AI Powered Knowledge Base
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent pb-2">
            Mini RAG Assistant
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ingest content and ask questions with <span className="text-foreground font-medium">AI-powered citations</span>.
            Your personal knowledge assistant, reimagined.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <InputArea />
          <ChatArea />
        </div>

        <footer className="text-center text-sm text-muted-foreground pt-12 pb-8">
          <p>Powered by Next.js, Pinecone, Gemini, & Cohere</p>
        </footer>
      </div>
    </main>
  );
}
