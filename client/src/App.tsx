import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import PreBoxManagement from "./components/PreBoxManagement";
import TripsTable from "./components/TripsTable";
import PainelCargas from "./components/PainelCargas";
import Resumo from "./components/Resumo";
import ConfirmationModal from "./components/ConfirmationModal";
import LoginForm from "./components/LoginForm";
import { TripProvider, useTrip } from "./contexts/TripContext";
import { CargasProvider } from "./contexts/CargasContext";
import { ViagensProvider } from "./contexts/ViagensContext";

function MainApp() {
  const { isAuthenticated, logout, currentUser } = useTrip();
  const [activeSection, setActiveSection] = useState<"dashboard" | "preBoxes" | "trips" | "painelCargas" | "resumo">("dashboard");

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Barra de usuário logado */}
      {isAuthenticated && (
        <div className="bg-blue-600 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>Usuário: <span className="font-bold">{currentUser}</span></div>
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
            >
              Sair
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {isAuthenticated ? (
            <>
              {activeSection === "dashboard" && <Dashboard />}
              {activeSection === "preBoxes" && <PreBoxManagement />}
              {activeSection === "trips" && <TripsTable />}
              {activeSection === "painelCargas" && <PainelCargas />}
              {activeSection === "resumo" && <Resumo />}
              <ConfirmationModal />
            </>
          ) : (
            <LoginForm />
          )}
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Sistema de Gerenciamento de Viagens &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TripProvider>
          <CargasProvider>
            <ViagensProvider>
              <MainApp />
              <Toaster />
            </ViagensProvider>
          </CargasProvider>
        </TripProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
