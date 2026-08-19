// 校验 index.json 结构 + contracts/builtin 的 schemaDigest 一致（sha256(JCS(语义字段)))
import fs from 'node:fs'; import path from 'node:path'; import { createHash } from 'node:crypto';
import canonicalize from 'canonicalize';
const idx = JSON.parse(fs.readFileSync('index.json', 'utf8'));
let bad = 0; const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) bad++; };
ok(idx.version === 1 && Array.isArray(idx.plugins) && Array.isArray(idx.agents), 'index.json 结构');
for (const p of idx.plugins) ok(p.id && p.version && p.kernelCompat && p.entrypoint?.type && Array.isArray(p.contracts) && p.license, `plugin ${p.id}: 必填字段（含 license）`);
for (const a of idx.agents) ok(a.principal?.kind && a.principal?.id && Array.isArray(a.provides), `agent ${a.principal?.id}: 名片字段`);
for (const f of fs.readdirSync('contracts/builtin').filter(x => x.endsWith('.json'))) {
  const c = JSON.parse(fs.readFileSync(path.join('contracts/builtin', f), 'utf8'));
  const d = 'sha256:' + createHash('sha256').update(Buffer.from(canonicalize({ name: c.name, version: c.version, inputSchema: c.inputSchema, outputSchema: c.outputSchema, sideEffects: c.sideEffects, idempotent: c.idempotent, permissions: c.permissions ?? [] }), 'utf8')).digest('hex');
  ok(d === c.schemaDigest, `contract ${c.name}@${c.version} digest`);
}
console.log(bad ? `FAILED ${bad}` : 'registry OK'); process.exit(bad ? 1 : 0);
