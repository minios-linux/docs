# Pacotes e edições

O conteúdo dos pacotes do MiniOS é gerado a partir de listas de fontes condicionais. Eles variam
de acordo com a suíte da distribuição, arquitetura, sistema de inicialização, ambiente de desktop, localidade,
opções de kernel e disponibilidade de repositório. Esta página descreve a herança das edições
e conteúdos representativos; não é uma tabela exaustiva de pacotes de lançamento.

## Herança das edições

As variantes de pacotes formam uma sequência aditiva:

1. **Minimum** fornece o sistema live comum e o menor desktop selecionado.
2. **Standard** herda o Minimum e adiciona ferramentas gerais de administração, desktop e gerenciamento do MiniOS.
3. **Toolbox** herda o Standard e adiciona ferramentas de recuperação, diagnóstico, armazenamento, rede e virtualização.
4. **Ultra** herda o Toolbox e adiciona softwares de estação de trabalho, mídia, escritório e containers mais abrangentes.

Expressões condicionais podem selecionar alternativas ou omitir um pacote para uma suíte,
arquitetura, ambiente ou opção de build. Portanto, um pacote nomeado abaixo é
representativo das listas de fontes atuais, não uma garantia de que o mesmo nome de pacote binário do Debian
exista em todas as versões do MiniOS.

## Escopo do desktop e ambiente

Os pacotes de desktop vêm da cadeia de módulos ordenada do ambiente selecionado.
Os ambientes Xfce, Fluxbox, LXQt, core e debug não possuem conjuntos de módulos ou pacotes idênticos.
Os exemplos abaixo usam as listas atuais do Xfce, a menos que uma capacidade venha da lista core compartilhada.
Uma build em console ou outro desktop deve ser inspecionada separadamente.

## Conteúdos representativos

### Minimum

A composição comum do Minimum inclui configuração live do MiniOS e ferramentas de imagem, NetworkManager, SSH, suporte a teclado e localidade, firmware selecionado para o destino e utilitários para inspeção de hardware e tarefas comuns de armazenamento.
Pacotes representativos incluem `minios-tools`, `minios-image-compose`,
`minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`,
`ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill` e
`wpasupplicant`.

A cadeia Minimum do Xfce adiciona Xorg, Blackbox ou Openbox conforme selecionado pela lista de fontes, Thunar, Mousepad, painel do Xfce, sessão, configurações, componentes de desktop e gerenciador de janelas, applet desktop do NetworkManager, controles ALSA, Xarchiver, suporte a bateria e Firefox ou Firefox ESR conforme selecionado para a família de distribuição.

As utilidades do MiniOS presentes em todas as edições, incluindo o Xfce Minimum, são
`minios-tools`, `minios-image-compose`, `minios-live-config`, a integração correspondente
com systemd ou SysV init, `minios-live-config-doc` e
`minios-welcome`.

### Standard

O Standard adiciona capacidades compartilhadas como suporte a DNS, ferramentas adicionais de compressão
e sistema de arquivos, clientes de sistemas de arquivos em rede, FUSE, particionamento e criação de ISO.
Pacotes representativos incluem `dnsmasq-base`, `ncdu`, `lsof`,
`xfsprogs`, `exfatprogs` ou sua alternativa específica da suíte, `cifs-utils`,
`nfs-common`, `parted`, `7zip` e `genisoimage`.

No Xfce, as edições Standard e posteriores adicionam as utilidades gráficas e administrativas atuais do MiniOS: `minios-configurator`, `minios-installer`,
`minios-session-manager`, `minios-kernel-manager`, `minios-store`,
`minios-store-gui`, `minios-image-builder`, `minios-module-manager` e
`driveutility`. Também adicionam LightDM, integração de áudio e Bluetooth no desktop,
captura de tela, gerenciamento de tarefas, notificações e o terminal do Xfce.

### Toolbox

O Toolbox adiciona recursos de linha de comando para armazenamento, recuperação, desempenho, rede e máquinas virtuais. Exemplos atuais incluem ferramentas LVM e LUKS, Clonezilla,
Partclone, TestDisk, `gddrescue`, ferramentas ZFS quando suportadas na build, Nmap,
iperf3, QEMU, libvirt, agentes guest, fio, sysbench e relatórios de hardware.

O módulo de aplicativos do Xfce adiciona ferramentas representativas como GParted,
GSmartControl, Guymager, utilitários de resgate e disco, Wireshark, Remmina,
Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit e ferramentas gráficas
de criptografia. Os nomes exatos dependem da suíte; por exemplo, uma lista de fontes
pode usar uma entre várias alternativas de pacotes.

### Ultra

O Ultra mantém o conjunto do Toolbox e adiciona softwares de container e estação de trabalho.
Adições compartilhadas representativas incluem pacotes Docker selecionados para o repositório de destino, suporte ao Compose, `lazydocker`, ferramentas iSCSI e utilitários de namespace de usuário. A lista atual de aplicativos do Xfce adiciona LibreOffice, GIMP, Inkscape,
Blender, Audacity, OBS Studio, RawTherapee, Synaptic e pacotes de integração de desktop relacionados.

## Inspecionar o conteúdo exato da versão

O sistema em execução é a fonte oficial para os pacotes que foram realmente instalados
naquela versão. Liste os nomes e versões dos pacotes com:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Inspecione os módulos ordenados que compõem o root em execução separadamente dos
arquivos selecionados para o próximo boot. O Gerenciador de Módulos do MiniOS apresenta essas opções como
**Em execução agora** e **Próxima inicialização**. A partir de um shell, os pontos de montagem SquashFS em tempo de execução podem
ser listados com:

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Para mídia offline ou uma ISO montada, faça o inventário dos arquivos de módulos de origem diretamente:

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Para uma build de fonte, os seguintes arquivos e diretórios são os manifestos de origem e entradas de seleção oficiais:

- `linux-live/environments/<environment>/` para a cadeia de módulos ordenada.
- `linux-live/scripts/00-core/packages.list` para seleção compartilhada de edição.
- `linux-live/scripts/01-kernel/packages.list` e `02-firmware/packages.list` para adições condicionais de kernel e firmware.
- `packages.list` de cada módulo de desktop e aplicativo selecionado.
- `linux-live/build.conf` para suíte, arquitetura, ambiente, variante de pacote, sistema de init, kernel, localidade e outros valores de filtro.
- `linux-live/condinapt.map` para o significado dos prefixos de filtro de lista de pacotes.

As listas de fontes descrevem pacotes solicitados e alternativas. Apenas a imagem final e `dpkg-query` mostram o conjunto exato de dependências resolvidas e versões para uma
versão específica. A disponibilidade e os nomes dos pacotes podem mudar entre
as suítes Debian, Ubuntu e Devuan e entre ambientes de desktop.

Veja [Arquitetura do sistema](/about/System-Architecture.md) para ordenação de módulos e
[CondinAPT no MiniOS](/development/CondinAPT-MiniOS.md) para seleção condicional de pacotes.
