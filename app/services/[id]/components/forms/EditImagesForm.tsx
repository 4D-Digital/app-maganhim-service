// app/services/[id]/components/forms/EditImagesForm.tsx

'use client';

import React from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';

interface ServiceData {
  id: string;
  name: string;
  imageUrls: string[];
}

interface EditImagesFormProps {
  serviceData: ServiceData;
  onUpdate: (newUrls: string[]) => void;
}

export default function EditImagesForm({ serviceData, onUpdate }: EditImagesFormProps) {
  const {
    selectedImages,
    setSelectedImages,
    isUploading,
    uploadImages,
    removeImage
  } = useImageUpload();

  const handleUpload = async () => {
    try {
      const result = await uploadImages(serviceData, onUpdate);
      if (result && typeof result.count === 'number') {
        alert(`✅ ${result.count} imagem(ns) adicionada(s) com sucesso!`);
      } else {
        alert('✅ Imagem(ns) adicionada(s) com sucesso!');
      }
    } catch (error) {
      alert(`❌ Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleRemove = async (url: string) => {
    try {
      await removeImage(serviceData, url, onUpdate);
      alert('✅ Imagem removida com sucesso!');
    } catch (error) {
      alert(`❌ Erro ao remover imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Gerenciar Imagens ({serviceData.imageUrls.length})
      </h3>
      
      {/* Imagens existentes */}
      {serviceData.imageUrls.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-3">Imagens atuais:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {serviceData.imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => handleRemove(url)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload de novas imagens */}
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
          className="hidden"
          id="newImageUpload"
          disabled={isUploading}
        />
        <label
          htmlFor="newImageUpload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-center"
        >
          <Upload className="h-12 w-12 text-blue-600" />
          <span className="text-lg font-medium text-gray-900">
            Adicionar novas imagens
          </span>
          <span className="text-sm text-gray-600">
            Clique para selecionar ou arraste aqui (máx. 10MB por imagem)
          </span>
        </label>
      </div>

      {/* Preview das imagens selecionadas */}
      {selectedImages.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-gray-900 mb-3">
            Imagens selecionadas ({selectedImages.length}):
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-green-300"
                />
                <div className="text-xs text-gray-600 mt-1 truncate">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando {selectedImages.length} imagem(ns)...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Enviar {selectedImages.length} imagem(ns)
              </>
            )}
          </button>
        </div>
      )}

      {serviceData.imageUrls.length === 0 && selectedImages.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium text-lg">Nenhuma imagem cadastrada</p>
          <p className="text-gray-600 text-sm">Selecione imagens acima para adicionar</p>
        </div>
      )}
    </div>
  );
}