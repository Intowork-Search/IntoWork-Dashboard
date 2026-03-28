/**
 * Devises supportees par IntoWork.
 * La devise par defaut est XOF (Franc CFA — zone UEMOA/CEMAC).
 */

export const DEFAULT_CURRENCY = "XOF" as const;

export const SUPPORTED_CURRENCIES = ["XOF", "XAF", "EUR", "USD"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Formate un montant en devise FCFA lisible.
 * Ex: formatFCFA(800000) => "800 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

/**
 * Formate un salaire abrege.
 * Ex: formatSalaryShort(800000) => "800K FCFA"
 */
export function formatSalaryShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M FCFA`;
  }
  return `${(amount / 1_000).toFixed(0)}K FCFA`;
}
