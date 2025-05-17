import { CargaItem } from "./SistemaCargasService";

export type ConflictType = 'VIAGEM_DUPLICADA' | 'HORARIO_SOBREPOSICAO' | 'PREBOX_DUPLICADO' | 'BOXD_DUPLICADO';

export interface Conflict {
  type: ConflictType;
  description: string;
  cargaIds: string[];
  severity: 'low' | 'medium' | 'high';
}

export class ConflictDetectionService {
  private static instance: ConflictDetectionService;
  
  private constructor() {}
  
  public static getInstance(): ConflictDetectionService {
    if (!ConflictDetectionService.instance) {
      ConflictDetectionService.instance = new ConflictDetectionService();
    }
    return ConflictDetectionService.instance;
  }
  
  /**
   * Detecta conflitos em um conjunto de cargas
   * @param cargas Lista de cargas a serem analisadas
   * @returns Lista de conflitos encontrados
   */
  public detectConflicts(cargas: CargaItem[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    conflicts.push(...this.detectDuplicateViagem(cargas));
    conflicts.push(...this.detectDuplicatePreBox(cargas));
    conflicts.push(...this.detectDuplicateBoxD(cargas));
    conflicts.push(...this.detectTimeOverlap(cargas));
    
    return conflicts;
  }
  
  /**
   * Detecta viagens duplicadas nas cargas
   */
  private detectDuplicateViagem(cargas: CargaItem[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const viagemMap = new Map<string, CargaItem[]>();
    
    // Agrupa cargas por viagem
    cargas.forEach(carga => {
      if (carga.viagem && carga.viagem.trim() !== '') {
        const viagem = carga.viagem.trim();
        if (!viagemMap.has(viagem)) {
          viagemMap.set(viagem, []);
        }
        viagemMap.get(viagem)?.push(carga);
      }
    });
    
    // Encontra viagens duplicadas
    viagemMap.forEach((cargasWithSameViagem, viagem) => {
      if (cargasWithSameViagem.length > 1) {
        conflicts.push({
          type: 'VIAGEM_DUPLICADA',
          description: `A viagem ${viagem} está associada a ${cargasWithSameViagem.length} cargas diferentes`,
          cargaIds: cargasWithSameViagem.map(c => c.id),
          severity: 'high'
        });
      }
    });
    
    return conflicts;
  }
  
  /**
   * Detecta PRE-BOX duplicados nas cargas
   */
  private detectDuplicatePreBox(cargas: CargaItem[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const preBoxMap = new Map<string, CargaItem[]>();
    
    // Agrupa cargas por PRE-BOX
    cargas.forEach(carga => {
      if (carga.preBox && carga.preBox.trim() !== '') {
        const preBox = carga.preBox.trim();
        if (!preBoxMap.has(preBox)) {
          preBoxMap.set(preBox, []);
        }
        preBoxMap.get(preBox)?.push(carga);
      }
    });
    
    // Encontra PRE-BOX duplicados
    preBoxMap.forEach((cargasWithSamePreBox, preBox) => {
      if (cargasWithSamePreBox.length > 1) {
        conflicts.push({
          type: 'PREBOX_DUPLICADO',
          description: `O PRE-BOX ${preBox} está associado a ${cargasWithSamePreBox.length} cargas diferentes`,
          cargaIds: cargasWithSamePreBox.map(c => c.id),
          severity: 'medium'
        });
      }
    });
    
    return conflicts;
  }
  
  /**
   * Detecta BOX-D duplicados nas cargas
   */
  private detectDuplicateBoxD(cargas: CargaItem[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const boxDMap = new Map<string, CargaItem[]>();
    
    // Agrupa cargas por BOX-D
    cargas.forEach(carga => {
      if (carga.boxD && carga.boxD.trim() !== '') {
        const boxD = carga.boxD.trim();
        if (!boxDMap.has(boxD)) {
          boxDMap.set(boxD, []);
        }
        boxDMap.get(boxD)?.push(carga);
      }
    });
    
    // Encontra BOX-D duplicados
    boxDMap.forEach((cargasWithSameBoxD, boxD) => {
      if (cargasWithSameBoxD.length > 1) {
        conflicts.push({
          type: 'BOXD_DUPLICADO',
          description: `O BOX-D ${boxD} está associado a ${cargasWithSameBoxD.length} cargas diferentes`,
          cargaIds: cargasWithSameBoxD.map(c => c.id),
          severity: 'medium'
        });
      }
    });
    
    return conflicts;
  }
  
  /**
   * Detecta sobreposições de horários (cargas com horários muito próximos)
   */
  private detectTimeOverlap(cargas: CargaItem[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const timeConflictThreshold = 15; // Limiar de 15 minutos para conflito
    
    // Agrupa cargas por data
    const cargasByDate = new Map<string, CargaItem[]>();
    
    cargas.forEach(carga => {
      if (carga.hora) {
        // Extrai a data da string de hora (assumindo formato DD/MM/YYYY HH:MM)
        const dateTimeParts = carga.hora.split(' ');
        if (dateTimeParts.length >= 1) {
          const datePart = dateTimeParts[0];
          if (!cargasByDate.has(datePart)) {
            cargasByDate.set(datePart, []);
          }
          cargasByDate.get(datePart)?.push(carga);
        }
      }
    });
    
    // Para cada data, verifica sobreposições de horário
    cargasByDate.forEach((cargasNoMesmoDia, datePart) => {
      // Ordena cargas pelo horário
      const sortedCargas = [...cargasNoMesmoDia].sort((a, b) => {
        try {
          // Extrai as horas e minutos
          const timeA = a.hora.split(' ')[1] || '00:00';
          const timeB = b.hora.split(' ')[1] || '00:00';
          
          const [hoursA, minutesA] = timeA.split(':').map(Number);
          const [hoursB, minutesB] = timeB.split(':').map(Number);
          
          const totalMinutesA = hoursA * 60 + minutesA;
          const totalMinutesB = hoursB * 60 + minutesB;
          
          return totalMinutesA - totalMinutesB;
        } catch (e) {
          return 0;
        }
      });
      
      // Verifica sobreposições entre cargas consecutivas
      for (let i = 0; i < sortedCargas.length - 1; i++) {
        const currentCarga = sortedCargas[i];
        const nextCarga = sortedCargas[i + 1];
        
        try {
          // Extrai as horas e minutos
          const timeA = currentCarga.hora.split(' ')[1] || '00:00';
          const timeB = nextCarga.hora.split(' ')[1] || '00:00';
          
          const [hoursA, minutesA] = timeA.split(':').map(Number);
          const [hoursB, minutesB] = timeB.split(':').map(Number);
          
          const totalMinutesA = hoursA * 60 + minutesA;
          const totalMinutesB = hoursB * 60 + minutesB;
          
          const timeDifference = totalMinutesB - totalMinutesA;
          
          // Se a diferença for menor que o limiar
          if (timeDifference < timeConflictThreshold && timeDifference > 0) {
            conflicts.push({
              type: 'HORARIO_SOBREPOSICAO',
              description: `Cargas agendadas com apenas ${timeDifference} minutos de diferença (${currentCarga.hora} e ${nextCarga.hora})`,
              cargaIds: [currentCarga.id, nextCarga.id],
              severity: timeDifference < 5 ? 'high' : 'low'
            });
          }
        } catch (e) {
          // Ignora erros de formato de data/hora
        }
      }
    });
    
    return conflicts;
  }
}

export default ConflictDetectionService.getInstance();