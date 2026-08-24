# MiniOS Configurator

MiniOS Configurator es un editor gráfico para la configuración de MiniOS `live-config`. Valida los cambios y escribe la configuración para el próximo arranque. No modifica directamente el sistema en ejecución.

## Iniciar el configurador

Abre MiniOS Configurator desde el menú de aplicaciones o ejecuta:

```bash
minios-configurator
```

El destino predeterminado es `/etc/live/config.conf`. Para editar otro archivo regular, indica su ruta:

```bash
minios-configurator /path/to/config.conf
```

Guardar requiere autenticación de PolicyKit. Se rechazan enlaces simbólicos y archivos de destino que no sean archivos regulares.

## Configuración de medios y en tiempo de ejecución

MiniOS puede leer la configuración desde dos ubicaciones:

- `minios/config.conf` y `minios/config.conf.d/*.conf` en el medio en vivo
- `/etc/live/config.conf` y `/etc/live/config.conf.d/*.conf` en el sistema de archivos raíz en ejecución

El Configurador solo edita el archivo seleccionado. Si no se indica una ruta, edita el archivo de tiempo de ejecución `/etc/live/config.conf`; no abre directamente el archivo del medio. MiniOS sincroniza la configuración más reciente entre el sistema de archivos de tiempo de ejecución y los medios MiniOS grabables durante el arranque. Los medios de solo lectura no pueden recibir cambios de la sesión, y la configuración persistente puede mantenerse independiente de la copia en el medio.

Para una opción determinada, los parámetros del kernel tienen prioridad sobre los archivos de configuración, y la configuración del medio tiene prioridad sobre la configuración del sistema de archivos raíz. Usa `-i` para superponer los ajustes reconocidos de la línea de comandos actual del kernel en el editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

El archivo seleccionado sigue siendo el destino de guardado. Los parámetros del kernel desconocidos se ignoran.

## Cuándo se aplican los ajustes

Cada control indica cuándo se utiliza. Guardar nunca aplica un ajuste a la sesión actual.

### Se aplican después de reiniciar

El nombre de host, la configuración regional, la zona horaria, el teclado, el objetivo de arranque, la selección de servicios, el modo de módulos, la gestión de directorios de usuario en medios, los ajustes de depuración y la exportación de registros se leen en un arranque posterior. Reinicia después de guardar para aplicarlos.

### Solo se usan para una nueva sesión

La creación de cuentas, las contraseñas de usuario y root, `noroot`, la política de sudo y PolicyKit, la política de SSH y XRDP, el acceso a X11, las pistas de contraseña y el bloqueo de pantalla son ajustes de una sola vez. Una sesión persistente normalmente registra los componentes completados de `live-config` bajo `/var/lib/live/config/`, por lo que cambiar estos valores y reiniciar la misma sesión no recrea la cuenta ni el estado de seguridad. Inicia una nueva sesión para aplicarlos como ajustes iniciales.

Los perfiles de seguridad son preajustes del editor. El nombre del perfil no se guarda; los ajustes de seguridad individuales se guardan y permanecen editables.

## Directorios de usuario y persistencia

Enlazar y montar directorios de usuario mediante bind son opciones mutuamente excluyentes. Ambas requieren un medio de datos MiniOS local, grabable y existente, y una ruta segura relativa al medio. No están disponibles con `toram`, `toram=full` o `toram=trim`, y MiniOS no fusiona automáticamente dos árboles de directorios ya poblados.

`perchmode` y `perchsize` son parámetros de arranque de initramfs, no ajustes del Configurador. El Configurador no crea, desbloquea, redimensiona ni repara un contenedor de persistencia. Para la persistencia cifrada, solo informa si el marcador de cifrado de initramfs está presente.

## Comportamiento al guardar

La revisión solo muestra los valores cambiados y oculta las contraseñas. Al guardar, solo se actualizan las claves modificadas, preservando los comentarios, el orden, las claves desconocidas, la propiedad, los permisos y los atributos extendidos. La escritura es atómica.

Para la referencia completa de variables y parámetros de arranque, consulta
[Archivo de configuración](/configuration/Configuration-File.md),
[Parámetros de arranque](/configuration/Boot-Parameters.md) y
[live-config](/configuration/live-config.md).
