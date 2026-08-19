# contracts/community — 社区插件的契约

社区插件新增的契约放这里（文件名 `<name>@<major>.json`）。内核不用发版：`cak add` 的一致性测试、宿主组装内核时都会从 `~/.cak/registry/contracts/**` 读取（cak 决策 N-50）。

规则：
- 语义变了 = 新版本文件；`schemaDigest` 一经发布不可变（`scripts/validate.mjs` 校验：digest / 文件名 / `additionalProperties:false` / 唯一性）。
- 与 `contracts/builtin/`（内核内置镜像）同名同版本会在内核里报 `CAPABILITY_CONTRACT_CONFLICT`——想改内置契约请去 cak 仓库提 RFC。
- 契约的 `description` 与字段名是模型直接看到的东西：写给模型看（中文/英文都行，简短、可枚举、有默认值）。
