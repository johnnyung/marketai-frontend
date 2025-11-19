import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, TrendingUp } from 'lucide-react';
import { Badge } from '../components/Badge';
import { API_URL } from '../config/api';

interface EconomicEvent {
  id: number;
  event_name: string;
  country: string;
  category: string;
  importance: string;
  scheduled_date: string;
  scheduled_time: string | null;
  actual_value: string | null;
  forecast_value: string | null;
  previous_value: string | null;
  currency: string;
}

export function CalendarView({ density }: { density: 'comfort' | 'compact' }) {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/calendar/upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.importance === filter);

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = event.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-600 dark:text-slate-400">Loading...</p></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Economic Calendar</h2>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'}`}>All</button>
          <button onClick={() => setFilter('high')} className={`px-4 py-2 rounded-xl transition ${filter === 'high' ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'}`}>High</button>
          <button onClick={() => setFilter('medium')} className={`px-4 py-2 rounded-xl transition ${filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'}`}>Medium</button>
        </div>
      </div>

      {Object.keys(groupedEvents).length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date}>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-3">
                {dayEvents.map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{event.event_name}</h4>
                          <Badge tone={event.importance === 'high' ? 'danger' : event.importance === 'medium' ? 'warn' : 'info'}>
                            {event.importance.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{event.country}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {event.scheduled_time && `${event.scheduled_time} ET`} • {event.category}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {event.forecast_value && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Forecast</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.forecast_value}</p>
                        </div>
                      )}
                      {event.previous_value && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Previous</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.previous_value}</p>
                        </div>
                      )}
                      {event.actual_value && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Actual</p>
                          <p className="text-sm font-semibold text-green-600">{event.actual_value}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
