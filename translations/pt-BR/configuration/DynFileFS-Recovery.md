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
2. Não copie sessões de origem sobre o `minios/changes` atualmente ativo.
3. Copie o diretório completo `changes` antes de tentar a recuperação.
4. Execute `e2fsck -y` apenas em uma cópia adicional de uma sessão.
5. Não crie manualmente um arquivo `changes.dat.N` ausente.

Se o MiniOS estiver em execução com persistência e o dispositivo de origem estiver montado,
é seguro fazer a cópia inicial. Não substitua o `session.conf` até que o MiniOS tenha sido iniciado sem persistência.

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

## 4. Monte o Contêiner DynFileFS ou dynblk

Localize o utilitário instalado. Dependendo da imagem do MiniOS, o nome canônico
pode ser `dynblk` ou o nome de compatibilidade `@mount.dynfilefs`:

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

Não especifique `-s` ou `perchsize` ao recuperar um contêiner existente. O tamanho virtual está armazenado nos metadados do DynFileFS/dynblk.

Um montagem bem-sucedida expõe o `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Verifique o sistema de arquivos ext4 sem fazer alterações:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Em seguida, monte como somente leitura:

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

## 6. Restaure a Sessão para Inicialização

Execute esta etapa após desligar a sessão persistente e inicializar o MiniOS
sem `perch`, `perchdir` ou `perchmode`. Também pode ser realizada a partir de
outro sistema Linux.

Copie o contêiner recuperado para um diretório de sessão numérico não utilizado. Usar um
novo número evita sobrescrever qualquer sessão atual:

```bash
NEW_CHANGES="$TARGET_MINIOS/changes"
RESTORED=90

test ! -e "$NEW_CHANGES/$RESTORED"
mkdir -p "$NEW_CHANGES/$RESTORED"
cp -a "$REPAIR/." "$NEW_CHANGES/$RESTORED/"
```

Se não foi necessário reparar o sistema de arquivos, copie de `$RECOVERY/$SESSION` em vez de
`$REPAIR`.

Faça backup e substitua os metadados da sessão:

```bash
cp -a "$NEW_CHANGES/session.conf" \
    "$NEW_CHANGES/session.conf.before-recovery" 2>/dev/null || true

printf '%s\n' \
    "default=$RESTORED" \
    "session_mode[$RESTORED]=dynfilefs" \
    >"$NEW_CHANGES/session.conf"
sync
```

Os metadados mínimos omitem deliberadamente os campos de versão, edição e união para
que dados de compatibilidade antigos não forcem o MiniOS a criar outra sessão.

Inicialize o MiniOS com:

```text
perchdir=resume perchmode=dynfilefs
```

Não adicione `perchdir=new` ou `perchsize` durante este primeiro boot de recuperação.

## 7. Recupere Arquivos Sem Inicializar a Sessão

Se o contêiner montar manualmente mas não puder ser usado como sessão de boot, copie
os arquivos importantes do ponto de montagem somente leitura para uma nova sessão de trabalho:

```bash
mkdir -p "$TARGET_MINIOS/recovered-home"
rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    "$TARGET_MINIOS/recovered-home/"
sync
```

## Referência de Erros

- `cannot open ... changes.dat.N`: um segmento confirmado está ausente. Recopie
do dispositivo de origem ou tente outra sessão. Não crie um segmento vazio.
- `cannot read header`: o cabeçalho DynFileFS/dynblk está corrompido.
- `incompatible data format`: o utilitário e o formato do contêiner não correspondem.
- `virtual.dat` existe mas o ext4 não monta: verifique uma cópia com `e2fsck`.
- O contêiner monta mas o MiniOS cria uma nova sessão: verifique se o
  `session.conf` aponta para o número restaurado e contém
  `session_mode[N]=dynfilefs`.

## Prevenindo Recorrências

A maioria dos incidentes começa quando o dispositivo de persistência enche durante o uso. Reduza o
risco com estas medidas:

- Mantenha uma reserva de espaço livre com o parâmetro de boot `perchreserve` (padrão:
  256 MB). Contêineres novos e em crescimento nunca consomem essa reserva, e o MiniOS avisa na inicialização
  quando o espaço livre cai para a reserva. Aumente em dispositivos pequenos ou muito usados, por exemplo `perchreserve=1024`.
- Exclua sessões antigas ou não utilizadas antes que o dispositivo fique cheio.
- Prefira uma sessão `raw` de tamanho fixo quando precisar de uso de disco previsível, assim
o crescimento não esgota o dispositivo inesperadamente.
- Desligue corretamente. Uma queda de energia abrupta com o dispositivo cheio é a causa
mais comum de um contêiner que depois não pode ser montado.
