# Пересборка ISO

В этом руководстве объясняется, как пересобрать и настроить ISO-образы MiniOS с помощью встроенных инструментов. Независимо от того, хотите ли вы создать облегчённые версии, добавить собственное ПО или распространять кастомизированные системы, эти инструменты позволяют легко упаковать вашу live-систему в новый загрузочный ISO.

## Обзор

MiniOS предоставляет мощные инструменты для пересборки ISO-образов прямо из работающей live-системы. Это позволяет вам:

- **Удалять ненужное ПО** для создания более лёгких дистрибутивов
- **Добавлять собственные модули** с дополнительным ПО
- **Создавать специализированные версии** для конкретных задач
- **Распространять кастомизированные системы** другим пользователям
- **Создавать установочные носители** с вашей текущей конфигурацией

## Быстрый старт

Самый простой способ создать ISO из вашей текущей системы:

```bash
sudo sb2iso
```

В результате в текущей папке появится файл `minios-YYYYMMDD_HHMM.iso` со всеми загруженными модулями.

## Основной инструмент: sb2iso

**sb2iso** — это основной инструмент для пересборки ISO-образов. Он считывает вашу текущую live-систему и упаковывает её в загрузочный ISO-файл.

### Базовое использование

```bash
# Create ISO with default name
sudo sb2iso

# Create ISO with custom name
sudo sb2iso --name my_custom_minios.iso

# Create ISO excluding specific modules
sudo sb2iso --exclude 'firefox|libreoffice' --name minios_lite.iso

# Add extra modules to the ISO
sudo sb2iso extra_module.sb development_tools.sb --name minios_extended.iso
```

### Параметры командной строки

| Параметр | Описание | Пример |
|----------|----------|--------|
| `-e, --exclude REGEX` | Исключить файлы/модули по шаблону | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Задать имя выходного файла | `--name minios_custom.iso` |
| `--menu TYPE` | Установить язык или тип меню | `--menu ru_RU` или `--menu multilang` |
| `--help` | Показать справку | `--help` |
| `--version` | Показать версию | `--version` |

### Поддерживаемые типы меню

- **multilang** (по умолчанию) — многоязычное меню с выбором языка
- **Коды языков** — меню на одном языке: `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Практические примеры

### Создание облегчённых версий

**Удалить тяжёлые приложения:**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Создать систему только с текстовым интерфейсом:**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Удалить мультимедийные приложения:**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Добавление собственного ПО

**Добавить инструменты для разработки:**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Добавить игровые приложения:**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### Локализованные ISO

**Создать ISO с русской локализацией:**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Создать немецкий ISO:**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Профессиональные/образовательные дистрибутивы

**Образовательный ISO с обучающими программами:**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**Бизнес-ISO:**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Расширенный сценарий кастомизации

### 1. Подготовьте систему

Начните с чистой системы MiniOS и настройте её:

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Создайте собственные модули

Сохраните ваши изменения в виде модулей:

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Проверьте ваши модули

Перед созданием финального ISO протестируйте модули:

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Создайте финальный ISO

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Работа с модулями

### Понимание номеров модулей

Модули загружаются в числовом порядке:
- **00-core** — базовая система (всегда включена)
- **01-kernel** — ядро и драйверы
- **02-firmware** — прошивки оборудования
- **03-gui-base** — базовые компоненты графики
- **04-desktop** — графическая среда
- **05-apps** — приложения
- **06+** — дополнительные модули

### Команды управления модулями

```bash
# List active modules
sudo sb list

# Examine module contents
sudo sb2dir module.sb
ls module.sb/
sudo rmsbdir module.sb

# Convert directory to module
sudo dir2sb my_directory/ my_module.sb

# Save current system changes
sudo savechanges my_changes.sb
```

## Исключение содержимого по шаблону

Параметр `--exclude` использует регулярные выражения для поиска путей файлов. Примеры шаблонов:

### Исключения приложений

```bash
# Web browsers
--exclude 'firefox|chromium|browser'

# Office suites
--exclude 'libreoffice|office'

# Multimedia
--exclude 'vlc|media|audio|video'

# Games
--exclude 'games|play'

# Development tools
--exclude 'gcc|development|ide'
```

### Исключения системных компонентов

```bash
# GUI components
--exclude 'desktop|xorg|gui'

# Firmware
--exclude 'firmware'

# Documentation
--exclude 'doc|man|help'

# Language packs
--exclude 'locale|lang'
```

### Комбинированные исключения

```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## Системные требования

### Запуск sb2iso

- **Система**: Должна быть запущена из live-системы MiniOS
- **Привилегии**: Требуются права root (`sudo`)
- **Память**: Достаточно RAM для временных файлов
- **Хранилище**: Свободное место для выходного ISO (обычно 1–4 ГБ)

### Требование к загрузочным файлам

Для работы **sb2iso** необходимы доступные загрузочные файлы. Если система загружена в RAM, используйте:

```bash
# Boot with full RAM copy
toram=full
```

Или убедитесь, что загрузочные файлы доступны на исходном носителе.

## Устранение неполадок

### Частые проблемы

**"Не удаётся найти исходный каталог MiniOS"**
- Убедитесь, что вы работаете в live-системе MiniOS
- Проверьте наличие загрузочных файлов
- Попробуйте использовать параметр загрузки `toram=full`

**"Требуемый файл не найден"**
- Загрузочные файлы могут отсутствовать
- Убедитесь, что используете полный дистрибутив MiniOS

**Ошибка создания ISO**
- Проверьте доступное место на диске
- Убедитесь, что у вас есть права на запись
- Проверьте, что файлы не используются во время создания

**Модуль не включён**
- Проверьте, что файл модуля существует и доступен для чтения
- Убедитесь в правильном формате модуля (.sb файлы)
- Проверьте, достаточно ли места для всех модулей

### Отладочная информация

Включите подробный вывод для диагностики:

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Рекомендации

### Планирование ISO

1. **Начинайте с чистой системы**: используйте свежий MiniOS
2. **Тщательно тестируйте**: проверьте все изменения перед созданием ISO
3. **Документируйте изменения**: фиксируйте все внесённые правки
4. **Следите за размером**: учитывайте размер ISO для распространения

### Организация модулей

1. **Логическая группировка**: объединяйте связанное ПО в модули
2. **Корректная нумерация**: используйте правильные номера модулей
3. **Тестирование**: проверяйте каждый модуль отдельно
4. **Зависимости**: учитывайте зависимости между модулями

### Подготовка к распространению

1. **Именование**: используйте описательные имена ISO
2. **Документация**: добавьте инструкции по использованию
3. **Языковая поддержка**: учитывайте международных пользователей
4. **Оптимизация размера**: удаляйте ненужные компоненты

## Интеграция с другими инструментами

### Создание собственных модулей

Перед пересборкой ISO вы можете создать собственные модули:

- **apt2sb** — создание модулей из установленных пакетов
- **script2sb** — создание модулей с помощью скриптов
- **chroot2sb** — создание модулей в интерактивном режиме
- **savechanges** — сохранение изменений системы

Подробную инструкцию смотрите в руководстве [Создание модулей](/development/Creating-Modules.md).

### Сборка из исходников

Для полной кастомизации рассмотрите сборку из исходников:

- **minios-live** — сборка системы с нуля
- **minios-cmd** — упрощённый интерфейс сборки

Подробнее смотрите в руководстве [Сборка MiniOS](/development/Building-MiniOS.md).

## Заключение

Инструменты для пересборки ISO в MiniOS предоставляют мощные возможности для кастомизации и распространения Linux-систем. Независимо от того, создаёте ли вы специализированные дистрибутивы, удаляете ненужное ПО или добавляете собственные функции, эти инструменты позволяют просто упаковать вашу live-систему в профессиональный ISO-образ.

Начните с простых изменений и постепенно переходите к более сложным дистрибутивам по мере освоения системы модулей и доступных опций.
