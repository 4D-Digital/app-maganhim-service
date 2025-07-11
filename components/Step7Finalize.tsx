'use client';

import React, { useState } from 'react';
import { CheckCircle, Sparkles, RotateCcw, Eye, Instagram, Clock, Image, FileText } from 'lucide-react';

interface ServiceData {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  procedureTime: string;
  imageUrls: string[];
  instagramLinks: string[];
}

interface Step7FinalizeProps {
  serviceData: ServiceData;
  onFinalize: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function Step7Finalize({
  serviceData,
  onFinalize,
  isLoading,
  setIsLoading
}: Step7FinalizeProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Função para finalizar e resetar
  const handleFinalize = async () => {
    setIsLoading(true);
    
    try {
      // 🚀 NOVO: Notificar N8N sobre serviço cadastrado
      console.log('Enviando notificação para N8N...');
      
      const notifyResponse = await fetch('/api/notify-service-created', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      });

      const notifyData = await notifyResponse.json();
      console.log('Resposta da notificação:', notifyData);

      // Simular um pequeno delay para feedback visual
      setTimeout(() => {
        setIsLoading(false);
        onFinalize(); // Chama a função que reseta tudo e volta para Step 1
      }, 1000);

    } catch (error) {
      console.error('Erro na notificação:', error);
      // Continua mesmo se a notificação falhar
      setTimeout(() => {
        setIsLoading(false);
        onFinalize();
      }, 1000);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg border-2 border-green-300 shadow-lg">
      {/* Header de Sucesso */}
      <div className="text-center mb-8">
        <div className="relative">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🎉 Serviço Cadastrado com Sucesso!
        </h1>
        <h2 className="text-xl text-green-700 font-semibold mb-2">
          {serviceData.name}
        </h2>
        <p className="text-gray-700 text-lg">
          Todas as informações foram salvas e o serviço está pronto para ser exibido no site da clínica.
        </p>
      </div>

      {/* Resumo do que foi criado */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
        <h3 className="font-bold text-green-900 mb-4 text-lg">
          ✅ Resumo do que foi cadastrado:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Descrição:</span>
              <span className="text-green-700 ml-2">✓ Gerada pela IA</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Benefícios:</span>
              <span className="text-green-700 ml-2">✓ {serviceData.benefits.length} benefícios</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Tempo:</span>
              <span className="text-green-700 ml-2">✓ {serviceData.procedureTime}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Image className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Imagens:</span>
              <span className="text-green-700 ml-2">
                ✓ {serviceData.imageUrls.length} {serviceData.imageUrls.length === 1 ? 'imagem' : 'imagens'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Instagram:</span>
              <span className="text-green-700 ml-2">
                ✓ {serviceData.instagramLinks.length} {serviceData.instagramLinks.length === 1 ? 'link' : 'links'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Status:</span>
              <span className="text-green-700 ml-2">✓ Salvo no banco</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botão para ver detalhes */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
        >
          <Eye className="h-4 w-4" />
          {showDetails ? 'Ocultar' : 'Ver'} Detalhes Completos
        </button>
      </div>

      {/* Detalhes expandidos */}
      {showDetails && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <h4 className="font-bold text-gray-900 mb-4">📋 Detalhes Completos:</h4>
          
          <div className="space-y-4 text-sm">
            <div>
              <strong className="text-gray-700">ID do Serviço:</strong>
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                {serviceData.id}
              </code>
            </div>
            
            <div>
              <strong className="text-gray-700">Descrição:</strong>
              <p className="mt-1 text-gray-600 italic">
                "{serviceData.description}"
              </p>
            </div>
            
            <div>
              <strong className="text-gray-700">Benefícios:</strong>
              <ul className="mt-1 list-disc list-inside text-gray-600 space-y-1">
                {serviceData.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            {serviceData.imageUrls.length > 0 && (
              <div>
                <strong className="text-gray-700">URLs das Imagens:</strong>
                <div className="mt-1 space-y-1">
                  {serviceData.imageUrls.map((url, index) => (
                    <div key={index} className="text-xs text-gray-500 font-mono bg-white p-2 rounded border">
                      {index + 1}. {url}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {serviceData.instagramLinks.length > 0 && (
              <div>
                <strong className="text-gray-700">Links do Instagram:</strong>
                <div className="mt-1 space-y-1">
                  {serviceData.instagramLinks.map((link, index) => (
                    <div key={index} className="text-xs text-gray-500 font-mono bg-white p-2 rounded border">
                      {index + 1}. {link}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensagem motivacional */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 mb-8">
        <div className="text-center">
          <h4 className="font-bold text-purple-900 mb-2">🚀 Parabéns!</h4>
          <p className="text-purple-800 text-sm">
            Você acabou de automatizar o cadastro do seu serviço usando inteligência artificial. 
            O processo que normalmente levaria 30 minutos foi concluído de forma rápida e profissional!
          </p>
        </div>
      </div>

      {/* Botão principal de finalizar */}
      <div className="text-center">
        <button
          onClick={handleFinalize}
          disabled={isLoading}
          className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center gap-3 mx-auto text-lg shadow-lg transition-all"
        >
          {isLoading ? (
            <>
              <RotateCcw className="h-5 w-5 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              <RotateCcw className="h-5 w-5" />
              Cadastrar Novo Serviço
            </>
          )}
        </button>
        
        <p className="text-sm text-gray-600 mt-3">
          Clique para começar o cadastro de outro serviço
        </p>
      </div>
    </div>
  );
}