<div align="center">

![Budget RP Banner](docs/screenshots/banner.png)

# 🪙 Budget RP — Gestión Inteligente de Finanzas

**Transforma tu salud financiera con IA, precisión quirúrgica y sincronización multi-moneda en la nube.**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🌐 Ver Demo en Vivo](https://budget-calculator.netlify.app) • [🐛 Reportar Bug](https://github.com/risso-patron/budget-calculator-react/issues) • [✨ Solicitar Feature](https://github.com/risso-patron/budget-calculator-react/issues)

</div>

---

## 📖 Introducción

**Budget RP** no es solo una calculadora; es un motor financiero diseñado para la era de la IA. Permite a usuarios internacionales, emprendedores y familias tomar el control total de su dinero mediante una arquitectura multi-moneda, análisis predictivo y una experiencia de usuario gamificada de primer nivel.

> [!TIP]
> **¿Cansado de aplicaciones rígidas?** Registra un café en Pesos, tu sueldo en Dólares y tus ahorros en Euros. Nosotros nos encargamos de la matemática.

---

## ✨ Features Principales

### 🧠 Inteligencia Artificial (AI Framework)
*   **Predictive Insights**: Detección automática de patrones y score de salud financiera.
*   **Smart Import**: Mapeo automático de categorías desde CSV bancarios usando Gemini/Groq.
*   **Conversational Assistant**: Chat interactivo para consultas financieras directas.
*   **Multi-Proveedor**: Soporte nativo para Gemini, Groq, Claude y Ollama (local).

### 🌐 Arquitectura Multi-Moneda Transaccional
*   **Registro Nativo**: Guarda cada transacción en su divisa original (150+ soportadas).
*   **Normalización Realtime**: Dashboard unificado que convierte todo a tu moneda base automáticamente.
*   **Visualización Dual**: Consulta el monto original y su equivalencia de referencia (≈ $0.00).

### 🎯 Gestión de Presupuestos & Metas
*   **Límites por Categoría**: Barras de progreso con alertas visuales (80% / 100%).
*   **Notas de Contexto**: Especifica qué incluye cada límite (ej: "Servicios: Netflix, Luz").
*   **Metas con Proyección**: Algoritmo que calcula si llegarás a tiempo a tu objetivo de ahorro.

### 🎮 Gamificación & Social
*   **Logros (24)**: Sistema de medallas y niveles por uso consistente.
*   **Espacios Compartidos**: Sincronización en tiempo real para parejas o equipos mediante Supabase Realtime.

---

## 🛠️ Tech Stack Moderno

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TailwindCSS, Framer Motion, Recharts, Chart.js |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, RLS) |
| **Infraestructura** | Netlify (Hosting + Serverless Functions para IA) |
| **Utilidades** | Decimal.js (Precisión), jsPDF, PapaParse, Lottie |

---

## 📋 Requisitos e Instalación

### 📦 Requisitos Previos
*   **Node.js** 18 o superior.
*   **npm** 9 o superior.
*   Cuenta en **Supabase** (Free Tier disponible).

### 🚀 Instalación Rápida

1.  **Clonar y Entrar**
    ```bash
    git clone https://github.com/risso-patron/budget-calculator-react.git
    cd budget-calculator-react
    ```

2.  **Instalar y Configurar**
    ```bash
    npm install
    cp .env.example .env
    # Edita .env con tus credenciales de Supabase
    ```

3.  **Lanzar**
    ```bash
    npm run dev
    ```

---

## 🙋 Soporte y Contribución

Si encuentras un error o tienes una idea brillante:
1.  Revisa los [Issues](https://github.com/risso-patron/budget-calculator-react/issues).
2.  Abre un [Pull Request](https://github.com/risso-patron/budget-calculator-react/pulls) si quieres colaborar.
3.  ¡Danos una ⭐ estrella en GitHub si el proyecto te es útil!

---

<div align="center">

**Desarrollado con ❤️ por [Jorge Luis Risso Patrón](https://github.com/risso-patron)**
*Haciendo las finanzas personales inteligentes y accesibles.*

[Volver Arriba](#-budget-rp--gestión-inteligente-de-finanzas)

</div>
