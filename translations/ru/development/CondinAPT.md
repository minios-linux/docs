# CondinAPT: Полное руководство по условной установке пакетов

**CondinAPT** — это универсальный инструмент для автоматизации установки пакетов в любой системе на базе Debian (Debian, Ubuntu и их производные). Его ключевая особенность — возможность задавать сложные условия и правила для установки каждого пакета в зависимости от произвольных конфигураций системы.

**Области применения:**
- Системы сборки дистрибутивов Linux
- Автоматизация настройки серверов и рабочих станций
- Развертывание различных системных конфигураций
- Управление пакетами в Docker-контейнерах
- CI/CD пайплайны для подготовки окружения
- Создание собственных установочных образов

## Оглавление

### Основы

- [Как работает и основные компоненты](#how-it-works-and-core-components)
- [Быстрый старт](#quick-start)
- [Использование](#usage)

### Синтаксис и возможности

- [Синтаксис файла списка пакетов](#package-list-file-syntax)
- [Фильтры и условия](#filters-and-conditions)
- [Очереди установки](#installation-queues)
- [Приоритетная очередь](#priority-queue)

### Режимы работы

- [Режимы работы и отладка](#operating-modes-and-debugging)
- [Обработка ошибок и восстановление](#error-handling-and-recovery)

### Продвинутое использование

- [Расширенные возможности](#advanced-features)
- [Интеграция со сборочными системами](#integration-with-build-systems)

### Практические примеры

- [Примеры реальных сценариев](#examples-of-real-world-scenarios)
- [Советы по оптимизации](#optimization-tips)
- [Устранение неполадок](#troubleshooting)

**Ключевые возможности:**

*   **Условная установка:** Установка пакетов на основе гибких фильтров (+, -).
*   **Внешняя конфигурация:** Полное разделение логики (список пакетов) и данных (параметры системы).
*   **Очереди установки:** Разделение процесса на последовательные этапы для разрешения зависимостей.
*   **Приоритетная очередь:** Гарантированная установка критически важных пакетов в первую очередь.
*   **Сложная логика:** Поддержка операторов "И" (`&&`), "ИЛИ" (`||`), а также групповых фильтров (`+{a|b}`, `-{a&b}`).
*   **Читаемость:** Поддержка комментариев и пустых строк для структурирования списков.
*   **Обратная совместимость:** Поддержка простых списков пакетов без условий.

## Как работает и основные компоненты

CondinAPT работает с четырьмя ключевыми файлами:

1.  **Скрипт `condinapt`:** Ядро, содержащее всю логику обработки.

2.  **Основной конфигурационный файл (`-c`):** Файл с bash-переменными, описывающими текущее окружение.

    Пример (`system.conf`):

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **Файл сопоставления фильтров (`-m`):** Связывает короткие префиксы (используемые в списке пакетов) с именами переменных из основного конфигурационного файла. Этот файл **необязателен**. Если фильтр отсутствует в файле сопоставления, он будет использоваться как имя переменной из основного конфигурационного файла. Если переменная не найдена, CondinAPT объявит её пустой.

    Пример (`filters.map`):

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **Файл списка пакетов (`-l`):** Основной файл, описывающий, что устанавливать и при каких условиях.

## Быстрый старт

Чтобы быстро познакомиться с CondinAPT, создайте простой пример:

**1. Создайте конфигурационный файл `config.conf`:**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Создайте список пакетов `packages.list`:**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Запустите установку:**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. Или протестируйте в режиме симуляции:**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Использование

### Командная строка

```bash
./condinapt [OPTIONS]
```

| Флаг         | Длинный флаг                   | Аргумент | Описание                                            |
| :----------- | :----------------------------- | :------- | :-------------------------------------------------- |
| `-l`         | `--package-list`               | `PATH`   | **(Обязателен)** Путь к файлу списка пакетов.       |
| `-c`         | `--config`                     | `PATH`   | **(Обязателен)** Путь к основному конфигурационному файлу. |
| `-m`         | `--filter-mapping`             | `PATH`   | (Необязательно) Путь к файлу сопоставления фильтров. |
| `-P`         | `--priority-list`              | `PATH`   | (Необязательно) Путь к файлу приоритетных фильтров. Файл содержит шаблоны regex для поиска пакетов. Совпавшие пакеты перемещаются в приоритетную очередь (с сохранением фильтров). |
| `-s`         | `--simulation`                 |          | Режим симуляции. Пакеты не будут устанавливаться.   |
| `-C`         | `--check-only`                 |          | Только проверка установленных пакетов. Возвращает код выхода 1, если есть неустановленные пакеты. В конце выводит команду для установки отсутствующих пакетов. |
| `-v` / `-vv` | `--verbose` / `--very-verbose` |          | Подробный / очень подробный вывод.                  |
| `-x`         | `--xtrace`                     |          | Включить трассировку команд `set -x`.               |
| `-f`         | `--force`                      |          | Принудительно обновить списки пакетов перед установкой. По умолчанию обновление пропускается, если существует `/var/cache/apt/pkgcache.bin`. |
| `-h`         | `--help`                       |          | Показать справку.                                   |

## Синтаксис файла списка пакетов

### Базовая структура

Это сердце CondinAPT. Вся логика описывается здесь.

Каждая строка в файле списка пакетов состоит из двух основных частей:

1. **Имя пакета с необязательным указанием версии и релиза**
2. **Фильтры условий** — определяют, при каких условиях пакет будет установлен

> **Основа для всех примеров ниже:**
> Для всех последующих примеров предполагается, что используются файлы `system.conf` и `filters.map` из раздела [Как работает и основные компоненты](#how-it-works-and-core-components).
>
> *   `DISTRIBUTION` = `"bookworm"`
> *   `SYSTEM_TYPE` = `"server"`
> *   `ENVIRONMENT` = `"production"`

### Структура имени пакета

**Простое имя:**
```
vim
```

**Версия пакета:**
- `package=version` — нестрогое требование по версии. Если нужная версия недоступна, устанавливается доступная версия.
  ```
  git=2.25.1
  ```
- `package==version` — строгое требование. Если версия не найдена, установка прерывается с ошибкой.
  ```
  curl==7.68.0
  ```

**Указание релиза:**
Релиз указывается с помощью символа `@`, что позволяет привязать установку к определённой ветке репозитория.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### Структура файла

*   **Имена пакетов:** Каждый пакет или условие записывается с новой строки.
*   **Комментарии:** Строки, начинающиеся с `#`, или текст после `#` в строке, полностью игнорируются.
*   **Пустые строки:** Игнорируются и служат для визуального разделения.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Фильтры и условия

Фильтры позволяют задать дополнительные условия для выбора пакетов. Они сравнивают значения системных переменных (архитектура, дистрибутив, рабочее окружение) с указанными в конфигурационном файле.

#### Одиночные фильтры

*   **`+` (Положительный):** Условие истинно, если значение переменной **совпадает**.
    **Формат:** `+<префикс>=<значение>`
    
    *   **Строка:** `nginx +st=server`
    *   **Анализ:** `SYSTEM_TYPE` равен `"server"`. Условие истинно.
    *   **Результат:** `nginx` будет установлен.

*   **Несколько положительных фильтров с одним префиксом:**
    Работают как условия ИЛИ.
    **Формат:** `+<префикс>=<значение1> +<префикс>=<значение2>`
    
    *   **Строка:** `debug-tools +env=development +env=testing`
    *   **Анализ:** `ENVIRONMENT` равен `"production"`, что не совпадает ни с `"development"`, ни с `"testing"`. Условие ложно.
    *   **Результат:** `debug-tools` не будет установлен.

*   **`-` (Отрицательный):** Условие истинно, если значение переменной **не совпадает**.
    **Формат:** `-<префикс>=<значение>`

    *   **Строка:** `monitoring-tools -st=desktop`
    *   **Анализ:** `SYSTEM_TYPE` равен `"server"`, что не равно `"desktop"`. Условие истинно.
    *   **Результат:** `monitoring-tools` будет установлен.

*   **Несколько отрицательных фильтров:**
    Пакет исключается, если выполнено ЛЮБОЕ условие.
    **Формат:** `-<префикс>=<значение1> -<префикс>=<значение2>`
    
    *   **Строка:** `realtek-driver -d=trixie -d=sid`
    *   **Анализ:** `DISTRIBUTION` равен `"bookworm"`, что не равно ни `"trixie"`, ни `"sid"`. Условия исключения не срабатывают.
    *   **Результат:** `realtek-driver` будет установлен.

#### Групповые фильтры

*   **`+{a|b}` (ИЛИ для включения):** Истинно, если **хотя бы одно** из условий в группе истинно.

    *   **Строка:** `web-server +{st=server|st=web-server}`
    *   **Анализ:** `SYSTEM_TYPE` равен `"server"`. Первое условие истинно, этого достаточно.
    *   **Результат:** Пакет будет установлен.

*   **`+{a&b}` (И для включения):** Истинно только если **все** условия в группе истинны.

    *   **Строка:** `database-tools +{d=bookworm&st=server}`
    *   **Анализ:** `DISTRIBUTION` равен `"bookworm"` (истинно) И `SYSTEM_TYPE` равен `"server"` (истинно).
    *   **Результат:** Пакет будет установлен.

*   **`-{a|b}` (ИЛИ для исключения):** Пакет исключается, если **хотя бы одно** из условий истинно.

    *   **Строка:** `debug-tools -{env=production|st=minimal}`
    *   **Анализ:** `ENVIRONMENT` равен `"production"`. Первое условие истинно, пакет исключается.
    *   **Результат:** Пакет не будет установлен.

*   **`-{a&b}` (И для исключения):** Пакет исключается только если **все** условия истинны.

    *   **Строка:** `development-tools -{env=production&st=minimal}`
    *   **Анализ:** `ENVIRONMENT` равен `"production"` (истинно), но `SYSTEM_TYPE` не равен `"minimal"`. Второе условие ложно. Группа не срабатывает на исключение.
    *   **Результат:** Пакет будет установлен (если нет других фильтров).

### Альтернативы

Для одной и той же функциональности можно предложить разные пакеты, которые будут устанавливаться в зависимости от условий. Альтернативные варианты разделяются оператором `||`.

**Важно:** Каждая альтернатива должна содержать полное описание — имя пакета (с необязательной версией и релизом) и набор фильтров.

**Пример:**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- Если `SYSTEM_TYPE` — `database-server`, выбирается **postgresql**.
- Если `SYSTEM_TYPE` — `web-server`, устанавливается **mysql-server**.

### Логические операторы для пакетов

*   **`||` (ИЛИ / Fallback):** Пытается установить левую часть. Если не удалось (пакет не найден или отфильтрован), пробует установить правую часть.

    *   **Строка:** `exfatprogs -d=bookworm || exfat-utils`
    *   **Анализ:** `DISTRIBUTION` не равен `"bookworm"`, левая часть отфильтрована. CondinAPT переходит к правой части. У `exfat-utils` нет фильтров, он будет установлен.
    *   **Результат:** Будет установлен `exfat-utils`.

*   **`&&` (И / Конъюнкция):** Все части должны успешно пройти проверки фильтров, чтобы быть добавленными в очередь.

    *   **Строка:** `nginx +st=web-server && php-fpm`
    *   **Анализ:** `SYSTEM_TYPE` равен `"server"`, но условие требует `"web-server"`. Левая часть не проходит.
    *   **Результат:** Пакеты не будут установлены.

    *   **Сложный пример:** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Результат:** Все три пакета будут установлены только если `ENVIRONMENT` — `production`.

### Специальные модификаторы

*   **`!` (Обязательный пакет):** Если пакет помечен как обязательный (`!`), но не найден в репозиториях, CondinAPT завершит выполнение с ошибкой.

    *   **Строка:** `!essential-package`

*   **`@` (Указание релиза):** Установить пакет из определённого релиза Debian/Ubuntu (например, `bookworm-backports`).

    *   **Строка:** `kernel-image-6.5.0 @trixie-backports`

### Указание версии пакета

CondinAPT позволяет точно контролировать версии устанавливаемых пакетов.

*   **Синтаксис:**
    *   `package=VERSION`: Пытается установить указанную версию (`VERSION`). Если она недоступна в репозиториях, CondinAPT установит любую доступную версию этого пакета.
        *   Пример: `my-app=1.2.3` (пытается установить 1.2.3, если нет — например, 1.2.4)
    *   `package==VERSION`: **Строгая** установка конкретной версии. Если такой версии нет в репозиториях, пакет **не будет установлен**. Если пакет также был помечен как обязательный (`!`), скрипт завершится с ошибкой.
        *   Пример: `another-app==2.0.0` (устанавливает только 2.0.0, иначе пропускает или ошибка, если обязательный)

*   **Поведение:**
    1.  CondinAPT сначала проверяет, установлена ли нужная версия пакета в системе. Если да — пакет считается установленным и пропускается.
    2.  Затем проверяет, доступна ли указанная версия в репозиториях (`apt-cache madison`).
    3.  **При использовании `=` (нестрогая версия):**
        *   Если нужная версия недоступна, CondinAPT выдаст предупреждение, что точная версия не найдена.
        *   Тем не менее, будет предпринята попытка установить любую доступную версию пакета из репозиториев.
    4.  **При использовании `==` (строгая версия):**
        *   Если нужная версия недоступна, CondinAPT **не будет** устанавливать пакет.
        *   Если пакет был обязательным (`!`), скрипт завершится с ошибкой.
    5.  **Заморозка версии (`apt-mark hold`):**
        *   Если пакет был успешно установлен в **точно указанной версии** (т.е. если `package==VERSION` сработал, либо `package=VERSION` нашёл *именно* эту версию и установил её), CondinAPT автоматически выполнит команду `apt-mark hold` для этого пакета.
        *   Это предотвращает автоматическое обновление пакета до новой версии при последующих операциях `apt upgrade`.

### Примеры сложных фильтров

#### Пример 1: Сложные фильтры для одного пакета

**Задача:** Установить `database-tools` для дистрибутива `bookworm`, но только если тип системы — `server` или `database-server`, и не для окружения `minimal`.

**`packages.list`:**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Анализ (с нашей конфигурацией):**

1.  `+d=bookworm`: Истинно.
2.  `+{st=server|st=database-server}`: Истинно, так как `SYSTEM_TYPE` = `"server"`.
3.  `-env=minimal`: Истинно, так как `ENVIRONMENT` = `"production"`.
    **Результат:** Все условия истинны. Пакет будет установлен.

#### Пример 2: Цепочка fallback с разными условиями

**Задача:** Для Debian `trixie` установить `firefox-esr`. Для `bookworm` — `firefox`. Во всех остальных случаях — `w3m`.

**`packages.list`:**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Анализ:**

1.  `firefox-esr +d=trixie`: Левая часть. `DISTRIBUTION` = `"bookworm"`, условие ложно.
2.  `firefox +d=bookworm`: Средняя часть. `DISTRIBUTION` = `"bookworm"`, условие истинно.
3.  Так как сработала вторая часть цепочки `||`, третья (`w3m`) игнорируется.
    **Результат:** Будет установлен `firefox`.

#### Пример 3: Взаимодействие приоритетной очереди и обязательного пакета

**Задача:** `dkms` критически важен для сборки модулей, он должен быть установлен первым. В основном списке он отмечен как обязательный, но с условием.

*   **`priority.list`:**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list`:**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Анализ:**

1.  CondinAPT читает приоритетные шаблоны `^dkms$` и `^build-essential$`.
2.  Строка `!dkms +pv=standard` совпадает с шаблоном `^dkms$` и переносится в приоритетную очередь **со всеми свойствами**: флаг обязательности (`!`) и фильтр (`+pv=standard`).
3.  **План выполнения:**

    *   **Приоритетная очередь:** Установить `!dkms +pv=standard` (флаг обязательности и фильтр сохраняются).
    *   **Обычная очередь:** `vim`.

**Результат:** `dkms` будет установлен первым, но фильтр `+pv=standard` всё равно будет проверяться. Если условие фильтра не выполнено, установка завершится с ошибкой из-за флага `!` (обязательный).

## Очереди установки

Разделитель `---` на отдельной строке делит список на группы (очереди). Пакеты из одной очереди устанавливаются вместе одним вызовом `apt`. Очереди выполняются строго последовательно.

### Обычные очереди

**Пример:**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Целевые очереди (с указанием релиза)

Пакеты с `@release` автоматически группируются в отдельные очереди по релизу:

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## Приоритетная очередь

Этот механизм предназначен для приоритетной установки критически важных пакетов с сохранением их фильтров и условий.

*   **Принцип:** Файл, указанный через флаг `-P`, содержит шаблоны regex (по одному на строку, без фильтров). CondinAPT сканирует все очереди, находит пакеты, совпадающие с этими шаблонами, и переносит их (со всеми фильтрами и условиями) в специальную "Приоритетную очередь", которая выполняется первой.
*   **Сопоставление шаблонов:** Используется bash-оператор сопоставления с regex (`=~`). Шаблоны могут быть как простыми именами пакетов, так и сложными регулярными выражениями.
*   **Сохранение контекста:** В отличие от простых приоритетных списков, этот механизм сохраняет все условия, фильтры и указания релиза из исходного списка пакетов.
*   **Переопределение:** Совпавшие пакеты автоматически удаляются из своих исходных очередей (как обычных, так и целевых с `@release`) и переносятся в приоритетные очереди. Целевые релизы сохраняются в отдельных приоритетных целевых очередях.

**Пример 1: Совпадение по имени пакета**

*   **`packages.list`:**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list`:**

    ```text
^gpg$
^git$
```

*   **Анализ:**

    1.  CondinAPT читает `priority.list` и понимает, что пакеты, совпадающие с шаблонами `^gpg$` и `^git$`, должны быть установлены первыми.
    2.  Он сканирует `packages.list` и находит строку `git +st=full-server`. Так как `git` совпадает с шаблоном, вся эта строка (с фильтром `+st=full-server`) переносится в приоритетную очередь.
    3.  Аналогично, `gpg -st=minimal` переносится в приоритетную очередь с сохранением фильтра `-st=minimal`.
    4.  **Итоговый план:**

        *   **Приоритетная очередь:** Установить `git +st=full-server` и `gpg -st=minimal` (фильтры сохраняются и проверяются).
        *   **Обычная очередь:** `curl`, `wget +d=trixie`, `vim +env=development`.

**Пример 2: Совпадение по regex-шаблону**

*   **`packages.list`:**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list`:**

    ```text
^linux-.*
^firmware-.*
```

*   **Анализ:**

    1.  Шаблон `^linux-.*` совпадает с `linux-image-6.1.0-amd64` и `linux-headers-6.1.0-amd64`.
    2.  Шаблон `^firmware-.*` совпадает с `firmware-linux`.
    3.  **Итоговый план:**

        *   **Приоритетная очередь:** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **Обычная очередь:** `build-essential`, `nginx +st=server`.

## Режимы работы и отладка

#### Режим симуляции (`-s`)

Позволяет увидеть, какие пакеты будут установлены, без фактической установки:

```bash
./condinapt -l packages.list -c system.conf -s
```

**Пример вывода:**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Примечание:** В режиме симуляции скрипт завершает работу с кодом выхода 1.

#### Режим проверки (`-C`)

Проверяет, какие пакеты из списка уже установлены в системе:

```bash
./condinapt -l packages.list -c system.conf -C
```

**Поведение:**
- Показывает ошибки для неустановленных пакетов
- Возвращает код выхода 1, если есть неустановленные пакеты
- В конце выводит команду для установки отсутствующих пакетов

#### Режимы отладки

**Подробный вывод (`-v`):**
- Показывает подробную информацию о проверках фильтров
- Отображает результаты для каждого пакета

**Очень подробный вывод (`-vv`):**
- Максимальная детализация процесса
- Показывает все промежуточные этапы

**Трассировка команд (`-x`):**
- Включает `set -x` для отладки скрипта
- Показывает выполнение каждой команды

**Пример с отладкой:**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Принудительное обновление кэша (`-f`)

Принудительно запускает `apt update` перед установкой CondinAPT:

```bash
./condinapt -l packages.list -c system.conf -f
```

## Расширенные возможности

### Поддержка массивов в конфигурации

CondinAPT может работать с массивами переменных в конфигурационном файле:

**`system.conf`:**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map`:**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list`:**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Специальные пакеты

CondinAPT поддерживает особые пакеты, требующие специальной обработки:

**Виртуальные пакеты:**
- `qemu-kvm` — обрабатывается как виртуальный пакет

**Механизм обработки:**
1. CondinAPT проверяет, является ли пакет виртуальным с помощью команды `apt-cache show`
2. Если пакет помечен как "чисто виртуальный", он считается доступным для установки
3. Список специальных пакетов задаётся в массиве `SPECIAL_PACKAGES` внутри скрипта:
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Расширение списка:** Чтобы добавить новые специальные пакеты, необходимо отредактировать массив `SPECIAL_PACKAGES` в коде CondinAPT.

## Обработка ошибок и восстановление

### Обязательные пакеты (`!`)

Если пакет помечен как обязательный, но не найден в репозиториях, CondinAPT:
1. Выводит сообщение об ошибке
2. Прерывает выполнение (кроме режима симуляции)
3. Возвращает код выхода 1

**Пример:**
```text
!essential-package +pv=standard
```

Если `essential-package` не найден в репозиториях, выполнение будет прервано.

### Обработка недоступных версий

**Гибкие версии (`=`):**
- Если точная версия недоступна, устанавливается любая доступная версия
- Выдается предупреждение о недоступности запрошенной версии

**Строгие версии (`==`):**
- Если точная версия недоступна, пакет пропускается
- Если пакет обязательный (`!`), выполнение прерывается

### Удержание версий (`apt-mark hold`)

CondinAPT автоматически удерживает версии пакетов в следующих случаях:
- Когда была установлена именно запрошенная версия
- Для пакетов с `==VERSION`, если версия найдена и установлена
- Для пакетов с `=VERSION`, если найдена и установлена именно эта версия

## Интеграция со сборочными системами

### Использование в автоматизированных скриптах

CondinAPT легко интегрируется в сборочные системы и автоматизированные скрипты. Подробнее о синтаксисе файла пакетов смотрите в разделе [Синтаксис файла списка пакетов](#package-list-file-syntax).

### Общий пример интеграции:

**В автоматизированном скрипте (`install.sh`):**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Примеры универсальной конфигурации

**Пример файла сопоставления фильтров (`filters.map`):**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Пример конфигурации (`system.conf`):**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Примеры реальных сценариев

### Пример 1: Мультимедийный сервер

**`packages.list`:**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Пример 2: Веб-сервер с различными конфигурациями

**`packages.list`:**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Пример 3: Платформа контейнеризации

**`packages.list`:**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Пример 4: Расширенное использование фильтров

**`packages.list`:**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Советы по оптимизации

### Организация списков пакетов

1. **Группировка по функциональности:**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Использование очередей для зависимостей:**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Оптимизация условий:**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Производительность

- Используйте приоритетные очереди для критически важных пакетов
- Минимизируйте количество очередей
- Группируйте связанные пакеты в одну очередь
- Используйте кеширование APT для крупных сборок

## Поиск и устранение неисправностей

### Частые проблемы

**Проблема:** Пакет не устанавливается, несмотря на корректные условия
**Решение:** Проверьте с флагом `-vv` для подробной информации о фильтрах

**Проблема:** CondinAPT завершает работу из-за обязательного пакета
**Решение:** Проверьте наличие пакета в репозиториях или используйте резервный вариант. См. раздел [Обработка ошибок и восстановление](#error-handling-and-recovery)

**Проблема:** Неожиданное поведение с версиями пакетов
**Решение:** Используйте [режим симуляции](#operating-modes-and-debugging) (`-s`) для проверки

### Отладка фильтров

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Проверка доступности пакетов

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
