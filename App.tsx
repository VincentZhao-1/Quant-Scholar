import React, { useState, useCallback } from 'react';
import { Chat } from "@google/genai";
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { ChatInterface } from './components/ChatInterface';
import { ViewState, TabView, StructuredAnalysis } from './types';
import { analyzePaper, createChatSession } from './services/geminiService';
import { BrainIcon, FileTextIcon, MessageSquareIcon } from './components/Icons';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.UPLOAD);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.ANALYSIS);
  const [analysisData, setAnalysisData] = useState<StructuredAnalysis | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileSelect = useCallback(async (file: File) => {
    setViewState(ViewState.ANALYZING);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64String = (e.target.result as string).split(',')[1];
        const mimeType = file.type;

        try {
          // 1. Parallel: Start Analysis
          const analysisPromise = analyzePaper(base64String, mimeType);
          
          // 2. Parallel: Initialize Chat Session with context
          const session = createChatSession(base64String, mimeType);
          setChatSession(session);

          const result = await analysisPromise;
          setAnalysisData(result);
          setViewState(ViewState.DASHBOARD);
        } catch (err) {
          console.error("Error processing paper:", err);
          setViewState(ViewState.UPLOAD);
          alert("Failed to analyze paper. Please try again.");
        }
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReset = () => {
    setViewState(ViewState.UPLOAD);
    setAnalysisData(null);
    setChatSession(null);
    setActiveTab(TabView.ANALYSIS);
  };

  return (
    <div className="h-screen flex flex-col bg-academic-50">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-academic-200 px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <BrainIcon className="w-6 h-6 text-academic-800" />
          <span className="text-xl font-serif font-bold text-academic-900 tracking-tight">QuantScholar</span>
        </div>
        {viewState === ViewState.DASHBOARD && (
           <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full truncate max-w-[200px]">{fileName}</span>
             <button 
               onClick={handleReset}
               className="text-sm text-academic-600 hover:text-academic-800 font-medium"
             >
               Upload New
             </button>
           </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {viewState === ViewState.UPLOAD || viewState === ViewState.ANALYZING ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
             <FileUpload onFileSelect={handleFileSelect} isAnalyzing={viewState === ViewState.ANALYZING} />
          </div>
        ) : (
          <div className="h-full flex flex-col md:flex-row">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex border-b bg-white">
              <button
                onClick={() => setActiveTab(TabView.ANALYSIS)}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === TabView.ANALYSIS ? 'text-academic-800 border-b-2 border-academic-800' : 'text-gray-500'
                }`}
              >
                <FileTextIcon className="w-4 h-4" /> Analysis
              </button>
              <button
                onClick={() => setActiveTab(TabView.CHAT)}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === TabView.CHAT ? 'text-academic-800 border-b-2 border-academic-800' : 'text-gray-500'
                }`}
              >
                <MessageSquareIcon className="w-4 h-4" /> Discussion
              </button>
            </div>

            {/* Desktop: Split View / Mobile: Tabbed View */}
            
            {/* Analysis Panel */}
            <div className={`flex-1 h-full overflow-hidden border-r border-academic-200 bg-academic-50/50 ${
              activeTab === TabView.ANALYSIS ? 'block' : 'hidden md:block'
            }`}>
              {analysisData && <AnalysisView data={analysisData} />}
            </div>

            {/* Chat Panel */}
            <div className={`flex-1 h-full overflow-hidden bg-white flex flex-col ${
              activeTab === TabView.CHAT ? 'block' : 'hidden md:flex'
            }`}>
               <div className="p-4 border-b border-gray-100 bg-white hidden md:block">
                  <h2 className="text-lg font-bold text-academic-900 flex items-center gap-2">
                    <MessageSquareIcon className="w-5 h-5 text-academic-600" />
                    Deep Dive
                  </h2>
                  <p className="text-xs text-gray-500">Discuss propositions and math with the AI Tutor.</p>
               </div>
               <div className="flex-1 overflow-hidden">
                 <ChatInterface chatSession={chatSession} />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
