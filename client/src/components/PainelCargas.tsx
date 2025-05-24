import React from "react";
import { useCargas } from "../contexts/CargasContext";
import { useTrip } from "../contexts/TripContext";

export default function PainelCargas() {
  const { regioes, updateRegiao, totalFormadasNoDia, faltamFormar, totalTurnos } = useCargas();
  const { trips } = useTrip();

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

  type TurnosRegiao = { [sigla: string]: { turno1: number; turno2: number; turno3: number; fechamento: number; antes: number } };
  const calcularFormadasPorRegiaoETurno = (): TurnosRegiao => {
    const regioesTurnos: TurnosRegiao = {};
    regioes.forEach(r => {
      regioesTurnos[r.sigla] = { turno1: 0, turno2: 0, turno3: 0, fechamento: 0, antes: 0 };
    });
    trips.forEach((trip: any) => {
      const sigla = trip.region;
      // Aceita turno como string ou número
      const turno = String(trip.shift);
      if (regioesTurnos[sigla]) {
        if (turno === "1" || turno === "2") regioesTurnos[sigla].turno1 += 1;
        if (turno === "3" || turno === "4") regioesTurnos[sigla].turno2 += 1;
        if (turno === "5" || turno === "6") regioesTurnos[sigla].turno3 += 1;
      }
    });
    return regioesTurnos;
  };
  const formadasPorRegiao = calcularFormadasPorRegiaoETurno();

  // Cálculo correto de cargas a mais: soma de todos os turnos das regiões - soma das chamadas
  const totalTurnosSomado = regioes.reduce((total, r) =>
    total + (formadasPorRegiao[r.sigla]?.turno1 ?? 0) + (formadasPorRegiao[r.sigla]?.turno2 ?? 0) + (formadasPorRegiao[r.sigla]?.turno3 ?? 0), 0);
  const totalChamadasSomado = regioes.reduce((total, r) => total + (r.chamada ?? 0), 0);
  const cargasAMais = totalTurnosSomado > totalChamadasSomado ? totalTurnosSomado - totalChamadasSomado : 0;

  // Debug: mostrar trips e formadasPorRegiao no console
  React.useEffect(() => {
    console.log("[PainelCargas] trips:", trips);
    console.log("[PainelCargas] formadasPorRegiao:", formadasPorRegiao);
  }, [trips, formadasPorRegiao]);

  return (
    <div className="py-6 px-2 w-full max-w-5xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-2 text-center">Cargas Formadas Pensilina – {dataAtual}</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-[15px] text-center">
          <thead className="bg-green-100 font-semibold">
            <tr>
              <th className="border p-1">Regiões</th>
              <th className="border p-1">Chamada Pra Hoje</th>
              <th className="border p-1">Formadas Fechamento</th>
              <th className="border p-1">Formadas Antes</th>
              <th className="border p-1">1º Turno</th>
              <th className="border p-1">2º Turno</th>
              <th className="border p-1">3º Turno</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {regioes.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-1 font-medium">{r.nome} ({r.sigla})</td>
                <td className="border p-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full text-center rounded border border-gray-300 focus:ring-2 focus:ring-green-300"
                    value={r.chamada}
                    onChange={(e) => handleChange(i, 'chamada', e.target.value)}
                  />
                </td>
                <td className="border p-1">{r.fechamento}</td>
                <td className="border p-1">{r.antes}</td>
                <td className="border p-1">{formadasPorRegiao[r.sigla]?.turno1 ?? 0}</td>
                <td className="border p-1">{formadasPorRegiao[r.sigla]?.turno2 ?? 0}</td>
                <td className="border p-1">{formadasPorRegiao[r.sigla]?.turno3 ?? 0}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-100">
              <td className="border p-1 text-left">Totais</td>
              <td className="border p-1">{totalFormadasNoDia}</td>
              <td className="border p-1">{regioes.reduce((total, r) => total + r.fechamento, 0)}</td>
              <td className="border p-1">{regioes.reduce((total, r) => total + r.antes, 0)}</td>
              <td className="border p-1">{regioes.reduce((total, r) => total + (formadasPorRegiao[r.sigla]?.turno1 ?? 0), 0)}</td>
              <td className="border p-1">{regioes.reduce((total, r) => total + (formadasPorRegiao[r.sigla]?.turno2 ?? 0), 0)}</td>
              <td className="border p-1">{regioes.reduce((total, r) => total + (formadasPorRegiao[r.sigla]?.turno3 ?? 0), 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3 bg-gray-100 p-3 rounded-md text-sm flex flex-col sm:flex-row sm:justify-start sm:items-start gap-2">
        <div className="sm:text-left">
          <div><strong>Total Formadas no Dia:</strong> {totalFormadasNoDia}</div>
          <div><strong>Faltam Formar:</strong> {faltamFormar}</div>
          {cargasAMais > 0 && (
            <div className="mt-2 inline-flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 animate-pulse">
                Cargas a mais: {cargasAMais}
              </span>
              <span className="text-green-700 font-medium">Cargas formadas a mais que o previsto!</span>
            </div>
          )}
          {/* Aviso se não houver viagens válidas para os turnos */}
          {totalTurnosSomado === 0 && trips.length > 0 && (
            <div className="mt-2 text-red-600 font-semibold">
              Nenhuma viagem está sendo considerada nos turnos. Verifique se as viagens possuem <b>Região</b> (sigla) e <b>Turno</b> (1, 2 ou 3) corretamente preenchidos.
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 text-right">
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