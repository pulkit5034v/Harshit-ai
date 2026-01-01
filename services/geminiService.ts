
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AspectRatio, ScriptScene, VoiceConfig } from "../types";

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const audioBufferToWav = (buffer: AudioBuffer) => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  let pos = 0;

  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }
  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }

  setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
  setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
  setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2); setUint16(16);
  setUint32(0x61746164); setUint32(length - pos - 4);

  const channels = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
  
  let offset = 0;
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([out], { type: 'audio/wav' });
};

export const generateTTS = async (text: string, voiceName: string, apiKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this with professional cinematic delivery: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS Failure");

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const rawData = decode(base64Audio);
  const dataInt16 = new Int16Array(rawData.buffer);
  const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

  return URL.createObjectURL(audioBufferToWav(buffer));
};

export const generateSingleVideo = async (prompt: string, aspectRatio: string, apiKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic footage, high production value, professional lighting: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio as any
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video Node Failure");
  
  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

export const generateScriptFromTitle = async (title: string, apiKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a compelling 45-second cinematic script for a short film titled: "${title}". Use high-impact narrative language. Return the script text only.`,
  });
  return response.text || "";
};

export const suggestVoiceConfig = async (script: string, apiKey: string): Promise<VoiceConfig> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Select the most appropriate voice (Kore, Puck, Charon, Zephyr, Fenrir) for this script: "${script}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          voiceName: { type: Type.STRING, enum: ['Kore', 'Puck', 'Charon', 'Zephyr', 'Fenrir'] },
          gender: { type: Type.STRING, enum: ['Male', 'Female', 'Neutral'] },
          tone: { type: Type.STRING }
        },
        required: ["voiceName", "gender", "tone"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const extractScenesFromScript = async (script: string, apiKey: string): Promise<ScriptScene[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Deconstruct this screenplay into exactly 5 visual scenes. For each scene, provide a 'visualPrompt' describing the shot and 'scriptText' for the audio. Script: "${script}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            visualPrompt: { type: Type.STRING, description: "Detailed visual description for AI generation" },
            scriptText: { type: Type.STRING, description: "Spoken line for this scene" }
          },
          required: ["visualPrompt", "scriptText"]
        }
      },
    },
  });
  return JSON.parse(response.text || "[]");
};

export const generateSingleImage = async (prompt: string, aspectRatio: AspectRatio, apiKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Masterpiece cinematic photography, highly detailed, 8k: ${prompt}` }] },
    config: { imageConfig: { aspectRatio } },
  });
  const data = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
  if (!data) throw new Error("Visual Node Failure");
  return `data:image/png;base64,${data}`;
};
