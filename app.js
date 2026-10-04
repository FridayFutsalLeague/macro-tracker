const API_URL = "https://macro-tracker-api.fridayfutsalleague.workers.dev/";
const slots = ["Breakfast","Snack","Lunch","Snack","Dinner","Snack"];
const defaults = { calories: 2000, protein: 140, carbs: 220, fat: 65 };
let currentDate = todayKey();
let targets = load("macroTargets", defaults);

function todayKey(){const d=new Date(); return localKey(d)}
function localKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function load(k,fallback){try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch{return fallback}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function dayKey(){return `macroDay:${currentDate}`}
function getDay(){return load(dayKey(), slots.map((name,i)=>({name,id:i,text:"",macros:null})))}
function saveDay(day){save(dayKey(),day)}
function esc(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>el.classList.remove("show"),2600)}

function render(){
  const day=getDay();
  const d=new Date(currentDate+"T12:00:00");
  document.querySelector("#dateLabel").textContent = d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"});
  document.querySelector("#dateSub").textContent = currentDate===todayKey() ? "Today" : d.toLocaleDateString("en-AU",{year:"numeric"});
  const totals=day.reduce((a,m)=>{if(m.macros) for(const k of ["calories","protein","carbs","fat"]) a[k]+=Number(m.macros[k]||0);return a},{calories:0,protein:0,carbs:0,fat:0});
  const labels={calories:"Calories",protein:"Protein",carbs:"Carbs",fat:"Fat"};
  const units={calories:"kcal",protein:"g",carbs:"g",fat:"g"};
  document.querySelector("#progressGrid").innerHTML=["calories","protein","carbs","fat"].map(k=>{
    const pct=Math.min(100,Math.round(totals[k]/targets[k]*100)||0);
    return `<div class="macro ${k==="calories"?"cal":k}"><div class="ring" style="--p:${pct*3.6}deg"><strong>${pct}%</strong></div><b>${labels[k]}</b><small>${Math.round(totals[k])} / ${targets[k]} ${units[k]}</small></div>`;
  }).join("");

  document.querySelector("#mealList").innerHTML=day.map((m,i)=>{
    const x=m.macros;
    return `<article class="meal-card" data-i="${i}">
      <div class="meal-head"><h3>${m.name}</h3><span class="meal-number">${i+1} / 6</span></div>
      <textarea placeholder="What did you eat? e.g. 2 salmon avocado sushi rolls">${esc(m.text)}</textarea>
      <div class="meal-actions"><button class="primary calc">${x?"Recalculate":"Calculate macros"}</button>${x?'<button class="secondary remove">Clear</button>':""}</div>
      <div class="result ${x?"show":""}">${x?resultHTML(x):""}</div>
    </article>`;
  }).join("");
}
function resultHTML(x){
  return `<div class="result-grid">
    <div class="result-item"><b>${Math.round(x.calories)}</b><small>CALORIES</small></div>
    <div class="result-item"><b>${Math.round(x.protein)}g</b><small>PROTEIN</small></div>
    <div class="result-item"><b>${Math.round(x.carbs)}g</b><small>CARBS</small></div>
    <div class="result-item"><b>${Math.round(x.fat)}g</b><small>FAT</small></div>
  </div><p class="summary">${esc(x.summary||"")} ${x.confidence?`• ${esc(x.confidence)} confidence`:""}</p>`;
}

document.querySelector("#mealList").addEventListener("input",e=>{
  if(e.target.tagName!=="TEXTAREA") return;
  const card=e.target.closest(".meal-card"), i=+card.dataset.i, day=getDay();
  day[i].text=e.target.value; saveDay(day);
});
document.querySelector("#mealList").addEventListener("click",async e=>{
  const card=e.target.closest(".meal-card"); if(!card)return;
  const i=+card.dataset.i, day=getDay();
  if(e.target.classList.contains("remove")){day[i].text="";day[i].macros=null;saveDay(day);render();return}
  if(!e.target.classList.contains("calc"))return;
  const meal=card.querySelector("textarea").value.trim();
  if(!meal){toast("Enter your meal first.");return}
  const btn=e.target;btn.disabled=true;btn.textContent="Calculating…";
  try{
    const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({meal})});
    const data=await res.json();
    if(!res.ok) throw new Error(data.details||data.error||"Request failed");
    for(const k of ["calories","protein","carbs","fat"]) if(typeof data[k]!=="number") throw new Error("Invalid macro result");
    day[i].text=meal;day[i].macros=data;saveDay(day);render();toast("Macros added.");
  }catch(err){btn.disabled=false;btn.textContent="Calculate macros";toast("Couldn’t calculate: "+err.message)}
});

document.querySelector("#settingsBtn").onclick=()=>{
  document.querySelector("#targetCalories").value=targets.calories;
  document.querySelector("#targetProtein").value=targets.protein;
  document.querySelector("#targetCarbs").value=targets.carbs;
  document.querySelector("#targetFat").value=targets.fat;
  document.querySelector("#settingsDialog").showModal();
};
document.querySelector("#saveSettings").onclick=e=>{
  e.preventDefault();
  targets={
    calories:+document.querySelector("#targetCalories").value||defaults.calories,
    protein:+document.querySelector("#targetProtein").value||defaults.protein,
    carbs:+document.querySelector("#targetCarbs").value||defaults.carbs,
    fat:+document.querySelector("#targetFat").value||defaults.fat
  };
  save("macroTargets",targets);document.querySelector("#settingsDialog").close();render();toast("Targets saved.");
};
document.querySelector("#clearDay").onclick=()=>{
  if(confirm("Clear all meals for this day?")){localStorage.removeItem(dayKey());render()}
};
function moveDay(n){const d=new Date(currentDate+"T12:00:00");d.setDate(d.getDate()+n);currentDate=localKey(d);render()}
document.querySelector("#prevDay").onclick=()=>moveDay(-1);
document.querySelector("#nextDay").onclick=()=>moveDay(1);
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
render();
