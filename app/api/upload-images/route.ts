// api/upload-images/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const serviceId = formData.get('serviceId') as string;
    const serviceName = formData.get('serviceName') as string;
    const imageIndex = formData.get('imageIndex') as string;

    console.log('=== DEBUG UPLOAD IMAGES ===');
    console.log('Arquivo recebido:', {
      name: imageFile?.name,
      size: imageFile?.size,
      type: imageFile?.type
    });
    console.log('Dados recebidos:', { serviceId, serviceName, imageIndex });

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi enviada' },
        { status: 400 }
      );
    }

    if (!serviceId || !serviceName) {
      return NextResponse.json(
        { error: 'ID e nome do serviço são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser uma imagem' },
        { status: 400 }
      );
    }

    // Validar tamanho (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Imagem muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Converter para base64 para enviar ao n8n
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Gerar nome único para arquivo
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${imageIndex || '0'}.${fileExtension}`;

    // Payload para n8n
    const payload = {
      serviceId,
      serviceName: serviceName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
      fileName,
      fileType: imageFile.type,
      fileSize: imageFile.size,
      base64Data: base64,
      timestamp: new Date().toISOString()
    };

    console.log('Payload para n8n:', {
      ...payload,
      base64Data: `[${base64.length} caracteres]` // Não logar base64 completo
    });

    // Chamar webhook do n8n para upload
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_UPLOAD!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Status resposta n8n:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('Erro no n8n:', errorText);
      return NextResponse.json(
        { error: `Erro no processamento: ${n8nResponse.status}` },
        { status: 500 }
      );
    }

    const n8nData = await n8nResponse.json();
    console.log('Resposta n8n:', n8nData);

    // n8n deve retornar: { "url": "http://vps.com/path/image.jpg", "success": true }
    if (!n8nData.url) {
      console.error('N8N não retornou URL:', n8nData);
      return NextResponse.json(
        { error: 'Erro: URL da imagem não foi gerada' },
        { status: 500 }
      );
    }

    console.log('=== FIM DEBUG UPLOAD ===');

    return NextResponse.json({
      success: true,
      url: n8nData.url,
      fileName: fileName,
      message: 'Imagem enviada com sucesso!'
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}