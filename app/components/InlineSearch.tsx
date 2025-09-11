import {useState, useEffect, useRef} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

interface InlineSearchProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
}

export function InlineSearch({isOpen, onClose, searchTerm}: InlineSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>({
    products: [],
    collections: [],
    total: 0
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher();
  const navigate = useNavigate();

  // Handle link clicks with navigation
  const handleLinkClick = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Navigating to:', url); // Debug log
    
    // Use navigate for programmatic navigation
    navigate(url);
    
    // Close search after a short delay
    setTimeout(() => {
      onClose();
    }, 100);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setResults({products: [], collections: [], total: 0});
      return;
    }

    // Avoid duplicate requests
    if (fetcher.state === 'loading') {
      return;
    }

    setIsLoading(true);
    try {
      fetcher.submit(
        {q: term, predictive: 'true', limit: '6'},
        {method: 'GET', action: '/search'}
      );
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  };

  // Update results when fetcher data changes
  useEffect(() => {
    console.log('Fetcher state:', fetcher.state, 'Data:', !!fetcher.data); // Debug log
    
    if (fetcher.data && fetcher.state === 'idle') {
      setIsLoading(false);
      if (fetcher.data.type === 'predictive') {
        const newResults = {
          products: fetcher.data.result.items.products || [],
          collections: fetcher.data.result.items.collections || [],
          total: fetcher.data.result.total || 0
        };
        console.log('Search results:', newResults); // Debug log
        setResults(newResults);
      }
    } else if (fetcher.state === 'loading') {
      setIsLoading(true);
    }
  }, [fetcher.data, fetcher.state]);

  // Debounced search - only search if term is long enough
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timer = setTimeout(() => {
        handleSearch(searchTerm);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults({
        products: [],
        collections: [],
        total: 0
      });
    }
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Click outside to close with better event handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking on a link inside the dropdown
      if (target && (target as Element).closest('a')) {
        return;
      }
      
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Small delay to allow link navigation to complete
        setTimeout(() => {
          onClose();
        }, 100);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="w-full">
      {/* Dropdown Results */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
        {searchTerm.trim().length < 2 ? (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-sm">Type at least 2 characters or press Enter to search</p>
            </div>
          </div>
        ) : !results.total && !isLoading ? (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào cho "{searchTerm}"</p>
            </div>
          </div>
        ) : (
          <div className="max-h-80 lg:max-h-96 overflow-y-auto">
            {/* Products */}
            {results.products.length > 0 && (
              <div className="p-3">
                <div className="flex items-center mb-3">
                  <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></div>
                  <h3 className="text-sm font-semibold text-gray-900">Products</h3>
                </div>
                <div className="space-y-1">
                  {results.products.slice(0, 4).map((product: any) => {
                    // Ensure we have the required data
                    if (!product || !product.handle) {
                      console.warn('Invalid product data:', product);
                      return null;
                    }
                    
                    return (
                    <Link
                      key={product.id}
                      to={`/products/${product.handle}`}
                      onClick={(e) => handleLinkClick(`/products/${product.handle}`, e)}
                      className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-100"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 ring-1 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200">
                        {product.featuredImage ? (
                          <Image
                            data={product.featuredImage}
                            alt={product.featuredImage.altText || product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            width={40}
                            height={40}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </p>
                        {product.priceRange?.minVariantPrice && (
                          <p className="text-xs font-semibold text-blue-600 mt-1">
                            <Money data={product.priceRange.minVariantPrice} />
                          </p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {/* Collections */}
            {results.collections.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-2"></div>
                  <h3 className="text-sm font-semibold text-gray-900">Collections</h3>
                </div>
                <div className="space-y-1">
                  {results.collections.slice(0, 2).map((collection: any) => (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.handle}`}
                      onClick={(e) => handleLinkClick(`/collections/${collection.handle}`, e)}
                      className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-all duration-200 border border-transparent hover:border-purple-100"
                    >
                      {collection.image && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                          <Image
                            data={collection.image}
                            alt={collection.image.altText || collection.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            width={40}
                            height={40}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                          {collection.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Collection</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* View All Results */}
            {results.total > 0 && (
              <div className="p-3 border-t border-gray-100">
                <Link
                  to={`/search?q=${encodeURIComponent(searchTerm)}`}
                  onClick={(e) => handleLinkClick(`/search?q=${encodeURIComponent(searchTerm)}`, e)}
                  className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  View All {results.total} Results
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
