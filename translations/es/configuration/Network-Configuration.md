# Configuración de red

Después de iniciar MiniOS, NetworkManager gestiona normalmente las conexiones por cable y Wi-Fi. Esto es independiente de la red del initramfs utilizada para descargar un sistema PXE o HTTP-ISO. En particular, el parámetro PXE `ip=` no crea un perfil de NetworkManager ni establece una dirección de sesión permanente. Consulta [Arranque por red](/installation/Network-Boot.md) para la red en el arranque temprano.

## Configuración del escritorio

Utiliza el icono de red en el panel del escritorio para seleccionar una red Wi-Fi, desconectar o reconectar un dispositivo, o abrir el editor de conexiones. Para una dirección estática por cable, edita la conexión cableada y establece su método IPv4 en Manual, luego ingresa la dirección y el prefijo, la puerta de enlace y los servidores DNS. Configura el método en Automático (DHCP) para usar DHCP.

La interfaz de texto ofrece las mismas operaciones comunes:

```bash
nmtui
```

Elige **Editar una conexión** para modificar un perfil y **Activar una conexión** para ponerla en funcionamiento.

## Línea de comandos de NetworkManager

Muestra dispositivos y perfiles guardados:

```bash
nmcli device status
nmcli connection show
```

Busca redes Wi-Fi y conéctate:

```bash
nmcli radio wifi on
nmcli device wifi list
nmcli device wifi connect "NETWORK_NAME" --ask
```

El último comando solicita la contraseña sin colocarla en la línea de comandos. No pongas la contraseña Wi-Fi directamente en un comando, ya que puede quedar en el historial del shell y ser visible para otros procesos.

Para cambiar un perfil cableado existente a DHCP:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
nmcli connection up "Wired connection 1"
```

Para asignar una dirección IPv4 estática:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method manual ipv4.addresses 192.0.2.10/24 \
  ipv4.gateway 192.0.2.1 ipv4.dns "1.1.1.1 9.9.9.9"
nmcli connection up "Wired connection 1"
```

Reemplaza el nombre del perfil y las direcciones por los valores de la red local. Una conexión remota puede interrumpirse tan pronto como se cambie su perfil activo.

## Persistencia

NetworkManager guarda los perfiles del sistema en
`/etc/NetworkManager/system-connections/`. En un arranque en vivo sin persistencia,
los cambios realizados desde el escritorio, `nmcli` o `nmtui` se pierden al apagar. En una sesión persistente, permanecen en esa sesión tras reinicios. Consulta [Gestión de sesiones](/configuration/Session-Management.md) para seleccionar y guardar sesiones.

Los perfiles no se comparten automáticamente entre sesiones persistentes separadas. Los perfiles Wi-Fi pueden contener credenciales, así que protege el medio de la sesión y elimina las credenciales antes de compartir un archivo de sesión o un volcado de diagnóstico.

## Preconfiguración de una conexión por cable

El componente de red live-config de MiniOS puede crear una política IPv4 estática por cable antes de que se inicien los servicios de red. Está pensado para sistemas desatendidos o instalados. No configura Wi-Fi.

Agrega asignaciones al estilo shell en `minios/config.conf` en el medio de MiniOS o en `/etc/live/config.conf` en el sistema en vivo:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Entrecomilla los valores como cadenas de shell y no añadas espacios alrededor de `=`. Consulta [Archivo de configuración](/configuration/Configuration-File.md) para ubicaciones y prioridad de archivos, y [live-config](/configuration/live-config.md) para activación de componentes y opciones generales.

Las opciones de arranque equivalentes son:

```text
network-method=static network-interface=enp1s0 \
network-address=192.0.2.10 network-prefix=24 \
network-gateway=192.0.2.1 network-dns=1.1.1.1,9.9.9.9 \
network-backend=auto
```

También se aceptan las formas largas `live-config.network-*`. Estas son opciones de live-config en el espacio de usuario tardío, no la sintaxis PXE `ip=`.

### Métodos

| Método | Comportamiento |
|--------|---------------|
| Sin definir o `dhcp` | No realiza cambios y conserva la configuración de red existente de la imagen. No crea configuración DHCP ni elimina un perfil estático previo de MiniOS. |
| `static` | Escribe un perfil IPv4 estático por cable. El prefijo predeterminado es `24`; la puerta de enlace y DNS son opcionales. |
| `off` | Escribe un perfil de NetworkManager sin autoconexión con IPv4 deshabilitado, o una sección ifupdown `manual`. No es un interruptor de radio Wi-Fi. |

Solo `static` y `off` seleccionan una interfaz y escriben la configuración. Si se omite `LIVE_NETWORK_INTERFACE`, live-config solo continúa cuando hay exactamente una interfaz cableada no loopback disponible. Las interfaces inalámbricas quedan excluidas. Usa `ip link` o `nmcli device status` para obtener el nombre real de la interfaz en un sistema con varias interfaces.

### Backends y validación

`LIVE_NETWORK_BACKEND` acepta:

| Backend | Comportamiento |
|---------|---------------|
| `auto` o sin definir | Prefiere NetworkManager y recurre a ifupdown si es necesario. |
| `nm` | Requiere NetworkManager y escribe `/etc/NetworkManager/system-connections/minios-static.nmconnection`. |
| `ifupdown` | Requiere ifupdown y escribe `/etc/network/interfaces.d/minios-static`. Si NetworkManager está instalado, también marca la interfaz seleccionada como no gestionada en `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. |

Los nombres de interfaz solo pueden contener letras, dígitos, `_`, `.`, `:` y `-`.
Las direcciones y puertas de enlace estáticas deben ser direcciones IPv4 válidas. El prefijo debe ser un entero de `0` a `32`. DNS es una lista separada por comas de direcciones IPv4 o IPv6. Los valores no válidos, la selección ambigua de interfaz y la falta de backends disponibles se informan y no se escribe ningún sello de éxito.

## Cambiar la política persistente de live-config

En un sistema en vivo persistente, el componente de red normalmente se aplica una vez y registra el éxito en `/var/lib/live/config/network`. Para aplicar cambios en la configuración estática o desactivar:

1. Edita el `/etc/live/config.conf` persistente efectivo.
2. Elimina el sello con `sudo rm /var/lib/live/config/network`.
3. Reinicia.

Cambiar solo la configuración en el medio extraíble no sobrescribe un `/etc/live/config.conf` persistente existente.

Establecer `LIVE_NETWORK_METHOD="dhcp"` no es un restablecimiento de perfil. Para volver de un perfil estático gestionado por MiniOS al DHCP normal de NetworkManager, elimina la política estática `LIVE_NETWORK_*` de la configuración efectiva, borra el perfil gestionado y el sello, y reinicia:

```bash
sudo rm -f /etc/NetworkManager/system-connections/minios-static.nmconnection
sudo rm -f /var/lib/live/config/network
```

Para el backend ifupdown, elimina
`/etc/network/interfaces.d/minios-static` y
`/etc/NetworkManager/conf.d/99-minios-unmanaged.conf` en su lugar. Luego crea o activa un perfil DHCP con el editor de escritorio, `nmtui` o `nmcli` si NetworkManager no crea uno automáticamente.

## Comportamiento del instalador

El paso de Red del instalador solo aplica a la red cableada. Una configuración IPv4 estática seleccionada se escribe para el sistema instalado. Si se selecciona DHCP, se mantienen los valores predeterminados normales en lugar de escribir un restablecimiento de perfil. Los perfiles y configuraciones Wi-Fi existentes no se modifican.

## Diagnóstico

Comienza revisando el dispositivo, la dirección, la ruta y el estado de NetworkManager:

```bash
ip link
ip address
ip route
nmcli general status
nmcli device status
nmcli connection show --active
systemctl status NetworkManager --no-pager
```

Revisa el registro de arranque actual para errores de dispositivo, firmware, DHCP y live-config:

```bash
journalctl -b -u NetworkManager
journalctl -b | grep 'live-config: network'
dmesg
```

Para una política live-config, también verifica la configuración efectiva, el archivo generado y el sello. El registro principal de live-config es `/var/log/live/config.log`.

Prueba los fallos en este orden: estado del enlace, una dirección en la interfaz, la ruta y puerta de enlace predeterminadas, una dirección IP externa y finalmente un nombre DNS. Esto permite distinguir problemas de dispositivo o firmware de los problemas de DHCP, enrutamiento y DNS. Consulta [Solución de problemas](/administration/Troubleshooting.md) para comprobaciones más amplias y recopilación de registros.

## Consulta también

- [Arranque por red](/installation/Network-Boot.md)
- [Archivo de configuración](/configuration/Configuration-File.md)
- [live-config](/configuration/live-config.md)
- [Solución de problemas](/administration/Troubleshooting.md)
- [Gestión de sesiones](/configuration/Session-Management.md)
