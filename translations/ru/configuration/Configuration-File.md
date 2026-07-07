# Файл конфигурации

MiniOS отличается от большинства классических flash-дистрибутивов тем, что некоторые параметры можно задать до загрузки в достаточно простом конфигурационном файле `config/config.conf`, что минимизирует количество работы при создании собственных модулей для встраиваемых систем. При необходимости некоторые параметры можно задать в параметрах загрузки. Параметры загрузки имеют приоритет над конфигурационным файлом. Некоторые параметры в этом файле являются служебными, и их лучше не изменять. Ниже приведён пример стандартного конфигурационного файла:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
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
- 🔒 **Только один раз** — применяется только при первой загрузке, не может быть изменён при последующих загрузках  
- 🔄 **Переконфигурируемый** — можно менять при каждой загрузке и применять повторно

| Параметр | Переконфигурируемый | Значение | Пример |
| --------- | ------------------- | -------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Дополнительные параметры загрузки live-config. См. `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
| LIVE_HOSTNAME | 🔄 | Имя узла, связанного с системой. См. `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Имя пользователя, чей профиль будет создан при первой загрузке. Если указать имя пользователя <strong>root</strong>, профиль пользователя создан не будет, и вход будет выполнен под <strong>root</strong>. См. `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Полное имя основного пользователя. См. `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Список групп для основного пользователя через запятую. См. `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Пароль основного пользователя в зашифрованном виде (хэш). Для генерации используйте `mkpasswd -m yescrypt`. См. `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Пароль привилегированного пользователя **root** в зашифрованном виде (хэш). Для генерации используйте `mkpasswd -m yescrypt`. См. `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Если задано, отключает вход под root и отключает sudo/policykit для пользователя. См. `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Устанавливает локаль. Можно указать несколько значений через запятую. См. `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Устанавливает часовой пояс (например, "Europe/Berlin", "Etc/UTC"). См. `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Устанавливает модель клавиатуры (например, "pc105"). См. `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Устанавливает раскладки клавиатуры (через запятую, например, "us,de"). См. `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Устанавливает опции клавиатуры (например, "grp:alt_shift_toggle,grp_led:scroll"). См. `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Устанавливает варианты клавиатуры (через запятую, можно оставить пустым или соответствовать раскладкам). См. `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Включает вывод отладки для live-config. См. `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Если true, пользовательские каталоги будут символически связаны из указанного пути. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Если true, пользовательские каталоги будут примонтированы через bind из указанного пути. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Путь к пользовательским данным на флеш-накопителе. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Выбор режима работы системы. Если планируете устанавливать ПО только модулями, используйте "merged". Если хотите устанавливать ПО через apt, используйте "simple". По умолчанию — "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Целевой режим загрузки systemd. См. `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Включить сервисы при загрузке (через запятую). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Отключить сервисы при загрузке (через запятую). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Если true, при загрузке с носителя с записью логи MiniOS копируются в папку minios/logs во время загрузки. | EXPORT_LOGS="false" |


**Подробнее о большинстве параметров см.:**  
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Для целей systemd: `man systemd.special`

## Важно!

* SSH-сервер включён по умолчанию для совместимости с сторонними initrd, чтобы его отключить, недостаточно просто убрать его из `ENABLE_SERVICES`.

Чем ещё может быть полезен файл `config.conf`? Вы можете использовать его для задания собственных параметров в ваших скриптах при создании модулей. При первой загрузке он копируется в папку /etc/minios, далее файл `/etc/live/config.conf` автоматически отслеживается и при изменениях перезаписывает конфигурационный файл на флеш-накопителе, если он доступен для записи. Таким образом, вы можете помещать свои переменные в config.conf и получать их из `/etc/live/config.conf` в своих скриптах независимо от типа используемого initrd.
