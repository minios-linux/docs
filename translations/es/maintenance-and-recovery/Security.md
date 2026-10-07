---
updated: 2026-10-06
---

# Seguridad

Los controles de seguridad de MiniOS están diseñados para el sistema en vivo: sesiones temporales, sesiones persistentes, medios portátiles y configuración al inicio. El Instalador de MiniOS también puede realizar una conversión nativa. El sistema resultante mantiene el entorno de escritorio seleccionado y la identidad visual de MiniOS, pero se elimina el software específico del modo en vivo de MiniOS, por lo que la seguridad y el mantenimiento se gestionan con las herramientas estándar de Debian en lugar de tratarlo como otro modo en vivo.
Proteja la sesión en ejecución, los datos persistentes, los medios de arranque y cualquier configuración que se aplique al iniciar.

## Comience con medios confiables

Descargue MiniOS desde una fuente oficial y verifique el ISO antes de grabarlo.
Siga [Verificación de descargas](/installing-minios/Verifying-Downloads) y compare el resultado antes de arrancar o instalar. La verificación detecta una descarga dañada o sustituida; no garantiza que un dispositivo USB ya modificado sea seguro.

Mantenga el dispositivo USB bajo control físico. Las contraseñas de firmware y el orden de arranque restringido pueden reducir arranques no autorizados casuales, pero no cifran los archivos del dispositivo. Secure Boot puede ofrecer protección adicional de la cadena de arranque en imágenes y hardware que lo soportan; verifique el comportamiento real de la versión y el firmware en lugar de asumir compatibilidad.

## Reemplace las credenciales predeterminadas

Una imagen en vivo de MiniOS sin personalizar utiliza las credenciales publicadas `live` / `evil` y `root` / `toor`, con inicio de sesión automático y acceso administrativo sin contraseña en su configuración orientada a la comodidad. Cualquier persona que acceda al sistema podría usar esas credenciales, especialmente si SSH está activo.

Antes de conectarse a una red no confiable:

1. Establezca contraseñas únicas para usuario y root en el Configurador de MiniOS.
2. Seleccione un perfil de seguridad adecuado y revise cada control configurado.
3. Desactive SSH y XRDP a menos que se requiera acceso remoto.
4. Reinicie en una nueva sesión al cambiar configuraciones de cuentas de un solo uso o de seguridad, y luego verifique el inicio de sesión y el comportamiento de privilegios resultantes.

El Configurador almacena los hashes de contraseñas cifrados, no las contraseñas en texto plano. Si cambia una cuenta persistente ya creada, use `passwd` para el usuario actual y `sudo passwd root` para root. Tras la conversión nativa, utilice las herramientas habituales de gestión de cuentas de Debian.

## Utilice los controles de seguridad del Configurador

El Configurador de MiniOS ofrece tres perfiles. Un perfil llena ajustes concretos; el nombre del perfil no se guarda como clave de configuración en tiempo de ejecución, y cada ajuste sigue siendo editable de forma independiente.

| Perfil | Comportamiento principal |
| --- | --- |
| `convenient` | Compatible con inicio de sesión automático, sudo y PolicyKit sin contraseña, root y SSH por contraseña permitidos, XRDP/X11/pantalla de bloqueo relajados, pistas de contraseña visibles. |
| `balanced` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, inicio de sesión SSH como root denegado pero SSH por contraseña permitido, XRDP/X11/pantalla de bloqueo reforzados. |
| `strict` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, inicio de sesión SSH como root y por contraseña denegados, XRDP deshabilitado, X11/pantalla de bloqueo reforzados, pistas de contraseña ocultas. |

Los valores predeterminados del instalador varían según el modo de despliegue: las instalaciones en vivo favorecen `convenient`, mientras que la conversión nativa parte de `balanced`. El ajuste nativo se aplica durante la conversión; después de la instalación, utilice la configuración de seguridad estándar de Debian. Estos son valores predeterminados, no recomendaciones para todos los modelos de amenazas.

Los mismos ajustes están disponibles como claves de configuración documentadas, incluyendo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, y `LIVE_LOCKSCREEN_MODE`. Prefiera estas claves o el Configurador en lugar de editar archivos generados de sudoers, PolicyKit, display-manager o SSH. Consulte [Archivo de configuración](/reference/configuration/config.conf).
Para el comportamiento de guardado y la aplicabilidad de los ajustes, consulte [Configurador de MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

La creación de cuentas, contraseñas, `LIVE_CONFIG_NOROOT`, y la postura de seguridad son configuraciones de un solo uso aplicadas al crear una nueva sesión. El Configurador muestra la aplicabilidad de cada control. Los ajustes reconfigurables, como los servicios, se aplican tras reiniciar.

## Acceso remoto seguro

SSH puede estar habilitado en una imagen de MiniOS para tareas de recuperación. En una red donde otros usuarios no son de confianza, asuma que las credenciales predeterminadas publicadas están expuestas hasta que lo confirme.

- Si no necesita SSH, agregue `ssh` a `DISABLE_SERVICES` en el Configurador y elimínelo de `ENABLE_SERVICES` si está presente.
- Si necesita SSH, deniegue el inicio de sesión como root con `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefiera la autenticación por clave. Confirme el inicio de sesión por clave en una conexión aparte antes de establecer `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restringa el acceso entrante mediante el firewall de red o el router, y no exponga un sistema de recuperación portátil directamente a Internet.
- Revise XRDP por separado. El perfil estricto lo deshabilita; el perfil equilibrado lo refuerza pero no necesariamente desactiva su servicio.

Los parámetros de arranque pueden sobrescribir los valores del archivo de configuración. Revise el comportamiento inesperado de los servicios consultando [Parámetros de arranque](/reference/Boot-Parameters).

## Cifre los datos persistentes

La persistencia sin cifrar en modo nativo, DynFileFS, DynBlk, VMDK, raw y SquashFS puede ser leída por quien obtenga el dispositivo. MiniOS puede superponer LUKS2 sobre Raw, DynFileFS, DynBlk o VMDK. LUKS2 sigue siendo una capa de cifrado, no un modo de sesión independiente. Para crearla al arrancar, selecciónela con `perchencrypt=luks`; las sesiones existentes obtienen su estado de cifrado desde los metadatos de la sesión y no por una anulación posterior en la línea de comandos.

El límite de cifrado varía según el backend. Raw cifra la imagen de bloques lógicos dentro de `changes.img`; DynFileFS cifra el `virtual.dat` expuesto; DynBlk y VMDK cifran el dispositivo de bloques expuesto por el controlador DynBlk. Los metadatos de sesión, archivos de arranque, metadatos del backend y descriptores VMDK fuera del dispositivo de bloques cifrado, y archivos no relacionados en el medio, permanecen visibles. La compresión del backend de DynBlk se desactiva cuando se selecciona LUKS2; VMDK no ofrece compresión de backend.

El initrd crea el sistema de archivos cifrado en el primer uso y solicita su frase de contraseña; el instalador no recibe ni almacena esa frase. Al arrancar, tres intentos fallidos de desbloqueo detienen el arranque en vez de continuar en modo sin cifrar, con otro backend o con un reemplazo en memoria bajo la misma petición de persistencia.

La capa de persistencia LUKS2 de MiniOS protege el contenido del sistema de archivos mientras el mapper está cerrado. No protege los datos tras el desbloqueo, los archivos de arranque sin cifrar, los archivos copiados fuera del backend cifrado ni un sistema de archivos raíz nativo. El cifrado en persistencia por capas no es cifrado raíz nativo. Las exportaciones lógicas contienen archivos de sesión descifrados, por lo que debe proteger los respaldos por separado. Use una frase de contraseña robusta y mantenga una copia de seguridad probada.

El almacenamiento temporal de caché o journal es una opción para reducir escrituras, no para cifrar. Incluso con `LIVE_LOG_STORAGE=volatile`, MiniOS mantiene `minios-boot` y `live-config` diagnósticos en el almacenamiento de sesión duradero. Para SquashFS, estos archivos quedan fuera de `changes.sb`, en el directorio `boot-logs/` de la sesión. Un dispositivo de respaldo sin cifrar los expone junto con sus otros archivos. `LIVE_CONFIG_DEBUG=true` también habilita trazas detalladas y copias de entradas de fusión de cuentas de usuario; mantenga la depuración desactivada en uso normal y revise esos registros antes de compartirlos. Consulte [Rendimiento](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Consulte [Instalador de MiniOS](/installing-minios/MiniOS-Installer) y [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Aplique actualizaciones de forma deliberada

Actualice los metadatos de los paquetes e instale actualizaciones de seguridad de Debian en sesiones en vivo persistentes usando el flujo de trabajo habitual de APT cuando sea apropiado. Los cambios de APT en una sesión en vivo nueva desaparecen al reiniciar. Los módulos base de SquashFS son de solo lectura, por lo que reemplazar el ISO o los módulos por una versión más reciente y confiable de MiniOS suele ser la forma más limpia de actualizar el sistema en vivo base. Tras la conversión nativa, el mantenimiento de seguridad de paquetes es simplemente el flujo de trabajo estándar de APT de Debian para ese sistema instalado.

Consulte [Actualizaciones de software](/maintenance-and-recovery/Updating-MiniOS) para los flujos de trabajo separados de APT, módulos, imagen y kernel.

Antes de una actualización grande:

- Realice una copia de seguridad de archivos importantes y sesiones persistentes.
- Confirme que hay suficiente espacio libre disponible.
- Evite interrumpir escrituras o apagar el dispositivo.
- Reinicie y verifique el sistema actualizado antes de descartar los medios o sesiones anteriores conocidos como funcionales.

## Considere hooks y preseed como ejecución de código

La opción de arranque `hooks` y los hooks de live-config pueden ejecutar archivos desde el sistema de archivos raíz, el medio de arranque o una URL. Los hooks remotos, los hooks de medios modificados y los preseed no revisados pueden ejecutarse con privilegios de sistema. Use solo archivos revisados de una fuente confiable, prefiera la distribución autenticada y evite hooks remotos en redes no confiables. Consulte [live-config](/reference/configuration/live-config) para el orden de ejecución y ubicaciones soportadas.

## Haga copias de seguridad y retire los medios de forma segura

La persistencia no es una copia de seguridad. Mantenga una copia separada de los archivos de usuario y exporte o copie las sesiones mientras estén en buen estado. Pruebe la restauración en diferentes medios.
Apague correctamente antes de retirar el almacenamiento escribible y deje espacio libre para los metadatos de sesión y el funcionamiento del sistema de archivos.

Antes de desechar un dispositivo, elimínelo de forma segura según la tecnología de almacenamiento y la sensibilidad de los datos. Eliminar archivos o reformatear por sí solo puede no hacer que los datos antiguos sean irrecuperables.
