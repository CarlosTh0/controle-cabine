import { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";
import StatusBadge from "./StatusBadge";
import { PlusIcon, X, Edit, Check } from "lucide-react";

const TripsTable: React.FC = () => {
  const { trips, preBoxes, handleCreateTrip, handleUpdateTrip, showConfirmModal } = useTrip();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPreBox, setSelectedPreBox] = useState("");
  const [editingCell, setEditingCell] = useState<{tripId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDirectToBoxD, setCreateDirectToBoxD] = useState(false);
  const [tripData, setTripData] = useState({
    id: "",
    oldTrip: "",
    boxD: "",
    quantity: "",
    shift: "1",
    region: "Sul",
    status: "Completa",
    viagem: "" // Campo para VIAGEM
  });
  
  // Filtrar apenas PRE-BOXes com status LIVRE
  const availablePreBoxes = preBoxes.filter(pb => pb.status === "LIVRE");

  // Obter data e hora atuais formatadas
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`; // Formato DD/MM/YYYY
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Função para criar viagem com os dados do form
  const handleSubmitTrip = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Impedir recarregar a página
    
    if (createDirectToBoxD) {
      // Criar viagem diretamente para BOX-D sem PRE-BOX
      // Geramos um ID temporário para PRE-BOX apenas para satisfazer a API
      const tempPreBoxId = "DIRECT_TO_BOXD";
      const tripWithBoxD = {
        ...tripData,
        // Garantir que o BOX-D esteja preenchido em criação direta
        boxD: tripData.boxD || `BOX-D_${Math.floor(Math.random() * 10) + 1}`
      };
      handleCreateTrip(tempPreBoxId, tripWithBoxD, true); // Novo parâmetro "true" para indicar criação direta
    } else if (selectedPreBox) {
      // Criar nova viagem vinculada a um PRE-BOX
      const preBox = preBoxes.find(pb => pb.id === selectedPreBox);
      if (preBox && preBox.status === "LIVRE") {
        handleCreateTrip(selectedPreBox, tripData);
      }
    }
    
    // Limpar form e fechar
    setShowCreateForm(false);
    setSelectedPreBox("");
    setTripData({
      id: "",
      oldTrip: "",
      boxD: "",
      quantity: "",
      shift: "1",
      region: "Sul",
      status: "Completa",
      viagem: ""
    });
    setCreateDirectToBoxD(false);
  };
  
  // Função para ativar a edição de uma célula
  const startEditing = (tripId: string, field: string, currentValue: string) => {
    setEditingCell({ tripId, field });
    setEditValue(currentValue);
  };
  
  // Função para salvar a edição
  const saveEdit = () => {
    if (editingCell) {
      const { tripId, field } = editingCell;
      
      // Verificar se o campo é BOX-D para aplicar a lógica especial
      if (field === 'boxD' && editValue.trim() !== '') {
        // Se BOX-D está sendo preenchido, aplicar a lógica para liberar o PRE-BOX
        handleUpdateTrip(tripId, { [field]: editValue });
      } else {
        // Para outros campos, apenas atualizar o valor
        handleUpdateTrip(tripId, { [field]: editValue });
      }
      
      // Resetar o estado de edição
      setEditingCell(null);
      setEditValue("");
    }
  };
  
  // Função para editar diretamente
  const handleDirectEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, tripId: string, field: string) => {
    const value = e.target.value;
    
    // Atualizar diretamente sem necessidade de confirmar
    if (field === 'boxD' && value.trim() !== '') {
      // Aplicar lógica especial para BOX-D
      handleUpdateTrip(tripId, { [field]: value });
    } else {
      // Para outros campos, atualizar diretamente
      handleUpdateTrip(tripId, { [field]: value });
    }
  };
  
  // Função para cancelar a edição
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Viagens</h2>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Nova Viagem
        </button>
      </div>
      
      {/* Campo de pesquisa */}
      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Pesquisar por número de viagem ou viagem antiga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Create Trip Form - Popup simplificado */}
      {showCreateForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Nova Viagem
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-y-4">
                    {/* Data e Hora atuais (já preenchidas) */}
                    <div className="flex flex-wrap gap-4">
                      <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-700">Data</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-md">
                          {getCurrentDate()}
                        </div>
                      </div>
                      <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-700">Hora</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-md">
                          {getCurrentTime()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Seleção de PRE-BOX */}
                    <div>
                      <label htmlFor="pre-box" className="block text-sm font-medium text-gray-700">
                        PRE-BOX Livre
                      </label>
                      <select
                        id="pre-box"
                        name="pre-box"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={selectedPreBox}
                        onChange={(e) => setSelectedPreBox(e.target.value)}
                      >
                        <option value="">Selecione um PRE-BOX</option>
                        {availablePreBoxes.map((preBox) => (
                          <option key={preBox.id} value={preBox.id}>
                            PRE-BOX {preBox.id}
                          </option>
                        ))}
                      </select>
                      {availablePreBoxes.length === 0 && (
                        <p className="mt-2 text-sm text-red-600">
                          Não há PRE-BOXes livres disponíveis.
                        </p>
                      )}
                    </div>
                    
                    {/* Informações adicionais */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="trip-id" className="block text-sm font-medium text-gray-700">
                          VIAGEM (opcional)
                        </label>
                        <input
                          type="text"
                          id="trip-id"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={tripData.id}
                          onChange={(e) => setTripData({...tripData, id: e.target.value})}
                          placeholder="Número da viagem opcional"
                        />
                      </div>
                      <div>
                        <label htmlFor="old-trip" className="block text-sm font-medium text-gray-700">
                          Viagem Antiga
                        </label>
                        <input
                          type="text"
                          id="old-trip"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={tripData.oldTrip}
                          onChange={(e) => setTripData({...tripData, oldTrip: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="box-d" className="block text-sm font-medium text-gray-700">
                          BOX-D
                        </label>
                        <input
                          type="text"
                          id="box-d"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={tripData.boxD}
                          onChange={(e) => setTripData({...tripData, boxD: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantidade
                        </label>
                        <input
                          type="text"
                          id="quantity"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={tripData.quantity}
                          onChange={(e) => setTripData({...tripData, quantity: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label htmlFor="turno" className="block text-sm font-medium text-gray-700">
                          Turno
                        </label>
                        <select
                          id="turno"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={tripData.shift}
                          onChange={(e) => setTripData({...tripData, shift: e.target.value})}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                          Região
                        </label>
                        <select
                          id="region"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={tripData.region}
                          onChange={(e) => setTripData({...tripData, region: e.target.value})}
                        >
                          <option value="Norte">Norte</option>
                          <option value="Sul">Sul</option>
                          <option value="Leste">Leste</option>
                          <option value="Oeste">Oeste</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Situação
                        </label>
                        <select
                          id="status"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={tripData.status}
                          onChange={(e) => setTripData({...tripData, status: e.target.value})}
                        >
                          <option value="Completa">Completa</option>
                          <option value="Incompleta">Incompleta</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmitTrip}
                  disabled={!selectedPreBox}
                >
                  Criar Viagem
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Trips Table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Viagem
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hora
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Viagem Antiga
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PRE-BOX
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BOX-D
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Turno
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Região
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Situação
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Prev. Manifesto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Filtra as viagens com base no termo de pesquisa */}
                    {trips.filter(trip => {
                      if (searchTerm === "") return true;
                      
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        trip.id.toLowerCase().includes(searchLower) || 
                        (trip.oldTrip && trip.oldTrip.toLowerCase().includes(searchLower))
                      );
                    }).map((trip) => (
                      <tr key={trip.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {trip.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          <input
                            type="text"
                            className="w-full bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                            value={trip.oldTrip || ""}
                            onChange={(e) => handleDirectEdit(e, trip.id, 'oldTrip')}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status="VIAGEM" value={trip.preBox} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          <input
                            type="text"
                            className="w-full bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                            value={trip.boxD || ""}
                            onChange={(e) => handleDirectEdit(e, trip.id, 'boxD')}
                            placeholder="BOX-D"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          <input
                            type="text"
                            className="w-full bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                            value={trip.quantity}
                            onChange={(e) => handleDirectEdit(e, trip.id, 'quantity')}
                            placeholder="Quantidade"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          <select
                            className="w-full bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                            value={trip.shift}
                            onChange={(e) => handleDirectEdit(e, trip.id, 'shift')}
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          <select
                            className="w-full bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                            value={trip.region}
                            onChange={(e) => handleDirectEdit(e, trip.id, 'region')}
                          >
                            <option value="Norte">Norte</option>
                            <option value="Sul">Sul</option>
                            <option value="Leste">Leste</option>
                            <option value="Oeste">Oeste</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap group">
                          <select
                            className={`w-full bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded ${trip.status === "Completa" ? "text-green-800" : "text-yellow-800"}`}
                            value={trip.status}
                            onChange={(e) => handleDirectEdit(e, trip.id, 'status')}
                          >
                            <option value="Completa" className="text-green-800 bg-green-100">Completa</option>
                            <option value="Incompleta" className="text-yellow-800 bg-yellow-100">Incompleta</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.manifestDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                            onClick={() => {
                              showConfirmModal({ type: 'deleteTrip', id: trip.id });
                            }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {trips.length === 0 && (
                      <tr>
                        <td colSpan={12} className="px-6 py-4 text-center text-sm text-gray-500">
                          Nenhuma viagem cadastrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripsTable;
