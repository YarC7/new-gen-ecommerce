// GraphQL Queries for the entire application
// Organized by feature for better maintainability

// ============================================================================
// FRAGMENTS
// ============================================================================

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 1) {
      nodes {
        id
        title
        availableForSale
      }
    }
  }
` as const;

export const PRODUCT_SEARCH_CARD_FRAGMENT = `#graphql
  fragment ProductSearchCard on Product {
    id
    title
    handle
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 1) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
    tags
    productType
    vendor
  }
` as const;

export const COLLECTION_CARD_FRAGMENT = `#graphql
  fragment CollectionCard on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
  }
` as const;

// ============================================================================
// HOME PAGE QUERIES
// ============================================================================

export const ALL_COLLECTIONS_QUERY = `#graphql
  ${COLLECTION_CARD_FRAGMENT}
  query AllCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20) {
      nodes {
        ...CollectionCard
      }
    }
  }
` as const;

export const FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query FeaturedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductCard
      }
    }
  }
` as const;

export const ALL_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query AllProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductCard
      }
    }
  }
` as const;

// ============================================================================
// SEARCH QUERIES
// ============================================================================

export const PRODUCTS_SEARCH_QUERY = `#graphql
  ${PRODUCT_SEARCH_CARD_FRAGMENT}
  query ProductSearch(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      query: $query,
      first: $first,
      after: $after,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...ProductSearchCard
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;

export const COLLECTIONS_FOR_SEARCH_QUERY = `#graphql
  query CollectionsForSearch($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 50) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
        }
      }
    }
  }
` as const;

// ============================================================================
// PRODUCTS QUERIES
// ============================================================================

export const PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Products($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductCard
      }
    }
    shop {
      name
      description
    }
  }
` as const;

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
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
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 250) {
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
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
        }
      }
      images(first: 20) {
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      seo {
        description
        title
      }
      tags
      updatedAt
    }
  }
` as const;

// ============================================================================
// COLLECTIONS QUERIES
// ============================================================================

export const COLLECTIONS_QUERY = `#graphql
  ${COLLECTION_CARD_FRAGMENT}
  query Collections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...CollectionCard
      }
    }
    shop {
      name
      description
    }
  }
` as const;

export const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      seo {
        description
        title
      }
      image {
        id
        url
        altText
        width
        height
      }
      products(first: 50) {
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
        nodes {
          id
          title
          publishedAt
          handle
          variants(first: 1) {
            nodes {
              id
              image {
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
            }
          }
        }
      }
    }
  }
` as const;

// ============================================================================
// CART QUERIES
// ============================================================================

export const CART_QUERY = `#graphql
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      buyerIdentity {
        countryCode
        customer {
          id
          email
          firstName
          lastName
          displayName
        }
        email
        phone
      }
      lines(first: 100) {
        id
        quantity
        attributes {
          key
          value
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          amountPerQuantity {
            amount
            currencyCode
          }
          compareAtAmountPerQuantity {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            availableForSale
            compareAtPrice {
              ...Money
            }
            image {
              ...Image
            }
            price {
              ...Money
            }
            product {
              handle
              title
            }
            selectedOptions {
              name
              value
            }
            title
            unitPrice {
              ...Money
            }
          }
        }
        sellingPlanAllocation {
          priceAdjustments {
            compareAtPrice {
              ...Money
            }
            perDeliveryPrice {
              ...Money
            }
            price {
              ...Money
            }
            unitPrice {
              ...Money
            }
          }
          sellingPlan {
            ... on SellingPlanRecurringDelivery {
              ...SellingPlanRecurringDelivery
            }
            ... on SellingPlanRecurringOrder {
              ...SellingPlanRecurringOrder
            }
            ... on SellingPlanOneTimeDelivery {
              ...SellingPlanOneTimeDelivery
            }
            ... on SellingPlanOneTimeOrder {
              ...SellingPlanOneTimeOrder
            }
          }
        }
      }
      cost {
        subtotalAmount {
          ...Money
        }
        totalAmount {
          ...Money
        }
        totalDutyAmount {
          ...Money
        }
        totalTaxAmount {
          ...Money
        }
      }
      note
      totalQuantity
    }
  }

  fragment Money on MoneyV2 {
    amount
    currencyCode
  }

  fragment Image on Image {
    id
    url
    altText
    width
    height
  }

  fragment SellingPlanRecurringDelivery on SellingPlanRecurringDelivery {
    id
    recurrence {
      ... on SellingPlanRecurringPeriod {
        ...SellingPlanRecurringPeriod
      }
    }
    deliveryPolicy {
      ... on SellingPlanRecurringDeliveryPolicy {
        ...SellingPlanRecurringDeliveryPolicy
      }
    }
  }

  fragment SellingPlanRecurringPeriod on SellingPlanRecurringPeriod {
    interval
    intervalCount
  }

  fragment SellingPlanRecurringDeliveryPolicy on SellingPlanRecurringDeliveryPolicy {
    ... on SellingPlanRecurringDeliveryPolicyFixed {
      ...SellingPlanRecurringDeliveryPolicyFixed
    }
    ... on SellingPlanRecurringDeliveryPolicyWeekday {
      ...SellingPlanRecurringDeliveryPolicyWeekday
    }
  }

  fragment SellingPlanRecurringDeliveryPolicyFixed on SellingPlanRecurringDeliveryPolicyFixed {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }

  fragment SellingPlanRecurringDeliveryPolicyWeekday on SellingPlanRecurringDeliveryPolicyWeekday {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }

  fragment SellingPlanRecurringOrder on SellingPlanRecurringOrder {
    id
    recurrence {
      ... on SellingPlanRecurringPeriod {
        ...SellingPlanRecurringPeriod
      }
    }
    billingPolicy {
      ... on SellingPlanRecurringBillingPolicy {
        ...SellingPlanRecurringBillingPolicy
      }
    }
    deliveryPolicy {
      ... on SellingPlanRecurringDeliveryPolicy {
        ...SellingPlanRecurringDeliveryPolicy
      }
    }
  }

  fragment SellingPlanRecurringBillingPolicy on SellingPlanRecurringBillingPolicy {
    ... on SellingPlanRecurringBillingPolicyFixed {
      ...SellingPlanRecurringBillingPolicyFixed
    }
    ... on SellingPlanRecurringBillingPolicyWeekday {
      ...SellingPlanRecurringBillingPolicyWeekday
    }
  }

  fragment SellingPlanRecurringBillingPolicyFixed on SellingPlanRecurringBillingPolicyFixed {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }

  fragment SellingPlanRecurringBillingPolicyWeekday on SellingPlanRecurringBillingPolicyWeekday {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }

  fragment SellingPlanOneTimeDelivery on SellingPlanOneTimeDelivery {
    id
    deliveryPolicy {
      ... on SellingPlanOneTimeDeliveryPolicy {
        ...SellingPlanOneTimeDeliveryPolicy
      }
    }
  }

  fragment SellingPlanOneTimeDeliveryPolicy on SellingPlanOneTimeDeliveryPolicy {
    ... on SellingPlanOneTimeDeliveryPolicyFixed {
      ...SellingPlanOneTimeDeliveryPolicyFixed
    }
    ... on SellingPlanOneTimeDeliveryPolicyWeekday {
      ...SellingPlanOneTimeDeliveryPolicyWeekday
    }
  }

  fragment SellingPlanOneTimeDeliveryPolicyFixed on SellingPlanOneTimeDeliveryPolicyFixed {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }

  fragment SellingPlanOneTimeDeliveryPolicyWeekday on SellingPlanOneTimeDeliveryPolicyWeekday {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }

  fragment SellingPlanOneTimeOrder on SellingPlanOneTimeOrder {
    id
    billingPolicy {
      ... on SellingPlanOneTimeBillingPolicy {
        ...SellingPlanOneTimeBillingPolicy
      }
    }
    deliveryPolicy {
      ... on SellingPlanOneTimeDeliveryPolicy {
        ...SellingPlanOneTimeDeliveryPolicy
      }
    }
  }

  fragment SellingPlanOneTimeBillingPolicy on SellingPlanOneTimeBillingPolicy {
    ... on SellingPlanOneTimeBillingPolicyFixed {
      ...SellingPlanOneTimeBillingPolicyFixed
    }
    ... on SellingPlanOneTimeBillingPolicyWeekday {
      ...SellingPlanOneTimeBillingPolicyWeekday
    }
  }

  fragment SellingPlanOneTimeBillingPolicyFixed on SellingPlanOneTimeBillingPolicyFixed {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }

  fragment SellingPlanOneTimeBillingPolicyWeekday on SellingPlanOneTimeBillingPolicyWeekday {
    metafields(namespace: $namespace, first: $first) {
      key
      value
    }
  }
` as const;

// ============================================================================
// CART MUTATIONS
// ============================================================================

export const CART_CREATE_MUTATION = `#graphql
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const CART_LINES_ADD_MUTATION = `#graphql
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const CART_NOTE_UPDATE_MUTATION = `#graphql
  mutation cartNoteUpdate($cartId: ID!, $note: String) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        id
        note
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `#graphql
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        buyerIdentity {
          countryCode
          customer {
            id
            email
            firstName
            lastName
            displayName
          }
          email
          phone
        }
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const CART_SELECTED_DELIVERY_OPTIONS_UPDATE_MUTATION = `#graphql
  mutation cartSelectedDeliveryOptionsUpdate($cartId: ID!, $deliveryOptionIds: [ID!]!) {
    cartSelectedDeliveryOptionsUpdate(cartId: $cartId, deliveryOptionIds: $deliveryOptionIds) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const CART_DISCOUNT_CODES_UPDATE_MUTATION = `#graphql
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
        discountCodes {
          code
        }
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
