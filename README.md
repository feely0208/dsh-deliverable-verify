# 深鲸交付验收包（@deepwhale-cn/dsh-deliverable-verify）

收到交付包（zip 或目录）后，按 `MANIFEST.json` 与 SHA256 校验是否完整、是否被改动。

## 安装

```bash
dsh plugin --profile web add @deepwhale-cn/dsh-deliverable-verify
```

## 用法

```bash
dsh-deliverable-verify --input ./交付/张某案.zip
dsh-deliverable-verify --input ./交付/张某案
```

与「深鲸交付包」配套：一个负责打，一个负责验。
