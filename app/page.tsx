'use client';

import React, { useState } from 'react';
import Step1ServiceName from '@/components/Step1ServiceName';
import Step2ValidateDescription from '@/components/Step2ValidateDescription';
import Step3ValidateBenefits from '@/components/Step3ValidateBenefits';
import Step4ProcedureTime from '@/components/Step4ProcedureTime';
import Step5UploadImages from '@/components/Step5UploadImages';
import Step6InstagramLinks from '@/components/Step6InstagramLinks';
import Step7Finalize from '@/components/Step7Finalize';

interface ServiceData {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  procedureTime: string;
  imageUrls: string[];
  instagramLinks: string[];
}

export default function ClinicServiceForm() {
  // Estado principal do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceData, setServiceData] = useState<ServiceData>({
    id: '',
    name: '',
    description: '',
    benefits: [],
    procedureTime: '',
    imageUrls: [],
    instagramLinks: []
  });

  // Estados de loading/progresso
  const [isLoading, setIsLoading] = useState(false);

  // Função para atualizar dados do serviço
  const updateServiceData = (updates: Partial<ServiceData>) => {
    setServiceData(prev => ({ ...prev, ...updates }));
  };

  // Função para avançar etapa
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  // Função para voltar etapa (se necessário)
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Função para resetar formulário
  const resetForm = () => {
    setCurrentStep(1);
    setServiceData({
      id: '',
      name: '',
      description: '',
      benefits: [],
      procedureTime: '',
      imageUrls: [],
      instagramLinks: []
    });
    setIsLoading(false);
  };

  // Renderizar etapa atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ServiceName
            serviceName={serviceData.name}
            onServiceCreate={(id: string, name: string) => {
              updateServiceData({ id, name });
              nextStep();
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      case 2:
        return (
          <Step2ValidateDescription
            serviceId={serviceData.id}
            serviceName={serviceData.name}
            description={serviceData.description}
            onDescriptionConfirmed={(description: string) => {
              updateServiceData({ description });
              nextStep();
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      case 3:
        return (
          <Step3ValidateBenefits
            serviceId={serviceData.id}
            serviceName={serviceData.name}
            benefits={serviceData.benefits}
            onBenefitsConfirmed={(benefits: string[]) => {
              updateServiceData({ benefits });
              nextStep();
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      case 4:
        return (
          <Step4ProcedureTime
            serviceId={serviceData.id}
            procedureTime={serviceData.procedureTime}
            onProcedureTimeConfirmed={(procedureTime: string) => {
              updateServiceData({ procedureTime });
              nextStep();
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      case 5:
        return (
          <Step5UploadImages
            serviceId={serviceData.id}
            serviceName={serviceData.name}
            imageUrls={serviceData.imageUrls}
            onImagesConfirmed={(imageUrls: string[]) => {
              updateServiceData({ imageUrls });
              nextStep();
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      case 6:
        return (
          <Step6InstagramLinks
            serviceId={serviceData.id}
            serviceName={serviceData.name}
            instagramLinks={serviceData.instagramLinks}
            onLinksConfirmed={(instagramLinks: string[]) => {
              updateServiceData({ instagramLinks });
              nextStep();
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      case 7:
        return (
          <Step7Finalize
            serviceData={serviceData}
            onFinalize={resetForm}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header com progresso */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Cadastrar Novo Serviço
        </h1>
        
        {/* Indicador de progresso */}
        <div className="flex justify-center items-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? 'bg-pink-500 text-white'
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Título da etapa atual */}
        <p className="text-gray-600">
          {currentStep === 1 && 'Etapa 1: Nome do Serviço'}
          {currentStep === 2 && 'Etapa 2: Validar Descrição'}
          {currentStep === 3 && 'Etapa 3: Validar Benefícios'}
          {currentStep === 4 && 'Etapa 4: Tempo de Procedimento'}
          {currentStep === 5 && 'Etapa 5: Upload de Imagens'}
          {currentStep === 6 && 'Etapa 6: Links do Instagram'}
          {currentStep === 7 && 'Etapa 7: Finalizar'}
        </p>
      </div>

      {/* Renderizar etapa atual */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Debug info (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-xs">
          <strong>Debug:</strong><br />
          Etapa: {currentStep}<br />
          ID: {serviceData.id}<br />
          Nome: {serviceData.name}
        </div>
      )}
    </div>
  );
}