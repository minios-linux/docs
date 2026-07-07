# Usando o Balena Etcher

O Balena Etcher é um programa prático e multiplataforma para gravar imagens ISO em drives USB. Compatível com Windows, macOS e Linux.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de drive.

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

## Persistência Automática de Alterações

No primeiro boot, o MiniOS verificará o tipo de sistema de arquivos do drive e escolherá o modo de persistência de alterações mais adequado. Se houver espaço livre disponível, o sistema criará automaticamente uma partição ext4 para máximo desempenho.

### Configuração de Parâmetros (para Usuários Avançados)

Quando for necessário configurar a persistência de forma precisa, é possível utilizar parâmetros de boot:

- `perchmode=native` - Salvamento direto na partição (padrão, mais rápido)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo
- `perchsize=8000` - Espaço de armazenamento de dados em MB para arquivos de imagem

Mais detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).
