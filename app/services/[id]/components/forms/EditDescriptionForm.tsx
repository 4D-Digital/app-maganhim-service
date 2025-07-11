// app/services/[id]/components/forms/EditDescriptionForm.tsx

'use client';

import React, { useState } from 'react';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface EditDescriptionFormProps {
  value: string;
  onChange: (value: string) => void;
  serviceName: string;
}

export default function EditDescriptionForm({ value, onChange, serviceName }: EditDescriptionFormProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Função para regenerar descrição com IA
  const handleRegenerate = async () => {
    setIsRegenerating(true);

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar nova descrição');
      }

      const data = await response.json();
      onChange(data.description || '');

    } catch (error) {
      console.error('Erro ao regenerar:', error);
      alert('❌ Erro ao gerar nova descrição. Tente novamente.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Descrição do Serviço</h3>
        
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Regenerar com IA
            </>
          )}
        </button>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Descreva o serviço..."
        rows={12}
        className="w-full p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-gray-900 leading-relaxed"
      />
      
      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 font-medium">
            <strong>Caracteres:</strong> {value.length}
          </p>
          
          <div className="flex items-center gap-2">
            {value.length >= 100 && value.length <= 500 && (
              <span className="text-green-600 text-sm font-medium">✅ Tamanho ideal</span>
            )}
            {value.length < 100 && value.length > 0 && (
              <span className="text-yellow-600 text-sm font-medium">⚠️ Muito curta</span>
            )}
            {value.length > 500 && (
              <span className="text-red-600 text-sm font-medium">❌ Muito longa</span>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm font-medium mb-2">
            💡 <strong>Dicas para uma boa descrição:</strong>
          </p>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Explique o que é o procedimento</li>
            <li>• Mencione os principais benefícios</li>
            <li>• Use linguagem clara e acessível</li>
            <li>• Inclua informações sobre resultados</li>
            <li>• Evite termos muito técnicos</li>
          </ul>
        </div>

        {value.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Descrição vazia!</strong> Clique em "Regenerar com IA" para gerar uma descrição automaticamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}