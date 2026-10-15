const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
const nodes={},storage={},requests=[],responses=[];
class El{constructor(){this.innerHTML='';this.textContent='';this.value='';this.checked=false;this.disabled=false;this.open=false;this.style={};this.classList={toggle(){}}}addEventListener(){}showModal(){this.open=true}close(){this.open=false}scrollIntoView(){}}
const doc={querySelector:s=>nodes[s]??=new El(),querySelectorAll:()=>[],addEventListener(){}};
const context=vm.createContext({document:doc,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},Date,crypto:webcrypto,AbortController,URL,Blob,console,setTimeout,clearTimeout,setInterval,clearInterval,fetch:async(url,options)=>{requests.push({url,options});const next=responses.shift();if(next instanceof Error)throw next;if(!next)throw Error('Unexpected request');return next}});
const run=s=>vm.runInContext(s,context);
run(['questions.js','randomizer.js','hard-questions.js'].map(f=>fs.readFileSync('./'+f,'utf8')).join('\n')+'\nconst SUPABASE_CONFIG={url:"https://example.supabase.co",publishableKey:"sb_publishable_example"};\n'+['app.js','scores.js'].map(f=>fs.readFileSync('./'+f,'utf8')).join('\n'));
const ok=data=>({ok:true,status:200,headers:{get:()=>null},json:async()=>data});
const blank={ok:true,status:201,headers:{get:()=>null},json:async()=>{throw Error('Must not parse empty response')}};
run('QUESTIONS=createSession();currentResult={date:Date.now(),duration:300,answers:QUESTIONS.map(q=>({id:q.id,d:q.d,correct:true,status:"answered",answer:q.answer,seconds:1})),questions:QUESTIONS};screen="result"');
assert.equal(run('cloudReady()'),true);assert.equal(run('normalizeNickname("  ﾀｶ  ")'),'タカ');assert.throws(()=>run('normalizeNickname(" ")'));assert.throws(()=>run('normalizeNickname("名前\\n名前")'));assert.throws(()=>run('normalizeNickname("a".repeat(21))'));assert.throws(()=>run('normalizeNickname("a\\u200bb")'));
assert.match(run('publishPanel(currentResult)'),/このニックネームと結果/);
const payload=JSON.parse(run('JSON.stringify(makeSubmission(currentResult,"たか"))'));assert.equal(payload.nickname,'たか');assert.equal(payload.total,30);for(let d=0;d<5;d++)assert.equal(payload['d'+d],6);assert.equal(payload.score,undefined);assert.equal(payload.answers,undefined);assert.equal(payload.questions,undefined);
const same=run('makeSubmission(currentResult,"たか").id');assert.equal(same,payload.id);assert.throws(()=>run('makeSubmission({date:Date.now(),duration:10,answers:[]},"たか")'));
storage['mindscope-results-v1']=run('JSON.stringify([currentResult])');['#scoreNickname','#scoreConsent','#publishStatus','#publishScoreBtn','#scoresList','#nextScores','#previousScores','#scoresPageLabel'].forEach(s=>doc.querySelector(s));nodes['#scoreNickname'].value='たか';
(async()=>{
 await run('publishScore()');assert.equal(requests.length,0,'Consent required');
 nodes['#scoreConsent'].checked=true;responses.push(blank);await run('publishScore()');assert.equal(requests.length,1);assert.equal(requests[0].options.method,'POST');assert.match(requests[0].url,/mindscope_scores$/);assert.equal(JSON.parse(requests[0].options.body).id,payload.id);assert.equal(run('currentResult.cloudRegistered'),true);assert.equal(nodes['#publishScoreBtn'].disabled,true);assert.match(run('publishPanel(currentResult)'),/disabled>登録済み/);
 // A retry with the same result ID never rewrites an existing nickname.
 responses.push({ok:false,status:409,json:async()=>({code:'23505'})},ok([{nickname:'最初の名前'}]));nodes['#scoreNickname'].value='別の名前';await run('publishScore()');assert.equal(run('currentResult.nickname'),'最初の名前');
 responses.push(new Error('Network unavailable'));await run('publishScore()');assert.equal(nodes['#publishScoreBtn'].disabled,false);assert.match(nodes['#publishStatus'].textContent,/Network unavailable/);
 run('screen="scores"');responses.push(ok([{id:payload.id,nickname:'<img src=x onerror=alert(1)>',score:30,total:30,d0:6,d1:6,d2:6,d3:6,d4:6,duration_seconds:300,completed_at:new Date().toISOString()}]));await run('loadScores()');assert.match(nodes['#scoresList'].innerHTML,/&lt;img/);assert.doesNotMatch(nodes['#scoresList'].innerHTML,/<img/);assert.equal(nodes['#nextScores'].disabled,true);
 responses.push(ok(Array.from({length:26},(_,i)=>({id:String(i),nickname:'参加者',score:10,total:30,d0:2,d1:2,d2:2,d3:2,d4:2,duration_seconds:100,completed_at:new Date().toISOString()}))));await run('loadScores()');assert.equal(nodes['#nextScores'].disabled,false);assert.equal((nodes['#scoresList'].innerHTML.match(/class="community-row"/g)||[]).length,25);
 run('scorePage=1');responses.push(ok([]));await run('loadScores()');assert.match(requests.at(-1).url,/offset=25/);assert.equal(nodes['#previousScores'].disabled,false);
 responses.push({ok:false,status:500,json:async()=>({})});await run('loadScores()');assert.match(nodes['#scoresList'].innerHTML,/再読み込み/);
 run('QUESTIONS=createSession(undefined,"hard");currentResult={mode:"hard",date:Date.now(),duration:300,answers:QUESTIONS.map(q=>({id:q.id,d:q.d,correct:true,status:"answered",answer:q.answer,seconds:1})),questions:QUESTIONS}');
 assert.equal(run('makeSubmission(currentResult,"たか").mode'),'hard');assert.equal(payload.mode,'standard');
 assert.throws(()=>run('makeSubmission({...currentResult,mode:"bad"},"たか")'));
 run('screen="scores";scoreMode="hard";scorePage=0');responses.push(ok([{nickname:'難問たか',mode:'hard',score:30,total:30,d0:6,d1:6,d2:6,d3:6,d4:6,duration_seconds:300,completed_at:new Date().toISOString()}]));await run('loadScores()');
 assert.match(requests.at(-1).url,/mode=eq.hard/);assert.match(nodes['#scoresList'].innerHTML,/高難易度版/);
 run('scoreMode="standard"');responses.push(ok([]));await run('loadScores()');assert.match(requests.at(-1).url,/mode=eq.standard/);
 console.log('PASS: nickname and consent; both mode payloads; duplicate retries; escaped records; difficulty filters and pagination.');
})().catch(e=>{console.error(e);process.exitCode=1});
