# Proposal: SALDO v1.1 — Claridad Financiera

**Autoridad**: PDP-001 (Product Owner, aprobado, v1.0)
**Base**: exploración técnica `sdd/saldo-v1-1-claridad-financiera/explore` (engram #218)

## Intent

Feedback real de usuarios ("no entiendo cómo usarla" / "le faltan cosas" / "me ayudó a ver mis gastos") confirma el valor central del producto pero expone fricción de activación. PDP-001 redefine SALDO como "compañero de claridad financiera" y ordena mejorar experiencia (onboarding, Dashboard, exposición de Metas) antes de sumar complejidad funcional.

## Scope

Secuenciado por prioridad de PDP-001 §7 (no big-bang; cada tier cierra antes de avanzar, según metodología del proyecto).

### In Scope
- **Alta**: implementar el onboarding ya especificado en `docs/product-master/06-onboarding.md` (sin rediseñar salvo incompatibilidad técnica demostrable); evolucionar `DashboardHome.jsx` con las 5 secciones de PDP-001 §4.2; exponer Metas (`GoalManager`, ya existe) como módulo principal **respetando R-08** (sin agregar tab de nivel superior).
- **Media**: evolucionar "Ideas" — coordinar con el change hermano `insights-ia-real` (ya "Listo para sdd-spec"), sin re-decidir su alcance. Ninguna recomendación auto-generada se muestra sin ≥4 semanas de historial (mismo criterio ya fijado ahí).
- **Baja**: diseño funcional (no implementación) de "Dinero pendiente" — préstamos entre personas, sin schema/UI en esta fase.

### Out of Scope
- Enmendar R-08 (requiere decisión formal separada del PO).
- Cambios a límites Free/Pro (PDP-001 §6).
- Rediseño de Herramientas (evolución gradual, no destino de nav esta fase).
- Implementación de código para Dinero pendiente (solo diseño funcional).

## Capabilities

### New Capabilities
- `onboarding-flow`: primer recorrido (pregunta opcional del "por qué" → primer movimiento real obligatorio → aterriza en Inicio), según spec ya cerrada en product-master.
- `dashboard-claridad`: Dashboard como centro de experiencia — estado actual, resumen mensual, idea sobre tu plata, mis metas, acciones rápidas.
- `metas-exposicion`: hacer alcanzable el módulo Metas (ya funcional) dentro de R-08.
- `dinero-pendiente`: solo diseño funcional (reglas de producto, no interfaz ni schema) esta fase.

### Modified Capabilities
- None. "Ideas" es propiedad del change `insights-ia-real` (dependencia, no se modifica acá).

## Approach

UI-first, sin tocar el modelo de datos en los tiers Alta/Media. La resolución concreta de `metas-exposicion` dentro de R-08 (qué reemplaza o cómo se accede sin 5ta tab) se decide en sdd-design, con opciones evaluadas contra la Design Constitution; si ninguna cumple R-08, se escala al PO antes de continuar. `dashboard-claridad` reutiliza el patrón de composición pura ya establecido en `DashboardHome.jsx`.

## Affected Areas

| Area | Impact | Description |
|------|--------|--------------|
| `src/App.jsx` | Modified | Entry de onboarding, posible ajuste de flujo de tabs |
| `src/components/Dashboard/DashboardHome.jsx` | Modified | Nuevas secciones (metas, acciones rápidas) |
| `src/components/ds/dsNavItems.js` | Modified (TBD en sdd-design) | Exposición de Metas dentro de R-08 |
| `src/components/Onboarding/` (nuevo) | New | Flujo de 3 pasos |
| `openspec/changes/insights-ia-real/` | Dependency | No se modifica; se coordina |
| Supabase schema | Not touched (Alta/Media) | Dinero pendiente queda en diseño, sin migración |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| R-08 no permite exponer Metas sin nueva tab | Med | Explorar opciones en sdd-design; escalar al PO si no hay solución conforme |
| "Idea sobre tu plata" en Dashboard promete más de lo que insights-ia-real puede dar día 1 | Med | Reusar copy de plantilla ya decidido ahí (sin análisis antes de 4 semanas) |
| Scope creep hacia código de Dinero pendiente | Low | Esta fase es solo diseño funcional; sin tabla ni UI |

## Rollback Plan

Alta/Media no tocan Supabase (solo UI/estado local) → revertir commits es suficiente, sin migración que revertir. Dinero pendiente no genera cambios de código en esta fase, por lo tanto no requiere rollback (su propio plan se define cuando alcance sdd-design/apply).

## Dependencies

- `insights-ia-real` (openspec, "Listo para sdd-spec") — coordina el tier Media.
- `docs/product-master/06-onboarding.md` — spec fuente del tier Alta.

## Success Criteria

- [ ] Usuario nuevo entiende el propósito sin ayuda externa (PDP-001 §8)
- [ ] Registra su primer movimiento sin ayuda (onboarding)
- [ ] Metas es alcanzable sin violar R-08
- [ ] Ideas no muestra conclusiones sin datos suficientes
- [ ] Diseño funcional de Dinero pendiente documentado (sin código)
