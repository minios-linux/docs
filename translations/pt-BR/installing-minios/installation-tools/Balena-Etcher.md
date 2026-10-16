---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher é um programa multiplataforma prático para gravar imagens ISO em unidades USB. Compatível com Windows, macOS e Linux.

## Importante

**Aviso:** A seleção incorreta do dispositivo causará perda de dados! Sempre confira a unidade selecionada e faça backup dos dados importantes.

## Requisitos da unidade

### Tamanho da unidade

Consulte [Guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility) para ver os requisitos detalhados do sistema e os tamanhos de unidade.

## Preparação

1. Baixe Balena Etcher no [site oficial](https://www.balena.io/etcher/)
2. Instale o programa no seu sistema operacional
3. Conecte o pendrive

## Criar um pendrive inicializável

1. Abra Balena Etcher
2. Selecione a imagem ISO do MiniOS:
   - Clique em "Flash from file"
   - Informe o caminho do arquivo ISO
3. Selecione o pendrive de destino:
   - Clique em "Select target"
   - Confira o modelo e o tamanho do dispositivo
4. Comece a gravação:
   - Clique em "Flash!"
   - Aguarde a conclusão do processo (5–15 minutos)

## Resultado e persistência

O Etcher grava a imagem em modo bruto: copia o layout da ISO para todo o dispositivo de destino. Ele não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência nem realiza a implantação do Instalador do MiniOS.

A persistência só é ativada quando uma entrada de inicialização ou a linha de comando do kernel a solicita e ainda requer armazenamento gravável adequado. Consulte [Modos de inicialização](/using-minios/Boot-Modes) e [Persistência do Initrd](/reference/boot-process/Persistence-Internals) antes de confiar que as alterações serão salvas.
