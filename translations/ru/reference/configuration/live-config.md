---
updated: 2026-09-26
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**Компоненты настройки системы** - компоненты настройки системы

**live-config** содержит компоненты, которые настраивают live-систему во время загрузки (на позднем этапе userspace).

Сетевой загрузчик в initramfs (`ip=`, PXE, `from=http://…`) реализован отдельным слоем LiveKit и **не** управляется live-config. Подробнее см. [Сетевая загрузка](/reference/boot-process/Network-Boot).

**live-config** можно настроить через параметры загрузки или файлы конфигурации, подготовленные initramfs. Фактическая командная строка ядра добавляется после значений из файлов, поэтому более поздние параметры загрузки имеют приоритет. Компоненты, которые записывают состояние в `LIVE_CONFIG_CMDLINE` обычно запускаются только один раз; синхронизирующие и stateless-компоненты могут выполняться при каждом запуске.`/var/lib/live/config`

Если *live-build*(7) используется для сборки live-системы, параметры live-config по умолчанию можно задать через опцию `--bootappend-live` , см. *lb_config*(1) в справочной странице.

## Параметры загрузки (компоненты)

**live-config** активируется только если `boot=live` используется как параметр загрузки. По умолчанию запускаются все компоненты. Параметр `live-config.components` позволяет ограничить список запускаемых компонентов, а `live-config.nocomponents` — исключить отдельные компоненты. Если оба параметра используются или любой из них указан несколько раз, приоритет имеет последнее вхождение.

- **live-config.components | components**: Запускаются все компоненты. Это поведение по умолчанию для live-образов.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются только указанные компоненты. Компоненты выполняются в порядке, определённом их именами файлов в `/usr/lib/live/config`, независимо от их порядка в списке.
- **live-config.nocomponents | nocomponents**: Не запускается ни один компонент.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются все компоненты, кроме указанных.

## Параметры загрузки (опции)

Некоторые отдельные компоненты могут изменять своё поведение в зависимости от параметра загрузки.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Загружает и применяет один или несколько файлов debconf preseed. URL-адреса обрабатываются с помощью `wget` и могут использовать HTTP, FTP или `file://`. Ключевое слово `filesystem` разворачивает файлы в `/usr/lib/live/config-preseed/`; `medium` разворачивает файлы в `minios/config-preseed/` на обнаруженном live-носителе. Явные локальные файлы могут использовать пути вида `file:///run/initramfs/memory/data/minios/config-preseed/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, обрабатываются в указанном порядке; файлы, развёрнутые по ключевому слову, используют порядок оболочки (shell glob).
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Позволяет задать имя хоста системы. По умолчанию используется `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Определяет политику проводной сети. Если не задано или `dhcp` — используется значение по умолчанию для образа. `static` записывает конфигурацию для выбранного backend; `off` отключает автоматическую настройку IPv4 для выбранного интерфейса.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Определяет проводной интерфейс. Если не указан для `static` или `off`, автоматически выбирается единственный проводной не-loopback интерфейс; если кандидатов ноль или несколько, требуется явное указание.
- **live-config.network-address=IPV4 | network-address=IPV4**: Задаёт статический IPv4-адрес.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Устанавливает длину префикса IPv4 от 0 до 32. По умолчанию для статической настройки используется `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Устанавливает необязательный шлюз IPv4.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Указывает необязательные адреса DNS-серверов через запятую.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Выбирает backend сети. `auto` предпочитает NetworkManager и при необходимости использует ifupdown. Принудительный выбор `ifupdown` делает интерфейс неуправляемым для NetworkManager, если установлены оба стека.
- **live-config.username=USERNAME | username=USERNAME**: Позволяет задать имя пользователя, которое будет создано для автологина. По умолчанию используется `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Устанавливает дополнительные группы для пользователя, созданного для автологина. Названия групп могут быть разделены запятыми или пробелами. По умолчанию используется MiniOS`dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Позволяет задать полное имя пользователя, созданного для автологина. По умолчанию используется MiniOS`MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Позволяет установить пароль root в открытом виде.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Позволяет установить пароль root в зашифрованном виде.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Позволяет установить пароль пользователя в открытом виде.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Позволяет установить пароль пользователя в зашифрованном виде.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Позволяет задать локаль системы, например `de_CH.UTF-8`. По умолчанию используется `en_US.UTF-8`. Если выбранная локаль ещё не доступна в системе, она будет автоматически сгенерирована на лету.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Позволяет задать часовой пояс системы, например `Europe/Zurich`. По умолчанию используется `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Позволяет изменить модель клавиатуры. Значение по умолчанию не задано.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Позволяет изменить раскладки клавиатуры. Если указано несколько раскладок, инструменты рабочего окружения позволят переключаться между ними в X11. Значение по умолчанию не задано.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Позволяет изменить варианты раскладок клавиатуры. Если указано несколько вариантов, их количество должно совпадать с количеством раскладок, так как они будут сопоставляться по порядку. Допускаются пустые значения. Инструменты рабочего окружения позволят переключаться между каждой парой раскладки и варианта в X11. Значение по умолчанию не задано.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Позволяет изменить параметры клавиатуры. Значение по умолчанию не задано.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Позволяет отключить службы sysv с помощью update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Позволяет указать, считает ли система, что аппаратные часы установлены по UTC. По умолчанию используется `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Позволяет задать x-session-manager через update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Позволяет указать драйвер xorg вместо его автоматического определения. Если в `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` в live-системе указан PCI ID, то для этих устройств будет применён *DRIVER*. Если одновременно указан параметр загрузки и переопределение, приоритет имеет параметр загрузки.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Позволяет задать разрешение xorg вместо его автоматического определения, например 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Позволяет указать драйвер WLAN вместо его автоматического определения. Если в `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` в live-системе указан PCI ID, то *DRIVER* будет применяться для этих устройств принудительно. Если задан и параметр загрузки, и переопределение, приоритет имеет параметр загрузки.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Позволяет указать режим модуля для live-конфигурации. Если выбран `merged`, система обновит учетные записи пользователей, пересоберет кэши и обновит параметры пакетов, чтобы изменения конфигурации динамически применялись в работающей системе.
- **live-config.link-user-dirs | link-user-dirs**: Создаёт ссылки на управляемые пользовательские каталоги по настроенному пути на носителе данных MiniOS. Несовместимо с режимом bind и недоступно при любом `toram` режиме или при активной сессии с шифрованием LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Монтирует управляемые пользовательские каталоги из настроенного пути на носителе данных MiniOS с использованием bind-монта. Несовместимо с режимом link и имеет такие же `toram` и ограничения по шифрованию активной сессии.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Задаёт относительный к носителю путь, используемый для `link-user-dirs` или `bind-user-dirs`. По умолчанию используется `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Загружает и выполняет произвольные файлы из временного файла в работающей live-системе. URL-адреса обрабатываются через `wget` и могут использовать HTTP, FTP или `file://`; необходимые интерпретаторы и другие зависимости должны быть установлены заранее. Ключевое слово `filesystem` разворачивает файлы из `/usr/lib/live/config-hooks/`; `medium` разворачивает файлы из `minios/config-hooks/` на обнаруженном live-носителе (с резервным вариантом ISO-пути в компоненте hook). Явно указанные локальные файлы могут использовать `file:///run/initramfs/memory/data/minios/config-hooks/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, выполняются в указанном порядке; файлы, развёрнутые по ключевому слову, — в порядке shell glob. Примеры установлены в `/usr/share/doc/live-config/examples/hooks/`.

> **Предупреждение по безопасности:** `live-config` выполняется с правами root. Хуки делаются исполняемыми и запускаются от имени root, а preseeds изменяют базу данных debconf системы с правами root. Обычные HTTP и FTP не аутентифицируют загружаемый контент и не обеспечивают его целостность. Предпочитайте проверенные локальные файлы или доверенный аутентифицированный транспорт с независимой проверкой целостности; не используйте удалённые хуки или preseeds из недоверенных сетей.

## Параметры загрузки (ярлыки)

Для некоторых типовых сценариев, где обычно требуется комбинировать несколько отдельных параметров, **live-config** предоставляет ярлыки. Это позволяет как получить полный контроль над всеми опциями, так и упростить настройку.

- **live-config.noroot | noroot**: Отключает установку пароля root и привилегии MiniOS sudo и PolicyKit.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Управляет настройкой sudo для live-пользователя. Значение по умолчанию и историческое поведение MiniOS при отсутствии параметра — `passwordless`. Режим `password` требует пароль live-пользователя для доступа к sudo. Режим `disabled` удаляет привилегии MiniOS sudo и исключает live-пользователя из группы sudo при создании пользователя. Более старый ярлык `noroot` отменяет это и полностью отключает настройку root-привилегий.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Управляет правилами удобства MiniOS PolicyKit. Значение по умолчанию и историческое поведение MiniOS при отсутствии параметра — `passwordless`. Режимы `password` и `disabled` удаляют это правило, и применяется обычная аутентификация PolicyKit дистрибутива. `disabled` не является строгой политикой запрета; используйте `noroot` если live-пользователь не должен получать административные права.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Записывает политику OpenSSH `PermitRootLogin` при явном указании и установленном openssh-server.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Записывает политику OpenSSH `PasswordAuthentication` при явном указании и установленном openssh-server.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Управляет политикой XRDP при установленном xrdp. Режим `relaxed` сохраняет исторические значения MiniOS. `hardened` ограничивает XRDP только localhost, включает повышенные настройки безопасности и запрещает вход root через XRDP. Режим `disabled` отключает и останавливает XRDP через `minios-svc` при наличии.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Управляет политикой удобства MiniOS X11. Режим `relaxed` сохраняет совместимость с историческими настройками. `hardened` удаляет разрешающий параметр `-ac` X-сервера и усиливает `Xwrapper.config` при наличии.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Управляет тем, показывает ли `/etc/issue` подсказки по умолчанию для паролей root/live MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Управляет тем, разрешает ли live-config ослабление блокировки экрана. `relaxed` сохраняет удобство для live-сессии, как было раньше. `hardened` не отключает блокировку экрана GNOME и включает блокировку xscreensaver, если файл присутствует.
- **live-config.noautologin | noautologin**: Запрещает live-config настраивать автологин в консоли и графической среде. Не удаляет автологин, если он уже настроен в постоянной сессии.
- **live-config.nottyautologin | nottyautologin**: Запрещает live-config настраивать автологин в консоли, не затрагивая графическую среду. Существующая постоянная настройка не удаляется.
- **live-config.nox11autologin | nox11autologin**: Запрещает live-config настраивать автологин через display-manager, не затрагивая TTY. Существующая постоянная настройка не удаляется.

## Параметры загрузки (специальные опции)

Для особых случаев предусмотрены специальные параметры загрузки.

- **live-config.debug | debug**: Включает вывод отладочной информации в live-config.

## Файлы конфигурации

**live-config** можно настраивать (но не активировать) через конфигурационные файлы. Любой поддерживаемый параметр загрузки можно указать в `LIVE_CONFIG_CMDLINE`, а большинство опций также можно задать через отдельные переменные. `boot=live` параметр по-прежнему необходим для активации **live-config**.

**Примечание:** Если используются конфигурационные файлы, то желательно (предпочтительно) все параметры загрузки помещать в переменную **LIVE_CONFIG_CMDLINE** либо задавать их через отдельные переменные. При использовании отдельных переменных пользователь должен убедиться, что все необходимые переменные заданы для создания корректной конфигурации.

`live-config` сам по себе подключает `/etc/live/config.conf` и затем `/etc/live/config.conf.d/*.conf` в порядке сортировки по шаблону оболочки. Более поздние фрагменты могут переопределять значения из основного файла или предыдущих фрагментов. Дополнительный слой конфигурации для второго носителя не подключается.

На носителях MiniOS исходными файлами являются `minios/config.conf` и `minios/config.conf.d/*.conf`. До запуска `live-config` MiniOS initramfs синхронизирует их с `/etc/live/` рабочими файлами по времени изменения. Новый исходный файл заменяет свой рабочий аналог; новый рабочий файл копируется обратно только если выбранный каталог данных MiniOS доступен для записи. При одинаковых временных метках копирование не происходит, отсутствующие файлы дополняются, а файлы не удаляются. Это синхронизация на этапе загрузки, а не постоянный мониторинг. Подробнее см. [Конфигурационный файл](/reference/configuration/config.conf) для полного описания правил синхронизации и приоритета командной строки.

В качестве резервного варианта для initramfs, которые не подготовили рабочий файл, обёртки запуска systemd и SysV копируют `minios/config.conf` с обнаруженного носителя только если `/etc/live/config.conf` отсутствует. Этот резервный механизм не копирует `config.conf.d` фрагменты. Стандартный современный MiniOS LiveKit initramfs выполняет синхронизацию на более раннем этапе.

Имена файлов-фрагментов должны соответствовать `*.conf`. Рекомендуются имена вроде `vendor.conf` или `project.conf`. Выбирайте имена осознанно: более поздние фрагменты переопределяют предыдущие.

Содержимое конфигурационных файлов представляет собой одну или несколько из следующих переменных.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Эта переменная соответствует командной строке загрузчика.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Эта переменная соответствует параметру `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Эта переменная соответствует параметру `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Эта переменная соответствует параметру `**live-config.hostname**=*HOSTNAME*` по умолчанию `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Определяет политику проводной сети. `dhcp` и незаданное значение не влияют на уже созданный статический профиль MiniOS.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Определяет проводной интерфейс для политики `static` или `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Устанавливает статический IPv4-адрес.
- **LIVE_NETWORK_PREFIX=PREFIX**: Устанавливает длину статического префикса; по умолчанию `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Устанавливает необязательный статический шлюз.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Устанавливает необязательные DNS-серверы через запятую.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Определяет используемый backend.

Компонент сети записывает `/var/lib/live/config/network` после успешной записи политики. Чтобы применить изменённую политику на постоянной системе, удалите этот штамп. Для удаления старого статического профиля используйте `network-method=off` или вручную удалите профиль и штамп, управляемые MiniOS.

- **LIVE_USERNAME=USERNAME**: Эта переменная соответствует параметру `**live-config.username**=*USERNAME*` по умолчанию `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Эта переменная соответствует параметру `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Эта переменная соответствует параметру `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Эта переменная соответствует параметру `**live-config.root-password**=*PASSWORD*`. Указывает пароль root в открытом виде.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Эта переменная соответствует параметру `**live-config.root-password-crypted**=*PASSWORD*`. Указывает пароль root в зашифрованном виде.
- **LIVE_USER_PASSWORD=PASSWORD**: Эта переменная соответствует параметру `**live-config.user-password**=*PASSWORD*`. Указывает пароль пользователя в открытом виде.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Эта переменная соответствует параметру `**live-config.user-password-crypted**=*PASSWORD*`. Указывает пароль пользователя в зашифрованном виде.
- **LIVE_CONFIG_NOROOT=true|false**: Эта переменная соответствует параметру `**live-config.noroot**` и при значении `true` отключает настройку root, sudo и PolicyKit-привилегий.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Эта переменная соответствует параметру `**live-config.sudo-mode**=...`. Если не задано, MiniOS сохраняет историческое поведение sudo без пароля.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Эта переменная соответствует параметру `**live-config.polkit-mode**=...`. `password` и `disabled` удаляют правило MiniOS для входа без пароля и восстанавливают стандартную аутентификацию PolicyKit дистрибутива.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Эта переменная соответствует параметру `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Эта переменная соответствует параметру `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Эта переменная соответствует параметру `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Эта переменная соответствует параметру `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Эта переменная соответствует параметру `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Эта переменная соответствует параметру `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Эта переменная соответствует параметру `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Эта переменная соответствует параметру `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Эта переменная соответствует параметру `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Эта переменная соответствует параметру `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Эта переменная соответствует параметру `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Эта переменная соответствует параметру `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Эта переменная соответствует параметру `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Эта переменная соответствует параметру `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Эта переменная соответствует параметру `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Эта переменная соответствует параметру `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Эта переменная соответствует параметру `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Эта переменная соответствует параметру `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Включает или отключает создание ссылок из стандартных пользовательских каталогов данных на доступный для записи диск MiniOS. Соответствующий параметр загрузки — просто флаг `live-config.link-user-dirs`. Режим ссылок несовместим с режимом bind или любым режимом `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Включает или отключает bind-монтирование стандартных пользовательских каталогов данных с доступного для записи диска MiniOS. Соответствующий параметр загрузки — просто флаг `live-config.bind-user-dirs`. Режим bind несовместим с режимом ссылок или любым режимом `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Эта переменная соответствует параметру `**live-config.user-dirs-path**=*PATH*`. Указывает безопасный путь внутри диска с файловой системой FAT32, exFAT или NTFS MiniOS. По умолчанию `/minios/userdata`; сегменты с точками и переходами к родительскому каталогу отклоняются.

Настройка пользовательских носителей никогда не объединяет автоматически две непустые директории. Локальная непустая директория переносится только если место назначения на носителе пустое. При отключении функции управляемые данные с носителя копируются обратно перед удалением ссылок. Активация пользовательских носителей и обратное копирование блокируются, если активная сессия постоянства зашифрована с помощью LUKS, чтобы предотвратить перенос данных сессии на незашифрованный носитель MiniOS. Решение принимается по фактическому состоянию шифрования: `perchencrypt=luks` только запрашивает шифрование при создании новой сессии и не описывает уже существующую. В случае ошибки проверки или копирования исходные пользовательские каталоги сохраняются, а причина фиксируется в `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Эта переменная хранит состояние, заданное параметром `live-config.module-mode` (или `module-mode`). При значении `merged`, live-система применяет обновления (через minios-update-users, minios-update-cache и minios-update-dpkg) для объединения пользовательских настроек с базовой средой.
- **LIVE_CONFIG_DEBUG=true|false**: Эта переменная соответствует параметру `**live-config.debug**`.

# КАСТОМИЗАЦИЯ

**live-config** легко настраивается для собственных проектов или локального использования.

## Добавление новых компонентов конфигурации

Проекты downstream могут размещать свои компоненты в /usr/lib/live/config — они будут автоматически запускаться при загрузке, дополнительных действий не требуется.

Лучше всего размещать компоненты в отдельном debian-пакете. Пример такого пакета с примером компонента находится в /usr/share/doc/live-config/examples.

## Удаление существующих компонентов конфигурации

В настоящее время нет простого способа удалить компоненты без необходимости либо поставлять локально изменённый пакет **live-config** либо использовать dpkg-divert. Однако того же эффекта можно достичь, отключив соответствующие компоненты через механизм live-config.nocomponents (см. выше). Чтобы не указывать отключаемые компоненты каждый раз в параметре загрузки, рекомендуется использовать конфигурационный файл (см. выше).

Файлы конфигурации для самой live-системы лучше всего размещать в отдельном debian-пакете. Пример такого пакета с примером конфигурации находится в /usr/share/doc/live-config/examples.

# ФАЙЛЫ

- `minios/config.conf` на выбранном MiniOS-носителе данных (копия исходника)
- `minios/config.conf.d/*.conf` на выбранном MiniOS-носителе данных (фрагменты исходника)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` на выбранных доступных для записи носителях данных при включённом экспорте логов
- `/usr/lib/live/config-hooks/*` (`filesystem` хуки)
- `minios/config-hooks/*` на обнаруженном live-носителе (`medium` хуки)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` на обнаруженном live-носителе (`medium` preseeds)

# СМ. ТАКЖЕ

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# ДОМАШНЯЯ СТРАНИЦА

Больше информации о **minios-live-config** доступно в [репозитории GitHub](https://github.com/minios-linux/minios-live-config). Общая информация MiniOS доступна на [minios.dev](https://minios.dev).

# ОШИБКИ

Об ошибках можно сообщить в [трекере задач minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# АВТОР

**live-config** был изначально написан Даниэлем Бауманном ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). С 2016 года разработка продолжена командой Debian Live. С 2025 года развитие модифицированной версии **minios-live-config** ведёт команда MiniOS Live.
