import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportManager from './ImportManager';
import { AIProvider } from '../../contexts/AIContext';

// lottie-web falla al cargar en jsdom (sin HTMLCanvasElement.getContext real);
// ImportManager solo usa el spinner de carga como UI cosmética, sin relación
// con el objeto de este checkpoint (mapColumns/gate de categorización).
vi.mock('lottie-react', () => ({
  default: () => null,
}));

// Tarea 5.1/5.2 — ImportManager migra de useAIInsights([]).mapImportColumns
// (hook viejo) a useAI().mapColumns (design.md §6 "ImportManager.jsx:138";
// spec.md Área 7). La firma de salida (columnMap) se conserva idéntica: con
// acceso, el mapa que devuelve el provider debe poder alimentar el mismo
// parseWithColumnMap ya usado por los modos template/profile/pattern/manual.
// Sin acceso (gate/consentimiento denegado), ImportManager cae a sus modos
// no-IA existentes sin bloquear la importación.

const { singleMock, fromMock, useSubscriptionMock, useAuthMock, categorizeTransactionsFullMock } = vi.hoisted(() => {
  const singleMock = vi.fn();
  const eq2Mock = vi.fn(() => ({ single: singleMock }));
  const eq1Mock = vi.fn(() => ({ eq: eq2Mock }));
  const selectMock = vi.fn(() => ({ eq: eq1Mock }));
  const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const fromMock = vi.fn(() => ({ select: selectMock, upsert: upsertMock }));
  const useSubscriptionMock = vi.fn(() => ({ subscription: { plan_type: 'pro_monthly' } }));
  // `useAuthMock` es dinámico (a diferencia de un mock estático) para poder
  // simular un cambio de usuario a mitad de sesión (M1: ventana de carrera
  // en la que `consentLoaded` se resetea a `false` pero `hasConsent`
  // conserva el valor stale del usuario anterior).
  const useAuthMock = vi.fn(() => ({ user: { id: 'user-1' } }));
  // Pass-through: preserva el comportamiento real de `handleFile` (mismo
  // resultado que la implementación real cuando `normalized` está vacío,
  // que es el único caso que ejercitan los CSV usados en este archivo) para
  // no alterar el resto de los tests, mientras permite espiar con qué
  // segundo argumento (el gate de autorización) se invoca.
  const categorizeTransactionsFullMock = vi.fn((transactions) => Promise.resolve(transactions));
  return { singleMock, fromMock, useSubscriptionMock, useAuthMock, categorizeTransactionsFullMock };
});

vi.mock('../../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: useAuthMock,
}));

vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: useSubscriptionMock,
}));

vi.mock('../../core/categorizationEngine', () => ({
  categorizeTransactionsFull: categorizeTransactionsFullMock,
}));

// Headers que NO matchean ningún alias conocido (ni del pipeline modular, ni
// de la detección por patrones) para forzar que el flujo llegue a la rama de
// mapeo por IA / mapeador manual.
const CSV_UNRECOGNIZED = 'ColumnaUno,ColumnaDos,ColumnaTres\n01/01/2026,Pago recurrente XYZ Corp,45.99';

const uploadFile = async (container, text) => {
  const input = container.querySelector('#file-upload');
  const file = new File([text], 'extracto.csv', { type: 'text/csv' });
  await userEvent.upload(input, file);
};

describe('ImportManager — migración a useAI().mapColumns (spec.md Área 7, design.md §6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
    useAuthMock.mockReturnValue({ user: { id: 'user-1' } });
    categorizeTransactionsFullMock.mockImplementation((transactions) => Promise.resolve(transactions));
  });

  it('con acceso (canUseAI && hasConsent), usa useAI().mapColumns y conserva la firma columnMap del pipeline', async () => {
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null }); // consentimiento activo
    const mapColumnsMock = vi.fn().mockResolvedValue({
      fecha: 'ColumnaUno',
      descripcion: 'ColumnaDos',
      monto: 'ColumnaTres',
    });

    const { container } = render(
      <AIProvider provider={{ mapColumns: mapColumnsMock }}>
        <ImportManager onImport={vi.fn()} onBulkImport={vi.fn()} />
      </AIProvider>
    );

    await uploadFile(container, CSV_UNRECOGNIZED);

    await waitFor(() => expect(mapColumnsMock).toHaveBeenCalled(), { timeout: 3000 });
    expect(mapColumnsMock).toHaveBeenCalledWith(
      ['ColumnaUno', 'ColumnaDos', 'ColumnaTres'],
      expect.any(Array)
    );

    // El columnMap devuelto por la IA se aplicó: se ve la vista previa con la
    // transacción parseada usando ese mapa (modo "Compatibilidad", no manual).
    await waitFor(() => expect(screen.getByText('2. Vista Previa (Modo Compatibilidad)')).toBeInTheDocument());
    expect(screen.getByText('1 transacciones')).toBeInTheDocument();
    expect(screen.queryByText(/Asigna las columnas de tu banco/i)).not.toBeInTheDocument();
  });

  it('sin acceso (plan sin capacidad), NO llama a mapColumns y cae al mapeador manual sin bloquear la importación', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'free' } });
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    const mapColumnsMock = vi.fn().mockResolvedValue({ fecha: 'ColumnaUno' });

    const { container } = render(
      <AIProvider provider={{ mapColumns: mapColumnsMock }}>
        <ImportManager onImport={vi.fn()} onBulkImport={vi.fn()} />
      </AIProvider>
    );

    await uploadFile(container, CSV_UNRECOGNIZED);

    await waitFor(() =>
      expect(screen.getByText(/Asigna las columnas de tu banco/i)).toBeInTheDocument()
    );
    expect(mapColumnsMock).not.toHaveBeenCalled();
  });

  it('sin acceso (sin consentimiento), NO llama a mapColumns y cae al mapeador manual sin bloquear la importación', async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // sin fila = sin consentimiento
    const mapColumnsMock = vi.fn().mockResolvedValue({ fecha: 'ColumnaUno' });

    const { container } = render(
      <AIProvider provider={{ mapColumns: mapColumnsMock }}>
        <ImportManager onImport={vi.fn()} onBulkImport={vi.fn()} />
      </AIProvider>
    );

    await uploadFile(container, CSV_UNRECOGNIZED);

    await waitFor(() =>
      expect(screen.getByText(/Asigna las columnas de tu banco/i)).toBeInTheDocument()
    );
    expect(mapColumnsMock).not.toHaveBeenCalled();
  });
});

// ── M1 — categorizeTransactionsFull recibe ai.isAIAuthorized, no el booleano
// viejo `ai.canUseAI && ai.hasConsent` (hallazgo de auditoría RC) ──────────
//
// `ai.canUseAI && ai.hasConsent` omite `consentLoaded`: durante la ventana
// de reconciliación tras un cambio de usuario, `hasConsent` conserva el
// valor del usuario anterior aunque `consentLoaded` ya se haya reseteado a
// `false`. `ai.isAIAuthorized` (AIContext.jsx) sí exige las tres
// condiciones vía `assertOutboundAllowed`, el único punto de control real.

describe('ImportManager — gate de categorización batch usa ai.isAIAuthorized (M1, hallazgo de auditoría RC)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
    useAuthMock.mockReturnValue({ user: { id: 'user-1' } });
    categorizeTransactionsFullMock.mockImplementation((transactions) => Promise.resolve(transactions));
  });

  it('con plan y consentimiento reconciliados (isAIAuthorized=true), invoca categorizeTransactionsFull con allowAI=true', async () => {
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });

    const { container } = render(
      <AIProvider>
        <ImportManager onImport={vi.fn()} onBulkImport={vi.fn()} />
      </AIProvider>
    );

    await uploadFile(container, CSV_UNRECOGNIZED);

    await waitFor(() => expect(categorizeTransactionsFullMock).toHaveBeenCalled());
    expect(categorizeTransactionsFullMock).toHaveBeenCalledWith(expect.any(Array), true);
  });

  it('con hasConsent stale=true pero consentLoaded=false (ventana de carrera al cambiar de usuario), invoca categorizeTransactionsFull con allowAI=false — antes del fix hubiera pasado true', async () => {
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });

    const { container, rerender } = render(
      <AIProvider>
        <ImportManager onImport={vi.fn()} onBulkImport={vi.fn()} />
      </AIProvider>
    );

    // Esperar a que la reconciliación inicial resuelva (hasConsent=true)
    // antes de forzar el cambio de usuario que abre la ventana de carrera.
    await waitFor(() => expect(singleMock).toHaveBeenCalled());

    // Cambio de usuario a mitad de sesión: consentLoaded se resetea a false
    // (AIContext.jsx, useEffect de reconciliación) pero hasConsent NO se
    // toca hasta que la nueva consulta resuelva — se deja sin resolver a
    // propósito para capturar la ventana de carrera.
    singleMock.mockImplementation(() => new Promise(() => {}));
    useAuthMock.mockReturnValue({ user: { id: 'user-2' } });
    rerender(
      <AIProvider>
        <ImportManager onImport={vi.fn()} onBulkImport={vi.fn()} />
      </AIProvider>
    );

    await uploadFile(container, CSV_UNRECOGNIZED);

    await waitFor(() => expect(categorizeTransactionsFullMock).toHaveBeenCalled());
    expect(categorizeTransactionsFullMock).toHaveBeenCalledWith(expect.any(Array), false);
  });
});
