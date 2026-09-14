---
updated: 2026-09-13
---

# Seguridad

Los controles de seguridad de MiniOS están diseñados para el sistema en vivo: sesiones temporales, sesiones persistentes, medios portátiles y configuración al inicio. El Instalador de MiniOS también puede realizar una conversión nativa. El sistema resultante mantiene el entorno de escritorio seleccionado y la identidad visual de MiniOS, pero se elimina el software específico de MiniOS en vivo, por lo que puedes asegurar y mantener el sistema con las herramientas normales de Debian en lugar de tratarlo como otro modo en vivo.
Protege la sesión en ejecución, los datos persistentes, los medios de arranque y cualquier configuración que se aplique al iniciar.

## Comienza con medios de confianza

Descarga MiniOS desde una fuente oficial y verifica el ISO antes de grabarlo.
Sigue [Verificación de descargas](/installing-minios/Verifying-Downloads) y compara el resultado antes de arrancar o instalar. La verificación detecta una descarga dañada o sustituida; no garantiza que un dispositivo USB ya modificado sea seguro.

Mantén el dispositivo USB bajo control físico. Las contraseñas de firmware y el orden de arranque restringido pueden reducir el arranque no autorizado ocasional, pero no cifran los archivos del dispositivo. Secure Boot puede ofrecer protección adicional de la cadena de arranque en imágenes y hardware compatibles; comprueba el comportamiento real de la versión y el firmware en vez de asumir compatibilidad.

## Reemplazar credenciales predeterminadas

Una imagen en vivo MiniOS sin personalizar utiliza las credenciales publicadas `live` / `evil` y `root` / `toor`, con inicio de sesión automático y acceso administrativo sin contraseña en su configuración orientada a la comodidad. Cualquier persona que pueda acceder al sistema podría usar esas credenciales, especialmente si SSH está activo.

Antes de conectarse a una red no confiable:

1. Establezca contraseñas únicas para usuario y root en el Configurador de MiniOS.
2. Seleccione un perfil de seguridad adecuado y revise cada control configurado.
3. Desactive SSH y XRDP a menos que se requiera acceso remoto.
4. Reinicie en una nueva sesión al cambiar configuraciones de cuenta de un solo uso o de seguridad, y luego verifique el comportamiento de inicio de sesión y privilegios resultante.

El Configurador almacena los hashes de contraseña cifrados en lugar de contraseñas en texto plano. Si modifica una cuenta persistente ya creada, utilice `passwd` para el usuario actual y `sudo passwd root` para root. Después de la conversión nativa, utilice las herramientas normales de gestión de cuentas de Debian.

## Usar controles de seguridad del Configurador

Configurador de MiniOS proporciona tres perfiles. Un perfil completa configuraciones concretas; el nombre del perfil en sí no se guarda como clave de configuración en tiempo de ejecución, y cada ajuste sigue siendo editable de forma independiente.

| Perfil | Comportamiento principal |
| --- | --- |
| `convenient` | Compatible con inicio de sesión automático, sudo y PolicyKit sin contraseña, SSH root y con contraseña permitidos, XRDP/X11/pantalla de bloqueo relajados, se muestran pistas de contraseña. |
| `balanced` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, acceso root por SSH denegado pero SSH con contraseña permitido, XRDP/X11/pantalla de bloqueo reforzados. |
| `strict` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, acceso root y por contraseña por SSH denegados, XRDP deshabilitado, X11/pantalla de bloqueo reforzados, pistas de contraseña ocultas. |

Los valores predeterminados del instalador varían según el modo de despliegue: las instalaciones en vivo favorecen `convenient`, mientras que la conversión nativa parte de `balanced`. El ajuste nativo se aplica durante la conversión; tras la instalación, utilice la configuración de seguridad estándar de Debian. Estos son valores predeterminados, no recomendaciones para todos los modelos de amenaza.

Las mismas configuraciones están disponibles como claves de configuración documentadas, incluyendo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, y `LIVE_LOCKSCREEN_MODE`. Es preferible usar estas claves o el Configurador en lugar de editar archivos generados de sudoers, PolicyKit, display-manager o SSH. Consulte [Archivo de configuración](/reference/configuration/config.conf).
Para el comportamiento de guardado y la aplicabilidad de los ajustes, consulte [Configurador de MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Creación de cuentas, contraseñas, `LIVE_CONFIG_NOROOT`, y la postura de seguridad son configuraciones de una sola vez que se utilizan al crear una nueva sesión. El Configurador muestra la aplicabilidad de cada control. Los ajustes reconfigurables, como los servicios, se aplican tras reiniciar.

## Acceso remoto seguro

SSH puede habilitarse en una imagen MiniOS para tareas de recuperación. En una red donde no se confía en otros usuarios, asuma que las credenciales predeterminadas publicadas están expuestas hasta que confirme lo contrario.

- Si SSH no es necesario, agregue `ssh` a `DISABLE_SERVICES` en Configurator y elimínelo de `ENABLE_SERVICES` si está presente.
- Si SSH es necesario, deniegue el acceso root con `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefiera la autenticación por clave. Confirme el inicio de sesión con clave en una conexión separada antes de establecer `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restringa el acceso entrante con el firewall de red o el router, y no exponga un sistema de recuperación portátil directamente a Internet.
- Revise XRDP por separado. El perfil estricto lo desactiva; el perfil equilibrado lo refuerza pero no necesariamente desactiva su servicio.

Los parámetros de arranque pueden sobrescribir los valores del archivo de configuración. Verifique comportamientos inesperados del servicio en [Parámetros de arranque](/reference/Boot-Parameters).

## Cifrar datos persistentes

La persistencia sin cifrar de native, DynFileFS, dynblk, raw y SquashFS puede ser leída por quien obtenga el dispositivo. Dynblk es un backend de bloques del kernel, no una capa de cifrado; sus `volumeNNN.db` archivos de respaldo contienen datos de sesión sin cifrar, a menos que el almacenamiento subyacente esté protegido por separado. El Instalador de MiniOS puede configurar un contenedor LUKS cifrado para una sesión en vivo cuando el initrd de origen anuncia soporte para LUKS. El initrd crea `changes.luks` en el primer arranque y solicita la frase de contraseña; el instalador no recibe ni almacena esa frase de contraseña.

La persistencia LUKS protege el contenido mientras el contenedor está cerrado. No protege los datos después de desbloquear, los archivos de arranque sin cifrar, los archivos copiados fuera del contenedor ni un sistema de archivos raíz nativo. La persistencia de sesión LUKS no es cifrado nativo de raíz. Utiliza una frase de contraseña segura y mantén una copia de seguridad probada.

Consulta [Instalador de MiniOS](/installing-minios/MiniOS-Installer) y [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Aplicar actualizaciones de forma deliberada

Actualiza los metadatos de los paquetes e instala las actualizaciones de seguridad de Debian en sesiones live persistentes usando el flujo de trabajo habitual de APT cuando sea apropiado. Los cambios realizados con APT en una sesión live nueva se pierden al reiniciar. Los módulos base SquashFS son de solo lectura, por lo que reemplazar la ISO o los módulos por una versión más reciente y confiable de MiniOS suele ser la forma más sencilla de actualizar el sistema live base. Tras la conversión nativa, el mantenimiento de seguridad de paquetes se gestiona simplemente con el flujo de trabajo estándar de APT de Debian para ese sistema instalado.

Consulta [Actualizaciones de software](/maintenance-and-recovery/Updating-MiniOS) para los flujos de trabajo independientes de APT, módulos, imágenes y kernel.

Antes de una actualización importante:

- Haz una copia de seguridad de los archivos importantes y de las sesiones persistentes.
- Confirma que haya suficiente espacio libre disponible.
- Evita interrumpir escrituras o apagar el dispositivo.
- Reinicia y verifica el sistema actualizado antes de descartar el medio o la sesión anterior en buen estado.

## Tratar hooks y preseeds como ejecución de código

La opción de arranque `hooks` y los hooks de live-config pueden ejecutar archivos desde el sistema de archivos raíz, el medio de arranque o una URL. Los hooks remotos, hooks en medios modificados y preseeds no revisados pueden ejecutarse con privilegios de sistema. Utiliza solo archivos revisados de una fuente confiable, prefiere la distribución autenticada y evita hooks remotos en redes no confiables. Consulta [live-config](/reference/configuration/live-config) para ver el orden de ejecución y las ubicaciones compatibles.

## Realiza copias de seguridad y retira los medios de forma segura

La persistencia no es una copia de seguridad. Mantén una copia separada de los archivos de usuario y exporta o copia las sesiones mientras estén en buen estado. Verifica la restauración en diferentes medios.
Apaga el sistema correctamente antes de retirar el almacenamiento con permisos de escritura y asegúrate de dejar espacio libre para los metadatos de sesión y el funcionamiento del sistema de archivos.

Antes de desechar un dispositivo, bórralo de forma segura según la tecnología de almacenamiento y la sensibilidad de los datos. Eliminar archivos o simplemente formatear puede no impedir que los datos antiguos sean recuperables.
