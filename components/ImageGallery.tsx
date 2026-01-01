
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { ImageCard } from './ImageCard';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
  onEdit: (image: GeneratedImage) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDelete, onEdit }) => {
  const [isZipping, setIsZipping] = useState(false);

  const handleBulkDownload = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new (window as any).JSZip();
      const folder = zip.folder("production_assets");
      
      await Promise.all(images.map(async (img, i) => {
        const response = await fetch(img.url);
        const blob = await response.blob();
        const ext = img.style === 'AI Motion' ? 'mp4' : 'png';
        folder.file(`frame_${i+1}.${ext}`, blob);
      }));

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `production_vault_${Date.now()}.zip`;
      link.click();
    } catch (e) {
      console.error(e);
      alert("Asset compression failed.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h3 className="text-[12px] font-black uppercase tracking-[0.8em] text-slate-500">Asset Cluster</h3>
        <button 
          onClick={handleBulkDownload}
          disabled={isZipping || images.length === 0}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-20"
        >
          {isZipping ? "Compressing Vault..." : "Export Bulk Vault (ZIP)"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {images.map((image) => (
          <ImageCard 
            key={image.id} 
            image={image} 
            onDelete={() => onDelete(image.id)} 
            onEdit={() => onEdit(image)}
          />
        ))}
      </div>
    </div>
  );
};
