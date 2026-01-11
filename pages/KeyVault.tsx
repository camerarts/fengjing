import React, { useState, useEffect } from 'react';
import { KeyItem } from '../types';
import { Key, Plus, Trash2, CheckCircle2, Circle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'lva_key_vault';

const KeyVault: React.FC = () => {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setKeys(JSON.parse(stored));
    }
  }, []);

  const saveKeys = (newKeys: KeyItem[]) => {
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !newKeyValue.trim()) return;

    const newItem: KeyItem = {
      id: crypto.randomUUID(),
      name: newKeyName,
      key: newKeyValue,
      isDefault: keys.length === 0, // First key is default
      createdAt: Date.now()
    };

    saveKeys([...keys, newItem]);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除此密钥吗？')) {
      saveKeys(keys.filter(k => k.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = keys.map(k => ({ ...k, isDefault: k.id === id }));
    saveKeys(updated);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">密钥管理 (Key Vault)</h1>
        <p className="text-slate-400 text-sm">
          安全存储您的 Gemini API Key。密钥仅存储在本地浏览器中，调用接口时直接发送至 Google，不会经过我们的服务器。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Key Form */}
        <div className="glass-panel rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-2 mb-6 text-violet-300">
            <Plus className="w-5 h-5" />
            <h2 className="font-bold">添加新密钥</h2>
          </div>
          
          <form onSubmit={handleAddKey} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">备注名称</label>
              <input 
                type="text" 
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="例如：个人Key-1"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Key 内容 (sk-...)</label>
              <div className="relative">
                <input 
                    type={showKeyInput ? "text" : "password"}
                    value={newKeyValue}
                    onChange={e => setNewKeyValue(e.target.value)}
                    placeholder="sk-..."
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none pr-10 font-mono"
                />
                <button 
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                    {showKeyInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button 
                type="submit"
                disabled={!newKeyName || !newKeyValue}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                保存密钥
            </button>
          </form>
        </div>

        {/* Key List */}
        <div className="space-y-4">
            {keys.length === 0 && (
                <div className="glass-panel p-8 text-center text-slate-500 rounded-2xl border-dashed border-white/10">
                    <Key className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>暂无密钥，请在左侧添加。</p>
                </div>
            )}
            
            {keys.map(k => (
                <div key={k.id} className={`glass-panel p-5 rounded-2xl flex items-center justify-between group ${k.isDefault ? 'border-violet-500/50 bg-violet-500/5' : ''}`}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => handleSetDefault(k.id)}
                            className={`p-1 rounded-full transition-colors ${k.isDefault ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}
                            title={k.isDefault ? "默认密钥" : "设为默认"}
                        >
                            {k.isDefault ? <CheckCircle2 className="w-6 h-6 fill-violet-500/20" /> : <Circle className="w-6 h-6" />}
                        </button>
                        <div>
                            <div className="font-bold text-white flex items-center gap-2">
                                {k.name}
                                {k.isDefault && <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/30">Default</span>}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-1">
                                {k.key.substring(0, 4)}...{k.key.substring(k.key.length - 4)}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleDelete(k.id)}
                        className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}

            {keys.length > 0 && !keys.some(k => k.isDefault) && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-500 text-xs rounded-xl border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    <span>请选择一个默认密钥，否则生成功能将无法使用。</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default KeyVault;
