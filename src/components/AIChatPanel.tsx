import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, AIProactiveSuggestion } from '../types';
import { clsx } from 'clsx';

interface AIChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  suggestions: AIProactiveSuggestion[];
  budgetStatus: {
    used: number;
    remaining: number;
    percentUsed: number;
    status: string;
  };
  density: 'comfort' | 'compact';
}

export function AIChatPanel({
  messages,
  isLoading,
  error,
  onSendMessage,
  suggestions,
  budgetStatus,
  density,
}: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const padding = density === 'comfort' ? 'p-4' : 'p-3';
  const messagePadding = density === 'comfort' ? 'p-3' : 'p-2';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: AIProactiveSuggestion) => {
    onSendMessage(suggestion.content);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-500 text-white shadow-2xl
                 hover:bg-blue-600 transition-all z-50"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card w-96 flex flex-col border-l h-full"
    >
      {/* Header */}
      <div className={`${padding} border-b border-slate-200 dark:border-slate-700 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">AI Co-Pilot</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Budget Indicator */}
      <div className={`${padding} border-b border-slate-200 dark:border-slate-700`}>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-600 dark:text-slate-400">Monthly Budget</span>
          <span className={clsx(
            'font-medium',
            budgetStatus.status === 'danger' && 'text-red-600 dark:text-red-400',
            budgetStatus.status === 'warn' && 'text-amber-600 dark:text-amber-400',
            budgetStatus.status === 'ok' && 'text-emerald-600 dark:text-emerald-400'
          )}>
            ${budgetStatus.used.toFixed(2)} / ${budgetStatus.used + budgetStatus.remaining}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all',
              budgetStatus.status === 'danger' && 'bg-red-500',
              budgetStatus.status === 'warn' && 'bg-amber-500',
              budgetStatus.status === 'ok' && 'bg-emerald-500'
            )}
            style={{ width: `${Math.min(budgetStatus.percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className={`${padding} border-b border-slate-200 dark:border-slate-700 space-y-2`}>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Suggestions
          </p>
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              onClick={() => handleSuggestionClick(sug)}
              className="w-full text-left text-xs p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20
                       text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30
                       transition-colors border border-blue-200 dark:border-blue-800"
            >
              {sug.content}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className={`flex-1 ${padding} space-y-3 overflow-y-auto scrollbar-hide`}>
        {messages.length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Ask me about any market event,</p>
            <p>company, or investing concept!</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                `${messagePadding} rounded-xl text-sm`,
                msg.role === 'user'
                  ? 'bg-blue-500 text-white ml-8'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mr-8'
              )}
            >
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${messagePadding} rounded-xl text-sm bg-slate-100 dark:bg-slate-800 mr-8`}
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`${padding} border-t border-slate-200 dark:border-slate-700`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg border bg-white/50 border-slate-300
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                     dark:bg-white/5 dark:border-slate-700 dark:focus:border-blue-400
                     text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
