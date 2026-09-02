---
updated: 2026-08-31
---

# config.conf

`config.conf` — основной файл преднастройки MiniOS. Обычно на стандартном носителе MiniOS он хранится как `minios/config.conf`. При загрузке initramfs синхронизирует его с `/etc/live/config.conf` в собранной системе.

Используйте этот файл для задания параметров запуска MiniOS и инициализации новой постоянной сессии. Это инструмент для администраторов, предназначенный для предварительной настройки, а не замена стандартных средств конфигурирования рабочего окружения.

## Перенастройка

В столбце **Перенастраиваемый** ниже используются следующие значения:

- **Да** — параметр можно изменить и применить повторно при следующей загрузке.
- **Только при первой загрузке** — параметр применяется при создании соответствующего постоянного состояния и обычно не применяется повторно при последующих загрузках.

Это различие важно для понимания поведения системы. Внутренние файлы состояния `live-config` являются деталями реализации и не заменяют его.

## Сгенерированная конфигурация

Актуальный образ MiniOS создает `config.conf` со следующей общей структурой:
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

::: warning `LIVE_CONFIG_CMDLINE` это не командная строка initramfs
`LIVE_CONFIG_CMDLINE` передает параметры для **live-config** после сборки корня MiniOS. Такие параметры, как `from=`, `load=`, `toram`, и `perchdir=` должны быть реальными параметрами загрузки ядра; если они указаны только в `LIVE_CONFIG_CMDLINE` — это слишком поздно для влияния на initramfs.
:::

## Стандартные параметры

| Параметр | Перенастраиваемый | Описание |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Да | Дополнительные параметры live-config. Фактическая командная строка ядра добавляется позже и имеет приоритет при повторяющихся параметрах. |
| `LIVE_HOSTNAME` | Да | Имя хоста системы. |
| `LIVE_USERNAME` | Только при первой загрузке | Имя live-пользователя, создаваемого при первоначальной настройке. |
| `LIVE_USER_FULLNAME` | Только при первой загрузке | Полное имя live-пользователя. |
| `LIVE_USER_DEFAULT_GROUPS` | Только при первой загрузке | Дополнительные группы, назначаемые при создании live-пользователя. |
| `LIVE_USER_PASSWORD_CRYPTED` | Только при первой загрузке | Хеш пароля live-пользователя (crypt). |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Только при первой загрузке | Хеш пароля root (crypt). |
| `LIVE_CONFIG_NOROOT` | Только при первой загрузке | Если включено, отключает настройку root-пароля MiniOS, sudo и привилегий PolicyKit. |
| `LIVE_LOCALES` | Да | Одна или несколько локалей системы. |
| `LIVE_TIMEZONE` | Да | Часовой пояс системы, например `Europe/Berlin` или `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Да | Модель клавиатуры XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Да | Макеты клавиатуры через запятую. |
| `LIVE_KEYBOARD_OPTIONS` | Да | Параметры клавиатуры XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Да | Варианты через запятую, соответствующие выбранным макетам. |
| `LIVE_CONFIG_DEBUG` | Да | Включает вывод отладки live-config при значении `true`. |
| `LIVE_LINK_USER_DIRS` | Да | Связывает управляемые пользовательские каталоги с указанным расположением на доступном для записи носителе MiniOS. |
| `LIVE_BIND_USER_DIRS` | Да | Монтирует управляемые пользовательские каталоги из указанного расположения на доступном для записи носителе MiniOS. |
| `LIVE_USER_DIRS_PATH` | Да | Расположение, используемое в режимах link/bind для пользовательских каталогов. |
| `LIVE_MODULE_MODE` | Да | Выбирает `simple` или `merged` интеграцию модуля live-config. |
| `DEFAULT_TARGET` | Да | Цель загрузки: `graphical.target`, `multi-user.target`, или `rescue.target`. |
| `ENABLE_SERVICES` | Да | Сервисы через запятую, включаемые при загрузке через `minios-svc`. |
| `DISABLE_SERVICES` | Да | Сервисы через запятую, отключаемые при загрузке через `minios-svc`. |
| `EXPORT_LOGS` | Да | Если `true`, экспортирует MiniOS и журналы запуска live-config на доступный для записи носитель MiniOS. |

Сгенерированный файл не является исчерпывающим списком всех поддерживаемых параметров в `minios-live-config`. Дополнительные переменные для преднастройки проводной сети, политики безопасности, хуков, preseeding, Xorg и других компонентов можно добавить вручную. См. [live-config](/reference/configuration/live-config) для полного справочника.

## Преднастройка проводной сети

MiniOS может заранее настроить **проводную сеть IPv4** через компонент live-config `network`. Это предназначено для административной преднастройки системы до её запуска на целевом оборудовании.
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

Эти параметры действуют **только при первой загрузке** для постоянной сетевой политики. После успешного применения компонент фиксирует `/var/lib/live/config/network`.
Изменение значений не перезаписывает уже настроенную постоянную сессию, если только это состояние не сброшено вручную.

`LIVE_NETWORK_METHOD=static` записывает статическую политику. `off` отключает автоматическую настройку IPv4 для выбранного интерфейса. Если значение не задано или `dhcp` оставляет сетевую конфигурацию образа без изменений. `LIVE_NETWORK_BACKEND=auto` отдает предпочтение NetworkManager и при необходимости использует ifupdown.

Этот механизм не настраивает Wi-Fi. После загрузки обычное управление проводными и беспроводными сетями осуществляет NetworkManager. См. [Сетевые подключения](/using-minios/Networking) для работы с сетью во время сеанса и [live-config](/reference/configuration/live-config) для всех сетевых переменных.

## Параметры раннего userspace MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, и `EXPORT_LOGS` — это параметры MiniOS, а не переменные live-config. Они читаются `minios-boot` до передачи управления основной системе и все являются **Перенастраиваемыми: Да**.

Соответствующие параметры загрузки `default-target=`, `enable-services=`, и `disable-services=` имеют приоритет для текущей загрузки. Параметр `text` принудительно включает `multi-user.target`.

В актуальных сборках Toolbox и Ultra параметр `ssh` добавляется в `ENABLE_SERVICES`. Чтобы явно отключить SSH, укажите его в `DISABLE_SERVICES`; простое удаление из `ENABLE_SERVICES` не отключает службу.

С параметром `EXPORT_LOGS="true"`, на доступный для записи носитель MiniOS сохраняются журналы запуска:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Соответствующие журналы работы — это `/var/log/minios/minios-boot.log` и `/var/log/live/config.log`.

## Источник, копия во время работы и приоритет

Выбранный каталог данных MiniOS обычно содержит следующие исходные файлы:

| Выбранный каталог данных | Работающая система |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

На стандартных смонтированных носителях они видны как `minios/config.conf` и `minios/config.conf.d/*.conf`, обычно в `/run/initramfs/memory/data/` при работе системы.

Синхронизация происходит при загрузке; это не мониторинг файлов:

- Более новая копия `config.conf` определяется по времени изменения. Более свежая копия на носителе копируется в live root. Более свежая копия во время работы копируется обратно только если выбранный каталог данных MiniOS доступен для записи.
- Каждый файл `config.conf.d/*.conf` синхронизируется независимо по имени файла с использованием тех же правил по времени и доступности для записи. Файлы не удаляются ни с одной из сторон.
- Если время на часах меньше времени последней синхронизации, сравнение времени пропускается, и копируются только отсутствующие файлы.
- `toram=trim` копирует `config.conf` но пропускает `config.conf.d/`. Полная `toram` копирует дерево данных, но дальнейшая синхронизация происходит уже с копией RAM, а не с исходным носителем.
После синхронизации `live-config` сначала читает `/etc/live/config.conf` а затем `/etc/live/config.conf.d/*.conf` в порядке shell glob. Поздний фрагмент может переопределить значение из основного файла или более раннего фрагмента.

Фактическая командная строка ядра добавляется к `LIVE_CONFIG_CMDLINE`. Если параметр встречается несколько раз, приоритет имеет более позднее вхождение из командной строки ядра. `minios-boot` аналогично отдает приоритет своим распознанным параметрам ядра по сравнению с соответствующими настройками из `/etc/live/config.conf`.

Вы можете добавить проектные переменные оболочки в `config.conf` или его фрагменты и читать их из копий во время работы. Значения указывайте в кавычках как строки shell, не ставьте пробелы вокруг `=`.

## Связанные справочные материалы

- [Параметры загрузки](/reference/Boot-Parameters) — параметры, которые должны быть указаны в командной строке ядра, и переопределения live-config.
- [live-config](/reference/configuration/live-config) — полный справочник по параметрам, переменным, компонентам и состояниям позднего userspace.
- [Режимы загрузки](/using-minios/Boot-Modes) — как персистентность и `toram` влияют на хранение конфигурации.
