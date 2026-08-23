# BR-2 — Diseño del Programa de Validación con Usuarios

**Estado:** 🟡 Diseño — sin ejecutar, sin implementar.

**Premisa:** Primero comprobar que la aplicación realmente ayuda a las personas. Después seguir construyendo.

Este documento es una propuesta de proceso, no un roadmap técnico. No contiene código, features nuevas, arquitectura ni monetización. Es el diseño de cómo vamos a escuchar a usuarios reales antes de decidir qué construir a continuación.

---

## 1. Perfil de los primeros usuarios (10–20 personas)

No se busca volumen. Se busca contraste: personas que, por su punto de partida, puedan detectar fricciones distintas y complementarias. Un solo perfil homogéneo (por ejemplo, 15 personas iguales) generaría feedback redundante y puntos ciegos compartidos.

| Perfil | Cantidad sugerida | Por qué este perfil |
|---|---|---|
| **Nunca controlaron sus gastos** (sin sistema previo, ni mental ni en papel) | 4–5 | Son el caso más exigente para el "flujo mínimo": si la app no logra que alguien sin hábito previo registre su primer gasto sin fricción, ningún otro perfil lo compensa. Validan la promesa central del producto desde cero. |
| **Usan Excel/planillas propias** | 3–4 | Ya tienen un sistema funcional y mental model formado. Si SALDO no es evidentemente más rápido o más claro que su planilla, lo van a decir sin filtro — son el contraste más honesto contra "lo que ya funciona". |
| **Usan otra app de finanzas** (cualquiera: Fintonic, Mint, YNAB, una app bancaria, etc.) | 3–4 | Tienen expectativas ya calibradas sobre qué "debería" hacer una app de este tipo. Detectan ausencias y comparan con vocabulario específico ("en la otra app esto lo hacía distinto") — dan feedback más preciso que alguien sin referencia. |
| **Trabajadores independientes / freelance** | 3–4 | Ingreso irregular, sin sueldo fijo mensual. Validan si el concepto de "mes" y "presupuesto mensual" tiene sentido con flujo de caja variable, o si genera fricción/ansiedad particular. |
| **Empleados en relación de dependencia** | 3–4 | Ingreso fijo y previsible — el caso "más simple" posible. Sirve como grupo de control: si algo falla también acá, el problema es de la app, no de la complejidad de la situación financiera del usuario. |
| **Familias / gasto compartido en el hogar** | 2–3 | SALDO hoy es de un solo usuario por cuenta. Este perfil valida si esa limitación es un obstáculo real que impide adoptar la app (alguien la abandona porque "no le sirve sin que la vea mi pareja"), o si no importa en la práctica. |

**Total: 18–24 personas**, ajustable a 10–20 según disponibilidad real de reclutamiento — se prioriza mantener los 6 perfiles representados aunque se reduzca la cantidad por perfil, nunca eliminar un perfil completo.

---

## 2. Objetivos de validación (hipótesis de producto)

No son funcionalidades a probar. Son creencias sobre el comportamiento humano que el producto asume, y que todavía no fueron comprobadas con gente real.

1. **H1 — Comprensión sin fricción:** ¿La persona entiende qué hacer al abrir la app por primera vez, sin que nadie se lo explique?
2. **H2 — Hábito de registro:** ¿Vuelve a registrar gastos en los días siguientes, o el primer registro fue un evento aislado que no se repite?
3. **H3 — Valor del historial:** ¿Consulta lo que ya cargó (vuelve a mirar el historial), o solo carga datos hacia adelante sin nunca revisar hacia atrás?
4. **H4 — Comprensión de categorías:** ¿Categoriza sus gastos con confianza, o duda, usa "Otros" como refugio, o directamente no entiende para qué sirve categorizar?
5. **H5 — Confianza en el número:** ¿Confía en que el saldo/balance que muestra la app es correcto, o lo verifica por fuera (banco, cabeza, otra app)?
6. **H6 — Retorno espontáneo:** ¿Volvería a abrir la app mañana por decisión propia, sin ningún recordatorio externo?
7. **H7 — Utilidad percibida vs. registro pasivo:** ¿Siente que la app le ayuda a decidir algo distinto (gastar menos, priorizar, ahorrar), o la percibe como una planilla más prolija sin ningún efecto en su comportamiento?

Estas siete hipótesis son las que el resto del documento (plan de pruebas, métricas, entrevista) existe para poner a prueba.

---

## 3. Plan de pruebas (14 días, liviano)

Formato: cada usuario prueba la app de forma autónoma en su vida real (no en una sala de pruebas), con puntos de contacto breves y no intrusivos de nuestra parte. Ningún punto de contacto debería tomarle al usuario más de 2 minutos, salvo la entrevista final.

| Día | Qué observar | Qué preguntar (mensaje breve, async) | Qué registrar |
|---|---|---|---|
| **Día 1** | Si completa el onboarding y registra al menos un movimiento sin ayuda. | Nada todavía — se observa en silencio, sin interrumpir la primera experiencia. | Hora de instalación/primer acceso, hora del primer gasto registrado, si hubo mensaje espontáneo de duda o error de parte del usuario. |
| **Día 3** | Si volvió a abrir la app sin que se le recuerde. Cuántos movimientos acumuló. | "¿Pudiste volver a cargar algo? ¿Hubo algo que no supieras dónde poner?" (una sola pregunta, respuesta libre). | ¿Abrió? (sí/no), cantidad de movimientos acumulados, texto literal de su respuesta. |
| **Día 7** | Retención a la semana. Si exploró algo más allá de cargar gastos (historial, gráficos, herramientas). | "¿Volviste a mirar lo que ya cargaste? ¿Para qué?" | Retención D7 (sí/no), qué secciones visitó (si es observable), texto literal de su respuesta. |
| **Día 14** | Cierre del período. Si el registro se sostuvo o se cortó antes. | Se agenda la entrevista de 15 minutos (sección 5). | Fecha del último movimiento registrado (si dejó de usar antes del día 14, cuál fue ese día), resultado completo de la entrevista. |

No hay Día 2, 4, 5, 6, etc. con contacto — el objetivo es liviano y repetible, no un seguimiento diario que termine sesgando el comportamiento natural del usuario.

---

## 4. Métricas (8, ninguna sin justificación)

| # | Métrica | Por qué importa |
|---|---|---|
| 1 | **Retención D1** (¿volvió a abrir al día siguiente?) | Señal más temprana de si el primer contacto generó intención de continuar. |
| 2 | **Retención D7** | Distingue curiosidad inicial de hábito naciente — es el corte más citado en apps de uso frecuente. |
| 3 | **Tiempo hasta el primer gasto registrado** | Mide la fricción real de onboarding — no lo que creemos que tarda, lo que tarda de verdad. |
| 4 | **Cantidad promedio de movimientos registrados en 14 días** | Diferencia "lo probé una vez" de "lo empecé a usar" — un usuario con 1 movimiento y otro con 15 están viviendo experiencias distintas. |
| 5 | **Frecuencia de apertura del Historial** | Prueba directa de H3: si nadie vuelve a mirar lo que cargó, el historial no está generando valor, solo está siendo alimentado. |
| 6 | **Uso de "Otros" como categoría** (proporción de movimientos categorizados así) | Proxy objetivo de H4: un uso alto de "Otros" indica que el catálogo de categorías no representa la vida real del usuario, sin necesidad de que lo diga explícitamente. |
| 7 | **Confianza auto-reportada en el número mostrado** (escala 1–5, en la entrevista final) | Mide directamente H5 — es una percepción, no se puede inferir de los datos de uso, hay que preguntarla. |
| 8 | **NPS** (0–10, "¿qué tan probable es que se lo recomiendes a alguien?") | Métrica resumen estándar, útil para comparar entre perfiles y como referencia a futuro con más usuarios. |

Se descartan deliberadamente métricas de "uso de herramientas/presupuestos/metas" como conteo aislado — en un grupo de 10–20 personas en 14 días, esos números son demasiado chicos para ser confiables por sí solos; lo relevante de esas secciones se captura mejor en la entrevista (pregunta "¿qué usaste más?") que en un conteo de clics.

---

## 5. Entrevista final (15 minutos, preguntas abiertas)

Regla general: ninguna pregunta debe poder responderse con "sí/no/me gustó" sin que la persona agregue algo propio. Si una respuesta es corta, se repregunta con "contame más" o "¿por ejemplo?", nunca sugiriendo una opción.

**Apertura (2 min) — contexto, no evaluación**
1. "Antes de esto, ¿cómo llevabas el control de tus gastos, si es que lo hacías de alguna forma?"

**Comprensión (4 min)**
2. "Contame qué entendiste que hacía la app la primera vez que la abriste."
3. "¿Hubo algo que no supieras qué hacer, o para qué servía, en algún momento de estos días?"

**Uso real (5 min)**
4. "¿Qué fue lo que más usaste de la app en estos días?"
5. "¿Hubo algo que probaste una vez y no volviste a usar? ¿Qué te hizo no volver?"
6. "¿En qué momentos se te ocurrió abrir la app? ¿Qué estabas haciendo justo antes?"

**Confianza y utilidad (3 min)**
7. "Cuando la app te mostraba tu saldo o tus gastos del mes, ¿confiabas en ese número? Contame por qué sí o por qué no."
8. "¿Hubo algún momento en que la app te haya hecho pensar distinto sobre algo que ibas a gastar, o fue solo un registro de lo que ya habías decidido?"

**Cierre (1 min)**
9. "Si la app dejara de existir mañana, ¿qué extrañarías? ¿Qué no extrañarías para nada?"
10. "¿Hay algo que no te pregunté y que te parece importante contar?"

Preguntas explícitamente evitadas por ser cerradas o inductivas: "¿te gustó?", "¿la recomendarías?" (esa va aparte, como NPS numérico, no como pregunta abierta), "¿te pareció fácil de usar?" (induce la respuesta "sí, fácil").

---

## 6. Plantilla de registro de feedback (una por usuario)

```
FICHA DE USUARIO — Programa de Validación SALDO

Información básica
- Alias / identificador: 
- Perfil: [nunca controló gastos / usa Excel / usa otra app / freelance / empleado / familia]
- Canal de contacto: 
- Fecha de inicio: 
- Fecha de entrevista final: 

Métricas (ver sección 4)
- Retención D1:        [sí/no]
- Retención D7:        [sí/no]
- Tiempo al 1er gasto: 
- Movimientos totales (14 días): 
- Aperturas de Historial observadas: 
- % de movimientos en "Otros": 
- Confianza en el número (1-5): 
- NPS (0-10): 

Hallazgos
(observaciones objetivas — qué hizo, qué dijo textualmente, sin interpretar todavía)
- 

Problemas
(fricciones concretas y repetibles — no opiniones sueltas)
- 

Ideas
(frases textuales del usuario sobre qué le gustaría o qué le falta — SIN convertirlas 
todavía en decisión de producto; se registran tal cual las dijo)
- 

Prioridad
[Alta / Media / Baja] — según qué tan bloqueante o repetido fue el problema, no según 
cuánto nos guste la idea.

Conclusión
(una sola línea: qué aprendimos de esta persona en particular)
- 
```

---

## 7. Criterios de cierre de BR-2 — cuándo continuar el roadmap

No se retoma la construcción de nuevas funcionalidades hasta que se cumplan estos criterios sobre el conjunto de usuarios del programa. Si no se cumplen, el paso siguiente es investigar por qué — no seguir agregando funciones a ciegas.

| Criterio | Umbral | Qué significa si no se cumple |
|---|---|---|
| Retención D7 | ≥ 50% de los usuarios | Menos de la mitad vuelve a la semana — hay un problema de adopción temprana, no de features faltantes. |
| Tiempo al primer gasto | ≥ 70% lo registra en menos de 5 minutos desde el primer acceso | El onboarding tiene fricción real — construir más funciones encima solo la empeora. |
| Uso espontáneo del Historial | ≥ 60% lo abre al menos una vez sin que se le pregunte | El historial no está generando valor de consulta — hay que entender por qué antes de invertir en más pantallas de datos. |
| Patrón de confusión repetido | Ningún punto de confusión aparece en más del 30% de las entrevistas | Si 1 de cada 3 personas se traba en el mismo lugar, es una señal de diseño, no una anécdota aislada — se resuelve antes de seguir. |
| Sostenimiento del hábito | ≥ 50% sigue registrando movimientos al día 14 | Por debajo de esto, lo que se validó fue curiosidad inicial, no adopción real. |
| NPS promedio | ≥ 30 | Un NPS negativo o bajo indica que, en promedio, los usuarios no sienten que la app les mejora la vida — la premisa central de este programa. |

Si los seis criterios se cumplen: la conclusión objetiva es que SALDO ayuda a las personas que lo probaron, y el roadmap técnico puede retomarse con esa base.

Si alguno no se cumple: se prioriza entender la causa raíz (a través de las entrevistas y hallazgos ya registrados) antes de decidir cualquier próximo paso — sin abrir hallazgos técnicos nuevos ni proponer funcionalidades como reacción automática.
