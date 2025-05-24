import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Types
export type PreBoxStatus = "LIVRE" | "VIAGEM" | "BLOQUEADO";

export interface PreBox {
  id: string;
  status: PreBoxStatus;
  tripId?: string;
}

export interface Trip {
  id: string;
  date: string;
  time: string;
  oldTrip: string;
  preBox: string;
  boxD: string;
  quantity: string;
  shift: string;
  region: string;
  status: string;
  manifestDate: string;
}

export type ModalAction = 
  | { type: 'deletePreBox'; id: string }
  | { type: 'deleteTrip'; id: string }
  | { type: 'linkTrip'; id: string }
  | null;

export type ModalContent = {
  title: string;
  message: string;
  confirmAction: () => void;
  type: 'delete' | 'confirm';
} | null;

// Interface de usuário
export interface User {
  username: string;
  password: string;
}

// Context interface
export interface TripContextType {
  preBoxes: PreBox[];
  trips: Trip[];
  newPreBoxId: string;
  error: string;
  showModal: boolean;
  modalContent: ModalContent;
  isAuthenticated: boolean;
  currentUser: string | null;
  setNewPreBoxId: (id: string) => void;
  handleAddPreBox: () => void | Promise<void>;
  handleToggleStatus: (id: string) => void | Promise<void>;
  handleDeletePreBox: (id: string) => void | Promise<void>;
  handleLinkTrip: (preBoxId: string) => void | Promise<void>;
  handleCreateTrip: (preBoxId: string, tripData?: any, directToBoxD?: boolean) => Promise<boolean>;
  handleUpdateTrip: (tripId: string, updatedFields: Partial<Trip>) => void | Promise<void>;
  handleDeleteTrip: (tripId: string) => void | Promise<void>;
  showConfirmModal: (action: ModalAction) => void;
  closeModal: () => void;
  getPreBoxesCount: () => number;
  getFreePreBoxesCount: () => number;
  getStatusClass: (status: PreBoxStatus) => string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Create the context
const TripContext = createContext<TripContextType | undefined>(undefined);

// Provider component
export const TripProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Estado do aplicativo
  const [preBoxes, setPreBoxes] = useState<PreBox[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newPreBoxId, setNewPreBoxId] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Load data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, preBoxesRes] = await Promise.all([
          axios.get("/api/trips"),
          axios.get("/api/preboxes")
        ]);
        setTrips(tripsRes.data);
        setPreBoxes(preBoxesRes.data);
      } catch (err) {
        setError("Erro ao carregar dados do servidor.");
      }
    };
    fetchData();
  }, []);

  // Gerar um ID para PRE-BOX
  const generatePreBoxId = (): string => {
    let highest = 0;
    preBoxes.forEach(pb => {
      const id = parseInt(pb.id);
      if (!isNaN(id) && id > highest) {
        highest = id;
      }
    });
    return String(highest + 1);
  };

  // Gerar ID para viagem
  const generateTripId = (): string => {
    let highestNum = 0;
    trips.forEach(trip => {
      const match = trip.id.match(/V(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNum) {
          highestNum = num;
        }
      }
    });
    return `V${highestNum + 1}`;
  };

  // Funções de formatação
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Função para adicionar PRE-BOX via API
  const handleAddPreBox = async () => {
    // Validar o ID
    if (!newPreBoxId) {
      setError("Por favor, informe um ID para o PRE-BOX.");
      return;
    }

    // Verificar se o ID já existe
    if (preBoxes.some(box => box.id.toLowerCase() === newPreBoxId.toLowerCase())) {
      setError(`O PRE-BOX com ID ${newPreBoxId} já existe.`);
      return;
    }

    // Permitir IDs alfanuméricos (com letras)
    const hasLetter = /[a-zA-Z]/.test(newPreBoxId);
    if (!hasLetter) {
      // Se for só número, validar o intervalo
      const preBoxNum = parseInt(newPreBoxId);
      if (isNaN(preBoxNum) || !((preBoxNum >= 50 && preBoxNum <= 55) || (preBoxNum >= 300 && preBoxNum <= 356))) {
        setError("O ID do PRE-BOX deve estar entre 50-55, 300-356 ou conter letras.");
        return;
      }
    }

    try {
      const res = await axios.post("/api/preboxes", { id: newPreBoxId, status: "LIVRE" });
      setPreBoxes([...preBoxes, res.data]);
      setNewPreBoxId(""); // Clear the input
      setError(""); // Clear any error
    } catch (err) {
      setError("Erro ao criar PRE-BOX no servidor.");
    }
  };

  // Função para alternar status do PRE-BOX via API
  const handleToggleStatus = async (id: string) => {
    const preBox = preBoxes.find(pb => pb.id === id);
    if (!preBox) return;
    const newStatus = preBox.status === "LIVRE" ? "BLOQUEADO" : "LIVRE";
    try {
      await axios.patch(`/api/preboxes/${id}`, { status: newStatus });
      setPreBoxes(preBoxes.map(pb => pb.id === id ? { ...pb, status: newStatus } : pb));
    } catch (err) {
      setError("Erro ao atualizar status do PRE-BOX.");
    }
  };

  // Função para deletar PRE-BOX via API
  const handleDeletePreBox = async (id: string) => {
    try {
      await axios.delete(`/api/preboxes/${id}`);
      setPreBoxes(preBoxes.filter(pb => pb.id !== id));
      setShowModal(false); // Fechar o modal após a exclusão
      setModalContent(null); // Importante: também precisa limpar o conteúdo do modal
    } catch (err) {
      setError("Erro ao deletar PRE-BOX.");
    }
  };

  // Função para criar viagem vinculada a PRE-BOX via API
  const handleLinkTrip = async (preBoxId: string) => {
    const tripId = generateTripId();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const newTrip: Trip = {
      id: tripId,
      date: formatDate(today),
      time: formatTime(today),
      oldTrip: "",
      preBox: preBoxId,
      boxD: "",
      quantity: String(Math.floor(Math.random() * 100) + 50),
      shift: String(Math.floor(Math.random() * 3) + 1),
      region: ["Norte", "Sul", "Leste", "Oeste"][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.5 ? "Completa" : "Incompleta",
      manifestDate: formatDate(tomorrow)
    };
    try {
      const res = await axios.post("/api/trips", newTrip);
      setTrips([...trips, res.data]);
      // Atualiza o PRE-BOX localmente
      setPreBoxes(preBoxes.map(pb => pb.id === preBoxId ? { ...pb, status: "VIAGEM", tripId: tripId } : pb));
      setShowModal(false);
      setModalContent(null);
    } catch (err) {
      setError("Erro ao criar viagem no servidor.");
    }
  };

  // Função para criar viagem via API
  const handleCreateTrip = async (preBoxId: string, tripData?: any, directToBoxD: boolean = false) => {
    try {
      const tripId = tripData?.id && tripData.id.trim() !== "" ? tripData.id : generateTripId();
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (trips.some(trip => trip.id === tripId)) {
        setError(`Já existe uma viagem com o ID ${tripId}.`);
        return false;
      }
      if (!directToBoxD && preBoxId !== "DIRECT_TO_BOXD") {
        const preBox = preBoxes.find(pb => pb.id === preBoxId);
        if (!preBox) {
          setError(`PRE-BOX ${preBoxId} não encontrado.`);
          return false;
        }
        if (preBox.status !== "LIVRE") {
          setError(`PRE-BOX ${preBoxId} não está livre.`);
          return false;
        }
      }
      const newTrip: Trip = {
        id: tripId,
        date: formatDate(today),
        time: formatTime(today),
        oldTrip: tripData?.oldTrip || "",
        preBox: directToBoxD ? "" : preBoxId,
        boxD: tripData?.boxD || "",
        quantity: tripData?.quantity || String(Math.floor(Math.random() * 100) + 50),
        shift: tripData?.shift || "1",
        region: tripData?.region || "Sul",
        status: tripData?.status || "Completa",
        manifestDate: formatDate(tomorrow)
      };
      const res = await axios.post("/api/trips", newTrip);
      setTrips(prev => [...prev, res.data]);
      if (!directToBoxD) {
        const newStatus = newTrip.boxD ? "LIVRE" : "VIAGEM";
        setPreBoxes(prev => prev.map(preBox => {
          if (preBox.id === preBoxId) {
            if (newStatus === "LIVRE") {
              return { ...preBox, status: newStatus, tripId: undefined };
            } else {
              return { ...preBox, status: newStatus, tripId: tripId };
            }
          }
          return preBox;
        }));
      }
      setError("");
      return true;
    } catch (err) {
      setError("Erro ao criar viagem no servidor.");
      return false;
    }
  };

  // Função para atualizar viagem via API
  const handleUpdateTrip = async (tripId: string, updatedFields: Partial<Trip>) => {
    const tripToUpdate = trips.find(trip => trip.id === tripId);
    const hasBoxDChanged = updatedFields.boxD !== undefined && (!tripToUpdate?.boxD || tripToUpdate.boxD === "") && updatedFields.boxD !== "";
    try {
      const res = await axios.patch(`/api/trips/${tripId}`, updatedFields);
      setTrips(prev => prev.map(trip => trip.id === tripId ? { ...trip, ...updatedFields } : trip));
      if (hasBoxDChanged && tripToUpdate) {
        const preBoxId = tripToUpdate.preBox;
        setPreBoxes(prev => prev.map(preBox => {
          if (preBox.id === preBoxId && preBox.status === "VIAGEM") {
            return { ...preBox, status: "LIVRE", tripId: undefined };
          }
          return preBox;
        }));
      }
    } catch (err) {
      setError("Erro ao atualizar viagem.");
    }
  };

  // Função para deletar viagem via API
  const handleDeleteTrip = async (tripId: string) => {
    const tripToDelete = trips.find(trip => trip.id === tripId);
    if (!tripToDelete) return;
    try {
      await axios.delete(`/api/trips/${tripId}`);
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      setPreBoxes(prev => prev.map(preBox => {
        if (preBox.id === tripToDelete.preBox && preBox.status === "VIAGEM") {
          return { ...preBox, status: "LIVRE", tripId: undefined };
        }
        return preBox;
      }));
      setShowModal(false);
      setModalContent(null);
    } catch (err) {
      setError("Erro ao deletar viagem.");
    }
  };

  // Show confirmation modal
  const showConfirmModal = (action: ModalAction) => {
    if (!action) return;
    
    let content: ModalContent = null;
    
    switch(action.type) {
      case 'deletePreBox':
        content = {
          title: 'Excluir PRE-BOX',
          message: `Tem certeza que deseja excluir o PRE-BOX ${action.id}?`,
          confirmAction: () => {
            console.log("Excluindo PRE-BOX:", action.id);
            handleDeletePreBox(action.id);
          },
          type: 'delete'
        };
        break;
      case 'deleteTrip':
        content = {
          title: 'Excluir Viagem',
          message: `Tem certeza que deseja excluir a viagem ${action.id}?`,
          confirmAction: () => {
            console.log("Excluindo viagem:", action.id);
            handleDeleteTrip(action.id);
          },
          type: 'delete'
        };
        break;
      case 'linkTrip':
        content = {
          title: 'Vincular Viagem',
          message: `Tem certeza que deseja criar uma nova viagem para o PRE-BOX ${action.id}?`,
          confirmAction: () => {
            console.log("Vinculando viagem ao PRE-BOX:", action.id);
            handleLinkTrip(action.id);
          },
          type: 'confirm'
        };
        break;
      default:
        return;
    }
    
    setModalContent(content);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Get status class for styling
  const getStatusClass = (status: PreBoxStatus): string => {
    switch(status) {
      case "LIVRE":
        return "bg-green-100 text-green-800";
      case "VIAGEM":
        return "bg-yellow-100 text-yellow-800";
      case "BLOQUEADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Dashboard helper functions
  const getPreBoxesCount = (): number => preBoxes.length;
  const getFreePreBoxesCount = (): number => preBoxes.filter(pb => pb.status === "LIVRE").length;
  
  // Authentication functions
  const login = (username: string, password: string): boolean => {
    // Mock users for demonstration
    const validUsers = [
      { username: "admin", password: "admin123" },
      { username: "operador", password: "operador123" }
    ];
    
    const user = validUsers.find(u => 
      u.username === username && u.password === password
    );
    
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(username);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', username);
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  };

  // Context value
  const value: TripContextType = {
    preBoxes,
    trips,
    newPreBoxId,
    error,
    showModal,
    modalContent,
    isAuthenticated,
    currentUser,
    setNewPreBoxId,
    handleAddPreBox,
    handleToggleStatus,
    handleDeletePreBox,
    handleLinkTrip,
    handleCreateTrip,
    handleUpdateTrip,
    handleDeleteTrip,
    showConfirmModal,
    closeModal,
    getPreBoxesCount,
    getFreePreBoxesCount,
    getStatusClass,
    login,
    logout
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

// Custom hook to use the TripContext
export const useTrip = (): TripContextType => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};