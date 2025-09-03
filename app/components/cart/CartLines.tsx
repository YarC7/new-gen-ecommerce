import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartLineItem} from './CartLineItem';
import type {CartLayout} from './CartMain';

export function CartLines({
  lines,
  layout,
}: {
  lines: CartApiQueryFragment['lines']['nodes'];
  layout: CartLayout;
}) {
  if (!lines.length) return null;

  return (
    <div aria-labelledby="cart-lines">
      {layout === 'page' && (
        <div className="hidden md:grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase">
          <div className="col-span-6">Product</div>
          <div className="col-span-3 text-center">Quantity</div>
          <div className="col-span-3 text-right">Total</div>
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {lines.map((line) => (
          <CartLineItem key={line.id} line={line as any} layout={layout} />
        ))}
      </div>
    </div>
  );
}
