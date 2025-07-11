'use client';

import { useState } from 'react';

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setResult('Nenhum arquivo selecionado');
      return;
    }
  
    setIsUploading(true);
    setResult('Enviando...');
  
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
  
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData
      });
  
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
  
    } catch (error) {
      setResult(`Erro: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Teste Upload Supabase</h1>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="mb-4 p-4 border text-black border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm"><span className="font-semibold">Arquivo:</span> {selectedFile.name}</p>
            <p className="text-sm"><span className="font-semibold">Tamanho:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p className="text-sm"><span className="font-semibold">Tipo:</span> {selectedFile.type}</p>
          </div>
        )}

        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 text-gray py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isUploading ? 'Enviando...' : 'Testar Upload'}
          </button>
        )}

{result && (
  <div className="mt-4 p-4 bg-white border border-gray-300 rounded-lg">
    <h3 className="text-sm font-semibold text-gray-700 mb-2">Resultado:</h3>
    <pre className="text-xs text-gray-800 bg-gray-50 p-3 rounded overflow-auto">{result}</pre>
  </div>
)}
      </div>
    </div>
  );
}