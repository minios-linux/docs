---
updated: 2026-08-31
---

# Solução de problemas

Comece com observação e testes reversíveis. Não reparticione, formate, repare um sistema de arquivos, exclua uma sessão ou substitua arquivos de boot apenas para ver se resolve. Preserve primeiro os dados importantes.

## Primeiras verificações

1. [Verifique a imagem baixada](/installing-minios/Verifying-Downloads).
2. Inicialize com **Iniciar sem salvar**. Se o problema desaparecer, investigue a sessão persistente ou sua configuração, em vez da imagem base.
3. Remova parâmetros de boot personalizados e filtros de módulos, a menos que sejam necessários para reproduzir o problema.
4. Experimente outra porta USB e, se possível, outro dispositivo ou computador já testado.
5. Registre o primeiro erro e a entrada exata do menu de boot, e não apenas a última mensagem exibida na tela.
6. Verifique a [Compatibilidade de hardware](/getting-started/Hardware-Compatibility) se a mesma imagem verificada falhar em uma máquina, mas funcionar em outra.

## O dispositivo não acessa o menu de boot do MiniOS

Primeiro, determine como o dispositivo MiniOS foi criado.

- Para uma imagem gravada de forma bruta (`dd`, Etcher, modo DD do Rufus ou gravação de imagem pelo Utilitário de disco), não repare arquivos de boot individualmente. Se a cópia estiver corrompida, regrave o dispositivo completo a partir de uma imagem verificada.
- Para uma instalação baseada em arquivos MiniOS, recrie a estrutura inicializável usando o mesmo método de instalação documentado, em vez de copiar arquivos GRUB, Syslinux ou EFI de outra versão.
- O Ventoy possui seu próprio bootloader e layout. Não instale o bootloader MiniOS sobre um dispositivo Ventoy; utilize o procedimento [Ventoy](/installing-minios/installation-tools/Ventoy).
- Após a conversão nativa, o destino utiliza um bootloader Debian convencional e layout de sistema de arquivos padrão. Ele pode manter a aparência da área de trabalho MiniOS, mas a infraestrutura live e as ferramentas específicas do modo live MiniOS não estarão mais presentes. Faça backup dos dados recuperáveis antes de usar o procedimento de reparo ou reinstalação do bootloader Debian adequado ao BIOS/UEFI e ao layout de partição.

Se um dispositivo recém-criado ainda não aparecer no menu de boot do firmware, verifique o modo do firmware, o suporte ao Secure Boot da arquitetura selecionada, a porta/dispositivo USB e a [compatibilidade de hardware](/getting-started/Hardware-Compatibility).

## O menu de boot MiniOS aparece, mas a inicialização falha

Remova primeiro os parâmetros opcionais. Use `debug` e `timing` quando for necessário obter mais informações do início do boot. `rd.break` é destinado à inspeção avançada do initramfs, não para reparo.

Se MiniOS não conseguir localizar sua origem, veja [Descoberta do sistema](/reference/boot-process/System-Discovery). Em um shell do initramfs, informações úteis e somente leitura incluem:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Um `from=askdisk` temporário pode ajudar a identificar o dispositivo que realmente contém os dados MiniOS. Depois disso, utilize a sintaxe documentada de `from=` em vez de adivinhar nomes de dispositivos.

Para inicialização via PXE ou ISO HTTP, veja [Boot pela rede](/reference/boot-process/Network-Boot). O networking no início do boot é separado do NetworkManager na sessão em execução.

### Falhas de módulo ou root-union

Veja [Carregamento de módulos](/reference/boot-process/Module-Loading) para as regras reais de seleção e ordenação de módulos. Em especial:

- `load=` e `noload=` podem excluir módulos essenciais de base ou do kernel; `noload=` prevalece quando ambos coincidem;
- candidatos com o mesmo basename ocupam o mesmo slot de substituição;
- um arquivo chamado `.sb` não garante que o arquivo seja uma imagem SquashFS válida;
- o kernel em execução deve corresponder ao módulo de kernel MiniOS coordenado e aos arquivos de boot.

Após um boot bem-sucedido, inspecione o estado real sem alterá-lo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemas de vídeo

Para tela preta, resolução inadequada ou loop do gerenciador de exibição:

1. Experimente o parâmetro de boot `text`. Um console funcional separa um problema de vídeo/desktop de uma falha anterior de boot.
2. Remova parâmetros `xorg-driver` ou `xorg-resolution` especificados manualmente.
3. Teste **Iniciar sem salvar** para descartar configurações persistentes de vídeo.
4. Registre a GPU e o driver com `lspci -nnk`.
5. Inspecione `journalctl -b -p warning` e `dmesg --level=err,warn`.

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
- Se houver endereço, teste o gateway, depois um endereço IP e, por fim, um nome DNS para separar falhas de link, roteamento e DNS.
- O parâmetro de boot `ip=` pertence ao boot de rede inicial e não configura uma conexão persistente do NetworkManager. Veja [Boot pela rede](/reference/boot-process/Network-Boot).

## Problemas de persistência

Inicialize com **Iniciar sem salvar** antes de alterar um armazenamento de persistência suspeito. Não repare nem exclua a única cópia de uma sessão enquanto ela estiver ativa.

Verifique o que MiniOS está vendo no momento:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Verifique o modo de boot selecionado, espaço disponível para gravação, compatibilidade do sistema de arquivos e compatibilidade da sessão. As regras detalhadas de seleção estão em [Sessões e persistência](/using-minios/Sessions-and-Persistence) e [Internals da persistência](/reference/boot-process/Persistence-Internals).

Se uma sessão importante `native`, `dynfilefs`, `raw` ou `luks` que não esteja em uso ainda for legível, exporte-a **antes** de fazer experimentos com o armazenamento:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Se o Session Manager não conseguir ler ou exportar a sessão, pare de gravar na origem e preserve uma cópia offline do armazenamento afetado antes de qualquer outra ação. MiniOS não define um procedimento manual universal para reconstruir segmentos DynFileFS, reparar um sistema de arquivos interno ou reconstruir metadados de sessão. Essa recuperação é específica do sistema de arquivos/container e só deve ser tentada em uma cópia, quando o valor dos dados justificar.

Veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) para fluxos de trabalho suportados de backup e importação de sessões.

## Problemas de armazenamento e espaço livre

Inspecione dispositivos e pontos de montagem sem alterá-los:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Um sistema de arquivos cheio pode causar falhas em operações de pacotes, salvamentos de sessão incompletos e outros erros secundários. Libere espaço movendo ou excluindo dados conhecidos somente após confirmar o sistema de arquivos correto. Use o Gerenciador de sessões MiniOS para exclusão de sessões, em vez de remover manualmente diretórios de sessões numerados.

O reparo do sistema de arquivos não é uma operação genérica MiniOS. Se o próprio sistema de arquivos estiver danificado, desmonte-o, preserve primeiro os dados importantes ou uma imagem, e utilize um procedimento de reparo apropriado para aquele sistema de arquivos e dispositivo de armazenamento.

## Alterações de pacotes e atualizações do sistema

Se os problemas começaram após alterações de pacotes APT, lembre-se de que uma sessão persistente ao vivo pode sobrescrever arquivos dos módulos MiniOS somente leitura. Teste **Iniciar sem salvar** para comparar com o conjunto original de módulos. Veja [Atualizando MiniOS](/maintenance-and-recovery/Updating-MiniOS) para a diferença entre manutenção APT e troca de versões MiniOS.

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

Para falhas recorrentes de boot em mídias graváveis MiniOS, `EXPORT_LOGS=true` em `config.conf` exporta logs de boot em `minios/log/`. Veja [config.conf](/reference/configuration/config.conf).

Remova credenciais, chaves privadas, senhas Wi-Fi e outras informações confidenciais antes de compartilhar logs. Para um defeito reproduzível, inclua os trechos relevantes e abra uma issue no [issue tracker do MiniOS](https://github.com/minios-linux/minios-live/issues).
