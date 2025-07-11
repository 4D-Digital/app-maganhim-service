'use client';

import React, { useState } from 'react';
import { Loader2, Clock, Check } from 'lucide-react';

interface Step4ProcedureTimeProps {
  serviceId: string;
  procedureTime: string;
  onProcedureTimeConfirmed: (procedureTime: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function Step4ProcedureTime({
  serviceId,
  procedureTime,
  onProcedureTimeConfirmed,
  isLoading,
  setIsLoading
}: Step4ProcedureTimeProps) {
  const [inputValue, setInputValue] = useState(procedureTime);

  const handleConfirmTime = async () => {
    if (!inputValue.trim()) {
      alert('Por favor, informe o tempo de procedimento.');
      return;
    }

    setIsLoading(true);

    try {
      // Enviar update para Supabase
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceId,
          procedure_time: inputValue.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar tempo de procedimento');
      }

      // Notificar componente pai
      onProcedureTimeConfirmed(inputValue.trim());

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar tempo de procedimento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sugestões rápidas
  const quickSuggestions = [
    '30 minutos',
    '45 minutos',
    '1 hora',
    '1 hora e 30 minutos',
    '2 horas',
    '2 horas e 30 minutos',
    '3 horas'
  ];

  return (
    <div className="bg-orange-50 p-8 rounded-lg border border-orange-100">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <Clock className="h-8 w-8 text-orange-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Tempo de Procedimento
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Informe quanto tempo leva para realizar este procedimento. 
          Isso ajuda as clientes a se organizarem melhor para o atendimento.
        </p>
      </div>

      <div className="space-y-6">
        {/* Input principal */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Duração do procedimento: *
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            placeholder="Ex: 1 hora, 45 minutos, 2 horas e 30 minutos..."
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleConfirmTime();
              }
            }}
          />
        </div>

        {/* Sugestões rápidas */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Sugestões rápidas:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Dicas úteis */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            💡 Dicas importantes:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Inclua o tempo de preparação da pele</li>
            <li>• Considere o tempo de aplicação do produto</li>
            <li>• Adicione tempo para orientações pós-procedimento</li>
            <li>• Seja realista para evitar atrasos</li>
          </ul>
        </div>

        {/* Botão de confirmação */}
        <div className="text-center">
          <button
            onClick={handleConfirmTime}
            disabled={isLoading || !inputValue.trim()}
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
              isLoading || !inputValue.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Confirmar Tempo
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}