'use client';

import React, { useState } from 'react';
import { Instagram, Plus, X, Loader2, Check, ExternalLink, AlertCircle } from 'lucide-react';

interface Step6InstagramLinksProps {
  serviceId: string;
  serviceName: string;
  instagramLinks: string[];
  onLinksConfirmed: (instagramLinks: string[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface LinkInput {
  id: string;
  url: string;
  isValid: boolean | null;
}

export default function Step6InstagramLinks({
  serviceId,
  serviceName,
  instagramLinks,
  onLinksConfirmed,
  isLoading,
  setIsLoading
}: Step6InstagramLinksProps) {
  const [hasInstagramPosts, setHasInstagramPosts] = useState<boolean | null>(null);
  const [linkInputs, setLinkInputs] = useState<LinkInput[]>([]);
  const [confirmedLinks, setConfirmedLinks] = useState<string[]>(instagramLinks);

  // Função para validar URL do Instagram
  const validateInstagramUrl = (url: string): boolean => {
    if (!url) return false;
    
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(\?.*)?$/;
    return instagramRegex.test(url);
  };

  // Função para adicionar campo de input
  const addLinkInput = () => {
    const newInput: LinkInput = {
      id: Date.now().toString(),
      url: '',
      isValid: null
    };
    setLinkInputs(prev => [...prev, newInput]);
  };

  // Função para atualizar URL do input
  const updateLinkInput = (id: string, url: string) => {
    setLinkInputs(prev => prev.map(input => 
      input.id === id 
        ? { ...input, url, isValid: url ? validateInstagramUrl(url) : null }
        : input
    ));

    // ✅ AUTO-ADICIONAR: Se URL ficar válida, adiciona automaticamente
    if (url && validateInstagramUrl(url) && !confirmedLinks.includes(url)) {
      setTimeout(() => {
        addToConfirmedLinks(url);
      }, 500); // Pequeno delay para feedback visual
    }
  };

  // Função para remover campo de input
  const removeLinkInput = (id: string) => {
    setLinkInputs(prev => prev.filter(input => input.id !== id));
  };

  // Função para adicionar link válido à lista confirmada
  const addToConfirmedLinks = (url: string) => {
    if (validateInstagramUrl(url) && !confirmedLinks.includes(url)) {
      setConfirmedLinks(prev => [...prev, url]);
      // Limpar o input que foi confirmado
      setLinkInputs(prev => prev.filter(input => input.url !== url));
    }
  };

  // Função para remover link confirmado
  const removeConfirmedLink = (url: string) => {
    setConfirmedLinks(prev => prev.filter(link => link !== url));
  };

  // Função para confirmar e salvar
  const handleConfirmLinks = async () => {
    setIsLoading(true);

    try {
      // Salvar links no Supabase
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceId,
          instagram_links: confirmedLinks
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar links do Instagram');
      }

      // Notificar componente pai
      onLinksConfirmed(confirmedLinks);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar links. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar pergunta inicial
  if (hasInstagramPosts === null) {
    return (
      <div className="bg-white p-8 rounded-lg border-2 border-purple-300 shadow-lg">
        <div className="text-center mb-6">
          <Instagram className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Links do Instagram - {serviceName}
          </h2>
          <p className="text-gray-700 text-lg">
            Você tem posts no Instagram mostrando este serviço?
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Posts com "antes e depois" ou resultados deste procedimento
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setHasInstagramPosts(true)}
            className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 justify-center"
          >
            <Instagram className="h-5 w-5" />
            Sim, tenho posts
          </button>
          <button
            onClick={() => {
              setConfirmedLinks([]);
              onLinksConfirmed([]);
            }}
            className="px-8 py-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
          >
            Não tenho posts
          </button>
        </div>
      </div>
    );
  }

  // Renderizar interface de adicionar links
  return (
    <div className="bg-white p-8 rounded-lg border-2 border-purple-300 shadow-lg">
      <div className="text-center mb-6">
        <Instagram className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Links do Instagram - {serviceName}
        </h2>
        <p className="text-gray-700">
          Cole os links dos seus posts que mostram este serviço
        </p>
      </div>

      <div className="space-y-6">
        {/* Instruções */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">📱 Como copiar o link do post:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Abra o post no Instagram</li>
            <li>2. Toque nos três pontinhos (⋯)</li>
            <li>3. Selecione "Copiar link"</li>
            <li>4. Cole aqui embaixo</li>
          </ol>
          <div className="mt-2 text-xs text-blue-700">
            <strong>Exemplo:</strong> https://www.instagram.com/p/ABC123/
          </div>
        </div>

        {/* Links confirmados */}
        {confirmedLinks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold text-gray-900">
                ✅ Links adicionados ({confirmedLinks.length}):
              </h3>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                + Adicione mais se quiser
              </div>
            </div>
            <div className="space-y-3">
              {confirmedLinks.map((url, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Instagram className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-gray-700 hover:text-blue-600 underline truncate"
                  >
                    {url}
                  </a>
                  <button
                    onClick={() => removeConfirmedLink(url)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campos de input */}
        {linkInputs.map((input) => (
          <div key={input.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="url"
                  placeholder="Cole o link do Instagram aqui..."
                  value={input.url}
                  onChange={(e) => updateLinkInput(input.id, e.target.value)}
                  className={`w-full p-3 border-2 rounded-lg text-sm transition-all ${
                    input.isValid === true 
                      ? 'border-green-300 bg-green-50' 
                      : input.isValid === false 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {input.isValid === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeLinkInput(input.id)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {input.isValid === false && input.url && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                <AlertCircle className="h-3 w-3" />
                URL inválida. Use: instagram.com/p/... ou instagram.com/reel/...
              </div>
            )}
            {input.isValid === true && (
              <div className="flex items-center gap-1 mt-1 text-green-600 text-xs animate-pulse">
                <Check className="h-3 w-3" />
                Link válido! Será adicionado automaticamente...
              </div>
            )}
          </div>
        ))}

        {/* Botão para adicionar mais campos */}
        <div className="text-center">
          <button
            onClick={addLinkInput}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            {linkInputs.length === 0 ? 'Inserir Primeiro Link' : 'Inserir Mais Um Link'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Cole quantos links quiser - eles serão adicionados automaticamente quando válidos
          </p>
        </div>

        {/* Botão de confirmação */}
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            onClick={handleConfirmLinks}
            disabled={isLoading}
            className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Confirmar e Continuar
              </>
            )}
          </button>
          {confirmedLinks.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {confirmedLinks.length} link(s) serão salvos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}