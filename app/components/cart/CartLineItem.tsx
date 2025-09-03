import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from '~/components/ProductPrice';
import {useCartUI} from './CartUIProvider';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {memo} from 'react';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
function CartLineItemComponent({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

  const {closeCart} = useCartUI();

  if (layout === 'page') {
    return (
      <div
        key={id}
        className="grid grid-cols-12 gap-4 items-center py-6"
      >
        {/* Product Info */}
        <div className="col-span-6 flex items-center space-x-4">
          {image && (
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                alt={title}
                aspectRatio="1/1"
                data={image}
                loading="lazy"
                className="object-cover rounded"
              />
            </div>
          )}
          <div>
            <Link
              prefetch="intent"
              to={lineItemUrl}
              className="text-lg font-semibold text-gray-900 hover:underline"
            >
              {product.title}
            </Link>
            <div className="text-sm text-gray-600 mt-1">
              {title}
            </div>
            {selectedOptions.length > 0 && (
              <div className="text-sm text-gray-500 mt-2">
                {selectedOptions.map((option) => (
                  <span key={option.name}>
                    {option.name}: {option.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-3 flex justify-center">
          <CartLineQuantity line={line} />
        </div>

        {/* Total */}
        <div className="col-span-3 text-right">
          <ProductPrice price={line?.cost?.totalAmount} />
        </div>
      </div>
    );
  }

  // Keep original layout for 'aside'
  return (
    <div
      key={id}
      className="flex items-center space-x-4 py-4"
    >
      {image && (
        <div className="w-24 h-24 flex-shrink-0">
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            loading="lazy"
            className="object-cover rounded"
          />
        </div>
      )}
      <div className="flex-1">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={closeCart}
          className="text-base font-semibold text-gray-900 hover:underline"
        >
          {product.title}
        </Link>
        <div className="text-sm text-gray-600 mt-1">
          {title}
        </div>
        <div className="mt-2">
          <ProductPrice price={line?.cost?.totalAmount} />
        </div>
        <div className="mt-3">
          <CartLineQuantity line={line} />
        </div>
      </div>
    </div>
  );
}

function areCartLineItemPropsEqual(
  prev: {layout: CartLayout; line: CartLine},
  next: {layout: CartLayout; line: CartLine},
) {
  if (prev.layout !== next.layout) return false;
  if (prev.line.id !== next.line.id) return false;
  if (prev.line.quantity !== next.line.quantity) return false;
  if (!!prev.line.isOptimistic !== !!next.line.isOptimistic) return false;
  return true;
}

export const CartLineItem = memo(
  CartLineItemComponent,
  areCartLineItemPropsEqual,
);

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-gray-300 rounded">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50"
          >
            &#8722;
          </button>
        </CartLineUpdateButton>

        <span className="text-center w-10 font-semibold border-l border-r border-gray-300">{quantity}</span>

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50"
          >
            &#43;
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  ); 
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
        title="Remove item from cart"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.88 19h4.24a2.75 2.75 0 002.73-2.579l.842-10.518.148.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75a1.25 1.25 0 00-1.25-1.25h-2.5A1.25 1.25 0 007.5 3.75v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
