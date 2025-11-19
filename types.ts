import { Type } from "@google/genai";

export interface PaperMetadata {
  title: string;
  fileName: string;
  uploadDate: Date;
}

// Structured analysis response from the model
export interface StructuredAnalysis {
  title: string;
  authors: string[];
  journalFit: string;
  researchQuestion: string;
  methodology: {
    type: string;
    keyAssumptions: string[];
    modelSetup: string;
  };
  keyFindings: string[];
  theoreticalContribution: string; // The "Taste" - why is this novel?
  managerialImplications: string;
  critique: {
    strengths: string[];
    weaknesses: string[];
    reviewerPerspective: string; // What would Reviewer 2 say?
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export enum ViewState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD'
}

export enum TabView {
  ANALYSIS = 'ANALYSIS',
  CHAT = 'CHAT'
}
