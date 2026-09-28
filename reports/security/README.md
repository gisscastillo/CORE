# Reporte de seguridad OWASP ZAP

Estado: **EJECUTADO**.

El escaneo activo OWASP ZAP se ejecutó el **27 de septiembre de 2026** contra el entorno de prueba autorizado:

- URL: `https://core-testing-0r6l.onrender.com`
- GitHub Actions: ejecución `36358985769`
- Resultado técnico del workflow: exitoso
- Evidencias: `owasp-zap-report.html`, `owasp-zap-report.json` y `owasp-zap-report.md`

## Resultado resumido

- No se detectaron alertas de SQL Injection ni Cross-Site Scripting (XSS).
- Se detectaron alertas medias relacionadas con CSP, recursos externos, ausencia de token CSRF y cabeceras del proxy.
- Se eliminaron las fuentes externas y se añadió una política CSP estricta, `Cross-Origin-Embedder-Policy` y `Permissions-Policy` después del escaneo.
- La alerta CSRF se revisó como posible falso positivo: la API usa JWT en el encabezado `Authorization` y no cookies de sesión enviadas automáticamente por el navegador.
- La cabecera de proxy corresponde a la infraestructura administrada por Render y no a datos sensibles de la aplicación.

El reporte completo conserva el detalle por URL, nivel de riesgo, evidencia y recomendación. Las mejoras posteriores deben publicarse y volver a escanearse para producir la evidencia comparativa final.

> El escaneo activo se realizó exclusivamente contra el entorno de prueba propio del proyecto.
