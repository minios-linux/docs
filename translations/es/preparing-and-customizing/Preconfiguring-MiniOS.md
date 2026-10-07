---
updated: 2026-10-06
program_commits:
    minios-configurator: 4d82e44c6ee6f04909e9dd3ef8e31389d3ac8817
---

# Preconfigurando MiniOS

El Configurador de MiniOS es un editor gráfico para la configuración en vivo de MiniOS. Valida los cambios y escribe la configuración para el próximo arranque. Las opciones iniciales de almacenamiento de caché y registros se aplican por `minios-boot`; los componentes restantes de live-config se ejecutan más tarde. Guardar no modifica directamente el sistema en ejecución.

## Iniciar el configurador

Abre el Configurador de MiniOS desde el menú de aplicaciones o ejecuta:

```bash
minios-configurator
```

El destino predeterminado es `/etc/live/config.conf`. Para editar otro archivo regular, indica su ruta:

```bash
minios-configurator /path/to/config.conf
```

Guardar requiere autenticación PolicyKit. No se aceptan enlaces simbólicos ni archivos de destino no regulares.

## Configuración de medios y en tiempo de ejecución

MiniOS puede leer la configuración desde dos ubicaciones:

- `minios/config.conf` y `minios/config.conf.d/*.conf` en el medio en vivo
- `/etc/live/config.conf` y `/etc/live/config.conf.d/*.conf` en el sistema de archivos raíz en ejecución

El Configurador de MiniOS edita solo el archivo seleccionado. Si no se indica una ruta, edita el archivo de tiempo de ejecución `/etc/live/config.conf`; no abre directamente el archivo del medio. MiniOS sincroniza la configuración más reciente entre el sistema de archivos de tiempo de ejecución y los medios MiniOS grabables durante el arranque. Los medios de solo lectura no pueden recibir cambios en tiempo de ejecución, y la configuración persistente en tiempo de ejecución puede mantenerse independiente de la copia en el medio.

Al arrancar, MiniOS sincroniza los archivos del medio y de tiempo de ejecución según la fecha de modificación. Para las nuevas políticas de almacenamiento, los fragmentos `config.conf.d` posteriores sobrescriben el archivo principal, `LIVE_CONFIG_CMDLINE` sigue después, y la línea de comandos real del kernel tiene prioridad final.
Utiliza `-i` para superponer en el editor los ajustes reconocidos de la línea de comandos actual del kernel:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

El archivo seleccionado sigue siendo el destino al guardar. Los parámetros del kernel desconocidos se ignoran.

## Cuándo se aplican los ajustes

Cada control indica cuándo se utiliza. Guardar nunca aplica un ajuste a la sesión actual.

### Aplicados tras reiniciar

El nombre de host, el idioma, la zona horaria, el teclado, el destino de arranque, la selección de servicios, el modo de módulos, el manejo de medios de directorios de usuario, los ajustes de depuración, la exportación de registros y las tres opciones avanzadas de almacenamiento se leen en un arranque posterior. Reinicia después de guardar para aplicarlos.

En **Avanzado**, **Modo de módulos** acepta `simple` o `merged`. Si `LIVE_MODULE_MODE` no está presente en la configuración seleccionada, el Configurador de MiniOS muestra `merged` como valor predeterminado efectivo. En modo combinado, live-config actualiza usuarios, cachés y estado de paquetes para que la configuración de la pila de módulos se integre en el sistema en vivo en ejecución.

En **Avanzado**, **Almacenamiento de registros del sistema**, **Caché de descargas de APT**, y **Caché del navegador** ofrecen `persistent` (predeterminado) o `volatile`. Sus opciones de `volatile` solo se aplican a una sesión saludable y duradera de `perch`. Los registros de `minios-boot` y `live-config` permanecen persistentes incluso si los registros normales son temporales. El estado de los paquetes APT y los perfiles del navegador siguen siendo persistentes; solo los registros y cachés seleccionados se trasladan a RAM con límite. La configuración del navegador se aplica después de crear el usuario en vivo. El configurador avisa si el initrd en ejecución no tiene el marcador `perch-storage-v1` necesario para estos ajustes. Consulta [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) antes de elegir tamaños de RAM para una máquina con poca memoria.

### Solo se usan para una nueva sesión

La creación de cuentas, las contraseñas de usuario y root, `noroot`, la política de sudo y PolicyKit, la política de SSH y XRDP, el acceso a X11, las pistas de contraseña y el bloqueo de pantalla son ajustes de una sola vez. Una sesión persistente normalmente registra los componentes de `live-config` bajo `/var/lib/live/config/`, por lo que cambiar estos valores y reiniciar la misma sesión no recrea la cuenta ni el estado de seguridad. Inicia una sesión nueva para aplicarlos como ajustes iniciales.

Los perfiles de seguridad son preajustes del editor. El nombre del perfil no se guarda; los ajustes de seguridad individuales se guardan y permanecen editables.

## Directorios de usuario y persistencia

El enlace y el montaje bind de directorios de usuario son excluyentes. Ambos utilizan un medio de datos local MiniOS existente y escribible, y una ruta segura relativa al medio. No están disponibles con `toram`, `toram=full`, o `toram=trim`, y MiniOS no fusiona automáticamente dos árboles de directorios ya poblados.

`perchmode` y `perchsize` son parámetros de arranque de initramfs, no opciones del Configurador de MiniOS. Los nuevos controles de almacenamiento de caché/registros no seleccionan ni crean una sesión de `perch`. El Configurador de MiniOS no crea, desbloquea, redimensiona ni repara un contenedor de persistencia. Para la persistencia cifrada, informa si el marcador de cifrado de initramfs está presente.

## Comportamiento al guardar

La revisión muestra solo los valores modificados y oculta las contraseñas. Al guardar, solo se actualizan las claves cambiadas, manteniendo los comentarios, el orden, las claves desconocidas, la propiedad, los permisos y los atributos extendidos. La escritura es atómica.

Para la referencia completa de variables y parámetros de arranque, consulta [Archivo de configuración](/reference/configuration/config.conf), [Parámetros de arranque](/reference/Boot-Parameters), y [live-config](/reference/configuration/live-config).
