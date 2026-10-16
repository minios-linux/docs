---
updated: 2026-10-15
---

# Solução de problemas

Comece observando o problema e fazendo testes reversíveis. Não reparticione, formate, repare um sistema de arquivos, exclua uma sessão nem substitua arquivos de inicialização só para ver se isso resolve. Primeiro, proteja os dados importantes.

## Verificações iniciais

1. [Verifique a imagem baixada](/installing-minios/Verifying-Downloads).
2. Inicialize **Iniciar sem salvar**. Se o problema desaparecer, investigue a sessão persistente ou sua configuração, em vez da imagem base.
3. Remova parâmetros de inicialização personalizados e filtros de módulos, a menos que sejam necessários para reproduzir o problema.
4. Experimente outra porta USB e, se possível, outro dispositivo ou computador que você saiba que funciona.
5. Anote o primeiro erro e a entrada exata do menu de inicialização, em vez de registrar apenas a última mensagem exibida na tela.
6. Verifique a [compatibilidade de hardware](/getting-started/Hardware-Compatibility) quando a mesma imagem verificada falha em uma máquina, mas funciona em outra.

## O dispositivo não chega ao menu de inicialização MiniOS

Primeiro, determine como o dispositivo MiniOS foi criado.

- Para uma imagem gravada em modo raw (`dd`, Etcher, modo DD do Rufus ou gravação de imagem com o Utilitário de disco), não repare arquivos de inicialização individualmente. Se a cópia estiver danificada, grave novamente o dispositivo inteiro a partir de uma imagem verificada.
- Para uma instalação MiniOS baseada em arquivos, recrie a estrutura inicializável usando o mesmo método de instalação documentado, em vez de copiar arquivos do GRUB, Syslinux ou EFI de outra versão.
- Ventoy tem seu próprio carregador de inicialização e estrutura. Não instale o carregador de inicialização de MiniOS em um dispositivo Ventoy; use o procedimento [Ventoy](/installing-minios/installation-tools/Ventoy) em vez disso.
- Após a conversão nativa, o destino usa um carregador de inicialização e uma estrutura de sistema de arquivos convencionais do Debian. Ele pode manter a aparência da área de trabalho MiniOS, mas a infraestrutura live e as ferramentas específicas do sistema live MiniOS não estarão mais presentes. Faça backup dos dados recuperáveis antes de usar o procedimento de reparo ou reinstalação do carregador de inicialização do Debian adequado ao modo BIOS/UEFI e à estrutura de partições.

Se um dispositivo recém-criado ainda não aparecer no menu de inicialização do firmware, verifique o modo do firmware, o suporte a Secure Boot da arquitetura selecionada, a porta ou o dispositivo USB e a [compatibilidade de hardware](/getting-started/Hardware-Compatibility).

## O menu de inicialização MiniOS aparece, mas a inicialização falha

Remova primeiro os parâmetros opcionais. Use `debug` e `timing` quando precisar de mais informações sobre as etapas iniciais da inicialização. `rd.break` serve para inspeção avançada do initramfs, não para reparos.

Se MiniOS não encontrar sua origem, consulte [Detecção do sistema](/reference/boot-process/System-Discovery). Em um shell do initramfs, algumas informações úteis e somente para leitura incluem:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Uma `from=askdisk` temporária pode ajudar a identificar o dispositivo que realmente contém os dados MiniOS. Depois, use a sintaxe documentada de `from=` em vez de tentar adivinhar os nomes dos dispositivos.

Para inicialização via PXE ou ISO por HTTP, consulte [Inicialização pela rede](/reference/boot-process/Network-Boot). A rede nas etapas iniciais da inicialização é independente do NetworkManager na sessão em execução.

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

Para uma tela preta, uma resolução inutilizável ou um loop do gerenciador de exibição:

1. Tente o `text` parâmetro de inicialização. Um console funcional permite distinguir um problema gráfico/de desktop de uma falha ocorrida anteriormente na inicialização.
2. Remova os parâmetros `xorg-driver` ou `xorg-resolution` especificados manualmente.
3. Teste **Iniciar sem salvar** para descartar uma configuração de exibição persistente.
4. Registre a GPU e o driver com `lspci -nnk`.
5. Inspecione `journalctl -b -p warning` e `dmesg --level=err,warn`.

Para máquinas virtuais, consulte [Virtualização](/maintenance-and-recovery/Virtualization).

Nas imagens Debian 13 / Devuan Excalibur XFCE, **Configurações de tela** tem um controle de **Escala da interface** com porcentagens automáticas e manuais. A opção automática segue a tela principal; uma porcentagem explícita salva substitui essa opção. Use a visualização temporizada e a confirmação, em vez de tratar a resolução de saída e a escala da interface como a mesma configuração. Os efeitos das janelas e o renderizador são configurados separadamente em **Ajustes do gerenciador de janelas → Compositor**. `xfwm4-gl` retorna ao XRender quando o OpenGL não pode ser usado; o desfoque e a Lâmpada Mágica exigem OpenGL, enquanto as animações de esmaecimento/escala e o Peek também funcionam com o XRender.

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

### Ventoy Plugin de persistência

Se o Session Manager informar que não está disponível com o Ventoy Plugin de persistência, esse é o modelo esperado de imagem única, e não metadados de sessão ausentes. Selecione outro backend em Ventoy ou inicialize sem uma imagem de plugin selecionada para usar sessões MiniOS numeradas. Um backend indisponível ou que não seja ext4, um formato de union registrado diferente ou uma ativação com permissão de gravação malsucedida faz com que MiniOS emita um aviso e continue em RAM. Verifique `/run/initramfs/minios-persistence/boot-state` e os avisos de inicialização; não crie `session.conf` manualmente dentro da imagem do plugin. Consulte [Ventoy](/installing-minios/installation-tools/Ventoy).

## Problemas de armazenamento e espaço livre

Inspecione dispositivos e pontos de montagem sem alterá-los:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Um sistema de arquivos cheio pode causar falhas nas operações de pacote, salvamentos incompletos de sessões e outros erros secundários. Libere espaço movendo ou excluindo dados conhecidos somente depois de confirmar o sistema de arquivos correto. Use o Gerenciador de sessões MiniOS para excluir sessões, em vez de remover manualmente os diretórios de sessão numerados.

Se `LIVE_APT_CACHE=volatile`, verifique também `findmnt -T /var/cache/apt/archives` e `df -h /var/cache/apt/archives`: a área de arquivamento é um sistema de arquivos RAM limitado, e um download grande pode preenchê-la mesmo quando o dispositivo USB tem espaço livre. Com `LIVE_LOG_STORAGE=volatile`, o `/var/log` comum tem um limite separado de 32 MiB RAM. O preenchimento de qualquer uma das áreas não faz com que MiniOS passe silenciosamente a gravar esses arquivos no dispositivo USB. Consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

O reparo do sistema de arquivos não é uma operação genérica de MiniOS. Se o próprio sistema de arquivos estiver danificado, desmonte-o, preserve primeiro os dados importantes ou uma imagem e use um procedimento de reparo apropriado para esse sistema de arquivos e dispositivo de armazenamento.

## Alterações em pacotes e atualizações do sistema

Se os problemas começaram após alterações em pacotes APT, lembre-se de que uma sessão persistente ativa pode substituir arquivos dos módulos MiniOS. Teste **Iniciar sem salvar** para comparar com o conjunto de módulos original. Consulte [Atualizando MiniOS](/maintenance-and-recovery/Updating-MiniOS) para entender a diferença entre a manutenção do APT e a alteração dos lançamentos MiniOS.

<a id="collecting-logs"></a>

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

Para falhas repetidas de inicialização em mídia MiniOS gravável, `EXPORT_LOGS=true` em `config.conf` exporta logs de inicialização em `minios/log/`. Consulte [config.conf](/reference/configuration/config.conf).

Em uma sessão persistente saudável`perch`, os dois logs obrigatórios de inicialização já são mantidos independentemente de `LIVE_LOG_STORAGE`:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Os `.1`, `.2`, e `.3` versões são inicializações anteriores. O ponto de montagem comum pode ser `/var/log` montado como `tmpfs` enquanto `/var/log/minios` e `/var/log/live` permanecem no armazenamento de persistência. Para SquashFS, esses logs também ficam em `minios/changes/<session-id>/boot-logs/`, fora de `changes.sb`; eles permanecem disponíveis mesmo se o snapshot de desligamento falhar. Uma ativação com falha ou não persistente `perch` não tem um destino de log persistente garantido. Com `LIVE_LOG_STORAGE=volatile`, `journalctl -b` e outros logs comuns ficam disponíveis apenas para a inicialização **atual**. Ative `minios-update-*` rastreamentos detalhados usando `LIVE_CONFIG_DEBUG=true` somente quando necessário; os erros normais ainda são relatados sem isso.

Remova credenciais, chaves privadas, segredos de Wi-Fi e outras informações privadas antes de compartilhar os logs. Para um defeito reproduzível, inclua os trechos relevantes e abra uma issue no [rastreador de issues MiniOS](https://github.com/minios-linux/minios-live/issues).

### Sessões VMDK não estão disponíveis

Atualize juntos o driver/CLI DynBlk e as ferramentas de sessão e, em seguida, recompile o
initrd de inicialização. O initrd em execução deve anunciar `vmdk-session-v1`; o instalador também
verifica todos os initrds de origem que copiará. O antigo marcador vazio DynBlk apenas
indica suporte nativo a blocos e não garante suporte à inicialização de sessões VMDK.
Não altere manualmente o modo de uma sessão existente: use uma cópia explícita ou
conversão para o outro formato.

### Liberando espaço em DynFileFS, DynBlk ou em sessões VMDK

Use o menu de contexto do Session Manager **Liberar espaço...**, ou
`minios-session reclaim ID --json`. Em sessões de texto simples, isso faz trim no
ext4 interno propriamente dito e solicita ao backend responsável que recupere o armazenamento sem realizar a movimentação de
dados ativos. DynFileFS requer a versão 4.6.0 ou posterior para essa operação.
Em sistemas de arquivos como exFAT, lacunas internas podem continuar alocadas no arquivo do host
mas reutilizáveis pelo contêiner; `--compact` é uma opção manual separada que permite
realocar dados ativos e gravar mais no dispositivo flash.
A compactação e o discard do LUKS não são ativados automaticamente. Uma sessão criptografada só pode recuperar
espaço que já seja conhecido pelo backend subjacente por meio deste comando.
