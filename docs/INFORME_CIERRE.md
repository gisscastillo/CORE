# 1. COMPARACIÓN ENTRE PLANIFICACIÓN E IMPLEMENTACIÓN

| Aspecto | Planificado | Ejecutado | Diferencia |
|---|---|---|---|
| Arquitectura | Aplicación monolítica | Aplicación monolítica Express que sirve API y frontend | Sin diferencia |
| Metodología | Scrum | El alcance corresponde al incremento funcional de la segunda parte | La ejecución técnica no incluye ceremonias ni artefactos Scrum adicionales |
| Sistema web | Sistema accesible mediante navegador | Interfaz web responsive con login, dashboard e inventario | Sin diferencia funcional |
| Gestión de recursos | Registrar, consultar y controlar recursos | Registro, consulta general, consulta individual y actualización | Se concretó el control mediante estados y permisos por rol |
| Autenticación y usuarios | Control de usuarios | Registro de usuario, login JWT, contraseñas con bcrypt y autorización por roles | Se detalló la protección técnica que no estaba definida en la primera fase |
| Base de datos | PostgreSQL | Esquema PostgreSQL con restricciones y consultas parametrizadas | Sin diferencia |
| Registro y consulta | Registrar y consultar recursos | Ambas funciones más actualización para completar el módulo demostrable | Se incluyó actualización dentro del alcance requerido de la segunda parte |
| Calidad y entrega | No detalladas en la primera fase | Jest/Supertest, umbral de cobertura, GitHub Actions, configuración SonarCloud y OWASP ZAP | Se agregaron controles exigidos para la evaluación de la segunda parte |

# 2. LECCIONES APRENDIDAS

- Definir estados y roles como catálogos cerrados tanto en la API como en PostgreSQL evita reglas contradictorias entre capas.
- Un JWT debe contener únicamente el identificador y el rol; la autorización sigue siendo responsabilidad del servidor y debe diferenciar entre falta de autenticación (401) y falta de permiso (403).
- Separar la conexión PostgreSQL permite probar las rutas con Supertest sin depender de infraestructura externa, manteniendo consultas parametrizadas en producción.
- Exigir cobertura de statements, branches, functions y lines en el propio comando de pruebas evita que una cifra global o un reporte visual oculte una métrica insuficiente.
- CI puede verificarse dentro del repositorio, mientras que despliegue, ZAP y SonarCloud requieren credenciales o una URL pública; distinguir configuración de ejecución evita presentar evidencia ficticia.
- La validación de entrada, Helmet, hashes bcrypt, mensajes de error controlados y secretos externos son medidas complementarias, no sustitutas entre sí.

# 3. PLAN DE MEJORA CONTINUA

- Agregar paginación y filtros del lado del servidor cuando el inventario crezca, conservando el mismo modelo de recursos.
- Incorporar historial de cambios de estado para mejorar la trazabilidad sin alterar el objetivo de gestión organizacional.
- Automatizar migraciones de base de datos antes de cada despliegue de prueba.
- Añadir renovación segura de sesión y revocación de tokens para escenarios con mayores requisitos de seguridad.
- Ejecutar OWASP ZAP después de cada despliegue exitoso y establecer criterios de aceptación para alertas de riesgo medio o alto.
- Activar Quality Gate en SonarCloud y bloquear el despliegue cuando aparezcan vulnerabilidades, bugs críticos o cobertura inferior al objetivo.
