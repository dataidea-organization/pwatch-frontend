'use client';

import { useState } from 'react';
import { Send, Loader2, FileText, MessageSquare } from 'lucide-react';
import { chatWithBot, ChatbotResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChatbotPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatbotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ query: string; response: ChatbotResponse }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await chatWithBot(query.trim());
      setResponse(result);
      setChatHistory(prev => [...prev, { query: query.trim(), response: result }]);
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Parliamentary Chatbot
          </h1>
          <p className="text-gray-600 text-lg">
            Ask questions about parliamentary proceedings, bills, and documents
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="mb-6 space-y-4 max-h-96 overflow-y-auto pr-2">
              {chatHistory.map((item, index) => (
                <div key={index} className="space-y-3">
                  {/* User Query */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#085e29] flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">You</span>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-lg p-3">
                      <p className="text-gray-800">{item.query}</p>
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-gray-800 whitespace-pre-wrap">{item.response.answer}</p>
                      </div>
                      {item.response.document_url && (
                        <a
                          href={item.response.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-[#085e29] hover:text-[#064920] transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Source: {item.response.document_name}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Response */}
          {response && chatHistory.length === 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-800 whitespace-pre-wrap">{response.answer}</p>
                  </div>
                  {response.document_url && (
                    <a
                      href={response.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#085e29] hover:text-[#064920] transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Source: {response.document_name}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a question about parliamentary proceedings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-[#085e29] hover:bg-[#064920] text-white px-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>

          {/* Clear History Button */}
          {chatHistory.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={clearHistory}
                variant="outline"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear History
              </Button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">How it works</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#085e29] font-semibold">•</span>
              <span>Ask questions about parliamentary proceedings, bills, or documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#085e29] font-semibold">•</span>
              <span>The chatbot searches through uploaded documents to find relevant information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#085e29] font-semibold">•</span>
              <span>You'll receive an answer with a link to the source document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#085e29] font-semibold">•</span>
              <span>Documents are uploaded and managed through the Django admin panel</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

