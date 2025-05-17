import { useState } from "react";
import { useCargas } from "../contexts/CargasContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function SistemaCargas() {
  const { regioes, updateRegiao } = useCargas();
  const [activeTab, setActiveTab] = useState("turno1");

  // Explicação dos códigos de chamada e fechamento
  const chamadaInfo = "Chamada: Horário no qual os veículos devem chegar à praça de carregamento";
  const fechamentoInfo = "Fechamento: Horário limite para entrada de veículos no dia";
  const antesInfo = "Antes do Fechamento: Quantidade total de veículos que chegam antes do fechamento";
  const turnoInfo = "Turno: Quantidade de veículos que são carregados em cada turno";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sistema de Cargas</h2>
      </div>

      <Tabs defaultValue="turno1" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="turno1">1º Turno</TabsTrigger>
          <TabsTrigger value="turno2">2º Turno</TabsTrigger>
          <TabsTrigger value="turno3">3º Turno</TabsTrigger>
        </TabsList>

        <TabsContent value="turno1" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Configuração de Cargas - 1º Turno</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Região
                    </th>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Chamada
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{chamadaInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Fechamento
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fechamentoInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Antes
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{antesInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Turno
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{turnoInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regioes.map((regiao, index) => (
                    <tr key={regiao.sigla} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {regiao.nome} ({regiao.sigla})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.chamada}
                          onChange={(e) => updateRegiao(index, 'chamada', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.fechamento}
                          onChange={(e) => updateRegiao(index, 'fechamento', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.antes}
                          onChange={(e) => updateRegiao(index, 'antes', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.turno1}
                          onChange={(e) => updateRegiao(index, 'turno1', parseInt(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="turno2" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Configuração de Cargas - 2º Turno</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Região
                    </th>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Chamada
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{chamadaInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Fechamento
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fechamentoInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Antes
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{antesInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Turno
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{turnoInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regioes.map((regiao, index) => (
                    <tr key={regiao.sigla} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {regiao.nome} ({regiao.sigla})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.chamada}
                          onChange={(e) => updateRegiao(index, 'chamada', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.fechamento}
                          onChange={(e) => updateRegiao(index, 'fechamento', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.antes}
                          onChange={(e) => updateRegiao(index, 'antes', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.turno2}
                          onChange={(e) => updateRegiao(index, 'turno2', parseInt(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="turno3" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Configuração de Cargas - 3º Turno</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Região
                    </th>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Chamada
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{chamadaInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Fechamento
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fechamentoInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Antes
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{antesInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-help">
                            Turno
                          </th>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{turnoInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regioes.map((regiao, index) => (
                    <tr key={regiao.sigla} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {regiao.nome} ({regiao.sigla})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.chamada}
                          onChange={(e) => updateRegiao(index, 'chamada', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.fechamento}
                          onChange={(e) => updateRegiao(index, 'fechamento', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.antes}
                          onChange={(e) => updateRegiao(index, 'antes', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={regiao.turno3}
                          onChange={(e) => updateRegiao(index, 'turno3', parseInt(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            // Resetar dados para os valores padrão
            window.location.reload();
          }}
        >
          Resetar
        </Button>
        <Button
          onClick={() => {
            // Aqui poderíamos salvar os dados em um servidor
            alert("Dados salvos com sucesso!");
          }}
        >
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}