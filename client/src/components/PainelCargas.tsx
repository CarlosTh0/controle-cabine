import React, { useState } from "react";

interface Regiao {
  nome: string;
  sigla: string;
  chamada: number;
  fechamento: number;
  antes: number;
  turno1: number;
  turno2: number;
  turno3: number;
  [key: string]: string | number; // Permite acesso por string
}

const regioesIniciais: Regiao[] = [
  { nome: "Pranchinha", sigla: "P", chamada: 9, fechamento: 0, antes: 14, turno1: 0, turno2: 13, turno3: 0 },
  { nome: "Tegma", sigla: "T", chamada: 12, fechamento: 0, antes: 11, turno1: 0, turno2: 15, turno3: 0 },
  { nome: "Localiza", sigla: "L", chamada: 27, fechamento: 9, antes: 0, turno1: 5, turno2: 4, turno3: 0 },
  { nome: "Sul", sigla: "S", chamada: 2, fechamento: 0, antes: 4, turno1: 9, turno2: 22, turno3: 0 },
  { nome: "Norte", sigla: "N", chamada: 31, fechamento: 56, antes: 0, turno1: 0, turno2: 0, turno3: 0 },
  { nome: "Int. De Minas", sigla: "IM", chamada: 1, fechamento: 2, antes: 0, turno1: 0, turno2: 0, turno3: 0 },
  { nome: "Auto Port", sigla: "AP", chamada: 7, fechamento: 8, antes: 24, turno1: 5, turno2: 18, turno3: 3 },
  { nome: "Sobras", sigla: "SB", chamada: 0, fechamento: 0, antes: 0, turno1: 0, turno2: 0, turno3: 0 },
  { nome: "Exportação", sigla: "EXP", chamada: 0, fechamento: 0, antes: 0, turno1: 0, turno2: 0, turno3: 0 }
];

export default function PainelCargas() {
  const [regioes, setRegioes] = useState(regioesIniciais);
  const [dataAtual, setDataAtual] = useState(() => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  });

  const handleChange = (index: number, campo: string, valor: string) => {
    if (!/^\d*$/.test(valor)) return; // Valida somente números
    const novasRegioes = [...regioes];
    // Assegurando que campo é uma chave válida da interface Regiao
    if (campo === 'chamada' || campo === 'fechamento' || campo === 'antes' || 
        campo === 'turno1' || campo === 'turno2' || campo === 'turno3') {
      novasRegioes[index][campo] = parseInt(valor) || 0;
      setRegioes(novasRegioes);
    }
  };

  const totalizar = (campo: string) => regioes.reduce((total, r) => total + (r[campo] as number), 0);

  const totalChamada = totalizar("chamada");
  const totalFormadasDia = totalizar("turno1") + totalizar("turno2") + totalizar("turno3");
  const faltamFormar = totalChamada - totalFormadasDia;

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
              <td className="border p-2">{totalChamada}</td>
              <td className="border p-2">{totalizar('fechamento')}</td>
              <td className="border p-2">{totalizar('antes')}</td>
              <td className="border p-2">{totalizar('turno1')}</td>
              <td className="border p-2">{totalizar('turno2')}</td>
              <td className="border p-2">{totalizar('turno3')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 bg-gray-100 p-4 rounded-md text-sm">
        <p><strong>Total Formadas no Dia:</strong> {totalFormadasDia}</p>
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