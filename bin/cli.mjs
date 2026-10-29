#!/usr/bin/env node
import { run } from '../lib/core.mjs';

const args = process.argv.slice(2);
const val = (k, d = '') => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
if (!args.length || args.includes('--help')) {
  console.log(`dsh-deliverable-verify —— 深鲸交验收包

用法：dsh-deliverable-verify --op <verify> [参数]
参数：input
示例：dsh-deliverable-verify --input ./张某案.zip`);
  process.exit(0);
}
const input = { op: val('op', 'verify') };
for (const k of ["input"]) input[k] = val(k);
const r = await run(input);
if (!r.ok) { console.error('❌', r.text || '失败'); process.exit(1); }
console.log(r.text || '');
process.exit(0);
