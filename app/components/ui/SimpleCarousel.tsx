import * as React from 'react';
import {cn} from '~/lib/utils';

interface SimpleCarouselProps {
  children: React.ReactNode[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function SimpleCarousel({
  children,
  className,
  autoPlay = false,
  autoPlayInterval = 5000,
}: SimpleCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const totalSlides = children.length;

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = React.useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay && totalSlides > 1) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, nextSlide, autoPlayInterval, totalSlides]);

  if (totalSlides === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-500">
        <p className="text-white text-2xl">No slides found</p>
      </div>
    );
  }

  return (
    <div
      className={cn('relative w-full', className)}
      style={{minHeight: '100vh'}}
    >
      {/* Slides Container */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{minHeight: '100vh'}}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={cn(
              'absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out',
              index === currentIndex
                ? 'translate-x-0'
                : index < currentIndex
                  ? '-translate-x-full'
                  : 'translate-x-full',
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-white shadow-lg rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-white shadow-lg rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-lg">
            {Array.from({length: totalSlides}).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400',
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
