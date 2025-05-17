import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Definição de tipos
export type PermissionLevel = "admin" | "editor" | "viewer";

interface User {
  id: string;
  username: string;
  email: string;
  permissionLevel: PermissionLevel;
  active: boolean;
  lastLogin?: string;
}

// Dados iniciais de exemplo para teste da interface
const INITIAL_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    permissionLevel: "admin",
    active: true,
    lastLogin: "17/05/2025 08:15"
  },
  {
    id: "2",
    username: "operador1",
    email: "operador1@example.com",
    permissionLevel: "editor",
    active: true,
    lastLogin: "17/05/2025 07:30"
  },
  {
    id: "3",
    username: "visitante",
    email: "visitante@example.com",
    permissionLevel: "viewer",
    active: true,
    lastLogin: "16/05/2025 14:45"
  }
];

const GerenciamentoUsuarios: React.FC = () => {
  // Estado para lista de usuários
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  
  // Estado para usuário sendo editado
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Estado para novo usuário
  const [newUser, setNewUser] = useState<Omit<User, "id" | "lastLogin">>({
    username: "",
    email: "",
    permissionLevel: "viewer",
    active: true
  });
  
  // Controle de dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Filtro de busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPermission, setFilterPermission] = useState<PermissionLevel | "all">("all");
  
  // Adicionar novo usuário
  const handleAddUser = () => {
    if (!newUser.username || !newUser.email) {
      alert("Nome de usuário e e-mail são obrigatórios!");
      return;
    }
    
    const id = (users.length + 1).toString();
    const userToAdd: User = {
      ...newUser,
      id
    };
    
    setUsers([...users, userToAdd]);
    setShowAddDialog(false);
    
    // Reset form
    setNewUser({
      username: "",
      email: "",
      permissionLevel: "viewer",
      active: true
    });
  };
  
  // Abrir edição de usuário
  const openEditUser = (user: User) => {
    setCurrentUser(user);
    setShowEditDialog(true);
  };
  
  // Salvar usuário editado
  const handleSaveUser = () => {
    if (!currentUser) return;
    
    setUsers(users.map(user => user.id === currentUser.id ? currentUser : user));
    setShowEditDialog(false);
    setCurrentUser(null);
  };
  
  // Confirmar exclusão de usuário
  const openDeleteUser = (user: User) => {
    setCurrentUser(user);
    setShowDeleteDialog(true);
  };
  
  // Excluir usuário
  const handleDeleteUser = () => {
    if (!currentUser) return;
    
    setUsers(users.filter(user => user.id !== currentUser.id));
    setShowDeleteDialog(false);
    setCurrentUser(null);
  };
  
  // Toggle status do usuário (ativo/inativo)
  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, active: !user.active } : user
    ));
  };
  
  // Filtrar usuários com base na busca e filtro de permissão
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPermission = filterPermission === "all" || user.permissionLevel === filterPermission;
    
    return matchesSearch && matchesPermission;
  });
  
  // Retornar classe CSS com base no nível de permissão
  const getPermissionBadgeClass = (level: PermissionLevel): string => {
    switch (level) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "editor":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "viewer":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "";
    }
  };
  
  // Obter texto descritivo do nível de permissão
  const getPermissionText = (level: PermissionLevel): string => {
    switch (level) {
      case "admin":
        return "Administrador";
      case "editor":
        return "Editor";
      case "viewer":
        return "Visualizador";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
        <Button onClick={() => setShowAddDialog(true)}>Adicionar Usuário</Button>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/2">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Buscar por nome ou email"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={filterPermission}
          onValueChange={(value: any) => setFilterPermission(value)}
        >
          <SelectTrigger className="w-full md:w-1/4">
            <SelectValue placeholder="Filtrar por permissão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as permissões</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
            <SelectItem value="editor">Editores</SelectItem>
            <SelectItem value="viewer">Visualizadores</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Tabela de usuários */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acesso</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4 font-medium text-gray-900">{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={getPermissionBadgeClass(user.permissionLevel)}>
                      {getPermissionText(user.permissionLevel)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin || "Nunca acessou"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditUser(user)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Editar
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                        className={user.active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                      >
                        {user.active ? "Desativar" : "Ativar"}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteUser(user)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhum usuário encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Dialog de Adicionar Usuário */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right font-medium">
                Usuário
              </label>
              <Input
                id="username"
                placeholder="Nome de usuário"
                className="col-span-3"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@dominio.com"
                className="col-span-3"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="permissionLevel" className="text-right font-medium">
                Permissão
              </label>
              <Select
                value={newUser.permissionLevel}
                onValueChange={(value: PermissionLevel) => setNewUser({...newUser, permissionLevel: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecionar nível de permissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">
                Status
              </label>
              <div className="col-span-3 flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={newUser.active}
                  onChange={(e) => setNewUser({...newUser, active: e.target.checked})}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="active">Usuário Ativo</label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Editar Usuário */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere os dados do usuário {currentUser?.username}.
            </DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-username" className="text-right font-medium">
                  Usuário
                </label>
                <Input
                  id="edit-username"
                  placeholder="Nome de usuário"
                  className="col-span-3"
                  value={currentUser.username}
                  onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-email" className="text-right font-medium">
                  Email
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="exemplo@dominio.com"
                  className="col-span-3"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-permissionLevel" className="text-right font-medium">
                  Permissão
                </label>
                <Select
                  value={currentUser.permissionLevel}
                  onValueChange={(value: PermissionLevel) => setCurrentUser({...currentUser, permissionLevel: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecionar nível de permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">
                  Status
                </label>
                <div className="col-span-3 flex items-center">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={currentUser.active}
                    onChange={(e) => setCurrentUser({...currentUser, active: e.target.checked})}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-active">Usuário Ativo</label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Confirmar Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário {currentUser?.username}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciamentoUsuarios;