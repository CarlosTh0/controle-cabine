import { useTrip } from "../contexts/TripContext";
import { PlusIcon } from "lucide-react";
import StatusBadge from "./StatusBadge";

const PreBoxManagement: React.FC = () => {
  const { 
    preBoxes,
    newPreBoxId,
    error,
    setNewPreBoxId,
    handleAddPreBox,
    showConfirmModal,
    handleToggleStatus
  } = useTrip();

  // Sort PRE-BOXes by ID
  const sortedPreBoxes = [...preBoxes].sort((a, b) => parseInt(a.id) - parseInt(b.id));

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerenciamento de PRE-BOX</h2>
      
      {/* Add PRE-BOX Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Adicionar Novo PRE-BOX</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Insira um ID entre 50-55 ou 300-356.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-grow">
              <input
                type="number"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="ID do PRE-BOX"
                value={newPreBoxId}
                onChange={(e) => setNewPreBoxId(e.target.value)}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleAddPreBox}
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Adicionar PRE-BOX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRE-BOX Cards */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">PRE-BOX Disponíveis</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {sortedPreBoxes.map((preBox) => (
          <div key={preBox.id} className={`border rounded-lg shadow-sm overflow-hidden ${preBox.status === "LIVRE" ? "bg-green-100" : preBox.status === "VIAGEM" ? "bg-yellow-100" : "bg-red-100"}`}>
            <div className="px-3 py-2">
              <div className="flex justify-between items-center">
                <h4 className={`text-sm font-bold ${preBox.status === "LIVRE" ? "text-green-800" : preBox.status === "VIAGEM" ? "text-yellow-800" : "text-red-800"}`}>
                  PRE-BOX {preBox.id}
                </h4>
                <StatusBadge status={preBox.status} />
              </div>
              
              {preBox.status === "VIAGEM" && (
                <p className="text-xs mt-1 text-yellow-800">
                  Viagem: <strong>{preBox.tripId}</strong>
                </p>
              )}
              
              <div className="flex gap-1 mt-2">
                {(preBox.status === "LIVRE" || preBox.status === "BLOQUEADO") && (
                  <button
                    type="button"
                    className={`text-xs px-2 py-1 border border-transparent rounded shadow-sm text-white ${preBox.status === "LIVRE" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                    onClick={() => handleToggleStatus(preBox.id)}
                  >
                    {preBox.status === "LIVRE" ? "Bloquear" : "Liberar"}
                  </button>
                )}
                
                {preBox.status !== "VIAGEM" && (
                  <button
                    type="button"
                    className="text-xs px-2 py-1 border border-transparent rounded shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                    onClick={() => showConfirmModal({ type: 'deletePreBox', id: preBox.id })}
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {preBoxes.length === 0 && (
          <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Nenhum PRE-BOX cadastrado. Adicione um novo acima.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreBoxManagement;
