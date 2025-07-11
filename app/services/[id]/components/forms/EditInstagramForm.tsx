// app/services/[id]/components/forms/EditInstagramForm.tsx

'use client';

import React, { useState } from 'react';
import { Instagram, Plus, X, Loader2, ExternalLink } from 'lucide-react';

interface ServiceData {
  id: string;
  instagramLinks: string[];
}

interface EditInstagramFormProps {
  serviceData: ServiceData;
  onUpdate: (newLinks: string[]) => void;
}

export default function EditInstagramForm({ serviceData, onUpdate }: EditInstagramFormProps) {
  const [newInstagramLink, setNewInstagramLink] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Validar URL do Instagram
  const validateInstagramUrl = (url: string): boolean => {
    if (!url) return false;
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(\?.*)?$/;
    return instagramRegex.test(url);
  };

  // Adicionar link Instagram
  const addInstagramLink = async () => {
    if (!newInstagramLink.trim()) return;

    if (!validateInstagramUrl(newInstagramLink)) {
      alert('❌ URL inválida. Use: instagram.com/p/... ou instagram.com/reel/...');
      return;
    }

    if (serviceData.instagramLinks.includes(newInstagramLink.trim())) {
      alert('❌ Este link já foi adicionado!');
      return;
    }

    setIsAddingLink(true);

    try {
      const updatedLinks = [...serviceData.instagramLinks, newInstagramLink.trim()];
      
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceData.id,
          instagram_links: updatedLinks
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar link no banco');
      }

      onUpdate(updatedLinks);
      setNewInstagramLink('');
      alert('✅ Link do Instagram adicionado com sucesso!');

    } catch (error) {
      console.error('Erro ao adicionar link:', error);
      alert(`❌ Erro ao adicionar link: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsAddingLink(false);
    }
  };

  // Remover link Instagram
  const removeInstagramLink = async (linkToRemove: string) => {
    const confirmRemove = window.confirm(`Tem certeza que deseja remover este link?\n\n${linkToRemove}`);
    if (!confirmRemove) return;

    try {
      const updatedLinks = serviceData.instagramLinks.filter(link => link !== linkToRemove);
      
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceData.id,
          instagram_links: updatedLinks
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao remover link do banco');
      }

      onUpdate(updatedLinks);
      alert('✅ Link removido com sucesso!');

    } catch (error) {
      console.error('Erro ao remover link:', error);
      alert(`❌ Erro ao remover link: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const isValidUrl = newInstagramLink ? validateInstagramUrl(newInstagramLink) : null;

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Gerenciar Links do Instagram ({serviceData.instagramLinks.length})
      </h3>
      
      {/* Links existentes */}
      {serviceData.instagramLinks.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-3">Links atuais:</h4>
          <div className="space-y-3">
            {serviceData.instagramLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <Instagram className="h-5 w-5 text-purple-600 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium block truncate"
                  >
                    {link}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Link {index + 1}</span>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Abrir
                    </a>
                  </div>
                </div>
                
                <button
                  onClick={() => removeInstagramLink(link)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-bold text-blue-900 mb-2">📱 Como copiar o link do post:</h4>
        <ol className="text-sm text-blue-800 space-y-1 mb-3">
          <li>1. Abra o post no Instagram</li>
          <li>2. Toque nos três pontinhos (⋯)</li>
          <li>3. Selecione "Copiar link"</li>
          <li>4. Cole aqui embaixo</li>
        </ol>
        <div className="text-xs text-blue-700 font-medium">
          <strong>Exemplo válido:</strong> https://www.instagram.com/p/ABC123/
        </div>
      </div>

      {/* Adicionar novo link */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="url"
              value={newInstagramLink}
              onChange={(e) => setNewInstagramLink(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInstagramLink()}
              placeholder="Cole o link do Instagram aqui..."
              className={`w-full p-3 border-2 rounded-lg focus:outline-none text-gray-900 transition-colors ${
                isValidUrl === true 
                  ? 'border-green-300 bg-green-50 focus:border-green-500' 
                  : isValidUrl === false 
                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              disabled={isAddingLink}
            />
            
            {/* Feedback visual */}
            {isValidUrl === true && (
              <p className="text-green-600 text-sm mt-1 font-medium">✅ Link válido!</p>
            )}
            {isValidUrl === false && newInstagramLink && (
              <p className="text-red-600 text-sm mt-1 font-medium">
                ❌ URL inválida. Use: instagram.com/p/... ou instagram.com/reel/...
              </p>
            )}
          </div>
          
          <button
            onClick={addInstagramLink}
            disabled={!newInstagramLink.trim() || isValidUrl !== true || isAddingLink}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAddingLink ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Adicionar
              </>
            )}
          </button>
        </div>

        {/* Estado vazio */}
        {serviceData.instagramLinks.length === 0 && !newInstagramLink && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Instagram className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium text-lg">Nenhum link do Instagram cadastrado</p>
            <p className="text-gray-600 text-sm">Adicione links de posts que mostram este serviço</p>
          </div>
        )}

        {/* Dicas adicionais */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-sm font-medium mb-2">
            💡 <strong>Dicas para melhores resultados:</strong>
          </p>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Use posts que mostrem especificamente este serviço</li>
            <li>• Fotos "antes e depois" são muito valorizadas</li>
            <li>• Reels com demonstrações do procedimento são ideais</li>
            <li>• Evite posts muito antigos (máximo 1 ano)</li>
            <li>• Máximo recomendado: 5 a 8 links por serviço</li>
          </ul>
        </div>

        {/* Aviso de muitos links */}
        {serviceData.instagramLinks.length >= 8 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Muitos links!</strong> Recomendamos no máximo 8 links para não sobrecarregar os clientes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}