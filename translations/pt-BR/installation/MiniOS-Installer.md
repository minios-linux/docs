# Usando o Instalador MiniOS

O Instalador MiniOS é uma ferramenta gráfica para instalar o MiniOS em discos rígidos ou unidades USB com suporte a UEFI/BIOS e compatibilidade com múltiplos sistemas de arquivos.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o dispositivo selecionado e faça backup dos dados importantes.

## Requisitos do Disco

### Tamanho do Disco

Consulte o [Guia de Compatibilidade de Hardware](Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de disco.

### Sistemas de Arquivos Suportados

- **ext4** (recomendado para Linux)
- **Btrfs** (sistema de arquivos moderno com snapshots)
- **FAT32** (máxima compatibilidade)
- **NTFS** (compatibilidade com Windows)

## Criando a Instalação

### Iniciando o Instalador MiniOS

**Pelo menu de aplicativos:**
1. Abra o menu → Sistema → "Instalar MiniOS"

**Pelo terminal:**
```bash
sudo minios-installer
```

### Processo de Instalação

1. **Configurar as opções do sistema (Opcional, mas recomendado):**
   - Clique no botão **"Configurar MiniOS antes da instalação"**
   - Defina suas preferências:
     - Idioma e localidade do sistema
     - Fuso horário e layout de teclado  
     - Contas de usuário e senhas
     - Nome do host e serviços do sistema
   - Salve e feche o configurador
   
2. **Selecione o dispositivo de destino:**
   - Escolha um disco rígido ou unidade USB da lista
   - Verifique o tamanho e modelo do dispositivo
   
3. **Selecione o sistema de arquivos:**
   - **ext4**: recomendado para a maioria dos casos
   - **Btrfs**: para usuários avançados
   - **FAT32**: para máxima compatibilidade
   
4. **Confirme a limpeza do disco:**
   - Todos os dados no dispositivo selecionado serão apagados
   - Certifique-se de escolher o dispositivo correto
   
5. **Inicie a instalação:**
   - Clique no botão "Instalar"
   - Aguarde a conclusão do processo
   
6. **Conclusão:**
   - Reinicie o sistema
   - Remova o LiveUSB/LiveCD
   - **Resultado:** O sistema inicializa com suas configurações pré-definidas

## Configuração Pré-Instalação

### Benefícios de Usar o Configurador MiniOS Antes da Instalação

**Fluxo de trabalho recomendado para novos usuários:**

1. **Configuração única**: Defina todas as preferências do sistema uma vez antes da instalação
2. **Pronto para usar**: O sistema instalado inicializa com idioma, teclado e configurações de usuário corretos
3. **Sem ajustes pós-instalação**: Pule a configuração manual após o primeiro boot
4. **Experiência consistente**: Mesmas configurações em todas as instalações

**Opções de configuração disponíveis:**
- **🌍 Localização**: Idioma do sistema, localidade e fuso horário
- **⌨️ Entrada**: Layouts de teclado e opções de alternância  
- **👤 Contas**: Nome de usuário, nome completo, senhas e grupos de usuário
- **🖥️ Sistema**: Nome do host, serviços ativados/desativados
- **🔒 Segurança**: Definição de senha segura antes de conectar à internet

**Fluxo de trabalho simples:**
- Configure suas preferências uma vez antes da instalação
- Instale o MiniOS com suas configurações personalizadas
- Inicie em um sistema totalmente configurado

## Persistência Automática de Alterações

Após a instalação, o Instalador MiniOS cria um sistema no dispositivo selecionado:

- **Compatibilidade UEFI/BIOS**: Criação automática das partições de boot necessárias
- **Persistência de alterações**: Suporte completo aos modos de persistência do MiniOS
- **Sistemas de arquivos**: Suporte para ext4, Btrfs, FAT32, NTFS

### Configuração de Parâmetros (para usuários avançados)

Para configuração precisa da persistência, parâmetros de boot podem ser utilizados:

- `perchmode=native` - Salvamento direto na partição (quando houver espaço livre)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo
- `perchsize=8000` - Espaço de armazenamento para dados em MB

Detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).
