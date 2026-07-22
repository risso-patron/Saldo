import { render, screen, waitFor, act } from '@testing-library/react';
import { ProfilePage } from '../pages/ProfilePage';
import { AIProvider, useAI } from '../contexts/AIContext';

// Tareas 4.9/4.10 — toggle de revocación de consentimiento en ProfilePage.
// spec.md Área 6 ("revocación inmediata, sin justificación, desde el área de
// cuenta") y Área 4 ("un cambio de consentimiento se refleja en todas las
// pantallas sin pasos adicionales"); design.md §8, Riesgo R3.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const { toggleThemeMock } = vi.hoisted(() => ({ toggleThemeMock: vi.fn() }));
vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: toggleThemeMock }),
}));

vi.mock('../components/Auth/AccountSettingsModal', () => ({
  AccountSettingsModal: () => null,
}));
vi.mock('../components/Shared/LanguageSelector', () => ({
  LanguageSelector: () => null,
}));
vi.mock('../components/Subscription/PricingPlans', () => ({
  PricingPlans: () => null,
}));

const { singleMock, upsertMock, fromMock, useSubscriptionMock } = vi.hoisted(() => {
  const singleMock = vi.fn();
  const upsertMock = vi.fn();
  const eq2Mock = vi.fn(() => ({ single: singleMock }));
  const eq1Mock = vi.fn(() => ({ eq: eq2Mock }));
  const selectMock = vi.fn(() => ({ eq: eq1Mock }));
  const fromMock = vi.fn(() => ({ select: selectMock, upsert: upsertMock }));
  const useSubscriptionMock = vi.fn(() => ({ subscription: { plan_type: 'pro_monthly' } }));
  return { singleMock, upsertMock, fromMock, useSubscriptionMock };
});

vi.mock('../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, signOut: vi.fn() }),
}));

vi.mock('../hooks/useSubscription', () => ({
  useSubscription: useSubscriptionMock,
}));

function OtherScreenConsumer() {
  const { hasConsent } = useAI();
  return <div data-testid="other-screen">{String(hasConsent)}</div>;
}

describe('ProfilePage — toggle de revocación de consentimiento de IA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null }); // consentimiento activo
    upsertMock.mockResolvedValue({ data: null, error: null });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
  });

  it('apagar el interruptor revoca el consentimiento de inmediato, visible en otra pantalla, sin pedir motivo/confirmación', async () => {
    render(
      <AIProvider>
        <ProfilePage />
        <OtherScreenConsumer />
      </AIProvider>
    );

    await waitFor(() => expect(screen.getByTestId('other-screen').textContent).toBe('true'));

    const toggle = screen.getByRole('switch', { name: /usar la ia de saldo/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await act(async () => {
      toggle.click();
    });

    // Inmediato, sin pasos adicionales: la otra pantalla ya ve consent=false.
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('other-screen').textContent).toBe('false');

    // Sin justificación ni confirmación adicional: ningún diálogo se abrió.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el copy de consentimiento está presente en ProfilePage, sin nombrar al proveedor de IA', async () => {
    render(
      <AIProvider>
        <ProfilePage />
      </AIProvider>
    );

    await waitFor(() => expect(screen.getByRole('switch', { name: /usar la ia de saldo/i })).toBeInTheDocument());
    expect(screen.getByText(/podés apagarla cuando quieras/i)).toBeInTheDocument();
    expect(screen.queryByText(/groq/i)).not.toBeInTheDocument();
  });

  it('activar el interruptor desde apagado otorga consentimiento (grantConsent)', async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // sin consentimiento previo

    render(
      <AIProvider>
        <ProfilePage />
        <OtherScreenConsumer />
      </AIProvider>
    );

    await waitFor(() => expect(screen.getByTestId('other-screen').textContent).toBe('false'));

    const toggle = screen.getByRole('switch', { name: /usar la ia de saldo/i });
    await act(async () => {
      toggle.click();
    });

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('other-screen').textContent).toBe('true');
  });
});

// RC-1.1 — el ítem de menú "Modo oscuro/claro" llamaba a setTheme, que
// ThemeContext nunca expuso (solo expone toggleTheme), causando un
// TypeError no capturado al hacer click y dejando el tema sin poder
// cambiarse desde la única UI alcanzable de la app.
describe('ProfilePage — RC-1.1: ítem de menú de tema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    upsertMock.mockResolvedValue({ data: null, error: null });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
  });

  it('hacer click en el ítem de tema llama a toggleTheme, sin lanzar excepción', async () => {
    render(
      <AIProvider>
        <ProfilePage />
      </AIProvider>
    );

    const themeButton = (await screen.findByText('profile.dark_mode')).closest('button');
    expect(() => themeButton.click()).not.toThrow();
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
