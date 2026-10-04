const mealTypes=[
 {name:"Breakfast",kind:"breakfast",art:"breakfast"},
 {name:"Snack",kind:"snack",art:"snack1"},
 {name:"Lunch",kind:"lunch",art:"lunch"},
 {name:"Snack",kind:"snack",art:"snack2"},
 {name:"Dinner",kind:"dinner",art:"dinner"},
 {name:"Snack",kind:"snack",art:"snack3"}
];
const defaults={calories:2000,protein:140};
let selected=todayKey(),targets=load("macroTargets",defaults),view="today";

function localKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function todayKey(){return localKey(new Date())}
function load(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function dayStorageKey(date=selected){return "macroDay:"+date}
function blankDay(){return mealTypes.map((m,i)=>({...m,id:i,dishes:[{text:"",calories:"",protein:""}]}))}
function getDay(date=selected){
  const raw=load(dayStorageKey(date),null);
  if(!raw)return blankDay();
  return mealTypes.map((m,i)=>{
    const old=raw[i]||{};
    let dishes=old.dishes;
    if(!Array.isArray(dishes)){
      dishes=[{text:old.text||"",calories:old.calories??old.macros?.calories??"",protein:old.protein??old.macros?.protein??""}];
    }
    if(!dishes.length)dishes=[{text:"",calories:"",protein:""}];
    return {...m,id:i,dishes};
  });
}
function presets(){return load("macroPresets",[])}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dayTotals(day){return day.reduce((a,m)=>{m.dishes.forEach(d=>{a.calories+=Number(d.calories)||0;a.protein+=Number(d.protein)||0});return a},{calories:0,protein:0})}
function weekStart(date){const d=new Date(date+"T12:00:00"),offset=(d.getDay()+6)%7;d.setDate(d.getDate()-offset);return d}
function hasAnyData(day){return day.some(m=>m.dishes.some(d=>d.text||Number(d.calories)||Number(d.protein)))}

function artSvg(type){
 const common='viewBox="0 0 64 64" aria-hidden="true"';
 if(type==="breakfast")return `<svg ${common}><path d="M10 39h44c-1 10-9 17-22 17S11 49 10 39Z" fill="#fff" stroke="#D8B25B" stroke-width="2"/><path d="M15 38c3-9 11-14 20-14 8 0 14 4 17 10" fill="#F7C95B"/><circle cx="31" cy="30" r="7" fill="#fff"/><circle cx="31" cy="30" r="4" fill="#F6A623"/><path d="M18 20c4-7 9-9 14-9 5 0 9 2 13 7" fill="none" stroke="#C58F3C" stroke-width="3" stroke-linecap="round"/></svg>`;
 if(type==="lunch")return `<svg ${common}><circle cx="32" cy="34" r="20" fill="#fff" stroke="#9DB8E8" stroke-width="2"/><path d="M17 34c4-8 12-12 23-10 4 1 8 3 10 6-6 2-11 5-15 9-5-4-11-6-18-5Z" fill="#6FBF73"/><path d="M24 43c4-5 9-8 15-9 3 2 6 5 8 9-6 5-17 7-23 0Z" fill="#F0B96D"/><circle cx="24" cy="27" r="3" fill="#E85D5D"/><circle cx="42" cy="29" r="3" fill="#F1D15A"/></svg>`;
 if(type==="dinner")return `<svg ${common}><ellipse cx="32" cy="42" rx="23" ry="9" fill="#fff" stroke="#B69ADE" stroke-width="2"/><path d="M18 39c3-11 10-17 20-17 6 0 11 2 15 7-3 7-8 11-15 13-7 2-14 1-20-3Z" fill="#B982D8"/><path d="M22 33c5-4 10-6 15-6" fill="none" stroke="#7F5AA2" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="18" r="5" fill="#9AD58F"/><path d="M20 12v12" stroke="#6AA164" stroke-width="2"/></svg>`;
 if(type==="snack1")return `<svg ${common}><path d="M31 17c4-6 9-7 13-5-2 5-6 8-11 8" fill="#68A85B"/><path d="M32 20c-11 0-18 8-18 18 0 10 8 18 18 18s18-8 18-18c0-10-7-18-18-18Z" fill="#E45C5C"/><path d="M32 19c1-4 3-7 6-10" stroke="#6D8B52" stroke-width="3" stroke-linecap="round"/><path d="M21 31c3-3 6-4 9-4" stroke="#F28B8B" stroke-width="3" stroke-linecap="round"/></svg>`;
 if(type==="snack2")return `<svg ${common}><path d="M12 41c0-10 8-18 18-18 7 0 13 4 16 10-3 10-11 17-23 17-5 0-9-3-11-9Z" fill="#C89A6A"/><circle cx="24" cy="33" r="3" fill="#8B6545"/><circle cx="34" cy="28" r="3" fill="#8B6545"/><circle cx="39" cy="39" r="3" fill="#8B6545"/><path d="M47 18c4 2 6 6 5 10" fill="none" stroke="#71A35C" stroke-width="3" stroke-linecap="round"/></svg>`;
 return `<svg ${common}><path d="M14 31c0 13 8 23 18 23s18-10 18-23H14Z" fill="#F5E5EE" stroke="#C989A4" stroke-width="2"/><path d="M17 31c4-8 10-12 17-12 8 0 13 4 16 12" fill="#E96D9A"/><circle cx="24" cy="28" r="3" fill="#fff"/><circle cx="35" cy="24" r="3" fill="#fff"/><path d="M22 16c3-5 8-7 13-6" fill="none" stroke="#6FA35D" stroke-width="3" stroke-linecap="round"/></svg>`;
}

function renderWeek(){
 const start=weekStart(selected);let html="";
 for(let i=0;i<7;i++){
   const d=new Date(start);d.setDate(start.getDate()+i);const k=localKey(d);
   html+=`<button class="day-tab ${k===selected?"active":""} ${k===todayKey()?"today":""}" data-date="${k}"><span>${d.toLocaleDateString("en-AU",{weekday:"short"})}</span><b>${d.getDate()}</b></button>`;
 }
 weekTabs.innerHTML=html;
}
function renderProgress(){
 const t=dayTotals(getDay());
 progressGrid.innerHTML=["calories","protein"].map(k=>{
   const pct=Math.min(100,Math.round(t[k]/targets[k]*100)||0),unit=k==="calories"?"kcal":"g",label=k==="calories"?"Calories":"Protein";
   return `<div class="macro ${k}"><div class="ring" style="--p:${pct*3.6}deg"><strong>${pct}%</strong></div><b>${label}</b><small>${Math.round(t[k])} / ${targets[k]} ${unit}</small></div>`;
 }).join("");
}
function renderMeals(){
 const d=new Date(selected+"T12:00:00"),day=getDay();
 selectedDate.textContent=d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"});
 mealList.innerHTML=day.map((m,mi)=>`<article class="meal-card ${m.kind}" data-mi="${mi}">
   <div class="meal-title"><div class="food-art">${artSvg(m.art)}</div><div><h3>${m.name}</h3><small>${m.dishes.length} ${m.dishes.length===1?"dish":"dishes"}</small></div></div>
   ${m.dishes.map((x,di)=>dishHTML(x,di,m.dishes.length)).join("")}
   <button class="add-dish" data-mi="${mi}">＋ Add another dish</button>
 </article>`).join("");
}
function dishHTML(x,di,count){return `<div class="dish" data-di="${di}">
 <input class="dish-name" type="text" placeholder="Dish name" autocomplete="off" value="${esc(x.text)}">
 <div class="suggestions hidden"></div>
 <div class="input-row">
  <div class="input-wrap"><input class="macro-input cal" type="number" min="0" inputmode="numeric" placeholder="Calories" value="${esc(x.calories)}"><span class="unit">kcal</span></div>
  <div class="input-wrap"><input class="macro-input pro" type="number" min="0" step="0.1" inputmode="decimal" placeholder="Protein" value="${esc(x.protein)}"><span class="unit">g</span></div>
  ${count>1?'<button class="remove-dish" aria-label="Remove dish">×</button>':'<span></span>'}
 </div></div>`}
function renderHistory(){
 const entries=[];
 for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i);
   if(k&&k.startsWith("macroDay:")){
     const date=k.slice(9),day=getDay(date),t=dayTotals(day);
     if(hasAnyData(day))entries.push({date,t});
   }
 }
 entries.sort((a,b)=>b.date.localeCompare(a.date));
 historyList.innerHTML=entries.length?entries.map(e=>{
   const d=new Date(e.date+"T12:00:00");
   return `<div class="history-card"><button data-open="${e.date}"><b>${d.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</b><small>Tap to view this day</small></button><div class="history-macros"><b>${Math.round(e.t.calories)} kcal</b><span>${Math.round(e.t.protein)}g protein</span></div></div>`;
 }).join(""):`<div class="history-card"><div><b>No history yet</b><small>Your logged days will appear here.</small></div></div>`;
}
function renderPresets(){
 const p=presets();
 presetList.innerHTML=p.length?p.map((x,i)=>`<div class="preset-card"><div><b>${esc(x.name)}</b><br><small>${x.calories} kcal · ${x.protein}g protein</small></div><div class="preset-actions"><button data-edit="${i}">Edit</button><button data-del="${i}" aria-label="Delete">×</button></div></div>`).join(""):`<div class="preset-card"><div><b>No saved meals yet</b><br><small>Add regular meals for instant auto-fill.</small></div></div>`;
}
function render(){renderWeek();renderProgress();renderMeals();renderHistory();renderPresets()}
function toast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toastEl.classList.remove("show"),1800)}
const toastEl=document.querySelector("#toast");

weekTabs.addEventListener("click",e=>{const b=e.target.closest("[data-date]");if(!b)return;selected=b.dataset.date;render()});
mealList.addEventListener("click",e=>{
 const card=e.target.closest(".meal-card");if(!card)return;const mi=+card.dataset.mi,day=getDay();
 if(e.target.classList.contains("add-dish")){day[mi].dishes.push({text:"",calories:"",protein:""});save(dayStorageKey(),day);render();return}
 if(e.target.classList.contains("remove-dish")){const di=+e.target.closest(".dish").dataset.di;day[mi].dishes.splice(di,1);save(dayStorageKey(),day);render();return}
});
mealList.addEventListener("input",e=>{
 const card=e.target.closest(".meal-card"),dish=e.target.closest(".dish");if(!card||!dish)return;
 const mi=+card.dataset.mi,di=+dish.dataset.di,day=getDay(),x=day[mi].dishes[di];
 if(e.target.classList.contains("dish-name")){x.text=e.target.value;showSuggestions(dish,e.target.value)}
 if(e.target.classList.contains("cal"))x.calories=e.target.value;
 if(e.target.classList.contains("pro"))x.protein=e.target.value;
 save(dayStorageKey(),day);renderProgress();
});
function showSuggestions(dish,q){
 const box=dish.querySelector(".suggestions"),query=q.trim().toLowerCase();
 const matches=presets().filter(p=>query&&p.name.toLowerCase().includes(query)).slice(0,5);
 if(!matches.length){box.classList.add("hidden");return}
 box.innerHTML=matches.map(p=>`<button type="button" data-preset="${esc(p.name)}"><b>${esc(p.name)}</b><small>${p.calories} kcal · ${p.protein}g protein</small></button>`).join("");
 box.classList.remove("hidden");
}
mealList.addEventListener("mousedown",e=>{
 const b=e.target.closest("[data-preset]");if(!b)return;e.preventDefault();
 const card=b.closest(".meal-card"),dish=b.closest(".dish"),mi=+card.dataset.mi,di=+dish.dataset.di,p=presets().find(x=>x.name===b.dataset.preset),day=getDay();
 if(p){day[mi].dishes[di]={text:p.name,calories:p.calories,protein:p.protein};save(dayStorageKey(),day);render();toast("Saved meal added")}
});

document.querySelectorAll(".bottom-nav button").forEach(b=>b.addEventListener("click",()=>{
 view=b.dataset.view;document.querySelectorAll(".bottom-nav button").forEach(x=>x.classList.toggle("active",x===b));
 todayShell.classList.toggle("hidden",view!=="today");historyView.classList.toggle("hidden",view!=="history");savedView.classList.toggle("hidden",view!=="saved");
 if(view==="history")renderHistory();if(view==="saved")renderPresets();
}));
historyList.addEventListener("click",e=>{const b=e.target.closest("[data-open]");if(!b)return;selected=b.dataset.open;document.querySelector('[data-view="today"]').click();render()});
settingsBtn.addEventListener("click",()=>{targetCalories.value=targets.calories;targetProtein.value=targets.protein;settingsDialog.showModal()});
saveSettings.addEventListener("click",e=>{e.preventDefault();targets={calories:+targetCalories.value||defaults.calories,protein:+targetProtein.value||defaults.protein};save("macroTargets",targets);settingsDialog.close();render();toast("Targets saved")});
clearDay.addEventListener("click",()=>{if(confirm("Clear all meals for this day?")){localStorage.removeItem(dayStorageKey());render()}});
addPreset.addEventListener("click",()=>{presetEdit.value="";presetName.value="";presetCalories.value="";presetProtein.value="";presetDialog.showModal()});
savePreset.addEventListener("click",e=>{
 e.preventDefault();const name=presetName.value.trim();if(!name){toast("Enter a meal name");return}
 const p=presets(),item={name,calories:+presetCalories.value||0,protein:+presetProtein.value||0},idx=presetEdit.value;
 if(idx==="")p.push(item);else p[+idx]=item;save("macroPresets",p);presetDialog.close();renderPresets();toast("Saved meal updated");
});
presetList.addEventListener("click",e=>{
 const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-del]"),p=presets();
 if(edit){const i=+edit.dataset.edit,x=p[i];presetEdit.value=i;presetName.value=x.name;presetCalories.value=x.calories;presetProtein.value=x.protein;presetDialog.showModal()}
 if(del&&confirm("Delete this saved meal?")){p.splice(+del.dataset.del,1);save("macroPresets",p);renderPresets()}
});

if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
render();
