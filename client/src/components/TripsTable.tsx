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
  const [tripData, setTripData] = useState({
    oldTrip: "",
    boxD: "",
    quantity: "",
    shift: "1",
    region: "Sul",
    status: "Completa"
  });
  
  // Filtrar apenas PRE-BOXes com status LIVRE
  const availablePreBoxes = preBoxes.filter(pb => pb.status === "LIVRE");

  // Obter data e hora atuais formatadas
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Função para criar viagem com os dados do form
  const handleSubmitTrip = () => {
    if (selectedPreBox) {
      // Criar nova viagem com os dados do formulário
      handleQuickCreateTrip();
      setShowCreateForm(false);
      setSelectedPreBox("");
      setTripData({
        oldTrip: "",
        boxD: "",
        quantity: "",
        shift: "1",
        region: "Sul",
        status: "Completa"
      });
    }
  };

  // Função para criar viagem rapidamente
  const handleQuickCreateTrip = () => {
    // Criar viagem diretamente sem confirmação
    const preBox = preBoxes.find(pb => pb.id === selectedPreBox);
    if (preBox && preBox.status === "LIVRE") {
      // Usar o método do contexto para criar a viagem
      handleCreateTrip(selectedPreBox, tripData);
    }
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
      if (field === 'boxD') {
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
                    {trips.map((trip) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingCell?.tripId === trip.id && editingCell.field === 'oldTrip' ? (
                            <div className="flex items-center">
                              <input
                                type="text"
                                className="block w-full py-1 px-2 border-gray-300 rounded-md text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                              />
                              <button
                                onClick={saveEdit}
                                className="ml-1 text-green-600 hover:text-green-800"
                                title="Salvar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="ml-1 text-red-600 hover:text-red-800"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>{trip.oldTrip || "-"}</span>
                              <button
                                onClick={() => startEditing(trip.id, 'oldTrip', trip.oldTrip)}
                                className="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Editar"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status="VIAGEM" value={trip.preBox} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          {editingCell?.tripId === trip.id && editingCell.field === 'boxD' ? (
                            <div className="flex items-center">
                              <input
                                type="text"
                                className="block w-full py-1 px-2 border-gray-300 rounded-md text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                              />
                              <button
                                onClick={saveEdit}
                                className="ml-1 text-green-600 hover:text-green-800"
                                title="Salvar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="ml-1 text-red-600 hover:text-red-800"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>{trip.boxD || "-"}</span>
                              <button
                                onClick={() => startEditing(trip.id, 'boxD', trip.boxD)}
                                className="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Editar"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          {editingCell?.tripId === trip.id && editingCell.field === 'quantity' ? (
                            <div className="flex items-center">
                              <input
                                type="text"
                                className="block w-full py-1 px-2 border-gray-300 rounded-md text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                              />
                              <button
                                onClick={saveEdit}
                                className="ml-1 text-green-600 hover:text-green-800"
                                title="Salvar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="ml-1 text-red-600 hover:text-red-800"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>{trip.quantity}</span>
                              <button
                                onClick={() => startEditing(trip.id, 'quantity', trip.quantity)}
                                className="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Editar"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          {editingCell?.tripId === trip.id && editingCell.field === 'shift' ? (
                            <div className="flex items-center">
                              <select
                                className="block w-full py-1 px-2 border-gray-300 rounded-md text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                              >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                              </select>
                              <button
                                onClick={saveEdit}
                                className="ml-1 text-green-600 hover:text-green-800"
                                title="Salvar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="ml-1 text-red-600 hover:text-red-800"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>{trip.shift}</span>
                              <button
                                onClick={() => startEditing(trip.id, 'shift', trip.shift)}
                                className="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Editar"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group">
                          {editingCell?.tripId === trip.id && editingCell.field === 'region' ? (
                            <div className="flex items-center">
                              <select
                                className="block w-full py-1 px-2 border-gray-300 rounded-md text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                              >
                                <option value="Norte">Norte</option>
                                <option value="Sul">Sul</option>
                                <option value="Leste">Leste</option>
                                <option value="Oeste">Oeste</option>
                              </select>
                              <button
                                onClick={saveEdit}
                                className="ml-1 text-green-600 hover:text-green-800"
                                title="Salvar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="ml-1 text-red-600 hover:text-red-800"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>{trip.region}</span>
                              <button
                                onClick={() => startEditing(trip.id, 'region', trip.region)}
                                className="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Editar"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap group">
                          {editingCell?.tripId === trip.id && editingCell.field === 'status' ? (
                            <div className="flex items-center">
                              <select
                                className="block w-full py-1 px-2 border-gray-300 rounded-md text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                              >
                                <option value="Completa">Completa</option>
                                <option value="Incompleta">Incompleta</option>
                              </select>
                              <button
                                onClick={saveEdit}
                                className="ml-1 text-green-600 hover:text-green-800"
                                title="Salvar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="ml-1 text-red-600 hover:text-red-800"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${trip.status === "Completa" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                {trip.status}
                              </span>
                              <button
                                onClick={() => startEditing(trip.id, 'status', trip.status)}
                                className="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Editar"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.manifestDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => showConfirmModal({ type: 'deleteTrip', id: trip.id })}
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
