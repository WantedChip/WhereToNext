"use client";

import React, { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { BudgetTier } from "@/lib/types";

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "AED", name: "UAE Dirham" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "ZAR", name: "South African Rand" },
  { code: "KRW", name: "South Korean Won" },
  { code: "THB", name: "Thai Baht" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "NGN", name: "Nigerian Naira" },
];

let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface BudgetConverterProps {
  budgetTier: BudgetTier | null;
}

export default function BudgetConverter({ budgetTier }: BudgetConverterProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number> | null>(cachedRates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (selectedCurrency !== "USD" && !rates) {
      fetchRates();
    }
  }, [selectedCurrency]);

  const fetchRates = async () => {
    if (cachedRates && Date.now() - lastFetchTime < CACHE_DURATION) {
      setRates(cachedRates);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD");
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      const loadedRates = { USD: 1.0, ...data.rates };
      cachedRates = loadedRates;
      lastFetchTime = Date.now();
      setRates(loadedRates);
    } catch (err) {
      console.error("Failed to fetch exchange rates:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const convertAndFormat = (budgetString: string) => {
    if (!budgetString) return "N/A";
    if (selectedCurrency === "USD" || !rates || !rates[selectedCurrency]) {
      return budgetString;
    }

    const rate = rates[selectedCurrency];
    // Find all digit groupings (ignoring comma formatting)
    const matches = budgetString.replace(/,/g, "").match(/\d+/g);
    if (!matches || matches.length === 0) return budgetString;

    const formattedNumbers = matches.map((numStr) => {
      const convertedVal = Number(numStr) * rate;
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: selectedCurrency,
        maximumFractionDigits: 0,
      }).format(convertedVal);
    });

    // Detect dynamic suffix, default to "/day"
    const suffixMatch = budgetString.match(/\/\w+| per \w+|day/i);
    const suffix = suffixMatch ? suffixMatch[0] : "/day";

    if (formattedNumbers.length === 2) {
      return `${formattedNumbers[0]} – ${formattedNumbers[1]}${suffix}`;
    }
    return `${formattedNumbers[0]}${suffix}`;
  };

  if (!budgetTier) {
    return (
      <div className="space-y-1.5">
        <h4 className="font-mono text-xs text-brass uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Budget Level
        </h4>
        <div className="font-sans text-sm text-chart-paper/50 italic pl-5">
          Not compiled yet
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header and Currency Dropdown */}
      <div className="flex items-center justify-between border-b border-atlas-blue/40 pb-1">
        <h4 className="font-mono text-xs text-brass uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Budget Level
        </h4>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className={`
            bg-ink-navy text-chart-paper border border-brass/30 rounded-xs px-2 py-0.5
            font-mono text-[10px] tracking-wide focus:outline-none focus:ring-1 focus:ring-brass
            cursor-pointer max-w-[80px]
          `}
          title="Select display currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      {/* Conversion Output */}
      <div className="font-sans text-sm text-chart-paper/95 pl-5 space-y-1 relative">
        {loading && (
          <span className="absolute top-0 right-0 font-mono text-[9px] text-brass uppercase animate-pulse">
            Converting...
          </span>
        )}
        <div>
          <span className="font-semibold text-brass">Backpacker:</span>{" "}
          {convertAndFormat(budgetTier.backpacker)}
        </div>
        <div>
          <span className="font-semibold text-brass">Luxury:</span>{" "}
          {convertAndFormat(budgetTier.luxury)}
        </div>
        {error && (
          <div className="font-mono text-[9px] text-oxide-red uppercase pt-1">
            * Conversion service unavailable, showing USD
          </div>
        )}
      </div>
    </div>
  );
}
