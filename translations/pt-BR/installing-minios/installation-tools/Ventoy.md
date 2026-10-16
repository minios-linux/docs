---
updated: 2026-10-15
---

# Ventoy

Ventoy é uma ferramenta popular para criar unidades USB inicializáveis, que permite armazenar vários arquivos ISO em um único dispositivo e inicializar por qualquer um deles.

## Importante

**Aviso:** A seleção incorreta do dispositivo causará perda de dados! Sempre confira novamente a unidade selecionada e faça backup dos dados importantes.

A integração atual com MiniOS oferece suporte ao modo Ventoy**normal**, incluindo imagens de persistência direta em BIOS e UEFI. Imagens mais antigas do MiniOS podem exigir o modo **GRUB2**; use esse modo se a imagem mais antiga não conseguir localizar sua origem no modo normal. O sufixo do nome de arquivo `VTGRUB2` pode forçar o modo GRUB2 para esse tipo de imagem. Ele não é um requisito universal para imagens atuais.

## Requisitos da unidade

### Tamanho da unidade

Reserve espaço para os arquivos ISO, outros dados e o armazenamento de persistência desejado. O espaço reservado de Ventoy e a capacidade da imagem de persistência são opções separadas. Consulte [Compatibilidade de hardware](/getting-started/Hardware-Compatibility) para ver os requisitos do sistema.

## Instalando Ventoy

### Método 1: instalação padrão

1. **Baixe Ventoy** no [site oficial](https://www.ventoy.net/)
2. **Execute o instalador Ventoy** e selecione seu pendrive
3. **Instale Ventoy** no drive (todos os dados serão apagados)
4. **Copie o arquivo ISO MiniOS** para a pasta raiz do pendrive

Isso cria uma mídia multiboot com arquivo ISO: Ventoy mantém o ISO como um arquivo na partição de dados e o disponibiliza na inicialização. Não se trata de gravar uma imagem MiniOS em modo raw nem de uma implantação do Instalador do MiniOS.

### Método 2: instalação com partição de dados separada (recomendado)

1. **Baixe Ventoy** no [site oficial](https://www.ventoy.net/)
2. **Execute o instalador Ventoy** e selecione seu pendrive
3. **Ative a opção "Reservar espaço"** durante a instalação para deixar espaço não alocado no final do drive
4. **Instale Ventoy** no drive
5. **Copie o arquivo ISO MiniOS** para a pasta raiz do pendrive
6. **Crie uma partição ext4** no espaço reservado com o rótulo `persistence` usando um editor de partições

Isso fornece um possível local para persistência, mas criar a partição, por si só, não ativa a persistência nem cria uma sessão.

## Integração com MiniOS

MiniOS detecta o ISO apresentado por Ventoy separadamente do armazenamento gravável. Há dois modelos de persistência; escolha um deliberadamente.

### Sessões normais MiniOS

Sem um backend de plugin de persistência Ventoy selecionado, as solicitações habituais de **Iniciar MiniOS** de entrada solicitam `perchdir=resume`. MiniOS pode usar uma partição no mesmo dispositivo ou o `persistence` partição`minios/changes/` armazenamento na partição de dados Ventoy. Para o layout com partição de dados, ative o suporte a remontagem do Linux de Ventoy em `/ventoy/ventoy.json`:

```json
{
  "control": [{ "VTOY_LINUX_REMOUNT": "1" }]
}
```

Mescle isso a uma configuração existente em vez de descartar outros plugins. Ainda é necessário ter um armazenamento adequado com permissão de gravação. Em FAT32/NTFS/exFAT, a inicialização prioriza DynBlk quando disponível e, caso contrário, usa DynFileFS. O Session Manager, as sessões numeradas, a criptografia e o salvamento de sessões RAM compatíveis seguem as regras normais de MiniOS. Uma inicialização sem solicitação de persistência permanece temporária.

### Persistence Plugin Ventoy

Como alternativa, associe o ISO a uma **imagem de persistência ext4** usando o Persistence Plugin de Ventoy. Por exemplo, uma imagem já criada em `/ventoy/minios.dat` pode ser selecionada para `/ISO/MiniOS.iso`:

```json
{
  "persistence": [
    {
      "image": "/ISO/MiniOS.iso",
      "backend": "/ventoy/minios.dat"
    }
  ]
}
```

Os caminhos são relativos à raiz da partição de dados Ventoy. Crie a imagem ext4 com as ferramentas de imagem de persistência de Ventoy e selecione-a na inicialização; apenas colocar um arquivo `.dat` no drive não a ativa. MiniOS usa o backend selecionado por Ventoy, não um dispositivo qualquer com um rótulo correspondente.

Esta imagem contém um ambiente persistente, com `changes/` e, para OverlayFS, `workdir/`. Ela não contém sessões MiniOS numeradas. Escolha outro backend em Ventoy para usar outro ambiente. O Session Manager e `minios-session` não estão disponíveis, a seleção de sessão `perchdir` é ignorada, e `perchtoram` não pode copiar este upper para RAM. Ainda é possível usar o sistema, mas isso não elimina a dependência da imagem de persistência.`toram` continua sendo possível, mas não elimina a dependência da imagem de persistência.

O primeiro uso registra o formato do union. Reutilizar a imagem com outro backend de union, usar uma imagem indisponível ou que não seja ext4, ou falhar ao ativar o armazenamento gravável gera um aviso e cria um novo upper de RAM. **Iniciar sem salvar** não abre a imagem. Consulte [Modos de inicialização](/using-minios/Boot-Modes) e [Detalhes internos da persistência](/reference/boot-process/Persistence-Internals).

## Usando MiniOS com Ventoy

### Inicialização

Depois de instalar Ventoy e copiar o arquivo ISO MiniOS para o drive:

1. **Inicialize pelo drive USB** - selecione-o no BIOS/UEFI
2. **Selecione MiniOS** na lista de arquivos ISO disponíveis no menu Ventoy
3. Selecione o modo normal para uma imagem MiniOS atual; para uma imagem mais antiga, use o modo documentado
4. **Aguarde o carregamento de MiniOS**

Após a inicialização, verifique o status da persistência antes de confiar que as alterações foram salvas. Em sessões comuns, use `sudo minios-session status`. Com o Persistence Plugin, verifique `/run/initramfs/minios-persistence/boot-state` como root: um backend ativado com sucesso registra `mode=ventoy` e `boot_level=ok`. Mantenha o drive conectado enquanto o ISO ou a imagem de persistência estiver em uso.
