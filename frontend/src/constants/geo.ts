export type ZoneCode = 'CEMAC' | 'UEMOA';

export interface Country {
  code: string;
  label: string;
  zone: ZoneCode;
}

export interface Currency {
  code: string;
  label: string;
  symbol: string;
}

export const COUNTRIES: Country[] = [
  { code: 'GA', label: 'Gabon', zone: 'CEMAC' },
  { code: 'CM', label: 'Cameroun', zone: 'CEMAC' },
  { code: 'CG', label: 'Congo', zone: 'CEMAC' },
  { code: 'TD', label: 'Tchad', zone: 'CEMAC' },
  { code: 'CF', label: 'Centrafrique', zone: 'CEMAC' },
  { code: 'GQ', label: 'Guinée équatoriale', zone: 'CEMAC' },
  { code: 'CI', label: "Côte d'Ivoire", zone: 'UEMOA' },
  { code: 'SN', label: 'Sénégal', zone: 'UEMOA' },
  { code: 'ML', label: 'Mali', zone: 'UEMOA' },
  { code: 'BF', label: 'Burkina Faso', zone: 'UEMOA' },
  { code: 'NE', label: 'Niger', zone: 'UEMOA' },
  { code: 'TG', label: 'Togo', zone: 'UEMOA' },
  { code: 'BJ', label: 'Bénin', zone: 'UEMOA' },
  { code: 'GW', label: 'Guinée-Bissau', zone: 'UEMOA' },
];

export const CURRENCIES: Currency[] = [
  { code: 'XAF', label: 'FCFA (CEMAC)', symbol: 'FCFA' },
  { code: 'XOF', label: 'FCFA (UEMOA)', symbol: 'FCFA' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'Dollar US', symbol: '$' },
];

export const ZONE_COUNTRIES: Record<ZoneCode, string[]> = {
  CEMAC: ['GA', 'CM', 'CG', 'TD', 'CF', 'GQ'],
  UEMOA: ['CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'BJ', 'GW'],
};

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol ?? currencyCode;

  if (currencyCode === 'XAF' || currencyCode === 'XOF') {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M ${symbol}`;
    }
    if (amount >= 1_000) {
      return `${Math.round(amount / 1_000)}K ${symbol}`;
    }
    return `${amount.toLocaleString('fr-FR')} ${symbol}`;
  }

  // USD, EUR et autres devises : pas d'abréviation, symbole avant le montant
  if (currencyCode === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  if (currencyCode === 'EUR') {
    return `${amount.toLocaleString('fr-FR')} €`;
  }

  return `${amount.toLocaleString('fr-FR')} ${symbol}`;
}

export function getCountryLabel(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.label ?? code;
}
