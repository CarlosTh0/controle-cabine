import { useState, useEffect, useCallback } from "react";
import { useTrip } from "../contexts/TripContext";
import StatusBadge from "./StatusBadge";
import { PlusIcon, X, Edit, Check, Keyboard } from "lucide-react";

const TripsTable: React.FC = () => {
  const { trips, preBoxes, handleCreateTrip, handleUpdateTrip, handleDeleteTrip, showConfirmModal } = useTrip();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPreBox, setSelectedPreBox] = useState("");
  const [editingCell, setEditingCell] = useState<{tripId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDirectToBoxD, setCreateDirectToBoxD] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [showBulkEditForm, setShowBulkEditForm] = useState(false);
  const [bulkEditField, setBulkEditField] = useState<string>("");
  const [bulkEditValue, setBulkEditValue] = useState<string>("");
  const [selectAll, setSelectAll] = useState(false);
  const [tripData, setTripData] = useState({
    id: "",
    oldTrip: "",
    boxD: "",
    quantity: "",
    shift: "1",
    region: "Sul",
    status: "Completa"
  });
  
  // Filtrar apenas PRE-BOXes com status LIVRE
  const availablePreBoxes = preBoxes.filter(pb => pb.status === "LIVRE");
  
  // Estado para mostrar/esconder a legenda de atalhos
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Gerenciador de atalhos de teclado
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ignora atalhos quando estiver em campos de input
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLSelectElement) {
        return;
      }

      // Alt+N: Nova viagem
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setShowCreateForm(true);
        setCreateDirectToBoxD(false);
      }
      
      // Alt+B: Nova viagem direto para BOX-D
      if (e.altKey && e.key === 'b') {
        e.preventDefault();
        setShowCreateForm(true);
        setCreateDirectToBoxD(true);
      }
      
      // Esc: Fechar formulário
      if (e.key === 'Escape' && showCreateForm) {
        e.preventDefault();
        setShowCreateForm(false);
        setCreateDirectToBoxD(false);
      }
      
      // Alt+F: Focar na busca
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('trip-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Alt+?: Mostrar/esconder legenda de atalhos
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };
    
    // Adiciona o listener
    document.addEventListener('keydown', handleKeydown);
    
    // Remove o listener quando o componente for desmontado
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [showCreateForm]);

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
    
    console.log("Tentando criar viagem", { selectedPreBox, tripData });
    
    // Se tem PRE-BOX selecionado, criar viagem normal
    if (selectedPreBox) {
      console.log("Criando viagem com PRE-BOX:", selectedPreBox);
      // Criar nova viagem vinculada a um PRE-BOX
      const preBox = preBoxes.find(pb => pb.id === selectedPreBox);
      if (preBox && preBox.status === "LIVRE") {
        handleCreateTrip(selectedPreBox, tripData);
      }
    } 
    // Se não tem PRE-BOX selecionado, criar direto para BOX-D
    else {
      console.log("Criando viagem direto para BOX-D");
      // ID temporário para PRE-BOX apenas para satisfazer a API
      const tempPreBoxId = "DIRECT_TO_BOXD";
      // Criar viagem diretamente no BOX-D
      handleCreateTrip(tempPreBoxId, tripData, true);
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
      status: "Completa"
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

  // Filtrar viagens com base no termo de pesquisa
  const filteredTrips = trips.filter(trip => {
    const searchLower = searchTerm.toLowerCase();
    return (
      trip.id.toLowerCase().includes(searchLower) ||
      trip.oldTrip.toLowerCase().includes(searchLower)
    );
  });
  
  // Função para lidar com seleção de viagens para edição em massa
  const handleTripSelection = (tripId: string) => {
    setSelectedTrips(prev => {
      if (prev.includes(tripId)) {
        return prev.filter(id => id !== tripId);
      } else {
        return [...prev, tripId];
      }
    });
  };
  
  // Função para selecionar/desselecionar todas as viagens
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTrips([]);
    } else {
      setSelectedTrips(filteredTrips.map(trip => trip.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Função para aplicar edição em massa
  const applyBulkEdit = () => {
    if (!bulkEditField || selectedTrips.length === 0) return;
    
    selectedTrips.forEach(tripId => {
      handleUpdateTrip(tripId, { [bulkEditField]: bulkEditValue });
    });
    
    // Limpar formulário após aplicar edições
    setBulkEditField("");
    setBulkEditValue("");
    setShowBulkEditForm(false);
    setSelectedTrips([]);
    setSelectAll(false);
  };
  
  // Cancelar edição em massa
  const cancelBulkEdit = () => {
    setShowBulkEditForm(false);
    setBulkEditField("");
    setBulkEditValue("");
  };

  // Keydown handler para o formulário de criação
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitTrip();
    }
  };
  
  // Função simplificada para criar viagem (para uso direto no botão)
  const handleButtonClick = () => {
    console.log("Botão de criar viagem clicado");
    handleSubmitTrip();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Viagens</h2>
          <button 
            className="ml-3 p-1 text-gray-500 hover:text-gray-800 focus:outline-none"
            onClick={() => setShowShortcuts(!showShortcuts)}
            title="Mostrar atalhos de teclado"
          >
            <Keyboard className="h-5 w-5" />
          </button>
          
          {showShortcuts && (
            <div className="absolute mt-20 ml-0 z-10 bg-white rounded-md shadow-lg p-4 border border-gray-200">
              <h3 className="text-md font-semibold mb-2">Atalhos de Teclado</h3>
              <ul className="text-sm space-y-1">
                <li><span className="font-mono bg-gray-100 px-1">Alt + N</span> - Nova viagem</li>
                <li><span className="font-mono bg-gray-100 px-1">Alt + B</span> - Nova viagem direto para BOX-D</li>
                <li><span className="font-mono bg-gray-100 px-1">Alt + F</span> - Buscar viagens</li>
                <li><span className="font-mono bg-gray-100 px-1">Esc</span> - Fechar janela atual</li>
                <li><span className="font-mono bg-gray-100 px-1">Alt + /</span> - Mostrar/ocultar atalhos</li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {selectedTrips.length > 0 ? (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => setShowBulkEditForm(true)}
            >
              <Edit className="-ml-1 mr-2 h-5 w-5" />
              Editar {selectedTrips.length} selecionados
            </button>
          ) : null}
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nova Viagem
          </button>
        </div>
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
      
      {/* Modal de edição em massa */}
      {showBulkEditForm && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-20 px-4 pb-20 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all mx-auto max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Edição em Massa ({selectedTrips.length} viagens)
                  </h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={cancelBulkEdit}
                  >
                    <span className="sr-only">Fechar</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="bulk-field" className="block text-sm font-medium text-gray-700">
                        Campo para editar
                      </label>
                      <select
                        id="bulk-field"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={bulkEditField}
                        onChange={(e) => setBulkEditField(e.target.value)}
                      >
                        <option value="">Selecione um campo</option>
                        <option value="boxD">BOX-D</option>
                        <option value="quantity">Quantidade</option>
                        <option value="shift">Turno</option>
                        <option value="region">Região</option>
                        <option value="status">Status</option>
                        <option value="manifestDate">Data Prev. do Manifesto</option>
                      </select>
                    </div>

                    {bulkEditField && (
                      <div>
                        <label htmlFor="bulk-value" className="block text-sm font-medium text-gray-700">
                          Novo valor
                        </label>
                        
                        {/* Inputs específicos baseados no campo selecionado */}
                        {(bulkEditField === 'boxD' || bulkEditField === 'quantity' || bulkEditField === 'manifestDate') && (
                          <input
                            type="text"
                            id="bulk-value"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={bulkEditValue}
                            onChange={(e) => setBulkEditValue(e.target.value)}
                          />
                        )}
                        
                        {bulkEditField === 'shift' && (
                          <select
                            id="bulk-value"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={bulkEditValue}
                            onChange={(e) => setBulkEditValue(e.target.value)}
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                          </select>
                        )}
                        
                        {bulkEditField === 'region' && (
                          <select
                            id="bulk-value"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={bulkEditValue}
                            onChange={(e) => setBulkEditValue(e.target.value)}
                          >
                            <option value="P">P</option>
                            <option value="T">T</option>
                            <option value="L">L</option>
                            <option value="S">S</option>
                            <option value="N">N</option>
                            <option value="IM">IM</option>
                            <option value="AP">AP</option>
                            <option value="SB">SB</option>
                            <option value="EXP">EXP</option>
                          </select>
                        )}
                        
                        {bulkEditField === 'status' && (
                          <select
                            id="bulk-value"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={bulkEditValue}
                            onChange={(e) => setBulkEditValue(e.target.value)}
                          >
                            <option value="1° Completa">1° Completa</option>
                            <option value="1° Incompleta">1° Incompleta</option>
                            <option value="2° Completa">2° Completa</option>
                            <option value="2° Incompleta">2° Incompleta</option>
                            <option value="3° Completa">3° Completa</option>
                            <option value="3° Incompleta">3° Incompleta</option>
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={applyBulkEdit}
                  disabled={!bulkEditField || !bulkEditValue}
                >
                  Aplicar a todos
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelBulkEdit}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Trip Form - Popup simplificado */}
      {showCreateForm && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-20 px-4 pb-20 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all mx-auto max-w-lg w-full" style={{ maxHeight: "80vh", overflowY: "auto" }}>
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
                
                <form onSubmit={handleSubmitTrip} onKeyDown={handleFormKeyDown}>
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
                      
                      {/* Seleção de PRE-BOX (opcional) */}
                      <div>
                        <label htmlFor="pre-box" className="block text-sm font-medium text-gray-700">
                          PRE-BOX (opcional)
                        </label>
                        <select
                          id="pre-box"
                          name="pre-box"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={selectedPreBox}
                          onChange={(e) => setSelectedPreBox(e.target.value)}
                        >
                          <option value="">Selecione um PRE-BOX ou deixe vazio para ir direto ao BOX-D</option>
                          {availablePreBoxes.map((preBox) => (
                            <option key={preBox.id} value={preBox.id}>
                              PRE-BOX {preBox.id}
                            </option>
                          ))}
                        </select>
                        {availablePreBoxes.length === 0 && (
                          <p className="mt-2 text-sm text-text-amber-600">
                            Não há PRE-BOXes livres disponíveis, mas você pode criar direto no BOX-D.
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
                            BOX-D {createDirectToBoxD && "(Obrigatório)"}
                          </label>
                          <input
                            type="text"
                            id="box-d"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={tripData.boxD}
                            onChange={(e) => setTripData({...tripData, boxD: e.target.value})}
                            required={createDirectToBoxD}
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
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {/* Campo de Turno foi removido do popup e agora é editável diretamente na tabela */}
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
                            <option value="P">P</option>
                            <option value="T">T</option>
                            <option value="L">L</option>
                            <option value="S">S</option>
                            <option value="N">N</option>
                            <option value="IM">IM</option>
                            <option value="AP">AP</option>
                            <option value="SB">SB</option>
                            <option value="EXP">EXP</option>
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
                            <option value="1° Completa">1° Completa</option>
                            <option value="1° Incompleta">1° Incompleta</option>
                            <option value="2° Completa">2° Completa</option>
                            <option value="2° Incompleta">2° Incompleta</option>
                            <option value="3° Completa">3° Completa</option>
                            <option value="3° Incompleta">3° Incompleta</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4">
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
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
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Trips Table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8" style={{ maxWidth: "95%" }}>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "500px" }}>
                <table className="w-full divide-y divide-gray-200" style={{ tableLayout: "fixed" }}>
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "3%" }}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "10%" }}>
                        Data / Hora
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "8%" }}>
                        Viagem
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "9%" }}>
                        Viagem Antiga
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "7%" }}>
                        PRE-BOX
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "7%" }}>
                        BOX-D
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "9%" }}>
                        Quantidade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "8%" }}>
                        Turno
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "8%" }}>
                        Região
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "12%" }}>
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "10%" }}>
                        Data Prev. do Manifesto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: "8%" }}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTrips.length > 0 ? (
                      filteredTrips.map(trip => (
                        <tr key={trip.id} className={selectedTrips.includes(trip.id) ? "bg-blue-50" : ""}>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={selectedTrips.includes(trip.id)}
                              onChange={() => handleTripSelection(trip.id)}
                            />
                          </td>
                          {/* Data/Hora */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <input 
                                type="text"
                                className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                                value={trip.date}
                                onChange={(e) => handleDirectEdit(e, trip.id, 'date')}
                              />
                            </div>
                            <div>
                              <input 
                                type="text"
                                className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                                value={trip.time}
                                onChange={(e) => handleDirectEdit(e, trip.id, 'time')}
                              />
                            </div>
                          </td>
                          
                          {/* Viagem */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingCell?.tripId === trip.id && editingCell?.field === 'id' ? (
                              <div className="flex items-center">
                                <input 
                                  type="text"
                                  className="block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                />
                                <div className="ml-2 flex space-x-1">
                                  <button onClick={saveEdit} className="text-green-600"><Check size={16} /></button>
                                  <button onClick={cancelEdit} className="text-red-600"><X size={16} /></button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <input 
                                  type="text"
                                  className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                                  value={trip.id}
                                  onChange={(e) => handleDirectEdit(e, trip.id, 'id')}
                                />
                              </div>
                            )}
                          </td>
                          
                          {/* Viagem Antiga */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="text"
                              className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                              value={trip.oldTrip}
                              onChange={(e) => handleDirectEdit(e, trip.id, 'oldTrip')}
                            />
                          </td>
                          
                          {/* PRE-BOX */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="text"
                              className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                              value={trip.preBox}
                              onChange={(e) => handleDirectEdit(e, trip.id, 'preBox')}
                              readOnly
                            />
                          </td>
                          
                          {/* BOX-D */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="text"
                              className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                              value={trip.boxD}
                              onChange={(e) => handleDirectEdit(e, trip.id, 'boxD')}
                              placeholder="BOX-D"
                            />
                          </td>
                          
                          {/* Quantidade */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="text"
                              className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                              value={trip.quantity}
                              onChange={(e) => handleDirectEdit(e, trip.id, 'quantity')}
                            />
                          </td>
                          
                          {/* Turno */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative" style={{ maxWidth: '80px', margin: '0 auto' }}>
                              <select 
                                className="appearance-none block w-full py-1 px-3 border border-gray-300 rounded-md focus:ring-0 sm:text-sm bg-white text-black font-medium"
                                value={trip.shift}
                                onChange={(e) => handleDirectEdit(e, trip.id, 'shift')}
                              >
                                <option value="1" className="text-black">1</option>
                                <option value="2" className="text-black">2</option>
                                <option value="3" className="text-black">3</option>
                                <option value="4" className="text-black">4</option>
                                <option value="5" className="text-black">5</option>
                                <option value="6" className="text-black">6</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </td>
                          
                          {/* Região */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative" style={{ maxWidth: '80px', margin: '0 auto' }}>
                              <select 
                                className="appearance-none block w-full py-1 px-3 border border-gray-300 rounded-md focus:ring-0 sm:text-sm bg-white text-black font-medium"
                                value={trip.region}
                                onChange={(e) => handleDirectEdit(e, trip.id, 'region')}
                              >
                                <option value="P" className="text-black">P</option>
                                <option value="T" className="text-black">T</option>
                                <option value="L" className="text-black">L</option>
                                <option value="S" className="text-black">S</option>
                                <option value="N" className="text-black">N</option>
                                <option value="IM" className="text-black">IM</option>
                                <option value="AP" className="text-black">AP</option>
                                <option value="SB" className="text-black">SB</option>
                                <option value="EXP" className="text-black">EXP</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </td>
                          
                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative" style={{ maxWidth: '150px', margin: '0 auto' }}>
                              <select 
                                className="appearance-none block w-full py-1 px-3 border border-gray-300 rounded-md focus:ring-0 sm:text-sm bg-white text-black font-medium"
                                value={trip.status}
                                onChange={(e) => handleDirectEdit(e, trip.id, 'status')}
                              >
                                <option value="1° Completa" className="text-black">1° Completa</option>
                                <option value="1° Incompleta" className="text-black">1° Incompleta</option>
                                <option value="2° Completa" className="text-black">2° Completa</option>
                                <option value="2° Incompleta" className="text-black">2° Incompleta</option>
                                <option value="3° Completa" className="text-black">3° Completa</option>
                                <option value="3° Incompleta" className="text-black">3° Incompleta</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </td>
                          
                          {/* Data Prev. do Manifesto */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="text"
                              className="block w-full py-1 px-2 border-none focus:ring-0 sm:text-sm"
                              value={trip.manifestDate || ''}
                              onChange={(e) => handleDirectEdit(e, trip.id, 'manifestDate')}
                              placeholder="Data do Manifesto"
                            />
                          </td>
                          
                          {/* Ações */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="text-red-600 hover:text-red-900 mr-2"
                              onClick={() => showConfirmModal({ type: 'deleteTrip', id: trip.id })}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                          Nenhuma viagem encontrada.
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