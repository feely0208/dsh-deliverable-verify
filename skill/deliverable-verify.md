# 深鲸交付验收包（dsh-deliverable-verify）

**什么时候用**：收到交付包要确认完整、没被改过。

```bash
<cli> --input <包目录或 zip>
```

读 MANIFEST.json，重算每个文件 SHA256；缺失/不一致逐条列出。
