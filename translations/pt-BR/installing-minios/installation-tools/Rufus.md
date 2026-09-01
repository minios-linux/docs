---
updated: 2026-08-31
---

# Rufus

Rufus é uma ferramenta popular para Windows que auxilia na formatação e criação de unidades USB bootáveis.

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira cuidadosamente a unidade selecionada e faça backup dos dados importantes.

## Requisitos da Unidade

### Tamanho da Unidade

Consulte o [Guia de Compatibilidade de Hardware](/getting-started/Hardware-Compatibility) para requisitos detalhados de sistema e tamanhos de unidade.

## Instalando o Rufus

1. **Baixe o Rufus** no [site oficial](https://rufus.ie/)
2. **Execute o programa** - o Rufus não requer instalação, é um aplicativo portátil

## Criando um Pen Drive USB Inicializável

Rufus pode criar mídias MiniOS de duas formas diferentes. O modo ISO normal é a melhor escolha quando você deseja que o pen drive USB continue sendo um sistema de arquivos gravável comum, além de funcionar como dispositivo de boot.

### Método 1: modo ISO

1. **Abra o Rufus** como administrador.
2. **Selecione o pen drive USB** no campo **Dispositivo**.
3. **Selecione o arquivo ISO MiniOS** com **SELECIONAR**.
4. Quando o Rufus perguntar como gravar a imagem híbrida, mantenha o **modo Imagem ISO**.
5. Escolha um sistema de arquivos adequado. FAT32 oferece a maior compatibilidade com firmwares; NTFS pode limitar o boot direto via UEFI em alguns sistemas.
6. Clique em **INICIAR** e confirme a formatação do dispositivo selecionado.

O modo ISO extrai os arquivos MiniOS para um sistema de arquivos normal. Após a instalação, o espaço livre restante ainda pode ser usado para arquivos comuns. Este geralmente é o layout Rufus mais conveniente para um pen drive MiniOS portátil.

### Método 2: modo DD

Escolha o **modo DD Image** apenas quando você realmente precisar de uma cópia exata, bloco a bloco, do ISO publicado. Rufus então reproduz a estrutura do ISO em todo o dispositivo, de forma semelhante ao `dd`, Etcher ou ao modo de gravação do Utilitário de disco.

O modo DD é simples e previsível, mas o dispositivo deixa de ter o layout padrão de sistema de arquivos único e gravável, esperado de um pendrive de uso geral.

## Resultado e persistência

O modo ISO cria mídia de MiniOS baseada em arquivos em um sistema de arquivos gravável normal. O modo DD cria mídia de imagem bruta. Nenhum dos modos é uma implantação do Instalador do MiniOS, e nenhum cria automaticamente uma sessão persistente.

A persistência do MiniOS pode usar um armazenamento gravável adequado em uma instalação baseada em arquivos do Rufus quando um modo de boot persistente é selecionado. Veja [Modos de boot](/using-minios/Boot-Modes) e [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).
