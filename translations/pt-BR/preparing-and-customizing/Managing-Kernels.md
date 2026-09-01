---
updated: 2026-08-31
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Gerenciando kernels

## Por que substituir o kernel?

MiniOS vem com um kernel padrão, mas há vários motivos pelos quais você pode querer substituí-lo:

### **Diferentes variantes de kernel do Debian**

O Debian oferece vários tipos de kernel otimizados para diferentes usos:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel padrão para sistemas 64-bit (padrão no MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel em tempo real para aplicações críticas
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Otimizado para ambientes em nuvem e virtualizados

> **Observação:** Os números de versão (como `6.12.38+deb13`) mudam com as atualizações. Para encontrar os kernels disponíveis atualmente:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### **Casos de uso especializados**

- **Computação em tempo real** – Kernels RT para produção de áudio, controle industrial
- **Jogos e baixa latência** – Kernels customizados com otimizações para jogos
- **Reforço de segurança** – Kernels com patches de segurança adicionais (grsecurity, etc.)
- **Compatibilidade de hardware** – Kernels mais recentes para suportar hardware novo
- **Ajuste de desempenho** – Kernels compilados sob medida com otimizações específicas

### **Recursos de kernel customizado**

- **Patches personalizados** – Aplique patches específicos para seu hardware ou caso de uso
- **Módulos de kernel** – Adicione suporte a hardwares ou sistemas de arquivos especializados
- **Otimizações de compilador** – Compile com diferentes flags de otimização
- **Otimização de tamanho** – Remova drivers desnecessários para reduzir o tamanho do kernel

### **Cenários comuns**

- **Estações de trabalho para produção de áudio** – Use kernel RT para latência mínima
- **Sistemas para jogos** – Aplique patches e otimizações específicas para jogos
- **Ambientes de servidor** – Use kernels otimizados para nuvem visando melhor virtualização
- **Hardware legado** – Utilize kernels antigos para compatibilidade com sistemas antigos
- **Ambientes de desenvolvimento** – Teste aplicações em diferentes versões de kernel

---

## Visão geral do Gerenciador de kernels MiniOS

MiniOS oferece duas ferramentas para gerenciamento de kernels:

1. **Gerenciador de kernels MiniOS (GUI):** Um aplicativo gráfico fácil de usar para empacotar, instalar e gerenciar kernels
2. **minios-kernel (CLI):** Uma ferramenta de linha de comando para usuários avançados e automação

Ambas as ferramentas lidam automaticamente com:
- **Empacotamento do kernel** no formato SquashFS
- **Geração do initramfs** com os drivers e scripts de boot adequados
- **Instalação** no repositório de kernels MiniOS
- Atualizações de **configuração do bootloader**
- **Ativação** e troca de kernel

Esta página aborda o sistema live modular MiniOS. O Gerenciador de kernels MiniOS e `minios-kernel` existem para essa arquitetura live e seu módulo de kernel coordenado, `vmlinuz`, além do conjunto de initramfs. Após a conversão nativa, o sistema passa a usar o fluxo de trabalho convencional de kernel Debian; as ferramentas de kernel live MiniOS são removidas porque o modelo de kernel modular não se aplica mais, então utilize os pacotes de kernel Debian, ferramentas de initramfs e o bootloader instalado. Veja [Sobre MiniOS](/getting-started/About-MiniOS) e [Modos de boot](/using-minios/Boot-Modes). Para o comportamento exato do kernel coordenado do initrd live, consulte [Carregamento de módulos no initrd](/reference/boot-process/Module-Loading).

### **Considerações importantes:**

- **Privilégios administrativos:** Ambas as ferramentas exigem privilégios administrativos e solicitarão autenticação via PolicyKit
- **Compatibilidade de kernel:** Certifique-se de que os kernels são compatíveis com o MiniOS. Recomenda-se usar kernels do repositório
- **Diretório do MiniOS:** As ferramentas detectam automaticamente o diretório do MiniOS (`/minios/`) e verificam permissões de escrita
- **Atualizações automáticas:** As configurações do bootloader são atualizadas automaticamente quando os kernels são ativados

---

## Método 1: Usando o Gerenciador de kernels MiniOS (GUI)

O gerenciador gráfico de kernels oferece uma interface intuitiva para todas as operações relacionadas ao kernel.

### **Passos:**

#### 1. **Inicie o aplicativo**

```bash
minios-kernel-manager
```

Ou pesquise por "Gerenciador de kernels MiniOS" no menu de aplicativos.

#### 2. **Empacote um novo kernel**

**Usando a aba Empacotar Kernel:**

1. **Selecione a fonte do kernel:**
   - **Empacote manualmente:** Procure e selecione um pacote kernel local `.deb`
   - **Repositório:** Escolha entre os kernels disponíveis nos repositórios Debian/Ubuntu

2. **Configure a compactação:**
   - Selecione a compactação SquashFS: `zstd` (recomendado), `lz4`, `lzo`, `xz` ou `gzip`

3. **Empacote o kernel:**
   - Clique no botão "Empacotar Kernel"
   - Acompanhe o progresso no log de empacotamento
   - Os arquivos são instalados automaticamente no repositório do MiniOS

#### 3. **Gerencie kernels instalados**

**Usando a aba Gerenciar Kernels:**

1. **Veja os kernels disponíveis:**
   - Veja todos os kernels empacotados com indicadores de status:
     - **ACTIVE:** Kernel atualmente configurado
     - **RUNNING:** Kernel atualmente em execução
     - **AVAILABLE:** Disponível para ativação

2. **Ative um kernel:**
   - Clique com o botão direito em um kernel e selecione "Ativar Kernel"
   - Confirme na caixa de diálogo de ativação
   - A configuração do bootloader é atualizada automaticamente

3. **Exclua um kernel:**
   - Clique com o botão direito em um kernel inativo e selecione "Excluir Kernel"
   - Confirme a exclusão (não pode ser desfeita)

---

## Método 2: Usando o minios-kernel (CLI)

A ferramenta de linha de comando oferece recursos de gerenciamento de kernel para automação e scripts.

### **Privilégios administrativos necessários:**

A ferramenta CLI exige privilégios de root e fará a verificação automaticamente. Execute os comandos com `sudo` ou via `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### **Comandos básicos:**

#### 1. **Listar kernels disponíveis**

```bash
sudo minios-kernel list
```

Exibe todos os kernels empacotados com seus status.

#### 2. **Empacotar um kernel**

**Do repositório:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**De um arquivo .deb local:**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Com compactação personalizada:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. **Ativar um kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. **Excluir um kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. **Verificar status**

```bash
sudo minios-kernel status
```

Mostra o status do diretório do MiniOS e informações do kernel atual.

#### 6. **Mostrar informações do kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Exibe informações detalhadas sobre um kernel específico, incluindo status e disponibilidade.

### **Opções avançadas da CLI:**

#### **Saída em JSON (para scripts):**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Opções avançadas de empacotamento:**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Ajuda e uso:**

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

## Solução de problemas

### Problemas comuns e soluções:

#### **Diretório do MiniOS não encontrado**

- **Causa:** As ferramentas não conseguem localizar o diretório do MiniOS
- **Solução:** Certifique-se de estar usando um sistema MiniOS ou que o pendrive está montado corretamente
- **Verificação:** Execute `sudo minios-kernel status` para verificar a detecção do diretório

#### **Permissão negada**

- **Causa:** O diretório do MiniOS está somente leitura ou faltam permissões
- **Solução:** Certifique-se de ter privilégios administrativos e que o sistema de arquivos está gravável
- **Verificação:** Verifique o status do diretório do MiniOS na interface gráfica ou CLI

#### **Falha na instalação do pacote**

- **Causa:** Pacote corrompido, problemas de rede ou dependências
- **Solução:**
  - Verifique a integridade do arquivo do pacote
  - Confira a conectividade de rede para pacotes do repositório
  - Atualize as listas de pacotes: `sudo apt update`

#### **Kernel panic após ativação**

- **Causa:** Kernel incompatível ou drivers ausentes
- **O que fazer:** Inicialize um sistema MiniOS conhecido e funcional, salve os dados importantes e restaure um conjunto completo de kernel confiável apenas se estiver disponível. Caso contrário, reinstale a instalação MiniOS afetada. Não tente reparar o sistema misturando arquivos individuais de kernel, initramfs ou `01-kernel-*.sb`. Veja [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

#### **Sistema inicializa com kernel antigo**

- **Causa:** Configuração do bootloader não foi atualizada corretamente
- **Solução:**
  - Refaça a ativação do kernel: `sudo minios-kernel activate <version>`
  - Verifique se o kernel foi empacotado e instalado corretamente

#### **Hardware não funciona após troca de kernel**

- **Causa:** Drivers ausentes no novo kernel
- **Solução:**
  - Verifique se o arquivo de módulo do kernel SquashFS foi instalado
  - Confira se o novo kernel suporta seu hardware
  - Considere usar outra variante de kernel

#### **Recuperando após uma alteração de kernel malsucedida**

Não copie uma imagem de kernel individual, initramfs ou módulo `01-kernel-*.sb` de outra imagem. Um kernel MiniOS inicializável exige o conjunto coordenado. Se um conjunto completo e confiável não estiver disponível pelo fluxo de trabalho de gerenciamento de kernels, reinstale a instalação MiniOS afetada em vez de montar componentes de boot manualmente. Salve os dados importantes antes; veja [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

### **Comandos de diagnóstico:**

**Verifique o status atual do sistema:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verifique os arquivos do kernel:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Verifique a configuração do bootloader:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## Visão Geral da Estrutura de Arquivos

O Gerenciador de Kernel do MiniOS gerencia automaticamente estes arquivos:

### **Estrutura do Repositório de Kernel:**

```
/minios/
├── 01-kernel-<version>.sb         # Active kernel module
├── kernels/                       # Repository of inactive/alternative kernels
│   └── <version>/
│       ├── 01-kernel-<version>.sb # SquashFS kernel module
│       ├── vmlinuz-<version>      # Kernel image
│       └── initrfs-<version>.img  # Initial RAM filesystem
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Observação:** O módulo padrão `01-kernel-<version>.sb` que acompanha o MiniOS inclui drivers adicionais além dos presentes nos pacotes de kernel do repositório original. Esses drivers extras oferecem maior compatibilidade de hardware para adaptadores wireless e dispositivos de armazenamento.

### **Indicadores de Status:**

- **ATIVO:** Kernel configurado no bootloader (será iniciado no próximo reinício)
- **EM EXECUÇÃO:** Kernel atualmente em uso
- **DISPONÍVEL:** Empacotado e pronto para ativação

### **Operações Automáticas:**

- Empacotamento e compactação do kernel
- Geração do initramfs com os drivers adequados
- Instalação no repositório do MiniOS
- Atualizações na configuração do bootloader
- Gerenciamento de links simbólicos para kernels ativos
- Limpeza de arquivos temporários

---

## Melhores Práticas

### **Seleção de Kernel:**

- Utilize kernels dos repositórios oficiais do Debian/Ubuntu sempre que possível
- Teste novos kernels em ambientes que não sejam de produção primeiro
- Mantenha pelo menos um kernel conhecido e funcional para recuperação

### **Antes da Instalação:**

- Verifique se o diretório do MiniOS está com permissão de escrita
- Certifique-se de que há espaço em disco suficiente (os kernels podem ter entre 100 e 500MB)
- Atualize as listas de pacotes para kernels do repositório

### **Após a Instalação:**

- Teste o novo kernel cuidadosamente
- Verifique se todo o hardware está funcionando corretamente
- Mantenha o kernel anterior como backup até que o novo esteja comprovadamente estável

### **Planejamento de Recuperação:**

- Sempre mantenha um conjunto completo de kernel conhecido e funcional
- Saiba como inicializar a partir de uma mídia de resgate, se necessário
- Documente quais kernels funcionam com a sua configuração de hardware
