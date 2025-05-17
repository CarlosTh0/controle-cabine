import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTrip } from "./TripContext";

// Interface para categorizar viagens por turno
interface ViagensCategorizadas {
  turno1Dia: number;     // Código 1
  turno1Fechamento: number;  // Código 2
  turno2Dia: number;     // Código 3
  turno2Fechamento: number;  // Código 4
  turno3Dia: number;     // Código 5
  turno3Fechamento: number;  // Código 6
}

interface ViagensContextType {
  viagensCategorizadas: ViagensCategorizadas;
  totalVeiculos: number;
  totalCargas: number;
}

const ViagensContext = createContext<ViagensContextType | undefined>(undefined);

export const ViagensProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { trips } = useTrip();
  const [viagensCategorizadas, setViagensCategorizadas] = useState<ViagensCategorizadas>({
    turno1Dia: 0,
    turno1Fechamento: 0,
    turno2Dia: 0,
    turno2Fechamento: 0,
    turno3Dia: 0,
    turno3Fechamento: 0
  });

  // Calcular total de veículos e cargas
  const totalVeiculos = Object.values(viagensCategorizadas).reduce((total, curr) => total + curr, 0);
  const totalCargas = trips.length; // Total de cargas é o número de viagens

  // Atualizar a categorização das viagens sempre que a lista de trips mudar
  useEffect(() => {
    const categorizar = () => {
      const categorias: ViagensCategorizadas = {
        turno1Dia: { qtdViagens: 0, qtdVeiculos: 0 },
        turno1Fechamento: { qtdViagens: 0, qtdVeiculos: 0 },
        turno2Dia: { qtdViagens: 0, qtdVeiculos: 0 },
        turno2Fechamento: { qtdViagens: 0, qtdVeiculos: 0 },
        turno3Dia: { qtdViagens: 0, qtdVeiculos: 0 },
        turno3Fechamento: { qtdViagens: 0, qtdVeiculos: 0 }
      };

      // Contabilizar quantidade de viagens e veículos por código de turno
      trips.forEach(trip => {
        // Converter quantidade para número (default para 1 se não for válido)
        const quantidade = parseInt(trip.quantity) || 1;
        
        switch (trip.shift) {
          case "1":
            categorias.turno1Dia.qtdViagens += 1;
            categorias.turno1Dia.qtdVeiculos += quantidade;
            break;
          case "2":
            categorias.turno1Fechamento.qtdViagens += 1;
            categorias.turno1Fechamento.qtdVeiculos += quantidade;
            break;
          case "3":
            categorias.turno2Dia.qtdViagens += 1;
            categorias.turno2Dia.qtdVeiculos += quantidade;
            break;
          case "4":
            categorias.turno2Fechamento.qtdViagens += 1;
            categorias.turno2Fechamento.qtdVeiculos += quantidade;
            break;
          case "5":
            categorias.turno3Dia.qtdViagens += 1;
            categorias.turno3Dia.qtdVeiculos += quantidade;
            break;
          case "6":
            categorias.turno3Fechamento.qtdViagens += 1;
            categorias.turno3Fechamento.qtdVeiculos += quantidade;
            break;
        }
      });

      setViagensCategorizadas(categorias);
    };

    categorizar();
  }, [trips]);

  return (
    <ViagensContext.Provider value={{
      viagensCategorizadas,
      totalVeiculos,
      totalCargas
    }}>
      {children}
    </ViagensContext.Provider>
  );
};

export const useViagens = (): ViagensContextType => {
  const context = useContext(ViagensContext);
  if (context === undefined) {
    throw new Error("useViagens deve ser usado dentro de um ViagensProvider");
  }
  return context;
};