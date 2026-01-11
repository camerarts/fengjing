import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectData } from '../types';
import * as storage from '../services/storageService';
import { Calendar, Trash2, Search, Film, Clock, MoreVertical } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await storage.getProjects();
    // Sort by updated descending
    setProjects(data.sort((a, b) => b.updatedAt - a.updatedAt));
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      await storage.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.creativePlan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">我的项目</h1>
           <p className="text-slate-400 text-sm">管理您的所有分镜创作计划</p>
        </div>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input 
                type="text" 
                placeholder="搜索项目..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600"
            />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
                <div key={i} className="h-40 glass-panel rounded-2xl animate-pulse"></div>
            ))}
        </div>
      ) : filteredProjects.length === 0 ? (
         <div className="glass-panel rounded-3xl p-16 text-center border-dashed border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">暂无项目</h3>
            <p className="text-slate-500 text-sm">点击左侧“新建项目”开始您的创作之旅。</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
                <div 
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="glass-panel rounded-2xl p-6 relative group cursor-pointer hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/20"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/5">
                            <Film className="w-5 h-5 text-violet-300" />
                        </div>
                        <button 
                            onClick={(e) => handleDelete(e, project.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 truncate pr-4">{project.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 h-8 mb-4 font-mono leading-relaxed">
                        {project.creativePlan || '暂无创意方案内容...'}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 border-t border-white/5 pt-4">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                        {project.storyboardZh && (
                            <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                已生成分镜
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
