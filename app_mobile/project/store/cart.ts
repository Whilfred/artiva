import { create } from 'zustand';

// Types pour les articles du panier
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Types de l'état du panier
interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

// Store Zustand pour le panier
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // Ajouter un article au panier
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        // Si l'article existe déjà, on met à jour sa quantité
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      // Sinon, ajouter l'article avec une quantité de 1
      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    });
  },

  // Supprimer un article du panier
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  // Mettre à jour la quantité d'un article
  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },

  // Vider complètement le panier
  clearCart: () => {
    set({ items: [] });
  },

  // Calcul du total
  total: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
