/* dev-only economy patches: text replacements applied to the base game scripts when /dev loads them (the const-based knobs
   can't be changed after load). Production files are untouched. ?noeco skips them. */
(function(){if(/[?&]noeco/.test(location.search))return;var P={
"02-data.js": [
[
"const TUNE={payRate:.05,gearCost:.8};",
"const TUNE={payRate:.04,gearCost:1.6};"
],
[
"const PERF={qRef:50,qPow:.8,qMin:.45,qMax:2.5,collabPow:2,collabQ:.5,hitP:.08,hitQRef:60,hitQMin:.5,hitQMax:1.6,hitMin:3,hitMax:6,viralP:.0003,viralQBest:90,viralQPow:3,viralMin:5e6,viralLisMin:20,viralLisMax:50,viralShare:.06,viralDays:90,featLis:.01,expMin:.3,expScale:200,expMentor:8,expFame:6};",
"const PERF={qRef:50,qPow:.8,qMin:.45,qMax:2.5,collabPow:2,collabQ:.5,hitP:.08,hitQRef:60,hitQMin:.5,hitQMax:1.6,hitMin:1.5,hitMax:2.5,viralP:.0003,viralQBest:90,viralQPow:3,viralMin:1e5,viralLisMin:1.5,viralLisMax:4,viralShare:.06,viralDays:90,featLis:.0004,expMin:.3,expScale:200,expMentor:8,expFame:6};"
]
],
"29-v26.js": [
[
"const FAME_MULT=1.5;",
"const FAME_MULT=1.22;"
]
],
"05-game-flow.js": [
[
"const $$=n=>'$'+(+n).toFixed(2);",
"const $$=n=>{n=Math.round(+n||0);const g=n<0?'-':'',a=Math.abs(n),f=(v,u)=>g+'$'+(+v.toFixed(v<10?2:v<100?1:0))+u;return a>=1e12?f(a/1e12,'T'):a>=1e9?f(a/1e9,'B'):a>=1e6?f(a/1e6,'M'):a>=1e3?f(a/1e3,'K'):g+'$'+a};"
]
],
"14-world-fame-cars-pets-collabs.js": [
[
"const CARS=[{n:'Pocket Hatch',p:1500,c:'#e6b422',top:11},{n:'Commuter Sedan',p:4000,c:'#3b82f6',top:15},{n:'Trail Pickup',p:7500,c:'#2f8f5a',top:17},{n:'Apex Sports',p:15000,c:'#c0392b',top:29},{n:'Phantom GT',p:40000,c:'#22252b',top:40}];",
"const CARS=[{n:'Pocket Hatch',p:2000,c:'#e6b422',top:11},{n:'Commuter Sedan',p:6500,c:'#3b82f6',top:15},{n:'Trail Pickup',p:18000,c:'#2f8f5a',top:17},{n:'Apex Sports',p:55000,c:'#c0392b',top:29},{n:'Phantom GT',p:170000,c:'#22252b',top:40}];"
],
[
"const PROPS=[['Suburban House',12000],['Hillside Villa',45000],['Penthouse Loft',120000]];",
"const PROPS=[['Suburban House',25000],['Hillside Villa',110000],['Penthouse Loft',450000]];"
],
[
"const PETS=[['Pixel Cat',150],['Good Boy Dog',250],['Polly Parrot',400],['Foxy',900]],PETC=['#e39b5b','#b98a5a','#2ecc71','#e8772e'];",
"const PETS=[['Pixel Cat',200],['Good Boy Dog',450],['Polly Parrot',1000],['Foxy',3000]],PETC=['#e39b5b','#b98a5a','#2ecc71','#e8772e'];"
],
[
"const JEW=[['Silver chain',400],['Gold chain',2500],['Diamond grill',12000],['Iced platinum set',30000]];",
"const JEW=[['Silver chain',600],['Gold chain',4000],['Diamond grill',25000],['Iced platinum set',90000]];"
],
[
"PA.guard=()=>{const P2=[800,1800,4000][S.guards],ok=fameLevel()>=FTL()[2];return`<h1>Bodyguards</h1><p class=m>Fame Level ${fameLevel()}. Hiring unlocks at Fame Level ${FTL()[2]}. Hired: ${S.guards}/3</p>${S.guards>=3?'<p class=m>Full crew.</p>':`<button class=go ${!ok||S.money<P2?'disabled':''} onclick=\"book('guard',0)\">Book \u00b7 ${$$(P2)}</button>${ok?'':'<p class=m>Not famous enough yet.</p>'}`}`};",
"PA.guard=()=>{const P2=[3000,12000,40000][S.guards],ok=fameLevel()>=FTL()[2];return`<h1>Bodyguards</h1><p class=m>Fame Level ${fameLevel()}. Hiring unlocks at Fame Level ${FTL()[2]}. Hired: ${S.guards}/3</p>${S.guards>=3?'<p class=m>Full crew.</p>':`<button class=go ${!ok||S.money<P2?'disabled':''} onclick=\"book('guard',0)\">Book \u00b7 ${$$(P2)}</button>${ok?'':'<p class=m>Not famous enough yet.</p>'}`}`};"
],
[
"function buyX(t,i){const pr={car:()=>CARS[i].p,home:()=>PROPS[i][1],pet:()=>PETS[i][1],guard:()=>[800,1800,4000][S.guards],garage:()=>2500}[t]();if(S.money<pr)return snd('err');S.money=+(S.money-pr).toFixed(2);if(t=='car'){S.cars.push(i);parkCars()}if(t=='home'){S.home++;buildLots()}if(t=='pet'){S.pets.push(i);syncF()}if(t=='guard'){S.guards++;syncF()}if(t=='garage'){S.garage=1;parkCars()}updateVersion();snd('cash');say('Purchased!');if(mode=='pc')pcR()}",
"function buyX(t,i){const pr={car:()=>CARS[i].p,home:()=>PROPS[i][1],pet:()=>PETS[i][1],guard:()=>[800,1800,4000][S.guards],garage:()=>9000}[t]();if(S.money<pr)return snd('err');S.money=+(S.money-pr).toFixed(2);if(t=='car'){S.cars.push(i);parkCars()}if(t=='home'){S.home++;buildLots()}if(t=='pet'){S.pets.push(i);syncF()}if(t=='guard'){S.guards++;syncF()}if(t=='garage'){S.garage=1;parkCars()}updateVersion();snd('cash');say('Purchased!');if(mode=='pc')pcR()}"
]
]
};
window.__fwpatch=function(name,code){var a=P[name.split('?')[0]];if(!a)return code;a.forEach(function(p){code=code.split(p[0]).join(p[1])});return code}})();
