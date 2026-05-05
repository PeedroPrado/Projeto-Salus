import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

export type User = { id?: string; email: string; nome?: string; role: 'responsavel' | 'dependente'; dependenteId?: string };
export type Dependente = { id: string; nome: string };
export type Medicamento = { id: string; nome: string; dose: string; horario: string; dias: string[]; dependenteId?: string };

type AuthContextData = {
  user: User | null;
  dependentes: Dependente[];
  medications: Medicamento[];
  login: (email: string, senhaDigitada: string) => Promise<void>;
  logout: () => void;
  signUp: (email: string, senha: string, nome: string) => Promise<void>;
  addDependente: (nome: string) => void;
  addMedication: (med: Medicamento) => void;
  updateMedication: (med: Medicamento) => void;
  deleteMedication: (id: string) => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Configuração do Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // os estados agora começam totalmente vazios
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [medications, setMedications] = useState<Medicamento[]>([]);

  // Login integrado ao banco de dados
  const login = async (email: string, senhaDigitada: string) => {
    try {
      const response = await api.post('/login', { email, senha: senhaDigitada });
      const userData = response.data;
      
      setUser({ 
        id: String(userData.id),
        nome: userData.nome,
        email: userData.email, 
        role: userData.role 
      });
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro de conexão. Verifique se o servidor está rodando.';
      throw new Error(mensagemErro);
    }
  };
  
  const logout = () => {
    setUser(null);
    // Limpa os dados em memória ao deslogar
    setDependentes([]);
    setMedications([]);
  };

  // Cadastro integrado ao banco de dados
  const signUp = async (email: string, senha: string, nome: string) => {
    try {
      await api.post('/signup', { nome, email, senha });
      await login(email, senha); 
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro de conexão. Verifique se o servidor está rodando.';
      throw new Error(mensagemErro);
    }
  };
  
  // Mantendo o CRUD em memória
  const addDependente = (nome: string) => {
    setDependentes((prev) => [...prev, { id: Math.random().toString(), nome }]);
  };

  const addMedication = (med: Medicamento) => {
    setMedications((prev) => [...prev, med]);
  };
  
  const updateMedication = (updatedMed: Medicamento) => {
    setMedications((prev) => prev.map(m => m.id === updatedMed.id ? updatedMed : m));
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter(m => m.id !== id));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      dependentes, 
      medications, 
      login, 
      logout, 
      signUp,
      addDependente, 
      addMedication, 
      updateMedication, 
      deleteMedication
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
