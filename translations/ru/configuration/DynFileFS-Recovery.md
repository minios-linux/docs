# Восстановление DynFileFS и dynblk-хранилища

DynFileFS и `dynblk` предоставляют динамически выделяемый образ блока `virtual.dat`,
данные которого хранятся в наборе файлов `changes.dat`. MiniOS форматирует
`virtual.dat` в ext4 и использует его для сохранения постоянных изменений. `dynblk` —
это поддерживаемая реализация того же формата хранения; MiniOS сохраняет
название режима постоянства `dynfilefs` и команду совместимости `@mount.dynfilefs`, где это требуется.

В этом руководстве рассматриваются проверка, миграция, восстановление файловой системы,
восстановление сессии и извлечение файлов. Оно применяется после некорректного завершения работы,
переполнения устройства хранения, прерванного копирования или сбоя метаданных сессии.

Типичные симптомы:

- MiniOS создает новую сессию с номером при каждом запуске.
- `resume` не загружает предыдущий рабочий стол и файлы.
- Выбор старой сессии в загрузочном меню не дает результата.
- Каталоги сессий по-прежнему содержат файлы `changes.dat`, но не активируются.

Причиной может быть неполный сегмент хранилища, поврежденные метаданные контейнера,
«грязная» файловая система ext4 внутри `virtual.dat` или некорректный `session.conf`.

## Правила безопасности

1. Не выполняйте восстановление на единственной копии контейнера хранения.
2. Не копируйте исходные сессии поверх активного `minios/changes`.
3. Сделайте полную копию директории `changes` перед попыткой восстановления.
4. Запускайте `e2fsck -y` только на дополнительной копии сессии.
5. Не создавайте отсутствующий файл `changes.dat.N` вручную.

Если MiniOS сейчас работает с постоянством и исходное устройство смонтировано,
можно безопасно сделать исходную копию. Не заменяйте `session.conf`, пока MiniOS не будет загружен без постоянства.

## 1. Найдите источник и место для восстановления

Посмотрите файловые системы и точки монтирования:

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Задайте путь к исходному каталогу `changes` и отдельному recovery-каталогу на
диске с достаточным свободным местом:

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Убедитесь, что на целевом диске достаточно места:

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Скопируйте все файлы сессий

Если установлен `rsync`:

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

Альтернативный вариант:

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

Нельзя копировать только основной `changes.dat`. Сессия DynFileFS обычно
содержит полную последовательность:

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

Все сегменты являются частями одного контейнера.

## 3. Найдите подходящую сессию

Сравните размеры и даты изменения:

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Пустые или неудачно созданные сессии обычно имеют небольшой размер. Сессия с
реальными сохранёнными данными, как правило, занимает заметно больше места.

Проверьте сохранённые метаданные:

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

MiniOS использует `session.conf` для выбора и описания сессий сохранения.

## 4. Подключите контейнер DynFileFS или dynblk

Найдите доступный помощник. В зависимости от образа MiniOS каноническим именем
может быть `dynblk` или совместимая команда `@mount.dynfilefs`:

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Выберите сессию для проверки, например сессию 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Не указывайте `-s` или `perchsize` при восстановлении существующего
контейнера. Его виртуальный размер хранится в метаданных DynFileFS/dynblk.

При успешном подключении появится `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Проверьте ext4 без внесения изменений:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Подключите её только для чтения:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Если старые файлы видны, сессию можно восстановить.

Отключайте файловые системы в обратном порядке:

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Исправьте внутреннюю ext4

Если контейнер подключается, но `e2fsck -n` сообщает об ошибках ext4, сначала
сделайте ещё одну копию сессии:

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Подключите и исправьте только эту копию:

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

После исправления повторите проверку с подключением только для чтения.

## 6. Верните сессию в загрузку MiniOS

Выполняйте этот этап после завершения активной сессии и загрузки MiniOS без
параметров `perch`, `perchdir` и `perchmode`. Также можно использовать другую
Linux-систему.

Скопируйте восстановленный контейнер в свободный числовой каталог сессии.
Новый номер позволит не перезаписывать существующие данные:

```bash
NEW_CHANGES="$TARGET_MINIOS/changes"
RESTORED=90

test ! -e "$NEW_CHANGES/$RESTORED"
mkdir -p "$NEW_CHANGES/$RESTORED"
cp -a "$REPAIR/." "$NEW_CHANGES/$RESTORED/"
```

Если исправление ext4 не требовалось, копируйте из `$RECOVERY/$SESSION`, а не
из `$REPAIR`.

Сохраните старые метаданные и создайте минимальный `session.conf`:

```bash
cp -a "$NEW_CHANGES/session.conf" \
    "$NEW_CHANGES/session.conf.before-recovery" 2>/dev/null || true

printf '%s\n' \
    "default=$RESTORED" \
    "session_mode[$RESTORED]=dynfilefs" \
    >"$NEW_CHANGES/session.conf"
sync
```

Поля версии, редакции и union намеренно не указаны: устаревшие сведения о
совместимости не заставят MiniOS создать очередную новую сессию.

Загрузите MiniOS с параметрами:

```text
perchdir=resume perchmode=dynfilefs
```

При первой восстановительной загрузке не добавляйте `perchdir=new` или
`perchsize`.

## 7. Извлеките файлы без загрузки сессии

Если контейнер подключается вручную, но не подходит для загрузки, перенесите
важные файлы из read-only mount в новую рабочую сессию:

```bash
mkdir -p "$TARGET_MINIOS/recovered-home"
rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    "$TARGET_MINIOS/recovered-home/"
sync
```

## Типичные ошибки

- `cannot open ... changes.dat.N` — отсутствует записанный сегмент. Повторно
  скопируйте его с исходного диска или попробуйте другую сессию. Не создавайте
  пустой сегмент.
- `cannot read header` — повреждён заголовок DynFileFS/dynblk.
- `incompatible data format` — версии помощника и формата контейнера не
  совпадают.
- `virtual.dat` существует, но ext4 не подключается — проверьте копию через
  `e2fsck`.
- Контейнер подключается, но MiniOS создаёт новую сессию — проверьте, что
  `session.conf` указывает восстановленный номер и содержит
  `session_mode[N]=dynfilefs`.

## Предотвращение повторения

Большинство сбоев начинается с заполнения диска с сессиями во время работы.
Снизить риск помогают следующие меры:

- Сохраняйте резерв свободного места параметром загрузки `perchreserve` (по
  умолчанию 256 МБ). Новые и растущие контейнеры не занимают его, а при снижении
  свободного места до резерва MiniOS предупреждает на старте. Увеличьте его на
  небольших или активно используемых дисках, например `perchreserve=1024`.
- Удаляйте старые и неиспользуемые сессии до заполнения диска.
- Если нужен предсказуемый расход места, используйте сессию `raw` фиксированного
  размера, чтобы рост не исчерпал диск неожиданно.
- Завершайте работу корректно. Внезапное отключение питания при полном диске —
  самая частая причина контейнера, который затем не удаётся подключить.
