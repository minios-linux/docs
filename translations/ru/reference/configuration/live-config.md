---
updated: 2026-08-31
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** — компоненты конфигурации системы

**live-config** содержит компоненты, которые настраивают live-систему во время процесса загрузки (на позднем этапе userspace).

Сетевая загрузка в initramfs (`ip=`, PXE, `from=http://…`) является отдельным уровнем LiveKit и **не** управляется live-config. См. [Сетевая загрузка](/reference/boot-process/Network-Boot).

**live-config** можно настраивать через параметры загрузки или файлы конфигурации, подготовленные initramfs во время выполнения. Фактическая командная строка ядра добавляется после значений `LIVE_CONFIG_CMDLINE` из файлов, поэтому более поздние совпадающие параметры загрузки имеют приоритет. Компоненты, которые записывают состояние в `/var/lib/live/config`, обычно выполняются только один раз; синхронизирующие и статeless-компоненты могут запускаться при каждом вызове.

Если для сборки live-системы используется *live-build*(7), параметры live-config, применяемые по умолчанию, можно задать через опцию `--bootappend-live`, см. руководство *lb_config*(1).

## Параметры загрузки (компоненты)

**live-config** активируется только если в качестве параметра загрузки используется `boot=live`. По умолчанию запускаются все компоненты. Параметр `live-config.components` позволяет ограничить список запускаемых компонентов, а `live-config.nocomponents` — исключить определённые компоненты. Если оба параметра используются или любой из них указан несколько раз, приоритет имеет последнее вхождение.

- **live-config.components | components**: Запускаются все компоненты. Это поведение используется по умолчанию в live-образах.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются только указанные компоненты. Компоненты выполняются в порядке, определённом их именами файлов в `/usr/lib/live/config`, независимо от порядка в списке.
- **live-config.nocomponents | nocomponents**: Не запускается ни один компонент.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Запускаются все компоненты, кроме указанных.

## Параметры загрузки (опции)

Некоторые отдельные компоненты могут менять своё поведение в зависимости от параметров загрузки.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Загружает и применяет один или несколько файлов preseed для debconf. URL-адреса обрабатываются через `wget` и могут использовать HTTP, FTP или `file://`. Ключевое слово `filesystem` разворачивает файлы в `/usr/lib/live/config-preseed/`; `medium` разворачивает файлы в `minios/config-preseed/` на обнаруженном live-носителе. Для явных локальных файлов можно использовать пути, такие как `file:///run/initramfs/memory/data/minios/config-preseed/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, обрабатываются в указанном порядке; файлы, развёрнутые по ключевому слову, используют порядок glob-выражения shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Позволяет задать имя хоста системы. По умолчанию — `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Выбор политики проводной сети. Если не задано или указано `dhcp`, используется значение по умолчанию для образа. `static` записывает конфигурацию для выбранного backend; `off` отключает автоматическую настройку IPv4 для выбранного интерфейса.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Выбор проводного интерфейса. Если не указан для `static` или `off`, автоматически выбирается единственный проводной не-loopback интерфейс; если кандидатов ноль или несколько, требуется явное указание.
- **live-config.network-address=IPV4 | network-address=IPV4**: Устанавливает статический IPv4-адрес.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Устанавливает длину префикса IPv4 от 0 до 32. Значение по умолчанию — `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Устанавливает необязательный шлюз IPv4.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Устанавливает необязательные адреса DNS-серверов через запятую.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Выбор backend для сети. `auto` предпочитает NetworkManager и при необходимости переключается на ifupdown. Принудительный `ifupdown` помечает интерфейс как неуправляемый для NetworkManager, если установлены оба стека.
- **live-config.username=USERNAME | username=USERNAME**: Позволяет задать имя пользователя, создаваемого для автологина. По умолчанию — `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Устанавливает дополнительные группы для пользователя, создаваемого для автологина. Названия групп могут разделяться запятыми или пробелами. Значение по умолчанию для MiniOS — `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Позволяет задать полное имя пользователя, создаваемого для автологина. Значение по умолчанию для MiniOS — `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Позволяет задать пароль root в открытом виде.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Позволяет задать пароль root в зашифрованном виде.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Позволяет задать пароль пользователя в открытом виде.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Позволяет задать пароль пользователя в зашифрованном виде.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Позволяет задать локаль системы, например `de_CH.UTF-8`. По умолчанию — `en_US.UTF-8`. Если выбранная локаль ещё не доступна в системе, она будет автоматически сгенерирована на лету.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Позволяет задать часовой пояс системы, например `Europe/Zurich`. По умолчанию — `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Позволяет изменить модель клавиатуры. Значение по умолчанию не задано.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Позволяет изменить раскладки клавиатуры. Если указано несколько, инструменты окружения рабочего стола позволят переключать их в X11. Значение по умолчанию не задано.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Позволяет изменить варианты раскладки клавиатуры. Если указано несколько, их количество должно совпадать с количеством раскладок — они будут сопоставлены по порядку. Допустимы пустые значения. Инструменты окружения рабочего стола позволят переключаться между каждой парой раскладка-вариант в X11. Значение по умолчанию не задано.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Позволяет изменить параметры клавиатуры. Значение по умолчанию не задано.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Позволяет отключить службы sysv через update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Позволяет указать, считает ли система, что аппаратные часы установлены по UTC. По умолчанию — `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Позволяет задать x-session-manager через update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Позволяет явно указать драйвер xorg вместо его автодетекта. Если PCI ID указан в `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` внутри live-системы, *DRIVER* будет принудительно применён для этих устройств. Если найден и параметр загрузки, и переопределение, приоритет имеет параметр загрузки.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Позволяет явно указать разрешение xorg вместо автодетекта, например 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Позволяет явно указать драйвер WLAN вместо автодетекта. Если PCI ID указан в `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` внутри live-системы, *DRIVER* будет принудительно применён для этих устройств. Если найден и параметр загрузки, и переопределение, приоритет имеет параметр загрузки.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Позволяет указать режим модуля для live-конфигурации. При значении `merged` система обновит учётные записи пользователей, пересоберёт кэши и обновит параметры пакетов, чтобы изменения конфигурации были динамически интегрированы в работающую систему.
- **live-config.link-user-dirs | link-user-dirs**: Создаёт ссылки на управляемые пользовательские каталоги по настроенному пути на носителе данных MiniOS.
- **live-config.bind-user-dirs | bind-user-dirs**: Монтирует управляемые пользовательские каталоги с помощью bind из настроенного пути на носителе данных MiniOS. Эта опция несовместима с `link-user-dirs`.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Задаёт путь относительно носителя, используемый `link-user-dirs` или `bind-user-dirs`. По умолчанию — `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Загружает и выполняет произвольные файлы из временного файла в работающей live-системе. URL-адреса обрабатываются через `wget` и могут использовать HTTP, FTP или `file://`; необходимые интерпретаторы и зависимости должны быть уже установлены. Ключевое слово `filesystem` разворачивает файлы в `/usr/lib/live/config-hooks/`; `medium` разворачивает файлы в `minios/config-hooks/` на обнаруженном live-носителе (с резервным поиском по ISO-пути в компоненте hook). Для явных локальных файлов можно использовать `file:///run/initramfs/memory/data/minios/config-hooks/FILE` или `file:///PATH` в корне live-системы. Записи, разделённые вертикальной чертой, выполняются в указанном порядке; файлы, развёрнутые по ключевому слову, используют порядок glob-выражения shell. Примеры установлены в `/usr/share/doc/live-config/examples/hooks/`.

> **Предупреждение по безопасности:** `live-config` выполняется от имени root. Хуки делаются исполняемыми и запускаются с правами root, а preseeds изменяют базу данных debconf системы с правами root. Обычные HTTP и FTP не аутентифицируют загружаемый контент и не обеспечивают его целостность. Предпочитайте проверенные локальные файлы или доверенный аутентифицированный транспорт с независимой проверкой целостности; не используйте удалённые хуки или preseeds из ненадёжных сетей.

## Параметры загрузки (сокращения)

Для некоторых типовых сценариев, где потребовалось бы комбинировать несколько отдельных параметров, **live-config** предоставляет сокращённые варианты. Это позволяет как получить полный контроль над всеми опциями, так и упростить настройку.

- **live-config.noroot | noroot**: Отключает установку пароля root и предоставление привилегий sudo и PolicyKit в MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Управляет настройкой sudo для live-пользователя. По умолчанию, а также при отсутствии значения, используется историческое поведение MiniOS — `passwordless`. Режим `password` сохраняет доступ к sudo, но требует пароль пользователя. Режим `disabled` убирает предоставление sudo в MiniOS и исключает live-пользователя из группы sudo при создании. Старый ярлык `noroot` имеет приоритет и шире отключает настройку root-привилегий.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Управляет удобными правилами PolicyKit в MiniOS. По умолчанию, а также при отсутствии значения, используется историческое поведение MiniOS — `passwordless`. Режимы `password` и `disabled` удаляют это правило, и применяется обычная аутентификация PolicyKit дистрибутива. `disabled` не является жёсткой политикой полного запрета; используйте `noroot`, если live-пользователь не должен получать административные права.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Явно задаёт политику `PermitRootLogin` для OpenSSH при установленном openssh-server.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Явно задаёт политику `PasswordAuthentication` для OpenSSH при установленном openssh-server.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Управляет режимом XRDP при установленном xrdp. `relaxed` сохраняет исторические значения MiniOS. `hardened` привязывает XRDP к localhost, включает согласованные/усиленные настройки безопасности и запрещает вход root через XRDP. `disabled` отключает и останавливает XRDP через `minios-svc`, если доступно.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Управляет режимом X11 в MiniOS. `relaxed` сохраняет совместимость с историческими настройками. `hardened` убирает разрешительную опцию X-сервера `-ac` и ужесточает `Xwrapper.config`, если присутствует.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Управляет отображением подсказок пароля root/live по умолчанию в MiniOS в `/etc/issue`.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Управляет ослаблением блокировки экрана live-сессии. `relaxed` сохраняет прежнее удобство live-сессии. `hardened` не отключает блокировку GNOME и включает блокировку xscreensaver, если файл присутствует.
- **live-config.noautologin | noautologin**: Запрещает live-config настраивать автологин в консоли и графической среде. Уже настроенный автологин в постоянной сессии не удаляется.
- **live-config.nottyautologin | nottyautologin**: Запрещает live-config настраивать автологин в консоли, не влияя на графическую настройку. Существующая постоянная конфигурация не удаляется.
- **live-config.nox11autologin | nox11autologin**: Запрещает live-config настраивать автологин через display-manager, не влияя на настройку TTY. Существующая постоянная конфигурация не удаляется.

## Параметры загрузки (специальные опции)

Для особых случаев предусмотрены специальные параметры загрузки.

- **live-config.debug | debug**: Включает вывод отладочной информации в live-config.

## Файлы конфигурации

**live-config** можно настраивать (но не активировать) с помощью конфигурационных файлов. Любой поддерживаемый параметр загрузки может быть помещён в `LIVE_CONFIG_CMDLINE`, а большинство опций также можно задать через отдельные переменные. Для активации **live-config** по-прежнему требуется параметр `boot=live`.

**Примечание:** Если используются конфигурационные файлы, рекомендуется (предпочтительно) все параметры загрузки помещать в переменную **LIVE_CONFIG_CMDLINE**, либо можно использовать отдельные переменные. При использовании отдельных переменных пользователь должен убедиться, что все необходимые переменные заданы для создания корректной конфигурации.

Сам `live-config` подключает `/etc/live/config.conf`, а затем `/etc/live/config.conf.d/*.conf` в порядке оболочечной маски. Таким образом, более поздние фрагменты могут переопределять значения из основного файла или предыдущих фрагментов. Отдельный второй слой конфигурации с другого носителя не подключается.

На MiniOS-носителях исходными файлами являются `minios/config.conf` и `minios/config.conf.d/*.conf`. Перед запуском `live-config` initramfs MiniOS синхронизирует их с рабочими файлами `/etc/live/` по времени изменения. Более новый исходный файл заменяет свой рабочий аналог; более новый рабочий файл копируется обратно только если выбранный каталог данных MiniOS доступен для записи. При одинаковых временных метках копирование не производится, отсутствующие файлы дополняются, а файлы не удаляются. Это синхронизация на этапе загрузки, а не постоянный мониторинг. Полные правила синхронизации и приоритетов командной строки смотрите в разделе [Configuration file](/reference/configuration/config.conf).

В качестве резервного варианта для initramfs, которые не подготовили рабочий файл, обёртки запуска systemd и SysV копируют `minios/config.conf` с обнаруженного носителя только если отсутствует `/etc/live/config.conf`. Этот резерв не копирует фрагменты `config.conf.d`. Стандартный актуальный MiniOS LiveKit initramfs выполняет синхронизацию, описанную выше.

Файлы-фрагменты должны соответствовать шаблону `*.conf`. Рекомендуются имена вроде `vendor.conf` или `project.conf`; выбирайте имена осознанно, так как более поздние фрагменты перекрывают предыдущие.

Содержимое конфигурационных файлов состоит из одной или нескольких следующих переменных.

- **LIVE_CONFIG_CMDLINE=ПАРАМЕТР1 ПАРАМЕТР2...ПАРАМЕТРn**: Эта переменная соответствует командной строке загрузчика.
- **LIVE_CONFIG_COMPONENTS=КОМПОНЕНТ1,КОМПОНЕНТ2,...КОМПОНЕНТn**: Эта переменная соответствует параметру `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=КОМПОНЕНТ1,КОМПОНЕНТ2,...КОМПОНЕНТn**: Эта переменная соответствует параметру `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=ИМЯ_ХОСТА**: Эта переменная соответствует параметру `**live-config.hostname**=*HOSTNAME*`. По умолчанию — `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Выбирает политику проводной сети. `dhcp` и отсутствие значения не влияют на уже созданный статический профиль MiniOS.
- **LIVE_NETWORK_INTERFACE=ИНТЕРФЕЙС**: Выбирает проводной интерфейс для политики `static` или `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Устанавливает статический IPv4-адрес.
- **LIVE_NETWORK_PREFIX=ПРЕФИКС**: Устанавливает длину статического префикса; по умолчанию — `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Устанавливает необязательный статический шлюз.
- **LIVE_NETWORK_DNS=АДРЕС1,АДРЕС2**: Устанавливает необязательные DNS-серверы через запятую.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Выбирает используемый бэкенд.

Компонент сети записывает `/var/lib/live/config/network` после успешного применения политики. Удалите этот штамп, чтобы применить изменённую политику на постоянной системе. Для удаления предыдущего статического профиля используйте `network-method=off` или вручную удалите профиль и штамп, управляемые MiniOS.

- **LIVE_USERNAME=ИМЯ_ПОЛЬЗОВАТЕЛЯ**: Эта переменная соответствует параметру `**live-config.username**=*USERNAME*`. По умолчанию — `live`.
- **LIVE_USER_DEFAULT_GROUPS=ГРУППА1,ГРУППА2,...ГРУППАн**: Эта переменная соответствует параметру `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="ПОЛНОЕ ИМЯ ПОЛЬЗОВАТЕЛЯ"**: Эта переменная соответствует параметру `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.root-password**=*PASSWORD*`. Указывает пароль root в открытом виде.
- **LIVE_ROOT_PASSWORD_CRYPTED=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.root-password-crypted**=*PASSWORD*`. Указывает пароль root в зашифрованном виде.
- **LIVE_USER_PASSWORD=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.user-password**=*PASSWORD*`. Указывает пароль пользователя в открытом виде.
- **LIVE_USER_PASSWORD_CRYPTED=ПАРОЛЬ**: Эта переменная соответствует параметру `**live-config.user-password-crypted**=*PASSWORD*`. Указывает пароль пользователя в зашифрованном виде.
- **LIVE_CONFIG_NOROOT=true|false**: Эта переменная соответствует параметру `**live-config.noroot**` и отключает root, sudo и настройку привилегий PolicyKit при значении `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Эта переменная соответствует параметру `**live-config.sudo-mode**=...`. Если не задано, MiniOS сохраняет историческое поведение sudo без пароля.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Эта переменная соответствует параметру `**live-config.polkit-mode**=...`. `password` и `disabled` удаляют правило MiniOS для доступа без пароля и возвращают стандартную аутентификацию PolicyKit дистрибутива.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Эта переменная соответствует параметру `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Эта переменная соответствует параметру `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Эта переменная соответствует параметру `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Эта переменная соответствует параметру `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Эта переменная соответствует параметру `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Эта переменная соответствует параметру `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Эта переменная соответствует параметру `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=ЧАСОВОЙ_ПОЯС**: Эта переменная соответствует параметру `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=МОДЕЛЬ_КЛАВИАТУРЫ**: Эта переменная соответствует параметру `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=РАСКЛАДКА1,РАСКЛАДКА2,...РАСКЛАДКАн**: Эта переменная соответствует параметру `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=ВАРИАНТ1,ВАРИАНТ2,...ВАРИАНТn**: Эта переменная соответствует параметру `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=ОПЦИИ_КЛАВИАТУРЫ**: Эта переменная соответствует параметру `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=СЕРВИС1,СЕРВИС2,...СЕРВИСn**: Эта переменная соответствует параметру `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Эта переменная соответствует параметру `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Эта переменная соответствует параметру `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Эта переменная соответствует параметру `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Эта переменная соответствует параметру `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Эта переменная соответствует параметру `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Эта переменная соответствует параметру `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Включает или отключает создание ссылок из стандартных пользовательских каталогов данных на доступный для записи диск MiniOS. Соответствующий параметр загрузки — флаг `live-config.link-user-dirs`. Режим ссылок нельзя совмещать с режимом bind или любым режимом `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Включает или отключает bind-монтирование стандартных пользовательских каталогов данных с доступного для записи диска MiniOS. Соответствующий параметр загрузки — флаг `live-config.bind-user-dirs`. Режим bind нельзя совмещать с режимом ссылок или любым режимом `toram`.
- **LIVE_USER_DIRS_PATH=ПУТЬ**: Эта переменная соответствует параметру `**live-config.user-dirs-path**=*PATH*`. Указывает безопасный путь внутри накопителя FAT32, exFAT или NTFS MiniOS. По умолчанию — `/minios/userdata`; сегменты с точками и переходами к родительскому каталогу отклоняются.

Настройка пользовательских носителей никогда не объединяет автоматически две непустые директории. Локальная непустая директория переносится только если целевая директория на носителе пуста. При отключении функции управляемые данные с носителя копируются обратно до удаления ссылок. Неудачная проверка или копирование оставляет существующие пользовательские каталоги без изменений и записывает причину в `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Эта переменная содержит состояние, заданное параметром `live-config.module-mode` (или `module-mode`). При значении `merged` живая система применяет обновления (через minios-update-users, minios-update-cache и minios-update-dpkg) для объединения пользовательских настроек с базовой средой.
- **LIVE_CONFIG_DEBUG=true|false**: Эта переменная соответствует параметру `**live-config.debug**`.

# НАСТРОЙКА

**live-config** легко настраивается для производных проектов или локального использования.

## Добавление новых компонентов конфигурации

Производные проекты могут размещать свои компоненты в /usr/lib/live/config — дополнительных действий не требуется, компоненты будут вызваны автоматически при загрузке.

Лучше всего размещать компоненты в отдельном debian-пакете. Пример пакета с примером компонента можно найти в /usr/share/doc/live-config/examples.

## Удаление существующих компонентов конфигурации

На данный момент удалить компонент полностью без необходимости поставлять локально модифицированный пакет **live-config** или использовать dpkg-divert невозможно. Однако того же эффекта можно добиться, отключив соответствующие компоненты через механизм live-config.nocomponents, см. выше. Чтобы не указывать отключённые компоненты каждый раз через параметр загрузки, рекомендуется использовать конфигурационный файл (см. выше).

Файлы конфигурации для самой live-системы лучше всего размещать в отдельном debian-пакете. Пример пакета с примером конфигурации можно найти в /usr/share/doc/live-config/examples.

# КОМПОНЕНТЫ

**live-config** в настоящее время включает следующие компоненты в /usr/lib/live/config.

- **nss-systemd**: удаляет или восстанавливает модуль NSS systemd в /etc/nsswitch.conf для обхода известной проблемы systemd.
- **debconf**: позволяет применять произвольные preseed-файлы, размещённые на live-носителе или http/ftp-сервере.
- **hostname**: настраивает /etc/hostname и /etc/hosts.
- **issue-setup**: настраивает файл /etc/issue с приветственным баннером и информацией о дистрибутиве.
- **live-debconfig_passwd**: настраивает пароли пользователя и root через live-debconfig.
- **user-setup**: добавляет учётную запись live-пользователя.
- **user-groups**: добавляет live-пользователя в дополнительные группы, объявленные установленными модулями. Существующие группы из `/usr/share/live/config/user-default-groups.d/*.groups` применяются после создания пользователя и при последующих запусках live-config.
- **root-setup**: задаёт или обновляет пароль root и настраивает окружение пользователя root.
- **sudo**: предоставляет live-пользователю права sudo.
- **user-ssh-keys**: синхронизирует пользовательские файлы `authorized_keys.<username>` между live-носителем и домашними директориями пользователей. Поддерживает одновременную работу с несколькими пользователями (например, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: создаёт ссылки или bind-монтирует валидированные пользовательские каталоги на существующем записываемом носителе данных MiniOS с безопасной миграцией и обратным копированием при отключении.
- **locales**: настраивает локали.
- **tzdata**: настраивает /etc/timezone.
- **xorg-service**: настраивает имя пользователя в xorg.service и применяет настройки X11, если поддерживается.
- **gdm3**: настраивает автологин в gdm3.
- **sddm**: настраивает автологин в sddm.
- **kdm**: настраивает автологин в kdm.
- **lightdm**: настраивает автологин в lightdm.
- **lxdm**: настраивает автологин в lxdm.
- **nodm**: настраивает автологин в nodm.
- **slim**: настраивает автологин в slim.
- **xinit**: настраивает автологин с помощью xinit.
- **keyboard-configuration**: настраивает клавиатуру.
- **sysvinit**: настраивает автологин в консоли через `/etc/inittab` при установленном sysvinit. Сокращения `noautologin` и `nottyautologin` отключают эту настройку.
- **sysv-rc**: настраивает sysv-rc, отключая указанные службы.
- **apport**: отключает apport.
- **gnome-panel-data**: отключает кнопку блокировки экрана.
- **gnome-power-manager**: отключает гибернацию.
- **gnome-screensaver**: управляет блокировкой экрана GNOME в соответствии с `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: отключает мастер миграции KDE (начиная с squeeze).
- **kde-services**: отключает некоторые нежелательные службы KDE (начиная с squeeze).
- **policykit**: предоставляет права пользователю через PolicyKit.
- **ssl-cert**: пересоздаёт тестовые SSL-сертификаты snake-oil.
- **xrdp**: настраивает режим XRDP (расслабленный, усиленный или отключённый) при установленном XRDP.
- **anacron**: отключает anacron.
- **util-linux**: отключает службу hwclock из util-linux.
- **login**: отключает lastlog.
- **xserver-xorg**: настраивает xserver-xorg.
- **network**: настраивает устойчивую политику проводной IPv4 через безопасный файл ключей NetworkManager или секцию ifupdown. Запускается до сетевых служб, валидирует все значения и отмечает только после успешной записи.
- **openssh-server**: пересоздаёт ключи хоста OpenSSH и явно задаёт политику входа root или аутентификации по паролю, если это указано.
- **xfce4-panel**: настраивает xfce4-panel по умолчанию.
- **xscreensaver**: управляет блокировкой xscreensaver согласно `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: настраивает драйверы WLAN broadcom-sta.
- **hyperv**: настраивает параметры X11 для повышения совместимости с платформами Microsoft Hyper-V.
- **ntfs3**: управляет правилами udev для поддержки NTFS3.
- **config-module-mode**: настраивает режим модулей системы и обновляет кэши, пользовательские настройки и dpkg.
- **hooks**: позволяет запускать произвольные команды из файла, размещённого на live-носителе или http/ftp-сервере.

# ФАЙЛЫ

- `minios/config.conf` на выбранном носителе данных MiniOS (исходная копия)
- `minios/config.conf.d/*.conf` на выбранном носителе данных MiniOS (исходные фрагменты)
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
- `minios/log/YYYYMMDD_HHMMSS/` на записываемом выбранном носителе данных при включённом экспорте логов
- `/usr/lib/live/config-hooks/*` (`filesystem` хуки)
- `minios/config-hooks/*` на обнаруженном live-носителе (`medium` хуки)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` на обнаруженном live-носителе (`medium` preseeds)

# СМ. ТАКЖЕ

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# ДОМАШНЯЯ СТРАНИЦА

Больше информации о **minios-live-config** можно найти в его [репозитории на GitHub](https://github.com/minios-linux/minios-live-config). Общая информация о MiniOS доступна на [minios.dev](https://minios.dev).

# ОШИБКИ

Сообщить об ошибках можно в [трекере проблем minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# АВТОР

**live-config** был изначально написан Даниэлем Бауманом ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). С 2016 года разработка продолжена командой Debian Live. С 2025 года разработка модифицированной версии **minios-live-config** ведётся командой MiniOS Live.
