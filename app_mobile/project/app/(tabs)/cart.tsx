import { View, Text, ScrollView, Image, StyleSheet, Pressable } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!token) {
        console.log('Utilisateur non authentifié, redirection vers la page de connexion');
        router.push('/login');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [token, router]);

  const handleCheckout = async () => {
    if (!user || !items.length) {
      console.error('Erreur: Aucun utilisateur ou panier vide');
      return;
    }

    const orderData = {
      order: {
        user_id: user.id, // Utilisation correcte de user.id
        total: total(), // Calculer le total
        address: user.address || 'Adresse de livraison', // Adresse par défaut si non définie
        products: items.map((item) => {
          return {
            product_id: item.id,
            quantity: item.quantity,
            name: item.name,
            price: item.price,  // Assurez-vous que `price` existe
          };
        }),
      },
    };

    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Réponse du serveur:', data); // Log de la réponse du serveur
        useCartStore.getState().clearCart();
        router.push('/');
      } else {
        const errorResponse = await response.json();
        console.error('Erreur lors de la commande:', errorResponse);
      }
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Votre panier est vide</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panier</Text>
        <Text style={styles.subtitle}>{items.length} articles</Text>
      </View>

      <ScrollView style={styles.itemsContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price} FCFA</Text>
              <View style={styles.quantityContainer}>
                <Pressable
                  onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  style={styles.quantityButton}
                >
                  <Minus size={20} color="#1F2937" />
                </Pressable>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  style={styles.quantityButton}
                >
                  <Plus size={20} color="#1F2937" />
                </Pressable>
              </View>
            </View>
            <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
              <Trash2 size={24} color="#FF4B55" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{total()} FCFA</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Commander</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#1F2937',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#6B7280',
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  itemPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FF4B55',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1F2937',
    marginHorizontal: 16,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#1F2937',
  },
  totalAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#FF4B55',
  },
  checkoutButton: {
    backgroundColor: '#FF4B55',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
