import { render, screen } from '@testing-library/react';
import { AIStatusNotice } from './AIStatusNotice';

// Tarea 4.7/4.8 — fallback visual de los 4 casos de Área 5 (spec.md Área 5,
// design.md §7). Reglas de copy comunes a los 4: sin jerga técnica, sin
// código de error crudo, sin nombrar al proveedor de IA, sin culpar al
// usuario.

const FORBIDDEN_TERMS = [/429/i, /rate limit/i, /groq/i, /llama/i, /req\/min/i, /error 503/i];

describe('AIStatusNotice (spec.md Área 5, design.md §7)', () => {
  it('no_plan → invitación a mejorar de plan, sin jerga', () => {
    render(<AIStatusNotice status="no_plan" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    FORBIDDEN_TERMS.forEach((term) => expect(text).not.toMatch(term));
  });

  it('rate_limited → copy de espera, sin ninguna cifra técnica', () => {
    render(<AIStatusNotice status="rate_limited" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    FORBIDDEN_TERMS.forEach((term) => expect(text).not.toMatch(term));
  });

  it('no_consent → invitación de una línea, sin insistencia', () => {
    render(<AIStatusNotice status="no_consent" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    FORBIDDEN_TERMS.forEach((term) => expect(text).not.toMatch(term));
  });

  it('provider_error → mensaje calmo de reintento, sin nombre de proveedor ni stack', () => {
    render(<AIStatusNotice status="provider_error" />);
    const text = screen.getByRole('status').textContent;
    expect(text.length).toBeGreaterThan(0);
    FORBIDDEN_TERMS.forEach((term) => expect(text).not.toMatch(term));
  });

  it('los 4 casos tienen copy distinto entre sí (nunca el mismo texto para casos distintos)', () => {
    const texts = ['no_plan', 'rate_limited', 'no_consent', 'provider_error'].map((status) => {
      const { unmount } = render(<AIStatusNotice status={status} />);
      const text = screen.getByRole('status').textContent;
      unmount();
      return text;
    });
    expect(new Set(texts).size).toBe(4);
  });

  it('status desconocido, idle o loading → no renderiza nada (null)', () => {
    const { container: c1 } = render(<AIStatusNotice status="idle" />);
    expect(c1).toBeEmptyDOMElement();
    const { container: c2 } = render(<AIStatusNotice status="loading" />);
    expect(c2).toBeEmptyDOMElement();
    const { container: c3 } = render(<AIStatusNotice status={null} />);
    expect(c3).toBeEmptyDOMElement();
  });
});
