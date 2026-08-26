---
updated: 2026-08-26
---

# Solução de problemas

Comece com observação e testes reversíveis. Não reparticione, reformate,
repare um sistema de arquivos, exclua uma sessão ou sobrescreva arquivos de boot antes de fazer backup dos dados importantes e identificar o dispositivo com falha pelo modelo, tamanho,
sistema de arquivos e ponto de montagem.

Use [Backup e recuperação](/administration/Backup-Recovery.md) antes de realizar ações destrutivas
e [Recuperação de boot](/administration/Boot-Recovery.md) quando firmware,
bootloader, kernel ou arquivos de boot instalados estiverem envolvidos.

## Verificações iniciais

1. Verifique o ISO baixado usando
   [Verificando downloads](/installation/Verifying-Downloads.md).
2. Teste uma inicialização limpa sem persistência. Isso separa problemas do sistema base e
   de hardware de uma sessão danificada ou incompatível.
3. Experimente outra porta USB e, se possível, outro dispositivo já testado.
4. Anote exatamente a entrada do menu de boot, quaisquer parâmetros adicionados e o primeiro erro,
   não apenas a falha final.
5. Consulte [Compatibilidade de hardware](/installation/Hardware-Compatibility.md) e
   o guia da ferramenta utilizada para gravar o dispositivo.

## Problemas de boot

Se o dispositivo não aparecer no menu de boot do firmware, verifique se ele foi
preparado para UEFI, BIOS legado ou ambos. Desative temporariamente o fast boot do firmware,
tente o menu de boot único do firmware e teste outra porta antes de regravar
o dispositivo. Não altere a tabela de partições do disco interno para diagnosticar um problema de boot via USB.

Se o menu de boot do MiniOS aparecer mas a inicialização falhar:

- Inicie uma sessão limpa sem `perch`, `perchdir` ou `perchmode`.
- Remova parâmetros opcionais e filtros de módulos.
- Confirme que o ISO e a mídia gravada não estão corrompidos.
- Registre o erro completo. Os parâmetros `debug` e `timing` adicionam saída do boot;
  `rd.break` abre um shell initramfs para diagnóstico avançado.
- Se os dados do MiniOS não puderem ser encontrados, verifique o valor de `from` e o caminho do dispositivo em
  [Parâmetros de boot](/configuration/Boot-Parameters.md).

Para inicialização via PXE ou ISO HTTP, utilize o guia dedicado
[Boot pela rede](/installation/Network-Boot.md). O networking inicial de boot é
separado do NetworkManager na sessão em execução.

### Falhas na origem do MiniOS

Consulte [Descoberta de sistema Initrd](/configuration/Initrd-System-Discovery.md) para as regras completas de precedência e caminhos das origens. Os detalhes mais úteis durante o diagnóstico são:

- Um valor literal `from=http://...` tem prioridade sobre `ip=`; em seguida, `ip=` fornece o endereço HTTP estático do ISO. Caso contrário, qualquer `ip=` não vazio seleciona PXE. Nenhum desses caminhos de rede faz fallback para mídia local.
- A descoberta local faz 45 tentativas e testa nomes de dispositivos de bloco em ordem alfabética. Ela mantém o primeiro dispositivo que contém uma origem qualificada, não necessariamente o dispositivo desejado ou um conjunto completo de módulos.
- `/dev/disk/by-label/LABEL/path` é suportado em `from=`. Caminhos UUID, PARTUUID e by-id não são suportados por esse parser.
- A sintaxe exata de caminho personalizado para o seletor usa dois-pontos, por exemplo `from=askdisk:custom:dir`. A sintaxe com barra testa silenciosamente o caminho padrão `minios`.
- Se a descoberta entrar no shell fatal do initramfs, sair dele não corrige a origem nem fornece fallback. Apenas permite que o boot continue para uma falha posterior, menos clara.

No shell do initramfs, comece com inspeção somente leitura:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Registre o primeiro erro de origem, montagem ou download. Não execute reparo de sistema de arquivos nem remova a mídia enquanto ela estiver montada.

### Falhas de módulo e raiz

Consulte [Carregamento de módulos Initrd](/configuration/Initrd-Module-Loading.md) para regras de seleção, ordenação e união. Verifique primeiro estas causas comuns:

- `load=` e `noload=` são filtros de expressão regular. Não há conjunto protegido de núcleo ou kernel, então um filtro pode excluir `00-core` ou o módulo `01-kernel` do kernel em execução; `noload=` tem prioridade quando ambos os filtros coincidem.
- Os caminhos dos módulos são reduzidos ao nome do arquivo. Dois candidatos com o mesmo nome ocupam um único slot de substituição, então um tier de origem posterior pode substituir o candidato anterior em vez de adicionar outra camada.
- Um sufixo `.sb` não garante que o candidato seja uma imagem SquashFS válida. Falhas de montagem individual por loop ou módulo podem permitir que o boot continue com uma camada ausente. Registre o primeiro erro de montagem.
- `toram=full` e `toram=trim` não verificam previamente a RAM disponível. Falhas de cópia ou de desconexão podem deixar a origem original montada, então não remova a mídia ou desconecte HTTP apenas porque `toram` foi especificado.

Após uma transferência bem-sucedida, estes comandos inspecionam o estado sem alterá-lo:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

Para seleção e falhas da camada gravável, veja
[Persistência Initrd](/configuration/Initrd-Persistence.md). A persistência pode recorrer a uma camada superior temporária em RAM após algumas falhas de ativação, enquanto a falha ao construir a união raiz leva ao shell fatal do initramfs.

## Problemas de exibição

Para tela preta, resolução ilegível ou loop do gerenciador de exibição:

1. Tente o parâmetro de boot `text`. Se um console iniciar, o sistema base inicializou e a falha provavelmente está na parte gráfica, X11 ou no gerenciador de exibição.
2. Remova um parâmetro `xorg-driver` ou `xorg-resolution` especificado manualmente.
3. Teste uma sessão nova para descartar configuração persistente de exibição.
4. Registre a GPU e o driver carregado com `lspci -nnk`.
5. Verifique erros do boot atual com `journalctl -b -p warning` e
   `dmesg --level=err,warn`.

Os controles de resolução em máquina virtual documentados como `virtres` e `novirtres` se aplicam apenas ao ambiente Xfce. Veja
[Virtualização](/administration/Virtualization.md) para configuração específica de convidados.

## Problemas de rede

Para configuração normal de rede cabeada e Wi-Fi, persistência e comandos do NetworkManager, veja
[Configuração de rede](/configuration/Network-Configuration.md).

Verifique se a interface existe antes de alterar a configuração:

```bash
ip link
ip address
ip route
```

Para a sessão em execução normalmente, inspecione o NetworkManager quando estiver presente:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Se nenhuma interface aparecer, registre a saída de `lspci -nnk` ou `lsusb` e verifique firmware ausente em `dmesg`.
- Se a interface existir mas não tiver endereço, teste DHCP antes de inserir valores estáticos.
- Se houver endereço, teste o gateway, depois um endereço IP e depois um nome DNS para distinguir falhas de link, roteamento e DNS.
- O instalador configura DHCP cabeado ou IPv4 estático. Perfis Wi-Fi existentes permanecem inalterados.
- O parâmetro de boot `ip=` configura download PXE inicial, não a rede da sessão persistente. Veja [Boot por rede](/installation/Network-Boot.md).

## Problemas de persistência

Inicialize primeiro sem persistência e faça uma cópia completa do diretório `minios/changes`. Não execute ferramentas de reparo na única cópia nem em uma sessão ativa.

Verifique o estado da sessão com:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Causas comuns incluem inicializar a entrada "fresh", usar um método de gravação de ISO que nunca configurou persistência, espaço livre insuficiente, selecionar uma sessão de edição ou versão diferente, incompatibilidade de sistema de arquivos e desligamento incorreto. Veja [Gerenciamento de sessão](/configuration/Session-Management.md).

Se o MiniOS criar sessões vazias repetidamente, não conseguir retomar o DynFileFS ou relatar erros de container, siga o guia [Recuperação de DynFileFS e dynblk](/configuration/DynFileFS-Recovery.md).
Esse guia começa com uma cópia completa e verificações somente leitura. Sessões LUKS também exigem a senha correta e um initrd com suporte a persistência LUKS.

## Problemas de armazenamento e espaço

Identifique dispositivos e pontos de montagem sem alterá-los:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Confirme o modelo e o tamanho do dispositivo antes de qualquer operação. Um sistema de arquivos cheio pode causar falhas em atualizações, gravações incompletas de sessão e recuperação na inicialização. Libere espaço movendo ou excluindo apenas dados de usuário conhecidos, sempre após fazer backup; não exclua manualmente diretórios de persistência numerados enquanto um estiver ativo. Use o Gerenciador de Sessão ou `minios-session` para operações de sessão.

O reparo do sistema de arquivos é uma etapa posterior. Desmonte o sistema de arquivos primeiro, trabalhe em uma cópia quando possível e use a ferramenta de verificação específica do sistema de arquivos. Nunca formate um dispositivo como teste de diagnóstico.

## Coletar logs

Registre a edição e versão do MiniOS, método de boot, modo de persistência, hardware e etapas para reproduzir o problema. Comandos úteis incluem:

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

Remova senhas, chaves privadas, credenciais de Wi-Fi, endereços IP públicos e outros dados sensíveis antes de compartilhar logs. `journalctl -b -1` pode mostrar o boot anterior quando o journal é persistente.

Para falhas de boot repetidas em mídias MiniOS graváveis, defina `EXPORT_LOGS=true` no arquivo de configuração. O MiniOS copia seus logs de boot para um diretório com data e hora em `minios/log/` quando a mídia é gravável. Veja [Arquivo de configuração](/configuration/Configuration-File.md).

Ao relatar um defeito reproduzível, anexe os trechos relevantes e abra uma issue no [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
