import React, { useState, useRef, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";
import { PlusIcon } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useToast } from "../hooks/use-toast";

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [localPreBoxId, setLocalPreBoxId] = useState("");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddModal]);

  // Função para ordenação alfanumérica natural
  const naturalSort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  // Sort PRE-BOXes by ID (garante ordem crescente sempre)
  const sortedPreBoxes = [...preBoxes].sort((a, b) => naturalSort(a.id, b.id));

  // Função para adicionar PRE-BOX via modal (agora só adiciona, não fecha o modal)
  const handleAddPreBoxModal = () => {
    setNewPreBoxId(localPreBoxId);
    handleAddPreBox();
    setTimeout(() => {
      if (!error) {
        setLocalPreBoxId("");
        toast({ title: "PRE-BOX adicionado com sucesso!" });
        // Mantém o modal aberto para adicionar mais
      }
    }, 100);
  };

  // Permitir salvar ao pressionar Enter
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPreBoxModal();
    }
    if (e.key === "Escape") {
      setShowAddModal(false);
      setLocalPreBoxId("");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerenciamento de PRE-BOX</h2>
      {/* Botão para abrir modal de adicionar PRE-BOX */}
      <div className="mb-6">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Adicionar PRE-BOX
        </button>
      </div>

      {/* Modal de adicionar PRE-BOX refinado */}
      {showAddModal && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-0 animate-scale-in">
            <form
              className="flex flex-col gap-4 p-8"
              onSubmit={e => { e.preventDefault(); handleAddPreBoxModal(); }}
              onKeyDown={handleModalKeyDown}
            >
              <div className="flex flex-col items-center mb-2">
                {/* Ícone de caixa animado */}
                <span className="bg-blue-100 rounded-full p-3 mb-2 animate-bounce-slow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 0v6a9 9 0 009 9 9 9 0 009-9V7m-9 4v9" /></svg>
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Adicionar Novo PRE-BOX</h3>
                <span className="text-gray-500 text-sm mb-2">Insira um ID entre 50-55, 300-356 ou alfanumérico (ex: A1, 300A)</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border border-gray-300 rounded-lg px-4 py-3 text-lg text-center transition-all duration-150"
                placeholder="ID do PRE-BOX"
                value={localPreBoxId}
                onChange={e => setLocalPreBoxId(e.target.value)}
                maxLength={10}
                autoFocus
                tabIndex={1}
              />
              {error && (
                <div className="flex items-center justify-center gap-2 bg-red-100 border border-red-300 text-red-700 rounded px-3 py-2 text-sm text-center animate-shake">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z' /></svg>
                  {error}
                </div>
              )}
              <div className="flex justify-center gap-3 mt-2">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-all duration-150"
                  onClick={() => { setShowAddModal(false); setLocalPreBoxId(""); }}
                  tabIndex={3}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-all duration-150"
                  tabIndex={2}
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Confirmar
                </button>
              </div>
            </form>
          </div>
          {/* Animations */}
          <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.25s ease; }
            @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-scale-in { animation: scale-in 0.25s cubic-bezier(.4,2,.6,1) both; }
            @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            .animate-bounce-slow { animation: bounce-slow 1.2s infinite; }
            @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
            .animate-shake { animation: shake 0.4s; }
          `}</style>
        </div>
      )}

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
