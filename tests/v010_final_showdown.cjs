// v0.10: heroine early rescue + Toma's dedicated final showdown.
// Run from repository root: node tests/v010_final_showdown.cjs
// Mock DOM + deterministic RNG; no browser and no external packages.
const fs=require("node:fs"),assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const gameJS=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(gameJS,"inline game script exists");new Function(gameJS);

function scenario(random=.99){
 const E={};let raf,now=1000;
 function element(tag="div"){
  let txt="";
  const x={tag,children:[],style:{},hidden:false,disabled:false,listeners:{},attributes:{},classList:{toggle(){}},
   appendChild(c){this.children.push(c);return c},addEventListener(k,f){this.listeners[k]=f},
   click(){this.listeners.click?.()},focus(){this.focused=true},setAttribute(k,v){this.attributes[k]=v}};
  Object.defineProperty(x,"textContent",{get(){return txt},set(v){txt=String(v);this.children=[]}});
  return x;
 }
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get(t,k){return t[k]||(()=>{})}});
 const document={
  getElementById(id){if(!E[id])E[id]=element(id);if(id==="scene")E[id].getContext=()=>ctx;return E[id]},
  createElement:element
 };
 const dice=Object.create(Math);dice.random=()=>random;
 const js=gameJS.replace("meetMayor();meetDaughter();",
  "document.__debug={state:state,battle:()=>battle};meetMayor();meetDaughter();");
 new Function("document","requestAnimationFrame","Math",js)(document,fn=>raf=fn,dice);
 const options=()=>E.choices.children.map(x=>x.children[0].textContent);
 function choose(text){
  const b=E.choices.children.find(x=>x.children[0].textContent.includes(text));
  assert.ok(b,"missing proposal: "+text+" in "+options());b.click();
 }
 function tick(){const cb=raf;now+=35;cb(now)}
 function endBattle(){
  let n=0;while(E.resultPanel.hidden&&n++<18000){
   tick();if(!E.rescueModal.hidden)E.rescueContinue.click();
  }
  assert.ok(n<18000,"battle should complete");
  return Number(E.resultKills.textContent);
 }
 return {E,options,choose,tick,endBattle,state:document.__debug.state,battle:document.__debug.battle,
  depart(){E.departButton.click();return endBattle()},
  decisive(){E.decisiveButton.click();return endBattle()},
  back(){E.backButton.click()}};
}

const a=scenario();
assert.equal(a.E.relationValue.textContent,"1 / 5","initial daughter meeting");
assert.equal(a.E.mayorValue.textContent,"1 / 5","initial mayor meeting");
assert.match(a.E.tomaHuntStatus.textContent,/①/);
assert.equal(a.E.decisiveButton.hidden,true,"decisive locked at start");
assert.equal(a.options().length,3,"maid's proposals stay randomized");
assert.ok(a.options().some(x=>x.includes("娘さんと初めて")),"first exchange always offered");
a.choose("娘さんと初めて");a.E.departButton.click();
let steps=0;
while(a.E.rescueModal.hidden&&steps++<18000)a.tick();
assert.ok(steps<18000,"rescue modal on fourth defeat");
assert.equal(a.battle().kills,4,"rescue earlier at four kills");
assert.match(a.E.rescueStory.textContent,/4体目/);
for(let i=0;i<35;i++)a.tick();
assert.equal(a.battle().kills,4,"battle suspended while modal open");
a.E.rescueContinue.click();a.endBattle();a.back();
assert.ok(a.state.party.includes("daughter"),"heroine joins party");
assert.match(a.E.tomaHuntStatus.textContent,/②/,"Toma met on return");
assert.equal(a.state.goal,false,"not yet stage cleared");

a.choose(a.options()[0]);
assert.ok(a.depart()>=5,"normal second expedition reaches clue");
a.back();
assert.match(a.E.tomaHuntStatus.textContent,/③/,"showdown step visible");
assert.equal(a.E.decisiveButton.hidden,false,"showdown button unlocked");
assert.ok(!a.options().some(x=>x.includes("狩人トーマと森の魔物")),"no obscure random proposal for boss");
assert.equal(a.state.goal,false,"clue alone does not clear");
assert.equal(a.decisive(),1,"final fight consists of one boss");
assert.equal(a.E.enemyName.textContent,"森の大狼");
assert.equal(a.E.decisiveResult.hidden,false);
assert.match(a.E.decisiveResult.textContent,/灰渡編クリア/);
a.back();
assert.equal(a.state.goal,true);
assert.equal(a.E.goalLabel.textContent,"灰渡編クリア！");
assert.equal(a.E.decisiveButton.hidden,true,"victory cannot be repeated");
assert.ok(a.state.party.includes("daughter"),"girl remains after clear");
assert.equal(a.state.currentTown,"haiwatari","no forced exile or map transfer");
a.choose(a.options()[0]);a.depart();a.back();
assert.equal(a.state.phase,"town","can still return from normal expeditions");

const weak=scenario();
weak.choose("娘さんと初めて");weak.depart();weak.back();
weak.choose(weak.options()[0]);weak.depart();weak.back();
for(const id of ["prince","maid","daughter"]){
 weak.state[id].atk=1;weak.state[id].max=4;
}
assert.equal(weak.decisive(),0,"weak party loses final showdown");
assert.equal(weak.state.goal,false);
assert.match(weak.E.decisiveResult.textContent,/再挑戦/);
weak.back();
assert.equal(weak.E.decisiveButton.hidden,false,"showdown can be retried");
for(const id of ["prince","maid","daughter"])weak.state[id].atk=40;
assert.equal(weak.decisive(),1,"retry can succeed");
weak.back();assert.equal(weak.state.goal,true);

const noExchange=scenario();
noExchange.choose(noExchange.options().find(x=>!x.includes("娘さんと初めて")));
noExchange.depart();noExchange.back();
assert.equal(noExchange.state.relationships.daughter.rescued,false,"rescue still gated by first exchange");
assert.ok(noExchange.options().some(x=>x.includes("娘さんと初めて")),"first exchange remains offered");
assert.equal(noExchange.E.inviteMerchant.hidden,false,"v0.8 merchant retained");
noExchange.E.speedToggle.click();assert.equal(noExchange.E.speedToggle.textContent,"速度：4倍");

console.log("v0.10 PASS: early heroine rescue, paused modal, Toma 3-stage guide, final boss only, clear, retries, after-clear play, v0.8 economy/speed");
