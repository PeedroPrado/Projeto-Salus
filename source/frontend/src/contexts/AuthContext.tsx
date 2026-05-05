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

// Configuração do Axios. 
const api = axios.create({
  // baseURL: '[http://10.68.54.1:3000/api](http://10.68.54.1:3000/api)' 
  baseURL: 'http://localhost:3000/api'
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dependentes, setDependentes] = useState<Dependente[]>([
    { id: 'dep-1', nome: 'Dona Maria' }
  ]);
  const [medications, setMedications] = useState<Medicamento[]>([
    { id: '1', nome: 'Losartana', dose: '1 comp', horario: '08:00', dias: ['Seg', 'Ter'], dependenteId: 'dep-1' }
  ]);

  // Função de Login Real com Banco de Dados
  const login = async (email: string, senhaDigitada: string) => {
    try {
      const response = await api.post('/login', { email, senha: senhaDigitada });
      const userData = response.data;
      
      setUser({ 
        id: userData.id,
        nome: userData.nome,
        email: userData.email, 
        role: userData.role 
      });
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro de conexão. Verifique se o servidor está rodando.';
      throw new Error(mensagemErro);
    }
  };
  
  const logout = () => setUser(null);

  // Função de Cadastro Real com Banco de Dados
  const signUp = async (email: string, senha: string, nome: string) => {
    try {
      await api.post('/signup', { nome, email, senha });
      // Se cadastrou com sucesso, já loga automaticamente
      await login(email, senha); 
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro de conexão. Verifique se o servidor está rodando.';
      throw new Error(mensagemErro);
    }
  };
  
  const addDependente = (nome: string) => setDependentes((prev) => [...prev, { id: Math.random().toString(), nome }]);
  const addMedication = (med: Medicamento) => setMedications((prev) => [...prev, med]);
  
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