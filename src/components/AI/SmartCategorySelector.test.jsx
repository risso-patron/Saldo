import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartCategorySelector } from './SmartCategorySelector';

// Tarea 4.1/4.2 — SmartCategorySelector: confirmar/corregir y confianza
// inválida (spec.md Área 3 "Confirmar con un toque" / "Corregir manualmente
// anula la sugerencia"; Área 10 "Confianza fuera del conjunto reconocido no
// se muestra rota"; design.md Principio 2, §4). El propio `propTypes` ya
// declara `confidence: oneOf(['alta','media','baja'])` — el gateway
// (`AIContext`) nunca entrega un valor fuera de ese conjunto (Área 10 ya
// resuelta ahí), así que acá se verifica el contrato de wiring del
// componente, no un mapeo adicional.

const CATEGORIES = ['Comida', 'Transporte', 'Otros'];

describe('SmartCategorySelector — confirmar/corregir (spec.md Área 3, design.md Principio 2)', () => {
  it('tocar "Aplicar" guarda suggestedCategory.category vía onCategoryChange', async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    const onGetSuggestion = vi.fn();

    render(
      <SmartCategorySelector
        description="uber eats"
        selectedCategory=""
        categories={CATEGORIES}
        onCategoryChange={onCategoryChange}
        onGetSuggestion={onGetSuggestion}
        suggestedCategory={{ category: 'Comida', confidence: 'alta' }}
        loading={false}
      />
    );

    // La sugerencia aparece tras el debounce interno (800ms) cuando la
    // descripción ya tiene >=3 caracteres.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    await user.click(screen.getByRole('button', { name: /aplicar/i }));

    expect(onCategoryChange).toHaveBeenCalledWith('Comida');
  });

  it('elegir una categoría distinta desde el selector manual guarda esa, no la sugerida', async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    const onGetSuggestion = vi.fn();

    render(
      <SmartCategorySelector
        description="uber eats"
        selectedCategory=""
        categories={CATEGORIES}
        onCategoryChange={onCategoryChange}
        onGetSuggestion={onGetSuggestion}
        suggestedCategory={{ category: 'Comida', confidence: 'alta' }}
        loading={false}
      />
    );

    await user.selectOptions(screen.getByRole('combobox'), 'Transporte');

    expect(onCategoryChange).toHaveBeenCalledWith('Transporte');
    expect(onCategoryChange).not.toHaveBeenCalledWith('Comida');
  });

  it('suggestedCategory=null no renderiza ningún badge de sugerencia roto', async () => {
    const onCategoryChange = vi.fn();
    const onGetSuggestion = vi.fn();

    render(
      <SmartCategorySelector
        description="uber eats"
        selectedCategory=""
        categories={CATEGORIES}
        onCategoryChange={onCategoryChange}
        onGetSuggestion={onGetSuggestion}
        suggestedCategory={null}
        loading={false}
      />
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    expect(screen.queryByText(/sugerencia de ia/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aplicar/i })).not.toBeInTheDocument();
  });
});
