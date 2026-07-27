# Estrategia Comercial y Pricing — Saldo

Documento de arquitectura estratégica (PLAN-001). No repite la filosofía comercial ya
establecida en cap 01 ("Filosofía Free/Pro") ni los 10 principios y líneas rojas de
cap 21 ("Principios de Monetización") — los opera con decisiones concretas de
arquitectura de planes, modelo económico y pricing.

## 1. Propósito de la monetización

Saldo no vende funciones aisladas; vende una transformación financiera apoyada en
capacidades concretas.

Free responde "¿qué pasó con mi dinero?". Pro responde "¿qué va a pasar con mi
dinero?" — no es más funciones, es una transformación distinta: de mirar el pasado a
anticipar el futuro.

Pregunta guía para toda decisión de monetización: **¿esta decisión ayuda al usuario a
cambiar su relación con el dinero, o solamente intenta aumentar ingresos?**

## 2. Arquitectura Free / Pro / Lifetime

**Free** garantiza siempre las 5 capacidades de cap 21 ("Qué nunca monetizamos"):
comprender su economía, registrar ingresos y gastos, conocer en qué gasta, organizar
su dinero, disminuir su ansiedad financiera. Incluye exportación básica (CSV) como
derecho de propiedad de los propios datos.

**Pro — corazón**: inteligencia financiera contextual + tarjetas de crédito + gráficos
avanzados, funcionando juntos como una sola transformación anticipatoria. La IA se
entiende como inteligencia que se profundiza con el tiempo y el uso, nunca como un
chatbot o función técnica aislada.

**Pro — complementos**: planificación financiera avanzada (metas ilimitadas) y
exportación avanzada/reportes. Son ampliaciones reales, no la razón central de pago.

**Multi-moneda**: pendiente — depende de una decisión de mercado objetivo todavía no
tomada.

**Lifetime**: acceso de por vida únicamente a capacidades cuyo costo operativo sea
sostenible en un pago único (cap 21, "Lifetime no significa todo de por vida"). Es una
**herramienta estratégica/táctica** (adquisición temprana, caja), no un pilar de
ingreso recurrente — ese rol lo cumple Pro mensual/anual. Acceso a IA para cuentas
Lifetime: modelo de consumo como hipótesis recomendada pendiente de diseño, evitando
el término "créditos" en la comunicación inicial — implementación concreta pendiente
(ver sección 8).

**Gamificación**: reformulada narrativamente como acompañamiento de hábitos
financieros responsables — no se reclasifica como función de plan.

## 3. Modelo económico

```
Precio_Pro ≥ Costo_IA_promedio_por_usuario + Costo_infra_marginal
             + Comisión_de_pago(Precio_Pro) + Margen + Reserva operacional
```

La IA es el único costo que crece con el tiempo y el uso — el resto de los costos son
esencialmente fijos. Esta asimetría es la razón por la que Lifetime no puede incluir
IA de por vida sin poner en riesgo la sostenibilidad del producto.

## 4. Filosofía comercial (opera cap 21 — no la repite)

- Lifetime no compromete costos recurrentes de por vida.
- El trial es siempre contextual, nunca automático al registro.
- Cancelar nunca implica perder datos ni es un castigo.
- La confianza comercial nunca es retroactiva: cambios de arquitectura comercial
  rigen solo hacia adelante; quien ya compró conserva exactamente lo prometido.

Detalle completo de cada principio: cap 21.

## 5. Pricing actual — hipótesis inicial (no definitiva)

| Plan | Precio vigente |
|---|---|
| Pro mensual | USD 4.99 |
| Pro anual | USD 49 (~18% de ahorro vs. mensual) |
| Lifetime | USD 79 (pago único) |

Validados como hipótesis inicial coherente con la arquitectura de valor definida en
PLAN-001. No se modifican por intuición — solo por la evidencia de la sección 7.

## 6. Métricas de validación

| Métrica | Qué mide |
|---|---|
| Conversión Free → Pro | % que convierte, segmentado por si ocurre en el momento natural (cap 21: cuarta meta, primera tarjeta) o antes |
| Conversión Lifetime | Volumen de compras Lifetime vs. Pro recurrente — señal de alerta si canibaliza al recurrente |
| Activación previa | Si el usuario cerró un mes / creó meta o presupuesto antes de convertir |
| Retención | % de Pro activo tras N meses, por cohorte |
| Churn | Tasa de cancelación mensual + motivo declarado ("ya no lo necesito" vs. "no vi valor") |
| Uso real de IA | % de Pro que interactúa con categorización automática, insights o alertas |
| Costo IA por usuario | Costo real en producción vs. ingreso generado por ese usuario |
| Margen Pro por cohorte | Diferencia entre ingreso generado y costo operativo asociado, por grupo de usuarios |

Ninguna señal se considera válida sin sostenerse un mínimo de 3 meses (mismo criterio
de "sostenido" que cap 14 usa para gamificación).

## 7. Criterios de decisión

| Criterio | Condición (sobre ventana sostenida, 3+ meses) |
|---|---|
| Mantener precio | Conversión ocurre en el momento natural; retención estable o creciente; uso real de IA mayoritario; costo IA dentro del margen sano |
| Subir precio | Costo IA por usuario se acerca o supera el margen sano **y** uso real de IA es alto — nunca subir solo porque la conversión es alta |
| Modificar oferta, no el precio | Uso real de IA es bajo pese a conversión alta (pagan por otra cosa), o el motivo de cancelación mayoritario es "no vi valor" pese a activación previa completa |

Ningún cambio de precio se decide sin evidencia sostenida — cambiar por intuición
queda explícitamente excluido.

## 8. Decisiones pendientes

- Verificar en código si `ai_analysis`/`ai_predictions` están realmente gateados
  (bloqueante antes de comunicar la IA como diferenciador Pro).
- DP-PROD-001: auditoría de gamificación (`PlayerProgress.jsx` vs. cap 14).
- Diseño concreto del acceso a IA para Lifetime (hipótesis de consumo): nombre,
  límites, UX y modelo económico del add-on.
- Decisión de mercado objetivo para habilitar multi-moneda.
- Regionalización de precios — no decidir sin datos reales de mercado.
- Revisión periódica del límite de metas Free, para que siga siendo una ampliación
  natural y no una fuente de ansiedad (ya anotado en cap 21).
