import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  AuthError
} from 'firebase/auth';
import { auth } from './firebase';
import { LogIn, UserPlus, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl p-10 relative z-10"
      >
        <div className="flex justify-center mb-10">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-[24px] flex items-center justify-center text-white shadow-lg shadow-blue-500/20"
          >
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </motion.div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-white/50 text-sm">
            {isLogin ? 'Sign in to manage your tasks.' : 'Start organizing your life today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold text-white/40 ml-1 uppercase tracking-widest">Full Name</label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 ml-1 uppercase tracking-widest">Email Address</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 ml-1 uppercase tracking-widest">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm overflow-hidden"
              >
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-[#0a0a0a] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? 'Sign In' : 'Create Account'}
                <Sparkles size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Continue with</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <button
          id="google-auth"
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-30"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.5 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.8 3c2.2-2.1 3.6-5.1 3.6-8.7z" fill="#4285F4"/>
                <path d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-3c-1.1.7-2.5 1.2-4.2 1.2-3.1 0-5.8-2.1-6.7-5H1.4v3.1C3.4 21.4 7.5 24 12 24z" fill="#34A853"/>
                <path d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3V6.6H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l3.9-3.1z" fill="#FBBC05"/>
                <path d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.5 0 3.4 2.6 1.4 6.6l3.9 3.1c.9-2.9 3.6-5 6.7-5z" fill="#EA4335"/>
              </svg>
              <span>Google Account</span>
            </>
          )}
        </button>

        <div className="mt-10 text-center">
          <button
            id="auth-toggle"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm font-semibold text-white/40 hover:text-white transition-colors"
          >
            {isLogin ? (
              <span className="flex items-center justify-center gap-2">New here? <span className="text-white">Sign up for free</span></span>
            ) : (
              <span className="flex items-center justify-center gap-2">Have an account? <span className="text-white">Sign in instead</span></span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
