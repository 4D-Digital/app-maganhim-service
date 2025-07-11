// app/services/[id]/components/forms/EditBenefitsForm.tsx

'use client';

import React, { useState } from 'react';
import { CheckCircle, Plus, X, Loader2, Sparkles } from 'lucide-react';

interface EditBenefitsFormProps {
  benefits: string[];
  onChange: (benefits: string[]) => void;
  serviceName: string;
}

export default function EditBenefitsForm({ benefits, onChange, serviceName }: EditBenefitsFormProps) {
  const [newBenefit, setNewBenefit] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Adicionar benefício
  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      onChange([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  // Remover benefício
  const removeBenefit = (index: number) => {
    onChange(benefits.filter((_, i) => i !== index));
  };

  // Editar benefício existente
  const editBenefit = (index: number, newValue: string) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index] = newValue;
    onChange(updatedBenefits);
  };

  // Regenerar benefícios com IA
  const handleRegenerate = async () => {
    setIsRegenerating(true);

    try {
      const response = await fetch('/api/generate-benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar novos benefícios');
      }

      const data = await response.json();
      
      // Converter string separada por vírgulas em array se necessário
      let newBenefits = data.benefits;
      if (typeof newBenefits === 'string') {
        newBenefits = newBenefits.split(',').map((b: string) => b.trim()).filter((b: string) => b);
      }
      
      onChange(newBenefits || []);

    } catch (error) {
      console.error('Erro ao regenerar:', error);
      alert('❌ Erro ao gerar novos benefícios. Tente novamente.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Benefícios do Serviço ({benefits.length})
        </h3>
        
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
      
      {/* Lista de benefícios existentes */}
      {benefits.length > 0 && (
        <div className="space-y-3 mb-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              
              <input
                type="text"
                value={benefit}
                onChange={(e) => editBenefit(index, e.target.value)}
                className="flex-1 bg-transparent text-gray-900 font-medium focus:outline-none focus:bg-white focus:border focus:border-green-300 focus:rounded px-2 py-1"
              />
              
              <button
                onClick={() => removeBenefit(index)}
                className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md font-medium hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar novo benefício */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
            placeholder="Digite um novo benefício..."
            className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
          />
          <button
            onClick={addBenefit}
            disabled={!newBenefit.trim()}
            className="px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        {/* Dicas e validações */}
        <div className="space-y-3">
          {benefits.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Nenhum benefício cadastrado!</strong> Clique em "Regenerar com IA" ou adicione manualmente.
              </p>
            </div>
          )}

          {benefits.length >= 3 && benefits.length <= 8 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✅ <strong>Quantidade ideal de benefícios!</strong> Entre 3 e 8 benefícios é o recomendado.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm font-medium mb-2">
              💡 <strong>Dicas para bons benefícios:</strong>
            </p>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Seja específico e claro</li>
              <li>• Use linguagem que o cliente entende</li>
              <li>• Foque nos resultados visíveis</li>
              <li>• Mencione a duração dos efeitos</li>
              <li>• Destaque diferenciais do procedimento</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-700 text-sm font-medium mb-2">
              <strong>Exemplos de benefícios:</strong>
            </p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Redução visível de rugas e linhas de expressão</li>
              <li>• Pele mais lisa e rejuvenescida</li>
              <li>• Resultados que duram de 4 a 6 meses</li>
              <li>• Procedimento rápido e minimamente invasivo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}