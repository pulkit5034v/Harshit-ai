
import React from 'react';
import { GeneratedImage } from '../types';
import { ImageCard } from './ImageCard';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <ImageCard 
          key={image.id} 
          image={image} 
          onDelete={() => onDelete(image.id)} 
        />
      ))}
    </div>
  );
};
