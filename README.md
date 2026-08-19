# cak-registry — Composable Agent Kernel 注册表（R1：Git 索引）

`index.json` 是唯一入口：`plugins[]`（插件条目：id / version / kernelCompat / entrypoint / contracts + 样例参数 / license / source）与 `agents[]`（名片：principal / provides / endpoints / publicKeyPem / sig）。
安装方式是 **trust-but-verify**：`cak add <id> --registry <本仓库目录>` 会在你机器上重跑一致性测试，过了才装（tier T1）。注册表里不放任何"已验证"的报告——本机跑出来的才算。

- `contracts/builtin/`：内核内置契约镜像；`contracts/community/`：社区插件契约（随注册表分发，内核不必发版，N-50）
- 插件条目 `roles`：capability（默认）/ frontend / controller / skill（技能：只有 SKILL.md，`entrypoint: none`，T0）；`sensitiveReads: true` = 该插件读的是用户个人数据（邮件、日历、剪贴板、远端主机、容器），宿主对它的读类契约也要审批；`background: true` = 插件有常驻职责（定时器、监听），宿主立即启动并在进程死掉后自动重拉、重组时不重启它
- `agents/`：名片文件（`cak serve --publish` 写入 `index.json.agents`；手工提交也可）
- `rfcs/`：`std.*` 契约进入流程（见 cak 仓库 `docs/design/15_PLUGIN_ECOSYSTEM.md §2`）
- `scripts/validate.mjs`：CI 校验 index.json 结构与契约 digest 一致

提交插件条目：PR 修改 `index.json`；CI 会用条目里的 `entrypoint` 重跑一致性测试（R1 阶段先只校验结构 + digest）。
