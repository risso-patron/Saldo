# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### En desarrollo
- Migración progresiva a TypeScript
- Tests con Vitest
- CI/CD con GitHub Actions

---

## [1.2.0] - 2024-12-17

### Agregado
- Sistema de gamificación con 24 logros desbloqueables
- Animaciones WebP optimizadas (reemplazando Lottie)
- Integración completa de IA con Claude (análisis financiero)
- Gráfico de predicciones basado en IA
- Alertas inteligentes
- Panel de insights financieros
- Modo oscuro (Dark Mode) nativo
- Gestión de metas financieras
- Gestión de tarjetas de crédito
- Importación masiva desde CSV
- Exportación a PDF con reportes profesionales

### Cambiado
- Migrado de Vite 5 a Rolldown-Vite 7.1 (build 3x más rápido)
- Actualizado React a v19.1
- Mejorado sistema de gráficos con Recharts
- Optimizado bundle size (reducido 40%)
- Refactorizada arquitectura de componentes

### Corregido
- Error de persistencia en localStorage
- Bug de duplicación en transacciones
- Problema de responsividad en móviles
- Warnings de ESLint

### Documentación
- Creado README.md profesional
- Agregada guía de setup completa
- Documentación de APIs
- Consolidada documentación técnica

---

## [1.1.0] - 2024-11-15

### Agregado
- Autenticación con Supabase
- Sincronización en la nube
- Recuperación de contraseña
- Perfil de usuario
- 4 tipos de gráficos (Donut, Línea, Barras, Comparativo)

### Cambiado
- Migrado de localStorage a Supabase
- Mejorada UI con TailwindCSS

---

## [1.0.0] - 2024-10-01

### Lanzamiento Inicial
- Registro de ingresos y gastos
- Cálculo de balance automático
- Categorización de gastos
- Filtros por fecha y categoría
- Gráfico básico de categorías
- Dark mode básico
- Responsive design

---

## Tipos de Cambios

- **Agregado**: para nuevas funcionalidades
- **Cambiado**: para cambios en funcionalidades existentes
- **Deprecado**: para funcionalidades que serán removidas
- **Removido**: para funcionalidades eliminadas
- **Corregido**: para corrección de bugs
- **Seguridad**: para cambios de seguridad
- **Documentación**: para cambios en docs

---

## Links de Comparación

[Unreleased]: https://github.com/risso-patron/Saldo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/risso-patron/Saldo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/risso-patron/Saldo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/risso-patron/Saldo/releases/tag/v1.0.0
