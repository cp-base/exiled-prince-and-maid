// v0.9: village relationships / hunter Toma quest / previous game features
// Run from repository root: node tests/v09_village_relations.cjs
const fs=require("node:fs"),assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"game script found");
new Function(script);
function scenario({power=120,random=.99}={}){
  const elements={};let frame,time=1000;
  function node(tag="div"){
    let text="";
    const e={tag,children:[],style:{},hidden:false,listeners:{},attributes:{},classList:{toggle(){}},
      appendChild(c){this.children.push(c);return c},addEventListener(n,f){this.listeners[n]=f},
      click(){this.listeners.click?.()},focus(){},setAttribute(n,v){this.attributes[n]=v}};
    Object.defineProperty(e,"textContent",{get(){return text},set(v){text=String(v);this.children=[]}});
    return e;
  }
  const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get(t,k){return t[k]||(()=>{})}});
  const doc={
    getElementById(id){if(!elements[id])elements[id]=node(id);if(id==="scene")elements[id].getContext=()=>ctx;return elements[id]},
    createElement:node
  };
  const dice=Object.create(Math);dice.random=()=>random;
  let code=script.replace("meetMayor();meetDaughter();",
    "document.__state=state;document.__advanceTown=advanceTown;meetMayor();meetDaughter();");
  if(power)code=code.replace("var planning=null;","state.prince.atk="+power+";state.maid.atk="+power+";var planning=null;");
  new Function("document","requestAnimationFrame","Math",code)(doc,cb=>frame=cb,dice);
  const choices=()=>elements.choices.children.map(c=>c.children[0].textContent);
  function choose(text){
    const btn=elements.choices.children.find(c=>c.children[0].textContent.includes(text));
    assert.ok(btn,"missing choice: "+text+" from "+choices());btn.click();
  }
  function depart(){
    elements.departButton.click();let steps=0;
    while(elements.resultPanel.hidden&&steps++<20000){
      const cb=frame;time+=34;cb(time);
      if(!elements.rescueModal.hidden)elements.rescueContinue.click();
    }
    assert.ok(steps<20000,"battle ends");return Number(elements.resultKills.textContent);
  }
  return {e:elements,state:doc.__state,advanceTown:doc.__advanceTown,choices,choose,depart,back(){elements.backButton.click();}};
}
const s=scenario();
assert.equal(s.e.mayorValue.textContent,"1 / 5","mayor greets initial prince");
assert.equal(s.e.tomaValue.textContent,"0 / 5","Toma not yet met");
assert.equal(s.e.relationValue.textContent,"1 / 5","daughter preserved");
assert.equal(s.choices().length,3,"maid shows sampled proposals");
s.choose(s.choices().find(x=>!x.includes("娘さん")));assert.ok(s.depart()>=5);
assert.match(s.e.villageEventsResult.textContent,/狩人トーマ/);
s.back();assert.equal(s.e.tomaValue.textContent,"1 / 5","Toma meets after battle");
s.choose(s.choices().find(x=>!x.includes("娘さん")));s.depart();
assert.match(s.e.villageEventsResult.textContent,/大きな狼の足跡/);
s.back();assert.equal(s.e.tomaValue.textContent,"2 / 5","tracking clue");
assert.ok(s.choices().some(x=>x.includes("狩人トーマと森の魔物")),"hunt unlocked");
s.choose("狩人トーマと森の魔物");assert.ok(s.depart()>=8);
assert.match(s.e.villageEventsResult.textContent,/大狼を倒した/);
s.back();assert.equal(s.e.tomaValue.textContent,"4 / 5");
assert.equal(s.e.mayorValue.textContent,"2 / 5","mayor reacts to hunt");
assert.match(s.e.tomaHuntStatus.textContent,/討伐完了/);
assert.ok(!s.choices().some(x=>x.includes("狩人トーマと森の魔物")),"once only");
s.e.speedToggle.click();assert.equal(s.e.speedToggle.textContent,"速度：4倍");
s.e.speedToggle.click();assert.equal(s.e.speedToggle.textContent,"速度：1倍");

const v=scenario();
v.choose("娘さんと初めて");assert.ok(v.depart()>=10);
assert.equal(v.e.heroineResult.hidden,false,"heroine rescue kept");
v.back();assert.equal(v.e.mayorValue.textContent,"2 / 5","mayor thanks after daughter rescue");
v.choose(v.choices()[0]);v.depart();v.back();
assert.equal(v.state.relationships.mayor.flags.filter(x=>x==="daughter_rescued").length,1);

const town=scenario();
town.advanceTown("road");town.advanceTown("road");town.advanceTown("road");
town.advanceTown("forge");town.advanceTown("forge");
assert.equal(town.state.relationships.mayor.affinity,3,"mayor town trust one time per milestone");

const unselected=scenario();
for(let i=0;i<2;i++){unselected.choose(unselected.choices().find(x=>!x.includes("娘さん")));unselected.depart();unselected.back();}
assert.ok(unselected.state.relationships.toma.flags.includes("tracks"));
unselected.choose(unselected.choices().find(x=>!x.includes("トーマ")&&!x.includes("娘さん")));
unselected.depart();unselected.back();
assert.ok(!unselected.state.relationships.toma.flags.includes("hunt_done"),"ordinary run cannot complete hunt");

const low=scenario({power:0});
for(let i=0;i<2;i++){low.choose(low.choices().find(x=>!x.includes("娘さん")));low.depart();low.back();}
low.choose("狩人トーマと森の魔物");assert.ok(low.depart()<8,"weak party cannot reach wolf");
low.back();assert.ok(low.choices().some(x=>x.includes("狩人トーマと森の魔物")),"retry possible");
assert.match(low.e.goldCount.textContent,/G/,"v0.8 gold kept");

console.log("v0.9 PASS: 3 relationships, mayor milestones, Toma clues / hunt / retries, daughter rescue, 1x/4x speed, currency");
