import { useState, useEffect } from 'react';

interface ImageViewerProps {
  images: string[];
  currentImage: string;
  onClose: () => void;
}

export default function ImageViewer({ images, currentImage, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const index = images.indexOf(currentImage);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentImage, images]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
        onClick={onClose}
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10"
            onClick={e => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            ‹
          </button>
          <button
            className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10"
            onClick={e => {
              e.stopPropagation();
              handleNext();
            }}
          >
            ›
          </button>
        </>
      )}

      <div className="max-w-5xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`图片 ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
