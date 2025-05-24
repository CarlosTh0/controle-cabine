import React from "react";
import { useCargas } from "../contexts/CargasContext";
import { useTrip } from "../contexts/TripContext";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export default function Dashboard() {
  const { totalFormadasNoDia, faltamFormar, totalTurnos, regioes } = useCargas();
  const { trips, preBoxes } = useTrip();

  // PRE-BOX status contagem
  const livres = preBoxes.filter(pb => pb.status === "LIVRE").length;
  const bloqueados = preBoxes.filter(pb => pb.status === "BLOQUEADO").length;
  const emViagem = preBoxes.filter(pb => pb.status === "VIAGEM").length;

  // Viagens com/sem BOX-D
  const viagensComBoxD = trips.filter(trip => trip.boxD && trip.boxD.trim() !== "").length;
  const viagensSemBoxD = trips.length - viagensComBoxD;

  // Data atual
  const dataAtual = (() => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  })();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Geral – {dataAtual}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 flex flex-col items-center bg-green-50 border border-green-100">
          <span className="text-4xl font-bold text-green-700">{totalFormadasNoDia}</span>
          <span className="text-sm text-green-800 mt-1">Cargas previstas para hoje</span>
          <Badge className="mt-2" variant="outline">Faltam formar: {faltamFormar}</Badge>
          {totalTurnos > totalFormadasNoDia && (
            <Badge className="mt-2 animate-pulse bg-green-100 text-green-800 border-green-200" variant="outline">
              Cargas a mais: {totalTurnos - totalFormadasNoDia}
            </Badge>
          )}
        </Card>
        <Card className="p-4 flex flex-col items-center bg-blue-50 border border-blue-100">
          <span className="text-4xl font-bold text-blue-700">{trips.length}</span>
          <span className="text-sm text-blue-800 mt-1">Total de Viagens</span>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Com BOX-D: {viagensComBoxD}</Badge>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">Sem BOX-D: {viagensSemBoxD}</Badge>
          </div>
        </Card>
        <Card className="p-4 flex flex-col items-center bg-yellow-50 border border-yellow-100">
          <span className="text-4xl font-bold text-yellow-700">{preBoxes.length}</span>
          <span className="text-sm text-yellow-800 mt-1">PRE-BOX cadastrados</span>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Livres: {livres}</Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Em Viagem: {emViagem}</Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Bloqueados: {bloqueados}</Badge>
          </div>
        </Card>
      </div>

      {/* Tipos de carga por região - Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {regioes.map((r) => {
          const total = Number(r.chamada) + Number(r.fechamento) + Number(r.antes) + Number(r.turno1) + Number(r.turno2) + Number(r.turno3);
          return (
            <Card key={r.sigla} className="flex flex-col items-center p-4 bg-gray-50 border border-gray-200">
              <span className="text-2xl font-bold text-blue-700 mb-1">{r.sigla}</span>
              <span className="text-sm text-gray-700 mb-2">{r.nome}</span>
              <span className="text-3xl font-bold text-indigo-800 mb-2">{total}</span>
              <div className="flex flex-wrap gap-1 justify-center text-xs">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Chamada: {r.chamada}</Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Fech: {r.fechamento}</Badge>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Antes: {r.antes}</Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">1T: {r.turno1}</Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">2T: {r.turno2}</Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">3T: {r.turno3}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
