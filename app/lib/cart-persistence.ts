/**
 * Cart Persistence Utilities
 * Handles cart ID storage and recovery for better user experience
 */

export interface CartPersistenceData {
  cartId: string;
  lastUpdated: number;
  totalQuantity: number;
}

export class CartPersistence {
  private static readonly CART_STORAGE_KEY = 'hydrogen-cart-data';
  private static readonly CART_EXPIRY_DAYS = 30; // Cart expires after 30 days

  /**
   * Save cart data to localStorage
   */
  static saveCartData(cartId: string, totalQuantity: number): void {
    if (typeof window === 'undefined') return;

    const cartData: CartPersistenceData = {
      cartId,
      lastUpdated: Date.now(),
      totalQuantity,
    };

    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.warn('Failed to save cart data to localStorage:', error);
    }
  }

  /**
   * Get cart data from localStorage
   */
  static getCartData(): CartPersistenceData | null {
    if (typeof window === 'undefined') return null;

    try {
      const cartDataString = localStorage.getItem(this.CART_STORAGE_KEY);
      if (!cartDataString) return null;

      const cartData: CartPersistenceData = JSON.parse(cartDataString);
      
      // Check if cart data is expired
      const daysSinceUpdate = (Date.now() - cartData.lastUpdated) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > this.CART_EXPIRY_DAYS) {
        this.clearCartData();
        return null;
      }

      return cartData;
    } catch (error) {
      console.warn('Failed to get cart data from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear cart data from localStorage
   */
  static clearCartData(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.CART_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear cart data from localStorage:', error);
    }
  }

  /**
   * Update cart data when cart changes
   */
  static updateCartData(cartId: string, totalQuantity: number): void {
    this.saveCartData(cartId, totalQuantity);
  }

  /**
   * Check if cart data exists and is valid
   */
  static hasValidCartData(): boolean {
    const cartData = this.getCartData();
    return cartData !== null && cartData.cartId && cartData.totalQuantity > 0;
  }

  /**
   * Get cart ID for recovery
   */
  static getCartId(): string | null {
    const cartData = this.getCartData();
    return cartData?.cartId || null;
  }
}

/**
 * Cart Recovery Hook for React components
 */
export function useCartRecovery() {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveredCartId, setRecoveredCartId] = useState<string | null>(null);

  const recoverCart = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const cartData = CartPersistence.getCartData();
    if (cartData?.cartId) {
      setIsRecovering(true);
      setRecoveredCartId(cartData.cartId);
      
      // You can add additional recovery logic here
      // For example, validate cart with Shopify API
      
      setIsRecovering(false);
    }
  }, []);

  return {
    isRecovering,
    recoveredCartId,
    recoverCart,
    hasCartData: CartPersistence.hasValidCartData(),
  };
}

import {useState, useCallback} from 'react';
