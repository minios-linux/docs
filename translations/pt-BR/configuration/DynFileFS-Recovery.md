---
updated: 2026-08-26
program_commits:
    dynblk: 25f627f2cf86b79c35a185999af90e5e1aa08d17
    dynfilefs-app: 7b2a6b69edeedcc24e0847df44e9060796c0af4b
---

# Recuperando o armazenamento DynFileFS e dynblk

DynFileFS e `dynblk` expõem uma imagem de bloco `virtual.dat` alocada dinamicamente,
cujos dados são armazenados em um conjunto de arquivos `changes.dat`. O MiniOS
formata o `virtual.dat` como ext4 e o utiliza para alterações persistentes. O `dynblk`
é a implementação mantida do mesmo formato de armazenamento; o MiniOS mantém o
nome do modo de persistência `dynfilefs` e o comando de compatibilidade `@mount.dynfilefs` quando necessário.

Este guia cobre inspeção, migração, reparo de sistema de arquivos, recuperação de sessão
e extração de arquivos. Aplica-se após um desligamento incorreto, dispositivo de armazenamento cheio,
cópia interrompida ou falha nos metadados da sessão.

Sintomas típicos:

- O MiniOS cria outra sessão numerada a cada inicialização.
- `resume` não carrega a área de trabalho e arquivos anteriores.
- Selecionar uma sessão antiga no menu de boot não tem efeito.
- Diretórios de sessão ainda contêm arquivos `changes.dat`, mas não são ativados.

A causa pode ser um segmento de armazenamento incompleto, metadados do contêiner corrompidos,
um sistema de arquivos ext4 sujo dentro do `virtual.dat` ou um `session.conf` incorreto.

## Regras de Segurança

1. Não repare a única cópia de um contêiner de armazenamento.
2. Não copie sessões de origem sobre um armazenamento `minios/changes` em uso ou montado.
3. Copie o diretório completo `changes` antes de tentar a recuperação.
4. Execute `e2fsck -y` apenas em uma cópia adicional de uma sessão.
5. Não crie manualmente um arquivo `changes.dat.N` ausente.

Não faça a cópia inicial enquanto a sessão de origem estiver em execução ou enquanto o contêiner DynFileFS estiver montado. Seus arquivos de metadados e segmentos podem mudar independentemente e gerar uma cópia inconsistente. Inicialize sem persistência ou utilize outro sistema Linux. Mantenha a visualização DynFileFS/FUSE, o dispositivo de loop `virtual.dat` e o sistema de arquivos ext4 interno inativos. Monte apenas o sistema de arquivos externo de armazenamento, preferencialmente como somente leitura, para que os arquivos de segmento possam ser copiados de forma consistente.

## 1. Localize a Origem e o Destino

Exiba os sistemas de arquivos e pontos de montagem:

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Defina os caminhos para o diretório de origem `changes` e um diretório separado de recuperação
em um dispositivo com espaço livre suficiente:

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Verifique se o destino possui espaço livre suficiente:

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Copie Todos os Arquivos da Sessão

Use `rsync` quando disponível:

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

Alternativamente:

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

Não copie apenas o arquivo principal `changes.dat`. Uma sessão DynFileFS normalmente
contém uma sequência completa:

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

Todos os segmentos fazem parte de um único contêiner.

## 3. Identifique uma Sessão de Armazenamento

Compare os tamanhos das sessões e datas de modificação:

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Sessões vazias ou com falha geralmente são pequenas. Uma sessão que contém dados
persistentes reais normalmente ocupa muito mais espaço.

Verifique os metadados salvos da sessão:

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

O MiniOS usa o `session.conf` para selecionar e descrever as sessões de persistência.

## 4. Montar o contêiner DynFileFS ou dynblk

Localize o helper instalado. Dependendo da imagem do MiniOS, o nome canônico pode ser `dynblk` ou o nome de compatibilidade `@mount.dynfilefs`:

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Selecione uma sessão candidata, por exemplo, sessão 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Não especifique `-s` ou `perchsize` durante este procedimento manual de montagem para recuperação. O caminho de boot normal pode passar `-s` para um tamanho lógico solicitado ou registrado, mas a recuperação evita intencionalmente um pedido de redimensionamento e lê o tamanho existente dos metadados do DynFileFS/dynblk.

Uma montagem bem-sucedida expõe `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Verifique o sistema de arquivos ext4 sem fazer alterações:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Depois, monte como somente leitura:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Se os arquivos esperados estiverem visíveis, a sessão pode ser recuperada.

Desmonte na ordem inversa:

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Repare o Sistema de Arquivos Interno

Se o contêiner montar, mas `e2fsck -n` relatar erros ext4, faça primeiro outra cópia
daquela sessão:

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Monte e repare apenas essa cópia:

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

Repita a verificação somente leitura da seção anterior após o reparo.

## 6. Recupere em uma nova sessão compatível

Prefira a recuperação em uma sessão recém-criada em vez de reconstruir os metadados da sessão danificada. Se existir uma exportação `.tar.zst` válida, inicialize normalmente e importe com conversão automática para o sistema de arquivos de destino:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

A importação cria uma nova sessão numerada. Inspecione-a e, em seguida, ative-a explicitamente.

Se apenas o contêiner montado estiver utilizável, crie e inicialize uma nova sessão em um modo compatível com o sistema de arquivos de destino. Monte a cópia recuperada como somente leitura, conforme a seção 4, e então copie os arquivos necessários para essa sessão em execução. Por exemplo, para recuperar diretórios home:

```bash
sudo rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    /home/
sync
```

Copie apenas os dados e configurações de que precisar. Isso evita tratar metadados de compatibilidade desconhecidos ou incompletos como uma definição de sessão inicializável.

## 7. Não reconstrua os metadados da sessão no local

Não substitua `session.conf` por um arquivo mínimo nem adicione um diretório recuperado manualmente a um armazenamento existente. Os metadados descrevem todas as sessões naquele armazenamento; substituí-los pode isolar sessões saudáveis, descartar campos de compatibilidade e política de salvamento, e alterar a seleção de inicialização.

Se o contêiner puder ser montado como somente leitura, recupere seus arquivos em uma nova sessão compatível, conforme descrito acima. Se não puder ser montado, mantenha a cópia offline completa para recuperação forense ou do sistema de arquivos. Um contêiner sem metadados confiáveis de armazenamento é uma entrada recuperável, não uma definição de sessão inicializável.

## Referência de Erros

- `cannot open ... changes.dat.N`: um segmento confirmado está ausente. Recopie
  do dispositivo de origem ou tente outra sessão. Não crie um segmento vazio.
- `cannot read header`: o cabeçalho DynFileFS/dynblk está corrompido.
- `incompatible data format`: o helper e o formato do contêiner não correspondem.
- `virtual.dat` existe, mas o ext4 não monta: verifique uma cópia com `e2fsck`.

## Prevenindo Recorrências

A maioria dos incidentes começa quando o dispositivo de persistência enche durante o uso. Reduza o risco com estas medidas:

- Mantenha uma reserva de espaço livre com o parâmetro de boot `perchreserve` (padrão
  256 MiB). Novos contêineres e contêineres em crescimento nunca consomem essa reserva, e o MiniOS avisa na inicialização quando o espaço livre cai para a reserva. Aumente esse valor em dispositivos pequenos ou muito utilizados, por exemplo `perchreserve=1024`.
- Exclua sessões antigas ou não utilizadas antes que o dispositivo fique cheio.
- Prefira uma sessão `raw` de tamanho fixo quando precisar de uso de disco previsível, assim o crescimento não pode esgotar o dispositivo inesperadamente.
- Desligue corretamente. Uma queda de energia abrupta com o dispositivo cheio é a causa mais comum de um contêiner que depois não pode ser montado.
