/**
 * Password validation utilities for INTOWORK Dashboard
 * Matches backend password requirements from backend/app/auth.py
 *
 * Requirements:
 * - Minimum 12 characters (was 8)
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

export interface PasswordRequirement {
  label: string;
  met: boolean;
  regex?: RegExp;
  minLength?: number;
}

/**
 * Validates password against all security requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Minimum length check (12 characters)
  if (password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères');
  } else {
    score += 25;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  } else {
    score += 20;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  } else {
    score += 20;
  }

  // Digit check
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 20;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}\|;:,.<>?)');
  } else {
    score += 15;
  }

  // Bonus points for longer passwords
  if (password.length >= 16) {
    score += 10;
  } else if (password.length >= 14) {
    score += 5;
  }

  // Determine strength based on score
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score < 40) {
    strength = 'weak';
  } else if (score < 70) {
    strength = 'medium';
  } else if (score < 90) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(score, 100),
  };
}

/**
 * Get password requirements with their current status
 */
export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: 'Au moins 12 caractères',
      met: password.length >= 12,
      minLength: 12,
    },
    {
      label: 'Au moins une lettre majuscule (A-Z)',
      met: /[A-Z]/.test(password),
      regex: /[A-Z]/,
    },
    {
      label: 'Au moins une lettre minuscule (a-z)',
      met: /[a-z]/.test(password),
      regex: /[a-z]/,
    },
    {
      label: 'Au moins un chiffre (0-9)',
      met: /[0-9]/.test(password),
      regex: /[0-9]/,
    },
    {
      label: 'Au moins un caractère spécial (!@#$%...)',
      met: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
      regex: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/,
    },
  ];
}

/**
 * Get strength label and color for visual feedback
 */
export function getPasswordStrengthDisplay(strength: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (strength) {
    case 'weak':
      return {
        label: 'Faible',
        color: 'text-error',
        bgColor: 'bg-error',
      };
    case 'medium':
      return {
        label: 'Moyen',
        color: 'text-warning',
        bgColor: 'bg-warning',
      };
    case 'strong':
      return {
        label: 'Fort',
        color: 'text-info',
        bgColor: 'bg-info',
      };
    case 'very-strong':
      return {
        label: 'Très fort',
        color: 'text-success',
        bgColor: 'bg-success',
      };
    default:
      return {
        label: '',
        color: 'text-base-content',
        bgColor: 'bg-base-300',
      };
  }
}

/**
 * Example valid passwords for user reference
 */
export const PASSWORD_EXAMPLES = [
  'MyP@ssw0rd2025!',
  'Secure#Pass123',
  'C0mpl3x!Passw0rd',
];
