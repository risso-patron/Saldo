import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '../ds/Button';

// Checkpoint IV-E.3 (Saldo Design Constitution v1.2) — envoltorio de gesto
// para una fila de Historial en mobile (spec: "deslizar una fila revela
// Editar/Eliminar (con Deshacer)" — descripto únicamente bajo el mockup
// Mobile, nunca bajo Tablet). NO modifica FilaMovimiento.jsx: la recibe tal
// cual como `children`, sin tocarla — Historial.jsx decide cuándo envolver
// (solo con useIsMobileRow() en true; en tablet/desktop FilaMovimiento se
// renderiza directa, sin este componente de por medio).
//
// Agnóstico de otras filas (Ajuste 2 del checkpoint): solo conoce SU propio
// `isRevealed` (controlado desde afuera por Historial.jsx, el
// orquestador — la única pieza que coordina exclusión mutua entre filas,
// vía rowInteractionReducer.js). Emite únicamente onReveal(id)/
// onCloseReveal(id); nunca decide qué pasa con las demás filas.
//
// Umbral de activación: por distancia O velocidad del gesto — un swipe
// corto pero rápido también revela, igual que el comportamiento nativo de
// iOS/Android (framer-motion expone ambos en onDragEnd). Nunca por swipe
// completo = borrado directo: el gesto revela botones, nunca ejecuta la
// eliminación por sí solo (regla del PO — el gesto nunca es la única vía a
// una acción).
// REVEAL_WIDTH: ancho real renderizado del par Editar+Eliminar en
// `size="compact"` (Button.jsx: h-8, px-3, texto ds-body) con estas dos
// etiquetas exactas — NO un valor arbitrario. Medido empíricamente en
// navegador real durante la verificación del checkpoint
// (getBoundingClientRect del contenedor de botones ≈145px, redondeado a
// 144 = REVEAL_WIDTH/2 exacto para DISTANCE_THRESHOLD más abajo). Si algún
// día cambian las etiquetas, el tamaño del botón, o el idioma, este valor
// queda desalineado del ancho real y hay que volver a medirlo — no crecer
// ni reducir a ojo.
const REVEAL_WIDTH = 144;
const DISTANCE_THRESHOLD = REVEAL_WIDTH / 2;
const VELOCITY_THRESHOLD = 500; // px/s

// Checkpoint IV-E.3 — mismo lenguaje de movimiento que el resto de la app
// (docs/design/screens/Saldo Historial.dc.html, "Animaciones": "motion/base
// 200ms... curva única"; tailwind.config.js: `ease-ds` = cubic-bezier(0.2,
// 0, 0, 1)). framer-motion, sin transición explícita, usa un spring por
// defecto (con overshoot y un asentamiento más lento e impredecible) —
// verificado en navegador real: producía filas visualmente "a mitad de
// camino" varios cientos de ms después del gesto, inconsistente con
// `swipedId` ya asentado. Se fuerza una curva/duración explícita en vez de
// heredar el spring por defecto.
const SNAP_TRANSITION = { duration: 0.2, ease: [0.2, 0, 0, 1] };

export function FilaDeslizable({
  id,
  isRevealed,
  onReveal,
  onCloseReveal,
  onEditMovement,
  onDeleteMovement,
  movement,
  children,
}) {
  const controls = useAnimation();

  // Otra fila pasó a ser la activa (o todo se cerró, ej. Escape) — anima de
  // vuelta a su posición sin que haya habido gesto acá.
  useEffect(() => {
    controls.start({ x: isRevealed ? -REVEAL_WIDTH : 0, transition: SNAP_TRANSITION });
  }, [isRevealed, controls]);

  // dragMomentum=false: sin esto, framer-motion sigue animando por inercia
  // propia después de soltar el gesto (además de la posición final que
  // arrastra desde su propio tracking interno de `drag`), compitiendo con
  // los `controls.start(...)` explícitos de acá abajo y del efecto de
  // arriba — se vio en verificación real como una fila que quedaba en una
  // posición intermedia inconsistente con el `swipedId` real. Se gestiona
  // la posición final enteramente a mano (loop de drag), sin la física de
  // inercia que framer-motion daría por defecto.

  // onCloseReveal solo se dispara por gesto (arrastrar de vuelta a cerrado
  // sin cruzar el umbral) — NUNCA por tap. Tocar la fila mientras está
  // revelada NO se intercepta: el click llega normalmente al onClick que
  // Historial.jsx ya le pasó a la fila envuelta (abrir expansión), que
  // despacha OPEN_EXPANSION — y esa transición ya limpia swipedId por la
  // forma del reducer (rowInteractionReducer.js). "El swipe desaparece y
  // se abre el detalle" con un solo tap sale gratis de esa propiedad, sin
  // lógica adicional acá.
  const handleDragEnd = (event, info) => {
    const shouldReveal =
      info.offset.x < -DISTANCE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD;

    if (shouldReveal) {
      controls.start({ x: -REVEAL_WIDTH, transition: SNAP_TRANSITION });
      onReveal(id);
      return;
    }

    controls.start({ x: 0, transition: SNAP_TRANSITION });
    if (isRevealed) onCloseReveal(id);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex" aria-hidden={!isRevealed}>
        <Button
          variant="secondary"
          size="compact"
          tabIndex={isRevealed ? 0 : -1}
          onClick={() => onEditMovement(movement)}
        >
          Editar
        </Button>
        {onDeleteMovement && (
          <Button
            variant="secondary"
            size="compact"
            tone="danger"
            tabIndex={isRevealed ? 0 : -1}
            onClick={() => onDeleteMovement(movement)}
          >
            Eliminar
          </Button>
        )}
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative bg-ds-bg-base"
      >
        {children}
      </motion.div>
    </div>
  );
}

FilaDeslizable.propTypes = {
  id: PropTypes.string.isRequired,
  isRevealed: PropTypes.bool.isRequired,
  onReveal: PropTypes.func.isRequired,
  onCloseReveal: PropTypes.func.isRequired,
  onEditMovement: PropTypes.func.isRequired,
  onDeleteMovement: PropTypes.func,
  movement: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};
