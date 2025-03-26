import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { Settings, ShoppingBag, Heart, CreditCard, Bell, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assurez-vous d'importer AsyncStorage

const menuItems = [
  {
    icon: ShoppingBag,
    title: 'Mes commandes',
    subtitle: 'Voir l\'historique des commandes',
    route: '/orders'
  },
  {
    icon: Heart,
    title: 'Liste de souhaits',
    subtitle: '12 produits enregistrés',
    route: '/favorites'
  },
  {
    icon: CreditCard,
    title: 'Paiement',
    subtitle: 'Gérer les moyens de paiement',
    route: '/payment'
  },
  {
    icon: Bell,
    title: 'Notifications',
    subtitle: 'Gérer les préférences',
    route: '/notifications'
  },
  {
    icon: Settings,
    title: 'Paramètres',
    subtitle: 'Modifier le profil',
    route: '/settings'
  },
];

export default function ProfileScreen() {
  const { user, logout, loading } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || loading) return;
    if (user) {
      console.log('Token utilisateur:', user?.token); // Log du token pour vérification
      fetchUserData();
    } else {
      console.log('Utilisateur non connecté, redirection vers login');
      router.replace('/login');
    }
  }, [user, isMounted, loading]);

  const fetchUserData = async () => {
    const storedToken = await AsyncStorage.getItem('authToken');
    
    if (!storedToken) {
      console.error('❌ Token manquant !');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });
  
      if (!response.ok) throw new Error('Erreur lors de la récupération des données utilisateur');
      const data = await response.json();
      console.log('Données utilisateur récupérées:', data);
      setUserData(data); // Mettez à jour l'état avec les données reçues
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
  };

  const handleLogout = () => {
    console.log('Déconnexion en cours...');
    logout();
    router.replace('/login');
  };

  if (loading) {
    console.log('Chargement en cours...');
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
            <Text style={styles.location}>
              {userData?.city || 'Ville non disponible'}
            </Text>
            {/* Le district n'existe pas dans les données retournées par le backend */}
            {/* <Text style={styles.location}>
              {userData?.district || 'District non disponible'}
            </Text> */}
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Pressable 
            key={index}
            style={styles.menuItem}
            onPress={() => {
              console.log(`Naviguer vers: ${item.route}`);
              router.push(item.route);
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

      {/* Cette section montre les données utilisateur récupérées */}
      <View style={styles.userData}>
        <Text style={styles.dataText}>Données utilisateur reçues:</Text>
        <Text style={styles.dataText}>Nom: {userData?.full_name}</Text>
        <Text style={styles.dataText}>Email: {userData?.email}</Text>
        <Text style={styles.dataText}>Ville: {userData?.city}</Text>
      </View>
    </ScrollView>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1F2937',
  },
  email: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  location: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    borderRadius: 16,
    marginHorizontal: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  menuItemSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FF4B55',
  },
  userData: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  dataText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
});
