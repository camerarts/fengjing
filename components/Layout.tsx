import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Key, Terminal, Plus, LogOut, Menu, X, Settings2 } from 'lucide-react';
import * as storage from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleCreateProject = async () => {
    // Quick create and redirect
    const title = prompt("请输入新项目名称");
    if (title) {
        const id = await storage.createProject(title);
        navigate(`/project/${id}`);
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      localStorage.removeItem('lva_auth_expiry');
      navigate('/');
    }
  };

  const NavItem = ({ to, icon: Icon, label, active }: any) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-white/10' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />}
      <Icon className={`w-5 h-5 ${active ? 'text-violet-400' : 'group-hover:text-white transition-colors'}`} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </Link>
  );

  return (
    <div className="h-screen flex text-slate-200 font-sans overflow-hidden relative selection:bg-violet-500/30">
        
      {/* Background Blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Toggle */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass-panel rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r-0 border-r-white/5 flex flex-col transition-transform duration-300 ease-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <span className="text-sm">SB</span>
                </div>
                <span>分镜助手</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400"><X /></button>
        </div>

        <div className="px-4 mb-6">
            <button
                onClick={handleCreateProject}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                新建项目
            </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="项目列表" active={isActive('/dashboard')} />
            <NavItem to="/keys" icon={Key} label="密钥管理" active={isActive('/keys')} />
            <NavItem to="/prompts" icon={Terminal} label="系统提示词" active={isActive('/prompts')} />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
            <div className="glass-panel rounded-xl p-3 flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold">
                    Me
                </div>
                <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">当前用户</div>
                    <div className="text-[10px] text-slate-400">Pro Version</div>
                </div>
                <button onClick={handleLogout} className="ml-auto text-slate-400 hover:text-rose-400 transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
            <Link to="/settings" className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-white transition-colors py-2">
                <Settings2 className="w-3 h-3" /> 设置
            </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Fade */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#020617] to-transparent pointer-events-none z-20" />
        
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 pt-20 md:pt-12 scroll-smooth">
             {children}
        </div>
      </main>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
