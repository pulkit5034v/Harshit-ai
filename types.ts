
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

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
}

export interface GenerationConfig {
  prompt: string;
  count: number;
  aspectRatio: AspectRatio;
  styleId: string;
}
