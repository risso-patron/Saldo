# 03 - Principios del Producto

Estos principios no son recomendaciones.
Son reglas de diseño de producto para cada pantalla, flujo y mensaje de Saldo.

## 1) Nunca hacer pensar al usuario
Si Rosa duda, el diseño todavía no está listo.
Cada decisión importante debe ser evidente al primer vistazo.

## 2) Una pantalla = una acción principal
Cada vista debe dejar claro cuál es el próximo paso.
Se puede ofrecer contexto, pero no competir con múltiples llamadas principales.

Excepción documentada (revisión de consistencia global, 2026-07-12): el Paso A del onboarding (cap 06) usa dos
botones de igual peso visual —continuar y saltear—. No son dos acciones principales compitiendo: son dos caminos al
mismo resultado funcional (avanzar en el recorrido), y despriorizar visualmente "saltear" reintroduciría la ansiedad
que cap 01 existe para evitar. Ver 00-STATE.md, Contradicciones resueltas. No usar este caso como precedente general
para otras pantallas sin una justificación equivalente (dos caminos al mismo resultado, no dos resultados distintos).

## 3) Todo número responde una pregunta
Un dato sin pregunta es ruido.
Si mostramos un valor, debe responder algo concreto como:
- cuánto entró
- cuánto salió
- cuánto queda hoy
- cómo te está yendo con tus clientes

## 4) No mostrar información sin valor todavía
Si el dato no ayuda a decidir hoy, no se muestra.
Evitamos pantallas llenas por “completitud visual”.

## 5) Si hace falta tutorial, el diseño falló
La experiencia debe poder usarse en la primera sesión sin entrenamiento.
Ayudas breves pueden existir, pero no pueden ser requisito para operar.

## 6) Toda pantalla explica por qué existe
Cada vista debe responder dos preguntas al instante:
- qué me permite resolver ahora
- por qué esto me ayuda a bajar ansiedad

## 7) La IA nunca es protagonista
La IA acompaña, sugiere y traduce.
No se impone, no complica, no habla en difícil.
Siempre está al servicio de la decisión humana.

## 8) Lenguaje humano por encima de naming técnico
Las necesidades funcionales se mantienen.
El vocabulario técnico no.

Ejemplo crítico:
Luis sí necesita ver patrones por cliente/origen.
Lo que no se permite es nombrarlo con términos técnicos en la UI.

## 9) Registro histórico + señales anticipatorias
Mirar el pasado no alcanza para decisiones cotidianas.
Ana necesita señales tempranas para detectar semanas difíciles.
José necesita señales tempranas para detectar semanas flojas de ventas o caja diaria en su negocio pequeño.
Esta regla debe reflejarse en capítulos 15 y 16 para ambos casos, no solo para Ana.

## 10) Consistencia entre emoción y operación
No alcanza con que algo “funcione”.
También debe sentirse claro, ligero y seguro.
Si la interfaz genera presión, contradice la misión de Saldo.

## Aplicación concreta a Saldo
- Inicio: tres cifras centrales siempre visibles y entendibles en segundos
- Movimientos: carga rápida, edición simple, sin fricción innecesaria
- Vista de Luis: lectura por cliente/origen en lenguaje simple
- Vista de Ana: señales anticipatorias claras cuando se aproxima una semana difícil
- Todo mensaje del sistema: breve, directo y sin jerga
