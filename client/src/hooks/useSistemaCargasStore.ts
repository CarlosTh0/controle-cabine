// Hook personalizado para armazenar o estado global do Sistema de Cargas

// Interface para a carga/viagem
export interface CargaItem {
  id: string;
  hora: string;
  viagem: string;
  frota: string;
  preBox: string;
  boxD: string;
  status: "LIVRE" | "OCUPADO" | "EM_CARREGAMENTO" | "COMPLETO";
}

// Armazenamento de dados global
const store = {
  cargas: [] as CargaItem[],
  totalViagens: 0,
  totalDisponiveis: 0,
  totalEmCarregamento: 0,
  totalCompletadas: 0,
  listeners: [] as Array<() => void>
};

// Função para atualizar contadores
const updateCounts = () => {
  store.totalViagens = store.cargas.length;
  store.totalDisponiveis = store.cargas.filter(c => c.status === "LIVRE").length;
  store.totalEmCarregamento = store.cargas.filter(c => c.status === "EM_CARREGAMENTO").length;
  store.totalCompletadas = store.cargas.filter(c => c.status === "COMPLETO").length;
};

// Notificar todos os assinantes sobre mudanças
const notifyListeners = () => {
  store.listeners.forEach(listener => listener());
};

// Hook para usar o armazenamento do Sistema de Cargas
export function useSistemaCargasStore() {
  // Funções para manipular o armazenamento
  
  // Adicionar uma carga
  const addCarga = (carga: CargaItem) => {
    store.cargas.push(carga);
    updateCounts();
    notifyListeners();
  };
  
  // Adicionar várias cargas
  const addCargas = (cargas: CargaItem[]) => {
    store.cargas.push(...cargas);
    updateCounts();
    notifyListeners();
  };
  
  // Atualizar uma carga
  const updateCarga = (id: string, newCarga: Partial<CargaItem>) => {
    const index = store.cargas.findIndex(c => c.id === id);
    if (index !== -1) {
      store.cargas[index] = { ...store.cargas[index], ...newCarga };
      updateCounts();
      notifyListeners();
    }
  };
  
  // Remover uma carga
  const removeCarga = (id: string) => {
    console.log("Removendo carga com ID:", id);
    // Usar filtro direto pelo ID da carga, que é mais confiável
    const cargasAntes = store.cargas.length;
    store.cargas = store.cargas.filter(carga => carga.id !== id);
    const cargasDepois = store.cargas.length;
    
    console.log(`Cargas antes: ${cargasAntes}, cargas depois: ${cargasDepois}`);
    
    if (cargasAntes !== cargasDepois) {
      console.log("Carga removida com sucesso");
      updateCounts();
      notifyListeners();
    } else {
      console.error("Carga não encontrada para remoção. ID:", id);
    }
  };
  
  // Limpar todas as cargas
  const clearCargas = () => {
    store.cargas = [];
    updateCounts();
    notifyListeners();
  };
  
  // Ordenar cargas por hora
  const sortCargasByHora = () => {
    store.cargas.sort((a, b) => a.hora.localeCompare(b.hora));
    notifyListeners();
  };
  
  // Filtrar cargas por texto de busca
  const filterCargas = (text: string) => {
    if (!text) return store.cargas;
    
    const lowerText = text.toLowerCase();
    return store.cargas.filter(carga => 
      carga.viagem.toLowerCase().includes(lowerText) ||
      carga.frota.toLowerCase().includes(lowerText) ||
      carga.preBox.toLowerCase().includes(lowerText) ||
      carga.boxD.toLowerCase().includes(lowerText)
    );
  };
  
  // Adicionar um assinante para mudanças no armazenamento
  const subscribe = (listener: () => void) => {
    store.listeners.push(listener);
    return () => {
      store.listeners = store.listeners.filter(l => l !== listener);
    };
  };
  
  // Retornar dados e métodos
  return {
    get cargas() { return store.cargas; },
    get totalViagens() { return store.totalViagens; },
    get totalDisponiveis() { return store.totalDisponiveis; },
    get totalEmCarregamento() { return store.totalEmCarregamento; },
    get totalCompletadas() { return store.totalCompletadas; },
    addCarga,
    addCargas,
    updateCarga,
    removeCarga,
    clearCargas,
    sortCargasByHora,
    filterCargas,
    subscribe
  };
}

export default useSistemaCargasStore;