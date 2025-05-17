import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PermissionLevel } from '../components/GerenciamentoUsuarios';

// Tipos do usuário autenticado
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  permissionLevel: PermissionLevel;
  lastLogin?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (requiredLevel: PermissionLevel) => boolean;
}

// Lista de usuários para autenticação (mock)
const USERS = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    permissionLevel: "admin" as PermissionLevel,
    active: true,
    lastLogin: "17/05/2025 08:15"
  },
  {
    id: "2",
    username: "operador1",
    email: "operador1@example.com",
    password: "operador123",
    permissionLevel: "editor" as PermissionLevel,
    active: true,
    lastLogin: "17/05/2025 07:30"
  },
  {
    id: "3",
    username: "visitante",
    email: "visitante@example.com",
    password: "visitante123",
    permissionLevel: "viewer" as PermissionLevel,
    active: true,
    lastLogin: "16/05/2025 14:45"
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Verificar se há dados de autenticação salvos
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated') === 'true';
    const savedUserId = localStorage.getItem('currentUserId');
    
    if (savedAuth && savedUserId) {
      const user = USERS.find(u => u.id === savedUserId);
      if (user) {
        const { password, active, ...authUser } = user;
        setIsAuthenticated(true);
        setCurrentUser(authUser);
      }
    }
  }, []);

  // Função de login
  const login = (username: string, password: string): boolean => {
    const user = USERS.find(u => 
      u.username === username && 
      u.password === password &&
      u.active === true
    );
    
    if (user) {
      const { password, active, ...authUser } = user;
      setIsAuthenticated(true);
      setCurrentUser(authUser);
      
      // Atualizar último login
      const now = new Date();
      const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + 
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
      
      authUser.lastLogin = formattedDate;
      
      // Salvar autenticação no localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserId', user.id);
      
      return true;
    }
    
    return false;
  };
  
  // Função de logout
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUserId');
  };
  
  // Verificar permissões de usuário
  const hasPermission = (requiredLevel: PermissionLevel): boolean => {
    if (!isAuthenticated || !currentUser) {
      return false;
    }
    
    const permissionLevels: Record<PermissionLevel, number> = {
      admin: 3,
      editor: 2,
      viewer: 1
    };
    
    const userPermissionLevel = permissionLevels[currentUser.permissionLevel];
    const requiredPermissionLevel = permissionLevels[requiredLevel];
    
    return userPermissionLevel >= requiredPermissionLevel;
  };
  
  const contextValue: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    hasPermission
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar a autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};