import React from 'react';
import { StructuredAnalysis } from '../types';
import { BrainIcon, CheckCircleIcon } from './Icons';

interface AnalysisViewProps {
  data: StructuredAnalysis;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  return (
    <div className="h-full overflow-y-auto p-6 pb-20 space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-academic-700">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2 leading-tight">
          {data.title}
        </h1>
        <p className="text-academic-600 text-sm mb-4 font-medium">
          {data.authors.join(', ')}
        </p>
        <div className="inline-block bg-academic-100 text-academic-800 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
          Target: {data.journalFit}
        </div>
      </div>

      {/* The Taste Builder - Contribution */}
      <div className="bg-gradient-to-br from-white to-academic-50 p-6 rounded-lg shadow-sm border border-academic-100">
        <div className="flex items-center mb-3">
          <BrainIcon className="w-5 h-5 text-academic-700 mr-2" />
          <h2 className="text-lg font-bold text-academic-900 uppercase tracking-wide text-sm">
            Theoretical Contribution (The "Taste")
          </h2>
        </div>
        <p className="text-gray-700 text-base leading-relaxed font-serif">
          {data.theoreticalContribution}
        </p>
      </div>

      {/* Methodology & Setup */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-2">Model Setup & Mechanics</h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">Framework</span>
              <p className="text-gray-800 font-medium">{data.methodology.type}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">Key Assumptions</span>
              <ul className="mt-1 space-y-1">
                {data.methodology.keyAssumptions.map((assumption, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <span className="mr-2 text-academic-500">•</span> {assumption}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">The Game</span>
              <p className="text-sm text-gray-600 mt-1">{data.methodology.modelSetup}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Findings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
         <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Key Findings & Propositions</h3>
         <ul className="space-y-3">
            {data.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{finding}</span>
                </li>
            ))}
         </ul>
      </div>

      {/* Critique */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-md font-bold text-red-900 mb-3">Reviewer 2's Perspective</h3>
        <p className="text-red-800 text-sm italic mb-4">"{data.critique.reviewerPerspective}"</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Weaknesses</h4>
                 <ul className="list-disc list-inside text-xs text-red-800 space-y-1">
                    {data.critique.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                 </ul>
            </div>
            <div>
                <h4 className="text-xs font-bold text-academic-700 uppercase mb-2">Strengths</h4>
                 <ul className="list-disc list-inside text-xs text-academic-800 space-y-1">
                    {data.critique.strengths.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
