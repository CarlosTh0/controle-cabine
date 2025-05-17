import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Card } from "@/components/ui/card";
import { useTrip } from "../contexts/TripContext";
import { useSistemaCargasStore } from "../hooks/useSistemaCargasStore";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Intervalo para atualização de dados (30 segundos)
const UPDATE_INTERVAL = 30000;

export default function EstatisticasAvancadas() {
  const { trips } = useTrip();
  const cargasStore = useSistemaCargasStore();
  
  // Estados para os dados dos gráficos
  const [turnoPorDia, setTurnoPorDia] = useState<any[]>([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState<any[]>([]);
  const [indicadoresEficiencia, setIndicadoresEficiencia] = useState<any[]>([]);
  const [horaPico, setHoraPico] = useState<any[]>([]);
  
  // Estado para selecionar o período
  const [periodo, setPeriodo] = useState("hoje");
  
  // Efeito para calcular os dados dos gráficos
  useEffect(() => {
    // Função para calcular todas as estatísticas
    const calcularEstatisticas = () => {
      calcularTurnoPorDia();
      calcularStatusDistribuicao();
      calcularIndicadoresEficiencia();
      calcularHoraPico();
    };
    
    // Calcular inicialmente
    calcularEstatisticas();
    
    // Configurar atualização periódica
    const intervalId = setInterval(calcularEstatisticas, UPDATE_INTERVAL);
    
    // Limpar intervalo quando componente for desmontado
    return () => clearInterval(intervalId);
  }, [trips, cargasStore.cargas, periodo]);
  
  // Calcula dados para gráfico de distribuição por turno
  const calcularTurnoPorDia = () => {
    // Filtrar com base no período
    const turnoMap = new Map();
    turnoMap.set("1", { name: "Turno 1 Dia", value: 0 });
    turnoMap.set("2", { name: "Turno 1 Fechamento", value: 0 });
    turnoMap.set("3", { name: "Turno 2 Dia", value: 0 });
    turnoMap.set("4", { name: "Turno 2 Fechamento", value: 0 });
    turnoMap.set("5", { name: "Turno 3 Dia", value: 0 });
    turnoMap.set("6", { name: "Turno 3 Fechamento", value: 0 });
    
    trips.forEach(trip => {
      if (turnoMap.has(trip.shift)) {
        const item = turnoMap.get(trip.shift);
        item.value += parseInt(trip.quantity) || 1;
        turnoMap.set(trip.shift, item);
      }
    });
    
    setTurnoPorDia(Array.from(turnoMap.values()));
  };
  
  // Calcula dados para gráfico de distribuição por status
  const calcularStatusDistribuicao = () => {
    const statusMap = new Map();
    
    // Inicializar contadores de status
    statusMap.set("LIVRE", { name: "Livre", value: 0 });
    statusMap.set("OCUPADO", { name: "Ocupado", value: 0 });
    statusMap.set("EM_CARREGAMENTO", { name: "Em Carregamento", value: 0 });
    statusMap.set("COMPLETO", { name: "Completo", value: 0 });
    
    // Contar status das cargas
    cargasStore.cargas.forEach(carga => {
      if (statusMap.has(carga.status)) {
        const item = statusMap.get(carga.status);
        item.value += 1;
        statusMap.set(carga.status, item);
      }
    });
    
    setStatusDistribuicao(Array.from(statusMap.values()).filter(item => item.value > 0));
  };
  
  // Calcular indicadores de eficiência
  const calcularIndicadoresEficiencia = () => {
    // Tempo médio de carregamento (simulado)
    const indicadores = [
      { name: "Tempo Médio", valor: 45, meta: 60 },
      { name: "PRE-BOX Utilização", valor: 75, meta: 80 },
      { name: "BOX-D Utilização", valor: 65, meta: 70 },
      { name: "Taxa de Formação", valor: 85, meta: 90 }
    ];
    
    setIndicadoresEficiencia(indicadores);
  };
  
  // Calcular dados por hora do dia
  const calcularHoraPico = () => {
    const horaMap = new Map();
    
    // Inicializar todas as horas do dia
    for (let i = 0; i < 24; i++) {
      const hora = i.toString().padStart(2, '0') + ':00';
      horaMap.set(hora, { hora, quantidade: 0 });
    }
    
    // Contar cargas por hora
    cargasStore.cargas.forEach(carga => {
      // Extrair apenas a hora (formato "HH:MM")
      const hora = carga.hora.split(':')[0].padStart(2, '0') + ':00';
      
      if (horaMap.has(hora)) {
        const item = horaMap.get(hora);
        item.quantidade += 1;
        horaMap.set(hora, item);
      }
    });
    
    setHoraPico(Array.from(horaMap.values()));
  };
  
  // Formatação do tooltip no gráfico
  const formatoTooltip = (value: number) => [`${value} unidades`, ''];
  
  // Renderizar componente
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estatísticas Avançadas</h2>
        
        <div className="flex space-x-2">
          <div className="flex space-x-1 rounded-md bg-muted p-1">
            <button 
              className={`px-3 py-1.5 text-sm rounded-md ${periodo === "hoje" ? "bg-white shadow-sm" : "hover:bg-gray-100"}`}
              onClick={() => setPeriodo("hoje")}
            >
              Hoje
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md ${periodo === "semana" ? "bg-white shadow-sm" : "hover:bg-gray-100"}`}
              onClick={() => setPeriodo("semana")}
            >
              Semana
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md ${periodo === "mes" ? "bg-white shadow-sm" : "hover:bg-gray-100"}`}
              onClick={() => setPeriodo("mes")}
            >
              Mês
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Distribuição por Turno */}
        <Card className="p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Turno</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={turnoPorDia}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatoTooltip} />
              <Legend />
              <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Gráfico de Status de Cargas */}
        <Card className="p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Status das Cargas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribuicao}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribuicao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Gráfico de Indicadores de Eficiência */}
        <Card className="p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Indicadores de Eficiência</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={indicadoresEficiencia}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor Atual" fill="#82ca9d" />
              <Bar dataKey="meta" name="Meta" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Gráfico de Distribuição por Hora */}
        <Card className="p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Hora</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={horaPico}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="quantidade"
                name="Quantidade"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      <Card className="p-4 shadow-md mt-4">
        <h3 className="text-lg font-semibold mb-4">Estatísticas de Resumo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Total Viagens</div>
            <div className="text-2xl font-bold">{trips.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Cargas Monitoradas</div>
            <div className="text-2xl font-bold">{cargasStore.cargas.length}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Em Processamento</div>
            <div className="text-2xl font-bold">{cargasStore.totalEmCarregamento}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Completas</div>
            <div className="text-2xl font-bold">{cargasStore.totalCompletadas}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}