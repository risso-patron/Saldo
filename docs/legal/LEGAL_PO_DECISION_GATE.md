# Legal Product Owner Decision Gate

## Objetivo

Este documento traduce las preguntas abiertas registradas en `LEGAL_DECISIONS_PENDING.md` a un formato de decisión ejecutiva: contexto, evidencia, por qué importa, opciones e impacto de cada opción. **No resuelve ninguna decisión, no recomienda una opción como definitiva, y no redacta contenido legal.** Es una herramienta para que el Product Owner decida con trazabilidad — cada elección que haga se puede citar más adelante como el origen de un documento legal concreto.

## Cómo utilizar este documento

Para cada decisión: leer el contexto y la evidencia, comparar las opciones y su impacto, y registrar la elección cambiando el campo **Estado** de "Pendiente" a la opción elegida (por ejemplo, "Resuelto — Opción B"). Ninguna redacción legal (Terms, Privacy, Subscription Policy) debe iniciarse citando una decisión de este documento mientras su Estado siga en "Pendiente". La sección final ("Orden recomendado de resolución") indica en qué orden conviene resolver estas decisiones por relación de dependencia — no indica cuál opción elegir dentro de cada una.

---

## Decisiones aprobadas por Product Owner

Las 6 decisiones fueron resueltas por el Product Owner en julio de 2026. Se conserva el contexto, la evidencia y las opciones originales de cada una (historial de por qué se llegó a cada resolución) y se agrega, al final de cada bloque, la decisión aprobada. Dos de las seis quedan con una calificación explícita (no son un "cierre limpio" sin condiciones) — ver PO-LEGAL-002 y PO-LEGAL-003 más abajo.

### Decisión PO-LEGAL-001 — Mercado objetivo inicial

**Contexto:** SALDO tiene hoy documentos legales que declaran jurisdicción de Panamá (`public/terms.html §10`). El código incluye locales `es`/`en`/`fr` (`src/i18n/locales/`), pero RC-1 registra que la adopción plena de i18n está diferida a una fase posterior (`docs/release/RC-1.md:33`). No hay evidencia de mercado objetivo definitivo más allá de lo declarado.

**Evidencia existente:** `public/terms.html §10` (ley aplicable = Panamá); `src/i18n/locales/es.json`, `en.json`, `fr.json` (locales presentes en código); `docs/release/RC-1.md:33` (adopción de i18n diferida); `LEGAL_DECISIONS_PENDING.md` → PO-LEGAL-001.

**Por qué importa:** El mercado objetivo determina qué marco(s) de protección de datos y de protección al consumidor debe cubrir la Política de Privacidad y los Términos de Servicio más allá de la ley de Panamá ya declarada. LatAm es un mosaico regulatorio (cada país con su propia ley de protección de datos) — extender el mercado sin extender el marco legal deja usuarios sin cobertura declarada.

**Opciones:**

| Opción | Impacto si se elige |
|---|---|
| **A — Panamá únicamente** | Documentación más simple; menor complejidad regulatoria; menor alcance comercial declarado |
| **B — Latinoamérica hispanohablante** | Mercado más amplio; mayor complejidad de privacidad; requiere revisar diferencias regulatorias país por país antes de publicar |
| **C — Global** | Mayor alcance comercial; obliga a considerar múltiples marcos jurídicos simultáneos, incluidos posibles regímenes fuera de LatAm |

**Responsable:** Product Owner.

**Decisión aprobada (julio 2026):** Opción B — mercado objetivo inicial: **Latinoamérica hispanohablante**. El producto está dirigido a personas que buscan visualizar, comprender y gestionar mejor sus finanzas personales. No se asumen países específicos ni requisitos regulatorios individuales por país todavía — quedan fuera del alcance de esta decisión y deberán tratarse por separado cuando corresponda.

**Estado:** RESUELTO.

---

### Decisión PO-LEGAL-002 — Titular jurídico de SALDO

**Contexto:** Los documentos publicados identifican como titular a Jorge Luis Risso Patrón, persona física, domicilio Panamá (`public/terms.html §1, §10`). No existe evidencia en el repositorio de una sociedad operadora.

**Evidencia existente:** `public/terms.html §1` ("acuerdo legal entre tú y Jorge Luis Risso Patrón (el 'Desarrollador')"); `public/terms.html §10`; `LEGAL_DECISIONS_PENDING.md` → PO-LEGAL-002.

**Por qué importa:** El titular jurídico determina quién asume la responsabilidad contractual y a quién deben nombrar todos los documentos legales como contraparte del usuario. Una persona física asume responsabilidad personal directa; una sociedad la limita a su patrimonio propio.

**Opciones:**

| Opción | Impacto si se elige |
|---|---|
| **Persona física (statu quo)** | Implementación inmediata, sin cambios documentales; responsabilidad personal directa se mantiene |
| **Sociedad existente** | Requiere cambio de titularidad en todos los documentos; requiere revisión contractual de qué entidad asume qué obligación |
| **Nueva sociedad futura** | Requiere preparar una transición de titularidad; requiere definir el momento en que ocurre ese cambio y cómo se comunica a los usuarios ya registrados |

**Responsable:** Product Owner.

**Decisión aprobada (julio 2026):** SALDO será operado comercialmente bajo **Space Panama**. Esta decisión define la titularidad comercial declarada, pero **no incluye** por sí sola la validación de la estructura societaria, la titularidad formal ni la capacidad contractual de esa entidad — eso queda registrado como pendiente de revisión jurídica, no como parte de esta resolución. No se asume ninguna información adicional sobre Space Panama más allá de lo declarado por el Product Owner.

**Estado:** RESUELTO CON VALIDACIÓN PENDIENTE — la elección de titular está tomada; la validación de estructura societaria, titularidad formal y capacidad contractual de Space Panama queda pendiente de revisión jurídica antes de poder usarse en un documento legal final.

---

### Decisión PO-LEGAL-003 — Arquitectura de IA definitiva

**Contexto:** Ver `AI_DATA_FLOW.md` y `LEGAL_CONTRADICTIONS.md` (LEG-002, LEG-005). Groq tiene una llamada real de red verificada (`netlify/functions/ai-proxy.js`). Gemini y Anthropic aparecen documentados en `.env.example` y permitidos por la Content-Security-Policy de `netlify.toml`, pero sin llamada real verificada en el código.

**Evidencia existente:** `AI_DATA_FLOW.md §4` (tabla de proveedores); `LEGAL_CONTRADICTIONS.md` LEG-002 y LEG-005; `.env.example:19-37`; `netlify.toml:74-80`.

**Por qué importa:** La Política de Privacidad debe listar exactamente los proveedores a los que se transfieren datos del usuario — ni más (proveedores no usados) ni menos (proveedores usados pero no declarados). Esta decisión también determina si la infraestructura preparada para Gemini/Anthropic se mantiene, se limpia, o se activa.

**Opciones:**

| Opción | Impacto si se elige |
|---|---|
| **Mantener solo el proveedor actual (Groq)** | Privacidad más simple de redactar; menor superficie legal de terceros a declarar |
| **Arquitectura multi-proveedor activa** | Mayor flexibilidad técnica; mayor complejidad documental — cada proveedor activo debe declararse y mantenerse actualizado en la Política de Privacidad |
| **Mantener proveedores preparados pero no activos** | Requiere lenguaje cuidadoso que evite confundir "configuración disponible" con "proveedor realmente en uso" — riesgo si no se distingue con claridad en el propio código y en la documentación técnica |

**Responsable:** Product Owner.

**Decisión aprobada (julio 2026):** El proveedor de IA actualmente definido es **Groq** — corresponde al proveedor activo verificado hoy (`AI_DATA_FLOW.md §4`). Esta decisión resuelve el **alcance actual** (qué proveedor está en uso y debe declararse en la Privacy Policy), pero **no cierra** la posibilidad de una arquitectura multi-proveedor futura. Cualquier redacción o referencia posterior debe diferenciar explícitamente entre "proveedor actual" (Groq) y "estrategia futura" (multi-proveedor, no decidida) — no deben tratarse como lo mismo.

**Estado:** RESUELTO CON ALCANCE ACTUAL — válido para el estado presente del producto (Groq como único proveedor activo); no es una decisión de arquitectura de largo plazo.

---

### Decisión PO-LEGAL-004 — Relación entre el workstream legal y RC-1

**Contexto:** RC-1 está en curso con freeze explícito de nuevas funcionalidades (`docs/release/RC-1.md:9-16`). El workstream de documentación legal, hasta ahora, no ha modificado código de producto — es contenido documental dentro de `docs/legal/`.

**Evidencia existente:** `docs/release/RC-1.md:9-16` (prohibición de nuevas funcionalidades durante el milestone); historial de esta serie de tareas (ninguna modificó `src/`, `supabase/`, `netlify/` ni documentos legales públicos).

**Por qué importa:** Define si la actualización real de `terms.html`/`privacy.html` y la eventual redacción de nuevos documentos legales puede avanzar ya, o si debe esperar al cierre de RC-1 para no mezclar prioridades de gobernanza.

**Opciones:**

| Opción | Impacto si se elige |
|---|---|
| **Legal paralelo documental** | Permite seguir avanzando en documentos legales ahora; cualquier cambio que sí toque código de producto (por ejemplo, autoservicio de eliminación de cuenta) sigue sujeto al control de alcance de RC-1 igual que cualquier otro cambio |
| **Legal posterior a RC-1** | Menor riesgo de mezclar prioridades y gobernanza; retrasa la corrección de los documentos ya publicados (marca, proveedores de IA) hasta el cierre del release |

**Responsable:** Product Owner.

**Decisión aprobada (julio 2026):** Opción A — el trabajo documental legal **continúa en paralelo con RC-1**. Regla asociada: cualquier cambio técnico que se derive de un requisito legal (por ejemplo, un flujo de eliminación de cuenta o un ajuste de consentimiento) deberá seguir el proceso normal de desarrollo y control de cambios del proyecto — esta decisión no exime a esos cambios del control de alcance vigente, incluido el de RC-1 mientras siga abierto.

**Estado:** RESUELTO.

---

### Decisión PO-LEGAL-005 — Eliminación de cuenta

**Contexto:** Existe hoy un proceso manual por email, prometido con plazo de 30 días (`public/terms.html §8`). No se encontró en el código ningún mecanismo de autoservicio (`LEGAL_CONTRADICTIONS.md` LEG-004).

**Evidencia existente:** `public/terms.html §8`; `LEGAL_CONTRADICTIONS.md` LEG-004 (ausencia verificada de `deleteAccount`/handler equivalente en `src/`).

**Por qué importa:** Afecta tanto el contenido de una eventual Retention & Deletion Policy como la capacidad operativa real de cumplir el plazo prometido a escala.

**Opciones:**

| Opción | Impacto si se elige |
|---|---|
| **Mantener proceso manual** | Menor trabajo técnico inmediato; menor escalabilidad a medida que crece la base de usuarios |
| **Implementar eliminación autoservicio** | Mejor experiencia de usuario y menor riesgo de incumplimiento de plazo; requiere diseño técnico nuevo (fuera del alcance de este workstream documental) y requiere definir reglas de retención antes de construirlo |

**Responsable:** Product Owner.

**Decisión aprobada (julio 2026):** El estado actual se mantiene — **proceso manual de eliminación** de cuenta. La evolución hacia un flujo de autoservicio queda registrada como dirección futura, no como compromiso inmediato: no existe actualmente obligación de implementar una funcionalidad que hoy no existe. Cualquier trabajo técnico para construir autoservicio deberá pasar por su propio proceso de decisión y desarrollo, fuera del alcance de esta resolución documental.

**Estado:** RESUELTO.

---

### Decisión PO-LEGAL-006 — Identidad comercial definitiva

**Contexto:** El código llama al producto "SALDO" (`src/components/AI/AIConsentPrompt.jsx:15`). Los documentos legales publicados usan "Budget Calculator" (`public/terms.html`, `public/privacy.html`). Ver `LEGAL_CONTRADICTIONS.md` LEG-001.

**Evidencia existente:** `src/components/AI/AIConsentPrompt.jsx:15`; `public/terms.html` (título, §1, footer); `public/privacy.html` (título, §1, footer); `LEGAL_CONTRADICTIONS.md` LEG-001.

**Por qué importa:** Bloquea directamente cualquier actualización de `terms.html`/`privacy.html`, porque ambos documentos deben nombrar correctamente al servicio y a las partes del contrato para ser válidos como tal.

**Opciones:**

| Opción | Impacto si se elige |
|---|---|
| **Migrar completamente a "SALDO"** | Coherencia total entre código y documentos legales; requiere actualizar todos los documentos existentes (`terms.html`, `privacy.html`) y cualquier referencia comercial asociada |
| **Mantener "Budget Calculator"** | Requiere justificar y documentar la relación entre el nombre interno del código ("SALDO") y el nombre comercial/legal publicado, para que no se lea como una inconsistencia no explicada |

**Responsable:** Product Owner.

**Decisión aprobada (julio 2026):** El nombre comercial definitivo del producto es **SALDO**. Acción futura registrada (no ejecutada todavía): eliminar las referencias a "Budget Calculator" en la documentación pública cuando corresponda — esta resolución no modifica `public/terms.html` ni `public/privacy.html` por sí misma; solo fija la decisión de nombre que esos documentos deberán reflejar en su próxima actualización.

**Estado:** RESUELTO.

---

## Decisiones cerradas por Product Owner

| ID | Decisión | Fecha de resolución |
|---|---|---|
| PO-LEGAL-001 — Mercado objetivo | Latinoamérica hispanohablante | Julio 2026 |
| PO-LEGAL-002 — Titular jurídico | Space Panama (validación de estructura societaria y capacidad contractual pendiente de revisión jurídica) | Julio 2026 |
| PO-LEGAL-003 — Arquitectura de IA | Groq como proveedor actual verificado; no cierra una futura arquitectura multi-proveedor | Julio 2026 |
| PO-LEGAL-004 — Relación con RC-1 | El workstream legal continúa en paralelo con RC-1; cambios técnicos derivados siguen el proceso normal de control de cambios | Julio 2026 |
| PO-LEGAL-005 — Eliminación de cuenta | Se mantiene el proceso manual actual; autoservicio queda como evolución futura, no como compromiso inmediato | Julio 2026 |
| PO-LEGAL-006 — Identidad comercial | SALDO; eliminar referencias a "Budget Calculator" en documentación pública cuando corresponda (acción futura, no ejecutada en esta resolución) | Julio 2026 |

## Impacto de decisiones

Estas seis decisiones no son independientes entre sí — varias determinan directamente qué se puede escribir en los documentos legales listados en `LEGAL_DOCUMENT_CATALOG.md`:

- **PO-LEGAL-006** (identidad comercial) y **PO-LEGAL-002** (titular jurídico) determinan a quién y con qué nombre se redactan **Terms of Service** y **Privacy Policy** — sin esto, cualquier texto redactado tendría que reescribirse si la respuesta cambia después.
- **PO-LEGAL-001** (mercado objetivo) determina el alcance de jurisdicción y de derechos del usuario declarados en **Privacy Policy** y en la sección de ley aplicable de **Terms of Service**.
- **PO-LEGAL-003** (arquitectura de IA) determina la sección de terceros/proveedores de **Privacy Policy** y si LEG-005/LEG-006/LEG-007 se resuelven por limpieza de código, por integración formal, o por decisión de mantenerlos como están.
- **PO-LEGAL-004** (relación con RC-1) determina el calendario en el que las demás decisiones pueden materializarse en documentos publicados.
- **PO-LEGAL-005** (eliminación de cuenta) determina el contenido de una eventual **Retention & Deletion Policy** y si esa política describe un proceso manual o uno de autoservicio.

## Estado general

| Decisión | Estado |
|---|---|
| PO-LEGAL-001 — Mercado objetivo | RESUELTO |
| PO-LEGAL-002 — Titular jurídico | RESUELTO CON VALIDACIÓN PENDIENTE |
| PO-LEGAL-003 — Arquitectura de IA | RESUELTO CON ALCANCE ACTUAL |
| PO-LEGAL-004 — Relación con RC-1 | RESUELTO |
| PO-LEGAL-005 — Eliminación de cuenta | RESUELTO |
| PO-LEGAL-006 — Identidad comercial | RESUELTO |

**6 de 6 decisiones resueltas** (julio 2026). Dos de las seis quedan con una calificación explícita, no con un cierre limpio: PO-LEGAL-002 tiene la validación de estructura societaria y capacidad contractual de Space Panama pendiente de revisión jurídica, y PO-LEGAL-003 resuelve el proveedor de IA vigente hoy (Groq) sin cerrar una eventual arquitectura multi-proveedor futura. Este documento registra que las 6 decisiones fueron tomadas; no determina por sí mismo si eso alcanza para iniciar la Fase C (redacción legal) de `LEGAL_IMPLEMENTATION_PLAN.md` — esa evaluación de criterios de entrada corresponde a ese documento, no a este.

---

## Orden recomendado de resolución

Esta sección indica **dependencia entre decisiones, no una elección dentro de cada una**. El orden no resuelve ni sugiere qué opción tomar — solo qué decisión bloquea la utilidad práctica de cuál otra.

1. **Identidad comercial** (PO-LEGAL-006) — bloquea a todas las demás: ningún documento puede redactarse sin saber a nombre de qué producto se emite.
2. **Titular jurídico** (PO-LEGAL-002) — bloquea a quién se nombra como contraparte contractual en cualquier documento.
3. **Mercado objetivo** (PO-LEGAL-001) — bloquea qué marco(s) legal(es) debe cubrir cada documento.
4. **IA** (PO-LEGAL-003) — específico de la sección de proveedores/terceros de la Privacy Policy; depende de que 1–3 ya estén resueltos para no redactar esa sección dos veces.
5. **Billing** — la Política de Suscripciones y Reembolsos depende igualmente de 1–3, y adicionalmente de que se confirme la arquitectura de cancelación real descrita en `BILLING-001` (`LEGAL_CONTRADICTIONS.md`) antes de poder describir con precisión qué le pasa a un usuario que cancela.
6. **Eliminación de cuenta** (PO-LEGAL-005) — cierra el ciclo de vida de los datos; depende de 1–3 para el marco legal aplicable y es independiente de IA/Billing en su contenido técnico.

Las decisiones 1 a 3 afectan directamente y de forma transversal la redacción de **Terms of Service** y **Privacy Policy**. Las decisiones 4 y 5 afectan secciones específicas: 4 a la sección de terceros de **Privacy Policy**, 5 a la futura **Subscription & Refund Policy**. La decisión 6 afecta a una eventual **Retention & Deletion Policy**.

---

*Este documento no resuelve decisiones. Se actualiza cambiando el campo "Estado" de cada decisión cuando el Product Owner se pronuncie, y debe mantenerse sincronizado con `LEGAL_DECISIONS_PENDING.md` cuando eso ocurra.*
