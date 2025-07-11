'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Plus, Image, Instagram, Clock, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  hasDescription: boolean;
  benefitsCount: number;
  imagesCount: number;
  instagramCount: number;
  procedureTime: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesListPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

  // Carregar serviços ao montar componente
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/services');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar serviços');
      }

      const data = await response.json();
      setServices(data.services || []);

    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal de confirmação
  const openDeleteModal = (serviceId: string, serviceName: string) => {
    setServiceToDelete({ id: serviceId, name: serviceName });
    setShowDeleteModal(true);
  };

  // Fechar modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  // Deletar serviço
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      setDeletingId(serviceToDelete.id);

      console.log('Deletando serviço:', serviceToDelete);

      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Resposta da API:', data);
      
      // Remover da lista local
      setServices(prev => prev.filter(service => service.id !== serviceToDelete.id));
      
      // Fechar modal
      closeDeleteModal();
      
      // Feedback de sucesso (sem alert feio)
      console.log('✅ Serviço deletado:', data.message);

    } catch (error) {
      console.error('Erro ao deletar:', error);
      // Mostrar erro no modal ao invés de alert
      alert(`❌ Erro ao deletar serviço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setDeletingId(null);
    }
  };
  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium">Carregando serviços...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar erro
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar serviços</h2>
            <p className="text-gray-800 mb-4 font-medium">{error}</p>
            <button
              onClick={loadServices}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Serviços Cadastrados
              </h1>
              <p className="text-gray-800 font-medium">
                {services.length} {services.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados'}
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Cadastrar Novo Serviço
            </Link>
          </div>
        </div>

        {/* Lista de serviços */}
        {services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Nenhum serviço cadastrado
            </h3>
            <p className="text-gray-700 mb-6 font-medium">
              Comece cadastrando seu primeiro serviço
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Cadastrar Primeiro Serviço
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Nome do serviço */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {service.name}
                    </h3>

                    {/* Descrição */}
                    {service.description && (
                      <p className="text-gray-800 mb-4 line-clamp-2 font-medium">
                        {service.description}
                      </p>
                    )}

                    {/* Status dos campos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        {service.hasDescription ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm text-gray-800 font-medium">
                          Descrição
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-800 font-medium">
                          {service.benefitsCount} benefício(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Image className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-800 font-medium">
                          {service.imagesCount} imagem(ns)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-gray-800 font-medium">
                          {service.instagramCount} link(s)
                        </span>
                      </div>
                    </div>

                    {/* Tempo e data */}
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                      {service.procedureTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Duração: {service.procedureTime}</span>
                        </div>
                      )}
                      <div className="font-medium">
                        Criado em: {formatDate(service.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      href={`/services/${service.id}`}
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Link>
                    
                    <button
                      onClick={() => openDeleteModal(service.id, service.name)}
                      disabled={deletingId === service.id}
                      className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {deletingId === service.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && serviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Excluir Serviço
              </h3>
              
              <p className="text-gray-700 mb-4">
                Tem certeza que deseja excluir permanentemente o serviço:
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="font-bold text-red-900 text-lg">
                  "{serviceToDelete.name}"
                </p>
              </div>
              
              <p className="text-sm text-red-700 mb-6">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados serão perdidos permanentemente.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteModal}
                  disabled={deletingId === serviceToDelete.id}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleDeleteService}
                  disabled={deletingId === serviceToDelete.id}
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId === serviceToDelete.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Sim, Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}