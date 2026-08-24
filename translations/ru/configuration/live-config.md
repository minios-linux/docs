# LIVE-CONFIG

**live-config** — компоненты конфигурации системы

**live-config** содержит компоненты, которые настраивают live-систему во время загрузки (на поздней стадии userspace).

**live-config** можно настраивать с помощью параметров загрузки или конфигурационных файлов. Если для одной и той же опции используются оба механизма, приоритет имеют параметры загрузки. При использовании постоянства (persistency) компоненты **live-config** запускаются только один раз.

Если для сборки live-системы используется *live-build*(7), параметры live-config по умолчанию можно задать через опцию `--bootappend-live`, подробнее см. в руководстве *lb_config*(1).

## Параметры загрузки (компоненты)

**live-config** активируется только если в параметрах загрузки используется `boot=live`. Кроме того, **live-config** необходимо указать, какие компоненты запускать, через параметр `live-config.components` или какие компоненты не запускать, через параметр `live-config.nocomponents`. Если используются оба параметра `live-config.components` и `live-config.nocomponents`, либо если какой-либо из них указан несколько раз, всегда приоритет имеет последний из указанных.

- **live-config.components | components**: Запускаются все компоненты. Это поведение используется по умолчанию в live-образах.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются только указанные компоненты. Обратите внимание, что порядок важен, например, `live-config.components=sudo,user-setup` не сработает, так как пользователь должен быть добавлен до настройки sudo. Для определения порядка смотрите номера в именах файлов компонентов в `/usr/lib/live/config`.
- **live-config.nocomponents | nocomponents**: Не запускается ни один компонент. Это то же самое, что и не использовать параметры `live-config.components` или `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются все компоненты, кроме указанных.

## Параметры загрузки (опции)

Некоторые отдельные компоненты могут изменять своё поведение в зависимости от параметра загрузки.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Позволяет получить и применить один или несколько debconf preseed-файлов для применения к базе данных debconf. Обратите внимание, что URL должны быть доступны через wget (http, ftp или file://). Если файл находится на live-носителе, его можно получить по пути `file:///run/initramfs/memory/data/FILE`, либо по `file:///FILE`, если он находится в корневой файловой системе самой live-системы. Все preseed-файлы в `/usr/lib/live/config-preseed/` в корневой файловой системе live-системы могут быть автоматически активированы с помощью ключевого слова `filesystem`. Все preseed-файлы в `/minios/config-preseed/` на live-носителе — с помощью ключевого слова `medium`. Если используются несколько механизмов, сначала применяются preseed-файлы из файловой системы, затем с носителя, и в последнюю очередь — сетевые preseed-файлы.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Позволяет задать имя хоста системы. По умолчанию — `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Позволяет задать имя пользователя, который будет создан для автологина. По умолчанию — `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Позволяет задать группы по умолчанию для пользователей, создаваемых для автологина. По умолчанию: `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Позволяет задать полное имя пользователя, создаваемого для автологина. В MiniOS по умолчанию — `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Позволяет задать пароль root в открытом виде.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Позволяет задать пароль root в зашифрованном виде.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Позволяет задать пароль пользователя в открытом виде.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Позволяет задать пароль пользователя в зашифрованном виде.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Позволяет задать локаль системы, например, `de_CH.UTF-8`. По умолчанию — `en_US.UTF-8`. Если выбранная локаль недоступна в системе, она будет автоматически сгенерирована.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Позволяет задать часовой пояс системы, например, `Europe/Zurich`. По умолчанию — `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Позволяет изменить модель клавиатуры. Значение по умолчанию не задано.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Позволяет изменить раскладки клавиатуры. Если указано несколько, инструменты окружения рабочего стола позволят переключать их в X11. Значение по умолчанию не задано.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Позволяет изменить варианты клавиатуры. Если указано несколько, количество значений должно соответствовать количеству раскладок, так как они сопоставляются по порядку. Пустые значения допустимы. Инструменты окружения рабочего стола позволят переключаться между каждой парой раскладка/вариант в X11. Значение по умолчанию не задано.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Позволяет изменить опции клавиатуры. Значение по умолчанию не задано.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Позволяет отключить службы sysv через update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Позволяет указать, считать ли, что аппаратные часы установлены по UTC. По умолчанию — `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Позволяет задать x-session-manager через update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Позволяет задать драйвер xorg вместо автоопределения. Если PCI ID указан в `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` внутри live-системы, *DRIVER* будет принудительно использоваться для этих устройств. Если одновременно заданы параметр загрузки и переопределение, приоритет имеет параметр загрузки.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Позволяет задать разрешение xorg вместо автоопределения, например, 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Позволяет задать драйвер WLAN вместо автоопределения. Если PCI ID указан в `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` внутри live-системы, *DRIVER* будет принудительно использоваться для этих устройств. Если одновременно заданы параметр загрузки и переопределение, приоритет имеет параметр загрузки.
- **live-config.module-mode=MODE | module-mode=MODE**: Позволяет указать режим модуля для live-конфигурации. При значении "merged" система обновляет учетные записи пользователей, перестраивает кэши и обновляет настройки пакетов, чтобы изменения конфигурации динамически интегрировались в работающую систему.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Позволяет получить и выполнить один или несколько произвольных файлов. Обратите внимание, что URL должны быть доступны через wget (http, ftp или file://), файлы выполняются в /tmp работающей live-системы, и все зависимости (если есть) должны быть уже установлены, например, для выполнения python-скрипта в системе должен быть установлен python. Некоторые хуки для типовых сценариев доступны в `/usr/share/doc/live-config/examples/hooks/`. Если файл находится на live-носителе, его можно получить по пути `file:///run/initramfs/memory/data/FILE`, либо по `file:///FILE`, если он находится в корневой файловой системе самой live-системы. Все хуки в `/usr/lib/live/config-hooks/` в корневой файловой системе live-системы могут быть автоматически активированы с помощью ключевого слова `filesystem`. Все хуки в `/minios/config-hooks/` на live-носителе — с помощью ключевого слова `medium`. Если используются несколько механизмов, сначала выполняются хуки из файловой системы, затем с носителя, и в последнюю очередь — сетевые хуки.

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

**live-config** можно настраивать (но не активировать) с помощью файлов конфигурации. Всё, кроме ярлыков, что можно задать через параметр загрузки, также может быть настроено через один или несколько файлов. Если используются файлы конфигурации, параметр `boot=live` всё равно необходим для активации **live-config**.

**Примечание:** Если используются файлы конфигурации, рекомендуется (предпочтительно) все параметры загрузки поместить в переменную **LIVE_CONFIG_CMDLINE**, либо можно задать отдельные переменные. Если используются отдельные переменные, пользователь должен убедиться, что все необходимые переменные заданы для создания корректной конфигурации.

Файлы конфигурации можно размещать либо в самой корневой файловой системе (`/etc/live/config.conf`, `/etc/live/config.conf.d/*.conf`), либо на live-носителе (`minios/config.conf`, `minios/config.conf.d/*.conf`). Если для определённой опции используются оба места, приоритет имеют файлы с live-носителя по сравнению с файлами из корневой файловой системы.

Хотя для файлов конфигурации, размещённых в каталогах конфигурации, не требуется определённое имя, для единообразия рекомендуется использовать схему именования `vendor.conf` или `project.conf` (где `vendor` или `project` заменяется на фактическое имя, что приводит к имени файла вроде `progress-linux.conf`).

Содержимое файлов конфигурации состоит из одной или нескольких следующих переменных.

- **LIVE_CONFIG_CMDLINE=ПАРАМЕТР1 ПАРАМЕТР2...ПАРАМЕТРn**: Эта переменная соответствует командной строке загрузчика.
- **LIVE_CONFIG_COMPONENTS=КОМПОНЕНТ1,КОМПОНЕНТ2,...КОМПОНЕНТn**: Эта переменная соответствует параметру `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=КОМПОНЕНТ1,КОМПОНЕНТ2,...КОМПОНЕНТn**: Эта переменная соответствует параметру `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=ИМЯ_ХОСТА**: Эта переменная соответствует параметру `**live-config.hostname**=*HOSTNAME*`. По умолчанию — `minios`.
- **LIVE_USERNAME=ИМЯ_ПОЛЬЗОВАТЕЛЯ**: Эта переменная соответствует параметру `**live-config.username**=*USERNAME*`. По умолчанию — `live`.
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
- **LIVE_LINK_USER_DIRS=true|false**: Эта переменная соответствует параметру `**live-config.link-user-dirs**=true|false`. Она связывает стандартные пользовательские каталоги данных с доступным для записи диском MiniOS. Не может использоваться совместно с режимом bind или любым режимом `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Эта переменная соответствует параметру `**live-config.bind-user-dirs**=true|false`. Она монтирует стандартные пользовательские каталоги данных с доступного для записи диска MiniOS в режиме bind. Не может использоваться совместно с режимом link или любым режимом `toram`.
- **LIVE_USER_DIRS_PATH=ПУТЬ**: Эта переменная соответствует параметру `**live-config.user-dirs-path**=*PATH*`. Указывает безопасный путь внутри диска MiniOS с файловой системой FAT32, exFAT или NTFS. По умолчанию — `/minios/userdata`; сегменты с точкой и переходом к родительскому каталогу отклоняются.

При настройке пользовательских носителей никогда не происходит автоматического объединения двух непустых каталогов. Локальный непустой каталог переносится только если его место назначения на носителе пусто. При отключении функции управляемые данные с носителя копируются обратно перед удалением ссылок. В случае ошибки проверки или копирования существующие пользовательские каталоги остаются на месте, а причина записывается в `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Эта переменная содержит состояние, заданное параметром `live-config.module-mode` (или `module-mode`). Если установлено значение "merged", live-система применяет обновления (через minios-update-users, minios-update-cache и minios-update-dpkg) для объединения пользовательских настроек с базовой средой.
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

- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `minios/config.conf`
- `minios/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/minios/config-hooks/*`
- `minios/config-hooks/*`
- `/minios/config-preseed/*`
- `minios/config-preseed/*`

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
