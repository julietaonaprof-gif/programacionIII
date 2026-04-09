# Ejercicios HTML Básicos — Nivel 1

Aplicación interactiva para practicar HTML básico. Escribís el código, verificás tu respuesta y tu progreso se guarda automáticamente en el navegador.

## Requisitos

- Un navegador web moderno (Chrome, Firefox, Edge, Safari).
- No se necesita instalar nada. No requiere servidor, base de datos, ni dependencias.

## Cómo ejecutarlo

### Opción 1 — Doble clic (la más simple)

1. Descargá el archivo `ejercicios.html`.
2. Hacé **doble clic** sobre el archivo.
3. Se abre en tu navegador predeterminado. Listo.

### Opción 2 — Arrastrarlo al navegador

1. Abrí tu navegador (Chrome, Firefox, etc.).
2. Arrastrá el archivo `ejercicios.html` a la ventana del navegador.

### Opción 3 — Con la extensión Live Server de VS Code

1. Abrí el archivo en **Visual Studio Code**.
2. Instalá la extensión **Live Server** (de Ritwick Dey).
3. Click derecho sobre el archivo → **"Open with Live Server"**.
4. Se abre automáticamente en el navegador con recarga en vivo.

## Cómo funciona

- Cada ejercicio tiene dos áreas de texto: una para escribir tu código y otra para ver la solución.
- El botón **Verificar** compara tu código con la respuesta esperada.
- El botón **Mostrar solución** muestra la respuesta correcta.
- El botón **Limpiar** reinicia ese ejercicio.
- La **barra de progreso** muestra cuántos ejercicios completaste.
- Tu código y progreso se guardan en **localStorage** del navegador, así que podés cerrar la página y volver después sin perder nada.
- El botón **"Reiniciar todo el progreso"** al final de la página borra todos los datos guardados.

## Estructura del archivo

Es un único archivo `.html` autocontenido con todo incluido:

```
ejercicios.html
├── HTML semántico (header, main, footer)
├── CSS (en <style> dentro del <head>)
└── JavaScript (en <script> antes del cierre de </body>)
```

No tiene dependencias externas excepto **Google Fonts** (JetBrains Mono y Space Grotesk), que se cargan por CDN. Si no hay conexión a internet, el archivo funciona igual pero con las fuentes de respaldo del sistema.

## Notas

- El progreso se guarda **por navegador**. Si abrís el archivo en Chrome y después en Firefox, son progresos separados.
- Si usás modo incógnito/privado, el progreso se pierde al cerrar la pestaña.
- Para borrar el progreso manualmente: abrí DevTools (`F12`) → Application → Local Storage → borrar la clave `html-exercises-v1`.