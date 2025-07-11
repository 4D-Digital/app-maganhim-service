'use client';

import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

interface Step1ServiceNameProps {
  serviceName: string;
  onServiceCreate: (id: string, name: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function Step1ServiceName({
  serviceName,
  onServiceCreate,
  isLoading,
  setIsLoading
}: Step1ServiceNameProps) {
  const [inputValue, setInputValue] = useState(serviceName);

  const handleInsertService = async () => {
    if (!inputValue.trim()) {
      alert('Por favor, insira o nome do serviço.');
      return;
    }

    setIsLoading(true);

    try {
      // a) Criar row no Supabase
      const response = await fetch('/api/create-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName: inputValue.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar serviço');
      }

      // b) ID fica salvo no front através do callback
      // c) Enviar para geração de descrição automaticamente
      await generateDescription(data.id, inputValue.trim());

      // d) Notificar componente pai
      onServiceCreate(data.id, inputValue.trim());

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao inserir serviço. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDescription = async (id: string, service: string) => {
    try {
      const payload = {
        id: id,
        servico: service
      };

      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('Falha ao gerar descrição inicial');
      }

    } catch (error) {
      console.warn('Erro ao gerar descrição:', error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Qual serviço você gostaria de cadastrar?
        </h2>
        <p className="text-gray-700 text-lg">
          Digite o nome do procedimento estético que você realiza
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Nome do Serviço:
          </label>
          <input
            type="text"
            placeholder="Ex: Limpeza de Pele, Botox, Preenchimento Labial, Harmonização Facial..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleInsertService();
              }
            }}
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleInsertService}
            disabled={isLoading || !inputValue.trim()}
            className={`px-8 py-4 text-lg font-bold rounded-lg transition-all ${
              isLoading || !inputValue.trim()
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Inserindo serviço...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Inserir Serviço
              </div>
            )}
          </button>
        </div>

        {/* Exemplos */}
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Exemplos de serviços:
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Limpeza de Pele',
              'Botox',
              'Dermaplaning',
              'Harmonização Facial',
              'Micropigmentação',
              'Pedicure',
              'Hidratação Facial',
              'Esmaltação em Gel',
              'Massagem Relaxante'
            ].map((example) => (
              <button
                key={example}
                onClick={() => setInputValue(example)}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}