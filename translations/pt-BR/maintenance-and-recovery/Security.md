---
updated: 2026-10-06
---

# Segurança

Os controles de segurança MiniOS são projetados em torno do sistema live: sessões temporárias, sessões persistentes, mídias portáteis e configuração de inicialização. O Instalador do MiniOS também pode realizar uma conversão nativa. O sistema resultante mantém o ambiente de desktop selecionado e a identidade visual MiniOS, mas o software específico do modo live MiniOS é removido, permitindo que você faça a manutenção e mantenha a segurança com as ferramentas normais do Debian, em vez de tratá-lo como outro modo live.
Proteja a sessão em execução, os dados persistentes, a mídia de inicialização e qualquer configuração aplicada na inicialização.

## Comece com mídia confiável

Baixe MiniOS de uma fonte oficial e verifique o ISO antes de gravá-lo.
Siga [Verificando downloads](/installing-minios/Verifying-Downloads) e compare o resultado antes de inicializar ou instalar. A verificação detecta um download corrompido ou substituído; ela não garante que um dispositivo USB já modificado seja seguro.

Mantenha o dispositivo USB sob controle físico. Senhas de firmware e ordem de boot restrita podem reduzir inicializações não autorizadas ocasionais, mas não criptografam os arquivos do dispositivo. O Secure Boot pode fornecer proteção adicional à cadeia de inicialização em imagens e hardwares que o suportam; verifique o comportamento real da versão e do firmware em vez de presumir suporte.

## Substitua as credenciais padrão

Uma imagem live MiniOS sem personalização utiliza as credenciais publicadas `live` / `evil` e `root` / `toor`, com login automático e acesso administrativo sem senha na configuração voltada para conveniência. Qualquer pessoa que tenha acesso ao sistema pode utilizar essas credenciais, especialmente se o SSH estiver ativo.

Antes de se conectar a uma rede não confiável:

1. Defina senhas exclusivas para usuário e root no Configurador do MiniOS.
2. Selecione um perfil de segurança adequado e revise cada controle configurado.
3. Desative SSH e XRDP, a menos que o acesso remoto seja necessário.
4. Reinicie em uma nova sessão ao alterar configurações de conta temporária ou de segurança e, em seguida, verifique o comportamento de login e privilégios resultante.

O Configurador armazena os hashes de senha criptografados, não as senhas em texto simples. Se for alterar uma conta persistente já criada, use `passwd` para o usuário atual e `sudo passwd root` para root. Após a conversão nativa, utilize as ferramentas normais de gerenciamento de contas do Debian.

## Use os controles de segurança do Configurador

O Configurador do MiniOS oferece três perfis. Um perfil preenche configurações concretas; o nome do perfil em si não é salvo como chave de configuração em tempo de execução, e cada configuração permanece editável de forma independente.

| Perfil | Comportamento principal |
| --- | --- |
| `convenient` | Compatível com login automático, sudo e PolicyKit sem senha, root e SSH por senha permitidos, XRDP/X11/tela de bloqueio relaxados, dicas de senha exibidas. |
| `balanced` | Sem login automático, sudo e PolicyKit exigem senha, login root via SSH negado mas SSH por senha permitido, XRDP/X11/tela de bloqueio reforçados. |
| `strict` | Sem login automático, sudo e PolicyKit exigem senha, login root e por senha via SSH negados, XRDP desativado, X11/tela de bloqueio reforçados, dicas de senha ocultas. |

Os padrões do instalador variam conforme o modo de implantação: instalações live priorizam `convenient`, enquanto a conversão nativa parte de `balanced`. A configuração nativa é aplicada durante a conversão; após a instalação, utilize a configuração de segurança padrão do Debian. Estes são padrões, não recomendações para todos os modelos de ameaça.

As mesmas configurações estão disponíveis como chaves de configuração documentadas, incluindo `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, e `LIVE_LOCKSCREEN_MODE`. Prefira essas chaves ou o Configurador em vez de editar arquivos sudoers, PolicyKit, display-manager ou SSH gerados. Veja [Arquivo de configuração](/reference/configuration/config.conf).
Para comportamento de salvamento e aplicabilidade das configurações, consulte [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Criação de contas, senhas, `LIVE_CONFIG_NOROOT`, e o perfil de segurança são configurações de uso único aplicadas ao criar uma nova sessão. O Configurador mostra a aplicabilidade de cada controle. Configurações reconfiguráveis, como serviços, são aplicadas após reinicialização.

## Acesso remoto seguro

O SSH pode estar ativado em uma imagem MiniOS para fins de recuperação. Em uma rede onde outros usuários não são confiáveis, considere que as credenciais padrão publicadas estão expostas até que você confirme o contrário.

- Se o SSH não for necessário, adicione `ssh` a `DISABLE_SERVICES` no Configurador e remova de `ENABLE_SERVICES` se estiver presente.
- Se o SSH for necessário, negue o login root com `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Prefira autenticação por chave. Confirme o login por chave em uma conexão separada antes de definir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Restrinja o acesso de entrada com o firewall de rede ou roteador e não exponha um sistema de recuperação portátil diretamente à Internet.
- Revise o XRDP separadamente. O perfil restrito o desativa; o perfil equilibrado o reforça, mas não necessariamente desativa o serviço.

Parâmetros de inicialização podem sobrescrever valores do arquivo de configuração. Analise comportamentos inesperados de serviço consultando [Parâmetros de inicialização](/reference/Boot-Parameters).

## Criptografe dados persistentes

Persistência nativa não criptografada, DynFileFS, DynBlk, VMDK, raw e SquashFS podem ser lidos por quem obtiver o dispositivo. MiniOS pode aplicar LUKS2 sobre Raw, DynFileFS, DynBlk ou VMDK. O LUKS2 permanece como uma camada de criptografia, não um modo de sessão separado. Para criar na inicialização, selecione essa opção com `perchencrypt=luks`; sessões já existentes obtêm seu estado de criptografia a partir dos metadados da sessão, e não de uma substituição posterior via linha de comando.

O limite da criptografia depende do backend. Raw criptografa a imagem de bloco lógico dentro de `changes.img`; DynFileFS criptografa o `virtual.dat` exposto; DynBlk e VMDK criptografam o dispositivo de bloco exposto pelo driver DynBlk. Metadados de sessão, arquivos de boot, metadados do backend e descritores VMDK fora do dispositivo de bloco criptografado, além de arquivos não relacionados no meio, permanecem visíveis. A compressão do backend DynBlk é desativada quando LUKS2 é selecionado; VMDK não oferece compressão de backend.

O initrd cria o sistema de arquivos criptografado no primeiro uso e solicita sua senha; o instalador não recebe nem armazena essa senha. Na inicialização, três tentativas de desbloqueio rejeitadas interrompem o boot, sem retornar ao modo não criptografado, outro backend ou uma substituição em memória sob o mesmo pedido de persistência.

A camada de persistência LUKS2 MiniOS protege o conteúdo do sistema de arquivos enquanto o mapper está fechado. Não protege os dados após o desbloqueio, os arquivos de boot não criptografados, arquivos copiados fora do backend criptografado ou um sistema de arquivos raiz nativo. A criptografia em camadas da persistência não é criptografia nativa do root. Exportações lógicas contêm arquivos de sessão descriptografados, portanto, proteja os backups separadamente. Use uma senha forte e mantenha um backup testado.

Cache temporário ou armazenamento de journal é uma escolha para reduzir gravações, não para criptografia. Mesmo com `LIVE_LOG_STORAGE=volatile`, MiniOS mantém `minios-boot` e `live-config` diagnósticos no armazenamento persistente da sessão. Para SquashFS, esses arquivos ficam fora de `changes.sb`, no diretório `boot-logs/` da sessão. Um dispositivo de apoio não criptografado expõe esses arquivos junto com os demais. `LIVE_CONFIG_DEBUG=true` também ativa rastreamentos detalhados e cópias das entradas de mesclagem de contas de usuário; mantenha o debug desativado no uso normal e revise esses logs antes de compartilhá-los. Veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Veja [Instalador do MiniOS](/installing-minios/MiniOS-Installer) e [Gerenciamento de sessão](/using-minios/Sessions-and-Persistence).

## Aplique atualizações de forma deliberada

Atualize os metadados dos pacotes e instale as atualizações de segurança do Debian em sessões live persistentes usando o fluxo de trabalho normal do APT, quando apropriado. Alterações feitas pelo APT em uma sessão live nova desaparecem ao reiniciar. Os módulos base SquashFS são somente leitura, então substituir o ISO ou módulos por uma versão mais recente e confiável MiniOS geralmente é a forma mais limpa de atualizar o sistema live base. Após a conversão nativa, a manutenção de segurança de pacotes é simplesmente o fluxo de trabalho APT padrão do Debian para o sistema instalado.

Veja [Atualizações de software](/maintenance-and-recovery/Updating-MiniOS) para os fluxos de trabalho separados de APT, módulos, imagens e kernel.

Antes de uma atualização grande:

- Faça backup de arquivos importantes e sessões persistentes.
- Confirme que há espaço livre suficiente disponível.
- Evite interromper gravações ou desligar o dispositivo durante o processo.
- Reinicie e verifique o sistema atualizado antes de descartar a mídia ou sessão anterior conhecida como boa.

## Trate hooks e preseeding como execução de código

A opção de boot `hooks` e os hooks do live-config podem executar arquivos do sistema de arquivos raiz, da mídia de boot ou de uma URL. Hooks remotos, hooks modificados na mídia e preseeds não revisados podem ser executados com privilégios de sistema. Use apenas arquivos revisados de uma fonte confiável, prefira distribuição autenticada e evite hooks remotos em redes não confiáveis. Veja [live-config](/reference/configuration/live-config) para a ordem de execução e os locais suportados.

## Faça backup e descarte mídias com segurança

Persistência não é backup. Mantenha uma cópia separada dos arquivos do usuário e exporte ou copie sessões enquanto estiverem saudáveis. Teste a restauração em mídias diferentes.
Desligue corretamente antes de remover o armazenamento gravável e mantenha espaço livre para metadados de sessão e funcionamento do sistema de arquivos.

Antes de descartar um dispositivo, apague-o de forma segura conforme a tecnologia de armazenamento e a sensibilidade dos dados. Excluir arquivos ou apenas formatar pode não tornar os dados antigos irrecuperáveis.
