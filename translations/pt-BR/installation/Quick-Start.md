# Primeiros Passos com o MiniOS 🌟

Bem-vindo ao MiniOS, onde a flexibilidade e portabilidade do Linux se unem à praticidade e facilidade de uso. Se você é novo no MiniOS, este guia completo vai te ajudar a começar e aproveitar ao máximo seu sistema operacional.

## Passo 1: Escolha a Edição Certa do MiniOS 📦

O MiniOS oferece três edições principais, cada uma voltada para um tipo de uso específico:

- **🚀 Standard** - O confiável para tarefas diárias de computação
- **🧰 Toolbox** - Kit de ferramentas para usuários avançados, com utilitários de sistema
- **⚡ Ultra** - Tudo em um, com conjunto completo de recursos

Para descrições detalhadas das funcionalidades e softwares incluídos em cada edição, veja [Sobre o MiniOS](/about/About-MiniOS.md).

**Opções de Download:**
- **Site Oficial**: [minios.dev](https://minios.dev) - Visão geral das edições e downloads diretos
- **GitHub Releases**: [Últimos lançamentos](https://github.com/minios-linux/minios-live/releases) - Todas as versões e notas de lançamento

Para uma lista detalhada dos pacotes incluídos em cada edição, veja a [Lista de Pacotes](/administration/Packages.md).

## Passo 2: Crie um Pendrive Bootável 🔌

**Métodos de instalação recomendados:**

### 🖥️ **Windows**

- **[Rufus](/installation/tools/Rufus.md)** ⭐ - Simples e confiável
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interface gráfica multiplataforma
- **[Ventoy](/installation/tools/Ventoy.md)** ⭐ - Suporte a multi-boot

### 🐧 **Linux**

- **[dd command](/installation/tools/dd.md)** ⭐ - Ferramenta rápida via linha de comando
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interface gráfica amigável

### 🍎 **macOS**

- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Interface gráfica fácil de usar
- **[dd command](/installation/tools/dd.md)** ⭐ - Ferramenta de terminal integrada

### 🏠 **A partir do MiniOS**

- **[MiniOS Installer](/installation/MiniOS-Installer.md)** - Ferramenta gráfica integrada

**Métodos adicionais:** [UNetbootin](/installation/tools/UNetbootin.md), [Drive Utility](/installation/tools/Drive-Utility.md), [Método Original](/installation/tools/Original-Method.md)

### Requisitos de Espaço do Pendrive

- **Standard (787 MB)**: mínimo 2 GB
- **Toolbox (1,2 GB)**: mínimo 4 GB
- **Ultra (1,7 GB)**: mínimo 4 GB
- **Tamanho recomendado**: 8 GB ou mais para uso confortável com persistência de alterações

**Notas importantes:**
- Cada link acima traz instruções detalhadas passo a passo
- Métodos recomendados (⭐) foram testados quanto à confiabilidade e facilidade de uso
- Escolha o método que melhor se adapta ao seu sistema operacional e nível de experiência

## Passo 3: Inicialize e Explore 🖥️

Após inicializar pelo USB, explore o ambiente de desktop do MiniOS:

**Principais recursos para conhecer**:
- Menu de aplicativos (painel inferior esquerdo)
- Configurações e preferências do sistema
- Gerenciador de arquivos (Thunar)
- Aplicativos pré-instalados (navegador, suíte office, utilitários)
- Opções de personalização da área de trabalho

O ambiente de desktop padrão é o XFCE, oferecendo equilíbrio entre recursos e desempenho.

## Passo 4: Configuração do Sistema 🌐

**Configure o idioma do sistema, teclado, fuso horário e outras preferências:**

### 🔧 **Usando o MiniOS Configurator** (Recomendado)

**Acesso:** Menu de Aplicativos → Sistema → Configurar MiniOS

**Principais configurações disponíveis:**
- **🌍 Idioma & Localidade**: Defina o idioma do sistema (ex: `en_US.UTF-8`, `ru_RU.UTF-8`, `pt_BR.UTF-8`)
- **⏰ Fuso Horário**: Configure o fuso horário (ex: `Europe/Berlin`, `America/New_York`, `Asia/Tokyo`)
- **⌨️ Teclado**: Defina layouts e opções de alternância (ex: `us,ru` com atalho `Alt+Shift`)
- **👤 Usuário**: Altere nome de usuário, nome completo e grupos
- **🔐 Senhas**: Defina senhas seguras para usuário e root
- **🖥️ Sistema**: Configure hostname, ative/desative serviços
- **🔧 Avançado**: Opções de boot e comportamento do sistema

**Como usar:**
1. Abra o MiniOS Configurator no menu do sistema
2. Navegue pelas abas para configurar diferentes aspectos
3. Faça as alterações e salve
4. **Reinicie para aplicar** – as configurações entram em vigor após o reboot e permanecem salvas

**Nota técnica:** O MiniOS Configurator altera o `/etc/live/config.conf`, que é o principal arquivo de configuração do MiniOS e controla o comportamento do sistema na inicialização. Para mais detalhes sobre os parâmetros, veja o guia [Arquivo de Configuração](/configuration/Configuration-File.md).

### 💻 **Alternativa: Configuração via Linha de Comando**

**Alterações imediatas (aplicadas na hora):**
```bash
# Set system locale for current session
sudo localectl set-locale LANG=en_US.UTF-8

# Set keyboard layout with switching
sudo localectl set-x11-keymap us,ru pc105 ,dvorak grp:alt_shift_toggle

# Set timezone
sudo timedatectl set-timezone Europe/Berlin

# Change user password
passwd live
```

**Para alterações persistentes após reinicialização:** Use o MiniOS Configurator ou edite diretamente o `/etc/live/config.conf`.

### 📋 **Opções Adicionais de Configuração**

- **Edição direta de arquivos**: Edite o `/etc/live/config.conf` manualmente (avançado)
- **Configuração no boot**: Use [Parâmetros de Boot](/configuration/Boot-Parameters.md) para ajustar o sistema antes de iniciar
- **Guia do arquivo de configuração**: Veja [Arquivo de Configuração](/configuration/Configuration-File.md) para referência detalhada do config.conf
- **Pré-instalação**: Configure antes de instalar com o [MiniOS Installer](/installation/MiniOS-Installer.md)

**Importante:** Alterações no `/etc/live/config.conf` (via MiniOS Configurator ou edição manual) exigem reinicialização para surtirem efeito. Ferramentas de linha de comando como `localectl` e `timedatectl` aplicam mudanças imediatamente, mas podem não persistir após o reboot sem configuração adequada.

## Passo 5: Instalação de Software 🔄

O MiniOS oferece várias formas de instalar softwares:

### 📦 **Gerenciador de Pacotes APT**

Gerenciamento básico de pacotes Debian – use `man apt` para referência detalhada dos comandos.

### 🔄 **Sistema de Módulos**

Módulos SquashFS avançados para softwares persistentes – veja o guia [Criando Módulos](/development/Creating-Modules.md).

**Diferença principal:** Instalações via APT exigem persistência para sobreviver ao reboot, enquanto módulos são persistentes automaticamente.

## Passo 6: Persistência de Dados 💾

**Boa notícia:** O MiniOS configura automaticamente a persistência de dados durante a instalação! Seus arquivos, configurações e softwares instalados são salvos automaticamente.

### Como Funciona

- **Configuração Automática**: Todos os métodos de instalação criam persistência automaticamente
- **Detecção Inteligente**: O sistema escolhe o modo de persistência ideal para o sistema de arquivos do seu drive
- **Portátil**: Seus dados acompanham você no pendrive

### Configuração Avançada

Para configuração personalizada de persistência, consulte o guia detalhado [Arquivo de Configuração](/configuration/Configuration-File.md) e a referência de [Parâmetros de Boot](/configuration/Boot-Parameters.md).

## Passo 7: Configuração de Segurança 🔐

### 👤 **Contas Padrão**

- **Usuário**: `live` / `evil`
- **Root**: `root` / `toor`

### 🔒 **Passos Importantes de Segurança**

1. **Altere as senhas imediatamente** – As credenciais padrão são públicas
2. **Use senhas fortes e únicas** para todas as contas

### Métodos de Configuração de Senha

- **🔧 Recomendado**: Use o **MiniOS Configurator** (Menu de Aplicativos → Sistema → Configurar MiniOS → Aba Usuário)
- **💻 Linha de Comando**: `passwd live` e `sudo passwd root`
- **📋 Avançado**: Veja o guia [Endurecimento de Segurança](/administration/Security-Hardening.md) para configurações detalhadas

⚠️ **Nunca use credenciais padrão em sistemas conectados à rede!**

## Passo 8: Personalização & Tópicos Avançados 🛠️

### 🎨 **Personalização Básica**

- Temas e papéis de parede via Configurações
- Layout do painel e preferências de aplicativos
- Atalhos de teclado e configurações do sistema

### 🚀 **Configuração Avançada**

- **Parâmetros de Boot**: [Referência completa](/configuration/Boot-Parameters.md) para ajustes do sistema
- **Desempenho**: [Guia de otimização](/administration/Performance-Optimization.md) para mais velocidade
- **Hardware**: [Guia de compatibilidade](/installation/Hardware-Compatibility.md) para suporte a dispositivos

### 🔧 **Recursos para Usuários Avançados**

- **Builds Personalizados**: [Compilando o MiniOS](/development/Building-MiniOS.md) a partir do código-fonte
- **Criação de Módulos**: Desenvolvimento de [módulos avançados](/development/Creating-Modules.md)
- **Reconstrução de ISO**: [Reempacote o sistema live](/development/Rebuilding-ISO.md) em uma ISO bootável
- **Atualização de Kernel**: Guia de [gerenciamento do kernel](/administration/Kernel-Management.md)

## Ajuda & Recursos da Comunidade 💬

### 📚 **Documentação**

- **Site Oficial**: [minios.dev](https://minios.dev) - Últimas novidades e downloads
- **Todos os Guias**: Disponíveis nesta coleção de documentação

### 🐛 **Suporte & Problemas**

- **Relato de Bugs**: [GitHub Issues](https://github.com/minios-linux/minios-live/issues)
- **Código-Fonte**: [Repositório no GitHub](https://github.com/minios-linux/minios-live)

### 📖 **Saiba Mais**

- **Documentação Debian**: [www.debian.org/doc](https://www.debian.org/doc/) – O MiniOS é baseado no Debian
- **Noções Básicas de Linux**: Tutoriais gerais de Linux também se aplicam ao MiniOS

## Bem-vindo ao MiniOS! 🎉

Agora você tem tudo o que precisa para começar com o MiniOS. O sistema combina o poder do Linux com a praticidade portátil – perfeito para recuperação de sistemas, computação portátil ou uso diário.

**Próximos passos:** Escolha sua edição, crie seu pendrive e comece a explorar! 🚀
