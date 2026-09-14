---
updated: 2026-09-13
---

# Solução de problemas

Comece observando e realizando testes reversíveis. Não faça reparticionamento, formatação, reparo de sistema de arquivos, exclusão de sessão ou substituição de arquivos de boot apenas para testar se resolve. Primeiro, faça backup dos dados importantes.

## Primeiras verificações

1. [Verificar a imagem baixada](/installing-minios/Verifying-Downloads).
2. Inicializar **Iniciar sem salvar**. Se o problema desaparecer, investigue a sessão persistente ou sua configuração, em vez da imagem base.
3. Remova parâmetros de inicialização personalizados e filtros de módulos, a menos que sejam necessários para reproduzir o problema.
4. Tente outra porta USB e, se possível, outro dispositivo ou computador já testado.
5. Registre o primeiro erro e a entrada exata do menu de boot, em vez de apenas a última mensagem exibida na tela.
6. Verifique [Compatibilidade de hardware](/getting-started/Hardware-Compatibility) quando a mesma imagem verificada falha em uma máquina, mas funciona em outra.

## O dispositivo não acessa o menu de boot MiniOS

Primeiro, determine como o dispositivo MiniOS foi criado.

- Para uma imagem gravada de forma bruta (`dd`, Etcher, modo DD do Rufus ou gravação de imagem pelo Utilitário de disco), não repare arquivos de boot individualmente. Se a cópia estiver corrompida, regrave todo o dispositivo a partir de uma imagem verificada.
- Para uma instalação baseada em arquivos MiniOS, recrie a estrutura inicializável usando o mesmo método de instalação documentado, em vez de copiar arquivos GRUB, Syslinux ou EFI de outra versão.
- O Ventoy possui seu próprio bootloader e layout. Não instale o bootloader MiniOS sobre um dispositivo Ventoy; utilize o [procedimento Ventoy](/installing-minios/installation-tools/Ventoy) em vez disso.
- Após a conversão nativa, o destino utiliza um bootloader e layout de sistema de arquivos convencionais do Debian. Pode manter a aparência da área de trabalho MiniOS, mas a infraestrutura live e as ferramentas específicas do modo live MiniOS não estarão mais presentes. Faça backup dos dados recuperáveis antes de usar o procedimento de reparo ou reinstalação do bootloader Debian adequado ao BIOS/UEFI e ao layout de partição.

Se um dispositivo recém-recriado ainda não aparecer no menu de boot do firmware, verifique o modo do firmware, o suporte ao Secure Boot da arquitetura selecionada, a porta/dispositivo USB e a [compatibilidade de hardware](/getting-started/Hardware-Compatibility).

## O menu de boot MiniOS aparece, mas a inicialização falha

Remova primeiro os parâmetros opcionais. Use `debug` e `timing` quando precisar de mais informações do início da inicialização. `rd.break` é para inspeção avançada do initramfs, não para reparo.

Se o MiniOS não conseguir encontrar sua origem, consulte [Descoberta do sistema](/reference/boot-process/System-Discovery). No shell do initramfs, informações úteis e somente leitura incluem:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Um `from=askdisk` temporário pode ajudar a identificar o dispositivo que realmente contém os dados MiniOS. Depois disso, use a sintaxe documentada de `from=` em vez de tentar adivinhar os nomes dos dispositivos.

Para inicialização via PXE ou ISO HTTP, consulte [Inicialização pela rede](/reference/boot-process/Network-Boot). A rede no início do boot é separada do NetworkManager na sessão em execução.

### Falhas de módulo ou root-union

Consulte [Carregamento de módulo](/reference/boot-process/Module-Loading) para as regras de seleção e ordenação de módulos. Em especial:

- `load=` e `noload=` podem excluir módulos base ou de kernel essenciais; `noload=` vence quando ambos correspondem;
- candidatos com o mesmo basename ocupam o mesmo slot de substituição;
- um arquivo `.sb` não prova que o arquivo é uma imagem SquashFS válida;
- o kernel em execução deve corresponder ao módulo de kernel MiniOS coordenado e aos arquivos de boot.

Após um boot bem-sucedido, inspecione o estado atual sem alterá-lo:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Problemas de exibição

Para tela preta, resolução inadequada ou loop no gerenciador de exibição:

1. Tente o parâmetro de boot `text`. Um console funcional separa um problema gráfico/de desktop de uma falha anterior na inicialização.
2. Remova os parâmetros `xorg-driver` ou `xorg-resolution` definidos manualmente.
3. Teste **Iniciar sem salvar** para descartar configurações de exibição persistentes.
4. Registre a GPU e o driver com `lspci -nnk`.
5. Verifique `journalctl -b -p warning` e `dmesg --level=err,warn`.

Para máquinas virtuais, veja [Virtualização](/maintenance-and-recovery/Virtualization).

## Problemas de rede

Conexões cabeadas e Wi-Fi comuns são gerenciadas pelo NetworkManager; veja [Rede](/using-minios/Networking).

Primeiro, verifique se a interface existe:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Se não houver interface, registre `lspci -nnk` ou `lsusb` e procure por erros de firmware ou driver em `dmesg`.
- Se a interface existir, mas não tiver endereço, diferencie problemas de conexão/DHCP de falta de suporte ao hardware.
- Se houver endereço, teste o gateway, depois um endereço IP e, em seguida, um nome DNS para separar falhas de link, roteamento e DNS.
- O parâmetro de boot `ip=` pertence ao boot de rede inicial e não configura uma conexão persistente no NetworkManager. Veja [Boot pela rede](/reference/boot-process/Network-Boot).

## Problemas de persistência

Inicializar **Iniciar sem salvar** antes de alterar um armazenamento de persistência suspeito. Não repare nem exclua a única cópia de uma sessão enquanto ela estiver ativa.

Verifique o que MiniOS está vendo no momento:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Confira o modo de inicialização selecionado, o espaço disponível para gravação, a compatibilidade do sistema de arquivos e a compatibilidade da sessão. As regras detalhadas de seleção estão em [Sessões e persistência](/using-minios/Sessions-and-Persistence) e [Internals da persistência](/reference/boot-process/Persistence-Internals).

Se uma sessão importante que não está em execução `native`, `dynfilefs`, `dynblk`, `raw`, ou `luks` ainda estiver legível, exporte-a **antes de** experimentar com o armazenamento:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Se o Session Manager não conseguir ler ou exportar a sessão, pare de gravar na origem e faça uma cópia offline do armazenamento afetado antes de continuar. Para uma sessão dynblk destacada, `dynblk inspect /path/to/volume000.db` e `dynblk check /path/to/volume000.db` fornecem diagnósticos de formato somente leitura; não execute em um volume que ainda esteja conectado. MiniOS não define um procedimento manual universal para reconstruir segmentos DynFileFS, restaurar partes de apoio dynblk, reparar um sistema de arquivos interno ou reconstruir metadados de sessão. Essa recuperação é específica do sistema de arquivos/container e só deve ser tentada em uma cópia, quando o valor dos dados justificar.

Veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) para fluxos de trabalho de backup e importação de sessão suportados.

## Problemas de armazenamento e espaço livre

Inspecione dispositivos e pontos de montagem sem alterá-los:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Um sistema de arquivos cheio pode causar falhas em operações de pacotes, salvamento de sessões incompleto e outros erros secundários. Libere espaço movendo ou excluindo dados conhecidos somente após confirmar o sistema de arquivos correto. Use o Gerenciador de sessões MiniOS para excluir sessões, em vez de remover manualmente diretórios de sessões numerados.

O reparo do sistema de arquivos não é uma operação genérica de MiniOS. Se o próprio sistema de arquivos estiver danificado, desmonte-o, salve primeiro os dados importantes ou uma imagem, e utilize um procedimento de reparo adequado para aquele sistema de arquivos e dispositivo de armazenamento.

## Alterações de pacotes e atualizações do sistema

Se os problemas começaram após alterações de pacotes APT, lembre-se de que uma sessão persistente ao vivo pode sobrescrever arquivos dos módulos MiniOS somente leitura. Teste **Iniciar sem salvar** para comparar com o conjunto original de módulos. Veja [Atualizando MiniOS](/maintenance-and-recovery/Updating-MiniOS) para entender a diferença entre manutenção via APT e mudança de versões MiniOS.

## Coletando logs

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

Para falhas repetidas de boot em mídias MiniOS graváveis, `EXPORT_LOGS=true` em `config.conf` exporta os logs de boot em `minios/log/`. Veja [config.conf](/reference/configuration/config.conf).

Remova credenciais, chaves privadas, senhas de Wi-Fi e outras informações confidenciais antes de compartilhar os logs. Para um defeito reproduzível, inclua os trechos relevantes e abra um chamado no [rastreador de issues MiniOS](https://github.com/minios-linux/minios-live/issues).
