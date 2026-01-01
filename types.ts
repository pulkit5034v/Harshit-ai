
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type TransitionType = "fade" | "slide" | "zoom" | "blur" | "glitch" | "none";

export interface GenerationConfig {
  prompt: string;
  count: number;
  aspectRatio: AspectRatio;
  styleId: string;
}

export interface ImageStyle {
  id: string;
  name: string;
  promptSuffix: string;
  preview: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  style: string;
  timestamp: number;
  loading?: boolean;
  error?: string;
  scriptSegment?: string;
  audioUrl?: string;
  duration?: number;
  transition?: TransitionType;
}

export interface ScriptScene {
  visualPrompt: string;
  scriptText: string;
}

export interface VoiceConfig {
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Zephyr' | 'Fenrir';
  gender: 'Male' | 'Female' | 'Neutral';
  tone: string;
}

export interface Project {
  id: string;
  title: string;
  scenes: GeneratedImage[];
  voiceConfig: VoiceConfig;
  createdAt: number;
  totalDurationSeconds: number;
  defaultTransition?: TransitionType;
}

export interface SystemSettings {
  appName: string;
  accentColor: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'banned';
  joinedAt: number;
  totalProductionMinutes: number;
  accessKeyId: string;
}

export interface AccessKey {
  id: string;
  key: string;
  maxProductionMinutes: number;
  usedMinutes: number;
  isBanned: boolean;
  createdBy: string;
  ownerUid?: string;
}
