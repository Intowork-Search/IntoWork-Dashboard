/**
 * Liste des pays cibles IntoWork — Afrique Centrale et de l'Ouest.
 * Source : landing page (page.tsx)
 */

export interface Country {
  name: string;
  code: string;
}

export const COUNTRIES: readonly Country[] = [
  { name: "Côte d'Ivoire", code: "ci" },
  { name: "Sénégal", code: "sn" },
  { name: "Cameroun", code: "cm" },
  { name: "Mali", code: "ml" },
  { name: "Guinée", code: "gn" },
  { name: "Burkina Faso", code: "bf" },
  { name: "Togo", code: "tg" },
  { name: "Bénin", code: "bj" },
  { name: "Niger", code: "ne" },
  { name: "Gabon", code: "ga" },
  { name: "Congo", code: "cg" },
  { name: "RDC", code: "cd" },
  { name: "Maroc", code: "ma" },
  { name: "Tunisie", code: "tn" },
  { name: "Madagascar", code: "mg" },
] as const;

/** Pays principaux IntoWork (Afrique Centrale) */
export const CORE_COUNTRY_CODES = ["ga", "cm", "cg"] as const;
