
import { AspectRatio, ImageStyle } from './types';

export const IMAGE_STYLES: ImageStyle[] = [
  { id: 'none', name: 'None', promptSuffix: '', preview: 'https://picsum.photos/seed/none/200' },
  { id: 'realistic', name: 'Photorealistic', promptSuffix: ', hyper-realistic, 8k resolution, highly detailed, professional photography', preview: 'https://picsum.photos/seed/photo/200' },
  { id: 'cyberpunk', name: 'Cyberpunk', promptSuffix: ', cyberpunk aesthetic, neon lights, futuristic city, high tech, dark synthwave colors', preview: 'https://picsum.photos/seed/cyber/200' },
  { id: 'watercolor', name: 'Watercolor', promptSuffix: ', soft watercolor painting, artistic brush strokes, pastel colors, paper texture', preview: 'https://picsum.photos/seed/water/200' },
  { id: 'oil', name: 'Oil Painting', promptSuffix: ', classic oil painting, rich textures, heavy brushwork, masterpiece, canvas texture', preview: 'https://picsum.photos/seed/oil/200' },
  { id: 'sketch', name: 'Charcoal Sketch', promptSuffix: ', rough charcoal sketch, hand-drawn, artistic, expressive lines, black and white', preview: 'https://picsum.photos/seed/sketch/200' },
  { id: '3d', name: '3D Render', promptSuffix: ', high quality 3d render, Octane render, Unreal Engine 5, Pixar style, vivid lighting', preview: 'https://picsum.photos/seed/3d/200' },
  { id: 'anime', name: 'Anime', promptSuffix: ', high quality anime style, vibrant colors, detailed line art, studio ghibli inspiration', preview: 'https://picsum.photos/seed/anime/200' },
  { id: 'flat-vector', name: 'Flat Vector', promptSuffix: ', flat 2d vector illustration, clean lines, minimalist, solid colors, behance style', preview: 'https://picsum.photos/seed/vector/200' },
  { id: 'pixel-art', name: 'Pixel Art', promptSuffix: ', high quality 16-bit pixel art, retro video game style, vibrant, crisp pixels', preview: 'https://picsum.photos/seed/pixel/200' },
  { id: 'paper-cutout', name: 'Paper Cutout', promptSuffix: ', layered paper cutout art, 2d silhouette, depth effect, handcrafted texture', preview: 'https://picsum.photos/seed/paper/200' },
  { id: 'line-art', name: 'Line Art', promptSuffix: ', clean 2d line art, minimalist black and white illustration, elegant contours', preview: 'https://picsum.photos/seed/line/200' },
  { id: 'pop-art', name: 'Pop Art', promptSuffix: ', 2d pop art style, Andy Warhol inspired, bold colors, halftone dots, high contrast', preview: 'https://picsum.photos/seed/pop/200' },
  { id: 'ukiyo-e', name: 'Japanese Woodblock', promptSuffix: ', traditional Japanese ukiyo-e style, 2d woodblock print, flat colors, classical art', preview: 'https://picsum.photos/seed/japan/200' },
  { id: 'isometric', name: 'Isometric 2D', promptSuffix: ', isometric 2d illustration, game asset style, clean vector, soft shadows', preview: 'https://picsum.photos/seed/iso/200' },
  { id: 'graffiti', name: 'Graffiti Art', promptSuffix: ', urban graffiti street art style, 2d spray paint, bold tags, vibrant dripping paint', preview: 'https://picsum.photos/seed/street/200' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: "1:1", label: "Square", icon: "▢" },
  { value: "3:4", label: "Portrait", icon: "▯" },
  { value: "4:3", label: "Landscape", icon: "▭" },
  { value: "9:16", label: "Tall", icon: "▮" },
  { value: "16:9", label: "Wide", icon: "▬" },
];
