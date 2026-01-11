import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowRight, Lock, Sparkles, Layout, Grid } from 'lucide-react';

const AUTH_KEY = 'lva_auth_expiry';
const SESSION_DURATION = 3 * 60 * 60 * 1000;
const DEFAULT_PASS = '1211';
const SUPER_PASS = 'samsung1';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const expiry = localStorage.getItem(AUTH_KEY);
    if (expiry && parseInt(expiry) > Date.now()) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEFAULT_PASS || password === SUPER_PASS) {
      const newExpiry = Date.now() + SESSION_DURATION;
      localStorage.setItem(AUTH_KEY, newExpiry.toString());
      navigate('/dashboard');
    } else {
      setErrorMsg('密码错误');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-white overflow-hidden selection:bg-fuchsia-500/30">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Nav */}
        <nav className="relative z-50 px-6 md:px-12 py-6 flex justify-between items-center glass-panel m-4 md:m-6 rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Video className="text-white w-4 h-4" />
                </div>
                <span className="font-bold tracking-tight text-lg">视频分镜助手 <span className="text-violet-400">Web</span></span>
            </div>
            
            {isLoggedIn ? (
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2"
                >
                    进入工坊 <ArrowRight className="w-3.5 h-3.5" />
                </button>
            ) : (
                <button 
                    onClick={() => setShowLogin(true)}
                    className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 text-white rounded-full text-xs font-bold shadow-lg shadow-violet-500/30 transition-all flex items-center gap-2"
                >
                    <Lock className="w-3.5 h-3.5" /> 登录
                </button>
            )}
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 text-center max-w-5xl mx-auto mt-10 md:mt-0">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold text-violet-300 mb-8 animate-fade-in backdrop-blur-md">
                <Sparkles className="w-3 h-3" /> AI 驱动的自动化流
            </div>
            
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                从创意方案到<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white">
                    完美分镜描述
                </span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
                专为创作者设计。输入一个点子，自动生成 9 个标准分镜描述，并一键转换为 3x3 九宫格生图指令。
                支持中英双语，无缝衔接 MJ/SD 工作流。
            </p>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                {[
                    { icon: Layout, title: "1. 输入创意", desc: "粘贴您的长视频脚本或粗略的想法。" },
                    { icon: Video, title: "2. 生成分镜", desc: "AI 自动拆解 9 个核心画面，提供中英双语描述。" },
                    { icon: Grid, title: "3. 3x3 组合", desc: "一键合并为九宫格指令，带固定前缀，直接生图。" }
                ].map((step, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl hover:bg-white/10 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-violet-400">
                            <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-500 text-xs">{step.desc}</p>
                    </div>
                ))}
            </div>
        </main>

        <footer className="relative z-10 py-6 text-center text-slate-600 text-xs mt-12">
            © 2025 Storyboard Assistant Web.
        </footer>

        {/* Login Modal */}
        {showLogin && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowLogin(false)} />
                <div className="relative glass-panel rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-fade-in border border-white/20">
                    <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-600/30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">访问验证</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            autoFocus
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrorMsg('');
                            }}
                            placeholder="输入密码"
                            className="w-full glass-input rounded-xl px-4 py-3 text-center text-lg outline-none transition-all placeholder:text-slate-600 font-bold tracking-widest focus:ring-2 focus:ring-violet-500/50"
                        />
                        
                        {errorMsg && (
                            <p className="text-rose-400 text-xs text-center font-bold">{errorMsg}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                        >
                            解锁进入 <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default LandingPage;
