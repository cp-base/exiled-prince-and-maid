// v0.4 smoke test: node tests/v04_smoke.cjs (no external dependencies)
const fs=require("node:fs");
const assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,"inline game script present");
const entries={};let nextFrame;
function element(tag="div"){
 let text="";const e={tag,style:{},children:[],listeners:{},hidden:false,classList:{toggle(){}},
 appendChild(n){this.children.push(n);return n},
 addEventListener(name,cb){this.listeners[name]=cb},
 click(){if(this.listeners.click)this.listeners.click()}};
 Object.defineProperty(e,"textContent",{get(){return text},set(value){text=String(value);this.children.length=0}});
 return e;
}
const canvasContext=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get(t,k){return t[k]||(()=>{})}});
const document={
 getElementById(id){if(!entries[id])entries[id]=element(id);if(id==="scene")entries[id].getContext=()=>canvasContext;return entries[id]},
 createElement:element
};
const dice=Object.create(Math);dice.random=()=>0; // deterministic discovery
new Function("document","requestAnimationFrame","Math",match[1])(document,cb=>{nextFrame=cb},dice);
const options=()=>entries.choices.children;
function choose(text){
 const button=options().find(n=>n.children[0]?.textContent.includes(text));
 assert.ok(button,"choice missing: "+text);button.click();
}
function expedition(){
 entries.departButton.click();let completed=false;
 for(let i=1;i<6000;i++){nextFrame(i*35);if(!entries.resultPanel.hidden){completed=true;break}}
 assert.ok(completed,"expedition should end");
}
assert.equal(entries.runs.textContent,"0");
choose("工房を立て直");
assert.equal(entries.townScore.textContent,"1 / 5");
assert.match(entries.princeText.textContent,/攻撃 4/);
assert.equal(entries.departButton.hidden,false);
assert.ok(entries.findsList.children.some(x=>x.children[0]?.textContent.includes("手入れ帳")));
assert.equal(entries.runs.textContent,"0");
expedition();entries.backButton.click();
assert.equal(entries.departButton.hidden,true);
choose("街道に古い剣");expedition();
assert.match(entries.lootReport.textContent,/剣を持ち帰りました/);
entries.backButton.click();
entries.inventory.children[0].children[1].children[0].click();
assert.match(entries.princeText.textContent,/攻撃 9/); // sword3 + forge1 + notes1 + base4
choose("街道を整え");
assert.equal(entries.townScore.textContent,"2 / 5");
assert.match(entries.princeText.textContent,/攻撃 9/);
console.log("v0.4 smoke PASS: town, discovery, separated departure, battles, equipment");
