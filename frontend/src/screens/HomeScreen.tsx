import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CustomButton from '../components/CustomButton';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const { user, logout, dependentes, medications } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.navigate('Welcome');
  };

  if (user?.role === 'responsavel') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Meus Dependentes</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <CustomButton 
          title="Adicionar Novo Dependente" 
          variant="secondary"
          icon={<Feather name="plus-circle" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />}
          onPress={() => navigation.navigate('DependentSignUp')}
          style={{ marginBottom: theme.spacing.l }}
        />

        <FlatList
          data={dependentes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('DependentDashboard', { dependenteId: item.id, dependenteNome: item.nome })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="user" size={24} color={theme.colors.textPrimary} style={{ marginRight: 10 }} />
                <Text style={styles.cardTitle}>{item.nome}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={styles.cardSubtitle}>Ver rotina de medicamentos</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.primary} style={{ marginLeft: 5, marginTop: 2 }} />
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Minha Rotina</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={medications.filter(m => m.dependenteId === user?.dependenteId)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.medCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Feather name="info" size={18} color={theme.colors.textPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.medName}>{item.nome}</Text>
            </View>
            <Text style={styles.medDose}>{item.dose} • {item.horario}</Text>
            <Text style={styles.medDays}>{item.dias.join(', ')}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.l },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.s },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: theme.colors.textPrimary },
  logoutBtn: { backgroundColor: theme.colors.danger, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: theme.colors.white, fontWeight: 'bold' },
  card: { backgroundColor: theme.colors.white, padding: 20, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: theme.colors.primary, fontWeight: 'bold' },
  medCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.m, padding: 15, marginBottom: 10 },
  medName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary },
  medDose: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  medDays: { fontSize: 12, color: theme.colors.secondary, marginTop: 2, fontWeight: 'bold' }
});