# Reporte de seguridad OWASP ZAP

Estado: **EJECUTADO**.

El escaneo activo OWASP ZAP se ejecutó el **27 de septiembre de 2026** contra el entorno de prueba autorizado:

- URL: `https://core-testing-0r6l.onrender.com`
- Versión analizada: `37f4617a6e4c483494ce7d87e29f70a2f9ef3f02`
- GitHub Actions: ejecución `36369422904`
- Resultado técnico del workflow: exitoso
- Evidencias: `owasp-zap-report.html`, `owasp-zap-report.json` y `owasp-zap-report.md`

## Resultado resumido

- No se detectaron alertas de riesgo alto ni bajo.
- No se detectaron alertas de SQL Injection ni Cross-Site Scripting (XSS).
- Se registró una alerta media, `Proxy Disclosure`, en cinco respuestas. La cabecera corresponde a la infraestructura administrada por Render y no expone datos sensibles de la aplicación.
- Las diez alertas restantes son informativas y corresponden principalmente al comportamiento de caché, encabezados de navegación que el navegador agrega en solicitudes reales y reconocimiento de la aplicación moderna.
- El nuevo escaneo confirma que las alertas anteriores sobre CSP, recursos externos y ausencia de token CSRF ya no aparecen.

El reporte completo conserva el detalle por URL, nivel de riesgo, evidencia y recomendación. Esta es la evidencia final obtenida después de publicar y verificar las mejoras de seguridad.

> El escaneo activo se realizó exclusivamente contra el entorno de prueba propio del proyecto.
