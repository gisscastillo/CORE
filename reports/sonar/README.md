# Resultados SonarQube Cloud

Estado: **EJECUTADO Y APROBADO**.

SonarQube Cloud analizó el proyecto `gisscastillo_CORE` desde GitHub Actions con la cobertura LCOV generada por Jest. El análisis definitivo corresponde al commit `c0037b4` y el pipeline `36431908719`.

Evidencia verificable:

- Proyecto: https://sonarcloud.io/project/overview?id=gisscastillo_CORE
- Pipeline CI/CD: https://github.com/gisscastillo/CORE/actions/runs/36431908719
- Quality Gate: **Passed / OK**.
- Fecha de verificación: 28 de septiembre de 2026.

| Métrica | Resultado real |
|---|---:|
| Quality Gate | Aprobado |
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security Hotspots | 0 |
| Code Smells | 16 |
| Technical Debt | 135 minutos (2 h 15 min) |
| Coverage | 98.5 % |
| Coverage on New Code | 100 % |
| Duplicated Lines | 0.0 % |
| Reliability Rating | A |
| Security Rating | A |
| Maintainability Rating | A |
| Líneas de código analizadas | 1,085 |

Durante la primera ejecución SonarQube Cloud detectó dos vulnerabilidades: una posible inserción de contenido en el DOM y una posible inyección en logs. Ambas se corrigieron mediante construcción segura de nodos DOM, normalización del contenido del log y una prueba unitaria específica. El análisis final registra **0 vulnerabilidades**.

Las 16 observaciones restantes son Code Smells de mantenibilidad y no impiden el Quality Gate. Se conservan como entrada verificable del plan de mejora continua.
