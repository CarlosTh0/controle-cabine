import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import PreBoxManagement from "./components/PreBoxManagement";
import TripsTable from "./components/TripsTable";
import ConfirmationModal from "./components/ConfirmationModal";
import { useTrip } from "./contexts/TripContext";

function App() {
  const [activeSection, setActiveSection] = useState<"dashboard" | "preBoxes" | "trips">("dashboard");
  const { showModal } = useTrip();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header activeSection={activeSection} setActiveSection={setActiveSection} />
          
          <main className="flex-grow">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              {activeSection === "dashboard" && <Dashboard />}
              {activeSection === "preBoxes" && <PreBoxManagement />}
              {activeSection === "trips" && <TripsTable />}
            </div>
          </main>

          <footer className="bg-white">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-sm text-gray-500 text-center">
                Sistema de Gerenciamento de Viagens &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>

          {showModal && <ConfirmationModal />}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
