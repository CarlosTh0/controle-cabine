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

// Context interface
interface TripContextType {
  preBoxes: PreBox[];
  trips: Trip[];
  newPreBoxId: string;
  error: string;
  showModal: boolean;
  modalContent: ModalContent;
  setNewPreBoxId: (id: string) => void;
  handleAddPreBox: () => void;
  handleToggleStatus: (id: string) => void;
  handleDeletePreBox: (id: string) => void;
  handleLinkTrip: (preBoxId: string) => void;
  handleCreateTrip: (preBoxId: string, tripData?: any) => void;
  handleUpdateTrip: (tripId: string, updatedFields: Partial<Trip>) => void;
  handleDeleteTrip: (tripId: string) => void;
  showConfirmModal: (action: ModalAction) => void;
  closeModal: () => void;
  getPreBoxesCount: () => number;
  getFreePreBoxesCount: () => number;
  getStatusClass: (status: PreBoxStatus) => string;
}

// Create the context
const TripContext = createContext<TripContextType | undefined>(undefined);

// Provider component
export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [preBoxes, setPreBoxes] = useState<PreBox[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newPreBoxId, setNewPreBoxId] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedPreBoxes = localStorage.getItem('preBoxes');
    const storedTrips = localStorage.getItem('trips');

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
          date: "2025-05-16",
          time: "08:00",
          oldTrip: "V1230",
          preBox: "51",
          boxD: "1",
          quantity: "100",
          shift: "1",
          region: "Sul",
          status: "Completa",
          manifestDate: "2025-05-17"
        }
      ];
      setTrips(defaultTrips);
      localStorage.setItem('trips', JSON.stringify(defaultTrips));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (preBoxes.length > 0) {
      localStorage.setItem('preBoxes', JSON.stringify(preBoxes));
    }
  }, [preBoxes]);

  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem('trips', JSON.stringify(trips));
    }
  }, [trips]);

  // Validate PRE-BOX ID
  const validatePreBoxId = (id: string): boolean => {
    const numId = parseInt(id);
    return (
      (numId >= 50 && numId <= 55) || 
      (numId >= 300 && numId <= 356)
    );
  };

  // Check if PRE-BOX ID already exists
  const preBoxIdExists = (id: string): boolean => {
    return preBoxes.some(preBox => preBox.id === id);
  };

  // Add new PRE-BOX
  const handleAddPreBox = () => {
    if (!newPreBoxId) {
      setError("Por favor, insira um ID para o PRE-BOX.");
      return;
    }

    if (!validatePreBoxId(newPreBoxId)) {
      setError("ID do PRE-BOX deve estar entre 50-55 ou 300-356.");
      return;
    }

    if (preBoxIdExists(newPreBoxId)) {
      setError("Este ID de PRE-BOX já existe.");
      return;
    }

    const newPreBox: PreBox = {
      id: newPreBoxId,
      status: "LIVRE"
    };

    setPreBoxes([...preBoxes, newPreBox]);
    setNewPreBoxId("");
    setError("");
  };

  // Delete PRE-BOX
  const handleDeletePreBox = (id: string) => {
    const preBox = preBoxes.find(pb => pb.id === id);
    
    if (preBox && preBox.status === "VIAGEM") {
      setError("Não é possível excluir um PRE-BOX com viagem vinculada.");
      return;
    }

    setPreBoxes(preBoxes.filter(preBox => preBox.id !== id));
    setError("");
  };

  // Toggle PRE-BOX status between LIVRE and BLOQUEADO
  const handleToggleStatus = (id: string) => {
    setPreBoxes(preBoxes.map(preBox => {
      if (preBox.id === id) {
        if (preBox.status === "VIAGEM") {
          return preBox; // Don't change status if it has a trip
        }
        return {
          ...preBox,
          status: preBox.status === "LIVRE" ? "BLOQUEADO" : "LIVRE"
        };
      }
      return preBox;
    }));
  };

  // Generate a unique trip ID
  const generateTripId = (): string => {
    const existingIds = trips.map(trip => trip.id);
    let newId;
    let counter = 1;
    
    do {
      newId = `V${1000 + counter}`;
      counter++;
    } while (existingIds.includes(newId));
    
    return newId;
  };

  // Funções auxiliares para formatação de data e hora
  const formatDate = (date: Date): string => {
    // Formatação DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formatTime = (date: Date): string => {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  // Link a trip to PRE-BOX (método original com confirmação)
  const handleLinkTrip = (preBoxId: string) => {
    const tripId = generateTripId();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Create new trip
    const newTrip: Trip = {
      id: tripId,
      date: formatDate(today),
      time: formatTime(today),
      oldTrip: "",
      preBox: preBoxId,
      boxD: String(Math.floor(Math.random() * 10) + 1),
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
  };
  
  // Método para criar viagem diretamente com dados personalizados
  const handleCreateTrip = (preBoxId: string, tripData?: any) => {
    // Usar o ID fornecido pelo usuário ou gerar um novo
    const tripId = tripData?.id && tripData.id.trim() !== "" ? tripData.id : generateTripId();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Verificar se já existe uma viagem com esse ID para evitar duplicatas
    if (trips.some(trip => trip.id === tripId)) {
      setError(`Já existe uma viagem com o ID ${tripId}.`);
      return;
    }
    
    // Create new trip with custom data or defaults
    const newTrip: Trip = {
      id: tripId,
      date: formatDate(today),
      time: formatTime(today),
      oldTrip: tripData?.oldTrip || "",
      preBox: preBoxId,
      boxD: tripData?.boxD || "",
      quantity: tripData?.quantity || String(Math.floor(Math.random() * 100) + 50),
      shift: tripData?.shift || "1",
      region: tripData?.region || "Sul",
      status: tripData?.status || "Completa",
      manifestDate: formatDate(tomorrow)
    };
    
    setTrips([...trips, newTrip]);
    
    // Update PRE-BOX status
    // Se o BOX-D já estiver preenchido, o PRE-BOX deve ficar LIVRE novamente
    const newStatus = newTrip.boxD ? "LIVRE" : "VIAGEM";
    
    setPreBoxes(preBoxes.map(preBox => {
      if (preBox.id === preBoxId) {
        if (newStatus === "LIVRE") {
          // Se BOX-D está preenchido, remove a referência da viagem mas mantém o histórico
          return {
            ...preBox,
            status: newStatus,
            tripId: undefined
          };
        } else {
          // Caso contrário, vincula a viagem ao PRE-BOX
          return {
            ...preBox,
            status: newStatus,
            tripId: tripId
          };
        }
      }
      return preBox;
    }));
  };

  // Update trip
  const handleUpdateTrip = (tripId: string, updatedFields: Partial<Trip>) => {
    // Verificar se estamos atualizando o BOX-D e se ele está sendo preenchido
    const tripToUpdate = trips.find(trip => trip.id === tripId);
    const hasBoxDChanged = updatedFields.boxD !== undefined && 
                          (!tripToUpdate?.boxD || tripToUpdate.boxD === "") && 
                          updatedFields.boxD !== "";
    
    // Atualizar a viagem
    setTrips(trips.map(trip => {
      if (trip.id === tripId) {
        return { ...trip, ...updatedFields };
      }
      return trip;
    }));
    
    // Se BOX-D foi alterado de vazio para preenchido, liberar o PRE-BOX
    if (hasBoxDChanged && tripToUpdate) {
      const preBoxId = tripToUpdate.preBox;
      
      setPreBoxes(preBoxes.map(preBox => {
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
    // Encontrar a viagem para obter a referência PRE-BOX
    const tripToDelete = trips.find(trip => trip.id === tripId);
    
    if (!tripToDelete) return;
    
    // Remove the trip
    setTrips(trips.filter(trip => trip.id !== tripId));
    
    // Atualizar os PRE-BOXes que estão usando essa viagem
    setPreBoxes(preBoxes.map(preBox => {
      if (preBox.id === tripToDelete.preBox && preBox.status === "VIAGEM") {
        // Liberar o PRE-BOX (mudar para status LIVRE)
        return { 
          ...preBox,
          status: "LIVRE", 
          tripId: undefined 
        };
      }
      return preBox;
    }));
    
    // Fechar o modal após a exclusão
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
          confirmAction: () => handleDeletePreBox(action.id),
          type: 'delete'
        };
        break;
      case 'deleteTrip':
        content = {
          title: 'Excluir Viagem',
          message: `Tem certeza que deseja excluir a viagem ${action.id}?`,
          confirmAction: () => handleDeleteTrip(action.id),
          type: 'delete'
        };
        break;
      case 'linkTrip':
        content = {
          title: 'Vincular Viagem',
          message: `Tem certeza que deseja criar uma nova viagem para o PRE-BOX ${action.id}?`,
          confirmAction: () => handleLinkTrip(action.id),
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

  // Get status class for PRE-BOX
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

  // Helper functions for dashboard
  const getPreBoxesCount = (): number => preBoxes.length;
  
  const getFreePreBoxesCount = (): number => 
    preBoxes.filter(pb => pb.status === "LIVRE").length;

  // Create the context value
  const value: TripContextType = {
    preBoxes,
    trips,
    newPreBoxId,
    error,
    showModal,
    modalContent,
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
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

// Custom hook to use the TripContext
export const useTrip = (): TripContextType => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
