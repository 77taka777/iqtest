'use strict';
const TOTAL_QUESTIONS=30,PER_DOMAIN=6;
const TEST_MODES=Object.freeze({standard:{label:'通常版',pool:60,minutes:'20–30',speedLimit:25,memoryMs:900},hard:{label:'高難易度版',pool:40,minutes:'25–40',speedLimit:20,memoryMs:750}});
function modeInfo(mode){return TEST_MODES[mode]||TEST_MODES.standard}
function questionBank(mode='standard'){return mode==='hard'?HARD_QUESTIONS:QUESTION_BANK}
function randomFloat(){if(typeof crypto!=='undefined'&&crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}return Math.random()}
function shuffle(items,rng=randomFloat){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function turnPattern(s,n=4){return Array.from({length:n*n},(_,i)=>s[(n-1-i%n)*n+Math.floor(i/n)]).join('')}
function mirrorPattern(s,n=4){return Array.from({length:n},(_,i)=>s.slice(i*n,i*n+n).split('').reverse().join('')).join('')}
const EXTRA_QUESTIONS=[
 {id:21,d:0,title:'意味の近さを見極める',prompt:'「恣意的」に最も近い意味はどれですか。',options:['個人の思いつきや都合に基づく','複数の人が慎重に検討した','一定の規則に例外なく従う','偶然によって決まる'],answer:0,explanation:'恣意的とは、十分な根拠や共通の基準によらず、自分の思いつきや都合に任せることです。「偶然に任せる」とは異なります。'},
 {id:22,d:0,title:'説明の構造をとらえる',prompt:'「原因」と「相関」の違いを、最も正確に説明しているものはどれですか。',options:['一緒に変化する関係があれば、片方が必ず他方を生じさせる','相関は必ず偶然だが、原因は必ず意図的である','一緒に変化していても、片方が他方を生じさせているとは限らない','原因と相関は、同じ関係の別の呼び方である'],answer:2,explanation:'相関は、2つの変数が関連して変化すること。第三の要因によって両方が変化する場合もあり、因果関係をそのまま意味しません。'},
 {id:23,d:0,title:'同じ関係を見つける',prompt:'「辞書：語の意味」と、最も同じ関係になる組み合わせはどれですか。',options:['目次：章の位置','本棚：紙の厚さ','書評：印刷部数','著者：読者の年齢'],answer:0,explanation:'辞書は語の意味を調べる手がかり、目次は章の位置を調べる手がかりです。調べるための情報源と、そこで得られる情報の関係が共通します。'},
 {id:24,d:0,title:'説明を、ひとつにまとめる',prompt:'「契約」と「ゲームのルール」の共通点を、最も適切に表すのはどれですか。',options:['すべての参加者に、同じ利益を保証する','参加者の行動や関係を、取り決めによって調整する','違反した場合、必ず法律によって処罰される','一度成立すると、いかなる変更もできない'],answer:1,explanation:'どちらも、関わる人の行動や関係の枠組みを取り決めます。利益の平等、法的処罰、変更不可能性は共通の必須条件ではありません。'},
 {id:25,d:0,title:'限定された結論を読む',prompt:'「この方法が最善だとは限らない。」この文と、最も意味が近いものはどれですか。',options:['この方法は、必ず最悪である','この方法より良い方法は、存在しない','この方法が最善ではない可能性がある','この方法を使うことは、できない'],answer:2,explanation:'「とは限らない」は、そうでない可能性を残す表現です。最善ではないと断定したり、使用を否定したりはしていません。'},
 {id:26,d:0,title:'抽象的な言葉をつかむ',prompt:'「必要な特徴だけを取り出して、細かな違いを捨てること」を最もよく表す言葉はどれですか。',options:['列挙','抽象化','模倣','逆算'],answer:1,explanation:'抽象化は、複数の対象や複雑な対象から、目的に照らして共通・本質的な特徴を取り出すことです。細部をすべて並べる列挙とは異なります。'},
 {id:27,d:0,title:'関係の向きを保つ',prompt:'「種：発芽」と、最も同じ関係になる組み合わせはどれですか。',options:['雲：蒸発','卵：孵化','水：蛇口','花：種'],answer:1,explanation:'種が発芽する、卵が孵化する、という関係です。ある段階のものが成長過程の次の段階へ進む変化を表しています。'},
 {id:28,d:0,title:'対照を、概念で捉える',prompt:'「公平」と「一律」の違いを最も適切に述べているのはどれですか。',options:['どちらも必ず、全員に同じ量を配ることを意味する','公平さを目指す場合、事情に応じて扱いを変えることもある','一律の扱いは、どんな場合も不公平である','公平かどうかは、常に計算だけで決まる'],answer:1,explanation:'一律は同じ基準や扱いを適用すること。公平さの判断では条件や事情を考慮する場合があり、一律と常に一致するとは限りません。'},
 {id:37,d:2,title:'変化する差を追う',prompt:'「？」に入る数はどれですか。',sequence:'3, 8, 18, 38, 78, ?',options:['148','156','158','168'],answer:2,explanation:'各項を2倍して2を足します。78×2＋2＝158。差も5、10、20、40、80と倍になっています。'},
 {id:38,d:2,title:'ふたつ前との関係',prompt:'最初の2項の後は、直前の2項の和が続きます。「？」に入る数はどれですか。',sequence:'2, 5, 7, 12, 19, ?',options:['26','29','31','38'],answer:2,explanation:'2＋5＝7、5＋7＝12、7＋12＝19。次は12＋19＝31です。'},
 {id:39,d:2,title:'交互に変わる操作',prompt:'同じ2つの操作を交互に行っています。「？」に入る数はどれですか。',sequence:'5, 15, 13, 39, 37, ?',options:['74','109','111','113'],answer:2,explanation:'3倍する、2を引く、を交互に繰り返しています。37の次は37×3＝111です。'},
 {id:40,d:2,title:'関係式を組み合わせる',prompt:'A＋B＝13、B＋C＝17、A＋C＝14です。2×A＋Cはいくつですか。',options:['18','19','20','22'],answer:1,explanation:'3式を足すと2(A＋B＋C)＝44、合計は22。A＝22−17＝5、C＝22−13＝9なので、2×5＋9＝19です。'},
 {id:41,d:2,title:'条件から確実なことを選ぶ',prompt:'すべてのリムはナクです。ナクであるものは、どれもソルではありません。必ず正しいのはどれですか。',options:['すべてのナクはリムである','ソルであるリムは存在しない','すべてのソルはリムである','リムでないものは、すべてソルである'],answer:1,explanation:'リムはナクに含まれ、ナクとソルは重なりません。そのためリムとソルも重なりません。リムやナクが実際に存在するかを仮定する必要はありません。'},
 {id:42,d:2,title:'比率を、逆から考える',prompt:'袋に赤い玉と青い玉があります。赤は青の2倍です。青を3個加えると同じ数になりました。最初の赤はいくつですか。',options:['3','6','9','12'],answer:1,explanation:'最初の青をx個とすると赤は2x個。青を3個増やして等しくなるのでx＋3＝2x、x＝3。赤は6個です。'},
 {id:43,d:2,title:'順位の条件を整理する',prompt:'PはQより上位、RはPより上位、SはQより下位です。同順位がないとき、2番目は誰ですか。',options:['P','Q','R','S'],answer:0,explanation:'R＞P＞Q＞Sという順序に一意に決まります。2番目はPです。'},
 {id:44,d:2,title:'増え方の規則を読む',prompt:'差が連続する奇数になる数列です。「？」に入る数はどれですか。',sequence:'2, 5, 10, 17, 26, ?',options:['35','36','37','39'],answer:2,explanation:'差が3、5、7、9なので、次は11を足して37。各項がn²＋1という規則にもなっています。'}
];
['1000011010100100','0100110000101010','0010100011010100','1100001010010100','1001011000101100','0011100001010010'].forEach((source,i)=>{
 const reflect=i>=3;const answer=reflect?mirrorPattern(source):turnPattern(source);
 const candidates=[answer,source,turnPattern(turnPattern(source)),mirrorPattern(turnPattern(source)),turnPattern(turnPattern(turnPattern(source)))];
 const options=[...new Set(candidates)].slice(0,4);
 if(options.length!==4)throw Error('Ambiguous visual template');
 EXTRA_QUESTIONS.push({id:29+i,d:1,title:reflect?'配置を保って、鏡に映す':'細部まで、回転を追う',prompt:reflect?'左の模様を左右に反転したものを選んでください。上下は入れ替えません。':'左の模様を時計回りに90°回転させたものを選んでください。',visual:reflect?'mirror':'rotate',source,options,answer:0,explanation:reflect?'左右の反転では、各行の左端と右端、左から2番目と3番目を入れ替えます。行の上下の順番は変えません。':'時計回り90°の回転では、元の上の行が右端の列へ移ります。各マスの位置を同じ規則で移すと、正解の模様になります。'});
});
[['1010','0110','0011','1001','1100','1010'],['1001','1100','0110','1010','0011','0101']].forEach((a,i)=>{
 const xor=(x,y)=>x.split('').map((v,j)=>Number(v)^Number(y[j])).join('');const target=xor(a[4],a[5]);
 const options=[target,...['0000','1111','1001','0110','1010','0101'].filter(x=>x!==target)].slice(0,4);
 EXTRA_QUESTIONS.push({id:35+i,d:1,title:'重なりから、共通の規則へ',prompt:'各行の左2つから右の模様が作られます。「？」に入る模様を選んでください。',visual:'xor',matrix:[a[0],a[1],xor(a[0],a[1]),a[2],a[3],xor(a[2],a[3]),a[4],a[5],'?'],options,answer:0,explanation:'2つの模様の同じ位置を比べ、片方だけが塗られているマスを残します。両方が塗られているマスは消えます。3行目にも同じ規則を適用します。'});
});
['reverse','sort','tail','spatial','reverse','sort','tail','spatial'].forEach((rule,i)=>{
 const length=rule==='tail'?12:rule==='sort'?8:rule==='spatial'?6:7;
 EXTRA_QUESTIONS.push({id:45+i,d:3,title:{reverse:'順序を逆に、再構成',sort:'覚えた数字を、整える',tail:'記憶を更新し続ける',spatial:'空間の経路を、たどり直す'}[rule],memoryRule:rule,memory:Array.from({length},(_,j)=>j%9+1),input:true,spatial:rule==='spatial',maxLength:rule==='tail'?4:length,answer:'',prompt:'',explanation:''});
});
['search','coding','pairs','scan','search','coding','pairs','scan'].forEach((visual,i)=>EXTRA_QUESTIONS.push({id:53+i,d:4,title:{search:'記号を、正確に探す',coding:'対応を切り替えて、変換する',pairs:'違いを、見逃さない',scan:'並び順を、素早く見抜く'}[visual],visual,speed:true,limit:25,answer:0,prompt:'',explanation:''}));
const QUESTION_BANK=[...BASE_QUESTIONS,...EXTRA_QUESTIONS];
function materialize(template,rng=randomFloat){const q=JSON.parse(JSON.stringify(template)),digit=()=>1+Math.floor(rng()*9);
 if(q.d===3){const rule=q.memoryRule||({13:'reverse',14:'sort',15:'tail',16:'spatial'}[q.id]);q.memoryRule=rule;
 q.memory=rule==='spatial'?shuffle([1,2,3,4,5,6,7,8,9],rng).slice(0,q.maxLength):Array.from({length:q.memory.length},digit);
 const a=rule==='reverse'||rule==='spatial'?[...q.memory].reverse():rule==='sort'?[...q.memory].sort((a,b)=>a-b):rule==='oddEven'?[...q.memory.filter(n=>n%2).sort((a,b)=>a-b),...q.memory.filter(n=>n%2===0).sort((a,b)=>a-b)]:q.memory.slice(-q.maxLength);q.answer=a.join('');
 q.prompt=rule==='spatial'?`3×3のマスが順番に光ります。光った順序を逆にして、マスを${q.maxLength}回タップしてください。`:rule==='oddEven'?'数字が1つずつ表示されます。まず奇数だけを小さい順、続けて偶数だけを小さい順に並べて入力してください。重複する数字もすべて入力します。':rule==='sort'?'数字が1つずつ表示されます。覚えた数字を、小さい順に並べ替えて入力してください。同じ数字が複数回出たら、その回数だけ入力します。':rule==='tail'?`数字が次々に表示されます。最後の${q.maxLength}つだけを、表示された順で入力してください。`:'数字が1つずつ表示されます。最後まで覚えたら、逆の順に入力してください。';
 q.explanation=`${rule==='spatial'?'左上から右下へ1〜9としたマスの':''}表示順は${q.memory.join('→')}。${rule==='oddEven'?'奇数を昇順にし、次に偶数を昇順にした並び':rule==='sort'?'小さい順':rule==='tail'?`最後の${q.maxLength}つの順`:'逆の順'}は${a.join('→')}です。`;
 }
 if(q.speed){delete q.input;delete q.options;delete q.maxLength;
 const optionsFor=n=>{const list=[n,Math.max(0,n-1),n+1,n+2];q.options=[...new Set(list)].map(String);while(q.options.length<4)q.options.push(String(n+q.options.length+2));q.answer=0;};
 if(q.visual==='search'){const symbols=['⊕','⊗','⊙'];q.target=symbols[Math.floor(rng()*3)];const cells=Array.from({length:(q.searchRows||6)*(q.searchColumns||6)},()=>symbols[Math.floor(rng()*3)]);q.rows=Array.from({length:q.searchRows||6},(_,i)=>cells.slice(i*(q.searchColumns||6),(i+1)*(q.searchColumns||6)).join(' '));const counts=q.rows.map(r=>r.split(' ').filter(x=>x===q.target).length),n=counts.reduce((a,b)=>a+b,0);q.prompt=`下の中に「${q.target}」はいくつありますか。`;optionsFor(n);q.explanation=`各行の「${q.target}」の個数は、上から${counts.join('・')}個。合計${n}個です。`;}
 if(q.visual==='coding'){const symbols=['☆','△','○','□','◇','♧','⊕'].slice(0,q.codingSymbolCount||5);const values=shuffle(Array.from({length:symbols.length},(_,i)=>i+1),rng);q.key=symbols.map((s,i)=>[s,values[i]]);q.symbols=Array.from({length:q.codingLength||6},()=>symbols[Math.floor(rng()*symbols.length)]);q.input=true;q.maxLength=q.symbols.length;q.answer=q.symbols.map(s=>q.key.find(([k])=>s===k)[1]).join('');q.prompt='対応表を使って、記号列を数字に変換してください。';q.explanation=`対応表は${q.key.map(([s,v])=>s+'＝'+v).join('、')}。${q.symbols.join('')}は${q.answer}です。`;}
 if(q.visual==='pairs'){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const str=()=>Array.from({length:q.pairLength||6},()=>chars[Math.floor(rng()*chars.length)]).join('');const n=2+Math.floor(rng()*4),same=new Set(shuffle(Array.from({length:q.pairCount||8},(_,i)=>i),rng).slice(0,n));q.pairs=Array.from({length:q.pairCount||8},(_,i)=>{const a=str();if(same.has(i))return[a,a];const j=Math.floor(rng()*a.length),old=chars.indexOf(a[j]),replacement=chars[(old+1+Math.floor(rng()*(chars.length-1)))%chars.length];return[a,a.slice(0,j)+replacement+a.slice(j+1)]});q.prompt='左右の文字列が完全に同じ行は、全部でいくつありますか。';optionsFor(n);q.options=q.options.map(x=>x+'行');q.explanation=`完全に同じなのは${[...same].sort((a,b)=>a-b).map(i=>i+1).join('・')}行目。合計${n}行です。`;}
 if(q.visual==='scan'){const symbols=['○','△','□','◇'];q.rows=Array.from({length:q.scanRows||4},()=>Array.from({length:q.scanColumns||8},()=>symbols[Math.floor(rng()*4)]).join(' '));const counts=q.rows.map(r=>(r.replaceAll(' ','').match(/○△/g)||[]).length),n=counts.reduce((a,b)=>a+b,0);q.prompt='各行を左から右に見て、「○のすぐ右に△」がある組はいくつありますか。行をまたぐ組は数えません。';optionsFor(n);q.explanation=`○△は上から${counts.join('・')}組。合計${n}組です。逆の順の△○は数えません。`;}
 }
 if(q.options){const correct=q.options[q.answer],options=shuffle(q.options,rng);q.options=options;q.answer=options.indexOf(correct)}
 return q;
}
function createSession(rng=randomFloat,mode='standard'){if(!Object.hasOwn(TEST_MODES,mode))throw Error('Unknown test mode');return DOMAINS.flatMap((_,d)=>shuffle(questionBank(mode).filter(q=>q.d===d),rng).slice(0,PER_DOMAIN).map(q=>materialize(q,rng)))}
let QUESTIONS=[];
if(typeof module!=='undefined')module.exports={TOTAL_QUESTIONS,PER_DOMAIN,QUESTION_BANK,shuffle,materialize,createSession,turnPattern,mirrorPattern};
