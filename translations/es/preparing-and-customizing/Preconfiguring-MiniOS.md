---
updated: 2026-09-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Preconfigurando MiniOS

El Configurador de MiniOS es un editor gráfico para la configuración en vivo de MiniOS. Valida los cambios y escribe la configuración para un arranque posterior. Las opciones tempranas de almacenamiento de caché y registro se aplican por `minios-boot`; el resto de los componentes de live-config se ejecutan después. Guardar no modifica directamente el sistema en ejecución.

## Iniciar el configurador

Abre el Configurador de MiniOS desde el menú de aplicaciones o ejecuta:

```bash
minios-configurator
```

El destino predeterminado es `/etc/live/config.conf`. Para editar otro archivo regular, indica su ruta:

```bash
minios-configurator /path/to/config.conf
```

Para guardar se requiere autenticación de PolicyKit. Se rechazan enlaces simbólicos y archivos de destino que no sean regulares.

## Configuración de medios y en tiempo de ejecución

MiniOS puede leer la configuración desde dos ubicaciones:

- `minios/config.conf` y `minios/config.conf.d/*.conf` en el medio en vivo
- `/etc/live/config.conf` y `/etc/live/config.conf.d/*.conf` en el sistema de archivos raíz en ejecución

El Configurador de MiniOS edita solo el archivo seleccionado. Si no se indica una ruta, edita el archivo de tiempo de ejecución `/etc/live/config.conf`; no abre directamente el archivo del medio. MiniOS sincroniza la configuración más reciente entre el sistema de archivos de tiempo de ejecución y los medios MiniOS grabables durante el arranque. Los medios de solo lectura no pueden recibir cambios de tiempo de ejecución, y la configuración persistente de tiempo de ejecución puede mantenerse independiente de la copia en el medio.

Al arrancar, MiniOS sincroniza los archivos del medio y de tiempo de ejecución según la fecha de modificación. Para las nuevas políticas de almacenamiento, luego `config.conf.d` los fragmentos posteriores sobrescriben el archivo principal, `LIVE_CONFIG_CMDLINE` sigue a continuación, y la línea de comandos real del kernel prevalece al final.
Utilice `-i` para superponer los ajustes reconocidos de la línea de comandos actual del kernel en el editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

El archivo seleccionado sigue siendo el destino de guardado. Los parámetros de kernel desconocidos se ignoran.

## Cuándo se aplican los ajustes

Cada control indica cuándo se utiliza. Guardar nunca aplica un ajuste a la sesión actual.

### Se aplica tras reiniciar

El nombre de host, la configuración regional, la zona horaria, el teclado, el objetivo de arranque, la selección de servicios, el modo de módulos, el manejo de medios de directorios de usuario, los ajustes de depuración, la exportación de registros y las tres opciones avanzadas de almacenamiento se leen en un arranque posterior. Reinicie después de guardar para aplicarlas.

En **Avanzado**, **Almacenamiento de registro del sistema**, **Caché de descargas de APT**, y **Caché del navegador** ofrecen `persistent` (predeterminado) o `volatile`. Sus `volatile` opciones solo se aplican a una sesión `perch` saludable y duradera. Los registros de `minios-boot` y `live-config` permanecen persistentes incluso cuando los registros normales son temporales. El estado de los paquetes APT y los perfiles del navegador se mantienen persistentes; solo los registros y cachés seleccionados se trasladan al RAM limitado. La configuración del navegador se ejecuta después de crear el usuario en vivo. El Configurador avisa si el initrd en ejecución no tiene el `perch-storage-v1` marcador necesario para estos ajustes. Consulte [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) antes de elegir tamaños de RAM para un equipo con poca memoria.

### Solo se usan para una nueva sesión

La creación de cuentas, las contraseñas de usuario y root, `noroot`, la política de sudo y PolicyKit, la política de SSH y XRDP, el acceso a X11, las pistas de contraseña y el bloqueo de pantalla son ajustes de una sola vez. Una sesión persistente normalmente registra los componentes de `live-config` completados bajo `/var/lib/live/config/`, por lo que cambiar estos valores y reiniciar la misma sesión no recrea la cuenta ni el estado de seguridad. Inicia una nueva sesión para aplicarlos como ajustes iniciales.

Los perfiles de seguridad son preajustes del editor. El nombre del perfil no se guarda; los ajustes de seguridad individuales sí se guardan y permanecen editables.

## Directorios de usuario y persistencia

Vincular y montar directorios de usuario mediante bind son opciones excluyentes. Ambas utilizan un medio de datos local MiniOS existente, grabable y una ruta segura relativa al medio. No están disponibles con `toram` , `toram=full` o `toram=trim`, y MiniOS no fusiona automáticamente dos árboles de directorios ya poblados.

`perchmode` y `perchsize` son parámetros de arranque de initramfs, no ajustes del Configurador de MiniOS. Los nuevos controles de almacenamiento de caché y registro no seleccionan ni crean una `perch` sesión. El Configurador de MiniOS no crea, desbloquea, redimensiona ni repara un contenedor de persistencia. Para la persistencia cifrada, informa si el marcador de cifrado de initramfs está presente.

## Comportamiento al guardar

La revisión solo muestra los valores modificados y oculta las contraseñas. Al guardar, solo se actualizan las claves cambiadas, preservando los comentarios, el orden, las claves desconocidas, la propiedad, los permisos y los atributos extendidos. La escritura es atómica.

Para la referencia completa de variables y parámetros de arranque, consulta [Archivo de configuración](/reference/configuration/config.conf), [Parámetros de arranque](/reference/Boot-Parameters) y [live-config](/reference/configuration/live-config).
