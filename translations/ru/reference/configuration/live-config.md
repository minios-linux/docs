---
updated: 2026-08-31
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

Некоторые отдельные компоненты могут менять своё поведение в зависимости от параметров загрузки.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Загружает и применяет один или несколько файлов preseed для debconf. URL-адреса обрабатываются через `wget` и могут использовать HTTP, FTP или `file://`. Ключевое слово `filesystem` раскрывает файлы в `/usr/lib/live/config-preseed/`; `medium` раскрывает файлы в `minios/config-preseed/` на обнаруженном live-носителе. Для явных локальных файлов можно использовать пути вида `file:///run/initramfs/memory/data/minios/config-preseed/FILE` или `file:///PATH` в корне live-системы. Элементы, разделённые вертикальной чертой, обрабатываются в указанном порядке; файлы, раскрываемые по ключевому слову, используют порядок glob оболочки.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Позволяет задать имя хоста системы. По умолчанию — `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Определяет политику проводной сети. Неустановленное значение и `dhcp` не изменяют настройку по умолчанию. `static` записывает конфигурацию для выбранного backend; `off` отключает автоматическую настройку IPv4 для выбранного интерфейса.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Выбирает проводной интерфейс. Если не указан для `static` или `off`, автоматически выбирается единственный проводной не-loopback интерфейс; если кандидатов ноль или несколько, требуется явное указание.
- **live-config.network-address=IPV4 | network-address=IPV4**: Задает статический IPv4-адрес.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Устанавливает длину префикса IPv4 от 0 до 32. По умолчанию — `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Устанавливает необязательный шлюз IPv4.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Устанавливает необязательные адреса DNS-серверов через запятую.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Выбирает сетевой backend. `auto` предпочитает NetworkManager и использует ifupdown при необходимости. Принудительный `ifupdown` помечает интерфейс как неуправляемый NetworkManager при наличии обеих систем.
- **live-config.username=USERNAME | username=USERNAME**: Позволяет задать имя пользователя, создаваемого для автологина. По умолчанию — `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Задает дополнительные группы для пользователя, созданного для автологина. Названия групп можно разделять запятыми или пробелами. Значение по умолчанию MiniOS — `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Позволяет задать полное имя пользователя, созданного для автологина. По умолчанию MiniOS — `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Позволяет установить пароль root в открытом виде.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Позволяет установить пароль root в зашифрованном виде.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Позволяет установить пароль пользователя в открытом виде.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Позволяет установить пароль пользователя в зашифрованном виде.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Позволяет задать локаль системы, например `de_CH.UTF-8`. По умолчанию — `en_US.UTF-8`. Если выбранная локаль отсутствует в системе, она будет автоматически сгенерирована.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Позволяет задать временную зону системы, например `Europe/Zurich`. По умолчанию — `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Позволяет изменить модель клавиатуры. Значение по умолчанию не задано.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Позволяет изменить раскладки клавиатуры. Если указано несколько, инструменты рабочего окружения позволят переключаться между ними в X11. Значение по умолчанию не задано.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Позволяет изменить варианты раскладки клавиатуры. Если указано несколько, количество значений должно совпадать с количеством раскладок — они сопоставляются по порядку. Допустимы пустые значения. Инструменты рабочего окружения позволят переключаться между каждой парой раскладка/вариант в X11. Значение по умолчанию не задано.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Позволяет изменить параметры клавиатуры. Значение по умолчанию не задано.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Позволяет отключать службы sysv через update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Позволяет указать, считать ли аппаратные часы установленными по UTC. По умолчанию — `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Позволяет задать x-session-manager через update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Позволяет задать драйвер xorg вместо автодетекта. Если PCI ID указан в `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` в live-системе, для этих устройств принудительно используется *DRIVER*. Если одновременно указан параметр загрузки и override, приоритет имеет параметр загрузки.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Позволяет задать разрешение xorg вместо автодетекта, например 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Позволяет задать драйвер WLAN вместо автодетекта. Если PCI ID указан в `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` в live-системе, для этих устройств принудительно используется *DRIVER*. Если одновременно указан параметр загрузки и override, приоритет имеет параметр загрузки.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Позволяет указать режим модуля для live-конфигурации. При значении `merged`, система обновляет учетные записи пользователей, пересобирает кэши и обновляет настройки пакетов, чтобы изменения конфигурации динамически применялись в работающей системе.
- **live-config.link-user-dirs | link-user-dirs**: Создает ссылки на управляемые пользовательские каталоги по настроенному пути на MiniOS-носителе данных.
- **live-config.bind-user-dirs | bind-user-dirs**: Монтирует (bind) управляемые пользовательские каталоги с настроенного пути на MiniOS-носителе данных. Эта опция несовместима с `link-user-dirs`.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Задает путь относительно носителя, используемый для `link-user-dirs` или `bind-user-dirs`. По умолчанию — `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Загружает и выполняет произвольные файлы из временного файла в работающей live-системе. URL-адреса обрабатываются через `wget` и могут использовать HTTP, FTP или `file://`; необходимые интерпретаторы и зависимости должны быть установлены заранее. Ключевое слово `filesystem` раскрывает файлы в `/usr/lib/live/config-hooks/`; `medium` раскрывает файлы в `minios/config-hooks/` на обнаруженном live-носителе (с резервным поиском по ISO-пути в компоненте hook). Для явных локальных файлов можно использовать `file:///run/initramfs/memory/data/minios/config-hooks/FILE` или `file:///PATH` в корне live-системы. Элементы, разделённые вертикальной чертой, выполняются в указанном порядке; файлы, раскрываемые по ключевому слову, используют порядок glob оболочки. Примеры установлены в `/usr/share/doc/live-config/examples/hooks/`.

> **Предупреждение по безопасности:** `live-config` работает от имени root. Хуки становятся исполняемыми и запускаются с правами root, а preseeds изменяют базу данных debconf с привилегиями root. Обычные HTTP и FTP не аутентифицируют загружаемый контент и не обеспечивают его целостность. Рекомендуется использовать проверенные локальные файлы или доверенный аутентифицированный транспорт с независимой проверкой целостности; не используйте удалённые хуки или preseeds из ненадёжных сетей.

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

**live-config** можно настроить (но не активировать) через конфигурационные файлы. Любой поддерживаемый параметр загрузки можно указать в `LIVE_CONFIG_CMDLINE`, а большинство опций также можно задать через отдельные переменные. Параметр `boot=live` по-прежнему необходим для активации **live-config**.

**Примечание:** Если используются конфигурационные файлы, рекомендуется (предпочтительно) все параметры загрузки указывать в переменной **LIVE_CONFIG_CMDLINE** либо задавать отдельные переменные. При использовании отдельных переменных пользователь должен самостоятельно убедиться, что все необходимые переменные заданы для корректной конфигурации.

`live-config` сам по себе подключает `/etc/live/config.conf` и затем `/etc/live/config.conf.d/*.conf` в порядке glob оболочки. Поздние фрагменты могут переопределять значения из основного файла или предыдущих фрагментов. Отдельный второй слой конфигурации с другого носителя не подключается.

На MiniOS-носителях исходными файлами являются `minios/config.conf` и `minios/config.conf.d/*.conf`. До запуска `live-config` MiniOS initramfs синхронизирует их с `/etc/live/` рабочими файлами по времени изменения. Более новый исходный файл заменяет рабочий; более новый рабочий файл копируется обратно только если выбранный каталог данных MiniOS доступен для записи. При равных временных метках копирование не выполняется, отсутствующие файлы добавляются, удаление не производится. Это синхронизация на этапе загрузки, а не постоянный мониторинг. См. [Файл конфигурации](/reference/configuration/config.conf) для полного описания правил синхронизации и приоритета командной строки.

В качестве резервного варианта для initramfs, которые не подготовили рабочий файл, обёртки запуска systemd и SysV копируют `minios/config.conf` с обнаруженного носителя только если `/etc/live/config.conf` отсутствует. Этот резерв не копирует фрагменты `config.conf.d`. Стандартный современный initramfs LiveKit MiniOS выполняет синхронизацию на более раннем этапе.

Имена файлов-фрагментов должны соответствовать `*.conf`. Рекомендуются имена вроде `vendor.conf` или `project.conf`. Выбирайте имена осознанно, так как поздние фрагменты переопределяют ранние.

Содержимое конфигурационных файлов состоит из одной или нескольких следующих переменных.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Эта переменная соответствует командной строке загрузчика.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Эта переменная соответствует параметру `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Эта переменная соответствует параметру `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Эта переменная соответствует параметру `**live-config.hostname**=*HOSTNAME*` . По умолчанию — `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Определяет политику проводной сети. `dhcp` и отсутствие значения не влияют на уже созданный статический профиль MiniOS.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Выбирает проводной интерфейс для политики `static` или `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Задает статический IPv4-адрес.
- **LIVE_NETWORK_PREFIX=PREFIX**: Задает длину статического префикса; по умолчанию — `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Задает необязательный статический шлюз.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Задает необязательные DNS-серверы через запятую.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Определяет используемый backend.

Компонент network записывает `/var/lib/live/config/network` после успешной записи политики. Для применения новых настроек на постоянной системе удалите этот stamp. Чтобы удалить старый статический профиль, используйте `network-method=off` или вручную удалите профиль и stamp, управляемый MiniOS.

- **LIVE_USERNAME=USERNAME**: Эта переменная соответствует параметру `**live-config.username**=*USERNAME*` . По умолчанию — `live`.
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
- **LIVE_LINK_USER_DIRS=true|false**: Включает или отключает создание ссылок из стандартных пользовательских каталогов данных на доступный для записи диск MiniOS. Соответствующий параметр загрузки — просто `live-config.link-user-dirs` флаг. Режим ссылок несовместим с режимом bind и любым `toram` режимом.
- **LIVE_BIND_USER_DIRS=true|false**: Включает или отключает bind-монтирование стандартных пользовательских каталогов данных с доступного для записи диска MiniOS. Соответствующий параметр загрузки — просто `live-config.bind-user-dirs` флаг. Режим bind несовместим с режимом ссылок и любым `toram` режимом.
- **LIVE_USER_DIRS_PATH=PATH**: Эта переменная соответствует параметру `**live-config.user-dirs-path**=*PATH*`. Указывает безопасный путь внутри диска MiniOS с файловой системой FAT32, exFAT или NTFS. По умолчанию — `/minios/userdata`; сегменты с точками и переходом к родительскому каталогу отклоняются.

Настройка user-media никогда не объединяет две непустые директории автоматически. Локальная непустая директория переносится только если место назначения на носителе пусто. При отключении функции данные с носителя копируются обратно перед удалением ссылок. В случае ошибки проверки или копирования исходные пользовательские каталоги сохраняются, а причина записывается в `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Эта переменная хранит состояние, заданное параметром `live-config.module-mode` (или `module-mode`). При значении `merged`, live-система применяет обновления (через minios-update-users, minios-update-cache и minios-update-dpkg), чтобы объединить пользовательские настройки с базовой средой.
- **LIVE_CONFIG_DEBUG=true|false**: Эта переменная соответствует параметру `**live-config.debug**`.

# КАСТОМИЗАЦИЯ

**live-config** легко настраивается для собственных проектов или локального использования.

## Добавление новых компонентов конфигурации

Проекты downstream могут размещать свои компоненты в /usr/lib/live/config — они будут автоматически запускаться при загрузке, дополнительных действий не требуется.

Лучше всего размещать компоненты в отдельном debian-пакете. Пример такого пакета с примером компонента находится в /usr/share/doc/live-config/examples.

## Удаление существующих компонентов конфигурации

В настоящее время нет простого способа удалить компоненты без необходимости либо поставлять локально изменённый пакет **live-config** либо использовать dpkg-divert. Однако того же эффекта можно достичь, отключив соответствующие компоненты через механизм live-config.nocomponents (см. выше). Чтобы не указывать отключаемые компоненты каждый раз в параметре загрузки, рекомендуется использовать конфигурационный файл (см. выше).

Файлы конфигурации для самой live-системы лучше всего размещать в отдельном debian-пакете. Пример такого пакета с примером конфигурации находится в /usr/share/doc/live-config/examples.

# КОМПОНЕНТЫ

**live-config** в настоящее время включает следующие компоненты в /usr/lib/live/config.

- **nss-systemd**: удаляет или восстанавливает модуль NSS systemd в /etc/nsswitch.conf для обхода известной проблемы systemd.
- **debconf**: позволяет применять любые preseed-файлы, размещённые на live-носителе или http/ftp-сервере.
- **hostname**: настраивает /etc/hostname и /etc/hosts.
- **issue-setup**: создает файл /etc/issue с приветственным баннером и информацией о дистрибутиве.
- **live-debconfig_passwd**: настраивает пароли пользователя и root через live-debconfig.
- **user-setup**: добавляет учетную запись live-пользователя.
- **user-groups**: добавляет live-пользователя в дополнительные группы, объявленные установленными модулями. Существующие группы из `/usr/share/live/config/user-default-groups.d/*.groups` применяются после создания пользователя и при последующих запусках live-config.
- **root-setup**: задает или обновляет пароль root и настраивает окружение пользователя root.
- **sudo**: предоставляет live-пользователю права sudo.
- **user-ssh-keys**: синхронизирует пользовательские файлы `authorized_keys.<username>` между live-носителем и домашними каталогами пользователей. Поддерживает одновременную работу с несколькими пользователями (например, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: создает ссылки или bind-монтирует проверенные пользовательские каталоги на существующем доступном для записи MiniOS-носителе данных с безопасной миграцией и возвратом данных при отключении.
- **locales**: настраивает локали.
- **tzdata**: настраивает /etc/timezone.
- **xorg-service**: настраивает имя пользователя в xorg.service и применяет политику X11 при поддержке.
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
- **network**: настраивает устойчивую проводную политику IPv4 через защищённый keyfile NetworkManager или секцию ifupdown. Запускается до сетевых служб, валидирует все значения и делает отметку только после успешной записи.
- **openssh-server**: пересоздаёт ключи OpenSSH и записывает явно заданную политику root-login или password-authentication.
- **xfce4-panel**: возвращает xfce4-panel к настройкам по умолчанию.
- **xscreensaver**: управляет блокировкой xscreensaver в соответствии с `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: настраивает драйверы WLAN broadcom-sta.
- **hyperv**: настраивает параметры X11 для повышения совместимости с платформами Microsoft Hyper-V.
- **ntfs3**: управляет правилами udev для поддержки NTFS3.
- **config-module-mode**: настраивает режим работы модулей системы и обновляет кэши, пользовательские настройки и dpkg.
- **hooks**: позволяет запускать произвольные команды из файла на live-носителе или http/ftp-сервере.

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
