---
updated: 2026-08-31
---

# Rufus

Rufus é um utilitário popular para Windows que ajuda a formatar e criar unidades USB inicializáveis.

## Importante

**Aviso:** A seleção incorreta do dispositivo resultará em perda de dados! Sempre confira novamente a unidade selecionada e faça backup dos dados importantes.

## Requisitos da unidade

### Tamanho da unidade

Consulte [Guia de compatibilidade de hardware](/getting-started/Hardware-Compatibility) para ver os requisitos detalhados do sistema e os tamanhos das unidades.

## Instalando Rufus

1. **Baixe Rufus** do [site oficial](https://rufus.ie/)
2. **Execute o programa** - Rufus não precisa ser instalado, é um aplicativo portátil

## Criar uma unidade USB inicializável

Rufus pode criar mídias MiniOS de duas maneiras diferentes. O modo ISO normal é a melhor opção quando você quer que a unidade USB continue sendo um sistema de arquivos gravável comum, além de funcionar como dispositivo de inicialização.

### Método 1: modo ISO

1. **Inicie o Rufus** como administrador.
2. **Selecione a unidade USB** no campo **Dispositivo**.
3. **Selecione o arquivo ISO MiniOS** usando **SELECT**.
4. Quando Rufus perguntar como gravar a imagem híbrida, mantenha o **modo de imagem ISO**.
5. Escolha um sistema de arquivos adequado. FAT32 oferece a maior compatibilidade com firmware; o NTFS pode limitar a inicialização direta via UEFI em alguns sistemas.
6. Clique em **START** e confirme a formatação do dispositivo selecionado.

O modo ISO extrai os arquivos MiniOS para um sistema de arquivos comum. Após a instalação, o espaço livre restante ainda pode ser usado para arquivos comuns. Em geral, esse é o layout de Rufus mais conveniente para uma unidade MiniOS portátil.

### Método 2: modo DD

Escolha **modo de imagem DD** somente se você quiser especificamente uma cópia exata, bloco a bloco, do ISO publicado. Rufus então reproduz o layout do ISO no dispositivo inteiro, de forma semelhante ao modo de gravação do `dd`, do Etcher ou do Utilitário de disco.

O modo DD é simples e previsível, mas o dispositivo deixa de ter o layout normal de sistema de arquivos único e gravável esperado de uma unidade flash de uso geral.

## Resultado e persistência

O modo ISO cria uma mídia MiniOS baseada em arquivos em um sistema de arquivos gravável comum. O modo DD cria uma mídia de imagem bruta. Nenhum dos modos é uma implantação do Instalador do MiniOS, e nenhum cria automaticamente uma sessão persistente.

A persistência MiniOS pode usar armazenamento gravável adequado em uma instalação Rufus baseada em arquivos quando um modo de inicialização persistente é selecionado. Consulte [Modos de inicialização](/using-minios/Boot-Modes) e [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).
