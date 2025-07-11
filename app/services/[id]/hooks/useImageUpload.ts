// app/services/[id]/hooks/useImageUpload.ts

import { useState } from 'react';

interface ServiceData {
  id: string;
  name: string;
  imageUrls: string[];
}

export function useImageUpload() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (
    serviceData: ServiceData,
    onSuccess: (newUrls: string[]) => void
  ) => {
    if (selectedImages.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = selectedImages.map(async (imageFile, index) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('serviceId', serviceData.id);
        formData.append('serviceName', serviceData.name);
        formData.append('imageIndex', index.toString());

        const response = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro no upload da imagem ${index + 1}`);
        }

        const data = await response.json();
        return data.url;
      });

      const newUrls = await Promise.all(uploadPromises);
      const validUrls = newUrls.filter(url => url);

      // Atualizar URLs no banco
      const updatedUrls = [...serviceData.imageUrls, ...validUrls];
      
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceData.id,
          image_urls: updatedUrls
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar URLs no banco');
      }

      onSuccess(updatedUrls);
      setSelectedImages([]);
      
      return { success: true, count: validUrls.length };

    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (
    serviceData: ServiceData,
    urlToRemove: string,
    onSuccess: (newUrls: string[]) => void
  ) => {
    try {
      const updatedUrls = serviceData.imageUrls.filter(url => url !== urlToRemove);
      
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceData.id,
          image_urls: updatedUrls
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao remover imagem do banco');
      }

      onSuccess(updatedUrls);
      return { success: true };

    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw error;
    }
  };

  return {
    selectedImages,
    setSelectedImages,
    isUploading,
    uploadImages,
    removeImage
  };
}