# Установка MiniOS

В этом руководстве описаны различные способы установки MiniOS на накопители.

## 1. Скачайте ISO-файл MiniOS

- Скачайте ISO-файл MiniOS с официального сайта.

## 2. Создайте загрузочный носитель

Выберите один из следующих способов:

- [Оригинальный способ](/installation/tools/Original-Method.md)
- [С помощью Rufus](/installation/tools/Rufus.md) (Windows) (Рекомендуется)
- [С помощью UNetbootin](/installation/tools/UNetbootin.md) (Windows/Linux/MacOS)
- [С помощью Ventoy](/installation/tools/Ventoy.md) (Windows/Linux) (Рекомендуется)
- [С помощью Balena Etcher](/installation/tools/Balena-Etcher.md) (Windows/Linux/MacOS) (Рекомендуется)
- [С помощью `dd`](/installation/tools/dd.md) (Linux/MacOS) (Рекомендуется)
- [С помощью Drive Utility](/installation/tools/Drive-Utility.md) (Linux) (Рекомендуется)
- [С помощью MiniOS Installer](/installation/MiniOS-Installer.md) (Рекомендуется, только для MiniOS)

## 3. Загрузка с носителя

1.  Перезагрузите компьютер.
2.  В меню загрузки выберите созданный загрузочный носитель для старта системы.

## 4. Примечания

- Установщик загрузки не поддерживает мультизагрузку; только MiniOS будет загружаться с носителя.
- Ваш диск должен использовать схему разделов `msdos` (используйте MBR, не GPT).
- Носитель должен быть отформатирован в одну из поддерживаемых файловых систем: FAT32, NTFS, ext2, ext3, ext4, btrfs.

---


**Напоминание:** Оригинальный способ установки больше не является основным, так как может быть сложен для начинающих пользователей. При использовании Balena Etcher, `dd` или Drive Utility раздел для сохранения изменений будет создан автоматически.
