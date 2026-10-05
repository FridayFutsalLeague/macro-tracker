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

 // Breakfast: eggs, toast and a small coffee cup.
 if(type==="breakfast")return `<svg ${common}>
   <rect x="10" y="31" width="25" height="18" rx="5" fill="#E9B75F" stroke="#C8903A" stroke-width="2"/>
   <path d="M14 35h17M14 40h17" stroke="#F8D993" stroke-width="2" stroke-linecap="round"/>
   <path d="M28 21c8-3 15 1 15 8 0 7-6 11-13 10-8-1-11-9-7-14 1-2 3-3 5-4Z" fill="#fff" stroke="#E5DCC7" stroke-width="2"/>
   <circle cx="33" cy="29" r="5" fill="#F5A623"/>
   <path d="M44 31h7v11c0 4-3 7-7 7h-5V34h5" fill="#fff" stroke="#D8B25B" stroke-width="2"/>
   <path d="M51 34h3c4 0 4 7 0 7h-3" fill="none" stroke="#D8B25B" stroke-width="2"/>
 </svg>`;

 // Lunch: sandwich + salad/veg on a lunch plate.
 if(type==="lunch")return `<svg ${common}>
   <ellipse cx="32" cy="42" rx="24" ry="11" fill="#fff" stroke="#9DB8E8" stroke-width="2"/>
   <path d="M12 39l12-16 13 16H12Z" fill="#E9B768" stroke="#C9974F" stroke-width="2"/>
   <path d="M18 35l6-8 7 8H18Z" fill="#7BC47A"/>
   <path d="M37 27c7-5 15-1 16 6-6 0-11 2-15 7-5-3-5-9-1-13Z" fill="#72BE74"/>
   <circle cx="45" cy="33" r="3.5" fill="#E85D5D"/>
   <circle cx="40" cy="40" r="3" fill="#F1D15A"/>
 </svg>`;

 // Dinner: protein + vegetables on a dinner plate.
 if(type==="dinner")return `<svg ${common}>
   <ellipse cx="32" cy="40" rx="24" ry="13" fill="#fff" stroke="#B69ADE" stroke-width="2"/>
   <path d="M16 36c3-8 11-12 19-9 6 2 9 7 8 12-7 5-19 7-27-3Z" fill="#D59B72" stroke="#B57952" stroke-width="2"/>
   <path d="M20 32c5-3 11-3 17 0" fill="none" stroke="#F0C0A0" stroke-width="2" stroke-linecap="round"/>
   <circle cx="47" cy="33" r="5" fill="#74B96B"/>
   <circle cx="49" cy="43" r="4" fill="#F0B95F"/>
   <path d="M43 44c-3 0-6-2-7-5" fill="none" stroke="#75A9D7" stroke-width="3" stroke-linecap="round"/>
 </svg>`;

 // Morning snack: fruit.
 if(type==="snack1")return `<svg ${common}>
   <path d="M31 17c4-6 9-7 13-5-2 5-6 8-11 8" fill="#68A85B"/>
   <path d="M32 20c-11 0-18 8-18 18 0 10 8 18 18 18s18-8 18-18c0-10-7-18-18-18Z" fill="#E45C5C"/>
   <path d="M32 19c1-4 3-7 6-10" stroke="#6D8B52" stroke-width="3" stroke-linecap="round"/>
   <path d="M21 31c3-3 6-4 9-4" stroke="#F28B8B" stroke-width="3" stroke-linecap="round"/>
 </svg>`;

 // Afternoon snack: yoghurt cup with berries.
 if(type==="snack2")return `<svg ${common}>
   <path d="M17 25h30l-4 27H21l-4-27Z" fill="#fff" stroke="#8CC49C" stroke-width="2"/>
   <path d="M20 29h24l-1 7H21l-1-7Z" fill="#EAF7EC"/>
   <ellipse cx="32" cy="24" rx="17" ry="5" fill="#F6FAF7" stroke="#8CC49C" stroke-width="2"/>
   <circle cx="27" cy="39" r="4" fill="#D95C7B"/>
   <circle cx="36" cy="43" r="4" fill="#7C65B2"/>
   <path d="M43 18l7-7" stroke="#7A8796" stroke-width="3" stroke-linecap="round"/>
 </svg>`;

 // Evening snack: protein/snack bar + nuts.
 return `<svg ${common}>
   <rect x="11" y="24" width="34" height="20" rx="6" fill="#E9C58B" stroke="#BF9658" stroke-width="2"/>
   <path d="M17 30h22M17 35h16" stroke="#FFF0CE" stroke-width="2" stroke-linecap="round"/>
   <ellipse cx="49" cy="39" rx="6" ry="8" fill="#C18C5A" transform="rotate(25 49 39)"/>
   <path d="M47 34c2 2 4 5 4 9" stroke="#9A6842" stroke-width="2" stroke-linecap="round"/>
 </svg>`;
}

function renderWeek(){
 const start=weekStart(selected),end=new Date(start);end.setDate(start.getDate()+6);let html="";
 weekLabel.textContent=`${start.toLocaleDateString("en-AU",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}`;
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
function getWeekData(){
 const start=weekStart(selected),days=[];let total={calories:0,protein:0};
 for(let i=0;i<7;i++){
   const d=new Date(start);d.setDate(start.getDate()+i);const date=localKey(d),t=dayTotals(getDay(date));
   total.calories+=t.calories;total.protein+=t.protein;days.push({date,totals:t});
 }
 return {start,days,total};
}
function renderWeeklyProgress(){
 const w=getWeekData(),calTarget=targets.calories*7,proTarget=targets.protein*7;
 const calPct=calTarget?Math.round(w.total.calories/calTarget*100):0;
 const proPct=proTarget?Math.round(w.total.protein/proTarget*100):0;
 const calDiff=calTarget-w.total.calories,proDiff=proTarget-w.total.protein;
 const end=new Date(w.start);end.setDate(w.start.getDate()+6);

 // Dynamic targets are calculated from week-to-date through the selected day only.
 // Future-day entries do not distort the "what should I aim for next?" figure.
 const selectedDateObj=new Date(selected+"T12:00:00");
 const selectedOffset=Math.max(0,Math.min(6,(selectedDateObj.getDay()+6)%7));
 const daysElapsed=selectedOffset+1;
 const daysRemaining=7-daysElapsed;

 let throughSelected={calories:0,protein:0};
 for(let i=0;i<=selectedOffset;i++){
   throughSelected.calories+=w.days[i].totals.calories;
   throughSelected.protein+=w.days[i].totals.protein;
 }

 const remainingCalBudget=calTarget-throughSelected.calories;
 const remainingProBudget=proTarget-throughSelected.protein;
 const dynamicCal=daysRemaining>0?remainingCalBudget/daysRemaining:null;
 const dynamicPro=daysRemaining>0?remainingProBudget/daysRemaining:null;

 let insight="";
 if(daysRemaining>0){
   const calStatus=dynamicCal>=0
     ? `Aim for about <b>${Math.round(dynamicCal).toLocaleString()} kcal/day</b>`
     : `The weekly calorie target is already exceeded by <b>${Math.round(Math.abs(remainingCalBudget)).toLocaleString()} kcal</b>`;
   const proStatus=dynamicPro>=0
     ? `and <b>${Math.round(dynamicPro)}g protein/day</b>`
     : `and the weekly protein target is already exceeded by <b>${Math.round(Math.abs(remainingProBudget))}g</b>`;
   insight=`Based on everything logged through ${selectedDateObj.toLocaleDateString("en-AU",{weekday:"long"})}, ${calStatus} ${proStatus} across the remaining <b>${daysRemaining}</b> ${daysRemaining===1?"day":"days"} to land on your weekly totals.`;
 }else{
   insight=`Week complete. Your final weekly balance is shown above.`;
 }

 const dynamicTargetsHtml=daysRemaining>0?`
   <div class="dynamic-targets">
     <div class="dynamic-title">
       <div><p class="eyebrow">UPDATED DAILY TARGET</p><h3>For the remaining ${daysRemaining} ${daysRemaining===1?"day":"days"}</h3></div>
       <span>Summary only</span>
     </div>
     <div class="dynamic-grid">
       <div class="dynamic-item cal-target">
         <small>Calories / day</small>
         <strong>${dynamicCal>=0?Math.round(dynamicCal).toLocaleString():"0"} <em>kcal</em></strong>
         <p>${dynamicCal>targets.calories?"You have extra room from earlier days":dynamicCal<targets.calories?"Adjusted down to balance the week":"Right on your original target"}</p>
       </div>
       <div class="dynamic-item pro-target">
         <small>Protein / day</small>
         <strong>${dynamicPro>=0?Math.round(dynamicPro):0} <em>g</em></strong>
         <p>${dynamicPro>targets.protein?"More needed to catch the weekly target":dynamicPro<targets.protein?"Ahead of your weekly protein pace":"Right on your original target"}</p>
       </div>
     </div>
     <div class="original-target-note">Your main targets stay <b>${targets.calories.toLocaleString()} kcal</b> and <b>${targets.protein}g protein</b>. This is only the adjusted rest-of-week guide.</div>
   </div>`:"";

 weeklyProgress.innerHTML=`
   <div class="weekly-head"><div><p class="eyebrow">WEEKLY BALANCE</p><h2>Weekly Progress</h2></div><div class="weekly-range">${w.start.toLocaleDateString("en-AU",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</div></div>
   <div class="weekly-stat">
     <div class="weekly-stat-head"><b>Calories</b><span>${Math.round(w.total.calories).toLocaleString()} / ${calTarget.toLocaleString()} kcal · ${calPct}%</span></div>
     <div class="weekly-bar"><div class="weekly-fill cal" style="width:${Math.min(100,Math.max(0,calPct))}%"></div></div>
     <div class="weekly-status"><span>${targets.calories.toLocaleString()} daily × 7</span><strong class="${calDiff>=0?"status-neutral":"status-warn"}">${calDiff>=0?`${Math.round(calDiff).toLocaleString()} kcal left`:`${Math.round(Math.abs(calDiff)).toLocaleString()} kcal over`}</strong></div>
   </div>
   <div class="weekly-stat">
     <div class="weekly-stat-head"><b>Protein</b><span>${Math.round(w.total.protein).toLocaleString()} / ${proTarget.toLocaleString()} g · ${proPct}%</span></div>
     <div class="weekly-bar"><div class="weekly-fill pro" style="width:${Math.min(100,Math.max(0,proPct))}%"></div></div>
     <div class="weekly-status"><span>${targets.protein} daily × 7</span><strong class="${proDiff>0?"status-neutral":"status-good"}">${proDiff>0?`${Math.round(proDiff).toLocaleString()} g still needed`:`${Math.round(Math.abs(proDiff)).toLocaleString()} g above target`}</strong></div>
   </div>
   ${dynamicTargetsHtml}
   <div class="weekly-insight">${insight}</div>`;
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
function render(){renderWeek();renderProgress();renderMeals();renderWeeklyProgress();renderHistory();renderPresets()}
function toast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toastEl.classList.remove("show"),1800)}
const toastEl=document.querySelector("#toast");

weekTabs.addEventListener("click",e=>{const b=e.target.closest("[data-date]");if(!b)return;selected=b.dataset.date;render()});
prevWeek.addEventListener("click",()=>{const d=new Date(selected+"T12:00:00");d.setDate(d.getDate()-7);selected=localKey(d);render()});
nextWeek.addEventListener("click",()=>{const d=new Date(selected+"T12:00:00");d.setDate(d.getDate()+7);selected=localKey(d);render()});
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
 save(dayStorageKey(),day);renderProgress();renderWeeklyProgress();
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
