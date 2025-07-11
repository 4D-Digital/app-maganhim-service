// app/services/[id]/components/forms/EditTimeForm.tsx

'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface EditTimeFormProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EditTimeForm({ value, onChange }: EditTimeFormProps) {
  // Sugestões rápidas de tempo
  const timePresets = [
    '15 minutos',
    '30 minutos',
    '45 minutos',
    '1 hora',
    '1h 30min',
    '2 horas',
    '2h 30min',
    '3 horas'
  ];

  const handlePresetClick = (preset: string) => {
    onChange(preset);
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Tempo de Procedimento</h3>
      
      <div className="space-y-6">
        {/* Campo principal */}
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ex: 30 minutos, 1 hora, 1h30min..."
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
          />
          <p className="text-sm text-gray-700 mt-2 font-medium">
            Informe o tempo aproximado do procedimento
          </p>
        </div>

        {/* Sugestões rápidas */}
        <div>
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Sugestões rápidas:
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {timePresets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                  value === preset
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Validações e dicas */}
        <div className="space-y-3">
          {value.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Tempo não informado!</strong> Selecione uma das sugestões ou digite manualmente.
              </p>
            </div>
          )}

          {value.length > 0 && value.length < 3 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                ❌ <strong>Muito curto!</strong> Informe um tempo mais descritivo.
              </p>
            </div>
          )}

          {value.length >= 3 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✅ <strong>Tempo informado:</strong> {value}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm font-medium mb-2">
              💡 <strong>Dicas para informar o tempo:</strong>
            </p>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Seja realista - considere tempo de preparação</li>
              <li>• Use formatos claros: "30 minutos" ou "1h 30min"</li>
              <li>• Considere tempo para conversa inicial com cliente</li>
              <li>• Inclua tempo para cuidados pós-procedimento</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-700 text-sm font-medium mb-2">
              <strong>Exemplos por tipo de procedimento:</strong>
            </p>
            <div className="text-gray-600 text-sm space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <strong>Rápidos (15-30min):</strong>
                  <ul className="ml-4 space-y-1">
                    <li>• Aplicação de Botox</li>
                    <li>• Preenchimento simples</li>
                    <li>• Peeling químico leve</li>
                  </ul>
                </div>
                <div>
                  <strong>Demorados (1-3h):</strong>
                  <ul className="ml-4 space-y-1">
                    <li>• Limpeza de pele completa</li>
                    <li>• Microagulhamento</li>
                    <li>• Harmonização facial</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}