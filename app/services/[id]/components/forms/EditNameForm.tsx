// app/services/[id]/components/forms/EditNameForm.tsx

'use client';

import React from 'react';

interface EditNameFormProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EditNameForm({ value, onChange }: EditNameFormProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Nome do Serviço</h3>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o nome do serviço..."
        className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-500 focus:outline-none text-lg"
      />
      
      <div className="mt-3 space-y-2">
        <p className="text-sm text-gray-700 font-medium">
          <strong>Caracteres:</strong> {value.length}
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-900 text-sm">
            💡 <strong>Dica:</strong> Use um nome claro e descritivo que os clientes possam entender facilmente.
          </p>
        </div>
        
        {value.length < 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Atenção:</strong> O nome deve ter pelo menos 3 caracteres.
            </p>
          </div>
        )}
        
        {value.length > 50 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              ❌ <strong>Muito longo:</strong> Recomendamos no máximo 50 caracteres para melhor visualização.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-700 text-sm font-medium mb-2">
          <strong>Exemplos de bons nomes:</strong>
        </p>
        <ul className="text-gray-600 text-sm space-y-1">
          <li>• Limpeza de Pele Profunda</li>
          <li>• Botox para Rugas de Expressão</li>
          <li>• Microagulhamento Facial</li>
          <li>• Preenchimento Labial</li>
        </ul>
      </div>
    </div>
  );
}