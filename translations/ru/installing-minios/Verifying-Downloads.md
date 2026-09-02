---
updated: 2026-08-26
---

# Проверка загрузок

Релизы MiniOS публикуются на официальной [странице релизов GitHub](https://github.com/minios-linux/minios-live/releases) и на [SourceForge](https://sourceforge.net/projects/minios-linux/). Для каждого ISO-файла есть соответствующий файл, имя которого оканчивается на `.iso.sha256`.

Проверка по SHA-256 позволяет выявить неполную или изменённую загрузку. Она не подтверждает, кто создал файлы. В этом релизе предоставляются только контрольные суммы, а не криптографические подписи, поэтому на этой странице не описана проверка подписей.

## Скачайте оба файла

Скачайте ISO и соответствующий ему файл `.sha256` из одного и того же релиза на GitHub или SourceForge. Оставьте оба файла в одной папке. Их основные имена должны совпадать, например:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

В командах ниже используйте имена файлов из скачанного вами релиза.

## Linux

Откройте терминал в папке с загрузками и выполните:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

При успешной проверке будет выведено имя ISO-файла, за которым следует `OK`.

## macOS

Вычислите контрольную сумму ISO:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Покажите ожидаемую контрольную сумму:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Сравните оба 64-символьных шестнадцатеричных значения точно.

## Windows PowerShell

Откройте PowerShell в папке с загрузками и выполните:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Сравните вычисленное значение с началом файла `.sha256`. Сравнение не чувствительно к регистру.

## Если проверка не пройдена

Не записывайте и не загружайте ISO. Убедитесь, что ISO и файл контрольных сумм относятся к одному релизу и редакции, удалите повреждённый ISO и скачайте его заново с официальной [страницы релизов MiniOS](https://github.com/minios-linux/minios-live/releases).
