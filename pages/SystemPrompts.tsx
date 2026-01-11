import React, { useState, useEffect } from 'react';
import { PromptTemplate, DEFAULT_PROMPTS } from '../types';
import * as storage from '../services/storageService';
import { Save, RefreshCw, Terminal } from 'lucide-react';

const SystemPrompts: React.FC = () => {
  const [prompts, setPrompts] = useState<Record<string, PromptTemplate>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await storage.getPrompts();
    // Ensure we have defaults if storage is empty or missing keys
    setPrompts({ ...DEFAULT_PROMPTS, ...data });
  };

  const handleSave = async () => {
    setLoading(true);
    await storage.savePrompts(prompts);
    // Also push to cloud
    try {
        await storage.uploadPrompts();
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
    setMessage("系统提示词已更新");
    setTimeout(() => setMessage(null), 2000);
  };

  const handleReset = (key: string) => {
    if (window.confirm('确定恢复默认提示词吗？')) {
        setPrompts(prev => ({
            ...prev,
            [key]: DEFAULT_PROMPTS[key]
        }));
    }
  };

  const handleChange = (key: string, val: string) => {
    setPrompts(prev => ({
        ...prev,
        [key]: { ...prev[key], template: val }
    }));
  };

  const renderEditor = (key: string) => {
      const p = prompts[key];
      if (!p) return null;

      return (
        <div key={key} className="glass-panel rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-violet-400" />
                        {p.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">{p.description}</p>
                </div>
                <button 
                    onClick={() => handleReset(key)}
                    className="text-xs text-slate-500 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                >
                    恢复默认
                </button>
            </div>
            
            <div className="relative group">
                <textarea
                    value={p.template}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full h-64 glass-input rounded-xl p-4 font-mono text-sm leading-relaxed outline-none resize-y text-slate-300 focus:text-white transition-colors"
                />
            </div>
        </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">系统提示词</h1>
                <p className="text-slate-400 text-sm">调整 AI 的指令逻辑，定制专属的分镜生成风格。</p>
            </div>
            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
            >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存更改
            </button>
       </div>

       {message && (
         <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold animate-fade-in z-50">
           {message}
         </div>
       )}

       {renderEditor('STORYBOARD_GEN')}
       {renderEditor('GRID_GEN')}
    </div>
  );
};

export default SystemPrompts;
