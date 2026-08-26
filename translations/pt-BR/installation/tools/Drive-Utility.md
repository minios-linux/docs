---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Usando o Drive Utility

O Drive Utility é uma ferramenta gráfica para gravar imagens ISO do MiniOS em unidades USB.

**Instalação:** Disponível por padrão no MiniOS; para outras distribuições, consulte https://github.com/minios-linux/driveutility

## Importante

**Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos da Unidade

### Tamanho do Drive (para gravação do MiniOS)

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md) para requisitos detalhados de sistema e tamanhos de drive.

### Sistemas de arquivos compatíveis

- **FAT32**: máxima compatibilidade
- **NTFS**: compatibilidade com Windows
- **EXT4**: recomendado para Linux

## Iniciando o Drive Utility

**Pelo menu de aplicativos:**
1. Abra o menu → Sistema → "Drive Utility"

**Pelo terminal:**
```bash
driveutility
```

## Criando Unidade USB Inicializável

1. **Selecione o modo "Write"** na janela principal do programa
2. **Selecione o arquivo ISO do MiniOS:**
   - Clique no botão "Browse" ao lado do campo "Source"
   - Localize e selecione o arquivo MiniOS.iso baixado
3. **Selecione a unidade de destino:**
   - Escolha seu pendrive na lista de dispositivos
   - Confirme a seleção pelo tamanho e modelo
4. **Inicie a gravação:**
   - Clique no botão "Write"
   - Confirme a operação – todos os dados da unidade serão apagados
5. **Aguarde a conclusão** – o processo levará alguns minutos

## Resultado e persistência

O modo de gravação realiza uma escrita de imagem bruta: ele copia o layout do ISO para todo o dispositivo de destino. Não cria uma partição ext4 no espaço não utilizado, não cria uma sessão de persistência e não executa uma implantação do Instalador do MiniOS. As opções de sistema de arquivos acima se aplicam às operações do Drive Utility que formatam um sistema de arquivos, não ao layout de partição copiado por uma gravação de ISO.

A persistência só é habilitada quando uma entrada de boot ou linha de comando do kernel solicita, e ainda assim requer um armazenamento gravável adequado. Consulte [Modos de Boot](/configuration/Boot-Modes.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md) antes de confiar em alterações salvas.
