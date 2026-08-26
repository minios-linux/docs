---
updated: 2026-08-26
---

# Файл конфигурации

Загрузочный носитель MiniOS хранит основную конфигурацию в `minios/config.conf`. Во время загрузки initramfs синхронизирует её с `/etc/live/config.conf` в собранном live root. Поэтому скрипты в работающей системе должны читать `/etc/live/config.conf`; `/etc/minios/config.conf` и `config/config.conf` не являются путями к конфигурации, используемыми текущим загрузочным кодом.

Параметры загрузки могут переопределять соответствующие настройки файла. Ниже приведён пример стандартного `config.conf`:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```

## Описание параметров

**Легенда:**
- **Только при первом запуске** — применяется только при первом запуске и не применяется повторно при последующих загрузках
- **Да** — может быть изменён и применяется при каждой загрузке

| Параметр | Переконфигурируемый | Значение | Пример |
| --------- | ------------------- | -------- | ------ |
| LIVE_CONFIG_CMDLINE | Да | Дополнительные параметры live-config. `nottyautologin` сохраняется здесь вместо жёсткого прописывания в каждом загрузочном пункте. См. `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | Да | Имя узла, связанного с системой. См. `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | Только при первом запуске | Имя пользователя, чей профиль будет создан при первом запуске. Если указать имя пользователя <strong>root</strong>, профиль пользователя создан не будет, и вход будет выполнен с использованием профиля <strong>root</strong>. См. `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | Только при первом запуске | Полное имя основного пользователя. См. `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | Только при первом запуске | Список групп для основного пользователя через запятую. См. `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | Только при первом запуске | Пароль основного пользователя в зашифрованном виде (хеш). Для генерации используйте `mkpasswd -m yescrypt`. См. `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | Только при первом запуске | Пароль привилегированного пользователя **root** в зашифрованном виде (хеш). Для генерации используйте `mkpasswd -m yescrypt`. См. `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | Только при первом запуске | Если задан, отключает вход под root и запрещает sudo/policykit для пользователя. См. `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | Да | Устанавливает локаль. Можно указать несколько значений через запятую. См. `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | Да | Устанавливает часовой пояс (например, "Europe/Berlin", "Etc/UTC"). См. `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | Да | Устанавливает модель клавиатуры (например, "pc105"). См. `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | Да | Устанавливает раскладки клавиатуры (через запятую, например, "us,de"). См. `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | Да | Устанавливает параметры клавиатуры (например, "grp:alt_shift_toggle,grp_led:scroll"). См. `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | Да | Устанавливает варианты раскладки клавиатуры (через запятую, может быть пустым или совпадать с раскладками). См. `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | Да | Включает вывод отладки для live-config. См. `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | Да | Если true, пользовательские каталоги будут связаны из указанного пути. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | Да | Если true, пользовательские каталоги будут примонтированы через bind из указанного пути. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | Да | Путь к пользовательским каталогам данных на флеш-накопителе. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | Да | Выбор режима работы системы. Если планируете устанавливать ПО только модулями — используйте "merged". Если хотите устанавливать ПО через apt — используйте "simple". По умолчанию — "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | Да | Целевой systemd-таргет для загрузки. См. `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | Да | Включить сервисы при загрузке (через запятую). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | Да | Отключить сервисы при загрузке (через запятую). | DISABLE_SERVICES="" |
| EXPORT_LOGS | Да | Если true и выбранная директория данных MiniOS доступна для записи, журналы загрузки копируются в `minios/log/YYYYMMDD_HHMMSS/`. | EXPORT_LOGS="false" |


**Подробнее о большинстве параметров см.:**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Для целей systemd: `man systemd.special`

## Важно!

* SSH-сервер включён по умолчанию для совместимости с внешними initrd. Чтобы его отключить, недостаточно просто удалить его из `ENABLE_SERVICES`.

## Источник, копия во время выполнения и приоритетность

Выбранный каталог данных MiniOS обычно — это каталог `minios/` на загрузочном носителе. Его конфигурационные пути и их копии во время выполнения:

| Выбранный каталог данных | Рабочая система |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Для обычно смонтированного носителя эти исходные файлы видны как `minios/config.conf` и `minios/config.conf.d/*.conf`, часто внутри `/run/initramfs/memory/data/`. Они не загружаются напрямую `live-config`. initramfs синхронизирует их с путями во время выполнения перед запуском `minios-boot`; см. [Режимы загрузки](/configuration/Boot-Modes.md) для информации о том, где это происходит в процессе загрузки.

Синхронизация выполняется при загрузке, а не через файловый монитор:

- Более новая копия `config.conf` определяется по времени изменения. Более новая исходная копия копируется в live root. Более новая копия во время выполнения копируется обратно только если выбранный каталог данных доступен для записи.
- Каждый файл `config.conf.d/*.conf` синхронизируется независимо по имени файла с использованием тех же правил по времени изменения и доступности для записи. Файлы не удаляются ни с одной из сторон.
- Если системное время меньше времени последней синхронизации, сравнение меток времени пропускается, и копируются только отсутствующие файлы в назначении.
- `toram=trim` копирует `config.conf`, но пропускает `config.conf.d/`; см. [Загрузка модулей initrd](/configuration/Initrd-Module-Loading.md). Полная `toram` копирует дерево данных, но синхронизация затем производится с копией в RAM, а не с отсоединённым носителем.

После синхронизации `live-config` читает сначала `/etc/live/config.conf`, затем `/etc/live/config.conf.d/*.conf` в порядке shell glob, чтобы более поздний фрагмент мог заменить более раннее значение. Фактическая командная строка ядра добавляется к `LIVE_CONFIG_CMDLINE`; для опций, повторяющихся там, приоритет имеет более позднее вхождение из командной строки ядра. `minios-boot` также читает `/etc/live/config.conf` для поддерживаемых ранних настроек и отдаёт приоритет распознанным параметрам ядра.

Вы можете добавить специфичные для проекта shell-переменные в эти файлы и читать их из `/etc/live/config.conf` или фрагментов во время выполнения. Значения заключайте в строки shell и не ставьте пробелы вокруг `=`.

Ранний журнал MiniOS — `/var/log/minios/minios-boot.log`, а поздний вывод `live-config` — это `/var/log/live/config.log`. С `EXPORT_LOGS="true"` оба дерева копируются в `minios/log/YYYYMMDD_HHMMSS/{minios,live}/`, если выбранный каталог данных доступен для записи.
