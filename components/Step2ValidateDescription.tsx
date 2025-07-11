'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Check, RotateCcw, MessageSquare, X } from 'lucide-react';

interface Step2ValidateDescriptionProps {
  serviceId: string;
  serviceName: string;
  description: string;
  onDescriptionConfirmed: (description: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function Step2ValidateDescription({
  serviceId,
  serviceName,
  description,
  onDescriptionConfirmed,
  isLoading,
  setIsLoading
}: Step2ValidateDescriptionProps) {
  const [currentDescription, setCurrentDescription] = useState(description);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  // Buscar descrição inicial se não tiver
  useEffect(() => {
    if (!currentDescription && serviceId && serviceName) {
      fetchInitialDescription();
    }
  }, [serviceId, serviceName]);

  const fetchInitialDescription = async () => {
    setIsGenerating(true);
    try {
      await generateDescription();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDescription = async (complement?: string) => {
    setIsGenerating(true);

    try {
      const payload = {
        id: serviceId,
        servico: serviceName,
        ...(complement && { complemento: complement })
      };

      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar descrição');
      }

      setCurrentDescription(data.description || data.content);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar descrição. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmDescription = async () => {
    if (!currentDescription.trim()) {
      alert('Descrição não pode estar vazia.');
      return;
    }

    setIsLoading(true);

    try {
      // b) Enviar update para Supabase
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceId,
          description: currentDescription.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar descrição');
      }

      // Notificar componente pai
      onDescriptionConfirmed(currentDescription.trim());

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar descrição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    if (showCommentBox && comment.trim()) {
      await generateDescription(comment.trim());
      setComment('');
      setShowCommentBox(false);
    } else if (!showCommentBox) {
      await generateDescription();
    }
  };

  const toggleCommentBox = () => {
    setShowCommentBox(!showCommentBox);
    if (showCommentBox) {
      setComment('');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg border-2 border-blue-300 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          O que é {serviceName}?
        </h2>
        <p className="text-gray-700 text-lg">
          Nossa IA gerou uma descrição. Revise e confirme ou peça uma nova versão.
        </p>
      </div>

      <div className="space-y-6">
        {/* Área da descrição */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-900 font-medium">Gerando descrição...</span>
            </div>
          ) : currentDescription ? (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Descrição gerada:
              </label>
              <textarea
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                className="w-full p-4 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium resize-none overflow-hidden"
                style={{
                  minHeight: '120px',
                  height: 'auto'
                }}
                placeholder="Descrição do serviço..."
                disabled={isLoading}
                ref={(textarea) => {
                  if (textarea) {
                    textarea.style.height = 'auto';
                    textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(120, target.scrollHeight) + 'px';
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-700 font-medium">
              Clique em "Gerar Descrição" para começar
            </div>
          )}
        </div>

        {/* Caixa de comentário */}
        {showCommentBox && (
          <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-400">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              O que você gostaria de melhorar ou complementar?
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900"
              rows={3}
              placeholder="Ex: Foque mais nos resultados, mencione que é indolor, fale sobre a durabilidade..."
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
          {currentDescription ? (
            <>
              <button
                onClick={handleConfirmDescription}
                disabled={isLoading || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Confirmar Descrição
              </button>

              <button
                onClick={showCommentBox ? handleGenerateNew : toggleCommentBox}
                disabled={isLoading || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : showCommentBox ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                {showCommentBox ? 'Gerar Nova' : 'Gerar Outra'}
              </button>
            </>
          ) : (
            <button
              onClick={() => generateDescription()}
              disabled={isLoading || isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Gerar Descrição
            </button>
          )}
        </div>
      </div>
    </div>
  );
}