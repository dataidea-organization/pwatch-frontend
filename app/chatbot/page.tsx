'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, FileText, MessageSquare } from 'lucide-react';
import { chatWithBot, ChatbotResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  query: string;
  response: ChatbotResponse;
}

export default function ChatbotPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatbotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    const currentQuery = query.trim();
    setLoading(true);
    setError(null);
    setResponse(null);

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

  const clearHistory = () => {
    setChatHistory([]);
    setResponse(null);
    setError(null);
    setSessionId(null);
    localStorage.removeItem('chatbot_session_id');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] flex flex-col overflow-hidden">
      <main className="max-w-4xl mx-auto px-4 py-4 md:py-6 w-full flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="mb-3 md:mb-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1 md:mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Parliamentary Chatbot
            </h1>
            <span className="bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-800 text-xs font-semibold px-3 md:px-4 py-1.5 rounded-full shadow-sm self-start sm:self-center border border-yellow-200">
              ALPHA VERSION
            </span>
          </div>
          <p className="text-gray-600 text-sm md:text-base mb-1">
            Ask questions about parliamentary proceedings, bills, and documents
          </p>
          <p className="text-xs text-gray-500">
            Currently supports question and answer only
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 min-h-0">
            {chatHistory.length === 0 && !response && !error && (
              <div className="text-center py-12 text-gray-600">
                <div className="relative inline-block mb-4">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto" />
                  <div className="absolute inset-0 bg-[#2d5016] opacity-5 rounded-full blur-xl"></div>
                </div>
                <p className="text-lg font-semibold text-gray-900">Start a conversation!</p>
                <p className="text-sm text-gray-500 mt-2">Ask me anything about parliamentary proceedings, bills, or documents.</p>
              </div>
            )}

            {/* Display last 5 message pairs */}
            {chatHistory.map((item, index) => (
              <div key={index} className="space-y-4">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white rounded-xl p-3 md:p-4 max-w-[85%] sm:max-w-md shadow-sm">
                    <p className="font-medium text-xs md:text-sm mb-1.5 opacity-90">You:</p>
                    <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{item.query}</p>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] text-gray-800 rounded-xl p-3 md:p-4 max-w-[85%] sm:max-w-md space-y-2 border border-gray-200 shadow-sm">
                    <p className="font-medium text-sm mb-1.5 text-gray-900">Bot:</p>
                    <p className="text-sm whitespace-pre-wrap text-gray-700">{item.response.answer}</p>
                    {item.response.document_url && (
                      <a
                        href={item.response.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-[#2d5016] hover:text-[#1b3d26] transition-colors font-medium hover:underline mt-2"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="line-clamp-1">Source: {item.response.document_name}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Current Response (if not yet added to history) */}
            {response && chatHistory.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] text-gray-800 rounded-xl p-3 md:p-4 max-w-[85%] sm:max-w-md space-y-2 border border-gray-200 shadow-sm">
                  <p className="font-medium text-sm mb-1.5 text-gray-900">Bot:</p>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{response.answer}</p>
                  {response.document_url && (
                    <a
                      href={response.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-[#2d5016] hover:text-[#1b3d26] transition-colors font-medium hover:underline mt-2"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="line-clamp-1">Source: {response.document_name}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] text-gray-700 rounded-xl p-3 md:p-4 max-w-[85%] sm:max-w-md flex items-center gap-3 border border-gray-200 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-[#2d5016]" />
                  <p className="text-xs md:text-sm font-medium">Thinking...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 md:p-4 max-w-[85%] sm:max-w-md shadow-sm">
                  <p className="text-xs md:text-sm break-words font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Form - Always visible at bottom */}
          <div className="border-t border-gray-200 p-3 md:p-4 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm md:text-base text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-gray-400 bg-white shadow-sm"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-[#2d5016] hover:bg-[#1b3d26] text-white px-3 md:px-4 py-2 flex-shrink-0 rounded-lg shadow-sm hover:shadow-md transition-all"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearHistory}
                disabled={chatHistory.length === 0 && !response && !error}
                className="bg-white text-gray-700 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] border-gray-300 px-3 md:px-4 py-2 flex-shrink-0 hidden sm:inline-flex rounded-lg shadow-sm hover:shadow-md transition-all"
                aria-label="Clear chat history"
              >
                Clear
              </Button>
            </form>
          </div>
        </div>

        {/* Info Section - Hidden on small screens, shown on larger screens */}
        <div className="hidden md:block mt-3 md:mt-4 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-4 md:p-5 flex-shrink-0 overflow-y-auto max-h-[120px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">How it works</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold mt-0.5">•</span>
              <span>Ask questions about parliamentary proceedings, bills, or documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold mt-0.5">•</span>
              <span>The chatbot searches through uploaded documents to find relevant information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold mt-0.5">•</span>
              <span>You'll receive an answer with a link to the source document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold mt-0.5">•</span>
              <span>Documents are uploaded and managed through the Django admin panel</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

