import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../store/auth'; // Importation du store
import { router } from 'expo-router';

// Définition du type pour userInfo
type UserInfo = {
  email: string;
  password: string;
  user?: {
    name: string; // ou tout autre champ lié à l'utilisateur
  };
  token?: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Initialisation avec le type UserInfo ou null
  const [successMessage, setSuccessMessage] = useState(''); // État pour afficher le message de succès
  const login = useAuthStore((state) => state.login); // Accéder à la fonction login du store

  const handleLogin = async () => {
    try {
      console.log('Tentative de connexion avec les données suivantes :');
      console.log('Email:', email);
      console.log('Mot de passe:', password);
  
      setUserInfo({ email, password, user: undefined, token: undefined });
  
      // Appel de la fonction login depuis le store
      await login(email, password);
      
      // Utiliser un effet pour mettre à jour l'interface après la connexion
      setSuccessMessage('Connexion réussie !');
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
  
      if (user && token) {
        setUserInfo({ email, password, user, token });
        router.push('/');
      } else {
        setError('Connexion échouée. Veuillez réessayer.');
      }
    } catch (err) {
      console.log('Erreur lors de la connexion :', err);
      setError('Email ou mot de passe incorrect');
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

        <Pressable
          style={styles.linkButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.linkText}>
            Pas encore de compte ? S'inscrire
          </Text>
        </Pressable>

        {userInfo && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>Données envoyées :</Text>
            <Text style={styles.userInfoText}>Email: {userInfo.email}</Text>
            <Text style={styles.userInfoText}>Mot de passe: {userInfo.password}</Text>
            {userInfo.user && (
              <>
                <Text style={styles.userInfoText}>Utilisateur connecté : {userInfo.user.name}</Text>
                <Text style={styles.userInfoText}>Token : {userInfo.token}</Text>
              </>
            )}
          </View>
        )}
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
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 24,
  },
  error: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#FF4B55',
    marginBottom: 16,
  },
  success: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  userInfoContainer: {
    marginTop: 20,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  userInfoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#1F2937',
  },
});
