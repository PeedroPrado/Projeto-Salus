import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import CustomButton from '../components/CustomButton';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'DependentSignUp'> };

export default function DependentSignUpScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const { addDependente } = useAuth();

  const handleCadastro = () => {
    if (!nome) return Alert.alert('Erro', 'Por favor, insira o nome do dependente.');
    addDependente(nome);
    navigation.navigate('Home'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cadastrar{'\n'}Dependente</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Qual o Nome do Dependente?</Text>
        <TextInput style={styles.input} placeholder="Insira o Nome aqui" value={nome} onChangeText={setNome} />
      </View>

      <CustomButton title="Salvar Dependente" onPress={handleCadastro} style={{ marginBottom: theme.spacing.m }} />
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.l, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 40 },
  inputContainer: { width: '100%', marginBottom: 30 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '600', color: theme.colors.textPrimary },
  input: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, paddingHorizontal: 20, paddingVertical: 15, fontSize: 16 },
  backButton: { padding: 15, alignItems: 'center' },
  backButtonText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 16 }
});