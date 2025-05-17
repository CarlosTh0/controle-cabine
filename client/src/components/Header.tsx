import { useState } from "react";

interface HeaderProps {
  activeSection: "dashboard" | "preBoxes" | "trips" | "painelCargas" | "resumo" | "sistemaCargas" | "estatisticas";
  setActiveSection: (section: "dashboard" | "preBoxes" | "trips" | "painelCargas" | "resumo" | "sistemaCargas" | "estatisticas") => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h1 className="text-xl font-bold text-white">Sistema de Gerenciamento de Viagens</h1>
        </div>
        <nav className="hidden md:block">
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveSection("dashboard")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === "dashboard" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveSection("preBoxes")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === "preBoxes" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"}`}
            >
              Gerenciar PRE-BOX
            </button>
            <button 
              onClick={() => setActiveSection("trips")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === "trips" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"}`}
            >
              Viagens
            </button>
            <button 
              onClick={() => setActiveSection("painelCargas")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === "painelCargas" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"}`}
            >
              Painel de Cargas
            </button>
            <button 
              onClick={() => setActiveSection("resumo")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === "resumo" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"}`}
            >
              Resumo
            </button>
            <button 
              onClick={() => setActiveSection("sistemaCargas")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === "sistemaCargas" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"}`}
            >
              Sistema de Cargas
            </button>
            <button 
              onClick={() => setActiveSection("estatisticas")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === "estatisticas" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"}`}
            >
              Estatísticas
            </button>
          </div>
        </nav>
        <div className="md:hidden">
          <button 
            className="text-white hover:text-blue-200 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="bg-blue-600 md:hidden">
          <div className="px-2 py-3 sm:px-3 flex flex-wrap">
            <button 
              onClick={() => {
                setActiveSection("dashboard");
                setMobileMenuOpen(false);
              }}
              className={`block w-full px-3 py-2 rounded-md text-base font-medium mb-1 ${activeSection === "dashboard" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-700"}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                setActiveSection("preBoxes");
                setMobileMenuOpen(false);
              }}
              className={`block w-full px-3 py-2 rounded-md text-base font-medium mb-1 ${activeSection === "preBoxes" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-700"}`}
            >
              Gerenciar PRE-BOX
            </button>
            <button 
              onClick={() => {
                setActiveSection("trips");
                setMobileMenuOpen(false);
              }}
              className={`block w-full px-3 py-2 rounded-md text-base font-medium mb-1 ${activeSection === "trips" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-700"}`}
            >
              Viagens
            </button>
            <button 
              onClick={() => {
                setActiveSection("painelCargas");
                setMobileMenuOpen(false);
              }}
              className={`block w-full px-3 py-2 rounded-md text-base font-medium mb-1 ${activeSection === "painelCargas" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-700"}`}
            >
              Painel de Cargas
            </button>
            <button 
              onClick={() => {
                setActiveSection("resumo");
                setMobileMenuOpen(false);
              }}
              className={`block w-full px-3 py-2 rounded-md text-base font-medium mb-1 ${activeSection === "resumo" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-700"}`}
            >
              Resumo
            </button>
            <button 
              onClick={() => {
                setActiveSection("sistemaCargas");
                setMobileMenuOpen(false);
              }}
              className={`block w-full px-3 py-2 rounded-md text-base font-medium ${activeSection === "sistemaCargas" ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-700"}`}
            >
              Sistema de Cargas
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
