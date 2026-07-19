import { SkeletonBlock } from '../ds/SkeletonBlock';

// Checkpoint IV-F.1 (Saldo Design Constitution v1.2) — "Cargando (primera
// carga)" (docs/design/screens/Saldo Historial.dc.html, "Estados"): skeleton
// con la geometría propia de Historial (título + resumen + filas), distinta
// de la de DashboardHome.jsx (que no se toca) — ambas componen la misma
// primitiva base (ds/SkeletonBlock), cada una con su propia forma.
const ROW_WIDTHS = [
  { desc: 200, amount: 72 },
  { desc: 150, amount: 88 },
  { desc: 230, amount: 64 },
];

export function HistorialSkeleton() {
  return (
    <div className="flex flex-col gap-6" data-testid="historial-skeleton">
      <SkeletonBlock width={180} height={22} className="rounded-md" />
      <SkeletonBlock width={96} height={10} />
      <div className="flex flex-col gap-5">
        {ROW_WIDTHS.map((row, index) => (
          <div key={index} className="flex items-center justify-between">
            <SkeletonBlock width={row.desc} height={12} />
            <SkeletonBlock width={row.amount} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}
