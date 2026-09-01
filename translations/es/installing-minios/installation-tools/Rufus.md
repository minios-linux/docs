---
updated: 2026-08-31
---

# Rufus

Rufus es una utilidad popular para Windows que ayuda a formatear y crear unidades USB de arranque.

## Importante

**Advertencia:** ¡La selección incorrecta del dispositivo resultará en la pérdida de datos! Verifica siempre dos veces la unidad seleccionada y haz una copia de seguridad de los datos importantes.

## Requisitos de la unidad

### Tamaño de la unidad

Consulta la [Guía de compatibilidad de hardware](/getting-started/Hardware-Compatibility) para ver los requisitos detallados del sistema y los tamaños de las unidades.

## Instalando Rufus

1. **Descarga Rufus** desde el [sitio web oficial](https://rufus.ie/)
2. **Ejecuta el programa** - Rufus no requiere instalación, es una aplicación portable

## Crear una unidad USB booteable

Rufus puede crear medios MiniOS de dos maneras diferentes. Su modo ISO normal es la mejor opción cuando deseas que la unidad USB siga siendo un sistema de archivos escribible común además de un dispositivo de arranque.

### Método 1: modo ISO

1. **Inicia Rufus** como administrador.
2. **Selecciona la unidad USB** en el campo **Dispositivo**.
3. **Selecciona el archivo ISO de MiniOS** con **SELECCIONAR**.
4. Cuando Rufus pregunte cómo escribir la imagen híbrida, mantén **modo Imagen ISO**.
5. Elige un sistema de archivos adecuado. FAT32 ofrece la mayor compatibilidad con firmware; NTFS puede limitar el arranque UEFI directo en algunos sistemas.
6. Haz clic en **INICIAR** y confirma el formateo del dispositivo seleccionado.

El modo ISO extrae los archivos MiniOS en un sistema de archivos normal. Después de la instalación, el espacio libre restante aún puede usarse para archivos comunes. Normalmente, este es el diseño de Rufus más conveniente para una unidad USB portátil de MiniOS.

### Método 2: modo DD

Elige **modo de imagen DD** solo cuando necesites específicamente una copia exacta, bloque por bloque, del ISO publicado. Rufus luego reproduce la estructura del ISO en todo el dispositivo, de manera similar a `dd`, Etcher o el modo de escritura de Utilidad de disco.

El modo DD es sencillo y predecible, pero el dispositivo ya no tendrá la estructura habitual de un solo sistema de archivos escribible que se espera de una memoria USB de uso general.

## Resultado y persistencia

El modo ISO crea medios MiniOS basados en archivos en un sistema de archivos normal y escribible. El modo DD crea medios de imagen en crudo. Ninguno de los modos es una implementación de Instalador de MiniOS, y ninguno crea automáticamente una sesión persistente.

La persistencia de MiniOS puede usar almacenamiento escribible adecuado en una instalación basada en archivos de Rufus cuando se selecciona un modo de arranque persistente. Consulta [Modos de arranque](/using-minios/Boot-Modes) y [Gestión de sesiones](/using-minios/Sessions-and-Persistence).
