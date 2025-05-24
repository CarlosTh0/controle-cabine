import React, { useState, useEffect } from "react";
import { useCargas } from "../contexts/CargasContext";
import { useViagens } from "../contexts/ViagensContext";
import { useTrip } from "../contexts/TripContext";

interface ResumoCargas {
  descricao: string;
  qtdCargas: number;
  qtdVeiculos: number;
  total: number;
}

export default function Resumo() {
  const { totalFormadasNoDia, faltamFormar, totalTurnos } = useCargas();
  const { viagensCategorizadas, totalVeiculos, totalCargas } = useViagens();
  const { trips } = useTrip(); // Acessar diretamente a lista de viagens
  
  const [dataAtual, setDataAtual] = useState(() => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  });
  
  const [cargasData, setCargasData] = useState<ResumoCargas[]>([
    {
      descricao: "CARGAS FORMADAS PELO 1º TURNO DIA SEGUINTE",
      qtdCargas: 0,
      qtdVeiculos: 0,
      total: 0
    },
    {
      descricao: "CARGAS FORMADAS PELO 1º TURNO FECHAMENTO",
      qtdCargas: 0,
      qtdVeiculos: 0,
      total: 0
    },
    {
      descricao: "CARGAS FORMADAS PELO 2º TURNO DIA SEGUINTE",
      qtdCargas: 0,
      qtdVeiculos: 0,
      total: 0
    },
    {
      descricao: "CARGAS FORMADAS PELO 2º TURNO FECHAMENTO",
      qtdCargas: 0,
      qtdVeiculos: 0,
      total: 0
    },
    {
      descricao: "CARGAS FORMADAS PELO 3º TURNO DIA SEGUINTE",
      qtdCargas: 0,
      qtdVeiculos: 0,
      total: 0
    },
    {
      descricao: "CARGAS FORMADAS PELO 3º TURNO FECHAMENTO",
      qtdCargas: 0,
      qtdVeiculos: 0,
      total: 0
    }
  ]);

  // Atualizar dados quando as viagens mudarem
  useEffect(() => {
    let fechamento1 = 0, fechamento2 = 0, fechamento3 = 0;
    let diaSeguinte1 = 0, diaSeguinte2 = 0, diaSeguinte3 = 0;
    let fechamento1Veiculos = 0, fechamento2Veiculos = 0, fechamento3Veiculos = 0;
    let diaSeguinte1Veiculos = 0, diaSeguinte2Veiculos = 0, diaSeguinte3Veiculos = 0;
    trips.forEach(trip => {
      const turno = String(trip.shift);
      const quantidade = parseInt(trip.quantity) || 0;
      if (turno === "1") { fechamento1++; fechamento1Veiculos += quantidade; }
      if (turno === "2") { diaSeguinte1++; diaSeguinte1Veiculos += quantidade; }
      if (turno === "3") { fechamento2++; fechamento2Veiculos += quantidade; }
      if (turno === "4") { diaSeguinte2++; diaSeguinte2Veiculos += quantidade; }
      if (turno === "5") { fechamento3++; fechamento3Veiculos += quantidade; }
      if (turno === "6") { diaSeguinte3++; diaSeguinte3Veiculos += quantidade; }
    });
    const newCargasData = [
      {
        descricao: "CARGAS FORMADAS PELO 1º TURNO DIA SEGUINTE",
        qtdCargas: diaSeguinte1,
        qtdVeiculos: diaSeguinte1Veiculos,
        total: diaSeguinte1Veiculos
      },
      {
        descricao: "CARGAS FORMADAS PELO 1º TURNO FECHAMENTO",
        qtdCargas: fechamento1,
        qtdVeiculos: fechamento1Veiculos,
        total: fechamento1Veiculos
      },
      {
        descricao: "CARGAS FORMADAS PELO 2º TURNO DIA SEGUINTE",
        qtdCargas: diaSeguinte2,
        qtdVeiculos: diaSeguinte2Veiculos,
        total: diaSeguinte2Veiculos
      },
      {
        descricao: "CARGAS FORMADAS PELO 2º TURNO FECHAMENTO",
        qtdCargas: fechamento2,
        qtdVeiculos: fechamento2Veiculos,
        total: fechamento2Veiculos
      },
      {
        descricao: "CARGAS FORMADAS PELO 3º TURNO DIA SEGUINTE",
        qtdCargas: diaSeguinte3,
        qtdVeiculos: diaSeguinte3Veiculos,
        total: diaSeguinte3Veiculos
      },
      {
        descricao: "CARGAS FORMADAS PELO 3º TURNO FECHAMENTO",
        qtdCargas: fechamento3,
        qtdVeiculos: fechamento3Veiculos,
        total: fechamento3Veiculos
      }
    ];
    setCargasData(newCargasData);
  }, [trips, viagensCategorizadas]);

  // Calcular totais
  const totalQtdCargas = cargasData.reduce((sum, item) => sum + item.qtdCargas, 0);
  const totalQtdVeiculos = cargasData.reduce((sum, item) => sum + item.qtdVeiculos, 0);
  const totalTotal = cargasData.reduce((sum, item) => sum + item.total, 0);

  // Lógica padronizada de "cargas a mais" (igual ao Painel de Cargas)
  // Soma real dos turnos (todas as regiões/turnos)
  const somaTurnos = cargasData.reduce((sum, item) => sum + item.qtdCargas, 0);
  // Soma das chamadas (usando totalFormadasNoDia do contexto)
  const somaChamadas = totalFormadasNoDia;
  const cargasAMais = somaTurnos > somaChamadas ? somaTurnos - somaChamadas : 0;

  // Usando valores do contexto de Cargas
  const cargasParaFormarHoje = totalFormadasNoDia;
  const cargasJaFormadasHoje = totalTurnos;

  const handleChangeCarga = (index: number, field: keyof ResumoCargas, value: string) => {
    if (field === 'descricao') return; // Não permite alterar a descrição
    
    // Validação: apenas números
    if (!/^\d*$/.test(value)) return;
    
    const newValue = parseInt(value) || 0;
    const updatedCargasData = [...cargasData];
    updatedCargasData[index] = {
      ...updatedCargasData[index],
      [field]: newValue
    };
    
    setCargasData(updatedCargasData);
  };

  return (
    <div className="py-8 px-2 w-full min-h-screen flex flex-col items-center bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow rounded-lg p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-1 text-center">PROGRAMAÇÃO PENSILINA IGARAPÉ</h2>
        <h3 className="text-xl mb-6 text-center">📅 {dataAtual}</h3>
        <div className="w-full flex flex-col items-center">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border rounded" style={{maxWidth: 700, margin: '0 auto'}}>
              <thead className="bg-blue-100">
                <tr>
                  <th className="border p-2 text-left whitespace-nowrap" style={{minWidth: 180, fontWeight: 600}}>CARGAS</th>
                  <th className="border p-2 text-center whitespace-nowrap" style={{width: 90}}>QTD. CARGAS</th>
                  <th className="border p-2 text-center whitespace-nowrap" style={{width: 110}}>QTD. VEÍCULOS</th>
                  <th className="border p-2 text-center whitespace-nowrap" style={{width: 90}}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {cargasData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-left whitespace-nowrap" style={{minWidth: 180}}>{item.descricao}</td>
                    <td className="border p-2 text-center" style={{width: 90}}>{item.qtdCargas}</td>
                    <td className="border p-2 text-center" style={{width: 110}}>{item.qtdVeiculos}</td>
                    <td className="border p-2 text-center" style={{width: 90}}>{item.total}</td>
                  </tr>
                ))}
                {/* Linha de totais */}
                <tr className="bg-gray-100 font-bold">
                  <td className="border p-2 text-left" style={{minWidth: 180}}>TOTAL</td>
                  <td className="border p-2 text-center" style={{width: 90}}>{totalQtdCargas}</td>
                  <td className="border p-2 text-center" style={{width: 110}}>{totalQtdVeiculos}</td>
                  <td className="border p-2 text-center" style={{width: 90}}>{totalTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Legenda alinhada à esquerda */}
        <div className="mt-8 mb-6 border-t pt-4 w-full flex flex-row items-start justify-start">
          <div>
            <h3 className="text-lg font-bold mb-2">LEGENDA P/ CARGAS</h3>
            <table className="w-auto border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">TURNO</th>
                  <th className="border p-2">CÓDIGOS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1º TURNO</td>
                  <td className="border p-2">1 e 2</td>
                </tr>
                <tr>
                  <td className="border p-2">2º TURNO</td>
                  <td className="border p-2">3 e 4</td>
                </tr>
                <tr>
                  <td className="border p-2">3º TURNO</td>
                  <td className="border p-2">5 e 6</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Status do Dia e Cargas a Mais */}
        <div className="mt-8 w-full flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4 text-center">Status do Dia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mx-auto mb-4">
            <div className="bg-blue-50 p-4 rounded-md flex flex-col items-center">
              <div className="text-lg text-gray-600">Cargas pra formar hoje</div>
              <div className="text-3xl font-bold">{somaChamadas}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-md flex flex-col items-center">
              <div className="text-lg text-gray-600">Cargas já formadas (turnos)</div>
              <div className="text-3xl font-bold">{somaTurnos}</div>
            </div>
          </div>
          {/* Cargas a mais - lógica igual ao Painel de Cargas */}
          {cargasAMais > 0 && (
            <div className="mt-2 flex flex-col items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-base font-semibold bg-green-100 text-green-800 border border-green-200 animate-pulse">
                Cargas formadas a mais: {cargasAMais}
              </span>
              <span className="text-green-700 font-medium mt-1">Cargas formadas a mais que o previsto!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}