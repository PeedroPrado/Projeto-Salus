import React, { createContext, useState, useContext, useRef } from 'react';
import axios from 'axios';

export type User = { id?: string; email: string; nome?: string; role: 'responsavel' | 'dependente' };
export type Dependente = { id: string; nome: string; email: string };
export type Medicamento = { id: string; nome: string; dose: string; horario: string; dias: string[]; dependenteId?: string };

type AuthContextData = {
  user: User | null;
  token: string | null;
  dependentes: Dependente[];
  medications: Medicamento[];
  login: (email: string, senhaDigitada: string) => Promise<void>;
  logout: () => void;
  signUp: (email: string, senha: string, nome: string) => Promise<void>;
  addDependente: (dependente: { nome: string; email: string; senha: string }) => Promise<void>;
  addMedication: (med: Omit<Medicamento, 'id'> & { dependenteId: string }) => Promise<void>;
  updateMedication: (med: Medicamento) => void;
  deleteMedication: (id: string) => Promise<void>;
  loadMedications: (dependenteId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [medications, setMedications] = useState<Medicamento[]>([]);
  const tokenRef = useRef<string | null>(null);

  const saveToken = (t: string | null) => {
    tokenRef.current = t;
    setToken(t);
  };

  const authHeader = () => ({ Authorization: `Bearer ${tokenRef.current}` });

  // ── Auth ────────────────────────────────────────────────────────────────────

  const loadDependentes = async () => {
    const response = await api.get('/dependentes', { headers: authHeader() });
    setDependentes(response.data);
  };

  const login = async (email: string, senhaDigitada: string) => {
    try {
      const response = await api.post('/login', { email, senha: senhaDigitada });
      const { token: jwtToken, user: userData } = response.data;
      saveToken(jwtToken);
      setUser({
        id: String(userData.id),
        nome: userData.nome,
        email: userData.email,
        role: userData.role,
      });
      if (userData.role === 'responsavel') {
        await loadDependentes();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão. Verifique se o servidor está rodando.');
    }
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
    setDependentes([]);
    setMedications([]);
  };

  const signUp = async (email: string, senha: string, nome: string) => {
    try {
      await api.post('/signup', { nome, email, senha });
      await login(email, senha);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão. Verifique se o servidor está rodando.');
    }
  };

  const addDependente = async (dependente: { nome: string; email: string; senha: string }) => {
    try {
      const response = await api.post('/dependentes', dependente, { headers: authHeader() });
      setDependentes((prev) => [...prev, response.data.dependente]);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar dependente.');
    }
  };

  // ── Medicamentos ─────────────────────────────────────────────────────────────

  const parseDias = (dias: any): string[] =>
    Array.isArray(dias) ? dias : JSON.parse(dias);

  const loadMedications = async (dependenteId: string) => {
    try {
      const response = await api.get(`/medicamentos/${dependenteId}`, { headers: authHeader() });
      setMedications((prev) => [
        ...prev.filter((m) => m.dependenteId !== dependenteId),
        ...response.data.map((m: any) => ({
          id: String(m.id),
          nome: m.nome,
          dose: m.dose,
          horario: m.horario,
          dias: parseDias(m.dias),
          dependenteId: String(m.dependente_id),
        })),
      ]);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao carregar medicamentos.');
    }
  };

  const addMedication = async (med: Omit<Medicamento, 'id'> & { dependenteId: string }) => {
    try {
      const response = await api.post(
        '/medicamentos',
        {
          dependente_id: med.dependenteId,
          nome: med.nome,
          dose: med.dose,
          horario: med.horario,
          dias: med.dias,
        },
        { headers: authHeader() }
      );
      setMedications((prev) => [
        ...prev,
        {
          id: String(response.data.id),
          nome: response.data.nome,
          dose: response.data.dose,
          horario: response.data.horario,
          dias: parseDias(response.data.dias),
          dependenteId: String(response.data.dependente_id),
        },
      ]);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao salvar medicamento.');
    }
  };

  const updateMedication = (updatedMed: Medicamento) =>
    setMedications((prev) => prev.map((m) => (m.id === updatedMed.id ? updatedMed : m)));

  const deleteMedication = async (id: string) => {
    try {
      await api.delete(`/medicamentos/${id}`, { headers: authHeader() });
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao remover medicamento.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, dependentes, medications,
      login, logout, signUp,
      addDependente,
      addMedication, updateMedication, deleteMedication, loadMedications,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);