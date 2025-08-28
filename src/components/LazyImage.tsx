import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
}

export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=',
  loading = 'lazy'
}: LazyImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (loading === 'lazy') {
      observer.observe(img);
      return () => observer.disconnect();
    } else {
      img.src = src;
    }
  }, [src, loading]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={loading === 'eager' ? src : placeholder}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageLoaded && !imageError ? 'opacity-100' : 'opacity-70'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
      />
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground text-sm">
          Image unavailable
        </div>
      )}
      
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse" />
      )}
    </div>
  );
};