# Instalación de MiniOS

Esta guía describe las diferentes formas de instalar MiniOS en dispositivos de almacenamiento.

## 1. Descarga el archivo ISO de MiniOS

- Descarga el archivo ISO de MiniOS desde el sitio web oficial.

## 2. Crea una unidad de arranque

Elige uno de los siguientes métodos:

- [Método original](/installation/tools/Original-Method.md)
- [Usando Rufus](/installation/tools/Rufus.md) (Windows) (Recomendado)
- [Usando UNetbootin](/installation/tools/UNetbootin.md) (Windows/Linux/MacOS)
- [Usando Ventoy](/installation/tools/Ventoy.md) (Windows/Linux) (Recomendado)
- [Usando Balena Etcher](/installation/tools/Balena-Etcher.md) (Windows/Linux/MacOS) (Recomendado)
- [Usando `dd`](/installation/tools/dd.md) (Linux/MacOS) (Recomendado)
- [Usando Drive Utility](/installation/tools/Drive-Utility.md) (Linux) (Recomendado)
- [Usando MiniOS Installer](/installation/MiniOS-Installer.md) (Recomendado, solo MiniOS)

## 3. Arrancar desde la unidad

1.  Reinicia tu computadora.
2.  Selecciona la unidad de arranque en el menú de inicio de tu computadora para arrancar desde ella.

## 4. Notas

- El instalador de arranque no soporta multiboot; solo MiniOS será arrancable desde la unidad.
- Tu disco debe usar el esquema de partición `msdos` (usa MBR, no GPT).
- La unidad debe estar formateada con uno de los sistemas de archivos compatibles: FAT32, NTFS, ext2, ext3, ext4, btrfs.

---


**Recordatorio:** El método de instalación original ya no es la principal recomendación, ya que puede ser difícil para usuarios principiantes. Al usar Balena Etcher, `dd` o Drive Utility, la partición para guardar cambios se creará automáticamente.
