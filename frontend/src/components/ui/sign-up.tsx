import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  Children,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useInView, type Variants, type Transition } from 'framer-motion';
import confetti from 'canvas-confetti';
import type {
  CreateTypes as ConfettiInstance,
  GlobalOptions as ConfettiGlobalOptions,
  Options as ConfettiOptions,
} from 'canvas-confetti';
import { cn } from '@/lib/utils';

/* ─── Inject glass CSS once ─────────────────────────────────────── */

const GLASS_CSS = `
@property --angle-1 { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@property --angle-2 { syntax: '<angle>'; inherits: false; initial-value: 180deg; }

@keyframes glass-spin { to { transform: rotate(360deg); } }
@keyframes glass-border-rot-1 { to { --angle-1: 360deg; } }
@keyframes glass-border-rot-2 { to { --angle-2: 540deg; } }
@keyframes blob-drift {
  0%, 100% { transform: translate(0,0) scale(1); }
  33%       { transform: translate(40px,-40px) scale(1.06); }
  66%       { transform: translate(-30px,30px) scale(0.94); }
}
@keyframes auth-bg-pulse {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 0.75; }
}

/* Glass input */
.glass-input-wrap {
  position: relative;
  border-radius: 0.75rem;
  padding: 1px;
  background: conic-gradient(
    from var(--angle-1),
    transparent 0deg,
    oklch(from var(--foreground) l c h / 18%) 90deg,
    transparent 180deg,
    oklch(from var(--foreground) l c h / 10%) 270deg,
    transparent 360deg
  ),
  conic-gradient(
    from var(--angle-2),
    transparent 0deg,
    oklch(from var(--foreground) l c h / 10%) 90deg,
    transparent 180deg,
    oklch(from var(--foreground) l c h / 8%) 270deg,
    transparent 360deg
  );
  animation: glass-border-rot-1 6s linear infinite, glass-border-rot-2 8s linear infinite;
}

.glass-input-inner {
  position: relative;
  border-radius: calc(0.75rem - 1px);
  background: oklch(from var(--background) l c h / 60%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  transition: background 0.2s;
}

.glass-input-inner:focus-within {
  background: oklch(from var(--background) l c h / 85%);
}

.glass-input-inner input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.925rem;
  min-width: 0;
}

.glass-input-inner input::placeholder {
  color: oklch(from var(--foreground) l c h / 35%);
}

.glass-input-icon {
  color: oklch(from var(--foreground) l c h / 45%);
  flex-shrink: 0;
}

/* Glass button */
.glass-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  border: 1px solid oklch(from var(--foreground) l c h / 14%);
  background: oklch(from var(--background) l c h / 55%);
  color: var(--foreground);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.7rem 1.4rem;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
}

.glass-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, oklch(from var(--background) l c h / 30%) 0%, transparent 60%);
  pointer-events: none;
}

.glass-btn:hover {
  background: oklch(from var(--background) l c h / 75%);
  border-color: oklch(from var(--foreground) l c h / 22%);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px oklch(from var(--foreground) l c h / 8%);
}

.glass-btn:active { transform: scale(0.98) translateY(0); }

.glass-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Arrow circle button */
.glass-btn-arrow {
  border-radius: 9999px;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  background: oklch(from var(--foreground) l c h / 8%);
  border-color: oklch(from var(--foreground) l c h / 18%);
}

.glass-btn-arrow:hover {
  background: oklch(from var(--foreground) l c h / 14%);
}

/* Spinner inside button */
.glass-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 9999px;
  animation: glass-spin 0.7s linear infinite;
  display: inline-block;
}

/* Gradient blobs */
.auth-gradient-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.auth-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(90px);
  animation: blob-drift var(--blob-dur, 9s) ease-in-out infinite var(--blob-delay, 0s);
}
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement('style');
  style.textContent = GLASS_CSS;
  document.head.appendChild(style);
}

/* ─── Confetti ───────────────────────────────────────────────────── */

export interface ConfettiRef {
  fire: (opts?: ConfettiOptions) => void;
}

export interface ConfettiProps {
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  className?: string;
}

export const Confetti = forwardRef<ConfettiRef, ConfettiProps>(
  ({ globalOptions, manualstart = false, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instanceRef = useRef<ConfettiInstance | null>(null);

    const fire = useCallback((opts?: ConfettiOptions) => {
      instanceRef.current?.(opts);
    }, []);

    useImperativeHandle(ref, () => ({ fire }), [fire]);

    useEffect(() => {
      if (!canvasRef.current) return;
      instanceRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
        ...globalOptions,
      });
      if (!manualstart) fire({});
      return () => {
        instanceRef.current?.reset?.();
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <canvas
        ref={canvasRef}
        className={cn('pointer-events-none fixed inset-0 z-[300] h-full w-full', className)}
      />
    );
  },
);
Confetti.displayName = 'Confetti';

/* ─── TextLoop ───────────────────────────────────────────────────── */

export interface TextLoopProps {
  children: ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
}

const defaultTextVariants: Variants = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -10, filter: 'blur(4px)' },
};

export function TextLoop({ children, className, interval = 3, transition, variants }: TextLoopProps) {
  const items = Children.toArray(children);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % items.length), interval * 1000);
    return () => clearInterval(t);
  }, [items.length, interval]);

  return (
    <span className={cn('relative inline-block overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          variants={variants ?? defaultTextVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition ?? { duration: 0.35, ease: 'easeInOut' }}
          className="inline-block"
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── BlurFade ───────────────────────────────────────────────────── */

export interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
}

export function BlurFade({ children, className, duration = 0.4, delay = 0, yOffset = 8, inView = true }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewResult = useInView(ref, { once: true, amount: 0.3 });
  const visible = !inView || inViewResult;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, filter: 'blur(8px)' }}
      animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── GlassInput ─────────────────────────────────────────────────── */

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  wrapClassName?: string;
}

export function GlassInput({ icon, rightIcon, wrapClassName, className, ...props }: GlassInputProps) {
  useEffect(() => { injectCSS(); }, []);
  return (
    <div className={cn('glass-input-wrap', wrapClassName)}>
      <div className="glass-input-inner">
        {icon && <span className="glass-input-icon">{icon}</span>}
        <input className={className} {...props} />
        {rightIcon && <span className="glass-input-icon" style={{ cursor: 'pointer' }}>{rightIcon}</span>}
      </div>
    </div>
  );
}

/* ─── GlassButton ────────────────────────────────────────────────── */

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'arrow';
  isLoading?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, className, variant = 'default', isLoading, disabled, ...props }, ref) => {
    useEffect(() => { injectCSS(); }, []);
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn('glass-btn', variant === 'arrow' && 'glass-btn-arrow', className)}
        {...props}
      >
        {isLoading ? <span className="glass-spinner" /> : children}
      </button>
    );
  },
);
GlassButton.displayName = 'GlassButton';

/* ─── GradientBackground ─────────────────────────────────────────── */

export interface GradientBackgroundProps {
  className?: string;
}

export function GradientBackground({ className }: GradientBackgroundProps) {
  useEffect(() => { injectCSS(); }, []);
  return (
    <div className={cn('auth-gradient-bg', className)}>
      <div
        className="auth-blob"
        style={{
          width: 700, height: 700,
          top: -200, right: -200,
          background: 'var(--color-chart-1)',
          opacity: 0.18,
          '--blob-dur': '9s',
        } as React.CSSProperties}
      />
      <div
        className="auth-blob"
        style={{
          width: 600, height: 600,
          bottom: -180, left: -180,
          background: 'var(--color-chart-3)',
          opacity: 0.14,
          '--blob-dur': '12s',
          '--blob-delay': '1s',
        } as React.CSSProperties}
      />
      <div
        className="auth-blob"
        style={{
          width: 450, height: 450,
          top: '35%', left: '35%',
          background: 'var(--color-chart-2)',
          opacity: 0.12,
          '--blob-dur': '15s',
          '--blob-delay': '3s',
        } as React.CSSProperties}
      />
    </div>
  );
}
