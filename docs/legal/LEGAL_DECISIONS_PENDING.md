# Decisiones Legales Pendientes del Product Owner — SALDO

Ninguna de estas decisiones fue tomada por el equipo de documentación legal. Se registran como bloqueantes: la Fase 1 en adelante de la actualización de documentos legales depende de que estas preguntas tengan respuesta.

---

## PO-LEGAL-001 — Mercado objetivo

**Pregunta:** ¿SALDO opera legalmente hoy para Panamá únicamente, para Latinoamérica en general, o se proyecta a un alcance global?

**Por qué importa:** Determina qué marco(s) de protección de datos y de protección al consumidor aplican más allá de la ley de Panamá ya declarada como ley aplicable en `terms.html §10`. Existen locales `en`/`fr` en el código (`src/i18n/locales/`), pero RC-1 registra que la adopción plena de i18n está diferida — no es evidencia suficiente de mercado objetivo real.

**Opciones:**
- Panamá (jurisdicción única, ya declarada).
- Latinoamérica (requiere evaluar patchwork regulatorio por país de residencia del usuario).
- Global (requiere evaluación adicional no iniciada en esta fase).

**Responsable:** Product Owner.

**Estado:** Pendiente.

---

## PO-LEGAL-002 — Titular jurídico

**Pregunta:** ¿El titular del servicio sigue siendo la persona física Jorge Luis Risso Patrón, existe ya una empresa constituida, o se proyecta constituir una nueva sociedad?

**Por qué importa:** Afecta la exposición de responsabilidad personal del titular y a quién deben nombrar todos los documentos legales como contraparte del usuario.

**Opciones:**
- Persona física actual (statu quo declarado en `terms.html §1, §10`).
- Empresa existente no reflejada aún en los documentos.
- Nueva sociedad a constituir.

**Responsable:** Product Owner.

**Estado:** Pendiente.

---

## PO-LEGAL-003 — Proveedor de IA real en producción

**Pregunta:** ¿Cuál es el proveedor (o proveedores) de IA efectivamente activo hoy en producción para la categorización/insights?

**Por qué importa:** Ver LEG-002 — tres fuentes del repositorio listan proveedores distintos. La Privacy Policy no puede declarar transferencias a terceros de forma correcta sin esta confirmación.

**Opciones:** No se listan opciones — es una pregunta de hecho técnico, no de decisión de negocio. Requiere confirmación directa del equipo técnico.

**Responsable:** Product Owner / equipo técnico.

**Estado:** Pendiente.

---

## PO-LEGAL-004 — Relación con la gobernanza de RC-1

**Pregunta:** ¿Este workstream de documentación legal corre en paralelo a RC-1 (por tratarse de contenido estático, no de una funcionalidad de producto), o se secuencia después del cierre de RC-1?

**Por qué importa:** RC-1 prohíbe explícitamente "nuevas funcionalidades" y "mejoras no relacionadas con QA" mientras está abierto (`docs/release/RC-1.md:9-16`). No se asume que la documentación legal esté dentro o fuera de ese alcance sin confirmación.

**Opciones:**
- Paralelo documental (no toca código de producto, por lo tanto fuera del freeze).
- Después del release (se espera al cierre de RC-1 antes de publicar actualizaciones).

**Responsable:** Product Owner.

**Estado:** Pendiente.

---

## PO-LEGAL-005 — Mecanismo de eliminación de cuenta

**Pregunta:** ¿Se mantiene el proceso manual por email (statu quo) o se prioriza construir un flujo de autoservicio?

**Por qué importa:** Ver LEG-004. Afecta tanto el contenido de la Retention & Deletion Policy como si se requiere trabajo de producto (fuera del alcance de esta tarea, que es exclusivamente documental).

**Opciones:**
- Manual por email (statu quo, ya prometido en `terms.html §8`).
- Autoservicio (requiere trabajo de producto en una fase separada).

**Responsable:** Product Owner.

**Estado:** Pendiente.

---

## PO-LEGAL-006 — Nombre comercial definitivo

**Pregunta:** ¿El nombre comercial y legal definitivo es "SALDO" o "Budget Calculator"?

**Por qué importa:** Ver LEG-001. Bloquea cualquier actualización de `terms.html` y `privacy.html`, ya que ambos deben nombrar correctamente al servicio y a las partes del contrato.

**Opciones:**
- SALDO (nombre usado en el código actual).
- Budget Calculator (nombre usado en los documentos legales publicados).

**Responsable:** Product Owner.

**Estado:** Pendiente.
