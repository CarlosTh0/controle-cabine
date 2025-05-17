import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSistemaCargasStore } from "../hooks/useSistemaCargasStore";
import conflictDetectionService, { Conflict } from "../services/ConflictDetectionService";

const ConflictDetector: React.FC = () => {
  const { cargas } = useSistemaCargasStore();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Detectar conflitos sempre que as cargas mudarem
  useEffect(() => {
    const detectedConflicts = conflictDetectionService.detectConflicts(cargas);
    setConflicts(detectedConflicts);
  }, [cargas]);

  // Função para obter o ícone com base na severidade
  const getConflictIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Obter a classe de cor com base na severidade
  const getSeverityClass = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high':
        return "bg-red-100 text-red-800 border-red-300";
      case 'medium':
        return "bg-amber-100 text-amber-800 border-amber-300";
      case 'low':
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  // Obter texto da severidade
  const getSeverityText = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high':
        return "Alta";
      case 'medium':
        return "Média";
      case 'low':
        return "Baixa";
      default:
        return "Baixa";
    }
  };

  // Obter texto descritivo do tipo de conflito
  const getConflictTypeText = (type: string): string => {
    switch (type) {
      case 'VIAGEM_DUPLICADA':
        return "Viagem Duplicada";
      case 'HORARIO_SOBREPOSICAO':
        return "Sobreposição de Horário";
      case 'PREBOX_DUPLICADO':
        return "PRE-BOX Duplicado";
      case 'BOXD_DUPLICADO':
        return "BOX-D Duplicado";
      default:
        return type;
    }
  };

  // Filtrar conflitos para mostrar apenas os mais importantes ou todos
  const displayConflicts = showAll ? conflicts : conflicts.filter(c => c.severity === 'high');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center">
          <Bell className="mr-2 h-5 w-5" /> Detector de Conflitos
          {conflicts.length > 0 && (
            <Badge variant="outline" className="ml-2 bg-red-50">
              {conflicts.length} conflito(s)
            </Badge>
          )}
        </h2>
        {conflicts.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Mostrar Críticos" : "Mostrar Todos"}
          </Button>
        )}
      </div>

      {conflicts.length === 0 && (
        <Card className="p-4 bg-green-50 text-green-800 border border-green-200">
          Nenhum conflito detectado no momento.
        </Card>
      )}

      {displayConflicts.map((conflict, index) => (
        <Card key={index} className="p-4 border">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getConflictIcon(conflict.severity)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">
                  {getConflictTypeText(conflict.type)}
                </h3>
                <Badge variant="outline" className={getSeverityClass(conflict.severity)}>
                  {getSeverityText(conflict.severity)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {conflict.description}
              </p>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Cargas afetadas:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {conflict.cargaIds.map(id => (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ConflictDetector;