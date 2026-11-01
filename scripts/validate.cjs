const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..')+'/';
const source=fs.readFileSync(root+'content.js','utf8')+'\n'+fs.readFileSync(root+'app.js','utf8');
const main={innerHTML:'',focus(){}};
const generic={textContent:'',addEventListener(){},focus(){}};
const ctx=vm.createContext({document:{querySelector:s=>s==='#main'?main:generic,addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},window:{scrollTo(){}},Math,Date,console,setTimeout,Blob,URL});
vm.runInContext(source,ctx);
function run(s){return vm.runInContext(s,ctx);}
const variants=[0,1,2];
assert.equal(run('MODULES.length'),7);assert.equal(run('TASKS.length'),35);assert.equal(run('new Set(TASKS.map(t=>t.id)).size'),35);
let checks=0;
for(let mask=1;mask<128;mask++)for(const v of variants){
 run(`state=freshState();state.selected=MODULES.filter((m,i)=>${mask}&(1<<i)).map(m=>m.id);state.meta={anchorPrice:${v%2?999:399},glyphContext:'${v%2?'letters':'numbers'}',outcome:'${v%2?'high':'low'}'};state.answers={};for(const t of queue()){let a={};if(t.form==='halo'){for(const f of t.fields)a[f.name]=f.options[${v}%f.options.length][0];}else if(t.form==='cards'){a.cards=${v===0?"['pottery','red']":v===1?"['pottery','blue']":"['pottery','wood','red','blue']"};}else {a.value=t.options[${v}%t.options.length][0];if(t.firstOptions)a.first=t.firstOptions[0][0];if(t.form==='search')a.read=${v===0?"['comparison','counter']":"['complaints','late']"};}if(t.confidence)a.certainty=['low','medium','high'][${v}];state.answers[t.id]=a;state.drafts[t.id]=a;}`);
 const count=run('queue().length');assert.equal(count,run('state.selected.length')*5);
 assert.equal(run('pages().flatMap(p=>p.ids).length'),count);
 assert.equal(run('new Set(pages().flatMap(p=>p.ids)).size'),count);
 run("state.phase='report';showReport()");assert(!main.innerHTML.includes('undefined'));assert(!main.innerHTML.includes('NaN'));assert.equal((main.innerHTML.match(/class="finding"/g)||[]).length,run('state.selected.length'));if(mask!==127)assert(main.innerHTML.indexOf('class="finding"')<main.innerHTML.indexOf('class="skipped-modules"'));
 const text=run('reportText()');assert(!text.includes('undefined'));assert(text.includes(`已记录情境：${count}`));
 for(let p=0;p<run('pages().length');p++){run(`state.reveal=${p};showReveal()`);assert(!main.innerHTML.includes('undefined'));}
 for(let i=0;i<count;i++){run(`state.step=${i};showTask()`);assert(main.innerHTML.includes('task-form'));assert(!main.innerHTML.includes('undefined'));const id=run('queue()[state.step].id');if(run("['staged','search'].includes(queue()[state.step].form)")){run(`state.opened['${id}']=true;showTask()`);assert(!main.innerHTML.includes('undefined'));}}
 for(const id of run('queue().map(t=>t.id)')){const result=run(`interpretTask('${id}',state.answers,state.meta)`);for(const k of ['concept','title','method','limit'])assert(result[k]);for(const k of result.sources)assert(run(`Boolean(SOURCES['${k}']?.url)`));}
 checks++;
}
assert.equal(run("cardRuleValid(['pottery','red'])"),true);assert.equal(run("cardRuleValid(['pottery','blue'])"),false);
run("state=freshState();state.answers.forecast={value:'low'};state.answers.hindsight={value:'high'};state.meta.outcome='high'");assert(run("interpretTask('hindsight',state.answers,state.meta).body.join('')").includes('更靠近'));
run("state.meta.outcome='low'");assert(run("interpretTask('hindsight',state.answers,state.meta).body.join('')").includes('并未朝'));
assert.equal(run("glyph('letters').match(/<path[^>]+>/)[0]"),run("glyph('numbers').match(/<path[^>]+>/)[0]"));
for(const m of ['seeing','choosing','evidence','remembering','owning','portraits','intuiting'])assert.equal(run(`tasksForModules(['${m}']).length`),5);
console.log(`PASS: ${checks}个模块组合与合成作答路径；35题作答/分阶段/解释/报告渲染；反例逻辑与事后方向；字形笔画一致。`);

assert.equal(run("freshState().selected.length"),4);
for(const id of ['story_help','intuition_expert']){const h=run(`taskBody(TASKS.find(t=>t.id==='${id}'),{})`);assert(h.includes('stimulus-comparison'));}
console.log('PASS: 7 modules, 35 unique tasks, first-stage stimuli present, default 4 modules.');
