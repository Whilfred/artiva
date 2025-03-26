import { Tabs } from 'expo-router';
import { Chrome as Home, ShoppingBag, Heart, User } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import { useAuthStore } from '../../store/auth'; // Import your authentication store

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user } = useAuthStore(); // Get the user state from your auth store

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
          marginTop: 4,
        },
        tabBarActiveTintColor: '#FF4B55',
        tabBarInactiveTintColor: '#9CA3AF',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Boutique',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Tendances',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name={user ? "profile" : "login"} // Conditionally set the name based on authentication
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
