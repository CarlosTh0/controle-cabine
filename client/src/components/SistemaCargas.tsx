import { useState, useEffect } from "react";
import { useCargas } from "../contexts/CargasContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTrip } from "../contexts/TripContext";

// Interface para o gerenciamento de box
interface Box {
  id: string;
  status: "ocupado" | "livre" | "indisponivel";
  regiao: string;
  turno: string;
  placa?: string;
  veiculo?: string;
  motorista?: string;
  carga?: string;
  horaEntrada?: string;
  horaSaida?: string;
}

export default function SistemaCargas() {
  const { regioes, updateRegiao } = useCargas();
  const [activeTab, setActiveTab] = useState("turno1");
  const [activeBoxTab, setActiveBoxTab] = useState("box-config");
  const [searchBox, setSearchBox] = useState("");
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [totalBoxes, setTotalBoxes] = useState(40);
  const [totalOcupados, setTotalOcupados] = useState(0);
  const [totalLivres, setTotalLivres] = useState(0);
  const [totalIndisponiveis, setTotalIndisponiveis] = useState(0);
  const [editingBox, setEditingBox] = useState<Box | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { trips } = useTrip();

  // Explicação dos códigos de chamada e fechamento
  const chamadaInfo = "Chamada: Horário no qual os veículos devem chegar à praça de carregamento";
  const fechamentoInfo = "Fechamento: Horário limite para entrada de veículos no dia";
  const antesInfo = "Antes do Fechamento: Quantidade total de veículos que chegam antes do fechamento";
  const turnoInfo = "Turno: Quantidade de veículos que são carregados em cada turno";

  // Inicializar boxes
  useEffect(() => {
    const regioesList = ["P", "T", "L", "S", "N", "IM", "AP", "SB", "EXP"];
    const turnosList = ["1", "2", "3", "4", "5", "6"];
    
    const initialBoxes: Box[] = [];
    
    // Criar boxes iniciais (40 boxes)
    for (let i = 1; i <= totalBoxes; i++) {
      // Distribuir regiões e turnos de forma mais ou menos uniforme
      const regiao = regioesList[Math.floor(Math.random() * regioesList.length)];
      const turno = turnosList[Math.floor(Math.random() * turnosList.length)];
      
      // Aproximadamente 60% livres, 30% ocupados, 10% indisponíveis
      let status: "ocupado" | "livre" | "indisponivel";
      const random = Math.random();
      
      if (random < 0.3) {
        status = "ocupado";
      } else if (random < 0.9) {
        status = "livre";
      } else {
        status = "indisponivel";
      }
      
      const box: Box = {
        id: `BOX-${i.toString().padStart(2, '0')}`,
        status,
        regiao,
        turno
      };
      
      // Se ocupado, adicionar dados do veículo
      if (status === "ocupado") {
        const placas = ["ABC1234", "DEF5678", "GHI9012", "JKL3456", "MNO7890"];
        const veiculos = ["Caminhão 2 eixos", "Caminhão 3 eixos", "Carreta", "Bi-trem", "VUC"];
        const motoristas = ["João Silva", "José Santos", "Pedro Oliveira", "Paulo Pereira", "Marcos Souza"];
        
        box.placa = placas[Math.floor(Math.random() * placas.length)];
        box.veiculo = veiculos[Math.floor(Math.random() * veiculos.length)];
        box.motorista = motoristas[Math.floor(Math.random() * motoristas.length)];
        box.carga = `${Math.floor(Math.random() * 30) + 1} unidades`;
        
        const horaAtual = new Date();
        const horaEntrada = new Date(horaAtual);
        horaEntrada.setHours(horaEntrada.getHours() - Math.floor(Math.random() * 5));
        box.horaEntrada = horaEntrada.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (Math.random() > 0.5) {
          const horaSaida = new Date(horaEntrada);
          horaSaida.setHours(horaSaida.getHours() + Math.floor(Math.random() * 3) + 1);
          box.horaSaida = horaSaida.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
      }
      
      initialBoxes.push(box);
    }
    
    setBoxes(initialBoxes);
    
    // Atualizar contadores
    updateCounts(initialBoxes);
  }, []);
  
  // Atualizar contagens de boxes por status
  const updateCounts = (boxList: Box[]) => {
    setTotalOcupados(boxList.filter(box => box.status === "ocupado").length);
    setTotalLivres(boxList.filter(box => box.status === "livre").length);
    setTotalIndisponiveis(boxList.filter(box => box.status === "indisponivel").length);
  };
  
  // Alterar status de um box
  const changeBoxStatus = (id: string, newStatus: "ocupado" | "livre" | "indisponivel") => {
    const updatedBoxes = boxes.map(box => {
      if (box.id === id) {
        // Se estiver mudando para ocupado, adicionar informações básicas
        if (newStatus === "ocupado" && box.status !== "ocupado") {
          return {
            ...box,
            status: newStatus,
            placa: "",
            veiculo: "",
            motorista: "",
            carga: "",
            horaEntrada: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            horaSaida: undefined
          };
        }
        
        // Se estiver mudando para livre ou indisponível, remover informações do veículo
        if (newStatus !== "ocupado" && box.status === "ocupado") {
          return {
            ...box,
            status: newStatus,
            placa: undefined,
            veiculo: undefined,
            motorista: undefined,
            carga: undefined,
            horaEntrada: undefined,
            horaSaida: undefined
          };
        }
        
        return {
          ...box,
          status: newStatus
        };
      }
      return box;
    });
    
    setBoxes(updatedBoxes);
    updateCounts(updatedBoxes);
  };
  
  // Editar informações de um box
  const saveBoxEdit = (editedBox: Box) => {
    const updatedBoxes = boxes.map(box => 
      box.id === editedBox.id ? editedBox : box
    );
    
    setBoxes(updatedBoxes);
    setShowEditModal(false);
    setEditingBox(null);
  };
  
  // Filtrar boxes com base na pesquisa
  const filteredBoxes = searchBox 
    ? boxes.filter(box => 
        box.id.toLowerCase().includes(searchBox.toLowerCase()) ||
        box.regiao.toLowerCase().includes(searchBox.toLowerCase()) ||
        box.turno.toLowerCase().includes(searchBox.toLowerCase()) ||
        (box.placa && box.placa.toLowerCase().includes(searchBox.toLowerCase())) ||
        (box.motorista && box.motorista.toLowerCase().includes(searchBox.toLowerCase()))
      )
    : boxes;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sistema de Cargas</h2>
      </div>

      <Tabs defaultValue="box-config" className="w-full" onValueChange={setActiveBoxTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="box-config">Gerenciamento de BOX</TabsTrigger>
          <TabsTrigger value="config-cargas">Configuração de Cargas</TabsTrigger>
        </TabsList>
        
        {/* Tab de Gerenciamento de Box */}
        <TabsContent value="box-config" className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Gerenciamento de BOX</h3>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Pesquisar box, placa ou motorista..."
                  value={searchBox}
                  onChange={(e) => setSearchBox(e.target.value)}
                  className="w-72"
                />
              </div>
            </div>
            
            <div className="flex justify-between mb-4">
              <div className="flex space-x-4">
                <div className="p-2 bg-white border rounded-md shadow-sm">
                  <span className="font-semibold">Total:</span> {totalBoxes}
                </div>
                <div className="p-2 bg-green-100 border rounded-md shadow-sm">
                  <span className="font-semibold">Livres:</span> {totalLivres}
                </div>
                <div className="p-2 bg-yellow-100 border rounded-md shadow-sm">
                  <span className="font-semibold">Ocupados:</span> {totalOcupados}
                </div>
                <div className="p-2 bg-red-100 border rounded-md shadow-sm">
                  <span className="font-semibold">Indisponíveis:</span> {totalIndisponiveis}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-4">
              {filteredBoxes.map(box => (
                <div 
                  key={box.id}
                  className={`p-3 rounded-lg shadow-md border ${
                    box.status === "livre" ? "bg-green-50 border-green-200" :
                    box.status === "ocupado" ? "bg-yellow-50 border-yellow-200" :
                    "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{box.id}</span>
                    <Badge variant={
                      box.status === "livre" ? "outline" :
                      box.status === "ocupado" ? "secondary" :
                      "destructive"
                    }>
                      {box.status === "livre" ? "Livre" :
                       box.status === "ocupado" ? "Ocupado" :
                       "Indisponível"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm mb-2">
                    <div><span className="font-semibold">Região:</span> {box.regiao}</div>
                    <div><span className="font-semibold">Turno:</span> {box.turno}</div>
                    {box.status === "ocupado" && (
                      <>
                        {box.placa && <div><span className="font-semibold">Placa:</span> {box.placa}</div>}
                        {box.veiculo && <div><span className="font-semibold">Veículo:</span> {box.veiculo}</div>}
                        {box.carga && <div><span className="font-semibold">Carga:</span> {box.carga}</div>}
                        {box.horaEntrada && <div><span className="font-semibold">Entrada:</span> {box.horaEntrada}</div>}
                        {box.horaSaida && <div><span className="font-semibold">Saída:</span> {box.horaSaida}</div>}
                      </>
                    )}
                  </div>
                  
                  <div className="flex space-x-1 mt-2">
                    {box.status !== "livre" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => changeBoxStatus(box.id, "livre")}
                      >
                        Liberar
                      </Button>
                    )}
                    
                    {box.status !== "ocupado" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => changeBoxStatus(box.id, "ocupado")}
                      >
                        Ocupar
                      </Button>
                    )}
                    
                    {box.status !== "indisponivel" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => changeBoxStatus(box.id, "indisponivel")}
                      >
                        Bloquear
                      </Button>
                    )}
                    
                    {box.status === "ocupado" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => {
                          setEditingBox(box);
                          setShowEditModal(true);
                        }}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Modal de edição */}
          {showEditModal && editingBox && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-96 p-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Editar {editingBox.id}</h3>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Região</label>
                    <Select
                      value={editingBox.regiao}
                      onValueChange={(value) => setEditingBox({...editingBox, regiao: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a região" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P">Pranchinha (P)</SelectItem>
                        <SelectItem value="T">Tegma (T)</SelectItem>
                        <SelectItem value="L">Localiza (L)</SelectItem>
                        <SelectItem value="S">Sul (S)</SelectItem>
                        <SelectItem value="N">Norte (N)</SelectItem>
                        <SelectItem value="IM">Int. De Minas (IM)</SelectItem>
                        <SelectItem value="AP">Auto Port (AP)</SelectItem>
                        <SelectItem value="SB">Sobras (SB)</SelectItem>
                        <SelectItem value="EXP">Exportação (EXP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Turno</label>
                    <Select
                      value={editingBox.turno}
                      onValueChange={(value) => setEditingBox({...editingBox, turno: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Placa</label>
                    <Input
                      value={editingBox.placa || ""}
                      onChange={(e) => setEditingBox({...editingBox, placa: e.target.value})}
                      placeholder="Placa do veículo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Veículo</label>
                    <Input
                      value={editingBox.veiculo || ""}
                      onChange={(e) => setEditingBox({...editingBox, veiculo: e.target.value})}
                      placeholder="Tipo de veículo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Motorista</label>
                    <Input
                      value={editingBox.motorista || ""}
                      onChange={(e) => setEditingBox({...editingBox, motorista: e.target.value})}
                      placeholder="Nome do motorista"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Carga</label>
                    <Input
                      value={editingBox.carga || ""}
                      onChange={(e) => setEditingBox({...editingBox, carga: e.target.value})}
                      placeholder="Descrição da carga"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Hora de Entrada</label>
                    <Input
                      value={editingBox.horaEntrada || ""}
                      onChange={(e) => setEditingBox({...editingBox, horaEntrada: e.target.value})}
                      placeholder="HH:MM"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Hora de Saída (opcional)</label>
                    <Input
                      value={editingBox.horaSaida || ""}
                      onChange={(e) => setEditingBox({...editingBox, horaSaida: e.target.value})}
                      placeholder="HH:MM"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => saveBoxEdit(editingBox)}>
                    Salvar
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Tab de Configuração de Cargas */}
        <TabsContent value="config-cargas" className="space-y-4">
          <Tabs defaultValue="turno1" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="turno1">1º Turno</TabsTrigger>
              <TabsTrigger value="turno2">2º Turno</TabsTrigger>
              <TabsTrigger value="turno3">3º Turno</TabsTrigger>
            </TabsList>

            <TabsContent value="turno1" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Configuração de Cargas - 1º Turno</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Região
                        </th>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Chamada
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{chamadaInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Fechamento
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{fechamentoInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Antes
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{antesInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Turno
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{turnoInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {regioes.map((regiao, index) => (
                        <tr key={regiao.sigla} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {regiao.nome} ({regiao.sigla})
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.chamada}
                              onChange={(e) => updateRegiao(index, 'chamada', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.fechamento}
                              onChange={(e) => updateRegiao(index, 'fechamento', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.antes}
                              onChange={(e) => updateRegiao(index, 'antes', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.turno1}
                              onChange={(e) => updateRegiao(index, 'turno1', parseInt(e.target.value) || 0)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="turno2" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Configuração de Cargas - 2º Turno</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Região
                        </th>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Chamada
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{chamadaInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Fechamento
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{fechamentoInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Antes
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{antesInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Turno
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{turnoInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {regioes.map((regiao, index) => (
                        <tr key={regiao.sigla} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {regiao.nome} ({regiao.sigla})
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.chamada}
                              onChange={(e) => updateRegiao(index, 'chamada', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.fechamento}
                              onChange={(e) => updateRegiao(index, 'fechamento', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.antes}
                              onChange={(e) => updateRegiao(index, 'antes', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.turno2}
                              onChange={(e) => updateRegiao(index, 'turno2', parseInt(e.target.value) || 0)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="turno3" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Configuração de Cargas - 3º Turno</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Região
                        </th>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Chamada
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{chamadaInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Fechamento
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{fechamentoInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Antes
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{antesInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                                Turno
                              </th>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{turnoInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {regioes.map((regiao, index) => (
                        <tr key={regiao.sigla} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {regiao.nome} ({regiao.sigla})
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.chamada}
                              onChange={(e) => updateRegiao(index, 'chamada', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.fechamento}
                              onChange={(e) => updateRegiao(index, 'fechamento', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.antes}
                              onChange={(e) => updateRegiao(index, 'antes', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={regiao.turno3}
                              onChange={(e) => updateRegiao(index, 'turno3', parseInt(e.target.value) || 0)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            // Resetar dados para os valores padrão
            window.location.reload();
          }}
        >
          Resetar
        </Button>
        <Button
          onClick={() => {
            // Aqui poderíamos salvar os dados em um servidor
            alert("Dados salvos com sucesso!");
          }}
        >
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}