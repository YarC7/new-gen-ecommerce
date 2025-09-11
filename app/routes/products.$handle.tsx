import {useLoaderData, useSearchParams, Link, useFetcher} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {CartForm} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {useState, useMemo, useCallback, useEffect} from 'react';
import {cn} from '~/lib/utils';
import {
  Package,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  Heart,
  Share2,
  AlertTriangle,
} from 'lucide-react';

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);

  if (!handle) {
    throw new Response('Product handle is required', {status: 400});
  }

  // Enhanced logging for debugging
  console.log('Loading product with handle:', handle);

  try {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
      },
    });

    console.log('Product loaded successfully:', !!product);
    console.log('Product title:', product?.title);

    if (!product?.id) {
      throw new Response('Product not found', {status: 404});
    }

    return {product};
  } catch (error) {
    console.error('Error loading product:', error);

    // Re-throw redirects and 404s
    if (error instanceof Response) {
      throw error;
    }

    throw new Response('Failed to load product', {status: 500});
  }
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [manualImageSelection, setManualImageSelection] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const fetcher = useFetcher();

  // Optimize variant selection with useMemo to prevent expensive recalculations
  const selectedVariant = useMemo(() => {
    return getSelectedVariant(product, searchParams);
  }, [product, searchParams]);

  const images = product.images.nodes || [];
  const isFallbackProduct = product.id === 'fallback-product';

  // Memoize current image for better performance
  const currentImage = useMemo(() => {
    return images[selectedImage] || null;
  }, [images, selectedImage]);

  // Reset selected image when variant changes (if variant has specific image)
  // But only if user hasn't manually selected an image
  useEffect(() => {
  if (
    !manualImageSelection &&
    selectedVariant?.image &&
    images.length > 0 &&
    selectedImage !== images.findIndex((img) => img.id === selectedVariant.image.id)
  ) {
    const variantImageIndex = images.findIndex(
      (img) => img.id === selectedVariant.image.id,
    );
    if (variantImageIndex !== -1) {
      setSelectedImage(variantImageIndex);
    }
  }
}, [selectedVariant, images, selectedImage, manualImageSelection]);

  // Handle manual image selection
  const handleImageSelect = useCallback((index: number) => {
    console.log('Selecting image:', index); // Debug log
    setSelectedImage(index);
    setManualImageSelection(true);
  }, []);

  // Optimized option selection handler
  const handleOptionSelect = useCallback(
    (optionName: string, value: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(optionName, value);
      // When changing options, allow variant image to control selection again
      setManualImageSelection(false);
      setSearchParams(newSearchParams, {replace: true}); // Use replace to avoid history buildup
    },
    [searchParams, setSearchParams],
  );

  // Check if fetcher is submitting to cart
  const isAddingToCart = fetcher.state === 'submitting';

  // Track success state when fetcher completes
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && !addedToCart) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  }, [fetcher.state, fetcher.data, addedToCart]);

  // Handle add to cart using fetcher for proper revalidation
  const handleAddToCart = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!selectedVariant?.availableForSale || isAddingToCart) return;

      // Create form data using CartForm format
      const formData = new FormData();
      const cartFormInput = {
        action: CartForm.ACTIONS.LinesAdd,
        inputs: {
          lines: [
            {
              merchandiseId: selectedVariant.id,
              quantity,
            },
          ],
        },
      };

      formData.append('cartFormInput', JSON.stringify(cartFormInput));

      // Submit using fetcher - this will automatically revalidate cart data
      fetcher.submit(formData, {
        method: 'POST',
        action: '/cart',
      });
    },
    [selectedVariant, quantity, isAddingToCart, fetcher],
  );

  return (
    <div className="product-page min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              to="/products"
              className="hover:text-primary transition-colors"
            >
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fallback Product Notice */}
          {isFallbackProduct && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="text-sm font-medium text-destructive">
                    Demo Mode
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is a demo product. Connect to a Shopify store to see
                    real product data.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-card rounded-lg shadow-sm border overflow-hidden relative group">
                {currentImage ? (
<img
  key={selectedImage} // Force re-render for smooth transition
  src={currentImage.url}
  alt={currentImage.altText || product.title}
  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
/>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                
                {/* Image counter overlay */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image: any, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => handleImageSelect(index)}
                      className={cn(
                        'aspect-square bg-card rounded-lg border-2 overflow-hidden transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50',
                        selectedImage === index
                          ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-105'
                          : 'border-border hover:border-primary/50',
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.altText || `${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Title */}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {product.description}
                </p>
              </div>

              {/* Product Price */}
              <div className="flex items-center gap-4">
                <ProductPrice
                  price={selectedVariant.price}
                  className="text-2xl font-bold text-foreground"
                />
                {selectedVariant.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    <ProductPrice price={selectedVariant.compareAtPrice} />
                  </span>
                )}
              </div>

              {/* Product Options */}
              {product.options.map((option: any) => (
                <div key={option.name} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {option.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value: string) => (
                      <button
                        key={value}
                        className={cn(
                          'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                          selectedVariant.selectedOptions.some(
                            (selectedOption: any) =>
                              selectedOption.name === option.name &&
                              selectedOption.value === value,
                          )
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:border-primary hover:text-primary',
                        )}
                        onClick={() => handleOptionSelect(option.name, value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add to Cart Form */}
              {!isFallbackProduct ? (
                <form onSubmit={handleAddToCart}>
                  <div className="space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="quantity"
                        className="text-sm font-semibold text-foreground"
                      >
                        Quantity:
                      </label>
                      <div className="flex items-center border border-input rounded-lg">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-foreground font-medium min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={
                          !selectedVariant?.availableForSale || isAddingToCart
                        }
                        className="flex-1 bg-primary text-primary-foreground font-semibold py-4 px-6 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {isAddingToCart ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Adding...
                          </span>
                        ) : addedToCart ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Added to Cart!
                          </span>
                        ) : selectedVariant?.availableForSale ? (
                          <span className="flex items-center justify-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </span>
                        ) : (
                          'Out of Stock'
                        )}
                      </button>

                      <button
                        type="button"
                        className="px-4 py-4 border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
                        title="Add to Wishlist"
                      >
                        <Heart className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        className="px-4 py-4 border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
                        title="Share Product"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-muted-foreground">
                      Demo product - Add to cart not available
                    </p>
                  </div>
                </div>
              )}

              {/* Product Description */}
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Product Description
                </h3>
                <div
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
                />
              </div>

              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Optimized helper function to get selected variant based on URL parameters
function getSelectedVariant(product: any, searchParams: URLSearchParams) {
  const variants = product.variants.nodes;
  if (!variants || variants.length === 0) return null;

  // Convert searchParams to simple object for faster lookup
  const selectedOptions: Record<string, string> = {};
  searchParams.forEach((value, name) => {
    if (!name.startsWith('_') && name !== '_routes') {
      selectedOptions[name] = value;
    }
  });

  // If no options selected, return first variant
  const optionKeys = Object.keys(selectedOptions);
  if (optionKeys.length === 0) {
    return variants[0];
  }

  // Find variant that matches selected options - optimized lookup
  const selectedVariant = variants.find((variant: any) => {
    if (!variant.selectedOptions) return false;

    return optionKeys.every((optionName) => {
      return variant.selectedOptions.some(
        (variantOption: any) =>
          variantOption.name === optionName &&
          variantOption.value === selectedOptions[optionName],
      );
    });
  });

  return selectedVariant || variants[0];
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      options {
        name
        values
      }
      images(first: 20) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          sku
          unitPrice {
            amount
            currencyCode
          }
        }
      }
      seo {
        title
        description
      }
      tags
    }
  }
`;
