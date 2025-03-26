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
  createdAt: string; // Date de la commande
  status: string; // Statut de la commande
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
  orders: Order[]; // Liste des commandes
  login: (email: string, password: string) => Promise<void>;
  register: (userData: object) => Promise<void>;
  placeOrder: (order: Order) => Promise<void>;
  logout: () => void;
  loadStoredAuth: () => Promise<void>;
  loadUserOrders: () => Promise<void>; // Nouvelle fonction pour charger les commandes de l'utilisateur
}

export const useAuthStore = create<AuthState>((set) => {
  const loadStoredAuth = async () => {
    set({ loading: true });
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');
  
      if (storedToken && storedUser) {
        console.log('🔄 Authentification restaurée depuis AsyncStorage');
        set({ token: storedToken, user: JSON.parse(storedUser), loading: false });
      } else {
        console.log('🛑 Aucune donnée trouvée dans AsyncStorage, tentative de récupération depuis le backend');
        if (!storedToken) {
          console.error('❌ Token manquant');
          set({ loading: false, error: 'Token manquant' });
          return;
        }
  
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        };
  
        const response = await fetch('http://localhost:3000/api/user', {
          method: 'GET',
          headers,
        });
  
        if (!response.ok) {
          throw new Error('Échec de la récupération des données depuis le backend');
        }
  
        const data = await response.json();
        console.log('✅ Données récupérées depuis le backend:', data);
  
        await AsyncStorage.setItem('authToken', storedToken);
        await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
  
        set({ token: storedToken, user: data.user, loading: false });
      }
    } catch (error: unknown) {
      console.error('❌ Erreur lors du chargement des données d\'auth:', error);
      if (error instanceof Error) {
        set({ error: error.message || 'Erreur inconnue', loading: false });
      } else {
        set({ error: 'Erreur inconnue', loading: false });
      }
    }
  };

  const loadUserOrders = async () => {
    const state = useAuthStore.getState();
    if (!state.token || !state.user) {
      set({ error: 'Utilisateur non authentifié' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/orders/${state.user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des commandes');

      const data = await response.json();
      console.log('✅ Commandes récupérées:', data);

      set({ orders: data.orders, error: null });
    } catch (error: unknown) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      if (error instanceof Error) {
        set({ error: error.message });
      } else {
        set({ error: 'Erreur inconnue' });
      }
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
    orders: [], // Initialisation de la liste des commandes

    loadStoredAuth,
    loadUserOrders, // Ajouter la fonction pour charger les commandes

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
      } catch (error: unknown) {
        console.error('❌ Erreur de connexion:', error);
        if (error instanceof Error) {
          set({ error: error.message });
        } else {
          set({ error: 'Erreur inconnue' });
        }
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
      } catch (error: unknown) {
        console.error('Erreur lors de l\'inscription:', error);
        if (error instanceof Error) {
          set({ error: error.message });
        } else {
          set({ error: 'Erreur inconnue' });
        }
      } finally {
        set({ loading: false });
      }
    },

    placeOrder: async (order) => {
      const state = useAuthStore.getState();
      if (!state.token || !state.user) {
        set({ error: 'Veuillez vous connecter avant de commander.' });
        return;
      }

      // Construire la commande avec les détails du produit
      const orderDetails = {
        ...order,
        user_id: state.user._id, // Assurez-vous que l'id de l'utilisateur est inclus dans la commande
        total: order.products.reduce((sum, product) => sum + product.quantity * 10, 0), // Exemple de calcul de total
      };

      try {
        const response = await fetch('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`,
          },
          body: JSON.stringify(orderDetails),
        });

        if (!response.ok) throw new Error('Erreur lors de la commande');

        const data = await response.json();
        console.log('Commande passée avec succès:', data);

        // Mettre à jour les commandes de l'utilisateur après la commande
        loadUserOrders();
      } catch (error: unknown) {
        console.error('Erreur lors de la commande:', error);
        if (error instanceof Error) {
          set({ error: error.message });
        } else {
          set({ error: 'Erreur inconnue' });
        }
      }
    },

    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userToken');
      set({ user: null, token: null });
      console.log('Déconnexion réussie');

      // Optionnel: Redirection vers la page de login
      window.location.href = '/login'; // Assurez-vous que cette ligne fonctionne dans votre environnement
    }
  };
});
