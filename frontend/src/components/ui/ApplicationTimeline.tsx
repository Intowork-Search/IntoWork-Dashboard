'use client';

interface ApplicationTimelineProps {
  status: string;
}

const STEPS = [
  { key: 'applied',     label: 'Postulé',        shortLabel: 'Postulé' },
  { key: 'viewed',      label: 'Consulté',        shortLabel: 'Consulté' },
  { key: 'shortlisted', label: 'Présélectionné',  shortLabel: 'Présél.' },
  { key: 'interview',   label: 'Entretien',       shortLabel: 'Entretien' },
  { key: 'decision',    label: 'Décision',        shortLabel: 'Décision' },
];

// Retourne l'index de progression (0-4) selon le statut
function getStepIndex(status: string): number {
  switch (status) {
    case 'applied':
    case 'pending':     return 0;
    case 'viewed':      return 1;
    case 'shortlisted': return 2;
    case 'interview':   return 3;
    case 'accepted':
    case 'rejected':    return 4;
    default:            return 0;
  }
}

export default function ApplicationTimeline({ status }: ApplicationTimelineProps) {
  const currentIndex = getStepIndex(status);
  const isRejected = status === 'rejected';
  const isAccepted = status === 'accepted';

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STEPS.length - 1;

          // Couleur du step
          let dotClass = '';
          let textClass = 'text-gray-400 text-xs';

          if (isLast && isRejected) {
            dotClass = 'bg-red-500 border-red-500';
            textClass = 'text-red-500 text-xs font-semibold';
          } else if (isLast && isAccepted) {
            dotClass = 'bg-[#6B9B5F] border-[#6B9B5F]';
            textClass = 'text-[#6B9B5F] text-xs font-semibold';
          } else if (isDone) {
            dotClass = 'bg-[#6B9B5F] border-[#6B9B5F]';
            textClass = 'text-[#6B9B5F] text-xs font-medium';
          } else if (isCurrent) {
            dotClass = 'bg-white border-[#6B46C1] border-2 ring-2 ring-[#6B46C1]/20';
            textClass = 'text-[#6B46C1] text-xs font-semibold';
          } else {
            dotClass = 'bg-gray-200 border-gray-200';
          }

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              {/* Step */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${dotClass}`}>
                  {isDone && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {isLast && isRejected && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                  {isCurrent && !isRejected && !isAccepted && (
                    <div className="w-2 h-2 rounded-full bg-[#6B46C1]" />
                  )}
                </div>
                <span className={`hidden sm:block whitespace-nowrap ${textClass}`}>{step.shortLabel}</span>
              </div>

              {/* Connecteur */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                    isDone ? 'bg-[#6B9B5F]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
