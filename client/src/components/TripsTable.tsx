import { useState } from "react";
import { useTrip } from "../contexts/TripContext";
import StatusBadge from "./StatusBadge";
import { PlusIcon, X } from "lucide-react";

const TripsTable: React.FC = () => {
  const { trips, preBoxes, handleCreateTrip, showConfirmModal } = useTrip();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPreBox, setSelectedPreBox] = useState("");
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
      
      {/* Create Trip Form */}
      {showCreateForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Criar Nova Viagem
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setShowCreateForm(false)}
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="pre-box" className="block text-sm font-medium text-gray-700">
                  Selecione um PRE-BOX livre
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
                    Não há PRE-BOXes livres. Vá para "Gerenciar PRE-BOX" para adicionar ou liberar um.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                onClick={handleCreateTrip}
                disabled={!selectedPreBox}
              >
                Criar Viagem
              </button>
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
                          {trip.oldTrip || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status="VIAGEM" value={trip.preBox} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.boxD}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.shift}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${trip.status === "Completa" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {trip.status}
                          </span>
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
