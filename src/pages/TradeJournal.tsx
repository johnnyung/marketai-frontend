import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Star, Filter } from 'lucide-react';
import { Badge } from '../components/Badge';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface JournalEntry {
  id: number;
  ticker: string;
  entry_date: string;
  exit_date: string | null;
  strategy: string;
  setup_notes: string;
  execution_notes: string;
  outcome_notes: string;
  emotional_state: string;
  lessons_learned: string;
  rating: number;
  tags: string[];
}

export function TradeJournal({ density }: { density: 'comfort' | 'compact' }) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    ticker: '', entryDate: '', exitDate: '', strategy: '', setupNotes: '',
    executionNotes: '', outcomeNotes: '', emotionalState: '', lessonsLearned: '',
    rating: 3, tags: ''
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/journal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/journal/${editId}` : `${API_URL}/api/journal`;
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        ticker: form.ticker,
        entryDate: form.entryDate,
        exitDate: form.exitDate || null,
        strategy: form.strategy,
        setupNotes: form.setupNotes,
        executionNotes: form.executionNotes,
        outcomeNotes: form.outcomeNotes,
        emotionalState: form.emotionalState,
        lessonsLearned: form.lessonsLearned,
        rating: form.rating,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      })
    });
    
    resetForm();
    fetchEntries();
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditId(entry.id);
    setForm({
      ticker: entry.ticker,
      entryDate: entry.entry_date,
      exitDate: entry.exit_date || '',
      strategy: entry.strategy || '',
      setupNotes: entry.setup_notes || '',
      executionNotes: entry.execution_notes || '',
      outcomeNotes: entry.outcome_notes || '',
      emotionalState: entry.emotional_state || '',
      lessonsLearned: entry.lessons_learned || '',
      rating: entry.rating || 3,
      tags: (entry.tags || []).join(', ')
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`${API_URL}/api/journal/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchEntries();
  };

  const resetForm = () => {
    setForm({
      ticker: '', entryDate: '', exitDate: '', strategy: '', setupNotes: '',
      executionNotes: '', outcomeNotes: '', emotionalState: '', lessonsLearned: '',
      rating: 3, tags: ''
    });
    setEditId(null);
    setShowForm(false);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-600 dark:text-slate-400">Loading...</p></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trade Journal</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"><Plus className="w-5 h-5" />{editId ? 'Edit' : 'New'} Entry</button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ticker *</label><input type="text" value={form.ticker} onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})} required className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Entry Date *</label><input type="date" value={form.entryDate} onChange={e => setForm({...form, entryDate: e.target.value})} required className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exit Date</label><input type="date" value={form.exitDate} onChange={e => setForm({...form, exitDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Strategy</label><input type="text" value={form.strategy} onChange={e => setForm({...form, strategy: e.target.value})} placeholder="Breakout, Pullback, etc." className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
          </div>
          
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Setup Notes</label><textarea value={form.setupNotes} onChange={e => setForm({...form, setupNotes: e.target.value})} placeholder="What was the setup?" rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Execution Notes</label><textarea value={form.executionNotes} onChange={e => setForm({...form, executionNotes: e.target.value})} placeholder="How did it go?" rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Outcome & Lessons</label><textarea value={form.lessonsLearned} onChange={e => setForm({...form, lessonsLearned: e.target.value})} placeholder="What did you learn?" rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Emotional State</label><input type="text" value={form.emotionalState} onChange={e => setForm({...form, emotionalState: e.target.value})} placeholder="Calm, Anxious, Confident" className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating (1-5)</label><input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
          </div>
          
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags (comma separated)</label><input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="swing, trend-following" className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" /></div>
          
          <div className="flex gap-3"><button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">{editId ? 'Update' : 'Save'} Entry</button><button type="button" onClick={resetForm} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button></div>
        </motion.form>
      )}

      {entries.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700"><p className="text-slate-600 dark:text-slate-400 mb-4">No journal entries yet</p><button onClick={() => setShowForm(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">Create First Entry</button></div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{entry.ticker}</h3>
                    {entry.strategy && <Badge tone="info">{entry.strategy}</Badge>}
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < entry.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Entry: {new Date(entry.entry_date).toLocaleDateString()}{entry.exit_date && ` → Exit: ${new Date(entry.exit_date).toLocaleDateString()}`}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(entry)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit className="w-4 h-4 text-blue-600" /></button>
                  <button onClick={() => handleDelete(entry.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
              
              {entry.setup_notes && <div className="mb-3"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Setup:</p><p className="text-sm text-slate-600 dark:text-slate-400">{entry.setup_notes}</p></div>}
              {entry.execution_notes && <div className="mb-3"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Execution:</p><p className="text-sm text-slate-600 dark:text-slate-400">{entry.execution_notes}</p></div>}
              {entry.lessons_learned && <div className="mb-3"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Lessons:</p><p className="text-sm text-slate-600 dark:text-slate-400">{entry.lessons_learned}</p></div>}
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {entry.emotional_state && <span className="text-xs text-slate-500 dark:text-slate-400">Mood: {entry.emotional_state}</span>}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex gap-2">
                    {entry.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
