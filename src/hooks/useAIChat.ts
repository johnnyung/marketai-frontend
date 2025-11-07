import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage, AIProactiveSuggestion } from '../types';

const CHAT_HISTORY_KEY = 'marketai_chat_history';
const CONTEXT_KEY = 'marketai_context';
const SPENDING_KEY = 'marketai_spending';

interface UseAIChatOptions {
  apiKey: string;
  monthlyBudget: number;
}

export function useAIChat({ apiKey, monthlyBudget }: UseAIChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSpend, setCurrentSpend] = useState(0);
  const [suggestions, setSuggestions] = useState<AIProactiveSuggestion[]>([]);

  // Load chat history on mount
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }

    // Load spending data
    const spendData = localStorage.getItem(SPENDING_KEY);
    if (spendData) {
      try {
        const { amount, lastReset } = JSON.parse(spendData);
        const lastResetDate = new Date(lastReset);
        const now = new Date();
        
        // Reset if new month
        if (
          now.getMonth() !== lastResetDate.getMonth() ||
          now.getFullYear() !== lastResetDate.getFullYear()
        ) {
          setCurrentSpend(0);
          localStorage.setItem(
            SPENDING_KEY,
            JSON.stringify({ amount: 0, lastReset: now.toISOString() })
          );
        } else {
          setCurrentSpend(amount);
        }
      } catch (e) {
        console.error('Failed to load spending data:', e);
      }
    }
  }, []);

  // Save chat history when it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Estimate cost of a request (rough approximation)
  const estimateCost = (inputTokens: number, outputTokens: number) => {
    // Claude Sonnet 4.5 pricing: $3 per million input tokens, $15 per million output tokens
    const inputCost = (inputTokens / 1_000_000) * 3;
    const outputCost = (outputTokens / 1_000_000) * 15;
    return inputCost + outputCost;
  };

  // Update spending
  const updateSpending = (cost: number) => {
    const newSpend = currentSpend + cost;
    setCurrentSpend(newSpend);
    localStorage.setItem(
      SPENDING_KEY,
      JSON.stringify({ amount: newSpend, lastReset: new Date().toISOString() })
    );
  };

  // Send message to Claude API
  const sendMessage = useCallback(
    async (userMessage: string, context?: any) => {
      if (!apiKey) {
        setError('API key not configured. Please add it in Settings.');
        return;
      }

      if (currentSpend >= monthlyBudget) {
        setError(`Monthly budget of $${monthlyBudget} reached. Resets next month.`);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message
      const newUserMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newUserMessage]);

      try {
        // Build conversation history for context
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Add system context if provided
        let systemPrompt = `You are MarketAI, an intelligent investment research assistant. You help users understand market events, analyze companies, and learn investing concepts.

Current context:
- User is tracking: ACHR, NVDA, MSFT
- Morning focus: Pre-market analysis before 6:30 AM PT market open
- User goal: Learn investing through real market events

Be concise, actionable, and educational. Explain terms when needed.`;

        if (context) {
          systemPrompt += `\n\nAdditional context: ${JSON.stringify(context)}`;
        }

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
              ...conversationHistory,
              { role: 'user', content: userMessage },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        // Estimate and track cost
        const inputTokens = data.usage.input_tokens || 500; // fallback estimate
        const outputTokens = data.usage.output_tokens || 300;
        const cost = estimateCost(inputTokens, outputTokens);
        updateSpending(cost);

        // Add assistant response
        const newAssistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newAssistantMessage]);
      } catch (err) {
        console.error('AI Chat error:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, currentSpend, monthlyBudget, messages]
  );

  // Generate proactive suggestions based on context
  const generateSuggestions = useCallback((userContext: any) => {
    // This would typically use AI, but for now we'll use rule-based suggestions
    const newSuggestions: AIProactiveSuggestion[] = [];

    // Check if user hasn't checked watchlist recently
    if (userContext.lastWatchlistCheck > 3600000) {
      // 1 hour
      newSuggestions.push({
        id: 'sug-1',
        type: 'action',
        content: "You haven't checked your ACHR watchlist in a while. Want me to scan for updates?",
        priority: 'medium',
        relatedTo: 'ACHR',
      });
    }

    // Suggest learning based on clicked events
    if (userContext.clickedEvents.includes('CPI')) {
      newSuggestions.push({
        id: 'sug-2',
        type: 'learn',
        content: 'Want to understand why CPI matters more than you might think? I can explain the "duration effect" on tech stocks.',
        priority: 'low',
        relatedTo: 'macro',
      });
    }

    setSuggestions(newSuggestions);
  }, []);

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  // Get budget status
  const getBudgetStatus = () => {
    const percentUsed = (currentSpend / monthlyBudget) * 100;
    return {
      used: currentSpend,
      remaining: monthlyBudget - currentSpend,
      percentUsed,
      status:
        percentUsed >= 90
          ? 'danger'
          : percentUsed >= 70
          ? 'warn'
          : 'ok',
    };
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    currentSpend,
    getBudgetStatus,
    suggestions,
    generateSuggestions,
  };
}
