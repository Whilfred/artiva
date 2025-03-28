import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  location: {
    district: string;
    city: string;
  };
  address?: string;
  token?: string;
}

interface Product {
  product_id: string;
  name: string;
  quantity: number;
}

interface Order {
  _id: string;
  user_id: string;
  total: number;
  address: string;
  products: Product[];
  createdAt: string;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
  orders: Order[];
  login: (email: string, password: string) => Promise<void>;
  register: (userData: object) => Promise<void>;
  placeOrder: (order: Order) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  loadUserOrders: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  error: null,
  loading: false,
  orders: [],

  loadStoredAuth: async () => {
    set({ loading: true });
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');

      if (storedToken && storedUser) {
        set({ token: storedToken, user: JSON.parse(storedUser), loading: false });
      } else {
        set({ loading: false, error: 'Aucune donnée d’authentification trouvée' });
      }
    } catch (error) {
      set({ error: 'Erreur lors du chargement des données d’authentification', loading: false });
    }
  },

  loadUserOrders: async () => {
    const { token, user } = get();
    if (!token || !user) {
      set({ error: 'Utilisateur non authentifié' });
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${user._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des commandes');
      const data = await response.json();
      set({ orders: data.orders, error: null });
    } catch (error) {
      set({ error: 'Erreur lors de la récupération des commandes' });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Erreur de connexion');
      const data = await response.json();
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, error: null, loading: false });
    } catch (error) {
      set({ error: 'Erreur de connexion', loading: false });
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Échec de l’inscription');
      const data = await response.json();
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, error: null, loading: false });
    } catch (error) {
      set({ error: 'Erreur lors de l’inscription', loading: false });
    }
  },

  placeOrder: async (order) => {
    const { token, user } = get();
    if (!token || !user) {
      set({ error: 'Veuillez vous connecter avant de commander.' });
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...order, user_id: user._id }),
      });
      if (!response.ok) throw new Error('Erreur lors de la commande');
      await get().loadUserOrders();
    } catch (error) {
      set({ error: 'Erreur lors de la commande' });
    }
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    set({ user: null, token: null, orders: [], error: null });
  },
}));
