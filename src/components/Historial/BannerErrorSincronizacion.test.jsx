import { render, screen, fireEvent } from '@testing-library/react';
import { BannerErrorSincronizacion } from './BannerErrorSincronizacion';

// RC-1.7/M3 — BannerErrorSincronizacion no tenía ningún atributo de
// accesibilidad; al montarse/desmontarse condicionalmente en Historial.jsx
// (`{syncError && <BannerErrorSincronizacion .../>}`) un usuario de lector
// de pantalla no recibía ningún aviso cuando aparecía. `role="status"`
// (mismo patrón ya usado en Toast.jsx/AIStatusNotice.jsx para mensajes de
// estado no urgentes) resuelve el gap sin cambiar JSX, estilos ni
// comportamiento.

describe('BannerErrorSincronizacion — accesibilidad (RC-1.7/M3)', () => {
  it('expone role="status"', () => {
    render(<BannerErrorSincronizacion lastSyncedAt={null} onRetrySync={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con lastSyncedAt, muestra el texto con la fecha formateada', () => {
    render(
      <BannerErrorSincronizacion
        lastSyncedAt="2026-07-14T18:40:00.000Z"
        onRetrySync={() => {}}
      />
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('No pudimos actualizar desde tu banco.');
    expect(status).toHaveTextContent('Lo que ves es del');
  });

  it('sin lastSyncedAt, muestra el texto sin fecha', () => {
    render(<BannerErrorSincronizacion lastSyncedAt={null} onRetrySync={() => {}} />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('No pudimos actualizar desde tu banco.');
    expect(status).not.toHaveTextContent('Lo que ves es del');
  });

  it('"Reintentar ahora" invoca onRetrySync', () => {
    const onRetrySync = vi.fn();
    render(<BannerErrorSincronizacion lastSyncedAt={null} onRetrySync={onRetrySync} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar ahora' }));
    expect(onRetrySync).toHaveBeenCalledTimes(1);
  });
});
