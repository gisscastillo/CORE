# Resultados SonarQube / SonarCloud

Estado: **CONFIGURADO; ANÁLISIS PENDIENTE DE AUTENTICACIÓN EXTERNA**.

La integración y la importación de cobertura están configuradas, pero no se inventan métricas. El workflow `CORE CI/CD` terminó correctamente para la versión `37f4617a6e4c483494ce7d87e29f70a2f9ef3f02` en la ejecución `36369375488`; el paso **Analizar en SonarCloud** quedó omitido porque el repositorio todavía no tiene `SONAR_TOKEN`, `SONAR_ORGANIZATION` y `SONAR_PROJECT_KEY`.

Evidencia del estado actual:

- Workflow: `https://github.com/gisscastillo/CORE/actions/runs/36369375488`
- Job SonarCloud: `https://github.com/gisscastillo/CORE/actions/runs/36369375488/job/108762291284`
- Pruebas y cobertura previas al análisis: ejecutadas correctamente.
- Paso de análisis: `skipped` por ausencia de credenciales, no por un error del código.

Después de ejecutar el workflow, registrar aquí únicamente los valores mostrados por SonarCloud:

| Métrica | Resultado real |
|---|---|
| Code Smells | Pendiente |
| Technical Debt | Pendiente |
| Bugs | Pendiente |
| Vulnerabilities | Pendiente |
| Security Hotspots | Pendiente |
| Coverage | Pendiente |
| Duplications | Pendiente |

Configuración externa requerida:

- Variable de repositorio `SONAR_ORGANIZATION`: clave de la organización visible en **SonarCloud → My Account → Organizations**.
- Variable de repositorio `SONAR_PROJECT_KEY`: clave visible en **Project Information**.
- Secreto `SONAR_TOKEN`: créalo en **SonarCloud → My Account → Security → Generate Tokens**.
