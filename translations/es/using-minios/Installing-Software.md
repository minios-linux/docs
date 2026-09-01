---
updated: 2026-08-31
program_commits:
    minios-store: 2226f08d65dffd251ae016664239164a3b237fc0
---

# Instalación de software

La Tienda de aplicaciones de MiniOS ofrece un catálogo de recetas de aplicaciones en [store.minios.dev](https://store.minios.dev). En el entorno en vivo MiniOS, esas recetas pueden instalarse directamente en el sistema en ejecución o utilizarse para construir uno o más módulos SquashFS (`.sb`).

Esta página describe el flujo de trabajo de software en vivo MiniOS. Una instalación nativa conserva el escritorio y las aplicaciones seleccionadas, pero elimina el software específico de MiniOS destinado a la operación en vivo. En ese sistema instalado, utiliza el flujo de trabajo normal de gestión de paquetes de Debian.

No se requiere un servidor local para explorar el catálogo. Para la instalación sí: la interfaz web se conecta al demonio local de la Tienda de aplicaciones de MiniOS o abre el manejador de URI instalado `minios-store://`.

## Antes de instalar

Abre los detalles de una aplicación y revisa la siguiente información antes de añadirla al carrito:

- Los nombres de los paquetes y el método de instalación.
- El script de instalación, si se muestra alguno.
- La página principal de la aplicación y la información del desarrollador.
- Si la receta descarga un paquete Debian por separado.

Las recetas pueden instalar paquetes APT, descargar paquetes Debian o ejecutar scripts de shell. Las operaciones de instalación se ejecutan con privilegios de root. Considera cada receta y todas las descargas o repositorios que utilice como código privilegiado.

## Instalar una aplicación

1. Abre la Tienda de aplicaciones de MiniOS desde el menú de aplicaciones. El lanzador verifica `https://store.minios.dev` y lo abre en el navegador predeterminado.
2. Busca o navega por categorías, abre los detalles de la aplicación y revisa los paquetes o el script.
3. Añade una o más aplicaciones al carrito.
4. En una sesión en vivo MiniOS, selecciona `Module` o `System`.
5. Para varias aplicaciones en modo módulo, elige un módulo combinado o módulos separados. También puedes asignar un nombre personalizado a un módulo combinado.
6. Selecciona `Install` y sigue el progreso y la salida de comandos. La página utiliza el demonio local cuando su estado es `Connected`; de lo contrario, intenta usar el manejador de URI y puede mostrar un aviso de autenticación de PolicyKit.

Solo puede ejecutarse un lote de instalación del demonio a la vez. Cerrar el diálogo de progreso no necesariamente detiene una instalación del demonio; vuelve a abrir el indicador de instalación para verla o cancélala explícitamente.

## Modos de módulo y de sistema

### Modo módulo

El modo módulo ejecuta `apt2sb` o `script2sb` en un entorno aislado de construcción de módulos. Escribe los archivos resultantes `.sb` en la primera ubicación con permisos de escritura de la siguiente lista:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

La primera ruta corresponde al directorio de módulos en el almacenamiento de arranque actual de MiniOS. Un módulo creado allí no se activa en la sesión actual por la Tienda de aplicaciones de MiniOS. Deja el módulo en ese directorio y reinicia para cargarlo en el siguiente arranque. El resultado solo estará disponible si el almacenamiento de arranque subyacente es escribible y conserva el archivo.

La segunda ruta es una alternativa utilizada cuando el directorio de módulos habitual no es escribible. Un módulo en el directorio alternativo no se incluye automáticamente en el próximo arranque en vivo. Usa `Open folder`, luego copia el módulo terminado al directorio `minios/modules` en un medio de arranque MiniOS escribible antes de reiniciar.

Un módulo combinado contiene todas las recetas seleccionadas. Con empaquetado separado, un fallo puede afectar a una receta mientras que los módulos completados previamente en el lote permanecen en el directorio de destino.

### Modo sistema

El modo sistema utiliza APT o un script de receta directamente sobre el sistema de archivos raíz en ejecución. Los cambios tienen efecto en el sistema en vivo actual en lugar de generar un módulo. Si esos cambios persisten tras un reinicio depende de la configuración de persistencia de la sesión.

El modo sistema no es transaccional. Una operación fallida o cancelada puede dejar paquetes, el estado del repositorio o archivos modificados por comandos anteriores.

## Servicio local y límite de confianza

El servicio `minios-store` se ejecuta como root porque la construcción de módulos y la instalación directa de paquetes requieren operaciones de montaje, overlay, chroot, APT y dpkg. Por defecto, solo escucha en `ws://127.0.0.1:8765`. La interfaz web alojada envía los datos completos de la receta, incluidos scripts y URLs de descarga, a este servicio local.

El demonio valida la estructura de la solicitud y el método de instalación soportado, pero no autentica ni firma de forma independiente la carga útil de la receta. Una página que pueda acceder al endpoint local de WebSocket puede solicitar tareas de instalación privilegiadas. Por lo tanto:

- Mantén el demonio vinculado a `127.0.0.1`. No expongas el puerto `8765` a una LAN ni a internet.
- No configures `MINIOS_STORE_HOST` a una dirección que no sea loopback a menos que exista una barrera de seguridad adicional y revisada.
- Accede a la Tienda de aplicaciones de MiniOS solo a través de su sitio web oficial HTTPS y revisa las recetas antes de instalar.
- Detén o desactiva el servicio cuando no se requiera la instalación desde el navegador.

Gestiona el servicio systemd con:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

El manejador de URI es una ruta separada. Inicia el instalador GTK mediante PolicyKit y no requiere el demonio WebSocket. Las entradas URI actuales se interpretan como nombres de paquetes APT con un nivel de módulo y configuración de compresión solicitados. El instalador se inicia tras la autorización, así que revisa la solicitud del navegador antes de aceptar el aviso de autenticación.

## Cancelación

Selecciona `Cancel` en el diálogo de progreso web o `Cancel installation` en el instalador GTK. La cancelación marca el lote como cancelado y termina el proceso hijo actualmente en seguimiento. Las recetas restantes no se inician.

La cancelación no es una reversión. Los paquetes o módulos completados anteriormente permanecen, y un comando interrumpido durante APT, dpkg, un script, descarga o construcción de módulo puede dejar un estado parcial o un archivo de salida incompleto. Tras cancelar:

1. Lee el registro final de instalación.
2. Revisa el directorio de módulos de destino en busca de archivos inesperados o de tamaño cero.
3. Para modo sistema, ejecuta `sudo dpkg --audit` y repara la configuración de paquetes si es necesario.
4. Elimina solo los artefactos que hayas identificado como pertenecientes a la operación cancelada.

## Resolución de problemas

### La Tienda de aplicaciones de MiniOS está sin conexión

Verifica el acceso de red a `https://store.minios.dev`. Un estado `Offline` también significa que el navegador no está conectado al demonio local de WebSocket; la instalación aún puede continuar mediante el manejador de URI si `minios-store-gui` está instalado.

### El navegador no puede conectarse al demonio

Verifica el servicio y sus registros:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

El endpoint normal es `ws://127.0.0.1:8765`. Un conflicto de puerto, servicio detenido, falta de `python3-websockets` o restricciones del navegador pueden impedir la conexión. Reiniciar el navegador no soluciona un demonio detenido.

### Fallo de autenticación o no aparece el aviso

El instalador URI requiere PolicyKit, `pkexec` y un agente de autenticación de escritorio activo. Inicia el instalador desde una sesión gráfica activa y verifica que `minios-store-gui` esté instalado. No evites el aviso exponiendo el demonio root en la red.

### Error en la construcción del módulo

Expande el registro de instalación y utiliza el último error de comando en lugar de solo el resumen. Las causas comunes incluyen paquetes no disponibles, fallos de repositorio o DNS, espacio libre insuficiente, una herramienta de compresión no soportada y un directorio de módulos de solo lectura. El demonio informa cuando ha cambiado a `/var/lib/minios-store/modules`.

### La aplicación no aparece después de la instalación

Para el modo módulo, reinicia después de confirmar que el archivo `.sb` está en el directorio `minios/modules` del medio de arranque. Un archivo dejado en el directorio de respaldo no se carga automáticamente. Para el modo sistema en una sesión en vivo, verifica que la sesión sea persistente si la aplicación desapareció tras reiniciar.

### Una instalación de sistema cancelada dejó dpkg sin finalizar

Inspecciona el estado de los paquetes antes de volver a intentar:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Revisa los cambios propuestos por APT antes de confirmar cualquier operación de reparación adicional.

## Documentación relacionada

- [Creación de módulos](/preparing-and-customizing/Managing-Modules)
- [Reconstrucción de ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
