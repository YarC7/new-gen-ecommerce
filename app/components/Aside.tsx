import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`fixed inset-0 bg-black/20 opacity-0 pointer-events-none transition-opacity duration-400 z-10 ${
        expanded ? 'opacity-100 pointer-events-auto' : ''
      }`}
      role="dialog"
    >
      <button 
        className="absolute inset-0 w-full h-full bg-transparent" 
        onClick={close} 
      />
      <aside className={`bg-white shadow-2xl h-full w-full max-w-[400px] fixed right-0 top-0 transform transition-transform duration-200 ease-in-out ${
        expanded ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <header className="flex items-center justify-between border-b border-black h-16 px-5">
          <h3 className="m-0 text-lg font-semibold">{heading}</h3>
          <button 
            className="font-bold opacity-80 transition-opacity duration-200 w-5 hover:opacity-100 text-2xl leading-none" 
            onClick={close} 
            aria-label="Close"
          >
            &times;
          </button>
        </header>
        <main className="p-4 overflow-y-auto">{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
