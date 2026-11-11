(() => {
  const cfg = window.PORTAL_CONFIG;
  const $ = (id) => document.getElementById(id);
  const state = { records: [], filtered: [] };
  const palette = ["#2563eb","#16a078","#e1a23b","#8b5cf6","#df6870","#64748b"];
  const money = value => new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",maximumFractionDigits:2}).format(Number(value||0));
  const date = value => value ? new Date(value).toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const normal = value => String(value ?? "").replace(/([a-z])([A-Z])/g,"$1 $2");
  const statusClass = value => "status-" + String(value||"").toLowerCase().replace(/[^a-z]/g,"");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const showToast = message => { $("toast").textContent=message; $("toast").classList.add("show"); setTimeout(()=>$("toast").classList.remove("show"),2600); };
  const setApi = online => { $("apiDot").className="dot "+(online?"online":"offline"); $("apiStatus").textContent=online?"API connected":"API unavailable"; };

  function getStatus(record) {
    if (cfg.entity==="policies") return record.isActive ? "Active" : "Inactive";
    return record.status || "Unknown";
  }
  function statusCounts(records) {
    const counts={}; records.forEach(r=>{const s=getStatus(r);counts[s]=(counts[s]||0)+1;}); return counts;
  }
  function renderKpis(records) {
    const counts=statusCounts(records); let values=[];
    if(cfg.entity==="claims") values=[records.length,counts.Pending||0,counts.InProgress||0,counts.Approved||0];
    else if(cfg.entity==="policies") values=[records.length,counts.Active||0,counts.Inactive||0,money(records.reduce((a,r)=>a+(r.isActive?Number(r.monthlyPremium||0):0),0))];
    else values=[records.length,counts.Open||0,counts.InProgress||0,counts.Resolved||0];
    $("kpiGrid").innerHTML=cfg.kpis.map((k,i)=>`<div class="kpi-card"><div class="kpi-label">${k[0]}</div><div class="kpi-value">${values[i]}</div><div class="kpi-note">${i===0?"Across your workspace":"Updated from live API records"}</div><div class="kpi-symbol">${["▦","◷","↗","✓"][i]}</div></div>`).join("");
  }
  function renderChart(records) {
    const counts=statusCounts(records), entries=Object.entries(counts), total=records.length;
    $("donutTotal").textContent=total;
    let start=0; const stops=entries.map(([name,count],i)=>{const end=start+(total?count/total*100:0);const s=`${palette[i%palette.length]} ${start}% ${end}%`;start=end;return s;});
    $("statusDonut").style.background=total?`conic-gradient(${stops.join(",")})`:"#e9edf4";
    $("chartLegend").innerHTML=entries.length?entries.map(([name,count],i)=>`<div class="legend-item"><span class="legend-left"><i class="legend-dot" style="background:${palette[i%palette.length]}"></i>${esc(name)}</span><strong>${count}</strong></div>`).join(""):'<span class="secondary-cell">No records yet</span>';
  }
  function renderInsights(records) {
    let lines=[];
    if(cfg.entity==="claims"){
      lines=[["Total claim value",money(records.reduce((a,r)=>a+Number(r.amount||0),0)),"Combined value of registered claims"],["Awaiting a decision",String(records.filter(r=>r.status==="Pending").length),"Claims still pending review"],["Latest submission",records.length?date([...records].sort((a,b)=>new Date(b.createdAtUtc)-new Date(a.createdAtUtc))[0].createdAtUtc):"—","Most recent claim date"]];
    } else if(cfg.entity==="policies"){
      lines=[["Active premium book",money(records.filter(r=>r.isActive).reduce((a,r)=>a+Number(r.monthlyPremium||0),0)),"Combined monthly active premiums"],["Unique cover types",String(new Set(records.map(r=>r.coverType)).size),"Different cover categories"],["Active policy rate",records.length?Math.round(records.filter(r=>r.isActive).length/records.length*100)+"%":"0%","Share of active policies"]];
    } else {
      lines=[["High priority tickets",String(records.filter(r=>["High","Urgent"].includes(r.priority)).length),"Tickets needing extra attention"],["Open workload",String(records.filter(r=>["Open","InProgress"].includes(r.status)).length),"Tickets not yet resolved"],["Latest request",records.length?date([...records].sort((a,b)=>new Date(b.createdAtUtc)-new Date(a.createdAtUtc))[0].createdAtUtc):"—","Most recent ticket date"]];
    }
    $("insightList").innerHTML=lines.map((x,i)=>`<div class="insight"><div class="insight-mark">${["◈","◎","↗"][i]}</div><div class="insight-text"><strong>${x[0]}</strong><small>${x[2]}</small></div><div class="insight-value">${x[1]}</div></div>`).join("");
  }
  function buildHeaders() {
    let labels=cfg.entity==="claims"?["Claim","Employee","Amount","Status","Submitted","Actions"]:cfg.entity==="policies"?["Policy number","Policyholder","Cover type","Monthly premium","Start date","Status","Actions"]:["Ticket","Requester","Priority","Status","Created","Actions"];
    $("tableHead").innerHTML="<tr>"+labels.map(l=>`<th>${l}</th>`).join("")+"</tr>";
    $("statusFilter").innerHTML='<option value="">All statuses</option>'+cfg.statusValues.map(s=>`<option value="${s}">${normal(s)}</option>`).join("");
  }
  function row(record) {
    if(cfg.entity==="claims") return `<td><span class="primary-cell">CLM-${String(record.id).padStart(4,"0")}</span><span class="secondary-cell">${esc(record.description)}</span></td><td>${esc(record.employeeName)}</td><td>${money(record.amount)}</td><td><span class="status-badge ${statusClass(record.status)}">${esc(normal(record.status))}</span></td><td>${date(record.createdAtUtc)}</td><td>${actionButtons(record)}</td>`;
    if(cfg.entity==="policies") return `<td><span class="primary-cell">${esc(record.policyNumber)}</span></td><td>${esc(record.policyholderName)}</td><td>${esc(record.coverType)}</td><td>${money(record.monthlyPremium)}</td><td>${date(record.startDate)}</td><td><span class="status-badge ${statusClass(getStatus(record))}">${getStatus(record)}</span></td><td>${actionButtons(record)}</td>`;
    return `<td><span class="primary-cell">#${record.id} · ${esc(record.title)}</span><span class="secondary-cell">${esc(record.description)}</span></td><td>${esc(record.requestedBy)}</td><td><span class="priority-badge priority-${String(record.priority).toLowerCase()}">${esc(record.priority)}</span></td><td><span class="status-badge ${statusClass(record.status)}">${esc(normal(record.status))}</span></td><td>${date(record.createdAtUtc)}</td><td>${actionButtons(record)}</td>`;
  }
  function actionButtons(record) {
    const canChange=cfg.entity==="policies" || !["Approved","Rejected","Resolved","Closed"].includes(record.status);
    return `<div class="row-actions"><button class="small-action" data-view="${record.id}">View</button>${canChange?`<button class="small-action" data-change="${record.id}">${cfg.entity==="policies"?"Toggle":"Update"}</button>`:""}</div>`;
  }
  function renderTable() {
    const q=$("searchInput").value.toLowerCase(), filter=$("statusFilter").value;
    state.filtered=state.records.filter(r=>{
      const blob=JSON.stringify(r).toLowerCase(); const status=getStatus(r);
      return blob.includes(q)&&(!filter||status===filter);
    });
    $("recordsBody").innerHTML=state.filtered.length?state.filtered.map(r=>`<tr>${row(r)}</tr>`).join(""):`<tr><td class="loading-cell" colspan="8">${cfg.empty}</td></tr>`;
    $("recordCount").textContent=`Showing ${state.filtered.length} of ${state.records.length} records`;
    document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>viewRecord(Number(b.dataset.view))));
    document.querySelectorAll("[data-change]").forEach(b=>b.addEventListener("click",()=>changeStatus(Number(b.dataset.change))));
  }
  async function load() {
    $("recordsBody").innerHTML='<tr><td class="loading-cell" colspan="8">Loading records…</td></tr>';
    try {
      const response=await fetch(cfg.api); if(!response.ok) throw new Error(`API returned ${response.status}`);
      state.records=await response.json(); setApi(true);
      renderKpis(state.records);renderChart(state.records);renderInsights(state.records);renderTable();
    } catch(error) { setApi(false);$("recordsBody").innerHTML=`<tr><td class="loading-cell" colspan="8">Could not load data. Ensure the API is running. ${esc(error.message)}</td></tr>`; }
  }
  async function viewRecord(id) {
    const record=state.records.find(r=>r.id===id); if(!record)return;
    const details=Object.entries(record).map(([k,v])=>`${normal(k)}: ${v??"—"}`).join("\n");
    alert(details);
  }
  async function changeStatus(id) {
    const record=state.records.find(r=>r.id===id); if(!record)return;
    if(cfg.entity==="policies"){
      const body={policyNumber:record.policyNumber,policyholderName:record.policyholderName,coverType:record.coverType,monthlyPremium:record.monthlyPremium,startDate:record.startDate,isActive:!record.isActive};
      if(!confirm(`Set policy ${record.policyNumber} to ${body.isActive?"Active":"Inactive"}?`))return;
      try {const res=await fetch(`${cfg.api}/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!res.ok)throw new Error(await res.text());showToast("Policy updated");await load();}catch(e){showToast("Update failed: "+e.message);}
    } else {
      const options=cfg.statusValues.filter(s=>s!==record.status);
      const chosen=prompt("Enter new status:\n"+options.join(", "),options[0]||"");
      if(!chosen)return;
      const match=options.find(s=>s.toLowerCase()===chosen.trim().toLowerCase());
      if(!match){showToast("Please enter one of the listed statuses.");return;}
      try {const res=await fetch(`${cfg.api}/${id}${cfg.statusRoute}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:match})});if(!res.ok){const msg=await res.text();throw new Error(msg||`HTTP ${res.status}`);}showToast("Status updated");await load();}catch(e){showToast("Update failed: "+e.message);}
    }
  }
  function openModal(){ $("modalBackdrop").hidden=false;$("formError").textContent="";$("recordForm").reset(); }
  function closeModal(){ $("modalBackdrop").hidden=true; }
  function buildForm(){
    $("formFields").innerHTML=cfg.createFields.map(([name,label,type,required])=>{
      let input="";
      if(type==="textarea")input=`<textarea name="${name}" ${required?"required":""}></textarea>`;
      else if(type==="select")input=`<select name="${name}" required><option value="Low">Low</option><option value="Normal" selected>Normal</option><option value="High">High</option><option value="Urgent">Urgent</option></select>`;
      else input=`<input name="${name}" type="${type}" ${type==="number"?'min="0" step="0.01"':""} ${required?"required":""}>`;
      return `<div class="field ${type==="textarea"?"full":""}"><label>${label}</label>${input}</div>`;
    }).join("");
  }
  async function createRecord(event){
    event.preventDefault();$("formError").textContent="";
    const data=Object.fromEntries(new FormData(event.target).entries());
    if(cfg.entity==="claims")data.amount=Number(data.amount);
    if(cfg.entity==="policies"){data.monthlyPremium=Number(data.monthlyPremium);data.isActive=true;}
    try{
      const res=await fetch(cfg.api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      if(!res.ok){let msg=await res.text();try{msg=JSON.parse(msg).message||msg;}catch{}throw new Error(msg||`Request failed (${res.status})`);}
      closeModal();showToast("Record created successfully");await load();
    }catch(e){$("formError").textContent=e.message;}
  }
  $("todayLabel").textContent=new Date().toLocaleDateString("en-ZA",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
  buildHeaders();buildForm();load();
  $("newRecordBtn").addEventListener("click",openModal);$("closeModal").addEventListener("click",closeModal);$("cancelModal").addEventListener("click",closeModal);
  $("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal();});
  $("recordForm").addEventListener("submit",createRecord);$("searchInput").addEventListener("input",renderTable);$("statusFilter").addEventListener("change",renderTable);$("refreshBtn").addEventListener("click",load);
})();
