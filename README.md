# 🚚 Sistema de Gestión de Repartos & Logística de Comercio
> **Yogur Griego Junín - Logística 2027**

Aplicación web completa para la administración de entregas a domicilio, control de repartidores, catálogo de productos del comercio, seguimiento de pedidos de clientes y visualización de rutas con mapas interactivos de Google Maps y Leaflet.

---

## 🌟 Características Principales

1. **Panel de Administrador:**
   - **Gestión de Repartidores (ABM):** Alta, modificación, eliminación y cambio de contraseñas de repartidores.
   - **Gestión de Pedidos:** Creación de nuevos pedidos de clientes, asignación de repartidores y actualización de estado (Pendiente, En Camino, Entregado, Cancelado).
   - **Catálogo de Ítems / Productos:** Creación, edición y eliminación de productos del comercio con precio y stock.
   - **Visualizador en Mapa en Vivo:** Marcadores en mapa interactivo para el local base, repartidores en movimiento y puntos de entrega.

2. **Portal de Repartidores (Móvil & Desktop):**
   - Acceso con contraseña por repartidor.
   - Hoja de ruta digital con detalles de cliente, dirección, items del pedido y notas de entrega.
   - Botón directo para **abrir la ruta en Google Maps GPS**.
   - Cambio de estado a *"En Camino"* y *"Entregado"*.

3. **Rastreo de Pedidos para Clientes:**
   - Consulta el estado de la entrega en tiempo real mediante el número de pedido o teléfono.
   - Línea de tiempo visual del avance de la entrega y ubicación del repartidor en el mapa.

4. **🔒 Seguridad Estricta de Contraseñas:**
   - **Procesamiento Cryptográfico SHA-256:** Todas las contraseñas (Admin y Repartidores) son haseadas utilizando la API `crypto.subtle` nativa del navegador con salt.
   - **Sin Texto Plano:** Ninguna contraseña se almacena ni se muestra en la web o en `localStorage`. Los inputs utilizan siempre el tipo `password`.

---

## 🔑 Credenciales por Defecto (Demo)

| Rol | Usuario / Perfil | Contraseña Demo |
|---|---|---|
| **Administrador** | Panel Admin | `admin123` |
| **Repartidor 1** | Carlos Gómez | `reparto123` |
| **Repartidor 2** | Lucas Rodríguez | `reparto123` |

> *Nota: Desde el panel de administración puedes modificar estas contraseñas en cualquier momento de forma segura.*

---

## 🚀 Instalación y Ejecución Local

1. Instalar las dependencias de Node.js:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir el navegador en `http://localhost:3000`.

---

## 🐙 Guía para Incluir el Proyecto en tu GitHub

Si ya estás registrado en GitHub, sigue estos sencillos pasos para vincular este código y subirlo a tu cuenta:

1. **Crear un nuevo repositorio en GitHub:**
   - Ve a [GitHub.com](https://github.com/new).
   - Ponle un nombre a tu repositorio (por ejemplo: `logistica-repartos-junin`).
   - Deja desmarcada la opción de inicializar con README (ya tenemos uno preparado).
   - Haz clic en **Create repository**.

2. **Conectar y subir el repositorio local desde tu terminal:**
   ```bash
   # 1. Agregar todos los archivos al control de versiones
   git add .

   # 2. Realizar el primer commit
   git commit -m "feat: Sistema de gestión de repartos y logística"

   # 3. Asegurar la rama principal 'main'
   git branch -M main

   # 4. Vincular con tu repositorio de GitHub (reemplaza TU_USUARIO y TU_REPOSITORIO)
   git remote add origin https://github.com/TU_USUARIO/logistica-repartos-junin.git

   # 5. Subir todo el código a GitHub
   git push -u origin main
   ```

---

## 🛠️ Tecnologías Utilizadas

- **Core:** React 18 + Vite
- **Estilos:** CSS3 Vanilla con diseño en modo oscuro, variables CSS y Glassmorphism
- **Iconos:** Lucide React
- **Mapas:** Leaflet / OpenStreetMap / Google Maps integration
- **Seguridad:** Web Crypto API (SHA-256)
