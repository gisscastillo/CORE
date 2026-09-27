# Resultados SonarQube / SonarCloud

Estado: **PENDIENTE DE EJECUCIÓN**.

La integración y la importación de cobertura están configuradas, pero no se inventan métricas. Se necesitan un proyecto de SonarCloud y sus credenciales para obtener resultados reales.

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
