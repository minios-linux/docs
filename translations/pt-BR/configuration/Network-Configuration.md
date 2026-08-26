# Configuração de rede

Após a inicialização do MiniOS, o NetworkManager normalmente gerencia as conexões com fio e Wi-Fi. Isso é separado da rede do initramfs usada para baixar um sistema PXE ou HTTP-ISO. Em particular, o parâmetro PXE `ip=` não cria um perfil do NetworkManager nem define um endereço de sessão permanente. Consulte [Inicialização pela rede](/installation/Network-Boot.md) para informações sobre a rede no início do boot.

## Configuração da área de trabalho

Use o ícone de rede no painel da área de trabalho para selecionar uma rede Wi-Fi, desconectar ou reconectar um dispositivo, ou abrir o editor de conexões. Para um endereço estático com fio, edite a conexão com fio e defina o método IPv4 como Manual, depois insira o endereço e prefixo, gateway e servidores DNS. Defina o método como Automático (DHCP) para usar DHCP.

A interface em modo texto oferece as mesmas operações comuns:

```bash
nmtui
```

Escolha **Editar uma conexão** para alterar um perfil e **Ativar uma conexão** para ativá-la.

## Linha de comando do NetworkManager

Exiba dispositivos e perfis salvos:

```bash
nmcli device status
nmcli connection show
```

Procure redes Wi-Fi e conecte-se:

```bash
nmcli radio wifi on
nmcli device wifi list
nmcli device wifi connect "NETWORK_NAME" --ask
```

O último comando solicita a senha sem colocá-la na linha de comando. Não coloque a senha do Wi-Fi diretamente em um comando, pois ela pode permanecer no histórico do shell e pode ser visível para outros processos.

Para alterar um perfil com fio existente para DHCP:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
nmcli connection up "Wired connection 1"
```

Para atribuir um endereço IPv4 estático:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method manual ipv4.addresses 192.0.2.10/24 \
  ipv4.gateway 192.0.2.1 ipv4.dns "1.1.1.1 9.9.9.9"
nmcli connection up "Wired connection 1"
```

Substitua o nome do perfil e os endereços pelos valores da rede local. Uma conexão remota pode ser interrompida assim que o perfil ativo for alterado.

## Persistência

O NetworkManager salva os perfis do sistema em
`/etc/NetworkManager/system-connections/`. Em uma inicialização live sem persistência,
as alterações feitas pela área de trabalho, `nmcli` ou `nmtui` são perdidas ao desligar. Em uma sessão persistente, elas permanecem nessa sessão entre reinicializações. Consulte [Gerenciamento de sessões](/configuration/Session-Management.md) para selecionar e salvar sessões.

Os perfis não são compartilhados automaticamente entre sessões persistentes separadas. Perfis Wi-Fi podem conter credenciais, portanto, proteja a mídia da sessão e remova credenciais antes de compartilhar um arquivo de sessão ou saída de diagnóstico.

## Pré-configurando uma conexão com fio

O componente de rede live-config do MiniOS pode criar uma política IPv4 estática com fio antes do início dos serviços de rede. É destinado a sistemas não assistidos ou instalados. Não configura Wi-Fi.

Adicione atribuições no estilo shell em `minios/config.conf` na mídia do MiniOS ou em `/etc/live/config.conf` no sistema live:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Coloque os valores entre aspas como strings de shell e não adicione espaços ao redor de `=`. Consulte [Arquivo de configuração](/configuration/Configuration-File.md) para locais e precedência dos arquivos, e [live-config](/configuration/live-config.md) para ativação do componente e opções gerais.

As opções de boot equivalentes são:

```text
network-method=static network-interface=enp1s0 \
network-address=192.0.2.10 network-prefix=24 \
network-gateway=192.0.2.1 network-dns=1.1.1.1,9.9.9.9 \
network-backend=auto
```

As formas longas `live-config.network-*` também são aceitas. Estas são opções live-config em espaço de usuário tardio, não a sintaxe PXE `ip=`.

### Métodos

| Método | Comportamento |
|--------|--------------|
| Não definido ou `dhcp` | Não faz alterações e preserva a configuração de rede existente da imagem. Não cria configuração DHCP nem remove um perfil estático anterior do MiniOS. |
| `static` | Escreve um perfil IPv4 estático com fio. O prefixo padrão é `24`; gateway e DNS são opcionais. |
| `off` | Escreve um perfil do NetworkManager sem autoconexão com IPv4 desabilitado, ou uma seção `manual` do ifupdown. Não é um interruptor de rádio Wi-Fi. |

Apenas `static` e `off` selecionam uma interface e escrevem a configuração. Se `LIVE_NETWORK_INTERFACE` for omitido, o live-config só prossegue quando exatamente uma interface com fio, que não seja loopback, estiver disponível. Interfaces sem fio são excluídas. Use `ip link` ou `nmcli device status` para obter o nome real da interface em um sistema com múltiplas interfaces.

### Backends e validação

`LIVE_NETWORK_BACKEND` aceita:

| Backend | Comportamento |
|---------|--------------|
| `auto` ou não definido | Prefere NetworkManager e usa ifupdown como alternativa. |
| `nm` | Requer NetworkManager e grava `/etc/NetworkManager/system-connections/minios-static.nmconnection`. |
| `ifupdown` | Requer ifupdown e grava `/etc/network/interfaces.d/minios-static`. Se o NetworkManager estiver instalado, também marca a interface selecionada como não gerenciada em `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. |

Nomes de interface podem conter apenas letras, dígitos, `_`, `.`, `:` e `-`.
Endereços estáticos e gateways devem ser endereços IPv4 válidos. O prefixo deve ser um número inteiro de `0` até `32`. DNS é uma lista separada por vírgulas de endereços IPv4 ou IPv6. Valores inválidos, seleção ambígua de interface e backends indisponíveis são relatados e nenhum carimbo de sucesso é gravado.

## Alterando a política persistente do live-config

Em um sistema live persistente, o componente de rede normalmente é aplicado uma vez e registra o sucesso em `/var/lib/live/config/network`. Para aplicar configurações estáticas alteradas ou desativar:

1. Edite o `/etc/live/config.conf` persistente efetivo.
2. Remova o carimbo com `sudo rm /var/lib/live/config/network`.
3. Reinicie o sistema.

Alterar apenas a configuração na mídia removível não sobrescreve um `/etc/live/config.conf` persistente já existente.

Definir `LIVE_NETWORK_METHOD="dhcp"` não é um reset de perfil. Para voltar de um perfil estático gerenciado pelo MiniOS para o DHCP padrão do NetworkManager, remova a política estática `LIVE_NETWORK_*` da configuração efetiva, exclua o perfil gerenciado e o carimbo, e reinicie:

```bash
sudo rm -f /etc/NetworkManager/system-connections/minios-static.nmconnection
sudo rm -f /var/lib/live/config/network
```

Para o backend ifupdown, remova
`/etc/network/interfaces.d/minios-static` e
`/etc/NetworkManager/conf.d/99-minios-unmanaged.conf` em vez disso. Depois, crie ou ative um perfil DHCP com o editor gráfico, `nmtui` ou `nmcli` se o NetworkManager não criar um automaticamente.

## Comportamento do instalador

A etapa de Rede do instalador se aplica apenas à rede com fio. Uma configuração IPv4 estática selecionada é gravada para o sistema instalado. Selecionar DHCP preserva os padrões normais em vez de gravar um reset de perfil. Perfis e configurações Wi-Fi existentes permanecem inalterados.

## Diagnóstico

Comece verificando o dispositivo, endereço, rota e o estado do NetworkManager:

```bash
ip link
ip address
ip route
nmcli general status
nmcli device status
nmcli connection show --active
systemctl status NetworkManager --no-pager
```

Verifique o log de inicialização atual para erros de dispositivo, firmware, DHCP e live-config:

```bash
journalctl -b -u NetworkManager
journalctl -b | grep 'live-config: network'
dmesg
```

Para uma política live-config, também verifique as configurações efetivas, o arquivo gerado e o carimbo. O principal log do live-config é `/var/log/live/config.log`.

Teste falhas na seguinte ordem: estado do link, um endereço na interface, a rota e gateway padrão, um endereço IP externo e, por fim, um nome DNS. Isso separa problemas de dispositivo ou firmware de problemas de DHCP, roteamento e DNS. Consulte [Solução de problemas](/administration/Troubleshooting.md) para verificações mais amplas e coleta de logs.

## Veja também

- [Inicialização pela rede](/installation/Network-Boot.md)
- [Arquivo de configuração](/configuration/Configuration-File.md)
- [live-config](/configuration/live-config.md)
- [Solução de problemas](/administration/Troubleshooting.md)
- [Gerenciamento de sessões](/configuration/Session-Management.md)
