/**
 * INTOWORK Brand Components
 * Composants réutilisables basés sur la charte graphique officielle
 *
 * Usage :
 * import { BrandButton, BrandCard, BrandBadge } from '@/components/brand/BrandComponents';
 */

import React from 'react';
import { cn } from '@/lib/utils';

/* ========================================
   BRAND BUTTON
   ======================================== */

export interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'right',
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-[var(--color-brand-green)] hover:bg-[var(--green-600)] text-white shadow-[var(--shadow-green)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-[var(--color-brand-gold)] hover:bg-[var(--gold-600)] text-slate-900 shadow-[var(--shadow-gold)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
      tertiary: 'bg-[var(--color-brand-violet)] hover:bg-[var(--violet-600)] text-white shadow-[var(--shadow-violet)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
      outline: 'bg-transparent border-2 border-[var(--color-brand-green)] text-[var(--green-600)] hover:bg-[var(--green-50)] hover:border-[var(--green-600)] hover:text-[var(--green-700)]',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

BrandButton.displayName = 'BrandButton';

/* ========================================
   BRAND CARD
   ======================================== */

export interface BrandCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  hoverable?: boolean;
}

export const BrandCard = React.forwardRef<HTMLDivElement, BrandCardProps>(
  ({ variant = 'default', hoverable = false, className, children, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-xl transition-all duration-300';

    const variantStyles = {
      default: 'shadow-[var(--shadow-md)] border border-slate-200',
      elevated: 'shadow-[var(--shadow-lg)]',
      bordered: 'border-2 border-slate-300',
    };

    const hoverStyles = hoverable
      ? 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrandCard.displayName = 'BrandCard';

/* ========================================
   BRAND CARD HEADER
   ======================================== */

export interface BrandCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const BrandCardHeader: React.FC<BrandCardHeaderProps> = ({
  title,
  description,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-start justify-between mb-6 pb-4 border-b border-slate-200', className)}
      {...props}
    >
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-1">{title}</h3>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

BrandCardHeader.displayName = 'BrandCardHeader';

/* ========================================
   BRAND BADGE
   ======================================== */

export interface BrandBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const BrandBadge = React.forwardRef<HTMLSpanElement, BrandBadgeProps>(
  ({ variant = 'neutral', size = 'md', dot = false, className, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';

    const variantStyles = {
      success: 'bg-[var(--success-light)] text-[var(--success-dark)]',
      warning: 'bg-[var(--warning-light)] text-[var(--warning-dark)]',
      error: 'bg-[var(--error-light)] text-[var(--error-dark)]',
      info: 'bg-[var(--info-light)] text-[var(--info-dark)]',
      neutral: 'bg-slate-100 text-slate-700',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    const dotColors = {
      success: 'bg-[var(--success)]',
      warning: 'bg-[var(--warning)]',
      error: 'bg-[var(--error)]',
      info: 'bg-[var(--info)]',
      neutral: 'bg-slate-500',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {dot && <span className={cn('w-2 h-2 rounded-full', dotColors[variant])}></span>}
        {children}
      </span>
    );
  }
);

BrandBadge.displayName = 'BrandBadge';

/* ========================================
   BRAND INPUT
   ======================================== */

export interface BrandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const BrandInput = React.forwardRef<HTMLInputElement, BrandInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-300';

    const iconStyles = {
      left: icon ? 'pl-11' : '',
      right: icon ? 'pr-11' : '',
    };

    const stateStyles = error
      ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-red-500/20'
      : 'border-slate-300 focus:border-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]/20 focus:bg-white';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-900 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(baseStyles, iconStyles[iconPosition], stateStyles, className)}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-600">{helperText}</p>
        )}
      </div>
    );
  }
);

BrandInput.displayName = 'BrandInput';

/* ========================================
   BRAND LOGO
   ======================================== */

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'white';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  color = 'default',
  className,
  ...props
}) => {
  const sizeStyles = {
    icon: {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
    },
    full: {
      sm: 'h-6',
      md: 'h-8',
      lg: 'h-12',
      xl: 'h-16',
    },
  };

  const textColor = color === 'white' ? 'text-white' : 'text-slate-900';

  if (variant === 'icon') {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl',
          color === 'default' ? 'bg-[var(--color-brand-green)]' : 'bg-white/15 backdrop-blur-md border border-white/20',
          sizeStyles.icon[size],
          className
        )}
        {...props}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn('w-2/3 h-2/3', color === 'white' ? 'text-white' : 'text-white')}
        >
          {/* R stylisé simplifié - à remplacer par le vrai logo SVG */}
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="bold">
            R
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl',
          color === 'default' ? 'bg-[var(--color-brand-green)]' : 'bg-white/15 backdrop-blur-md border border-white/20',
          sizeStyles.icon[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn('w-2/3 h-2/3', color === 'white' ? 'text-white' : 'text-white')}
        >
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="bold">
            R
          </text>
        </svg>
      </div>
      <div>
        <h1 className={cn('font-bold', textColor, sizeStyles.full[size])}>
          INTOWORK
        </h1>
        {size !== 'sm' && (
          <p className={cn('text-xs', color === 'white' ? 'text-white/80' : 'text-slate-600')}>
            Plateforme de Recrutement B2B2C
          </p>
        )}
      </div>
    </div>
  );
};

BrandLogo.displayName = 'BrandLogo';

/* ========================================
   BRAND SECTION CONTAINER
   ======================================== */

export interface BrandSectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: 'white' | 'slate' | 'green' | 'gradient';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandSection = React.forwardRef<HTMLElement, BrandSectionProps>(
  ({ background = 'white', spacing = 'lg', className, children, ...props }, ref) => {
    const backgroundStyles = {
      white: 'bg-white',
      slate: 'bg-slate-50',
      green: 'bg-[var(--color-brand-green)] text-white',
      gradient: 'bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--green-700)] text-white',
    };

    const spacingStyles = {
      sm: 'py-12',
      md: 'py-16',
      lg: 'py-24',
      xl: 'py-32',
    };

    return (
      <section
        ref={ref}
        className={cn(backgroundStyles[background], spacingStyles[spacing], className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

BrandSection.displayName = 'BrandSection';

/* ========================================
   BRAND CONTAINER
   ======================================== */

export interface BrandContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const BrandContainer = React.forwardRef<HTMLDivElement, BrandContainerProps>(
  ({ size = 'xl', className, children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeStyles[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrandContainer.displayName = 'BrandContainer';

/* ========================================
   BRAND STAT CARD
   ======================================== */

export interface BrandStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'green' | 'gold' | 'violet';
}

export const BrandStatCard: React.FC<BrandStatCardProps> = ({
  label,
  value,
  icon,
  trend,
  variant = 'green',
}) => {
  const variantStyles = {
    green: {
      bg: 'bg-[var(--green-50)]',
      border: 'border-[var(--green-200)]',
      icon: 'bg-[var(--color-brand-green)] text-white',
      text: 'text-[var(--green-700)]',
    },
    gold: {
      bg: 'bg-[var(--gold-50)]',
      border: 'border-[var(--gold-200)]',
      icon: 'bg-[var(--color-brand-gold)] text-slate-900',
      text: 'text-[var(--gold-700)]',
    },
    violet: {
      bg: 'bg-[var(--violet-50)]',
      border: 'border-[var(--violet-200)]',
      icon: 'bg-[var(--color-brand-violet)] text-white',
      text: 'text-[var(--violet-700)]',
    },
  };

  const styles = variantStyles[variant];

  return (
    <BrandCard className={cn('p-6', styles.bg, styles.border)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className={cn('text-3xl font-bold', styles.text)}>{value}</p>
          {trend && (
            <p className={cn('text-sm mt-2', trend.value >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', styles.icon)}>
            {icon}
          </div>
        )}
      </div>
    </BrandCard>
  );
};

BrandStatCard.displayName = 'BrandStatCard';
