# Usando o Ventoy

Ventoy é uma ferramenta popular para criar pendrives bootáveis que permite armazenar múltiplos arquivos ISO em um único dispositivo e inicializar a partir de qualquer um deles.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

⚠️ **Requisito de modo de boot:** Para que o MiniOS funcione corretamente com o Ventoy, você DEVE selecionar o **modo GRUB2** ao inicializar, ou renomear seu arquivo ISO com o sufixo `VTGRUB2` (exemplo: `minios-standard-amd64_VTGRUB2.iso`) para forçar automaticamente o modo GRUB2.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md) para requisitos detalhados de sistema e tamanhos de drives.

## Instalando o Ventoy

### Método 1: Instalação Padrão

1. **Baixe o Ventoy** no [site oficial](https://www.ventoy.net/)
2. **Execute o instalador do Ventoy** e selecione seu pendrive
3. **Instale o Ventoy** no dispositivo (todos os dados serão apagados)
4. **Copie o arquivo ISO do MiniOS** para a pasta raiz do pendrive

Isso cria uma mídia multiboot de arquivos ISO: o Ventoy mantém o ISO como um arquivo na partição de dados e o apresenta na inicialização. Não é uma gravação bruta de imagem do MiniOS nem uma implantação do Instalador do MiniOS.

### Método 2: Instalação com Partição de Dados Separada (Recomendado)

1. **Baixe o Ventoy** no [site oficial](https://www.ventoy.net/)
2. **Execute o instalador do Ventoy** e selecione seu pendrive
3. **Ative a opção "Reservar Espaço"** durante a instalação para criar uma partição adicional
4. **Instale o Ventoy** no dispositivo
5. **Copie o arquivo ISO do MiniOS** para a pasta raiz do pendrive
6. **Crie uma partição ext4** no espaço reservado com o rótulo `persistence`

Isso fornece um local possível para persistência, mas apenas criar a partição não habilita a persistência nem cria uma sessão.

## Integração com o MiniOS

O MiniOS inclui suporte para detectar um ISO apresentado pelo Ventoy. A descoberta da fonte e a seleção de persistência são processos separados; o Ventoy não habilita a persistência do MiniOS por conta própria.

### Persistência

A persistência só é ativada quando uma entrada de boot ou uma linha de comando do kernel solicita. A ativação depende então de um local gravável compatível e de uma sessão utilizável; uma instalação padrão do Ventoy não garante que qualquer um deles será criado automaticamente. Veja [Modos de Boot](/configuration/Boot-Modes.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md) antes de confiar em alterações salvas.

## Usando o MiniOS com Ventoy

### Inicialização

Após instalar o Ventoy e copiar o arquivo ISO do MiniOS para o dispositivo:

1. **Inicie pelo pendrive** – selecione-o na BIOS/UEFI
2. **Selecione o MiniOS** na lista de arquivos ISO disponíveis no menu do Ventoy
3. **⚠️ IMPORTANTE: Selecione o modo GRUB2** quando solicitado pelo Ventoy
4. **Aguarde o carregamento do MiniOS**

### **Requisitos de Modo de Boot do Ventoy**

**Para o MiniOS funcionar corretamente:**
- **Modo GRUB2** – Necessário para o funcionamento correto do MiniOS

**Solução Alternativa:**
- Adicione o sufixo `VTGRUB2` ao nome do arquivo ISO (exemplo: `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Isso faz com que o Ventoy utilize automaticamente o modo GRUB2 sem solicitar
