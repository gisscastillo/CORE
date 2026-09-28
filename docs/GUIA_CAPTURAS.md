# Guía rápida de capturas para la entrega

Toma las capturas con la ventana maximizada y procura que se vea la URL o el nombre de la sección. No muestres contraseñas, tokens ni el archivo `.env`.

## Capturas obligatorias

1. **Sistema publicado:** abre `https://core-testing-0r6l.onrender.com` y captura la pantalla de inicio de sesión con la URL visible.
2. **Interfaz de administrador:** inicia sesión como administrador y captura el panel completo, incluyendo las estadísticas, las tarjetas o tabla y los botones **Registrar**, **Editar** y **Eliminar**.
3. **CRUD y detalles:** abre una tarjeta para mostrar el detalle; después toma otra captura del formulario de registro o edición. No es necesario eliminar un recurso real solo para la evidencia.
4. **Interfaz de usuario:** inicia sesión con un usuario normal y captura sus tarjetas y el detalle desplegado. Debe notarse que no aparecen controles administrativos.
5. **Pruebas y cobertura:** abre `reports/unit-tests/coverage/index.html` en el navegador y captura el resumen con los porcentajes. También sirve la salida de `npm run test:coverage` donde se vean **31 passed** y la tabla de cobertura.
6. **CI/CD:** en GitHub abre **Actions → CORE CI/CD → ejecución más reciente** y captura la página donde los jobs `test`, `sonarcloud` y `deploy-testing` aparecen en verde.
7. **Despliegue:** en Render abre el servicio `core-testing` y captura **Events** mostrando `Deploy live` para el commit más reciente.
8. **Seguridad:** en GitHub abre **Actions → CORE OWASP ZAP Full Scan → ejecución 36369422904** y captura el resultado exitoso y el artefacto `core-owasp-zap-report`.

## Captura de SonarCloud

Abre https://sonarcloud.io/project/overview?id=gisscastillo_CORE y captura el panel **Overview**. Deben verse el **Quality Gate aprobado**, 0 Bugs, 0 Vulnerabilities, 16 Code Smells, 0 Security Hotspots y 98.5 % de Coverage.

## Dónde colocarlas en el informe

- Capturas 1 a 4: al final de **Comparación entre la planificación y la implementación**.
- Capturas 5 a 8 y SonarCloud: después de la tabla comparativa o como anexo de evidencias.
- Agrega bajo cada imagen una línea breve: `Figura N. Descripción de la evidencia. Fuente: elaboración propia.`
