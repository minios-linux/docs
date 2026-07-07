# Управление сессиями в MiniOS 🔄

## 🤔 Что такое сессии?

Сессии MiniOS обеспечивают постоянное хранение ваших изменений, позволяя вам:

- **Сохранять изменения**, сделанные во время живой сессии
- **Возобновлять работу** с того места, где вы остановились после перезагрузки
- **Управлять несколькими** отдельными рабочими средами
- **Переключаться между** разными конфигурациями

Сессии используют технологию **Union Filesystem** (AUFS или OverlayFS) для наложения изменений поверх базовой системы только для чтения.

---

## 📋 Типы и режимы сессий

### **Действия с сессиями**

- **`resume`** — Продолжить с последней использованной сессии (по умолчанию)
- **`new`** — Создать новую сессию
- **`ask`** — Интерактивный выбор сессии при загрузке
- **`fresh`** — Без сохранения (временная сессия)

### **Режимы хранения**

- **`native`** — Прямое хранение на файловой системе (требуется POSIX ФС: ext4, btrfs, xfs)
- **`dynfilefs`** — Расширяемые контейнерные файлы (работает на любой ФС, рекомендуется для FAT32/NTFS/exFAT)
- **`raw`** — Файлы-образы фиксированного размера (работает на любой ФС)

---

## 🚀 Параметры загрузки для управления сессиями

### **Основные параметры сессии**

| Параметр | Значения | Описание |
|-----------|--------|-------------|
| `perch` | - | Включить сохранение изменений |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Действие сессии или директория |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Режим хранения |
| `perchsize` | `<size_in_MB>` | Начальный размер для контейнерных/образных режимов |

### **Структура директорий сессии**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Интеграция с загрузчиком

### **Конфигурация GRUB**

MiniOS предоставляет готовые записи меню GRUB для разных режимов сессий:

```bash
# Resume previous session
linux /minios/boot/vmlinuz... perchdir=resume

# Start new session  
linux /minios/boot/vmlinuz... perchdir=new

# Interactive session selection
linux /minios/boot/vmlinuz... perchdir=ask

# Fresh start (no persistence)
linux /minios/boot/vmlinuz... 
```

### **Конфигурация SYSLINUX**

Соответствующие записи SYSLINUX:

```bash
LABEL default
MENU LABEL Run MiniOS (Resume previous session)
APPEND ... perchdir=resume

LABEL perch
MENU LABEL Run MiniOS (Start a new session)  
APPEND ... perchdir=new

LABEL asksession
MENU LABEL Run MiniOS (Choose session during startup)
APPEND ... perchdir=ask

LABEL live
MENU LABEL Run MiniOS (Fresh start)
APPEND ...
```

---

## 🔧 Команды управления сессиями

### **Использование MiniOS Session Manager (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Возможности:**
- Просмотр всех доступных сессий с метаданными
- Создание новых сессий с разными режимами
- Активация/переключение сессий
- Удаление старых сессий
- Очистка сессий старше указанного количества дней

### **Использование minios-session (CLI)**

⚠️ **Требуются права администратора:**

Для работы CLI-инструмента необходимы root-права, которые будут проверены автоматически. Запускайте команды с помощью `sudo` или через `pkexec`:

```bash
sudo minios-session list
# or
pkexec minios-session activate 3
```

#### **Базовые команды:**

```bash
# List all sessions
sudo minios-session list

# Show currently active session (will boot next)
sudo minios-session active

# Show currently running session (current boot)
sudo minios-session running

# Check filesystem compatibility and session directory status
sudo minios-session info
sudo minios-session status

# Create new sessions (using positional arguments)
sudo minios-session create native
sudo minios-session create dynfilefs 2000
sudo minios-session create raw 2000

# Activate specific session
sudo minios-session activate 3

# Delete session
sudo minios-session delete 2

# Resize session (dynfilefs/raw modes only)
sudo minios-session resize 1 8000

# Export session to archive
sudo minios-session export 1 /path/to/backup.tar.zst

# Import session from archive
sudo minios-session import /path/to/backup.tar.zst
sudo minios-session import /path/to/backup.tar.zst dynfilefs  # with mode conversion

# Copy session with optional mode conversion
sudo minios-session copy 1 2              # copy keeping same mode
sudo minios-session copy 1 3 raw          # copy and convert to raw mode
sudo minios-session copy 1 4 native 3000  # copy, convert to native, set size

# Cleanup old sessions (older than 30 days)
sudo minios-session cleanup --days 30
```

#### **Расширенные опции:**

```bash
# JSON output for automation (available for all commands)
sudo minios-session --json list
sudo minios-session --json info
sudo minios-session --json active
sudo minios-session --json running
sudo minios-session --json status
sudo minios-session --json create native
sudo minios-session --json activate 2
sudo minios-session --json delete 3
sudo minios-session --json cleanup --days 30
sudo minios-session --json resize 1 8000
sudo minios-session --json export 1 backup.tar.zst
sudo minios-session --json import backup.tar.zst
sudo minios-session --json copy 1 2 native

# Custom sessions directory
sudo minios-session --sessions-dir /custom/path list
sudo minios-session --sessions-dir /mnt/usb/sessions create native
```

#### **Ключевые различия команд:**

- `active` — Показывает сессию, которая будет использована при следующей загрузке
- `running` — Показывает текущую активную сессию (если есть)
- `resize` — Изменить размер сессии (только для dynfilefs/raw)
- `export` — Экспортировать сессию в архив .tar.zst для резервного копирования
- `import` — Импортировать сессию из архива с возможной конвертацией режима
- `copy` — Копировать сессию с возможной конвертацией режима
- `info` — Проверить совместимость файловой системы и рекомендации

---

## 📦 Резервное копирование и миграция сессий

### **Экспорт сессий**

Экспортируйте сессии в сжатые архивы для резервного копирования или переноса:

```bash
# Export session to archive
sudo minios-session export 1 /backup/session1.tar.zst

# Export with JSON output
sudo minios-session --json export 2 /backup/session2.tar.zst
```

**Возможности:**
- Создает сжатый архив .tar.zst
- Сохраняет все данные и метаданные сессии
- Может быть импортирован на любой системе MiniOS
- Автоматическое сжатие для экономии места

### **Импорт сессий**

Импортируйте сессии из архивов с возможной конвертацией режима:

```bash
# Import session keeping original mode
sudo minios-session import /backup/session1.tar.zst

# Import and convert to different mode
sudo minios-session import /backup/session1.tar.zst dynfilefs
sudo minios-session import /backup/session2.tar.zst raw
sudo minios-session import /backup/session3.tar.zst native

# Import with JSON output
sudo minios-session --json import /backup/session.tar.zst
```

**Возможности:**
- Восстанавливает данные сессии из архива
- Автоматически конвертирует между режимами хранения, если указано
- Пропускает существующие файлы для предотвращения потери данных
- Автоматически создает новый номер сессии

### **Копирование и конвертация сессий**

Копируйте сессии между разными режимами хранения:

```bash
# Copy session keeping same mode
sudo minios-session copy 1 2

# Copy and convert to different mode
sudo minios-session copy 1 3 raw           # convert to raw mode
sudo minios-session copy 1 4 dynfilefs     # convert to dynfilefs
sudo minios-session copy 1 5 native        # convert to native

# Copy with custom size (for raw/dynfilefs)
sudo minios-session copy 1 6 raw 4000      # 4GB raw image
sudo minios-session copy 2 7 dynfilefs 2000 # 2GB dynfilefs
```

**Поддерживаемые конвертации:**
- native ⇄ dynfilefs ⇄ raw
- Все комбинации режимов поддерживаются
- Автоматическое управление размером
- Сохраняет данные сессии при конвертации

**Примеры использования:**
- Миграция с FAT32 на ext4 (dynfilefs → native)
- Создание переносимых сессий (native → dynfilefs/raw)
- Оптимизация под разные файловые системы
- Создание резервных копий сессий в разных режимах

---

## 🏗️ Подробно о режимах хранения сессий

### **Native Mode**

**Лучше всего подходит для:** Систем на POSIX-файловых системах (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Характеристики:**
- Прямой доступ к файловой системе без контейнера
- Полная поддержка POSIX (жесткие ссылки, права доступа, расширенные атрибуты)
- Лучшая производительность среди всех режимов
- **Требования:** Совместимая с POSIX файловая система (ext4, btrfs, xfs)
- **Не совместим:** FAT32, NTFS, exFAT

### **DynFileFS Mode**

**Лучше всего подходит для:** Не-POSIX файловых систем (FAT32, NTFS, exFAT)

```bash
# Enable dynfilefs mode with initial size
perchmode=dynfilefs perchsize=2000
```

**Характеристики:**
- Расширяемый контейнер с файловой системой ext4 внутри
- Автоматически увеличивается по мере необходимости до доступного пространства
- Работает на любой файловой системе
- Незначительное снижение производительности по сравнению с native
- **Размер по умолчанию:** 1000MB, увеличивается динамически
- **Рекомендуется для:** файловых систем FAT32, NTFS, exFAT

### **Raw Mode**

**Лучше всего подходит для:** Фиксированного размера на любой файловой системе

```bash
# Enable raw mode with fixed size
perchmode=raw perchsize=2000
```

**Характеристики:**
- Образ фиксированного размера с файловой системой ext4 внутри
- Предсказуемое и постоянное использование диска
- Работает на любой файловой системе
- Размер задается при создании
- **Размер по умолчанию:** 1000MB, если не указан
- **Применение:** Переносимые сессии, квоты на хранение, предсказуемое выделение места

---

## 🗂️ Метаданные сессии и совместимость

### **Форматы метаданных сессии**

**Формат по умолчанию (session.conf):**
```bash
default=2
session_mode[1]=native
session_version[1]=5.0.0
session_edition[1]=standard
session_union[1]=overlayfs
session_mode[2]=dynfilefs
session_version[2]=5.0.0
session_edition[2]=standard
session_union[2]=overlayfs
```

**Формат JSON (если доступен jq):**
```json
{
  "default": "2",
  "sessions": {
    "1": {
      "mode": "native",
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    },
    "2": {
      "mode": "dynfilefs", 
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    }
  }
}
```

> **Примечание:** MiniOS автоматически определяет, доступен ли `jq`, и использует формат JSON, если возможно, иначе возвращается к традиционному формату conf.

### **Проверка совместимости**

MiniOS автоматически проверяет совместимость сессий:

- **Несовпадение версии** — создается новая сессия, если версия MiniOS отличается
- **Несовпадение редакции** — создается новая сессия, если редакция отличается (standard/toolbox/ultra)
- **Несовпадение Union FS** — создается новая сессия, если отличается файловая система объединения (aufs/overlayfs)
- **Смена режима** — создается новая сессия при изменении режима хранения

### **Система предупреждений**

При выборе несовместимых сессий MiniOS отображает предупреждения:
- Предупреждения о несовместимости версий
- Уведомления о различии редакций
- Проблемы совместимости с union filesystem
- Возможность продолжить на свой страх и риск

---

## 🎯 Расширенная настройка сессий

### **Пользовательские расположения сессий**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Управление размером сессии**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4095MB (4GB limit)
# - Others: Limited by available space
```

### **Автоматическое управление сессиями**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Устранение неполадок сессий

### **Распространённые проблемы**

#### **Сессия не найдена**

```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Проблемы с правами доступа**

```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Сбои в режиме хранения**

```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
sudo minios-session status
sudo minios-session info  # Show filesystem compatibility
```

### **Восстановление сессии**

```bash
# List all sessions and their status
sudo minios-session list

# Check session integrity and filesystem info
sudo minios-session status
sudo minios-session info

# Show active vs running session status
sudo minios-session active
sudo minios-session running

# Create new session if corrupted
sudo minios-session create native
```

### **Очистка сессий**

```bash
# Remove sessions older than 30 days
sudo minios-session cleanup --days 30

# Delete specific session (safe method)
sudo minios-session delete 3

# Manual session removal (advanced users only)
sudo rm -rf /minios/changes/session_number/
```

---

## 📊 Лучшие практики работы с сессиями

### **Выбор режимов хранения**

- **Нативный режим:** используйте, если MiniOS находится на POSIX-файловой системе (ext4, btrfs, xfs) — максимальная производительность
- **DynFileFS режим:** подходит для файловых систем FAT32, NTFS, exFAT — автоматическое управление пространством
- **Raw режим:** используйте, если нужен фиксированный размер на любой файловой системе — предсказуемое использование диска

### **Планирование размера**

- **Малые сессии:** 1–2 ГБ для базовых изменений конфигурации
- **Разработка:** 4–8 ГБ для рабочих сред разработки
- **Высокая нагрузка:** 8 ГБ и более для установки большого количества ПО

### **Управление сессиями**

- Регулярно очищайте устаревшие сессии
- Используйте описательные имена сессий при ручном управлении
- Контролируйте использование дискового пространства
- Держите хотя бы одну проверенную сессию для восстановления

### **Оптимизация производительности**

- По возможности используйте нативный режим для максимальной производительности
- Размещайте хранилище сессий на быстрых устройствах
- Рассмотрите использование SSD для часто используемых сессий

---
