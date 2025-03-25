import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

interface User {
  _id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  location: {
    district: string;
    city: string;
  };
  address?: string;
}

interface Order {
  user_id: string;
  total: number;
  address: string;
  products: {
    product_id: string;
    name: string;
    quantity: number;
  }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: object) => Promise<void>;
  placeOrder: (order: Order) => Promise<void>;
  logout: () => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        set({ token: storedToken, user: JSON.parse(storedUser) });
        console.log('🔄 Authentification restaurée depuis AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données d\'auth:', error);
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return {
    user: null,
    token: null,
    error: null,
    loading: false,

    loadStoredAuth,

    login: async (email, password) => {
      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error('Erreur de connexion');

        const data = await response.json();
        set({ token: data.token, user: data.user, error: null });
        
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
        console.log('✅ Token stocké de manière persistante');
      } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        set({ error: 'Erreur de connexion' });
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

        if (!response.ok) throw new Error('Échec de l\'inscription');

        const data = await response.json();
        set({ user: data.user, token: data.token, error: null });
        
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        set({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
      } finally {
        set({ loading: false });
      }
    },

    placeOrder: async (order) => {
      const state = useAuthStore.getState();
      if (!state.token) {
        set({ error: 'Veuillez vous connecter avant de commander.' });
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
          body: JSON.stringify(order),
        });

        if (!response.ok) throw new Error('Erreur lors du traitement de la commande.');
      } catch (error) {
        console.error('Erreur lors de la commande:', error);
        set({ error: 'Erreur lors de la commande.' });
      }
    },

    logout: async () => {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      set({ token: null, user: null });
      console.log('🚪 Déconnexion réussie, données effacées');
    },
  };
});
