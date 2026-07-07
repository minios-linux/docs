# Instalando o MiniOS

Este guia descreve as várias formas de instalar o MiniOS em dispositivos de armazenamento.

## 1. Baixar o arquivo ISO do MiniOS

- Baixe o arquivo ISO do MiniOS no site oficial.

## 2. Criar um Disco de Inicialização

Escolha um dos métodos abaixo:

- [Método Original](/installation/tools/Original-Method.md)
- [Usando o Rufus](/installation/tools/Rufus.md) (Windows) (Recomendado)
- [Usando o UNetbootin](/installation/tools/UNetbootin.md) (Windows/Linux/MacOS)
- [Usando o Ventoy](/installation/tools/Ventoy.md) (Windows/Linux) (Recomendado)
- [Usando o Balena Etcher](/installation/tools/Balena-Etcher.md) (Windows/Linux/MacOS) (Recomendado)
- [Usando o `dd`](/installation/tools/dd.md) (Linux/MacOS) (Recomendado)
- [Usando o Drive Utility](/installation/tools/Drive-Utility.md) (Linux) (Recomendado)
- [Usando o Instalador do MiniOS](/installation/MiniOS-Installer.md) (Recomendado, somente MiniOS)

## 3. Inicializando pelo Disco

1.  Reinicie seu computador.
2.  Selecione o disco de inicialização no menu de boot do seu computador para inicializar por ele.

## 4. Observações

- O instalador de boot não suporta multiboot; apenas o MiniOS será inicializável pelo disco.
- Seu disco deve usar o esquema de partição `msdos` (utilize MBR, não GPT).
- O disco deve estar formatado com um dos sistemas de arquivos suportados: FAT32, NTFS, ext2, ext3, ext4, btrfs.

---


**Lembrete:** O método de instalação original não é mais a principal recomendação, pois pode ser difícil para usuários iniciantes. Ao usar o Balena Etcher, `dd` ou o Drive Utility, a partição para salvar alterações será criada automaticamente.
