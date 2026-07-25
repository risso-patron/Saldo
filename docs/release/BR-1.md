# BR-1 — Baseline Release

**Fecha:** 2026-07-25

**Commit de referencia:** `eb6fc28` (`main`, sincronizado con `origin/main`)

**Estado de la certificación:** ✅ Aprobada

---

## Qué es esta baseline

BR-1 congela oficialmente el estado del proyecto SALDO al cierre del ciclo de auditoría y corrección RC-1. Es la primera línea base formal del producto: una fotografía estable, reproducible y trazable, verificada contra el repositorio real (no contra la intención documentada).

Este documento certifica el estado — no lo audita ni lo explica en detalle. El detalle completo de cada hallazgo, su implementación y su evidencia vive en `docs/release/RC-1.md`.

## Verificación

| Verificación | Resultado |
|---|---|
| Sincronización con `origin/main` | ✅ Exacta (`eb6fc28`) |
| Build de producción | ✅ Exitosa, sin errores |
| Suite de tests | ✅ 63 archivos / 725 tests, 100% en verde |
| Working tree | ✅ Limpio (única excepción deliberada: `docs/legal/`, ver abajo) |
| Bugs críticos abiertos | ✅ Ninguno |

## Qué incluye esta baseline

- El ciclo completo de auditoría y corrección RC-1 (Fases 0 a 6 del roadmap de implementación), con su alcance implementable cerrado.
- Todos los hallazgos con descripción recuperable, implementados y verificados con evidencia en navegador real.
- Los hallazgos sin contenido recuperable, retirados formalmente por decisión del Product Owner (regularización documental).

## Exclusiones deliberadas

Estas exclusiones no son deuda oculta — están documentadas, evaluadas y no bloquean esta baseline:

- **D2 — Gobernanza del catálogo de categorías.** Única decisión de producto que permanece abierta. Bloquea exclusivamente RC-1.4/C2; no bloquea ningún otro componente del producto ni el resto de esta baseline.
- **Deudas de integración registradas** (`docs/design/integration-debt.md`) — divergencias conocidas entre la implementación y el Product Blueprint (arquitectura de "Herramientas" y de "Suscripción/Paywall"). Documentadas como deuda arquitectónica no bloqueante, con su resolución prevista descripta en el propio registro.
- **Workstream legal** (`docs/legal/`) — arquitectura y auditoría de documentación legal del producto, independiente del alcance técnico-funcional de RC-1/BR-1. No modifica código ni los documentos legales vinculantes (`public/terms.html`, `public/privacy.html`). Su propia relación temporal con el ciclo de release es una decisión de negocio pendiente, ajena a esta baseline.
- **Migración de textos a i18n** (RC-1.5) — la infraestructura de internacionalización es funcional; la adopción de textos por pantalla queda diferida a una fase posterior al Release Candidate, fuera del alcance de RC-1/BR-1.

## Declaración de línea base

BR-1 constituye el punto oficial y estable desde el cual evolucionará SALDO. Todo desarrollo posterior — nuevas funcionalidades, resolución de D2, o cualquier auditoría futura — parte de este estado como referencia.

---

*Para el detalle completo de la auditoría, los hallazgos, su implementación y su evidencia, ver `docs/release/RC-1.md`.*
