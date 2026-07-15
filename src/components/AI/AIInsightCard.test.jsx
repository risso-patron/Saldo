import { render, screen } from '@testing-library/react';
import { AIInsightCard } from './AIInsightCard';

// Checkpoint 4 — AIInsightCard: contenedor definitivo de "Una idea sobre tu
// plata" (proposal.md Decisión 1, spec.md Área 1, design.md Arquitectura de
// Confianza — Principios 1, 2, 6, 7). Presentacional puro, 6 estados exactos.
// No genera contenido: solo lo muestra (idea_available) o comunica por qué
// no hay nada que mostrar (los otros 5).

const FORBIDDEN_TERMS = [
  /an[aá]lisis/i,
  /predicci[oó]n/i,
  /groq/i,
  /llama/i,
  /modelo/i,
  /req\/min/i,
  /\b429\b/,
  /\b20\/28\b/,
  /\b20\b/,
  /\b28\b/,
];

const assertNoJargon = (text) => {
  FORBIDDEN_TERMS.forEach((term) => expect(text).not.toMatch(term));
};

describe('AIInsightCard (spec.md Área 1, design.md Arquitectura de Confianza)', () => {
  it('insufficient_history → mensaje alentador, sin barra de progreso ni umbral numérico', () => {
    render(<AIInsightCard status="insufficient_history" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    assertNoJargon(text);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('loading → estado de carga breve y calmo', () => {
    render(<AIInsightCard status="loading" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    assertNoJargon(text);
  });

  it('idea_available → renderiza idea.message e idea.category recibidos por props, rotulado como IA', () => {
    render(
      <AIInsightCard
        status="idea_available"
        idea={{ category: 'Delivery', message: 'Gastás bastante más en Delivery que en el resto de tus categorías.' }}
      />
    );
    expect(
      screen.getByText('Gastás bastante más en Delivery que en el resto de tus categorías.')
    ).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();
    expect(screen.getByText('Una idea sobre tu plata')).toBeInTheDocument();
    expect(screen.getByText('IA')).toBeInTheDocument();
  });

  it('idea_available sin idea → no renderiza nada (no inventa contenido)', () => {
    const { container } = render(<AIInsightCard status="idea_available" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ai_disabled → invitación a activar desde la cuenta, sin insistir', () => {
    render(<AIInsightCard status="ai_disabled" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    assertNoJargon(text);
  });

  it('no_plan → existe, es parte de un plan superior, invitación a mejorar', () => {
    render(<AIInsightCard status="no_plan" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    assertNoJargon(text);
  });

  it('error → calmo, sin nombre de proveedor, invita a reintentar', () => {
    render(<AIInsightCard status="error" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    assertNoJargon(text);
  });

  it('los 6 estados tienen copy distinto entre sí (nunca el mismo texto para casos distintos)', () => {
    const textStates = ['insufficient_history', 'loading', 'ai_disabled', 'no_plan', 'error'];
    const texts = textStates.map((status) => {
      const { unmount } = render(<AIInsightCard status={status} />);
      const text = screen.getByRole('status').textContent;
      unmount();
      return text;
    });
    expect(new Set(texts).size).toBe(textStates.length);
  });

  it('status no reconocido no renderiza nada', () => {
    const { container } = render(<AIInsightCard status="some_unknown_state" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('status ausente (undefined) no renderiza nada', () => {
    const { container } = render(<AIInsightCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it('status null no renderiza nada', () => {
    const { container } = render(<AIInsightCard status={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
