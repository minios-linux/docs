# Solução de problemas

Comece pela observação e testes reversíveis. Não reparticione, reformate,
repare um sistema de arquivos, exclua uma sessão ou sobrescreva arquivos de boot antes de fazer backup dos dados importantes e identificar o dispositivo com falha pelo modelo, tamanho,
sistema de arquivos e ponto de montagem.

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

## Problemas de exibição

Para tela preta, resolução ilegível ou loop no gerenciador de exibição:

1. Tente o parâmetro de boot `text`. Se um console iniciar, o sistema base inicializou
   e a falha provavelmente está na parte gráfica, X11 ou no gerenciador de exibição.
2. Remova um parâmetro `xorg-driver` ou `xorg-resolution` especificado manualmente.
3. Teste uma sessão limpa para descartar configurações de exibição persistentes.
4. Registre a GPU e o driver carregado com `lspci -nnk`.
5. Verifique erros do boot atual com `journalctl -b -p warning` e
   `dmesg --level=err,warn`.

Os controles de resolução de máquina virtual documentados como `virtres` e `novirtres`
se aplicam apenas ao ambiente Xfce. Veja
[Virtualização](/administration/Virtualization.md) para configuração específica de convidados.

## Problemas de rede

Verifique se a interface existe antes de alterar a configuração:

```bash
ip link
ip address
ip route
```

Na sessão normal em execução, inspecione o NetworkManager quando estiver presente:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Se nenhuma interface aparecer, registre a saída de `lspci -nnk` ou `lsusb` e verifique se há
  firmware ausente em `dmesg`.
- Se a interface existir mas não tiver endereço, teste o DHCP antes de inserir valores estáticos.
- Se houver endereço, teste o gateway, depois um endereço IP e depois um nome DNS para
distinguir falhas de link, roteamento e DNS.
- O instalador configura DHCP cabeado ou IPv4 estático. Perfis Wi-Fi existentes permanecem inalterados.
- O parâmetro de boot `ip=` configura o download PXE inicial, não a rede da sessão persistente. Veja [Boot pela rede](/installation/Network-Boot.md).

## Problemas de persistência

Primeiro, inicialize sem persistência e faça uma cópia completa do diretório `minios/changes`.
Não execute ferramentas de reparo contra a única cópia ou com uma sessão ativa.

Verifique o estado da sessão com:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Causas comuns incluem inicializar a entrada limpa, usar um método de gravação de ISO que
nunca configurou a persistência, espaço livre insuficiente, selecionar uma sessão de
edição ou versão diferente, incompatibilidade de sistema de arquivos e desligamento
incorreto. Veja [Gerenciamento de sessões](/configuration/Session-Management.md).

Se o MiniOS criar sessões vazias repetidamente, não conseguir retomar o DynFileFS ou relatar
erros de container, siga o guia [Recuperação de DynFileFS e dynblk](/configuration/DynFileFS-Recovery.md).
Esse guia começa com uma cópia completa e verificações somente leitura. Sessões LUKS também
exigem a senha correta e um initrd com suporte a persistência LUKS.

## Problemas de armazenamento e espaço

Identifique dispositivos e pontos de montagem sem alterá-los:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Confirme o modelo e o tamanho do dispositivo antes de qualquer operação. Um sistema de arquivos cheio pode causar
falha em atualizações, gravações incompletas de sessão e recuperação no boot. Libere espaço
movendo ou excluindo apenas dados de usuário conhecidos, sempre após fazer backup; não exclua manualmente diretórios de persistência numerados enquanto um estiver ativo. Use o Gerenciador de Sessões
ou `minios-session` para operações de sessão.

A reparação do sistema de arquivos é uma etapa posterior. Desmonte o sistema de arquivos primeiro, trabalhe em uma cópia
quando possível e utilize a ferramenta de verificação específica do sistema de arquivos. Nunca formate um
dispositivo como teste de diagnóstico.

## Coleta de logs

Registre a edição e versão do MiniOS, método de boot, modo de persistência, hardware
e etapas necessárias para reproduzir o problema. Comandos úteis incluem:

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

Remova senhas, chaves privadas, credenciais de Wi-Fi, endereços IP públicos e
outros dados sensíveis antes de compartilhar logs. `journalctl -b -1` pode mostrar o
boot anterior quando o journal é persistente.

Para falhas repetidas de boot em mídias MiniOS graváveis, defina `EXPORT_LOGS=true` no
arquivo de configuração. O MiniOS copia seus logs de boot para `minios/logs` quando a
mídia é gravável. Veja [Arquivo de configuração](/configuration/Configuration-File.md).

Ao relatar um defeito reproduzível, anexe os trechos relevantes e abra uma issue no
[MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
