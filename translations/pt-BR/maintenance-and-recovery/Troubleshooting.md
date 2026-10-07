---
updated: 2026-10-06
---

# Solução de problemas

Comece pela observação e por testes reversíveis. Não reparticione, formate, repare um sistema de arquivos, exclua uma sessão ou substitua arquivos de boot apenas para ver se resolve. Preserve primeiro os dados importantes.

## Verificações iniciais

1. [Verifique a imagem baixada](/installing-minios/Verifying-Downloads).
2. Inicie o boot **Iniciar sem salvar**. Se o problema desaparecer, investigue a sessão persistente ou sua configuração, em vez da imagem base.
3. Remova parâmetros de boot personalizados e filtros de módulos, a menos que sejam necessários para reproduzir o problema.
4. Tente outra porta USB e, se possível, outro dispositivo ou computador confiável.
5. Registre o primeiro erro e a entrada exata do menu de boot, não apenas a última mensagem exibida na tela.
6. Verifique a [compatibilidade de hardware](/getting-started/Hardware-Compatibility) quando a mesma imagem verificada falha em um computador, mas funciona em outro.

## O dispositivo não chega ao menu de boot MiniOS

Primeiro, determine como o dispositivo MiniOS foi criado.

- Para uma imagem gravada em modo bruto (`dd`, Etcher, modo DD do Rufus ou gravação de imagem pelo Utilitário de disco), não repare arquivos individuais de boot. Se a cópia estiver corrompida, regrave todo o dispositivo a partir de uma imagem verificada.
- Para uma instalação baseada em arquivos MiniOS, recrie o layout inicializável utilizando o mesmo método de instalação documentado, em vez de copiar arquivos GRUB, Syslinux ou EFI de outra versão.
- Ventoy possui seu próprio bootloader e layout. Não instale o bootloader MiniOS sobre um dispositivo Ventoy; utilize o procedimento [Ventoy](/installing-minios/installation-tools/Ventoy) em vez disso.
- Após a conversão nativa, o destino utiliza um bootloader Debian convencional e layout de sistema de arquivos padrão. Pode manter a aparência da área de trabalho MiniOS, mas a infraestrutura live e ferramentas específicas MiniOS não estarão mais presentes. Faça backup dos dados recuperáveis antes de usar o procedimento de reparo ou reinstalação do bootloader Debian adequado ao BIOS/UEFI e ao particionamento.

Se um dispositivo recém-criado ainda não aparecer no menu de boot do firmware, verifique o modo do firmware, o suporte a Secure Boot da arquitetura selecionada, a porta/dispositivo USB e a [compatibilidade de hardware](/getting-started/Hardware-Compatibility).

## O menu de boot MiniOS aparece, mas a inicialização falha

Remova primeiro os parâmetros opcionais. Use `debug` e `timing` quando for necessário obter mais informações do início do boot. `rd.break` é para inspeção avançada do initramfs, não para reparo.

Se o MiniOS não encontrar sua origem, veja [Descoberta do sistema](/reference/boot-process/System-Discovery). No shell do initramfs, informações úteis e somente leitura incluem:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Um temporário `from=askdisk` pode ajudar a identificar o dispositivo que realmente contém os dados MiniOS. Depois disso, utilize a sintaxe documentada do `from=` em vez de adivinhar nomes de dispositivos.

Para inicialização via PXE ou ISO HTTP, veja [Boot em rede](/reference/boot-process/Network-Boot). O networking inicial do boot é separado do NetworkManager da sessão em execução.

### Falhas de módulo ou root-union

Veja [Carregamento de módulos](/reference/boot-process/Module-Loading) para as regras reais de seleção e ordenação de módulos. Em especial:

- `load=` e `noload=` podem excluir módulos base ou do kernel essenciais; `noload=` vence quando ambos correspondem;
- candidatos com o mesmo nome base ocupam o mesmo slot de substituição;
- um arquivo `.sb` não garante que o arquivo seja uma imagem SquashFS válida;
- o kernel em execução deve corresponder ao módulo do kernel MiniOS e aos arquivos de boot coordenados.

Após um boot bem-sucedido, inspecione o estado real sem alterá-lo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemas de exibição

Para tela preta, resolução inadequada ou loop no gerenciador de exibição:

1. Tente o parâmetro de boot `text`. Um console funcional separa um problema gráfico/de desktop de uma falha anterior no boot.
2. Remova parâmetros especificados manualmente de `xorg-driver` ou `xorg-resolution` .
3. Teste **Iniciar sem salvar** para descartar configurações persistentes de exibição.
4. Registre a GPU e o driver com `lspci -nnk`.
5. Verifique `journalctl -b -p warning` e `dmesg --level=err,warn`.

Para máquinas virtuais, veja [Virtualização](/maintenance-and-recovery/Virtualization).

## Problemas de rede

Conexões cabeadas e Wi-Fi normais são gerenciadas pelo NetworkManager; veja [Rede](/using-minios/Networking).

Primeiro, verifique se a interface existe:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Se não existir interface, registre `lspci -nnk` ou `lsusb` e procure por erros de firmware ou driver em `dmesg`.
- Se a interface existir mas não tiver endereço, diferencie problemas de conexão/DHCP de falta de suporte de hardware.
- Se houver endereço, teste o gateway, depois um endereço IP e, em seguida, um nome DNS para separar falhas de link, roteamento e DNS.
- O parâmetro de boot `ip=` pertence ao boot de rede inicial e não configura uma conexão persistente do NetworkManager. Veja [Boot em rede](/reference/boot-process/Network-Boot).

## Problemas de persistência

Inicie o boot **Iniciar sem salvar** antes de alterar um armazenamento de persistência suspeito. Não repare nem exclua a única cópia de uma sessão enquanto ela estiver ativa.

Verifique o que o MiniOS está enxergando no momento:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Verifique o modo de boot selecionado, o espaço disponível para gravação, a compatibilidade do sistema de arquivos e a compatibilidade da sessão. As regras detalhadas de seleção estão em [Sessões e persistência](/using-minios/Sessions-and-Persistence) e [Persistência interna](/reference/boot-process/Persistence-Internals).

Se uma sessão importante não ativa `native`, `dynfilefs`, `dynblk`, `vmdk`, ou `raw` ainda estiver legível, inclusive em formato criptografado que possa ser desbloqueado, exporte-a **antes** de experimentar com o armazenamento:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Se o Session Manager não conseguir ler ou exportar a sessão, pare de gravar na origem e preserve uma cópia offline do armazenamento afetado antes de prosseguir. Para uma sessão DynBlk destacada, `dynblk inspect /path/to/volume000.db --metadata-only` e `dynblk check /path/to/volume000.db` fornecem diagnósticos de formato somente leitura; não execute em volumes ainda montados. MiniOS não define um procedimento manual universal para reconstruir segmentos DynFileFS, restaurar partes de base DynBlk, reparar um sistema de arquivos interno ou reconstruir metadados de sessão. Essa recuperação é específica do sistema de arquivos/container e só deve ser tentada em uma cópia, quando o valor dos dados justificar.

Veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) para fluxos de trabalho suportados de backup e importação de sessão.

## Problemas de armazenamento e espaço livre

Inspecione dispositivos e pontos de montagem sem alterá-los:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Um sistema de arquivos cheio pode causar falhas em operações de pacotes, salvamentos de sessão incompletos e outros erros secundários. Libere espaço movendo ou excluindo dados conhecidos apenas após confirmar o sistema de arquivos correto. Utilize o Gerenciador de sessões MiniOS para exclusão de sessões, em vez de remover diretórios de sessões numeradas manualmente.

Se `LIVE_APT_CACHE=volatile`, verifique também `findmnt -T /var/cache/apt/archives` e `df -h /var/cache/apt/archives`: a área de arquivos é um sistema de arquivos RAM limitado e um download grande pode preenchê-la mesmo que o dispositivo USB tenha espaço livre. Com `LIVE_LOG_STORAGE=volatile`, o `/var/log` comum possui um limite separado de 32 MiB para RAM. Preencher qualquer uma dessas áreas não faz com que o MiniOS passe a gravar esses arquivos no dispositivo USB de forma silenciosa. Veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

O reparo de sistema de arquivos não é uma operação genérica MiniOS. Se o sistema de arquivos estiver corrompido, desmonte-o, preserve antes os dados importantes ou uma imagem, e utilize o procedimento de reparo adequado ao sistema de arquivos e ao dispositivo de armazenamento.

## Alterações de pacotes e atualizações do sistema

Se os problemas começaram após alterações de pacotes APT, lembre-se de que uma sessão persistente live pode sobrescrever arquivos dos módulos MiniOS somente leitura. Teste **Iniciar sem salvar** para comparar com o conjunto original de módulos. Veja [Atualizando MiniOS](/maintenance-and-recovery/Updating-MiniOS) para a diferença entre manutenção APT e mudança de versões MiniOS.

## Coleta de logs

Informações úteis incluem:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Para falhas repetidas de boot em mídias MiniOS graváveis, `EXPORT_LOGS=true` em `config.conf` exporta logs de boot em `minios/log/`. Veja [config.conf](/reference/configuration/config.conf).

Em uma sessão durável saudável `perch`, os dois logs obrigatórios de inicialização já são mantidos independentemente de `LIVE_LOG_STORAGE`:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

As versões `.1`, `.2` e `.3` são boots anteriores. O ponto de montagem `/var/log` pode ser `tmpfs` enquanto `/var/log/minios` e `/var/log/live` permanecem no armazenamento de persistência. Para SquashFS, esses logs também ficam em `minios/changes/<session-id>/boot-logs/`, fora de `changes.sb`; eles sobrevivem mesmo se o snapshot de desligamento falhar. Uma ativação de `perch` falha ou não durável não garante destino de log persistente. Com `LIVE_LOG_STORAGE=volatile`, `journalctl -b` e outros logs comuns ficam disponíveis apenas para o boot **atual**. Ative rastreamentos detalhados de `minios-update-*` usando `LIVE_CONFIG_DEBUG=true` apenas quando necessário; erros normais ainda são relatados sem isso.

Remova credenciais, chaves privadas, senhas Wi-Fi e outras informações confidenciais antes de compartilhar logs. Para um defeito reproduzível, inclua os trechos relevantes e abra um chamado no [rastreador de issues MiniOS](https://github.com/minios-linux/minios-live/issues).

### Sessões VMDK não são exibidas

Atualize o driver/CLI DynBlk e as ferramentas de sessão juntos, depois reconstrua o
initrd de boot. O initrd em execução deve anunciar `vmdk-session-v1`; o Instalador também
verifica cada initrd de origem que irá copiar. O antigo marcador vazio DynBlk apenas
indica suporte nativo a bloco e não garante suporte a boot de sessão VMDK.
Não altere manualmente o modo de uma sessão existente: use uma cópia explícita ou
conversão para o outro formato.

### Liberando espaço em DynFileFS, DynBlk ou sessões VMDK

Use o menu de contexto do Session Manager **Liberar espaço...**, ou
`minios-session reclaim ID --json`. Para sessões em texto puro, isso realiza o trim do
ext4 interno real e depois solicita ao backend proprietário que recupere o espaço sem
mover dados ativos. DynFileFS exige a versão 4.6.0 ou superior para esta operação.
Em sistemas de arquivos como exFAT, lacunas internas podem permanecer alocadas ao arquivo hospedeiro
mas reutilizáveis pelo container; `--compact` é uma escolha manual separada que pode
realocar dados ativos e gravar mais no dispositivo flash. Nada ativa
compaction ou descarte LUKS automaticamente. Uma sessão criptografada só pode recuperar
espaço já conhecido pelo backend subjacente por meio deste comando.
