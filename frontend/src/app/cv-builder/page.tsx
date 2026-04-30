'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useNextAuth';
import { logger } from '@/lib/logger';
import { useCVDocument, useSaveCV, useTogglePublic, useCVAnalytics } from '@/hooks/useCVBuilder';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type {
  CVTemplate,
  CVData,
  PersonalInfo,
  ExperienceItem as Experience,
  EducationItem as Education,
  SkillItem as Skill,
  LanguageItem as Language,
  LanguageLevel
} from '@/hooks/useCVBuilder';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

// Storage key for localStorage
const STORAGE_KEY = 'intowork_cv_data';
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

// Brand colors from the design charter
const BRAND = {
  green: '#6B9B5F',
  greenLight: '#E8F0E5',
  greenDark: '#4A7A3F',
  gold: '#F7C700',
  goldLight: '#FFF9E0',
  violet: '#6B46C1',
  violetLight: '#EDE9F7',
};

// Types are imported from useCVBuilder hook
type Template = CVTemplate;

const STEPS = [
  { id: 'info', label: 'Profil', description: 'Vos informations personnelles', emoji: '👤' },
  { id: 'experience', label: 'Parcours', description: 'Votre expérience professionnelle', emoji: '💼' },
  { id: 'education', label: 'Formation', description: 'Vos diplômes et certifications', emoji: '🎓' },
  { id: 'skills', label: 'Talents', description: 'Vos compétences techniques', emoji: '⚡' },
  { id: 'languages', label: 'Langues', description: 'Vos langues parlées', emoji: '🌍' },
];

const TEMPLATES: { id: Template; name: string; description: string; colors: string[] }[] = [
  { id: 'elegance', name: 'Élégance', description: 'Classique et raffiné', colors: [BRAND.green, BRAND.greenDark, BRAND.greenLight] },
  { id: 'bold', name: 'Impact', description: 'Audacieux et moderne', colors: [BRAND.violet, '#4A2E8F', BRAND.violetLight] },
  { id: 'minimal', name: 'Épuré', description: 'Minimaliste et clean', colors: ['#1f2937', '#6b7280', '#f9fafb'] },
  { id: 'creative', name: 'Créatif', description: 'Original et artistique', colors: [BRAND.gold, '#C49E00', BRAND.goldLight] },
  { id: 'executive', name: 'Executive', description: 'Sobre et professionnel', colors: ['#1e3a5f', '#0f172a', '#f8fafc'] },
];

const LANGUAGE_LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'];

// Initial empty CV data
const initialCvData: CVData = {
  personalInfo: {
    photo: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    title: '',
    summary: '',
  },
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
};

export default function CVBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('elegance');
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const cvRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cvData, setCvData] = useState<CVData>(initialCvData);

  // Backend integration hooks
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { data: cvDocument, isLoading: isLoadingCV } = useCVDocument({ enabled: isSignedIn });
  const saveCV = useSaveCV();
  const togglePublic = useTogglePublic();
  const { data: analytics } = useCVAnalytics({ enabled: isSignedIn && !!cvDocument });

  // State for public sharing
  const [isPublic, setIsPublic] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { confirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm, handleCancel } = useConfirmModal();

  // Load data from backend (if authenticated) or localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load CV from backend when authenticated
  useEffect(() => {
    if (!authLoaded || isLoadingCV) return;

    if (isSignedIn && cvDocument) {
      // Load from backend
      setCvData(cvDocument.cv_data);
      setSelectedTemplate(cvDocument.template as Template);
      setIsPublic(cvDocument.is_public);
      setPublicSlug(cvDocument.slug);
      toast.success('CV chargé depuis votre compte', { duration: 2000 });
    } else if (!isSignedIn) {
      // Fallback to localStorage for non-authenticated users
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCvData(parsed.cvData || initialCvData);
          setSelectedTemplate(parsed.template || 'elegance');
          toast.success('CV restauré depuis votre dernière session', { duration: 2000 });
        }
      } catch (error) {
        logger.error("Error loading saved CV:", error);
      }
    }
  }, [authLoaded, isSignedIn, cvDocument, isLoadingCV]);

  // Auto-save to localStorage (for non-authenticated users)
  const saveToLocalStorage = () => {
    try {
      setIsSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cvData,
        template: selectedTemplate,
        savedAt: new Date().toISOString(),
      }));
      setLastSaved(new Date());
      setIsSaving(false);
    } catch (error) {
      logger.error("Error saving CV:", error);
      setIsSaving(false);
    }
  };

  // Save to backend (for authenticated users)
  const saveToBackend = async () => {
    if (!isSignedIn) return;
    try {
      setIsSaving(true);
      await saveCV.mutateAsync({
        cv_data: cvData,
        template: selectedTemplate as CVTemplate,
        is_public: isPublic,
      });
      setLastSaved(new Date());
    } catch (error) {
      logger.error("Error saving CV to backend:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      if (isSignedIn) {
        saveToBackend();
      } else {
        saveToLocalStorage();
      }
    }, 2000); // Save 2 seconds after last change
    return () => clearTimeout(timer);
  }, [cvData, selectedTemplate, mounted, isSignedIn, saveToBackend, saveToLocalStorage]);

  // Validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          return 'Format d\'email invalide';
        }
        break;
      case 'phone':
        if (value && !/^[+]?[\d\s-]{8,}$/.test(value)) {
          return 'Format de téléphone invalide';
        }
        break;
    }
    return null;
  };

  // Clear/Reset CV
  const handleClearCV = async () => {
    const ok = await confirm({
      title: 'Réinitialiser le CV ?',
      message: 'Toutes les données saisies seront effacées et le CV reviendra à son état initial.',
      detail: 'Cette action est irréversible.',
      confirmLabel: 'Réinitialiser',
    });
    if (!ok) return;

    setCvData(initialCvData);
    setSelectedTemplate('elegance');
    setCurrentStep(0);
    setValidationErrors({});
    localStorage.removeItem(STORAGE_KEY);
    toast.success('CV réinitialisé avec succès');
  };

  // Toggle public sharing
  const handleTogglePublic = async () => {
    if (!isSignedIn) {
      toast.error('Connectez-vous pour partager votre CV publiquement');
      return;
    }
    try {
      const result = await togglePublic.mutateAsync();
      setIsPublic(result.is_public);
      if (result.is_public && result.public_url) {
        setShowShareModal(true);
      }
    } catch (error) {
      logger.error("Error toggling public:", error);
    }
  };

  // Copy public URL to clipboard
  const copyPublicUrl = () => {
    if (publicSlug) {
      const fullUrl = `${window.location.origin}/cv/${publicSlug}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  // Export CV as JSON
  const handleExportJSON = () => {
    try {
      const exportData = {
        cvData,
        template: selectedTemplate,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${cvData.personalInfo.firstName || 'mon'}_${cvData.personalInfo.lastName || 'cv'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CV exporté avec succès');
    } catch (error) {
      logger.error("Export error:", error);
      toast.error('Erreur lors de l\'export');
    }
  };

  // Import CV from JSON
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.cvData) {
          setCvData(imported.cvData);
          if (imported.template) {
            setSelectedTemplate(imported.template);
          }
          toast.success('CV importé avec succès');
        } else {
          toast.error('Format de fichier invalide');
        }
      } catch (error) {
        logger.error("Import error:", error);
        toast.error('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Handlers
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    // Validate field if applicable
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_PHOTO_SIZE) {
        toast.error(`La photo doit être inférieure à ${MAX_PHOTO_SIZE / (1024 * 1024)} Mo`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide (JPG, PNG, etc.)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('photo', reader.result as string);
        toast.success('Photo ajoutée avec succès');
      };
      reader.onerror = () => {
        toast.error('Erreur lors du chargement de la photo');
      };
      reader.readAsDataURL(file);
    }
  };

  // Experience handlers
  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { id: generateId(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' },
      ],
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({ ...prev, experiences: prev.experiences.filter(exp => exp.id !== id) }));
  };

  // Education handlers
  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        { id: generateId(), school: '', degree: '', field: '', startDate: '', endDate: '', description: '' },
      ],
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setCvData(prev => ({
      ...prev,
      educations: prev.educations.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({ ...prev, educations: prev.educations.filter(edu => edu.id !== id) }));
  };

  // Skill handlers
  const addSkill = () => {
    setCvData(prev => ({ ...prev, skills: [...prev.skills, { id: generateId(), name: '', level: 3 }] }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => (skill.id === id ? { ...skill, [field]: value } : skill)),
    }));
  };

  const removeSkill = (id: string) => {
    setCvData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill.id !== id) }));
  };

  // Language handlers
  const addLanguage = () => {
    setCvData(prev => ({ ...prev, languages: [...prev.languages, { id: generateId(), name: '', level: 'B1' }] }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map(lang => (lang.id === id ? { ...lang, [field]: value } : lang)),
    }));
  };

  const removeLanguage = (id: string) => {
    setCvData(prev => ({ ...prev, languages: prev.languages.filter(lang => lang.id !== id) }));
  };

  // Navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  // PDF Generation - Uses browser print dialog for best compatibility
  const generatePDF = async () => {
    // Check if minimum data is present
    if (!cvData.personalInfo.firstName && !cvData.personalInfo.lastName) {
      toast.error('Veuillez remplir au moins votre nom pour générer le PDF');
      return;
    }

    setIsGeneratingPDF(true);

    // Template colors (hex only - no modern color functions)
    const templateColors: Record<string, { primary: string; secondary: string; bg: string }> = {
      elegance: { primary: '#6B9B5F', secondary: '#4A7A3F', bg: '#E8F0E5' },
      bold: { primary: '#6B46C1', secondary: '#4A2E8F', bg: '#EDE9F7' },
      minimal: { primary: '#1f2937', secondary: '#6b7280', bg: '#f9fafb' },
      creative: { primary: '#F7C700', secondary: '#C49E00', bg: '#FFF9E0' },
      executive: { primary: '#1e3a5f', secondary: '#0f172a', bg: '#f8fafc' },
    };

    const colors = templateColors[selectedTemplate] || templateColors.elegance;

    // Generate clean HTML with inline styles (no Tailwind, no modern colors)
    const generateCVHTML = () => {
      const { personalInfo, experiences, educations, skills, languages } = cvData;

      const experiencesHTML = experiences.map(exp => `
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <div>
              <div style="font-weight: 600; color: ${colors.secondary};">${exp.position}</div>
              <div style="color: #6b7280;">${exp.company}</div>
            </div>
            <div style="color: ${colors.primary}; font-size: 12px; font-weight: 500;">
              ${exp.startDate} - ${exp.current ? 'Présent' : exp.endDate}
            </div>
          </div>
          ${exp.description ? `<div style="font-size: 13px; color: #4b5563; margin-top: 8px;">${exp.description}</div>` : ''}
        </div>
      `).join('');

      const educationsHTML = educations.map(edu => `
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <div>
              <div style="font-weight: 600; color: ${colors.secondary};">${edu.degree} - ${edu.field}</div>
              <div style="color: #6b7280;">${edu.school}</div>
            </div>
            <div style="color: ${colors.primary}; font-size: 12px; font-weight: 500;">
              ${edu.startDate} - ${edu.endDate}
            </div>
          </div>
          ${edu.description ? `<div style="font-size: 13px; color: #4b5563; margin-top: 8px;">${edu.description}</div>` : ''}
        </div>
      `).join('');

      const skillsHTML = skills.map(skill => `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
            <span style="color: #374151;">${skill.name}</span>
            <span style="color: #9ca3af;">${skill.level}%</span>
          </div>
          <div style="height: 6px; background: ${colors.bg}; border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; width: ${skill.level}%; background: ${colors.primary}; border-radius: 3px;"></div>
          </div>
        </div>
      `).join('');

      const languagesHTML = languages.map(lang => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="color: #374151;">${lang.name}</span>
          <span style="background: ${colors.bg}; color: ${colors.primary}; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${lang.level}</span>
        </div>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>CV - ${personalInfo.firstName} ${personalInfo.lastName}</title>
          <style>
            @page { size: A4; margin: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.5; color: #1f2937; background: white; }
          </style>
        </head>
        <body>
          <div style="width: 210mm; min-height: 297mm; margin: 0 auto; background: white;">
            <!-- Header -->
            <div style="background: ${colors.primary}; color: white; padding: 32px; display: flex; align-items: center; gap: 24px;">
              ${personalInfo.photo ? `<img src="${personalInfo.photo}" style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid white; object-fit: cover;" />` : ''}
              <div>
                <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">${personalInfo.firstName} ${personalInfo.lastName}</h1>
                ${personalInfo.title ? `<div style="font-size: 16px; opacity: 0.9;">${personalInfo.title}</div>` : ''}
              </div>
            </div>

            <!-- Contact -->
            <div style="padding: 16px 32px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; flex-wrap: wrap; gap: 24px;">
              ${personalInfo.email ? `<span style="font-size: 13px; color: #4b5563;">📧 ${personalInfo.email}</span>` : ''}
              ${personalInfo.phone ? `<span style="font-size: 13px; color: #4b5563;">📱 ${personalInfo.phone}</span>` : ''}
              ${personalInfo.address ? `<span style="font-size: 13px; color: #4b5563;">📍 ${personalInfo.address}</span>` : ''}
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              ${personalInfo.summary ? `
                <div style="background: ${colors.bg}; padding: 16px; border-radius: 8px; border-left: 4px solid ${colors.primary}; margin-bottom: 32px;">
                  <p style="color: #374151;">${personalInfo.summary}</p>
                </div>
              ` : ''}

              <div style="display: flex; gap: 32px;">
                <!-- Left Column -->
                <div style="flex: 2;">
                  ${experiences.length > 0 ? `
                    <div style="margin-bottom: 32px;">
                      <h2 style="color: ${colors.primary}; font-size: 18px; font-weight: 700; padding-bottom: 8px; border-bottom: 2px solid ${colors.primary}; margin-bottom: 16px;">Expérience Professionnelle</h2>
                      ${experiencesHTML}
                    </div>
                  ` : ''}

                  ${educations.length > 0 ? `
                    <div style="margin-bottom: 32px;">
                      <h2 style="color: ${colors.primary}; font-size: 18px; font-weight: 700; padding-bottom: 8px; border-bottom: 2px solid ${colors.primary}; margin-bottom: 16px;">Formation</h2>
                      ${educationsHTML}
                    </div>
                  ` : ''}
                </div>

                <!-- Right Column -->
                <div style="flex: 1;">
                  ${skills.length > 0 ? `
                    <div style="margin-bottom: 32px;">
                      <h2 style="color: ${colors.primary}; font-size: 18px; font-weight: 700; padding-bottom: 8px; border-bottom: 2px solid ${colors.primary}; margin-bottom: 16px;">Compétences</h2>
                      ${skillsHTML}
                    </div>
                  ` : ''}

                  ${languages.length > 0 ? `
                    <div>
                      <h2 style="color: ${colors.primary}; font-size: 18px; font-weight: 700; padding-bottom: 8px; border-bottom: 2px solid ${colors.primary}; margin-bottom: 16px;">Langues</h2>
                      ${languagesHTML}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    try {
      // Open new window with CV HTML and trigger print
      const cvHTML = generateCVHTML();
      const printWindow = window.open('', '_blank');

      if (printWindow) {
        printWindow.document.write(cvHTML);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            setIsGeneratingPDF(false);
          }, 250);
        };

        // Fallback if onload doesn't fire
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.print();
            setIsGeneratingPDF(false);
          }
        }, 1000);

        toast.success('Utilisez "Enregistrer en PDF" dans la boîte de dialogue d\'impression');
      } else {
        toast.error('Veuillez autoriser les popups pour télécharger le PDF');
        setIsGeneratingPDF(false);
      }
    } catch (error) {
      logger.error("Error generating PDF:", error);
      toast.error('Erreur lors de la génération du PDF');
      setIsGeneratingPDF(false);
    }
  };

  const completionPercentage = () => {
    let filled = 0;
    const total = 8;
    if (cvData.personalInfo.firstName) filled++;
    if (cvData.personalInfo.lastName) filled++;
    if (cvData.personalInfo.email) filled++;
    if (cvData.personalInfo.title) filled++;
    if (cvData.personalInfo.summary) filled++;
    if (cvData.experiences.length > 0) filled++;
    if (cvData.skills.length > 0) filled++;
    if (cvData.educations.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-white`}>
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: BRAND.green }} />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ backgroundColor: BRAND.violet }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: BRAND.gold }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center group">
              <img src="/logo-intowork.png" alt="INTOWORK" className="h-20 sm:h-28 w-auto transition-transform group-hover:scale-105" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Auto-save indicator */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                {isSaving ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sauvegarde...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Sauvegardé</span>
                  </>
                ) : null}
              </div>

              {/* Completion Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ backgroundColor: BRAND.greenLight, borderColor: `${BRAND.green}40` }}>
                <div className="relative w-7 h-7">
                  <svg className="w-7 h-7 transform -rotate-90">
                    <circle cx="14" cy="14" r="10" stroke="#e2e8f0" strokeWidth="2.5" fill="none" />
                    <circle
                      cx="14" cy="14" r="10"
                      stroke={BRAND.green}
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray={`${completionPercentage() * 0.63} 100`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: BRAND.green }}>
                    {completionPercentage()}%
                  </span>
                </div>
              </div>

              {/* Import/Export Dropdown */}
              <div className="hidden md:block relative group">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Options
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Exporter (JSON)
                  </button>
                  <label className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Importer (JSON)
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                  <hr className="my-1 border-slate-100" />
                  <button
                    type="button"
                    onClick={handleClearCV}
                    className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Réinitialiser
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                aria-label={showPreview ? 'Basculer en mode édition' : 'Voir l\'aperçu du CV'}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={showPreview ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                </svg>
                {showPreview ? 'Éditer' : 'Aperçu'}
              </button>

              {/* Share Button - Only for authenticated users */}
              {isSignedIn && (
                <button
                  type="button"
                  onClick={handleTogglePublic}
                  disabled={togglePublic.isPending}
                  aria-label={isPublic ? 'Rendre le CV privé' : 'Partager le CV publiquement'}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isPublic
                      ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {isPublic ? 'Partagé' : 'Partager'}
                </button>
              )}

              {/* Public URL indicator */}
              {isSignedIn && isPublic && publicSlug && (
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  className="hidden md:flex items-center gap-1.5 px-2 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs hover:bg-violet-100 transition-all"
                  title="Cliquez pour copier le lien"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="truncate max-w-[100px]">/cv/{publicSlug}</span>
                </button>
              )}

              <button
                type="button"
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                aria-label="Télécharger le CV en PDF"
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND.green, boxShadow: `0 10px 15px -3px ${BRAND.green}40` }}
              >
                {isGeneratingPDF ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Génération...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="hidden sm:inline">Télécharger</span> PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: BRAND.greenLight, border: `1px solid ${BRAND.green}30` }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: BRAND.green }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: BRAND.green }}></span>
              </span>
              <span className="text-sm font-medium" style={{ color: BRAND.green }}>Créateur de CV Intelligent</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
              Créez un CV{' '}
              <span style={{ color: BRAND.green }}>remarquable</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Construisez votre CV professionnel en 5 étapes simples
            </p>
          </div>

          {/* Progress Stepper */}
          <div className={`mb-10 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="hidden md:flex items-center justify-center gap-2">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    aria-label={`Aller à l'étape ${step.label}`}
                    aria-current={index === currentStep ? 'step' : undefined}
                    className="group relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300"
                    style={
                      index === currentStep
                        ? { backgroundColor: BRAND.green, color: 'white', boxShadow: `0 10px 15px -3px ${BRAND.green}40`, transform: 'scale(1.05)' }
                        : index < currentStep
                        ? { backgroundColor: BRAND.greenLight, color: BRAND.green }
                        : { backgroundColor: '#f1f5f9', color: '#64748b' }
                    }
                  >
                    <span className="text-lg">{step.emoji}</span>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${index === currentStep ? 'text-white' : ''}`}>{step.label}</p>
                      <p className={`text-xs ${index === currentStep ? 'text-white/80' : 'text-slate-500'} hidden lg:block`}>
                        {step.description}
                      </p>
                    </div>
                    {index < currentStep && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: BRAND.green }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className="w-8 h-0.5 mx-1 rounded-full transition-colors" style={{ backgroundColor: index < currentStep ? BRAND.green : '#e2e8f0' }} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Stepper */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Étape {currentStep + 1} sur {STEPS.length}</span>
                <span className="text-sm font-semibold" style={{ color: BRAND.green }}>{STEPS[currentStep].label}</span>
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => goToStep(index)}
                    aria-label={`Aller à l'étape ${index + 1}`}
                    className="h-1.5 rounded-full flex-1 transition-all"
                    style={{
                      backgroundColor: index === currentStep
                        ? BRAND.green
                        : index < currentStep
                        ? `${BRAND.green}60`
                        : '#e2e8f0'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Form Section */}
            <div className={`${showPreview ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
                {/* Step Header */}
                <div className="bg-slate-50 px-6 sm:px-8 py-5 border-b border-slate-200/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ backgroundColor: BRAND.green, boxShadow: `0 10px 15px -3px ${BRAND.green}40` }}>
                      {STEPS[currentStep].emoji}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{STEPS[currentStep].label}</h2>
                      <p className="text-sm text-slate-500">{STEPS[currentStep].description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Personal Info Step */}
                  {currentStep === 0 && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Photo Upload */}
                      <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-slate-50 to-transparent rounded-2xl border border-slate-100">
                        <div className="relative group">
                          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 group-hover:border-teal-400 transition-colors">
                            {cvData.personalInfo.photo ? (
                              <img src={cvData.personalInfo.photo} alt="Photo" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center">
                                <svg className="w-10 h-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform" title="Ajouter une photo" style={{ backgroundColor: BRAND.green, boxShadow: `0 10px 15px -3px ${BRAND.green}40` }}>
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" aria-label="Télécharger une photo de profil" />
                            <span className="sr-only">Ajouter une photo de profil</span>
                          </label>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 mb-1">Photo de profil</p>
                          <p className="text-sm text-slate-500">Ajoutez une photo professionnelle</p>
                          <p className="text-xs text-slate-400 mt-1">JPG, PNG • Max 5 Mo</p>
                        </div>
                      </div>

                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Prénom <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cvData.personalInfo.firstName}
                            onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-black"
                            placeholder="Jean"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nom <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cvData.personalInfo.lastName}
                            onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-black"
                            placeholder="Dupont"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Titre professionnel <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cvData.personalInfo.title}
                          onChange={(e) => updatePersonalInfo('title', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-black"
                          placeholder="Développeur Full Stack Senior"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={cvData.personalInfo.email}
                            onChange={(e) => updatePersonalInfo('email', e.target.value)}
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-black ${
                              validationErrors.email
                                ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                            }`}
                            placeholder="jean@email.com"
                          />
                          {validationErrors.email && (
                            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {validationErrors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                          <input
                            type="tel"
                            value={cvData.personalInfo.phone}
                            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-black ${
                              validationErrors.phone
                                ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                            }`}
                            placeholder="+33 6 12 34 56 78"
                          />
                          {validationErrors.phone && (
                            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {validationErrors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse</label>
                        <input
                          type="text"
                          value={cvData.personalInfo.address}
                          onChange={(e) => updatePersonalInfo('address', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-black"
                          placeholder="Paris, France"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Résumé professionnel</label>
                        <textarea
                          value={cvData.personalInfo.summary}
                          onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-black h-32 resize-none"
                          placeholder="Décrivez brièvement votre profil et vos ambitions professionnelles..."
                        />
                        <p className="text-xs text-slate-400 mt-2">💡 Conseil : Soyez concis et mettez en avant vos points forts</p>
                      </div>
                    </div>
                  )}

                  {/* Experience Step */}
                  {currentStep === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      {cvData.experiences.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-slate-600 font-medium mb-1">Aucune expérience ajoutée</p>
                          <p className="text-sm text-slate-400">Commencez par votre poste le plus récent</p>
                        </div>
                      ) : (
                        cvData.experiences.map((exp, index) => (
                          <div key={exp.id} className="relative bg-gradient-to-r from-slate-50 to-transparent rounded-2xl border border-slate-200 p-5 group hover:border-teal-300 transition-colors">
                            <button
                              type="button"
                              onClick={() => removeExperience(exp.id)}
                              aria-label="Supprimer cette expérience"
                              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">{index + 1}</span>
                              <span className="text-sm font-medium text-slate-500">Expérience</span>
                            </div>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                  placeholder="Nom de l'entreprise"
                                />
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                  placeholder="Titre du poste"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                                <div>
                                  <input
                                    type="month"
                                    value={exp.endDate}
                                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50"
                                    disabled={exp.current}
                                  />
                                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={exp.current}
                                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-slate-600">Poste actuel</span>
                                  </label>
                                </div>
                              </div>
                              <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                                rows={3}
                                placeholder="Décrivez vos responsabilités et réalisations..."
                              />
                            </div>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={addExperience}
                        className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl text-slate-500 hover:text-teal-600 font-medium flex items-center justify-center gap-2 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                        Ajouter une expérience
                      </button>
                    </div>
                  )}

                  {/* Education Step */}
                  {currentStep === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      {cvData.educations.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                          <p className="text-slate-600 font-medium mb-1">Aucune formation ajoutée</p>
                          <p className="text-sm text-slate-400">Ajoutez vos diplômes et certifications</p>
                        </div>
                      ) : (
                        cvData.educations.map((edu, index) => (
                          <div key={edu.id} className="relative bg-gradient-to-r from-slate-50 to-transparent rounded-2xl border border-slate-200 p-5 group hover:border-violet-300 transition-colors">
                            <button
                              type="button"
                              onClick={() => removeEducation(edu.id)}
                              aria-label="Supprimer cette formation"
                              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">{index + 1}</span>
                              <span className="text-sm font-medium text-slate-500">Formation</span>
                            </div>
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                placeholder="Nom de l'établissement"
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                  placeholder="Diplôme obtenu"
                                />
                                <input
                                  type="text"
                                  value={edu.field}
                                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                  placeholder="Domaine d'étude"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <input type="month" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                <input type="month" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={addEducation}
                        className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-2xl text-slate-500 hover:text-violet-600 font-medium flex items-center justify-center gap-2 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                        Ajouter une formation
                      </button>
                    </div>
                  )}

                  {/* Skills Step */}
                  {currentStep === 3 && (
                    <div className="space-y-5 animate-fade-in">
                      {cvData.skills.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <p className="text-slate-600 font-medium mb-1">Aucune compétence ajoutée</p>
                          <p className="text-sm text-slate-400">Ajoutez vos compétences techniques et soft skills</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cvData.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-200 group hover:border-amber-300 transition-colors">
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                placeholder="Nom de la compétence"
                              />
                              <div className="flex items-center gap-1" role="group" aria-label="Niveau de compétence">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <button
                                    type="button"
                                    key={level}
                                    onClick={() => updateSkill(skill.id, 'level', level)}
                                    aria-label={`Niveau ${level} sur 5`}
                                    aria-pressed={level <= skill.level}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                      level <= skill.level
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill.id)}
                                aria-label="Supprimer cette compétence"
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={addSkill}
                        className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl text-slate-500 hover:text-amber-600 font-medium flex items-center justify-center gap-2 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                        Ajouter une compétence
                      </button>
                    </div>
                  )}

                  {/* Languages Step */}
                  {currentStep === 4 && (
                    <div className="space-y-5 animate-fade-in">
                      {cvData.languages.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-slate-600 font-medium mb-1">Aucune langue ajoutée</p>
                          <p className="text-sm text-slate-400">Indiquez les langues que vous maîtrisez</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cvData.languages.map((lang) => (
                            <div key={lang.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-200 group hover:border-sky-300 transition-colors">
                              <input
                                type="text"
                                value={lang.name}
                                onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                placeholder="Français, Anglais..."
                              />
                              <select
                                value={lang.level}
                                onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                              >
                                {LANGUAGE_LEVELS.map((level) => (
                                  <option key={level} value={level}>{level}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeLanguage(lang.id)}
                                aria-label="Supprimer cette langue"
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl text-slate-500 hover:text-sky-600 font-medium flex items-center justify-center gap-2 transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                        Ajouter une langue
                      </button>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => goToStep(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Précédent
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(currentStep + 1)}
                      disabled={currentStep === STEPS.length - 1}
                      className="flex items-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ backgroundColor: BRAND.green, boxShadow: `0 10px 15px -3px ${BRAND.green}40` }}
                    >
                      Suivant
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Choisir un style</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {TEMPLATES.map((template) => (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      aria-label={`Sélectionner le template ${template.name}`}
                      aria-pressed={selectedTemplate === template.id ? "true" : "false"}
                      className="relative p-4 rounded-2xl border-2 transition-all hover:scale-[1.02]"
                      style={
                        selectedTemplate === template.id
                          ? { borderColor: BRAND.green, backgroundColor: BRAND.greenLight, boxShadow: `0 10px 15px -3px ${BRAND.green}30` }
                          : { borderColor: '#e2e8f0', backgroundColor: 'white' }
                      }
                    >
                      <div className="aspect-[3/4] rounded-lg mb-3 overflow-hidden" style={{ backgroundColor: template.colors[0] }}>
                        <div className="w-full h-full p-2 flex flex-col">
                          <div className="w-6 h-6 rounded-full bg-white/30 mb-2" />
                          <div className="space-y-1 flex-1">
                            <div className="h-1.5 bg-white/40 rounded w-3/4" />
                            <div className="h-1 bg-white/30 rounded w-1/2" />
                            <div className="h-1 bg-white/20 rounded w-2/3 mt-3" />
                            <div className="h-1 bg-white/20 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{template.name}</p>
                      <p className="text-xs text-slate-500">{template.description}</p>
                      {selectedTemplate === template.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND.green }}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className={`${!showPreview ? 'hidden lg:block' : 'block'}`}>
              <div className="sticky top-28">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Aperçu en direct</span>
                    </div>
                    <button
                      type="button"
                      onClick={generatePDF}
                      aria-label="Exporter le CV en PDF"
                      className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: BRAND.green }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export PDF
                    </button>
                  </div>
                  <div className="p-4 sm:p-6 bg-slate-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                    <div
                      ref={cvRef}
                      className="bg-white shadow-2xl mx-auto origin-top"
                      style={{ width: '100%', maxWidth: '595px', minHeight: '842px', transform: 'scale(0.85)', transformOrigin: 'top center' }}
                    >
                      {/* Template: Elegance */}
                      {selectedTemplate === 'elegance' && (
                        <div className="h-full p-10">
                          <div className="flex items-start gap-6 mb-8 pb-6 border-b-2" style={{ borderColor: BRAND.green }}>
                            {cvData.personalInfo.photo && (
                              <img src={cvData.personalInfo.photo} alt="" className="w-24 h-24 rounded-xl object-cover shadow-lg" />
                            )}
                            <div className="flex-1">
                              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {cvData.personalInfo.firstName || 'Prénom'} {cvData.personalInfo.lastName || 'Nom'}
                              </h1>
                              <p className="text-lg font-medium" style={{ color: BRAND.green }}>{cvData.personalInfo.title || 'Titre professionnel'}</p>
                              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                                {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
                                {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
                                {cvData.personalInfo.address && <span>{cvData.personalInfo.address}</span>}
                              </div>
                            </div>
                          </div>
                          {cvData.personalInfo.summary && (
                            <div className="mb-6">
                              <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: BRAND.green }}>Profil</h2>
                              <p className="text-sm text-slate-600 leading-relaxed">{cvData.personalInfo.summary}</p>
                            </div>
                          )}
                          {cvData.experiences.length > 0 && (
                            <div className="mb-6">
                              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: BRAND.green }}>Expérience</h2>
                              <div className="space-y-4">
                                {cvData.experiences.map((exp) => (
                                  <div key={exp.id} className="pl-4 border-l-2" style={{ borderColor: `${BRAND.green}40` }}>
                                    <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                                    <p className="text-sm" style={{ color: BRAND.green }}>{exp.company}</p>
                                    <p className="text-xs text-slate-400">{exp.startDate} - {exp.current ? 'Présent' : exp.endDate}</p>
                                    {exp.description && <p className="text-sm text-slate-600 mt-1">{exp.description}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {cvData.educations.length > 0 && (
                            <div className="mb-6">
                              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: BRAND.green }}>Formation</h2>
                              <div className="space-y-3">
                                {cvData.educations.map((edu) => (
                                  <div key={edu.id} className="pl-4 border-l-2" style={{ borderColor: `${BRAND.green}40` }}>
                                    <h3 className="font-semibold text-slate-900">{edu.degree} - {edu.field}</h3>
                                    <p className="text-sm" style={{ color: BRAND.green }}>{edu.school}</p>
                                    <p className="text-xs text-slate-400">{edu.startDate} - {edu.endDate}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-6">
                            {cvData.skills.length > 0 && (
                              <div>
                                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: BRAND.green }}>Compétences</h2>
                                <div className="flex flex-wrap gap-1.5">
                                  {cvData.skills.map((skill) => (
                                    <span key={skill.id} className="px-2 py-1 text-xs rounded-md" style={{ backgroundColor: BRAND.greenLight, color: BRAND.green }}>{skill.name}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {cvData.languages.length > 0 && (
                              <div>
                                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: BRAND.green }}>Langues</h2>
                                <div className="space-y-1">
                                  {cvData.languages.map((lang) => (
                                    <div key={lang.id} className="text-sm text-slate-600">{lang.name} <span style={{ color: BRAND.green }}>({lang.level})</span></div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Template: Bold */}
                      {selectedTemplate === 'bold' && (
                        <div className="h-full">
                          <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-10 text-white">
                            <div className="flex items-center gap-6">
                              {cvData.personalInfo.photo && (
                                <img src={cvData.personalInfo.photo} alt="" className="w-28 h-28 rounded-2xl object-cover border-4 border-white/20" />
                              )}
                              <div>
                                <h1 className="text-3xl font-bold">{cvData.personalInfo.firstName || 'Prénom'} {cvData.personalInfo.lastName || 'Nom'}</h1>
                                <p className="text-xl text-violet-200 font-medium">{cvData.personalInfo.title || 'Titre'}</p>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-violet-200">
                                  {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
                                  {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-10">
                            {cvData.personalInfo.summary && (
                              <div className="mb-6">
                                <h2 className="text-lg font-bold text-violet-700 mb-2">À Propos</h2>
                                <p className="text-slate-600">{cvData.personalInfo.summary}</p>
                              </div>
                            )}
                            {cvData.experiences.length > 0 && (
                              <div className="mb-6">
                                <h2 className="text-lg font-bold text-violet-700 mb-3">Expérience</h2>
                                {cvData.experiences.map((exp) => (
                                  <div key={exp.id} className="mb-4 pl-4 border-l-4 border-violet-300">
                                    <h3 className="font-bold text-slate-900">{exp.position}</h3>
                                    <p className="text-violet-600 font-medium">{exp.company}</p>
                                    <p className="text-sm text-slate-400">{exp.startDate} - {exp.current ? 'Présent' : exp.endDate}</p>
                                    {exp.description && <p className="text-slate-600 mt-1">{exp.description}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {cvData.educations.length > 0 && (
                              <div className="mb-6">
                                <h2 className="text-lg font-bold text-violet-700 mb-3">Formation</h2>
                                {cvData.educations.map((edu) => (
                                  <div key={edu.id} className="mb-3">
                                    <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                                    <p className="text-violet-600">{edu.school} - {edu.field}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                              {cvData.skills.length > 0 && (
                                <div>
                                  <h2 className="text-lg font-bold text-violet-700 mb-2">Skills</h2>
                                  <div className="flex flex-wrap gap-2">
                                    {cvData.skills.map((skill) => (
                                      <span key={skill.id} className="px-3 py-1 bg-violet-100 text-violet-700 font-medium rounded-full text-sm">{skill.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {cvData.languages.length > 0 && (
                                <div>
                                  <h2 className="text-lg font-bold text-violet-700 mb-2">Langues</h2>
                                  {cvData.languages.map((lang) => (
                                    <p key={lang.id} className="text-slate-600">{lang.name} - {lang.level}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Template: Minimal */}
                      {selectedTemplate === 'minimal' && (
                        <div className="h-full p-12">
                          <div className="mb-10">
                            <h1 className="text-4xl font-light text-slate-900 tracking-tight mb-1">
                              {cvData.personalInfo.firstName || 'Prénom'} {cvData.personalInfo.lastName || 'Nom'}
                            </h1>
                            <p className="text-xl text-slate-500">{cvData.personalInfo.title || 'Titre'}</p>
                            <div className="flex gap-6 mt-4 text-sm text-slate-400">
                              {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
                              {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
                              {cvData.personalInfo.address && <span>{cvData.personalInfo.address}</span>}
                            </div>
                          </div>
                          {cvData.personalInfo.summary && <p className="text-slate-600 leading-relaxed mb-8">{cvData.personalInfo.summary}</p>}
                          {cvData.experiences.length > 0 && (
                            <div className="mb-8">
                              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 pb-2 border-b">Expérience</h2>
                              {cvData.experiences.map((exp) => (
                                <div key={exp.id} className="mb-4">
                                  <div className="flex justify-between">
                                    <h3 className="font-medium text-slate-900">{exp.position}</h3>
                                    <span className="text-sm text-slate-400">{exp.startDate} — {exp.current ? 'Présent' : exp.endDate}</span>
                                  </div>
                                  <p className="text-slate-500">{exp.company}</p>
                                  {exp.description && <p className="text-slate-600 text-sm mt-1">{exp.description}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                          {cvData.educations.length > 0 && (
                            <div className="mb-8">
                              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 pb-2 border-b">Formation</h2>
                              {cvData.educations.map((edu) => (
                                <div key={edu.id} className="mb-3">
                                  <h3 className="font-medium text-slate-900">{edu.degree}</h3>
                                  <p className="text-slate-500">{edu.school}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-8">
                            {cvData.skills.length > 0 && (
                              <div>
                                <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Compétences</h2>
                                <p className="text-slate-600">{cvData.skills.map(s => s.name).join(' • ')}</p>
                              </div>
                            )}
                            {cvData.languages.length > 0 && (
                              <div>
                                <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Langues</h2>
                                <p className="text-slate-600">{cvData.languages.map(l => `${l.name} (${l.level})`).join(' • ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Template: Creative */}
                      {selectedTemplate === 'creative' && (
                        <div className="h-full flex">
                          <div className="w-1/3 bg-gradient-to-b from-orange-500 to-amber-600 p-6 text-white">
                            {cvData.personalInfo.photo && (
                              <img src={cvData.personalInfo.photo} alt="" className="w-full aspect-square rounded-xl object-cover mb-6" />
                            )}
                            <div className="space-y-6 text-sm">
                              {cvData.personalInfo.email && (
                                <div>
                                  <p className="text-white/60 text-xs uppercase mb-1">Email</p>
                                  <p className="break-all">{cvData.personalInfo.email}</p>
                                </div>
                              )}
                              {cvData.personalInfo.phone && (
                                <div>
                                  <p className="text-white/60 text-xs uppercase mb-1">Téléphone</p>
                                  <p>{cvData.personalInfo.phone}</p>
                                </div>
                              )}
                              {cvData.skills.length > 0 && (
                                <div>
                                  <p className="text-white/60 text-xs uppercase mb-2">Compétences</p>
                                  {cvData.skills.map((skill) => (
                                    <div key={skill.id} className="mb-2">
                                      <p className="mb-1">{skill.name}</p>
                                      <div className="flex gap-1">
                                        {[1,2,3,4,5].map(l => <div key={l} className={`w-4 h-1 rounded ${l <= skill.level ? 'bg-white' : 'bg-white/30'}`} />)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {cvData.languages.length > 0 && (
                                <div>
                                  <p className="text-white/60 text-xs uppercase mb-2">Langues</p>
                                  {cvData.languages.map((lang) => <p key={lang.id}>{lang.name} ({lang.level})</p>)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 p-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">{cvData.personalInfo.firstName || 'Prénom'} {cvData.personalInfo.lastName || 'Nom'}</h1>
                            <p className="text-xl text-orange-600 font-medium mb-4">{cvData.personalInfo.title || 'Titre'}</p>
                            {cvData.personalInfo.summary && <p className="text-slate-600 mb-6">{cvData.personalInfo.summary}</p>}
                            {cvData.experiences.length > 0 && (
                              <div className="mb-6">
                                <h2 className="text-lg font-bold text-orange-600 mb-3">EXPÉRIENCE</h2>
                                {cvData.experiences.map((exp) => (
                                  <div key={exp.id} className="mb-4 pl-3 border-l-2 border-orange-300">
                                    <h3 className="font-bold text-slate-900">{exp.position}</h3>
                                    <p className="text-orange-600">{exp.company}</p>
                                    <p className="text-xs text-slate-400">{exp.startDate} - {exp.current ? 'Présent' : exp.endDate}</p>
                                    {exp.description && <p className="text-sm text-slate-600 mt-1">{exp.description}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {cvData.educations.length > 0 && (
                              <div>
                                <h2 className="text-lg font-bold text-orange-600 mb-3">FORMATION</h2>
                                {cvData.educations.map((edu) => (
                                  <div key={edu.id} className="mb-3 pl-3 border-l-2 border-amber-300">
                                    <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                                    <p className="text-slate-600">{edu.school}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Template: Executive */}
                      {selectedTemplate === 'executive' && (
                        <div className="h-full">
                          <div className="bg-slate-900 p-10">
                            <div className="flex items-center gap-6">
                              {cvData.personalInfo.photo && (
                                <img src={cvData.personalInfo.photo} alt="" className="w-24 h-24 rounded-lg object-cover border-2 border-slate-700" />
                              )}
                              <div>
                                <h1 className="text-2xl font-bold text-white">{cvData.personalInfo.firstName || 'Prénom'} {cvData.personalInfo.lastName || 'Nom'}</h1>
                                <p className="text-lg text-amber-400">{cvData.personalInfo.title || 'Titre'}</p>
                              </div>
                            </div>
                            <div className="flex gap-6 mt-4 text-sm text-slate-400">
                              {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
                              {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
                              {cvData.personalInfo.address && <span>{cvData.personalInfo.address}</span>}
                            </div>
                          </div>
                          <div className="p-10">
                            {cvData.personalInfo.summary && (
                              <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-0.5 bg-amber-500" />
                                  <h2 className="font-bold text-slate-900">Profil</h2>
                                </div>
                                <p className="text-slate-600 pl-11">{cvData.personalInfo.summary}</p>
                              </div>
                            )}
                            {cvData.experiences.length > 0 && (
                              <div className="mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-0.5 bg-amber-500" />
                                  <h2 className="font-bold text-slate-900">Expérience</h2>
                                </div>
                                <div className="pl-11 space-y-4">
                                  {cvData.experiences.map((exp) => (
                                    <div key={exp.id}>
                                      <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                                      <p className="text-amber-600">{exp.company}</p>
                                      <p className="text-xs text-slate-400">{exp.startDate} - {exp.current ? 'Présent' : exp.endDate}</p>
                                      {exp.description && <p className="text-sm text-slate-600 mt-1">{exp.description}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {cvData.educations.length > 0 && (
                              <div className="mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-0.5 bg-amber-500" />
                                  <h2 className="font-bold text-slate-900">Formation</h2>
                                </div>
                                <div className="pl-11 space-y-3">
                                  {cvData.educations.map((edu) => (
                                    <div key={edu.id}>
                                      <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                                      <p className="text-slate-600">{edu.school}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                              {cvData.skills.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-0.5 bg-amber-500" />
                                    <h2 className="font-bold text-slate-900">Compétences</h2>
                                  </div>
                                  <div className="pl-11 flex flex-wrap gap-2">
                                    {cvData.skills.map((skill) => (
                                      <span key={skill.id} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">{skill.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {cvData.languages.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-0.5 bg-amber-500" />
                                    <h2 className="font-bold text-slate-900">Langues</h2>
                                  </div>
                                  <div className="pl-11 space-y-1">
                                    {cvData.languages.map((lang) => (
                                      <p key={lang.id} className="text-slate-600">{lang.name} - <span className="text-amber-600">{lang.level}</span></p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 lg:hidden flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          aria-label={showPreview ? 'Basculer en mode édition' : 'Voir l\'aperçu du CV'}
          className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-slate-300/50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-teal-600 transition-colors"
        >
          {showPreview ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={generatePDF}
          aria-label="Télécharger le CV en PDF"
          className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white"
          style={{ backgroundColor: BRAND.green, boxShadow: `0 10px 15px -3px ${BRAND.green}50` }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">CV partagé publiquement</h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Votre CV est maintenant accessible publiquement. Partagez ce lien avec les recruteurs ou sur vos réseaux.
            </p>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg mb-4">
              <input
                type="text"
                readOnly
                value={publicSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/cv/${publicSlug}` : ''}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={copyPublicUrl}
                className="px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: BRAND.green }}
              >
                Copier
              </button>
            </div>

            {/* Analytics summary */}
            {analytics && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-2xl font-bold" style={{ color: BRAND.green }}>{analytics.total_views}</div>
                  <div className="text-xs text-slate-500">Vues</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-2xl font-bold" style={{ color: BRAND.violet }}>{analytics.total_downloads}</div>
                  <div className="text-xs text-slate-500">Téléchargements</div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleTogglePublic}
                disabled={togglePublic.isPending}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-200 transition-colors"
              >
                Rendre privé
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0.7; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>

    <ConfirmDialog
      isOpen={isConfirmOpen}
      options={confirmOptions}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
