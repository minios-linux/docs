---
updated: 2026-10-15
program_commits:
    minios-store: c3d0d31db7966cd7809f0f4ba1ca642133c8f07a
---

# Instalación de software

La Tienda de aplicaciones de MiniOS ofrece un catálogo de recetas de aplicaciones en [store.minios.dev](https://store.minios.dev). En el entorno en vivo de MiniOS, esas recetas pueden instalarse directamente en el sistema en ejecución o utilizarse para construir uno o más SquashFS (`.sb`) módulos.

Esta página describe el flujo de trabajo de software en vivo de MiniOS. Una instalación nativa mantiene el escritorio seleccionado y las aplicaciones habituales, pero elimina el software específico de MiniOS destinado al funcionamiento en vivo. En ese sistema instalado, utiliza el flujo de trabajo normal de gestión de paquetes de Debian.

Navegar por el catálogo no requiere un servidor local. Para instalar sí es necesario: la interfaz web se conecta al demonio local de la Tienda de aplicaciones de MiniOS o abre el `minios-store://` manejador de URI instalado.

## Antes de instalar

Abre los detalles de una aplicación y revisa la siguiente información antes de añadirla al carrito:

- Los nombres de los paquetes y el método de instalación.
- El script de instalación, si se muestra alguno.
- La página principal de la aplicación y la información del desarrollador.
- Capturas de pantalla e imágenes de la aplicación, si están disponibles. Estos son metadatos de presentación, no una garantía de que la receta sea confiable.
- Si la receta descarga un paquete Debian por separado.
- Cualquier licencia de software adicional que muestre la receta. Las recetas marcadas como requerir aceptación no pueden instalarse hasta que aceptes explícitamente esa licencia.

Las recetas pueden instalar paquetes APT, descargar paquetes Debian o ejecutar scripts de shell. Las operaciones de instalación se ejecutan con privilegios de root. Considera una receta y cada descarga o repositorio que utilice como código privilegiado.

## Instalar una aplicación

1. Abre la Tienda de aplicaciones de MiniOS desde el menú de aplicaciones. El lanzador verifica `https://store.minios.dev` y la abre en el navegador predeterminado.
2. Busca o navega por categoría, abre los detalles de la aplicación y revisa los paquetes o el script.
3. Añade una o más aplicaciones al carrito.
4. En una sesión en vivo de MiniOS, selecciona `Module` o `System`.
5. En modo módulo, elige el nivel de construcción si es necesario. **Predeterminado de la receta** mantiene el nivel configurado en cada receta; **Automático** usa todos los módulos cargados actualmente como base de construcción y produce un nombre de módulo sin numerar; un nivel numérico desde `01` hasta `09` utiliza solo los módulos cargados hasta ese nivel. Prefiere Predeterminado de la receta salvo que necesites evitar dependencias en capas opcionales superiores.
6. Para varias aplicaciones en modo módulo, selecciona un módulo combinado o módulos separados. Un módulo combinado también puede recibir un nombre personalizado.
7. Acepta las licencias de receta que requieran aceptación explícita.
8. Selecciona `Install` y sigue el progreso y la salida de comandos. La página utiliza el demonio local cuando su estado es `Connected`; de lo contrario, intenta usar el manejador de URI y puede mostrar una solicitud de autenticación de PolicyKit.

Solo puede ejecutarse un lote de instalación del demonio a la vez. Cerrar el diálogo de progreso no detiene necesariamente la instalación; vuelve a abrir el indicador de instalación para verla o cancélala explícitamente.

## Modos módulo y sistema

### Modo módulo

El modo módulo ejecuta `apt2sb` o `script2sb` en un entorno aislado para la construcción de módulos. Escribe los archivos resultantes de `.sb` en la primera ubicación con permisos de escritura de la siguiente lista:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

La primera ruta corresponde al directorio de módulos del árbol de datos efectivo MiniOS. En un arranque normal con permisos de escritura, se encuentra en el almacenamiento, pero después de la copia del sistema `toram` puede estar respaldado por RAM; Store verifica la posibilidad de escritura, no la durabilidad. Un módulo creado no se activa en la sesión actual. Solo se carga en un arranque posterior si se copia a un almacenamiento `minios/modules/` duradero y es permitido por los filtros de arranque. Utiliza la opción **Agregar al próximo arranque** o `sudo sb next-boot add /path/to/module.sb` cuando haya almacenamiento duradero disponible.

La segunda ruta es una alternativa utilizada cuando el directorio normal de módulos no permite escritura. Un módulo en el directorio alternativo no se incluye automáticamente en el próximo arranque en vivo. Usa `Open folder`, luego copia el módulo finalizado al directorio `minios/modules` en un medio de arranque MiniOS con permisos de escritura antes de reiniciar.

Un módulo combinado contiene todas las recetas seleccionadas. Si se empaquetan por separado, un fallo puede afectar solo a una receta, mientras que los módulos completados previamente en el lote permanecen en el directorio de destino.

### Modo sistema

El modo sistema utiliza APT o un script de receta directamente sobre el sistema de archivos raíz en ejecución. Los cambios tienen efecto en el sistema en vivo actual en lugar de generar un módulo. La persistencia de esos cambios tras reiniciar depende de la configuración de persistencia de la sesión.

El modo sistema no es transaccional. Una operación fallida o cancelada puede dejar paquetes, el estado del repositorio o archivos modificados por comandos anteriores.

## Servicio local y límite de confianza

El `minios-store` servicio se ejecuta como root porque la construcción de módulos y la instalación directa de paquetes requieren operaciones de montaje, overlay, chroot, APT y dpkg. Por defecto, solo escucha en `ws://127.0.0.1:8765`. La interfaz web alojada envía los datos completos de la receta, incluidos scripts y URLs de descarga, a este servicio local.

El demonio valida la forma de la solicitud y el método de instalación soportado, pero no autentica ni firma de manera independiente la carga útil de la receta. Una página que pueda acceder al endpoint local de WebSocket puede solicitar trabajo de instalación con privilegios. Por lo tanto:

- Mantén el demonio vinculado a `127.0.0.1`. No expongas el puerto `8765` a una LAN ni a internet.
- No configures `MINIOS_STORE_HOST` en una dirección que no sea de loopback salvo que exista una barrera de seguridad adicional y revisada.
- Accede a la Tienda de aplicaciones de MiniOS solo a través de su sitio web oficial HTTPS y revisa las recetas antes de instalar.
- Detén o desactiva el servicio cuando no sea necesario instalar desde el navegador.

Gestiona el servicio systemd con:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

El manejador de URI es una vía separada. Inicia el instalador GTK mediante PolicyKit y no requiere el demonio WebSocket. Los enlaces actuales de Store incluyen toda la carga útil de la receta codificada, por lo que las recetas APT, script y DEB descargadas pueden usar la misma vía alternativa; las aceptaciones de licencia explícitas se transmiten por separado y el instalador local las vuelve a validar. El formato anterior de `recipes=id:level:compression` sigue siendo una vía de compatibilidad y se interpreta como una receta APT. El instalador se inicia tras la autorización, así que revisa la solicitud del navegador antes de aceptar el aviso de autenticación.

## Cancelación

Selecciona `Cancel` en el diálogo de progreso web o `Cancel installation` en el instalador GTK. La cancelación marca el lote como cancelado y termina el proceso hijo actualmente en seguimiento. No se inician las recetas restantes.

La cancelación no es reversión. Los paquetes o módulos completados previamente permanecen, y un comando interrumpido durante APT, dpkg, un script, descarga o construcción de módulo puede dejar un estado parcial o un archivo de salida incompleto. Después de cancelar:

1. Lee el registro final de instalación.
2. Revisa el directorio de módulos de destino en busca de archivos inesperados o de tamaño cero.
3. Para modo sistema, ejecuta `sudo dpkg --audit` y repara la configuración de paquetes si es necesario.
4. Elimina solo los artefactos que hayas identificado como pertenecientes a la operación cancelada.

## Solución de problemas

### La Tienda de aplicaciones de MiniOS está fuera de línea

Verifica el acceso a la red a `https://store.minios.dev`. Un estado `Offline` también significa que el navegador no está conectado al demonio WebSocket local; la instalación aún puede continuar mediante el manejador de URI si `minios-store-gui` está instalado.

### El navegador no puede conectarse al demonio

Verifica el servicio y sus registros:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

El endpoint normal es `ws://127.0.0.1:8765`. Un conflicto de puerto, servicio detenido, falta de `python3-websockets`, o restricciones del navegador pueden impedir la conexión. Reiniciar el navegador no repara un demonio detenido.

### Falla la autenticación o no aparece el aviso

El instalador URI requiere PolicyKit, `pkexec`, y un agente de autenticación de escritorio activo. Inicia el instalador desde una sesión gráfica activa y verifica que `minios-store-gui` esté instalado. No evites el aviso exponiendo el demonio root en la red.

### Falla la construcción del módulo

Expande el registro de instalación y utiliza el último error de comando en lugar de solo el resumen. Las causas comunes incluyen paquetes no disponibles, fallos de repositorio o DNS, espacio libre insuficiente, una herramienta de compresión no soportada y un directorio de módulos de solo lectura. El demonio informa cuando ha cambiado a `/var/lib/minios-store/modules`.

### La aplicación no aparece después de la instalación

En modo módulo, reinicia después de confirmar que el archivo `.sb` está en el directorio `minios/modules` del medio de arranque. Un archivo dejado en el directorio alternativo no se carga automáticamente. Para el modo sistema en una sesión en vivo, verifica que la sesión sea persistente si la aplicación desapareció tras reiniciar.

### Una instalación de sistema cancelada dejó dpkg sin terminar

Revisa el estado de los paquetes antes de volver a intentar:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Revisa los cambios propuestos por APT antes de confirmar cualquier operación de reparación adicional.

## Documentación relacionada

- [Crear módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Reconstruir ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
