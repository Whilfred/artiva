import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { Settings, ShoppingBag, Heart, CreditCard, Bell, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

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
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);  // Ajout d'un état de chargement
  const [isMounted, setIsMounted] = useState(false);  // Assurer que le composant est monté

  useEffect(() => {
    setIsMounted(true); // Marquer que le composant est monté
    return () => setIsMounted(false); // Nettoyer lors du démontage du composant
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Attendre que le composant soit monté

    if (user) {
      setLoading(false);  // Une fois l'utilisateur validé, on met fin au chargement
    } else {
      router.replace('/login');  // Redirection vers la page de login si pas d'utilisateur
    }
  }, [user, isMounted]);  // Le `useEffect` se déclenche dès que `user` change et quand le composant est monté

  if (loading) {
    return null;  // Renvoyer null ou un écran de chargement pendant que l'on attend la vérification de l'utilisateur
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.location}>
              {user.location ? `${user.location.district}, ${user.location.city}` : 'Localisation non disponible'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Pressable 
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
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
});
