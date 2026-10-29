import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

export function run({ input = '' } = {}) {
  const raw = String(input || '').trim();
  if (!raw) return { ok: false, text: '请填写交付包目录，或 .zip 文件路径' };
  if (!existsSync(raw)) return { ok: false, text: '路径不存在：' + raw };
  let dir = raw, temp = '';
  if (raw.toLowerCase().endsWith('.zip')) {
    temp = mkdtempSync(join(tmpdir(), 'dwh-verify-'));
    const r = spawnSync('unzip', ['-q', raw, '-d', temp], { encoding: 'utf8' });
    if (r.status !== 0) return { ok: false, text: '解压失败（需要系统 unzip）：' + (r.stderr || r.stdout || '').slice(0, 200) };
    dir = temp;
  }
  try {
    let manifestPath = join(dir, 'MANIFEST.json');
    if (!existsSync(manifestPath)) {
      // 包内可能有一层子目录
      const sub = readdirSync(dir).map((n) => join(dir, n)).filter((p) => { try { return statSync(p).isDirectory(); } catch { return false; } });
      for (const s of sub) { const m = join(s, 'MANIFEST.json'); if (existsSync(m)) { manifestPath = m; dir = s; break; } }
    }
    if (!existsSync(manifestPath)) return { ok: false, text: '没有找到 MANIFEST.json —— 这不是深鲸交付包，或清单被删了' };
    const man = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const files = man.files || [];
    const bad = [], missing = [];
    for (const f of files) {
      const p = join(dir, f.path);
      if (!existsSync(p)) { missing.push(f.path); continue; }
      if (sha(p) !== f.sha256) bad.push(f.path);
    }
    const lines = [
      '交付包：' + (man.name || '(未命名)'),
      '生成时间：' + (man.generatedAt || '?'),
      '文件数：' + files.length + '（声明合计 ' + ((man.totalBytes || 0) / 1024 / 1024).toFixed(2) + ' MB）',
      '',
      missing.length ? ('缺失 ' + missing.length + ' 个：' + missing.slice(0, 10).join('、')) : '缺失：0',
      bad.length ? ('校验和不一致 ' + bad.length + ' 个：' + bad.slice(0, 10).join('、')) : '校验和：全部一致',
    ];
    const ok = missing.length === 0 && bad.length === 0;
    lines.unshift(ok ? '✅ 交付包完整，未被修改' : '❌ 交付包有问题');
    return { ok, text: lines.join('\n') };
  } finally {
    if (temp) { try { rmSync(temp, { recursive: true, force: true }); } catch {} }
  }
}
