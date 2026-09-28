# Evidencia de pruebas unitarias e integración

Ejecución local real realizada el **27 de septiembre de 2026** con:

```powershell
npm run test:coverage
```

Resultado:

| Indicador | Resultado |
|---|---:|
| Suites | 1 aprobada / 1 total |
| Pruebas | 30 aprobadas / 30 total |
| Statements | 99.35 % |
| Branches | 91.48 % |
| Functions | 100 % |
| Lines | 99.34 % |

Todas las métricas superaron el umbral obligatorio de 80 %. El comando genera `junit.xml`, `coverage/index.html`, `coverage/lcov.info` y `coverage/coverage-summary.json` en este directorio. Los archivos generados están ignorados en Git para evitar evidencia obsoleta; se incluyen en el ZIP académico creado después de la ejecución verificada.

La suite cubre login correcto e incorrecto, registro, validación, JWT faltante/inválido/válido, permisos de ambos roles, consultas, altas, actualizaciones, eliminaciones, sanitización, 404 y manejo centralizado de errores.
