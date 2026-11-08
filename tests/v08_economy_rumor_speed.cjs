// v0.8 smoke: node tests/v08_economy_rumor_speed.cjs (run in repository root)
const fs=require("node:fs"),assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,"game script present");new Function(match[1]);
function scenario({random=.99,power=120}={}){
 const E={};let frame,time=1000;
 function element(tag="div"){
  let value="";
  const e={tag,style:{},children:[],listeners:{},hidden:false,disabled:false,attrs:{},classList:{toggle(){}},
    appendChild(child){this.children.push(child);return child},
    addEventListener(k,fn){this.listeners[k]=fn},
    click(){this.listeners.click?.()},focus(){},
    setAttribute(k,v){this.attrs[k]=String(v)}};
  Object.defineProperty(e,"textContent",{get(){return value},set(v){value=String(v);this.children=[]}});
  return e;
 }
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get(t,k){return t[k]||(()=>{})}});
 const document={
  getElementById(id){if(!E[id])E[id]=element(id);if(id==="scene")E[id].getContext=()=>ctx;return E[id]},
  createElement:element
 };
 const math=Object.create(Math);math.random=()=>random;
 const seed="state.prince.atk="+power+";state.maid.atk="+power+";";
 let code=match[1].replace("var planning=null;",seed+"var planning=null;");
 code=code.replace("meetDaughter();renderChoices();","document.__game={state:state,battle:()=>battle,itemData:itemData,rollProposals:rollProposals,getProposals:getProposals,selectProposal:selectProposal,makeLoot:makeLoot};meetDaughter();renderChoices();");
 new Function("document","requestAnimationFrame","Math",code)(document,fn=>frame=fn,math);
 function selectRumor(){
  const rumor=document.__game.getProposals().find(p=>p.title.includes("うわさ話"));
  assert.ok(rumor);document.__game.selectProposal(rumor);
 }
 function step(n){
  for(let i=0;i<n;i++){const next=frame;time+=35;next(time);}
 }
 function depart(){
  E.departButton.click();
  let count=0;while(E.resultPanel.hidden&&count++<18000){
   step(1);
   if(!E.rescueModal.hidden){E.rescueContinue.click();}
  }
  assert.ok(count<18000,"expedition finishes");
  return Number(E.resultKills.textContent);
 }
 return {E,game:document.__game,selectRumor,depart,step,back:()=>E.backButton.click()};
}
const test=scenario({random:.99});
assert.equal(test.E.goldCount.textContent,"0 G");
assert.equal(test.E.materialCount.textContent,"0");
test.E.inviteMerchant.click();
assert.equal(test.E.merchantOffers.children.length,3,"two goods and materials sell offer");
assert.equal(test.E.merchantOffers.children[0].children[1].disabled,true,"can't buy without gold");
const initial=test.game.state;
test.selectRumor();
assert.match(test.E.proposalReport.textContent,/うわさ話/);
assert.equal(initial.rumors.length,1,"one piece of information heard");
assert.equal(initial.items.length,0,"rumor is not a weapon award");
const kills=test.depart();
assert.ok(kills>=10,"test reaches boss");
assert.equal(initial.items.length,0,"no random weapon with bad luck, and rumor grants none");
assert.ok(initial.gold>0&&initial.materials>=1,"gold gained and boss material");
assert.match(test.E.lootReport.textContent,/今回の収穫/);
assert.equal(initial.merchant.visiting,false,"merchant leaves at departure");
test.back();
assert.equal(test.E.goldCount.textContent,initial.gold+" G");
assert.equal(test.E.materialCount.textContent,String(initial.materials));
test.E.inviteMerchant.click();
const goldBeforeSale=initial.gold,materialBeforeSale=initial.materials;
test.E.merchantOffers.children[2].children[1].click();
assert.equal(initial.gold,goldBeforeSale+2,"material sold for gold");
assert.equal(initial.materials,materialBeforeSale-1);
const priorItems=initial.items.length,priorGold=initial.gold;
test.E.merchantOffers.children[0].children[1].click();
assert.equal(initial.items.length,priorItems+1,"shop weapon bought");
assert.equal(initial.gold,priorGold-10,"purchase costs ten gold");
test.E.inventory.children[0].children[1].children[0].click();
assert.ok(initial.equipment.prince,"bought weapon equipped");
test.E.speedToggle.click();
assert.equal(test.E.speedToggle.textContent,"速度：4倍");
assert.equal(test.E.speedToggle.attrs["aria-pressed"],"true");
test.E.speedToggle.click();
assert.equal(test.E.speedToggle.textContent,"速度：1倍");
const slow=scenario({random:.99,power:18}),fast=scenario({random:.99,power:18});
slow.selectRumor();fast.selectRumor();
slow.E.departButton.click();fast.E.speedToggle.click();fast.E.departButton.click();
slow.step(100);fast.step(100);
assert.ok(fast.game.battle().kills>slow.game.battle().kills,
 "4x should advance further in the same number of animation frames: 1x="+slow.game.battle().kills+" 4x="+fast.game.battle().kills);
const sparse=scenario({random:.99,power:30});
sparse.selectRumor();sparse.depart();
assert.equal(sparse.game.battle().drops.length,0,"normal and boss gear drop not guaranteed");
const lucky=scenario({random:0,power:30});
lucky.selectRumor();lucky.depart();
assert.ok(lucky.game.battle().drops.length>0,"weapons still can drop");
assert.ok(lucky.game.state.items.length>0);
console.log("v0.8 PASS: rumor only, sparse drops, gold/materials, merchant trade, 1x/4x speed, party battle");
