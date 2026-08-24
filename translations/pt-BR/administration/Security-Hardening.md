# Reforço de segurança

O MiniOS pode ser executado como um sistema de recuperação ao vivo, um sistema portátil persistente ou uma instalação nativa. Os controles adequados dependem de como o sistema é utilizado. Proteja a sessão em execução, os dados persistentes, a mídia de inicialização e qualquer configuração aplicada na inicialização.

## Comece com mídia confiável

Baixe o MiniOS de uma fonte oficial e verifique o ISO antes de gravá-lo. Siga as instruções em [Verificando downloads](/installation/Verifying-Downloads.md) e compare o resultado antes de inicializar ou instalar. A verificação detecta um download corrompido ou substituído; ela não garante que um dispositivo USB já modificado seja seguro.

Mantenha o dispositivo USB sob controle físico. Senhas de firmware e restrição na ordem de boot podem reduzir inicializações não autorizadas casuais, mas não criptografam os arquivos no dispositivo. O Secure Boot pode fornecer proteção adicional na cadeia de inicialização em imagens e hardwares que o suportam; verifique o comportamento real da versão e do firmware em vez de presumir suporte.

## Substitua as credenciais padrão

Uma imagem ao vivo do MiniOS sem personalização utiliza as credenciais publicadas `live` /
`evil` e `root` / `toor`, com login automático e acesso administrativo sem senha em sua configuração voltada para conveniência. Qualquer pessoa que consiga acessar o sistema pode usar essas credenciais, especialmente se o SSH estiver ativo.

Antes de conectar-se a uma rede não confiável:

1. Defina senhas exclusivas para usuário e root no Configurador do MiniOS.
2. Selecione um perfil de segurança apropriado e revise cada controle preenchido.
3. Desative SSH e XRDP, a menos que o acesso remoto seja necessário.
4. Reinicie em uma nova sessão ao alterar configurações de conta ou segurança de uso único e verifique o comportamento de login e privilégios resultante.

O Configurador armazena hashes de senha criptografados em vez de senhas em texto simples. Se for alterar uma conta persistente ou nativa já criada, use `passwd` para o usuário atual e `sudo passwd root` para root.

## Utilize os controles de segurança do Configurador

O Configurador do MiniOS oferece três perfis. Um perfil preenche configurações concretas; o nome do perfil em si não é salvo como uma chave de configuração em tempo de execução, e cada configuração permanece editável de forma independente.

| Perfil | Comportamento principal |
| --- | --- |
| `convenient` | Compatível com login automático, sudo e PolicyKit sem senha, root e SSH por senha permitidos, XRDP/X11/tela de bloqueio relaxados, dicas de senha exibidas. |
| `balanced` | Sem login automático, sudo e PolicyKit exigem senha, login root via SSH negado mas SSH por senha permitido, XRDP/X11/tela de bloqueio reforçados. |
| `strict` | Sem login automático, sudo e PolicyKit exigem senha, login root e por senha via SSH negados, XRDP desativado, X11/tela de bloqueio reforçados, dicas de senha ocultas. |

Os padrões do instalador variam conforme o modo de instalação: instalações ao vivo favorecem `convenient`, enquanto instalações nativas favorecem `balanced`. Estes são padrões, não recomendações para todos os modelos de ameaça.

As mesmas configurações estão disponíveis como chaves de configuração documentadas, incluindo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` e `LIVE_LOCKSCREEN_MODE`. Prefira essas chaves ou o Configurador em vez de editar arquivos sudoers, PolicyKit, display-manager ou SSH gerados. Veja [Arquivo de configuração](/configuration/Configuration-File.md).
Para comportamento de salvamento e aplicabilidade das configurações, consulte
[MiniOS Configurator](/configuration/MiniOS-Configurator.md).

Criação de contas, senhas, `LIVE_CONFIG_NOROOT` e a postura de segurança são configurações de uso único aplicadas quando uma nova sessão é criada. O Configurador mostra a aplicabilidade de cada controle. Configurações reconfiguráveis, como serviços, são aplicadas após reinicialização.

## Proteja o acesso remoto

O SSH pode estar habilitado em uma imagem do MiniOS para uso em recuperação. Em uma rede onde outros usuários não são confiáveis, presuma que as credenciais padrão publicadas estão expostas até que você confirme o contrário.

- Se o SSH não for necessário, adicione `ssh` a `DISABLE_SERVICES` no Configurador e remova de `ENABLE_SERVICES` se estiver presente.
- Se o SSH for necessário, negue o login root com `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefira autenticação por chave. Confirme o login por chave em uma conexão separada antes de definir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restrinja o acesso de entrada com o firewall de rede ou roteador e não exponha um sistema de recuperação portátil diretamente à Internet.
- Revise o XRDP separadamente. O perfil estrito o desativa; o perfil equilibrado o reforça, mas não necessariamente desativa o serviço.

Parâmetros de boot podem sobrescrever valores do arquivo de configuração. Analise comportamentos inesperados de serviços com base em [Parâmetros de boot](/configuration/Boot-Parameters.md).

## Criptografe dados persistentes

Persistência nativa, DynFileFS e persistência raw não criptografadas podem ser lidas por quem obtiver o dispositivo. O Instalador do MiniOS pode configurar um container LUKS criptografado para uma sessão ao vivo quando o initrd de origem anuncia suporte a LUKS. O initrd cria `changes.luks` no primeiro boot e solicita sua senha; o instalador não recebe nem armazena essa senha.

A persistência LUKS protege o conteúdo enquanto o container está fechado. Não protege os dados após o desbloqueio, os arquivos de boot não criptografados, arquivos copiados para fora do container ou um sistema de arquivos root nativo. A persistência de sessão LUKS não é criptografia de root nativo. Use uma senha forte e mantenha um backup testado.

Veja [Instalador do MiniOS](/installation/MiniOS-Installer.md) e [Gerenciamento de sessão](/configuration/Session-Management.md).

## Aplique atualizações de forma deliberada

Atualize os metadados dos pacotes e instale atualizações de segurança do Debian em sessões ao vivo persistentes ou instalações nativas usando o fluxo de trabalho padrão do APT. Alterações feitas pelo APT em uma sessão ao vivo nova desaparecem ao reiniciar. Os módulos base SquashFS são somente leitura, então substituir o ISO ou módulos por uma nova versão confiável do MiniOS geralmente é a maneira mais limpa de atualizar o sistema ao vivo base.

Veja [Atualizações de software](/administration/Software-Updates.md) para fluxos de trabalho separados de APT, módulo, imagem e kernel.

Antes de uma grande atualização:

- Faça backup dos arquivos importantes e das sessões persistentes.
- Confirme que há espaço livre suficiente disponível.
- Evite interromper gravações ou desligar o dispositivo.
- Reinicie e verifique o sistema atualizado antes de descartar a mídia ou sessão anterior considerada confiável.

## Trate hooks e preseeding como execução de código

A opção de boot `hooks` e hooks do live-config podem executar arquivos do sistema de arquivos root, da mídia de boot ou de uma URL. Hooks remotos, hooks de mídia modificada e preseeds não revisados podem ser executados com privilégios de sistema. Use apenas arquivos revisados de uma fonte confiável, prefira distribuição autenticada e evite hooks remotos em redes não confiáveis. Veja [live-config](/configuration/live-config.md) para a ordem de execução e locais suportados.

## Faça backup e descarte mídias com segurança

Persistência não é backup. Mantenha uma cópia separada dos arquivos do usuário e exporte ou copie sessões enquanto estiverem saudáveis. Teste a restauração em mídias diferentes. Encerre o sistema corretamente antes de remover o armazenamento gravável e mantenha espaço livre para metadados da sessão e operação do sistema de arquivos.

Antes de descartar um dispositivo, apague-o de forma segura conforme a tecnologia de armazenamento e a sensibilidade dos dados. Apenas excluir arquivos ou reformatar pode não tornar os dados antigos irrecuperáveis.
