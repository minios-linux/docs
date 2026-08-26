---
updated: 2026-08-26
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# LIVE-CONFIG

**live-config** — компоненты конфигурации системы

**live-config** содержит компоненты, которые настраивают live-систему в процессе загрузки (на поздней стадии userspace).

Сетевая загрузка в initramfs (`ip=`, PXE, `from=http://…`) — это отдельный слой LiveKit и **не** управляется live-config. См. [Сетевая загрузка](/installation/Network-Boot.md).

**live-config** можно настраивать через параметры загрузки или файлы конфигурации во время выполнения, подготовленные initramfs. Фактическая командная строка ядра добавляется после значений `LIVE_CONFIG_CMDLINE`, предоставленных файлами, поэтому более поздние совпадающие параметры загрузки имеют приоритет. При использовании постоянства компоненты **live-config** обычно запускаются только один раз.

Если для сборки live-системы используется *live-build*(7), параметры live-config, используемые по умолчанию, можно задать через опцию `--bootappend-live`, см. руководство *lb_config*(1).

## Параметры загрузки (компоненты)

**live-config** активируется только если в параметрах загрузки используется `boot=live`. Кроме того, **live-config** необходимо указать, какие компоненты запускать, через параметр `live-config.components` или какие компоненты не запускать, через параметр `live-config.nocomponents`. Если используются оба параметра `live-config.components` и `live-config.nocomponents`, либо если какой-либо из них указан несколько раз, всегда приоритет имеет последний из указанных.

- **live-config.components | components**: Запускаются все компоненты. Это поведение используется по умолчанию в live-образах.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются только указанные компоненты. Обратите внимание, что порядок важен, например, `live-config.components=sudo,user-setup` не сработает, так как пользователь должен быть добавлен до настройки sudo. Для определения порядка смотрите номера в именах файлов компонентов в `/usr/lib/live/config`.
- **live-config.nocomponents | nocomponents**: Не запускается ни один компонент. Это то же самое, что и не использовать параметры `live-config.components` или `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются все компоненты, кроме указанных.

## Параметры загрузки (опции)

Некоторые отдельные компоненты могут изменять своё поведение в зависимости от параметра загрузки.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Загружает и применяет один или несколько файлов debconf preseed. URL-адреса обрабатываются с помощью `wget` и могут использовать HTTP, FTP или `file://`. Ключевое слово `filesystem` разворачивает файлы в `/usr/lib/live/config-preseed/`; `medium` разворачивает файлы в `minios/config-preseed/` на обнаруженном live-носителе. Явные локальные файлы могут использовать пути вида `file:///run/initramfs/memory/data/minios/config-preseed/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, обрабатываются в указанном порядке; файлы, развёрнутые по ключевому слову, используют порядок оболочки glob.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Позволяет задать имя хоста системы. По умолчанию — `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Позволяет задать имя пользователя, которое будет создано для автологина. По умолчанию — `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Позволяет задать группы по умолчанию для пользователей, создаваемых для автологина. По умолчанию — `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Позволяет задать полное имя пользователя, создаваемого для автологина. В MiniOS по умолчанию — `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Позволяет задать пароль root в открытом виде.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Позволяет задать пароль root в зашифрованном виде.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Позволяет задать пароль пользователя в открытом виде.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Позволяет задать пароль пользователя в зашифрованном виде.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Позволяет задать локаль системы, например `de_CH.UTF-8`. По умолчанию — `en_US.UTF-8`. Если выбранная локаль ещё не доступна в системе, она будет создана автоматически на лету.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Позволяет задать часовой пояс системы, например `Europe/Zurich`. По умолчанию — `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Позволяет изменить модель клавиатуры. Значение по умолчанию не задано.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Позволяет изменить раскладки клавиатуры. Если указано несколько, инструменты рабочего окружения позволят переключать их в X11. Значение по умолчанию не задано.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Позволяет изменить варианты клавиатуры. Если указано несколько, количество значений должно совпадать с количеством раскладок, так как они сопоставляются по порядку. Допустимы пустые значения. Инструменты рабочего окружения позволят переключаться между каждой парой раскладка/вариант в X11. Значение по умолчанию не задано.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Позволяет изменить опции клавиатуры. Значение по умолчанию не задано.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Позволяет отключить сервисы sysv через update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Позволяет указать, считает ли система, что аппаратные часы установлены по UTC. По умолчанию — `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Позволяет задать x-session-manager через update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Позволяет задать драйвер xorg вместо автоопределения. Если PCI ID указан в `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` внутри live-системы, *DRIVER* будет принудительно использован для этих устройств. Если найден и параметр загрузки, и переопределение, приоритет имеет параметр загрузки.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Позволяет задать разрешение xorg вместо автоопределения, например 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Позволяет задать драйвер WLAN вместо автоопределения. Если PCI ID указан в `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` внутри live-системы, *DRIVER* будет принудительно использован для этих устройств. Если найден и параметр загрузки, и переопределение, приоритет имеет параметр загрузки.
- **live-config.module-mode=MODE | module-mode=MODE**: Позволяет указать режим модуля для live-конфигурации. При значении "merged" система обновит учётные записи пользователей, пересоберёт кэши и обновит настройки пакетов, чтобы изменения конфигурации были динамически интегрированы в работающую систему.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Загружает и выполняет произвольные файлы из временного файла в работающей live-системе. URL-адреса обрабатываются с помощью `wget` и могут использовать HTTP, FTP или `file://`; необходимые интерпретаторы и другие зависимости должны быть уже установлены. Ключевое слово `filesystem` разворачивает файлы в `/usr/lib/live/config-hooks/`; `medium` разворачивает файлы в `minios/config-hooks/` на обнаруженном live-носителе (с резервным вариантом ISO-пути в компоненте hook). Явные локальные файлы могут использовать `file:///run/initramfs/memory/data/minios/config-hooks/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, выполняются в указанном порядке; файлы, развёрнутые по ключевому слову, используют порядок оболочки glob. Примеры установлены в `/usr/share/doc/live-config/examples/hooks/`.

> **Внимание по безопасности:** `live-config` выполняется от имени root. Хуки делаются исполняемыми и запускаются от root, а preseeds изменяют базу данных debconf с правами root. Обычные HTTP и FTP не аутентифицируют загружаемый контент и не обеспечивают целостность. Предпочитайте проверенные локальные файлы или доверенный аутентифицированный транспорт с независимой проверкой целостности; не используйте удалённые хуки или preseeds из ненадёжных сетей.

## Параметры загрузки (сокращения)

Для некоторых типовых сценариев, где потребовалось бы комбинировать несколько отдельных параметров, **live-config** предоставляет сокращения. Это позволяет как получить полный контроль над всеми опциями, так и упростить настройку.

- **live-config.noroot | noroot**: Отключает sudo и policykit, пользователь не может получить root-права в системе.
- **live-config.noautologin | noautologin**: Отключает как автоматический вход в консоль, так и графический автологин.
- **live-config.nottyautologin | nottyautologin**: Отключает автоматический вход в консоль, не затрагивая графический автологин.
- **live-config.nox11autologin | nox11autologin**: Отключает автоматический вход через любой дисплей-менеджер, не затрагивая автологин по tty.

## Параметры загрузки (специальные опции)

Для особых сценариев существуют специальные параметры загрузки.

- **live-config.debug | debug**: Включает вывод отладочной информации в live-config.

## Файлы конфигурации

**live-config** можно настраивать (но не активировать) через конфигурационные файлы. Всё, кроме ярлыков, что можно задать через параметр загрузки, также может быть настроено через один или несколько файлов. Если используются конфигурационные файлы, параметр `boot=live` всё равно необходим для активации **live-config**.

**Примечание:** Если используются конфигурационные файлы, рекомендуется (предпочтительно) все параметры загрузки поместить в переменную **LIVE_CONFIG_CMDLINE**, либо можно задать отдельные переменные. Если используются отдельные переменные, пользователь должен убедиться, что все необходимые переменные заданы для создания корректной конфигурации.

Сам `live-config` последовательно подключает `/etc/live/config.conf`, а затем `/etc/live/config.conf.d/*.conf` в порядке, определяемом shell glob. Таким образом, более поздние фрагменты могут переопределять значения из основного файла или предыдущих фрагментов. Отдельный второй слой конфигурации с другого носителя не подключается.

На носителях MiniOS исходными файлами являются `minios/config.conf` и `minios/config.conf.d/*.conf`. До запуска `live-config` initramfs MiniOS синхронизирует их с рабочими файлами `/etc/live/` по времени изменения. Более новый исходный файл заменяет свой рабочий аналог; более новый рабочий файл копируется обратно только если выбранная директория данных MiniOS доступна для записи. Если метки времени совпадают — копирование не происходит, отсутствующие файлы дополняются, файлы не удаляются. Это синхронизация при загрузке, а не постоянный мониторинг. Полные правила синхронизации и приоритетов командной строки смотрите в разделе [Configuration file](/configuration/Configuration-File.md).

В качестве резервного варианта для реализаций initramfs, которые не подготовили рабочий файл, обёртки запуска systemd и SysV копируют `minios/config.conf` с обнаруженного носителя только если отсутствует `/etc/live/config.conf`. Этот резервный механизм не копирует фрагменты `config.conf.d`. Стандартный initramfs LiveKit для MiniOS выполняет описанную выше синхронизацию.

Фрагменты файлов должны соответствовать шаблону `*.conf`. Рекомендуются имена вроде `vendor.conf` или `project.conf`; выбирайте имена осознанно, так как более поздние фрагменты переопределяют предыдущие.

Содержимое конфигурационных файлов состоит из одной или нескольких следующих переменных:

- **LIVE_CONFIG_CMDLINE=ПАРАМЕТР1 ПАРАМЕТР2...ПАРАМЕТРn**: Эта переменная соответствует командной строке загрузчика.
- **LIVE_CONFIG_COMPONENTS=КОМПОНЕНТ1,КОМПОНЕНТ2,...КОМПОНЕНТn**: Эта переменная соответствует параметру `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=КОМПОНЕНТ1,КОМПОНЕНТ2,...КОМПОНЕНТn**: Эта переменная соответствует параметру `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Эта переменная соответствует параметру `**live-config.hostname**=*HOSTNAME*`. Значение по умолчанию — `minios`.
- **LIVE_USERNAME=USERNAME**: Эта переменная соответствует параметру `**live-config.username**=*USERNAME*`. Значение по умолчанию — `live`.
- **LIVE_USER_DEFAULT_GROUPS=ГРУППА1,ГРУППА2,...ГРУППАн**: Эта переменная соответствует параметру `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="ПОЛНОЕ ИМЯ ПОЛЬЗОВАТЕЛЯ"**: Эта переменная соответствует параметру `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.root-password**=*PASSWORD*`. Указывает пароль root в открытом виде.
- **LIVE_ROOT_PASSWORD_CRYPTED=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.root-password-crypted**=*PASSWORD*`. Указывает пароль root в зашифрованном виде.
- **LIVE_USER_PASSWORD=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.user-password**=*PASSWORD*`. Указывает пароль пользователя в открытом виде.
- **LIVE_USER_PASSWORD_CRYPTED=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.user-password-crypted**=*PASSWORD*`. Указывает пароль пользователя в зашифрованном виде.
- **LIVE_LOCALES=ЛОКАЛЬ1,ЛОКАЛЬ2,...ЛОКАЛЬn**: Эта переменная соответствует параметру `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=ЧАСОВОЙ_ПОЯС**: Эта переменная соответствует параметру `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=МОДЕЛЬ_КЛАВИАТУРЫ**: Эта переменная соответствует параметру `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=РАСКЛАДКА1,РАСКЛАДКА2,...РАСКЛАДКАн**: Эта переменная соответствует параметру `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=ВАРИАНТ1,ВАРИАНТ2,...ВАРИАНТn**: Эта переменная соответствует параметру `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=ОПЦИИ_КЛАВИАТУРЫ**: Эта переменная соответствует параметру `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=СЕРВИС1,СЕРВИС2,...СЕРВИСn**: Эта переменная соответствует параметру `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Эта переменная соответствует параметру `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Эта переменная соответствует параметру `**live-config.x-session-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Эта переменная соответствует параметру `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Эта переменная соответствует параметру `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Эта переменная соответствует параметру `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Эта переменная соответствует параметру `**live-config.link-user-dirs**=true|false`. Она создает ссылки на стандартные пользовательские каталоги данных на записываемый диск MiniOS. Не может использоваться одновременно с bind-режимом или любым режимом `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Эта переменная соответствует параметру `**live-config.bind-user-dirs**=true|false`. Она монтирует стандартные пользовательские каталоги данных с записываемого диска MiniOS в режиме bind. Не может использоваться одновременно с link-режимом или любым режимом `toram`.
- **LIVE_USER_DIRS_PATH=ПУТЬ**: Эта переменная соответствует параметру `**live-config.user-dirs-path**=*PATH*`. Указывает безопасный путь внутри диска MiniOS с файловой системой FAT32, exFAT или NTFS. По умолчанию — `/minios/userdata`; сегменты с точками и переходами к родительскому каталогу отклоняются.

При настройке пользовательского носителя никогда не происходит автоматического объединения двух непустых директорий. Локальная непустая директория переносится только если соответствующая директория на носителе пуста. При отключении функции управляемые данные с носителя копируются обратно перед удалением ссылок. Неудачная проверка или копирование оставляет существующие пользовательские каталоги без изменений и записывает причину в `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Эта переменная хранит состояние, заданное параметром `live-config.module-mode` (или `module-mode`). Если установлено значение "merged", живая система применяет обновления (через minios-update-users, minios-update-cache и minios-update-dpkg) для объединения пользовательских настроек с базовой средой.
- **LIVE_CONFIG_DEBUG=true|false**: Эта переменная соответствует параметру `**live-config.debug**`.

# КАСТОМИЗАЦИЯ

**live-config** легко настраивается для дочерних проектов или локального использования.

## Добавление новых компонентов конфигурации

Дочерние проекты могут размещать свои компоненты в /usr/lib/live/config — для этого не требуется никаких дополнительных действий, компоненты будут автоматически запускаться при загрузке.

Лучше всего размещать компоненты в отдельном debian-пакете. Пример пакета с примером компонента можно найти в /usr/share/doc/live-config/examples.

## Удаление существующих компонентов конфигурации

Пока нет простого способа удалить компоненты без необходимости поставлять локально модифицированный пакет **live-config** или использовать dpkg-divert. Однако того же эффекта можно добиться, отключив соответствующие компоненты через механизм live-config.nocomponents (см. выше). Чтобы не указывать отключаемые компоненты каждый раз через параметры загрузки, рекомендуется использовать конфигурационный файл (см. выше).

Конфигурационные файлы для самой live-системы лучше всего размещать в отдельном debian-пакете. Пример пакета с примером конфигурации можно найти в /usr/share/doc/live-config/examples.

# КОМПОНЕНТЫ

**live-config** в настоящее время включает следующие компоненты в /usr/lib/live/config.

- **nss-systemd**: удаляет или восстанавливает модуль NSS systemd в /etc/nsswitch.conf для обхода известной проблемы systemd.
- **debconf**: позволяет применять произвольные preseed-файлы, размещённые на live-носителе или http/ftp-сервере.
- **hostname**: настраивает /etc/hostname и /etc/hosts.
- **issue-setup**: настраивает файл /etc/issue с приветственным баннером и информацией о дистрибутиве.
- **live-debconfig (passwd)**: настраивает пароли пользователя и root через live-debconfig.
- **user-setup**: добавляет учётную запись live-пользователя.
- **root-setup**: устанавливает или обновляет пароль root и настраивает окружение пользователя root.
- **sudo**: предоставляет live-пользователю права sudo.
- **user-media**: настраивает монтирование носителей и связывание или bind-монтирование пользовательских директорий для сохранения данных.
- **user-ssh-keys**: синхронизирует SSH-ключи из файлов `authorized_keys.<username>` на live-носителе в домашние директории пользователей. Поддерживает несколько пользователей одновременно (например, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **locales**: настраивает локали.
- **tzdata**: настраивает /etc/timezone.
- **xorg-service**: настраивает имя пользователя в xorg.service.
- **gdm3**: настраивает автологин в gdm3.
- **kdm**: настраивает автологин в kdm.
- **lightdm**: настраивает автологин в lightdm.
- **lxdm**: настраивает автологин в lxdm.
- **nodm**: настраивает автологин в nodm.
- **slim**: настраивает автологин в slim.
- **xinit**: настраивает автологин с помощью xinit.
- **keyboard-configuration**: настраивает клавиатуру.
- **sysvinit**: настраивает sysvinit.
- **sysv-rc**: настраивает sysv-rc, отключая указанные службы.
- **login**: отключает lastlog.
- **anacron**: отключает anacron.
- **util-linux**: отключает hwclock из util-linux.
- **apport**: отключает apport.
- **gnome-panel-data**: отключает кнопку блокировки экрана.
- **gnome-power-manager**: отключает гибернацию.
- **gnome-screensaver**: отключает блокировку экрана через screensaver.
- **kaboom**: отключает мастер миграции KDE (squeeze и новее).
- **kde-services**: отключает некоторые нежелательные службы KDE (squeeze и новее).
- **policykit**: предоставляет пользователю права через policykit.
- **ssl-cert**: регенерирует тестовые ssl-сертификаты (snake-oil).
- **xrdp**: настраивает xrdp для удалённого рабочего стола.
- **xfce4-panel**: настраивает xfce4-panel по умолчанию.
- **xscreensaver**: отключает блокировку экрана через screensaver.
- **broadcom-sta**: настраивает драйверы WLAN broadcom-sta.
- **xserver-xorg**: настраивает xserver-xorg.
- **openssh-server**: пересоздаёт ключи хоста openssh-server.
- **hyperv**: настраивает X11 для повышения совместимости с платформами Microsoft Hyper-V.
- **ntfs3**: управляет правилами udev для поддержки NTFS3.
- **config-module-mode**: настраивает режим модуля системы и обновляет кэши, пользовательские настройки и dpkg.
- **hooks**: позволяет запускать произвольные команды из файла, размещённого на live-носителе или http/ftp-сервере.

# ФАЙЛЫ

- `minios/config.conf` на выбранном носителе данных MiniOS (исходная копия)
- `minios/config.conf.d/*.conf` на выбранном носителе данных MiniOS (исходные фрагменты)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` на доступном для записи выбранном носителе данных при включённом экспорте логов
- `/usr/lib/live/config-hooks/*` (`filesystem` хуки)
- `minios/config-hooks/*` на обнаруженном live-носителе (`medium` хуки)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` на обнаруженном live-носителе (`medium` preseeds)

# СМ. ТАКЖЕ

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# ДОМАШНЯЯ СТРАНИЦА

Больше информации о **minios-live-config** и проекте MiniOS можно найти на [minios.dev](https://minios.dev) и в [репозитории GitHub](https://github.com/minios-linux/minios-live).

# ОШИБКИ

Сообщить об ошибках можно, создав issue в репозитории GitHub по адресу [MiniOS Issues](https://github.com/minios-linux/minios-live/issues).

# АВТОР

**live-config** изначально был написан Даниэлем Бауманом ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). С 2016 года разработку продолжает команда Debian Live. С 2025 года разработку модифицированной версии **minios-live-config** ведёт команда MiniOS Live.
