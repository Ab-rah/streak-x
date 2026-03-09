import Link from 'next/link';
import { ArrowRight, Flame, Clock, Footprints, Target, Activity } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StreaX | Transform your Consistency',
  description: 'The ultimate 100-day challenge tracker. Track focus time, calories burned, and steps in one beautiful dashboard.',
  keywords: 'habit tracker, 100 day challenge, productivity tracker, fitness tracker, focus time, pedometer, daily goals',
  openGraph: {
    title: 'StreaX | Transform your Consistency',
    description: 'Track focus time, calories burned, and steps in one beautiful dashboard.',
    type: 'website',
    siteName: 'StreaX'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreaX - Form Habits',
    description: 'The ultimate 100-day gamified tracker for your life\'s best habits.'
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative flex flex-col">
      {/* Background blobs for premium glassmorphism aesthetic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>
      
      {/* Navbar segment */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-center items-center w-full">
        <Link href="/" className="flex items-center space-x-4 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700/60 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
            <Activity className="text-orange-500 w-7 h-7 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 drop-shadow-sm">
            Strea<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">X</span>
          </span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28 flex flex-col items-center text-center animate-fade-in">
        <div className="inline-flex items-center space-x-2 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-full px-4 py-1.5 mb-8 shadow-xl">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-zinc-300">StreaX Version 2.0 is now live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-5xl">
          Track <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600 drop-shadow-lg">Everything.</span><br />
          Master <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400 drop-shadow-lg">Consistency.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed font-medium">
          Whether you're coding for hours, burning calories at the gym, or taking a sunset walk. StreaX is the all-in-one 100-day gamified tracker for your life's best habits.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/app" className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-extrabold text-lg hover:bg-zinc-200 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center">
            Launch App <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-800 flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">One Dashboard. Total Clarity.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">We've separated the noise so you can focus strictly on the metrics that matter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 hover:border-cyan-500/30 transition-all group overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
            <Clock className="w-12 h-12 text-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-3 text-white">Focus Time Tracking</h3>
            <p className="text-zinc-400 leading-relaxed max-w-md font-medium">Log your deep work sessions—Coding, Reading, Meditation, or Studying. Watch your focus hours accumulate into complete mastery over 100 days.</p>
          </div>
          
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 hover:border-orange-500/30 transition-all group overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
            <Flame className="w-12 h-12 text-orange-500 mb-6 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-3 text-white">Calories Burned</h3>
            <p className="text-zinc-400 leading-relaxed font-medium">Dedicated metrics for your intense workouts, easily measured via interactive sliders.</p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 hover:border-teal-500/30 transition-all group overflow-hidden relative">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all"></div>
            <Footprints className="w-12 h-12 text-teal-400 mb-6 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)] group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-3 text-white">Pedometer Mode</h3>
            <p className="text-zinc-400 leading-relaxed font-medium">Specific logging for your daily walks to track step milestones flawlessly alongside your calories burned.</p>
          </div>

          <div className="md:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 hover:border-indigo-500/30 transition-all group overflow-hidden relative flex flex-col justify-center">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold shadow-lg">1</span>
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold shadow-lg">2</span>
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-500 font-bold">3</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white relative z-10">100-Day Gamification</h3>
            <p className="text-zinc-400 leading-relaxed max-w-lg font-medium relative z-10">Build the ultimate streak. A highly interactive visual calendar maps your journey across a 100-day sprint. Claim your accolades as you consistently show up.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-32 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to start your format?</h2>
        <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto font-medium">No downloads. No subscriptions. Completely local and private directly in your browser.</p>
        <Link href="/app" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_40px_rgba(234,88,12,0.6)] transition-all transform hover:-translate-y-1 inline-flex items-center">
          Get Started Now <Target className="ml-3 w-6 h-6" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 py-10 text-center text-zinc-500 backdrop-blur-lg bg-zinc-950/80 relative z-10 text-sm font-medium">
        <p>© {new Date().getFullYear()} StreaX Dashboard. Designed for consistency.</p>
      </footer>
    </div>
  );
}
