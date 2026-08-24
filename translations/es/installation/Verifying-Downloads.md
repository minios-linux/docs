# Verificando descargas

Las versiones de MiniOS se publican en la [página oficial de lanzamientos de GitHub](https://github.com/minios-linux/minios-live/releases). Cada archivo ISO publicado tiene un archivo correspondiente cuyo nombre termina en `.iso.sha256`.

La verificación SHA-256 detecta si una descarga está incompleta o ha sido alterada. No prueba quién creó los archivos. Actualmente, la publicación solo proporciona sumas de verificación, no archivos de firma criptográfica, por lo que esta página no describe la verificación de firmas.

## Descarga ambos archivos

Descarga el archivo ISO y su archivo `.sha256` correspondiente desde la misma versión en GitHub. Guarda ambos archivos en el mismo directorio. Sus nombres base deben coincidir, por ejemplo:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Utiliza los nombres de la versión que descargaste en los siguientes comandos.

## Linux

Abre una terminal en el directorio de descargas y ejecuta:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Una descarga válida muestra el nombre del ISO seguido de `OK`.

## macOS

Calcula la suma de verificación del ISO:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Muestra la suma de verificación esperada:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Compara exactamente los dos valores hexadecimales de 64 caracteres.

## Windows PowerShell

Abre PowerShell en el directorio de descargas y ejecuta:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Compara el valor calculado con el valor al inicio del archivo `.sha256`. La comparación no distingue entre mayúsculas y minúsculas.

## Si la verificación falla

No grabes ni inicies el ISO. Verifica que el archivo ISO y el archivo de suma de verificación correspondan a la misma versión y edición, elimina el ISO fallido y descárgalo nuevamente desde los [lanzamientos oficiales de MiniOS](https://github.com/minios-linux/minios-live/releases).
