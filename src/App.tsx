import { useState, useEffect } from "react";
import { Brain, Database, Zap, Sparkles, Activity, Star, MessageSquare, Send } from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [health, setHealth] = useState<any>(null);
  const [dbTime, setDbTime] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [bgUrl, setBgUrl] = useState("/soulserver-bg.jpg");

  useEffect(() => {
    const img = new Image();
    img.src = "/soulserver-bg.jpg";
    img.onerror = () => {
      console.warn("Local background image failed to load, switching to GitHub fallback.");
      setBgUrl("https://raw.githubusercontent.com/marciohmc/SoulServer/refs/heads/main/img/soulserver-bg.jpg");
    };
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(setHealth)
      .catch(console.error);
  }, []);

  const checkDb = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      setDbTime(data.time || data.error);
    } catch (err) {
      setDbTime("Connection failed");
    }
  };

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setFeedbackSubmitted(false);
    setRating(0);
    setComment("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.response || data.error);
    } catch (err) {
      setResponse("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (rating === 0) return;
    setFeedbackLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, response, rating, comment }),
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Feedback failed");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Background Image with Robust Fallback */}
      <div 
        className="fixed inset-0 z-0 bg-[#0a0a0a]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(10, 10, 10, 0.5), rgba(10, 10, 10, 0.8)), 
            url('${bgUrl}')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0a0a0a'
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Brain</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono ${health ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <Activity className="w-3 h-3" />
            {health ? `STATUS: ${health.status.toUpperCase()}` : "OFFLINE"}
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
            Env: {health?.env || "---"}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 grid gap-8">
        {/* Hero Section */}
        <section className="py-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black uppercase italic tracking-tighter mb-4"
          >
            Core Infrastructure
          </motion.h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Integrated with Gemini AI, PostgreSQL, and FastAPI-inspired TypeScript architecture.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Database Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 text-orange-400">
              <Database className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">PostgreSQL Connection</h3>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Verify your DATABASE_URL connection string and test the pool availability.
            </p>
            <div className="mt-auto flex items-center justify-between gap-4">
              <button 
                onClick={checkDb}
                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-orange-500 transition-colors"
              >
                Test Connection
              </button>
              <div className="font-mono text-[10px] text-white/60 truncate max-w-[150px]">
                {dbTime || "NOT TESTED"}
              </div>
            </div>
          </motion.div>

          {/* Gemini Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 text-blue-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Gemini AI Integration</h3>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Direct access to Google's most capable models via the Brain API.
            </p>
            <div className="mt-auto flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] uppercase font-bold text-white/60">Ready for Inference</span>
            </div>
          </motion.div>
        </div>

        {/* AI Playground */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold uppercase italic tracking-tighter mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Brain Playground
          </h3>
          <div className="flex flex-col gap-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt for the Brain..."
              className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-orange-500/50 min-h-[120px] resize-none"
            />
            <button 
              onClick={generate}
              disabled={loading}
              className="bg-orange-500 text-black font-bold uppercase py-3 rounded-xl hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Response
                </>
              )}
            </button>
            {response && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-6 bg-black/60 border border-white/5 rounded-2xl text-sm text-white/80 leading-relaxed font-mono whitespace-pre-wrap"
              >
                {response}
              </motion.div>
            )}

            {response && !feedbackSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl"
              >
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" />
                  Rate this response
                </h4>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`transition-all ${rating >= star ? 'text-orange-500 scale-110' : 'text-white/20 hover:text-white/40'}`}
                      >
                        <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any additional comments? (Optional)"
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500/50 min-h-[60px] resize-none"
                  />

                  <button
                    onClick={submitFeedback}
                    disabled={rating === 0 || feedbackLoading}
                    className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {feedbackLoading ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {feedbackSubmitted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
              >
                <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
                  Thank you for your feedback!
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-white/10 p-8 text-center">
        <div className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
          Brain Infrastructure &copy; 2026 // Built with Express + Vite
        </div>
      </footer>
      </div>
    </div>
  );
}
