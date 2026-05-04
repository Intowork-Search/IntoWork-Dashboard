'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';

const LANGUAGE_LABELS: Record<Locale, { label: string; flag: string }> = {
  fr: { label: 'Français', flag: '🇫🇷' },
  en: { label: 'English', flag: '🇬🇧' },
  pt: { label: 'Português', flag: '🇵🇹' },
  ar: { label: 'العربية', flag: '🇲🇷' },
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const current = LANGUAGE_LABELS[locale];

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
        disabled={isPending}
        title="Changer la langue"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">{current.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-white rounded-2xl z-50 w-44 p-1.5 shadow-xl border border-gray-100 mt-1"
      >
        {routing.locales.map((l) => {
          const info = LANGUAGE_LABELS[l];
          const isActive = l === locale;
          return (
            <li key={l}>
              <button
                onClick={() => switchLocale(l)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors w-full text-left ${
                  isActive
                    ? 'bg-[#6B9B5F]/10 text-[#6B9B5F] font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{info.flag}</span>
                <span>{info.label}</span>
                {isActive && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-auto text-[#6B9B5F]"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
