# 🚀 Guía de Deployment en Netlify

## 📋 Pre-requisitos

- ✅ Cuenta en [Netlify](https://netlify.com)
- ✅ Repositorio en GitHub con el código
- ✅ Credenciales de Supabase listas

---

## 🎯 OPCIÓN 1: Deploy Manual (Drag & Drop)

### Paso 1: Build Local
```bash
npm run build
```

### Paso 2: Subir a Netlify
1. Ve a https://app.netlify.com/drop
2. Arrastra la carpeta `dist/` a la zona de upload
3. ¡Listo! Tu app está en línea

**Pros:** Rápido para pruebas
**Contras:** No hay CI/CD, debes rebuild manual

---

## 🔄 OPCIÓN 2: Deploy Automático desde GitHub (Recomendado)

### Paso 1: Conectar Repositorio

1. **Login en Netlify**
   - Ve a https://app.netlify.com
   - Click en "Add new site" → "Import an existing project"

2. **Conectar GitHub**
   - Selecciona "GitHub"
   - Autoriza Netlify en GitHub
   - Selecciona tu repositorio `budget-calculator-react`

### Paso 2: Configurar Build Settings

```yaml
Base directory: (dejar vacío)
Build command: npm run build
Publish directory: dist
```

### Paso 3: Configurar Variables de Entorno

En Netlify Dashboard:

1. Ve a **Site settings** → **Environment variables**
2. Click "Add a variable"
3. Agrega estas variables:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
VITE_APP_URL=https://tu-app.netlify.app
VITE_ENABLE_AI=false
VITE_ENABLE_PWA=true
VITE_ENABLE_GAMIFICATION=true
```

### Paso 4: Deploy

1. Click "Deploy site"
2. Espera 1-2 minutos
3. Tu app estará en: `https://random-name-12345.netlify.app`

### Paso 5: Configurar Dominio Personalizado (Opcional)

1. **Opción A: Dominio de Netlify**
   - Site settings → Domain management
   - Click "Options" → "Edit site name"
   - Cambia de `random-name-12345` a `budget-calculator`
   - URL final: `https://budget-calculator.netlify.app`

2. **Opción B: Dominio Propio**
   - Site settings → Domain management
   - Click "Add domain alias"
   - Ingresa tu dominio: `tudominio.com`
   - Sigue instrucciones para configurar DNS

---

## 🔒 Configuración de Seguridad

### Headers de Seguridad (netlify.toml)

El archivo `netlify.toml` ya está configurado con:
- ✅ X-Frame-Options
- ✅ Content-Security-Policy
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy

### HTTPS

- ✅ Automático con Netlify
- ✅ Certificado SSL gratuito de Let's Encrypt
- ✅ Renovación automática

---

## 🔄 Deploy Automático (CI/CD)

### Configuración ya incluida:

1. **Trigger automático**
   - Cada push a `main` dispara build
   - GitHub Actions ejecuta el workflow
   - Deploy automático si build exitoso

2. **Preview Deploys**
   - Cada Pull Request genera preview
   - URL temporal: `https://deploy-preview-X--budget-calculator.netlify.app`
   - Perfecto para testing antes de mergear

3. **Branch Deploys**
   - Puedes configurar deploys para otras branches
   - Site settings → Build & deploy → Branch deploys

---

## 📊 Monitoreo y Analytics

### Netlify Analytics (Opcional - Pago)

1. Site settings → Analytics
2. Enable analytics
3. Métricas server-side sin JavaScript

### Google Analytics (Gratis)

1. Obtén tracking ID de Google Analytics
2. Agrega variable de entorno:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Implementa GA en tu código (ver guía Analytics)

---

## 🐛 Troubleshooting

### Build falla

**Error: Missing environment variables**
```bash
Solution:
1. Ve a Site settings → Environment variables
2. Verifica que todas las variables VITE_* estén configuradas
3. Redeploy
```

**Error: Command failed with exit code 1**
```bash
Solution:
1. Revisa Build log completo en Netlify
2. Ejecuta npm run build localmente
3. Verifica errores en el código
4. Commit fix y push
```

### App no carga

**Error: Page not found (404)**
```bash
Solution:
El archivo netlify.toml ya tiene la regla de redirect:
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

Verifica que netlify.toml esté en la raíz del proyecto.
```

**Error: Supabase not connecting**
```bash
Solution:
1. Verifica variables de entorno en Netlify
2. Check Supabase dashboard → API settings
3. Verifica CORS en Supabase (debe permitir tu dominio Netlify)
```

### Performance Issues

**Slow loading**
```bash
Solution:
1. Analiza bundle: npm run build:analyze
2. Verifica que code splitting está activo
3. Optimiza imágenes grandes
4. Habilita Netlify Image CDN (opcional)
```

---

## 📝 Comandos Útiles Netlify CLI

### Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### Login
```bash
netlify login
```

### Deploy manual desde CLI
```bash
netlify deploy --prod
```

### Ver logs
```bash
netlify logs
```

### Abrir dashboard
```bash
netlify open
```

---

## 🎯 Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] netlify.toml en la raíz del proyecto
- [ ] Build exitoso localmente
- [ ] Domain configurado
- [ ] HTTPS activo
- [ ] Headers de seguridad verificados
- [ ] Performance > 90 en Lighthouse
- [ ] Analytics configurado (opcional)
- [ ] Error tracking configurado (opcional)

---

## 🔗 Enlaces Útiles

- [Netlify Dashboard](https://app.netlify.com)
- [Netlify Docs](https://docs.netlify.com)
- [Netlify Support](https://answers.netlify.com)
- [Status Page](https://www.netlifystatus.com)

---

## 💡 Tips Pro

1. **Preview Deploys son tu amigo**
   - Testea antes de mergear
   - Comparte links con el equipo
   - Feedback rápido

2. **Deploy Notifications**
   - Slack integration para notificaciones
   - Email en deploys fallidos
   - GitHub commit status checks

3. **Rollback rápido**
   - Deploys → Find deploy → Publish
   - Un click para volver a versión anterior

4. **Split Testing**
   - A/B testing nativo
   - Traffic splitting entre branches

---

**Última actualización:** Noviembre 2025
