# Caso de uso 

Sistema de gestión escolar (simplificado) que debe permitir: 
* registrar Alumnos, 
* cargar sus Calificaciones
* Persistir los datos en una Base de Datos.

**Condición**: plantear una arquitectura en capas


# Arquitectura en capas

Para ilustrar una Arquitectura en capas, vamos a construir la misma aplicación que se desarrolló para ilustrar una arquitectura monolítica, es decir, vamos a refactorizar.

**🙋Pregunta para la clase...Qué nos falta para poder comenzar el refactor?** 🤔

En este nuevo ejemplo buscamos:
* desacoplar los módulos de Alumnos y Calificaciones.
* separar responsabilidades: en el monolito no se cumple de que una capa de nivel K no pueda acceder a la capa de nivel K+2 directamente

## 📂 Estructura del Proyecto

🚧 En construcción...

### 📊 Capa de acceso a datos

> Aquí es el único lugar donde vive el código que se comunica con la Base de datos (SQLite). Si se decide cambiar SQLite por Postgres SQL, solo se modifica esta capa. (SRP)

### 🛠️ Capa de Negocio/Dominio

> En esta capa se deben definir las reglas de negocio. Por ejemplo: "No se puede calificar a un alumno que no existe" o "La nota debe estar entre 0 y 10".

### 🚪Capa de Presentación

> La capa de presentación, es la capa que interactúa con el "exterior"; sólo se encarga de recibir la petición HTTP, validar que el formato sea correcto y devolver la respuesta.
