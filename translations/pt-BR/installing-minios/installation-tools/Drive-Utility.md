---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Utilitário de disco

O Utilitário de disco é uma ferramenta gráfica para gravar imagens ISO MiniOS em unidades USB.

**Instalação:** Disponível no MiniOS por padrão; para outras distribuições, consulte https://github.com/minios-linux/driveutility

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive (para gravação do MiniOS)

Consulte o [Guia de Compatibilidade de Hardware](/getting-started/Hardware-Compatibility) para requisitos detalhados de sistema e tamanhos de drives.

### Sistemas de Arquivos Suportados

- **FAT32**: máxima compatibilidade
- **NTFS**: compatibilidade com Windows
- **EXT4**: recomendado para Linux

## Iniciando o Utilitário de disco

**Pelo menu de aplicativos:**
1. Abra o menu → Sistema → "Utilitário de disco"

**Pelo terminal:**
```bash
driveutility
```

## Criando um Pen Drive USB Bootável

1. **Selecione o modo "Gravar"** na janela principal do programa
2. **Selecione o arquivo ISO do MiniOS:**
   - Clique no botão "Procurar" ao lado do campo "Origem"
   - Localize e selecione o arquivo MiniOS.iso baixado
3. **Selecione o drive de destino:**
   - Escolha seu drive USB na lista de dispositivos
   - Verifique a seleção pelo tamanho e modelo
4. **Inicie a gravação:**
   - Clique no botão "Gravar"
   - Confirme a operação – todos os dados do drive serão apagados
5. **Aguarde a conclusão** – o processo levará alguns minutos

## Resultado e persistência

O modo de gravação realiza uma gravação de imagem bruta: ele copia o layout do ISO para todo o dispositivo de destino. Não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência e não executa a implantação do Instalador do MiniOS. As opções de sistema de arquivos acima se aplicam às operações do Utilitário de disco que formatam um sistema de arquivos, e não ao layout de partição copiado por uma gravação de ISO.

A persistência só é ativada quando uma entrada de boot ou linha de comando do kernel solicita, e ainda assim requer um armazenamento gravável adequado. Consulte [Modos de boot](/using-minios/Boot-Modes) e [Persistência do Initrd](/reference/boot-process/Persistence-Internals) antes de depender das alterações salvas.
