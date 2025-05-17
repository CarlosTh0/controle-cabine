// Interface para o tipo de carga no Sistema de Cargas
export interface CargaItem {
  id: string;
  hora: string;
  viagem: string;
  frota: string;
  preBox: string;
  boxD: string;
  status: "LIVRE" | "OCUPADO" | "EM_CARREGAMENTO" | "COMPLETO";
}

// Classe singleton para armazenar e gerenciar dados do Sistema de Cargas
class SistemaCargasService {
  private static instance: SistemaCargasService;
  
  private _cargas: CargaItem[] = [];
  private _totalViagens: number = 0;
  private _totalDisponiveis: number = 0;
  private _totalEmCarregamento: number = 0;
  private _totalCompletadas: number = 0;
  
  // Funções de callback para notificar mudanças
  private listeners: (() => void)[] = [];
  
  private constructor() {}
  
  // Padrão singleton
  public static getInstance(): SistemaCargasService {
    if (!SistemaCargasService.instance) {
      SistemaCargasService.instance = new SistemaCargasService();
    }
    
    return SistemaCargasService.instance;
  }
  
  // Getters
  public get cargas(): CargaItem[] {
    return [...this._cargas]; // Retornar uma cópia para evitar mutações diretas
  }
  
  public get totalViagens(): number {
    return this._totalViagens;
  }
  
  public get totalDisponiveis(): number {
    return this._totalDisponiveis;
  }
  
  public get totalEmCarregamento(): number {
    return this._totalEmCarregamento;
  }
  
  public get totalCompletadas(): number {
    return this._totalCompletadas;
  }
  
  // Adicionar uma nova carga
  public addCarga(carga: CargaItem): void {
    this._cargas.push(carga);
    this.updateCounts();
    this.notifyListeners();
  }
  
  // Adicionar múltiplas cargas
  public addCargas(cargas: CargaItem[]): void {
    this._cargas.push(...cargas);
    this.updateCounts();
    this.notifyListeners();
  }
  
  // Atualizar uma carga existente
  public updateCarga(id: string, newData: Partial<CargaItem>): void {
    const index = this._cargas.findIndex(c => c.id === id);
    
    if (index !== -1) {
      this._cargas[index] = { ...this._cargas[index], ...newData };
      this.updateCounts();
      this.notifyListeners();
    }
  }
  
  // Remover uma carga
  public removeCarga(id: string): void {
    this._cargas = this._cargas.filter(c => c.id !== id);
    this.updateCounts();
    this.notifyListeners();
  }
  
  // Limpar todas as cargas
  public clearCargas(): void {
    this._cargas = [];
    this.updateCounts();
    this.notifyListeners();
  }
  
  // Ordenar cargas por data (considerando a ordem: data, hora)
  public sortCargasByDateAndTime(): void {
    // Função para comparar datas/horas no formato HH:MM
    const sortByTime = (a: string, b: string): number => {
      const [aHours, aMinutes] = a.split(':').map(Number);
      const [bHours, bMinutes] = b.split(':').map(Number);
      
      if (aHours !== bHours) {
        return aHours - bHours;
      }
      
      return aMinutes - bMinutes;
    };
    
    this._cargas.sort((a, b) => sortByTime(a.hora, b.hora));
    this.notifyListeners();
  }
  
  // Filtrar cargas por critério
  public filterCargas(criteria: string): CargaItem[] {
    if (!criteria) return this.cargas;
    
    const lowerCriteria = criteria.toLowerCase();
    
    return this._cargas.filter(carga => 
      carga.viagem.toLowerCase().includes(lowerCriteria) ||
      carga.frota.toLowerCase().includes(lowerCriteria) ||
      carga.preBox.toLowerCase().includes(lowerCriteria) ||
      carga.boxD.toLowerCase().includes(lowerCriteria)
    );
  }
  
  // Atualizar contadores
  private updateCounts(): void {
    this._totalViagens = this._cargas.length;
    this._totalDisponiveis = this._cargas.filter(c => c.status === "LIVRE").length;
    this._totalEmCarregamento = this._cargas.filter(c => c.status === "EM_CARREGAMENTO").length;
    this._totalCompletadas = this._cargas.filter(c => c.status === "COMPLETO").length;
  }
  
  // Adicionar listener para mudanças
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    
    // Retornar função para cancelar a inscrição
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Notificar todos os listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export default SistemaCargasService;