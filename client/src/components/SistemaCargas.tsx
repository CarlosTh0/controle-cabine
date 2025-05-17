import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTrip } from "../contexts/TripContext";
import useSistemaCargasStore, { CargaItem } from "../hooks/useSistemaCargasStore";

export default function SistemaCargas() {
  const { trips } = useTrip();
  const store = useSistemaCargasStore();
  
  // Estados locais do componente
  const [cargas, setCargas] = useState<CargaItem[]>(store.cargas);
  const [filtro, setFiltro] = useState("");
  const [selecionarArquivo, setSelecionarArquivo] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [ordenacao, setOrdenacao] = useState<"hora" | "viagem" | "frota" | "preBox" | "boxD" | "status">("hora");
  
  // Estatísticas
  const [totalViagens, setTotalViagens] = useState(store.totalViagens);
  const [totalDisponiveis, setTotalDisponiveis] = useState(store.totalDisponiveis);
  const [totalEmCarregamento, setTotalEmCarregamento] = useState(store.totalEmCarregamento);
  const [totalCompletadas, setTotalCompletadas] = useState(store.totalCompletadas);

  // Inicializar com dados se for a primeira vez
  useEffect(() => {
    if (store.cargas.length === 0) {
      const cargasIniciais: CargaItem[] = [
        {
          id: "1",
          hora: "04:05",
          viagem: "V001",
          frota: "F123",
          preBox: "300-356 ou 50-56",
          boxD: "1-32",
          status: "LIVRE"
        },
        {
          id: "2",
          hora: "04:05",
          viagem: "V001",
          frota: "F123",
          preBox: "300-356 ou 50-56",
          boxD: "1-32",
          status: "LIVRE"
        },
        {
          id: "3",
          hora: "04:05",
          viagem: "V001",
          frota: "F123",
          preBox: "300-356 ou 50-56",
          boxD: "1-32",
          status: "LIVRE"
        },
        {
          id: "4",
          hora: "04:05",
          viagem: "V001",
          frota: "F123",
          preBox: "300-356 ou 50-56",
          boxD: "1-32",
          status: "LIVRE"
        },
        {
          id: "5",
          hora: "04:05",
          viagem: "V001",
          frota: "F123",
          preBox: "300-356 ou 50-56",
          boxD: "1-32",
          status: "LIVRE"
        }
      ];
      
      // Adicionar dados iniciais ao store
      store.addCargas(cargasIniciais);
    }
    
    // Função para atualizar os estados locais quando o store mudar
    const atualizarEstadosLocais = () => {
      setCargas(store.cargas);
      setTotalViagens(store.totalViagens);
      setTotalDisponiveis(store.totalDisponiveis);
      setTotalEmCarregamento(store.totalEmCarregamento);
      setTotalCompletadas(store.totalCompletadas);
    };
    
    // Subscrever a mudanças no store
    const unsubscribe = store.subscribe(atualizarEstadosLocais);
    
    // Carregar estado inicial
    atualizarEstadosLocais();
    
    // Limpar subscrição quando o componente for desmontado
    return () => {
      unsubscribe();
    };
  }, [store]);

  // Adicionar nova carga
  const adicionarCarga = () => {
    // Gerar ID único para evitar conflitos de chaves
    const uniqueId = `nova-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const novaCarga: CargaItem = {
      id: uniqueId,
      hora: "00:00",
      viagem: "V000",
      frota: "F000",
      preBox: "",
      boxD: "",
      status: "LIVRE"
    };
    
    store.addCarga(novaCarga);
  };

  // Mudar status de uma carga
  const mudarStatus = (id: string, novoStatus: CargaItem["status"]) => {
    store.updateCarga(id, { status: novoStatus });
  };

  // Remover uma carga
  const removerCarga = (id: string) => {
    store.removeCarga(id);
  };

  // Processar o arquivo selecionado
  const processarArquivo = async () => {
    if (!arquivoSelecionado) {
      alert("Nenhum arquivo selecionado");
      return;
    }
    
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Assume que a primeira planilha contém os dados
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Converter para JSON com cabeçalhos explícitos
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
          
          console.log(`Arquivo carregado: ${arquivoSelecionado.name}`);
          console.log(`Número de linhas: ${jsonData.length}`);
          
          if (jsonData.length <= 1) {
            console.error(`Arquivo sem dados: ${arquivoSelecionado.name}`);
            alert("O arquivo não contém dados suficientes.");
            setSelecionarArquivo(false);
            setArquivoSelecionado(null);
            return;
          }
          
          // Log para verificar a estrutura dos dados
          console.log("Dados do arquivo:", jsonData);
          
          // Obter dados das viagens existentes para vincular PRE-BOX e BOX-D
          const viagensData: Record<string, { preBox: string, boxD: string }> = {};
          
          trips.forEach((trip: any) => {
            if (trip.viagem) {
              viagensData[trip.viagem] = {
                preBox: trip.preBox || '',
                boxD: trip.boxD || ''
              };
            }
          });
          
          // Processar os dados extraindo as colunas necessárias
          const processedData: CargaItem[] = [];
          
          // Função para extrair hora de uma string de data/hora
          const extrairHora = (dataHoraStr: string): string => {
            const timeMatch = dataHoraStr.match(/(\d{1,2}:\d{2})/);
            return timeMatch ? timeMatch[1] : "";
          };
          
          // Processar os dados extraindo as colunas necessárias
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            
            // Verificar se a linha tem dados suficientes
            if (!row || row.length < 8) {
              console.log(`Linha ${i+1} não tem dados suficientes:`, row);
              continue;
            }
            
            // A = coluna 0 (Data/Hora)
            // G = coluna 6 (Viagem TMS)
            // H = coluna 7 (Frota)
            const dataHoraValue = row[0];
            const viagemValue = row[6];
            const frotaValue = row[7];
            
            console.log(`Linha ${i+1}:`, { dataHora: dataHoraValue, viagem: viagemValue, frota: frotaValue });
            
            if (!dataHoraValue || !viagemValue) {
              console.log(`Linha ${i+1} não tem dados essenciais`);
              continue;
            }
            
            let horaFormatada = "";
            
            // Processar a data/hora baseado no tipo
            if (typeof dataHoraValue === 'string') {
              horaFormatada = extrairHora(dataHoraValue);
              if (!horaFormatada) {
                try {
                  const dt = new Date(dataHoraValue);
                  if (!isNaN(dt.getTime())) {
                    horaFormatada = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  }
                } catch (e) {
                  console.log(`Erro ao processar data: ${e}`);
                }
              }
            } else if (typeof dataHoraValue === 'number') {
              // Excel guarda datas como números
              try {
                const dt = new Date(Math.round((dataHoraValue - 25569) * 86400 * 1000));
                if (!isNaN(dt.getTime())) {
                  horaFormatada = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }
              } catch (e) {
                console.log(`Erro ao processar número como data: ${e}`);
              }
            } else if (dataHoraValue instanceof Date) {
              horaFormatada = dataHoraValue.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            if (!horaFormatada) {
              console.log(`Não foi possível extrair hora da linha ${i+1}`);
              continue;
            }
            
            // Converter valores para string
            const viagem = String(viagemValue || '');
            const frota = String(frotaValue || '');
            
            // Obter PRE-BOX e BOX-D da lista de viagens existentes
            const preBox = viagensData[viagem]?.preBox || '';
            const boxD = viagensData[viagem]?.boxD || '';
            
            const novaCarga: CargaItem = {
              id: (store.cargas.length + processedData.length + 1).toString(),
              hora: horaFormatada,
              viagem: viagem,
              frota: frota,
              preBox: preBox,
              boxD: boxD,
              status: "LIVRE"
            };
            
            console.log(`Nova carga adicionada:`, novaCarga);
            processedData.push(novaCarga);
          }
          
          // Ordenar as cargas por hora
          processedData.sort((a, b) => a.hora.localeCompare(b.hora));
          
          // Adicionar as cargas processadas ao store
          store.addCargas(processedData);
          
          alert(`Arquivo "${arquivoSelecionado.name}" processado com sucesso! ${processedData.length} registros importados.`);
          setSelecionarArquivo(false);
          setArquivoSelecionado(null);
        } catch (error) {
          console.error("Erro ao processar o arquivo Excel:", error);
          alert(`Erro ao processar o arquivo: ${error}`);
          setSelecionarArquivo(false);
          setArquivoSelecionado(null);
        }
      };
      
      reader.onerror = () => {
        alert("Erro ao ler o arquivo");
        setSelecionarArquivo(false);
        setArquivoSelecionado(null);
      };
      
      reader.readAsArrayBuffer(arquivoSelecionado);
    } catch (error) {
      console.error("Erro ao importar a biblioteca XLSX:", error);
      alert(`Erro ao importar a biblioteca: ${error}`);
      setSelecionarArquivo(false);
      setArquivoSelecionado(null);
    }
  };
  
  // Função para processar múltiplos arquivos automaticamente
  const buscarArquivosAutomaticamente = async () => {
    try {
      // Seleção de múltiplos arquivos
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.xlsx, .xls';
      
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        
        if (files.length === 0) {
          alert("Nenhum arquivo selecionado");
          return;
        }
        
        try {
          const XLSX = await import('xlsx');
          let todasCargas: CargaItem[] = [];
          
          // Obter dados das viagens existentes para vincular PRE-BOX e BOX-D
          const viagensData: Record<string, { preBox: string, boxD: string }> = {};
          
          trips.forEach((trip: any) => {
            if (trip.viagem) {
              viagensData[trip.viagem] = {
                preBox: trip.preBox || '',
                boxD: trip.boxD || ''
              };
            }
          });
          
          // Função para extrair hora de uma string de data/hora
          const extrairHora = (dataHoraStr: string): string => {
            const timeMatch = dataHoraStr.match(/(\d{1,2}:\d{2})/);
            return timeMatch ? timeMatch[1] : "";
          };
          
          // Processar cada arquivo
          for (const file of files) {
            const reader = new FileReader();
            
            // Converter a leitura para uma promise para facilitar o processamento sequencial
            const readFileAsArrayBuffer = () => {
              return new Promise<ArrayBuffer>((resolve, reject) => {
                reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
                reader.onerror = () => reject(new Error(`Erro ao ler o arquivo ${file.name}`));
                reader.readAsArrayBuffer(file);
              });
            };
            
            try {
              const arrayBuffer = await readFileAsArrayBuffer();
              const data = new Uint8Array(arrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              
              // Assume que a primeira planilha contém os dados
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              
              // Converter para JSON com cabeçalhos explícitos
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
              
              console.log(`Arquivo carregado: ${file.name}`);
              console.log(`Número de linhas: ${jsonData.length}`);
              
              if (jsonData.length <= 1) {
                console.error(`Arquivo sem dados: ${file.name}`);
                continue;
              }
              
              // Log para verificar a estrutura dos dados
              console.log("Dados do arquivo:", jsonData);
              
              // Processar os dados das linhas
              for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                
                // Verificar se a linha tem dados suficientes
                if (!row || row.length < 8) {
                  console.log(`Linha ${i+1} não tem dados suficientes:`, row);
                  continue;
                }
                
                // A = coluna 0 (Data/Hora)
                // G = coluna 6 (Viagem TMS)
                // H = coluna 7 (Frota)
                const dataHoraValue = row[0];
                const viagemValue = row[6];
                const frotaValue = row[7];
                
                console.log(`Linha ${i+1}:`, { dataHora: dataHoraValue, viagem: viagemValue, frota: frotaValue });
                
                if (!dataHoraValue || !viagemValue) {
                  console.log(`Linha ${i+1} não tem dados essenciais`);
                  continue;
                }
                
                let horaFormatada = "";
                
                // Processar a data/hora baseado no tipo
                if (typeof dataHoraValue === 'string') {
                  horaFormatada = extrairHora(dataHoraValue);
                  if (!horaFormatada) {
                    try {
                      const dt = new Date(dataHoraValue);
                      if (!isNaN(dt.getTime())) {
                        horaFormatada = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      }
                    } catch (e) {
                      console.log(`Erro ao processar data: ${e}`);
                    }
                  }
                } else if (typeof dataHoraValue === 'number') {
                  // Excel guarda datas como números
                  try {
                    const dt = new Date(Math.round((dataHoraValue - 25569) * 86400 * 1000));
                    if (!isNaN(dt.getTime())) {
                      horaFormatada = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    }
                  } catch (e) {
                    console.log(`Erro ao processar número como data: ${e}`);
                  }
                } else if (dataHoraValue instanceof Date) {
                  horaFormatada = dataHoraValue.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }
                
                if (!horaFormatada) {
                  console.log(`Não foi possível extrair hora da linha ${i+1}`);
                  continue;
                }
                
                // Converter valores para string
                const viagem = String(viagemValue || '');
                const frota = String(frotaValue || '');
                
                // Obter PRE-BOX e BOX-D da lista de viagens existentes
                const preBox = viagensData[viagem]?.preBox || '';
                const boxD = viagensData[viagem]?.boxD || '';
                
                // Gerar um ID único baseado no timestamp e um número aleatório
                const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${i}`;
                
                const novaCarga: CargaItem = {
                  id: uniqueId,
                  hora: horaFormatada,
                  viagem: viagem,
                  frota: frota,
                  preBox: preBox,
                  boxD: boxD,
                  status: "LIVRE"
                };
                
                console.log(`Nova carga adicionada:`, novaCarga);
                todasCargas.push(novaCarga);
              }
              
              console.log(`Arquivo ${file.name} processado: ${jsonData.length} linhas, ${todasCargas.length} cargas válidas`);
            } catch (error) {
              console.error(`Erro ao processar o arquivo ${file.name}:`, error);
              alert(`Erro ao processar o arquivo ${file.name}: ${error}`);
            }
          }
          
          // Ordenar as cargas por hora
          todasCargas.sort((a, b) => a.hora.localeCompare(b.hora));
          
          // Adicionar as cargas processadas ao store
          store.addCargas(todasCargas);
          
          alert(`Processamento concluído! ${todasCargas.length} registros importados de ${files.length} arquivos.`);
        } catch (error) {
          console.error("Erro ao importar a biblioteca XLSX:", error);
          alert(`Erro ao importar a biblioteca: ${error}`);
        }
      };
      
      // Simular o clique no input
      input.click();
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
      alert(`Erro ao buscar arquivos: ${error}`);
    }
  };

  // Filtrar as cargas com base na busca
  const cargasFiltradas = filtro ? store.filterCargas(filtro) : cargas;

  // Ordenar as cargas
  const cargasOrdenadas = [...cargasFiltradas].sort((a, b) => {
    if (ordenacao === "hora") return a.hora.localeCompare(b.hora);
    if (ordenacao === "viagem") return a.viagem.localeCompare(b.viagem);
    if (ordenacao === "frota") return a.frota.localeCompare(b.frota);
    if (ordenacao === "preBox") return a.preBox.localeCompare(b.preBox);
    if (ordenacao === "boxD") return a.boxD.localeCompare(b.boxD);
    return a.status.localeCompare(b.status);
  });

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bem-vindo, Operador!</h2>
            <p className="text-gray-600">Sistema de Gerenciamento de Cegonheiras</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">Gerencie suas cargas, acompanhe status e mantenha sua frota organizada em um só lugar.</p>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative">
            <Button 
              variant="outline" 
              className="border-dashed border-2 border-gray-300 flex items-center space-x-2 h-auto py-3"
              onClick={() => setSelecionarArquivo(true)}
            >
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Escolher arquivo</span>
            </Button>
            <span className="ml-3 text-sm text-gray-500">
              {arquivoSelecionado ? arquivoSelecionado.name : "Nenhum arquivo escolhido"}
            </span>
            
            {selecionarArquivo && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white shadow-lg rounded-md p-4 z-10 border">
                <h3 className="text-lg font-semibold mb-3">Selecionar Arquivo</h3>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setArquivoSelecionado(e.target.files?.[0] || null)}
                />
                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelecionarArquivo(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={processarArquivo}>
                    Processar
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            variant="default" 
            className="bg-green-500 hover:bg-green-600"
            onClick={buscarArquivosAutomaticamente}
          >
            Buscar Arquivos Automaticamente
          </Button>
          
          <Button 
            variant="outline" 
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx, .xls';
              
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  setArquivoSelecionado(file);
                  processarArquivo();
                }
              };
              
              input.click();
            }}
          >
            Carregar Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border border-blue-100 shadow-sm rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 opacity-50">
            <svg className="h-8 w-8 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-blue-800 mb-1">Total de Viagem</h3>
          <p className="text-3xl font-bold text-blue-900">{totalViagens}</p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-blue-700 hover:text-blue-800">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
            </svg>
          </Button>
        </Card>
        
        <Card className="p-4 bg-green-50 border border-green-100 shadow-sm rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 opacity-50">
            <svg className="h-8 w-8 text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-green-800 mb-1">Disponíveis</h3>
          <p className="text-3xl font-bold text-green-900">{totalDisponiveis}</p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-green-700 hover:text-green-800">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </Button>
        </Card>
        
        <Card className="p-4 bg-purple-50 border border-purple-100 shadow-sm rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 opacity-50">
            <svg className="h-8 w-8 text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-purple-800 mb-1">Em Carregamento</h3>
          <p className="text-3xl font-bold text-purple-900">{totalEmCarregamento}</p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-purple-700 hover:text-purple-800">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </Card>
        
        <Card className="p-4 bg-violet-50 border border-violet-100 shadow-sm rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 opacity-50">
            <svg className="h-8 w-8 text-violet-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-violet-800 mb-1">Completadas</h3>
          <p className="text-3xl font-bold text-violet-900">{totalCompletadas}</p>
          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-violet-700 hover:text-violet-800">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </Card>
      </div>

      <Card className="p-6 shadow-lg rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Lista de Cargas</h3>
            <Badge variant="outline" className="ml-2 text-sm font-normal">
              {cargasOrdenadas.length} de {cargas.length} registros
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Exportar para Excel
                alert('Exportando para Excel...');
              }}
            >
              Exportar Excel
            </Button>
            <Button 
              size="sm"
              onClick={adicionarCarga}
            >
              Adicionar Carga
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Buscar viagem, frota, box..."
              className="pl-10"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Select
              value="todos"
              onValueChange={() => {}}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="livre">Livre</SelectItem>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="carregamento">Em Carregamento</SelectItem>
                <SelectItem value="completo">Completo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={ordenacao}
              onValueChange={(valor: any) => setOrdenacao(valor)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hora">Hora</SelectItem>
                <SelectItem value="viagem">Viagem</SelectItem>
                <SelectItem value="frota">Frota</SelectItem>
                <SelectItem value="preBox">PRE-BOX</SelectItem>
                <SelectItem value="boxD">BOX-D</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HORA
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIAGEM
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FROTA
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PRE-BOX
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOX-D
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cargasOrdenadas.map((carga) => (
                <tr key={carga.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-200 rounded-md text-sm"
                      value={carga.hora}
                      onChange={(e) => store.updateCarga(carga.id, { hora: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-200 rounded-md text-sm"
                      value={carga.viagem}
                      onChange={(e) => store.updateCarga(carga.id, { viagem: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-200 rounded-md text-sm"
                      value={carga.frota}
                      onChange={(e) => store.updateCarga(carga.id, { frota: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-200 rounded-md text-sm"
                      value={carga.preBox}
                      onChange={(e) => store.updateCarga(carga.id, { preBox: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-200 rounded-md text-sm"
                      value={carga.boxD}
                      onChange={(e) => store.updateCarga(carga.id, { boxD: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Badge 
                        variant={
                          carga.status === "LIVRE" ? "outline" :
                          carga.status === "OCUPADO" ? "secondary" :
                          carga.status === "EM_CARREGAMENTO" ? "default" :
                          "outline"
                        }
                        className={
                          carga.status === "LIVRE" ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" :
                          carga.status === "OCUPADO" ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" :
                          carga.status === "EM_CARREGAMENTO" ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" :
                          "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                        }
                      >
                        {carga.status === "LIVRE" && "LIVRE"}
                        {carga.status === "OCUPADO" && "OCUPADO"}
                        {carga.status === "EM_CARREGAMENTO" && "EM CARREGAMENTO"}
                        {carga.status === "COMPLETO" && "COMPLETO"}
                      </Badge>
                      <button 
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          const novoStatus = carga.status === "LIVRE" ? "OCUPADO" : 
                                            carga.status === "OCUPADO" ? "EM_CARREGAMENTO" : 
                                            carga.status === "EM_CARREGAMENTO" ? "COMPLETO" : "LIVRE";
                          mudarStatus(carga.id, novoStatus as CargaItem["status"]);
                        }}
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removerCarga(carga.id)}
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}