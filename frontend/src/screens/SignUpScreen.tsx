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
  
  const { signUp } = useAuth(); 

  const handleSignUp = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem!');
      return;
    }

    try {
      await signUp(email.toLowerCase().trim(), senha, nome);
      // O AppNavigator detectará a mudança no user do AuthContext e te levará pra home/profile!
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
          style={styles.input} 
          placeholder="Insira seu Email" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />
        
        <Text style={styles.label}>Crie uma Senha</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Crie uma senha" 
          value={senha} 
          onChangeText={setSenha} 
          secureTextEntry 
        />
        
        <Text style={styles.label}>Confirme a Senha</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Confirme a senha" 
          value={confirmarSenha} 
          onChangeText={setConfirmarSenha} 
          secureTextEntry 
        />
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
  input: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15 }
});