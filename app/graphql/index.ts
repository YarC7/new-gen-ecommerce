// GraphQL Index - Export all queries, mutations, and types
// This provides a clean API for importing GraphQL operations

// ============================================================================
// QUERIES
// ============================================================================

// Home Page Queries
export {ALL_COLLECTIONS_QUERY, FEATURED_PRODUCTS_QUERY, ALL_PRODUCTS_QUERY} from './queries';

// Search Queries
export {PRODUCTS_SEARCH_QUERY, COLLECTIONS_FOR_SEARCH_QUERY} from './queries';

// Products Queries
export {PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY} from './queries';

// Collections Queries
export {COLLECTIONS_QUERY, COLLECTION_BY_HANDLE_QUERY} from './queries';

// Cart Queries
export {CART_QUERY} from './queries';

// ============================================================================
// MUTATIONS
// ============================================================================

export {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_NOTE_UPDATE_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_SELECTED_DELIVERY_OPTIONS_UPDATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
} from './queries';

// ============================================================================
// FRAGMENTS
// ============================================================================

export {
  PRODUCT_CARD_FRAGMENT,
  PRODUCT_SEARCH_CARD_FRAGMENT,
  COLLECTION_CARD_FRAGMENT,
} from './queries';

// ============================================================================
// TYPES
// ============================================================================

// Common Types
export type {Money, Image, ProductVariant, PageInfo} from './types';

// Product Types
export type {ProductCard, ProductSearchCard, Product} from './types';

// Collection Types
export type {CollectionCard, Collection} from './types';

// Cart Types
export type {CartLine, Cart} from './types';

// Shop Types
export type {Shop} from './types';

// Query Response Types
export type {
  ProductsQueryResponse,
  ProductSearchQueryResponse,
  CollectionsQueryResponse,
  AllCollectionsQueryResponse,
  FeaturedProductsQueryResponse,
  ProductByHandleQueryResponse,
  CollectionByHandleQueryResponse,
  CartQueryResponse,
} from './types';

// Mutation Response Types
export type {
  CartMutationResponse,
  CartCreateMutationResponse,
  CartLinesAddMutationResponse,
  CartLinesUpdateMutationResponse,
  CartLinesRemoveMutationResponse,
  CartNoteUpdateMutationResponse,
  CartBuyerIdentityUpdateMutationResponse,
  CartSelectedDeliveryOptionsUpdateMutationResponse,
  CartDiscountCodesUpdateMutationResponse,
} from './types';
