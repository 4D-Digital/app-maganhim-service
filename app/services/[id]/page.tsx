'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, XCircle, FileText, Sparkles, Clock, Image, Instagram } from 'lucide-react';
import { useServiceData } from './hooks/useServiceData';
import EditNameForm from './components/forms/EditNameForm';
import EditDescriptionForm from './components/forms/EditDescriptionForm';
import EditBenefitsForm from './components/forms/EditBenefitsForm';
import EditTimeForm from './components/forms/EditTimeForm';
import EditImagesForm from './components/forms/EditImagesForm';
import EditInstagramForm from './components/forms/EditInstagramForm';

interface EditServicePageProps {
  params: { id: string };
}

type TabType = 'name' | 'description' | 'benefits' | 'time' | 'images' | 'instagram';

export default function EditServicePage({ params }: EditServicePageProps) {
  const { serviceData, setServiceData, isLoading, error } = useServiceData(params.id);
  const [activeTab, setActiveTab] = useState<TabType>('name');
  const [isSaving, setIsSaving] = useState(false);

  // Estados para edição
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBenefits, setEditBenefits] = useState<string[]>([]);
  const [editProcedureTime, setEditProcedureTime] = useState('');

  // Atualizar estados quando dados carregarem
  React.useEffect(() => {
    if (serviceData) {
      setEditName(serviceData.name);
      setEditDescription(serviceData.description);
      setEditBenefits([...serviceData.benefits]);
      setEditProcedureTime(serviceData.procedureTime);
    }
  }, [serviceData]);

  // Função para salvar alterações básicas (nome, descrição, benefícios, tempo)
  const handleSave = async () => {
    if (!serviceData) return;

    try {
      setIsSaving(true);

      const updates: any = {};
      
      if (editName !== serviceData.name) {
        updates.service_name = editName;
      }
      
      if (editDescription !== serviceData.description) {
        updates.description = editDescription;
      }
      
      if (JSON.stringify(editBenefits) !== JSON.stringify(serviceData.benefits)) {
        updates.benefits = editBenefits;
      }
      
      if (editProcedureTime !== serviceData.procedureTime) {
        updates.procedure_time = editProcedureTime;
      }

      if (Object.keys(updates).length === 0) {
        alert('Nenhuma alteração foi feita.');
        return;
      }

      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serviceData.id, ...updates })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar alterações');
      }

      // Atualizar dados locais
      setServiceData(prev => prev ? { 
        ...prev, 
        name: editName,
        description: editDescription,
        benefits: editBenefits,
        procedureTime: editProcedureTime
      } : null);

      alert('✅ Alterações salvas com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(`❌ Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para atualizar imagens
  const handleImagesUpdate = (newUrls: string[]) => {
    if (serviceData) {
      setServiceData({ ...serviceData, imageUrls: newUrls });
    }
  };

  // Função para atualizar links Instagram
  const handleInstagramUpdate = (newLinks: string[]) => {
    if (serviceData) {
      setServiceData({ ...serviceData, instagramLinks: newLinks });
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

  // Definir abas
  const tabs = [
    { id: 'name', label: 'Nome', icon: FileText },
    { id: 'description', label: 'Descrição', icon: FileText },
    { id: 'benefits', label: 'Benefícios', icon: Sparkles },
    { id: 'time', label: 'Tempo', icon: Clock },
    { id: 'images', label: 'Imagens', icon: Image },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
  ];

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-800 font-medium">Carregando serviço...</p>
          </div>
        </div>
      </div>
    );
  }

  // Erro
  if (error || !serviceData) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar serviço</h2>
            <p className="text-gray-800 mb-4 font-medium">{error || 'Serviço não encontrado'}</p>
            <Link
              href="/services"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar para lista
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/services"
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Editar: {serviceData.name}
              </h1>
              <p className="text-gray-600">
                Criado em {formatDate(serviceData.createdAt)} • 
                Última atualização: {formatDate(serviceData.updatedAt)}
              </p>
            </div>
            {/* Botão salvar só para abas que precisam salvar no banco */}
            {(['name', 'description', 'benefits', 'time'].includes(activeTab)) && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {/* Aba Nome */}
          {activeTab === 'name' && (
            <EditNameForm
              value={editName}
              onChange={setEditName}
            />
          )}

          {/* Aba Descrição */}
          {activeTab === 'description' && (
            <EditDescriptionForm
              value={editDescription}
              onChange={setEditDescription}
              serviceName={serviceData.name}
            />
          )}

          {/* Aba Benefícios */}
          {activeTab === 'benefits' && (
            <EditBenefitsForm
              benefits={editBenefits}
              onChange={setEditBenefits}
              serviceName={serviceData.name}
            />
          )}

          {/* Aba Tempo */}
          {activeTab === 'time' && (
            <EditTimeForm
              value={editProcedureTime}
              onChange={setEditProcedureTime}
            />
          )}

          {/* Aba Imagens */}
          {activeTab === 'images' && (
            <EditImagesForm
              serviceData={serviceData}
              onUpdate={handleImagesUpdate}
            />
          )}

          {/* Aba Instagram */}
          {activeTab === 'instagram' && (
            <EditInstagramForm
              serviceData={serviceData}
              onUpdate={handleInstagramUpdate}
            />
          )}
        </div>

        {/* Dica sobre salvamento */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            💡 <strong>Dica:</strong> 
            {(['name', 'description', 'benefits', 'time'].includes(activeTab)) 
              ? ' Clique em "Salvar Alterações" para salvar as modificações.'
              : ' As imagens e links do Instagram são salvos automaticamente quando adicionados.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}