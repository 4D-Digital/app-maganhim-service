'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Check, RotateCcw, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Step3ValidateBenefitsProps {
  serviceId: string;
  serviceName: string;
  benefits: string[];
  onBenefitsConfirmed: (benefits: string[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function Step3ValidateBenefits({
  serviceId,
  serviceName,
  benefits,
  onBenefitsConfirmed,
  isLoading,
  setIsLoading
}: Step3ValidateBenefitsProps) {
  const [currentBenefits, setCurrentBenefits] = useState<string[]>(benefits);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  // Buscar benefícios iniciais se não tiver
  useEffect(() => {
    if (currentBenefits.length === 0 && serviceId && serviceName) {
      fetchInitialBenefits();
    }
  }, [serviceId, serviceName]);

  const fetchInitialBenefits = async () => {
    setIsGenerating(true);
    try {
      await generateBenefits();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBenefits = async (complement?: string) => {
    setIsGenerating(true);

    try {
      const payload = {
        id: serviceId,
        servico: serviceName,
        ...(complement && { complemento: complement })
      };

      const response = await fetch('/api/generate-benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar benefícios');
      }

      // A API agora retorna { "success": true, "benefits": [...] }
      let benefitsList: string[] = [];
      
      if (data.benefits && Array.isArray(data.benefits)) {
        benefitsList = data.benefits;
      } else {
        console.warn('Resposta inesperada da API:', data);
        benefitsList = [];
      }

      setCurrentBenefits(benefitsList);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar benefícios. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmBenefits = async () => {
    const validBenefits = currentBenefits.filter(benefit => benefit.trim());
    
    if (validBenefits.length === 0) {
      alert('Adicione pelo menos um benefício.');
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
          benefits: validBenefits
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar benefícios');
      }

      // Notificar componente pai
      onBenefitsConfirmed(validBenefits);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar benefícios. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    if (showCommentBox && comment.trim()) {
      await generateBenefits(comment.trim());
      setComment('');
      setShowCommentBox(false);
    } else if (!showCommentBox) {
      await generateBenefits();
    }
  };

  const toggleCommentBox = () => {
    setShowCommentBox(!showCommentBox);
    if (showCommentBox) {
      setComment('');
    }
  };

  const updateBenefit = (index: number, value: string) => {
    setCurrentBenefits(prev => prev.map((benefit, i) => i === index ? value : benefit));
  };

  const addBenefit = () => {
    setCurrentBenefits(prev => [...prev, '']);
  };

  const removeBenefit = (index: number) => {
    setCurrentBenefits(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-8 rounded-lg border-2 border-green-300 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Benefícios do {serviceName}
        </h2>
        <p className="text-gray-700 text-lg">
          Nossa IA gerou uma lista de benefícios. Revise, edite e confirme.
        </p>
      </div>

      <div className="space-y-6">
        {/* Área dos benefícios */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-3 text-gray-900 font-medium">Gerando benefícios...</span>
            </div>
          ) : currentBenefits.length > 0 ? (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Benefícios gerados (você pode editar):
              </label>
              <div className="space-y-3">
                {currentBenefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-green-600 font-bold text-lg">•</span>
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      className="flex-1 p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
                      placeholder={`Benefício ${index + 1}`}
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => removeBenefit(index)}
                      disabled={isLoading}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addBenefit}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 p-2 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar benefício
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-700 font-medium">
              Clique em "Gerar Benefícios" para começar
            </div>
          )}
        </div>

        {/* Caixa de comentário */}
        {showCommentBox && (
          <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-400">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              O que você gostaria de melhorar nos benefícios?
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900"
              rows={3}
              placeholder="Ex: Foque mais em resultados estéticos, mencione benefícios a longo prazo, inclua aspectos de autoestima..."
              disabled={isLoading}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGenerateNew}
                disabled={isLoading || isGenerating}
                className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                Gerar com comentário
              </button>
              <button
                onClick={toggleCommentBox}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentBenefits.length > 0 ? (
            <>
              <button
                onClick={handleConfirmBenefits}
                disabled={isLoading || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Confirmar Benefícios
              </button>

              <button
                onClick={showCommentBox ? handleGenerateNew : toggleCommentBox}
                disabled={isLoading || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : showCommentBox ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                {showCommentBox ? 'Gerar Novos' : 'Gerar Outros'}
              </button>
            </>
          ) : (
            <button
              onClick={() => generateBenefits()}
              disabled={isLoading || isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Gerar Benefícios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}