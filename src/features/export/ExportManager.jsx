import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Card } from '../../components/Shared/Card';
import { Button } from '../../components/Shared/Button';
import { ConfirmDialog } from '../../components/Shared/ConfirmDialog';
import { exportToCSV, exportToPDF } from './exportUtils';
import { useSubscription } from '../../hooks/useSubscription';
import { usePeriod } from '../../contexts/PeriodContext';
import { filterByDateRange, calculateCategoryAnalysis, calculateTotal } from '../../utils/calculations';
import { UpgradeModal } from '../../components/Subscription/UpgradeModal';

/**
 * Componente para exportar datos a CSV/PDF
 */
export const ExportManager = ({ incomes, expenses, onExport }) => {
  const { hasFeature } = useSubscription();
  const { dateRange: globalDateRange } = usePeriod();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState(null);
  // RC-1.4/A1: 'csv' | 'pdf' | null -- también controla si ConfirmDialog está
  // abierto (isOpen = pendingExport !== null). Se pide confirmación recién
  // después de pasar el gate de plan (si no tiene acceso, sigue mostrando el
  // UpgradeModal existente, sin cambios).
  const [pendingExport, setPendingExport] = useState(null);

  // El rango por defecto MUST coincidir con el período activo del dashboard
  // (spec "ExportManager usa el rango activo del dashboard"). El usuario
  // puede sobrescribirlo manualmente después.
  const [dateRange, setDateRange] = useState(() => {
    if (globalDateRange) {
      return { start: globalDateRange.from, end: globalDateRange.to };
    }
    // Sin período elegido (type='all'): no hay rango natural que heredar,
    // se conserva el default histórico (mes calendario real).
    return {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    };
  });

  // Preserva el contrato de exportación personalizada: el usuario puede
  // exportar un rango DISTINTO al período que está mirando en el dashboard
  // (ej. "veo Marzo pero exporto el año completo"). Por eso `dateRange` no
  // se resincroniza sin condición — solo mientras el usuario no haya tocado
  // los inputs de fecha a mano. En cuanto edita, ese rango manual manda
  // hasta que este componente se desmonte, y un cambio posterior del período
  // global (ej. AppHeader, visible en cualquier pestaña) deja de pisarlo.
  const [hasManualOverride, setHasManualOverride] = useState(false);
  useEffect(() => {
    if (hasManualOverride || !globalDateRange) return;
    setDateRange({ start: globalDateRange.from, end: globalDateRange.to });
  }, [globalDateRange, hasManualOverride]);

  const handleDateChange = (field, value) => {
    setHasManualOverride(true);
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const [includeCharts, setIncludeCharts] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filtrar transacciones por rango de fechas (usa `filterByDateRange` compartido
  // con BudgetManager/calculateMonthlyComparison — normaliza timezone consistente).
  const filterTransactionsByDateRange = (transactions) =>
    filterByDateRange(transactions, dateRange.start, dateRange.end);

  // RC-1.4/A1: los botones ahora piden confirmación antes de ejecutar la
  // exportación real -- el gate de plan se evalúa primero (sin cambios), la
  // confirmación ocurre solo si el usuario ya tiene acceso a la feature.
  const handleExportCSVClick = () => {
    if (!hasFeature('export_csv')) {
      setBlockedFeature('export_csv');
      setShowUpgradeModal(true);
      return;
    }
    setPendingExport('csv');
  };

  const handleExportPDFClick = () => {
    if (!hasFeature('export_pdf')) {
      setBlockedFeature('export_pdf');
      setShowUpgradeModal(true);
      return;
    }
    setPendingExport('pdf');
  };

  const executeExportCSV = async () => {
    setExporting(true);
    try {
      const filteredIncomes = filterTransactionsByDateRange(incomes);
      const filteredExpenses = filterTransactionsByDateRange(expenses);

      await exportToCSV(filteredIncomes, filteredExpenses, dateRange);
      onExport?.();
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar CSV. Intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const executeExportPDF = async () => {
    setExporting(true);
    try {
      const filteredIncomes = filterTransactionsByDateRange(incomes);
      const filteredExpenses = filterTransactionsByDateRange(expenses);

      // Calcular totales filtrados
      const filteredTotalIncome = calculateTotal(filteredIncomes);
      const filteredTotalExpenses = calculateTotal(filteredExpenses);
      const filteredBalance = filteredTotalIncome - filteredTotalExpenses;

      // categoryAnalysis se deriva del MISMO filteredExpenses que el resto
      // del documento — nunca de una prop aparte, para que transacciones,
      // totales y categorías nunca puedan disentir dentro del mismo PDF.
      const filteredCategoryAnalysis = calculateCategoryAnalysis(filteredExpenses, filteredTotalExpenses);

      await exportToPDF(
        filteredIncomes,
        filteredExpenses,
        filteredCategoryAnalysis,
        {
          totalIncome: filteredTotalIncome,
          totalExpenses: filteredTotalExpenses,
          balance: filteredBalance,
        },
        dateRange,
        includeCharts
      );
      onExport?.();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar PDF. Intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmExport = () => {
    const type = pendingExport;
    setPendingExport(null);
    if (type === 'csv') executeExportCSV();
    else if (type === 'pdf') executeExportPDF();
  };

  // Calcular número de transacciones en el rango
  const filteredCount = filterTransactionsByDateRange([...incomes, ...expenses]).length;

  return (
    <Card title="📥 Exportar Datos">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Exporta tus transacciones y reportes financieros
        </p>

        {/* Selector de rango de fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        {/* Info de transacciones */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <span className="font-semibold">{filteredCount} transacciones</span> en el rango seleccionado
          </p>
        </div>

        {/* Opciones de exportación */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm dark:text-gray-200">
              Incluir gráficos en PDF
            </span>
          </label>
        </div>

        {/* Botones de exportación */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Button
              onClick={handleExportCSVClick}
              disabled={exporting || filteredCount === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {exporting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exportando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  📊 Exportar CSV
                </span>
              )}
            </Button>
          </div>

          <div>
            <Button
              onClick={handleExportPDFClick}
              disabled={exporting || filteredCount === 0}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {exporting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  📄 Exportar PDF
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Formatos soportados */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Formatos soportados:
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>CSV:</strong> Archivo de Excel con todas las transacciones</li>
            <li>• <strong>PDF:</strong> Reporte profesional con resumen y gráficos</li>
          </ul>
          
          {/* Badge PRO si no tiene acceso —
              DISCOVERY-BR2-002 (temporal para BR-2, 2026-07-29): copy
              neutralizado ("No disponible" / "Ver detalles" / "Esta función
              no está disponible para tu cuenta.") para eliminar lenguaje
              comercial pasivo durante la validación con usuarios reales —
              este badge se muestra sin ninguna acción deliberada del
              usuario, solo por entrar a esta pantalla. Sin cambios de
              lógica: hasFeature('export_csv') y el onClick siguen
              exactamente igual. Revertir al copy comercial original
              ("Función PRO" / "Actualizar" / "Exporta tus datos con el plan
              PRO desde $4.99/mes") al finalizar BR-2, salvo que la evidencia
              obtenida justifique una decisión distinta del Product Owner. */}
          {!hasFeature('export_csv') && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    No disponible
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBlockedFeature('export_csv');
                    setShowUpgradeModal(true);
                  }}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full font-semibold transition-colors"
                >
                  Ver detalles
                </button>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Esta función no está disponible para tu cuenta.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Upgrade */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={blockedFeature}
        />
      )}

      {/* RC-1.4/A1: confirmación antes de exportar */}
      <ConfirmDialog
        isOpen={pendingExport !== null}
        title={pendingExport === 'pdf' ? 'Exportar a PDF' : 'Exportar a CSV'}
        message={`¿Exportar ${filteredCount} transacciones a ${pendingExport === 'pdf' ? 'PDF' : 'CSV'}?`}
        confirmLabel="Exportar"
        variant="default"
        onConfirm={handleConfirmExport}
        onCancel={() => setPendingExport(null)}
      />
    </Card>
  );
};

ExportManager.propTypes = {
  incomes: PropTypes.array.isRequired,
  expenses: PropTypes.array.isRequired,
  onExport: PropTypes.func,
};
