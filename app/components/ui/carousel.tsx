import * as React from 'react';
import {cn} from '~/lib/utils';
import {ChevronLeft, ChevronRight} from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  infinite?: boolean;
  loading?: boolean;
}

interface CarouselContextType {
  currentIndex: number;
  totalSlides: number;
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
}

const CarouselContext = React.createContext<CarouselContextType | null>(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a Carousel');
  }
  return context;
}

export function Carousel({
  children,
  className,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  infinite = true,
  loading = false,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const totalSlides = children.length;
  const autoPlayRef = React.useRef<NodeJS.Timeout>();

  const goToSlide = React.useCallback(
    (index: number) => {
      if (infinite) {
        setCurrentIndex((index + totalSlides) % totalSlides);
      } else {
        setCurrentIndex(Math.max(0, Math.min(index, totalSlides - 1)));
      }
    },
    [totalSlides, infinite],
  );

  const nextSlide = React.useCallback(() => {
    if (infinite || currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  }, [currentIndex, totalSlides, infinite, goToSlide]);

  const prevSlide = React.useCallback(() => {
    if (infinite || currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }, [currentIndex, infinite, goToSlide]);

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay && !isHovered && totalSlides > 1) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, isHovered, nextSlide, autoPlayInterval, totalSlides]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const contextValue: CarouselContextType = {
    currentIndex,
    totalSlides,
    goToSlide,
    nextSlide,
    prevSlide,
  };

  if (loading) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading amazing content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (totalSlides === 0) {
    return null;
  }

  return (
    <CarouselContext.Provider value={contextValue}>
      <section
        className={cn('relative overflow-hidden', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Carousel"
      >
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              aria-hidden={index !== currentIndex}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={!infinite && currentIndex === 0}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 z-10',
                'flex items-center justify-center w-12 h-12',
                'bg-white/90 hover:bg-white shadow-lg rounded-full',
                'transition-all duration-200 hover:scale-110',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              disabled={!infinite && currentIndex === totalSlides - 1}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                'flex items-center justify-center w-12 h-12',
                'bg-white/90 hover:bg-white shadow-lg rounded-full',
                'transition-all duration-200 hover:scale-110',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showDots && totalSlides > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-lg">
              {Array.from({length: totalSlides}).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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
      </section>
    </CarouselContext.Provider>
  );
}

export function CarouselSlide({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('w-full', className)}>{children}</div>;
}
