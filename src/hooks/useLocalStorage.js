import { useState, useEffect } from 'react';
import { saveToStorage, loadFromStorage } from '../core/storageEngine';

/**
 * Custom hook para manejar localStorage de manera reactiva
 * @param {string} key - Clave de localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[any, Function]} - [storedValue, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // Estado para almacenar el valor
  // Pasamos una función de inicialización a useState para que solo se ejecute una vez
  const [storedValue, setStoredValue] = useState(() => {
    // Carga segura centralizada
    return loadFromStorage(key, initialValue);
  });

  // Función para actualizar el estado y localStorage
  const setValue = (value) => {
    try {
      // Permitir que value sea una función (como en useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar estado en memoria React
      setStoredValue(valueToStore);
      
      // Guardar en Storage Motorizado
      saveToStorage(key, valueToStore);
    } catch (error) {
      console.error(`Error de lógica al guardar la key "${key}":`, error);
    }
  };

  const refresh = () => {
    setStoredValue(loadFromStorage(key, initialValue));
  };

  // Sincronizar con cambios en otras pestañas/ventanas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error al sincronizar localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, refresh];
};
