---
updated: 2026-08-26
---

# Arranque por red

Esta página describe **cómo cargar MiniOS a través de la red**: PXE (kernel + initrd + datos de MiniOS) y HTTP ISO (`from=http://…`). Ese es el único propósito de la red dentro del initramfs de MiniOS.

**No** trata sobre:

- Configuración de NetworkManager o IP estática permanente después de iniciar el sistema
- Wi‑Fi en el initrd
- [live-config](/configuration/live-config.md) (usuariospace tardío)

La red de la sesión después del arranque es independiente. Para una IP estática cableada y persistente, utiliza el paso de Red del instalador, NetworkManager o ifupdown—no el parámetro PXE `ip=`.

Relacionado: [Parámetros de arranque](/configuration/Boot-Parameters.md) (`ip`, `from`, `cache`).

## Descripción general

| Modo | Qué se inicia | Cómo se obtiene la data de MiniOS |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd desde un servidor de arranque por red | `ip=` no vacío sin `from=http://…` → el initrd descarga los archivos de MiniOS desde el servidor de datos PXE |
| **HTTP ISO** | Kernel + initrd desde medio local **o** PXE | `from=http://…/minios.iso` → el initrd levanta la red y monta el ISO con `httpfs2` |
| **Medio local** | USB / ISO / disco | Sin red en initrd; solo búsqueda local |

Constructores de initramfs: **LiveKit** (`livekit-mos`) o **dracut** (`dracut-mos`). Ambos usan los mismos asistentes de red de LiveKit para la descarga temprana.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` tiene prioridad sobre `ip=`. En ese modo, `ip=` provee direccionamiento estático para la conexión HTTP ISO. De lo contrario, cualquier `ip=` no vacío selecciona la **ruta de datos PXE** y omite medios locales. No agregues `ip=` en un arranque normal por USB/ISO solo para "configurar una dirección estática". Ninguna ruta de red recurre a medios locales si falla la detección o descarga.

## Requisitos

| Requisito | Notas |
|-------------|--------|
| Ethernet cableada (o virtio/vmxnet en VMs) | Se utiliza la primera interfaz detectada que no sea loopback; no se verifica el enlace ni la conectividad, y no hay selección `BOOTIF` / `ethdevice` en el initrd |
| Initrd con módulos de red | Construido para variantes de paquete distintas al valor interno `minimum` (`--network`, usualmente `--cloud`) |
| Sin dependencia de Wi‑Fi | No se admite conexión inalámbrica en el arranque por red |
| Preferir NICs sin blobs de firmware | Las tarjetas que dependen de firmware suelen fallar en el initrd |
| Preferir imágenes **Standard** o mayores | La edición **Flux** omite módulos de NIC de red, por lo que PXE / HTTP ISO no están soportados |
| Solo HTTP para la URL del ISO | `from=http://…` funciona; **`https://` no está soportado** |

Herramientas en el initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` y `@mount.httpfs2`. No hay NetworkManager en el initrd.

## Arranque PXE

### Flujo

1. El firmware / servidor PXE carga el **kernel** y el **initrd** de MiniOS (pxelinux, iPXE, etc.—fuera de MiniOS).
2. La línea de comandos del kernel incluye un **`ip=`** no vacío (y normalmente `boot=live` para un arranque completo de MiniOS).
3. El initrd configura una dirección estática a partir de `ip=`, contacta el campo **server**, descarga una lista de archivos y luego los paquetes/archivos de MiniOS.
4. El sistema continúa hacia el root en vivo como de costumbre.

### Parámetro `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Campo | Función |
|-------|------|
| client-ip | Dirección asignada con busybox `ifconfig` |
| server-ip | Host para los datos de MiniOS por HTTP/TFTP; también se escribe como servidor DNS en el initrd |
| gateway-ip | Ruta por defecto; también se escribe como servidor DNS |
| netmask | Máscara de red IPv4 con puntos (no longitud de prefijo CIDR) |
| port | Puerto HTTP opcional para la lista de archivos y archivos (por defecto **7529**) |

Ejemplos:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Cómo se obtienen los archivos

1. **HTTP** (preferido):
   `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>`
   luego cada ruta listada en ese archivo desde el mismo host/puerto.
2. **TFTP**: busybox `tftp` se selecciona solo si la solicitud HTTP inicial para
   `PXEFILELIST` falla. Un fallo posterior en la descarga de archivos por HTTP no cambia la
   transferencia a TFTP.

El puerto predeterminado es **7529** cuando se omite el quinto campo.

### Qué no es `ip=`

| Expectativa | Realidad |
|-------------|---------|
| Formatos de kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **No soportado** — se interpreta erróneamente como una dirección de cliente |
| IP estática para toda la sesión live | **No soportado** — después del arranque, NetworkManager (o similar) controla la interfaz |
| IP estática al cargar datos de MiniOS desde USB/ISO | **No usar** — sin `from=http://…`, fuerza la descarga de datos por PXE |
| Lista DNS dedicada | Solo gateway + servidor se usan como servidores DNS en el initrd |

## Arranque HTTP ISO (`from=http://…`)

Carga los datos de MiniOS desde un ISO remoto sin una lista completa de archivos PXE:

```text
from=http://192.168.1.1/path/minios.iso
```

Comportamiento:

1. El initrd levanta la red:
   - Si se define **`ip=`** → configuración estática como arriba
   - Si se omite **`ip=`** → **DHCP** mediante busybox `udhcpc`
2. Monta el ISO remoto con **`httpfs2`**
3. Continúa buscando el contenido de MiniOS en ese montaje

El parámetro opcional **`cache=`** (en megabytes) habilita una caché de descarga httpfs, por ejemplo `cache=512`.

Solo se acepta **`http://`** para esta ruta de ISO remoto. **`https://` no está soportado.**

## Después de iniciar el sistema en vivo

| Elemento | Después de switch_root |
|------|-------------------|
| IP/rutas del kernel en la NIC | Pueden permanecer hasta que el userspace reconfigure la interfaz |
| DNS del initrd (`resolv.conf`) | No es una política de sesión duradera |
| Red de la sesión | Normalmente **NetworkManager** en las imágenes predeterminadas de MiniOS |
| Significado de `ip=` | Solo para descarga temprana — no es un perfil estático recordado |

Si el root sigue siendo alimentado por **httpfs**, que NetworkManager reconfigure la NIC puede interrumpir el root en vivo. Planifica los despliegues por red teniendo esto en cuenta (por ejemplo, copiar a RAM / evitar modificar la interfaz de descarga si es posible).

El userspace tardío **live-config** puede levantar la red brevemente solo para descargar hooks/preseeds remotos (`Setup_network`). Eso no está relacionado con el direccionamiento persistente de PXE/`ip=`.

## Errores comunes

1. Colocar `ip=` en la línea de comandos de USB/ISO "para IP estática" → el sistema intenta descargar por PXE en vez de usar el medio local a menos que `from=http://…` haya seleccionado primero el arranque HTTP ISO.
2. Usar `ip=dhcp` u otra sintaxis de kernel `ip=` → parser incorrecto, configuración de dirección rota.
3. Esperar selección de Wi‑Fi o multi-NIC `BOOTIF` en el initrd → no implementado.
4. Usar una imagen **Flux** para PXE/HTTP ISO → módulos de red ausentes en el initrd.
5. Servir el ISO solo por HTTPS → `from=http://…` no coincidirá.
6. Confundir esto con la configuración estática de NetworkManager/instalador después de iniciar sesión.

## Resumen de fiabilidad

| Escenario | Evaluación |
|----------|------------|
| PXE + `ip=…` + lista HTTP en :7529 (o TFTP después de que falle la solicitud HTTP de la lista), cableado simple / virtio | Objetivo soportado |
| `from=http://…iso` + DHCP (o `ip=`), misma clase de NIC | Suele funcionar |
| Arranque normal por USB/ISO | Red de initrd no utilizada |
| Sesión estática vía `ip=` | No soportado |
| Multi-NIC / NIC con firmware / Wi‑Fi / `https://` / edición Flux | Débil o no soportado |

## Referencia de implementación

| Componente | Ubicación en el árbol de MiniOS |
|-------|-----------------------------|
| Entrada de init | `linux-live/initramfs/livekit-mos/init` |
| Red + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Constructor LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Módulo dracut de MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Cuando se pasa `-n` | `linux-live/build-initramfs` (no-minimum) |

## Ver también

- [Parámetros de arranque](/configuration/Boot-Parameters.md) — tabla completa de parámetros (`ip`, `from`, `cache`, …)
- [Descubrimiento del sistema en initrd](/configuration/Initrd-System-Discovery.md) — prioridad de fuentes, descubrimiento local y comportamiento ante fallos
- [live-config](/configuration/live-config.md) — configuración tardía en userspace (no arranque por red)
- [Arquitectura del sistema](/about/System-Architecture.md)
- [Compilación de MiniOS](/development/Building-MiniOS.md) — constructor de initramfs (`livekit` / `dracut`)
