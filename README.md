# CORE

CORE es un sistema web monolítico para registrar, consultar y controlar recursos de una organización: laptops, computadoras, proyectores, mobiliario y otros equipos. Administra exclusivamente los estados **Disponible**, **Asignado**, **Mantenimiento** y **Baja**. No es un sistema de donaciones.

La aplicación combina una API Node.js/Express, una interfaz HTML/CSS/JavaScript y PostgreSQL. Usa JWT para autenticación, bcryptjs para contraseñas, Jest/Supertest para pruebas, GitHub Actions para CI/CD, SonarCloud para calidad y OWASP ZAP para análisis dinámico.

## Requisitos

- Node.js 20 o superior y npm.
- PostgreSQL 14 o superior.
- Git y Visual Studio Code recomendados.
- Docker solamente para ejecutar OWASP ZAP localmente (opcional).

## Abrir y ejecutar en Visual Studio Code

1. Abre VS Code y selecciona **File → Open Folder**; elige la carpeta `CORE`.
2. Abre **Terminal → New Terminal**.
3. Instala dependencias:

```powershell
npm install
```

4. Crea tu configuración local sin publicar secretos:

```powershell
Copy-Item .env.example .env
```

5. Edita `.env`. Usa un `JWT_SECRET` aleatorio con al menos 32 caracteres y ajusta `DATABASE_URL`.

## PostgreSQL

Esta es la parte que conecta CORE con la base de datos. Sigue los pasos en orden. No necesitas saber usar SQL ni `psql`: el proyecto incluye un comando que crea las tablas automáticamente.

### Paso 1. Comprobar si PostgreSQL ya está instalado

1. Presiona la tecla de Windows.
2. Escribe `pgAdmin 4`.
3. Si aparece, ábrelo y continúa con el **Paso 3**.
4. Si no aparece, instala PostgreSQL siguiendo el paso siguiente.

También puedes comprobarlo desde la terminal de VS Code:

```powershell
psql --version
```

Si PowerShell dice que `psql` no se reconoce, no pasa nada. Puedes trabajar con pgAdmin y con los comandos de este proyecto.

### Paso 2. Instalar PostgreSQL en Windows si todavía no lo tienes

1. Abre la [página oficial de PostgreSQL para Windows](https://www.postgresql.org/download/windows/).
2. Entra al enlace **Download the installer**.
3. Descarga una versión actual de PostgreSQL para Windows de 64 bits.
4. Ejecuta el instalador.
5. Deja seleccionados estos componentes:
   - PostgreSQL Server.
   - pgAdmin 4.
   - Command Line Tools.
6. Cuando solicite una contraseña para el usuario `postgres`, escribe una que recuerdes. Para una demostración local rápida conviene usar letras y números; no reutilices una contraseña personal.
7. Conserva el puerto predeterminado `5432`.
8. Termina la instalación. Si aparece Stack Builder al final, puedes cerrarlo porque CORE no necesita complementos adicionales.
9. Guarda la contraseña de `postgres`: se utilizará solamente en tu archivo local `.env`.

### Paso 3. Crear la base de datos `core_db` con pgAdmin

1. Abre **pgAdmin 4**.
2. En el panel izquierdo despliega **Servers**.
3. Despliega el servidor que normalmente se llama **PostgreSQL** seguido del número de versión.
4. Si pide contraseña, escribe la contraseña que elegiste durante la instalación.
5. Haz clic derecho en **Databases**.
6. Selecciona **Create → Database…**.
7. En **Database** escribe exactamente:

```text
core_db
```

8. En **Owner** deja `postgres`.
9. Presiona **Save**.

Cuando termines, `core_db` debe aparecer debajo de **Databases**.

### Paso 4. Crear el archivo `.env` en VS Code

El archivo `.env` contiene la conexión local y los secretos. Git lo ignora automáticamente, por lo que no se sube al repositorio.

1. Regresa a VS Code.
2. Confirma que abriste esta carpeta del proyecto:

```text
C:\Users\gabic\Documents\Codex\2026-09-27\usa
```

3. Abre **Terminal → New Terminal**.
4. Ejecuta:

```powershell
Copy-Item .env.example .env
```

5. En el explorador de archivos de VS Code abre `.env`.
6. Cambia su contenido para que se parezca a esto:

```dotenv
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:TU_CONTRASENA_POSTGRES@localhost:5432/core_db
DATABASE_SSL=false
JWT_SECRET=PEGA_AQUI_UN_TEXTO_ALEATORIO_LARGO
JWT_EXPIRES_IN=2h
BCRYPT_ROUNDS=12
ADMIN_USERNAME=admin@core.local
ADMIN_PASSWORD=ELIGE_UNA_CONTRASENA_PARA_EL_ADMIN
```

7. Sustituye `TU_CONTRASENA_POSTGRES` por la contraseña del Paso 2.
8. Sustituye `ELIGE_UNA_CONTRASENA_PARA_EL_ADMIN` por una contraseña de al menos 8 caracteres que utilizarás para iniciar sesión en CORE.
9. Para crear un `JWT_SECRET` seguro, ejecuta lo siguiente en la terminal:

```powershell
[Convert]::ToBase64String([byte[]](1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

10. Copia el texto que aparezca y úsalo como valor de `JWT_SECRET`.
11. Guarda `.env` con `Ctrl + S`.

Importante: no compartas `.env`, no lo agregues al ZIP y no publiques sus contraseñas en GitHub.

### Paso 5. Crear las tablas de CORE automáticamente

En la terminal de VS Code ejecuta:

```powershell
npm run db:init
```

El resultado correcto debe decir:

```text
Base de datos CORE inicializada correctamente.
Tablas disponibles: users y resources.
```

El comando lee `database/schema.sql` y crea las tablas `users` y `resources`. Puedes ejecutarlo otra vez sin borrar la información existente.

Si quieres verificarlo en pgAdmin:

1. Abre `Databases → core_db → Schemas → public → Tables`.
2. Haz clic derecho en **Tables** y elige **Refresh**.
3. Deben aparecer `users` y `resources`.

### Paso 6. Crear el administrador de demostración

Confirma que `.env` contiene `ADMIN_USERNAME` y `ADMIN_PASSWORD`. Después ejecuta:

```powershell
npm run create:admin
```

El resultado correcto debe parecerse a:

```text
Administrador creado/actualizado: admin@core.local
```

La contraseña no se guarda como texto legible: se almacena como un hash bcrypt.

### Paso 7. Encender CORE y abrirlo en el navegador

Ejecuta:

```powershell
npm run dev
```

No cierres esa terminal mientras estés usando CORE. Cuando aparezca el mensaje de que CORE está disponible:

1. Abre Chrome, Edge o Firefox.
2. Entra a [http://localhost:3000](http://localhost:3000).
3. Inicia sesión con:
   - Correo: el valor de `ADMIN_USERNAME`.
   - Contraseña: el valor de `ADMIN_PASSWORD`.
4. Presiona **Registrar recurso**.
5. Crea un recurso de prueba, por ejemplo:
   - Nombre: `Laptop Dell`.
   - Categoría: `Computadoras`.
   - Estado: `Disponible`.
   - Ubicación: `Oficina central`.
6. Guarda el recurso y comprueba que aparezca en la tabla y en el resumen del dashboard.

Para apagar el servidor, regresa a la terminal y presiona `Ctrl + C`.

### Problemas comunes con PostgreSQL

**Aparece `password authentication failed`:** la contraseña incluida en `DATABASE_URL` no coincide con la contraseña del usuario `postgres`. Corrige `.env`, guarda y vuelve a ejecutar `npm run db:init`.

**Aparece `database core_db does not exist`:** todavía no creaste `core_db` en pgAdmin o escribiste otro nombre.

**Aparece `ECONNREFUSED` o conexión rechazada:** PostgreSQL no está encendido o utiliza otro puerto. Reinicia Windows y confirma en pgAdmin que el servidor puede abrirse. El puerto habitual es `5432`.

**La contraseña tiene `@`, `#`, `/` o espacios:** esos símbolos tienen significado especial en una URL. Para terminar rápido, cambia la contraseña local de PostgreSQL por una combinación segura de letras y números, o codifica los símbolos antes de colocarlos en `DATABASE_URL`.

**El puerto 3000 está ocupado:** cambia `PORT=3000` por `PORT=3001` en `.env` y abre `http://localhost:3001`.

## Crear un usuario normal para demostrar los permisos

El administrador puede registrar y editar. El usuario normal solo puede consultar. Con CORE encendido, abre una segunda terminal en VS Code con el botón `+` del panel de terminal y pega:

```powershell
$datos = @{ username = 'usuario@core.local'; password = 'UsuarioCore2026!' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method Post -ContentType 'application/json' -Body $datos
```

Después:

1. Cierra la sesión del administrador.
2. Entra con `usuario@core.local` y `UsuarioCore2026!`.
3. Verifica que puede consultar recursos.
4. Verifica que no aparece el botón para registrar recursos.

La contraseña del ejemplo es solo para una demostración local. No la uses en un sistema real.

## Autenticación, permisos y endpoints

- `administrador`: consulta, registra y actualiza recursos.
- `usuario`: consulta la lista y el detalle.
- HTTP 401 significa que falta el token o que el token no es válido.
- HTTP 403 significa que el usuario inició sesión, pero su rol no permite esa acción.

Estas son las rutas que puede revisar el profesor:

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servicio |
| POST | `/api/auth/register` | Público | Registrar usuario normal |
| POST | `/api/auth/login` | Público | Iniciar sesión y obtener JWT |
| GET | `/api/resources` | Ambos roles | Consultar recursos |
| GET | `/api/resources/:id` | Ambos roles | Consultar un recurso |
| POST | `/api/resources` | Administrador | Registrar recurso |
| PUT | `/api/resources/:id` | Administrador | Actualizar recurso |

## Ejecutar las pruebas y abrir la cobertura

No necesitas tener CORE encendido ni PostgreSQL abierto para estas pruebas.

1. Abre una terminal nueva en VS Code.
2. Ejecuta:

```powershell
npm run test:coverage
```

3. Espera a que aparezca `Tests: 24 passed, 24 total`.
4. Confirma que statements, branches, functions y lines están por encima de 80 %.
5. Para abrir el reporte visual, en VS Code busca este archivo y ábrelo en el navegador:

```text
reports/unit-tests/coverage/index.html
```

La ejecución verificada del proyecto obtuvo:

| Métrica | Resultado |
|---|---:|
| Pruebas | 24/24 aprobadas |
| Statements | 99.21 % |
| Branches | 90.62 % |
| Functions | 100 % |
| Lines | 99.20 % |

## Subir CORE a GitHub

Haz esto después de confirmar que CORE funciona localmente.

### Paso 1. Crear el repositorio en GitHub

1. Entra a [GitHub](https://github.com/) e inicia sesión.
2. Presiona el botón **New repository**.
3. Escribe un nombre como `CORE`.
4. Elige público o privado según las indicaciones del profesor.
5. No marques las opciones para crear README, `.gitignore` o licencia, porque el proyecto ya los tiene.
6. Presiona **Create repository**.
7. Copia la dirección HTTPS que GitHub muestra, parecida a `https://github.com/tu-usuario/CORE.git`.

### Paso 2. Conectar la carpeta local

En la terminal de VS Code ejecuta primero:

```powershell
git remote -v
```

Si no aparece nada, ejecuta lo siguiente cambiando la URL por la tuya:

```powershell
git remote add origin https://github.com/tu-usuario/CORE.git
```

Después guarda los cambios nuevos del README y del inicializador:

```powershell
git add .
git commit -m "Mejorar instrucciones de instalacion"
git push -u origin main
```

Si GitHub solicita iniciar sesión, acepta la ventana del navegador. Nunca escribas tu contraseña de GitHub dentro de un archivo del proyecto.

### Paso 3. Comprobar CI

1. Abre el repositorio en GitHub.
2. Entra a la pestaña **Actions**.
3. Abre **CORE CI/CD**.
4. El job de pruebas debe ejecutarse automáticamente con cada `push`.
5. Un círculo amarillo significa que sigue trabajando; una paloma verde significa que terminó bien; una X roja significa que algún paso falló.

Al principio puede fallar solamente el despliegue porque aún no existe `RENDER_DEPLOY_HOOK_URL`. Eso se resuelve en la siguiente sección.

## Publicar el entorno de prueba en Render

Render alojará temporalmente la aplicación y PostgreSQL. La disponibilidad y el precio de los planes dependen de tu cuenta; revisa lo que Render muestra antes de confirmar cualquier servicio de pago.

### Paso 1. Crear los servicios

1. Entra a [Render Dashboard](https://dashboard.render.com/) y accede con GitHub.
2. Autoriza a Render para leer el repositorio `CORE`.
3. Presiona **New → Blueprint**.
4. Selecciona el repositorio `CORE`.
5. Render detectará `render.yaml`.
6. Revisa los nombres `core-testing` y `core-testing-db`.
7. Presiona **Apply** o **Deploy Blueprint**.
8. Espera a que se creen el servicio web y la base PostgreSQL.

### Paso 2. Inicializar la base de Render

1. Abre el servicio web `core-testing` en Render.
2. Abre su pestaña **Shell**.
3. Ejecuta:

```text
npm run db:init
```

4. En **Environment**, agrega temporalmente:
   - `ADMIN_USERNAME` con el correo del administrador.
   - `ADMIN_PASSWORD` con una contraseña segura.
5. Guarda los cambios y espera el redeploy.
6. Regresa a **Shell** y ejecuta:

```text
npm run create:admin
```

7. Abre la URL pública que Render asignó y comprueba el login.

Si tu plan no incluye Shell, abre la base `core-testing-db`, copia su **External Database URL**, colócala temporalmente como `DATABASE_URL` en tu `.env` local, cambia `DATABASE_SSL=true` y ejecuta `npm run db:init` y `npm run create:admin` desde VS Code. Después restaura la conexión local de tu `.env`.

### Paso 3. Activar el despliegue desde GitHub Actions

1. En Render abre `core-testing → Settings`.
2. Busca **Deploy Hook** y créalo si todavía no existe.
3. Copia la URL completa del hook. Trátala como contraseña.
4. En GitHub abre el repositorio.
5. Entra a **Settings → Secrets and variables → Actions**.
6. Abre la pestaña **Secrets**.
7. Presiona **New repository secret**.
8. En **Name** escribe exactamente `RENDER_DEPLOY_HOOK_URL`.
9. En **Secret** pega la URL de Render.
10. Guarda el secreto.
11. Haz un nuevo `push` o ejecuta manualmente **Actions → CORE CI/CD → Run workflow**.

Después de que el workflow esté verde, toma una captura de GitHub Actions y otra de CORE funcionando en la URL pública.

## Ejecutar OWASP ZAP desde GitHub

Haz este paso únicamente cuando la URL pública de Render funcione. El análisis es activo y solo debe dirigirse a tu propio entorno de prueba.

1. En GitHub abre **Actions**.
2. En la lista izquierda selecciona **CORE OWASP ZAP Full Scan**.
3. Presiona **Run workflow**.
4. En `target_url` pega la URL pública completa de Render, por ejemplo `https://core-testing.onrender.com`.
5. Presiona el botón verde **Run workflow**.
6. Espera a que finalice. El full scan puede tardar varios minutos.
7. Abre la ejecución terminada.
8. Baja hasta **Artifacts**.
9. Descarga `core-owasp-zap-report`.
10. Descomprime el archivo descargado.
11. Copia `owasp-zap-report.html` y `owasp-zap-report.json` a:

```text
reports/security/
```

12. Abre el HTML y registra únicamente los hallazgos que realmente aparezcan. No cambies un hallazgo para que el resultado se vea mejor.

## Ejecutar SonarCloud

SonarCloud necesita tres valores externos. Dos son variables visibles y uno es un secreto.

### Paso 1. Importar el proyecto

1. Entra a [SonarQube Cloud](https://sonarcloud.io/) con GitHub.
2. Autoriza el acceso a tu repositorio.
3. Selecciona **Analyze new project** o **Import project**.
4. Elige el repositorio `CORE`.
5. Selecciona análisis mediante **GitHub Actions/CI**.
6. Si aparece **Automatic Analysis**, desactívalo para no ejecutar dos métodos de análisis al mismo tiempo.

### Paso 2. Encontrar los tres valores

1. `SONAR_ORGANIZATION`: es la clave de tu organización mostrada en SonarQube Cloud.
2. `SONAR_PROJECT_KEY`: aparece en la información o configuración del proyecto.
3. `SONAR_TOKEN`: créalo en el menú de tu cuenta, sección **Security/Tokens**. Copia el token cuando se muestre, porque después puede quedar oculto.

### Paso 3. Guardarlos en GitHub

En GitHub abre **Settings → Secrets and variables → Actions**.

En la pestaña **Variables** crea:

- `SONAR_ORGANIZATION` con la clave de la organización.
- `SONAR_PROJECT_KEY` con la clave del proyecto.

En la pestaña **Secrets** crea:

- `SONAR_TOKEN` con el token privado.

### Paso 4. Ejecutar y guardar las métricas

1. Abre **Actions → CORE CI/CD**.
2. Presiona **Run workflow**.
3. Espera a que `sonarcloud` termine correctamente.
4. Regresa a SonarQube Cloud y abre el proyecto CORE.
5. Copia los valores reales de Code Smells, Technical Debt, Bugs, Vulnerabilities, Security Hotspots, Coverage y Duplications.
6. Escríbelos en `reports/sonar/README.md` sustituyendo la palabra `Pendiente`.
7. Toma una captura del panel como evidencia adicional.

## Seguridad aplicada en el código

- Helmet agrega cabeceras de seguridad.
- El tamaño del JSON está limitado a 20 KB.
- Las entradas se validan y sanitizan.
- PostgreSQL recibe parámetros separados mediante `$1`, `$2`, etc., reduciendo SQL Injection.
- bcryptjs protege las contraseñas.
- JWT tiene vencimiento y contiene solamente ID y rol.
- Los errores internos no muestran stack traces al navegador.
- `.env` está excluido por `.gitignore`.
- La auditoría de dependencias de producción reportó 0 vulnerabilidades conocidas el 27-09-2026.

## Orden recomendado para terminar rápido

Marca cada casilla conforme avances:

- [ ] Instalar o abrir PostgreSQL y pgAdmin.
- [ ] Crear `core_db`.
- [ ] Crear y completar `.env`.
- [ ] Ejecutar `npm run db:init`.
- [ ] Ejecutar `npm run create:admin`.
- [ ] Ejecutar `npm run dev` y probar el login.
- [ ] Registrar y editar un recurso.
- [ ] Ejecutar `npm run test:coverage`.
- [ ] Subir a GitHub y comprobar el job de pruebas.
- [ ] Crear Render y comprobar la URL pública.
- [ ] Agregar `RENDER_DEPLOY_HOOK_URL`.
- [ ] Ejecutar SonarCloud y registrar métricas reales.
- [ ] Ejecutar OWASP ZAP y guardar sus reportes reales.
- [ ] Actualizar el ZIP final después de incorporar las evidencias.

## Estructura y evidencias

```text
src/                 API, controladores, middleware y configuración
public/              interfaz web responsive
database/schema.sql  esquema PostgreSQL
tests/               pruebas Jest/Supertest
scripts/             inicialización DB y creación del administrador
.github/workflows/   CI/CD, SonarCloud y OWASP ZAP
reports/unit-tests/  JUnit y cobertura real
reports/security/    reporte real de OWASP ZAP
reports/sonar/       métricas reales de SonarCloud
docs/                informe académico de cierre
```

## Preparar nuevamente el ZIP académico

El ZIP final debe excluir `.env`, `node_modules`, cachés y credenciales. Antes de entregarlo:

1. Confirma que las evidencias reales de ZAP y Sonar estén en `reports/`.
2. Confirma que `.env` no esté dentro de la carpeta de entrega.
3. Incluye el repositorio completo y `INFORME_CIERRE_CORE.md`.
4. Abre el ZIP una vez para comprobar que no esté vacío o dañado.
5. Conserva una copia de respaldo antes de subirlo a la plataforma del profesor.
