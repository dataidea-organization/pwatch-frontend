'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { chatWithBot, ChatbotResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  query: string;
  response: ChatbotResponse;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatbotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showProactiveMessage, setShowProactiveMessage] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize or retrieve session ID from localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatbot_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // Save session ID to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatbot_session_id', sessionId);
    }
  }, [sessionId]);

  // Proactive engagement: Show message after user has been on page for a while
  useEffect(() => {
    // Only show proactive message if user hasn't interacted with chatbot yet
    if (hasInteracted || isOpen) {
      setShowProactiveMessage(false);
      return;
    }

    // Check if we've already shown the proactive message in this session
    const hasShownProactive = sessionStorage.getItem('chatbot_proactive_shown');
    if (hasShownProactive === 'true') {
      return;
    }

    // Show proactive message after 45 seconds of page load
    const proactiveTimer = setTimeout(() => {
      setShowProactiveMessage(true);
      sessionStorage.setItem('chatbot_proactive_shown', 'true');
    }, 45000); // 45 seconds

    // Hide message after 15 seconds if not dismissed
    const hideTimer = setTimeout(() => {
      setShowProactiveMessage(false);
    }, 60000); // 45s + 15s

    return () => {
      clearTimeout(proactiveTimer);
      clearTimeout(hideTimer);
    };
  }, [hasInteracted, isOpen]);

  // Track when user opens chatbot to mark as interacted
  useEffect(() => {
    if (isOpen && !hasInteracted) {
      setHasInteracted(true);
      setShowProactiveMessage(false);
    }
  }, [isOpen, hasInteracted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    const currentQuery = query.trim();
    setLoading(true);
    setError(null);
    setResponse(null);
    setHasInteracted(true);
    setShowProactiveMessage(false);

    try {
      const result = await chatWithBot(currentQuery, sessionId || undefined);
      
      // Update session ID if returned from backend
      if (result.session_id) {
        setSessionId(result.session_id);
      }
      
      // Add to chat history (keep only last 5 pairs)
      const newMessage: ChatMessage = {
        query: currentQuery,
        response: result
      };
      setChatHistory(prev => {
        const updated = [...prev, newMessage];
        // Keep only last 5 message pairs (10 messages total)
        return updated.slice(-5);
      });
      
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response from chatbot');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
      setHasInteracted(true);
      setShowProactiveMessage(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setQuery('');
    setResponse(null);
    setError(null);
    // Note: We keep chatHistory and sessionId to maintain conversation continuity
  };

  const clearHistory = () => {
    setChatHistory([]);
    setResponse(null);
    setError(null);
    setSessionId(null);
    localStorage.removeItem('chatbot_session_id');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-16 right-6 z-50 flex flex-col items-end gap-3">
        {/* Proactive Message Bubble */}
        {showProactiveMessage && (
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-w-xs relative animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Need help finding something?
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  I can help you find information about parliamentary proceedings, bills, and documents.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(true);
                    setHasInteracted(true);
                    setShowProactiveMessage(false);
                  }}
                  className="text-xs bg-[#2d5016] hover:bg-[#1b3d26] text-white px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Ask me anything
                </button>
              </div>
              <button
                onClick={() => setShowProactiveMessage(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-gray-100"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Arrow pointing down to button */}
            <div className="absolute -bottom-2 right-12">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-200"></div>
              <div className="absolute top-0.5 left-[-6px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white"></div>
            </div>
          </div>
        )}
        
        {/* Chatbot Button */}
        <button
          onClick={handleToggle}
          className="bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 relative"
          aria-label="Open chatbot"
        >
          <MessageSquare className="w-6 h-6" />
          {/* Pulse animation when proactive message is shown */}
          {showProactiveMessage && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-16 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ${
      isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
    } flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d5016] to-[#1b3d26] text-white p-4 rounded-t-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Parliamentary Chatbot</span>
            <span className="text-xs text-white/80 font-normal">Alpha • Q&A Only</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-all hover:scale-110"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-all hover:scale-110"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            {chatHistory.length === 0 && !response && !error && (
              <div className="text-center py-8">
                <div className="relative inline-block mb-3">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                  <div className="absolute inset-0 bg-[#2d5016] opacity-5 rounded-full blur-xl"></div>
                </div>
                <div className="mb-2">
                  <span className="inline-block bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full shadow-sm border border-yellow-200">
                    ALPHA VERSION
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  Ask me anything about parliamentary proceedings, bills, or documents
                </p>
                <p className="text-xs text-gray-500">
                  Currently supports question and answer only
                </p>
              </div>
            )}

            {/* Chat History - Last 5 message pairs */}
            {chatHistory.length > 0 && (
              <div className="space-y-3">
                {chatHistory.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {/* User Query */}
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white rounded-xl p-2.5 max-w-[85%] shadow-sm">
                        <p className="text-xs font-medium mb-1 opacity-90">You:</p>
                        <p className="text-xs whitespace-pre-wrap">{item.query}</p>
                      </div>
                    </div>

                    {/* Bot Response */}
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] text-gray-800 rounded-xl p-2.5 max-w-[85%] space-y-1 border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium mb-1 text-gray-900">Bot:</p>
                        <p className="text-xs whitespace-pre-wrap text-gray-700">{item.response.answer}</p>
                        {item.response.document_url && (
                          <a
                            href={item.response.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#2d5016] hover:text-[#1b3d26] transition-colors mt-1 font-medium hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="line-clamp-1">Source: {item.response.document_name}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Response (if not yet in history) */}
            {response && chatHistory.length === 0 && (
              <div className="space-y-2">
                <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.answer}</p>
                </div>
                {response.document_url && (
                  <a
                    href={response.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[#2d5016] hover:text-[#1b3d26] transition-colors font-medium hover:underline"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="line-clamp-1">Source: {response.document_name}</span>
                  </a>
                )}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] text-gray-700 rounded-xl p-2.5 max-w-[85%] flex items-center gap-2 border border-gray-200 shadow-sm">
                  <Loader2 className="w-3 h-3 animate-spin text-[#2d5016]" />
                  <p className="text-xs font-medium">Thinking...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-white shadow-sm border-gray-300"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-[#2d5016] hover:bg-[#1b3d26] text-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            {chatHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium hover:underline"
              >
                Clear History
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

