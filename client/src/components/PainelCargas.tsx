import React from "react";
import { useCargas } from "../contexts/CargasContext";

export default function PainelCargas() {
  const { 
    regioes, 
    updateRegiao, 
    totalFormadasNoDia, 
    faltamFormar, 
    totalTurnos 
  } = useCargas();
  
  const [dataAtual] = React.useState(() => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  });

  const handleChange = (index: number, campo: string, valor: string) => {
    if (!/^\d*$/.test(valor)) return; // Valida somente números
    updateRegiao(index, campo, parseInt(valor) || 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Cargas Formadas Pensilina – {dataAtual}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border">
          <thead className="bg-green-100 font-semibold">
            <tr>
              <th className="border p-2">Regiões</th>
              <th className="border p-2">Chamada Pra Hoje</th>
              <th className="border p-2">Formadas Fechamento</th>
              <th className="border p-2">Formadas Antes</th>
              <th className="border p-2">1º Turno</th>
              <th className="border p-2">2º Turno</th>
              <th className="border p-2">3º Turno</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {regioes.map((r, i) => (
              <tr key={i} className="hover:bg-gray-100">
                <td className="border p-2">{r.nome} ({r.sigla})</td>
                {['chamada', 'fechamento', 'antes', 'turno1', 'turno2', 'turno3'].map((campo) => (
                  <td key={campo} className="border p-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full text-center"
                      value={r[campo as keyof typeof r]}
                      onChange={(e) => handleChange(i, campo, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="font-bold bg-gray-100">
              <td className="border p-2">Totais</td>
              <td className="border p-2">{totalFormadasNoDia}</td>
              <td className="border p-2">{regioes.reduce((total, r) => total + r.fechamento, 0)}</td>
              <td className="border p-2">{regioes.reduce((total, r) => total + r.antes, 0)}</td>
              <td className="border p-2">{regioes.reduce((total, r) => total + r.turno1, 0)}</td>
              <td className="border p-2">{regioes.reduce((total, r) => total + r.turno2, 0)}</td>
              <td className="border p-2">{regioes.reduce((total, r) => total + r.turno3, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 bg-gray-100 p-4 rounded-md text-sm">
        <p><strong>Total Formadas no Dia:</strong> {totalFormadasNoDia}</p>
        <p><strong>Faltam Formar:</strong> {faltamFormar}</p>
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