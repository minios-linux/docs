# Guía de Endurecimiento de Seguridad

Esta guía proporciona pasos prácticos para mejorar la seguridad de tu sistema MiniOS. Dado que MiniOS es un sistema en vivo, las principales preocupaciones de seguridad son proteger los datos del usuario en el almacenamiento persistente y controlar el acceso al sistema en ejecución. La configuración predeterminada prioriza la comodidad para el uso portátil, pero puede no ser óptima para todos los escenarios. Las siguientes recomendaciones te ayudarán a configurar el sistema para una mayor seguridad.

## Seguridad de las Cuentas de Usuario y Root

Por defecto, MiniOS realiza el inicio de sesión automático sin contraseña. Esto proporciona comodidad para el uso portátil, pero puede representar un riesgo de seguridad en algunos escenarios.

**Credenciales predeterminadas:**
- **Usuario**: `live` / `evil`  
- **Root**: `root` / `toor`

⚠️ **Estas credenciales son de conocimiento público y deben cambiarse inmediatamente para cualquier uso en red o en producción.**

### Creación de una Contraseña Encriptada

Antes de configurar las contraseñas, se recomienda crear un hash de contraseña encriptada:

```bash
# The command will prompt you to enter a password and output the hash
mkpasswd -m yescrypt
# Example output: $y$j9T$...(long hash)...$Spig/F.uP
```

### Configuración de Contraseñas

Puedes establecer contraseñas de dos maneras: **se recomienda encarecidamente** usar contraseñas encriptadas.

**Importante:** La configuración de contraseñas y parámetros de cuentas de usuario mediante parámetros de arranque y archivos de configuración solo tiene efecto en el primer arranque del sistema. Después de eso, las contraseñas solo pueden cambiarse usando los métodos estándar de Linux (`passwd`, `sudo passwd`).

#### Vía Parámetros de Arranque

Agrega los parámetros a la línea de comandos del kernel en el menú de arranque (GRUB para UEFI o SYSLINUX para BIOS):

**Para contraseñas encriptadas (recomendado):**
```
user-password-crypted='$y$j9T$...(hash).../'
root-password-crypted='$y$j9T$...(hash).../'
```

**Para contraseñas en texto plano (no recomendado):**
```
user-password='your_password'
root-password='root_password'
```

**Importante:** Las contraseñas en texto plano son visibles en la línea de comandos del kernel y pueden ser leídas por otros usuarios del sistema.

#### Vía Archivo de Configuración

Edita el archivo `minios/config.conf` en el directorio raíz de la unidad USB:

**Para contraseñas encriptadas:**
```
LIVE_USER_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
LIVE_ROOT_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
```

**Para contraseñas en texto plano:**
```
LIVE_USER_PASSWORD="your_password"
LIVE_ROOT_PASSWORD="root_password"
```

### Cambio de Contraseñas Después del Arranque

Después del primer arranque del sistema, las contraseñas pueden cambiarse usando los comandos estándar de Linux:

```bash
# Change current user password
passwd

# Change root user password (requires sudo)
sudo passwd root

# Change specific user password (requires sudo)
sudo passwd username
```

### Deshabilitar el Inicio de Sesión Automático

Después de establecer contraseñas, desactiva el inicio de sesión automático para requerir autenticación:

#### Vía Parámetros de Arranque

```
noautologin
```

#### Vía Archivo de Configuración

```
LIVE_CONFIG_CMDLINE="components noautologin"
```

**Desactivación parcial del autologin:**
- `nox11autologin` - desactiva solo el inicio de sesión automático gráfico (el gestor de inicio de sesión requerirá autenticación)
- `nottyautologin` - desactiva solo el inicio de sesión automático en consola (ya desactivado por defecto)

### Gestión de Privilegios de Usuario

Por defecto, el usuario `live` tiene privilegios de administrador completos sin solicitar contraseña tanto en consola (`sudo`) como en aplicaciones gráficas (a través de polkit). Esto proporciona comodidad para el uso del sistema en vivo, pero puede requerir ajustes para una mayor seguridad.

#### Habilitar Solicitud de Contraseña para sudo

Para requerir la introducción de contraseña al usar `sudo`, ejecuta después de iniciar el sistema:

```bash
# Change rule to require password
echo "live ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/live
```

Después de esto, los comandos `sudo` solicitarán la contraseña del usuario.

#### Habilitar Solicitud de Contraseña para Aplicaciones Gráficas

Para que los programas administrativos gráficos soliciten contraseña, elimina la regla de polkit:

```bash
sudo rm /usr/share/polkit-1/rules.d/sudo_on_live.rules
```

Después de esto, los instaladores de software, la configuración del sistema y otras aplicaciones administrativas con interfaz gráfica solicitarán contraseña.

#### Deshabilitación Completa de Derechos Administrativos (`noroot`)

Para máxima seguridad, puedes deshabilitar completamente `sudo` y el acceso root:

**Vía parámetros de arranque:**
```
noroot
```

**Vía archivo de configuración:**
```
LIVE_CONFIG_NOROOT=true
```

**Efecto:** El comando `sudo` no funcionará, el inicio de sesión como root estará deshabilitado y no habrá acciones administrativas disponibles.

## Seguridad de Red

### Configuración SSH Predeterminada

**Por qué SSH está habilitado por defecto:** MiniOS está diseñado como un sistema de recuperación y diagnóstico para reparar hardware defectuoso. SSH está habilitado con configuraciones permisivas para proporcionar acceso remoto cuando la pantalla local no está disponible, está dañada o se trabaja con sistemas sin monitor.

**Configuración actual de SSH:**
- El servicio SSH está habilitado y se inicia automáticamente
- Se permite el acceso root vía SSH
- La autenticación por contraseña está habilitada

**Implicaciones de seguridad:** Esta configuración genera riesgos de seguridad en redes no confiables, pero es necesaria para escenarios de recuperación.

### Deshabilitar SSH

Si no se necesita acceso remoto, desactiva SSH completamente:

**Vía parámetros de arranque:**
```
disable-services=ssh,avahi-daemon
```

**Vía archivo de configuración:**
```
DISABLE_SERVICES=ssh,avahi-daemon
```

### Configuración Segura de Acceso SSH

Si SSH es necesario, asegúralo usando los siguientes métodos:

#### 1. Establecer Contraseñas Fuertes

Utiliza los métodos de configuración de contraseñas descritos anteriormente.

#### 2. Autenticación por Clave SSH

Coloca los archivos `authorized_keys` en el directorio raíz de la unidad USB:

- `authorized_keys.root` - para el usuario root
- `authorized_keys.live` - para el usuario live
- `authorized_keys.username` - para otros usuarios

Un componente del sistema los desplegará automáticamente en los directorios home al arrancar.

#### 3. Endurecimiento de Seguridad SSH

Después de iniciar el sistema, edita la configuración de SSH:

```bash
sudo nano /etc/ssh/sshd_config.d/minios.conf
```

Cambia los ajustes por otros más seguros:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Reinicia el servicio SSH:
```bash
sudo systemctl restart ssh
```

**Importante:** Siempre prueba el acceso por clave SSH antes de deshabilitar la autenticación por contraseña.

## Seguridad de Arranque

### Secure Boot UEFI

MiniOS es totalmente compatible con Secure Boot, ya que utiliza el kernel estándar de Debian con gestores de arranque firmados. Secure Boot proporciona protección contra malware previo al arranque (bootkits) y se recomienda para una mayor seguridad.

### Contraseña BIOS/UEFI

Para seguridad física, establece una contraseña en la BIOS/UEFI de tu equipo para evitar que usuarios no autorizados arranquen desde otros dispositivos o cambien la configuración de arranque.
