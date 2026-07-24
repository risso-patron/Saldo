import { renderHook, act } from '@testing-library/react';
import { useFeedbackQueue } from './useFeedbackQueue';

// RC-1.7/A1 — coordinador único del sistema de feedback puramente visual.
// Cubre: slot único, FIFO entre tipos distintos, pausa/reanudación
// (prioridad del Toast de Deshacer sobre el resto, sin absorber su lógica),
// y que dismissActive/expiración nunca dejan dos timers corriendo a la vez.

describe('useFeedbackQueue — RC-1.7/A1', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enqueue con el slot libre promueve inmediatamente', () => {
    const { result } = renderHook(() => useFeedbackQueue());

    act(() => {
      result.current.enqueue('alert', { message: 'uno' }, 1000);
    });

    expect(result.current.activeItem).toEqual({
      type: 'alert',
      payload: { message: 'uno' },
      duration: 1000,
      onExpire: undefined,
    });
  });

  it('un segundo enqueue mientras el slot está ocupado se encola (FIFO), no reemplaza al activo', () => {
    const { result } = renderHook(() => useFeedbackQueue());

    act(() => {
      result.current.enqueue('alert', { message: 'uno' }, 1000);
      result.current.enqueue('achievement', { name: 'dos' }, 1000);
    });

    expect(result.current.activeItem.payload).toEqual({ message: 'uno' });
  });

  it('al expirar el activo, promueve el siguiente de la cola en orden FIFO (sin importar el tipo)', () => {
    const { result } = renderHook(() => useFeedbackQueue());
    const onExpireOne = vi.fn();

    act(() => {
      result.current.enqueue('alert', { message: 'uno' }, 1000, onExpireOne);
      result.current.enqueue('achievement', { name: 'dos' }, 500);
      result.current.enqueue('welcomeBanner', { count: 3 }, 500);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onExpireOne).toHaveBeenCalledTimes(1);
    expect(result.current.activeItem.type).toBe('achievement');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.activeItem.type).toBe('welcomeBanner');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.activeItem).toBeNull();
  });

  it('nunca hay dos timers activos a la vez: un tercer evento no altera el timeout del primero', () => {
    const { result } = renderHook(() => useFeedbackQueue());
    const onExpireOne = vi.fn();
    const onExpireTwo = vi.fn();

    act(() => {
      result.current.enqueue('alert', {}, 1000, onExpireOne);
    });
    act(() => {
      result.current.enqueue('achievement', {}, 1000, onExpireTwo);
    });

    // Pasan 999ms — el primero todavía no debería expirar.
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onExpireOne).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onExpireOne).toHaveBeenCalledTimes(1);
    expect(onExpireTwo).not.toHaveBeenCalled();
    expect(result.current.activeItem.type).toBe('achievement');
  });

  it('dismissActive() llama onExpire del activo y promueve el siguiente sin esperar su duración', () => {
    const { result } = renderHook(() => useFeedbackQueue());
    const onExpireOne = vi.fn();

    act(() => {
      result.current.enqueue('alert', {}, 5000, onExpireOne);
      result.current.enqueue('achievement', {}, 1000);
    });

    act(() => {
      result.current.dismissActive();
    });

    expect(onExpireOne).toHaveBeenCalledTimes(1);
    expect(result.current.activeItem.type).toBe('achievement');
  });

  it('pause() evita que se promueva un nuevo elemento aunque el activo expire o se encolen más', () => {
    const { result } = renderHook(() => useFeedbackQueue());

    act(() => {
      result.current.enqueue('alert', {}, 1000);
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.activeItem).toBeNull();

    act(() => {
      result.current.enqueue('achievement', {}, 1000);
    });
    // Pausado: el nuevo enqueue no se promueve, queda en cola.
    expect(result.current.activeItem).toBeNull();
  });

  it('resume() promueve lo que haya quedado en cola durante la pausa', () => {
    const { result } = renderHook(() => useFeedbackQueue());

    act(() => {
      result.current.enqueue('alert', {}, 1000);
      result.current.pause();
    });
    act(() => {
      vi.advanceTimersByTime(1000); // expira el activo, pero pausado no promueve
    });
    act(() => {
      result.current.enqueue('achievement', { name: 'pendiente' }, 1000);
    });
    expect(result.current.activeItem).toBeNull();

    act(() => {
      result.current.resume();
    });

    expect(result.current.activeItem.payload).toEqual({ name: 'pendiente' });
  });

  it('resume() sin nada en cola no promueve nada (activeItem sigue null)', () => {
    const { result } = renderHook(() => useFeedbackQueue());

    act(() => {
      result.current.pause();
      result.current.resume();
    });

    expect(result.current.activeItem).toBeNull();
  });
});
