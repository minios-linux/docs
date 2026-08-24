# MiniOS Store

MiniOS Store ofrece un catálogo de recetas de aplicaciones en [store.minios.dev](https://store.minios.dev). En MiniOS, estas recetas pueden instalarse directamente en el sistema en ejecución o utilizarse para construir uno o más módulos SquashFS (`.sb`).

No se requiere un servidor local para explorar el catálogo. Para la instalación sí: la interfaz web se conecta al demonio local de MiniOS Store o abre el manejador de URI instalado `minios-store://`.

## Antes de instalar

Abre los detalles de una aplicación y revisa la siguiente información antes de añadirla al carrito:

- Los nombres de los paquetes y el método de instalación.
- El script de instalación, si se muestra alguno.
- La página web de la aplicación y la información del desarrollador.
- Si la receta descarga un paquete Debian por separado.

Las recetas pueden instalar paquetes APT, descargar paquetes Debian o ejecutar scripts de shell. Las operaciones de instalación se ejecutan con privilegios de root. Considera cada receta y todas las descargas o repositorios que utilice como código privilegiado.

## Instalar una aplicación

1. Abre MiniOS Store desde el menú de aplicaciones. El lanzador verifica `https://store.minios.dev` y lo abre en el navegador predeterminado.
2. Busca o navega por categoría, abre los detalles de la aplicación e inspecciona los paquetes o el script.
3. Añade una o más aplicaciones al carrito.
4. En una sesión en vivo de MiniOS, selecciona `Module` o `System`. Un sistema MiniOS instalado de forma nativa utiliza automáticamente el modo `System`.
5. Para varias aplicaciones en modo módulo, selecciona un módulo combinado o módulos separados. Un módulo combinado también puede recibir un nombre personalizado.
6. Selecciona `Install` y sigue el progreso y la salida de comandos. La página utiliza el demonio local cuando su estado es `Connected`; de lo contrario, intenta el manejador de URI y puede mostrar un aviso de autenticación de PolicyKit.

Solo puede ejecutarse un lote de instalación del demonio a la vez. Cerrar el diálogo de progreso no necesariamente detiene la instalación; vuelve a abrir el indicador de instalación para verla o cancélala explícitamente.

## Modos de módulo y sistema

### Modo módulo

El modo módulo ejecuta `apt2sb` o `script2sb` en un entorno aislado de construcción de módulos. Escribe los archivos resultantes `.sb` en la primera ubicación escribible de la siguiente lista:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

La primera ruta es el directorio de módulos en el medio de arranque actual de MiniOS. Un módulo creado ahí no se activa en la sesión actual mediante MiniOS Store. Deja el módulo en ese directorio y reinicia para cargarlo en el próximo arranque. El resultado solo estará disponible si el medio de arranque subyacente es escribible y conserva el archivo.

La segunda ruta es un respaldo que se usa cuando el directorio normal de módulos no es escribible. Un módulo en el directorio de respaldo no se incluye automáticamente en el siguiente arranque en vivo. Usa `Open folder` y luego copia el módulo terminado al directorio `minios/modules` en un medio de arranque MiniOS escribible antes de reiniciar.

Un módulo combinado contiene todas las recetas seleccionadas. Si se empaquetan por separado, un fallo puede afectar a una receta mientras que los módulos completados anteriormente en el lote permanecen en el directorio de destino.

### Modo sistema

El modo sistema utiliza APT o un script de receta directamente sobre el sistema de archivos raíz en ejecución. Los cambios tienen efecto en el sistema actual en lugar de producir un módulo. En una sesión en vivo, la persistencia de estos cambios tras un reinicio depende de la configuración de persistencia de la sesión. En un sistema instalado de forma nativa, MiniOS Store siempre utiliza el modo sistema.

El modo sistema no es transaccional. Una operación fallida o cancelada puede dejar paquetes, el estado del repositorio o archivos modificados por comandos anteriores.

## Servicio local y límite de confianza

El servicio `minios-store` se ejecuta como root porque la construcción de módulos y la instalación directa de paquetes requieren operaciones de montaje, overlay, chroot, APT y dpkg. Por defecto, solo escucha en `ws://127.0.0.1:8765`. La interfaz web alojada envía los datos completos de la receta, incluidos scripts y URLs de descarga, a este servicio local.

El demonio valida la estructura de la solicitud y el método de instalación soportado, pero no autentica ni firma de forma independiente el contenido de la receta. Una página que pueda acceder al endpoint WebSocket local puede solicitar trabajo de instalación con privilegios. Por lo tanto:

- Mantén el demonio vinculado a `127.0.0.1`. No expongas el puerto `8765` a una LAN ni a internet.
- No configures `MINIOS_STORE_HOST` en una dirección que no sea loopback a menos que exista una barrera de seguridad adicional y revisada.
- Usa el sitio oficial de la Store por HTTPS e inspecciona las recetas antes de instalar.
- Detén o deshabilita el servicio cuando no sea necesario instalar desde el navegador.

Gestiona el servicio systemd con:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

El manejador de URI es una vía separada. Inicia el instalador GTK a través de PolicyKit y no requiere el demonio WebSocket. Las entradas URI actuales se interpretan como nombres de paquetes APT con un nivel de módulo solicitado y configuración de compresión. El instalador se inicia tras la autorización, así que revisa la solicitud del navegador antes de aceptar el aviso de autenticación.

## Cancelación

Selecciona `Cancel` en el diálogo de progreso web o `Cancel installation` en el instalador GTK. La cancelación marca el lote como cancelado y termina el proceso hijo actualmente en seguimiento. Las recetas restantes no se inician.

La cancelación no es una reversión. Los paquetes o módulos completados previamente permanecen, y un comando interrumpido durante APT, dpkg, un script, descarga o construcción de módulo puede dejar un estado parcial o un archivo de salida incompleto. Tras la cancelación:

1. Lee el registro final de instalación.
2. Revisa el directorio de módulos de destino en busca de archivos inesperados o de tamaño cero.
3. Para el modo sistema, ejecuta `sudo dpkg --audit` y repara la configuración de paquetes si es necesario.
4. Elimina solo los artefactos que hayas identificado como pertenecientes a la operación cancelada.

## Solución de problemas

### La Store está sin conexión

Verifica el acceso de red a `https://store.minios.dev`. Un estado `Offline` también significa que el navegador no está conectado al demonio WebSocket local; la instalación aún puede continuar mediante el manejador de URI si `minios-store-gui` está instalado.

### El navegador no puede conectarse al demonio

Verifica el servicio y sus registros:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

El endpoint normal es `ws://127.0.0.1:8765`. Un conflicto de puerto, servicio detenido, falta de `python3-websockets` o restricciones del navegador pueden impedir la conexión. Reiniciar el navegador no soluciona un demonio detenido.

### Fallo de autenticación o no aparece el aviso

El instalador URI requiere PolicyKit, `pkexec` y un agente de autenticación de escritorio activo. Inicia el instalador desde una sesión gráfica activa y verifica que `minios-store-gui` esté instalado. No evites el aviso exponiendo el demonio root en la red.

### Fallo en la construcción del módulo

Despliega el registro de instalación y utiliza el último error de comando en lugar de solo el resumen. Las causas comunes incluyen paquetes no disponibles, fallos de repositorio o DNS, espacio libre insuficiente, una herramienta de compresión no soportada y un directorio de módulos de solo lectura. El demonio informa cuando ha cambiado a `/var/lib/minios-store/modules`.

### La aplicación no aparece tras la instalación

Para el modo módulo, reinicia después de confirmar que el archivo `.sb` está en el directorio `minios/modules` del medio de arranque. Un archivo dejado en el directorio de respaldo no se carga automáticamente. Para el modo sistema en una sesión en vivo, verifica que la sesión sea persistente si la aplicación desapareció tras reiniciar.

### Una instalación de sistema cancelada dejó dpkg sin terminar

Revisa el estado de los paquetes antes de volver a intentarlo:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Revisa los cambios propuestos por APT antes de confirmar cualquier operación de reparación adicional.

## Documentación relacionada

- [Creación de módulos](/development/Creating-Modules.md)
- [Reconstrucción de ISO](/development/Rebuilding-ISO.md)
