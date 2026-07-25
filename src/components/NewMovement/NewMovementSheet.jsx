import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { NumericFormat } from 'react-number-format';
import { Sheet } from '../ds/Sheet';
import { Tabs } from '../ds/Tabs';
import { Input } from '../ds/Input';
import { Button } from '../ds/Button';
import { AISuggestedCategory } from './AISuggestedCategory';
import { useAI } from '../../contexts/AIContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { suggestExpenseCategory } from '../../core/categorizationEngine';
import { validateAmount, validateDescription } from '../../utils/validators';
import { readDraft, writeDraft, clearDraft } from '../../utils/newMovementDraft';

// Checkpoint III-A (Saldo Design Constitution v1.2) — orquestación del flujo
// mínimo de "Nuevo Movimiento". Fuente: docs/design/screens/Saldo Nuevo
// Movimiento.dc.html + docs/design/flows/Saldo Flow 01 - Registrar
// Movimiento.dc.html.
//
// Motor existente -> Contratos existentes -> Nueva presentación DS: reusa
// useAI().suggestCategory con el mismo patrón de debounce (800ms) que
// SmartCategorySelector.jsx, useCurrency().getSmartDefaultCurrency() y
// validateAmount(), pero NUNCA monta la presentación legacy.
//
// Persistencia mínima del borrador: este componente debe montarse SIEMPRE
// (el padre solo alterna `isOpen`) — el estado del formulario vive en este
// componente, no en Sheet, así que sobrevive a que Sheet oculte sus
// children al cerrarse (Escape/click-fuera) hasta el próximo `Añadir`
// exitoso o hasta recargar la página (eso último es deuda de Fase III-C).

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
];

const INITIAL_CATEGORY = EXPENSE_CATEGORIES[0].value;
const AMOUNT_ERROR_MESSAGE = 'El importe necesita un número para poder añadirse.';

export function NewMovementSheet({
  isOpen,
  onClose,
  onAddIncome,
  onAddExpense,
  onUpdateIncome,
  onUpdateExpense,
  movement = null,
}) {
  const ai = useAI();
  const { getSmartDefaultCurrency, currencies } = useCurrency();

  // Checkpoint IV-B — Punto de contacto 1/5 del modo edición: constante
  // única calculada arriba de todo, de la que depende todo lo demás.
  const isEditMode = movement != null;

  // Checkpoint III-C.2 — lectura del borrador persistido en localStorage UNA
  // sola vez, síncrona, antes del primer render (ref con guarda en vez de
  // useEffect: un useEffect dispararía un re-render extra con parpadeo
  // vacío→lleno). El resultado siembra los useState de abajo.
  //
  // Checkpoint IV-B — en modo edición NUNCA se llama a readDraft(): leer el
  // borrador de creación mientras se edita un movimiento existente sería un
  // bug de datos cruzados (regla dura del PO). La semilla viene de
  // `movement` en su lugar.
  const draftRef = useRef(undefined);
  if (draftRef.current === undefined) {
    draftRef.current = isEditMode ? null : readDraft();
  }
  const initialDraft = draftRef.current;

  const [activeType, setActiveType] = useState(
    isEditMode ? movement.type : (initialDraft?.activeType ?? 'expense')
  );
  const [description, setDescription] = useState(
    isEditMode ? movement.description : (initialDraft?.description ?? '')
  );
  const [amount, setAmount] = useState(
    isEditMode ? movement.amount : (initialDraft?.amount ?? '')
  );
  const [category, setCategory] = useState(
    isEditMode ? (movement.category ?? INITIAL_CATEGORY) : (initialDraft?.category ?? INITIAL_CATEGORY)
  );
  // Campos nuevos, solo relevantes en modo edición (fecha editable, moneda
  // vía selector) — en modo creación quedan sin uso: la fecha sigue siendo
  // el chip fijo "Hoy" y la moneda sigue siendo automática vía
  // getSmartDefaultCurrency(), exactamente como antes.
  const [date, setDate] = useState(isEditMode ? movement.date : '');
  const [currency, setCurrency] = useState(isEditMode ? (movement.currency ?? 'USD') : '');
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [amountError, setAmountError] = useState(null);
  // RC-1.2/C1: mismo patrón que amountError — validación client-side de
  // description reutilizando validateDescription (misma regla que ya exige
  // el hook, no una regla nueva), para que el submit se bloquee y el error
  // se vea en vez de fallar en silencio.
  const [descriptionError, setDescriptionError] = useState(null);

  // Checkpoint III-C.1 — modo ráfaga (Ctrl/Cmd+Enter): ref al <input> real
  // detrás de NumericFormat (react-number-format expone el nodo DOM vía
  // `getInputRef`, no vía forwardRef directo) para poder devolverle el foco
  // tras guardar-y-reabrir vacío, o tras un intento fallido de guardado.
  const amountInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  // Sugerencia de IA — mismo patrón de invocación que BudgetForm.jsx
  // (handleGetCategorySuggestion) con el debounce de 800ms que ya usa
  // SmartCategorySelector.jsx internamente (lógica de timing reutilizada
  // como patrón, no como componente montado). Solo para gastos, gateado por
  // canUseAI && hasConsent — nunca llega a la red si el gate está cerrado.
  useEffect(() => {
    if (activeType !== 'expense' || !ai.canUseAI || !ai.hasConsent) return undefined;
    if (description.trim().length < 3) return undefined;

    const timer = setTimeout(async () => {
      const result = await ai.suggestCategory(description);
      if (result?.category) {
        setCategory(result.category);
        setSuggestedCategory(result.category);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [description, activeType, ai]);

  // Checkpoint III-C.2 — escritura continua del borrador en localStorage
  // (sobrevive recarga de página / cierre de pestaña, ventana de 60s). Sin
  // debounce: campos chicos, escribir en cada cambio es aceptable. No
  // persiste un borrador vacío/intocado (description y amount ambos sin
  // contenido) para no ensuciar el storage con nada útil que restaurar.
  useEffect(() => {
    // Checkpoint IV-B — Punto de contacto 2/5 del modo edición: no-op total
    // en modo edición (guard al principio, efecto sin reestructurar).
    if (isEditMode) return;
    if (description.trim() === '' && amount === '') return;
    writeDraft({ activeType, description, amount, category });
  }, [activeType, description, amount, category, isEditMode]);

  const resetForm = () => {
    setActiveType('expense');
    setDescription('');
    setAmount('');
    setCategory(INITIAL_CATEGORY);
    setSuggestedCategory(null);
    setShowCategorySelect(false);
    setAmountError(null);
    setDescriptionError(null);
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    setCategory(value);
    setSuggestedCategory(value);
    setShowCategorySelect(false);
  };

  // HAL-001 parte 3 — sugerencia LOCAL (categorizeWithRules, sin IA), solo
  // cuando la IA no está disponible/consentida y la categoría actual es
  // "Otros". Cálculo síncrono derivado, no un useEffect: sin debounce, sin
  // llamada de red, nada que cancelar. No usa `suggestedCategory` (ese
  // estado es del flujo de IA) — aceptar esta sugerencia solo llama a
  // setCategory(), nunca setSuggestedCategory(), para mantener ambos
  // conceptos separados (ajuste explícito del PO al aprobar el plan).
  const ruleSuggestion =
    activeType === 'expense' && category === 'Otros' && !(ai.canUseAI && ai.hasConsent)
      ? suggestExpenseCategory(description)
      : null;

  const handleAcceptRuleSuggestion = () => {
    if (!ruleSuggestion) return;
    setCategory(ruleSuggestion.category);
  };

  const isAmountValid = validateAmount(amount).isValid;
  // RC-1.2/C1: misma validación central que useTransactions.js ya exige
  // (validateDescription — 3-100 caracteres), ahora también client-side.
  const descriptionValidation = validateDescription(description);
  const isDescriptionValid = descriptionValidation.isValid;

  const handleSubmit = (e, { burst = false } = {}) => {
    e?.preventDefault?.();

    if (!isAmountValid) {
      setAmountError(AMOUNT_ERROR_MESSAGE);
      amountInputRef.current?.focus();
      return;
    }
    setAmountError(null);

    // RC-1.2/C1: mismo patrón que el chequeo de importe de arriba — bloquea
    // el submit y muestra el error en vez de fallar en silencio (antes, con
    // notification:'toast', useTransactions.js no mostraba nada).
    if (!isDescriptionValid) {
      setDescriptionError(descriptionValidation.error);
      descriptionInputRef.current?.focus();
      return;
    }
    setDescriptionError(null);

    // Checkpoint IV-B — Punto de contacto 3/5 del modo edición: único punto
    // de despacho calculado a partir de isEditMode, sin re-verificaciones
    // repetidas. Edición actualiza el movimiento existente (movement.id);
    // creación sigue el flujo de siempre.
    if (isEditMode) {
      // RC-1.7/A4: 'toast' arranca una operación reversible (Deshacer),
      // mismo mecanismo que ya usa la creación (III-C.2) en vez del Alert.
      const success =
        activeType === 'income'
          ? onUpdateIncome(movement.id, { description, amount, date, currency }, { notification: 'toast' })
          : onUpdateExpense(movement.id, { description, category, amount, date, currency }, { notification: 'toast' });

      if (success) onClose();
      return;
    }

    const newMovementCurrency = getSmartDefaultCurrency();
    // Formato 'YYYY-MM-DD' — igual que BudgetForm.jsx y todo lo demás en
    // useTransactions.js. Un objeto Date crudo rompe parseLocalDate()
    // (utils/calculations.js: String(dateStr).substring(0,10) produce texto
    // no parseable a partir de Date.toString()), lo que a su vez rompe
    // getRecentTransactions/getMonthlySeries/calculateSpendingPaceComparison
    // — hallazgo de verificación, no estaba cubierto por los tests originales.
    const today = new Date().toISOString().split('T')[0];
    const success =
      activeType === 'income'
        ? onAddIncome(description, amount, today, newMovementCurrency)
        : onAddExpense(description, category, amount, today, newMovementCurrency);

    if (success) {
      resetForm();
      // Checkpoint III-C.2 — limpieza explícita del borrador persistido tras
      // un guardado exitoso, separada de resetForm() (responsabilidades
      // distintas: una resetea UI, la otra limpia storage). Cubre tanto el
      // camino normal como el modo ráfaga (ambos pasan por este bloque).
      clearDraft();
      if (burst) {
        // Checkpoint III-C.1 — modo ráfaga: la hoja se queda abierta y el
        // foco vuelve al importe para encadenar el siguiente movimiento sin
        // tocar el mouse (docs/design/flows/Saldo Flow 01 - Registrar
        // Movimiento.dc.html: "⌘Enter añade y reabre vacía").
        amountInputRef.current?.focus();
      } else {
        onClose();
      }
    }
  };

  // Enter en cualquier campo del formulario guarda, igual que "Añadir"
  // (docs/design/screens/Saldo Nuevo Movimiento.dc.html: "Enter aquí mismo
  // guarda un movimiento válido"). No delegamos en el submit implícito del
  // navegador: con el importe vacío el botón "Añadir" está `disabled`, y un
  // botón submit deshabilitado bloquea la submission implícita por Enter —
  // lo que impediría mostrar el mensaje de error. Se controla el Enter acá
  // explícitamente para que funcione en cualquier estado.
  const handleFormKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    // Checkpoint III-C.1 — Ctrl/Cmd+Enter es modo ráfaga: guarda y mantiene
    // la hoja abierta con el foco listo para el siguiente movimiento. Enter
    // simple (sin modificador) conserva el comportamiento de siempre.
    // Checkpoint IV-B — Punto de contacto 4/5 del modo edición: ráfaga no
    // aplica editando un registro puntual.
    const burst = !isEditMode && (e.ctrlKey || e.metaKey);
    handleSubmit(e, { burst });
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} initialFocusRef={amountInputRef}>
      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
        <Tabs options={TYPE_OPTIONS} value={activeType} onChange={setActiveType} />

        <div className="mt-10">
          <span className="text-ds-overline">Importe</span>
          <NumericFormat
            value={amount}
            onValueChange={(values) => setAmount(values.floatValue ?? '')}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            placeholder="0,00"
            aria-label="Importe"
            getInputRef={amountInputRef}
            className="mt-2 block w-full bg-transparent border-none outline-none text-ds-numeric-xl text-left placeholder:text-ds-text-disabled focus:outline-none focus:ring-0"
          />
          {amountError && <p className="mt-2 text-ds-caption text-ds-danger">{amountError}</p>}
        </div>

        <div className="mt-9 space-y-2.5">
          <Input
            id="new-movement-description"
            label="Concepto"
            placeholder={activeType === 'income' ? '¿De donde viene el dinero?' : '¿En qué se usó el dinero?'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={descriptionError}
            ref={descriptionInputRef}
          />

          {activeType === 'expense' && (
            <div className="space-y-2">
              {ai.canUseAI && ai.hasConsent ? (
                <AISuggestedCategory
                  category={suggestedCategory}
                  onChangeClick={() => setShowCategorySelect(true)}
                />
              ) : ruleSuggestion ? (
                <AISuggestedCategory
                  source="rules"
                  category={ruleSuggestion.category}
                  onAcceptClick={handleAcceptRuleSuggestion}
                  onChangeClick={() => setShowCategorySelect(true)}
                />
              ) : (
                !showCategorySelect && (
                  <button
                    type="button"
                    onClick={() => setShowCategorySelect(true)}
                    className="h-8 px-3 inline-flex items-center border border-ds-border rounded-ds-control text-ds-caption text-ds-text-tertiary"
                  >
                    Elegir categoría
                  </button>
                )
              )}

              {showCategorySelect && (
                <select
                  aria-label="Categoría"
                  value={category}
                  onChange={handleCategorySelect}
                  className="h-9 bg-ds-surface-sunken text-ds-body rounded-ds-control border-none"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Checkpoint IV-B — punto 5/5 (JSX declarativo, no cuenta contra el
            límite de 5 puntos de contacto): en modo creación, el chip fijo
            "Hoy" de siempre; en modo edición, Fecha editable + selector de
            Moneda (mismo patrón de datos que EditTransactionModal.jsx,
            useCurrency().currencies — sin reusar ese componente). */}
        <div className="mt-7 flex gap-2">
          {isEditMode ? (
            <>
              <Input
                id="new-movement-date"
                label="Fecha"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="inline-flex w-full flex-col gap-1">
                <label htmlFor="new-movement-currency" className="text-ds-caption text-ds-text-secondary font-medium">
                  Moneda
                </label>
                <select
                  id="new-movement-currency"
                  aria-label="Moneda"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-9 bg-ds-surface-sunken text-ds-body rounded-ds-control border-none px-3"
                >
                  {currencies.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.code}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <span className="h-8 px-3 inline-flex items-center border border-ds-border rounded-ds-control text-ds-body text-ds-text-primary">
              Hoy
            </span>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <span className="text-ds-caption text-ds-text-tertiary">Esc para cerrar — lo escrito se conserva</span>
          <Button type="submit" variant="primary" disabled={!isAmountValid || !isDescriptionValid}>
            {isEditMode ? 'Guardar' : 'Añadir'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

NewMovementSheet.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddIncome: PropTypes.func.isRequired,
  onAddExpense: PropTypes.func.isRequired,
  onUpdateIncome: PropTypes.func,
  onUpdateExpense: PropTypes.func,
  movement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['income', 'expense']).isRequired,
    description: PropTypes.string,
    amount: PropTypes.number,
    category: PropTypes.string,
    date: PropTypes.string,
    currency: PropTypes.string,
  }),
};
