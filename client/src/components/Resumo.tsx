import React, { useState } from "react";
import { useCargas } from "../contexts/CargasContext";

interface ResumoCargas {
  descricao: string;
  qtdCargas: number;
  qtdVeiculos: number;
  total: number;
}

export default function Resumo() {
  const { totalFormadasNoDia, faltamFormar, totalChamada } = useCargas();
  
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
      total: 707
    },
    {
      descricao: "CARGAS FORMADAS PELO 1º TURNO FECHAMENTO",
      qtdCargas: 66,
      qtdVeiculos: 707,
      total: 707
    },
    {
      descricao: "CARGAS FORMADAS PELO 2º TURNO DIA SEGUINTE",
      qtdCargas: 36,
      qtdVeiculos: 388,
      total: 1101
    },
    {
      descricao: "CARGAS FORMADAS PELO 2º TURNO FECHAMENTO",
      qtdCargas: 65,
      qtdVeiculos: 713,
      total: 713
    },
    {
      descricao: "CARGAS FORMADAS PELO 3º TURNO DIA SEGUINTE",
      qtdCargas: 13,
      qtdVeiculos: 141,
      total: 141
    },
    {
      descricao: "CARGAS FORMADAS PELO 3º TURNO FECHAMENTO",
      qtdCargas: 0,
      qtdVeiculos: 0,
      total: 0
    }
  ]);

  // Calcular totais
  const totalQtdCargas = cargasData.reduce((sum, item) => sum + item.qtdCargas, 0);
  const totalQtdVeiculos = cargasData.reduce((sum, item) => sum + item.qtdVeiculos, 0);
  const totalTotal = cargasData.reduce((sum, item) => sum + item.total, 0);
  
  // Usando valores do contexto de Cargas
  const cargasParaFormarHoje = totalChamada;
  const cargasJaFormadasHoje = totalFormadasNoDia;

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
    <div className="p-6 max-w-7xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold">PROGRAMAÇÃO PENSILINA IGARAPÉ</h2>
      <h3 className="text-xl mb-6">📅 {dataAtual}</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-blue-100">
            <tr>
              <th className="border p-2 text-left">CARGAS</th>
              <th className="border p-2 text-center">QTD. CARGAS</th>
              <th className="border p-2 text-center">QTD. VEÍCULOS</th>
              <th className="border p-2 text-center">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {cargasData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2 text-left">{item.descricao}</td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="w-20 text-center"
                    value={item.qtdCargas}
                    onChange={(e) => handleChangeCarga(index, 'qtdCargas', e.target.value)}
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="w-20 text-center"
                    value={item.qtdVeiculos}
                    onChange={(e) => handleChangeCarga(index, 'qtdVeiculos', e.target.value)}
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="text"
                    className="w-20 text-center"
                    value={item.total}
                    onChange={(e) => handleChangeCarga(index, 'total', e.target.value)}
                  />
                </td>
              </tr>
            ))}
            {/* Linha de totais */}
            <tr className="bg-gray-100 font-bold">
              <td className="border p-2 text-left">TOTAL</td>
              <td className="border p-2 text-center">{totalQtdCargas}</td>
              <td className="border p-2 text-center">{totalQtdVeiculos}</td>
              <td className="border p-2 text-center">{totalTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 mb-6 border-t pt-4">
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
      
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Status do Dia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="text-lg text-gray-600">Cargas pra formar hoje</div>
            <div className="text-3xl font-bold">{cargasParaFormarHoje}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <div className="text-lg text-gray-600">Cargas já formadas pra hoje</div>
            <div className="text-3xl font-bold">{cargasJaFormadasHoje}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-right">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => alert("Dados salvos com sucesso!")}
        >
          Salvar Dados
        </button>
      </div>
    </div>
  );
}