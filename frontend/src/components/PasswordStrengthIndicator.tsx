/**
 * Password Strength Indicator Component
 * Displays visual feedback for password strength and requirements
 */

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import {
  validatePassword,
  getPasswordRequirements,
  getPasswordStrengthDisplay,
  type PasswordRequirement,
} from '@/lib/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export default function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password);
  const requirements = getPasswordRequirements(password);
  const display = getPasswordStrengthDisplay(validation.strength);

  if (!password) return null;

  return (
    <div className={`mt-3 space-y-3 ${className}`}>
      {/* Strength bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-base-content/60 font-medium">
            Force du mot de passe
          </span>
          <span className={`text-xs font-semibold ${display.color}`}>
            {display.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 h-1.5 bg-base-300 rounded-full overflow-hidden">
          <div
            className={`transition-all duration-300 rounded-full ${display.bgColor}`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="bg-base-100 rounded-lg p-3 border border-base-300/50">
          <p className="text-xs font-semibold text-base-content/70 mb-2">
            Exigences :
          </p>
          <ul className="space-y-1.5">
            {requirements.map((requirement, index) => (
              <RequirementItem
                key={index}
                requirement={requirement}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ requirement }: { requirement: PasswordRequirement }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {requirement.met ? (
        <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" />
      ) : (
        <XCircleIcon className="w-4 h-4 text-base-content/30 flex-shrink-0" />
      )}
      <span
        className={
          requirement.met
            ? 'text-success font-medium'
            : 'text-base-content/60'
        }
      >
        {requirement.label}
      </span>
    </li>
  );
}
