# Reporte de seguridad

Estado: **PENDIENTE DE EJECUCIÓN**.

OWASP ZAP no se ejecutó en este equipo porque Docker no está disponible y todavía no existe una URL pública del entorno de prueba. No se creó un reporte ficticio.

Para obtener evidencia real:

1. Despliega CORE en el entorno `testing`.
2. En GitHub abre **Actions → CORE OWASP ZAP → Run workflow**.
3. Confirma que tienes autorización para realizar un escaneo activo y escribe la URL pública completa, por ejemplo `https://core-testing.onrender.com`.
4. Descarga el artefacto `core-owasp-zap-report` al finalizar.
5. Copia `owasp-zap-report.html` y `owasp-zap-report.json` en esta carpeta.

Alternativa local con Docker, desde la raíz del proyecto:

```powershell
docker run --rm -v "${PWD}:/zap/wrk/:rw" ghcr.io/zaproxy/zaproxy:stable `
  zap-full-scan.py -t http://host.docker.internal:3000 -a -j -m 10 `
  -r reports/security/owasp-zap-report.html `
  -J reports/security/owasp-zap-report.json
```

El full scan incluye spider y pruebas activas, por lo que debe ejecutarse exclusivamente contra un entorno de prueba propio o autorizado.
