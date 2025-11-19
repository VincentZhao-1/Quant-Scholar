import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { ChatMessage } from '../types';
import { SendIcon, RefreshIcon } from './Icons';

interface ChatInterfaceProps {
  chatSession: Chat | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "I've analyzed the paper. Ask me about specific equations, the identification strategy, or why the authors made certain modeling choices.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSession || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessageStream(userMsg.text);
      
      let fullResponse = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // Optimistically add bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date(),
        isThinking: true
      }]);

      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: fullResponse, isThinking: false } 
              : msg
          ));
        }
      }

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered an error trying to answer that. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Basic formatter for bolding text and handling simplistic math (rendering as italic)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*|\$.*?\$)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('$') && part.endsWith('$')) {
             // Very basic math highlight
            return <span key={j} className="font-serif italic bg-gray-100 px-1 rounded text-academic-900">{part.slice(1, -1)}</span>;
          }
          return part;
        })}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-academic-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.isThinking && msg.text === '' ? (
                <div className="flex space-x-1 h-5 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                    {formatText(msg.text)}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="relative flex items-center">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the model mechanics..."
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-academic-500 focus:border-academic-500 block pl-4 pr-12 p-3 resize-none h-12 py-3"
            rows={1}
            disabled={isLoading || !chatSession}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !chatSession || !inputValue.trim()}
            className="absolute right-2 p-1.5 text-academic-600 hover:bg-academic-50 rounded-md disabled:opacity-50"
          >
            {isLoading ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">
          Gemini 2.5 Flash can hallucinate citations. Verify details.
        </p>
      </div>
    </div>
  );
};
