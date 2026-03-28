/**
 * Tests de conformite des contextes metier IntoWork — Frontend.
 *
 * Verifie que les constantes metier (pays, devises, zones)
 * sont correctement definies et coherentes avec CLAUDE.md.
 */

import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  CORE_COUNTRY_CODES,
} from "@/lib/constants/countries";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  formatFCFA,
  formatSalaryShort,
} from "@/lib/constants/currencies";

// ===========================================================================
// 1. Liste des pays
// ===========================================================================

describe("Countries", () => {
  it("doit contenir les 3 pays cibles (Gabon, Cameroun, Congo)", () => {
    const codes = COUNTRIES.map((c) => c.code);
    for (const core of CORE_COUNTRY_CODES) {
      expect(codes).toContain(core);
    }
  });

  it("doit avoir au moins 10 pays africains", () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(10);
  });

  it("chaque pays a un code ISO 2 lettres", () => {
    for (const country of COUNTRIES) {
      expect(country.code).toMatch(/^[a-z]{2}$/);
    }
  });

  it("chaque pays a un nom non vide", () => {
    for (const country of COUNTRIES) {
      expect(country.name.length).toBeGreaterThan(0);
    }
  });

  it("CORE_COUNTRY_CODES inclut ga, cm, cg", () => {
    expect(CORE_COUNTRY_CODES).toContain("ga");
    expect(CORE_COUNTRY_CODES).toContain("cm");
    expect(CORE_COUNTRY_CODES).toContain("cg");
  });
});

// ===========================================================================
// 2. Devises
// ===========================================================================

describe("Currencies", () => {
  it("la devise par defaut est XOF (Franc CFA)", () => {
    expect(DEFAULT_CURRENCY).toBe("XOF");
  });

  it("les devises supportees incluent XOF et XAF", () => {
    expect(SUPPORTED_CURRENCIES).toContain("XOF");
    expect(SUPPORTED_CURRENCIES).toContain("XAF");
  });

  it("formatFCFA formate correctement un montant", () => {
    const result = formatFCFA(800000);
    expect(result).toContain("FCFA");
    expect(result).toContain("800");
  });

  it("formatSalaryShort affiche K pour les milliers", () => {
    expect(formatSalaryShort(800000)).toBe("800K FCFA");
  });

  it("formatSalaryShort affiche M pour les millions", () => {
    const result = formatSalaryShort(1200000);
    expect(result).toBe("1.2M FCFA");
  });
});
