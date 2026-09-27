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

Crea la base y aplica el esquema. Desde una terminal con `psql` disponible:

```powershell
createdb core_db
psql -d core_db -f database/schema.sql
```

También puedes abrir `database/schema.sql` con pgAdmin y ejecutarlo sobre `core_db`. La aplicación utiliza parámetros `$1...$n` en todas las consultas variables.

### Crear el administrador de demostración

En `.env`, define temporalmente:

```dotenv
ADMIN_USERNAME=admin@core.local
ADMIN_PASSWORD=elige_una_clave_segura
```

Luego ejecuta:

```powershell
npm run create:admin
```

El script crea o actualiza ese usuario con rol `administrador` y almacena únicamente su hash bcrypt. No hay contraseñas reales en el repositorio. Puedes quitar las dos variables de `.env` después de ejecutarlo.

## Ejecución local

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para ejecución sin recarga automática usa `npm start`.

## Autenticación y permisos

- `administrador`: consulta, registra y actualiza recursos.
- `usuario`: consulta la lista y el detalle; recibe HTTP 403 al intentar crear o actualizar.
- Una solicitud sin token o con token inválido recibe HTTP 401.
- `POST /api/auth/register` crea solamente cuentas con rol `usuario`; el administrador se crea con el script controlado.

El cliente envía el token como `Authorization: Bearer <token>`. El JWT contiene únicamente `id`, `role` y claims temporales estándar.

## Endpoints principales

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del servicio |
| POST | `/api/auth/register` | Público | Registrar usuario normal |
| POST | `/api/auth/login` | Público | Iniciar sesión y obtener JWT |
| GET | `/api/resources` | Ambos roles | Consultar recursos |
| GET | `/api/resources/:id` | Ambos roles | Consultar un recurso |
| POST | `/api/resources` | Administrador | Registrar recurso |
| PUT | `/api/resources/:id` | Administrador | Actualizar recurso |

Ejemplo de cuerpo para crear o actualizar:

```json
{
  "nombre": "Proyector Epson",
  "categoria": "Audiovisual",
  "estado": "Disponible",
  "ubicacion": "Sala de juntas"
}
```

## Pruebas y cobertura

```powershell
npm test
npm run test:coverage
```

Jest falla si statements, branches, functions o lines quedan por debajo de 80 %. La última ejecución verificada obtuvo 24/24 pruebas aprobadas y 99.21 %, 90.62 %, 100 % y 99.20 %, respectivamente. La evidencia se genera en `reports/unit-tests/`.

## CI/CD y entorno de prueba

`.github/workflows/ci-cd.yml` se activa en push a `main`/`develop`, pull request a `main` y manualmente. Ejecuta checkout, Node 20, `npm ci`, pruebas con cobertura, publica reportes, integra SonarCloud y, tras un push aprobado a `main`, llama al deploy hook de Render.

`render.yaml` define el servicio web y PostgreSQL de prueba. Para activarlo:

1. Sube el repositorio a GitHub.
2. En [Render](https://dashboard.render.com/) selecciona **New → Blueprint** y conecta el repositorio.
3. Aplica el Blueprint; Render creará `core-testing` y `core-testing-db`.
4. En el servicio abre **Settings → Deploy Hook → Create Deploy Hook** y copia la URL.
5. En GitHub abre **Settings → Secrets and variables → Actions → Secrets → New repository secret**.
6. Crea `RENDER_DEPLOY_HOOK_URL` con esa URL.
7. Protege el environment `testing` si deseas aprobación manual antes del despliegue.
8. Tras el primer despliegue, ejecuta `database/schema.sql` contra la base Render y crea el administrador con variables temporales o una consola segura.

Sin `RENDER_DEPLOY_HOOK_URL`, el job de despliegue falla explícitamente; por tanto no aparenta una entrega que no ocurrió.

## OWASP ZAP

El workflow `.github/workflows/owasp-zap.yml` ejecuta un full scan activo reproducible y genera HTML/JSON. Puede probar, entre otras categorías, XSS y SQL Injection; ejecútalo únicamente contra un entorno propio y autorizado. Después de tener una URL pública:

1. GitHub → **Actions → CORE OWASP ZAP Full Scan → Run workflow**.
2. Introduce la URL del entorno de prueba.
3. Descarga el artefacto `core-owasp-zap-report`.
4. Conserva los resultados en `reports/security/`.

El comando Docker alternativo está en `reports/security/README.md`. La configuración busca alertas generales de aplicación web; la API reduce riesgos XSS mediante sanitización/salida segura y SQL Injection mediante consultas parametrizadas. Esto no reemplaza el escaneo real.

## SonarCloud

El pipeline importa `reports/unit-tests/coverage/lcov.info`. Para obtener Code Smells, Technical Debt y las demás métricas reales:

1. En [SonarCloud](https://sonarcloud.io/) inicia sesión con GitHub y crea/importa el proyecto.
2. Copia la organización desde **My Account → Organizations**.
3. Copia la clave desde **Project Information**.
4. Crea un token en **My Account → Security → Generate Tokens**.
5. GitHub → **Settings → Secrets and variables → Actions → Variables → New repository variable**: crea `SONAR_ORGANIZATION`.
6. Crea también la variable `SONAR_PROJECT_KEY`.
7. GitHub → **Actions → Secrets → New repository secret**: crea `SONAR_TOKEN`.
8. Ejecuta `CORE CI/CD` y registra únicamente las métricas reales en `reports/sonar/README.md`.

## Seguridad aplicada

- Helmet y cabecera tecnológica deshabilitada.
- JSON limitado a 20 KB, validado y sanitizado.
- Queries parametrizadas, restricciones SQL y catálogo cerrado de roles/estados.
- Hash bcrypt y secretos exclusivamente por variables de entorno.
- JWT verificado con HS256 y vencimiento.
- Manejo centralizado sin stack traces para el cliente.
- Auditoría de dependencias de producción verificada: 0 vulnerabilidades conocidas al 27-09-2026.

## Estructura y reportes

```text
src/                 API, controladores, middleware y configuración
public/              interfaz web responsive
database/schema.sql  esquema PostgreSQL
tests/               pruebas Jest/Supertest
scripts/             creación segura del administrador
.github/workflows/   CI/CD, SonarCloud y OWASP ZAP
reports/unit-tests/  JUnit y cobertura real
reports/security/    evidencia ZAP o estado pendiente documentado
reports/sonar/       métricas reales o estado pendiente documentado
docs/                informe académico de cierre
```

## Preparar el ZIP académico

El ZIP final debe excluir `.env`, `node_modules`, cachés y credenciales. Incluye el repositorio, reportes generados e `INFORME_CIERRE_CORE.md`. Revisa siempre `git status` y el contenido del ZIP antes de entregarlo.
