import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

interface Product {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    nodes: Array<{
      id: string;
      url: string;
      altText?: string;
      width?: number;
      height?: number;
    }>;
  };
  variants: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale: boolean;
    }>;
  };
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({product}: ProductCardProps) {
  const image = product.images?.nodes?.[0];
  const variant = product.variants?.nodes?.[0];
  const price = product.priceRange?.minVariantPrice;

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {image ? (
          <Image
            data={image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
          {product.title}
        </h3>
        
        {price && (
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currencyCode,
              }).format(parseFloat(price.amount))}
            </p>
            
            {variant && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  variant.availableForSale
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {variant.availableForSale ? 'In Stock' : 'Out of Stock'}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
