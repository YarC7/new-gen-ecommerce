// TypeScript types for GraphQL queries and responses
// These types help with type safety and IntelliSense

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice?: Money;
  image?: Image;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface ProductCard {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: Money;
  };
  images: {
    nodes: Image[];
  };
  variants: {
    nodes: ProductVariant[];
  };
}

export interface ProductSearchCard extends ProductCard {
  description?: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice: Money;
  };
  tags: string[];
  productType?: string;
  vendor?: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  options: Array<{
    name: string;
    values: string[];
  }>;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  variants: {
    pageInfo: PageInfo;
    nodes: ProductVariant[];
  };
  images: {
    pageInfo: PageInfo;
    nodes: Image[];
  };
  seo?: {
    title?: string;
    description?: string;
  };
  tags: string[];
  updatedAt: string;
}

// ============================================================================
// COLLECTION TYPES
// ============================================================================

export interface CollectionCard {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: Image;
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  handle: string;
  seo?: {
    title?: string;
    description?: string;
  };
  image?: Image;
  products: {
    pageInfo: PageInfo;
    nodes: Array<{
      id: string;
      title: string;
      publishedAt: string;
      handle: string;
      variants: {
        nodes: Array<{
          id: string;
          image?: Image;
          price: Money;
          compareAtPrice?: Money;
        }>;
      };
    }>;
  };
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartLine {
  id: string;
  quantity: number;
  attributes: Array<{
    key: string;
    value: string;
  }>;
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
    compareAtAmountPerQuantity?: Money;
  };
  merchandise: ProductVariant & {
    product: {
      handle: string;
      title: string;
    };
    unitPrice: Money;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  buyerIdentity?: {
    countryCode?: string;
    customer?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
    };
    email?: string;
    phone?: string;
  };
  lines: {
    nodes: CartLine[];
  };
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalDutyAmount?: Money;
    totalTaxAmount?: Money;
  };
  note?: string;
  totalQuantity: number;
}

// ============================================================================
// SHOP TYPES
// ============================================================================

export interface Shop {
  name: string;
  description?: string;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// ============================================================================
// QUERY RESPONSE TYPES
// ============================================================================

export interface ProductsQueryResponse {
  products: {
    nodes: ProductCard[];
  };
  shop: Shop;
}

export interface ProductSearchQueryResponse {
  products: {
    nodes: ProductSearchCard[];
    pageInfo: PageInfo;
  };
}

export interface CollectionsQueryResponse {
  collections: {
    nodes: CollectionCard[];
  };
  shop: Shop;
}

export interface AllCollectionsQueryResponse {
  collections: {
    nodes: CollectionCard[];
  };
}

export interface FeaturedProductsQueryResponse {
  products: {
    nodes: ProductCard[];
  };
}

export interface ProductByHandleQueryResponse {
  product: Product;
}

export interface CollectionByHandleQueryResponse {
  collection: Collection;
}

export interface CartQueryResponse {
  cart: Cart;
}

// ============================================================================
// MUTATION RESPONSE TYPES
// ============================================================================

export interface CartMutationResponse {
  cart?: {
    id: string;
    totalQuantity?: number;
    note?: string;
    buyerIdentity?: Cart['buyerIdentity'];
    discountCodes?: Array<{
      code: string;
    }>;
  };
  userErrors: Array<{
    field: string[];
    message: string;
  }>;
}

export interface CartCreateMutationResponse {
  cartCreate: CartMutationResponse;
}

export interface CartLinesAddMutationResponse {
  cartLinesAdd: CartMutationResponse;
}

export interface CartLinesUpdateMutationResponse {
  cartLinesUpdate: CartMutationResponse;
}

export interface CartLinesRemoveMutationResponse {
  cartLinesRemove: CartMutationResponse;
}

export interface CartNoteUpdateMutationResponse {
  cartNoteUpdate: CartMutationResponse;
}

export interface CartBuyerIdentityUpdateMutationResponse {
  cartBuyerIdentityUpdate: CartMutationResponse;
}

export interface CartSelectedDeliveryOptionsUpdateMutationResponse {
  cartSelectedDeliveryOptionsUpdate: CartMutationResponse;
}

export interface CartDiscountCodesUpdateMutationResponse {
  cartDiscountCodesUpdate: CartMutationResponse;
}
