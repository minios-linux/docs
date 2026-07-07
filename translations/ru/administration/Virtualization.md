# Руководство по виртуализации MiniOS

В этом руководстве описывается запуск MiniOS в виртуальных машинах, оптимизация производительности и использование MiniOS в качестве хоста виртуализации. MiniOS основан на Debian 13 "Trixie" и включает встроенные драйверы виртуализации и гостевые утилиты для максимальной производительности.

## Особенности виртуализации в MiniOS

MiniOS включает встроенную поддержку обнаружения виртуализации и автоматической настройки разрешения экрана. В системе есть скрипт `minios-virtreschange`, который автоматически определяет виртуальные среды (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) и настраивает разрешение экрана соответствующим образом.

**Автоматическое управление разрешением:**
- **Параметр ядра:** `virtres=ШИРИНAxВЫСОТА` (например, `virtres=1920x1080`)
- **Отключить автонастройку:** параметр ядра `novirtres`
- **Разрешение по умолчанию:** 1280x800 (если параметр virtres не указан)
- **Обнаружение:** Автоматически определяет виртуальные среды и настраивает разрешение

## Запуск MiniOS в качестве гостевой системы

### Общая конфигурация виртуальной машины

**Рекомендуемые параметры (для всех платформ):**
- **Оперативная память:** минимум 2 ГБ, рекомендуется 4 ГБ (Standard edition: минимум 1 ГБ)
- **Процессоры:** минимум 2 ядра
- **Хранилище:** минимум 4 ГБ (рекомендуется 8 ГБ для сохранения данных)
- **Тип ОС:** Linux 64-bit / Other Linux 64-bit

**Выбор контроллера диска:**
- **VMware:** используйте SCSI-контроллер для лучшей производительности
- **VirtualBox:** используйте SATA-контроллер с AHCI
- **QEMU/KVM:** используйте VirtIO-устройства хранения
- **Hyper-V:** используйте SCSI-контроллер

**Выбор сетевого адаптера:**
- **VMware:** используйте VMXNET3 для лучшей производительности
- **VirtualBox:** используйте Intel PRO/1000 MT Desktop
- **QEMU/KVM:** используйте VirtIO-сетевой интерфейс
- **Hyper-V:** используйте синтетический сетевой адаптер

### Установка гостевых утилит

**VMware (VMware Workstation/Player):**
В редакциях MiniOS Toolbox и Ultra пакет `open-vm-tools` предустановлен. Для Standard edition:
```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop
```

**VirtualBox:**
```bash
# Insert Guest Additions CD and install
sudo mount /dev/cdrom /mnt
sudo /mnt/VBoxLinuxAdditions.run
sudo reboot
```

**QEMU/KVM:**
В редакциях MiniOS Toolbox и Ultra пакет `qemu-guest-agent` предустановлен. Для Standard edition:
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V:**
Интеграционные компоненты предустановлены в MiniOS. Для расширенных возможностей:
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## Использование MiniOS в качестве хоста виртуализации

MiniOS поддерживает запуск контейнеров и виртуальных машин в редакциях Toolbox и Ultra. В Ultra edition доступна полноценная поддержка Docker и KVM/QEMU, а в Toolbox включены только инструменты виртуализации.

### Поддержка Docker

**Ultra edition:** Docker предустановлен, включая lazydocker — графический интерфейс для управления Docker

**Другие редакции:** Docker можно установить вручную:
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Поддержка KVM/QEMU

**Редакции Toolbox и Ultra:** Инструменты KVM предустановлены, включая virt-manager — графический интерфейс для управления виртуальными машинами

**Другие редакции:** Инструменты виртуализации можно установить вручную:
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### Поддержка VirtualBox

VirtualBox не входит в официальные репозитории Debian 13, но может быть установлен из официальных пакетов Oracle:

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Пользователи автоматически добавляются в группу `vboxusers` для доступа к функциям VirtualBox.
