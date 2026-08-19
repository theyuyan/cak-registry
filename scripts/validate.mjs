// 校验 index.json 结构 + contracts/{builtin,community} 的 schemaDigest 一致（sha256(JCS(语义字段)))
import fs from 'node:fs'; import path from 'node:path'; import { createHash } from 'node:crypto';
import canonicalize from 'canonicalize';
const idx = JSON.parse(fs.readFileSync('index.json', 'utf8'));
let bad = 0; const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) bad++; };
ok(idx.version === 1 && Array.isArray(idx.plugins) && Array.isArray(idx.agents), 'index.json 结构');
for (const p of idx.plugins) ok(p.id && p.version && p.kernelCompat && p.entrypoint?.type && Array.isArray(p.contracts) && p.license, `plugin ${p.id}: 必填字段（含 license）`);
for (const a of idx.agents) ok(a.principal?.kind && a.principal?.id && Array.isArray(a.provides), `agent ${a.principal?.id}: 名片字段`);
// contracts/builtin（内核内置镜像）+ contracts/community（社区插件契约，随注册表分发，N-50）：digest 一致、同 name@version 只能出现一次、文件名 = <name>@<major>.json
const seen = new Map();
const files = ['contracts/builtin', 'contracts/community'].filter(d => fs.existsSync(d)).flatMap(d => fs.readdirSync(d).filter(x => x.endsWith('.json')).map(f => path.join(d, f)));
for (const file of files) {
  const f = path.basename(file); const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  const [maj, min] = c.version.split('.'); ok(f === `${c.name}@${maj}.json` || f === `${c.name}@${maj}.${min}.json`, `contract file ${file}: 文件名 = <name>@<major>[.<minor>].json`);
  ok(c.inputSchema?.additionalProperties === false && c.outputSchema?.additionalProperties === false, `contract ${c.name}@${c.version}: schema additionalProperties:false`);
  ok(['none', 'read', 'write', 'external'].includes(c.sideEffects) && typeof c.idempotent === 'boolean', `contract ${c.name}@${c.version}: sideEffects/idempotent`);
  const k = `${c.name}@${c.version}`; ok(!seen.has(k), `contract ${k}: 只出现一次（${seen.get(k) ?? ''}）`); seen.set(k, file);
  const d = 'sha256:' + createHash('sha256').update(Buffer.from(canonicalize({ name: c.name, version: c.version, inputSchema: c.inputSchema, outputSchema: c.outputSchema, sideEffects: c.sideEffects, idempotent: c.idempotent, permissions: c.permissions ?? [] }), 'utf8')).digest('hex');
  ok(d === c.schemaDigest, `contract ${c.name}@${c.version} digest`);
}
for (const p of idx.plugins) { const args = (p.entrypoint?.args ?? []).join(' '); if (p.entrypoint?.type === 'subprocess' && /\bdist\//.test(args) && Array.isArray(p.install?.build) && p.install.build.length === 0) ok(false, `plugin ${p.id}: 入口在 dist/ 但 install.build 为空（会装出没构建的空壳）`); }
for (const p of idx.plugins) for (const c of p.contracts) ok([...seen.keys()].some(k => k.startsWith(c.name + '@')), `plugin ${p.id}: 契约 ${c.name} 在 contracts/ 里有定义`);
console.log(bad ? `FAILED ${bad}` : 'registry OK'); process.exit(bad ? 1 : 0);
