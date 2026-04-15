import { useState } from 'react';

/**
 * useOnboardingTip
 * Muestra un tip al usuario hasta que lo descarta explícitamente.
 * Una vez descartado, no vuelve a aparecer (persiste en localStorage).
 */
export function useOnboardingTip(id) {
  const key = `budgetrp_tip_${id}`;

  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(key) === 'done'; }
    catch { return false; }
  });

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(key, 'done'); } catch { /* silencioso */ }
  };

  return { visible: !dismissed, dismiss };
}
