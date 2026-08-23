# Plan de Implementación Legal — SALDO

## 1. Objetivo

Este documento define el **orden de implementación** del trabajo legal de SALDO una vez que las decisiones estratégicas registradas en `LEGAL_PO_DECISION_GATE.md` queden cerradas. Es un documento de planificación y secuenciación — **no redacta contenido legal, no resuelve ninguna decisión pendiente, no modifica código ni los documentos legales publicados**. Funciona como puente explícito entre tres etapas que no deben mezclarse:

```
Decision Gate (decisiones del PO)
        ↓
Documentos legales finales (redacción)
        ↓
Implementación en producto (código, UI, flujos)
```

Ninguna etapa debe adelantarse a la anterior. Este plan existe para que, cuando el PO cierre decisiones, no haya que improvisar el orden de trabajo.

## 2. Estado actual

**Documentación de arquitectura legal existente** (todo en `docs/legal/`):

| Documento | Contenido |
|---|---|
| `LEGAL_ARCHITECTURE.md` | Objetivo, alcance, metodología y modelo legal del producto |
| `LEGAL_DOCUMENT_CATALOG.md` | Catálogo de documentos legales evaluados (críticos, alta prioridad, condicionales, no requeridos) |
| `LEGAL_CONTRADICTIONS.md` | 7 contradicciones registradas (LEG-001 a LEG-007) + 1 hallazgo de facturación (BILLING-001) |
| `LEGAL_DECISIONS_PENDING.md` | Registro original de las 6 decisiones pendientes del PO |
| `LEGAL_PO_DECISION_GATE.md` | Las mismas 6 decisiones en formato ejecutivo (contexto, evidencia, opciones, impacto) |
| `AI_DATA_FLOW.md` | Descubrimiento técnico del flujo real de datos hacia IA |
| `BILLING_MODEL.md` | Descubrimiento técnico del modelo real de facturación/Stripe |
| `README.md` | Propósito de la carpeta y cómo evoluciona |

**Decisiones pendientes:** las 6 registradas en `LEGAL_PO_DECISION_GATE.md` — PO-LEGAL-001 a PO-LEGAL-006 — están todas en estado **Pendiente**. Ninguna fue resuelta.

**Documentos legales bloqueados por esas decisiones pendientes** (ninguno puede redactarse o actualizarse en firme todavía):

- `public/terms.html` (existente, requiere auditoría y actualización)
- `public/privacy.html` (existente, requiere auditoría y actualización)
- Subscription & Refund Policy (no existe)
- Retention & Deletion Policy (parcial, sin plazos concretos)
- Refuerzo del descargo financiero (parcial, dentro de `terms.html`)

## 3. Dependencia entre decisiones y documentos

| Decisión | Afecta documentos |
|---|---|
| **Identidad comercial** (PO-LEGAL-006) | Terms of Service, Privacy Policy |
| **Titular jurídico** (PO-LEGAL-002) | Todos los documentos legales públicos |
| **Mercado objetivo** (PO-LEGAL-001) | Privacy Policy, sección de derechos del usuario |
| **Arquitectura de IA** (PO-LEGAL-003) | Privacy Policy, sección de consentimiento de IA |
| **Billing** (relacionado con BILLING-001 en `LEGAL_CONTRADICTIONS.md`) | Subscription & Refund Policy, Terms of Service |
| **Eliminación de cuenta** (PO-LEGAL-005) | Privacy Policy, Retention & Deletion Policy |

Nota: la fila "Billing" no corresponde a una decisión PO-LEGAL numerada dentro de las 6 originales — su resolución depende de la confirmación técnica ya registrada como `BILLING-001` en `LEGAL_CONTRADICTIONS.md` (sincronización cancelación-Stripe), no de una elección de negocio entre opciones. Se incluye en esta tabla porque bloquea igualmente la redacción de un documento del catálogo.

## 4. Orden previsto de implementación

### Fase A — Cierre de decisiones PO

**Estado:** Pendiente.

**Incluye:**
- Resolver PO-LEGAL-001 a PO-LEGAL-006 (`LEGAL_PO_DECISION_GATE.md`).
- Actualizar `LEGAL_DECISIONS_PENDING.md` y `LEGAL_PO_DECISION_GATE.md` reflejando cada decisión cerrada (campo "Estado").
- Actualizar `LEGAL_ARCHITECTURE.md`/`LEGAL_DOCUMENT_CATALOG.md` si alguna decisión cambia el alcance o la prioridad de algún documento del catálogo.

### Fase B — Auditoría de documentos existentes

**Documentos:** `public/terms.html`, `public/privacy.html`.

**Objetivo:** comparar, punto por punto, el contenido actualmente publicado contra la arquitectura aprobada (`LEGAL_ARCHITECTURE.md`, `LEGAL_DOCUMENT_CATALOG.md`) y contra las decisiones ya cerradas en la Fase A. Identificar exactamente qué secciones de cada documento quedan desactualizadas, incorrectas, o pendientes de completar.

**No modificar todavía.** Esta fase produce un diagnóstico de brechas, no una edición.

### Fase C — Redacción legal

**Orden previsto:**

1. Terms of Service (actualización del existente)
2. Privacy Policy (actualización del existente)
3. Subscription & Refund Policy (nuevo)
4. Retention & Deletion Policy (nuevo/formalización)
5. Ajustes de descargo financiero (refuerzo dentro de Terms, no documento nuevo)
6. Otros documentos condicionales (Cookie Policy, Security Trust Page, DPA público — solo si su disparador correspondiente en `LEGAL_DOCUMENT_CATALOG.md` se activa)

### Fase D — Implementación en producto

**Solo después de aprobar los textos de la Fase C.**

**Posibles tareas** (ninguna se asume necesaria de antemano — se define caso por caso al llegar a esta fase):
- Versionado de documentos legales (identificar qué versión aceptó cada usuario).
- Registro de aceptación (evento + timestamp de cuándo el usuario aceptó cada documento).
- Timestamps de vigencia visibles en cada documento publicado.
- Ajustes al flujo de consentimiento de IA si la Fase A cambia su alcance (ver PO-LEGAL-003, LEG-006, LEG-007).
- Flujos de eliminación de cuenta, si la Fase A resuelve PO-LEGAL-005 a favor de autoservicio.

### Fase E — Validación

**Definir en su momento:**
- Revisión legal (contenido jurídico final).
- Revisión de producto (coherencia con la experiencia real de usuario).
- Revisión técnica (que lo implementado en Fase D corresponda exactamente a lo redactado en Fase C).
- Aprobación final del Product Owner antes de publicar.

## 5. Reglas de control de cambios

Cualquier cambio futuro al producto que afecte alguna de las siguientes áreas **debe disparar una revisión legal** antes de mergearse, incluso después de que este plan se complete:

- Datos tratados (nuevos campos, nuevas fuentes de datos del usuario).
- Proveedores externos (agregar, quitar o cambiar un proveedor de infraestructura, IA, pagos o analytics).
- Pagos (cambios de precio, de plan, de flujo de checkout o de cancelación).
- IA (nuevas capacidades, cambio de proveedor, cambio en qué datos se envían).
- Usuarios (cambios en el modelo de cuentas — por ejemplo, cuentas compartidas o multiusuario).
- Consentimiento (cualquier cambio al texto, momento o mecanismo de consentimiento existente).

Esta regla es independiente del resto del plan y queda vigente de forma permanente, no solo durante esta fase de trabajo.

## 6. Criterios de entrada a redacción legal

La Fase C (redacción legal) **no puede comenzar** hasta que:

- PO-LEGAL-001 esté resuelto.
- PO-LEGAL-002 esté resuelto.
- PO-LEGAL-003 esté resuelto.
- PO-LEGAL-005 esté resuelto.
- PO-LEGAL-006 esté resuelto.

**PO-LEGAL-004** (relación entre el workstream legal y el freeze de RC-1) puede resolverse de forma independiente — no bloquea el contenido de ningún documento legal, solo determina el calendario en el que la Fase C/D pueden ejecutarse en relación con RC-1.

---

*Este documento no redacta ni resuelve nada por sí mismo. Se reevalúa cada vez que una decisión de `LEGAL_PO_DECISION_GATE.md` cambia de estado.*
