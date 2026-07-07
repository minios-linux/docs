# Gerenciamento de Sessões no MiniOS 🔄

## 🤔 O que são Sessões?

As sessões do MiniOS oferecem armazenamento persistente para suas alterações, permitindo que você:

- **Salve alterações** feitas durante uma sessão ao vivo
- **Retome o trabalho** de onde parou após reiniciar
- **Gerencie múltiplos** ambientes de trabalho separados
- **Alterne entre** diferentes configurações

As sessões utilizam a tecnologia de **Sistema de Arquivos Union** (AUFS ou OverlayFS) para sobrepor alterações ao sistema base somente leitura.

---

## 📋 Tipos e Modos de Sessão

### **Ações de Sessão**

- **`resume`** - Continua a partir da última sessão utilizada (padrão)
- **`new`** - Cria uma nova sessão
- **`ask`** - Seleção interativa de sessão durante a inicialização
- **`fresh`** - Sem persistência (sessão temporária)

### **Modos de Armazenamento**

- **`native`** - Armazenamento direto no sistema de arquivos (requer sistema de arquivos POSIX: ext4, btrfs, xfs)
- **`dynfilefs`** - Arquivos contêiner expansíveis (funciona em qualquer sistema de arquivos, recomendado para FAT32/NTFS/exFAT)
- **`raw`** - Arquivos de imagem de tamanho fixo (funciona em qualquer sistema de arquivos)

---

## 🚀 Parâmetros de Inicialização para Controle de Sessão

### **Parâmetros Principais de Sessão**

| Parâmetro | Valores | Descrição |
|-----------|--------|-------------|
| `perch` | - | Habilita alterações persistentes |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Ação da sessão ou diretório |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Modo de armazenamento |
| `perchsize` | `<size_in_MB>` | Tamanho inicial para modos contêiner/imagem |

### **Estrutura de Diretórios da Sessão**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Integração com Bootloader

### **Configuração do GRUB**

O MiniOS fornece entradas de menu GRUB pré-configuradas para diferentes modos de sessão:

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

### **Configuração do SYSLINUX**

Entradas correspondentes para SYSLINUX:

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

## 🔧 Comandos de Gerenciamento de Sessão

### **Usando o Gerenciador de Sessões do MiniOS (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Recursos:**
- Visualizar todas as sessões disponíveis com metadados
- Criar novas sessões com diferentes modos
- Ativar/trocar sessões
- Excluir sessões antigas
- Limpar sessões com mais de X dias

### **Usando minios-session (CLI)**

⚠️ **Privilégios Administrativos Necessários:**

A ferramenta CLI requer privilégios de root e fará a verificação automaticamente. Execute os comandos com `sudo` ou através do `pkexec`:

```bash
sudo minios-session list
# or
pkexec minios-session activate 3
```

#### **Comandos Básicos:**

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

#### **Opções Avançadas:**

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

#### **Principais Diferenças dos Comandos:**

- `active` - Mostra a sessão que será usada no próximo boot
- `running` - Mostra a sessão atualmente em uso (se houver)
- `resize` - Altera o tamanho da sessão (somente para modos dynfilefs/raw)
- `export` - Exporta a sessão para um arquivo .tar.zst para backup
- `import` - Importa sessão de um arquivo com conversão de modo opcional
- `copy` - Copia sessão com conversão de modo opcional
- `info` - Verifica compatibilidade do sistema de arquivos e recomendações

---

## 📦 Backup e Migração de Sessões

### **Exportar Sessões**

Exporte sessões para arquivos compactados para backup ou transferência:

```bash
# Export session to archive
sudo minios-session export 1 /backup/session1.tar.zst

# Export with JSON output
sudo minios-session --json export 2 /backup/session2.tar.zst
```

**Recursos:**
- Cria arquivo .tar.zst compactado
- Preserva todos os dados e metadados da sessão
- Pode ser importado em qualquer sistema MiniOS
- Compressão automática para economia de espaço

### **Importar Sessões**

Importe sessões de arquivos com conversão de modo opcional:

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

**Recursos:**
- Restaura dados da sessão a partir do arquivo
- Converte automaticamente entre modos de armazenamento, se especificado
- Ignora arquivos existentes para evitar perda de dados
- Cria novo número de sessão automaticamente

### **Copiar e Converter Sessões**

Copie sessões entre diferentes modos de armazenamento:

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

**Conversões Suportadas:**
- native ⇄ dynfilefs ⇄ raw
- Todas as combinações de modos suportadas
- Gerenciamento automático de tamanho
- Preserva dados da sessão durante a conversão

**Casos de Uso:**
- Migrar de FAT32 para sistema de arquivos ext4 (dynfilefs → native)
- Criar sessões portáteis (native → dynfilefs/raw)
- Otimizar para diferentes sistemas de arquivos
- Criar backups de sessão com modos diferentes

---

## 🏗️ Modos de Armazenamento de Sessão em Detalhes

### **Modo Nativo**

**Melhor para:** Sistemas em sistemas de arquivos POSIX (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Características:**
- Acesso direto ao sistema de arquivos, sem contêiner
- Total conformidade POSIX (links físicos, permissões, atributos estendidos)
- Melhor desempenho entre todos os modos
- **Requisitos:** Sistema de arquivos compatível com POSIX (ext4, btrfs, xfs)
- **Não compatível:** FAT32, NTFS, exFAT

### **Modo DynFileFS**

**Melhor para:** Sistemas de arquivos não POSIX (FAT32, NTFS, exFAT)

```bash
# Enable dynfilefs mode with initial size
perchmode=dynfilefs perchsize=2000
```

**Características:**
- Contêiner expansível com sistema de arquivos ext4 interno
- Cresce automaticamente conforme necessário até o espaço disponível
- Funciona em qualquer tipo de sistema de arquivos
- Pequena perda de desempenho em relação ao modo nativo
- **Tamanho padrão:** 1000MB, expande dinamicamente
- **Recomendado para:** Sistemas de arquivos FAT32, NTFS, exFAT

### **Modo Raw**

**Melhor para:** Requisitos de tamanho fixo em qualquer sistema de arquivos

```bash
# Enable raw mode with fixed size
perchmode=raw perchsize=2000
```

**Características:**
- Imagem de tamanho fixo com sistema de arquivos ext4 interno
- Uso de disco previsível e constante
- Funciona em qualquer tipo de sistema de arquivos
- Tamanho deve ser especificado na criação
- **Tamanho padrão:** 1000MB se não especificado
- **Casos de uso:** Sessões portáteis, cotas de armazenamento, alocação de espaço previsível

---

## 🗂️ Metadados e Compatibilidade de Sessão

### **Formatos de Metadados de Sessão**

**Formato Padrão (session.conf):**
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

**Formato JSON (quando jq está disponível):**
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

> **Nota:** O MiniOS detecta automaticamente se o `jq` está disponível e usa o formato JSON quando possível, caso contrário utiliza o formato conf tradicional.

### **Verificação de Compatibilidade**

O MiniOS verifica automaticamente a compatibilidade das sessões:

- **Versão diferente** - Cria nova sessão se a versão do MiniOS for diferente
- **Edição diferente** - Cria nova sessão se a edição for diferente (standard/toolbox/ultra)
- **Union FS diferente** - Cria nova sessão se o sistema de arquivos union for diferente (aufs/overlayfs)
- **Mudança de modo** - Cria nova sessão se o modo de armazenamento mudar

### **Sistema de Avisos**

Ao selecionar sessões incompatíveis, o MiniOS exibe avisos:
- Avisos de incompatibilidade de versão
- Notificações de edição diferente
- Problemas de compatibilidade com o sistema de arquivos union
- Opção de prosseguir por conta e risco do usuário

---

## 🎯 Configuração Avançada de Sessão

### **Localizações Personalizadas de Sessão**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Gerenciamento de Tamanho da Sessão**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4095MB (4GB limit)
# - Others: Limited by available space
```

### **Gerenciamento Automático de Sessões**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Solução de Problemas de Sessões

### **Problemas Comuns**

#### **Sessão Não Encontrada**

```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Problemas de Permissão**

```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Falhas no Modo de Armazenamento**

```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
sudo minios-session status
sudo minios-session info  # Show filesystem compatibility
```

### **Recuperação de Sessão**

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

### **Limpeza de Sessões**

```bash
# Remove sessions older than 30 days
sudo minios-session cleanup --days 30

# Delete specific session (safe method)
sudo minios-session delete 3

# Manual session removal (advanced users only)
sudo rm -rf /minios/changes/session_number/
```

---

## 📊 Melhores Práticas para Sessões

### **Escolhendo Modos de Armazenamento**

- **Modo nativo:** Use quando o MiniOS estiver em um sistema de arquivos POSIX (ext4, btrfs, xfs) – melhor desempenho
- **Modo DynFileFS:** Use para sistemas de arquivos FAT32, NTFS, exFAT – gerenciamento automático de espaço
- **Modo raw:** Use quando precisar de tamanho fixo em qualquer sistema de arquivos – uso de disco previsível

### **Planejamento de Tamanho**

- **Sessões pequenas:** 1-2GB para alterações básicas de configuração
- **Desenvolvimento:** 4-8GB para ambientes de desenvolvimento
- **Cargas pesadas:** 8GB+ para instalação extensiva de software

### **Gerenciamento de Sessões**

- Limpe sessões antigas regularmente
- Use nomes descritivos para sessões no gerenciamento manual
- Monitore o uso de espaço em disco
- Mantenha pelo menos uma sessão conhecida e funcional para recuperação

### **Otimização de Desempenho**

- Use o modo nativo sempre que possível para melhor desempenho
- Armazene as sessões em dispositivos de armazenamento rápidos
- Considere SSD para sessões usadas com frequência

---
