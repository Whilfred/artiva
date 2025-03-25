import { create } from 'zustand';

interface User {
  _id: number; // Utilisation de _id au lieu de id
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  location: {
    district: string;
    city: string;
  };
  address?: string; // Ajout de la propriété address
}

interface Order {
  user_id: string; // Remplacer user_id par _id
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
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    district: string;
    city: string;
  }) => Promise<void>;
  placeOrder: (order: Order) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  error: null,
  loading: false, // Ajout de l'état loading

  login: async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Erreur de connexion');

      const data = await response.json();
      console.log("🔑 Token reçu après connexion:", data.token);

      set({ token: data.token, user: data.user });

      // Vérifier que le token est bien stocké
      console.log("✅ Token stocké:", useAuthStore.getState().token);
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      set({ error: 'Erreur de connexion' });
    }
  },

  register: async (userData) => {
    set({ loading: true }); // Mettre à jour loading à true avant la requête

    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Erreur d\'inscription:', errorText);
        throw new Error(errorText || 'Échec de l\'inscription');
      }

      const data = await response.json();
      console.log('Réponse du serveur après inscription:', data);

      if (data && data.user && data.token) {
        set({ user: data.user, token: data.token, error: null });
      } else {
        throw new Error('Données utilisateur ou token manquants');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      set({ error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' });
    } finally {
      set({ loading: false }); // Mettre à jour loading à false après la requête
    }
  },

  // placeOrder: async (order: Order) => {
  //   const state = useAuthStore.getState();
  //   console.log("🛍️ Envoi de la commande avec token:", state.token || "Aucun token");

  //   if (!state.token) {
  //     console.error("🚨 Alerte: Aucun token trouvé, l'utilisateur est déconnecté !");
  //     set({ error: 'Veuillez vous connecter avant de passer une commande.' });
  //     return;
  //   }

  //   try {
  //     const response = await fetch("http://localhost:3000/api/orders", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${state.token}`,
  //       },
  //       body: JSON.stringify(order),
  //     });

  //     console.log("📨 Réponse commande:", response.status);

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error("Erreur lors de la commande:", errorText);
  //       set({ error: 'Erreur lors du traitement de la commande.' });
  //     } else {
  //       const data = await response.json();
  //       console.log("✅ Commande créée avec succès:", data);
  //       // Vous pouvez ajouter un message de succès ou effectuer d'autres actions ici.
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la commande:", error);
  //     set({ error: 'Erreur lors de la commande.' });
  //   }
  // },

  placeOrder: async (order: Order) => {
    const state = useAuthStore.getState();
    console.log("🛍️ Envoi de la commande avec token:", state.token || "Aucun token");
  
    if (!state.token) {
      console.error("🚨 Alerte: Aucun token trouvé, l'utilisateur est déconnecté !");
      set({ error: 'Veuillez vous connecter avant de passer une commande.' });
      return;
    }
  
    try {
      // Vérifier que tous les produits sont valides
      for (const product of order.products) {
        const response = await fetch(`http://localhost:3000/api/products/${product.product_id}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Produit avec id ${product.product_id} introuvable. Erreur: ${errorText}`);
          set({ error: `Produit avec ID ${product.product_id} introuvable.` });
          return;
        }
      }
  
      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(order),
      });
  
      console.log("📨 Réponse commande:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur lors de la commande:", errorText);
        set({ error: 'Erreur lors du traitement de la commande.' });
      } else {
        const data = await response.json();
        console.log("✅ Commande créée avec succès:", data);
        // Vous pouvez ajouter un message de succès ou effectuer d'autres actions ici.
      }
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      set({ error: 'Erreur lors de la commande.' });
    }
  },
    
  logout: () => {
    console.log("🚪 Déconnexion de l'utilisateur");
    set({ token: null, user: null });
  },
}));
