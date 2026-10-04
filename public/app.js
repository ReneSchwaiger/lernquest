/* LernQuest – Frontend (ohne Framework, ohne Build). © Schwaiger BUSINESS IT GmbH */

"use strict";
/* ============ Helpers ============ */
const $app = document.getElementById('app');
const ri = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick = a=>a[Math.floor(Math.random()*a.length)];
const shuffle = a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n=>{const neg=n<0;let s=String(Math.abs(n));let [i,d]=s.split('.');i=i.replace(/\B(?=(\d{3})+(?!\d))/g,'.');return (neg?'−':'')+i+(d?','+d:'')};
const dec = n=>{const r=Math.round(n*10000)/10000;return String(r).replace('.',',')};
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
const lcm=(a,b)=>a/gcd(a,b)*b;
const fracStr=(n,d)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d);n/=g;d/=g;return d===1?String(n):n+'/'+d};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const daysBetween=(a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5);
const uid=()=>Math.random().toString(36).slice(2,9);
function lsGet(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){return def}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* question builders */
function mc(q,correct,wrongs,expl){const w=[...new Set(wrongs.map(String))].filter(x=>x!==String(correct)).slice(0,3);return {type:'mc',q,options:shuffle([String(correct),...w]),answer:String(correct),expl:expl||''}}
function inp(q,answer,check,expl,accept){return {type:'input',q,answer:String(answer),check:check||'text',expl:expl||'',accept:accept||[]}}
function near(n,spread,count=3){const s=new Set();let guard=0;while(s.size<count&&guard++<50){const v=n+ri(-spread,spread);if(v!==n&&v>=0)s.add(v)}return [...s]}

/* answer checking */
function parseNum(s){s=String(s).replace(/\s/g,'').replace('−','-');if(!s)return NaN;if(s.includes(',')){s=s.replace(/\./g,'').replace(',','.')}else if(/^-?\d{1,3}(\.\d{3})+$/.test(s)){s=s.replace(/\./g,'')}if(!/^-?\d*\.?\d+$/.test(s))return NaN;return parseFloat(s)}
function parseFrac(s){s=String(s).trim().replace('−','-').replace(/\s*\/\s*/,'/');let m=s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);if(m){const w=+m[1];return w+(w<0?-1:1)*(+m[2]/+m[3])}m=s.match(/^(-?\d+)\/(\d+)$/);if(m)return +m[2]?+m[1]/+m[2]:NaN;return parseNum(s)}
const dispAns=q=>q.check==='num'&&/^-?\d+(\.\d+)?$/.test(String(q.answer))?fmt(Number(q.answer)):q.answer;
const normText=s=>String(s).toLowerCase().trim().replace(/[.!?]+$/,'').replace(/\s+/g,' ').replace(/[’`]/g,"'");
function checkAnswer(q,val){
  if(q.type==='mc')return val===q.answer;
  const all=[q.answer,...(q.accept||[])];
  if(q.check==='num'){const v=parseNum(val);return all.some(a=>Math.abs(parseNum(a)-v)<1e-6)}
  if(q.check==='frac'){const v=parseFrac(val);return all.some(a=>Math.abs(parseFrac(a)-v)<1e-6)}
  const v=normText(val);return all.some(a=>normText(a)===v);
}

/* ============ Content: Mathematik ============ */
const M = {
  // --- Emma (4. VS) ---
  stellen(){const n=ri(100000,999999);const places=[['Einer',1],['Zehner',10],['Hunderter',100],['Tausender',1000],['Zehntausender',10000],['Hunderttausender',100000]];const [nm,v]=pick(places);const d=Math.floor(n/v)%10;
    return Math.random()<.5?inp(`Welche Ziffer steht an der ${nm}stelle von ${fmt(n)}?`,d,'num',`${fmt(n)}: An der ${nm}stelle steht die ${d}.`)
    : (()=>{const a=ri(1,9),b=ri(0,9),c=ri(1,9);const val=a*100000+b*1000+c*10;return inp(`Schreib als Zahl: ${a} HT, ${b} T, ${c} Z`,val,'num',`${a}·100.000 + ${b}·1.000 + ${c}·10 = ${fmt(val)}`)})()},
  runden(){const n=ri(10000,999999);const [nm,v]=pick([['Zehner',10],['Hunderter',100],['Tausender',1000],['Zehntausender',10000]]);const r=Math.round(n/v)*v;return mc(`Runde ${fmt(n)} auf ${nm}.`,fmt(r),[fmt(r+v),fmt(r-v),fmt(r+2*v)],`Schau auf die Stelle rechts neben den ${nm}n: 0–4 abrunden, 5–9 aufrunden → ${fmt(r)}`)},
  add(){const a=ri(10000,499999),b=ri(10000,499999);return inp(`${fmt(a)} + ${fmt(b)} = ?`,a+b,'num',`Schriftlich addieren, von rechts nach links mit Übertrag: ${fmt(a+b)}`)},
  sub(){const a=ri(200000,999999),b=ri(10000,a-1000);return inp(`${fmt(a)} − ${fmt(b)} = ?`,a-b,'num',`Schriftlich subtrahieren: ${fmt(a-b)}. Probe: ${fmt(a-b)} + ${fmt(b)} = ${fmt(a)}`)},
  mul(){const a=ri(120,989),b=ri(12,89);return inp(`${a} · ${b} = ?`,a*b,'num',`${a}·${Math.floor(b/10)*10} = ${fmt(a*Math.floor(b/10)*10)} und ${a}·${b%10} = ${fmt(a*(b%10))} → zusammen ${fmt(a*b)}`)},
  div(){const d=ri(3,9),q=ri(150,1999);return inp(`${fmt(d*q)} : ${d} = ?`,q,'num',`Probe: ${fmt(q)} · ${d} = ${fmt(d*q)}`)},
  div2(){const d=ri(12,39),q=ri(25,299);return inp(`${fmt(d*q)} : ${d} = ?`,q,'num',`Probe: ${q} · ${d} = ${fmt(d*q)}`)},
  masse(){const t=pick([
    ()=>{const k=ri(2,9),m=ri(1,9)*100;return inp(`${k} km ${m} m = ? m`,k*1000+m,'num','1 km = 1.000 m')},
    ()=>{const k=ri(1,9),g=ri(1,9)*50;return inp(`${k} kg ${g} g = ? g`,k*1000+g,'num','1 kg = 1.000 g')},
    ()=>{const h=ri(1,5),m=ri(5,55);return inp(`${h} h ${m} min = ? min`,h*60+m,'num','1 h = 60 min')},
    ()=>{const e=ri(2,40),c=ri(5,95);return inp(`${e} € ${c} c = ? c`,e*100+c,'num','1 € = 100 Cent')},
    ()=>{const m=ri(2,9)*1000;return inp(`${fmt(m)} m = ? km`,m/1000,'num','1.000 m = 1 km')},
    ()=>{const t=ri(2,6);return inp(`${t} t = ? kg`,t*1000,'num','1 t = 1.000 kg')},
    ()=>{const s=ri(2,9);return inp(`${s} min = ? s`,s*60,'num','1 min = 60 s')}])();return t},
  sach(){return pick([
    ()=>{const p=ri(3,8),k=ri(12,28),pr=ri(4,9);return inp(`Eine Klasse mit ${k} Kindern fährt ins Museum. Der Eintritt kostet ${pr} € pro Kind. Wie viel € kostet es für alle?`,k*pr,'num',`${k} · ${pr} € = ${k*pr} €`)},
    ()=>{const g=ri(4,9)*12;return inp(`Oma backt ${g} Kekse und verteilt sie gleichmäßig auf 12 Dosen. Wie viele Kekse kommen in jede Dose?`,g/12,'num',`${g} : 12 = ${g/12}`)},
    ()=>{const s=ri(8,11),m=ri(10,50),d=ri(35,95);const end=s*60+m+d;return inp(`Der Film beginnt um ${s}:${String(m).padStart(2,'0')} Uhr und dauert ${d} Minuten. Um wie viel Uhr ist er aus? (Schreib z.B. 10:45)`,`${Math.floor(end/60)}:${String(end%60).padStart(2,'0')}`,'text',`${s}:${String(m).padStart(2,'0')} + ${d} min = ${Math.floor(end/60)}:${String(end%60).padStart(2,'0')}`,[`${Math.floor(end/60)}.${String(end%60).padStart(2,'0')}`])},
    ()=>{const b=ri(5,15),c=ri(2,5),a=b*c+ri(1,20);return inp(`Emma hat ${a} €. Sie kauft ${c} Bücher zu je ${b} €. Wie viel € bleibt übrig?`,a-b*c,'num',`${c} · ${b} = ${b*c} €; ${a} − ${b*c} = ${a-b*c} €`)},
    ()=>{const km=ri(120,480);return inp(`Familie Huber fährt ${km} km in den Urlaub und wieder zurück. Wie viele km fahren sie insgesamt?`,km*2,'num',`${km} · 2 = ${km*2} km`)}])()},
  geo(){const a=ri(3,15),b=ri(2,12);return Math.random()<.5?inp(`Ein Rechteck ist ${a} cm lang und ${b} cm breit. Wie groß ist der Umfang in cm?`,2*(a+b),'num',`u = 2·(a+b) = 2·(${a}+${b}) = ${2*(a+b)} cm`):inp(`Ein Rechteck ist ${a} m lang und ${b} m breit. Wie groß ist die Fläche in m²?`,a*b,'num',`A = a·b = ${a}·${b} = ${a*b} m²`)},
  pbrueche(){return pick([
    ()=>{const d=pick([2,3,4,5,10]),n=ri(1,d-1),w=d*ri(2,9);return inp(`Wie viel ist ${n}/${d} von ${w}?`,w/d*n,'num',`${w} : ${d} = ${w/d}, mal ${n} = ${w/d*n}`)},
    ()=>{const pairs=[['1/2','1/3'],['3/4','2/3'],['2/5','1/2'],['5/8','3/4'],['1/4','1/5']];const [a,b]=pick(pairs);const big=parseFrac(a)>parseFrac(b)?a:b;return mc(`Welcher Bruch ist größer?`,big,[big===a?b:a,'Beide gleich'],`${a} = ${dec(parseFrac(a))}, ${b} = ${dec(parseFrac(b))}`)},
    ()=>{const a=ri(11,99)/10,b=ri(11,99)/10;return inp(`${dec(a)} + ${dec(b)} = ?`,Math.round((a+b)*10)/10,'num',`Komma unter Komma: ${dec(Math.round((a+b)*10)/10)}`)}])()},
  pklammer(){return pick([
    ()=>{const a=ri(2,9),b=ri(2,9),c=ri(2,9);return inp(`${a} + ${b} · ${c} = ?`,a+b*c,'num',`Punkt vor Strich: ${b}·${c} = ${b*c}, dann + ${a} = ${a+b*c}`)},
    ()=>{const a=ri(2,9),b=ri(2,9),c=ri(2,9);return inp(`(${a} + ${b}) · ${c} = ?`,(a+b)*c,'num',`Klammer zuerst: ${a+b} · ${c} = ${(a+b)*c}`)},
    ()=>{const x=ri(3,40),b=ri(2,9);return inp(`Welche Zahl? □ · ${b} = ${x*b}`,x,'num',`${x*b} : ${b} = ${x}`)},
    ()=>{const a=ri(20,90),b=ri(2,9),c=ri(2,6);return inp(`${a*c} : ${c} − ${b} · 3 = ?`,a-b*3,'num',`${a*c}:${c} = ${a}; ${b}·3 = ${b*3}; ${a} − ${b*3} = ${a-b*3}`)}])()},
  // --- Hannah (2. MS, AHS-Niveau) ---
  bradd(){const d1=pick([2,3,4,5,6,8,10,12]),d2=pick([2,3,4,5,6,8,9]);const n1=ri(1,d1*2-1),n2=ri(1,d2*2-1);const plus=Math.random()<.6;let n=plus?n1*d2+n2*d1:n1*d2-n2*d1,d=d1*d2;if(n<0){return M.bradd()}const L=lcm(d1,d2);
    return inp(`${n1}/${d1} ${plus?'+':'−'} ${n2}/${d2} = ?\n(gekürzt, z.B. 7/12)`,fracStr(n,d),'frac',`Hauptnenner ${L}: ${n1*L/d1}/${L} ${plus?'+':'−'} ${n2*L/d2}/${L} = ${fracStr(n,d)}`)},
  brmul(){const a=ri(1,9),b=ri(2,10),c=ri(1,9),d=ri(2,10);const div=Math.random()<.5;const n=div?a*d:a*c,dd=div?b*c:b*d;
    return inp(`${a}/${b} ${div?':':'·'} ${c}/${d} = ?\n(gekürzt)`,fracStr(n,dd),'frac',div?`Dividieren = mit dem Kehrwert multiplizieren: ${a}/${b} · ${d}/${c} = ${fracStr(n,dd)}`:`Zähler·Zähler, Nenner·Nenner: ${a*c}/${b*d} = ${fracStr(n,dd)}`)},
  brkuerz(){const d=ri(2,9),n=ri(1,d-1),k=ri(2,9);return Math.random()<.5?inp(`Kürze vollständig: ${n*k}/${d*k}`,fracStr(n,d),'frac',`Durch ${gcd(n*k,d*k)} kürzen → ${fracStr(n,d)}`):inp(`Schreib ${fracStr(n,d)} als Dezimalzahl (auf 2 Stellen runden)`,Math.round(n/d*100)/100,'num',`${n} : ${d} ≈ ${dec(Math.round(n/d*100)/100)}`)},
  dezi(){return pick([
    ()=>{const a=ri(12,99)/10,b=ri(2,9);return inp(`${dec(a)} · ${b} = ?`,Math.round(a*b*10)/10,'num',`${dec(a)}·${b} = ${dec(Math.round(a*b*10)/10)}`)},
    ()=>{const a=ri(11,59)/10,b=ri(11,39)/10;return inp(`${dec(a)} · ${dec(b)} = ?`,Math.round(a*b*100)/100,'num',`Ohne Komma rechnen, dann so viele Nachkommastellen wie beide Faktoren zusammen: ${dec(Math.round(a*b*100)/100)}`)},
    ()=>{const b=ri(2,8),q=ri(11,99)/10;return inp(`${dec(Math.round(q*b*10)/10)} : ${b} = ?`,q,'num',`Probe: ${dec(q)} · ${b}`)},
    ()=>{const a=ri(100,999)/100,p=pick([10,100,1000]);return inp(`${dec(a)} · ${fmt(p)} = ?`,Math.round(a*p*1000)/1000,'num',`Komma um ${String(p).length-1} Stelle(n) nach rechts`)}])()},
  teil(){return pick([
    ()=>{const g=ri(2,12),a=g*ri(2,9),b=g*ri(2,9);const G=gcd(a,b);return inp(`ggT(${a}, ${b}) = ?`,G,'num',`Größter gemeinsamer Teiler: ${G}`)},
    ()=>{const a=ri(3,12),b=ri(3,15);return inp(`kgV(${a}, ${b}) = ?`,lcm(a,b),'num',`Kleinstes gemeinsames Vielfaches: ${lcm(a,b)}`)},
    ()=>{const n=ri(100,999)*pick([1,3,9]);const opts=[2,3,4,5,9];const t=pick(opts);const ok=n%t===0;return mc(`Ist ${n} durch ${t} teilbar?`,ok?'Ja':'Nein',[ok?'Nein':'Ja'],t===3||t===9?`Quersumme: ${String(n).split('').reduce((s,c)=>s+ +c,0)}`:`${n} : ${t} = ${dec(Math.round(n/t*100)/100)}`)}])()},
  proz(){return pick([
    ()=>{const p=pick([10,20,25,30,40,50,75,5,15]),g=ri(2,20)*20;return inp(`Wie viel sind ${p} % von ${g} €?`,g*p/100,'num',`${g} · ${p}/100 = ${dec(g*p/100)} €`)},
    ()=>{const g=ri(2,10)*20,p=pick([10,20,25,40,50,75]);const w=g*p/100;return inp(`Wie viel Prozent sind ${dec(w)} von ${g}?`,p,'num',`${dec(w)} : ${g} = ${dec(p/100)} = ${p} %`)},
    ()=>{const p=pick([10,20,25,50]),g=ri(2,12)*40;return inp(`Ein Pulli kostet ${g} €. Im Sale gibt es ${p} % Rabatt. Wie viel kostet er jetzt?`,g*(100-p)/100,'num',`${g} − ${dec(g*p/100)} = ${dec(g*(100-p)/100)} €`)},
    ()=>{const p=pick([10,20,25,50]),g=ri(2,12)*20;const w=g*p/100;return inp(`${p} % einer Zahl sind ${dec(w)}. Wie heißt die Zahl (Grundwert)?`,g,'num',`${dec(w)} : ${p} · 100 = ${g}`)}])()},
  propo(){return pick([
    ()=>{const n=ri(2,6),p=ri(2,9)/2,m=ri(7,15);return inp(`${n} Kilo Äpfel kosten ${dec(n*p)} €. Wie viel kosten ${m} Kilo?`,Math.round(m*p*100)/100,'num',`Direkt proportional: 1 kg = ${dec(p)} €, also ${m} kg = ${dec(m*p)} €`)},
    ()=>{const w=pick([2,3,4,6]),t=ri(2,6)*6;const w2=pick([2,3,4,6,8,12].filter(x=>x!==w&&(w*t)%x===0));return inp(`${w} Maler brauchen ${t} Stunden für eine Wohnung. Wie lange brauchen ${w2} Maler (gleich schnell)?`,w*t/w2,'num',`Indirekt proportional: ${w}·${t} = ${w*t} Stunden Arbeit, : ${w2} = ${w*t/w2} h`)},
    ()=>{const s=pick([40,50,60,80]),t=pick([2,3,4]);const t2=pick([1,2,3,4,5,6].filter(x=>x!==t&&(s*t)%x===0));const s2=s*t/t2;return inp(`Mit ${s} km/h dauert eine Fahrt ${t} Stunden. Wie lange dauert sie mit ${s2} km/h?`,t2,'num',`Indirekt: ${s}·${t} = ${s*t} km, : ${s2} = ${t2} h`)},
    ()=>mc(`Welche Zuordnung ist indirekt proportional?`,'Anzahl Arbeiter → Arbeitszeit',['Menge Brot → Preis','Fahrzeit → Strecke (gleiches Tempo)','Anzahl Hefte → Gewicht'],'Je mehr Arbeiter, desto weniger Zeit – das ist indirekt proportional.')])()},
  glei(){const x=ri(-2,15),a=ri(2,9),b=ri(1,30);return pick([
    ()=>inp(`Löse: x + ${b} = ${x+b}`,x,'num',`x = ${x+b} − ${b} = ${x}`),
    ()=>inp(`Löse: ${a}x = ${a*x}`,x,'num',`x = ${a*x} : ${a} = ${x}`),
    ()=>inp(`Löse: ${a}x + ${b} = ${a*x+b}`,x,'num',`${a}x = ${a*x+b} − ${b} = ${a*x} → x = ${x}`),
    ()=>inp(`Löse: ${a}x − ${b} = ${a*x-b}`,x,'num',`${a}x = ${a*x-b} + ${b} = ${a*x} → x = ${x}`)])()},
  terme(){return pick([
    ()=>{const a=ri(2,9),b=ri(2,9),c=ri(1,a+b-1);return inp(`Vereinfache: ${a}x + ${b}x − ${c}x`,`${a+b-c}x`,'text',`${a}+${b}−${c} = ${a+b-c} → ${a+b-c}x`,[a+b-c===1?'x':`${a+b-c} x`])},
    ()=>{const a=ri(2,9),x=ri(1,6),b=ri(1,9);return inp(`Berechne den Term ${a}·x + ${b} für x = ${x}`,a*x+b,'num',`${a}·${x} + ${b} = ${a*x+b}`)},
    ()=>{const a=ri(2,6),b=ri(2,9);return mc(`Was ist ${a}·(x + ${b}) ausmultipliziert?`,`${a}x + ${a*b}`,[`${a}x + ${b}`,`x + ${a*b}`,`${a+b}x`],`Jeden Summanden mal ${a}: ${a}x + ${a*b}`)}])()},
  winkel(){return pick([
    ()=>{const a=ri(30,80),b=ri(30,80);return inp(`Ein Dreieck hat die Winkel α = ${a}° und β = ${b}°. Wie groß ist γ?`,180-a-b,'num',`Winkelsumme im Dreieck = 180°: 180 − ${a} − ${b} = ${180-a-b}°`)},
    ()=>{const a=ri(20,160);return inp(`Zwei Nebenwinkel: einer ist ${a}°. Wie groß ist der andere?`,180-a,'num',`Nebenwinkel ergeben zusammen 180°`)},
    ()=>{const a=ri(50,130),b=ri(50,130),c=ri(50,100);return inp(`Ein Viereck hat die Winkel ${a}°, ${b}° und ${c}°. Wie groß ist der vierte?`,360-a-b-c,'num',`Winkelsumme im Viereck = 360°`)},
    ()=>{const a=pick([35,48,72,110,135,90,180,15]);const t=a<90?'spitzer Winkel':a===90?'rechter Winkel':a<180?'stumpfer Winkel':'gestreckter Winkel';return mc(`Ein Winkel von ${a}° ist ein …`,t,['spitzer Winkel','rechter Winkel','stumpfer Winkel','gestreckter Winkel'].filter(x=>x!==t),'spitz < 90° < stumpf < 180°')}])()},
  flaech(){return pick([
    ()=>{const g=ri(3,16),h=ri(2,12)*2/2;const A=g*h/2;return inp(`Dreieck: g = ${g} cm, h = ${h} cm. Fläche in cm²?`,A,'num',`A = g·h/2 = ${g}·${h}/2 = ${dec(A)} cm²`)},
    ()=>{const g=ri(4,15),h=ri(2,10);return inp(`Parallelogramm: a = ${g} cm, hₐ = ${h} cm. Fläche in cm²?`,g*h,'num',`A = a·hₐ = ${g*h} cm²`)},
    ()=>{const a=ri(6,14),c=ri(2,a-1),h=ri(2,8)*2;return inp(`Trapez: a = ${a} cm, c = ${c} cm, h = ${h} cm. Fläche in cm²?`,(a+c)*h/2,'num',`A = (a+c)·h/2 = ${(a+c)}·${h}/2 = ${(a+c)*h/2} cm²`)},
    ()=>{const a=ri(3,9);return inp(`Ein Würfel hat die Kantenlänge ${a} cm. Volumen in cm³?`,a**3,'num',`V = a³ = ${a**3} cm³`)}])()},
  pneg(){const a=ri(-15,15),b=ri(-15,15);const op=pick(['+','−','·']);const r=op==='+'?a+b:op==='−'?a-b:a*b;const f=n=>n<0?`(−${-n})`:n;return inp(`${f(a)} ${op} ${f(b)} = ?`,r,'num',op==='·'?'Minus mal Minus = Plus, Plus mal Minus = Minus':`Ergebnis: ${r}`)},
  ppot(){return pick([
    ()=>{const b=ri(2,9),e=ri(2,3);return inp(`${b}${e===2?'²':'³'} = ?`,b**e,'num',`${b}${e===2?'²':'³'} = ${Array(e).fill(b).join('·')} = ${b**e}`)},
    ()=>{const e=ri(3,6);return inp(`10${['','','','³','⁴','⁵','⁶'][e]} = ?`,10**e,'num',`1 mit ${e} Nullen`)},
    ()=>{const n=pick([16,25,36,49,64,81,100,121,144]);return inp(`√${n} = ?`,Math.sqrt(n),'num',`${Math.sqrt(n)}·${Math.sqrt(n)} = ${n}`)}])()},
};

/* ============ Content: Deutsch ============ */
const W = {
  Nomen:['Hund','Schule','Freundin','Baum','Fenster','Sonne','Fahrrad','Freude','Angst','Wolke','Garten','Stadt','Lehrerin','Abenteuer'],
  Verb:['laufen','schreiben','lachen','springen','denken','spielen','malen','singen','schwimmen','träumen','erzählen','backen'],
  Adjektiv:['schnell','bunt','laut','leise','freundlich','mutig','lustig','warm','hell','traurig','spannend','klug'],
  Pronomen:['ich','ihr','sein','dieser','mich','euch','unser','jemand','sie','wir'],
  'Präposition':['auf','unter','neben','wegen','trotz','zwischen','hinter','während','ohne','durch'],
  Konjunktion:['und','weil','obwohl','dass','aber','wenn','damit','oder','sodass','sondern'],
  Adverb:['gestern','oft','dort','gern','bald','hier','nie','heute','draußen','manchmal'],
};
function wortart(kinds){const k=pick(kinds);const w=pick(W[k]);if(Math.random()<.6)return mc(`Welche Wortart ist „${w}“?`,k,shuffle(kinds.filter(x=>x!==k)),`„${w}“ ist ein${k==='Präposition'||k==='Konjunktion'?'e':''} ${k}.`);
  const others=shuffle(kinds.filter(x=>x!==k)).slice(0,3).map(o=>pick(W[o]));return mc(`Welches Wort ist ein${k==='Präposition'||k==='Konjunktion'?'e':''} ${k}?`,w,others,`„${w}“ ist ein${k==='Präposition'||k==='Konjunktion'?'e':''} ${k}.`)}
const VERBS=[
 {inf:'spielen',p:'spielt',pt:'spielte',aux:'hat',aux2:'hatte',pp:'gespielt',r:'im Garten'},
 {inf:'laufen',p:'läuft',pt:'lief',aux:'ist',aux2:'war',pp:'gelaufen',r:'zur Schule'},
 {inf:'schreiben',p:'schreibt',pt:'schrieb',aux:'hat',aux2:'hatte',pp:'geschrieben',r:'einen Brief'},
 {inf:'lesen',p:'liest',pt:'las',aux:'hat',aux2:'hatte',pp:'gelesen',r:'ein spannendes Buch'},
 {inf:'fahren',p:'fährt',pt:'fuhr',aux:'ist',aux2:'war',pp:'gefahren',r:'mit dem Rad'},
 {inf:'essen',p:'isst',pt:'aß',aux:'hat',aux2:'hatte',pp:'gegessen',r:'eine Pizza'},
 {inf:'singen',p:'singt',pt:'sang',aux:'hat',aux2:'hatte',pp:'gesungen',r:'ein Lied'},
 {inf:'schwimmen',p:'schwimmt',pt:'schwamm',aux:'ist',aux2:'war',pp:'geschwommen',r:'im See'},
 {inf:'finden',p:'findet',pt:'fand',aux:'hat',aux2:'hatte',pp:'gefunden',r:'einen Schatz'},
 {inf:'springen',p:'springt',pt:'sprang',aux:'ist',aux2:'war',pp:'gesprungen',r:'über den Bach'},
 {inf:'trinken',p:'trinkt',pt:'trank',aux:'hat',aux2:'hatte',pp:'getrunken',r:'einen Kakao'},
 {inf:'gehen',p:'geht',pt:'ging',aux:'ist',aux2:'war',pp:'gegangen',r:'nach Hause'},
];
const NAMES=['Lena','Tom','Mia','Paul','Oma','Der Hund','Felix','Sara'];
function satz(v,t,s){switch(t){case 'Präsens':return `${s} ${v.p} ${v.r}.`;case 'Präteritum':return `${s} ${v.pt} ${v.r}.`;case 'Perfekt':return `${s} ${v.aux} ${v.r} ${v.pp}.`;case 'Futur':return `${s} wird ${v.r} ${v.inf}.`;case 'Plusquamperfekt':return `${s} ${v.aux2} ${v.r} ${v.pp}.`}}
function zeit(tenses){const v=pick(VERBS),s=pick(NAMES),t=pick(tenses);
  const r=Math.random();
  if(r<.5)return mc(`In welcher Zeitform steht der Satz?\n„${satz(v,t,s)}“`,t,tenses.filter(x=>x!==t),`Merkmal: ${t==='Perfekt'?'haben/sein + Partizip':t==='Plusquamperfekt'?'hatte/war + Partizip':t==='Futur'?'werden + Grundform':t==='Präteritum'?'Vergangenheitsform des Verbs':'Gegenwart'}.`);
  if(r<.8){const t2=pick(tenses.filter(x=>x!=='Präsens'));return mc(`Setze ins ${t2}: „${satz(v,'Präsens',s)}“`,satz(v,t2,s),tenses.filter(x=>x!==t2).map(x=>satz(v,x,s)),`${t2}: ${satz(v,t2,s)}`)}
  return inp(`Wie heißt das Präteritum von „${v.inf}“ (er/sie/es …)?`,v.pt,'text',`${v.inf} → er/sie/es ${v.pt}`)}
const SG=[["Der Hund","frisst","den Knochen"],["Meine Schwester","liest","ein Buch"],["Der Lehrer","erklärt","die Aufgabe"],["Die Kinder","bauen","eine Sandburg"],["Opa","repariert","das Fahrrad"],["Die Katze","fängt","eine Maus"],["Wir","besuchen","unsere Tante"],["Der Bäcker","backt","frisches Brot"],["Emma","gewinnt","das Rennen"],["Die Klasse","plant","einen Ausflug"]];
function satzglied(withObj){const [s,p,o]=pick(SG);const sent=`${s} ${p} ${o}.`;const which=pick(withObj?['Subjekt','Prädikat','Objekt']:['Subjekt','Prädikat']);const ans=which==='Subjekt'?s:which==='Prädikat'?p:o;
  return mc(`Satz: „${sent}“\nWas ist das ${which}${which==='Objekt'?' (wen oder was?)':''}?`,ans,[s,p,o].filter(x=>x!==ans).concat([pick(['schnell','gestern','im Park'])]),which==='Subjekt'?`Wer oder was ${p}? → ${s}`:which==='Prädikat'?`Das Prädikat ist das Verb: ${p}`:`Wen oder was ${p} ${s.toLowerCase()}? → ${o}`)}
const ADV=[["Wir treffen uns morgen im Park.","morgen","Zeit"],["Wir treffen uns morgen im Park.","im Park","Ort"],["Wegen des Regens bleiben wir drinnen.","Wegen des Regens","Grund"],["Sie singt wunderschön.","wunderschön","Art und Weise"],["Am Abend lesen wir ein Buch.","Am Abend","Zeit"],["Der Ball liegt unter dem Tisch.","unter dem Tisch","Ort"],["Aus Angst rannte er weg.","Aus Angst","Grund"],["Mit großer Freude öffnete sie das Geschenk.","Mit großer Freude","Art und Weise"],["Seit drei Jahren spiele ich Gitarre.","Seit drei Jahren","Zeit"],["In Wien gibt es viele Museen.","In Wien","Ort"]];
function adverbial(){const [s,part,a]=pick(ADV);return mc(`„${s}“\nWelche Adverbiale ist „${part}“?`,a,['Zeit','Ort','Grund','Art und Weise'].filter(x=>x!==a),`Frage: ${a==='Zeit'?'Wann?':a==='Ort'?'Wo?':a==='Grund'?'Warum?':'Wie?'} → ${part}`)}
const DASS=[["Ich hoffe, ___ du morgen kommst.","dass"],["___ Buch auf dem Tisch gehört mir.","Das"],["Er weiß, ___ er gewonnen hat.","dass"],["Das Haus, ___ dort steht, ist alt.","das"],["Es ist schön, ___ die Sonne scheint.","dass"],["Siehst du ___ Pferd dort?","das"],["Mama sagt, ___ wir leise sein sollen.","dass"],["Ich mag ___ Lied, ___ du singst.","das … das"],["Ich glaube, ___ ___ stimmt.","dass … das"],["___ du mitkommst, freut mich.","Dass"]];
function dassq(){const [s,a]=pick(DASS);const opts=a.includes('…')?['das … das','dass … das','das … dass','dass … dass']:[a,a.toLowerCase()==='dass'?(a[0]==='D'?'Das':'das'):(a[0]==='D'?'Dass':'dass')];return mc(`Ergänze: ${s}`,a,opts,`Tipp: Kannst du „dieses/welches“ einsetzen? Dann „das“. Sonst „dass“.`)}
const SSZ=[["Stra_e","ß"],["Wa_er","ss"],["Fu_","ß"],["Schlo_","ss"],["gro_","ß"],["Ta_e","ss"],["flei_ig","ß"],["Kla_e","ss"],["Grü_e","ß"],["mü_en","ss"],["Spa_","ß"],["Flu_","ss"],["hei_","ß"],["Ka_e","ss"],["drau_en","ß"],["bi_chen","ss"]];
const IEI=[["L_d","ie"],["T_ger","i"],["sp_len","ie"],["Kr_mi","i"],["W_se","ie"],["Kino (K_no)","i"],["schl_ßen","ie"],["B_ber","i"],["n_mand","ie"],["Mus_k","i"]];
function recht(){return pick([
  ()=>{const [w,a]=pick(SSZ);return mc(`ss oder ß? ${w}`,a,[a==='ss'?'ß':'ss','s'],`Nach kurzem Vokal ss, nach langem Vokal oder au/ei/eu ß: ${w.replace('_',a)}`)},
  ()=>{const [w,a]=pick(IEI);return mc(`i oder ie? ${w}`,a,[a==='i'?'ie':'i','ih'],`Richtig: ${w.replace('_',a).replace(/ \(.+\)/,'')}`)},
  dassq,
  ()=>{const s=pick([["Beim ___ bin ich schnell.","Laufen","laufen"],["Das ___ macht Spaß.","Schwimmen","schwimmen"],["Wir wollen heute ___.","malen","Malen"],["Etwas ___ ist passiert.","Gutes","gutes"],["Er kann gut ___.","singen","Singen"]]);return mc(`Groß oder klein?\n${s[0]}`,s[1],[s[2]],`Mit Begleiter (beim, das, etwas) wird das Wort zum Nomen → groß.`)}])()}
const FAELLE=[["Ich gebe dem Hund einen Knochen.","dem Hund","Dativ"],["Ich gebe dem Hund einen Knochen.","einen Knochen","Akkusativ"],["Das Auto des Lehrers ist rot.","des Lehrers","Genitiv"],["Der Vogel singt.","Der Vogel","Nominativ"],["Wir besuchen die Oma.","die Oma","Akkusativ"],["Sie hilft ihrem Bruder.","ihrem Bruder","Dativ"],["Die Farbe des Hauses gefällt mir.","des Hauses","Genitiv"],["Die Sonne scheint hell.","Die Sonne","Nominativ"],["Er schenkt seiner Mutter Blumen.","seiner Mutter","Dativ"],["Ich sehe den Mond.","den Mond","Akkusativ"]];
function fall(){const [s,w,f]=pick(FAELLE);return mc(`„${s}“\nIn welchem Fall steht „${w}“?`,f,['Nominativ','Genitiv','Dativ','Akkusativ'].filter(x=>x!==f),`Frage: ${({Nominativ:'Wer oder was?',Genitiv:'Wessen?',Dativ:'Wem?',Akkusativ:'Wen oder was?'})[f]} → ${f}`)}
const KOMMA=[["Ich bleibe zu Hause, weil ich krank bin.",["Ich bleibe zu Hause weil, ich krank bin.","Ich bleibe, zu Hause weil ich krank bin.","Ich bleibe zu Hause weil ich, krank bin."]],["Wir kaufen Äpfel, Birnen und Bananen.",["Wir kaufen Äpfel, Birnen, und Bananen.","Wir kaufen, Äpfel Birnen und Bananen.","Wir kaufen Äpfel Birnen, und Bananen."]],["Der Mann, der dort steht, ist mein Onkel.",["Der Mann der dort steht, ist mein Onkel.","Der Mann, der dort steht ist mein Onkel.","Der Mann der, dort steht ist mein Onkel."]],["Sie sagt, dass sie morgen kommt.",["Sie sagt dass, sie morgen kommt.","Sie sagt dass sie, morgen kommt.","Sie, sagt dass sie morgen kommt."]],["Obwohl es regnet, gehen wir spazieren.",["Obwohl, es regnet gehen wir spazieren.","Obwohl es regnet gehen, wir spazieren.","Obwohl es, regnet gehen wir spazieren."]],["Wenn du Zeit hast, ruf mich an.",["Wenn du Zeit hast ruf, mich an.","Wenn, du Zeit hast ruf mich an.","Wenn du, Zeit hast ruf mich an."]]];
function komma(){const [c,w]=pick(KOMMA);return mc(`Welcher Satz hat die richtigen Beistriche?`,c,w,`Nebensätze (weil, dass, obwohl, wenn, der/die/das …) werden mit Beistrich abgetrennt; bei Aufzählungen vor „und“ kein Beistrich.`)}
const PASSIV=[["Der Kuchen wird von Oma gebacken.","Passiv"],["Oma backt den Kuchen.","Aktiv"],["Das Fenster wurde geöffnet.","Passiv"],["Die Schüler schreiben einen Test.","Aktiv"],["Der Brief wird morgen verschickt.","Passiv"],["Der Hund bellt laut.","Aktiv"],["Das Auto wurde repariert.","Passiv"],["Paul repariert sein Rad.","Aktiv"]];
const PASSIV2=[["Der Lehrer korrigiert die Hefte.","Die Hefte werden vom Lehrer korrigiert.",["Die Hefte korrigieren den Lehrer.","Der Lehrer wird die Hefte korrigiert.","Die Hefte wurden den Lehrer korrigiert."]],["Mama kocht die Suppe.","Die Suppe wird von Mama gekocht.",["Die Suppe kocht Mama.","Mama wird die Suppe gekocht.","Die Suppe hat Mama gekocht."]],["Die Feuerwehr löscht den Brand.","Der Brand wird von der Feuerwehr gelöscht.",["Der Brand löscht die Feuerwehr.","Die Feuerwehr wird den Brand gelöscht.","Der Brand hat die Feuerwehr gelöscht."]]];
function passiv(){if(Math.random()<.6){const [s,a]=pick(PASSIV);return mc(`Aktiv oder Passiv?\n„${s}“`,a,[a==='Aktiv'?'Passiv':'Aktiv'],a==='Passiv'?'Passiv erkennst du an werden/wurde + Partizip.':'Im Aktiv handelt das Subjekt selbst.')}const [s,a,w]=pick(PASSIV2);return mc(`Wandle ins Passiv um:\n„${s}“`,a,w,`Passiv: ${a}`)}
const REDE=[["Tom sagt: „Ich bin müde.“","Tom sagt, er sei müde.",["Tom sagt, ich bin müde.","Tom sagt, er ist müde gewesen.","Tom sagt, er wäre gewesen müde."]],["Lisa sagt: „Ich habe Hunger.“","Lisa sagt, sie habe Hunger.",["Lisa sagt, ich habe Hunger.","Lisa sagt, sie hat gehabt Hunger.","Lisa sagt: sie habe Hunger."]],["Der Trainer sagt: „Wir gewinnen heute.“","Der Trainer sagt, sie gewönnen heute.",["Der Trainer sagt, wir gewinnen heute.","Der Trainer sagt, sie gewinnt heute.","Der Trainer sagte wir gewinnen."]],["Mama sagt: „Ich komme später.“","Mama sagt, sie komme später.",["Mama sagt, ich komme später.","Mama sagt, sie kommt gekommen später.","Mama sagt sie, komme später."]]];
function rede(){const [s,a,w]=pick(REDE);return mc(`Welche indirekte Rede ist richtig?\n${s}`,a,w,`Indirekte Rede: Pronomen anpassen und Konjunktiv I verwenden (er sei, sie habe, sie komme).`)}

/* ============ Content: Englisch ============ */
const VOC_E={
 colours:[['red','rot'],['blue','blau'],['green','grün'],['yellow','gelb'],['black','schwarz'],['white','weiß'],['pink','rosa'],['brown','braun'],['purple','lila'],['grey','grau']],
 animals:[['dog','Hund'],['cat','Katze'],['horse','Pferd'],['cow','Kuh'],['bird','Vogel'],['mouse','Maus'],['rabbit','Hase'],['pig','Schwein'],['sheep','Schaf'],['elephant','Elefant'],['frog','Frosch'],['duck','Ente']],
 food:[['apple','Apfel'],['bread','Brot'],['milk','Milch'],['cheese','Käse'],['egg','Ei'],['water','Wasser'],['cake','Kuchen'],['sausage','Wurst'],['potato','Kartoffel'],['orange juice','Orangensaft'],['strawberry','Erdbeere']],
 school:[['pencil','Bleistift'],['ruler','Lineal'],['rubber','Radiergummi'],['schoolbag','Schultasche'],['teacher','Lehrer/in'],['scissors','Schere'],['pencil case','Federpennal'],['glue','Kleber'],['exercise book','Heft']],
 family:[['mother','Mutter'],['father','Vater'],['sister','Schwester'],['brother','Bruder'],['grandma','Oma'],['grandpa','Opa'],['aunt','Tante'],['uncle','Onkel'],['cousin','Cousin/Cousine']],
 body:[['head','Kopf'],['leg','Bein'],['foot','Fuß'],['eye','Auge'],['ear','Ohr'],['nose','Nase'],['mouth','Mund'],['hair','Haare'],['knee','Knie'],['shoulder','Schulter']],
 time:[['Monday','Montag'],['Tuesday','Dienstag'],['Wednesday','Mittwoch'],['Thursday','Donnerstag'],['Friday','Freitag'],['Saturday','Samstag'],['Sunday','Sonntag'],['January','Jänner'],['summer','Sommer'],['winter','Winter']],
 weather:[['sunny','sonnig'],['rainy','regnerisch'],['windy','windig'],['snowy','verschneit'],['cloudy','bewölkt'],['foggy','neblig'],['hot','heiß'],['cold','kalt']],
};
const VOC_H={
 holidays:[['luggage','Gepäck'],['journey','Reise'],['ticket','Fahrkarte'],['airport','Flughafen'],['beach','Strand'],['suitcase','Koffer'],['sightseeing','Besichtigung'],['passport','Reisepass'],['abroad','im Ausland']],
 feelings:[['angry','wütend'],['proud','stolz'],['worried','besorgt'],['surprised','überrascht'],['bored','gelangweilt'],['excited','aufgeregt'],['nervous','nervös'],['lonely','einsam'],['jealous','eifersüchtig']],
 house:[['kitchen','Küche'],['bedroom','Schlafzimmer'],['stairs','Treppe'],['ceiling','Zimmerdecke'],['floor','Fußboden'],['cupboard','Schrank'],['bathroom','Badezimmer'],['neighbour','Nachbar']],
 town:[['library','Bücherei'],['hospital','Krankenhaus'],['police station','Polizeistation'],['chemist\'s','Apotheke/Drogerie'],['traffic lights','Ampel'],['crossroads','Kreuzung'],['bridge','Brücke']],
 freetime:[['to go shopping','einkaufen gehen'],['to hang out','abhängen'],['competition','Wettbewerb'],['to win','gewinnen'],['to practise','üben'],['instrument','Instrument'],['tournament','Turnier']],
};
function vocab(V){const cat=pick(Object.keys(V));const list=V[cat];const [en,de]=pick(list);const others=shuffle(list.filter(x=>x[0]!==en)).slice(0,3);
  const r=Math.random();
  if(r<.4)return mc(`What's „${de}“ in English?`,en,others.map(o=>o[0]),`${de} = ${en}`);
  if(r<.8)return mc(`Was heißt „${en}“ auf Deutsch?`,de,others.map(o=>o[1]),`${en} = ${de}`);
  return inp(`Schreib auf Englisch: „${de}“`,en,'text',`${de} = ${en}`,en.startsWith('to ')?[en.slice(3)]:[])}
const ONES=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numWord(n){if(n<20)return ONES[n];if(n===100)return 'one hundred';const t=Math.floor(n/10),o=n%10;return TENS[t]+(o?'-'+ONES[o]:'')}
function numbers(){const n=ri(13,100);if(Math.random()<.5)return inp(`Write ${n} in English words.`,numWord(n),'text',`${n} = ${numWord(n)}`,[numWord(n).replace('-',' '),n===100?'a hundred':''].filter(Boolean));const w=near(n,9).filter(x=>x>12&&x<=100);return mc(`Which number is „${numWord(n)}“?`,n,w.length===3?w:[n+1,n+2,n+10],`${numWord(n)} = ${n}`)}
function beverb(){const s=pick([['I','am'],['He','is'],['She','is'],['It','is'],['We','are'],['You','are'],['They','are'],['My dog','is'],['Anna and Ben','are'],['The cats','are']]);const rest=pick(['happy','at school','tired','in the garden','ten years old','hungry']);return mc(`${s[0]} ___ ${rest}.`,s[1],['am','is','are'].filter(x=>x!==s[1]),`${s[0]} → ${s[1]}`)}
const PLUR=[['dog','dogs'],['child','children'],['mouse','mice'],['man','men'],['woman','women'],['foot','feet'],['tooth','teeth'],['box','boxes'],['bus','buses'],['baby','babies'],['party','parties'],['sheep','sheep'],['knife','knives'],['tomato','tomatoes'],['book','books'],['fish','fish']];
function plural(){const [s,p]=pick(PLUR);return inp(`Plural: one ${s} – two …`,p,'text',`one ${s} – two ${p}`)}
const S3=[['play','plays'],['watch','watches'],['go','goes'],['have','has'],['fly','flies'],['read','reads'],['wash','washes'],['do','does'],['swim','swims'],['study','studies'],['like','likes']];
function thirdS(){const [b,f]=pick(S3);const s=pick(['She','He','My sister','Tom','Our cat']);const rest={play:'football',watch:'TV',go:'to school',have:'a bike',fly:'a kite',read:'comics',wash:'the car',do:'her homework',swim:'very fast',study:'English',like:'pizza'}[b];return inp(`${s} ___ (${b}) ${rest}.`,f,'text',`he/she/it: Verb + -s → ${f}`)}
const IRR=[['go','went','gone'],['see','saw','seen'],['buy','bought','bought'],['eat','ate','eaten'],['take','took','taken'],['come','came','come'],['write','wrote','written'],['swim','swam','swum'],['drink','drank','drunk'],['give','gave','given'],['make','made','made'],['find','found','found'],['think','thought','thought'],['catch','caught','caught'],['teach','taught','taught'],['bring','brought','brought'],['run','ran','run'],['sing','sang','sung'],['speak','spoke','spoken'],['fly','flew','flown'],['know','knew','known'],['begin','began','begun'],['break','broke','broken'],['forget','forgot','forgotten'],['leave','left','left'],['lose','lost','lost'],['meet','met','met'],['sleep','slept','slept'],['tell','told','told'],['win','won','won'],['be','was/were','been'],['have','had','had'],['do','did','done'],['get','got','got']];
const REG=[['play','played'],['stop','stopped'],['try','tried'],['study','studied'],['plan','planned'],['visit','visited'],['carry','carried'],['like','liked']];
function past(){const r=Math.random();if(r<.4){const [b,p]=pick(IRR);return inp(`Simple past von „${b}“?`,p,'text',`${b} → ${p}`,p.split('/'))}
  if(r<.6){const [b,p]=pick(REG);return inp(`Simple past von „${b}“?`,p,'text',`Regelmäßig: ${b} → ${p}`)}
  const s=pick([["Yesterday we ___ (go) to the cinema.","went"],["Last summer I ___ (swim) in the sea.","swam"],["She ___ (buy) a new phone last week.","bought"],["We ___ (eat) pizza on Friday.","ate"],["Tom ___ (not / come) to school yesterday.","didn't come"],["___ you ___ (see) the film? (Schreib: Did … see)","Did see"],["They ___ (play) tennis two days ago.","played"],["I ___ (be) at home last night.","was"]]);
  return inp(s[0],s[1],'text',`Simple past: ${s[1]}`,s[1]==="didn't come"?['did not come']:[])}
const PROG=[["Look! The baby ___ (sleep).","is sleeping",["sleeps","sleep","is sleep"]],["I usually ___ (walk) to school.","walk",["am walking","walks","walking"]],["Listen! Someone ___ (sing).","is singing",["sings","sing","singing"]],["My dad ___ (work) in an office.","works",["is working","work","working"]],["Right now we ___ (have) lunch.","are having",["have","has","having"]],["She never ___ (drink) coffee.","drinks",["is drinking","drink","drinking"]],["What ___ you ___ (do) at the moment?","are … doing",["do … do","does … doing","are … do"]],["Every Sunday they ___ (visit) their grandma.","visit",["are visiting","visits","visiting"]]];
function prog(){const [s,a,w]=pick(PROG);return mc(s,a,w,`Signalwörter: now, look, listen, at the moment → present progressive; usually, never, every … → simple present`)}
const ADJ=[['big','bigger','biggest'],['small','smaller','smallest'],['fast','faster','fastest'],['tall','taller','tallest'],['happy','happier','happiest'],['easy','easier','easiest'],['hot','hotter','hottest'],['good','better','best'],['bad','worse','worst'],['beautiful','more beautiful','most beautiful'],['interesting','more interesting','most interesting'],['expensive','more expensive','most expensive'],['nice','nicer','nicest'],['funny','funnier','funniest'],['old','older','oldest']];
function compar(){const [b,c,s]=pick(ADJ);if(Math.random()<.5)return inp(`Comparative: ${b} → …`,c,'text',`${b} – ${c} – ${s}`);return inp(`Superlative: ${b} → the …`,s,'text',`${b} – ${c} – ${s}`,['the '+s])}
const SOMEANY=[["There isn't ___ milk left.","any"],["Can I have ___ water, please?","some"],["Are there ___ apples in the bag?","any"],["I've got ___ new games.","some"],["We don't have ___ homework today.","any"],["Would you like ___ cake?","some"],["She hasn't got ___ brothers.","any"],["There are ___ children in the park.","some"]];
function someany(){const [s,a]=pick(SOMEANY);return mc(s,a,[a==='some'?'any':'some'],`Positive Sätze & höfliche Fragen (Would you like …?) → some; Verneinungen & Fragen → any`)}
function muchmany(){const u=['water','money','time','milk','homework','information','sugar','fun'],c=['apples','friends','books','cars','people','questions','sweets','hours'];const isU=Math.random()<.5;const n=pick(isU?u:c);return mc(`How ___ ${n} do you have?`,isU?'much':'many',[isU?'many':'much'],isU?`„${n}“ ist nicht zählbar → much`:`„${n}“ ist zählbar → many`)}
const GOING=[["Look at the clouds! It ___ rain.","is going to",["are going to","going to","goes to"]],["We ___ visit London next summer.","are going to",["is going to","am going to","going"]],["I ___ watch a film tonight.","am going to",["is going to","are going to","go to"]],["What ___ you ___ do at the weekend?","are … going to",["is … going to","do … going","are … go to"]]];
function going(){const [s,a,w]=pick(GOING);return mc(s,a,w,`going to-future: am/is/are + going to + Grundform`)}
const QW=[["___ do you live? – In Linz.","Where"],["___ is your birthday? – In May.","When"],["___ is that girl? – That's my sister.","Who"],["___ are you sad? – Because I lost my key.","Why"],["___ old are you? – I'm twelve.","How"],["___ do you like best, tea or juice?","Which"],["___ is your favourite food? – Pizza.","What"],["___ bag is this? – It's Tom's.","Whose"]];
function qwords(){const [s,a]=pick(QW);return mc(s,a,['Where','When','Who','Why','How','What','Which','Whose'].filter(x=>x!==a).sort(()=>Math.random()-.5).slice(0,3),`${a} passt zur Antwort.`)}
function presperf(){const [b,,pp]=pick(IRR);const s=pick(['I have never','She has already','We have just','Have you ever']);return inp(`${s} ___ (${b}) … ?\nSchreib nur die Verbform.`,pp,'text',`Present perfect: have/has + 3. Form → ${b} – ${pp}`)}

/* ============ Kids & Topics ============ */
const KIDS={
 emma:{name:'Emma',ava:'🦊',grade:'4. Klasse Volksschule',desc:'4. Klasse Volksschule in Österreich, sehr gute Schülerin (Note 1), möchte gerne gefordert werden',levels:{mathe:'Volksschule',deutsch:'Volksschule',englisch:'Volksschule'}},
 hannah:{name:'Hannah',ava:'🐼',grade:'2. Klasse Mittelschule',desc:'2. Klasse Mittelschule in Österreich',levels:{mathe:'Standard AHS',deutsch:'Standard',englisch:'Standard'}},
};
const DEFAULT_BOOKS={emma:{deutsch:'Buntspecht Deutsch 4 (Buch + Arbeitsheft)',mathe:'Denken und Rechnen 4 (Arbeitsbuch + Arbeitsheft)',englisch:''},hannah:{deutsch:'',mathe:'',englisch:''}};
const bookOf=(kid,subj)=>{const b=S.settings.books&&S.settings.books[kid];return b&&typeof b[subj]==='string'?b[subj]:(DEFAULT_BOOKS[kid][subj]||'')};
const SUBJ={mathe:{t:'Mathematik',e:'🔢'},deutsch:{t:'Deutsch',e:'📖'},englisch:{t:'Englisch',e:'🌍'}};
const TOPICS={
 emma:{
  mathe:[{k:'stellen',t:'Zahlenraum bis 1 Million',g:M.stellen},{k:'runden',t:'Runden',g:M.runden},{k:'add',t:'Schriftlich addieren',g:M.add},{k:'sub',t:'Schriftlich subtrahieren',g:M.sub},{k:'mul',t:'Schriftlich multiplizieren',g:M.mul},{k:'div',t:'Dividieren (einstellig)',g:M.div},{k:'masse',t:'Maße & Einheiten',g:M.masse},{k:'sach',t:'Sachaufgaben',g:M.sach},{k:'geo',t:'Umfang & Fläche',g:M.geo},{k:'div2',t:'Dividieren (zweistellig)',g:M.div2,profi:1},{k:'pklammer',t:'Klammern & Rechenregeln',g:M.pklammer,profi:1},{k:'pbrueche',t:'Brüche & Dezimalzahlen',g:M.pbrueche,profi:1}],
  deutsch:[{k:'wortart',t:'Wortarten',g:()=>wortart(['Nomen','Verb','Adjektiv'])},{k:'zeit',t:'Zeitformen',g:()=>zeit(['Präsens','Präteritum','Perfekt','Futur'])},{k:'satzglied',t:'Satzglieder',g:()=>satzglied(false)},{k:'recht',t:'Rechtschreibung',g:recht},{k:'dass',t:'das oder dass',g:dassq},{k:'fall',t:'Die 4 Fälle',g:fall,profi:1},{k:'objekt',t:'Satzglieder mit Objekt',g:()=>satzglied(true),profi:1}],
  englisch:[{k:'vocab',t:'Vocabulary',g:()=>vocab(VOC_E)},{k:'numbers',t:'Numbers',g:numbers},{k:'be',t:'am / is / are',g:beverb},{k:'plural',t:'Plural',g:plural},{k:'third',t:'he/she/it + s',g:thirdS,profi:1},{k:'past',t:'Simple past',g:past,profi:1}],
 },
 hannah:{
  mathe:[{k:'bradd',t:'Brüche addieren & subtrahieren',g:M.bradd},{k:'brmul',t:'Brüche multiplizieren & dividieren',g:M.brmul},{k:'brkuerz',t:'Kürzen & Umwandeln',g:M.brkuerz},{k:'dezi',t:'Dezimalzahlen',g:M.dezi},{k:'teil',t:'Teilbarkeit, ggT & kgV',g:M.teil},{k:'proz',t:'Prozentrechnung',g:M.proz},{k:'propo',t:'Direkte & indirekte Proportionalität',g:M.propo},{k:'glei',t:'Gleichungen',g:M.glei},{k:'terme',t:'Terme',g:M.terme},{k:'winkel',t:'Winkel, Dreiecke & Vierecke',g:M.winkel},{k:'flaech',t:'Flächen & Volumen',g:M.flaech},{k:'pneg',t:'Negative Zahlen',g:M.pneg,profi:1},{k:'ppot',t:'Potenzen & Wurzeln',g:M.ppot,profi:1}],
  deutsch:[{k:'wortart',t:'Wortarten',g:()=>wortart(['Nomen','Verb','Adjektiv','Pronomen','Präposition','Konjunktion','Adverb'])},{k:'zeit',t:'Zeitformen',g:()=>zeit(['Präsens','Präteritum','Perfekt','Plusquamperfekt','Futur'])},{k:'fall',t:'Die 4 Fälle',g:fall},{k:'satzglied',t:'Satzglieder',g:()=>satzglied(true)},{k:'adverbial',t:'Adverbiale Bestimmungen',g:adverbial},{k:'dass',t:'das oder dass',g:dassq},{k:'komma',t:'Beistrichsetzung',g:komma},{k:'recht',t:'Rechtschreibung',g:recht},{k:'passiv',t:'Aktiv & Passiv',g:passiv,profi:1},{k:'rede',t:'Indirekte Rede',g:rede,profi:1}],
  englisch:[{k:'past',t:'Simple past',g:past},{k:'prog',t:'Simple present vs. progressive',g:prog},{k:'going',t:'going to-future',g:going},{k:'compar',t:'Comparison of adjectives',g:compar},{k:'someany',t:'some / any',g:someany},{k:'muchmany',t:'much / many',g:muchmany},{k:'qwords',t:'Question words',g:qwords},{k:'vocab',t:'Vocabulary',g:()=>vocab(VOC_H)},{k:'presperf',t:'Present perfect',g:presperf,profi:1}],
 },
};
const findTopic=(kid,subj,k)=>TOPICS[kid][subj].find(t=>t.k===k);

/* ============ Gamification ============ */
const AVATARS=[['🦊',0],['🐼',0],['🐱',20],['🐸',30],['🦄',50],['🐙',60],['🦁',80],['🐉',100],['🤖',120],['🚀',150],['🦖',180],['👑',250]];
const BADGES=[
 {k:'first',e:'🌱',t:'Erster Schritt',d:'Erste Übung geschafft'},
 {k:'perfect',e:'💎',t:'Fehlerfrei',d:'Eine Übung mit 100 %'},
 {k:'combo5',e:'🔥',t:'Feuer-Combo',d:'5 richtig in Folge'},
 {k:'combo10',e:'☄️',t:'Mega-Combo',d:'10 richtig in Folge'},
 {k:'streak3',e:'📅',t:'3 Tage dran',d:'3 Tage hintereinander geübt'},
 {k:'streak7',e:'🏆',t:'Wochen-Held',d:'7 Tage hintereinander geübt'},
 {k:'c100',e:'💯',t:'100 richtige',d:'100 richtige Antworten'},
 {k:'c500',e:'🌟',t:'500 richtige',d:'500 richtige Antworten'},
 {k:'profi',e:'🚀',t:'Über den Wolken',d:'Profi-Thema mit mind. 80 %'},
 {k:'exam',e:'🎓',t:'Schularbeit-ready',d:'Schularbeit-Training mit Note 1 oder 2'},
 {k:'ai',e:'✨',t:'Neugierig',d:'Erste KI-Aufgaben gelöst'},
 {k:'all3',e:'🧭',t:'Allrounder',d:'In allen 3 Fächern geübt'},
];
const DAILY_GOAL=60;
const levelOf=xp=>Math.floor(Math.sqrt(xp/40))+1;
const xpFor=l=>40*(l-1)*(l-1);
const TITLES=['Entdecker:in','Schlaukopf','Rätselprofi','Wissensjäger:in','Superhirn','Meister:in','Legende'];
const titleOf=l=>TITLES[Math.min(TITLES.length-1,Math.floor((l-1)/3))];
function defKid(id){return {xp:0,coins:0,streak:0,lastDay:'',dayXp:{},badges:[],stats:{},sessions:[],exams:[],ava:KIDS[id].ava,owned:[KIDS[id].ava],totalCorrect:0,bestCombo:0}}
function normKid(id,d){const base=defKid(id);d=Object.assign(base,d||{});for(const k of ['badges','sessions','exams','owned'])if(!Array.isArray(d[k]))d[k]=base[k];if(typeof d.stats!=='object'||!d.stats)d.stats={};if(typeof d.dayXp!=='object'||!d.dayXp)d.dayXp={};return d}

/* ============ State & Storage (eigener Server) ============ */
const S={screen:'boot',kid:null,subj:null,quiz:null,parentKid:'emma',parent:false,pinIn:'',online:navigator.onLine,muted:lsGet('lq_muted',false),
  ai:{enabled:false,limit:0,used:{}},rev:lsGet('lq_rev',{emma:0,hannah:0}),dirty:lsGet('lq_dirty',{}),
  data:{emma:normKid('emma',lsGet('lq_kid_emma')),hannah:normKid('hannah',lsGet('lq_kid_hannah'))},settings:Object.assign({books:{},pinIsDefault:false},lsGet('lq_settings',{}))};
async function api(method,url,body,signal){
  const r=await fetch(url,{method,headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin',signal});
  let data=null;try{data=await r.json()}catch(e){}
  if(r.status===401&&url!=='/api/login'&&url!=='/api/parent/unlock'){S.screen='login';render()}
  if(!r.ok){const e=new Error((data&&data.error)||('HTTP '+r.status));e.status=r.status;e.data=data;throw e}
  return data;
}
function persistLocal(){lsSet('lq_rev',S.rev);lsSet('lq_dirty',S.dirty)}
const saving={};
async function saveKid(id){
  lsSet('lq_kid_'+id,S.data[id]);S.dirty[id]=true;persistLocal();
  if(saving[id]){saving[id].again=true;return}
  saving[id]={again:false};
  try{
    do{saving[id].again=false;
      try{const r=await api('PUT','/api/kids/'+id,{baseRev:S.rev[id],data:S.data[id]});S.rev[id]=r.rev;delete S.dirty[id];persistLocal();setOnline(true)}
      catch(e){
        if(e.status===409&&e.data&&e.data.current){adoptKid(id,e.data.current);toast('Auf einem anderen Gerät wurde weitergelernt – Stand aktualisiert.');if(S.screen!=='quiz')render()}
        else if(!e.status){setOnline(false)}
        else console.warn('save',e);
        break;
      }
    }while(saving[id].again);
  }finally{delete saving[id]}
}
function adoptKid(id,cur){S.rev[id]=cur.rev||0;S.data[id]=normKid(id,cur.data);lsSet('lq_kid_'+id,S.data[id]);delete S.dirty[id];persistLocal()}
function setOnline(v){if(S.online!==v){S.online=v;if(S.screen!=='quiz'&&!isTyping())render()}}
async function syncState(){
  try{
    const st=await api('GET','/api/state');setOnline(true);
    S.settings={books:st.settings.books||{},pinIsDefault:!!st.settings.pinIsDefault};lsSet('lq_settings',S.settings);
    S.ai=st.ai||S.ai;
    for(const id of Object.keys(KIDS)){
      const cur=st.kids[id]||{rev:0,data:null};
      if(S.dirty[id]){ if(cur.rev===S.rev[id]) saveKid(id); else { adoptKid(id,cur); toast('Stand vom Server übernommen.'); } }
      else if(cur.rev!==S.rev[id]||!cur.data) { if(cur.data) adoptKid(id,cur); else if(cur.rev!==S.rev[id]) adoptKid(id,cur); }
    }
    return true;
  }catch(e){if(!e.status)setOnline(false);return e.status===401?'login':false}
}
async function init(){
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
  let me=null;
  try{me=await api('GET','/api/me')}catch(e){}
  if(me&&!me.loggedIn){S.screen='login';render();return}
  S.parent=!!(me&&me.parent);
  await syncState();
  S.screen='home';render();
}
window.addEventListener('online',()=>{S.online=true;syncState().then(()=>{if(S.screen!=='quiz'&&!isTyping())render()})});
window.addEventListener('offline',()=>setOnline(false));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S.screen!=='login'&&S.screen!=='quiz'&&S.screen!=='aiLoading')syncState().then(r=>{if(r===true&&!isTyping())render()})});

/* ============ Sound & FX ============ */
let actx=null;
function beep(type){if(S.muted)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const notes=type==='ok'?[660,880]:type==='win'?[523,659,784,1047]:[220,180];notes.forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type=type==='bad'?'sawtooth':'triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,actx.currentTime+i*.09);g.gain.exponentialRampToValueAtTime(.12,actx.currentTime+i*.09+.02);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+i*.09+.18);o.connect(g).connect(actx.destination);o.start(actx.currentTime+i*.09);o.stop(actx.currentTime+i*.09+.2)})}catch(e){}}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.createElement('div');c.className='confetti';const cols=['#FFC93C','#10C99A','#F0476F','#3BA7F0','#7C5CFF'];for(let i=0;i<70;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=pick(cols);p.style.animationDuration=(1.8+Math.random()*1.6)+'s';p.style.animationDelay=Math.random()*.5+'s';c.appendChild(p)}document.body.appendChild(c);setTimeout(()=>c.remove(),4200)}
function isTyping(){const a=document.activeElement;return a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||!!document.querySelector('.modal-bg')||!!document.querySelector('details[open]')}
function ask(msg,{input=false,ok='OK'}={}){return new Promise(res=>{const bg=document.createElement('div');bg.className='modal-bg';bg.innerHTML=`<div class="card modal" role="dialog" aria-modal="true"><p style="font-weight:800;margin:0 0 12px">${esc(msg)}</p>${input?'<input class="inp" id="mIn" autocomplete="off">':''}<div class="row" style="margin-top:14px"><button class="btn ghost block" data-m="0">Abbrechen</button><button class="btn block" data-m="1">${esc(ok)}</button></div></div>`;document.body.appendChild(bg);const i=bg.querySelector('#mIn');(i||bg.querySelector('[data-m="1"]')).focus();bg.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b&&e.target!==bg)return;e.stopPropagation();const yes=b&&b.dataset.m==='1';bg.remove();res(input?(yes?i.value:null):yes)})})}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}

/* ============ Render ============ */
function go(screen,extra){Object.assign(S,extra||{});S.screen=screen;render();window.scrollTo(0,0)}
function render(){
  document.body.dataset.kid=S.kid||'';
  const f={boot:vBoot,login:vLogin,home:vHome,kid:vKid,subject:vSubject,quiz:vQuiz,result:vResult,badges:vBadges,shop:vShop,examSetup:vExamSetup,aiLoading:vAiLoading,pin:vPin,parent:vParent}[S.screen]||vHome;
  $app.innerHTML=(!S.online&&S.screen!=='login'&&S.screen!=='boot'?'<div class="offline">Offline – du kannst weiter üben, gespeichert wird, sobald wieder Internet da ist.</div>':'')+f();
  const a=$app.querySelector('[autofocus]');if(a&&!('ontouchstart' in window))a.focus();
}
function topBar(title,back){return `<div class="topbar"><button class="icon-btn" data-a="${back}" aria-label="Zurück">←</button><h2>${title}</h2><button class="icon-btn" data-a="mute" aria-label="Ton an/aus">${S.muted?'🔇':'🔊'}</button></div>`}

const POWERED=`<footer class="powered"><a href="https://www.schwaiger-it.at" target="_blank" rel="noopener" aria-label="Schwaiger BUSINESS IT – Website öffnen"><span>powered by</span><img class="logo-dark" src="brand/schwaiger-logo.png" alt="Schwaiger BUSINESS IT" width="150" height="48"><img class="logo-light" src="brand/schwaiger-logo-light.png" alt="" width="150" height="48"></a></footer>`;
function vBoot(){return `<div class="loading"><div class="spinner">🦊</div></div>`}
function vLogin(){return `<div class="login"><div class="hero" style="text-align:center"><h1>Lern<span class="q">Quest</span></h1><p class="muted">Dieses Gerät einmalig anmelden</p></div>
  <div class="card stack"><div><label class="f" for="famPw">Familien-Passwort</label><input class="inp" id="famPw" type="password" autocomplete="current-password" autofocus></div>
  <button class="btn block" data-a="login">Anmelden</button><p class="note">Danach bleibt das Gerät ein halbes Jahr angemeldet.</p></div>${POWERED}</div>`}
function vHome(){
  return `<div class="hero"><h1>Lern<span class="q">Quest</span></h1><p class="muted">Wer lernt heute?</p></div>
  <div class="profiles">${['emma','hannah'].map(id=>{const d=S.data[id],l=levelOf(d.xp);return `<button class="profile ${id}" data-a="pickKid" data-id="${id}"><span class="blob"></span><span class="ava">${d.ava}</span><span><span class="name">${KIDS[id].name}</span><br><span class="meta">${KIDS[id].grade} · Level ${l} · 🔥 ${curStreak(d)}</span></span></button>`}).join('')}</div>
  <div class="parent-link"><button class="btn ghost small" data-a="toPin">👤 Eltern-Bereich</button></div>${POWERED}`;
}
function curStreak(d){if(!d.lastDay)return 0;const g=daysBetween(d.lastDay,today());return g<=1?d.streak:0}
function upcomingExams(d){return d.exams.filter(e=>daysBetween(today(),e.date)>=0).sort((a,b)=>a.date.localeCompare(b.date))}
function subjAcc(d,subj){let c=0,t=0;for(const [k,v] of Object.entries(d.stats))if(k.startsWith(subj+':')){c+=v.c;t+=v.t}return t?c/t:null}
function vKid(){
  const d=S.data[S.kid],K=KIDS[S.kid],l=levelOf(d.xp),lo=xpFor(l),hi=xpFor(l+1),dx=d.dayXp[today()]||0;
  const ex=upcomingExams(d);
  return `${topBar(K.name,'home')}
  <div class="card"><div class="kidhead"><div class="ava">${d.ava}</div><div style="flex:1;min-width:0"><div class="spread"><span class="lvl">Level ${l} · ${titleOf(l)}</span><span class="muted" style="font-weight:700;font-size:.9rem">${d.xp-lo}/${hi-lo} XP</span></div><div class="xpbar"><i style="width:${Math.min(100,(d.xp-lo)/(hi-lo)*100)}%"></i></div></div></div>
  <div class="chips"><span class="chip">🔥 ${curStreak(d)} Tage</span><span class="chip">🪙 ${d.coins}</span><span class="chip">🏅 ${d.badges.length}/${BADGES.length}</span><span class="chip">✅ ${d.totalCorrect}</span></div></div>
  <div class="card" style="margin-top:14px"><div class="goal"><div class="ring" style="--p:${Math.min(100,dx/DAILY_GOAL*100)}"><span>${Math.min(dx,DAILY_GOAL)}</span></div><div><h3>Tagesziel: ${DAILY_GOAL} XP</h3><div class="muted">${dx>=DAILY_GOAL?'Geschafft! Du bist spitze. 🎉':`Noch ${DAILY_GOAL-dx} XP – das ist ungefähr eine Übung.`}</div></div></div></div>
  ${ex.length?`<div class="card stack" style="margin-top:14px"><h3>Nächste Schularbeiten</h3>${ex.slice(0,3).map(e=>{const n=daysBetween(today(),e.date);return `<div class="exam"><div class="days">${n}<small>${n===1?'Tag':'Tage'}</small></div><div style="flex:1;min-width:0"><b>${SUBJ[e.subj].e} ${SUBJ[e.subj].t}</b><div class="muted" style="font-size:.9rem">${esc(examTopicsText(e))}</div></div><button class="btn small" data-a="startExam" data-id="${e.id}">Trainieren</button></div>`}).join('')}</div>`:''}
  <div class="subjects">${Object.keys(SUBJ).map(s=>{const acc=subjAcc(d,s);return `<button class="subject ${s}" data-a="pickSubj" data-s="${s}"><span class="emo">${SUBJ[s].e}</span><h3>${SUBJ[s].t}</h3><span class="lvltag">Niveau: ${K.levels[s]}${bookOf(S.kid,s)?'<br>📚 '+esc(bookOf(S.kid,s)):''}</span><div class="mini"><i style="width:${acc==null?0:Math.round(acc*100)}%"></i></div><span class="muted" style="font-size:.85rem;font-weight:700">${acc==null?'Noch nicht geübt':Math.round(acc*100)+' % richtig'}</span></button>`}).join('')}</div>
  <div class="navrow"><button class="btn sun" data-a="examNew">📝 Schularbeit</button><button class="btn ghost" data-a="go" data-to="badges">🏅 Abzeichen</button><button class="btn ghost" data-a="go" data-to="shop">🛍️ Shop</button></div>`;
}
function examTopicsText(e){const ts=(e.topics||[]).map(k=>findTopic(e.kid||S.kid,e.subj,k)?.t).filter(Boolean);return [ts.join(', '),e.note].filter(Boolean).join(' – ')||'Alle Themen'}
function stars(st){if(!st||st.t<3)return '☆☆☆';const r=st.c/st.t;return r>=.9?'⭐⭐⭐':r>=.75?'⭐⭐☆':r>=.5?'⭐☆☆':'☆☆☆'}
function vSubject(){
  const d=S.data[S.kid],list=TOPICS[S.kid][S.subj];
  const base=list.filter(t=>!t.profi),pro=list.filter(t=>t.profi);
  const row=t=>{const st=d.stats[S.subj+':'+t.k];return `<button class="topic" data-a="startTopic" data-k="${t.k}"><span class="t">${t.t}${t.profi?'<span class="profi-tag">Profi</span>':''}<small>${st?`${st.t} Aufgaben · ${Math.round(st.c/st.t*100)} %`:'Neu'}</small></span><span class="stars">${stars(st)}</span></button>`};
  const ai=S.ai.enabled&&S.online?aiLeft(S.kid):null;
  return `${topBar(SUBJ[S.subj].e+' '+SUBJ[S.subj].t,'kid')}
  <div class="card ai-card"><h3>✨ KI-Aufgaben</h3><p class="muted" style="margin:6px 0 12px">Claude erfindet neue Aufgaben genau für dein Niveau. Wähle ein Thema – oder schreib, was in der Schule gerade dran ist.</p>
  ${ai===null?`<p class="muted">${S.online?'KI ist am Server nicht eingerichtet.':'Ohne Internet gibt es keine KI-Aufgaben.'} Die normalen Übungen funktionieren trotzdem.</p>`:`
   <select class="inp" id="aiTopic" style="margin-bottom:10px"><option value="">Thema wählen …</option>${list.map(t=>`<option value="${t.k}">${t.t}${t.profi?' (Profi)':''}</option>`).join('')}</select>
   <input class="inp" id="aiFree" placeholder="… oder eigenes Thema, z.B. „Uhrzeit lesen“" style="margin-bottom:10px">
   <div class="seg" id="aiDiff" style="margin-bottom:12px;background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.3)">${['leicht','mittel','schwer'].map((x,i)=>`<button data-a="diff" data-v="${x}" class="${i===(S.kid==='emma'?2:1)?'on':''}" style="color:inherit">${x}</button>`).join('')}</div>
   <button class="btn sun block" data-a="startAI" ${ai<=0?'disabled':''}>${ai<=0?'Für heute aufgebraucht – morgen geht\'s weiter':'Neue Aufgaben erstellen'}</button><p class="muted" style="margin:8px 0 0;font-size:.85rem">Heute noch ${ai} KI-Runden</p>`}
  </div>
  <h3 style="margin:22px 0 10px">Themen</h3>${base.map(row).join('')}
  ${pro.length?`<h3 style="margin:22px 0 4px">🚀 Profi-Level</h3><p class="muted" style="margin:0 0 10px">Stoff über deiner Schulstufe – für echte Profis.</p>${pro.map(row).join('')}`:''}`;
}
function vQuiz(){
  const Q=S.quiz,q=Q.items[Q.i];const pct=Q.i/Q.items.length*100;
  const answered=Q.answered;
  let body='';
  if(q.type==='mc'){const two=q.options.every(o=>o.length<24);body=`<div class="opts ${two?'two':''}">${q.options.map((o,i)=>{let cls='';if(answered){if(o===q.answer)cls='ok';else if(o===Q.picked)cls='bad'}return `<button class="opt ${cls}" data-a="pick" data-i="${i}" ${answered?'disabled':''}>${esc(o)}</button>`}).join('')}</div>`}
  else{const im=q.check==='num'?'decimal':'text';body=`<input class="ans" id="ans" inputmode="${im}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Deine Antwort" value="${esc(Q.typed||'')}" ${answered?'disabled':''} autofocus>
   ${q.check==='frac'&&!answered?'<div class="keys"><button class="btn ghost small" data-a="key" data-v="/">/</button><button class="btn ghost small" data-a="key" data-v="-">−</button></div>':''}
   ${!answered?'<button class="btn block" style="margin-top:14px" data-a="submit">Prüfen</button>':''}`}
  const fb=answered?`<div class="feedback ${Q.lastOk?'ok':'bad'}"><h3>${Q.lastOk?pick(['Richtig! 🎉','Super! ✨','Genau so! 💪','Stark! 🔥']):'Nicht ganz 🤔'}</h3>${!Q.lastOk?`<div>Richtige Antwort: <b>${esc(dispAns(q))}</b></div>`:''}${q.expl?`<div class="muted" style="margin-top:4px">${esc(q.expl)}</div>`:''}<button class="btn ${Q.lastOk?'mint':''} block" style="margin-top:12px" data-a="next" autofocus>${Q.i+1<Q.items.length?'Weiter':'Ergebnis ansehen'}</button></div>`:'';
  return `<div class="qtop"><button class="icon-btn" data-a="quitQuiz" aria-label="Beenden">✕</button><div class="prog"><i style="width:${pct}%"></i></div><span class="combo ${Q.combo>=3?'hot':''}">${Q.combo>=2?'🔥'+Q.combo:''}</span></div>
  <p class="muted" style="margin:0 0 8px;font-weight:700">${esc(Q.label)} · Aufgabe ${Q.i+1}/${Q.items.length}${Q.isAI?' · ✨ KI':''}</p>
  <div class="card qcard"><div class="qtext">${esc(q.q)}</div>${body}</div>${fb}`;
}
function vResult(){
  const R=S.result;const pct=Math.round(R.correct/R.total*100);
  return `${topBar('Ergebnis','kid')}
  <div class="card" style="text-align:center"><div class="big">${R.correct}/${R.total}</div><p class="muted" style="font-weight:700">${pct} % richtig · ${esc(R.label)}</p>
  ${R.grade?`<div style="margin:14px 0"><div class="grade">${R.grade}</div><p class="muted">Prognose für die Schularbeit</p></div>`:''}
  <p style="font-size:1.1rem;font-weight:800">${pct===100?'Perfekt! Fehlerfrei! 💎':pct>=80?'Richtig stark! 🌟':pct>=60?'Gut gemacht – weiter so! 💪':'Dranbleiben – Übung macht den Meister! 🌱'}</p>
  <div class="chips" style="justify-content:center"><span class="chip">+${R.xp} XP</span><span class="chip">+${R.coins} 🪙</span>${R.bestCombo>=3?`<span class="chip">🔥 Combo ${R.bestCombo}</span>`:''}</div>
  ${R.levelUp?`<p style="font-weight:800;color:var(--accent);font-size:1.2rem">⬆️ Level ${R.levelUp} erreicht!</p>`:''}
  ${R.newBadges.length?`<div style="margin-top:14px"><h3>Neue Abzeichen</h3><div class="badges" style="margin-top:10px">${R.newBadges.map(b=>`<div class="badge"><div class="e">${b.e}</div><b>${b.t}</b><small>${b.d}</small></div>`).join('')}</div></div>`:''}
  </div>
  ${R.wrong.length?`<div class="card stack" style="margin-top:14px"><h3>Das schauen wir uns nochmal an</h3>${R.wrong.map(w=>`<div><b>${esc(w.q)}</b><div class="muted">Richtig: ${esc(dispAns(w))}${w.expl?' – '+esc(w.expl):''}</div></div>`).join('')}</div>`:''}
  <div class="row" style="margin-top:16px"><button class="btn block" data-a="again">Nochmal</button><button class="btn ghost block" data-a="go" data-to="kid">Fertig</button></div>`;
}
function vBadges(){const d=S.data[S.kid];return `${topBar('Abzeichen','kid')}<div class="badges">${BADGES.map(b=>`<div class="badge ${d.badges.includes(b.k)?'':'locked'}"><div class="e">${b.e}</div><b>${b.t}</b><small>${b.d}</small></div>`).join('')}</div>`}
function vShop(){const d=S.data[S.kid];return `${topBar('Avatar-Shop','kid')}<div class="card" style="margin-bottom:14px"><div class="spread"><b>Deine Münzen</b><span class="chip">🪙 ${d.coins}</span></div><p class="muted" style="margin:6px 0 0">Für jede richtige Antwort gibt's eine Münze, für Combos und perfekte Runden extra.</p></div>
  <div class="shop">${AVATARS.map(([e,p])=>{const own=d.owned.includes(e);return `<button class="shopitem ${d.ava===e?'cur':''}" data-a="buy" data-e="${e}" data-p="${p}"><span class="e">${e}</span><b style="font-size:.85rem">${d.ava===e?'Aktiv':own?'Wählen':'🪙 '+p}</b></button>`}).join('')}</div>`}
function vExamSetup(){
  const E=S.examDraft;const list=TOPICS[S.kid][E.subj];
  return `${topBar('📝 Schularbeit','kid')}
  <div class="card stack"><div><label class="f">Fach</label><div class="seg">${Object.keys(SUBJ).map(s=>`<button data-a="exSubj" data-s="${s}" class="${E.subj===s?'on':''}">${SUBJ[s].e} ${SUBJ[s].t}</button>`).join('')}</div></div>
  <div><label class="f">Welche Themen kommen?</label><div class="checks">${list.map(t=>`<label><input type="checkbox" data-a="exTopic" value="${t.k}" ${E.topics.includes(t.k)?'checked':''}> ${t.t}${t.profi?' 🚀':''}</label>`).join('')}</div></div>
  <div><label class="f" for="exNote">Was hat die Lehrerin noch gesagt? (optional)</label><input class="inp" id="exNote" value="${esc(E.note||'')}" placeholder="z.B. Textaufgaben mit Prozent, Seite 40–52"></div>
  <div><label class="f" for="exDate">Datum (optional – für den Countdown)</label><input class="inp" type="date" id="exDate" value="${E.date||''}"></div>
  <button class="btn sun block" data-a="examGo">Probe-Schularbeit starten</button>
  ${S.ai.enabled&&S.online&&aiLeft(S.kid)>0?'<p class="note">Mit KI: Claude erstellt eine Probe-Schularbeit mit 12 Aufgaben von leicht bis schwer.</p>':'<p class="note">12 Aufgaben aus den gewählten Themen.</p>'}
  </div>`;
}
function vAiLoading(){return `<div class="loading"><div class="spinner">${pick(['🧠','✨','🚀','🦉'])}</div><h2 style="margin-top:14px">${esc(S.aiMsg||'Claude denkt nach …')}</h2><p class="muted">Das dauert meistens 10–40 Sekunden.</p><button class="btn ghost small" data-a="cancelAI">Abbrechen</button></div>`}
function vPin(){return `${topBar('Eltern-Bereich','home')}<div class="card" style="text-align:center"><h3>PIN eingeben</h3><p class="muted">${S.settings.pinIsDefault?'Standard-PIN: 1234 – bitte im Eltern-Bereich ändern.':'Nur für Eltern.'}</p><div class="pin">${[0,1,2,3].map(i=>`<span class="${S.pinIn.length>i?'on':''}"></span>`).join('')}</div>
  <div class="pad">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n=>n===''?'<span></span>':`<button data-a="pin" data-v="${n}">${n}</button>`).join('')}</div></div>`}
function vParent(){
  if(!S.parent){setTimeout(()=>go('pin'));return ''}
  const id=S.parentKid,d=S.data[id],K=KIDS[id];
  const week=d.sessions.filter(s=>daysBetween(s.day,today())<7);
  const totC=Object.values(d.stats).reduce((a,v)=>a+v.c,0),totT=Object.values(d.stats).reduce((a,v)=>a+v.t,0);
  const topicRows=Object.entries(d.stats).map(([k,v])=>{const [s,t]=k.split(':');return {s,t:findTopic(id,s,t)?.t||(t==='exam'?'Schularbeit-Training':t.startsWith('ai_')?'KI: '+t.slice(3):t),c:v.c,n:v.t,r:v.c/v.t}});
  const weak=topicRows.filter(r=>r.n>=5&&r.r<.7).sort((a,b)=>a.r-b.r);
  const strong=topicRows.filter(r=>r.n>=8&&r.r>=.9).sort((a,b)=>b.r-a.r);
  const col=r=>r>=.85?'var(--mint)':r>=.65?'var(--sun)':'var(--berry)';
  const last14=[...Array(14)].map((_,i)=>{const dt=new Date();dt.setDate(dt.getDate()-13+i);const k=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');return {k,v:d.dayXp[k]||0,lbl:dt.getDate()+'.'}});const mx=Math.max(DAILY_GOAL,...last14.map(x=>x.v));
  return `${topBar('Eltern-Bereich','home')}
  <div class="seg" style="margin-bottom:14px">${['emma','hannah'].map(k=>`<button data-a="pKid" data-id="${k}" class="${id===k?'on':''}">${S.data[k].ava} ${KIDS[k].name}</button>`).join('')}</div>
  <div class="card"><h3>${K.name} · ${K.grade}</h3><p class="muted" style="margin:2px 0 12px">Niveau: Mathe ${K.levels.mathe}, Deutsch ${K.levels.deutsch}, Englisch ${K.levels.englisch}</p>
  <div class="kpis"><div class="kpi"><b>${levelOf(d.xp)}</b><span>Level (${d.xp} XP)</span></div><div class="kpi"><b>${curStreak(d)}</b><span>Tage-Serie</span></div><div class="kpi"><b>${week.length}</b><span>Übungen (7 Tage)</span></div><div class="kpi"><b>${totT?Math.round(totC/totT*100)+' %':'–'}</b><span>Trefferquote gesamt</span></div></div></div>
  <div class="card" style="margin-top:14px"><h3 style="margin-bottom:10px">Aktivität (14 Tage, XP)</h3><div style="display:flex;align-items:flex-end;gap:4px;height:110px">${last14.map(x=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end"><div title="${x.v} XP" style="width:100%;border-radius:6px 6px 2px 2px;background:${x.v>=DAILY_GOAL?'var(--mint)':'var(--sky)'};height:${Math.max(2,x.v/mx*90)}px"></div><span style="font-size:.65rem;color:var(--muted)">${x.lbl}</span></div>`).join('')}</div><p class="note" style="margin:8px 0 0">Grün = Tagesziel (${DAILY_GOAL} XP) erreicht</p></div>
  <div class="card" style="margin-top:14px"><h3 style="margin-bottom:12px">Fächer</h3>${Object.keys(SUBJ).map(s=>{const a=subjAcc(d,s);return `<div class="bar"><span>${SUBJ[s].t}</span><div class="track"><i style="width:${a==null?0:a*100}%;background:${a==null?'transparent':col(a)}"></i></div><span>${a==null?'–':Math.round(a*100)+' %'}</span></div>`}).join('')}</div>
  <div class="card stack" style="margin-top:14px"><h3>Hier braucht ${K.name} Übung</h3>${weak.length?weak.slice(0,6).map(r=>`<div class="bar" style="grid-template-columns:1fr 70px 48px"><span>${SUBJ[r.s].e} ${esc(r.t)}</span><span class="muted" style="font-size:.85rem">${r.n} Aufg.</span><span style="color:var(--berry)">${Math.round(r.r*100)} %</span></div>`).join(''):'<p class="muted">Noch keine Schwachstellen erkennbar (ab 5 Aufgaben pro Thema mit unter 70 %).</p>'}
  ${strong.length?`<h3>Das sitzt</h3>${strong.slice(0,5).map(r=>`<div class="muted">✅ ${SUBJ[r.s].e} ${esc(r.t)} – ${Math.round(r.r*100)} %</div>`).join('')}`:''}</div>
  <div class="card stack" style="margin-top:14px"><h3>Schularbeiten</h3>
   ${d.exams.length?d.exams.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{const n=daysBetween(today(),e.date);return `<div class="exam"><div class="days">${n<0?'✓':n}<small>${n<0?'vorbei':n===1?'Tag':'Tage'}</small></div><div style="flex:1;min-width:0"><b>${SUBJ[e.subj].t} · ${new Date(e.date+'T00:00').toLocaleDateString('de-AT')}</b><div class="muted" style="font-size:.9rem">${esc(examTopicsText({...e,kid:id}))}${e.best!=null?` · Bestes Training: Note ${e.best}`:''}</div></div><button class="icon-btn" data-a="delExam" data-id="${e.id}" aria-label="Löschen">🗑️</button></div>`}).join(''):'<p class="muted">Noch keine Schularbeit eingetragen.</p>'}
   <details><summary style="font-weight:800;cursor:pointer">+ Schularbeit eintragen</summary><div class="stack" style="margin-top:12px">
    <select class="inp" id="pSubj">${Object.keys(SUBJ).map(s=>`<option value="${s}">${SUBJ[s].t}</option>`).join('')}</select>
    <input class="inp" type="date" id="pDate" value="">
    <input class="inp" id="pNote" placeholder="Themen / Seiten, z.B. Bruchrechnen, Buch S. 40–52">
    <button class="btn block" data-a="addExam">Eintragen</button><p class="note">Die genauen Themen kann ${K.name} beim Training selbst ankreuzen.</p></div></details></div>
  <div class="card" style="margin-top:14px"><h3 style="margin-bottom:10px">Letzte Übungen</h3>${d.sessions.length?`<div class="tablewrap"><table><tr><th>Datum</th><th>Fach</th><th>Thema</th><th>Ergebnis</th></tr>${d.sessions.slice(0,15).map(s=>`<tr><td>${new Date(s.day+'T00:00').toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit'})}</td><td>${SUBJ[s.subj]?.e||''}</td><td>${esc(s.label)}${s.ai?' ✨':''}</td><td>${s.c}/${s.t}${s.grade?' · Note '+s.grade:''}</td></tr>`).join('')}</table></div>`:'<p class="muted">Noch keine Übungen.</p>'}</div>
  <div class="card stack" style="margin-top:14px"><h3>Schulbücher von ${K.name}</h3><p class="note" style="margin-top:4px">Die KI richtet Aufgaben und Probe-Schularbeiten danach aus.${S.ai.enabled?` KI heute: ${(S.ai.used||{})[id]||0}/${S.ai.limit} Runden.`:''}</p>
   ${Object.keys(SUBJ).map(s=>`<div><label class="f" for="bk_${s}">${SUBJ[s].t}</label><input class="inp" id="bk_${s}" value="${esc(bookOf(id,s))}" placeholder="z.B. Titel + Arbeitsheft"></div>`).join('')}
   <button class="btn small" data-a="saveBooks">Bücher speichern</button></div>
  <div class="card stack" style="margin-top:14px"><h3>Einstellungen</h3><div class="row"><input class="inp" id="newPin" inputmode="numeric" maxlength="4" placeholder="Neue 4-stellige PIN"><button class="btn small" data-a="setPin">Speichern</button></div>
   <p class="note">Der Fortschritt liegt am Server und ist auf allen angemeldeten Geräten gleich. Der Eltern-Modus sperrt sich nach einer Stunde automatisch.</p>
   <div class="row" style="flex-wrap:wrap"><button class="btn ghost small" data-a="lockParent">🔒 Eltern-Modus beenden</button><button class="btn ghost small" data-a="logout">Gerät abmelden</button></div>
   <button class="btn ghost small" data-a="resetKid">Fortschritt von ${K.name} zurücksetzen</button></div>${POWERED}`;
}

/* ============ Quiz logic ============ */
function buildItems(gens,n){const out=[],seen=new Set();let g=0;while(out.length<n&&g++<n*8){const gen=gens[out.length%gens.length]||pick(gens);let q;try{q=gen()}catch(e){continue}if(!q||seen.has(q.q))continue;seen.add(q.q);out.push(q)}return shuffle(out)}
function startQuiz({items,label,subj,keys,isAI,examId,profi}){S.quiz={items,label,subj,keys,isAI,examId,profi,i:0,answered:false,correct:0,combo:0,bestCombo:0,wrong:[],perKey:{}};go('quiz')}
function answer(val){const Q=S.quiz,q=Q.items[Q.i];if(Q.answered)return;if(q.type==='input'&&!String(val).trim()){toast('Schreib zuerst eine Antwort hinein.');return}
  const ok=checkAnswer(q,val);Q.answered=true;Q.lastOk=ok;Q.picked=val;Q.typed=val;const key=q._key||Q.keys[0];Q.perKey[key]=Q.perKey[key]||{c:0,t:0};Q.perKey[key].t++;
  if(ok){Q.correct++;Q.combo++;Q.bestCombo=Math.max(Q.bestCombo,Q.combo);Q.perKey[key].c++;beep('ok')}else{Q.combo=0;Q.wrong.push(q);beep('bad')}
  render()}
function finishQuiz(){
  const Q=S.quiz,d=S.data[S.kid],t=today();const total=Q.items.length;
  const oldL=levelOf(d.xp);
  let xp=Q.correct*10+Math.max(0,Q.bestCombo-2)*3;if(Q.correct===total)xp+=20;if(Q.examId)xp+=15;
  const coins=Q.correct+(Q.correct===total?5:0)+Math.floor(Q.bestCombo/5)*2;
  d.xp+=xp;d.coins+=coins;d.totalCorrect+=Q.correct;d.bestCombo=Math.max(d.bestCombo||0,Q.bestCombo);d.dayXp[t]=(d.dayXp[t]||0)+xp;
  const dk=Object.keys(d.dayXp).sort();if(dk.length>60)for(const k of dk.slice(0,dk.length-60))delete d.dayXp[k];
  if(d.lastDay!==t){d.streak=d.lastDay&&daysBetween(d.lastDay,t)===1?d.streak+1:1;d.lastDay=t}
  for(const [k,v] of Object.entries(Q.perKey)){const sk=Q.subj+':'+k;d.stats[sk]=d.stats[sk]||{c:0,t:0};d.stats[sk].c+=v.c;d.stats[sk].t+=v.t}
  const pct=Q.correct/total;const grade=Q.examId!=null?(pct>=.88?1:pct>=.75?2:pct>=.62?3:pct>=.5?4:5):null;
  if(Q.examId){const e=d.exams.find(x=>x.id===Q.examId);if(e)e.best=e.best==null?grade:Math.min(e.best,grade)}
  d.sessions.unshift({day:t,subj:Q.subj,label:Q.label,c:Q.correct,t:total,ai:!!Q.isAI,grade});d.sessions=d.sessions.slice(0,60);
  const subjs=new Set(d.sessions.map(s=>s.subj));
  const earn=[];const give=k=>{if(!d.badges.includes(k)){d.badges.push(k);earn.push(BADGES.find(b=>b.k===k))}};
  give('first');if(pct===1)give('perfect');if(Q.bestCombo>=5)give('combo5');if(Q.bestCombo>=10)give('combo10');if(d.streak>=3)give('streak3');if(d.streak>=7)give('streak7');if(d.totalCorrect>=100)give('c100');if(d.totalCorrect>=500)give('c500');if(Q.profi&&pct>=.8)give('profi');if(grade&&grade<=2)give('exam');if(Q.isAI)give('ai');if(subjs.size>=3)give('all3');
  saveKid(S.kid);
  const nl=levelOf(d.xp);
  S.result={correct:Q.correct,total,label:Q.label,xp,coins,bestCombo:Q.bestCombo,newBadges:earn,levelUp:nl>oldL?nl:0,wrong:Q.wrong,grade};
  S.lastQuizSpec=Q.spec;
  if(pct>=.8||earn.length||nl>oldL){confetti();beep('win')}
  go('result');
}

/* ============ AI (über den eigenen Server) ============ */
let aiAbort=null;
function cleanAI(arr){if(!Array.isArray(arr))return [];const out=[];
  for(const x of arr){if(!x||typeof x.question!=='string'||x.answer==null)continue;const ans=String(x.answer).trim();
    if(x.type==='mc'){if(!Array.isArray(x.options)||x.options.length<2)continue;const opts=[...new Set(x.options.map(o=>String(o).trim()))];if(!opts.includes(ans))continue;out.push({type:'mc',q:x.question,options:shuffle(opts),answer:ans,expl:x.explanation||''})}
    else{const check=['num','frac','text'].includes(x.check)?x.check:(isNaN(parseNum(ans))?'text':'num');out.push({type:'input',q:x.question,answer:ans,check,accept:Array.isArray(x.accept)?x.accept.map(String):[],expl:x.explanation||''})}}
  return out}
const aiLeft=kid=>Math.max(0,(S.ai.limit||0)-((S.ai.used||{})[kid]||0));
async function runAI(opts,label,keys,examId){
  if(!S.ai.enabled||!S.online){toast(S.online?'KI ist nicht eingerichtet.':'Ohne Internet gibt es keine KI-Aufgaben.');return false}
  if(aiLeft(opts.kid)<=0){toast('Für heute sind alle KI-Runden verbraucht. Die normalen Übungen gehen weiter!');return false}
  S.aiMsg=pick(['Claude bastelt deine Aufgaben …','Aufgaben werden gezaubert …','Gleich geht\'s los …']);go('aiLoading');
  aiAbort=new AbortController();
  try{
    const res=await api('POST','/api/ai/questions',{kid:opts.kid,subj:opts.subj,topicTitle:opts.topicTitle||'',free:opts.free||'',diff:opts.diff||'mittel',exam:!!opts.exam,examNote:opts.examNote||''},aiAbort.signal);
    S.ai.used=Object.assign({},S.ai.used,{[opts.kid]:res.used});
    const items=cleanAI(res.questions);
    if(items.length<3)throw {status:502};
    items.forEach(q=>q._key=keys[0]);
    startQuiz({items,label,subj:opts.subj,keys,isAI:true,examId});return true;
  }catch(e){
    if(e&&e.name==='AbortError'){go(S.kid?(examId?'kid':'subject'):'home');return false}
    const code=e&&e.data&&e.data.error;
    if(code==='daily_limit')toast('Für heute sind alle KI-Runden verbraucht.');
    else if(code==='rate_limited')toast('Kurz durchschnaufen – gleich nochmal probieren.');
    else if(!e.status)toast('Keine Verbindung zum Server.');
    else toast('Die KI hat gerade nicht geklappt. Probier es nochmal.');
    go(S.kid?(examId?'kid':'subject'):'home');
    return false;
  }finally{aiAbort=null}
}

/* ============ Events ============ */
document.addEventListener('click',async ev=>{
  const el=ev.target.closest('[data-a]');if(!el||el.disabled)return;const a=el.dataset.a;
  if(el.tagName==='INPUT')return; // checkboxes handled via change
  switch(a){
   case 'home':S.kid=null;go('home');break;
   case 'go':go(el.dataset.to);break;
   case 'kid':go('kid');break;
   case 'mute':S.muted=!S.muted;lsSet('lq_muted',S.muted);render();break;
   case 'pickKid':S.kid=el.dataset.id;go('kid');syncState().then(r=>{if(r===true&&S.screen==='kid')render()});break;
   case 'pickSubj':S.subj=el.dataset.s;go('subject');break;
   case 'diff':el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));break;
   case 'startTopic':{const t=findTopic(S.kid,S.subj,el.dataset.k);const spec={type:'topic',k:t.k};const items=buildItems([t.g],10).map(q=>(q._key=t.k,q));S.quizSpec=spec;startQuiz({items,label:t.t,subj:S.subj,keys:[t.k],profi:!!t.profi});S.quiz.spec=spec;break}
   case 'startAI':{const k=document.getElementById('aiTopic').value,free=document.getElementById('aiFree').value.trim();const diff=(document.querySelector('#aiDiff .on')||{}).dataset?.v||'mittel';if(!k&&!free){toast('Wähle ein Thema oder schreib eines hinein.');return}
     const t=k?findTopic(S.kid,S.subj,k):null;const key=t?t.k:'ai_'+free.slice(0,30).replace(/[^\wäöüÄÖÜß ]/g,'');const label=(t?t.t:free)+' ('+diff+')';
     const ok=await runAI({kid:S.kid,subj:S.subj,topicTitle:t?.t,free,diff,n:8},label,[key]);if(ok)S.quiz.spec={type:'ai',k,free,diff};break}
   case 'pick':{const q=S.quiz.items[S.quiz.i];answer(q.options[+el.dataset.i]);break}
   case 'submit':answer(document.getElementById('ans').value);break;
   case 'key':{const i=document.getElementById('ans');i.value+=el.dataset.v;S.quiz.typed=i.value;i.focus();break}
   case 'next':{const Q=S.quiz;if(Q.i+1>=Q.items.length){finishQuiz()}else{Q.i++;Q.answered=false;Q.typed='';Q.picked=null;render()}break}
   case 'quitQuiz':if(await ask('Übung abbrechen? Der Fortschritt dieser Runde geht verloren.',{ok:'Abbrechen'})){go(S.quiz.examId?'kid':'subject')}break;
   case 'again':{const sp=S.lastQuizSpec;if(!sp){go('kid');break}
     if(sp.type==='topic'){const t=findTopic(S.kid,S.subj,sp.k);const items=buildItems([t.g],10).map(q=>(q._key=t.k,q));startQuiz({items,label:t.t,subj:S.subj,keys:[t.k],profi:!!t.profi});S.quiz.spec=sp}
     else if(sp.type==='ai'){const t=sp.k?findTopic(S.kid,S.subj,sp.k):null;const key=t?t.k:'ai_'+sp.free.slice(0,30);const ok=await runAI({kid:S.kid,subj:S.subj,topicTitle:t?.t,free:sp.free,diff:sp.diff,n:8},(t?t.t:sp.free)+' ('+sp.diff+')',[key]);if(ok)S.quiz.spec=sp}
     else if(sp.type==='exam'){startExamRun(sp.draft,sp.examId)}break}
   case 'cancelAI':if(aiAbort)aiAbort.abort();break;
   case 'buy':{const d=S.data[S.kid],e=el.dataset.e,p=+el.dataset.p;if(d.owned.includes(e)){d.ava=e;saveKid(S.kid);render();break}if(d.coins<p){toast(`Dir fehlen noch ${p-d.coins} Münzen.`);break}if(await ask(`${e} für ${p} Münzen kaufen?`,{ok:'Kaufen'})){d.coins-=p;d.owned.push(e);d.ava=e;saveKid(S.kid);beep('win');render()}break}
   case 'examNew':S.examDraft={subj:S.subj||'mathe',topics:[],note:'',date:'',id:null};go('examSetup');break;
   case 'startExam':{const e=S.data[S.kid].exams.find(x=>x.id===el.dataset.id);if(!e)break;S.examDraft={subj:e.subj,topics:[...(e.topics||[])],note:e.note||'',date:e.date,id:e.id};go('examSetup');break}
   case 'exSubj':S.examDraft.subj=el.dataset.s;S.examDraft.topics=[];syncDraft();render();break;
   case 'examGo':{syncDraft();const E=S.examDraft,d=S.data[S.kid];
     if(!E.topics.length&&!E.note){toast('Kreuz mindestens ein Thema an.');break}
     let id=E.id;if(E.date){if(id){const ex=d.exams.find(x=>x.id===id);if(ex)Object.assign(ex,{subj:E.subj,topics:E.topics,note:E.note,date:E.date})}else{id=uid();d.exams.push({id,subj:E.subj,topics:E.topics,note:E.note,date:E.date});E.id=id}saveKid(S.kid)}
     startExamRun({...E},id);break}
   case 'toPin':S.pinIn='';S.kid=null;if(S.parent){api('GET','/api/me').then(m=>{S.parent=!!m.parent;go(S.parent?'parent':'pin')}).catch(()=>go('pin'))}else go('pin');break;
   case 'pin':{const v=el.dataset.v;if(v==='⌫')S.pinIn=S.pinIn.slice(0,-1);else if(S.pinIn.length<4)S.pinIn+=v;
     if(S.pinIn.length===4){const pin=S.pinIn;S.pinIn='';try{await api('POST','/api/parent/unlock',{pin});S.parent=true;await syncState();go('parent')}catch(e){toast(e.status===429?'Zu viele Versuche – bitte 15 Minuten warten.':e.status?'Falsche PIN':'Keine Verbindung zum Server.');render()}}else render();break}
   case 'login':{const pw=document.getElementById('famPw').value;if(!pw){toast('Bitte das Passwort eingeben.');break}try{await api('POST','/api/login',{password:pw});S.screen='boot';render();await syncState();go('home')}catch(e){toast(e.status===429?'Zu viele Versuche – bitte 15 Minuten warten.':e.status?'Passwort stimmt nicht.':'Keine Verbindung zum Server.')}break}
   case 'logout':{if(!(await ask('Dieses Gerät abmelden?',{ok:'Abmelden'})))break;await api('POST','/api/logout').catch(()=>{});S.parent=false;go('login');break}
   case 'lockParent':{await api('POST','/api/parent/lock').catch(()=>{});S.parent=false;go('home');break}
   case 'pKid':S.parentKid=el.dataset.id;render();break;
   case 'addExam':{const subj=document.getElementById('pSubj').value,date=document.getElementById('pDate').value,note=document.getElementById('pNote').value.trim();if(!date){toast('Bitte ein Datum wählen.');break}S.data[S.parentKid].exams.push({id:uid(),subj,date,note,topics:[]});saveKid(S.parentKid);toast('Schularbeit eingetragen');render();break}
   case 'delExam':{if(!(await ask('Diese Schularbeit entfernen?',{ok:'Entfernen'})))break;const d=S.data[S.parentKid];d.exams=d.exams.filter(x=>x.id!==el.dataset.id);saveKid(S.parentKid);render();break}
   case 'saveBooks':{const b={};b[S.parentKid]={};for(const sb of Object.keys(SUBJ))b[S.parentKid][sb]=document.getElementById('bk_'+sb).value.trim();try{const r=await api('PUT','/api/settings',{books:b});S.settings.books=r.books;lsSet('lq_settings',S.settings);toast('Bücher gespeichert');render()}catch(e){parentErr(e)}break}
   case 'setPin':{const v=document.getElementById('newPin').value.trim();if(!/^\d{4}$/.test(v)){toast('Die PIN braucht genau 4 Ziffern.');break}try{await api('PUT','/api/settings',{pin:v});S.settings.pinIsDefault=false;lsSet('lq_settings',S.settings);toast('PIN gespeichert');render()}catch(e){parentErr(e)}break}
   case 'resetKid':{const n=KIDS[S.parentKid].name;if((await ask(`Zum Zurücksetzen „${n}“ eintippen:`,{input:true,ok:'Zurücksetzen'}))===n){try{const r=await api('POST','/api/kids/'+S.parentKid+'/reset');S.rev[S.parentKid]=r.rev;S.data[S.parentKid]=defKid(S.parentKid);lsSet('lq_kid_'+S.parentKid,S.data[S.parentKid]);delete S.dirty[S.parentKid];persistLocal();toast('Zurückgesetzt');render()}catch(e){parentErr(e)}}break}
  }
});
document.addEventListener('change',ev=>{const el=ev.target;if(el.dataset.a==='exTopic'){const E=S.examDraft;if(el.checked)E.topics.push(el.value);else E.topics=E.topics.filter(x=>x!==el.value)}});
document.addEventListener('input',ev=>{if(ev.target.id==='ans'&&S.quiz)S.quiz.typed=ev.target.value});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&S.screen==='login'){ev.preventDefault();document.querySelector('[data-a="login"]')?.click();return}if(ev.key==='Enter'&&S.screen==='quiz'&&!document.querySelector('.modal-bg')){ev.preventDefault();const Q=S.quiz;if(Q.answered)document.querySelector('[data-a="next"]')?.click();else if(Q.items[Q.i].type==='input')answer(document.getElementById('ans').value)}});
function parentErr(e){if(e.status===403){S.parent=false;toast('Eltern-Modus abgelaufen – bitte PIN neu eingeben.');go('pin')}else toast(e.status?'Speichern fehlgeschlagen.':'Keine Verbindung zum Server.')}
function syncDraft(){const n=document.getElementById('exNote'),d=document.getElementById('exDate');if(n)S.examDraft.note=n.value.trim();if(d)S.examDraft.date=d.value}
async function startExamRun(E,examId){
  const list=TOPICS[S.kid][E.subj];const chosen=E.topics.map(k=>list.find(t=>t.k===k)).filter(Boolean);
  const label='Probe-Schularbeit '+SUBJ[E.subj].t;const keys=chosen.length?chosen.map(t=>t.k):['exam'];
  const spec={type:'exam',draft:E,examId};
  if(S.ai.enabled&&S.online&&aiLeft(S.kid)>0){const ok=await runAI({kid:S.kid,subj:E.subj,topicTitle:chosen.map(t=>t.t).join(', '),exam:true,examNote:E.note,n:12},label,keys,examId||'tmp');
    if(ok){S.quiz.examId=examId||'tmp';S.quiz.spec=spec;S.quiz.items.forEach((q,i)=>q._key='exam');return}
    if(!chosen.length)return;}
  if(!chosen.length){toast('Ohne KI bitte Themen ankreuzen.');go('examSetup');return}
  const gens=chosen.map(t=>()=>{const q=t.g();q._key=t.k;return q});
  startQuiz({items:buildItems(gens,12),label,subj:E.subj,keys,examId:examId||'tmp'});S.quiz.spec=spec;
}
render();init();
