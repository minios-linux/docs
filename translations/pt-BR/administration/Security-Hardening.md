# Guia de Endurecimento de Segurança

Este guia fornece etapas práticas para aumentar a segurança do seu sistema MiniOS. Como o MiniOS é um sistema live, as principais preocupações de segurança são proteger os dados do usuário no armazenamento persistente e controlar o acesso ao sistema em execução. As configurações padrão garantem conveniência para uso portátil, mas podem não ser ideais para todos os cenários de uso. As recomendações a seguir vão ajudar você a configurar o sistema para maior segurança.

## Segurança das Contas de Usuário e Root

Por padrão, o MiniOS faz login automático sem senha. Isso oferece praticidade para uso portátil, mas pode representar um risco de segurança em alguns cenários.

**Credenciais padrão das contas:**
- **Usuário**: `live` / `evil`  
- **Root**: `root` / `toor`

⚠️ **Essas credenciais são de conhecimento público e devem ser alteradas imediatamente para qualquer uso em rede ou em produção.**

### Criando uma Senha Criptografada

Antes de configurar as senhas, recomenda-se criar um hash de senha criptografada:

```bash
# The command will prompt you to enter a password and output the hash
mkpasswd -m yescrypt
# Example output: $y$j9T$...(long hash)...$Spig/F.uP
```

### Definindo Senhas

Você pode definir senhas de duas formas: **é altamente recomendado** utilizar senhas criptografadas.

**Importante:** A definição de senhas e parâmetros de conta de usuário via parâmetros de boot e arquivos de configuração só tem efeito no primeiro boot do sistema. Depois disso, as senhas só podem ser alteradas usando os métodos padrão do Linux (`passwd`, `sudo passwd`).

#### Via Parâmetros de Boot

Adicione os parâmetros na linha de comando do kernel no menu de boot (GRUB para UEFI ou SYSLINUX para BIOS):

**Para senhas criptografadas (recomendado):**
```
user-password-crypted='$y$j9T$...(hash).../'
root-password-crypted='$y$j9T$...(hash).../'
```

**Para senhas em texto simples (não recomendado):**
```
user-password='your_password'
root-password='root_password'
```

**Importante:** Senhas em texto simples ficam visíveis na linha de comando do kernel e podem ser lidas por outros usuários do sistema.

#### Via Arquivo de Configuração

Edite o arquivo `minios/config.conf` no diretório raiz do pendrive:

**Para senhas criptografadas:**
```
LIVE_USER_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
LIVE_ROOT_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
```

**Para senhas em texto simples:**
```
LIVE_USER_PASSWORD="your_password"
LIVE_ROOT_PASSWORD="root_password"
```

### Alterando Senhas Após o Boot

Após o primeiro boot do sistema, as senhas podem ser alteradas usando os comandos padrão do Linux:

```bash
# Change current user password
passwd

# Change root user password (requires sudo)
sudo passwd root

# Change specific user password (requires sudo)
sudo passwd username
```

### Desativando o Login Automático

Após definir as senhas, desative o login automático para exigir autenticação:

#### Via Parâmetros de Boot

```
noautologin
```

#### Via Arquivo de Configuração

```
LIVE_CONFIG_CMDLINE="components noautologin"
```

**Desativação parcial do autologin:**
- `nox11autologin` - desativa apenas o login automático gráfico (o gerenciador de login exigirá autenticação)
- `nottyautologin` - desativa apenas o login automático no console (já desativado por padrão)

### Gerenciando Privilégios de Usuário

Por padrão, o usuário `live` possui privilégios administrativos totais sem solicitar senha, tanto no console (`sudo`) quanto em aplicativos gráficos (via polkit). Isso oferece praticidade no uso do sistema live, mas pode exigir ajustes para maior segurança.

#### Ativando Solicitação de Senha para sudo

Para exigir a digitação da senha ao usar o `sudo`, execute após o boot do sistema:

```bash
# Change rule to require password
echo "live ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/live
```

Após isso, comandos `sudo` vão solicitar a senha do usuário.

#### Ativando Solicitação de Senha para Aplicativos Gráficos

Para que programas administrativos gráficos peçam senha, remova a regra do polkit:

```bash
sudo rm /usr/share/polkit-1/rules.d/sudo_on_live.rules
```

Após isso, instaladores de software, configurações do sistema e outros aplicativos administrativos em modo gráfico vão solicitar senha.

#### Desativação Completa dos Direitos Administrativos (`noroot`)

Para máxima segurança, você pode desativar completamente o `sudo` e o acesso root:

**Via parâmetros de boot:**
```
noroot
```

**Via arquivo de configuração:**
```
LIVE_CONFIG_NOROOT=true
```

**Efeito:** O comando `sudo` não funcionará, o login como root será desativado e nenhuma ação administrativa estará disponível.

## Segurança de Rede

### Configurações Padrão do SSH

**Por que o SSH vem ativado por padrão:** O MiniOS foi projetado como um sistema de recuperação e diagnóstico para manutenção de hardware com defeito. O SSH é ativado com configurações permissivas para permitir acesso remoto quando o vídeo local não está disponível, está danificado ou ao trabalhar com sistemas sem monitor.

**Configurações atuais do SSH:**
- O serviço SSH está ativado e inicia automaticamente
- O login como root via SSH é permitido
- Autenticação por senha está ativada

**Implicações de segurança:** Essa configuração traz riscos em redes não confiáveis, mas é necessária em cenários de recuperação.

### Desativando o SSH

Se o acesso remoto não for necessário, desative o SSH completamente:

**Via parâmetros de boot:**
```
disable-services=ssh,avahi-daemon
```

**Via arquivo de configuração:**
```
DISABLE_SERVICES=ssh,avahi-daemon
```

### Configurando Acesso SSH Seguro

Se o SSH for necessário, proteja-o utilizando os métodos a seguir:

#### 1. Definindo Senhas Fortes

Use os métodos de definição de senha descritos acima.

#### 2. Autenticação por Chave SSH

Coloque os arquivos `authorized_keys` no diretório raiz do pendrive:

- `authorized_keys.root` - para o usuário root
- `authorized_keys.live` - para o usuário live
- `authorized_keys.username` - para outros usuários

Um componente do sistema fará a cópia automática para as pastas home na inicialização.

#### 3. Endurecimento da Segurança do SSH

Após o boot do sistema, edite a configuração do SSH:

```bash
sudo nano /etc/ssh/sshd_config.d/minios.conf
```

Altere as configurações para opções mais seguras:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Reinicie o serviço SSH:
```bash
sudo systemctl restart ssh
```

**Importante:** Sempre teste o acesso por chave SSH antes de desativar a autenticação por senha.

## Segurança de Boot

### Secure Boot UEFI

O MiniOS é totalmente compatível com o Secure Boot, pois utiliza o kernel padrão do Debian com bootloaders assinados. O Secure Boot oferece proteção contra malwares de pré-boot (bootkits) e é recomendado para maior segurança.

### Senha no BIOS/UEFI

Para segurança física, defina uma senha no BIOS/UEFI do seu computador para impedir que usuários não autorizados inicializem a partir de outros dispositivos ou alterem as configurações de boot.
