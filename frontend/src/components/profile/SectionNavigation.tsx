import React from 'react';
import { UserIcon, BriefcaseIcon, AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SectionNavigationProps {
  readonly activeSection: string;
  readonly setActiveSection: (section: string) => void;
}

export default function SectionNavigation({ activeSection, setActiveSection }: SectionNavigationProps) {
  const sections = [
    { id: 'personal', label: 'Informations personnelles', icon: UserIcon },
    { id: 'experience', label: 'Expériences', icon: BriefcaseIcon },
    { id: 'education', label: 'Formations', icon: AcademicCapIcon },
    { id: 'skills', label: 'Compétences', icon: CheckCircleIcon }
  ];

  return (
    <nav className="space-y-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${
            activeSection === section.id
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <section.icon className="h-5 w-5 mr-3" />
          {section.label}
        </button>
      ))}
    </nav>
  );
}
