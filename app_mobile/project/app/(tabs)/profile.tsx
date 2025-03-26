import { View, Text, StyleSheet, Pressable, Image, ScrollView, Modal, Button } from 'react-native';
import { Settings, ShoppingBag, Heart, CreditCard, Bell, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
  {
    icon: ShoppingBag,
    title: 'Mes commandes',
    subtitle: 'Voir l\'historique des commandes',
    route: '/orders'
  },
  // autres items du menu...
];

export default function ProfileScreen() {
  const { user, logout, loading } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]); // pour stocker les commandes
  const [modalVisible, setModalVisible] = useState(false); // contrôle l'affichage du modal
  const [error, setError] = useState(null); // pour gérer les erreurs

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || loading) return;
    if (user) {
      fetchUserData();
      fetchUserOrders(); // récupération des commandes de l'utilisateur
    } else {
      router.replace('/login');
    }
  }, [user, isMounted, loading]);

  const fetchUserData = async () => {
    const storedToken = await AsyncStorage.getItem('authToken');
    if (!storedToken) return;
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des données utilisateur');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      setError('Erreur lors de la récupération des données utilisateur.');
      console.error(error);
    }
  };

  const fetchUserOrders = async () => {
    const storedToken = await AsyncStorage.getItem('authToken');
    if (!storedToken) return;
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des commandes');
      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (error) {
      setError('Erreur lors de la récupération des commandes.');
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const toggleModal = () => setModalVisible(!modalVisible); // fonction pour ouvrir/fermer le modal

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleString(); // vérifie la validité de la date
  };

  if (loading) {
    return <Text>Chargement...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: userData?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{userData?.full_name || 'Nom non disponible'}</Text>
            <Text style={styles.email}>{userData?.email || 'Email non disponible'}</Text>
            <Text style={styles.location}>{userData?.city || 'Ville non disponible'}</Text>
          </View>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.route === '/orders') {
                toggleModal(); // ouvre le modal pour afficher les commandes
              } else {
                router.push(item.route);
              }
            }}
          >
            <View style={styles.menuItemIcon}>
              <item.icon size={24} color="#1F2937" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={24} color="#FF4B55" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>

      {/* Modal pour afficher les commandes */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mes commandes</Text>
            {orders.length === 0 ? (
              <Text style={styles.noOrdersText}>Vous n'avez aucune commande.</Text>
            ) : (
              orders.map((order) => (
                <View key={order.orderId} style={styles.orderItem}>
                  <Text style={styles.orderText}>Commande {order.orderId}</Text>
                  <Text style={styles.orderText}>Total: {order.total} FCFA</Text>
                  <Text style={styles.orderText}>Statut: {order.status}</Text>
                  <Text style={styles.orderText}>Date: {formatDate(order.createdAt)}</Text>
                  <Text style={styles.orderText}>Produits:</Text>
                  {order.products && order.products.length > 0 ? (
                    order.products.map((product, index) => (
                      <Text key={index} style={styles.orderText}>- {product.productName}</Text>
                    ))
                  ) : (
                    <Text style={styles.orderText}>Aucun produit disponible</Text>
                  )}
                </View>
              ))
            )}
            <Button title="Fermer" onPress={toggleModal} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  profileInfo: { flex: 1 },
  name: { fontFamily: 'Poppins-Bold', fontSize: 24, color: '#1F2937' },
  email: { fontFamily: 'Poppins-Regular', fontSize: 16, color: '#6B7280', marginTop: 4 },
  location: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#6B7280', marginTop: 4 },
  menuSection: { backgroundColor: '#FFFFFF', marginTop: 24, borderRadius: 16, marginHorizontal: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  menuItemIcon: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuItemContent: { flex: 1 },
  menuItemTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#1F2937' },
  menuItemSubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#6B7280', marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', marginHorizontal: 24, marginTop: 24, marginBottom: 32, padding: 16, borderRadius: 12, gap: 8 },
  logoutText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#FF4B55' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12, width: '80%' },
  modalTitle: { fontFamily: 'Poppins-Bold', fontSize: 20, marginBottom: 16 },
  orderItem: { marginBottom: 12 },
  orderText: { fontFamily: 'Poppins-Regular', fontSize: 16, color: '#1F2937' },
  noOrdersText: { fontFamily: 'Poppins-Regular', fontSize: 16, color: '#6B7280' },
  errorText: { fontFamily: 'Poppins-Regular', fontSize: 16, color: '#FF4B55', textAlign: 'center', marginTop: 10 },
});
