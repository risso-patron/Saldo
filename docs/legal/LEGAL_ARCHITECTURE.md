# Arquitectura Legal de SALDO

## 1. Objetivo

Este documento define la **arquitectura legal** de SALDO: qué documentos legales existen o deben existir, por qué, y cómo se relacionan entre sí.

**Este documento NO contiene textos jurídicos finales.** No sustituye a `terms.html`, `privacy.html` ni a ningún documento legal que se redacte a futuro. Es un mapa, no un contrato.

## 2. Alcance

### Qué cubre esta arquitectura

- Privacidad y tratamiento de datos personales.
- Uso del producto (términos de servicio).
- Pagos y suscripciones (Stripe, planes Free/PRO/Lifetime).
- Procesamiento de datos mediante IA (categorización opcional).
- Tratamiento de datos financieros ingresados por el usuario.
- Eliminación de cuenta y de datos.

### Qué queda explícitamente fuera

- **Asesoría financiera regulada**: SALDO no presta asesoría financiera profesional ni está diseñado como tal.
- **Regulación bancaria**: SALDO no es una entidad financiera ni intermediario regulado.
- **Open Banking**: no existe conexión bancaria directa, OAuth bancario ni integración con agregadores tipo Plaid. La importación es manual vía CSV preparado por el propio usuario.
- **B2B empresarial**: no existen hoy clientes empresariales, cuentas de equipo ni relación encargado-responsable con terceros clientes de SALDO.

Cualquier expansión futura hacia estas áreas requiere reabrir esta arquitectura, no extenderla por inferencia.

## 3. Metodología

Esta arquitectura se construye siguiendo la misma disciplina aplicada en RC-1 y en el flujo SDD del repositorio:

1. **Hechos antes que interpretación.** Todo lo que se afirma sobre el producto proviene de código o documentación existente verificada, nunca de supuestos sobre "lo que suelen hacer los SaaS".
2. **Decisiones del Product Owner antes que implementación.** Ninguna cláusula, documento nuevo o cambio de alcance se redacta sin que la decisión de negocio correspondiente esté tomada y registrada en `LEGAL_DECISIONS_PENDING.md`.
3. **Documentos antes que cláusulas.** Primero se decide qué documentos existen y por qué (este archivo y `LEGAL_DOCUMENT_CATALOG.md`); recién después, en una fase posterior y con aprobación explícita, se redacta contenido jurídico.

Las contradicciones encontradas entre fuentes existentes se registran en `LEGAL_CONTRADICTIONS.md` y no se resuelven unilateralmente en esta fase.

## 4. Modelo legal del producto

Relación entre las partes y los datos que atraviesan el sistema, tal como existen hoy en el repositorio (sin funcionalidades futuras):

```
Usuario
  |
  |  (crea cuenta, ingresa datos)
  v
SALDO (React + Vite, frontend; Supabase, backend)
  |
  |-- Datos personales (nombre, email — registro por email o Google OAuth)
  |
  |-- Datos financieros (transacciones, metas, tarjetas — ingresados manualmente
  |                       o importados desde CSV preparado por el usuario)
  |
  |-- Servicios externos
  |     |
  |     |-- Stripe (procesamiento de pagos de suscripciones Free/PRO/Lifetime)
  |     |
  |     |-- Proveedor(es) de IA (categorización opcional, bajo consentimiento
  |     |                          just-in-time — proveedor exacto sin confirmar,
  |     |                          ver LEG-002)
  |     |
  |     |-- Infraestructura (Supabase: base de datos PostgreSQL + autenticación;
  |                            Netlify: hosting)
```

No existe en este modelo: conexión bancaria directa, agregador de datos financieros de terceros, ni relación con clientes B2B.
