import { createContext, useContext, useState, useMemo, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PeriodContext = createContext(null);

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Deriva el `type` inicial a partir de lo ya persistido en localStorage,
 * evitando parpadeo (se calcula en el primer render, no en un useEffect):
 * sin año -> 'all'; año sin mes -> 'year'; año y mes -> 'month'.
 */
const deriveInitialType = (year, month) => {
  if (year == null) return 'all';
  if (month == null) return 'year';
  return 'month';
};

// month es 0-indexed (0=enero...11=diciembre), igual que filterByMonth en calculations.js
const getMonthDateRange = (year, month) => {
  if (year == null || month == null) return null;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    from: `${year}-${pad2(month + 1)}-01`,
    to: `${year}-${pad2(month + 1)}-${pad2(lastDay)}`,
  };
};

const getYearDateRange = (year) => {
  if (year == null) return null;
  return { from: `${year}-01-01`, to: `${year}-12-31` };
};

const getCustomDateRange = (from, to) => {
  if (!from || !to) return null;
  return { from, to };
};

/**
 * PeriodProvider — fuente única del período seleccionado en SALDO.
 * Reutiliza las mismas keys de localStorage que `useFilters.js`
 * (`budgetrp_ui_selectedYear`/`budgetrp_ui_selectedMonth`) para no perder
 * el estado de usuarios existentes. Patrón calcado de `CurrencyContext.jsx`.
 */
export const PeriodProvider = ({ children }) => {
  const [year, setYearRaw] = useLocalStorage('budgetrp_ui_selectedYear', null);
  const [month, setMonthRaw] = useLocalStorage('budgetrp_ui_selectedMonth', null);
  // `type` es transitorio: no persiste entre recargas.
  const [type, setType] = useState(() => deriveInitialType(year, month));
  // Rango manual para type='custom'; también transitorio.
  const [customRange, setCustomRange] = useState(null);

  // Refs sincronizados en cada render: permiten que `setYear`/`setMonth` lean
  // el valor MÁS RECIENTE del otro (no el de la closure del render anterior)
  // cuando ambos se llaman en el mismo handler síncrono — patrón real de
  // AppHeader.jsx: `onClick={() => { setSelectedYear(y); setSelectedMonth(null) }}`.
  // Sin esto, la segunda llamada derivaría `type` con el valor VIEJO del otro
  // campo (bug: seleccionar un año nunca actualizaba `type`/`dateRange`).
  const yearRef = useRef(year);
  yearRef.current = year;
  const monthRef = useRef(month);
  monthRef.current = month;

  /**
   * Fija el año Y deriva `type` en el mismo tick, usando el `month` más
   * reciente (ref), no el de la closure de este render.
   */
  const setYear = (value) => {
    const newYear = value instanceof Function ? value(yearRef.current) : value;
    yearRef.current = newYear;
    setYearRaw(newYear);
    setType(newYear == null ? 'all' : (monthRef.current == null ? 'year' : 'month'));
  };

  /**
   * Fija el mes Y deriva `type` en el mismo tick, usando el `year` más
   * reciente (ref), no el de la closure de este render.
   */
  const setMonth = (value) => {
    const newMonth = value instanceof Function ? value(monthRef.current) : value;
    monthRef.current = newMonth;
    setMonthRaw(newMonth);
    setType(newMonth == null ? (yearRef.current == null ? 'all' : 'year') : 'month');
  };

  const dateRange = useMemo(() => {
    switch (type) {
      case 'month':
        return getMonthDateRange(year, month);
      case 'year':
        return getYearDateRange(year);
      case 'custom':
        return getCustomDateRange(customRange?.from, customRange?.to);
      case 'all':
      default:
        // 'all' no tiene período "anterior" natural — sin dateRange, ver spec.
        return null;
    }
  }, [type, year, month, customRange]);

  const value = useMemo(() => ({
    type,
    year,
    month,
    from: customRange?.from ?? null,
    to: customRange?.to ?? null,
    dateRange,
    setYear,
    setMonth,
    setType,
    setCustomRange,
  }), [type, year, month, customRange, dateRange, setYear, setMonth]);

  return (
    <PeriodContext.Provider value={value}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = () => {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod debe usarse dentro de PeriodProvider');
  return ctx;
};
