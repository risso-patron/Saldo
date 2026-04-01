/**
 * storageEngine.js
 * Fase UX 1: Motor centralizado para persistencia de datos (Local Storage).
 * 
 * Este módulo abstrae el manejo de persistencia local, asegurando:
 * 1. Control de errores ante límites de cuota (QuotaExceededError).
 * 2. Prevención contra corrupción de JSON (`JSON.parse` safe).
 * 3. Fallback seguro si LocalStorage está deshabilitado.
 */

const APP_PREFIX = '@budgetRP_v1:';

/**
 * Guarda cualquier estructura de datos en el localStorage de manera segura.
 * 
 * @param {string} key - Identificador de la clave (se le agregará el prefijo interno).
 * @param {any} data - La información a guardar (objetos, arrays, strings, etc).
 * @returns {boolean} - true si se guardó correctamente, false en caso de error.
 */
export function saveToStorage(key, data) {
  try {
    if (typeof window === 'undefined') return false; // Prevención en entornos SSR

    const serializedData = JSON.stringify(data);
    const storageKey = `${APP_PREFIX}${key}`;
    
    window.localStorage.setItem(storageKey, serializedData);
    
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ localStorage está lleno. Intenta borrar datos de caché de tu navegador.');
    } else {
      console.error(`❌ Error al intentar guardar la llave [${key}] en storage:`, error);
    }
    return false;
  }
}

/**
 * Recupera y parsea automáticamente una llave del localStorage.
 * 
 * @param {string} key - El identificador de la llave.
 * @param {any} defaultFallback - [Opcional] Valor de retorno si la llave no existe o si falla el parseo.
 * @returns {any} - Los datos recuperados (parseados) o el fallback/null.
 */
export function loadFromStorage(key, defaultFallback = null) {
  try {
    if (typeof window === 'undefined') return defaultFallback;

    const storageKey = `${APP_PREFIX}${key}`;
    const serializedData = window.localStorage.getItem(storageKey);

    if (serializedData === null) {
      return defaultFallback;
    }

    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`❌ Error al intentar leer la llave [${key}] en storage (JSON corrupto):`, error);
    // En caso de que el JSON alojado esté roto, es preferible devolver el estado "limpio" o "default"
    // para no crashear la UI de React.
    return defaultFallback;
  }
}

/**
 * Utilidad extra: Borrar el almacenamiento completo vinculado solo a esta App.
 */
export function clearStorageEngine() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(k => window.localStorage.removeItem(k));
    console.log('🧹 Storage Engine: Datos borrados con éxito.');
  } catch (e) {
    console.error('Error limpiando el storage:', e);
  }
}
