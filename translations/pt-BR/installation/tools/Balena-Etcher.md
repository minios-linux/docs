# Usando o Balena Etcher

O Balena Etcher é um programa prático e multiplataforma para gravar imagens ISO em drives USB. Compatível com Windows, macOS e Linux.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md) para requisitos detalhados do sistema e tamanhos de drives.

## Preparação

1. Baixe o Balena Etcher no [site oficial](https://www.balena.io/etcher/)
2. Instale o programa no seu sistema operacional
3. Conecte o drive USB

## Criando um Pendrive Bootável

1. Abra o Balena Etcher
2. Selecione a imagem ISO do MiniOS:
   - Clique em "Flash from file"
   - Informe o caminho do arquivo ISO
3. Selecione o drive USB de destino:
   - Clique em "Select target"
   - Confira o modelo e tamanho do dispositivo
4. Inicie a gravação:
   - Clique em "Flash!"
   - Aguarde o término do processo (5–15 minutos)

## Resultado e persistência

O Etcher realiza uma gravação bruta da imagem: ele copia o layout do ISO para todo o dispositivo de destino. Não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência e não executa uma implantação do MiniOS Installer.

A persistência só é ativada quando uma entrada de boot ou linha de comando do kernel solicita, e ainda assim requer um armazenamento gravável adequado. Consulte [Modos de boot](/configuration/Boot-Modes.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md) antes de depender de alterações salvas.
