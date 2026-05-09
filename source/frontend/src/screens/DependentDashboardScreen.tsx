import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CustomButton from '../components/CustomButton';

type Props = NativeStackScreenProps<RootStackParamList, 'DependentDashboard'>;

export default function DependentDashboardScreen({ route, navigation }: Props) {
  const { dependenteId, dependenteNome } = route.params;
  const { medications, deleteMedication, loadMedications } = useAuth();
  const [loading, setLoading] = useState(true);

  // Normaliza para string para garantir comparação correta independente do tipo
  const depId = String(dependenteId);

  useEffect(() => {
    loadMedications(depId).finally(() => setLoading(false));
  }, [depId]);

  const rotinaDependente = medications.filter(med => String(med.dependenteId) === depId);

  const handleDelete = (id: string, nome: string) => {
    Alert.alert('Excluir Medicamento', `Deseja remover ${nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteMedication(id) }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Rotina: {dependenteNome}</Text>
      </View>

      <CustomButton
        title="Novo Medicamento"
        icon={<Feather name="plus" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />}
        onPress={() => navigation.navigate('Search', { dependenteId: depId })}
        style={{ marginBottom: theme.spacing.l }}
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rotinaDependente}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.medCard}>
              <View style={styles.medInfoArea}>
                <View style={styles.medIcon}>
                  <Feather name="activity" size={20} color={theme.colors.secondary} />
                </View>
                <View>
                  <Text style={styles.medName}>{item.nome}</Text>
                  <Text style={styles.medDose}>{item.dose} • {item.horario}</Text>
                  <Text style={styles.medDays}>{item.dias.join(', ')}</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Search', { dependenteId: depId, medicamento: item })}>
                  <Feather name="edit-2" size={16} color={theme.colors.textPrimary} style={{ marginRight: 4 }} />
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.nome)}>
                  <Feather name="trash-2" size={16} color={theme.colors.danger} style={{ marginRight: 4 }} />
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum medicamento cadastrado.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.l },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.l, marginTop: theme.spacing.s },
  backButton: { marginRight: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textPrimary },
  medCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.l, padding: 15, marginBottom: 15 },
  medInfoArea: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  medIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  medName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary },
  medDose: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  medDays: { fontSize: 12, color: theme.colors.secondary, marginTop: 2, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.4)', paddingTop: 10 },
  editBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  editText: { color: theme.colors.textPrimary, fontWeight: 'bold' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center' },
  deleteText: { color: theme.colors.danger, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 30, color: theme.colors.textSecondary, fontSize: 16 }
});