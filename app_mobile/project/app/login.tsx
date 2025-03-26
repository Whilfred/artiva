import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/auth';
import { router } from 'expo-router';

type UserInfo = {
  email: string;
  password: string;
  user?: {
    name: string;
  };
  token?: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    console.log('Vérification du token...');
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log('Token trouvé:', storedToken);
        if (storedToken) {
          const storedUser = JSON.parse(await AsyncStorage.getItem('userInfo') || '{}');
          console.log('Utilisateur trouvé:', storedUser);
          useAuthStore.setState({ user: storedUser, token: storedToken });
          setUserInfo({ email: storedUser.email, password: '', user: storedUser, token: storedToken });
          router.push('/');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du token:', error);
      }
    };
    loadToken();
  }, []);

  const handleLogin = async () => {
    try {
      console.log('Tentative de connexion avec :', email, password);
      setUserInfo({ email, password, user: undefined, token: undefined });

      await login(email, password);

      setSuccessMessage('Connexion réussie !');
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;

      if (user && token) {
        setUserInfo({ email, password, user, token });
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        router.push('/');
      } else {
        setError('Connexion échouée. Veuillez réessayer.');
      }
    } catch (err) {
      console.log('Erreur lors de la connexion :', err);
      setError('Email ou mot de passe incorrect');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Déconnexion...');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      useAuthStore.setState({ user: null, token: null });
      setUserInfo(null);
      setSuccessMessage('Déconnexion réussie !');
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      setError('Erreur lors de la déconnexion');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Connexion</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {successMessage && <Text style={styles.success}>{successMessage}</Text>}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Votre email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Votre mot de passe"
            secureTextEntry
          />
        </View>

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
        </Pressable>

        <Pressable style={styles.linkButton} onPress={handleLogout}>
          <Text style={styles.linkText}>Se déconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    color: '#FF4B55',
    marginBottom: 16,
  },
  success: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF4B55',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#4B5563',
  },
});
