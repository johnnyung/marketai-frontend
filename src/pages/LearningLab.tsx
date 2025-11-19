import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Award, ChevronRight, X } from 'lucide-react';
import { Badge } from '../components/Badge';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'https://marketai-backend-production-397e.up.railway.app';

interface LearningModule {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  content?: string;
  duration_minutes: number;
  tags: string[];
}

interface Progress {
  module_id: string;
  status: string;
  progress_pct: number;
  time_spent_minutes: number;
  completed_at: string | null;
}

export function LearningLab({ density }: { density: 'comfort' | 'compact' }) {
  const { token } = useAuth();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, progressRes] = await Promise.all([
        fetch(`${API_URL}/api/learning/modules`),
        fetch(`${API_URL}/api/learning/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const modulesData = await modulesRes.json();
      const progressData = await progressRes.json();
      
      setModules(modulesData);
      const progressMap = progressData.reduce((acc: any, p: Progress) => {
        acc[p.module_id] = p;
        return acc;
      }, {});
      setProgress(progressMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const res = await fetch(`${API_URL}/api/learning/modules/${moduleId}`);
    const fullModule = await res.json();
    setSelectedModule(fullModule);
  };

  const handleComplete = async () => {
    if (!selectedModule) return;
    
    await fetch(`${API_URL}/api/learning/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        moduleId: selectedModule.id,
        status: 'completed',
        progressPct: 100,
        timeSpentMinutes: selectedModule.duration_minutes
      })
    });
    
    setSelectedModule(null);
    fetchData();
  };

  const filteredModules = filter === 'all' 
    ? modules 
    : modules.filter(m => m.difficulty === filter || m.category === filter);

  const stats = {
    total: modules.length,
    completed: Object.values(progress).filter(p => p.status === 'completed').length,
    inProgress: Object.values(progress).filter(p => p.status === 'in_progress').length
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-600 dark:text-slate-400">Loading...</p></div></div>;

  if (selectedModule) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedModule.title}</h2>
          <button onClick={() => setSelectedModule(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <Badge tone="info">{selectedModule.difficulty}</Badge>
            <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Clock className="w-4 h-4" />{selectedModule.duration_minutes} min</span>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedModule.content?.replace(/\n/g, '<br />') || '' }} />
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <button onClick={handleComplete} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Lab</h2>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'}`}>All</button>
          <button onClick={() => setFilter('beginner')} className={`px-4 py-2 rounded-xl text-sm transition ${filter === 'beginner' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'}`}>Beginner</button>
          <button onClick={() => setFilter('intermediate')} className={`px-4 py-2 rounded-xl text-sm transition ${filter === 'intermediate' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'}`}>Intermediate</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2"><BookOpen className="w-5 h-5 text-blue-600" /><span className="text-sm text-slate-600 dark:text-slate-400">Total Modules</span></div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2"><CheckCircle className="w-5 h-5 text-green-600" /><span className="text-sm text-slate-600 dark:text-slate-400">Completed</span></div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2"><Clock className="w-5 h-5 text-yellow-600" /><span className="text-sm text-slate-600 dark:text-slate-400">In Progress</span></div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.map(module => {
          const moduleProgress = progress[module.id];
          const isCompleted = moduleProgress?.status === 'completed';
          const isInProgress = moduleProgress?.status === 'in_progress';
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{module.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{module.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <Badge tone={module.difficulty === 'beginner' ? 'success' : module.difficulty === 'intermediate' ? 'warn' : 'danger'}>
                  {module.difficulty}
                </Badge>
                <span className="text-xs text-slate-600 dark:text-slate-400">{module.category.replace('_', ' ')}</span>
                <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400"><Clock className="w-3 h-3" />{module.duration_minutes}m</span>
              </div>

              {isInProgress && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{moduleProgress.progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${moduleProgress.progress_pct}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={() => handleStart(module.id)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
