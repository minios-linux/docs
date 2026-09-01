---
updated: 2026-08-31
---

# config.conf

`config.conf` — основной предварительный конфигурационный файл MiniOS. На стандартном носителе MiniOS он хранится как `minios/config.conf`. При загрузке initramfs синхронизирует его с `/etc/live/config.conf` в собранной системе.

Используйте этот файл для настройки порядка запуска MiniOS и инициализации новой постоянной сессии. В первую очередь это механизм предварительной настройки для администратора, а не замена стандартных инструментов конфигурирования рабочего стола.

## Переконфигурирование

Столбец **Можно изменить** ниже использует следующие значения:

- **Да** — параметр можно изменить и применить снова при последующей загрузке.
- **Только при первой загрузке** — параметр применяется при создании соответствующего постоянного состояния и обычно не применяется повторно при следующих загрузках.

Это различие — часть поведения, которое должны знать пользователи. Внутренние файлы состояния `live-config` являются деталями реализации и не заменяют это.

## Сгенерированная конфигурация

Текущий образ MiniOS генерирует `config.conf` со следующей общей структурой:
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
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
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
Конкретные значения зависят от образа и параметров сборки.

::: warning `LIVE_CONFIG_CMDLINE` — это не командная строка initramfs
`LIVE_CONFIG_CMDLINE` передаёт параметры для **live-config** после сборки корня MiniOS. Такие параметры, как `from=`, `load=`, `toram` и `perchdir=`, должны быть реальными параметрами загрузки ядра; если указать их только в `LIVE_CONFIG_CMDLINE`, это будет слишком поздно для initramfs.
:::

## Стандартные параметры

| Параметр | Можно изменить | Значение |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Да | Дополнительные параметры live-config. Фактическая командная строка ядра добавляется позже и имеет приоритет при повторяющихся параметрах. |
| `LIVE_HOSTNAME` | Да | Имя хоста системы. |
| `LIVE_USERNAME` | Только при первой загрузке | Имя live-пользователя, создаваемого при начальной настройке. |
| `LIVE_USER_FULLNAME` | Только при первой загрузке | Полное имя live-пользователя. |
| `LIVE_USER_DEFAULT_GROUPS` | Только при первой загрузке | Дополнительные группы, назначаемые при создании live-пользователя. |
| `LIVE_USER_PASSWORD_CRYPTED` | Только при первой загрузке | Хеш пароля live-пользователя (crypt). |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Только при первой загрузке | Хеш пароля root (crypt). |
| `LIVE_CONFIG_NOROOT` | Только при первой загрузке | При включении отключает настройку MiniOS root-пароля, sudo и привилегий PolicyKit. |
| `LIVE_LOCALES` | Да | Одна или несколько локалей системы. |
| `LIVE_TIMEZONE` | Да | Часовой пояс системы, например `Europe/Berlin` или `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Да | Модель клавиатуры XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Да | Список раскладок клавиатуры через запятую. |
| `LIVE_KEYBOARD_OPTIONS` | Да | Параметры клавиатуры XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Да | Список вариантов через запятую, соответствующих выбранным раскладкам. |
| `LIVE_CONFIG_DEBUG` | Да | Включает отладочный вывод live-config при значении `true`. |
| `LIVE_LINK_USER_DIRS` | Да | Связывает управляемые пользовательские каталоги с настроенным расположением на доступном для записи MiniOS носителе. |
| `LIVE_BIND_USER_DIRS` | Да | Монтирует управляемые пользовательские каталоги из настроенного расположения на доступном для записи MiniOS носителе. |
| `LIVE_USER_DIRS_PATH` | Да | Расположение, используемое в режиме link/bind для пользовательских каталогов. |
| `LIVE_MODULE_MODE` | Да | Выбирает интеграцию модуля live-config `simple` или `merged`. |
| `DEFAULT_TARGET` | Да | Цель загрузки: `graphical.target`, `multi-user.target` или `rescue.target`. |
| `ENABLE_SERVICES` | Да | Сервисы, включаемые при загрузке через `minios-svc`, через запятую. |
| `DISABLE_SERVICES` | Да | Сервисы, отключаемые при загрузке через `minios-svc`, через запятую. |
| `EXPORT_LOGS` | Да | При `true` экспортирует MiniOS и журналы запуска live-config на доступный для записи MiniOS носитель. |

Сгенерированный файл не является исчерпывающим списком всего, что поддерживает `minios-live-config`. Дополнительные переменные для предварительной настройки проводной сети, политики безопасности, хуков, preseeding, Xorg и других компонентов можно добавить вручную. Полную справку смотрите в разделе [live-config](/reference/configuration/live-config).

## Предварительная настройка проводной сети

MiniOS может предварительно настроить политику **проводной IPv4** через компонент live-config `network`. Это предназначено для административной предварительной настройки системы перед её запуском на целевом оборудовании.
Например:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Эти параметры действуют **только при первой загрузке** для постоянной сетевой политики. После успешного применения компонент записывает `/var/lib/live/config/network`.
Изменение значений не перезаписывает уже настроенную постоянную сессию, если только это состояние не было сброшено вручную.

`LIVE_NETWORK_METHOD=static` записывает статическую политику. `off` отключает автоматическую настройку IPv4 для выбранного интерфейса. Неустановленное значение или `dhcp` оставляет существующую сетевую настройку образа без изменений. `LIVE_NETWORK_BACKEND=auto` отдаёт предпочтение NetworkManager и использует ifupdown в качестве резерва.

Этот механизм не настраивает Wi-Fi. После загрузки обычное управление проводными и беспроводными сетями осуществляет NetworkManager. Подробнее о работе с сетью смотрите в разделе [Networking](/using-minios/Networking), а все сетевые переменные — в [live-config](/reference/configuration/live-config).

## Ранние настройки userspace для MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES` и `EXPORT_LOGS` — это параметры MiniOS, а не переменные live-config. Они читаются `minios-boot` до передачи управления основной системе и все имеют статус **Можно изменить: Да**.

Соответствующие параметры загрузки `default-target=`, `enable-services=` и `disable-services=` имеют приоритет для текущей загрузки. Параметр `text` принудительно включает `multi-user.target`.

В текущих сборках Toolbox и Ultra добавляется `ssh` в `ENABLE_SERVICES`. Чтобы явно отключить SSH, укажите его в `DISABLE_SERVICES`; просто удаление из `ENABLE_SERVICES` не отключает службу.

С помощью `EXPORT_LOGS="true"` на доступный для записи MiniOS носитель сохраняются журналы запуска:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Соответствующие журналы в рабочем режиме — `/var/log/minios/minios-boot.log` и `/var/log/live/config.log`.

## Исходные файлы, копии во время работы и приоритет

Выбранный каталог данных MiniOS обычно содержит следующие исходные файлы:

| Выбранный каталог данных | Рабочая система |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

На стандартных смонтированных носителях они видны как `minios/config.conf` и `minios/config.conf.d/*.conf`, часто в `/run/initramfs/memory/data/` при работе системы.

Синхронизация происходит при загрузке; это не файловый монитор:

- Более новая копия `config.conf` определяется по времени изменения. Более новая копия на носителе копируется в live root. Более новая копия во время работы возвращается обратно только если выбранный каталог данных MiniOS доступен для записи.
- Каждый файл `config.conf.d/*.conf` синхронизируется независимо по имени файла с использованием тех же правил по времени и доступности для записи. Файлы не удаляются ни с одной из сторон.
- Если системное время меньше времени последней синхронизации, сравнение временных меток пропускается и копируются только отсутствующие файлы.
- `toram=trim` копирует `config.conf`, но пропускает `config.conf.d/`. Полная `toram` копирует всё дерево данных, но после этого синхронизация нацелена на копию RAM, а не на исходный отсоединённый носитель.
После синхронизации `live-config` читает сначала `/etc/live/config.conf`, затем `/etc/live/config.conf.d/*.conf` в порядке glob-выражения shell. Поздний фрагмент может заменить значение из основного файла или более раннего фрагмента.

Фактическая командная строка ядра добавляется в `LIVE_CONFIG_CMDLINE`. Если параметр встречается несколько раз, приоритет имеет более позднее вхождение из командной строки ядра. `minios-boot` аналогично отдаёт приоритет своим распознанным параметрам ядра над соответствующими настройками из `/etc/live/config.conf`.

Вы можете добавить проектные переменные оболочки в `config.conf` или его фрагменты и читать их из рабочих копий. Значения указывайте как строки shell и не ставьте пробелы вокруг `=`.

## Связанные материалы

- [Параметры загрузки](/reference/Boot-Parameters) — параметры, которые должны быть указаны в фактической командной строке ядра и переопределениях live-config.
- [live-config](/reference/configuration/live-config) — полный справочник по параметрам, переменным, компонентам и состояниям позднего userspace.
- [Режимы загрузки](/using-minios/Boot-Modes) — как персистентность и `toram` влияют на хранение конфигурации.
