# docs/legal/

## Propósito de esta carpeta

Esta carpeta contiene la **arquitectura legal** de SALDO: el mapa de qué documentos legales existen, cuáles faltan, qué contradicciones hay entre lo publicado y el producto real, y qué decisiones de negocio están pendientes antes de redactar o actualizar contenido jurídico.

## Diferencia entre arquitectura legal y documentos legales finales

- **Arquitectura legal** (esta carpeta): analiza, cataloga y registra. No es vinculante para el usuario final. Sirve para que el equipo y el Product Owner decidan con trazabilidad antes de escribir o modificar texto legal.
- **Documentos legales finales** (`public/terms.html`, `public/privacy.html`, y los que se agreguen a futuro): son los documentos vinculantes que el usuario acepta. Solo se modifican después de que las decisiones pendientes en `LEGAL_DECISIONS_PENDING.md` estén resueltas y aprobadas explícitamente por el Product Owner.

Esta carpeta nunca reemplaza a `public/terms.html` ni a `public/privacy.html`. Los referencia y los audita, pero el contenido legal vinculante sigue viviendo únicamente en `public/`.

## Archivos de esta carpeta

| Archivo | Contenido |
|---|---|
| `LEGAL_ARCHITECTURE.md` | Objetivo, alcance, metodología y modelo legal del producto. |
| `LEGAL_DOCUMENT_CATALOG.md` | Catálogo de todos los documentos legales evaluados (existentes, faltantes, condicionales, no requeridos), con objetivo, prioridad y dependencias. |
| `LEGAL_CONTRADICTIONS.md` | Registro de inconsistencias reales detectadas entre el código, la documentación técnica y los documentos legales publicados. |
| `LEGAL_DECISIONS_PENDING.md` | Registro de decisiones de negocio que le corresponden al Product Owner y que bloquean el avance hacia redacción legal. |

## Cómo evoluciona esta documentación

1. **Fase de arquitectura (actual):** se audita el producto real contra lo publicado, se registran hechos, contradicciones y decisiones pendientes. No se redacta cláusula legal alguna.
2. **Resolución de decisiones pendientes:** el Product Owner responde cada ítem de `LEGAL_DECISIONS_PENDING.md`. Estas respuestas se registran (cambiando el campo "Estado" de cada decisión), no se infieren.
3. **Redacción legal:** solo después de que las decisiones relevantes a un documento específico estén resueltas, se redacta o actualiza ese documento puntual — nunca todos a la vez ni por adelantado.
4. **Auditoría continua:** cada vez que el producto cambia de forma relevante para algún documento del catálogo (nueva funcionalidad, nuevo proveedor externo, nuevo mercado), se vuelve a esta carpeta antes de tocar el documento legal correspondiente.

Ningún archivo de `public/` se modifica como parte de este trabajo de arquitectura. Ver restricciones de alcance en `LEGAL_ARCHITECTURE.md` §2.
