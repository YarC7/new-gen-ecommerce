import {useEffect, type ReactNode} from 'react';

interface AsideProps {
  children: ReactNode;
  heading: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A generic slide-out aside component.
 */
export function Aside({children, heading, isOpen, onClose}: AsideProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      aria-modal
      className={`fixed inset-0 bg-black/20 opacity-0 pointer-events-none transition-opacity duration-400 z-20 ${
        isOpen ? 'opacity-100 pointer-events-auto' : ''
      }`}
      role="dialog"
      onClick={onClose}
    >
      <aside
        className={`bg-white shadow-2xl h-full w-[90%] sm:w-[60%] md:max-w-lg fixed right-0 top-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-200 h-16 px-5">
          <h3 className="m-0 text-lg font-semibold">{heading}</h3>
          <button
            className="font-bold opacity-80 transition-opacity duration-200 w-5 hover:opacity-100 text-2xl leading-none"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>
        <main className="p-5 overflow-y-auto">{children}</main>
      </aside>
    </div>
  );
}
