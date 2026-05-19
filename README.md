# GestiStock — PWA

Aplicación web progresiva (PWA) para gestión de inventario con histórico de cambios.

## Archivos del proyecto

```
gestistock/
├── index.html      ← Aplicación principal
├── styles.css      ← Estilos
├── app.js          ← Lógica de la aplicación
├── sw.js           ← Service Worker (modo offline)
├── manifest.json   ← Manifiesto PWA
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Cómo instalar en iOS (iPhone / iPad)

1. **Sube los archivos a un servidor web** con HTTPS  
   (Ejemplos gratuitos: GitHub Pages, Netlify, Vercel)

2. **Abre Safari** en tu iPhone/iPad y navega a la URL de la app.

3. Pulsa el botón **Compartir** (icono de cuadrado con flecha ↑).

4. Selecciona **"Añadir a pantalla de inicio"**.

5. Ponle el nombre que quieras y pulsa **Añadir**.

La app aparecerá como icono nativo en tu pantalla de inicio y funcionará sin conexión.

---

## Cómo publicar gratis con GitHub Pages

1. Crea un repositorio en [github.com](https://github.com).
2. Sube todos los archivos (incluyendo la carpeta `icons/`).
3. Ve a **Settings → Pages → Branch: main / root** y guarda.
4. Tu app estará en `https://TU_USUARIO.github.io/NOMBRE_REPO/`

---

## Funcionalidades

### Inventario
- Máximo 20 artículos (marca + unidades)
- Añadir / eliminar artículos
- Modificar unidades con registro automático en el histórico
- Importar desde CSV (`Marca,Unidades`)
- Exportar a CSV
- Imprimir / guardar como PDF

### Histórico
- Registro automático de cada cambio (alta, baja, modificación)
- Campos: fecha, hora, marca, unidades anteriores, unidades actuales, observaciones
- Borrar registros por rango de fechas y horas
- Imprimir histórico completo o filtrado por fechas como PDF

### Almacenamiento
- Los datos se guardan localmente en el dispositivo (`localStorage`).
- No se envían datos a ningún servidor.
- Funcionan sin conexión tras la primera carga.

---

## Formato CSV de importación

```
Marca,Unidades
"Coca-Cola",150
"Pepsi",80
"Nestea",60
```

La primera línea (cabecera) es opcional y se ignora automáticamente.
