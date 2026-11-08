// v0.6 test: run at repo root with node tests/v06_loot_party_combat.cjs
// No browser or external packages required; simulates DOM, timed animation and RNG.
const fs=require("node:fs");
const assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const found=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(found,"inline script exists");
new Function(found[1]);

function scenario(random=0,fast=false){
 const elements={};let frame=null,time=1000;const hits={};
 function node(tag="div"){
  let value="";
  const el={tag,style:{},children:[],listeners:{},hidden:false,classList:{toggle(){}},
   appendChild(c){this.children.push(c);return c},
   addEventListener(k,fn){this.listeners[k]=fn},
   click(){this.listeners.click?.()}};
  Object.defineProperty(el,"textContent",{get(){return value},set(v){value=String(v);this.children=[]}});
  return el;
 }
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get(t,k){return t[k]||(()=>{})}});
 const doc={__hits:hits,
  getElementById(id){if(!elements[id])elements[id]=node(id);if(id==="scene")elements[id].getContext=()=>ctx;return elements[id]},
  createElement:node};
 const math=Object.create(Math);math.random=()=>random;
 let script=found[1].replace("function strike(id){","function strike(id){document.__hits[id]=(document.__hits[id]||0)+1;");
 script=script.replace("meetDaughter();renderChoices();",'document.__debug={state:state,battle:()=>battle,itemData:itemData,gearMode:gearMode};meetDaughter();renderChoices();');
 if(fast)script=script.replace("var planning=null;","state.prince.atk=120;state.maid.atk=90;var planning=null;");
 new Function("document","requestAnimationFrame","Math",script)(doc,cb=>frame=cb,math);
 function choose(text){
  const b=elements.choices.children.find(x=>x.children[0]?.textContent.includes(text));
  assert.ok(b,"missing choice "+text);b.click();
 }
 function depart(){
  elements.departButton.click();let count=0;
  while(elements.resultPanel.hidden&&count++<18000){const cb=frame;time+=35;cb(time)}
  assert.ok(count<18000,"battle did not end");
  return Number(elements.resultKills.textContent);
 }
 return {e:elements,d:doc.__debug,hits,choose,depart,back:()=>elements.backButton.click()};
}

const s=scenario(0);
s.choose("工房を立て直");
assert.equal(s.d.state.people.length,0);
const first=s.depart();
assert.ok(first>=2,"fought and killed enemies");
assert.equal(s.d.state.items.length,s.d.battle().drops.length,"loot is awarded on return");
assert.ok(s.d.state.items.length>0,"random equipment dropped");
assert.ok(s.d.battle().drops.every(id=>s.d.itemData[id].mode),"all dropped items have combat modes");
assert.match(s.e.lootReport.textContent,/戦利品/);
s.back();
s.e.inventory.children[0].children[1].children[1].click();
assert.equal(s.d.gearMode("maid"),"melee","sword turns maid into melee");
assert.match(s.e.maidGear.textContent,/近接/);
s.e.inventory.children[0].children[1].children[1].click();
assert.equal(s.d.gearMode("maid"),"ranged","maid without equipment is ranged");
s.choose("街道を整え");
s.depart();s.back();
s.choose("町の人に話を");
assert.ok(s.d.state.people.includes("apprentice"),"apprentice recruited");
assert.ok(s.d.state.party.includes("apprentice"),"new ally initially joins");
assert.equal(s.e.apprenticeCard.hidden,false,"ally appears in UI");
s.e.partyRoster.children[0].children[1].click();
assert.ok(!s.d.state.party.includes("apprentice"),"ally may wait in town");
s.e.partyRoster.children[0].children[1].click();
assert.ok(s.d.state.party.includes("apprentice"),"ally may join again");
// Existing ranged weapon: same type of equipment used by any character.
s.d.state.items.push("forest_staff");
s.d.state.equipment.apprentice="forest_staff";
assert.equal(s.d.gearMode("apprentice"),"ranged");
s.d.state.equipment.apprentice=null;
const before={...s.hits};s.depart();
for(const id of ["prince","maid","apprentice"]){
 assert.ok((s.hits[id]||0)>(before[id]||0),id+" attacked independently");
}
const boss=scenario(.99,true);
boss.choose("遠征の準備");const best=boss.depart();
assert.ok(best>=10,"test powers reached tenth enemy");
assert.ok(boss.d.battle().drops.length>=1,"boss drops even at unfavorable RNG");
assert.equal(boss.d.state.items.length,boss.d.battle().drops.length);
assert.equal(boss.e.heroineResult.hidden,false,"v0.5 tenth-enemy heroine rescue preserved");
console.log("v0.6 PASS: random/boss drops, return, gear modes, companion recruitment/bench, independent attacks, heroine rescue");
