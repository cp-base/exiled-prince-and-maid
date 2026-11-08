// v0.5 heroine events / compatibility smoke test.
// Run from repository root: node tests/v05_heroine_smoke.cjs
const fs = require("node:fs");
const assert = require("node:assert/strict");
const html = fs.readFileSync("index.html","utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,"inline game script");
new Function(match[1]);

function scenario({fast=false, random=0.99}={}){
  const elements={};let nextFrame, time=1000;
  function element(tag="div"){
    let text="";
    const e={tag,style:{},children:[],listeners:{},hidden:false,classList:{toggle(){}},
      appendChild(n){this.children.push(n);return n},
      addEventListener(n,f){this.listeners[n]=f},
      click(){this.listeners.click?.()}};
    Object.defineProperty(e,"textContent",{get(){return text},set(value){text=String(value);this.children=[]}});
    return e;
  }
  const ctx = new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get(t,k){return t[k] || (()=>{})}});
  const document={
    getElementById(id){
      if(!elements[id])elements[id]=element(id);
      if(id==="scene")elements[id].getContext=()=>ctx;
      return elements[id];
    },createElement:element
  };
  const math=Object.create(Math);math.random=()=>random;
  // Accelerated characters are used only for long-run event reproducibility.
  const code=fast?match[1].replace("var planning=null;","state.prince.atk=120;state.maid.atk=90;var planning=null;"):match[1];
  new Function("document","requestAnimationFrame","Math",code)(document,fn=>{nextFrame=fn},math);
  const options=()=>elements.choices.children.map(e=>e.children[0].textContent);
  function choose(term){
    const button=elements.choices.children.find(e=>e.children[0].textContent.includes(term));
    assert.ok(button,"missing choice "+term+"; options: "+options());button.click();
  }
  function depart(){
    elements.departButton.click();let count=0;
    while(elements.resultPanel.hidden&&count++<18000){const cb=nextFrame;nextFrame=null;time+=35;cb(time);}
    assert.ok(count<18000,"battle completed");
    return {kills:Number(elements.resultKills.textContent),rescued:!elements.heroineResult.hidden};
  }
  return {elements,options,choose,depart,back:()=>elements.backButton.click()};
}

let s=scenario({fast:true});
assert.equal(s.elements.relationValue.textContent,"1 / 5","meeting occurs once at start");
assert.equal(s.elements.relationHistory.children.length,1);
s.choose("娘さんに会い");
assert.equal(s.elements.relationValue.textContent,"2 / 5","maid visit");
let result=s.depart();
assert.ok(result.kills>=10 && result.rescued,"10th defeat rescues daughter");
assert.match(s.elements.heroineResult.textContent,/街道で救出/);
s.back();
assert.equal(s.elements.relationValue.textContent,"4 / 5","rescue adds affection");
assert.ok(s.options().some(x=>x.includes("お礼のお誘い")));
s.choose("お礼のお誘い");
assert.equal(s.elements.relationValue.textContent,"5 / 5","gratitude event");
s.depart();s.back();
assert.ok(!s.options().some(x=>x.includes("お礼のお誘い")),"gratitude once");
for(let n=0;n<3;n++){
  s.choose("遠征の準備");result=s.depart();
  assert.equal(result.rescued,false,"rescue once");s.back();
}
assert.equal(s.elements.relationValue.textContent,"5 / 5","affinity cap");
let rand=scenario({fast:true,random:0});
rand.choose("街道を整え");
assert.equal(rand.elements.relationValue.textContent,"2 / 5","random town encounter");
assert.match(rand.elements.proposalReport.textContent,/村長の娘/);
assert.equal(rand.elements.roadLevel.textContent,"1 / 3","existing town improvement");
rand.depart();rand.back();
let normal=scenario({random:0.99});
normal.choose("街道に古い剣");
result=normal.depart();assert.ok(result.kills>=2);
normal.back();
assert.equal(normal.elements.inventory.children.length,1,"v0.4 sword discovery");
assert.equal(normal.elements.relationValue.textContent,"1 / 5","non-hit random");
console.log("v0.5 smoke PASS: meeting / maid route / random / 10th rescue / thanks / history / cap / no duplicate / v0.4 gear and town");
