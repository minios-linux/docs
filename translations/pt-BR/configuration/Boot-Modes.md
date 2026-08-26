# Modos de boot do MiniOS

Os modos de boot descrevem de onde o sistema live é carregado, se sua camada gravável é temporária ou persistente, e se o MiniOS copia sua fonte para a RAM. Eles não definem um firmware ou protocolo de bootloader diferente. GRUB, Syslinux, Ventoy ou um carregador PXE iniciam o mesmo pipeline básico do MiniOS no early-userspace ao carregar o kernel e o initramfs com a linha de comando do kernel.

Use esta página para escolher um modo e entender as dependências resultantes. Para as opções individuais de linha de comando, consulte [Parâmetros de boot](/configuration/Boot-Parameters.md). Para as entradas fornecidas por uma imagem, veja [Menus de boot](/configuration/Boot-Menus.md).

## Firmware, bootloader e early userspace

O firmware e o bootloader são executados antes que o MiniOS possa inspecionar módulos live ou sessões. BIOS ou UEFI iniciam um bootloader local, ou o firmware de rede inicia um carregador PXE. Esse carregador seleciona e carrega o kernel e o initramfs do MiniOS e repassa sua linha de comando. O Ventoy também faz parte dessa camada: ele apresenta um ISO através do seu próprio ambiente de boot antes do early userspace do MiniOS descobri-lo.

O kernel então inicia o initramfs do MiniOS. Esse early userspace descobre a fonte live, prepara cópias opcionais na RAM e persistência, monta os módulos e constrói o sistema de arquivos raiz. Um rótulo de menu como Fresh Start ou Resume Previous Session é, portanto, principalmente uma escolha conveniente de parâmetros do initramfs, não uma implementação separada de bootloader.

Instalações nativas são diferentes. Elas inicializam um root Linux convencional expandido com o GRUB e initramfs do sistema instalado. Não utilizam o pipeline modular live descrito abaixo.

## Sequência de boot live

O pipeline live segue esta ordem:

1. **Carregar o kernel e o initramfs.** O bootloader selecionado pelo firmware carrega ambos os arquivos e fornece a linha de comando do kernel. Neste ponto, nenhum root SquashFS do MiniOS foi montado.
2. **Descobrir a fonte.** O initramfs procura dispositivos de bloco locais, segue um local `from=` explícito, monta um ISO local em loop, monta um ISO via HTTP ou baixa o conjunto de dados PXE. Descoberta da fonte e da persistência são operações relacionadas, mas distintas.
3. **Copiar para a RAM quando solicitado.** Os comandos `toram` e `toram=full` copiam toda a árvore de dados do MiniOS, conforme o tratamento de persistência. `toram=trim` copia apenas os módulos selecionados e as configurações necessárias. O initramfs então tenta desanexar a fonte original. Apenas a cópia concluída não garante que o desanexamento foi bem-sucedido.
4. **Selecionar persistência.** Se persistência foi solicitada, o initramfs resolve o local e a sessão de persistência, verifica e prepara sua camada gravável. Retomar, criar nova ou seleção interativa diferem apenas em como essa sessão é escolhida ou criada. Sem persistência, a camada gravável é baseada em memória.
5. **Reconciliar o conjunto de kernel em execução.** O kernel já está rodando e não pode ser alterado neste estágio. O MiniOS verifica se a árvore de dados ativa possui o módulo `01-kernel`, a imagem do kernel e o initramfs correspondentes ao kernel em execução. Se o conjunto completo correspondente existir no repositório de kernels inativos, o MiniOS tenta ativá-lo e move outros conjuntos ativos para o repositório. Isso é reconciliação de arquivos, não fallback ou troca de kernel em tempo real.
6. **Montar módulos.** Arquivos `.sb` selecionados da árvore de dados do MiniOS e qualquer armazenamento de módulo gravável aplicável são ordenados, filtrados por `load=` e `noload=`, e montados em loop como somente leitura.
7. **Construir AUFS ou OverlayFS.** O MiniOS combina os módulos montados com uma camada gravável. O AUFS adiciona os módulos montados em ordem como ramos somente leitura. O OverlayFS recebe a lista completa de diretórios inferiores ordenados, além dos diretórios upper e work quando o root é montado. A união resultante é o sistema de arquivos root live.
8. **Aplicar `rootcopy` e executar `minios-boot`.** Arquivos sob o diretório `rootcopy/` da fonte são copiados para o root montado. O initramfs então executa `minios-boot` em um chroot para sincronizar a configuração do MiniOS e aplicar ajustes de early userspace no boot. Também prepara `fstab` e executa um hook opcional `rootcopy/run/preinit.sh` antes da transferência.
9. **Transferir para o userspace normal.** O LiveKit usa `pivot_root` para a transferência final, enquanto o dracut prepara o mesmo root montado e executa o `switch_root` final. O sistema de init instalado então inicia os serviços normais e a sessão desktop ou console. Configurações de rede buscadas antecipadamente não são configurações de rede duráveis para o userspace.

Os contratos detalhados de descoberta, módulos e persistência estão documentados em [Descoberta do sistema Initrd](/configuration/Initrd-System-Discovery.md), [Carregamento de módulos Initrd](/configuration/Initrd-Module-Loading.md) e [Persistência Initrd](/configuration/Initrd-Persistence.md).

## Matriz de modos

| Modo | Fonte live | Camada gravável | Dependência da fonte após o boot |
|------|-------------|----------------|------------------------------|
| Fresh local | Árvore local `minios/` ou ISO local | RAM temporária | Permanece a menos que uma cópia `toram` não persistente solicitada a desanexe com sucesso. |
| Persistent resume | Armazenamento de persistência local ou explicitamente selecionado | Sessão compatível existente quando disponível | Fonte e armazenamento de persistência normalmente permanecem em uso. Retomar não garante a recuperação de toda sessão ausente ou danificada. |
| Persistent new | Armazenamento de persistência gravável | Sessão numerada recém-alocada | Fonte e armazenamento de persistência permanecem em uso. Criação requer armazenamento gravável compatível e espaço suficiente. |
| Persistent choose | Escolha interativa de local e sessão de persistência | Sessão selecionada ou recém-criada | Depende da fonte e do armazenamento de persistência selecionados. A seleção não torna uma sessão incompatível segura. |
| Bare ou full `toram` | Qualquer fonte live detectável | RAM temporária, a menos que persistência também seja solicitada | Bare `toram` significa `toram=full`. A mídia é removível apenas após o desanexamento bem-sucedido da fonte não persistente. |
| Trim `toram` | Qualquer fonte live detectável | RAM temporária, a menos que persistência também seja solicitada | Copia apenas o conjunto de módulos filtrados e os dados necessários. A mesma condição de desanexamento se aplica. |
| Local ISO ou Ventoy | ISO montado em loop ou ISO apresentado pelo Ventoy | RAM temporária ou sessão selecionada separadamente | O ISO e os mapeamentos subjacentes permanecem necessários a menos que o `toram` não persistente os desanexe com sucesso. |
| HTTP ISO | ISO montado via `httpfs2` por HTTP | RAM temporária ou sessão selecionada separadamente | O caminho de busca e a rede permanecem relevantes enquanto o root estiver em httpfs; `toram` pode remover essa dependência apenas se o desanexamento for bem-sucedido. |
| PXE | Kernel e initramfs do carregador, dados MiniOS baixados pelo initramfs | RAM temporária ou sessão selecionada separadamente | A rede inicial serve para carregar dados, não para política de rede da sessão. As dependências exatas dependem do que foi baixado e montado. |
| Instalação nativa | Root instalado expandido, não módulos live `.sb` | Sistemas de arquivos instalados normais | Não utiliza descoberta live, sessões live, `toram`, união de módulos ou este pipeline de handoff live. |

## Combinações e limites

Fonte, persistência e cópia para RAM são eixos separados. Um diretório local, ISO local, ISO HTTP ou fonte de dados PXE pode fornecer módulos live. A persistência pode então ser omitida, retomada, criada ou selecionada onde suportado. `toram=full` ou `toram=trim` podem ser solicitados com uma fonte live compatível.

Persistência e `toram` podem aparecer juntos, mas isso não equivale ao contrato de operação persistente comum. O MiniOS copia os dados da sessão solicitada para a árvore de dados na RAM antes de configurar a persistência. Não presuma que gravações posteriores serão salvas de volta no armazenamento original, nem remova a mídia com base apenas na opção `toram`. O limite de mídia removível é mais restrito: a remoção só é segura após o MiniOS desanexar com sucesso uma cópia RAM **não persistente** da fonte original. Se o desanexamento falhar, a fonte permanece montada. Para Ventoy, o MiniOS libera seus mapeamentos apenas após esse desanexamento não persistente bem-sucedido; a limpeza dos mapeamentos é feita por melhor esforço.

`toram=trim` respeita os filtros de seleção de módulos, então um módulo excluído não estará disponível apenas porque a mídia original ainda existe. O modo full `toram` exige RAM suficiente para os dados copiados, enquanto o modo trim ainda precisa de RAM suficiente para o conjunto selecionado e a carga gravável. Nenhum dos modos garante que uma máquina com pouca memória irá inicializar com segurança.

HTTP ISO e PXE pertencem ao initramfs. Um `from=http://...` literal tem precedência e pode usar `ip=` para endereçamento estático antecipado. Sem essa fonte HTTP ISO, um `ip=` não vazio seleciona o caminho de dados PXE e ignora a descoberta de mídia local. Não é um endereço estático para o desktop em execução. HTTP ISO suporta `http://`, não `https://`. Se um root HTTP não foi desanexado para a RAM, uma reconfiguração de rede posterior pode interromper sua fonte. Veja [Boot pela rede](/installation/Network-Boot.md) antes de combinar carregamento de rede com alterações de rede no userspace.

A persistência requer um destino gravável e modo adequados. Mídias somente leitura não podem hospedar uma nova sessão, persistência criptografada não se torna descriptografada automaticamente se a ativação falhar, e a aceitação interativa não elimina riscos de compatibilidade de sessão. Use [Gerenciamento de sessões](/configuration/Session-Management.md) para modos de armazenamento, compatibilidade e regras de recuperação.

## Guia de decisão

| Objetivo | Comece com | Verifique antes de confiar |
|------|------------|----------------------------|
| Testar o MiniOS sem manter alterações | Fresh local | Sessões existentes não são selecionadas; a mídia de origem permanece em uso. |
| Continuar o trabalho normalmente | Persistent resume | O destino de persistência é gravável e a sessão é compatível. |
| Manter uma sessão antiga e iniciar limpo | Persistent new | Há espaço suficiente e o sistema de arquivos suporta o modo de persistência escolhido. |
| Selecionar entre vários ambientes de trabalho | Persistent choose | Você pode identificar o dispositivo e a sessão desejados; revise os avisos de compatibilidade. |
| Remover a mídia local de boot após a inicialização | `toram` ou `toram=trim` não persistentes | Aguarde o desanexamento bem-sucedido da fonte. Não presuma sucesso apenas pelo rótulo do menu. |
| Reduzir o uso de RAM ao copiar para a RAM | `toram=trim` | O resultado `load=` e `noload=` contém todos os módulos necessários ao sistema. |
| Inicializar um ISO armazenado em disco local ou dispositivo Ventoy | Descoberta de ISO local | Mantenha o sistema de arquivos host e os mapeamentos disponíveis, a menos que o desanexamento seja confirmado. |
| Carregar um ISO de um servidor web | HTTP ISO | Rede cabeada no initramfs, HTTP simples disponível e acesso contínuo à fonte. |
| Carregar dados do MiniOS da infraestrutura de implantação | PXE | Sintaxe correta do `ip=` do MiniOS e uma interface cabeada suportada; não trate isso como configuração de rede do userspace. |
| Executar o MiniOS como sistema instalado convencional | Instalação nativa | Siga a documentação de instalação e recuperação nativa, não procedimentos de sessão live ou `toram`. |

Quando um boot falha antes de montar o root live, identifique primeiro se a falha está no firmware/bootloader, descoberta da fonte, persistência, montagem de módulos ou construção do root. Evite comandos de reparo até conhecer o layout do armazenamento. Veja [Recuperação de boot](/administration/Boot-Recovery.md).

## Documentação relacionada

- [Descoberta do sistema Initrd](/configuration/Initrd-System-Discovery.md)
- [Carregamento de módulos Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistência Initrd](/configuration/Initrd-Persistence.md)
- [Parâmetros de boot](/configuration/Boot-Parameters.md)
- [Menus de boot](/configuration/Boot-Menus.md)
- [Boot pela rede](/installation/Network-Boot.md)
- [Gerenciamento de sessões](/configuration/Session-Management.md)
- [Arquitetura do sistema](/about/System-Architecture.md)
- [Recuperação de boot](/administration/Boot-Recovery.md)
