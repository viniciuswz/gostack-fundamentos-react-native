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
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      // await AsyncStorage.setItem('@GoMarketPlace:cart', JSON.stringify([]));
      const items = await AsyncStorage.getItem('@GoMarketPlace:cart');
      if (items != null) {
        setProducts([...JSON.parse(items)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(productCart => {
        return productCart.id === product.id;
      });

      if (productIndex >= 0) {
        const productsInCart = products;

        const searchedProduct = productsInCart[productIndex];
        const searchedProductQuantity = searchedProduct.quantity;
        productsInCart[productIndex].quantity = searchedProductQuantity + 1;
        setProducts([...productsInCart]);
      } else {
        const newProduct = product;
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);
      const productsInCart = products;

      const searchedProduct = productsInCart[productIndex];
      const searchedProductQuantity = searchedProduct.quantity;

      productsInCart[productIndex].quantity = searchedProductQuantity + 1;

      setProducts([...productsInCart]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(productsInCart),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      const productsInCart = products;

      const searchedProduct = productsInCart[productIndex];
      const searchedProductQuantity = searchedProduct.quantity;

      productsInCart[productIndex].quantity =
        searchedProductQuantity === 1 ? 1 : searchedProductQuantity - 1;

      setProducts([...productsInCart]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(productsInCart),
      );
    },
    [products],
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
