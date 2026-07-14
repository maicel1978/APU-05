# Guía sencilla para descargar, actualizar y probar APU-05

Esta guía permite probar en Windows con Visual Studio Code sin dominar Git.

## 1. Opción más sencilla: descargar ZIP

La rama de trabajo puede descargarse directamente desde GitHub:

```text
https://github.com/maicel1978/APU-05/archive/refs/heads/arena/019f5692-apu-05.zip
```

Pasos:

1. Abrir el enlace en el navegador.
2. Descomprimir el archivo.
3. Abrir Visual Studio Code.
4. Elegir **Archivo → Abrir carpeta**.
5. Seleccionar la carpeta descomprimida.
6. Ejecutar `INICIAME.bat` o `python serve.py`.

Ventaja: no requiere comandos Git.  
Desventaja: para cada actualización hay que descargar un ZIP nuevo.

## 2. Opción recomendada: clonar una vez y actualizar

### 2.1 Abrir una terminal en Visual Studio Code

En Visual Studio Code:

```text
Terminal → Nueva terminal
```

### 2.2 Clonar la rama de laboratorio

Ejecutar una sola vez:

```bash
git clone --branch arena/019f5692-apu-05 --single-branch https://github.com/maicel1978/APU-05.git APU-05-laboratorio
```

Entrar a la carpeta:

```bash
cd APU-05-laboratorio
```

Abrirla en Visual Studio Code:

```bash
code .
```

Si `code .` no funciona, usar **Archivo → Abrir carpeta** y elegir `APU-05-laboratorio`.

## 3. Actualizar cuando el agente publique una versión

Abrir la terminal dentro de `APU-05-laboratorio` y ejecutar:

```bash
git pull
```

Eso descarga los cambios nuevos de la misma rama.

Después comprobar la versión:

```bash
git log -1 --oneline
```

El identificador mostrado debe coincidir con el commit informado por el agente.

## 4. Ejecutar la aplicación

### Opción acordada para las pruebas: Live Server

Con la carpeta completa abierta en Visual Studio Code:

1. Hacer clic derecho sobre `index.html`.
2. Elegir **Open with Live Server**.
3. Esperar que se abra el navegador, normalmente en `http://127.0.0.1:5500/`.

Usar siempre el mismo método y puerto durante una serie de pruebas. IndexedDB separa sus datos por origen: `127.0.0.1:5500` y `localhost:8000` tienen bóvedas diferentes. Cambiar entre ambos puede hacer que una sesión parezca ausente, aunque siga almacenada en el otro origen.

### Opción Windows alternativa

Hacer doble clic en:

```text
INICIAME.bat
```

### Opción terminal alternativa

```bash
python serve.py
```

Abrir en el navegador:

```text
http://localhost:8000
```

Para detener el servidor en la terminal:

```text
Ctrl+C
```

## 5. Probar sin perder la copia anterior

Antes de una fase delicada, el agente entregará un ZIP numerado. Se recomienda conservarlo en una carpeta como:

```text
APU-05-pruebas/
├── 00-original/
├── 01-documentacion/
├── 02-qa/
└── 03-parser/
```

No copiar archivos nuevos sobre una versión anterior. Cada ZIP debe descomprimirse en su propia carpeta.

## 6. Si ya existe una copia local del repositorio

No ejecutar comandos de actualización hasta saber si tiene cambios propios.

En la terminal de esa copia ejecutar:

```bash
git status
```

### Si aparece “working tree clean”

Se puede crear o cambiar a la rama de trabajo:

```bash
git fetch origin
git switch --track origin/arena/019f5692-apu-05
```

Si la rama ya existe localmente:

```bash
git switch arena/019f5692-apu-05
git pull
```

### Si aparecen archivos modificados

No ejecutar `reset`, `clean` ni borrar archivos. Guardar una copia y comunicar el resultado de `git status` al agente.

## 7. Actualizar sin usar la terminal

En Visual Studio Code:

1. Abrir la carpeta clonada.
2. Pulsar el icono **Control de código fuente** de la barra izquierda.
3. Abrir el menú de tres puntos `…`.
4. Elegir **Pull** o **Extraer**.
5. Revisar la rama en la esquina inferior izquierda.

Debe mostrar:

```text
arena/019f5692-apu-05
```

## 8. Archivos para pruebas

Catálogo de datos y benchmarks integrados:

```text
assets/test_data/
```
(Consulte `assets/test_data/README.md` para ver la descripción de cada subcarpeta: `benchmarks_v5/`, `provisional_v5/`, `transversal_simulated_v5/`, `apu04_inputs/`, `historicos_v4/` y `glosarios/`).

No usar información clínica identificable real durante las primeras pruebas de desarrollo.

## 9. Cómo informar un error

Ayuda mucho enviar:

- commit probado;
- navegador;
- archivo cargado;
- paso exacto;
- resultado observado;
- captura de pantalla;
- mensaje de la consola si existe.

Para abrir la consola del navegador en Chrome/Edge:

```text
F12 → Console
```

No compartir datos clínicos identificables en capturas o mensajes.

## 10. Problemas comunes

### `git` no se reconoce

Instalar Git para Windows desde:

```text
https://git-scm.com/download/win
```

Reiniciar Visual Studio Code después de instalarlo.

### `python` no se reconoce

Probar:

```bash
py serve.py
```

O usar `INICIAME.bat`.

### El puerto 8000 está ocupado

Cerrar otra ventana del servidor o localizar la terminal anterior y pulsar `Ctrl+C`.

### `git pull` informa conflictos

No elegir opciones al azar. Copiar el mensaje completo y enviarlo al agente.

### La aplicación parece antigua después de actualizar

1. Confirmar el commit con `git log -1 --oneline`.
2. Recargar con `Ctrl+F5`.
3. Si continúa, cerrar la pestaña y volver a abrir `http://localhost:8000`.

## 11. Regla de seguridad

Para una copia usada solo en pruebas, nunca son necesarios estos comandos:

```text
git push --force
git reset --hard
git clean -fd
```

No ejecutarlos salvo que exista una explicación y una copia de seguridad.
