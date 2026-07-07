# Gerenciamento de Kernel no MiniOS 🔧

## 🤔 Por que substituir o Kernel?

O MiniOS vem com um kernel padrão, mas existem vários motivos pelos quais você pode querer substituí-lo:

### 🔧 **Diferentes Sabores de Kernel Debian**

O Debian oferece várias variantes de kernel otimizadas para diferentes casos de uso:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel padrão para sistemas 64 bits (padrão no MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel em tempo real para aplicações críticas de tempo
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Otimizado para ambientes em nuvem e virtualizados

> **📝 Nota:** Os números de versão (como `6.12.38+deb13`) mudam com as atualizações. Para encontrar os kernels disponíveis atualmente:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### 🎯 **Casos de Uso Especializados**

- **Computação em tempo real** - Kernels RT para produção de áudio, controle industrial
- **Jogos e baixa latência** - Kernels customizados com otimizações para jogos
- **Reforço de segurança** - Kernels com patches de segurança adicionais (grsecurity, etc.)
- **Compatibilidade de hardware** - Kernels mais recentes para suporte a novos hardwares
- **Ajuste de desempenho** - Kernels compilados sob medida com otimizações específicas

### 🛠️ **Recursos de Kernel Personalizado**

- **Patches customizados** - Aplique patches específicos para seu hardware ou caso de uso
- **Módulos do kernel** - Adicione suporte a hardwares ou sistemas de arquivos especializados
- **Otimizações de compilador** - Compile com diferentes flags de otimização
- **Otimização de tamanho** - Remova drivers desnecessários para reduzir o tamanho do kernel

### 📈 **Cenários Comuns**

- **Estações de produção de áudio** - Use kernel RT para latência mínima de áudio
- **Sistemas para jogos** - Aplique patches e otimizações específicas para jogos
- **Ambientes de servidor** - Use kernels otimizados para nuvem para melhor virtualização
- **Hardware legado** - Use kernels antigos para compatibilidade com sistemas antigos
- **Sistemas de desenvolvimento** - Teste aplicações em diferentes versões de kernel

---

## ⚙️ Visão Geral do Gerenciador de Kernel do MiniOS

O MiniOS oferece duas ferramentas para gerenciamento de kernels:

1. **🖥️ MiniOS Kernel Manager (GUI):** Um aplicativo gráfico amigável para empacotar, instalar e gerenciar kernels
2. **⌨️ minios-kernel (CLI):** Uma ferramenta de linha de comando para usuários avançados e automação

Ambas as ferramentas gerenciam automaticamente:
- **Empacotamento do kernel** no formato SquashFS
- **Geração do initramfs** com os drivers e scripts de boot adequados
- **Instalação** no repositório de kernels do MiniOS
- **Atualizações da configuração do bootloader**
- **Ativação e troca de kernel**

### ⚠️ **Considerações Importantes:**

- **🔑 Privilégios Administrativos:** Ambas as ferramentas exigem privilégios administrativos e solicitarão autenticação via PolicyKit
- **🔗 Compatibilidade de Kernel:** Certifique-se de que os kernels são compatíveis com o MiniOS. Recomenda-se usar kernels do repositório
- **💾 Diretório do MiniOS:** As ferramentas detectam automaticamente o diretório do MiniOS (`/minios/`) e verificam permissões de escrita
- **🔄 Atualizações Automáticas:** As configurações do bootloader são atualizadas automaticamente ao ativar kernels

---

## 🖥️ Método 1: Usando o MiniOS Kernel Manager (GUI)

O gerenciador gráfico de kernels oferece uma interface intuitiva para todas as operações de kernel.

### 📝 **Passos:**

#### 1. 🚀 **Inicie o Aplicativo**

```bash
minios-kernel-manager
```

Ou procure por "MiniOS Kernel Manager" no menu de aplicativos.

#### 2. 📦 **Empacote um Novo Kernel**

**Usando a aba Empacotar Kernel:**

1. **Selecione a Fonte do Kernel:**
   - **Empacote Manualmente:** Navegue e selecione um pacote `.deb` de kernel local
   - **Repositório:** Escolha entre os kernels disponíveis nos repositórios Debian/Ubuntu

2. **Configure a Compressão:**
   - Selecione a compressão SquashFS: `zstd` (recomendado), `lz4`, `lzo`, `xz` ou `gzip`

3. **Empacote o Kernel:**
   - Clique no botão "Empacotar Kernel"
   - Acompanhe o progresso no log de empacotamento
   - Os arquivos são instalados automaticamente no repositório do MiniOS

#### 3. 🔄 **Gerencie os Kernels Instalados**

**Usando a aba Gerenciar Kernels:**

1. **Veja os Kernels Disponíveis:**
   - Veja todos os kernels empacotados com selos de status:
     - **ATIVO:** Kernel atualmente configurado
     - **EM EXECUÇÃO:** Kernel atualmente em uso
     - **DISPONÍVEL:** Disponível para ativação

2. **Ative um Kernel:**
   - Clique com o botão direito em um kernel e selecione "Ativar Kernel"
   - Confirme o diálogo de ativação
   - A configuração do bootloader é atualizada automaticamente

3. **Exclua um Kernel:**
   - Clique com o botão direito em um kernel inativo e selecione "Excluir Kernel"
   - Confirme a exclusão (não pode ser desfeita)

---

## ⌨️ Método 2: Usando o minios-kernel (CLI)

A ferramenta de linha de comando oferece recursos de gerenciamento de kernel para scripts.

### ⚠️ **Privilégios Administrativos Necessários:**

A ferramenta CLI exige privilégios de root e fará a verificação automaticamente. Execute os comandos com `sudo` ou via `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### 📝 **Comandos Básicos:**

#### 1. 📋 **Listar Kernels Disponíveis**

```bash
sudo minios-kernel list
```

Mostra todos os kernels empacotados com seus status.

#### 2. 📦 **Empacotar um Kernel**

**Do Repositório:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**De um Arquivo .deb Local:**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Com Compressão Personalizada:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. 🔄 **Ativar um Kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. 🗑️ **Excluir um Kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. 📊 **Verificar Status**

```bash
sudo minios-kernel status
```

Mostra o status do diretório MiniOS e informações do kernel atual.

#### 6. ℹ️ **Mostrar Informações do Kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Exibe informações detalhadas sobre um kernel específico, incluindo status e disponibilidade.

### 🔧 **Opções Avançadas da CLI:**

#### **Saída em JSON (para scripts):**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Opções Avançadas de Empacotamento:**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Ajuda e Uso:**

```bash
minios-kernel --help                    # General help (doesn't require root)
sudo minios-kernel package --help       # Package command help
sudo minios-kernel list --help          # List command help
sudo minios-kernel activate --help      # Activate command help
sudo minios-kernel info --help          # Info command help
sudo minios-kernel status --help        # Status command help
sudo minios-kernel delete --help        # Delete command help
```

---

## 🔧 Solução de Problemas

### Problemas Comuns e Soluções:

#### **🚫 Diretório do MiniOS Não Encontrado**

- **Causa:** As ferramentas não conseguem localizar o diretório do MiniOS
- **Solução:** Certifique-se de estar rodando em um sistema MiniOS ou que o pendrive está devidamente montado
- **Verificação:** Execute `sudo minios-kernel status` para verificar a detecção do diretório

#### **🔒 Permissão Negada**

- **Causa:** O diretório do MiniOS está somente leitura ou há permissões insuficientes
- **Solução:** Certifique-se de ter privilégios administrativos e que o sistema de arquivos está gravável
- **Verificação:** Verifique o status do diretório MiniOS na interface gráfica ou CLI

#### **📦 Falha na Instalação do Pacote**

- **Causa:** Pacote corrompido, problemas de rede ou dependências
- **Solução:** 
  - Verifique a integridade do arquivo do pacote
  - Verifique a conectividade de rede para pacotes do repositório
  - Atualize as listas de pacotes: `sudo apt update`

#### **💥 Kernel Panic Após Ativação**

- **Causa:** Kernel incompatível ou drivers ausentes
- **Solução:** 
  - Inicialize pelo modo de recuperação ou por um kernel antigo
  - Use `sudo minios-kernel activate <versão-funcional>` para ativar um kernel conhecido
  - Verifique a compatibilidade do kernel com seu hardware

#### **🔄 Sistema Inicializa Kernel Antigo**

- **Causa:** Configuração do bootloader não foi atualizada corretamente
- **Solução:** 
  - Refaça a ativação do kernel: `sudo minios-kernel activate <versão>`
  - Verifique se o kernel foi empacotado e instalado corretamente

#### **⚠️ Hardware Não Funciona Após Troca de Kernel**

- **Causa:** Drivers ausentes no novo kernel
- **Solução:**
  - Verifique se o arquivo do módulo SquashFS do kernel foi instalado
  - Confira se o novo kernel suporta seu hardware
  - Considere usar outra variante de kernel

#### **🚨 Recuperação de Kernel a partir da Imagem Original do MiniOS**

Se precisar recuperar de um kernel corrompido ou incompatível, você pode inicializar a partir do ISO/USB original do MiniOS:

```bash
# Boot from original MiniOS image with from= parameter
# At boot prompt, specify your installed MiniOS device
from=/dev/sda1  # Replace with your actual MiniOS device
```

**Processo de Recuperação:**
Ao inicializar pelo ISO/USB original do MiniOS e especificar no parâmetro `from=` o dispositivo onde o MiniOS está instalado, o sistema init detecta isso e permite acessar seu sistema MiniOS instalado. O método de recuperação depende se os arquivos originais do kernel ainda estão presentes:

1. **Se o kernel original ainda existir:** 
   - A inicialização ocorre normalmente com o kernel original do ISO/USB
   - Ative manualmente o kernel original: `sudo minios-kernel activate <versão-original-do-kernel>`

2. **Se o kernel original foi excluído:** 
   - Copie manualmente os arquivos do kernel da imagem original do MiniOS e restaure-os nos locais apropriados na sua instalação MiniOS
   - Ative manualmente o kernel restaurado: `sudo minios-kernel activate <versão-original-do-kernel>`

Em ambos os casos, a ativação do kernel exige intervenção manual após o processo de recuperação.

### 🔍 **Comandos de Diagnóstico:**

**Verifique o Status Atual do Sistema:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verifique os Arquivos do Kernel:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Verifique a Configuração do Bootloader:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## 📋 Visão Geral da Estrutura de Arquivos

O MiniOS Kernel Manager gerencia automaticamente estes arquivos:

### **Estrutura do Repositório do Kernel:**

```
/minios/
├── 01-kernel.sb                   # Active kernel module (standard location)
├── kernels/                       # Repository of inactive/alternative kernels
│   ├── 01-kernel-<version>.sb     # SquashFS kernel modules
│   ├── vmlinuz-<version>          # Kernel binaries
│   └── initrfs-<version>.img      # Initial RAM filesystems
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Nota:** O módulo padrão `01-kernel.sb` que acompanha o MiniOS inclui drivers adicionais além dos presentes nos pacotes de kernel do repositório original. Esses drivers extras oferecem maior compatibilidade de hardware para adaptadores wireless e dispositivos de armazenamento.

### **Indicadores de Status:**

- **ATIVO:** Kernel configurado no bootloader (será iniciado no próximo reboot)
- **EM EXECUÇÃO:** Kernel atualmente em uso
- **DISPONÍVEL:** Empacotado e pronto para ativação

### **Operações Automáticas:**

- ✅ Empacotamento e compactação do kernel
- ✅ Geração do initramfs com os drivers corretos
- ✅ Instalação no repositório do MiniOS
- ✅ Atualizações de configuração do bootloader
- ✅ Gerenciamento de symlinks para kernels ativos
- ✅ Limpeza de arquivos temporários

---

## 🎯 Boas Práticas

### **Seleção de Kernel:**

- Prefira kernels dos repositórios oficiais do Debian/Ubuntu sempre que possível
- Teste novos kernels em ambientes que não sejam de produção primeiro
- Mantenha pelo menos um kernel conhecido e funcional para recuperação

### **Antes da Instalação:**

- Verifique se o diretório do MiniOS está com permissão de escrita
- Certifique-se de que há espaço suficiente em disco (kernels podem ocupar de 100 a 500MB)
- Atualize as listas de pacotes para os kernels do repositório

### **Após a Instalação:**

- Teste o novo kernel de forma completa
- Verifique se todo o hardware está funcionando corretamente
- Mantenha o kernel anterior como backup até que o novo esteja comprovadamente estável

### **Planejamento de Recuperação:**

- Sempre mantenha um backup de kernel funcional
- Saiba como inicializar a partir de uma mídia de resgate, se necessário
- Documente quais kernels são compatíveis com a sua configuração de hardware
