'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { login, register } from '@/services/auth.service';
import { motion, AnimatePresence } from 'framer-motion';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginSession } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;

        const pretextData = "Vision Action Results Tracking Efficiency Workflows Performance Systems Capability Productivity Milestone Collaboration Deadline Agility Optimization Scale Success Mastery Implementation Strategy Alignment Focus Synergy Prioritization Framework Integration Innovation Resilience Impact Engagement Blueprint Foundation Navigation Structure Progress ";
        const repeatedText = pretextData.repeat(35);

        const fontSize = 24;
        const font = `${fontSize}px Inter, sans-serif`;
        const lineHeight = 44;

        const prepared = prepareWithSegments(repeatedText, font);

        let ballX = window.innerWidth / 2;
        let ballY = window.innerHeight / 2;
        let ballVx = 3.5;
        let ballVy = 2.5;
        const render = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            const ballR = Math.min(200, width * 0.35);

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, width, height);

            ctx.font = font;
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(148, 163, 184, 0.25)";


            ballX += ballVx;
            ballY += ballVy;
            if (ballX <= ballR || ballX >= width - ballR) ballVx *= -1;
            if (ballY <= ballR || ballY >= height - ballR) ballVy *= -1;


            const gradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, ballR + 50);
            gradient.addColorStop(0, "rgba(139, 92, 246, 0.4)");
            gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.15)");
            gradient.addColorStop(1, "rgba(15, 23, 42, 0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            ctx.fill();

            ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
            let cursor = { segmentIndex: 0, graphemeIndex: 0 };
            let currentY = 40;

            while (cursor.segmentIndex < prepared.segments.length && currentY < height + lineHeight) {
                const dy = currentY - ballY;
                let circleSliceWidth = 0;

                if (Math.abs(dy) < ballR) {
                    circleSliceWidth = Math.sqrt(ballR * ballR - dy * dy) + 25;
                }

                if (circleSliceWidth > 0) {
                    const leftSpace = (ballX - circleSliceWidth) - 40;
                    const rightSpace = width - (ballX + circleSliceWidth) - 40;

                    if (leftSpace > 50) {
                        const leftLine = layoutNextLine(prepared, cursor, leftSpace);
                        if (leftLine) {
                            ctx.fillText(leftLine.text, 40, currentY);
                            cursor = leftLine.end;
                        }
                    }

                    if (rightSpace > 50 && cursor.segmentIndex < prepared.segments.length) {
                        const rightLine = layoutNextLine(prepared, cursor, rightSpace);
                        if (rightLine) {
                            ctx.fillText(rightLine.text, ballX + circleSliceWidth, currentY);
                            cursor = rightLine.end;
                        }
                    } else if (cursor.segmentIndex < prepared.segments.length && rightSpace <= 50 && leftSpace <= 50) {
                        cursor.segmentIndex += 1;
                    }

                } else {
                    const fullSpace = width - 80;
                    const line = layoutNextLine(prepared, cursor, fullSpace);
                    if (line) {
                        ctx.fillText(line.text, 40, currentY);
                        cursor = line.end;
                    } else {
                        break;
                    }
                }

                currentY += lineHeight;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [mounted]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await login({ email: formData.email, password: formData.password });
                if (res.success && res.accessToken) {
                    loginSession(res.accessToken, res.refreshToken);
                } else {
                    setError(res.message || 'Login failed');
                }
            } else {
                const res = await register(formData);
                if (res.success) {
                    setIsLogin(true);
                    setError('Registration successful! Please login.');
                } else {
                    setError(res.message || 'Registration failed');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem', overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="glass-panel"
                    style={{ position: 'relative', zIndex: 10, padding: '2.5rem', width: '100%', maxWidth: '450px', background: 'rgba(30, 41, 59, 0.75)' }}
                >
                    <h1 className="text-gradient" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1rem', textAlign: 'center' }}>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {!isLogin && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <input type="text" name="name" className="input-field" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                            </motion.div>
                        )}
                        <div>
                            <input type="email" name="email" className="input-field" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div>
                            <input type="password" name="password" className="input-field" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
