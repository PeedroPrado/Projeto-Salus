import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../contexts/AuthContext'; 

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'> };

export default function SignUpScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados para controlar as mensagens de erro visuais
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [confirmarSenhaError, setConfirmarSenhaError] = useState('');

  const { signUp } = useAuth(); 

  const handleSignUp = async () => {
    // Resetar erros antes de validar
    let isValid = true;
    setEmailError('');
    setSenhaError('');
    setConfirmarSenhaError('');

    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    // Validação do formato do E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Insira um e-mail válido (ex: nome@email.com)');
      isValid = false;
    }

    // Validação de força da Senha
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(senha)) {
      setSenhaError('Mínimo de 8 caracteres, 1 maiúscula e 1 especial.');
      isValid = false;
    }

    // Validação se as senhas coincidem
    if (senha !== confirmarSenha) {
      setConfirmarSenhaError('As senhas não coincidem.');
      isValid = false;
    }

    // Se alguma validação falhou, interrompe o cadastro
    if (!isValid) return;

    try {
      await signUp(email.toLowerCase().trim(), senha, nome);
      navigation.navigate('ProfileConfirmed');
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
         <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Para começar,{'\n'}preciso de algumas{'\n'}informações</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Qual seu Nome?</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: João" 
          value={nome} 
          onChangeText={setNome} 
        />
        
        <Text style={styles.label}>Qual seu Email?</Text>
        <TextInput 
          // Aplica estilo de erro (borda vermelha) se houver emailError
          style={[styles.input, emailError ? styles.inputError : null]} 
          placeholder="Insira seu Email" 
          value={email} 
          onChangeText={(text) => { setEmail(text); setEmailError(''); }} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />
        {/* Renderiza o texto de erro visualmente abaixo do input */}
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        
        <Text style={styles.label}>Crie uma Senha</Text>
        <TextInput 
          style={[styles.input, senhaError ? styles.inputError : null]} 
          placeholder="Crie uma senha" 
          value={senha} 
          onChangeText={(text) => { setSenha(text); setSenhaError(''); }} 
          secureTextEntry 
        />
        {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}
        
        <Text style={styles.label}>Confirme a Senha</Text>
        <TextInput 
          style={[styles.input, confirmarSenhaError ? styles.inputError : null]} 
          placeholder="Confirme a senha" 
          value={confirmarSenha} 
          onChangeText={(text) => { setConfirmarSenha(text); setConfirmarSenhaError(''); }} 
          secureTextEntry 
        />
        {confirmarSenhaError ? <Text style={styles.errorText}>{confirmarSenhaError}</Text> : null}
      </View>

      <CustomButton title="Confirmar" onPress={handleSignUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.l },
  backButton: { marginTop: theme.spacing.s, marginBottom: theme.spacing.m },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 30 },
  inputContainer: { width: '100%', marginBottom: 30 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '500', color: theme.colors.textPrimary },
  input: { 
    backgroundColor: theme.colors.white, 
    borderRadius: theme.borderRadius.xl, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    marginBottom: 15 
  },
  
  // Novos estilos para os erros visuais
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30', // Borda vermelha
    marginBottom: 5, // Reduz o espaçamento para aproximar o texto de erro
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
    marginTop: -2,
  }
});
