import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const serviceId = formData.get('serviceId') as string;
    const serviceName = formData.get('serviceName') as string;
    const imageIndex = formData.get('imageIndex') as string;

    console.log('=== SUPABASE UPLOAD ===');
    console.log('Arquivo recebido:', {
      name: imageFile?.name,
      size: imageFile?.size,
      type: imageFile?.type,
      serviceName,
      serviceId
    });

    // Validações (mantidas iguais)
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

    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser uma imagem' },
        { status: 400 }
      );
    }

    // Aumentar limite para 50MB (melhor que 10MB)
    const maxSize = 50 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Imagem muito grande. Máximo 50MB.' },
        { status: 400 }
      );
    }

    // Gerar path organizado no Supabase
    const sanitizedServiceName = serviceName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExt = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomId}.${fileExt}`;
    const storagePath = `services/${sanitizedServiceName}/${fileName}`;

    console.log('Storage path:', storagePath);

    // Upload para Supabase Storage
    const fileBuffer = await imageFile.arrayBuffer();

    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_BASE_URL}/storage/v1/object/imagens/${storagePath}`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
          'Content-Type': imageFile.type,
          'Cache-Control': 'max-age=3600',
        },
        body: fileBuffer
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Erro no upload Supabase:', uploadResponse.status, errorText);
      return NextResponse.json(
        { error: `Erro no upload: ${uploadResponse.status}` },
        { status: 500 }
      );
    }

    // Gerar URL pública
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_BASE_URL}/storage/v1/object/public/imagens/${storagePath}`;

    console.log('Upload Supabase concluído:', publicUrl);

    // Notificar N8N (opcional - mantendo compatibilidade)
    if (process.env.N8N_WEBHOOK_UPLOAD) {
      try {
        const n8nPayload = {
          serviceId,
          serviceName: sanitizedServiceName,
          fileName,
          fileType: imageFile.type,
          fileSize: imageFile.size,
          publicUrl,
          storagePath,
          timestamp: new Date().toISOString(),
          source: 'supabase-storage'
        };

        fetch(process.env.N8N_WEBHOOK_UPLOAD, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload)
        }).catch(err => console.warn('N8N webhook falhou:', err));
      } catch (n8nError) {
        console.warn('N8N webhook error:', n8nError);
      }
    }

    // Resposta idêntica à API anterior (compatibilidade total)
    return NextResponse.json({
      success: true,
      url: publicUrl,
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