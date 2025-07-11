'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2, Check, Image as ImageIcon, CheckCircle2, Link } from 'lucide-react';

interface Step5UploadImagesProps {
  serviceId: string;
  serviceName: string;
  imageUrls: string[];
  onImagesConfirmed: (imageUrls: string[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface SelectedImage {
  file: File;
  preview: string;
  name: string;
  size: number;
}

export default function Step5UploadImages({
  serviceId,
  serviceName,
  imageUrls,
  onImagesConfirmed,
  isLoading,
  setIsLoading
}: Step5UploadImagesProps) {
  const [hasImages, setHasImages] = useState<boolean | null>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(imageUrls);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  // Função para lidar com seleção de arquivos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validar arquivos
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      
      if (!isValidType) {
        alert(`${file.name} não é uma imagem válida.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`${file.name} é muito grande. Máximo 10MB.`);
        return false;
      }
      
      return true;
    });

    // Criar previews
    const newImages: SelectedImage[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  // Função para remover imagem selecionada
  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview); // Limpar memory leak
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Função para fazer upload das imagens
  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      alert('Selecione pelo menos uma imagem.');
      return;
    }

    setIsUploading(true);

    try {
      // Converter imagens para base64 e enviar para API
      const uploadPromises = selectedImages.map(async (imageData, index) => {
        const formData = new FormData();
        formData.append('image', imageData.file);
        formData.append('serviceId', serviceId);
        formData.append('serviceName', serviceName);
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

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(url => url); // Filtrar URLs válidas

      setUploadedUrls(prev => [...prev, ...validUrls]);

      // Limpar imagens selecionadas após upload
      selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);

      // ✅ REMOVER ALERT - Mostrar sucesso visual
      setShowUploadSuccess(true);

    } catch (error) {
      console.error('Erro no upload:', error);
      alert(`Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Função para confirmar e avançar
  const handleConfirmImages = async () => {
    setIsLoading(true);

    try {
      // Salvar URLs no Supabase
      const response = await fetch('/api/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceId,
          image_urls: uploadedUrls
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar imagens');
      }

      // Notificar componente pai
      onImagesConfirmed(uploadedUrls);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar imagens. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar pergunta inicial
  if (hasImages === null) {
    return (
      <div className="bg-white p-8 rounded-lg border-2 border-purple-300 shadow-lg">
        <div className="text-center mb-6">
          <ImageIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Imagens do {serviceName}
          </h2>
          <p className="text-gray-700 text-lg">
            Você tem imagens de aplicações ou antes e depois para anexar?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setHasImages(true)}
            className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all"
          >
            Sim, tenho imagens
          </button>
          <button
            onClick={() => onImagesConfirmed([])}
            className="px-8 py-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
          >
            Não tenho imagens
          </button>
        </div>
      </div>
    );
  }

  // ✅ NOVO: Renderizar estado de sucesso 
  if (showUploadSuccess && uploadedUrls.length > 0) {
    return (
      <div className="bg-white p-8 rounded-lg border-2 border-green-300 shadow-lg">
        <div className="text-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            ✅ Imagens Enviadas com Sucesso!
          </h2>
          <p className="text-gray-700 text-lg">
            {uploadedUrls.length} imagem(ns) foram salvas no servidor
          </p>
        </div>

        {/* ✅ MOSTRAR URLs ao invés das imagens */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Link className="h-5 w-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">URLs das imagens:</h3>
          </div>
          <div className="space-y-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                <span className="font-mono text-xs">
                  {index + 1}. {url}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
          <h4 className="font-bold text-green-900 mb-2">🎉 Perfeito!</h4>
          <p className="text-sm text-green-800">
            Suas imagens estão seguras e prontas para serem exibidas no site da clínica.
            Clique em "Confirmar e Continuar" para prosseguir.
          </p>
        </div>

        {/* Botão de confirmação */}
        <div className="text-center">
          <button
            onClick={handleConfirmImages}
            disabled={isLoading}
            className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Salvando no banco...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Confirmar e Continuar
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Renderizar área de upload (estado inicial)
  return (
    <div className="bg-white p-8 rounded-lg border-2 border-purple-300 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Upload de Imagens - {serviceName}
        </h2>
        <p className="text-gray-700">
          Adicione imagens dos resultados, antes e depois, ou do procedimento sendo realizado.
        </p>
      </div>

      <div className="space-y-6">
        {/* Área de seleção de arquivos */}
        <div className="border-2 border-dashed border-purple-300 rounded-lg p-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="imageUpload"
            disabled={isUploading}
          />
          <label
            htmlFor="imageUpload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-center"
          >
            <Upload className="h-12 w-12 text-purple-600" />
            <span className="text-lg font-medium text-gray-900">
              Clique para selecionar imagens
            </span>
            <span className="text-sm text-gray-600">
              Ou arraste e solte aqui (máx. 10MB por imagem)
            </span>
          </label>
        </div>

        {/* Preview das imagens selecionadas */}
        {selectedImages.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Imagens selecionadas ({selectedImages.length}):
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    onClick={() => removeSelectedImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="text-xs text-gray-600 mt-1 truncate">
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleUploadImages}
              disabled={isUploading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando imagens...
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

        {/* Dicas úteis */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">💡 Dicas para melhores resultados:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use imagens em boa qualidade e bem iluminadas</li>
            <li>• Fotos "antes e depois" são muito valorizadas pelos clientes</li>
            <li>• Mantenha o foco no resultado do procedimento</li>
            <li>• Formatos aceitos: JPG, PNG, WebP (máx. 10MB cada)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}