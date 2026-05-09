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
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const { addDependente } = useAuth();

  const handleCadastro = async () => {
    console.log('1. Botão pressionado');

    if (!nome || !email || !senha || !confirmarSenha) {
      console.log('2. Campos vazios');
      return Alert.alert('Erro', 'Preencha todos os campos.');
    }

    if (senha !== confirmarSenha) {
      console.log('3. Senhas não coincidem');
      return Alert.alert('Erro', 'As senhas não coincidem.');
    }

    if (senha.length < 6) {
      console.log('4. Senha curta');
      return Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
    }

    console.log('5. Passou validações, chamando addDependente...');
    setLoading(true);
    try {
      await addDependente({ nome, email: email.toLowerCase().trim(), senha });
      console.log('6. addDependente OK');
      Alert.alert('Sucesso', `Dependente ${nome} cadastrado!`);
      navigation.navigate('Home');
    } catch (error: any) {
      console.log('7. ERRO:', error.message);
      Alert.alert('Erro no Cadastro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cadastrar{'\n'}Dependente</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome do Dependente</Text>
        <TextInput style={styles.input} placeholder="Ex: Maria" value={nome} onChangeText={setNome} />

        <Text style={styles.label}>Email do Dependente</Text>
        <TextInput
          style={styles.input}
          placeholder="email@exemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Crie uma senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirme a senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />
      </View>

      <CustomButton
        title={loading ? 'Salvando...' : 'Salvar Dependente'}
        onPress={handleCadastro}
        style={{ marginBottom: theme.spacing.m }}
      />

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
  input: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, paddingHorizontal: 20, paddingVertical: 15, fontSize: 16, marginBottom: 15 },
  backButton: { padding: 15, alignItems: 'center' },
  backButtonText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 16 }
});