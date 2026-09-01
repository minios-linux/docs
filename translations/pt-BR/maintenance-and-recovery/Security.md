---
updated: 2026-08-31
---

# Segurança

Os controles de segurança do MiniOS são projetados em torno do sistema ao vivo: sessões temporárias, sessões persistentes, mídias portáteis e configuração de inicialização. O Instalador do MiniOS também pode realizar uma conversão nativa. O sistema resultante mantém o ambiente de área de trabalho selecionado e a identidade visual do MiniOS, mas o software específico do modo live MiniOS é removido, permitindo que você mantenha a segurança e faça a manutenção usando as ferramentas normais do Debian, em vez de tratá-lo como outro modo live.
Proteja a sessão em execução, os dados persistentes, a mídia de inicialização e qualquer configuração aplicada na inicialização.

## Comece com mídia confiável

Baixe o MiniOS de uma fonte oficial e verifique o ISO antes de gravá-lo.
Siga o guia [Verificando downloads](/installing-minios/Verifying-Downloads) e compare o resultado antes de inicializar ou instalar. A verificação detecta um download corrompido ou substituído; ela não garante que um dispositivo USB já modificado seja seguro.

Mantenha o dispositivo USB sob controle físico. Senhas de firmware e ordem de boot restrita podem reduzir inicializações não autorizadas casuais, mas não criptografam os arquivos no dispositivo. O Secure Boot pode fornecer proteção adicional na cadeia de inicialização em imagens e hardwares que o suportam; verifique o comportamento da versão e do firmware em uso, em vez de presumir suporte.

## Substitua as credenciais padrão

Uma imagem live do MiniOS sem personalização utiliza as credenciais publicadas `live` / `evil` e `root` / `toor`, com login automático e acesso administrativo sem senha em sua configuração voltada para conveniência. Qualquer pessoa que consiga acessar o sistema pode usar essas credenciais, especialmente se o SSH estiver ativo.

Antes de conectar-se a uma rede não confiável:

1. Defina senhas únicas para usuário e root no Configurador do MiniOS.
2. Selecione um perfil de segurança apropriado e revise cada controle preenchido.
3. Desative SSH e XRDP, a menos que o acesso remoto seja necessário.
4. Reinicie em uma nova sessão ao alterar configurações de conta ou segurança de uso único e, em seguida, verifique o comportamento de login e privilégios resultante.

O Configurador armazena os hashes de senha criptografados, e não as senhas em texto puro. Se for alterar uma conta persistente já criada, use `passwd` para o usuário atual e `sudo passwd root` para root. Após a conversão nativa, utilize as ferramentas normais de gerenciamento de contas do Debian.

## Use os controles de segurança do Configurador

O Configurador do MiniOS oferece três perfis. Um perfil preenche configurações concretas; o nome do perfil em si não é salvo como uma chave de configuração em tempo de execução, e cada configuração permanece editável de forma independente.

| Perfil | Comportamento principal |
| --- | --- |
| `convenient` | Compatível com autologin, sudo e PolicyKit sem senha, SSH root e senha permitidos, XRDP/X11/tela de bloqueio relaxados, dicas de senha exibidas. |
| `balanced` | Sem autologin, sudo e PolicyKit exigem senha, login SSH root negado mas SSH por senha permitido, XRDP/X11/tela de bloqueio reforçados. |
| `strict` | Sem autologin, sudo e PolicyKit exigem senha, login SSH root e por senha negados, XRDP desativado, X11/tela de bloqueio reforçados, dicas de senha ocultas. |

As opções padrão do instalador variam conforme o modo de implantação: instalações live favorecem `convenient`, enquanto a conversão nativa inicia em `balanced`. A configuração nativa é aplicada durante a conversão; após a instalação, utilize a configuração de segurança padrão do Debian. Estes são padrões, não recomendações para todos os modelos de ameaça.

As mesmas configurações estão disponíveis como chaves de configuração documentadas, incluindo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` e `LIVE_LOCKSCREEN_MODE`. Prefira essas chaves ou o Configurador em vez de editar arquivos sudoers, PolicyKit, display-manager ou SSH gerados. Veja [Arquivo de configuração](/reference/configuration/config.conf).
Para comportamento de salvamento e aplicabilidade das configurações, veja [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Criação de contas, senhas, `LIVE_CONFIG_NOROOT` e a postura de segurança são configurações de uso único aplicadas quando uma nova sessão é criada. O Configurador mostra a aplicabilidade de cada controle. Configurações reconfiguráveis, como serviços, são aplicadas após a reinicialização.

## Acesse remotamente com segurança

O SSH pode ser ativado em uma imagem MiniOS para uso em recuperação. Em uma rede onde outros usuários não são confiáveis, considere que as credenciais padrão publicadas estão expostas até que você confirme o contrário.

- Se SSH não for necessário, adicione `ssh` a `DISABLE_SERVICES` no Configurador e remova de `ENABLE_SERVICES` se estiver presente.
- Se SSH for necessário, negue o login root com `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefira autenticação por chave. Confirme o login por chave em uma conexão separada antes de definir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restrinja o acesso de entrada usando o firewall de rede ou roteador e não exponha um sistema de recuperação portátil diretamente à Internet.
- Revise o XRDP separadamente. O perfil restrito o desativa; o perfil equilibrado o reforça, mas não necessariamente desativa o serviço.

Parâmetros de boot podem sobrescrever valores do arquivo de configuração. Analise comportamentos inesperados de serviços consultando [Parâmetros de boot](/reference/Boot-Parameters).

## Criptografe dados persistentes

Persistência nativa, DynFileFS e persistência raw não criptografadas podem ser lidas por quem obtiver o dispositivo. O Instalador do MiniOS pode configurar um container LUKS criptografado para uma sessão live quando o initrd de origem anuncia suporte a LUKS. O initrd cria `changes.luks` no primeiro boot e solicita sua senha; o instalador não recebe nem armazena essa senha.

A persistência LUKS protege o conteúdo enquanto o container está fechado. Não protege os dados após o desbloqueio, os arquivos de boot não criptografados, arquivos copiados para fora do container ou um sistema de arquivos root nativo. A persistência de sessão LUKS não é criptografia de root nativo. Use uma senha forte e mantenha um backup testado.

Veja [Instalador do MiniOS](/installing-minios/MiniOS-Installer) e [Gerenciamento de sessão](/using-minios/Sessions-and-Persistence).

## Aplique atualizações de forma deliberada

Atualize os metadados dos pacotes e instale atualizações de segurança do Debian em sessões live persistentes usando o fluxo de trabalho normal do APT, quando apropriado. Alterações feitas pelo APT em uma sessão live nova desaparecem ao reiniciar. Os módulos base SquashFS são somente leitura, então substituir o ISO ou os módulos por uma versão confiável mais recente do MiniOS geralmente é a maneira mais limpa de atualizar o sistema live base. Após a conversão nativa, a manutenção de segurança de pacotes é simplesmente o fluxo de trabalho APT padrão do Debian para esse sistema instalado.

Veja [Atualizações de software](/maintenance-and-recovery/Updating-MiniOS) para fluxos de trabalho separados de APT, módulo, imagem e kernel.

Antes de uma grande atualização:

- Faça backup dos arquivos importantes e das sessões persistentes.
- Confirme se há espaço livre suficiente disponível.
- Evite interromper gravações ou desligar o dispositivo.
- Reinicie e verifique o sistema atualizado antes de descartar a mídia ou sessão anterior conhecida como estável.

## Trate hooks e preseeding como execução de código

A opção de boot `hooks` e hooks do live-config podem executar arquivos do sistema de arquivos root, da mídia de boot ou de uma URL. Hooks remotos, hooks modificados na mídia e preseeds não revisados podem ser executados com privilégios de sistema. Use apenas arquivos revisados de uma fonte confiável, prefira distribuição autenticada e evite hooks remotos em redes não confiáveis. Veja [live-config](/reference/configuration/live-config) para a ordem de execução e locais suportados.

## Faça backup e descarte mídias com segurança

Persistência não é backup. Mantenha uma cópia separada dos arquivos do usuário e exporte ou copie sessões enquanto estiverem íntegras. Teste a restauração em mídias diferentes.
Desligue corretamente antes de remover dispositivos de armazenamento graváveis e mantenha espaço livre para metadados de sessão e operação do sistema de arquivos.

Antes de descartar um dispositivo, apague-o de forma segura conforme a tecnologia de armazenamento e a sensibilidade dos dados. Excluir arquivos ou apenas reformatar pode não tornar os dados antigos irrecuperáveis.
