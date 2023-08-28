---
title: Параметры запуска
type: docs
weight: 2
---

# Параметры запуска

Параметры загрузки (параметры ядра) используются для воздействия на процесс загрузки MiniOS. Некоторые из них являются общими для всех Linux, другие специфичны только для MiniOS. Вы можете использовать их для отключения желаемого типа обнаружения оборудования, для запуска MiniOS с жесткого диска и т. д.

<!--more-->
Чтобы использовать опции с syslinux, нажмите клавишу `Esc`, чтобы активировать меню загрузки во время запуска MiniOS, как обычно, и когда вы увидите меню загрузки, нажмите `Tab`, отредактируйте параметры загрузки, затем нажмите Enter. Для grub нажмите `E` для редактирования, затем `F10` для загрузки. Внизу экрана появится командная строка, в конце которой вы сможете отредактировать или добавить новые параметры загрузки. Некоторые параметры grub нельзя изменить в интерактивном режиме. Чтобы изменить их, отредактируйте `boot/grub/grub.cfg`.

| Опция | Значение | Пример |
| ------- | -------- | ------ |
| from= | Загрузить данные MiniOS из указанного каталога, устройства или даже из файла ISO. | from=/minios/<br>from=/dev/sr0/minios<br>from=/Downloads/minios.iso<br>from=http://domain.com/minios.iso |
| noload= | Отключить загрузку определенных модулей .sb, указанных как регулярное выражение. | noload=04-xfce-apps<br>noload=xfce-apps,browser<br>noload=04,05 |
| nosound | Отключить звук при запуске (используется только в варианте с окружением Fluxbox). | nosound |
| perchdir= | Выбор профиля, либо выполнение действия с профилем. Может принимать в качестве значения номер профиля, либо значения resume (возобновление предыдущей сессии), new (начать новую сессию), ask (выбор сессии при запуске). Если опция perchdir отсутствует, то загрузка будет выполняться в "чистом" режиме. | perchdir=1<br>perchdir=resume<br>perchdir=new<br>perchdir=ask |
| toram | Активировать функцию копирования в RAM. | toram |
| text | Отключить запуск X и оставаться только в текстовой консоли. | text |
| debug | Включить отладку при запуске MiniOS. | debug |
| root\_password= | Пароль пользователя root. | root\_password=toor |
| user\_name= | Имя пользователя. Если указать имя пользователя <strong>root</strong>, то профиль пользователя не будет создан, параметр **user\_password** будет проигнорирован. В текущей версии данный параметр может быть равен либо <strong>root</strong>, либо <strong>live</strong>. | user\_name=live |
| user\_password= | Пароль пользователя. | user\_password=evil |
| host\_name= | Имя хоста системы. | host\_name=minios |
| default\_target= | Цель systemd. Вы можете узнать больше о целях systemd [здесь](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/working-with-systemd-targets_configuring-basic-system-settings). | default\_target=graphical<br>default\_target=multi-user<br>default\_target=emergency |
| enable\_services= | Включить службы при загрузке. | enable\_services=ssh,firewalld |
| disable\_services= | Отключить службы при загрузке. | disable\_services=docker |
| ssh\_key= | Имя файла открытого ключа ssh, который должен находиться в системной папке на носителе (вместе с основными модулями .sb). По умолчанию система ищет файл с именем <strong>authorized\_keys</strong>. | ssh\_key=my\_public\_keys |
| scripts= | Скрипты запускаются при достижении multi-user target (init 3). Для запуска скриптов, они должны быть расположены в папке minios/scripts. Переменная scripts может быть равна interactive, background или false. По умолчанию, при нахождении скриптов в указанной папке, система грузится только до multi-user target, после чего в интерактивном режиме запускает скрипты в алфавитном порядке. При scripts=background система грузится как обычно, скрипты выполняются в фоне. При scripts=false скрипты не грузятся, даже если они расположены в папке скриптов. | scripts=interactive<br>scripts=background<br>scripts=false |
| cloud | Специальный режим для запуска в качестве хоста cloud-init. | cloud |
| hide\_credentials | Скрыть учетные данные, отображаемые в виде подсказки в консоли при запуске системы. | hide\_credentials |
| autologin= | Включить/отключить автоматический вход в систему. По умолчанию включено. | autologin=true<br>autologin=false |

Разделяйте команды пробелами. Смотрите справочные страницы `man bootparam` для получения дополнительных параметров ядра, общих для всех дистрибутивов Linux.
