import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CustomButton from '../components/CustomButton';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth(); 

  const handleLogin = async () => {
    const userEmail = email.toLowerCase().trim();

    // 1. Verifica se o usuário preencheu tudo
    if (!userEmail || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    try {
      // 2. Chama a função login do contexto, passando apenas email e senha
      await login(userEmail, senha);
      
      // 3. Se o login deu certo no backend, vai para a Home
      navigation.navigate('Home');
    } catch (error: any) {
      // 4. Se a senha tiver errada ou o backend cair, mostra o erro
      Alert.alert('Erro no Login', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
         <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Acesse sua rotina de saúde.</Text>
      </View>
      
      <View style={styles.form}>
        <TextInput 
          style={styles.input} placeholder="E-mail (ex: resp@teste.com)" 
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" 
        />
        <TextInput 
          style={styles.input} placeholder="Senha (ex: 123)" 
          value={senha} onChangeText={setSenha} secureTextEntry 
        />
        
        <CustomButton 
          title="Entrar" 
          onPress={handleLogin}
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.l 
  },
  backButton: { marginTop: theme.spacing.s, marginBottom: theme.spacing.xl },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  title: { fontSize: 32, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.s },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary },
  form: { width: '100%' },
  input: { 
    backgroundColor: theme.colors.inputBackground, 
    borderRadius: theme.borderRadius.m, 
    padding: 18, 
    marginBottom: theme.spacing.m, 
    fontSize: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
});