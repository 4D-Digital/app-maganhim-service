import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `teste-${timestamp}.${imageFile.name.split('.').pop()}`;
    const storagePath = `uploads/${fileName}`;

    console.log('Tentando upload:', storagePath);

    // Converter para buffer
    const fileBuffer = await imageFile.arrayBuffer();

    // Upload para Supabase Storage
    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_BASE_URL}/storage/v1/object/imagens/${storagePath}`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
          'Content-Type': imageFile.type,
        },
        body: fileBuffer
      }
    );

    console.log('Upload status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Erro no upload:', errorText);
      return NextResponse.json({
        error: `Upload falhou: ${uploadResponse.status}`,
        details: errorText
      }, { status: 500 });
    }

    // Gerar URL pública
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_BASE_URL}/storage/v1/object/public/imagens/${storagePath}`;

    return NextResponse.json({
      success: true,
      message: 'Upload realizado com sucesso!',
      fileName,
      storagePath,
      publicUrl,
      uploadStatus: uploadResponse.status
    });

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: `Erro: ${error}` }, { status: 500 });
  }
}