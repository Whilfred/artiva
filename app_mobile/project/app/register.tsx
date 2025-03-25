import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state for the button
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (!fullName || !country || !city || !age || !email || !phone || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true); // Set loading to true to indicate the request is being processed
    setError(''); // Clear any previous error

    try {
      console.log("Sending registration data...");
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, country, city, age, email, phone, password }),
      });

      console.log("Response status: ", response.status);  // Log the response status

      if (response.ok) {
        console.log('Inscription réussie');
        router.replace('/login');
      } else {
        const errorData = await response.json();
        console.log('Erreur response: ', errorData);
        setError("Erreur lors de l'inscription: " + (errorData.message || "Inconnue"));
      }
    } catch (err) {
      console.error('Erreur lors de la communication avec le serveur: ', err);
      setError("Erreur lors de la communication avec le serveur");
    } finally {
      setLoading(false);  // Set loading to false after the request is complete
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Inscription</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nom complet</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Votre nom complet" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pays</Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Votre pays" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ville</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Votre ville" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Âge</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="Votre âge" keyboardType="numeric" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Votre email" keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Numéro de téléphone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Votre numéro" keyboardType="phone-pad" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Votre mot de passe" secureTextEntry />
        </View>

        <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Enregistrement...' : "S'inscrire"}</Text>
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => router.push('/login')}>
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </Pressable>
      </View>
    </ScrollView>
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
});
