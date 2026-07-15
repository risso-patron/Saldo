import { describe, it, expect } from 'vitest';
import { AI_PLANS_WITH_AI, AI_CAPABILITIES, planHasCapability } from './aiCapabilities.js';

describe('shared/aiCapabilities', () => {
  it('plan free no tiene acceso a assisted_categorization', () => {
    expect(planHasCapability('free', 'assisted_categorization')).toBe(false);
  });

  it.each(['pro_monthly', 'pro_yearly', 'lifetime'])(
    'plan %s tiene acceso a assisted_categorization',
    (planType) => {
      expect(planHasCapability(planType, 'assisted_categorization')).toBe(true);
    }
  );

  it('una capacidad inexistente nunca da acceso, sin importar el plan', () => {
    expect(planHasCapability('lifetime', 'capacidad_que_no_existe')).toBe(false);
  });

  it('AI_PLANS_WITH_AI define exactamente los 3 planes pagos', () => {
    expect(AI_PLANS_WITH_AI).toEqual(['pro_monthly', 'pro_yearly', 'lifetime']);
  });

  it('AI_CAPABILITIES define las 4 capacidades del MVP+futuro', () => {
    expect(Object.keys(AI_CAPABILITIES).sort()).toEqual(
      ['assisted_categorization', 'csv_column_mapping', 'future_glimpse', 'spending_idea'].sort()
    );
  });
});
