# CORE

CORE es un sistema web para la gestión de recursos dentro de una organización. Su propósito es concentrar en un solo lugar la información de equipos, mobiliario y otros bienes, para que su registro, consulta y seguimiento sean más rápidos y ordenados.

## ¿Qué permite hacer?

El sistema permite:

- Registrar nuevos recursos con su información principal.
- Consultar los recursos mediante una interfaz visual de tarjetas.
- Abrir cada tarjeta para conocer sus detalles.
- Buscar y filtrar recursos para encontrarlos fácilmente.
- Identificar su estado: **Disponible**, **Asignado**, **Mantenimiento** o **Baja**.
- Actualizar o eliminar registros cuando sea necesario.
- Visualizar indicadores generales sobre los recursos almacenados.

## Tipos de usuario

CORE cuenta con dos perfiles principales:

- **Administrador:** puede consultar, registrar, modificar y eliminar recursos. Este perfil permite realizar las operaciones completas de un CRUD.
- **Usuario:** puede consultar el catálogo de recursos y revisar la información detallada de cada uno mediante una interfaz sencilla y visual.

## Funcionamiento general

Cada persona inicia sesión con su cuenta y el sistema muestra la interfaz correspondiente a su perfil. La información de los recursos se almacena en una base de datos, lo que permite conservarla, actualizarla y consultarla de manera organizada.

El proyecto incluye controles de acceso, protección de contraseñas y validaciones para evitar operaciones no autorizadas. También incorpora pruebas automáticas y herramientas de análisis que ayudan a comprobar la calidad y seguridad del sistema antes de publicar cambios.

## Tecnologías utilizadas

La aplicación fue desarrollada con **Node.js y Express** para el funcionamiento del servidor, **HTML, CSS y JavaScript** para las interfaces, y **PostgreSQL** para almacenar la información. Además, utiliza GitHub Actions, SonarCloud y pruebas automatizadas como apoyo para la integración, revisión de calidad y entrega continua.

## Publicación

El sistema se encuentra publicado en Render y está conectado con el repositorio de GitHub. De esta forma, los cambios aprobados pueden verificarse y desplegarse automáticamente.

- Aplicación: [CORE en Render](https://core-testing-0r6l.onrender.com)
- Repositorio: [gisscastillo/CORE](https://github.com/gisscastillo/CORE)

## Resultado del proyecto

CORE ofrece una solución funcional y fácil de utilizar para mantener el control de los recursos de una organización. La separación entre administrador y usuario permite que cada persona tenga acceso únicamente a las funciones que necesita, mientras que la interfaz visual facilita la consulta y administración de la información.
