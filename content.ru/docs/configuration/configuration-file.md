---
title: Файл конфигурации
type: docs
weight: 1
---

# Файл конфигурации

MiniOS отличается от большинства классических дистрибутивов для флешки тем, что некоторые параметры можно задать до загрузки в достаточно простом файле конфигурации `minios/minios.conf`, что сводит к минимуму количество необходимых действий при создании собственных модулей для создания встроенных систем. Опционально, чать параметров можно задать и в параметрах загрузки.

<!--more-->
Параметры загрузки имеют выше приоритет, чем файл конфигурации. Некоторые параметры в этом файле являюся служебными и их лучше не менять. Ниже пример стандартного файла конфигурации:

```
USER_NAME="live"
USER_PASSWORD="evil"
ROOT_PASSWORD="toor"
HOST_NAME="minios"
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
SSH_KEY="authorized_keys"
CLOUD="false"
SCRIPTS="true"
HIDE_CREDENTIALS="false"
AUTOLOGIN="true"
SYSTEM_TYPE="puzzle"
EXPORT_LOGS="false"
CORE_BUNDLE_PREFIX="00-core"
BEXT="sb"
```

Некоторые из этих параметров можно задавать только один раз, до первой загрузки, если вы используете режим сохранения изменений. В режиме сохранения изменений всегда можно изменять только следующие параметры:

```
USER_PASSWORD
ROOT_PASSWORD
ENABLE_SERVICES
DISABLE_SERVICES
SSH_KEY
HIDE_CREDENTIALS
AUTOLOGIN
```

## Описание параметров
| Параметр | Значение | Пример | <div style="width:145px">С какими initrd работает</div> |
| -------- | -------- | ------ | ------------------------ |
| USER\_NAME | Имя пользователя, профиль которого будет создан при первой загрузке. Если указать имя пользователя <strong>root</strong>, то профиль пользователя не будет создан, параметр **USER\_PASSWORD** будет проигнорирован, вход будет выполняться с использованием профиля <strong>root</strong>. | USER\_NAME=live<br>USER\_NAME=user<br>USER\_NAME=root | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| USER\_PASSWORD | Пароль обычного пользователя в открытом виде. В пароле нельзя использовать символы `'`, `\` и другие символы, которые могут быть неправильно интерпретированы bash. | USER\_PASSWORD=evil<br>USER\_PASSWORD=PxKYJnLK8cv0E3Hd | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| ROOT\_PASSWORD | Пароль привелигированного пользователя **root** в открытом виде. В пароле нельзя использовать символы `'`, `\` и другие символы, которые могут быть неправильно интерпретированы bash. | ROOT\_PASSWORD=toor<br>ROOT\_PASSWORD=9gVIlgGsZtpKPsE8 | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| HOST\_NAME | Имя узла, ассоциированного с системой. | HOST\_NAME=minios | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| DEFAULT\_TARGET | Цель systemd. Вы можете узнать больше о целях systemd [здесь](https://wiki.archlinux.org/title/Systemd_(%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9)#%D0%A6%D0%B5%D0%BB%D0%B8). | DEFAULT\_TARGET=graphical<br>DEFAULT\_TARGET=multi-user | <ul><li>MiniOS Live Kit</li></ul> |
| ENABLE\_SERVICES | Включить службы при загрузке. | ENABLE\_SERVICES=ssh<br>ENABLE\_SERVICES=ssh,firewalld | <ul><li>MiniOS Live Kit</li></ul> |
| DISABLE\_SERVICES | Выключить службы при загрузке. | DISABLE\_SERVICES=docker<br>DISABLE\_SERVICES=docker,firewalld,ssh | <ul><li>MiniOS Live Kit</li></ul> |
| SSH\_KEY | Имя файла открытого ключа SSH, который должен находиться в системной папке на носителе (вместе с основными модулями .sb). По умолчанию система ищет файл с именем <strong>authorized\_keys</strong>.<br>Этот файл будет скопирован в `~/.ssh/authorized_keys` основного пользователя и пользователя root при загрузке системы, и может быть использован для авторизации с использованием ключей SSH. | SSH\_KEY=authorized\_keys<br>SSH\_KEY=my\_public\_key.pub | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| CLOUD | Служебный параметр, необходим для использования с cloud-init, не применяется в публичных версиях MiniOS. | CLOUD=false | <ul><li>MiniOS Live Kit</li></ul> |
| SCRIPTS | Запуск скриптов shell из папки minios/scripts, по умолчанию включён. Скрипты запускаются автоматически на tty2 после достижения multi-user.target (init 3). | SCRIPTS=true | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| HIDE\_CREDENTIALS | Скрыть учетные данные, отображаемые в виде подсказки в tty. По умолчанию отключено. | HIDE\_CREDENTIALS=false | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| AUTOLOGIN | Включить/отключить автоматический вход в систему. По умолчанию включено. | AUTOLOGIN=true | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| SYSTEM\_TYPE | Выбрать режим работы системы. Если вы планируете устанавливать ПО исключительно модулями, необходимо использовать "puzzle", если вы хотите устанавливать ПО с помощью apt, то "classic". По умолчанию установлено значение "classic" для всех редакций, кроме Puzzle. | SYSTEM\_TYPE=puzzle<br>SYSTEM\_TYPE=classic | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| EXPORT\_LOGS | Если true, то при загрузке с носителя, доступного для записи, логи MiniOS при загрузке копируются в папку `minios/logs`. По умолчанию установлено значение "false" | EXPORT\_LOGS="false" | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| CORE\_BUNDLE\_PREFIX | Служебный параметр, указывающий утилитам в системе наименование модуля с базовой системой. | CORE\_BUNDLE\_PREFIX=00-core | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| BEXT | Служебный параметр, указывающий утилитам в системе расшрение в имени файлов модулей. | BEXT=sb | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
***

{{< hint danger >}}
* Сервер SSH включен по умолчанию для совместимости со сторонними initrd, для его отключения необходимо не только убрать его из `ENABLE_SERVICES`, но и добавить в `DISABLE_SERVICES`.
* **При первой загрузке** в режиме сохранения изменений, либо если вы используете режим чистой загрузки или загрузки в ОЗУ, вы можете дополнительно изменить параметры `HOST_NAME` и `DEFAULT_TARGET`.
* Параметры `CLOUD`, `CORE_BUNDLE_PREFIX` и `BEXT` менять нельзя, они являются служебными и применяются в нестандартных непубличных вариантах MiniOS (облачная виртуализация, нестандартная компоновка модулей и т.д.).
* При использовании initrd отличных от MiniOS Live Kit, часть параметров будут недоступны, обратите внимание на правую колонку в таблице выше.
{{< /hint >}}

Чем ещё может быть полезен файл `minios.conf`? Вы можете его использовать для задания собственных параметров в своих скриптах при создании модулей. При первой загрузке он копируется в папку /etc/minios, далее файл `/etc/minios/minios.conf` автоматически отслеживается и, при внесении изменений, перезаписывает собой файл конфигурации на флешке, если он доступен для записи. Таким образом, вы можете внести свои переменные в minios.conf и получать их из `/etc/minios/minios.conf` в своих скриптах независимо от типа используемого initrd.
