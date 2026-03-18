'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  SparklesIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface GeneratedImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

const STYLE_PRESETS = [
  { id: 'none', label: 'Aucun', description: 'Prompt libre' },
  { id: 'professional', label: 'Professionnel', description: 'Corporate, épuré' },
  { id: 'illustration', label: 'Illustration', description: 'Dessin vectoriel' },
  { id: 'flat-design', label: 'Flat Design', description: 'Minimaliste, couleurs vives' },
  { id: '3d-render', label: '3D Render', description: 'Rendu 3D réaliste' },
  { id: 'watercolor', label: 'Aquarelle', description: 'Style peinture douce' },
  { id: 'isometric', label: 'Isométrique', description: 'Vue isométrique technique' },
  { id: 'photorealistic', label: 'Photo-réaliste', description: 'Comme une vraie photo' },
];

const PROMPT_SUGGESTIONS = [
  "Une équipe diverse en réunion dans un bureau moderne",
  "Un candidat souriant lors d'un entretien d'embauche",
  "Un bureau de recrutement moderne avec des écrans",
  "Une poignée de main professionnelle entre deux personnes",
  "Un dashboard analytique sur un écran d'ordinateur",
  "Des icônes de compétences professionnelles flottantes",
];

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('none');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<{ prompt: string; style: string; images: GeneratedImage[] }[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer un prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: style === 'none' ? null : style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de génération');
      }

      setImages(data.images);
      setHistory((prev) => [
        { prompt: prompt.trim(), style, images: data.images },
        ...prev.slice(0, 9),
      ]);
      toast.success(`${data.images.length} image(s) générée(s) !`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, style]);

  const handleDownload = useCallback((image: GeneratedImage, index: number) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    const ext = image.mimeType.split('/')[1] || 'png';
    link.download = `intowork-image-${Date.now()}-${index}.${ext}`;
    link.click();
    toast.success('Image téléchargée !');
  }, []);

  const handleCopyBase64 = useCallback(async (image: GeneratedImage) => {
    try {
      await navigator.clipboard.writeText(image.dataUrl);
      toast.success('URL copiée dans le presse-papier');
    } catch {
      toast.error('Impossible de copier');
    }
  }, []);

  return (
    <DashboardLayout title="Générateur d'images IA" subtitle="Créez des visuels pour vos contenus">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prompt Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Décrivez votre image</h2>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Une illustration professionnelle d'un processus de recrutement moderne..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleGenerate();
              }
            }}
          />

          {/* Suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Style visuel</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setStyle(preset.id)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  style === preset.id
                    ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`text-sm font-medium ${style === preset.id ? 'text-violet-700' : 'text-gray-900'}`}>
                  {preset.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-200"
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              Générer l&apos;image
              <span className="text-violet-200 text-sm ml-1">(Ctrl+Enter)</span>
            </>
          )}
        </button>

        {/* Results */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images générées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="group relative rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={image.dataUrl}
                    alt={`Image générée ${index + 1}`}
                    className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDownload(image, index)}
                        className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                        title="Télécharger"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCopyBase64(image)}
                        className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                        title="Copier le lien"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !isGenerating && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Aucune image générée</h3>
            <p className="text-sm text-gray-400 mt-1">
              Entrez un prompt et cliquez sur &quot;Générer&quot; pour créer vos visuels
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique récent</h3>
            <div className="space-y-3">
              {history.map((entry, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPrompt(entry.prompt);
                    setStyle(entry.style);
                    setImages(entry.images);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 truncate pr-4">{entry.prompt}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.style !== 'none' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                          {STYLE_PRESETS.find((s) => s.id === entry.style)?.label}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{entry.images.length} img</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage.dataUrl}
                alt="Image en plein écran"
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleDownload(selectedImage, 0)}
                  className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors shadow-lg"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors shadow-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
