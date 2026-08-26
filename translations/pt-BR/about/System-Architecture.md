# Arquitetura do sistema MiniOS

O MiniOS inicializa um sistema operacional somente leitura montado a partir de módulos SquashFS e adiciona uma camada gravável para a sessão atual. O initramfs é responsável por localizar a mídia, selecionar módulos e persistência, construir o sistema de arquivos raiz, aplicar configurações iniciais e transferir o controle para o sistema de inicialização instalado.

## Descoberta do boot

O bootloader BIOS ou UEFI carrega um kernel Linux e o initramfs do MiniOS a partir de
`minios/boot/`. O initramfs então descobre a árvore de dados do MiniOS que contém
os módulos live. A origem pode ser local, selecionada interativamente ou fornecida
por um caminho de rede compatível; um ISO local é montado em loop antes de sua árvore de dados
ser utilizada. A precedência exata e os formatos aceitos de `from=` estão documentados em
[Descoberta do sistema no Initrd](/configuration/Initrd-System-Discovery.md).

A mesma etapa de descoberta suporta fontes ISO HTTP e PXE. A configuração de rede opcional no início do boot
serve apenas para **carregar o MiniOS pela rede** (PXE / ISO HTTP).
Não é uma configuração de rede persistente para a sessão. Veja
[Boot pela rede](/installation/Network-Boot.md).

Após a descoberta, o MiniOS pode, opcionalmente, preparar uma cópia em RAM. Se a fonte original continuará sendo necessária depende do modo de cópia, persistência e do sucesso no desligamento. Consulte [Modos de boot](/configuration/Boot-Modes.md) para o modelo operacional.

## Composição de módulos

Cada arquivo `.sb` é um sistema de arquivos SquashFS somente leitura. Módulos internos são armazenados
diretamente em `minios/`; locais adicionais de módulos podem contribuir para a
composição ordenada. O initramfs seleciona, ordena e monta as camadas resultantes
somente leitura. Níveis candidatos, substituição de basename, filtros, extensões de bundle personalizadas
e coordenação com o kernel em execução são especificados em
[Carregamento de módulos no Initrd](/configuration/Initrd-Module-Loading.md).

Uma imagem típica do Xfce contém os seguintes papéis ordenados, embora os nomes
exatos e quantidades dependam da build e dos módulos ignorados para aquele alvo:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Módulos posteriores têm maior precedência e podem substituir caminhos fornecidos por módulos anteriores.
Um módulo pode depender de arquivos em qualquer módulo de número inferior, então um conjunto
de arquivos de módulo é uma composição ordenada, não apenas uma coleção de
pacotes independentes.

## AUFS e OverlayFS

O MiniOS utiliza um sistema de arquivos union para apresentar os módulos e a camada gravável como um único
sistema de arquivos raiz. Ele seleciona AUFS quando o kernel em execução o suporta e recorre ao OverlayFS caso contrário. `union=aufs` solicita AUFS, mas ainda recorre ao OverlayFS quando AUFS não está disponível; `union=overlayfs` seleciona OverlayFS.

As duas implementações têm uma diferença operacional importante:

- AUFS começa com o branch gravável e adiciona os módulos montados como branches somente leitura. O MiniOS pode ativar ou desativar um módulo no root em execução quando
a montagem AUFS suporta essa operação.
- OverlayFS recebe sua lista completa e ordenada de `lowerdir` quando o root é
montado, além de um `upperdir` e `workdir`. Seu conjunto de módulos inferiores não pode ser
alterado em tempo real pelo Gerenciador de Módulos.

Por isso, o Gerenciador de Módulos separa **Executando agora**, o conjunto de módulos montados,
de **Próximo boot**, os módulos selecionados pela mídia atual e regras de boot. Adicionar
ou remover um módulo durável normalmente altera apenas o próximo boot. Criar ou
abrir um módulo não o ativa. Ativação e desativação em tempo real estão disponíveis apenas com AUFS.

Após a montagem do root e a conclusão da configuração inicial, o initrd do LiveKit usa
`pivot_root`, mantém o initrd antigo para tarefas de desligamento e executa o init do novo root. O caminho do dracut prepara o mesmo root montado, mas deixa a etapa final de `switch_root` para o dracut. Veja
[Carregamento de módulos no Initrd](/configuration/Initrd-Module-Loading.md) para detalhes
sobre o limite de transição.

## Camada gravável e sessões

Sem persistência, a camada gravável é baseada em memória e desaparece ao desligar.
A persistência pode, em vez disso, ativar uma sessão numerada com um backend de armazenamento compatível. Seleção, compatibilidade, falha na ativação, autoridade do boot atual e durabilidade estão definidos em
[Persistência no Initrd](/configuration/Initrd-Persistence.md).

| Modo | Armazenamento gravável | Observações |
|------|-----------------------|-------------|
| `native` | Arquivos armazenados diretamente no diretório da sessão | Requer um sistema de arquivos POSIX gravável que preserve metadados do Linux. |
| `dynfilefs` | Sistema de arquivos ext4 expansível dividido em arquivos de apoio | Suporta sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `raw` | `changes.img` de tamanho fixo contendo ext4 | Suporta sistemas de arquivos POSIX e mídias FAT32, NTFS ou exFAT. |
| `luks` | LUKS2 `changes.luks` contendo ext4 | Requer cryptsetup e um initramfs construído com suporte a criptografia do MiniOS. A senha é solicitada durante o boot. |
| `squashfs` | Snapshot `changes.sb` compactado | Descompactado na RAM para uso; ao salvar, reconstrói e substitui o snapshot de forma atômica. O sistema de arquivos de persistência deve preservar os metadados do Linux durante o salvamento. |

A sessão ativa selecionada para um futuro resume e a camada gravável realmente
autorizada para o boot atual são estados relacionados, porém distintos. Alterar uma seleção futura não substitui a camada gravável em execução.

Veja [Gerenciamento de sessões](/configuration/Session-Management.md) para comandos de criação,
seleção, dimensionamento, criptografia, conversão, exportação e recuperação.

## Precedência de configuração

A configuração da mídia é `minios/config.conf`, com fragmentos opcionais em `minios/config.conf.d/`. As cópias em tempo de execução são `/etc/live/config.conf` e `/etc/live/config.conf.d/` no root composto.

No boot, o MiniOS compara os horários de modificação e copia um arquivo de mídia mais recente para o root em tempo de execução. Se a mídia for gravável e a cópia em tempo de execução for mais recente, ela é copiada de volta para a mídia. Arquivos de fragmento são sincronizados pelo nome em ambas as direções. Se o relógio tiver voltado desde a última sincronização, o MiniOS evita substituir timestamps e apenas preenche destinos ausentes.

Opções da linha de comando do kernel sobrescrevem valores correspondentes lidos da configuração em tempo de execução para aquele boot. Isso significa que a ordem efetiva para uma configuração suportada explicitamente é: parâmetro de boot, depois configuração sincronizada em tempo de execução/mídia, depois o padrão embutido. Edições persistentes em tempo de execução podem se tornar a configuração da mídia quando a fonte é gravável; mídias ISO somente leitura não podem receber essa atualização.

Veja [Arquivo de configuração](/configuration/Configuration-File.md) e [live-config](/configuration/live-config.md) para as configurações suportadas.

## Ciclo de desligamento e salvamento

O desligamento normal primeiro dá ao sistema em execução a chance de gravar serviços e dados de sessão. Uma sessão SquashFS com salvamento no desligamento ativado é reconstruída e validada antes do desmontagem do sistema de arquivos. O backend de salvamento grava um marcador de conclusão para a sessão em execução exata; o initramfs de desligamento verifica esse marcador e deixa a sessão suja se o salvamento obrigatório falhar.

Em seguida, o initramfs de desligamento desconecta dispositivos de loop não utilizados, desmonta o root antigo e a camada gravável, registra uma sessão bem-sucedida como limpa, desmonta a mídia e fecha um mapeamento LUKS de propriedade do MiniOS. Mídias ópticas podem então ser ejetadas antes do desligamento ou reinicialização. Salvamentos manuais e periódicos SquashFS usam o mesmo backend de snapshot, mas apenas a política de salvamento configurada no desligamento bloqueia a finalização limpa na ausência de salvamento no desligamento.

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

- [Modos de boot](/configuration/Boot-Modes.md)
- [Descoberta do sistema no Initrd](/configuration/Initrd-System-Discovery.md)
- [Carregamento de módulos no Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistência no Initrd](/configuration/Initrd-Persistence.md)
- [Parâmetros de boot](/configuration/Boot-Parameters.md)
- [Menus de boot](/configuration/Boot-Menus.md)
- [Arquivo de configuração](/configuration/Configuration-File.md)
- [Gerenciamento de sessões](/configuration/Session-Management.md)
- [Boot pela rede](/installation/Network-Boot.md)
- [Criação de módulos](/development/Creating-Modules.md)
