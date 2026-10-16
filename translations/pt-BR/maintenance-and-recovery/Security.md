---
updated: 2026-10-15
---

# Segurança

Os controles de segurança do MiniOS são projetados para o sistema em execução: sessões temporárias, sessões persistentes, mídias removíveis e configuração de inicialização. O Instalador do MiniOS também pode realizar uma conversão nativa. O sistema resultante mantém o ambiente de desktop selecionado e a identidade visual do MiniOS, mas o software específico do MiniOS é removido. Por isso, proteja e mantenha o sistema usando as ferramentas padrão do Debian, em vez de tratá-lo como outro modo live.
Proteja a sessão em execução, os dados persistentes, a mídia de inicialização e qualquer configuração aplicada na inicialização.

## Comece com uma mídia confiável

Baixe o MiniOS de uma fonte oficial e verifique o ISO antes de gravá-lo.
Siga as instruções de [Verificação de downloads](/installing-minios/Verifying-Downloads) e compare o resultado antes de inicializar ou instalar. A verificação detecta downloads danificados ou substituídos; ela não comprova que um dispositivo USB já modificado é seguro.

Mantenha o dispositivo USB sob controle físico. Senhas de firmware e uma ordem de inicialização restrita podem reduzir inicializações não autorizadas casuais, mas não criptografam os arquivos do dispositivo. O Secure Boot pode oferecer proteção adicional à cadeia de inicialização em imagens e hardwares compatíveis; verifique o comportamento da versão e do firmware em questão, em vez de presumir que há suporte.

## Altere as credenciais padrão

Uma imagem live do MiniOS sem personalização usa as credenciais publicadas `live` / `evil` e `root` / `toor`, com login automático e acesso administrativo sem senha na configuração voltada à praticidade. Qualquer pessoa que consiga acessar o sistema poderá usar essas credenciais, especialmente se o SSH estiver ativo.

Antes de se conectar a uma rede não confiável:

1. Defina senhas exclusivas para o usuário e o root no Configurador do MiniOS.
2. Selecione um perfil de segurança adequado e revise todos os controles preenchidos.
3. Desative SSH e XRDP, a menos que o acesso remoto seja necessário.
4. Reinicie em uma nova sessão ao alterar configurações de conta ou segurança aplicadas uma única vez e, em seguida, verifique o comportamento do login e dos privilégios.

O Configurator armazena hashes de senha criptografados, não senhas em texto simples. Se alterar uma conta persistente já criada, use `passwd` para o usuário atual e `sudo passwd root` para o root. Após a conversão nativa, use as ferramentas padrão do Debian para gerenciamento de contas.

## Use os controles de segurança do Configurator

O Configurador do MiniOS oferece três perfis. Um perfil preenche configurações concretas; o nome do perfil não é salvo como chave de configuração em tempo de execução, e cada configuração continua podendo ser editada individualmente.

| Perfil | Comportamento principal |
| --- | --- |
| `convenient` | Compatível com login automático; sudo e PolicyKit sem senha; login SSH como root e por senha permitido; XRDP/X11/tela de bloqueio menos restritivos; dicas de senha exibidas. |
| `balanced` | Sem login automático; sudo e PolicyKit exigem senha; login SSH como root negado, mas login por senha permitido; XRDP/X11/tela de bloqueio reforçados. |
| `strict` | Sem login automático; sudo e PolicyKit exigem senha; login SSH como root e por senha negado; XRDP desativado; X11/tela de bloqueio reforçados; dicas de senha ocultas. |

Os padrões do instalador variam conforme o modo de implantação: instalações live priorizam `convenient`; já a conversão nativa começa com `balanced`. A configuração nativa é aplicada durante a conversão; após a instalação, use as configurações de segurança padrão do Debian. Esses são valores padrão, não recomendações para todos os modelos de ameaça.

As mesmas configurações estão disponíveis como chaves documentadas, incluindo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` e `LIVE_LOCKSCREEN_MODE`. Prefira essas chaves ou o Configurator em vez de editar arquivos gerados do sudoers, PolicyKit, gerenciador de exibição ou SSH. Consulte [Arquivo de configuração](/reference/configuration/config.conf).
Para saber como salvar e quais configurações se aplicam, consulte [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

A criação de contas, as senhas, `LIVE_CONFIG_NOROOT` e a postura de segurança são configurações aplicadas uma única vez, quando uma nova sessão é criada. O Configurator mostra a aplicabilidade de cada controle. Configurações reconfiguráveis, como serviços, são aplicadas após a reinicialização.

## Acesso remoto seguro

O SSH pode ser habilitado em uma imagem MiniOS para recuperação. Em uma rede com usuários não confiáveis, considere que as credenciais padrão divulgadas estão expostas até confirmar o contrário.

- Se o SSH não for necessário, adicione `ssh` a `DISABLE_SERVICES` no Configurator e remova-o de `ENABLE_SERVICES` se estiver presente.
- Se o SSH for necessário, negue o login como root com `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefira a autenticação por chave. Confirme o login por chave em uma conexão separada antes de definir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restrinja o acesso de entrada pelo firewall de rede ou roteador e não exponha um sistema portátil de recuperação diretamente à Internet.
- Revise o XRDP separadamente. O perfil estrito o desativa; o perfil equilibrado o protege melhor, mas não necessariamente desativa o serviço.

Os parâmetros de inicialização podem substituir os valores dos arquivos de configuração. Verifique comportamentos inesperados dos serviços em [Parâmetros de inicialização](/reference/Boot-Parameters).

## Criptografar dados persistentes

A persistência nativa sem criptografia, DynFileFS, DynBlk, VMDK, raw e SquashFS pode ser lida por quem obtiver acesso ao dispositivo. MiniOS pode adicionar uma camada LUKS2 sobre Raw, DynFileFS, DynBlk ou VMDK. O LUKS2 continua sendo uma camada de criptografia, não um modo de sessão separado. Para criá-la durante a inicialização, selecione-a com `perchencrypt=luks`; sessões existentes obtêm o estado de criptografia dos metadados da sessão, não de uma substituição posterior pela linha de comando.

O limite da criptografia varia conforme o backend. O Raw criptografa a imagem de bloco lógico dentro de `changes.img`; DynFileFS criptografa o `virtual.dat` exposto; DynBlk e VMDK criptografam o dispositivo de bloco exposto pelo driver DynBlk. Os metadados da sessão, os arquivos de inicialização, os metadados do backend e os descritores VMDK fora do dispositivo de bloco criptografado, além de outros arquivos na mídia, continuam visíveis. A compactação do backend DynBlk é desativada quando o LUKS2 é selecionado; o VMDK não oferece compactação pelo backend.

A criação durante a inicialização solicita a frase secreta duas vezes no initrd. Quando o Installer cria previamente uma sessão criptografada no destino, o assistente solicita e confirma a frase secreta e a envia ao `minios-session` pela entrada padrão. Ela não é armazenada na configuração, nos logs nem nos argumentos do processo. Sessões criptografadas existentes solicitam a frase secreta na inicialização; três tentativas de desbloqueio rejeitadas interrompem a inicialização, sem recorrer a texto simples, a outro backend ou a uma substituição em memória para a mesma solicitação de persistência.

A camada de persistência LUKS2 MiniOS protege o conteúdo do sistema de arquivos quando o mapeador está fechado. Ela não protege os dados após o desbloqueio, os arquivos de inicialização sem criptografia, os arquivos copiados para fora do backend criptografado nem um sistema de arquivos raiz nativo. A criptografia da persistência em camadas não equivale à criptografia da raiz nativa. As exportações lógicas contêm arquivos de sessão descriptografados; proteja os arquivos de backup separadamente. Use uma frase secreta forte e mantenha um backup testado.

O armazenamento temporário de cache ou diário reduz gravações, mas não é criptografia. Com persistência durável, MiniOS mantém `minios-boot` e `live-config` diagnósticos no armazenamento da sessão, mesmo quando `LIVE_LOG_STORAGE=volatile`. Na persistência durável SquashFS, esses arquivos ficam fora de `changes.sb`, no diretório `boot-logs/` da sessão. Com `perchtoram`, a sessão e seus diagnósticos ficam na memória; a persistência depende de um salvamento bem-sucedido no armazenamento. Um dispositivo de armazenamento sem criptografia expõe os logs junto com os demais arquivos. `LIVE_CONFIG_DEBUG=true` também habilita rastreamentos detalhados e cópias dos dados de entrada usados para mesclar contas de usuário; mantenha a depuração desativada no uso normal e revise esses logs antes de compartilhá-los. Consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Consulte [Instalador do MiniOS](/installing-minios/MiniOS-Installer) e [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Aplique atualizações com cautela

Atualize os metadados dos pacotes e instale atualizações de segurança do Debian em sessões live persistentes usando o fluxo normal do APT, quando apropriado. As alterações feitas pelo APT em uma sessão live nova desaparecem após a reinicialização. Os módulos base SquashFS são somente leitura; por isso, substituir a ISO ou os módulos por uma versão mais recente e confiável de MiniOS costuma ser a maneira mais simples de atualizar o sistema live base. Após a conversão nativa, a manutenção de segurança dos pacotes segue o fluxo normal do APT do Debian para o sistema instalado.

Consulte [Atualizações de software](/maintenance-and-recovery/Updating-MiniOS) para conhecer os fluxos separados de APT, módulos, imagens e kernel.

Antes de uma atualização de grande porte:

- Faça backup de arquivos importantes e das sessões persistentes.
- Confirme se há espaço livre suficiente.
- Evite interromper gravações ou desligar o dispositivo.
- Reinicie e verifique o sistema atualizado antes de descartar a mídia ou a sessão anterior que você sabe que funcionava.

## Trate hooks e preseeding como execução de código

A opção de inicialização `hooks` e os hooks do live-config podem executar arquivos do sistema de arquivos raiz, da mídia de inicialização ou de uma URL. Hooks remotos, hooks de mídia modificada e arquivos de preseed não revisados podem ser executados com privilégios de sistema. Use apenas arquivos revisados de uma fonte confiável, prefira distribuição autenticada e evite hooks remotos em redes não confiáveis. Consulte [live-config](/reference/configuration/live-config) para ver a ordem de execução e os locais compatíveis.

## Faça backup e descarte mídias com segurança

Persistência não é backup. Mantenha uma cópia separada dos arquivos dos usuários e exporte ou copie as sessões enquanto estiverem funcionando normalmente. Teste a restauração em outra mídia.
Encerre o sistema corretamente antes de remover um dispositivo de armazenamento gravável e mantenha espaço livre para os metadados das sessões e o funcionamento do sistema de arquivos.

Antes de descartar um dispositivo, apague os dados com segurança, considerando a tecnologia de armazenamento e o nível de sensibilidade dos dados. Apenas excluir arquivos ou reformatar pode não impedir a recuperação dos dados antigos.
