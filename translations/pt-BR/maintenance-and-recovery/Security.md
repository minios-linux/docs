---
updated: 2026-09-13
---

# Segurança

Os controles de segurança MiniOS são projetados para o sistema ao vivo: sessões temporárias, sessões persistentes, mídias portáteis e configuração de inicialização. O Instalador do MiniOS também pode realizar uma conversão nativa. O sistema resultante mantém o ambiente de desktop selecionado e a identidade visual MiniOS, mas o software específico do modo ao vivo MiniOS é removido, permitindo que você faça a manutenção e mantenha a segurança usando as ferramentas normais do Debian, em vez de tratá-lo como outro modo ao vivo.
Proteja a sessão em execução, os dados persistentes, a mídia de inicialização e qualquer configuração aplicada na inicialização.

## Comece com mídia confiável

Baixe MiniOS de uma fonte oficial e verifique o ISO antes de gravá-lo.
Siga [Verificando downloads](/installing-minios/Verifying-Downloads) e compare o resultado antes de inicializar ou instalar. A verificação detecta um download corrompido ou substituído; ela não garante que um dispositivo USB já modificado seja seguro.

Mantenha o dispositivo USB sob controle físico. Senhas de firmware e ordem de boot restrita podem reduzir inicializações não autorizadas ocasionais, mas não criptografam os arquivos no dispositivo. O Secure Boot pode oferecer proteção adicional na cadeia de inicialização em imagens e hardwares compatíveis; verifique o comportamento da versão e do firmware em uso, em vez de presumir suporte.

## Substituir credenciais padrão

Uma imagem live MiniOS sem personalização usa as credenciais publicadas `live` / `evil` e `root` / `toor`, com login automático e acesso administrativo sem senha em sua configuração voltada para conveniência. Qualquer pessoa que consiga acessar o sistema pode usar essas credenciais, especialmente se o SSH estiver ativo.

Antes de se conectar a uma rede não confiável:

1. Defina senhas exclusivas para usuário e root no Configurador do MiniOS.
2. Selecione um perfil de segurança adequado e revise todos os controles preenchidos.
3. Desative SSH e XRDP, a menos que o acesso remoto seja necessário.
4. Reinicie para uma nova sessão ao alterar configurações de conta temporária ou de segurança e, em seguida, verifique o comportamento de login e privilégios resultante.

O Configurador armazena hashes de senha criptografados em vez de senhas em texto simples. Se for alterar uma conta persistente já criada, use `passwd` para o usuário atual e `sudo passwd root` para root. Após a conversão nativa, utilize as ferramentas normais de gerenciamento de contas do Debian.

## Use os controles de segurança do Configurador

O Configurador do MiniOS oferece três perfis. Um perfil preenche configurações concretas; o nome do perfil em si não é salvo como chave de configuração em tempo de execução, e cada configuração permanece editável de forma independente.

| Perfil | Comportamento principal |
| --- | --- |
| `convenient` | Compatível com login automático, sudo e PolicyKit sem senha, SSH root e senha permitidos, XRDP/X11/tela de bloqueio relaxados, dicas de senha exibidas. |
| `balanced` | Sem login automático, sudo e PolicyKit exigem senha, login SSH root negado mas SSH por senha permitido, XRDP/X11/tela de bloqueio reforçados. |
| `strict` | Sem login automático, sudo e PolicyKit exigem senha, login SSH root e por senha negados, XRDP desativado, X11/tela de bloqueio reforçados, dicas de senha ocultas. |

Os padrões do instalador variam conforme o modo de implantação: instalações ao vivo priorizam `convenient`, enquanto a conversão nativa começa de `balanced`. A configuração nativa é aplicada durante a conversão; após a instalação, utilize a configuração de segurança padrão do Debian. Estes são padrões, não recomendações para todos os modelos de ameaça.

As mesmas configurações estão disponíveis como chaves de configuração documentadas, incluindo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, e `LIVE_LOCKSCREEN_MODE`. Prefira essas chaves ou o Configurador em vez de editar arquivos sudoers, PolicyKit, display-manager ou SSH gerados. Veja [Arquivo de configuração](/reference/configuration/config.conf).
Para saber sobre o comportamento de salvamento e aplicabilidade das configurações, consulte [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Criação de conta, senhas, `LIVE_CONFIG_NOROOT`, e a postura de segurança são configurações únicas usadas ao criar uma nova sessão. O Configurador mostra a aplicabilidade de cada controle. Configurações reconfiguráveis, como serviços, são aplicadas após a reinicialização.

## Acesso remoto seguro

O SSH pode ser ativado em uma imagem MiniOS para fins de recuperação. Em uma rede onde outros usuários não são confiáveis, considere que as credenciais padrão publicadas estão expostas até que você confirme o contrário.

- Se o SSH não for necessário, adicione `ssh` em `DISABLE_SERVICES` no Configurator e remova de `ENABLE_SERVICES` se estiver presente.
- Se o SSH for necessário, negue o login root com `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefira autenticação por chave. Confirme o acesso por chave em uma conexão separada antes de definir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restrinja o acesso de entrada usando o firewall de rede ou o roteador e não exponha um sistema de recuperação portátil diretamente à Internet.
- Revise o XRDP separadamente. O perfil restrito o desativa; o perfil balanceado reforça sua segurança, mas não necessariamente desativa o serviço.

Parâmetros de boot podem sobrescrever valores dos arquivos de configuração. Verifique comportamentos inesperados do serviço em relação a [Parâmetros de boot](/reference/Boot-Parameters).

## Criptografar dados persistentes

Persistência não criptografada dos formatos nativo, DynFileFS, dynblk, raw e SquashFS pode ser lida por quem obtiver o dispositivo. Dynblk é um backend de bloco fino do kernel, não uma camada de criptografia; sua`volumeNNN.db`s arquivos de apoio contêm dados de sessão comuns e não criptografados, a menos que o armazenamento subjacente esteja protegido separadamente. O Instalador do MiniOS pode configurar um contêiner LUKS criptografado para uma sessão ao vivo quando o initrd de origem oferece suporte ao LUKS. O initrd cria`changes.luks` na primeira inicialização e solicita a senha; o instalador não recebe nem armazena essa senha.

A persistência LUKS protege o conteúdo enquanto o contêiner está fechado. Não protege os dados após o desbloqueio, os arquivos de boot não criptografados, arquivos copiados para fora do contêiner ou um sistema de arquivos root nativo. A persistência de sessão LUKS não é criptografia de root nativo. Use uma senha forte e mantenha um backup testado.

Veja [Instalador do MiniOS](/installing-minios/MiniOS-Installer) e [Gerenciamento de sessão](/using-minios/Sessions-and-Persistence).

## Aplique atualizações de forma deliberada

Atualize os metadados dos pacotes e instale atualizações de segurança do Debian em sessões live persistentes utilizando o fluxo normal do APT, quando apropriado. Alterações feitas pelo APT em uma sessão live nova são descartadas ao reiniciar. Os módulos base SquashFS são somente leitura, então substituir o ISO ou os módulos por uma versão MiniOS confiável e mais recente costuma ser a forma mais limpa de atualizar o sistema live base. Após a conversão nativa, a manutenção de segurança dos pacotes segue o fluxo padrão do APT no Debian para o sistema instalado.

Veja [Atualizações de software](/maintenance-and-recovery/Updating-MiniOS) para os fluxos separados de APT, módulo, imagem e kernel.

Antes de uma atualização grande:

- Faça backup dos arquivos importantes e das sessões persistentes.
- Confirme se há espaço livre suficiente disponível.
- Evite interromper gravações ou desligar o dispositivo.
- Reinicie e verifique o sistema atualizado antes de descartar a mídia ou sessão anterior conhecida como estável.

## Trate hooks e preseeds como execução de código

A opção de boot `hooks` e os hooks do live-config podem executar arquivos do sistema de arquivos raiz, da mídia de boot ou de uma URL. Hooks remotos, hooks em mídias modificadas e preseeds não revisados podem ser executados com privilégios de sistema. Use apenas arquivos revisados de fontes confiáveis, prefira distribuição autenticada e evite hooks remotos em redes não confiáveis. Consulte [live-config](/reference/configuration/live-config) para a ordem de execução e locais suportados.

## Faça backup e desative a mídia com segurança

Persistência não é backup. Mantenha uma cópia separada dos arquivos dos usuários e exporte ou copie as sessões enquanto estiverem íntegras. Teste a restauração em diferentes mídias.
Desligue corretamente antes de remover o armazenamento gravável e mantenha espaço livre para os metadados das sessões e funcionamento do sistema de arquivos.

Antes de descartar um dispositivo, apague-o de forma segura conforme a tecnologia de armazenamento e a sensibilidade dos dados. Apenas excluir arquivos ou reformatar pode não tornar os dados antigos irrecuperáveis.
