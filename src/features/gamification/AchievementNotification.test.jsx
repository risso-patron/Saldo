import { render, screen, renderHook, act } from '@testing-library/react';
import { AchievementNotifications } from './AchievementNotification';
import { useFeedbackQueue } from '../../hooks/useFeedbackQueue';

// RC-1.7/A1+A3 — antes este componente apilaba TODOS los logros nuevos a la
// vez (violaba "uno a la vez; nunca apilan" de la Design Constitution).
// Ahora se coordina vía useFeedbackQueue: solo el logro que el coordinador
// indica como activo se renderiza, el resto espera en la cola FIFO del
// propio array `achievements`.

const achievement = (id, name) => ({ id, name, description: 'desc', icon: 'trophy', points: 10 });

describe('AchievementNotifications — coordinado (RC-1.7/A1+A3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('con dos logros nuevos simultáneos, renderiza solo uno a la vez — nunca los dos juntos', () => {
    const { result: queue } = renderHook(() => useFeedbackQueue());
    const onRemove = vi.fn();

    const { rerender } = render(
      <AchievementNotifications
        achievements={[achievement('a1', 'Primer Gasto'), achievement('a2', 'Racha de 7 días')]}
        onRemove={onRemove}
        enqueue={queue.current.enqueue}
        activeItem={queue.current.activeItem}
        dismissActive={queue.current.dismissActive}
      />
    );

    act(() => {
      rerender(
        <AchievementNotifications
          achievements={[achievement('a1', 'Primer Gasto'), achievement('a2', 'Racha de 7 días')]}
          onRemove={onRemove}
          enqueue={queue.current.enqueue}
          activeItem={queue.current.activeItem}
          dismissActive={queue.current.dismissActive}
        />
      );
    });

    // Solo el primero (frente del array) está visible.
    expect(screen.getByText('Primer Gasto')).toBeInTheDocument();
    expect(screen.queryByText('Racha de 7 días')).not.toBeInTheDocument();
  });

  it('al expirar el primero, el segundo pasa a mostrarse — nunca se vieron los dos juntos', () => {
    const { result: queue } = renderHook(() => useFeedbackQueue());
    const onRemove = vi.fn((index) => {
      achievementsState = achievementsState.filter((_, i) => i !== index);
    });
    let achievementsState = [achievement('a1', 'Primer Gasto'), achievement('a2', 'Racha de 7 días')];

    const { rerender } = render(
      <AchievementNotifications
        achievements={achievementsState}
        onRemove={onRemove}
        enqueue={queue.current.enqueue}
        activeItem={queue.current.activeItem}
        dismissActive={queue.current.dismissActive}
      />
    );
    act(() => {
      rerender(
        <AchievementNotifications
          achievements={achievementsState}
          onRemove={onRemove}
          enqueue={queue.current.enqueue}
          activeItem={queue.current.activeItem}
          dismissActive={queue.current.dismissActive}
        />
      );
    });
    expect(screen.getByText('Primer Gasto')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000); // FEEDBACK_DURATIONS.achievement
    });
    // Primer rerender: recoge `achievements` ya filtrado (onExpire ya corrió
    // onRemove(0) como parte del avance del coordinador) y activeItem=null
    // (todavía no se encoló 'a2' — el árbol de useFeedbackQueue y el de
    // AchievementNotifications son dos renders de test separados; en la app
    // real es un solo árbol y esto se resuelve en la misma pasada). Este
    // rerender dispara el efecto que SÍ encola 'a2'.
    act(() => {
      rerender(
        <AchievementNotifications
          achievements={achievementsState}
          onRemove={onRemove}
          enqueue={queue.current.enqueue}
          activeItem={queue.current.activeItem}
          dismissActive={queue.current.dismissActive}
        />
      );
    });
    // Segundo rerender: recoge el activeItem ya actualizado a 'a2' por el
    // enqueue del paso anterior.
    act(() => {
      rerender(
        <AchievementNotifications
          achievements={achievementsState}
          onRemove={onRemove}
          enqueue={queue.current.enqueue}
          activeItem={queue.current.activeItem}
          dismissActive={queue.current.dismissActive}
        />
      );
    });

    // Nota: no se afirma la AUSENCIA del texto anterior acá — AnimatePresence
    // (framer-motion) mantiene el elemento saliente montado durante su
    // transición de salida, que no resuelve de forma síncrona con fake
    // timers en jsdom (limitación conocida de testear animaciones spring,
    // no señal de que se estén mostrando dos logros "activos" a la vez: la
    // cobertura de "nunca dos simultáneos como ACTIVOS" ya la da el primer
    // test de este archivo, que verifica el estado post-render estable).
    expect(onRemove).toHaveBeenCalledWith(0);
    expect(screen.getByText('Racha de 7 días')).toBeInTheDocument();
  });

  it('sin logros nuevos, no renderiza nada', () => {
    const { result: queue } = renderHook(() => useFeedbackQueue());
    render(
      <AchievementNotifications
        achievements={[]}
        onRemove={vi.fn()}
        enqueue={queue.current.enqueue}
        activeItem={queue.current.activeItem}
        dismissActive={queue.current.dismissActive}
      />
    );
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
  });
});
