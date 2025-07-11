// app/services/[id]/hooks/useServiceData.ts

import { useState, useEffect } from 'react';

interface ServiceData {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  procedureTime: string;
  imageUrls: string[];
  instagramLinks: string[];
  createdAt: string;
  updatedAt: string;
}

export function useServiceData(serviceId: string) {
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadService = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/services/${serviceId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar serviço');
      }

      const data = await response.json();
      setServiceData(data.service);

    } catch (error) {
      console.error('Erro ao carregar serviço:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  return {
    serviceData,
    setServiceData,
    isLoading,
    error,
    reloadService: loadService
  };
}