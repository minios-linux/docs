---
updated: 2026-08-31
---

# Fazendo backup do MiniOS

Um backup é o caminho confiável para recuperação do MiniOS. A documentação não garante um procedimento genérico de reparo para um bootloader, sistema de arquivos ou container de persistência danificado. Mantenha cópias recuperáveis antes de alterar uma versão, kernel, layout de armazenamento ou sessão importante.

## O que fazer backup

Guarde as partes que não podem ser simplesmente recriadas a partir de uma imagem MiniOS:

- arquivos pessoais, incluindo dados de aplicativos ocultos que sejam importantes para você;
- arquivos `config.conf`, arquivos `config.conf.d` revisados e alterações intencionais no menu de boot ou parâmetros de inicialização;
- módulos `.sb` criados pelo usuário e uma anotação sobre a versão MiniOS para a qual foram criados;
- sessões persistentes que contenham estados do sistema ou de aplicativos necessários;
- chaves de criptografia, credenciais de recuperação e outros segredos armazenados separadamente do backup que eles protegem.

Arquivos armazenados fora da camada de sessão, por exemplo em um local separado de dados do usuário, devem ser salvos separadamente. Não presuma que um arquivo de sessão contém dados montados de outro sistema de arquivos.

## Exportar sessões persistentes

O Gerenciador de sessões MiniOS pode exportar uma sessão **não ativa** `native`, `dynfilefs`, `raw` ou `luks` para um arquivo `.tar.zst` verificado. Primeiro, identifique a sessão:

```bash
minios-session list
minios-session running
```

Depois, inicie outra sessão ou selecione **Iniciar sem salvar** e exporte a sessão inativa:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

A exportação é uma cópia lógica do conteúdo da sessão, não uma cópia exata, byte a byte, do seu contêiner de armazenamento. Armazene em outro dispositivo.

Para uma sessão LUKS, o arquivo contém os arquivos lógicos descriptografados. Proteja o arquivo separadamente caso os dados precisem permanecer criptografados.

### Sessões SquashFS

O Session Manager atual não exporta nem copia sessões SquashFS. Use **Salvar agora** antes de desligar para garantir que o snapshot atual esteja completo, e depois proteja os arquivos importantes separadamente. Se precisar de uma cópia completa e restaurável de todo o dispositivo MiniOS, crie uma imagem offline do dispositivo.

Não confie em copiar manualmente um diretório de sessão montado ou em reconstruir `session.conf`, segmentos DynFileFS ou metadados de container como método de backup.

## Fazer backup de configurações e módulos

Em mídias MiniOS graváveis, preserve `minios/config.conf`, `minios/config.conf.d/` e módulos criados pelo usuário armazenados em `minios/modules/`.
Também registre parâmetros de boot personalizados ou alterações no menu de inicialização que não estejam evidentes nesses arquivos.

Um módulo criado para uma versão MiniOS não é automaticamente compatível com outra.
Guarde o código-fonte ou receita necessária para reconstruir módulos personalizados importantes.

## Criar uma imagem de dispositivo inteiro

Uma imagem de dispositivo inteiro é útil quando você deseja preservar a tabela de partições, arquivos de inicialização, módulos, configurações, sessões e outros dados juntos. Crie-a offline: desligue o MiniOS e faça a imagem do dispositivo a partir de outro sistema em execução.

O [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) oferece as operações **Criar imagem** e **Gravar imagem**. Salve a imagem em um dispositivo físico diferente. Restaurar uma imagem de dispositivo inteiro sobrescreve o destino selecionado, então verifique o modelo e a capacidade do destino antes de gravar.

Uma imagem de dispositivo é um complemento, não um substituto, para um backup separado de arquivos pessoais importantes.

## Restaurar um arquivo de sessão

Importar um arquivo do Session Manager cria uma nova sessão numerada; não sobrescreve a existente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Durante a importação, são realizadas verificações de compatibilidade. Analise a sessão importada antes de ativá-la e mantenha a sessão já testada até que a cópia restaurada seja verificada.

Ao migrar para outra versão MiniOS, prefira migrar dados pessoais e configurações selecionados. Não presuma que uma sessão completa antiga ou módulo personalizado seja compatível com a nova versão apenas porque pode ser copiado para lá.

Veja [Sessões e persistência](/using-minios/Sessions-and-Persistence) para gerenciamento de sessões e [Atualizando MiniOS](/maintenance-and-recovery/Updating-MiniOS) para migração entre versões MiniOS.
