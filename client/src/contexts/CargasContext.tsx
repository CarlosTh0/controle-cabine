import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Regiao {
  nome: string;
  sigla: string;
  chamada: number;
  fechamento: number;
  antes: number;
  turno1: number;
  turno2: number;
  turno3: number;
  [key: string]: string | number;
}

interface CargasContextType {
  regioes: Regiao[];
  setRegioes: React.Dispatch<React.SetStateAction<Regiao[]>>;
  totalFormadasNoDia: number;
  faltamFormar: number;
  totalTurnos: number;
  updateRegiao: (index: number, campo: string, valor: number) => void;
}

const CargasContext = createContext<CargasContextType | undefined>(undefined);

const regioesIniciais: Regiao[] = [
  { nome: "Pranchinha", sigla: "P", chamada: 9, fechamento: 0, antes: 14, turno1: 0, turno2: 13, turno3: 0 },
  { nome: "Tegma", sigla: "T", chamada: 0, fechamento: 0, antes: 11, turno1: 0, turno2: 15, turno3: 0 },
  { nome: "Localiza", sigla: "L", chamada: 0, fechamento: 9, antes: 0, turno1: 5, turno2: 4, turno3: 0 },
  { nome: "Sul", sigla: "S", chamada: 0, fechamento: 0, antes: 4, turno1: 9, turno2: 22, turno3: 0 },
  { nome: "Norte", sigla: "N", chamada: 3, fechamento: 56, antes: 0, turno1: 0, turno2: 0, turno3: 0 },
  { nome: "Int. De Minas", sigla: "IM", chamada: 0, fechamento: 2, antes: 0, turno1: 0, turno2: 0, turno3: 0 },
  { nome: "Auto Port", sigla: "AP", chamada: 0, fechamento: 8, antes: 24, turno1: 5, turno2: 18, turno3: 3 },
  { nome: "Sobras", sigla: "SB", chamada: 0, fechamento: 0, antes: 0, turno1: 0, turno2: 0, turno3: 0 },
  { nome: "Exportação", sigla: "EXP", chamada: 0, fechamento: 0, antes: 0, turno1: 0, turno2: 0, turno3: 0 }
];

export const CargasProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [regioes, setRegioes] = useState<Regiao[]>(() => {
    // Carregar do localStorage se disponível
    const saved = localStorage.getItem('cargasRegioes');
    return saved ? JSON.parse(saved) : regioesIniciais;
  });

  // Salvar no localStorage quando os dados mudarem
  useEffect(() => {
    localStorage.setItem('cargasRegioes', JSON.stringify(regioes));
  }, [regioes]);

  // Função para atualizar uma região específica
  const updateRegiao = (index: number, campo: string, valor: number) => {
    if (campo === 'chamada' || campo === 'fechamento' || campo === 'antes' || 
        campo === 'turno1' || campo === 'turno2' || campo === 'turno3') {
      const novasRegioes = [...regioes];
      novasRegioes[index][campo] = valor;
      setRegioes(novasRegioes);
    }
  };

  // Cálculos de totais
  const totalizar = (campo: string): number => 
    regioes.reduce((total, r) => total + (r[campo] as number), 0);

  // Invertendo a lógica conforme solicitado
  const totalFormadasNoDia = totalizar("chamada");
  const totalTurnos = totalizar("turno1") + totalizar("turno2") + totalizar("turno3");
  const faltamFormar = totalFormadasNoDia - totalTurnos;

  return (
    <CargasContext.Provider value={{
      regioes,
      setRegioes,
      totalFormadasNoDia,
      faltamFormar,
      totalTurnos,
      updateRegiao
    }}>
      {children}
    </CargasContext.Provider>
  );
};

export const useCargas = (): CargasContextType => {
  const context = useContext(CargasContext);
  if (context === undefined) {
    throw new Error("useCargas deve ser usado dentro de um CargasProvider");
  }
  return context;
};