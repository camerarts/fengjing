import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectData, KeyItem } from '../types';
import * as storage from '../services/storageService';
import * as gemini from '../services/geminiService';
import { 
  Sparkles, Loader2, Copy, Save, LayoutGrid, Video, 
  CheckCircle2, AlertCircle, ArrowRight, Edit3, X 
} from 'lucide-react';

const StoryboardWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Inputs
  const [creativePlan, setCreativePlan] = useState('');
  
  // Status
  const [generating, setGenerating] = useState<'storyboard' | 'grid' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Mode States
  const [editingField, setEditingField] = useState<string | null>(null);

  // Key
  const [activeKey, setActiveKey] = useState<string>('');

  useEffect(() => {
    const init = async () => {
        if (!id) return;
        
        // Load Project
        const p = await storage.getProject(id);
        if (p) {
            setProject(p);
            setCreativePlan(p.creativePlan || '');
        }

        // Load Default Key
        const storedKeys = localStorage.getItem('lva_key_vault');
        if (storedKeys) {
            const keys: KeyItem[] = JSON.parse(storedKeys);
            const defaultKey = keys.find(k => k.isDefault);
            if (defaultKey) setActiveKey(defaultKey.key);
        }

        setLoading(false);
    };
    init();
  }, [id]);

  const saveProject = async (updates: Partial<ProjectData>) => {
      if (!id || !project) return;
      
      const updated = {
          ...project,
          ...updates,
          updatedAt: Date.now()
      };
      
      setProject(updated);
      await storage.updateProject(id, () => updated);
      
      // Auto Push
      storage.uploadProjects().catch(console.error);
  };

  const handleGenerateStoryboard = async () => {
      if (!creativePlan.trim()) {
          setError("请输入创意方案");
          return;
      }
      if (!activeKey) {
          setError("未检测到默认密钥，请前往左侧“密钥管理”添加并设为默认。");
          return;
      }

      setGenerating('storyboard');
      setError(null);

      try {
          // Get System Prompt
          const prompts = await storage.getPrompts();
          const systemPrompt = prompts.STORYBOARD_GEN?.template || '';
          const fullPrompt = systemPrompt.replace('{{creativePlan}}', creativePlan);

          // Call API
          const json = await gemini.generateJSON<{chinese: string, english: string}>(
              fullPrompt, 
              {
                  type: "OBJECT",
                  properties: {
                      chinese: { type: "STRING" },
                      english: { type: "STRING" }
                  }
              },
              activeKey,
              'gemini-2.5-flash'
          );

          await saveProject({
              creativePlan, // Save input too
              storyboardZh: json.chinese,
              storyboardEn: json.english
          });
          
          setSuccessMsg("分镜生成成功！");

      } catch (e: any) {
          setError(e.message || "生成失败");
      } finally {
          setGenerating(null);
      }
  };

  const handleGenerateGrid = async () => {
      if (!project?.storyboardZh && !project?.storyboardEn) {
          setError("请先生成视频分镜");
          return;
      }
      if (!activeKey) {
          setError("未检测到默认密钥。");
          return;
      }

      setGenerating('grid');
      setError(null);

      try {
           // Get System Prompt
          const prompts = await storage.getPrompts();
          const systemPrompt = prompts.GRID_GEN?.template || '';
          
          // Combine existing storyboards as context
          const context = `中文分镜:\n${project.storyboardZh}\n\nEnglish Storyboard:\n${project.storyboardEn}`;
          const fullPrompt = systemPrompt.replace('{{storyboardContent}}', context);

          // Call API
          const json = await gemini.generateJSON<{chinese: string, english: string}>(
              fullPrompt, 
              {
                  type: "OBJECT",
                  properties: {
                      chinese: { type: "STRING" },
                      english: { type: "STRING" }
                  }
              },
              activeKey,
              'gemini-2.5-flash'
          );

          // Add Fixed Prefixes
          const prefixZh = "做一张3*3的分镜图，每张单独的分镜图宽高比是9:16的竖版，保持每张图片的机位和拍摄角度不变。只根据以下指示去改变图片：\n";
          const prefixEn = "Make a 3*3 storyboard, and the aspect ratio of each individual storyboard is 9:16 vertical, keeping the camera position and shooting angle of each picture unchanged. Follow the instructions below to change the picture only:\n";

          await saveProject({
              grid3x3Zh: prefixZh + json.chinese,
              grid3x3En: prefixEn + json.english
          });

          setSuccessMsg("3x3 分镜描述生成成功！");

      } catch (e: any) {
          setError(e.message || "生成失败");
      } finally {
          setGenerating(null);
      }
  };

  const handleCopy = (text?: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setSuccessMsg("已复制到剪贴板");
      setTimeout(() => setSuccessMsg(null), 2000);
  };

  // Generic Field Update for Manual Editing
  const updateField = (key: keyof ProjectData, val: string) => {
      saveProject({ [key]: val });
  };

  const CodeBlock = ({ label, content, fieldKey }: { label: string, content?: string, fieldKey: keyof ProjectData }) => {
      const isEditing = editingField === fieldKey;
      const [editValue, setEditValue] = useState(content || '');

      useEffect(() => setEditValue(content || ''), [content]);

      const saveEdit = () => {
          updateField(fieldKey, editValue);
          setEditingField(null);
      };

      return (
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full min-h-[200px] border border-white/10 group">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                        <>
                             <button onClick={() => setEditingField(null)} className="p-1 hover:text-rose-400"><X className="w-4 h-4" /></button>
                             <button onClick={saveEdit} className="p-1 hover:text-emerald-400"><CheckCircle2 className="w-4 h-4" /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setEditingField(fieldKey)} className="p-1 hover:text-white" title="编辑"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleCopy(content)} className="p-1 hover:text-white" title="复制"><Copy className="w-4 h-4" /></button>
                        </>
                    )}
                </div>
            </div>
            {isEditing ? (
                <textarea 
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="flex-1 w-full bg-black/20 p-4 font-mono text-sm text-slate-300 outline-none resize-none leading-relaxed"
                />
            ) : (
                <pre className="flex-1 w-full bg-black/20 p-4 font-mono text-sm text-slate-300 overflow-auto whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-600 italic">等待生成...</span>}
                </pre>
            )}
        </div>
      );
  };

  if (loading || !project) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="bg-white/10 px-2 py-1 rounded">{project.status}</span>
                    <span>最后更新: {new Date(project.updatedAt).toLocaleTimeString()}</span>
                </div>
            </div>
            {activeKey ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 密钥就绪
                </div>
            ) : (
                 <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" /> 缺少密钥
                </div>
            )}
        </div>

        {/* Global Toast */}
        {(error || successMsg) && (
            <div className={`fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md z-50 font-bold flex items-center gap-2 ${error ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                {error || successMsg}
            </div>
        )}

        {/* Step 1: Creative Plan */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-violet-300 font-bold uppercase tracking-wider text-sm">
                <div className="w-6 h-6 rounded bg-violet-500/20 flex items-center justify-center text-xs border border-violet-500/30">1</div>
                创意方案输入
            </div>
            
            <div className="glass-panel p-1 rounded-2xl">
                <textarea
                    value={creativePlan}
                    onChange={(e) => setCreativePlan(e.target.value)}
                    onBlur={() => saveProject({ creativePlan })}
                    placeholder="在此输入您的视频创意方案、脚本大纲或任何想法..."
                    className="w-full h-40 glass-input rounded-xl p-5 text-base text-white outline-none resize-y leading-relaxed"
                />
            </div>
            
            <div className="flex justify-end">
                <button
                    onClick={handleGenerateStoryboard}
                    disabled={generating !== null || !creativePlan.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating === 'storyboard' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                    生成视频分镜 (9镜头)
                </button>
            </div>
        </section>

        {/* Step 2: Storyboard Results */}
        <section className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-fuchsia-300 font-bold uppercase tracking-wider text-sm">
                    <div className="w-6 h-6 rounded bg-fuchsia-500/20 flex items-center justify-center text-xs border border-fuchsia-500/30">2</div>
                    分镜生成结果
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                <CodeBlock label="中文分镜 (1-9)" content={project.storyboardZh} fieldKey="storyboardZh" />
                <CodeBlock label="英文分镜 (Prompt)" content={project.storyboardEn} fieldKey="storyboardEn" />
             </div>

             <div className="flex justify-end">
                <button
                    onClick={handleGenerateGrid}
                    disabled={generating !== null || !project.storyboardZh}
                    className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-600/20 hover:shadow-fuchsia-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating === 'grid' ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutGrid className="w-5 h-5" />}
                    生成 3x3 分镜图描述
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </section>

        {/* Step 3: Grid Results */}
        {(project.grid3x3Zh || project.grid3x3En) && (
             <section className="space-y-4 pt-4 border-t border-white/5 animate-fade-in">
                <div className="flex items-center gap-2 text-pink-300 font-bold uppercase tracking-wider text-sm">
                    <div className="w-6 h-6 rounded bg-pink-500/20 flex items-center justify-center text-xs border border-pink-500/30">3</div>
                    3x3 九宫格描述 (已含前缀)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                    <CodeBlock label="中文指令" content={project.grid3x3Zh} fieldKey="grid3x3Zh" />
                    <CodeBlock label="英文指令 (Ready for MJ/SD)" content={project.grid3x3En} fieldKey="grid3x3En" />
                </div>
            </section>
        )}
    </div>
  );
};

export default StoryboardWorkspace;
