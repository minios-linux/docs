---
updated: 2026-08-26
---

# Arquitetura do sistema

MiniOS inicializa um sistema operacional somente leitura montado a partir de módulos SquashFS e adiciona uma camada gravável para a sessão atual. O initramfs é responsável por localizar a mídia, selecionar módulos e persistência, construir o sistema de arquivos raiz, aplicar a configuração inicial e transferir o controle para o sistema init instalado.

## Descoberta de boot

O bootloader BIOS ou UEFI carrega um kernel Linux e o initramfs MiniOS a partir de `minios/boot/`. O initramfs então descobre a árvore de dados MiniOS que contém os módulos live. Uma fonte pode ser local, selecionada interativamente ou fornecida por um caminho de rede suportado; um ISO local é montado em loop antes que sua árvore de dados seja usada. A precedência exata e os formatos aceitos de `from=` estão documentados em [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery).

A mesma etapa de descoberta suporta fontes HTTP ISO e PXE. A rede opcional de early-boot serve apenas para **carregar MiniOS pela rede** (PXE / HTTP ISO). Não é uma configuração de rede de sessão durável. Veja [Boot pela rede](/reference/boot-process/Network-Boot).

Após a descoberta, MiniOS pode opcionalmente preparar uma cópia RAM. Se a fonte original continua necessária depende do modo de cópia, persistência e do sucesso no desanexamento. Veja [Modos de boot](/using-minios/Boot-Modes) para o modelo operacional.

## Composição de módulos

Cada arquivo `.sb` é um sistema de arquivos SquashFS somente leitura. Módulos embutidos são armazenados diretamente em `minios/`; locais adicionais de módulos podem contribuir para a composição ordenada. O initramfs seleciona, ordena e monta as camadas resultantes somente leitura. Níveis candidatos, substituição de basename, filtros, extensões de bundle personalizadas e coordenação com o kernel em execução são especificados em [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading).

Uma imagem típica do Xfce contém os seguintes papéis ordenados, embora nomes e quantidades exatos dependam da build e dos módulos pulados para aquele alvo:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Módulos posteriores têm maior precedência e podem substituir caminhos fornecidos por módulos anteriores. Um módulo pode depender de arquivos em qualquer módulo de número inferior, então um conjunto de arquivos de módulos é uma composição ordenada, não apenas uma coleção de pacotes independentes.

## AUFS e OverlayFS

MiniOS utiliza um sistema de arquivos union para apresentar os módulos e a camada gravável como um único sistema de arquivos raiz. Ele seleciona AUFS quando o kernel em execução o suporta e recorre ao OverlayFS caso contrário. `union=aufs` solicita AUFS, mas ainda recorre ao OverlayFS quando AUFS não está disponível; `union=overlayfs` seleciona OverlayFS.

As duas implementações têm uma diferença operacional importante:

- AUFS começa com o branch gravável e adiciona módulos montados como branches somente leitura. MiniOS pode ativar ou desativar um módulo no root em execução quando o mount AUFS suporta essa operação.
- OverlayFS recebe sua lista completa e ordenada de `lowerdir` quando o root é montado, além de um `upperdir` e `workdir`. Seu conjunto de módulos inferiores não pode ser alterado em tempo real pelo **Gerenciador de Módulos MiniOS**.

O **Gerenciador de Módulos MiniOS** portanto separa **Em execução agora**, o conjunto de módulos montados, de **Próxima inicialização**, os módulos selecionados pela mídia atual e regras de boot. Adicionar ou remover um módulo durável normalmente altera apenas a próxima inicialização. Criar ou abrir um módulo não o ativa. Ativação e desativação em tempo real estão disponíveis apenas com AUFS.

Após o root ser montado e a configuração inicial concluída, o initrd LiveKit usa `pivot_root`, mantém o antigo initrd para tarefas de desligamento e executa o init do novo root. O caminho dracut prepara o mesmo root montado, mas deixa a finalização `switch_root` para o dracut. Veja [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading) para detalhes do processo de transição.

## Camada gravável e sessões

Sem persistência, a camada gravável é mantida em memória e desaparece ao desligar. A persistência pode ativar uma sessão numerada com um backend de armazenamento suportado. Seleção, compatibilidade, falha na ativação, autoridade do boot atual e durabilidade são definidos em [Persistência no Initrd](/reference/boot-process/Persistence-Internals).

| Modo | Armazenamento gravável | Observações |
|------|-----------------------|-------------|
| `native` | Arquivos armazenados diretamente no diretório da sessão | Requer um sistema de arquivos POSIX gravável que preserve os metadados do Linux. |
| `dynfilefs` | Sistema de arquivos ext4 expansível dividido em arquivos de apoio | Suporta sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `raw` | `changes.img` de tamanho fixo contendo ext4 | Suporta sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `luks` | LUKS2 `changes.luks` contendo ext4 | Requer cryptsetup e um initramfs construído com suporte a criptografia MiniOS. A senha é solicitada durante o boot. |
| `squashfs` | Snapshot `changes.sb` compactado | Descompactado em RAM para uso; ao salvar, reconstrói e substitui o snapshot de forma atômica. O sistema de arquivos de persistência deve preservar os metadados do Linux durante o salvamento. |

A sessão ativa selecionada para um futuro resume e a camada gravável realmente autorizada para o boot atual são estados relacionados, porém distintos. Alterar uma seleção futura não substitui a camada gravável em execução.

Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) para comandos de criação, seleção, dimensionamento, criptografia, conversão, exportação e recuperação.

## Precedência de configuração

A configuração da mídia é `minios/config.conf`, com fragmentos opcionais em `minios/config.conf.d/`. As cópias em tempo de execução são `/etc/live/config.conf` e `/etc/live/config.conf.d/` no root composto.

No boot, MiniOS compara os horários de modificação e copia um arquivo de mídia mais recente para o root em tempo de execução. Se a mídia for gravável e a cópia runtime for mais recente, ela é copiada de volta para a mídia. Arquivos de fragmentos são sincronizados pelo nome em ambas as direções. Se o relógio retrocedeu desde a sincronização anterior, MiniOS evita a substituição do timestamp e apenas preenche destinos ausentes.

Opções da linha de comando do kernel sobrescrevem valores correspondentes lidos da configuração runtime para aquele boot. Isso significa que a ordem efetiva para uma configuração explicitamente suportada é o parâmetro de boot, depois a configuração runtime/mídia sincronizada e, por fim, o padrão embutido. Edições persistentes em runtime podem se tornar a configuração da mídia quando a fonte é gravável; mídias ISO somente leitura não podem receber essa atualização.

Veja [Arquivo de configuração](/reference/configuration/config.conf) e [live-config](/reference/configuration/live-config) para as configurações suportadas.

## Ciclo de desligamento e salvamento

O desligamento normal primeiro dá ao sistema em execução a chance de gravar serviços e dados de sessão. Uma sessão SquashFS com salvamento no desligamento ativado é reconstruída e validada antes do desmontar do sistema de arquivos. O backend de salvamento grava um marcador de conclusão para a sessão em execução exata; o initramfs de desligamento verifica esse marcador e deixa a sessão suja se o salvamento obrigatório falhar.

O initramfs de desligamento então desanexa dispositivos de loop não utilizados, desmonta o root antigo e a camada gravável, registra uma sessão bem-sucedida como limpa, desmonta a mídia e fecha um mapeamento LUKS de propriedade MiniOS. Mídias ópticas podem então ser ejetadas antes do desligamento ou reinicialização. Salvamentos manuais e periódicos SquashFS usam o mesmo backend de snapshot, mas apenas a política de desligamento configurada bloqueia a finalização limpa se faltar o salvamento no desligamento.

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

Os caminhos inicializados sob `/run/initramfs/memory/` são montagens de implementação, não uma segunda cópia persistente desta árvore.

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
- [Criando módulos](/preparing-and-customizing/Managing-Modules)
