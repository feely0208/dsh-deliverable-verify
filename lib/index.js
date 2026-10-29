import { createPlugin, pkgRootFrom } from '@deepwhale-cn/dsh-guard-core/plugin';
import { registerApi } from './api.js';

const base = createPlugin({
  name: 'deliverable-verify',
  pkgRoot: pkgRootFrom(import.meta.url),
  skillFile: 'skill/deliverable-verify.md',
  binFile: 'bin/cli.mjs',
  description: '深鲸交付验收包：按 MANIFEST.json 与 SHA256 校验交付包是否完整、是否被改动',
  whenToUse: '当用户收到别人发来的交付包（zip 或目录）要确认是否完整时使用：读 MANIFEST.json，重算每个文件 SHA256，列出缺失与不一致。',
});
export const name = base.name;
export const inject = [...base.inject, 'webServer'];
export function apply(ctx) {
  base.apply(ctx);
  try { if (ctx.webServer?.register) registerApi(ctx); } catch (e) { ctx.logger?.warn?.('[deliverable-verify] 面板出口注册失败: ' + (e?.message || e)); }
}
