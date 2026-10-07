---
updated: 2026-10-06
---

# Arquitetura do sistema

MiniOS inicializa um sistema operacional somente leitura montado a partir de módulos SquashFS e adiciona uma camada gravável para a sessão atual. O initramfs é responsável por localizar a mídia, selecionar módulos e persistência, construir o sistema de arquivos raiz, aplicar configurações iniciais e transferir o controle para o sistema init instalado.

## Descoberta de boot

O bootloader BIOS ou UEFI carrega um kernel Linux e o initramfs MiniOS de `minios/boot/`. Em seguida, o initramfs descobre a árvore de dados MiniOS que contém os módulos live. A fonte pode ser local, selecionada interativamente ou fornecida por um caminho de rede suportado; uma ISO local é montada em loop antes de sua árvore de dados ser utilizada. A precedência exata e os formatos aceitos `from=` estão documentados em [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery).

A mesma etapa de descoberta suporta fontes ISO HTTP e PXE. O uso opcional de rede no início do boot serve apenas para **carregar MiniOS pela rede** (PXE / HTTP ISO). Não configura a rede da sessão de forma permanente. Consulte [Boot pela rede](/reference/boot-process/Network-Boot).

Após a descoberta, MiniOS pode, opcionalmente, preparar uma cópia RAM. Se a fonte original continuará sendo necessária depende do modo de cópia, persistência e do sucesso no desligamento da mídia. Consulte [Modos de boot](/using-minios/Boot-Modes) para o modelo operacional.

## Composição de módulos

Cada `.sb` arquivo é um sistema de arquivos SquashFS somente leitura. Os módulos internos são armazenados diretamente em `minios/`; locais adicionais de módulos podem contribuir para a composição ordenada. O initramfs seleciona, ordena e monta as camadas resultantes como somente leitura. Os níveis candidatos, substituição de nome base, filtros, extensões de bundle personalizadas e coordenação com o kernel em execução são definidos em [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading).

Uma imagem típica do Xfce contém os seguintes papéis em ordem, embora os nomes e quantidades exatos dependam da build e dos módulos ignorados para aquele destino:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Módulos posteriores têm maior precedência e podem substituir caminhos fornecidos por módulos anteriores. Um módulo pode depender de arquivos em qualquer módulo de número inferior, então um conjunto de arquivos de módulos é uma composição ordenada, não apenas um conjunto de pacotes independentes.

## AUFS e OverlayFS

MiniOS utiliza um sistema de arquivos union para apresentar os módulos e a camada gravável como um único sistema de arquivos raiz. Ele seleciona AUFS quando o kernel em execução oferece suporte e recorre a OverlayFS caso contrário. `union=aufs` solicita AUFS, mas ainda recorre a OverlayFS quando AUFS não está disponível; `union=overlayfs` seleciona OverlayFS. Em UEFI Secure Boot, o initrd não carrega o módulo não assinado `aufs-ng` e utiliza OverlayFS, a menos que outra implementação AUFS utilizável já esteja presente.

As duas implementações apresentam uma diferença operacional importante:

- AUFS começa com o ramo gravável e adiciona os módulos montados como ramos somente leitura. MiniOS pode ativar ou desativar um módulo no root em execução quando o ponto de montagem AUFS oferece suporte a essa operação.
- OverlayFS recebe sua lista completa e ordenada de `lowerdir` ao montar o root, além de um `upperdir` e `workdir`. Seu conjunto de módulos inferiores não pode ser alterado em tempo real por **Gerenciador de módulos MiniOS**.

**Gerenciador de módulos MiniOS** portanto, separa **Em execução agora**, o conjunto de módulos montados, de **Próxima inicialização**, os módulos selecionados pela mídia atual e pelas regras de boot. Adicionar ou remover um módulo persistente normalmente altera apenas a próxima inicialização. Criar ou abrir um módulo não o ativa. A ativação e desativação em tempo real estão disponíveis apenas com AUFS.

Após a montagem do root e a conclusão da configuração inicial, o initrd do LiveKit utiliza `pivot_root`, mantém o initrd antigo para tarefas de desligamento e executa o init do novo root. O caminho dracut prepara o mesmo root montado, mas deixa a etapa final de `switch_root` para o dracut. Consulte [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading) para detalhes sobre o ponto de transição.

## Camada gravável e sessões

Sem persistência, a camada gravável é mantida em memória e desaparece ao desligar. Com persistência, é possível ativar uma sessão numerada com um backend de armazenamento compatível. Seleção, compatibilidade, falha de ativação, autoridade do boot atual e durabilidade são definidos em [Persistência Initrd](/reference/boot-process/Persistence-Internals).

| Modo | Armazenamento gravável | Observações |
|------|------------------|-------|
| `native` | Arquivos armazenados diretamente no diretório da sessão | Requer um sistema de arquivos POSIX gravável que preserve os metadados do Linux. |
| `dynfilefs` | Sistema de arquivos ext4 expansível dividido em arquivos de apoio | Suporta sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `dynblk` | Sistema de arquivos ext4 fino em um dispositivo de bloco do kernel respaldado por `volumeNNN.db` arquivos | Requer suporte a userspace, kernel e initrd DynBlk. |
| `vmdk` | Armazenamento esparso dividido `volume.vmdk` / `volume-sNNN.vmdk` exposto como dispositivo de bloco pelo driver DynBlk | Requer suporte a `vmdk-session-v1` DynBlk/initrd; sem compressão de backend. |
| `raw` | Arquivo de tamanho fixo `changes.img` contendo ext4 | Suporta sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `squashfs` | Snapshot `changes.sb` compactado | Descompactado em RAM para uso; ao salvar, reconstrói e substitui o snapshot de forma atômica. O sistema de arquivos de persistência deve preservar os metadados do Linux durante o salvamento. |

Raw, DynFileFS, DynBlk e VMDK podem opcionalmente ter uma camada LUKS2. Os metadados registram separadamente o backend de armazenamento e a criptografia. O desligamento libera ext4, o mapeador, qualquer loop proprietário e o backend na ordem de dependência.

A sessão ativa selecionada para retomada futura e a camada gravável realmente autorizada para o boot atual são estados relacionados, mas distintos. Alterar a seleção futura não substitui a camada gravável em execução.

Consulte [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) para comandos de criação, seleção, dimensionamento, criptografia, conversão, exportação e recuperação.

## Precedência de configuração

A configuração da mídia é `minios/config.conf`, com fragmentos opcionais em `minios/config.conf.d/`. As cópias em tempo de execução são `/etc/live/config.conf` e `/etc/live/config.conf.d/` no root composto.

Na inicialização, MiniOS compara os horários de modificação e copia um arquivo de mídia mais recente para o root em tempo de execução. Se a mídia for gravável e a cópia de runtime for mais recente, ela é copiada de volta para a mídia. Fragmentos são sincronizados pelo nome do arquivo em ambas as direções. Se o relógio retrocedeu desde a última sincronização, MiniOS evita substituir timestamps e apenas preenche destinos ausentes.

Opções da linha de comando do kernel substituem os valores correspondentes lidos da configuração de runtime para aquele boot. Assim, a ordem efetiva para uma configuração suportada explicitamente é: parâmetro de boot, depois a configuração sincronizada de runtime/mídia, depois o padrão embutido. Edições persistentes de runtime podem se tornar a configuração da mídia se a fonte for gravável; mídias ISO somente leitura não recebem essa atualização.

Consulte [Arquivo de configuração](/reference/configuration/config.conf) e [live-config](/reference/configuration/live-config) para as configurações suportadas.

## Ciclo de desligamento e salvamento

No desligamento normal, o sistema em execução tem a chance de gravar serviços e dados de sessão. Uma sessão SquashFS com salvamento no desligamento ativado é reconstruída e validada antes da desmontagem do sistema de arquivos. O backend de salvamento grava um marcador de conclusão para a sessão exata em execução; o initramfs de desligamento verifica esse marcador e deixa a sessão suja se o salvamento exigido falhar.

O initramfs de desligamento então desconecta dispositivos de loop não utilizados, desmonta o root antigo e a camada gravável, registra uma sessão bem-sucedida como limpa, desmonta a mídia e fecha um mapeamento LUKS de propriedade MiniOS. Mídias ópticas podem ser ejetadas antes de desligar ou reiniciar. Salvamentos manuais e periódicos SquashFS usam o mesmo backend de snapshot, mas apenas a política de desligamento configurada impede a finalização limpa em caso de falta de salvamento no desligamento.

## Árvore de mídia

Uma imagem atual é organizada da seguinte forma. Diretórios opcionais aparecem apenas quando o recurso relacionado criou conteúdo.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>-<arch>.sb
    |-- 02-firmware-<arch>.sb
    |-- NN-<name>-<arch>.sb        ordered system modules
    |-- boot/                      kernels, initramfs, GRUB, and Syslinux data
    |-- changes/                   session metadata and numbered sessions
    |-- modules/                   additional next-boot modules
    |-- config.conf                main media configuration
    |-- config.conf.d/             optional configuration fragments
    |-- kernels/                   optional inactive kernel repository
    |-- userdata/                  optional linked or bound user directories
    `-- log/                       optional exported boot logs
```

Os caminhos inicializados sob `/run/initramfs/memory/` são pontos de montagem de implementação, não uma segunda cópia persistente desta árvore.

## Documentação relacionada

- [Modos de boot](/using-minios/Boot-Modes)
- [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery)
- [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading)
- [Persistência Initrd](/reference/boot-process/Persistence-Internals)
- [Parâmetros de boot](/reference/Boot-Parameters)
- [Menus de boot](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Arquivo de configuração](/reference/configuration/config.conf)
- [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence)
- [Boot pela rede](/reference/boot-process/Network-Boot)
- [Criação de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
