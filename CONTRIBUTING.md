# 贡献

- DCO：`git commit -s`。
- 插件条目：`index.json.plugins[]` 加一项，字段见 cak 仓库 `kernel/boundary/registry.ts` 的 `RegistryPluginEntry`；`license` 必填；`contracts[].sampleArgs` 必须能让本机一致性测试通过。
- 契约：`std.*` 走 `rfcs/`（一页模板，两周评论期，两位维护者同意）；`x.*` 实验区任何人可提；同 name@version 的 digest 不可变。
- 名片：`agents[]` 一条；建议由 `cak serve --publish` 生成（带公钥与签名）。
