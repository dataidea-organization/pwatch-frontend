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
    <div className="min-h-screen bg-[#f3eed4]">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Parliamentary Chatbot
            </h1>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded">
              ALPHA VERSION
            </span>
          </div>
          <p className="text-gray-600 text-lg mb-2">
            Ask questions about parliamentary proceedings, bills, and documents
          </p>
          <p className="text-sm text-gray-500">
            Currently supports question and answer only
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-[#f3eed4] rounded-lg shadow-lg border border-gray-200 flex flex-col h-[600px]">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 && !response && !error && (
              <div className="text-center py-12 text-gray-600">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg">Start a conversation!</p>
                <p className="text-sm text-gray-500 mt-2">Ask me anything about parliamentary proceedings, bills, or documents.</p>
              </div>
            )}

            {/* Display last 5 message pairs */}
            {chatHistory.map((item, index) => (
              <div key={index} className="space-y-4">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="bg-[#e0f2f1] text-gray-900 rounded-lg p-3 max-w-md">
                    <p className="font-medium text-sm mb-1">You:</p>
                    <p className="text-sm whitespace-pre-wrap">{item.query}</p>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="bg-blue-50 text-gray-800 rounded-lg p-3 max-w-md space-y-2">
                    <p className="font-medium text-sm mb-1">Bot:</p>
                    <p className="text-sm whitespace-pre-wrap">{item.response.answer}</p>
                    {item.response.document_url && (
                      <a
                        href={item.response.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-[#2d5016] hover:text-[#1b3d26] transition-colors"
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
                <div className="bg-blue-50 text-gray-800 rounded-lg p-3 max-w-md space-y-2">
                  <p className="font-medium text-sm mb-1">Bot:</p>
                  <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
                  {response.document_url && (
                    <a
                      href={response.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-[#2d5016] hover:text-[#1b3d26] transition-colors"
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
                <div className="bg-gray-100 text-gray-700 rounded-lg p-3 max-w-md flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 max-w-md">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-base text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-[#2d5016] hover:bg-[#1b3d26] text-white px-4 py-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearHistory}
                disabled={chatHistory.length === 0 && !response && !error}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300 px-4 py-2"
              >
                Clear
              </Button>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-[#f3eed4] rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">How it works</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold">•</span>
              <span>Ask questions about parliamentary proceedings, bills, or documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold">•</span>
              <span>The chatbot searches through uploaded documents to find relevant information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold">•</span>
              <span>You'll receive an answer with a link to the source document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d5016] font-semibold">•</span>
              <span>Documents are uploaded and managed through the Django admin panel</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

