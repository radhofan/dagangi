import { create } from 'zustand';
import { CartItem } from '@/types/sale';
import { Product } from '@/types/product';
import { priceForQty } from '@/services/product.service';

type CartState = {
  items: CartItem[];
  discount: number;
  addProduct: (product: Product) => void;
  setQty: (productId: string, qty: number) => void;
  overridePrice: (productId: string, price: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setDiscount: (discount: number) => void;
};

function toCartItem(product: Product, qty: number, manualPrice?: number): CartItem {
  const price = manualPrice ? { unit_price: manualPrice, price_type: 'MANUAL' as const } : priceForQty(product, qty);
  return {
    product_id: product.id,
    product_name: product.name,
    qty,
    unit: product.unit,
    unit_price: price.unit_price,
    cost_price_snapshot: product.cost_price,
    stock_qty: product.stock_qty,
    retail_price: product.retail_price,
    wholesale_price: product.wholesale_price,
    wholesale_min_qty: product.wholesale_min_qty,
    subtotal: price.unit_price * qty,
    price_type: price.price_type,
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  addProduct(product) {
    const found = get().items.find((item) => item.product_id === product.id);
    if (found) {
      get().setQty(product.id, found.qty + 1);
      return;
    }
    set((state) => ({ items: [...state.items, toCartItem(product, 1)] }));
  },
  setQty(productId, qty) {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.product_id !== productId) return item;
        if (item.price_type === 'MANUAL') {
          return { ...item, qty, subtotal: item.unit_price * qty };
        }
        const useWholesale = item.wholesale_price && item.wholesale_min_qty && qty >= item.wholesale_min_qty;
        const unitPrice = useWholesale ? item.wholesale_price! : item.retail_price;
        return {
          ...item,
          qty,
          unit_price: unitPrice,
          subtotal: unitPrice * qty,
          price_type: useWholesale ? 'WHOLESALE' : 'RETAIL',
        };
      }),
    }));
  },
  overridePrice(productId, price) {
    set((state) => ({
      items: state.items.map((item) =>
        item.product_id === productId
          ? { ...item, unit_price: price, subtotal: price * item.qty, price_type: 'MANUAL' }
          : item,
      ),
    }));
  },
  remove(productId) {
    set((state) => ({ items: state.items.filter((item) => item.product_id !== productId) }));
  },
  clear() {
    set({ items: [], discount: 0 });
  },
  setDiscount(discount) {
    set({ discount: Math.max(0, discount) });
  },
}));
