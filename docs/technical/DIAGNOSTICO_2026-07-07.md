# Diagnóstico técnico real - 2026-07-07

Proyecto: Saldo (React + Vite + TailwindCSS + Supabase + Stripe + Netlify Functions)

## Alcance y evidencia

Comandos ejecutados:
- npm run build
- npm test -- --run
- npm outdated
- npm audit --json
- npm run lint
- git ls-files

Archivos revisados:
- AUDIT_REPORT.md
- docs/technical/SECURITY_HARDENING_CHECKLIST.md
- docs/technical/IMPLEMENTATION_SUMMARY.md
- docs/CHANGELOG.md
- openspec/config.yaml
- openspec/changes/.gitkeep
- openspec/specs/.gitkeep
- netlify/functions/ai-proxy.js
- netlify/functions/subscription-manage.js
- netlify/functions/create-checkout-session.js
- netlify/functions/stripe-webhook.js
- netlify/functions/currency-rates.js
- supabase/schema.sql
- supabase/subscriptions-schema.sql
- supabase/security-hardening.sql
- src/features/export/csvSecurity.js
- src/features/export/exportUtils.js
- src/utils/sanitize.js
- src/App.jsx
- src/pages/LandingPage.jsx
- src/pages/LandingPageNew.jsx
- src/components/UI/Button.jsx
- src/components/Shared/Button.jsx
- src/components/UI/Card.jsx
- src/components/Shared/Card.jsx
- src/__tests__/*.js
- src/__tests__/*.jsx

---

## 1) Estado real vs documentado

### 1.1 AUDIT_REPORT.md vs estado actual

Implementado o ya resuelto:
- El riesgo crítico por docs/transacciones-banco-listo.csv ya no aplica: ese archivo no aparece en git ls-files.
- La documentación redundante señalada en ese reporte ya está archivada parcialmente (docs/archive/* existe y está versionado).
- vercel.json no está versionado actualmente.
- test-api.js no está versionado actualmente.

Obsoleto o desalineado:
- El reporte afirma estado de commit y conteos que no representan el estado actual operativo.
- El reporte menciona build-log2.txt; en el repo actual existen build_out.txt (versionado) y build-output.txt (presente en workspace, no versionado).

Vigente:
- Sigue habiendo ruido en raíz (archivos de build/log/manuales y carpetas no estándar): build_out.txt versionado, build-output.txt presente, build.bat presente, carpeta con nombre "{" y entrada de nombre "'" en raíz.

### 1.2 SECURITY_HARDENING_CHECKLIST.md vs estado actual

Implementado:
- ai-proxy exige Authorization Bearer y responde 401 sin token.
- ai-proxy aplica allowlist de origen vía ALLOWED_ORIGINS y bloquea con 403 si no coincide.
- subscription-manage rechaza upgrades directos desde cliente (solo permite downgrade_to_free y cancel_at_period_end).
- En SQL de suscripciones no existe policy de UPDATE para usuarios autenticados.

Parcial:
- Checklist exige variables de IA múltiples (GOOGLE_GEMINI_API_KEY, ANTHROPIC_API_KEY, etc.), pero el proxy implementado actualmente usa solo GROQ.
- El checklist pide validar ejecución de tests de seguridad específicos en verde; en estado real, la suite completa no está sana por incompatibilidad de entorno de pruebas.

Obsoleto:
- La parte de proveedores IA del checklist está desactualizada respecto al código actual centrado en Groq.

### 1.3 IMPLEMENTATION_SUMMARY.md vs estado actual

Obsoleto o inconsistente:
- El documento afirma policy "Users can update own subscription" como parte del diseño; el esquema actual de suscripciones explícitamente evita UPDATE por cliente.
- El documento presenta estado de implementación como cerrado, pero el estado real de testing/linting no está en verde.

### 1.4 docs/CHANGELOG.md vs estado actual

Parcial/desalineado:
- En Unreleased menciona migración progresiva TypeScript, pero el código principal sigue en JSX/JS.
- El changelog no refleja deuda actual de seguridad de dependencias detectada por npm audit.

### 1.5 openspec

Estado real:
- openspec existe pero no está en uso activo.
- openspec/specs y openspec/changes contienen solo .gitkeep.

---

## 2) Salud técnica

### 2.1 Build

Comando:
- npm run build

Resultado:
- Exit code: 0
- Build completo exitoso.

Warnings relevantes de build:
- Circular chunk detectado: vendor-animations -> vendor-ui -> vendor-animations.
- Uso de eval en lottie.js (warning de seguridad/minificación).

### 2.2 Tests

Comando:
- npm test -- --run

Resultado:
- Exit code: 1
- Vitest reporta 1 archivo de test ejecutado correctamente y 8 errores no controlados en workers.
- Causa repetida: ERR_REQUIRE_ESM en parse5/jsdom al iniciar workers para múltiples tests.

Estado real de suite:
- No está confiable como gate de calidad ahora mismo.
- Solo aiProxy.security.test.js corrió y pasó en esta ejecución.

### 2.3 Cobertura real por módulos (según tests existentes y ejecución)

Con tests definidos en src/__tests__:
- calculations: sí (calculations.test.js)
- sanitize: sí (sanitize.test.js)
- validators: sí (validators.test.js)
- aiProxy security: sí (aiProxy.security.test.js)
- subscription security: sí (useSubscription.security.test.jsx)
- csv security: sí (csvSecurity.test.js)

Módulos core sin tests dedicados detectados:
- src/core/parserEngine.js
- src/core/mappingEngine.js
- src/core/categorizationEngine.js

Conclusión:
- Hay intención de cobertura en utilidades y seguridad, pero no existe cobertura dedicada para el pipeline core de importación/categorización.

### 2.4 Dependencias desactualizadas

Comando:
- npm outdated

Resultado:
- Exit code: 1 (esperado cuando hay paquetes desactualizados).
- Hay desactualizaciones amplias en runtime y dev tools.

Ejemplos de alto impacto:
- vite: 5.4.21 -> 6.4.3
- vitest: 4.1.4 -> 4.1.10
- @supabase/supabase-js: 2.78.0 -> 2.110.1
- stripe: 17.7.0 -> 22.3.0
- jspdf: 3.0.4 -> 4.2.1

### 2.5 Vulnerabilidades

Comando:
- npm audit --json

Resultado:
- Exit code: 1
- Totales: low 1, moderate 5, high 2, critical 1 (total 9)

Riesgos críticos/altos observados:
- jspdf (directa): critical/high múltiples advisories, fix a 4.2.1.
- vite/esbuild/ws: advisories de severidad moderate/high.

---

## 3) Seguridad

### 3.1 Aislamiento de secretos (Netlify Functions)

Verificado en:
- netlify/functions/ai-proxy.js
- netlify/functions/subscription-manage.js
- netlify/functions/create-checkout-session.js
- netlify/functions/stripe-webhook.js
- netlify/functions/currency-rates.js

Estado:
- Claves sensibles (Stripe secret, webhook secret, service role key, GROQ key) se leen desde process.env en backend.
- No hay exposición directa de esos secretos en cliente (src usa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY, que son públicas por diseño).
- create-checkout-session y subscription-manage exigen JWT para operar.
- stripe-webhook valida firma stripe-signature.

Riesgos detectados:
- ai-proxy permite fallback de rate limit en memoria si Upstash no está configurado (menos robusto para abuso distribuido).
- ai-proxy retorna mensaje de error operativo específico de proveedor ("Groq no disponible..."), lo cual no expone secretos pero sí revela detalles de infraestructura.

### 3.2 Supabase RLS y coherencia con código

Verificado en:
- supabase/subscriptions-schema.sql
- supabase/security-hardening.sql
- supabase/schema.sql
- netlify/functions/subscription-manage.js

Estado:
- subscriptions-schema.sql no define policy UPDATE para usuarios autenticados (alineado con backend seguro).
- security-hardening.sql incluye eliminación defensiva de policy de update y revoke UPDATE.
- subscription-manage usa service role para mutaciones controladas de plan.

Desalineaciones detectadas:
- supabase/schema.sql tiene definición duplicada de columna email en user_profiles (error de esquema).
- supabase/schema.sql no contiene la tabla subscriptions (está en archivo separado), lo que exige disciplina de orden de ejecución en despliegue.

### 3.3 CSV injection y sanitización

Verificado en:
- src/features/export/csvSecurity.js
- src/features/export/exportUtils.js
- src/utils/sanitize.js

Estado:
- csvSecurity neutraliza celdas que comienzan con =, +, -, @ y algunos caracteres de control, prefijando apóstrofo.
- exportUtils aplica sanitizeCSVCell en campos de texto exportados (descripción/categoría).

Brechas:
- sanitizeCSVCell no neutraliza variantes con prefijo Unicode/espacios no estándar fuera del patrón actual.
- exportToPDF no aplica sanitización equivalente de texto antes de inyectar descripciones en documento.

---

## 4) Arquitectura y deuda técnica

### 4.1 Componentes duplicados (Button/Card)

Estado real por uso:
- Button vigente: src/components/Shared/Button.jsx (referenciado ampliamente por features/componentes).
- Button en src/components/UI/Button.jsx: sin referencias activas en app principal.
- Card vigente coexistente:
  - Shared/Card en la mayoría de features nuevas.
  - UI/Card sigue siendo usado por componentes legacy: BudgetForm, ExpenseList, Summary.

Conclusión:
- No es duplicado limpio para borrar de inmediato.
- Button UI parece candidato claro a deprecación/eliminación.
- Card UI sigue vivo por consumo legacy.

### 4.2 LandingPage duplicada

Estado real:
- App.jsx importa LandingPageNew desde src/pages/LandingPageNew.jsx.
- src/pages/LandingPage.jsx no está referenciada por App principal.

Conclusión:
- LandingPageNew es la vigente.
- LandingPage.jsx es candidata a retiro o archivo.

### 4.3 Código muerto, imports rotos, archivos no usados

Hallazgos:
- Existe subárbol src/pages/b_E10dJewJ7UM con .tsx y aliases tipo @/components/ui/* no integrados en la app principal actual.
- build_out.txt está versionado en git y parece artefacto temporal.
- build-output.txt está en workspace raíz (no versionado) y también es artefacto temporal.
- npm run lint falla con 282 errores y 9 warnings, incluyendo:
  - problemas de configuración de entorno de tests (no-undef en describe/it/expect/vi)
  - hooks rules violadas en DailyReminder
  - reglas react-refresh en múltiples archivos
  - no-control-regex en csvSecurity
  - referencias de entorno en vite.config.js y vitest.config.js

Conclusión:
- Hay deuda técnica de calidad de código elevada y no bloqueada actualmente.

---

## 5) Priorización (impacto/riesgo)

1. Corregir exposición de riesgo crítico en dependencias PDF y frontend toolchain.
- Acción: subir jspdf a 4.2.1 y ejecutar plan controlado para vite/esbuild/ws.
- Riesgo mitigado: vulnerabilities critical/high en superficie de exportación y tooling.

2. Recuperar confiabilidad del pipeline de pruebas.
- Acción: resolver incompatibilidad jsdom/parse5 (alinear versiones Vitest + jsdom + node runtime) hasta tener npm test en verde sin unhandled errors.
- Riesgo mitigado: falsos positivos de seguridad/regresión.

3. Endurecer control de abuso en ai-proxy.
- Acción: hacer obligatorio rate limiting persistente (Upstash) en producción y añadir fallback-deny en ausencia de backend de límite para entornos productivos.
- Riesgo mitigado: abuso de costos y agotamiento de cuota IA.

4. Normalizar y validar esquema Supabase de forma transaccional.
- Acción: corregir duplicado email en supabase/schema.sql y definir orden de migraciones único (schema base + subscriptions + hardening).
- Riesgo mitigado: despliegues inconsistentes y drift entre entornos.

5. Consolidar componentes duplicados y limpiar código legacy sin uso.
- Acción: retirar LandingPage.jsx y evaluar eliminación de UI/Button tras confirmar cero referencias; plan de migración final para UI/Card.
- Riesgo mitigado: mantenimiento duplicado y regresiones por estilos divergentes.

6. Corregir lint de base para establecer calidad mínima.
- Acción: ajustar entorno ESLint para Vitest globals y resolver errores de hooks/rules más críticos.
- Riesgo mitigado: bugs silenciosos y fricción continua de desarrollo.

7. Cerrar hueco de cobertura en motores core de importación.
- Acción: agregar tests dedicados para parserEngine, mappingEngine, categorizationEngine con casos de entradas malformadas y edge cases.
- Riesgo mitigado: errores funcionales en ingestión de datos financieros.

8. Limpiar artefactos y ruido de repo raíz.
- Acción: sacar build_out.txt de versionado, mantener logs fuera de git y revisar directorios/entradas anómalas en raíz.
- Riesgo mitigado: confusión operativa y deuda de hygiene.

---

## Resumen ejecutivo

- Build: pasa con warnings relevantes de chunks/eval.
- Tests: no confiables actualmente por fallo de entorno (1/9 archivos ejecutados, 8 errores unhandled).
- Seguridad: arquitectura de secretos backend está bien encaminada; principal riesgo actual está en dependencias vulnerables y robustez operativa del proxy IA.
- Arquitectura: duplicación y legacy presentes, con evidencia de rutas no vigentes.
- openspec: estructura presente pero sin uso activo real.
