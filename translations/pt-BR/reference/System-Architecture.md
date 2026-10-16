---
updated: 2026-10-15
---

# Arquitetura do sistema

MiniOS inicializa um sistema operacional somente leitura montado a partir de módulos SquashFS e adiciona uma camada gravável para a sessão atual. O initramfs é responsável por localizar a mídia, selecionar os módulos e a persistência, construir o sistema de arquivos raiz, aplicar a configuração inicial e transferir o controle para o sistema init instalado.

## Descoberta na inicialização

O carregador de inicialização do BIOS ou UEFI carrega um kernel Linux e um initramfs MiniOS de `minios/boot/`. Em seguida, o initramfs localiza a árvore de dados MiniOS que contém os módulos live. A origem pode ser local, selecionada interativamente ou fornecida por uma rota de rede compatível; uma ISO local é montada em loop antes que sua árvore de dados seja usada. A precedência exata e os formatos aceitos`from=` estão documentados em [Descoberta do sistema no Initrd](/reference/boot-process/System-Discovery).

A mesma etapa de descoberta é compatível com origens HTTP ISO e PXE. A rede opcional durante a inicialização serve apenas para **carregar MiniOS pela rede** (PXE / HTTP ISO). Ela não configura uma conexão de rede persistente para a sessão. Consulte [Inicialização pela rede](/reference/boot-process/Network-Boot).

Após a descoberta, MiniOS pode preparar opcionalmente uma cópia RAM. A necessidade de manter a origem original depende do modo de cópia, da persistência e do sucesso da desconexão. Consulte [Modos de inicialização](/using-minios/Boot-Modes) para entender o funcionamento.

## Composição dos módulos

Cada arquivo `.sb` é um sistema de arquivos SquashFS somente leitura. Os módulos integrados são armazenados diretamente em `minios/`; outros locais de módulos podem contribuir para a composição ordenada. O initramfs seleciona, ordena e monta as camadas somente leitura resultantes. Os níveis de candidatos, a substituição por nome de arquivo, os filtros, as extensões personalizadas de pacotes e a coordenação com o kernel em execução estão especificados em [Carregamento de módulos no Initrd](/reference/boot-process/Module-Loading).

Uma imagem Xfce típica contém as seguintes funções ordenadas, embora os nomes e números exatos dependam da compilação e dos módulos ignorados para esse destino:

```text
00-core-<arch>.sb
01-kernel-<version>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Os módulos posteriores têm precedência maior e podem substituir caminhos fornecidos por módulos anteriores. Um módulo pode depender de arquivos de qualquer módulo com número inferior; por isso, um conjunto de arquivos de módulo é uma composição ordenada, não uma coleção de pacotes independentes.

## AUFS e OverlayFS

MiniOS usa um sistema de arquivos union para apresentar os módulos e a camada gravável como um único sistema de arquivos raiz. Ele seleciona AUFS quando o kernel em execução oferece suporte a ele e, caso contrário, recorre a OverlayFS. `union=aufs` solicita AUFS, mas ainda recorre a OverlayFS quando AUFS não está disponível; `union=overlayfs` seleciona OverlayFS. Com o Secure Boot UEFI, o initrd não carrega o módulo `aufs-ng` não assinado e usa OverlayFS, a menos que outra implementação utilizável de AUFS já esteja presente.

As duas implementações têm uma diferença operacional importante:

- AUFS começa com a ramificação gravável e adiciona os módulos montados como ramificações somente leitura. MiniOS pode ativar ou desativar um módulo na raiz em execução quando a montagem AUFS oferece suporte a essa operação.
- OverlayFS recebe a lista completa e ordenada de `lowerdir` no momento da montagem da raiz, além de um `upperdir` e `workdir`. O conjunto de módulos inferiores não pode ser alterado no local por **Gerenciador de módulos MiniOS**.

**Gerenciador de módulos MiniOS** portanto, separa **Em execução agora**, o conjunto de módulos montados, de **Na próxima inicialização**, os módulos selecionados pela mídia atual e pelas regras de inicialização. Adicionar ou remover um módulo persistente normalmente afeta apenas a próxima inicialização. Criar ou abrir um módulo não o ativa. A ativação e a desativação em tempo de execução estão disponíveis somente com AUFS.

Depois que a raiz é montada e a configuração inicial é concluída, o initrd do LiveKit usa `pivot_root`, mantém o initrd antigo para as tarefas de desligamento e executa o init da nova raiz. O caminho do dracut prepara a mesma raiz montada, mas deixa o `switch_root` final a cargo do dracut. Consulte [Carregamento de módulos do initrd](/reference/boot-process/Module-Loading) para ver os detalhes do ponto de transferência.

## Camada gravável e sessões

Sem persistência, a camada gravável é baseada em memória e desaparece ao desligar. A persistência pode, em vez disso, ativar uma sessão numerada com um backend de armazenamento compatível. Com um backend do Persistence Plugin Ventoy selecionado, MiniOS usa um único ambiente persistente ext4 direto, em vez de sessões numeradas. A seleção, a compatibilidade, as falhas de ativação, a autoridade do boot atual e a durabilidade são definidas em [Persistência no initrd](/reference/boot-process/Persistence-Internals).

| Modo | Armazenamento gravável | Observações |
|------|------------------|-------|
| `native` | Arquivos armazenados diretamente no diretório da sessão | Requer um sistema de arquivos POSIX gravável que preserve os metadados do Linux. |
| `dynfilefs` | Sistema de arquivos ext4 expansível, dividido entre arquivos de suporte | Compatível com sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `dynblk` | Sistema de arquivos ext4 thin em um dispositivo de bloco do kernel, com suporte de `volumeNNN.db` arquivos | Requer os recursos de espaço de usuário, kernel e initrd do DynBlk. |
| `vmdk` | Armazenamento esparso `volume.vmdk` dividido em partes / `volume-sNNN.vmdk` exposto como dispositivo de bloco pelo driver DynBlk | Requer o recurso de `vmdk-session-v1` DynBlk/initrd; sem compactação no backend. |
| `raw` | Arquivo de tamanho fixo `changes.img` contendo ext4 | Compatível com sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `squashfs` | Snapshot `changes.sb`compactado | Descompactado em RAM para uso; ao salvar, é recriado e substituído atomicamente. O sistema de arquivos de persistência deve preservar os metadados do Linux durante o salvamento. |

Raw, DynFileFS, DynBlk e VMDK podem incluir opcionalmente uma camada LUKS2. Os metadados registram separadamente o backend de armazenamento e a criptografia. Ao desligar, os recursos ext4, o mapeador, qualquer loop próprio e o backend são liberados na ordem de dependência.

A sessão ativa selecionada para uma retomada futura e a camada gravável efetivamente autorizada para o boot atual são estados relacionados, mas distintos. Alterar uma seleção futura não substitui a camada gravável em uso.

Consulte [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) para ver os comandos de criação, seleção, dimensionamento, criptografia, conversão, exportação e recuperação.

## Precedência da configuração

A configuração da mídia é `minios/config.conf`, com fragmentos opcionais em `minios/config.conf.d/`. As cópias em tempo de execução são `/etc/live/config.conf` e `/etc/live/config.conf.d/` na raiz composta.

No boot, MiniOS compara os horários de modificação e copia um arquivo mais recente da mídia para a raiz de tempo de execução. Se a mídia permitir gravação e a cópia em tempo de execução for mais recente, ela será copiada de volta para a mídia. Os arquivos de fragmento são sincronizados nos dois sentidos pelo nome do arquivo. Se o relógio tiver sido atrasado desde a sincronização anterior, MiniOS evita substituir os horários e apenas preenche os destinos ausentes.

As opções da linha de comando do kernel substituem os valores correspondentes lidos da configuração em tempo de execução durante aquele boot. Isso significa que a ordem efetiva para uma configuração explicitamente compatível é: parâmetro de boot, configuração sincronizada de tempo de execução/mídia e, por fim, valor padrão integrado. Edições persistentes em tempo de execução podem se tornar a configuração da mídia quando a origem permite gravação; mídias ISO somente leitura não podem receber essa atualização.

Consulte [Arquivo de configuração](/reference/configuration/config.conf) e [live-config](/reference/configuration/live-config) para ver as configurações compatíveis.

## Ciclo de desligamento e salvamento

Durante o desligamento normal, o sistema em execução tem primeiro a oportunidade de liberar os serviços e os dados da sessão. Uma sessão SquashFS com salvamento no desligamento ativado é reconstruída e validada antes da desmontagem do sistema de arquivos. O backend de salvamento grava um marcador de conclusão para a sessão exata em execução; o initramfs de desligamento verifica esse marcador e mantém a sessão como suja se o salvamento obrigatório falhar.

Em seguida, o initramfs de desligamento desconecta dispositivos loop não utilizados, desmonta a raiz antiga e a camada gravável, marca como limpa uma sessão salva com sucesso, desmonta a mídia e fecha um mapeamento LUKS pertencente a MiniOS. A mídia óptica pode então ser ejetada antes de desligar ou reiniciar. Os salvamentos manuais e periódicos de SquashFS usam o mesmo backend de snapshot, mas somente a política de desligamento configurada impede a finalização como limpa quando falta um salvamento no desligamento.

## Árvore da mídia

Uma imagem atual está organizada da seguinte forma. Os diretórios opcionais aparecem somente quando o recurso relacionado cria conteúdo.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>.sb
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

Os caminhos inicializados em `/run/initramfs/memory/` são pontos de montagem da implementação, não uma segunda cópia persistente desta árvore.

## Documentação relacionada

- [Modos de inicialização](/using-minios/Boot-Modes)
- [Detecção do sistema pelo initrd](/reference/boot-process/System-Discovery)
- [Carregamento de módulos pelo initrd](/reference/boot-process/Module-Loading)
- [Persistência do initrd](/reference/boot-process/Persistence-Internals)
- [Parâmetros de inicialização](/reference/Boot-Parameters)
- [Menus de inicialização](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Arquivo de configuração](/reference/configuration/config.conf)
- [Gerenciamento de sessão](/using-minios/Sessions-and-Persistence)
- [Inicialização pela rede](/reference/boot-process/Network-Boot)
- [Criação de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
