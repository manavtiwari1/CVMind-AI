import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  User, CheckCircle, AlertCircle, X, Sparkles,
} from 'lucide-react';
import {
  Confetti,
  TextLoop,
  BlurFade,
  GlassButton,
  GlassInput,
  GradientBackground,
  type ConfettiRef,
} from './ui/sign-up';
import { useRef } from 'react';

/* ─── Types ─────────────────────────────────────────────────────── */

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword' | 'resetPassword';

const MODE_STEPS: Record<AuthMode, string[]> = {
  signIn:         ['email', 'password'],
  signUp:         ['email', 'password', 'confirm'],
  forgotPassword: ['email'],
  resetPassword:  ['password'],
};

/* ─── API helper ─────────────────────────────────────────────────── */

function getBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000')
  );
}

/* ─── Step dots ──────────────────────────────────────────────────── */

function StepDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? '1.5rem' : '0.5rem',
            opacity: i <= current ? 1 : 0.3,
          }}
          transition={{ duration: 0.25 }}
          className="h-[6px] rounded-full"
          style={{ background: i === current ? 'var(--blue)' : 'var(--border-strong)' }}
        />
      ))}
    </div>
  );
}

/* ─── AuthModal ──────────────────────────────────────────────────── */

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const confettiRef = useRef<ConfettiRef>(null);

  const steps = MODE_STEPS[mode];
  const currentStepName = steps[step];
  const isLastStep = step === steps.length - 1;

  /* Reset on open ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    const urlEmail = params.get('email');
    if (token && urlEmail) {
      setMode('resetPassword');
      setResetToken(token);
      setEmail(urlEmail);
    } else {
      setMode('signIn');
      setResetToken('');
      setEmail('');
    }
    setStep(0);
    setName(''); setPassword(''); setConfirm('');
    setShowPw(false); setShowConfirm(false);
    setErrorMsg(null); setSuccessMsg(null);
    setLoading(false); setDone(false);
  }, [isOpen]);

  if (!isOpen) return null;

  /* Navigation ─────────────────────────────────────────────────── */

  function clearMessages() { setErrorMsg(null); setSuccessMsg(null); }

  function switchMode(m: AuthMode) {
    clearMessages();
    setMode(m); setStep(0);
    setPassword(''); setConfirm('');
    setShowPw(false); setShowConfirm(false);
    setDone(false);
  }

  function goBack() {
    clearMessages();
    if (step > 0) setStep(s => s - 1);
    else switchMode('signIn');
  }

  function goNext() {
    clearMessages();

    // Validate current step
    if (currentStepName === 'email') {
      if (!email.trim()) { setErrorMsg('Please enter your email address.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrorMsg('Please enter a valid email.'); return; }
      if (mode === 'signUp' && !name.trim()) { setErrorMsg('Please enter your full name.'); return; }
    }
    if (currentStepName === 'password' && mode !== 'forgotPassword') {
      if (!password) { setErrorMsg('Please enter a password.'); return; }
      if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    }

    if (!isLastStep) { setStep(s => s + 1); return; }

    handleSubmit();
  }

  /* Submit ─────────────────────────────────────────────────────── */

  async function handleSubmit() {
    clearMessages();

    if (mode === 'forgotPassword') {
      if (!email.trim()) { setErrorMsg('Please enter your email.'); return; }
      setLoading(true);
      try {
        const res = await fetch(`${getBaseUrl()}/api/auth/forgot-password`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed.');
        setSuccessMsg(data.message || 'A reset link has been sent to your email.');
      } catch (err: any) { setErrorMsg(err.message || 'Connection failed.'); }
      finally { setLoading(false); }
      return;
    }

    if (mode === 'resetPassword') {
      if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
      setLoading(true);
      try {
        const res = await fetch(`${getBaseUrl()}/api/auth/reset-password`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token: resetToken, newPassword: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed.');
        window.history.pushState({}, '', window.location.pathname);
        setSuccessMsg(data.message || 'Password reset! You can now sign in.');
        setTimeout(() => switchMode('signIn'), 2000);
      } catch (err: any) { setErrorMsg(err.message || 'Connection failed.'); }
      finally { setLoading(false); }
      return;
    }

    if (mode === 'signUp') {
      if (!confirm) { setErrorMsg('Please confirm your password.'); return; }
      if (password !== confirm) { setErrorMsg('Passwords do not match.'); return; }
      setLoading(true);
      try {
        const res = await fetch(`${getBaseUrl()}/api/auth/signup`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sign up failed.');
        localStorage.setItem('cvmind_logged_in', 'true');
        localStorage.setItem('cvmind_user', JSON.stringify(data.user));
        fireSuccess();
      } catch (err: any) { setErrorMsg(err.message || 'Connection failed.'); }
      finally { setLoading(false); }
      return;
    }

    // signIn
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed.');
      localStorage.setItem('cvmind_logged_in', 'true');
      localStorage.setItem('cvmind_user', JSON.stringify(data.user));
      fireSuccess();
    } catch (err: any) { setErrorMsg(err.message || 'Connection failed.'); }
    finally { setLoading(false); }
  }

  /* Google OAuth ───────────────────────────────────────────────── */

  async function handleGoogle(credential: string) {
    clearMessages(); setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed.');
      localStorage.setItem('cvmind_logged_in', 'true');
      localStorage.setItem('cvmind_user', JSON.stringify(data.user));
      fireSuccess();
    } catch (err: any) { setErrorMsg(err.message || 'Connection failed.'); }
    finally { setLoading(false); }
  }

  /* Success ────────────────────────────────────────────────────── */

  function fireSuccess() {
    setDone(true);
    const fire = (x: number, angle: number) => {
      confettiRef.current?.fire({
        origin: { x, y: 0.6 }, angle, spread: 55,
        particleCount: 80, startVelocity: 55,
        colors: ['#2997ff', '#7c3aed', '#2dc08d', '#f59e0b', '#ff453a'],
      });
    };
    setTimeout(() => { fire(0.05, 60); fire(0.95, 120); }, 200);
    setTimeout(() => { fire(0.1, 70);  fire(0.9, 110);  }, 500);
    setTimeout(() => { onSuccess(); onClose(); }, 1800);
  }

  /* Labels ─────────────────────────────────────────────────────── */

  const headings: Record<AuthMode, string[]> = {
    signIn:         ['Welcome back.', 'Great to see you.', 'Sign in below.'],
    signUp:         ['Create your account.', 'Join CVMind AI.', 'Get started today.'],
    forgotPassword: ['Forgot password?', 'No worries.', 'Reset it now.'],
    resetPassword:  ['Choose a new password.', 'Almost done.', 'Make it strong.'],
  };

  const stepHints: Record<string, string> = {
    email:    mode === 'signUp' ? 'Enter your name and email to continue' : 'Enter your email address',
    password: mode === 'signUp' ? 'Choose a password (min 6 characters)' : 'Enter your password',
    confirm:  'Re-enter your password to confirm',
  };

  const submitLabel: Record<AuthMode, string> = {
    signIn:         'Sign In',
    signUp:         'Create Account',
    forgotPassword: 'Send Reset Link',
    resetPassword:  'Save New Password',
  };

  const showGoogle = (mode === 'signIn' || mode === 'signUp') && currentStepName === 'email' && !done;
  const showBackBtn = step > 0 || mode === 'forgotPassword';
  const isForgotOrReset = mode === 'forgotPassword' || mode === 'resetPassword';

  /* Render ─────────────────────────────────────────────────────── */

  return (
    <>
      <Confetti ref={confettiRef} manualstart />

      <div
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: 'var(--bg-primary)' }}
      >
        <GradientBackground />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              CVMind AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:opacity-70"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Centered form */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10">
          <div className="w-full max-w-[420px]">

            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                <TextLoop interval={3.5}>
                  {headings[mode].map((h, i) => <span key={i}>{h}</span>)}
                </TextLoop>
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {stepHints[currentStepName]}
              </p>
            </div>

            {/* Step dots */}
            <StepDots total={steps.length} current={step} />

            {/* Card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${mode}-${step}`}
                  initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0,  filter: 'blur(0px)' }}
                  exit={{    opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col gap-4"
                >
                  {/* Success / Done state */}
                  {done ? (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <CheckCircle size={48} style={{ color: 'var(--green)' }} />
                      </motion.div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {mode === 'signUp' ? 'Account created!' : 'Signed in!'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Redirecting you now…
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Email step */}
                      {currentStepName === 'email' && (
                        <>
                          {mode === 'signUp' && (
                            <BlurFade delay={0}>
                              <GlassInput
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                                icon={<User size={16} />}
                                disabled={loading}
                              />
                            </BlurFade>
                          )}
                          <BlurFade delay={mode === 'signUp' ? 0.06 : 0}>
                            <GlassInput
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              autoComplete="email"
                              icon={<Mail size={16} />}
                              disabled={loading}
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter' && !loading) goNext(); }}
                            />
                          </BlurFade>
                        </>
                      )}

                      {/* Password step */}
                      {currentStepName === 'password' && (
                        <BlurFade delay={0}>
                          <GlassInput
                            type={showPw ? 'text' : 'password'}
                            placeholder={mode === 'resetPassword' ? 'New password' : 'Password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                            icon={<Lock size={16} />}
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowPw(p => !p)}
                                tabIndex={-1}
                                style={{ lineHeight: 0, color: 'inherit' }}
                              >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            }
                            disabled={loading}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter' && !loading) goNext(); }}
                          />
                        </BlurFade>
                      )}

                      {/* Confirm step */}
                      {currentStepName === 'confirm' && (
                        <BlurFade delay={0}>
                          <GlassInput
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            autoComplete="new-password"
                            icon={<Lock size={16} />}
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowConfirm(p => !p)}
                                tabIndex={-1}
                                style={{ lineHeight: 0, color: 'inherit' }}
                              >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            }
                            disabled={loading}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter' && !loading) goNext(); }}
                          />
                        </BlurFade>
                      )}

                      {/* Error / success banners */}
                      <AnimatePresence>
                        {errorMsg && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
                            style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
                          >
                            <AlertCircle size={14} className="flex-shrink-0" />
                            {errorMsg}
                          </motion.div>
                        )}
                        {successMsg && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
                            style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(45,192,141,0.2)' }}
                          >
                            <CheckCircle size={14} className="flex-shrink-0" />
                            {successMsg}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Navigation */}
                      {isForgotOrReset ? (
                        /* Forgot / reset: full-width submit button */
                        <div className="flex flex-col gap-3 pt-1">
                          <button
                            type="button"
                            onClick={goNext}
                            disabled={loading}
                            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: 'var(--gradient-brand)', boxShadow: '0 4px 20px rgba(124,58,237,0.25)' }}
                          >
                            {loading ? (
                              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : submitLabel[mode]}
                          </button>
                          {mode === 'forgotPassword' && (
                            <button
                              type="button"
                              onClick={goBack}
                              className="text-sm text-center"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              ← Back to sign in
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Sign in / sign up: arrow buttons row */
                        <div className="flex items-center justify-between pt-1">
                          {showBackBtn ? (
                            <GlassButton variant="arrow" onClick={goBack} disabled={loading} aria-label="Go back">
                              <ArrowLeft size={16} />
                            </GlassButton>
                          ) : <div />}

                          {mode === 'signIn' && currentStepName === 'password' && (
                            <button
                              type="button"
                              onClick={() => switchMode('forgotPassword')}
                              className="text-xs font-medium"
                              style={{ color: 'var(--blue)' }}
                            >
                              Forgot password?
                            </button>
                          )}

                          <GlassButton
                            variant="arrow"
                            onClick={goNext}
                            isLoading={loading}
                            aria-label={isLastStep ? submitLabel[mode] : 'Continue'}
                          >
                            <ArrowRight size={16} />
                          </GlassButton>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Google OAuth */}
            <AnimatePresence>
              {showGoogle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: 0.1 }}
                  className="mt-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or continue with</span>
                    <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                  </div>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={cr => { if (cr.credential) handleGoogle(cr.credential); }}
                      onError={() => setErrorMsg('Google login failed. Please try again.')}
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      width="370px"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode toggle footer */}
            {!done && !isForgotOrReset && (
              <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {mode === 'signIn' ? (
                  <>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('signUp')}
                      className="font-semibold" style={{ color: 'var(--blue)' }}>
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('signIn')}
                      className="font-semibold" style={{ color: 'var(--blue)' }}>
                      Sign in
                    </button>
                  </>
                )}
              </p>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
