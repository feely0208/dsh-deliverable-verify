#!/bin/bash
set -uo pipefail
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
T=$(mktemp -d)

mkdir -p "$T/pack/files"
printf 'hello' > "$T/pack/files/a.txt"
H=$(shasum -a 256 "$T/pack/files/a.txt" | awk '{print $1}')
printf '{"name":"测试包","generatedAt":"2026-01-01T00:00:00Z","totalBytes":5,"files":[{"path":"files/a.txt","bytes":5,"sha256":"%s"}]}' "$H" > "$T/pack/MANIFEST.json"
OUT=$(node bin/cli.mjs --input "$T/pack" 2>&1)
echo "$OUT" | grep -q "完整" && ok "完整包校验通过" || bad "完整包未通过：$OUT"
printf 'tampered' >> "$T/pack/files/a.txt"
OUT2=$(node bin/cli.mjs --input "$T/pack" 2>&1)
echo "$OUT2" | grep -q "不一致" && ok "篡改被检出" || bad "篡改未检出：$OUT2"
cd "$T" && zip -qr pack.zip pack && cd - >/dev/null
OUT3=$(node bin/cli.mjs --input "$T/pack.zip" 2>&1)
echo "$OUT3" | grep -q "不一致" && ok "zip 也能校验" || bad "zip 校验异常：$OUT3"

echo "  ────────────────────────────────────────"; echo "  通过 $PASS · 失败 $FAIL"; rm -rf "$T"; [ "$FAIL" -eq 0 ]
