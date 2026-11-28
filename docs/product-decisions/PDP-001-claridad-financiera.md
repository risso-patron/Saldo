# PDP-001 — SALDO v1.1 "Claridad Financiera"

**Estado:** Aprobado por Product Owner

**Versión:** 1.0

---

**Nota de incorporación al repositorio** (2026-08-06, `PM-RECON-004` / `docs/governance/PLAN-NORM-001-normalizacion-documental.md`, Fase A, ítem N-1): este documento fue entregado por el Product Owner fuera del repositorio y citado como autoridad desde `openspec/changes/saldo-v1-1-claridad-financiera/proposal.md` sin existir como archivo — hallazgo C-10 de `docs/governance/GOV-001-jerarquia-documental-de-producto.md`. Se deposita acá, verbatim, sin modificaciones de contenido, para que futuras citas puedan verificarse contra su texto literal en vez de heredarse por paráfrasis.

---

# 1. Contexto

SALDO ha superado la etapa de desarrollo inicial y cuenta con usuarios reales utilizando la aplicación.

El feedback recibido demuestra tres situaciones claramente diferenciadas:

* algunos usuarios no comprenden inmediatamente cómo utilizar la aplicación;
* otros consideran que el producto tiene potencial y desean verlo crecer;
* varios usuarios indican que SALDO les permitió comprender mejor sus gastos.

Esto confirma que el valor central del producto ya existe y que la siguiente etapa debe enfocarse en mejorar la experiencia antes que aumentar la complejidad funcional.

---

# 2. Nueva definición oficial del producto

A partir de SALDO v1.1 el producto pasa a definirse como:

> **SALDO es un compañero de claridad financiera.**

Su propósito es ayudar a las personas a comprender qué ocurre con su dinero, tomar mejores decisiones y avanzar hacia sus objetivos financieros sin aumentar la complejidad.

---

# 3. Principios ratificados

Se mantienen sin modificaciones los principios del Product Master.

En especial:

* simplicidad por encima de cantidad de funciones;
* lenguaje humano;
* reducción de ansiedad financiera;
* IA como asesor silencioso;
* "¿Rosa entendería esto sin preguntarle a nadie?"

---

# 4. Decisiones aprobadas

## 4.1 Onboarding

Se aprueba implementar el onboarding ya documentado en el Product Master.

No deberá diseñarse un flujo nuevo salvo que exista una incompatibilidad técnica demostrable.

---

## 4.2 Dashboard

El Dashboard pasa a ser el centro de la experiencia.

Su prioridad será responder inmediatamente:

> ¿Cómo estoy hoy?

La evolución deberá incorporar progresivamente:

* situación actual;
* resumen mensual;
* una idea sobre tu plata;
* metas activas;
* acciones rápidas.

---

## 4.3 Ideas

Se mantiene el concepto "Ideas sobre tu plata".

No deberán mostrarse recomendaciones generadas automáticamente mientras no exista suficiente información para producir conclusiones honestas.

Se mantiene la filosofía:

> Mejor no mostrar una idea que mostrar una idea incorrecta.

---

## 4.4 Metas

Metas deja de ser una funcionalidad secundaria y pasa a convertirse en un módulo principal del producto.

El relevamiento técnico confirma que GoalManager ya existe.

La prioridad será integrarlo correctamente en la experiencia general.

No se redefine su comportamiento funcional en esta etapa.

---

## 4.5 Herramientas

Herramientas continuará existiendo como centro de utilidades.

No será considerada inicialmente un destino principal de navegación.

Su contenido evolucionará gradualmente.

---

## 4.6 Dinero pendiente

Se aprueba el inicio del diseño funcional de un nuevo módulo denominado:

**Dinero pendiente**

Este módulo permitirá registrar dinero prestado entre personas.

No constituye un sistema de préstamos bancarios.

Su diseño deberá respetar la simplicidad del resto del producto.

---

# 5. Navegación

El relevamiento técnico identifica una restricción vigente (R-08) que limita la navegación principal.

Hasta que exista una decisión formal que modifique dicha regla, se mantiene vigente.

Las mejoras de navegación deberán diseñarse respetando esta restricción.

---

# 6. Monetización

No se modifican los límites Free / Pro existentes.

El modelo actual permanece vigente.

Las nuevas funcionalidades serán evaluadas posteriormente respecto de su estrategia de monetización.

---

# 7. Prioridades de implementación

## Prioridad Alta

* Onboarding
* Dashboard
* Exposición correcta de Metas

## Prioridad Media

* Evolución de Ideas

## Prioridad Baja

* Dinero pendiente
* Evolución de Herramientas

---

# 8. Criterio de éxito

SALDO v1.1 será considerado exitoso cuando un usuario nuevo pueda:

* comprender rápidamente el propósito del producto;
* registrar sus primeros movimientos sin ayuda;
* interpretar su situación financiera;
* identificar una acción siguiente.

---

# 9. Próximo paso

Con esta decisión aprobada, se autoriza la apertura del proceso OpenSpec correspondiente a SALDO v1.1 "Claridad Financiera", utilizando este documento como autoridad funcional.
