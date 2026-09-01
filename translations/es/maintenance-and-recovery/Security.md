---
updated: 2026-08-31
---

# Seguridad

Los controles de seguridad de MiniOS están diseñados en torno al sistema en vivo: sesiones temporales, sesiones persistentes, medios portátiles y la configuración al inicio. El Instalador de MiniOS puede realizar también una conversión nativa. El sistema resultante mantiene el entorno de escritorio seleccionado y la identidad visual de MiniOS, pero se elimina el software específico del modo live de MiniOS, por lo que puedes asegurar y mantener el sistema con las herramientas normales de Debian en lugar de tratarlo como otro modo en vivo.
Protege la sesión en ejecución, los datos persistentes, el medio de arranque y cualquier configuración que se aplique al inicio.

## Comienza con medios confiables

Descarga MiniOS desde una fuente oficial y verifica el ISO antes de grabarlo.
Sigue [Verificar descargas](/installing-minios/Verifying-Downloads) y compara el resultado antes de arrancar o instalar. La verificación detecta una descarga dañada o sustituida; no garantiza que un dispositivo USB ya modificado sea seguro.

Mantén el dispositivo USB bajo control físico. Las contraseñas de firmware y el orden de arranque restringido pueden reducir arranques no autorizados casuales, pero no cifran los archivos del dispositivo. Secure Boot puede proporcionar protección adicional de la cadena de arranque en imágenes y hardware que lo soporten; comprueba el comportamiento real de la versión y el firmware en lugar de asumir compatibilidad.

## Reemplaza las credenciales predeterminadas

Una imagen live de MiniOS sin personalizar utiliza las credenciales publicadas `live` / `evil` y `root` / `toor`, con inicio de sesión automático y acceso administrativo sin contraseña en su configuración orientada a la comodidad. Cualquiera que pueda acceder al sistema podría utilizar esas credenciales, especialmente si SSH está activo.

Antes de conectarte a una red no confiable:

1. Establece contraseñas únicas para usuario y root en el Configurador de MiniOS.
2. Selecciona un perfil de seguridad apropiado y revisa cada control configurado.
3. Desactiva SSH y XRDP a menos que se requiera acceso remoto.
4. Reinicia en una nueva sesión al cambiar configuraciones de cuentas de un solo uso o de seguridad, luego verifica el comportamiento de inicio de sesión y privilegios resultante.

El Configurador almacena los hashes de contraseña cifrados en lugar de contraseñas en texto plano. Si cambias una cuenta persistente ya creada, usa `passwd` para el usuario actual y `sudo passwd root` para root. Tras la conversión nativa, utiliza las herramientas normales de gestión de cuentas de Debian.

## Usa los controles de seguridad del Configurador

El Configurador de MiniOS proporciona tres perfiles. Un perfil llena configuraciones concretas; el nombre del perfil en sí no se guarda como clave de configuración en tiempo de ejecución, y cada ajuste permanece editable de forma independiente.

| Perfil | Comportamiento principal |
| --- | --- |
| `convenient` | Compatible con inicio de sesión automático, sudo y PolicyKit sin contraseña, SSH root y por contraseña permitidos, XRDP/X11/pantalla de bloqueo relajados, se muestran pistas de contraseña. |
| `balanced` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, inicio de sesión SSH como root denegado pero SSH por contraseña permitido, XRDP/X11/pantalla de bloqueo reforzados. |
| `strict` | Sin inicio de sesión automático, sudo y PolicyKit requieren contraseña, inicio de sesión SSH como root y por contraseña denegados, XRDP deshabilitado, X11/pantalla de bloqueo reforzados, pistas de contraseña ocultas. |

Los valores predeterminados del instalador varían según el modo de despliegue: las instalaciones live favorecen `convenient`, mientras que la conversión nativa comienza desde `balanced`. El ajuste nativo se aplica durante la conversión; después de la instalación, utiliza la configuración de seguridad normal de Debian. Estos son valores predeterminados, no recomendaciones para todos los modelos de amenaza.

Las mismas configuraciones están disponibles como claves de configuración documentadas, incluyendo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` y `LIVE_LOCKSCREEN_MODE`. Prefiere estas claves o el Configurador antes que editar archivos generados de sudoers, PolicyKit, display-manager o SSH. Consulta [Archivo de configuración](/reference/configuration/config.conf).
Para el comportamiento de guardado y la aplicabilidad de los ajustes, consulta [Configurador de MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

La creación de cuentas, contraseñas, `LIVE_CONFIG_NOROOT` y la postura de seguridad son configuraciones de un solo uso que se aplican al crear una nueva sesión. El Configurador muestra la aplicabilidad de cada control. Los ajustes reconfigurables como los servicios se aplican tras reiniciar.

## Asegura el acceso remoto

SSH puede estar habilitado en una imagen de MiniOS para tareas de recuperación. En una red donde otros usuarios no son de confianza, asume que las credenciales predeterminadas publicadas están expuestas hasta que confirmes lo contrario.

- Si SSH no es necesario, añade `ssh` a `DISABLE_SERVICES` en el Configurador y elimínalo de `ENABLE_SERVICES` si está presente.
- Si SSH es requerido, deniega el inicio de sesión como root con `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefiere la autenticación por clave. Confirma el inicio de sesión por clave en una conexión separada antes de establecer `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restringe el acceso entrante con el firewall de red o el router, y no expongas un sistema de recuperación portátil directamente a Internet.
- Revisa XRDP por separado. El perfil estricto lo deshabilita; el perfil equilibrado lo refuerza pero no necesariamente desactiva su servicio.

Los parámetros de arranque pueden sobrescribir los valores del archivo de configuración. Revisa el comportamiento inesperado de los servicios en [Parámetros de arranque](/reference/Boot-Parameters).

## Cifra los datos persistentes

La persistencia nativa, DynFileFS y sin cifrar puede ser leída por quien obtenga el dispositivo. El Instalador de MiniOS puede configurar un contenedor LUKS cifrado para una sesión en vivo cuando el initrd de origen anuncia soporte LUKS. El initrd crea `changes.luks` en el primer arranque y solicita su frase de contraseña; el instalador no recibe ni almacena esa frase.

La persistencia LUKS protege el contenido mientras el contenedor está cerrado. No protege los datos después del desbloqueo, los archivos de arranque sin cifrar, los archivos copiados fuera del contenedor ni un sistema de archivos raíz nativo. La persistencia de sesión LUKS no es cifrado nativo de root. Usa una frase de contraseña robusta y mantén una copia de seguridad probada.

Consulta [Instalador de MiniOS](/installing-minios/MiniOS-Installer) y [Gestión de sesiones](/using-minios/Sessions-and-Persistence).

## Aplicar actualizaciones de forma deliberada

Actualiza los metadatos de paquetes e instala actualizaciones de seguridad de Debian en sesiones live persistentes usando el flujo de trabajo normal de APT cuando sea apropiado. Los cambios hechos con APT en una sesión live nueva desaparecen al reiniciar. Los módulos base de SquashFS son de solo lectura, por lo que reemplazar el ISO o los módulos por una versión confiable más reciente de MiniOS suele ser la forma más limpia de actualizar el sistema live base. Tras la conversión nativa, el mantenimiento de seguridad de paquetes se realiza simplemente con el flujo de trabajo APT estándar de Debian para ese sistema instalado.

Consulta [Actualizaciones de software](/maintenance-and-recovery/Updating-MiniOS) para los flujos de trabajo separados de APT, módulos, imágenes y kernel.

Antes de una actualización grande:

- Haz copia de seguridad de archivos importantes y sesiones persistentes.
- Confirma que haya suficiente espacio libre disponible.
- Evita interrumpir escrituras o apagar el dispositivo.
- Reinicia y verifica el sistema actualizado antes de descartar el medio o la sesión anterior en buen estado.

## Trata los hooks y preseeding como ejecución de código

La opción de arranque `hooks` y los hooks de live-config pueden ejecutar archivos desde el sistema de archivos raíz, el medio de arranque o una URL. Los hooks remotos, hooks modificados en el medio y preseeds no revisados pueden ejecutarse con privilegios de sistema. Usa solo archivos revisados de una fuente confiable, prefiere la distribución autenticada y evita hooks remotos en redes no confiables. Consulta [live-config](/reference/configuration/live-config) para el orden de ejecución y las ubicaciones soportadas.

## Haz copias de seguridad y retira los medios de forma segura

La persistencia no es una copia de seguridad. Mantén una copia separada de los archivos de usuario y exporta o copia las sesiones mientras estén en buen estado. Prueba la restauración en diferentes medios.
Apaga correctamente antes de retirar el almacenamiento escribible y deja espacio libre para los metadatos de sesión y el funcionamiento del sistema de archivos.

Antes de desechar un dispositivo, elimínalo de forma segura según la tecnología de almacenamiento y la sensibilidad de los datos. Eliminar archivos o reformatear por sí solo puede no hacer que los datos antiguos sean irrecuperables.
