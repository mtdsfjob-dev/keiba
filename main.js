
(function(){
var S={day:null,place:null,race:'ov',sort:'no'};
var RD=JSON.parse(document.getElementById('rdata').textContent);
var OD=JSON.parse(document.getElementById('od0').textContent);
var DL=JSON.parse(document.getElementById('dl').textContent);var CAL=JSON.parse(document.getElementById('cal').textContent);
function $all(q,r){return Array.prototype.slice.call((r||document).querySelectorAll(q));}
function esc(t){return String(t).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
var RP='all',LV='led',SPECIAL=['推奨','全レース','結果','記録'];
function placesOf(d){var o=[];$all('#np .tab').forEach(function(b){if(b.dataset.day===d&&SPECIAL.indexOf(b.dataset.place)<0&&o.indexOf(b.dataset.place)<0)o.push(b.dataset.place);});return o;}
function show(){
  var rec=S.place==='推奨',acc=S.place==='記録',res=acc&&LV==='res',led=acc&&LV==='led',hid=rec||acc;
  $all('#bt .bi').forEach(function(b){var p=b.dataset.p,on=p==='全レース'?(!rec&&!acc):(p===S.place);b.setAttribute('aria-pressed',on);});
  $all('#nd .tab').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.day===S.day);});
  $all('#np .tab').forEach(function(b){var on=b.dataset.day===S.day&&(SPECIAL.indexOf(b.dataset.place)<0||b.dataset.place==='全レース')&&!hid;b.hidden=!on;b.setAttribute('aria-pressed',on&&b.dataset.place===S.place);});
  document.getElementById('nr').hidden=hid||S.place==='全レース';
  $all('#nr .tab').forEach(function(b){var on=b.dataset.day===S.day&&b.dataset.place===S.place;b.hidden=!on;var pr=on&&b.dataset.race===S.race;b.setAttribute('aria-pressed',pr);if(pr&&!document.getElementById('nr').hidden)document.getElementById('nr').scrollLeft=Math.max(0,b.offsetLeft-60);});
  $all('.ov').forEach(function(e){e.hidden=!(rec&&e.dataset.day===S.day);});
  document.getElementById('lst').hidden=hid||S.race!=='ov';
  var sg=document.getElementById('lseg');sg.hidden=!acc;
  if(acc)sg.innerHTML='<button type=button class=tab data-lv="led" aria-pressed="'+(LV==='led')+'">成績・買い目</button><button type=button class=tab data-lv="res" aria-pressed="'+(LV==='res')+'">レース結果</button>';
  document.getElementById('res').hidden=!res;
  if(res)buildRes();
  document.getElementById('led').hidden=!led;
  if(led){buildLed();var _n=Date.now();if(_n-(SYN.last||0)>20000){SYN.last=_n;ldSync();}}
  if(!hid&&S.race==='ov')buildList();
  $all('.race').forEach(function(e){e.hidden=!(!hid&&S.race!=='ov'&&e.dataset.day===S.day&&e.dataset.place===S.place&&e.dataset.race===S.race);});
}
function yen(n){return Number(n).toLocaleString()+'円';}
function gradeOf(rk){return rk===1?'S':(rk<=3?'A':(rk<=6?'B':'C'));}
function buildRes(){
  var box=document.getElementById('res'),arr=[];
  Object.keys(RD).forEach(function(rid){var r=RD[rid];if(r.day!==S.day)return;var q=(RS.races||{})[rid];if(!q)return;arr.push({rid:rid,r:r,q:q});});
  var PO=placesOf(S.day);
  arr.sort(function(a,b){return PO.indexOf(a.r.pl)-PO.indexOf(b.r.pl)||a.r.r-b.r.r;});
  if(!arr.length){box.innerHTML='<p class=sub>この日の結果は、まだありません。</p>';return;}
  if(RP!=='all'&&PO.indexOf(RP)<0)RP='all';
  var ppl='<div class=lsw id=rpl>'+['all'].concat(PO).map(function(k){return '<button type=button class=tab data-rp="'+esc(k)+'" aria-pressed="'+(RP===k)+'">'+(k==='all'?'全場':esc(k))+'</button>';}).join('')+'</div>';
  if(RP!=='all')arr=arr.filter(function(x){return x.r.pl===RP;});
  var h=ppl+'<div class=rsum></div>',nh=0,nb=0,nh2=0,nb2=0,cn=0,ch=0,cb=0,cr=0;
  arr.forEach(function(x){
    var r=x.r,q=x.q,p=PR[x.rid],rk={},trih={},pays=q.pays||{};
    var gr={},stx={},dgx={};r.hs.forEach(function(t){rk[t[0]]=t[2];gr[t[0]]=t[3];stx[t[0]]=t[4];dgx[t[0]]=t[5];});
    (pays['三連複']||[]).forEach(function(t){trih[t[0]]=t[1];});
    var badge='',hit=0,isC=!!(p&&p.plan),hitwC=0;
    if(isC&&p.plan.buy){
      var po=planPay(p,q);cn++;cb+=po.bet;cr+=po.ret;if(po.ret)ch++;hit=po.t;hitwC=po.w;
      if(p.plan.w)badge+='<span class="rb '+(po.w?'hit':'miss')+'">ワイド'+(po.w?' 的中':' 外れ')+'</span>';
      if(p.plan.t)badge+='<span class="rb '+(po.t?'hit':'miss')+'">三連複'+(po.t?' 的中':' 外れ')+'</span>';
    }
    if(!isC&&p&&p.bets&&p.bets.length&&(p.s==='★'||p.s==='○')){
      p.bets.forEach(function(b){if(trih[b[0]])hit=trih[b[0]];});
      if(p.s==='★'){nb++;if(hit)nh++;}else{nb2++;if(hit)nh2++;}
      badge='<span class="rb '+(hit?'hit':'miss')+'">'+p.k+p.s+(hit?' 的中':' 外れ')+'</span>';
    }
    var rows=q.order.slice(0,3).map(function(t){
      var g=gr[t[1]]||gradeOf(rk[t[1]]||99);
      return '<div class=rr><span class="gd g'+g+'"><small>指標</small>'+(g==='X'?'消':g)+'</span><div class=rnm><b>'+t[1]+' '+esc(t[2])+(stx[t[1]]?' <span class=star>★</span>':'')+(dgx[t[1]]?' <span class=dng>×</span>':'')+'</b><span class=sub>指標'+(rk[t[1]]||'-')+'位</span></div><div class=rpos><span class=fin>'+t[0]+'着'+(t[3]>=10?' <span class="tg ana">穴</span>':'')+'</span><span class=sub>'+t[3]+'番人気</span></div></div>';
    }).join('');
    var sink=q.order.filter(function(t){return t[3]<=3&&t[0]>=6;}).map(function(t){return t[1]+' '+esc(t[2])+' '+t[3]+'番人気→'+t[0]+'着';});
    var hit3=0;if(!isC&&p&&p.tri&&(p.s==='★'||p.s==='○'))(pays['三連単']||[]).forEach(function(t){p.tri.forEach(function(b){if(b[0]===t[0])hit3=t[1];});});
    if(hit3)badge+='<span class="rb hit">三連単 的中</span>';
    var hitw=hitwC;if(!isC&&p&&p.wd&&p.wd.length&&(p.s==='★'||p.s==='○')){var wk=(typeof p.wd[0]==='string')?[p.wd[0]]:p.wd.map(function(x){return x[0];});(pays['ワイド']||[]).forEach(function(t){if(wk.indexOf(t[0])>=0)hitw+=t[1];});}
    if(hitw&&!isC)badge+='<span class="rb hit">ワイド 的中</span>';
    var chips=['単勝','馬連','ワイド','三連複','三連単'].map(function(k){var a=pays[k];if(!a||!a.length)return '';var hot=(k==='三連複'&&hit)||(k==='三連単'&&hit3)||(k==='ワイド'&&hitw);return '<span class="pc'+(hot?' hot':'')+'">'+k+' '+yen(a[0][1])+'</span>';}).join('');
    h+='<div class=rescard data-go="'+r.r+'" data-goplace="'+esc(r.pl)+'"><div class=reh><b>'+esc(r.pl)+r.r+'R</b> <span class=rname>'+esc(r.name)+'</span>'+badge+'</div>'+rows
      +(sink.length?'<div class=sink>沈没 '+sink.join(' / ')+'</div>':'')+'<div class=pcs>'+chips+'</div></div>';
  });
  box.innerHTML=h;
  var sm=box.querySelector('.rsum');if(sm)sm.innerHTML=(cn?('買ったレース '+cn+' のうち <b>'+ch+'</b> で的中<br><span class=sub>買った '+yen(cb)+' → 戻り '+yen(cr)+'(収支 '+sgn(cr-cb)+')。この買い方どおりに買った場合'+(RP!=='all'?'・この競馬場の分':'')+'</span>'+((nb||nb2)?'<br>':'')):'')+(nb?('★推奨 '+nb+'レース中 <b>'+nh+'</b> 的中'):'')+(nb2?('<br><span class=sub>○次点 '+nb2+'レース中 '+nh2+' 的中(買うかは自分で決めるレース)</span>'):'')+((nb||nb2)?'<br><span class=sub>三連複・1組100円で買った場合</span>':'');
}
var LK='keiba_ledger_v1',LSC='day',LAMT=100;
function ldGet(){try{var a=JSON.parse(localStorage.getItem(LK)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function ldSet(a){try{localStorage.setItem(LK,JSON.stringify(a));return true;}catch(e){return false;}}
function normKey(kind,txt){var n=String(txt).split(/[^0-9]+/).filter(Boolean).map(Number);var need=kind==='三連複'?3:(kind==='単勝'?1:2);if(n.length!==need)return null;n.sort(function(a,b){return a-b;});return n.join('-');}
function ldEval(b){var q=(RS.races||{})[b.rid];if(!q)return {st:'待ち',pay:0};var hit=0;((q.pays||{})[b.kind]||[]).forEach(function(t){if(t[0]===b.key)hit=t[1];});return {st:hit?'的中':'外れ',pay:hit?Math.round(hit*b.amt/100):0};}
var SK='keiba_sync_v1',DK='keiba_ledger_del',SYN={msg:'',busy:false};
function syncCfg(){try{var c=JSON.parse(localStorage.getItem(SK)||'null');return c&&c.repo&&c.token?c:null;}catch(e){return null;}}
function delGet(){try{var a=JSON.parse(localStorage.getItem(DK)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function b64e(s){return btoa(unescape(encodeURIComponent(s)));}
function b64d(s){return decodeURIComponent(escape(atob(s.replace(/[^A-Za-z0-9+/=]/g,''))));}
function ldSync(){
  var c=syncCfg();if(!c){SYN.msg='';return Promise.resolve();}
  if(SYN.busy)return Promise.resolve();SYN.busy=true;SYN.msg='同期中…';
  var url='https://api.github.com/repos/'+c.repo+'/contents/ledger.json',hd={'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github+json'};
  function once(){
    return fetch(url+'?t='+Date.now(),{headers:hd,cache:'no-store'}).then(function(r){
      if(r.status===404)return {sha:null,data:{bets:[],del:[]}};
      if(!r.ok)throw new Error('読み込み '+r.status);
      return r.json().then(function(j){var d={};try{d=JSON.parse(b64d(j.content));}catch(e){}return {sha:j.sha,data:d};});
    }).then(function(rm){
      var del={};(rm.data.del||[]).concat(delGet()).forEach(function(i){del[i]=1;});
      var map={};(rm.data.bets||[]).concat(ldGet()).forEach(function(b){if(b&&b.id&&!del[b.id])map[b.id]=b;});
      var bets=Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){return a.id-b.id;});
      var dl=Object.keys(del).map(Number);
      try{localStorage.setItem(LK,JSON.stringify(bets));localStorage.setItem(DK,JSON.stringify(dl));}catch(e){}
      var out=JSON.stringify({bets:bets,del:dl});
      if(JSON.stringify({bets:rm.data.bets||[],del:rm.data.del||[]})===out)return 'ok';
      var body={message:'sync',content:b64e(out)};if(rm.sha)body.sha=rm.sha;
      return fetch(url,{method:'PUT',headers:hd,body:JSON.stringify(body)}).then(function(r){if(r.status===409||r.status===422)return 'retry';if(!r.ok)throw new Error('書き込み '+r.status);return 'ok';});
    });
  }
  return once().then(function(s){return s==='retry'?once():s;}).then(function(){SYN.msg='同期済み '+nowHM();},function(e){SYN.msg='同期できませんでした('+e.message+')';}).then(function(){SYN.busy=false;if(S.place==='記録'&&LV==='led')buildLed();});
}
function ldLabel(rid){var r=RD[rid];return r?(r.pl+r.r+'R'):rid;}
function buildLed(){
  var box=document.getElementById('led'),all=ldGet(),shown=all.filter(function(b){return LSC==='all'||b.day===S.day;});
  var buy=0,pay=0,nh=0,nn=0,wait=0;
  shown.forEach(function(b){var e=ldEval(b);if(e.st==='待ち'){wait+=b.amt;return;}nn++;buy+=b.amt;pay+=e.pay;if(e.st==='的中')nh++;});
  var roi=buy?Math.round(pay/buy*1000)/10:null;
  var rids=Object.keys(RD).filter(function(k){return RD[k].day===S.day;}).sort(function(a,b){var x=RD[a],y=RD[b];return x.pl.localeCompare(y.pl)||x.r-y.r;});
  var h='<div class=lsw><button type=button class=tab data-ld="sc" data-v="day" aria-pressed="'+(LSC==='day')+'">この日</button><button type=button class=tab data-ld="sc" data-v="all" aria-pressed="'+(LSC==='all')+'">全期間</button></div>'
   +'<div class=lsum><div><small>購入</small><b>'+yen(buy)+'</b></div><div><small>払戻</small><b>'+yen(pay)+'</b></div><div><small>回収率</small><b class="'+(roi!==null&&roi>=100?'up':'')+'">'+(roi===null?'-':roi+'%')+'</b></div><div><small>的中</small><b>'+nh+'/'+nn+'</b></div></div>'
   +(wait?'<p class=sub>結果待ちの購入 '+yen(wait)+'(集計には入っていません)</p>':'')
   +'<div class=lform id=lf></div>';
  var days={};shown.slice().sort(function(a,b){return (b.day+b.rid).localeCompare(a.day+a.rid);}).forEach(function(b){(days[b.day]=days[b.day]||[]).push(b);});
  Object.keys(days).sort().reverse().forEach(function(d){
    h+='<div class=lday>'+esc(d)+'</div>';
    days[d].forEach(function(b){var e=ldEval(b);
      h+='<div class="lbet '+(e.st==='的中'?'hit':'')+'"><span class=lb1><b>'+esc(ldLabel(b.rid))+'</b> '+esc(b.kind)+' '+esc(b.key)+'</span><span class=lb2>'+yen(b.amt)+'</span><span class="lb3 '+e.st+'">'+(e.st==='的中'?'的中 '+yen(e.pay):e.st)+'</span><button type=button class=ldel data-ld="del" data-id="'+b.id+'" aria-label="削除">×</button></div>';});
  });
  if(!shown.length)h+='<p class=sub>まだ記録がありません。</p>';
  h+='<div class=lbk><button type=button class=lbtn2 data-ld="exp">バックアップをコピー</button><button type=button class=lbtn2 data-ld="imp">バックアップから戻す</button><button type=button class=lbtn2 data-ld="cfg">同期の設定</button><p class=sub>'+(syncCfg()?('非公開リポジトリに自動で保存しています。'+esc(SYN.msg)):'いまは、この端末の中にだけ保存されています(公開されません)。同期を設定すると、非公開の置き場に自動で保存され、スマホとパソコンで共有できます。')+'</p></div>';
  box.innerHTML=h;renderForm();
}
var LF={rid:'',kind:'ワイド',m:'box',g:{A:[],B:[],C:[]},act:'A'};
var NEED={'単勝':1,'馬連':2,'ワイド':2,'三連複':3};
function methodsFor(kind){var n=NEED[kind];if(n===1)return [];var a=[['box','ボックス'],['n1','ながし'+(n===3?'(軸1頭)':'')]];if(n===3)a.push(['n2','ながし(軸2頭)']);a.push(['fm','フォーメーション']);return a;}
function groupsFor(){var n=NEED[LF.kind];if(n===1||LF.m==='box')return [['A','選ぶ馬']];if(LF.m==='n1')return [['A','軸'],['B','相手']];if(LF.m==='n2')return [['A','軸(2頭)'],['B','相手']];return n===2?[['A','1頭目'],['B','2頭目']]:[['A','1頭目'],['B','2頭目'],['C','3頭目']];}
function combos(arr,k){var out=[];(function f(st,c){if(c.length===k){out.push(c.slice());return;}for(var i=st;i<arr.length;i++){c.push(arr[i]);f(i+1,c);c.pop();}})(0,[]);return out;}
function genKeys(){
  var n=NEED[LF.kind],A=LF.g.A,B=LF.g.B,C=LF.g.C,set={},ks=[];
  function add(a){var u={};a.forEach(function(x){u[x]=1;});if(Object.keys(u).length!==n)return;var k=a.slice().sort(function(x,y){return x-y;}).join('-');if(!set[k]){set[k]=1;ks.push(k);}}
  if(n===1||LF.m==='box'){combos(A,n).forEach(add);}
  else if(LF.m==='n1'){A.forEach(function(x){combos(B.filter(function(y){return y!==x;}),n-1).forEach(function(c){add([x].concat(c));});});}
  else if(LF.m==='n2'){if(A.length===2)B.filter(function(y){return A.indexOf(y)<0;}).forEach(function(y){add(A.concat([y]));});}
  else{A.forEach(function(a){B.forEach(function(b){if(n===2)add([a,b]);else C.forEach(function(c){add([a,b,c]);});});});}
  return ks;
}
function chipTap(no){
  var g=LF.g[LF.act],i=g.indexOf(no),nag=(LF.m==='n1'||LF.m==='n2')&&NEED[LF.kind]>1;
  if(i>=0){g.splice(i,1);return;}
  if(nag){['A','B'].forEach(function(k){var j=LF.g[k].indexOf(no);if(j>=0)LF.g[k].splice(j,1);});}
  g.push(no);
  if(LF.act==='A'&&LF.m==='n1'&&g.length>1)g.shift();
  if(LF.act==='A'&&LF.m==='n2'&&g.length>2)g.shift();
}
function renderForm(){
  var box=document.getElementById('lf');if(!box)return;
  var rids=Object.keys(RD).filter(function(k){return RD[k].day===S.day;}).sort(function(a,b){var x=RD[a],y=RD[b];return x.pl.localeCompare(y.pl)||x.r-y.r;});
  if(!RD[LF.rid]||RD[LF.rid].day!==S.day){LF.rid=rids[0]||'';LF.g={A:[],B:[],C:[]};LF.act='A';}
  var r=RD[LF.rid],ms=methodsFor(LF.kind),gs=groupsFor();
  if(!gs.some(function(x){return x[0]===LF.act;}))LF.act='A';
  var h='<b>買い目を記録('+esc(S.day||'')+')</b>'
   +'<select id=ld-r>'+rids.map(function(k){return '<option value="'+esc(k)+'"'+(k===LF.rid?' selected':'')+'>'+esc(ldLabel(k))+' '+esc(RD[k].name)+'</option>';}).join('')+'</select>'
   +'<select id=ld-t>'+['ワイド','馬連','三連複','単勝'].map(function(k){return '<option'+(k===LF.kind?' selected':'')+'>'+k+'</option>';}).join('')+'</select>';
  if(ms.length)h+='<div class=lmeth>'+ms.map(function(m){return '<button type=button class=tab data-ld="m" data-v="'+m[0]+'" aria-pressed="'+(LF.m===m[0])+'">'+m[1]+'</button>';}).join('')+'</div>';
  if(gs.length>1)h+='<div class=lmeth>'+gs.map(function(x){return '<button type=button class="tab lg lg'+x[0]+'" data-ld="grp" data-g="'+x[0]+'" aria-pressed="'+(LF.act===x[0])+'">'+x[1]+' '+LF.g[x[0]].length+'頭</button>';}).join('')+'</div>';
  var hint=NEED[LF.kind]===1?'買いたい馬をタップ(1頭ごとに1点)':(LF.m==='box'?'ボックスにする馬をタップ':(LF.m==='fm'?'列ごとに馬をタップ(上の1頭目・2頭目…を切り替え)':'上の「軸」「相手」を切り替えて、馬をタップ'));
  h+='<p class=sub>'+hint+'</p><div class=chips>';
  (r?r.hs:[]).filter(function(t){return t[0]!=null;}).sort(function(a,b){return a[0]-b[0];}).forEach(function(t){
    var cls='chip';['A','B','C'].forEach(function(k){if(LF.g[k].indexOf(t[0])>=0)cls+=' in'+k;});
    h+='<button type=button class="'+cls+'" data-ld="chip" data-n="'+t[0]+'"><b>'+t[0]+'</b><small>'+esc(String(t[1]).slice(0,6))+'</small></button>';
  });
  h+='</div><div id=lf-sum class=lfs></div>'
   +'<details class=lman><summary>手入力で追加する</summary><textarea id=ld-k rows=3 placeholder="1行に1点。カンマ区切りも可&#10;例 1-8-9"></textarea></details>'
   +'<div class=lrow><label>1点<input id=ld-a type=number inputmode=numeric min=100 step=100 value="'+LAMT+'">円</label><button type=button class=lbtn2 data-ld="clr">選び直す</button><button type=button class=lbtn data-ld="add">記録する</button></div>';
  box.innerHTML=h;updSum();
}
function updSum(){
  var el=document.getElementById('lf-sum'),a=document.getElementById('ld-a');if(!el)return;
  var amt=parseInt(a&&a.value,10)||0,ks=genKeys();
  el.innerHTML=ks.length?('<b>'+ks.length+'点</b> × '+amt+'円 = <b>'+yen(ks.length*amt)+'</b><br><span class=sub>'+ks.slice(0,10).join(' / ')+(ks.length>10?' …':'')+'</span>'):'<span class=sub>まだ買い目がありません</span>';
}
document.getElementById('led').addEventListener('change',function(e){
  var t=e.target;
  if(t.id==='ld-r'){LF.rid=t.value;LF.g={A:[],B:[],C:[]};LF.act='A';renderForm();}
  if(t.id==='ld-t'){LF.kind=t.value;LF.m='box';LF.g={A:[],B:[],C:[]};LF.act='A';renderForm();}
});
document.getElementById('led').addEventListener('input',function(e){if(e.target.id==='ld-a'){LAMT=parseInt(e.target.value,10)||LAMT;updSum();}});
document.getElementById('led').addEventListener('click',function(e){
  var b=e.target.closest('[data-ld]');if(!b)return;var a=b.dataset.ld;
  if(a==='sc'){LSC=b.dataset.v;buildLed();return;}
  if(a==='del'){var di=Number(b.dataset.id),dd=delGet();dd.push(di);try{localStorage.setItem(DK,JSON.stringify(dd));}catch(er){}ldSet(ldGet().filter(function(x){return x.id!==di;}));buildLed();ldSync();return;}
  if(a==='exp'){var t=JSON.stringify(ldGet());if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){alert('コピーしました。メモ等に貼って保管してください。');},function(){window.prompt('これをコピーして保管してください',t);});}else{window.prompt('これをコピーして保管してください',t);}return;}
  if(a==='imp'){var s=window.prompt('バックアップの文字列を貼り付けてください');if(!s)return;try{var arr=JSON.parse(s);if(!Array.isArray(arr))throw 0;var cur=ldGet(),ids={};cur.forEach(function(x){ids[x.id]=1;});arr.forEach(function(x){if(x&&x.rid&&x.key&&!ids[x.id])cur.push(x);});ldSet(cur);buildLed();ldSync();}catch(er){alert('読み込めませんでした。');}return;}
  if(a==='m'){LF.m=b.dataset.v;LF.g={A:[],B:[],C:[]};LF.act='A';renderForm();return;}
  if(a==='grp'){LF.act=b.dataset.g;renderForm();return;}
  if(a==='chip'){chipTap(Number(b.dataset.n));renderForm();return;}
  if(a==='clr'){LF.g={A:[],B:[],C:[]};LF.act='A';renderForm();return;}
  if(a==='add'){
    var rid=LF.rid,kind=LF.kind,amt=parseInt(document.getElementById('ld-a').value,10),txt=document.getElementById('ld-k').value;
    if(!rid||!(amt>0)){alert('レースと金額を確認してください。');return;}
    var keys=genKeys(),bad=[];txt.split(/[,，、\n]+/).forEach(function(s){if(!s.trim())return;var k=normKey(kind,s);if(k){if(keys.indexOf(k)<0)keys.push(k);}else bad.push(s.trim());});
    if(bad.length){alert('読めない買い目があります: '+bad.join(' / '));return;}
    if(!keys.length){alert('馬番を選んでください。');return;}
    var cur=ldGet(),base=Date.now();LAMT=amt;
    keys.forEach(function(k,i){cur.push({id:base+i,day:RD[rid].day,rid:rid,kind:kind,key:k,amt:amt});});
    if(!ldSet(cur)){alert('保存できませんでした(プライベートブラウズ中など)。');return;}
    LF.g={A:[],B:[],C:[]};LF.act='A';
    buildLed();ldSync();
  }
  if(a==='cfg'){var c=syncCfg()||{},rp=window.prompt('同期先のリポジトリ(例 ユーザー名/keiba-ledger)。空にすると同期をやめます',c.repo||'');if(rp===null)return;rp=rp.trim();if(!rp){try{localStorage.removeItem(SK);}catch(er){}SYN.msg='';buildLed();return;}var tk=window.prompt('GitHubのトークンを貼り付けてください(この端末の中にだけ保存されます)',c.token||'');if(!tk)return;try{localStorage.setItem(SK,JSON.stringify({repo:rp,token:tk.trim()}));}catch(er){}ldSync();}
});
function resort(){
  $all('.sb .tab').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.sort===S.sort);});
  $all('.h').forEach(function(h){
    var k=S.sort==='rk'?'rk':'no';
    Array.prototype.slice.call(h.children).sort(function(a,b){return (+a.dataset[k])-(+b.dataset[k])||(+a.dataset.rk)-(+b.dataset.rk);}).forEach(function(c){h.appendChild(c);});
  });
}
function nowHM(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
var RS={races:{}};
var EC={};
function evalC(rid){if(!(rid in EC))EC[rid]=evalRace(rid);return EC[rid];}
function stars(rid){
  var e=evalC(rid);if(!e)return null;
  var n=e.tan.length+e.uma.length+e.wide.length+e.sanpuku.length;
  return n===0?0:(n<=2?1:(n<=5?2:3));
}
var PR=(function(){try{return JSON.parse(document.getElementById('pr0').textContent).races||{};}catch(e){return {};}})();
var PD=(function(){try{return JSON.parse(document.getElementById('pr0').textContent).day||{};}catch(e){return {};}})();
// 案C(11/15〜): p.plan があるレースは新しい形。買う/買わない・ワイドの買い目一式(組,金額,オッズ,当たれば払戻)・三連複を買うか
function planPay(p,q){
  var pl=p&&p.plan,o={bet:0,ret:0,w:0,t:0};if(!pl||!pl.buy||!q)return o;
  var pays=q.pays||{};o.bet=pl.amt||0;
  if(pl.w)(pl.wd||[]).forEach(function(t){(pays['ワイド']||[]).forEach(function(x){if(x[0]===t[0])o.w+=Math.round(x[1]*t[1]/100);});});
  if(pl.t)(p.bets||[]).forEach(function(b){(pays['三連複']||[]).forEach(function(x){if(x[0]===b[0])o.t+=x[1];});});
  o.ret=o.w+o.t;return o;
}
function sgn(n){return (n>0?'+':(n<0?'−':'±'))+Math.abs(n).toLocaleString()+'円';}
function plTag(rid){
  var p=PR[rid];if(!p)return '<span class=stars>採点待ち</span>';
  if(p.plan)return '<span class="stars'+(p.plan.buy?' on':'')+(p.plan.buy&&!p.plan.w?' w':'')+'">'+(p.plan.buy?'★ 推奨':esc(p.s||'見送り'))+'</span>';
  var on=(p.s==='★'||p.s==='○');
  return '<span class="stars'+(on?' on':'')+(on&&p.k==='荒れ'?' w':'')+'">'+(on?p.s+' '+oLab(p):p.s)+'</span>';
}
function buildList(){
  var box=document.getElementById('lst'),isToday=S.day===today(),hm=nowHM(),arr=[],all=S.place==='全レース';
  Object.keys(RD).forEach(function(rid){var r=RD[rid];if(r.day!==S.day)return;if(!all&&r.pl!==S.place)return;arr.push({rid:rid,r:r});});
  arr.sort(function(a,b){return all?((a.r.pt||'').localeCompare(b.r.pt||'')||a.r.pl.localeCompare(b.r.pl)):a.r.r-b.r.r;});
  var h='';
  arr.forEach(function(x){
    var r=x.r,past=isToday&&r.pt&&hm>r.pt,p=PR[x.rid];
    h+='<div class="lcard'+(past?' past':'')+'" data-go="'+r.r+'" data-goplace="'+esc(r.pl)+'">'
      +'<div class=lr1><span class=lt>'+esc(r.pl)+r.r+'R</span><span class=lp>'+(r.pt||'')+'</span><span class=ln>'+esc(r.name)+'</span>'+(past?'<span class=rpt>発走済</span>':'')+'</div>'
      +'<div class=lr2><span class=sub>'+esc(r.dist)+'・'+r.n+'頭'+(r.rpt?'・RS '+r.rpt:'')+(r.rc?'・RPT '+r.rc:'')+'</span>'+plTag(x.rid)+'</div>'
      +(p?'<div class=lr3>'+esc(p.why)+'</div>':'')
      +(RS.races&&RS.races[x.rid]?'<div class=lr3><b>結果</b> '+RS.races[x.rid].order.slice(0,3).map(function(t){return t[1];}).join(' - ')+'</div>':'')
      +'<div class=lr3>指標上位 '+r.t3.map(function(t){return String(t[2]).replace('番','')+'('+t[1]+')';}).join(' ')+'</div></div>';
  });
  box.innerHTML=h;
}
function fillRes(sec){
  var b=sec.querySelector('.resb');if(!b)return;
  var r=(RS.races||{})[sec.dataset.rid];
  $all('.sy .rk',sec).forEach(function(e){e.remove();});
  if(!r){b.innerHTML='';return;}
  var fin={};r.order.forEach(function(t){fin[t[1]]=t[0];});
  var h='<div class=rvh>結果</div>'+r.order.slice(0,3).map(function(t){return '<div class=sy><b>'+t[0]+'着</b> '+t[1]+esc(t[2])+' <span class=sub>'+t[3]+'番人気</span></div>';}).join('');
  var py=[];['単勝','馬連','ワイド','三連複'].forEach(function(k){var a=r.pays[k];if(a)py.push('<b>'+k+'</b> '+a.map(function(x){return x[0]+' '+x[1].toLocaleString()+'円';}).join(' / '));});
  h+='<div class=rl>'+py.join('</div><div class=rl>')+'</div>';
  b.innerHTML=h;
  $all('.sy[data-no]',sec).forEach(function(e){var f=fin[e.dataset.no];if(f)e.insertAdjacentHTML('beforeend',' <span class="rk rpt">→ '+f+'着</span>');});
  $all('details.c',sec).forEach(function(c){var f=fin[c.dataset.no],el=c.querySelector('.od');if(f&&el)el.textContent=f+'着 '+el.textContent;});
}
var CAPT={1:[18,29,41,52],2:[23,36,48,59],3:[25,36,47,59],4:[28,39,52,65],5:[35,47,59,69],6:[35,49,65,73],7:[39,53,66,78],8:[45,61,74,84],9:[53,67,81,90],10:[65,82,93,99]};
function fillCand(sec,e){
  var c=sec.querySelector('.cand');if(!c)return;
  if(!e||!e.cand){c.innerHTML='';return;}
  var mk={};$all('.sy[data-no]:not(.cd)',sec).forEach(function(x){var bb=x.querySelector('b');if(bb)mk[x.dataset.no]=bb.textContent;});
  var st={};e.ana.forEach(function(t){st[t.no]='★';});
  var k=e.cand,rp=(RD[sec.dataset.rid]||{}).rpt,tb=CAPT[rp];
  var h='<div class=rvh>3着内の候補(確率の高い順)</div>'
    +(tb?'<div class=sub>このレースはRS '+rp+'です。過去のRS '+rp+'のレースで、3着内の3頭がすべて上位5頭に入った割合は'+tb[0]+'%、6頭で'+tb[1]+'%、7頭で'+tb[2]+'%、8頭で'+tb[3]+'%でした。</div>':'');
  k.list.forEach(function(t,i){
    h+='<div class="sy cd" data-no='+t.no+'><b>'+(mk[t.no]||'')+(st[t.no]||'')+'</b> '+t.no+esc(t.name)+' <span class=sub>'+t.odds+'倍・'+t.pop+'番人気</span>'
      +((tb&&i>=4)?' <span class=sub>→ ここまでで全部入る割合 '+tb[i-4]+'%</span>':'')+'</div>';
  });
  c.innerHTML=h;
}
function fillBuy(sec){
  var a=sec.querySelector('.ana'),b=sec.querySelector('.buy');if(!a||!b)return;
  var e=evalC(sec.dataset.rid);
  fillCand(sec,e);
  b.innerHTML=plDetail(sec.dataset.rid);
  if(!e){a.innerHTML='';return;}
  a.innerHTML=e.ana.length?e.ana.map(function(t){return '<div class=sy><b>★</b> '+t.no+esc(t.name)+' <span class=sub>'+t.odds+'倍・'+t.pop+'番人気 / 市場より評価高め(期待値 '+t.ev.toFixed(2)+')</span></div>';}).join(''):'<div class=sy><b>★</b> <span class=sub>穴馬(6番人気以下で市場より評価が高い馬)は、今はいません</span></div>';
}
function oLab(p){var n=String(p.o||'').replace(/[^0-9]/g,'');if(!n)return '';return '狙い目'+n+'位';}
function groupBets(bets){
  var rem=bets.map(function(t){return t[0].split('-').map(Number);}),out=[];
  while(rem.length){
    var cnt={},best=null,bc=1;
    rem.forEach(function(c){[[0,1],[0,2],[1,2]].forEach(function(ix){var k=c[ix[0]]+'-'+c[ix[1]];cnt[k]=(cnt[k]||0)+1;if(cnt[k]>bc||(cnt[k]===bc&&best===null&&bc>1)){bc=cnt[k];best=k;}});});
    if(!best||bc<2){rem.forEach(function(c){out.push({ax:null,ot:[c.join('-')]});});break;}
    var a=best.split('-').map(Number),others=[],keep=[];
    rem.forEach(function(c){if(c.indexOf(a[0])>=0&&c.indexOf(a[1])>=0){others.push(c.filter(function(x){return x!==a[0]&&x!==a[1];})[0]);}else keep.push(c);});
    others.sort(function(x,y){return x-y;});
    out.push({ax:best,ot:others});rem=keep;
  }
  return out;
}
function planDetail(rid,p){
  var pl=p.plan,h='<div class=rvh>'+(pl.buy?'★ 推奨(このレースは買う)':'このレースは買わない')+'</div><div class=rl>'+esc(pl.why||p.why||'')+'</div>';
  if(pl.buy&&pl.w&&pl.wd&&pl.wd.length){
    h+='<div class=rvh>ワイドの買い目('+pl.wd.length+'点・合計 '+yen(pl.wamt)+')</div>';
    h+='<button type=button class=lbtn data-recw="'+esc(rid)+'">ワイドを記録('+pl.wd.length+'組・合計 '+yen(pl.wamt)+')</button>';
    h+='<div class=sub>どの組が当たっても、払戻がこのワイドに使った合計の'+(pl.mul||3)+'倍以上(最低 '+yen(pl.min)+')になるよう、組ごとに金額を変えています。'
      +(pl.p!=null?'このレースの買い目一式で、買った額より多く戻る見込みは '+Math.round(pl.p*100)+'%(過去の実績で補正した値)。外れることの方が多い買い方です。':'')
      +'オッズは発走まで動くので、払戻は目安です。</div>';
    h+=pl.wd.map(function(t){return '<div class=rl><b>'+esc(t[0])+'</b> <span class=sub>'+yen(t[1])+'・'+t[2]+'倍・当たれば '+yen(t[3])+'</span></div>';}).join('');
  }
  if(pl.buy&&pl.t&&p.bets&&p.bets.length){
    h+='<div class=rvh>三連複の買い目(1組100円で '+p.bets.length+'組・'+(p.bets.length*100).toLocaleString()+'円)</div>';
    h+='<button type=button class=lbtn data-rec="'+esc(rid)+'">この買い目を記録('+p.bets.length+'組 × 100円)</button>';
    h+='<div class=sub>入力が楽になるよう、「軸2頭ながし」でまとめました(買う組み合わせは下の全組と同じです)。馬券は「3連複→ながし」で、軸2頭と相手を選びます。</div>'+groupBets(p.bets).map(function(g){return '<div class=rl><b>'+(g.ax?'軸 '+g.ax+' ー 相手 '+g.ot.join('・'):g.ot[0])+'</b> <span class=sub>'+(g.ax?g.ot.length+'組':'1組')+'</span></div>';}).join('');
    h+='<div class=sub style="margin-top:8px">▼全組み合わせの一覧</div>';
    h+='<div class=sub>各組み合わせの「当たる確率」はモデルの推定、オッズは今の組み合わせオッズ、期待値=確率×オッズです(1を超えると、計算上は得)。推定なので、実際の的中率とはずれます。</div>';
    h+=p.bets.map(function(t){return '<div class=rl><b>'+t[0]+'</b>'+(t.length>2?' <span class=sub>当たる確率 '+t[2]+'%・'+t[3]+'倍・期待値 '+t[4].toFixed(2)+'</span>':'')+'</div>';}).join('');
  }
  if(!pl.buy&&p.ref&&p.ref.length){
    h+='<div class=rvh>馬の参考情報(買い目は出しません)</div><div class=sub>馬番・単勝オッズ・市場の評価(%)→モデルの評価(%)</div>'
      +p.ref.map(function(t){var d=t[3]-t[2];return '<div class=rl><b>'+t[0]+'</b> '+t[1]+'倍 '+t[2]+'% → '+t[3]+'% <span class="'+(d>=0.5?'gp':(d<=-0.5?'gm':'sub'))+'">'+(d>=0?'+':'')+d.toFixed(1)+'</span></div>';}).join('');
  }
  if(p.um&&p.um.length){
    h+='<div class=rvh>馬連の本線TOP5(見るだけ・買い目ではありません)</div><div class=sub>当たりやすい2頭の組み合わせ、上から5つ。過去5年では、この5つのどれかが約半分のレースで当たっています。</div>';
    h+=p.um.map(function(t,i){return '<div class=rl><b>'+(i+1)+'. '+t[0]+'</b> <span class=sub>当たる確率 '+t[1]+'%</span></div>';}).join('');
  }
  return h;
}
function plDetail(rid){
  var p=PR[rid];
  if(!p)return '<p class=sub>この日の採点は、まだありません(クラスター指数の書き出し待ち)。</p>';
  if(p.plan)return planDetail(rid,p);
  var on=(p.s==='★'||p.s==='○');
  var h='<div class=rvh>'+(on?p.s+' '+oLab(p)+'・':'')+p.k+'・'+(on?'推奨':p.s)+'</div><div class=rl>'+esc(p.why)+'</div>';
  if(on&&p.bets&&p.bets.length){
    h+='<div class=rvh>三連複(勝負枠)の買い目(1組100円で '+p.bets.length+'組・'+(p.bets.length*100).toLocaleString()+'円)</div>';
    h+='<button type=button class=lbtn data-rec="'+esc(rid)+'">この買い目を記録('+p.bets.length+'組 × 100円)</button>';
    if(p.k==='固い')h+='<div class=sub>厚み=そのレースの中で、厚く買いたい度合い(%)。1点の金額は、この割合を目安に決めてください。</div>';
    if(p.k!=='固い'){
      h+='<div class=sub>入力が楽になるよう、「軸2頭ながし」でまとめました(買う組み合わせは下の全組と同じです)。馬券は「3連複→ながし」で、軸2頭と相手を選びます。</div>'+groupBets(p.bets).map(function(g){return '<div class=rl><b>'+(g.ax?'軸 '+g.ax+' ー 相手 '+g.ot.join('・'):g.ot[0])+'</b> <span class=sub>'+(g.ax?g.ot.length+'組':'1組')+'</span></div>';}).join('');
      h+='<div class=sub style="margin-top:8px">▼全組み合わせの一覧</div>';
    }
    h+='<div class=sub>各組み合わせの「当たる確率」はモデルの推定、オッズは今の組み合わせオッズ、期待値=確率×オッズです(1を超えると、計算上は得)。推定なので、実際の的中率とはずれます。</div>';
    h+=p.bets.map(function(t){return '<div class=rl><b>'+t[0]+'</b>'+(t.length>2?' <span class=sub>当たる確率 '+t[2]+'%・'+t[3]+'倍・期待値 '+t[4].toFixed(2)+'</span>':'')+(t[1]!=null?' <span class=sub>厚み '+t[1]+'%</span>':'')+'</div>';}).join('');
    if(p.tri&&p.tri.length){
      h+='<div class=rvh>三連単(宝くじ枠・1組100円で '+p.tri.length+'組・'+(p.tri.length*100).toLocaleString()+'円)</div>';
      h+='<button type=button class=lbtn data-rec3="'+esc(rid)+'">三連単を記録('+p.tri.length+'組 × 100円)</button>';
      h+='<div class=sub>上の三連複の買い目に入っている3頭の並びから、当たる確率の高い順に'+p.tri.length+'組。左から1着→2着→3着です。過去(2025〜26年)では的中率2.7%・当たると真ん中で約350倍。</div>';
      h+=p.tri.map(function(t){return '<div class=rl><b>'+t[0].split('-').join(' → ')+'</b> <span class=sub>当たる確率 '+t[1]+'%</span></div>';}).join('');
    }
  }
  if(on&&p.wd&&p.wd.length){
      h+='<div class=rvh>ワイド(抑え枠・1点 1,000円)</div>';
      h+='<button type=button class=lbtn data-recw="'+esc(rid)+'">ワイドを記録('+p.wd.length+'組 × 1,000円)</button>';
      h+='<div class=sub>固いレースで当たりやすいワイド上位2点。過去5年では4レースに3回どちらかが当たり、平均すると2,000円が1,780円に減ります。</div>';
      h+=p.wd.map(function(t){return '<div class=rl><b>'+t[0]+'</b> <span class=sub>当たる確率 '+t[1]+'%</span></div>';}).join('');
  }
  if(!(on&&((p.bets&&p.bets.length)||(p.wd&&p.wd.length)))&&p.ref&&p.ref.length){
    h+='<div class=rvh>馬の参考情報(買い目は出しません)</div><div class=sub>馬番・単勝オッズ・市場の評価(%)→モデルの評価(%)</div>'
      +p.ref.map(function(t){var d=t[3]-t[2];return '<div class=rl><b>'+t[0]+'</b> '+t[1]+'倍 '+t[2]+'% → '+t[3]+'% <span class="'+(d>=0.5?'gp':(d<=-0.5?'gm':'sub'))+'">'+(d>=0?'+':'')+d.toFixed(1)+'</span></div>';}).join('');
  }
  if(p.um&&p.um.length){
    h+='<div class=rvh>馬連の本線TOP5(見るだけ・買い目ではありません)</div><div class=sub>当たりやすい2頭の組み合わせ、上から5つ。過去5年では、この5つのどれかが約半分のレースで当たっています。</div>';
    h+=p.um.map(function(t,i){return '<div class=rl><b>'+(i+1)+'. '+t[0]+'</b> <span class=sub>当たる確率 '+t[1]+'%</span></div>';}).join('');
  }
  return h;
}
function applyOdds(){
  EC={};
  var st=OD.stamp?('オッズ取得 '+OD.stamp):'オッズは未取得です(発売前)。';
  document.getElementById('ost').textContent=st;
  $all('.race').forEach(function(sec){
    var o=(OD.races||{})[sec.dataset.rid]||{};
    fillBuy(sec);
    $all('details.c',sec).forEach(function(c){
      var v=o[c.dataset.no],el=c.querySelector('.od');if(!el)return;
      if(!v){el.textContent='';return;}
      var rk=+c.dataset.rk,gap=v[1]-rk,mk='';
      if(gap>=4&&rk<=3)mk=' ▲妙味';else if(gap<=-4&&v[1]<=3)mk=' ▽過熱';
      el.textContent='単勝'+v[0]+'・'+v[1]+'人気'+mk;
    });
    fillRes(sec);
  });
  buildRec();
  if(S.race==='ov'&&S.place!=='推奨')buildList();
}
function calib(t,p){
  var a=(CAL[t]||[]).slice();if(!a.length)return p;
  a.unshift([0,0]);
  if(p<=a[0][0])return 0;
  for(var i=1;i<a.length;i++){
    if(p<=a[i][0]){var x0=a[i-1][0],y0=a[i-1][1],x1=a[i][0],y1=a[i][1];return x1===x0?y1:y0+(y1-y0)*(p-x0)/(x1-x0);}
  }
  var l=a[a.length-1];return Math.min(1,p*(l[1]/l[0]));
}
function harv(p){
  var n=p.length,P2={},P3={},PW={},i,j,k;
  for(i=0;i<n;i++)for(j=i+1;j<n;j++)P2[i+','+j]=p[i]*p[j]/(1-p[i])+p[j]*p[i]/(1-p[j]);
  for(i=0;i<n;i++)for(j=i+1;j<n;j++)for(k=j+1;k<n;k++){
    var s=0,o=[[i,j,k],[i,k,j],[j,i,k],[j,k,i],[k,i,j],[k,j,i]];
    for(var m=0;m<6;m++){var x=o[m][0],y=o[m][1],z=o[m][2];s+=p[x]*p[y]/(1-p[x])*p[z]/(1-p[x]-p[y]);}
    P3[i+','+j+','+k]=s;
    [[i,j],[i,k],[j,k]].forEach(function(q){var key=q[0]+','+q[1];PW[key]=(PW[key]||0)+s;});
  }
  return {P2:P2,PW:PW,P3:P3};
}
function pct(x){return (x*100).toFixed(x<0.1?1:0)+'%';}
function interpW(u){
  var a=CAL['ワイドU']||{x:[0,1],y:[0,1]},X=a.x,Y=a.y;
  if(u<=X[0])return Y[0];
  for(var i=1;i<X.length;i++){if(u<=X[i])return X[i]===X[i-1]?Y[i]:Y[i-1]+(Y[i]-Y[i-1])*(u-X[i-1])/(X[i]-X[i-1]);}
  return Y[Y.length-1];
}
function honmei(M,typ,cap,P3,hs){
  var order=Object.keys(M).sort(function(a,b){return M[b]-M[a];}).slice(0,cap),ch=[],tot=0,S={};
  for(var i=0;i<order.length;i++){
    var key=order[i];ch.push(key);
    if(typ==='ワイド'){
      S[key]=1;var u=0;
      Object.keys(P3).forEach(function(t){var a=t.split(',');if(S[a[0]+','+a[1]]||S[a[0]+','+a[2]]||S[a[1]+','+a[2]])u+=P3[t];});
      tot=interpW(u);
    }else tot+=calib(typ,M[key]);
    if(tot>=0.5)break;
  }
  return {n:ch.length,p:Math.min(tot,0.99),c:ch.map(function(k){return k.split(',').map(function(x){return hs[+x][0];}).sort(function(a,b){return a-b;});})};
}
function honHtml(e){
  var h='';
  [['馬連','uma'],['ワイド','wide'],['三連複','sanpuku']].forEach(function(p){
    var x=e.hon[p[1]];
    h+='<div class=rl><b>'+p[0]+'</b> '+x.c.map(function(n){return n.join('-');}).join(' , ')+' <span class=sub>('+x.n+'点)</span> 予想的中率 '+pct(x.p)+'</div>';
  });
  return h;
}
function myoHtml(e){
  var h='';
  e.tan.forEach(function(t){h+='<div class=rl><b>単勝</b> '+t.no+'番 '+esc(t.name)+'('+t.odds+'倍・'+t.pop+'番人気) 予想的中率 '+pct(t.hit)+'</div>';});
  [['馬連',e.uma],['ワイド',e.wide],['三連複',e.sanpuku]].forEach(function(p){
    p[1].forEach(function(t){h+='<div class=rl><b>'+p[0]+'</b> '+t.nos.join('-')+' <span class=sub>('+t.odds.toFixed(1)+'倍・期待値 '+t.ev.toFixed(2)+')</span> 予想的中率 '+pct(t.hit)+'</div>';});
  });
  return h;
}
var MYONOTE='<div class=sub>妙味は、予想的中率が10%以上で、実際の組み合わせオッズとの期待値が1.1〜1.2倍以上の買い目です(ワイドは最大3点、馬連と三連複は最大2点)。同じルールを2026年1〜10月の約2,700レースで試すと、回収率はワイド約97%・馬連約92%・三連複約94%でした。100%には届いていません。条件は同じ期間のデータで決めたため、実戦ではこれより下がる可能性があります。オッズは確定値での検証です。</div>';
var HONNOTE='<div class=sub>本線は当たりやすい買い方です。過去の検証(9,341レース)では、的中は約45〜50%、回収率は約8割でした。長く買うと負ける前提です。</div>';
function evalRace(rid){
  var r=RD[rid],o=(OD.races||{})[rid],d=DL[rid];
  if(!o||!d)return null;
  var hs=r.hs.filter(function(t){return t[0]!=null&&o[t[0]]&&d[t[1]]!==undefined;});
  if(hs.length<6||hs.length<r.hs.filter(function(t){return t[0]!=null;}).length*0.95)return null;   // 発売の初期は一部の馬しかオッズが無い。全頭そろうまで計算しない
  var q=hs.map(function(t){return 1/o[t[0]][0];}),qs=q.reduce(function(a,b){return a+b;},0);
  q=q.map(function(x){return x/qs;});
  var pr=hs.map(function(t,i){var l=Math.log(q[i]/(1-q[i]))+d[t[1]];return 1/(1+Math.exp(-l));}),ps=pr.reduce(function(a,b){return a+b;},0);
  pr=pr.map(function(x){return x/ps;});
  var H=harv(pr),Q=harv(q),out={tan:[],uma:[],wide:[],sanpuku:[],ana:[],nm:{}};
  hs.forEach(function(t,i){
    out.nm[t[0]]=t[1];
    var od=o[t[0]][0],ev=pr[i]*od;
    if(o[t[0]][1]>=6&&ev>=0.9)out.ana.push({no:t[0],name:t[1],odds:od,pop:o[t[0]][1],ev:ev,pr:pr[i]});
  });
  var CB=((OD.combo||{})[rid])||null;
  function ev2(M,typ,k,th,mid){
    var arr=[];
    if(!CB||!CB[typ])return arr;
    Object.keys(M).forEach(function(key){
      if(M[key]<0.10)return;
      var nos=key.split(',').map(function(x){return hs[+x][0];}).sort(function(a,b){return a-b;});
      var v=CB[typ][nos.join('-')];if(!v)return;
      var od=mid?(v[0]+v[1])/2:v,ev=M[key]*od;
      if(ev>=th)arr.push({nos:nos,odds:od,ev:ev,hit:calib(typ,M[key])});
    });
    arr.sort(function(a,b){return b.ev-a.ev;});
    return arr.slice(0,k);
  }
  out.uma=ev2(H.P2,'馬連',2,1.1,false);
  out.wide=ev2(H.PW,'ワイド',3,1.2,true);
  out.sanpuku=ev2(H.P3,'三連複',2,1.2,false);
  out.hasCB=!!CB;
  var ord=pr.map(function(x,i){return i;}).sort(function(a,b){return pr[b]-pr[a];});
  out.cand={list:ord.slice(0,Math.min(8,hs.length)).map(function(i){return {no:hs[i][0],name:hs[i][1],pop:o[hs[i][0]][1],odds:o[hs[i][0]][0]};})};
  out.hon={uma:honmei(H.P2,'馬連',6,H.P3,hs),wide:honmei(H.PW,'ワイド',4,H.P3,hs),sanpuku:honmei(H.P3,'三連複',15,H.P3,hs)};
  out.ana.sort(function(a,b){return b.ev-a.ev;});out.ana=out.ana.slice(0,2);
  return out;
}
function hmMin(t){var a=String(t||'').split(':');return a.length===2?(+a[0])*60+(+a[1]):null;}
function planRec(day,np,isToday,hm){
  var d=PD[day],h='',td=today();
  if(d){
    h+='<div class=rv><div class=rvh>'+(isToday?'今日の状態':'この日の状態')+'</div>';
    if(d.n_set>0)h+='<div class=rl>ここまでの収支 <b>'+sgn(d.pnl)+'</b> <span class=sub>買った '+yen(d.bet_set)+' → 戻り '+yen(d.ret)+'。この買い方どおりに買った場合</span></div>';
    else h+='<div class=rl>ここまでの収支 <b>±0円</b> <span class=sub>結果が出た買い目は、まだありません。この買い方どおりに買った場合</span></div>';
    if(d.wait>0)h+='<div class=rl><span class=sub>結果待ちの買い目 '+yen(d.wait)+'</span></div>';
    if(d.done)h+='<div class=rl><b>プラスになったので、今日はここで終了です。</b> <span class=sub>'+(d.done_at?esc(d.done_at)+' の時点。':'')+'このあとのレースは買いません(すでに買ったレースの結果待ちは残ります)。</span></div>';
    else h+='<div class=rl>残りの枠 <b>'+yen(Math.max(d.left,0))+'</b> <span class=sub>上限 '+yen(d.cap)+'・ワイドは '+d.nw+'/'+d.nw_max+' レース'+'</span></div>';
    if(d.g1)h+='<div class=rl>重賞'+(d.g1_name?'('+esc(d.g1_name)+')':'')+'に使える額 <b>'+yen(d.g1_avail||0)+'まで</b> <span class=sub>1レース勝負の枠。取り置き '+yen(d.reserve||0)+' と、上の買い方で使わずに残っている分の合計(上限 '+yen(d.g1_max||d.reserve||0)+')。上の収支と残りの枠には入っていません</span></div>';
    h+='</div>';
  }
  var buy=np.filter(function(x){return x.p.plan.buy;}).sort(function(a,b){return (a.r.pt||'').localeCompare(b.r.pt||'')||a.r.pl.localeCompare(b.r.pl);});
  if(!np.length)h+='<p class=sub>この日の推奨は、まだありません(採点待ち)。</p>';
  else if(!buy.length)h+='<p class=sub>'+(d&&d.done?'今日は終了したので、買うレースはありません。':'今のところ、買うレースはありません。')+'</p>';
  buy.forEach(function(x,i){
    var pl=x.p.plan,past=isToday&&x.r.pt&&hm>x.r.pt,q=(RS.races||{})[x.rid];
    var left=(day===td&&hmMin(x.r.pt)!==null)?hmMin(x.r.pt)-hmMin(hm):(day<td?-1:9999),fixed=left<11;
    h+='<div class=rcard'+(past?' past':'')+' data-go="'+x.r.r+'" data-goplace="'+esc(x.r.pl)+'">'
      +'<div class=rt><span class=rkc>'+(pl.no||i+1)+'</span>'+esc(x.r.pl)+x.r.r+'R <span class=sub>'+(x.r.pt||'')+(x.r.rpt?'・RS '+x.r.rpt:'')+(x.r.rc?'・RPT '+x.r.rc:'')+'</span> <span class="stars on'+(pl.w?'':' w')+'">★ 推奨</span>'+(past?' <span class=rpt>発走済</span>':'')+'</div>'
      +(pl.w&&pl.wd?'<div class=rl><b>ワイド '+pl.wd.length+'点・'+yen(pl.wamt)+'</b> <span class=sub>当たれば最低 '+yen(pl.min)+'</span></div>':'')
      +(pl.t&&x.p.bets?'<div class=rl><b>三連複 '+x.p.bets.length+'点・'+yen(pl.tamt)+'</b> <span class=sub>1組100円</span></div>':'')
      +(q?(function(){var o=planPay(x.p,q);return '<div class=rl><b>結果</b> '+(o.ret?'戻り '+yen(o.ret):'外れ')+' <span class=sub>収支 '+sgn(o.ret-o.bet)+'</span></div>';})():(fixed?'':'<div class=rl><span class=sub>予定です。発走10分前に決まり、それまでは変わることがあります。</span></div>'))
      +'</div>';
  });
  if(np.length)h+='<p class=sub>丸の数字は、今日買う順番(発走順)です。ここに無いレースは買いません。理由は「全レース」の一覧と、各レースのページに出ます。</p>'
    +'<p class=sub>この買い方の過去の成績(2025〜26年、直前のレースの結果がまだ分からない分も入れた検証): プラスで終わった日は46%、2,000円以上のプラスは37%、5,000円以上のマイナスは25%。100円が104円になる計算ですが、三連複の大きな当たりに頼っていて、それが無い日は負けます。</p>';
  return h;
}
function buildRec(){
  $all('.ov.rec').forEach(function(box){
    var day=box.dataset.day,hits=[],withOdds=0;
    Object.keys(RD).forEach(function(rid){
      var r=RD[rid];if(r.day!==day)return;
      if((OD.races||{})[rid])withOdds++;
      var e=evalC(rid);if(!e)return;
      hits.push({rid:rid,r:r,e:e,m:!!(e.tan.length||e.uma.length||e.wide.length||e.sanpuku.length)});
    });
    var isToday=day===today(),hm=nowHM(),h='',all=[];
    var np=[];Object.keys(RD).forEach(function(rid){var r=RD[rid],p=PR[rid];if(r.day===day&&p&&p.plan)np.push({rid:rid,r:r,p:p});});
    if(np.length||PD[day]){box.innerHTML=planRec(day,np,isToday,hm);return;}
    Object.keys(RD).forEach(function(rid){var r=RD[rid],p=PR[rid];if(r.day!==day||!p||(p.s!=='★'&&p.s!=='○'))return;all.push({rid:rid,r:r,p:p});});
    function num(s){var m=/[0-9]+/.exec(s||'');return m?+m[0]:99;}
    if(!all.length)h+='<p class=sub>この日の推奨は、まだありません(採点待ち)。</p>';
    [['固い','勝負(固いレース)'],['荒れ','広げる(荒れるレース)']].forEach(function(g){
      var arr=all.filter(function(x){return x.p.k===g[0];}).sort(function(a,b){return num(a.p.o)-num(b.p.o);});
      if(!arr.length)return;
      function card(x){
        var past=isToday&&x.r.pt&&hm>x.r.pt;
        return '<div class=rcard'+(past?' past':'')+' data-go="'+x.r.r+'" data-goplace="'+esc(x.r.pl)+'">'
          +'<div class=rt><span class=rkc>'+num(x.p.o)+'</span>'+esc(x.r.pl)+x.r.r+'R <span class=sub>'+(x.r.pt||'')+(x.r.rpt?'・RS '+x.r.rpt:'')+(x.r.rc?'・RPT '+x.r.rc:'')+'</span> <span class="stars on'+(x.p.k==='荒れ'?' w':'')+'">'+x.p.s+' '+oLab(x.p)+'</span>'+(past?' <span class=rpt>発走済</span>':'')+'</div>'
          +'<div class=rl>'+esc(x.p.why)+'</div>'+(x.p.bets&&x.p.bets.length?'<div class=rl><b>三連複 '+x.p.bets.length+'点</b> <span class=sub>勝負枠・1組100円なら '+(x.p.bets.length*100).toLocaleString()+'円</span></div>':'')+(x.p.tri&&x.p.tri.length?'<div class=rl><b>三連単 '+x.p.tri.length+'点</b> <span class=sub>宝くじ枠・'+(x.p.tri.length*100).toLocaleString()+'円</span></div>':'')+(x.p.wd&&x.p.wd.length?'<div class=rl><b>ワイド '+x.p.wd.length+'点</b> <span class=sub>抑え枠・'+(x.p.wd.length*1000).toLocaleString()+'円</span></div>':'')+'</div>';
      }
      var stars=arr.filter(function(x){return x.p.s==='★';}),rest=arr.filter(function(x){return x.p.s!=='★';});
      h+='<div class=rvh>'+g[1]+' <span class=sub>★'+stars.length+'・○'+rest.length+'</span></div>';
      arr.slice().sort(function(a,b){return (+String(a.p.o||'').replace(/[^0-9]/g,'')||99)-(+String(b.p.o||'').replace(/[^0-9]/g,'')||99);}).forEach(function(x){h+=card(x);});   // 11/11〜 次点にたたまず、当たりやすさ順に全部
    });
    box.innerHTML=h;
  });
}
function loadOdds(){
  try{
    fetch('odds.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(j&&j.races&&(!OD.stamp||(j.ts||0)>=(OD.ts||0))){OD=j;applyOdds();}
    }).catch(function(){});
    fetch('pl_rec.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(j&&j.races){PR=j.races;PD=j.day||{};applyOdds();}
    }).catch(function(){});
    fetch('results.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(j&&j.races){RS=j;applyOdds();if(S.place==='記録'){if(LV==='res')buildRes();else buildLed();}}
    }).catch(function(){});
  }catch(e){}
}
document.addEventListener('click',function(e){var b=e.target.closest('.sb .tab');if(!b)return;S.sort=b.dataset.sort;resort();});
function firstPlace(d){return '推奨';}
document.addEventListener('click',function(e){var b=e.target.closest('[data-rp]');if(!b)return;RP=b.dataset.rp;buildRes();});
document.addEventListener('click',function(e){var b=e.target.closest('[data-lv]');if(!b)return;LV=b.dataset.lv;show();document.body.scrollTop=0;});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-rec]');if(!b)return;
  var rid=b.dataset.rec,p=PR[rid],r=RD[rid];if(!p||!p.bets||!r)return;
  var cur=ldGet(),have={};cur.forEach(function(x){have[x.rid+'|'+x.kind+'|'+x.key]=1;});
  var base=Date.now(),n=0;
  p.bets.forEach(function(t,i){var k=t[0];if(have[rid+'|三連複|'+k])return;cur.push({id:base+i,day:r.day,rid:rid,kind:'三連複',key:k,amt:100});n++;});
  if(!ldSet(cur)){alert('保存できませんでした(プライベートブラウズ中など)。');return;}
  b.textContent=n?('記録しました('+n+'組 × 100円)'):'すでに記録済みです';ldSync();
});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-rec3]');if(!b)return;
  var rid=b.dataset.rec3,p=PR[rid],r=RD[rid];if(!p||!p.tri||!r)return;
  recSet(b,rid,r,'三連単',p.tri.map(function(t){return t[0];}),100);
});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-recw]');if(!b)return;
  var rid=b.dataset.recw,p=PR[rid],r=RD[rid];if(!p||!r)return;
  if(p.plan){
    if(!p.plan.wd||!p.plan.wd.length)return;
    var cur=ldGet(),have={};cur.forEach(function(x){have[x.rid+'|'+x.kind+'|'+x.key]=1;});
    var base=Date.now()+500,n=0,sum=0;
    p.plan.wd.forEach(function(t,i){if(have[rid+'|ワイド|'+t[0]])return;cur.push({id:base+i,day:r.day,rid:rid,kind:'ワイド',key:t[0],amt:t[1]});n++;sum+=t[1];});
    if(!ldSet(cur)){alert('保存できませんでした(プライベートブラウズ中など)。');return;}
    b.textContent=n?('記録しました('+n+'組・合計 '+sum.toLocaleString()+'円)'):'すでに記録済みです';ldSync();return;
  }
  if(!p.wd)return;
  recSet(b,rid,r,'ワイド',p.wd.map(function(x){return x[0];}),1000);
});
function recSet(b,rid,r,kind,keys,amt){
  var cur=ldGet(),have={};cur.forEach(function(x){have[x.rid+'|'+x.kind+'|'+x.key]=1;});
  var base=Date.now()+500,n=0;
  keys.forEach(function(k,i){if(have[rid+'|'+kind+'|'+k])return;cur.push({id:base+i,day:r.day,rid:rid,kind:kind,key:k,amt:amt});n++;});
  if(!ldSet(cur)){alert('保存できませんでした(プライベートブラウズ中など)。');return;}
  b.textContent=n?('記録しました('+n+'組 × '+amt.toLocaleString()+'円)'):'すでに記録済みです';ldSync();
}
document.getElementById('nd').addEventListener('click',function(e){var b=e.target.closest('.tab');if(!b)return;S.day=b.dataset.day;if(S.place!=='推奨'&&S.place!=='記録'&&S.place!=='全レース'){var ps=placesOf(S.day);if(ps.indexOf(S.place)<0)S.place=ps[0]||'推奨';}S.race='ov';show();});
document.getElementById('bt').addEventListener('click',function(e){var b=e.target.closest('.bi');if(!b)return;var p=b.dataset.p;S.place=p;S.race='ov';show();document.body.scrollTop=0;});
document.getElementById('np').addEventListener('click',function(e){var b=e.target.closest('.tab');if(!b)return;S.place=b.dataset.place;S.race='ov';show();});
document.getElementById('nr').addEventListener('click',function(e){var b=e.target.closest('.tab');if(!b)return;S.race=b.dataset.race;show();document.body.scrollTop=0;});
document.addEventListener('click',function(e){var t=e.target.closest('[data-go]');if(!t)return;if(t.dataset.goplace)S.place=t.dataset.goplace;S.race=t.dataset.go;show();document.body.scrollTop=0;});
var days=$all('#nd .tab'),td=today(),pick=days[0];
days.forEach(function(b){if(b.dataset.day===td)pick=b;});
S.day=pick.dataset.day;S.place=firstPlace(S.day);show();resort();applyOdds();
loadOdds();setInterval(loadOdds,60000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)loadOdds();});
})();
