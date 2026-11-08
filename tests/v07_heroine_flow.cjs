// v0.7 smoke: node tests/v07_heroine_flow.cjs (from repository root).
// Node only: no browser, network or external package.
const fs=require("node:fs"),assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,"inline game JS");
new Function(match[1]);

function scenario({power=110,random=0.99,apprentice=false}={}){
  const E={};let frame,time=1000;
  function element(tag="div"){
    let value="";
    const e={tag,style:{},children:[],listeners:{},hidden:false,classList:{toggle(){}},
      appendChild(x){this.children.push(x);return x},
      addEventListener(k,f){this.listeners[k]=f},
      click(){this.listeners.click?.()},
      focus(){this.focused=true}};
    Object.defineProperty(e,"textContent",{get(){return value},set(x){value=String(x);this.children=[]}});
    return e;
  }
  const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(t,k)=>t[k]||(()=>{})});
  const document={
    getElementById(id){if(!E[id])E[id]=element(id);if(id==="scene")E[id].getContext=()=>ctx;return E[id]},
    createElement:element
  };
  const math=Object.create(Math);math.random=()=>random;
  const seed=(power?"state.prince.atk="+power+";state.maid.atk="+power+";":"")+
    (apprentice?'state.people.push("apprentice");state.party.push("apprentice");':"");
  const script=match[1].replace("var planning=null;",seed+"var planning=null;");
  new Function("document","requestAnimationFrame","Math",script)(document,fn=>frame=fn,math);
  const choices=()=>E.choices.children.map(c=>c.children[0].textContent);
  function select(hint){
    const button=E.choices.children.find(c=>c.children[0].textContent.includes(hint));
    assert.ok(button,"missing proposal: "+hint+" in "+choices());button.click();
  }
  function frames(){
    let count=0;
    while(E.resultPanel.hidden&&count++<18000){
      const next=frame;time+=35;next(time);
      if(!E.rescueModal.hidden)return "rescue";
    }
    assert.ok(count<18000,"battle completes");
    return "result";
  }
  return {E,choices,select,frames,
    depart(){E.departButton.click();return frames()},
    resume(){E.rescueContinue.click();return frames()},
    back(){E.backButton.click()},
    tick(n){for(let i=0;i<n;i++){const f=frame;time+=35;f(time)}}};
}

const first=scenario();
assert.equal(first.E.relationValue.textContent,"1 / 5","initial meeting");
assert.equal(first.choices().length,3,"randomized three proposals");
assert.ok(first.choices().some(s=>s.includes("娘さんと初めて")),"initial exchange always available");
first.select("娘さんと初めて");
assert.equal(first.E.relationValue.textContent,"2 / 5");
assert.equal(first.depart(),"rescue","rescue popup at tenth enemy");
assert.match(first.E.rescueStory.textContent,/10体目/);
const encounter=first.E.encounterLabel.textContent;
first.tick(40);
assert.equal(first.E.encounterLabel.textContent,encounter,"modal pauses simulation");
assert.equal(first.resume(),"result","can resume after closing modal");
assert.equal(first.E.heroineResult.hidden,false);
first.back();
assert.ok(first.E.partyRoster.children.some(x=>x.children[0].textContent.includes("村長の娘")));
assert.match(first.E.daughterStatus.textContent,/遠征に参加/);
assert.ok(!first.choices().some(x=>x.includes("娘さん")),"no further heroine proposals");
first.select(first.choices()[0]);
assert.equal(first.depart(),"result","no duplicate rescue");
first.back();

const after=scenario({random:0});
after.select("娘さんと初めて");
assert.equal(after.depart(),"rescue");
after.resume();after.back();
after.select(after.choices()[0]);
assert.equal(after.depart(),"result");
assert.equal(after.E.postBattleHeroine.hidden,false,"after-battle heroine event");
assert.match(after.E.postBattleHeroine.textContent,/招いて/);
after.back();
assert.equal(after.E.relationValue.textContent,"5 / 5","affinity cap");

const full=scenario({random:0,apprentice:true});
full.select("娘さんと初めて");assert.equal(full.depart(),"rescue");
full.resume();full.back();
assert.match(full.E.daughterStatus.textContent,/待機/,"full 3-person slot");
assert.equal(full.E.partyRoster.children.length,2);
full.E.partyRoster.children[0].children[1].click(); // apprentice waits
full.E.partyRoster.children[1].children[1].click(); // daughter joins
assert.match(full.E.daughterStatus.textContent,/遠征に参加/);
full.select(full.choices()[0]);assert.equal(full.depart(),"result","new party fights");full.back();

const noTalk=scenario({power:0,random:0.99});
const other=noTalk.choices().find(x=>!x.includes("娘さんと初めて"));
noTalk.select(other);
assert.equal(noTalk.depart(),"result","normal first expedition");
noTalk.back();
assert.equal(noTalk.E.relationValue.textContent,"1 / 5","no pre-rescue random interaction");
assert.ok(noTalk.choices().some(x=>x.includes("娘さんと初めて")),"first exchange remains available");

const a=scenario({random:.02}),b=scenario({random:.98});
assert.notDeepEqual(a.choices(),b.choices(),"random proposal selection changes");
console.log("v0.7 PASS: encounter, proposal sampling, rescue gating/modal/pause, ally recruitment, 3-slot party, post-battle relationship, no duplicate");
