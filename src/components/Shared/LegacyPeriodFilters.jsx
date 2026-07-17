import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

/**
 * LegacyPeriodFilters — chips Año/Mes extraídos VERBATIM del AppHeader
 * desmontado en Fase I-C (integration-debt.md, fila "filtros de período").
 *
 * Por qué existe: estos chips eran la única UI que escribía el período global
 * (PeriodContext.setYear/setMonth vía useFilters). El shell DS no los
 * contempla (el diseño del Dashboard excluye filtros), así que viven DENTRO
 * del contenido legacy de los tabs que dependen del período (Movimientos,
 * Insights) hasta que cada pantalla se integre con su propio diseño
 * (Historial/Insights traen su propia UI de período). Al integrarse esas
 * pantallas, este componente muere con ellas.
 *
 * Estética deliberadamente legacy (clases slate/dark) — coherente con el
 * contenido transitorio que lo rodea, NO con el shell DS.
 */
export function LegacyPeriodFilters({
  availableYears,
  selectedYear,
  setSelectedYear,
  availableMonths,
  selectedMonth,
  setSelectedMonth,
}) {
  const { t, i18n } = useTranslation()

  if (!availableYears.length) return null

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">{t('header.year')}</span>
        <div className="flex gap-1 whitespace-nowrap">
          <button
            onClick={() => { setSelectedYear(null); setSelectedMonth(null) }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${!selectedYear ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t('header.all')}
          </button>
          {availableYears.map(y => (
            <button
              key={y}
              onClick={() => { setSelectedYear(y); setSelectedMonth(null) }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${selectedYear === y ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {selectedYear && availableMonths.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">{t('header.month')}</span>
          <div className="flex gap-1 whitespace-nowrap">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${selectedMonth === null ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t('header.all')}
            </button>
            {availableMonths.map(m => {
              const label = new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(new Date(selectedYear, m))
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${selectedMonth === m ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

LegacyPeriodFilters.propTypes = {
  availableYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedYear: PropTypes.number,
  setSelectedYear: PropTypes.func.isRequired,
  availableMonths: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedMonth: PropTypes.number,
  setSelectedMonth: PropTypes.func.isRequired,
}
