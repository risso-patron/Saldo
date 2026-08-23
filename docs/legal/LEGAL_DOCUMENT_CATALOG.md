# Catálogo de Documentos Legales — SALDO

Estado de cada documento legal evaluado contra hechos reales del producto. No incluye documentos agregados "porque otros SaaS los tienen" — cada fila tiene una justificación basada en una funcionalidad o riesgo verificado.

## Críticos

| Documento | Estado | Objetivo | Prioridad | Dependencias |
|---|---|---|---|---|
| **Terms of Service** | Existe (`public/terms.html`), publicado, requiere auditoría/actualización | Contrato marco de uso del servicio entre el titular y el usuario | 🔴 Crítica | PO-LEGAL-002 (titular), PO-LEGAL-006 (nombre comercial) |
| **Privacy Policy** | Existe (`public/privacy.html`), publicado, requiere auditoría/actualización | Base legal y transparencia sobre el tratamiento de datos personales y financieros | 🔴 Crítica | PO-LEGAL-001 (mercado), PO-LEGAL-003 (proveedor IA), LEG-002, LEG-003 |
| **Subscription & Refund Policy** | No existe | Reglas de cobro, cancelación y reembolso para Free/PRO mensual/PRO anual/Lifetime, dado que Stripe procesa pagos reales hoy | 🔴 Crítica | Depende de reglas de reembolso aún no definidas (pendiente, no asumidas) |

## Alta prioridad

| Documento | Estado | Objetivo | Prioridad | Dependencias |
|---|---|---|---|---|
| **Retention & Deletion Policy** | Parcial — existe promesa de eliminación en 30 días en `terms.html §8`, sin mecanismo automático verificado en el código | Plazos concretos de retención por tipo de dato y proceso de eliminación | 🟠 Alta | PO-LEGAL-005 (manual vs. autoservicio) |
| **Derechos del usuario** | Parcial — existe como sección dentro de `privacy.html §6` | Explicitar derechos de acceso, rectificación y eliminación disponibles hoy | 🟠 Alta | PO-LEGAL-001 (mercado objetivo determina alcance) |
| **Refuerzo de descargo financiero** | Parcial — existe como cláusula dentro de `terms.html §2` | Reforzar que SALDO no es asesoría financiera profesional certificada, dado que la IA genera insights/recomendaciones | 🟠 Alta | Ninguna nueva — refuerzo de texto existente |

## Condicionales (no obligatorios hoy)

| Documento | Estado | Objetivo | Prioridad | Dependencias |
|---|---|---|---|---|
| **Cookie Policy** | No existe como documento separado | Solo sería necesaria si se introduce tracking o analytics | 🔵 Condicional | Disparador: instalación futura de analytics/tracking (no existe hoy — verificado sin resultados en `package.json` e `index.html`) |
| **Security Trust Page** | No existe | Página pública de confianza sobre prácticas de seguridad; valor comercial más que obligación legal | 🔵 Condicional | Ninguna |
| **DPA público** | No existe | Solo sería necesario si SALDO tuviera clientes B2B o relación encargado-responsable con terceros | 🔵 Condicional | Disparador: aparición de clientes B2B (no existe hoy) |

## No requeridos actualmente

| Documento | Motivo de exclusión |
|---|---|
| **Licencia independiente** | SALDO es SaaS, no software distribuido/licenciado; el derecho de uso ya queda cubierto conceptualmente por el Terms of Service |
| **Política bancaria** | No existe conexión bancaria directa, OAuth bancario ni integración tipo Open Banking — la importación es CSV manual preparado por el usuario |
| **Política AML/KYC** | SALDO no mueve fondos de terceros, no es entidad financiera ni procesador de pagos entre usuarios — no hay hecho que justifique esta categoría |

Cualquier fila que pase de "no requerido" o "condicional" a "obligatorio" debe justificarse con un hecho nuevo verificado (una funcionalidad real agregada), no con una expansión de alcance anticipada.
