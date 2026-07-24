import PropTypes from 'prop-types';

// Checkpoint IV-F.2 (Saldo Design Constitution v1.2) — "Error de
// sincronización" (docs/design/screens/Saldo Historial.dc.html, "Estados":
// "El diario sigue completo y fechado; ámbar tenue, nunca rojo."). A
// diferencia de los estados de IV-F.1 (carga/vacío/sin-resultados, que se
// EXCLUYEN entre sí), este banner es aditivo: convive con el contenido
// normal de Historial, nunca lo reemplaza. Puramente presentacional —
// useTransactions.js es la única autoridad de `syncError`/`lastSyncedAt`,
// acá solo se formatea y se muestra.
export function BannerErrorSincronizacion({ lastSyncedAt, onRetrySync }) {
  const formattedDate = lastSyncedAt
    ? new Intl.DateTimeFormat('es', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(lastSyncedAt))
    : null;

  return (
    <div role="status" className="bg-ds-warning-tint rounded-ds-surface px-[18px] py-3.5">
      <p className="text-ds-caption text-ds-text-primary">
        No pudimos actualizar desde tu banco.
        {formattedDate ? ` Lo que ves es del ${formattedDate}.` : ''}{' '}
        <button
          type="button"
          onClick={onRetrySync}
          className="font-medium text-ds-accent hover:text-ds-accent-hover"
        >
          Reintentar ahora
        </button>
      </p>
    </div>
  );
}

BannerErrorSincronizacion.propTypes = {
  lastSyncedAt: PropTypes.string,
  onRetrySync: PropTypes.func.isRequired,
};
