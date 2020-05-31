/* eslint-disable consistent-return */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarket:products');

      if (data) {
        setProducts([...JSON.parse(data)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newProduct = products.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      setProducts(newProduct);

      await AsyncStorage.setItem('products', JSON.stringify(newProduct));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProduct = products.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      setProducts(newProduct);

      await AsyncStorage.setItem('products', JSON.stringify(newProduct));
    },
    [products],
  );
  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const findProduct = products.find(p => p.id === product.id);

      if (findProduct) {
        return increment(product.id);
      }

      setProducts([...products, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
