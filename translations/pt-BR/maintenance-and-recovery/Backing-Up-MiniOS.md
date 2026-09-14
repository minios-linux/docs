---
updated: 2026-09-13
---

# Fazendo backup de MiniOS

Um backup é o caminho confiável para recuperar MiniOS. A documentação não garante um procedimento genérico para reparar bootloader, sistema de arquivos ou container de persistência danificados. Mantenha cópias recuperáveis antes de alterar a versão, kernel, layout de armazenamento ou sessões importantes.

## O que fazer backup

Guarde as partes que não podem ser facilmente recriadas a partir de uma imagem MiniOS:

- arquivos pessoais, incluindo dados ocultos de aplicativos que são importantes para você;
- `config.conf`, revisados `config.conf.d` arquivos e alterações intencionais no menu de boot ou parâmetros de inicialização;
- módulos criados pelo usuário `.sb` e uma anotação da versão MiniOS para a qual foram compilados;
- sessões persistentes que contenham estados do sistema ou de aplicativos necessários;
- chaves de criptografia, credenciais de recuperação e outros segredos armazenados separadamente do backup que protegem.

Arquivos armazenados fora da camada de sessão, por exemplo em um local separado de dados do usuário, devem ser salvos separadamente. Não presuma que um arquivo de sessão contém dados montados de outro sistema de arquivos.

## Exportar sessões persistentes

O Gerenciador de sessões MiniOS pode exportar uma **inativa** `native`, `dynfilefs`, `dynblk`, `raw` ou `luks` sessão para um `.tar.zst` arquivo de backup verificado. Primeiro, identifique a sessão:

```bash
minios-session list
minios-session running
```

Depois, inicialize outra sessão ou **Iniciar sem salvar** e exporte a sessão inativa:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

A exportação é uma cópia lógica do conteúdo da sessão, não uma cópia bit a bit do container de armazenamento. Armazene em outro dispositivo.

Para sessões LUKS, o arquivo de backup contém os arquivos lógicos descriptografados. Proteja o arquivo separadamente caso os dados precisem permanecer criptografados.

### Sessões SquashFS

O Gerenciador de Sessões atual não exporta nem copia sessões SquashFS. Use **Salvar agora** antes de desligar para garantir que o snapshot atual esteja completo e proteja os arquivos importantes separadamente. Se você precisa de uma cópia completa e restaurável de todo o dispositivo MiniOS, crie uma imagem offline do dispositivo.

Não confie em copiar manualmente um diretório de sessão montado ou em reconstruir `session.conf`, segmentos DynFileFS, arquivos dynblk de apoio ou outros metadados de container como método de backup. Um backup manual bit a bit de dynblk é seguro apenas quando o volume está desmontado e deve preservar todo o `volume000.db` até o `volume063.db` namespace exatamente como está; o backup lógico de `minios-session export` é preferível.

## Faça backup de configurações e módulos

Em mídias MiniOS graváveis, preserve `minios/config.conf`, `minios/config.conf.d/`, e módulos criados pelo usuário armazenados em `minios/modules/`.
Registre também parâmetros de boot personalizados ou alterações no menu de inicialização que não estejam evidentes nesses arquivos.

Um módulo compilado para uma versão MiniOS não é automaticamente compatível com outra.
Guarde o código-fonte ou receita necessária para recompilar módulos personalizados importantes.

## Criar uma imagem do dispositivo inteiro

Uma imagem do dispositivo inteiro é útil quando você deseja preservar a tabela de partições, arquivos de inicialização, módulos, configurações, sessões e outros dados juntos. Crie a imagem offline: desligue o MiniOS e faça a imagem do dispositivo a partir de outro sistema em execução.

[Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) oferece as operações **Criar imagem** e **Gravar imagem**. Salve a imagem em outro dispositivo físico. Restaurar uma imagem do dispositivo inteiro sobrescreve o destino selecionado, então verifique o modelo e a capacidade do destino antes de gravar.

Uma imagem de dispositivo é um complemento, não um substituto, para um backup separado dos arquivos pessoais importantes.

## Restaurar um arquivo de sessão

Importar um arquivo do Gerenciador de Sessões cria uma nova sessão numerada; não sobrescreve a existente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Verificações de compatibilidade são feitas durante a importação. Analise a sessão importada antes de ativá-la e mantenha a sessão funcional conhecida até testar a cópia restaurada.

Ao migrar para outra versão MiniOS, prefira migrar apenas os dados pessoais e configurações selecionados. Não presuma que uma sessão completa antiga ou módulo personalizado seja compatível com a nova versão apenas porque pode ser copiado para lá.

Veja [Sessões e persistência](/using-minios/Sessions-and-Persistence) para gerenciamento de sessões e [Atualizando MiniOS](/maintenance-and-recovery/Updating-MiniOS) para migração entre versões MiniOS.
