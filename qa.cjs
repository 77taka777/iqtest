const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const {QUESTIONS:q,DOMAINS,SEARCH_ROWS,PAIRS,SCAN_ROWS}=require('../dist/questions.js');
assert.equal(q.length,20);assert.equal(new Set(q.map(x=>x.id)).size,20);
DOMAINS.forEach((d,i)=>assert.equal(q.filter(x=>x.d===i).length,4));
q.forEach(x=>{assert.ok(x.explanation);if(x.options){assert.equal(x.options.length,4);assert.equal(new Set(x.options).size,4);assert.ok(Number.isInteger(x.answer)&&x.answer>=0&&x.answer<4)}else assert.equal(x.answer.length,x.maxLength)});
const rotate=(s,n)=>Array.from({length:n*n},(_,i)=>s[(n-1-i%n)*n+Math.floor(i/n)]).join('');
const mirror=(s,n)=>Array.from({length:n},(_,i)=>s.slice(i*n,i*n+n).split('').reverse().join('')).join('');
assert.equal(rotate(q[4].source,4),q[4].options[q[4].answer]);
assert.equal(mirror(q[5].source,4),q[5].options[q[5].answer]);
assert.equal('1010'.split('').map((x,i)=>Number(x)^Number('1100'[i])).join(''),q[6].options[q[6].answer]);
assert.equal(SEARCH_ROWS.join('').split('').filter(x=>x==='⊕').length,Number(q[16].options[q[16].answer]));
assert.equal(PAIRS.filter(([a,b])=>a===b).length,parseInt(q[18].options[q[18].answer]));
assert.equal(SCAN_ROWS.reduce((n,row)=>n+(row.replaceAll(' ','').match(/○△/g)||[]).length,0),Number(q[19].options[q[19].answer]));
assert.equal(q[12].memory.toReversed().join(''),q[12].answer);
assert.equal(q[13].memory.toSorted((a,b)=>a-b).join(''),q[13].answer);
assert.equal(q[14].memory.slice(-4).join(''),q[14].answer);
assert.equal(q[15].memory.toReversed().join(''),q[15].answer);
assert.equal(79*2+1,Number(q[8].options[q[8].answer]));
assert.equal(18*3,Number(q[9].options[q[9].answer]));
assert.equal(6**3+6,Number(q[11].options[q[11].answer]));
const perms=a=>a.length?a.flatMap((v,i)=>perms(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]];
assert.deepEqual(perms(['A','B','C','D']).filter(p=>p.indexOf('A')<p.indexOf('C')&&p.indexOf('D')===p.indexOf('B')+1&&p.indexOf('C')!==3),[['A','C','B','D']]);
let now=100000,storage={},nodes={},handlers={},timeouts=[],storageFails=false;
class El{constructor(){this.innerHTML='';this.textContent='';this.disabled=false;this.open=false;this.style={};this.dataset={};this.classList={toggle(){},remove(){}}}addEventListener(){}setAttribute(){}showModal(){this.open=true}close(){this.open=false}scrollIntoView(){}click(){}}
const doc={querySelector:s=>nodes[s]??=(new El()),querySelectorAll:()=>[],addEventListener:(k,f)=>handlers[k]=f,createElement:()=>new El(),hidden:false};
class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
const ctx=vm.createContext({document:doc,window:{scrollTo(){},addEventListener(){}},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>{if(storageFails)throw Error('Full');storage[k]=v},removeItem:k=>delete storage[k]},Date:Clock,setInterval:()=>1,clearInterval(){},setTimeout:f=>{timeouts.push(f);return timeouts.length},clearTimeout(){},console,Blob,URL});
vm.runInContext(fs.readFileSync('dist/questions.js','utf8')+'\n'+fs.readFileSync('dist/randomizer.js','utf8')+'\n'+fs.readFileSync('dist/supabase-config.js','utf8')+'\n'+fs.readFileSync('dist/app.js','utf8')+'\n'+fs.readFileSync('dist/scores.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.match(nodes['#app'].innerHTML,/思考の輪郭/);
run('begin()');assert.equal(run('state.index'),0);
run('record()');assert.equal(run('state.answers.length'),0,'No empty submissions');
run('state.sectionIntro=false;renderTest();selected=QUESTIONS[0].answer;record()');assert.equal(run('state.answers[0].correct'),true);
run('begin();state.index=18;state.sectionIntro=false;renderTest();reveal()');
let steps=0;while(timeouts.length&&steps++<80){const f=timeouts.shift();f()}
assert.equal(run('phase'),'answer');assert.ok(steps>7);
run('selected=QUESTIONS[18].answer;record()');assert.equal(run('state.answers[0].correct'),true);
run('begin();state.index=18;state.sectionIntro=false;renderTest();reveal()');doc.hidden=true;handlers.visibilitychange();assert.equal(run('phase'),'interrupted');run("record('skipped')");assert.equal(run('state.answers[0].status'),'interrupted');doc.hidden=false;timeouts=[];
run('begin();state.index=24;state.sectionIntro=false;renderTest();reveal();selected=QUESTIONS[24].answer');now+=25001;run('record()');assert.equal(run('state.answers[0].status'),'timeout');assert.equal(run('state.answers[0].correct'),false);
run('begin();state.index=24;state.sectionIntro=false;renderTest();reveal()');now+=25001;run('updateClock()');assert.equal(run('state.index'),25);
run('begin()');
for(let i=0;i<30;i++){run('state.sectionIntro=false;renderTest();phase="answer";selected=QUESTIONS[state.index].answer;itemStarted=Date.now();if(QUESTIONS[state.index].speed)deadline=Date.now()+25000;record()')}
assert.equal(run('screen'),'result');assert.equal(run('currentResult.answers.filter(x=>x.correct).length'),30);assert.equal(run('history().length'),1);assert.match(nodes['#app'].innerHTML,/全30問の解説/);
run('begin()');for(let i=0;i<30;i++)run('record("skipped")');assert.equal(run('currentResult.answers.filter(x=>x.correct).length'),0);assert.equal(run('history().length'),2);
storageFails=true;run('begin()');for(let i=0;i<30;i++)run('record("skipped")');assert.match(nodes['#app'].innerHTML,/保存できませんでした/);storageFails=false;
storage['mindscope-results-v1']='broken';assert.equal(run('history().length'),0);
storage['mindscope-results-v1']='[null,{"answers":[]}]';assert.equal(run('history().length'),0);
// Legacy results keep their original 20 questions and original option order.
storage['mindscope-results-v1']=JSON.stringify([{date:now,duration:100,answers:q.map(x=>({id:x.id,d:x.d,correct:true,answer:x.answer,status:'answered',seconds:1}))}]);
assert.equal(run('history().length'),1);run('showResults(history()[0])');assert.match(nodes['#app'].innerHTML,/全20問の解説/);assert.match(nodes['#app'].innerHTML,/20 問正解/);
assert.equal(run('QUESTION_BANK.length'),60);for(let d=0;d<5;d++)assert.equal(run(`QUESTION_BANK.filter(x=>x.d===${d}).length`),12);
let seed=20261015;ctx.seeded=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const seen=new Set(),signatures=new Set();
const originals=[...q,...JSON.parse(run('JSON.stringify(EXTRA_QUESTIONS)'))];
for(let t=0;t<1000;t++){
 const session=JSON.parse(run('JSON.stringify(createSession(seeded))'));
 assert.equal(session.length,30);assert.equal(new Set(session.map(x=>x.id)).size,30);
 for(let d=0;d<5;d++){assert.equal(session.filter(x=>x.d===d).length,6);assert.ok(session.slice(d*6,d*6+6).every(x=>x.d===d))}
 signatures.add(session.map(x=>x.id).join(','));
 for(const x of session){seen.add(x.id);assert.ok(x.prompt&&x.explanation);if(x.options){assert.equal(x.options.length,4);assert.equal(new Set(x.options).size,4);assert.ok(x.answer>=0&&x.answer<4)}
 if(x.visual==='rotate')assert.equal(rotate(x.source,4),x.options[x.answer]);
 if(x.visual==='mirror')assert.equal(mirror(x.source,4),x.options[x.answer]);
 if(x.visual==='xor'){let m=x.matrix||['1100','1010','0110','0110','0011','0101','1010','1100','?'];assert.equal(m[6].split('').map((v,j)=>Number(v)^Number(m[7][j])).join(''),x.options[x.answer])}
 if(x.d===3){const a=['reverse','spatial'].includes(x.memoryRule)?[...x.memory].reverse():x.memoryRule==='sort'?[...x.memory].sort((a,b)=>a-b):x.memory.slice(-x.maxLength);assert.equal(a.join(''),x.answer);assert.equal(x.answer.length,x.maxLength)}
 if(x.visual==='search')assert.equal(x.rows.join('').split('').filter(v=>v===x.target).length,Number(x.options[x.answer]));
 if(x.visual==='scan')assert.equal(x.rows.reduce((n,r)=>n+(r.replaceAll(' ','').match(/○△/g)||[]).length,0),Number(x.options[x.answer]));
 if(x.visual==='pairs')assert.equal(x.pairs.filter(([a,b])=>a===b).length,parseInt(x.options[x.answer]));
 if(x.visual==='coding')assert.equal(x.symbols.map(s=>x.key.find(([k])=>s===k)[1]).join(''),x.answer);
 if(x.d===0||x.d===2){const orig=originals.find(v=>v.id===x.id);assert.equal(x.options[x.answer],orig.options[orig.answer])}
 }
}
assert.equal(seen.size,60);assert.equal(signatures.size,1000);
// Review uses snapshots, even after another random session starts.
run('begin()');for(let i=0;i<30;i++)run('state.sectionIntro=false;renderTest();phase="answer";selected=QUESTIONS[state.index].answer;itemStarted=Date.now();if(QUESTIONS[state.index].speed)deadline=Date.now()+25000;record()');
const saved=run('JSON.stringify(history()[0])');run('begin()');run(`showResults(${saved})`);assert.equal(run('JSON.stringify(QUESTIONS)'),JSON.stringify(JSON.parse(saved).questions));assert.match(nodes['#app'].innerHTML,/全30問の解説/);
console.log('PASS: 1000 random sessions, all 60 templates, 30 unique items and 6 per domain; shuffled scoring; generated memory and speed answers; full and zero scores; deadlines; interruptions; storage; legacy history; review snapshots.');
