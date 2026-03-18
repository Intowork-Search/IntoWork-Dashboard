import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, style } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Le prompt est requis' },
        { status: 400 }
      );
    }

    const styledPrompt = style
      ? `Style: ${style}. ${prompt}`
      : prompt;

    const result = await generateText({
      model: 'google/gemini-3.1-flash-image-preview' as any,
      prompt: styledPrompt,
    });

    const files = result.files ?? [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Aucune image n'a été générée. Essayez un prompt différent." },
        { status: 422 }
      );
    }

    const images = files.map((file) => {
      const base64 = Buffer.from(file.data).toString('base64');
      const mimeType = file.mimeType || 'image/png';
      return { base64, mimeType, dataUrl: `data:${mimeType};base64,${base64}` };
    });

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
