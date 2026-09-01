---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher é um programa prático e multiplataforma para gravar imagens ISO em unidades USB. Compatível com Windows, macOS e Linux.

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos da Unidade

### Tamanho da Unidade

Consulte o [Guia de Compatibilidade de Hardware](/getting-started/Hardware-Compatibility) para requisitos detalhados de sistema e tamanhos de unidade.

## Preparação

1. Baixe o Balena Etcher no [site oficial](https://www.balena.io/etcher/)
2. Instale o programa no seu sistema operacional
3. Conecte a unidade USB

## Criando um Pen Drive USB Inicializável

1. Abra o Balena Etcher
2. Selecione a imagem ISO do MiniOS:
   - Clique em "Flash from file"
   - Informe o caminho do arquivo ISO
3. Selecione a unidade USB de destino:
   - Clique em "Select target"
   - Confira o modelo e o tamanho do dispositivo
4. Inicie a gravação:
   - Clique em "Flash!"
   - Aguarde a conclusão do processo (5–15 minutos)

## Resultado e persistência

O Etcher faz uma gravação bruta da imagem: ele copia o layout ISO para todo o dispositivo de destino. Não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência nem realiza a implantação do Instalador do MiniOS.

A persistência só é ativada quando uma entrada de boot ou a linha de comando do kernel solicita, e ainda assim requer um armazenamento gravável adequado. Consulte [Modos de Boot](/using-minios/Boot-Modes) e [Persistência no Initrd](/reference/boot-process/Persistence-Internals) antes de confiar em alterações salvas.
