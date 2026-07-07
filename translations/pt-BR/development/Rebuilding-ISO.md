# Reconstruindo ISO

Este guia explica como reconstruir e personalizar imagens ISO do MiniOS utilizando as ferramentas integradas. Seja para criar versões leves, adicionar softwares personalizados ou distribuir sistemas customizados, essas ferramentas facilitam empacotar seu sistema live em um novo ISO inicializável.

## Visão Geral

O MiniOS oferece ferramentas poderosas para reconstruir imagens ISO diretamente de um sistema live em execução. Isso permite que você:

- **Remova softwares indesejados** para criar distribuições mais leves
- **Adicione módulos personalizados** com softwares adicionais
- **Crie versões especializadas** para casos de uso específicos
- **Distribua sistemas customizados** para outros usuários
- **Crie mídias de instalação** com sua configuração atual

## Início Rápido

A forma mais simples de criar um ISO a partir do seu sistema atual:

```bash
sudo sb2iso
```

Isso cria o arquivo `minios-YYYYMMDD_HHMM.iso` no diretório atual com todos os módulos carregados.

## Ferramenta Principal: sb2iso

O **sb2iso** é a ferramenta principal para reconstrução de imagens ISO. Ela lê seu sistema live atual e empacota em um arquivo ISO inicializável.

### Uso Básico

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

### Opções de Comando

| Opção | Descrição | Exemplo |
|--------|-------------|---------|
| `-e, --exclude REGEX` | Exclui arquivos/módulos que correspondam ao padrão | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Define o nome do arquivo de saída | `--name minios_custom.iso` |
| `--menu TYPE` | Define o idioma ou tipo do menu | `--menu ru_RU` ou `--menu multilang` |
| `--help` | Mostra informações de ajuda | `--help` |
| `--version` | Mostra a versão | `--version` |

### Tipos de Menu Suportados

- **multilang** (padrão) - Menu multilíngue com seleção de idioma
- **Códigos de idioma** - Menus de idioma único: `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Exemplos Práticos

### Criando Versões Leves

**Remover aplicativos pesados:**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Criar sistema apenas modo texto:**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Remover aplicativos multimídia:**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Adicionando Software Personalizado

**Adicionar ferramentas de desenvolvimento:**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Adicionar aplicativos de jogos:**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### ISOs por Idioma

**Criar ISO localizado em russo:**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Criar ISO em alemão:**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Distribuições Profissionais/Educacionais

**ISO educacional com ferramentas de aprendizado:**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**ISO empresarial:**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Fluxo de Customização Avançada

### 1. Prepare seu Sistema

Comece com um sistema MiniOS limpo e personalize-o:

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Crie Módulos Personalizados

Salve suas alterações como módulos:

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Teste seus Módulos

Antes de criar o ISO final, teste seus módulos:

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Crie o ISO Final

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Trabalhando com Módulos

### Entendendo a Numeração dos Módulos

Os módulos são carregados em ordem numérica:
- **00-core** - Sistema base (sempre incluído)
- **01-kernel** - Kernel e drivers
- **02-firmware** - Firmware de hardware
- **03-gui-base** - Componentes básicos da interface gráfica
- **04-desktop** - Ambiente de desktop
- **05-apps** - Aplicativos
- **06+** - Módulos adicionais

### Comandos de Gerenciamento de Módulos

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

## Padrões de Exclusão de Conteúdo

A opção `--exclude` utiliza expressões regulares para corresponder caminhos de arquivos. Padrões comuns:

### Exclusão de Aplicativos

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

### Exclusão de Componentes do Sistema

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

### Exclusões Combinadas

```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## Requisitos do Sistema

### Executando sb2iso

- **Sistema**: Deve estar rodando a partir do sistema live MiniOS
- **Privilégios**: Acesso root necessário (`sudo`)
- **Memória**: RAM suficiente para arquivos temporários
- **Armazenamento**: Espaço livre para o ISO de saída (tipicamente 1-4 GB)

### Requisito de Arquivos de Boot

O **sb2iso** requer que os arquivos de boot estejam disponíveis. Se você carregou o sistema na RAM, utilize:

```bash
# Boot with full RAM copy
toram=full
```

Ou garanta que os arquivos de boot estejam acessíveis na mídia original.

## Solução de Problemas

### Problemas Comuns

**"Cannot find MiniOS source directory"**
- Certifique-se de estar executando em um sistema live MiniOS
- Verifique se os arquivos de boot estão disponíveis
- Tente usar o parâmetro de boot `toram=full`

**"Required file not found"**
- Arquivos de boot podem estar ausentes
- Certifique-se de estar usando um sistema MiniOS completo

**Falha na criação do ISO**
- Verifique o espaço disponível em disco
- Confirme se você tem permissões de escrita
- Certifique-se de que nenhum arquivo está em uso durante a criação

**Módulo não incluído**
- Verifique se o arquivo do módulo existe e está legível
- Confirme o formato do módulo (.sb)
- Garanta espaço suficiente para todos os módulos

### Informações de Depuração

Ative a saída detalhada para depuração:

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Boas Práticas

### Planejando seu ISO

1. **Comece Limpo**: Inicie com um sistema MiniOS novo
2. **Teste Totalmente**: Valide todas as customizações antes de criar o ISO
3. **Documente as Alterações**: Mantenha registro das modificações feitas
4. **Considere o Tamanho**: Monitore o tamanho do ISO para distribuição

### Organização dos Módulos

1. **Agrupamento Lógico**: Agrupe softwares relacionados em módulos
2. **Numeração Adequada**: Use a numeração apropriada para os módulos
3. **Testes**: Teste cada módulo individualmente
4. **Dependências**: Entenda as dependências entre módulos

### Preparação para Distribuição

1. **Padrão de Nomenclatura**: Use nomes de ISO descritivos
2. **Documentação**: Inclua instruções de uso
3. **Suporte a Idiomas**: Considere usuários internacionais
4. **Otimização de Tamanho**: Remova componentes desnecessários

## Integração com Outras Ferramentas

### Criando Módulos Personalizados

Antes de reconstruir o ISO, você pode querer criar módulos personalizados:

- **apt2sb** - Cria módulos a partir da instalação de pacotes
- **script2sb** - Cria módulos usando scripts personalizados
- **chroot2sb** - Cria módulos de forma interativa
- **savechanges** - Salva modificações atuais do sistema

Veja o guia [Criando Módulos](/development/Creating-Modules.md) para instruções detalhadas.

### Compilando a Partir do Código-Fonte

Para personalização completa, considere compilar a partir do código-fonte:

- **minios-live** - Construa sistemas completos do zero
- **minios-cmd** - Interface simplificada de compilação

Veja o guia [Compilando o MiniOS](/development/Building-MiniOS.md) para builds a partir do código-fonte.

## Conclusão

As ferramentas de reconstrução de ISO no MiniOS oferecem uma maneira poderosa de personalizar e redistribuir sistemas Linux. Seja criando distribuições especializadas, removendo softwares indesejados ou adicionando funcionalidades personalizadas, essas ferramentas tornam simples empacotar seu sistema live em uma imagem ISO profissional.

Comece com customizações simples e avance gradualmente para distribuições mais complexas à medida que se familiariza com o sistema de módulos e as opções disponíveis.
