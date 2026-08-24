# Endurecimiento de la seguridad

MiniOS puede ejecutarse como un sistema de recuperación en vivo, un sistema portátil persistente o una instalación nativa. Los controles adecuados dependen de cómo se utilice el sistema. Protege la sesión en ejecución, los datos persistentes, el medio de arranque y cualquier configuración que se aplique al inicio.

## Comienza con medios de confianza

Descarga MiniOS desde una fuente oficial y verifica el ISO antes de grabarlo. Sigue [Verificación de descargas](/installation/Verifying-Downloads.md) y compara el resultado antes de arrancar o instalar. La verificación detecta una descarga dañada o sustituida; no garantiza que un dispositivo USB ya modificado sea seguro.

Mantén el dispositivo USB bajo control físico. Las contraseñas de firmware y el orden de arranque restringido pueden reducir el arranque no autorizado casual, pero no cifran los archivos en el dispositivo. Secure Boot puede proporcionar protección adicional en la cadena de arranque en imágenes y hardware que lo soporten; verifica el comportamiento real de la versión y el firmware en vez de asumir compatibilidad.

## Sustituye las credenciales predeterminadas

Una imagen en vivo de MiniOS sin personalizar utiliza las credenciales publicadas `live` / `evil` y `root` / `toor`, con inicio de sesión automático y acceso administrativo sin contraseña en su configuración orientada a la comodidad. Cualquiera que pueda acceder al sistema podría usar esas credenciales, especialmente si SSH está activo.

Antes de conectarte a una red no confiable:

1. Establece contraseñas únicas para usuario y root en el Configurador de MiniOS.
2. Selecciona un perfil de seguridad apropiado y revisa cada control configurado.
3. Desactiva SSH y XRDP salvo que se requiera acceso remoto.
4. Reinicia en una nueva sesión al cambiar configuraciones de cuenta o seguridad de un solo uso, luego verifica el comportamiento resultante de inicio de sesión y privilegios.

El Configurador almacena los hashes de las contraseñas cifrados en lugar de las contraseñas en texto plano. Si cambias una cuenta persistente o nativa ya creada, utiliza `passwd` para el usuario actual y `sudo passwd root` para root.

## Utiliza los controles de seguridad del Configurador

El Configurador de MiniOS ofrece tres perfiles. Un perfil completa configuraciones concretas; el nombre del perfil en sí no se guarda como clave de configuración en tiempo de ejecución, y cada ajuste permanece editable de forma independiente.

| Perfil | Comportamiento principal |
| --- | --- |
| `convenient` | Compatible con inicio de sesión automático, sudo y PolicyKit sin contraseña, root y SSH por contraseña permitidos, XRDP/X11/pantalla de bloqueo relajados, pistas de contraseña visibles. |
| `balanced` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, inicio de sesión root por SSH denegado pero SSH por contraseña permitido, XRDP/X11/pantalla de bloqueo reforzados. |
| `strict` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, inicio de sesión root y por contraseña en SSH denegados, XRDP deshabilitado, X11/pantalla de bloqueo reforzados, pistas de contraseña ocultas. |

Los valores predeterminados del instalador varían según el modo de instalación: las instalaciones en vivo favorecen `convenient`, mientras que las instalaciones nativas favorecen `balanced`. Estos son valores predeterminados, no recomendaciones para todos los modelos de amenazas.

Las mismas configuraciones están disponibles como claves de configuración documentadas, incluyendo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` y `LIVE_LOCKSCREEN_MODE`. Prefiere estas claves o el Configurador en lugar de editar archivos generados de sudoers, PolicyKit, display-manager o SSH. Consulta [Archivo de configuración](/configuration/Configuration-File.md).
Para el comportamiento de guardado y la aplicabilidad de los ajustes, consulta [MiniOS Configurator](/configuration/MiniOS-Configurator.md).

La creación de cuentas, contraseñas, `LIVE_CONFIG_NOROOT` y la postura de seguridad son configuraciones de un solo uso que se aplican al crear una nueva sesión. El Configurador muestra la aplicabilidad de cada control. Los ajustes reconfigurables como los servicios se aplican tras reiniciar.

## Asegura el acceso remoto

SSH puede estar habilitado en una imagen de MiniOS para tareas de recuperación. En una red donde no se confía en otros usuarios, asume que las credenciales predeterminadas publicadas están expuestas hasta que confirmes lo contrario.

- Si SSH no es necesario, añade `ssh` a `DISABLE_SERVICES` en el Configurador y elimínalo de `ENABLE_SERVICES` si está presente.
- Si SSH es requerido, deniega el inicio de sesión de root con `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefiere la autenticación por clave. Confirma el inicio de sesión por clave en una conexión separada antes de establecer `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restringe el acceso entrante con el cortafuegos de red o el router, y no expongas directamente un sistema de recuperación portátil a Internet.
- Revisa XRDP por separado. El perfil estricto lo deshabilita; el perfil equilibrado lo refuerza pero no necesariamente desactiva su servicio.

Los parámetros de arranque pueden sobrescribir los valores del archivo de configuración. Revisa el comportamiento inesperado de los servicios en [Parámetros de arranque](/configuration/Boot-Parameters.md).

## Cifra los datos persistentes

La persistencia nativa, DynFileFS y la persistencia en bruto sin cifrar pueden ser leídas por quien obtenga el dispositivo. El Instalador de MiniOS puede configurar un contenedor cifrado LUKS para una sesión en vivo cuando el initrd de origen anuncia soporte para LUKS. El initrd crea `changes.luks` en el primer arranque y solicita su frase de contraseña; el instalador no recibe ni almacena esa frase.

La persistencia LUKS protege el contenido mientras el contenedor está cerrado. No protege los datos después de desbloquear, los archivos de arranque sin cifrar, los archivos copiados fuera del contenedor ni un sistema de archivos raíz nativo. La persistencia de sesión LUKS no es cifrado nativo de root. Usa una frase de contraseña fuerte y mantén una copia de seguridad probada.

Consulta [MiniOS Installer](/installation/MiniOS-Installer.md) y [Gestión de sesiones](/configuration/Session-Management.md).

## Aplica actualizaciones de forma deliberada

Actualiza los metadatos de paquetes e instala las actualizaciones de seguridad de Debian en sesiones en vivo persistentes o instalaciones nativas usando el flujo de trabajo normal de APT. Los cambios de APT en una sesión en vivo nueva desaparecen al reiniciar. Los módulos base SquashFS son de solo lectura, por lo que reemplazar el ISO o los módulos por una versión confiable y más reciente de MiniOS suele ser la forma más limpia de actualizar el sistema base en vivo.

Consulta [Actualizaciones de software](/administration/Software-Updates.md) para los flujos de trabajo separados de APT, módulos, imágenes y kernel.

Antes de una actualización grande:

- Haz una copia de seguridad de archivos importantes y sesiones persistentes.
- Confirma que haya suficiente espacio libre disponible.
- Evita interrumpir escrituras o apagar el dispositivo.
- Reinicia y verifica el sistema actualizado antes de descartar el medio o la sesión anterior conocida como funcional.

## Trata los hooks y preseeding como ejecución de código

La opción de arranque `hooks` y los hooks de live-config pueden ejecutar archivos desde el sistema de archivos raíz, el medio de arranque o una URL. Los hooks remotos, los hooks modificados en el medio y los preseeds no revisados pueden ejecutarse con privilegios de sistema. Utiliza solo archivos revisados de una fuente confiable, prefiere la distribución autenticada y evita hooks remotos en redes no confiables. Consulta [live-config](/configuration/live-config.md) para el orden de ejecución y las ubicaciones soportadas.

## Haz copias de seguridad y retira los medios de forma segura

La persistencia no es una copia de seguridad. Mantén una copia separada de los archivos de usuario y exporta o copia las sesiones mientras estén en buen estado. Prueba la restauración en diferentes medios. Apaga correctamente antes de retirar el almacenamiento escribible y asegúrate de dejar espacio libre para los metadatos de la sesión y el funcionamiento del sistema de archivos.

Antes de desechar un dispositivo, elimínalo de forma segura según la tecnología de almacenamiento y la sensibilidad de los datos. Eliminar archivos o reformatear por sí solos puede no hacer que los datos antiguos sean irrecuperables.
