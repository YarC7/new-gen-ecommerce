import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {cn} from '~/lib/utils';

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
    <div className="group overflow-hidden bg-card text-card-foreground border-border hover:shadow-lg transition-all duration-300 rounded-xl border shadow-sm">
      <Link to={`/products/${product.handle}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              data={image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <svg
                className="w-12 h-12 text-muted-foreground"
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
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
            {product.title}
          </h3>

          {price && (
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: price.currencyCode,
                }).format(parseFloat(price.amount))}
              </p>

              {variant && (
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-md',
                    variant.availableForSale
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-destructive text-white',
                  )}
                >
                  {variant.availableForSale ? 'In Stock' : 'Out of Stock'}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
