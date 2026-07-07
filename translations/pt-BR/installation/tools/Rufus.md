# Usando o Rufus (Windows)

Rufus é uma ferramenta popular para Windows que auxilia na formatação e criação de pendrives USB inicializáveis.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de drive.

## Instalando o Rufus

1. **Baixe o Rufus** no [site oficial](https://rufus.ie/)
2. **Execute o programa** - O Rufus não precisa de instalação, é um aplicativo portátil

## Criando Pendrive USB Inicializável

O Rufus oferece dois métodos para gravar o MiniOS em um pendrive USB:

### Método 1: Modo DD (Recomendado)

1. **Abra o Rufus** como administrador
2. **Selecione o pendrive USB** no campo "Dispositivo"
3. **Selecione o arquivo ISO do MiniOS**:
   - Clique no botão "SELECIONAR"
   - Localize e selecione o arquivo ISO do MiniOS baixado
4. **Escolha o modo de gravação**:
   - Na janela "Imagem ISO híbrida detectada", selecione **"Gravar no modo de imagem DD"**
5. **Inicie o processo**: Clique no botão "INICIAR"
6. **Confirme a ação** - todos os dados do drive serão apagados
7. **Aguarde a conclusão** do processo de gravação

### Método 2: Modo ISO (Alternativo)

1. **Abra o Rufus** como administrador
2. **Selecione o pendrive USB** no campo "Dispositivo"
3. **Selecione o arquivo ISO do MiniOS**:
   - Clique no botão "SELECIONAR"
   - Localize e selecione o arquivo ISO do MiniOS baixado
4. **Escolha o modo de gravação**:
   - Na janela "Imagem ISO híbrida detectada", selecione **"Gravar no modo de imagem ISO"**
5. **Configure as opções**:
   - **Sistema de arquivos**: FAT32 (recomendado) ou NTFS
   - ⚠️ **Ao escolher NTFS**: a inicialização em modo EFI pode não estar disponível
6. **Inicie o processo**: Clique no botão "INICIAR"
7. **Confirme a formatação** - todos os dados do drive serão apagados

## Persistência Automática de Alterações

O MiniOS detecta automaticamente o método de gravação e configura a persistência de alterações:

- **Modo DD**: Se houver espaço livre, será criada uma partição ext4 para máximo desempenho
- **Modo ISO**: Utiliza um arquivo dinâmico para salvar alterações

### Configuração de Parâmetros (para Usuários Avançados)

Quando for necessária uma configuração precisa de persistência, podem ser usados parâmetros de inicialização:

- `perchmode=native` - Salvamento direto na partição (para modo DD)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo
- `perchsize=8000` - Tamanho do espaço de armazenamento de dados em MB

Mais detalhes em [parâmetros de inicialização](/configuration/Boot-Parameters.md).
