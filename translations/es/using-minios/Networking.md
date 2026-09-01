---
updated: 2026-08-31
---

# Redes

MiniOS utiliza **NetworkManager** para la gestión habitual de redes cableadas y Wi-Fi. MiniOS no reemplaza su modelo de conexión con un sistema de configuración de red independiente.

Para el uso común, abre el icono de red en el panel del escritorio. Las herramientas estándar de NetworkManager también están disponibles:

```bash
nmtui
nmcli
```

Utiliza estas herramientas para conectarte a Wi-Fi, cambiar de red, configurar direcciones DHCP o estáticas, DNS, conexiones VPN y otras tareas habituales de red en tiempo de ejecución. Para información completa sobre su funcionamiento, consulta la documentación y las páginas de manual de NetworkManager.

En una sesión persistente de MiniOS, los perfiles de conexión de NetworkManager se guardan como parte de esa sesión. En **Iniciar sin guardar**, los cambios desaparecen al apagar.

## Preconfiguración de red

La configuración de red específica de MiniOS es principalmente una **preconfiguración**. Es útil cuando una imagen, instalador o despliegue desatendido debe arrancar con una configuración cableada conocida antes de que el usuario abra NetworkManager.

El componente de red MiniOS `live-config` admite la preconfiguración cableada de IPv4. No preconfigura Wi-Fi.

Un ejemplo de configuración estática en `config.conf` es:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` acepta `dhcp`, `static` o `off`. Si no se establece o se usa `dhcp`, se mantiene la configuración de red existente de la imagen en lugar de reemplazar el comportamiento normal de NetworkManager. `static` escribe una configuración estática de IPv4 cableada; `off` prepara la interfaz cableada seleccionada para que no se conecte automáticamente. Con `LIVE_NETWORK_BACKEND="auto"`, MiniOS prefiere NetworkManager y recurre a ifupdown si es necesario. Si no se especifica ninguna interfaz, la preconfiguración solo se aplica cuando se puede identificar exactamente una interfaz cableada elegible.

Consulta [Archivo de configuración](/reference/configuration/config.conf) para saber dónde se almacenan estos ajustes y [live-config](/reference/configuration/live-config) para la referencia completa de variables y componentes.

## Cuándo se aplica la preconfiguración

El componente de red es un paso de configuración `live-config` que se realiza una sola vez. Después de ejecutarse correctamente en una sesión persistente, los cambios habituales de red deben realizarse con NetworkManager y no editando repetidamente la preconfiguración.

Si necesitas aplicar intencionadamente una preconfiguración de red MiniOS modificada en la misma sesión persistente, elimina su marca de finalización y reinicia:

```bash
sudo rm -f /var/lib/live/config/network
```

Haz esto solo si realmente deseas que `live-config` genere nuevamente la política cableada. Cambiar las conexiones normales de Wi-Fi o Ethernet no lo requiere.

## Preconfiguración del instalador

El paso de red del Instalador de MiniOS también realiza la preconfiguración para el sistema de destino. Admite ajustes cableados de DHCP o IPv4 estática. La configuración de Wi-Fi queda a cargo de NetworkManager una vez que el sistema instalado se inicia.

## El arranque temprano de red es diferente

NetworkManager configura el sistema MiniOS en ejecución. La red utilizada por el initramfs para obtener MiniOS es un mecanismo aparte.

Por lo tanto, el parámetro de arranque `ip=`, las descargas PXE y `from=http://...` no crean perfiles de NetworkManager y no deben usarse para configurar la red normal del escritorio. Consulta [Arranque por red](/reference/boot-process/Network-Boot).

## Resolución de problemas

Para un problema común de conexión, comienza con el propio NetworkManager:

```bash
nmcli device status
nmcli connection show --active
```

Utiliza el editor de conexiones del escritorio, `nmtui`, o los registros y documentación estándar de NetworkManager para problemas habituales de Wi-Fi, DHCP, DNS, VPN o Ethernet.

Los diagnósticos específicos de MiniOS son relevantes cuando el problema está relacionado con la preconfiguración de red o el arranque por red. El registro `live-config` es `/var/log/live/config.log`; los problemas tempranos de arranque por red se tratan en la guía [Arranque por red](/reference/boot-process/Network-Boot).

## Documentación relacionada

- [Archivo de configuración](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Arranque por red](/reference/boot-process/Network-Boot)
- [Gestión de sesiones](/using-minios/Sessions-and-Persistence)
