import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  handleAddPreBox: () => void;
  handleToggleStatus: (id: string) => void;
  handleDeletePreBox: (id: string) => void;
  handleLinkTrip: (preBoxId: string) => void;
  handleCreateTrip: (preBoxId: string, tripData?: any, directToBoxD?: boolean) => boolean;
  handleUpdateTrip: (tripId: string, updatedFields: Partial<Trip>) => void;
  handleDeleteTrip: (tripId: string) => void;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedPreBoxes = localStorage.getItem('preBoxes');
    const storedTrips = localStorage.getItem('trips');
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('currentUser');

    if (storedPreBoxes) {
      setPreBoxes(JSON.parse(storedPreBoxes));
    } else {
      // Default PRE-BOXes
      const defaultPreBoxes: PreBox[] = [
        { id: "50", status: "LIVRE" },
        { id: "51", status: "VIAGEM", tripId: "V1234" },
        { id: "300", status: "BLOQUEADO" }
      ];
      setPreBoxes(defaultPreBoxes);
      localStorage.setItem('preBoxes', JSON.stringify(defaultPreBoxes));
    }

    if (storedTrips) {
      setTrips(JSON.parse(storedTrips));
    } else {
      // Default trip
      const defaultTrips: Trip[] = [
        {
          id: "V1234",
          date: "17/05/2025",
          time: "10:30",
          oldTrip: "V999",
          preBox: "51",
          boxD: "",
          quantity: "100",
          shift: "2",
          region: "Sul",
          status: "Completa",
          manifestDate: "17/05/2025"
        }
      ];
      setTrips(defaultTrips);
      localStorage.setItem('trips', JSON.stringify(defaultTrips));
    }

    // Verificar autenticação
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
    }
  }, []);

  // Persistir alterações no localStorage
  useEffect(() => {
    localStorage.setItem('preBoxes', JSON.stringify(preBoxes));
  }, [preBoxes]);

  useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
  }, [trips]);

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

  // Add PRE-BOX
  const handleAddPreBox = () => {
    // Validar o ID
    if (!newPreBoxId) {
      setError("Por favor, informe um ID para o PRE-BOX.");
      return;
    }

    // Verificar se o ID já existe
    if (preBoxes.some(box => box.id === newPreBoxId)) {
      setError(`O PRE-BOX com ID ${newPreBoxId} já existe.`);
      return;
    }

    // Validar o formato do ID (entre 50-55 ou 300-356)
    const preBoxNum = parseInt(newPreBoxId);
    if (isNaN(preBoxNum) || 
        !((preBoxNum >= 50 && preBoxNum <= 55) || 
          (preBoxNum >= 300 && preBoxNum <= 356))) {
      setError("O ID do PRE-BOX deve estar entre 50-55 ou 300-356.");
      return;
    }

    // Add new PRE-BOX
    const newPreBox: PreBox = {
      id: newPreBoxId,
      status: "LIVRE"
    };

    setPreBoxes([...preBoxes, newPreBox]);
    setNewPreBoxId(""); // Clear the input
    setError(""); // Clear any error
  };

  // Toggle PRE-BOX status
  const handleToggleStatus = (id: string) => {
    setPreBoxes(preBoxes.map(preBox => {
      if (preBox.id === id) {
        if (preBox.status === "LIVRE") {
          return { ...preBox, status: "BLOQUEADO" };
        } else if (preBox.status === "BLOQUEADO") {
          return { ...preBox, status: "LIVRE" };
        }
      }
      return preBox;
    }));
  };

  // Delete PRE-BOX
  const handleDeletePreBox = (id: string) => {
    setPreBoxes(preBoxes.filter(preBox => preBox.id !== id));
    setShowModal(false); // Fechar o modal após a exclusão
  };

  // Link trip to PRE-BOX
  const handleLinkTrip = (preBoxId: string) => {
    const tripId = generateTripId();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Create new trip with random data
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
    
    setTrips([...trips, newTrip]);
    
    // Update PRE-BOX status
    setPreBoxes(preBoxes.map(preBox => {
      if (preBox.id === preBoxId) {
        return {
          ...preBox,
          status: "VIAGEM",
          tripId: tripId
        };
      }
      return preBox;
    }));
    
    // Close modal
    setShowModal(false);
  };

  // Create trip with custom data
  const handleCreateTrip = (preBoxId: string, tripData?: any, directToBoxD: boolean = false) => {
    try {
      // Use the user-provided ID or generate a new one
      const tripId = tripData?.id && tripData.id.trim() !== "" ? tripData.id : generateTripId();
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      // Check if trip ID already exists
      if (trips.some(trip => trip.id === tripId)) {
        setError(`Já existe uma viagem com o ID ${tripId}.`);
        return false;
      }
      
      // Se não for criação direta para BOX-D, verificar o PRE-BOX
      if (!directToBoxD) {
        // Check if PRE-BOX exists and is available
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
      
      // Create new trip with custom data
      const newTrip: Trip = {
        id: tripId,
        date: formatDate(today),
        time: formatTime(today),
        oldTrip: tripData?.oldTrip || "",
        preBox: directToBoxD ? "" : preBoxId, // Se for direto para BOX-D, não associamos a um PRE-BOX
        boxD: tripData?.boxD || "",
        quantity: tripData?.quantity || String(Math.floor(Math.random() * 100) + 50),
        shift: tripData?.shift || "1",
        region: tripData?.region || "Sul",
        status: tripData?.status || "Completa",
        manifestDate: formatDate(tomorrow)
      };
      
      // Adicionar a viagem
      setTrips(prev => [...prev, newTrip]);
      
      // Se for criação direta para BOX-D, não atualizar PRE-BOX
      if (!directToBoxD) {
        // Update PRE-BOX status
        const newStatus = newTrip.boxD ? "LIVRE" : "VIAGEM";
        
        setPreBoxes(prev => prev.map(preBox => {
          if (preBox.id === preBoxId) {
            if (newStatus === "LIVRE") {
              // If BOX-D is filled, remove the trip reference but keep the history
              return {
                ...preBox,
                status: newStatus,
                tripId: undefined
              };
            } else {
              // Otherwise, link the trip to the PRE-BOX
              return {
                ...preBox,
                status: newStatus,
                tripId: tripId
              };
            }
          }
          return preBox;
        }));
      }
      
      console.log("Viagem criada com sucesso:", newTrip);
      setError(""); // Clear any previous error
      return true;
    } catch (err) {
      console.error("Erro ao criar viagem:", err);
      setError("Erro ao criar viagem. Tente novamente.");
      return false;
    }
  };

  // Update trip
  const handleUpdateTrip = (tripId: string, updatedFields: Partial<Trip>) => {
    // Check if we're updating BOX-D and it's being filled
    const tripToUpdate = trips.find(trip => trip.id === tripId);
    const hasBoxDChanged = updatedFields.boxD !== undefined && 
                           (!tripToUpdate?.boxD || tripToUpdate.boxD === "") && 
                           updatedFields.boxD !== "";
    
    // Update trip
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        return { ...trip, ...updatedFields };
      }
      return trip;
    }));
    
    // If BOX-D is being changed from empty to filled, free up the PRE-BOX
    if (hasBoxDChanged && tripToUpdate) {
      const preBoxId = tripToUpdate.preBox;
      
      setPreBoxes(prev => prev.map(preBox => {
        if (preBox.id === preBoxId && preBox.status === "VIAGEM") {
          return {
            ...preBox,
            status: "LIVRE",
            tripId: undefined
          };
        }
        return preBox;
      }));
    }
  };

  // Delete trip
  const handleDeleteTrip = (tripId: string) => {
    // Find the trip to get the PRE-BOX reference
    const tripToDelete = trips.find(trip => trip.id === tripId);
    
    if (!tripToDelete) return;
    
    // Remove the trip
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
    
    // Update PRE-BOXes that are using this trip
    setPreBoxes(prev => prev.map(preBox => {
      if (preBox.id === tripToDelete.preBox && preBox.status === "VIAGEM") {
        // Free up the PRE-BOX
        return { 
          ...preBox,
          status: "LIVRE", 
          tripId: undefined 
        };
      }
      return preBox;
    }));
    
    // Close the modal after deletion
    setShowModal(false);
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
            handleDeletePreBox(action.id);
            setShowModal(false); // Fechar o modal após confirmar
          },
          type: 'delete'
        };
        break;
      case 'deleteTrip':
        content = {
          title: 'Excluir Viagem',
          message: `Tem certeza que deseja excluir a viagem ${action.id}?`,
          confirmAction: () => {
            handleDeleteTrip(action.id);
            setShowModal(false); // Fechar o modal após confirmar
          },
          type: 'delete'
        };
        break;
      case 'linkTrip':
        content = {
          title: 'Vincular Viagem',
          message: `Tem certeza que deseja criar uma nova viagem para o PRE-BOX ${action.id}?`,
          confirmAction: () => {
            handleLinkTrip(action.id);
            setShowModal(false); // Fechar o modal após confirmar
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