---
updated: 2026-10-06
program_commits:
    minios-live-config: cf3ae490e5df92581483ec6345a5f56bdaa812d8
---

# live-config

**live-config** – компоненты конфигурации системы

**live-config** содержит компоненты, которые настраивают live-систему во время загрузки (на позднем этапе userspace).

Политика кэширования и журналирования persistent-session определяется ранее с помощью `minios-boot`, после подготовки live root и его конфигурации, но до запуска обычных сервисов. Компонент `browser-cache` live-config применяет пользовательские точки монтирования после создания пользователя. Для этих политик требуется рабочая устойчивая `perch` сессия и актуальный initrd, объявляющий `perch-storage-v1`; см. раздел [Производительность](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) для подробностей о влиянии и ограничениях.

Загрузка по сети в initramfs (`ip=`, PXE, `from=http://…`) реализована отдельным слоем LiveKit и **не** управляется live-config. Подробнее см. [Загрузка по сети](/reference/boot-process/Network-Boot).

**live-config** можно настраивать с помощью параметров загрузки или файлов конфигурации, подготовленных initramfs. Фактическая командная строка ядра добавляется после значений, предоставленных файлами, поэтому более поздние параметры загрузки имеют приоритет.`LIVE_CONFIG_CMDLINE` Компоненты, записывающие состояние в `/var/lib/live/config` обычно запускаются только один раз; синхронизирующие и stateless-компоненты могут запускаться при каждом вызове.

Если *live-build*(7) используется для сборки live-системы, параметры live-config по умолчанию можно задать через опцию `--bootappend-live` , см. *lb_config*(1) в руководстве.

## Параметры загрузки (компоненты)

**live-config** активируется только если `boot=live` используется как параметр загрузки. По умолчанию запускаются все компоненты. Параметр `live-config.components` позволяет ограничить список запускаемых компонентов, а `live-config.nocomponents` может исключить отдельные компоненты. Если оба параметра указаны или любой из них задан несколько раз, приоритет имеет последнее вхождение.

- **live-config.components | components**: Запускаются все компоненты. Это поведение используется по умолчанию в live-образах.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются только указанные компоненты. Компоненты выполняются в порядке, определённом их именами файлов в `/usr/lib/live/config`, независимо от порядка в этом списке.
- **live-config.nocomponents | nocomponents**: Не запускается ни один компонент.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются все компоненты, кроме указанных.

## Параметры загрузки (опции)

Некоторые отдельные компоненты могут менять своё поведение в зависимости от параметров загрузки.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Загружает и применяет один или несколько файлов preseed для debconf. URL-адреса обрабатываются через `wget` и могут использовать HTTP, FTP или `file://`. Ключевое слово `filesystem` раскрывает файлы в `/usr/lib/live/config-preseed/`; `medium` раскрывает файлы в `minios/config-preseed/` на обнаруженном live-носителе. Явные локальные файлы можно указывать путями вроде `file:///run/initramfs/memory/data/minios/config-preseed/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, обрабатываются в указанном порядке; файлы, раскрытые по ключевому слову, сортируются по glob-порядку оболочки.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Позволяет задать имя хоста системы. По умолчанию `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Определяет политику для проводной сети. Неустановленный параметр и `dhcp` оставляют значение по умолчанию без изменений. `static` записывает конфигурацию для выбранного backend; `off` отключает автоматическую настройку IPv4 для выбранного интерфейса.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Выбирает проводной интерфейс. Если не указан для `static` или `off`, автоматически выбирается единственный проводной интерфейс, не являющийся loopback; если кандидатов ноль или несколько, требуется явное указание.
- **live-config.network-address=IPV4 | network-address=IPV4**: Задаёт статический IPv4-адрес.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Задаёт длину IPv4-префикса от 0 до 32. Значение по умолчанию для статической настройки — `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Задаёт необязательный IPv4-шлюз.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Указывает дополнительные адреса DNS-серверов через запятую.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Определяет backend для сети. `auto` предпочитает NetworkManager и переключается на ifupdown при необходимости. Принудительный `ifupdown` помечает интерфейс как неуправляемый NetworkManager, если установлены оба стека.
- **live-config.username=USERNAME | username=USERNAME**: Позволяет задать имя пользователя, который будет создан для автологина. По умолчанию `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Устанавливает дополнительные группы для пользователя, созданного для автологина. Названия групп могут быть разделены запятыми или пробелами. Значение по умолчанию MiniOS — `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Позволяет задать полное имя пользователя, созданного для автологина. Значение по умолчанию MiniOS — `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Позволяет установить пароль root в открытом виде.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Позволяет установить пароль root в зашифрованном виде.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Позволяет установить пароль пользователя в открытом виде.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Позволяет установить пароль пользователя в зашифрованном виде.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Позволяет задать локаль системы, например `de_CH.UTF-8`. По умолчанию `en_US.UTF-8`. Если выбранная локаль отсутствует в системе, она будет автоматически сгенерирована.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Позволяет задать часовой пояс системы, например `Europe/Zurich`. По умолчанию `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Позволяет изменить модель клавиатуры. Значение по умолчанию не задано.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Позволяет изменить раскладки клавиатуры. Если указано несколько, инструменты рабочего окружения позволят переключаться между ними в X11. Значение по умолчанию не задано.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Позволяет изменить варианты раскладки клавиатуры. Если указано несколько, их количество должно совпадать с количеством раскладок — пары будут сопоставлены по порядку. Допустимы пустые значения. В среде X11 можно переключаться между каждой парой раскладка/вариант. Значение по умолчанию не задано.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Позволяет изменить параметры клавиатуры. Значение по умолчанию не задано.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Позволяет отключить службы sysv через update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Позволяет указать, считает ли система, что аппаратные часы установлены в UTC. По умолчанию `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Позволяет задать x-session-manager через update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Позволяет указать драйвер xorg вместо автоопределения. Если PCI ID указан в `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` внутри live-системы, для этих устройств будет принудительно использоваться *DRIVER*. Если задан и параметр загрузки, и override, приоритет у параметра загрузки.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Позволяет задать разрешение xorg вместо автоопределения, например 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Позволяет указать драйвер WLAN вместо автоопределения. Если PCI ID указан в `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` внутри live-системы, для этих устройств будет принудительно использоваться *DRIVER*. Если задан и параметр загрузки, и override, приоритет у параметра загрузки.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Позволяет указать режим модуля для live-конфигурации. При значении `merged`, система обновляет учётные записи пользователей, пересобирает кэши и обновляет настройки пакетов, чтобы изменения конфигурации динамически интегрировались в работающую систему.
- **live-config.link-user-dirs | link-user-dirs**: Создаёт ссылки на управляемые пользовательские каталоги в настроенный путь на MiniOS носителе данных. Взаимоисключает bind-режим и недоступен при любом режиме `toram` или если активная persistent-сессия зашифрована с помощью LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Монтирует с помощью bind управляемые пользовательские каталоги из настроенного пути на MiniOS носителе данных. Взаимоисключает link-режим и имеет такие же ограничения по `toram` и шифрованию активной сессии.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Задаёт путь относительно носителя, используемый для `link-user-dirs` или `bind-user-dirs`. По умолчанию `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Загружает и выполняет произвольные файлы из временного файла в работающей live-системе. URL-адреса обрабатываются через `wget` и могут использовать HTTP, FTP или `file://`; необходимые интерпретаторы и зависимости должны быть уже установлены. Ключевое слово `filesystem` раскрывает файлы в `/usr/lib/live/config-hooks/`; `medium` раскрывает файлы в `minios/config-hooks/` на обнаруженном live-носителе (с резервным поиском по ISO-пути в компоненте hook). Явные локальные файлы можно указывать как `file:///run/initramfs/memory/data/minios/config-hooks/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, выполняются в указанном порядке; файлы, раскрытые по ключевому слову, сортируются по glob-порядку оболочки. Примеры установлены в `/usr/share/doc/live-config/examples/hooks/`.

> **Предупреждение по безопасности:** `live-config` выполняется с правами root. Hooks делаются исполняемыми и запускаются от root, а preseeds изменяют базу данных debconf с root-правами. Обычные HTTP и FTP не аутентифицируют скачиваемый контент и не обеспечивают целостность. Предпочитайте проверенные локальные файлы или доверенный аутентифицированный транспорт с независимой проверкой целостности; не используйте удалённые hooks или preseeds из недоверенных сетей.

### MiniOS параметры раннего хранения

Эти параметры читаются компонентом `minios-boot` до запуска обычных сервисов. Для их работы требуется исправная устойчивая `perch` сессия, но они сами её не активируют.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` размещает журнал systemd и обычные файлы `/var/log` в ограниченном RAM; диагностические сообщения загрузки сохраняются на устойчивом хранилище. По умолчанию: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` размещает загруженные архивы APT в ограниченном tmpfs, если позволяют условия RAM и swap. Базы данных пакетов и списки репозиториев остаются постоянными. По умолчанию: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` запрашивает кэш браузера в RAM. Компонент `browser-cache` монтирует выбранные каталоги кэша пользователя после создания учётной записи. По умолчанию: `persistent`.

## Параметры загрузки (ярлыки)

Для некоторых типичных сценариев, где обычно требуется комбинировать несколько отдельных параметров, **live-config** предоставляет ярлыки. Это позволяет как получить полный контроль над всеми опциями, так и упростить настройку.

- **live-config.noroot | noroot**: Отключает установку пароля root и предоставление привилегий через MiniOS sudo и PolicyKit.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Управляет настройкой sudo для live-пользователя. Значение по умолчанию и историческое поведение MiniOS при отсутствии параметра — `passwordless`. Режим `password` сохраняет доступ к sudo, но требует пароль live-пользователя. Режим `disabled` удаляет предоставление sudo через MiniOS и не добавляет live-пользователя в группу sudo при создании. Старый ярлык `noroot` переопределяет это и полностью отключает настройку root-привилегий.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Управляет правилами удобства PolicyKit MiniOS. Значение по умолчанию и историческое поведение MiniOS при отсутствии параметра — `passwordless`. Режимы `password` и `disabled` удаляют это правило, и применяется обычная аутентификация PolicyKit дистрибутива. `disabled` не является жёсткой политикой запрета; используйте `noroot` если live-пользователь не должен получать административные права.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Записывает политику OpenSSH `PermitRootLogin` при явном указании и установленном openssh-server.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Записывает политику OpenSSH `PasswordAuthentication` при явном указании и установленном openssh-server.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Управляет режимом XRDP при установленном xrdp. `relaxed` сохраняет исторические значения по умолчанию MiniOS. `hardened` ограничивает XRDP localhost, включает повышенные настройки безопасности и запрещает вход root через XRDP. `disabled` отключает и останавливает XRDP через `minios-svc` при наличии.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Управляет режимом X11 MiniOS для удобства. `relaxed` сохраняет совместимость с прежними версиями. `hardened` удаляет разрешительный параметр `-ac` X-сервера и усиливает `Xwrapper.config` при наличии.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Управляет тем, будет ли `/etc/issue` показывать стандартные подсказки пароля root/live MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Определяет, будет ли live-config ослаблять блокировку экрана. `relaxed` сохраняет удобство для live-сессии, как в прежних версиях. `hardened` не отключает блокировку в GNOME и включает блокировку xscreensaver, если файл присутствует.
- **live-config.noautologin | noautologin**: Запрещает live-config настраивать автологин в консоли и графической среде. Не удаляет автологин, уже настроенный в persistent-сессии.
- **live-config.nottyautologin | nottyautologin**: Запрещает live-config настраивать автологин в консоли, не затрагивая графическую среду. Существующая persistent-конфигурация не удаляется.
- **live-config.nox11autologin | nox11autologin**: Запрещает live-config настраивать автологин через display-manager, не затрагивая настройку TTY. Существующая persistent-конфигурация не удаляется.

## Параметры загрузки (специальные опции)

Для особых сценариев предусмотрены специальные параметры загрузки.

- **live-config.debug | debug**: Включает вывод отладки в live-config.

## Файлы конфигурации

**live-config** можно настроить (но не активировать) через конфигурационные файлы. Любой поддерживаемый параметр загрузки можно поместить в `LIVE_CONFIG_CMDLINE`, а большинство опций также можно задать через отдельные переменные. Параметр `boot=live` всё равно требуется для активации **live-config**.

**Примечание:** Если используются конфигурационные файлы, рекомендуется (предпочтительно) все параметры загрузки помещать в переменную **LIVE_CONFIG_CMDLINE**, либо задавать отдельные переменные. При использовании отдельных переменных пользователь должен самостоятельно убедиться, что заданы все необходимые переменные для корректной конфигурации.

`live-config` сам подключает `/etc/live/config.conf` и затем `/etc/live/config.conf.d/*.conf` в порядке glob-сортировки оболочки. Поздние фрагменты могут переопределять значения из основного файла или предыдущих фрагментов. Отдельный второй слой конфигурации media не подключается.

На MiniOS носителях исходные файлы — `minios/config.conf` и `minios/config.conf.d/*.conf`. До запуска `live-config` MiniOS initramfs синхронизирует их с `/etc/live/` рабочими файлами по времени изменения. Более новый исходный файл заменяет рабочий; более новый рабочий файл копируется обратно только если выбранный каталог данных MiniOS доступен для записи. Если метки времени совпадают — копирования нет, отсутствующие файлы заполняются, файлы не удаляются. Это синхронизация при загрузке, а не постоянный мониторинг. Подробнее см. [Файл конфигурации](/reference/configuration/config.conf) для полного описания синхронизации и приоритетов командной строки.

В качестве резервного варианта для initramfs, который не подготовил рабочий файл, обёртки запуска systemd и SysV копируют `minios/config.conf` с обнаруженного носителя только если `/etc/live/config.conf` отсутствует. Этот резерв не копирует фрагменты `config.conf.d`. Стандартный актуальный initramfs LiveKit MiniOS выполняет синхронизацию на более раннем этапе.

Имена файлов-фрагментов должны соответствовать `*.conf`. Рекомендуются имена вроде `vendor.conf` или `project.conf`. Выбирайте имена осознанно, так как поздние фрагменты переопределяют ранние.

Содержимое конфигурационных файлов состоит из одной или нескольких следующих переменных.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Эта переменная соответствует командной строке загрузчика.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Эта переменная соответствует параметру `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Эта переменная соответствует параметру `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Эта переменная соответствует параметру `**live-config.hostname**=*HOSTNAME*`. По умолчанию `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Определяет политику проводной сети. `dhcp` и отсутствие значения — no-op и не удаляют ранее созданный статический профиль MiniOS.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Выбирает проводной интерфейс для политики `static` или `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Задаёт статический IPv4-адрес.
- **LIVE_NETWORK_PREFIX=PREFIX**: Задаёт длину статического префикса; по умолчанию `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Указывает необязательный статический шлюз.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Указывает дополнительные DNS-серверы через запятую.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Определяет используемый backend.

Компонент сети сохраняет `/var/lib/live/config/network` после успешной записи политики. Чтобы применить изменённую политику на persistent-системе, удалите этот штамп. Для удаления предыдущего статического профиля используйте `network-method=off` или вручную удалите профиль и штамп, созданные MiniOS.

- **LIVE_USERNAME=USERNAME**: Эта переменная соответствует параметру `**live-config.username**=*USERNAME*`. По умолчанию `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Эта переменная соответствует параметру `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Эта переменная соответствует параметру `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Эта переменная соответствует параметру `**live-config.root-password**=*PASSWORD*`. Указывает пароль root в открытом виде.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Эта переменная соответствует параметру `**live-config.root-password-crypted**=*PASSWORD*`. Указывает пароль root в зашифрованном виде.
- **LIVE_USER_PASSWORD=PASSWORD**: Эта переменная соответствует параметру `**live-config.user-password**=*PASSWORD*`. Указывает пароль пользователя в открытом виде.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Эта переменная соответствует параметру `**live-config.user-password-crypted**=*PASSWORD*`. Указывает пароль пользователя в зашифрованном виде.
- **LIVE_CONFIG_NOROOT=true|false**: Эта переменная соответствует параметру `**live-config.noroot**` и отключает настройку root, sudo и PolicyKit при значении `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Эта переменная соответствует параметру `**live-config.sudo-mode**=...`. Если не задано, MiniOS сохраняет историческое поведение sudo без пароля.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Эта переменная соответствует параметру `**live-config.polkit-mode**=...`. Режимы `password` и `disabled` удаляют правило MiniOS без пароля и возвращают обычную аутентификацию PolicyKit дистрибутива.
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
- **LIVE_LINK_USER_DIRS=true|false**: Включает или отключает создание ссылок из стандартных пользовательских каталогов данных на записываемый диск MiniOS. Соответствующий параметр загрузки — просто флаг `live-config.link-user-dirs`. Режим link не совместим с bind-режимом и любым режимом `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Включает или отключает bind-монтирование стандартных пользовательских каталогов данных с записываемого диска MiniOS. Соответствующий параметр загрузки — просто флаг `live-config.bind-user-dirs`. Режим bind не совместим с link-режимом и любым режимом `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Эта переменная соответствует параметру `**live-config.user-dirs-path**=*PATH*`. Указывает безопасный путь внутри диска с файловой системой FAT32, exFAT или NTFS MiniOS. По умолчанию `/minios/userdata`; сегменты . и .. запрещены.

При настройке пользовательских носителей никогда не происходит автоматического слияния двух непустых каталогов. Локальный непустой каталог переносится только если его место на носителе пусто. При отключении функции данные с носителя копируются обратно перед удалением ссылок. Активация пользовательских носителей и копирование обратно блокируются, если активная persistent-сессия зашифрована с помощью LUKS, чтобы избежать перемещения данных сессии на незашифрованный носитель MiniOS. Решение принимается по фактическому состоянию шифрования: `perchencrypt=luks` только запрашивает шифрование при создании новой сессии и не описывает уже существующую. При ошибке проверки или копирования исходные пользовательские каталоги остаются на месте, а причина записывается в `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Эта переменная хранит состояние, заданное параметром `live-config.module-mode` (или `module-mode`). При значении `merged`, live-система применяет обновления (через minios-update-users, minios-update-cache и minios-update-dpkg), чтобы объединить пользовательские настройки с базовой средой.
- **LIVE_CONFIG_DEBUG=true|false**: Эта переменная соответствует параметру `**live-config.debug**`.

## MiniOS переменные кэша и логов

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, и **LIVE_BROWSER_CACHE=persistent|volatile**: Независимые политики MiniOS на этапе загрузки. Они также работают в `config.conf.d` и `LIVE_CONFIG_CMDLINE`. Сами по себе не включают постоянство. Подробнее см. [Файл конфигурации](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Компонент `browser-cache` читает политику для устойчивого `minios-boot` после создания live-пользователя и монтирует стандартные каталоги кэша браузера в общий ограниченный файловый RAM. Для Firefox отдельная политика отключает кэш на диске без перемещения профилей браузера. Если этот компонент исключён через `components=` или `nocomponents=`, только ранний запрос browser-cache не создаёт пользовательские точки монтирования.

В режиме merged ошибки сохраняются обычным образом, но подробные трассировки команд и отладочные копии создаются только при `LIVE_CONFIG_DEBUG=true`.

# КАСТОМИЗАЦИЯ

**live-config** легко адаптируется для downstream-проектов или локального использования.

## Добавление новых компонентов конфигурации

Downstream-проекты могут размещать свои компоненты в /usr/lib/live/config — ничего дополнительно делать не требуется, компоненты будут запускаться автоматически при загрузке.

Лучше всего размещать компоненты в отдельном debian-пакете. Пример пакета с примером компонента находится в /usr/share/doc/live-config/examples.

## Удаление существующих компонентов конфигурации

На данный момент невозможно корректно удалить компоненты без необходимости либо распространять локально модифицированный пакет **live-config** или использовать dpkg-divert. Однако того же эффекта можно добиться, отключив соответствующие компоненты через механизм live-config.nocomponents (см. выше). Чтобы не указывать отключённые компоненты каждый раз в параметре загрузки, рекомендуется использовать конфигурационный файл (см. выше).

Файлы конфигурации для самой live-системы лучше всего размещать в отдельном debian-пакете. Пример пакета с примером конфигурации находится в /usr/share/doc/live-config/examples.

# КОМПОНЕНТЫ

**live-config** на данный момент включает следующие компоненты в /usr/lib/live/config.

- **nss-systemd**: удаляет или восстанавливает модуль NSS systemd в /etc/nsswitch.conf для обхода известной проблемы systemd.
- **debconf**: позволяет применять произвольные preseed-файлы, размещённые на live-носителе или http/ftp-сервере.
- **hostname**: настраивает /etc/hostname и /etc/hosts.
- **issue-setup**: настраивает файл /etc/issue с приветственным баннером и информацией о дистрибутиве.
- **live-debconfig_passwd**: настраивает пароли пользователя и root через live-debconfig.
- **user-setup**: добавляет учётную запись live-пользователя.
- **user-groups**: добавляет live-пользователя в дополнительные группы, объявленные установленными модулями. Существующие группы из списка `/usr/share/live/config/user-default-groups.d/*.groups` применяются после создания пользователя и при последующих запусках live-config.
- **root-setup**: устанавливает или обновляет пароль root и настраивает окружение пользователя root.
- **sudo**: предоставляет права sudo live-пользователю.
- **user-ssh-keys**: синхронизирует пользовательские файлы `authorized_keys.<username>` между live-носителем и домашними каталогами пользователей. Поддерживает одновременную работу с несколькими пользователями (например, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) и распознаёт формы загрузки без расширения: `toram`, `toram=trim`, и `toram=full` как варианты RAM при определении возможности безопасного обновления live-носителя.
- **user-media**: создаёт ссылки или bind-монтирует проверенные пользовательские каталоги на существующем записываемом носителе данных MiniOS, с безопасной миграцией и возвратом данных при отключении.
- **locales**: настраивает локали.
- **tzdata**: настраивает /etc/timezone.
- **xorg-service**: настраивает имя пользователя в xorg.service и применяет режим X11, если поддерживается.
- **gdm3**: настраивает автологин в gdm3.
- **sddm**: настраивает автологин в sddm.
- **kdm**: настраивает автологин в kdm.
- **lightdm**: настраивает автологин в lightdm.
- **lxdm**: настраивает автологин в lxdm.
- **nodm**: настраивает автологин в nodm.
- **slim**: настраивает автологин в slim.
- **xinit**: настраивает автологин через xinit.
- **keyboard-configuration**: настраивает клавиатуру.
- **sysvinit**: настраивает автологин в консоли через `/etc/inittab` при установленном sysvinit. Ярлыки `noautologin` и `nottyautologin` отключают эту настройку.
- **sysv-rc**: настраивает sysv-rc, отключая указанные службы.
- **apport**: отключает apport.
- **gnome-panel-data**: отключает кнопку блокировки экрана.
- **gnome-power-manager**: отключает гибернацию.
- **gnome-screensaver**: управляет блокировкой экрана GNOME в соответствии с `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: отключает мастер миграции KDE (начиная с squeeze).
- **kde-services**: отключает некоторые нежелательные службы KDE (начиная с squeeze).
- **policykit**: предоставляет права пользователя через PolicyKit.
- **ssl-cert**: пересоздаёт тестовые SSL-сертификаты.
- **xrdp**: настраивает режим XRDP (relaxed, hardened или disabled) при установленном XRDP.
- **anacron**: отключает anacron.
- **util-linux**: отключает службу hwclock из util-linux.
- **login**: отключает lastlog.
- **xserver-xorg**: настраивает xserver-xorg.
- **network**: настраивает устойчивую политику проводной IPv4 через защищённый keyfile NetworkManager или секцию ifupdown. Запускается до сетевых сервисов, валидирует все значения и сохраняет штамп только после успешной записи.
- **openssh-server**: пересоздаёт ключи OpenSSH и записывает явно запрошенную политику root-login или password-authentication.
- **xfce4-panel**: настраивает xfce4-panel по умолчанию.
- **xscreensaver**: управляет блокировкой xscreensaver в соответствии с `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: настраивает драйверы broadcom-sta для WLAN.
- **hyperv**: настраивает параметры X11 для повышения совместимости с платформами Microsoft Hyper-V.
- **ntfs3**: управляет правилами udev для поддержки NTFS3.
- **config-module-mode**: настраивает режим модулей системы и обновляет кэши, пользовательские настройки и dpkg.
- **hooks**: позволяет запускать произвольные команды из файла на live-носителе или http/ftp-сервере.

# ФАЙЛЫ

- `minios/config.conf` на выбранном носителе данных MiniOS (исходная копия)
- `minios/config.conf.d/*.conf` на выбранном носителе данных MiniOS (фрагменты исходника)
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
- `minios/log/YYYYMMDD_HHMMSS/` на выбранных записываемых носителях данных при включённой выгрузке логов
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` на обнаруженном live-носителе (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` на обнаруженном live-носителе (`medium` preseeds)

# СМ. ТАКЖЕ

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# ДОМАШНЯЯ СТРАНИЦА

Больше информации о **minios-live-config** можно найти в [GitHub-репозитории](https://github.com/minios-linux/minios-live-config). Общая информация MiniOS доступна на [minios.dev](https://minios.dev).

# ОШИБКИ

Об ошибках можно сообщить в [трекере ошибок minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# АВТОР

**live-config** изначально был написан Даниэлем Бауманом ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). С 2016 года разработку продолжает команда Debian Live. С 2025 года разработка модифицированной версии **minios-live-config** ведётся командой MiniOS Live.
