import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { BarChart3, MapPin, Download, Upload, Search, Settings2, TrendingUp, Target, BriefcaseBusiness, Trash2, RefreshCw, Info, Plus, Layers, Building2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './style.css';

const STORAGE='geogrid-tracker-v2';
const GRID_SIZES=[3,5,7,9,11,13,15,17,19,21];
const PLATFORMS=['Google Maps','Apple Maps','Bing','Google AI Overviews','ChatGPT','Gemini'];
const DEFAULT_LOCATION={id:'loc-'+Date.now(),name:'Maxxis Car Keys & Remapps',keyword:'Auto Locksmith Manchester',location:'Swinton, Manchester, UK',lat:53.5098,lng:-2.3417,grid:5,radius:3,radiusUnit:'km',keywordType:'Traditional + AI Platforms',platforms:['Google Maps'],points:[]};
const DEFAULT_CAMPAIGN={id:'camp-'+Date.now(),name:'Track Ranking',defaults:{grid:5,radius:3,radiusUnit:'km',keywordType:'Traditional + AI Platforms',platforms:['Google Maps']},locations:[DEFAULT_LOCATION]};
function makePoints(cfg, old=[]){
 const n=Number(cfg.grid), radiusKm=Number(cfg.radius)*(cfg.radiusUnit==='mi'?1.60934:1), step=(2*radiusKm/Math.max(1,n-1))/111;
 const prior=Object.fromEntries(old.map(p=>[p.id,p.rank]));
 const out=[];
 for(let r=0;r<n;r++) for(let c=0;c<n;c++){
  const id=`${r}-${c}`;
  out.push({id,lat:Number(cfg.lat)+(r-(n-1)/2)*step,lng:Number(cfg.lng)+(c-(n-1)/2)*step/Math.cos(Number(cfg.lat)*Math.PI/180),rank:prior[id]??null});
 }
 return out;
}
function rankColor(rank){if(rank==null||rank==='')return '#94a3b8';if(Number(rank)<=3)return '#16a36a';if(Number(rank)<=10)return '#e59a24';return '#dc4d4d';}
function MapResize(){const map=useMap();useEffect(()=>{const t=setTimeout(()=>map.invalidateSize(),120);return()=>clearTimeout(t)},[map]);return null}
function safeLoad(){
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');
  if(raw?.campaigns?.length) return raw;
  const old=JSON.parse(localStorage.getItem('geogrid-tracker-v1')||'null');
  if(old){
   const loc={...DEFAULT_LOCATION,...old,id:'loc-migrated',name:old.business||DEFAULT_LOCATION.name,points:old.points?.length?old.points:makePoints({...DEFAULT_LOCATION,...old})};
   return {campaigns:[{...DEFAULT_CAMPAIGN,id:'camp-migrated',locations:[loc]}],activeCampaign:'camp-migrated',activeLocation:'loc-migrated',history:JSON.parse(localStorage.getItem('geogrid-tracker-v1-history')||'[]')};
  }
 }catch{}
 const loc={...DEFAULT_LOCATION,points:makePoints(DEFAULT_LOCATION)};
 return {campaigns:[{...DEFAULT_CAMPAIGN,locations:[loc]}],activeCampaign:DEFAULT_CAMPAIGN.id,activeLocation:loc.id,history:[]};
}
function App(){
 const [store,setStore]=useState(safeLoad);
 const [tab,setTab]=useState('Overview');
 const [editing,setEditing]=useState(true);
 const [notice,setNotice]=useState('');
 const [newCampaign,setNewCampaign]=useState(false);
 const [campaignName,setCampaignName]=useState('');
 const [newLocation,setNewLocation]=useState(false);
 const [editingCampaignName,setEditingCampaignName]=useState(false);
 const [campaignNameDraft,setCampaignNameDraft]=useState('');
 const [locationName,setLocationName]=useState('');
 const [locationAddress,setLocationAddress]=useState('');
 const campaigns=store.campaigns||[];
 const campaign=campaigns.find(c=>c.id===store.activeCampaign)||campaigns[0];
 const locations=campaign?.locations||[];
 const loc=locations.find(l=>l.id===store.activeLocation)||locations[0];
 const history=store.history||[];
 useEffect(()=>{localStorage.setItem(STORAGE,JSON.stringify(store));},[store]);
 useEffect(()=>{if(campaign&&!locations.some(l=>l.id===store.activeLocation))setStore(s=>({...s,activeCampaign:campaign.id,activeLocation:locations[0]?.id}));},[store.activeCampaign,store.activeLocation,campaign,locations]);
 const updateLocation=(patch)=>{
  if(!campaign||!loc)return;
  setStore(s=>({...s,campaigns:s.campaigns.map(c=>c.id!==campaign.id?c:{...c,locations:c.locations.map(l=>l.id===loc.id?{...l,...patch}:l)})}));
 };
 const updateField=(key,value)=>updateLocation({[key]:value});
 const points=loc?.points||[];
 const ranked=points.filter(p=>p.rank!==null&&p.rank!==''&&Number(p.rank)>0);
 const avg=ranked.length?ranked.reduce((sum,p)=>sum+Number(p.rank),0)/ranked.length:null;
 const top3=ranked.length?ranked.filter(p=>Number(p.rank)<=3).length/ranked.length*100:0;
 const top10=ranked.filter(p=>Number(p.rank)<=10).length;
 const updatePoints=(fn)=>updateLocation({points:fn(points)});
 const regenerate=()=>{updateLocation({points:makePoints(loc,[])});setNotice('Grid regenerated using the selected size, centre and radius. Enter fresh rankings for this grid.');};
 const saveScan=()=>{
  if(!ranked.length){setNotice('Enter at least one ranking position before saving a scan.');return;}
  const item={id:Date.now(),date:new Date().toISOString(),campaign:campaign.name,business:loc.name,keyword:loc.keyword,location:loc.location,avg:Number(avg.toFixed(1)),top3:ranked.filter(p=>Number(p.rank)<=3).length,total:ranked.length,grid:loc.grid,radius:loc.radius,radiusUnit:loc.radiusUnit,platforms:loc.platforms,points:points.map(p=>({...p}))};
  setStore(s=>({...s,history:[item,...s.history]}));setNotice('Scan saved to browser history.');
 };
 const createCampaign=()=>{
  const name=campaignName.trim();if(!name)return;
  const id='camp-'+Date.now(), locId='loc-'+Date.now();
  const defaults=campaign?.defaults||DEFAULT_CAMPAIGN.defaults;
  const fresh={...DEFAULT_LOCATION,...defaults,id:locId,name:'New business location',keyword:'',location:'',platforms:[...(defaults.platforms||[])],points:makePoints({...DEFAULT_LOCATION,...defaults})};
  setStore(s=>({...s,campaigns:[...s.campaigns,{id,name,locations:[fresh]}],activeCampaign:id,activeLocation:locId}));
  setCampaignName('');setNewCampaign(false);setTab('Settings');setNotice('Campaign created. Add its business and keyword details.');
 };
 const addLocation=()=>{
  if(!locationName.trim())return;
  const id='loc-'+Date.now();
  const defaults=campaign?.defaults||DEFAULT_CAMPAIGN.defaults;
  const fresh={...DEFAULT_LOCATION,...defaults,id,name:locationName.trim(),location:locationAddress.trim(),keyword:'',platforms:[...(defaults.platforms||[])],points:makePoints({...DEFAULT_LOCATION,...defaults})};
  setStore(s=>({...s,campaigns:s.campaigns.map(c=>c.id===campaign.id?{...c,locations:[...c.locations,fresh]}:c),activeLocation:id}));
  setLocationName('');setLocationAddress('');setNewLocation(false);setTab('Settings');
 };
 const renameCampaign=()=>{
  const name=campaignNameDraft.trim();if(!name)return;
  setStore(s=>({...s,campaigns:s.campaigns.map(c=>c.id===campaign.id?{...c,name}:c)}));
  setEditingCampaignName(false);setNotice('Campaign name updated.');
 };
 const deleteLocation=(locationId)=>{
  if(locations.length<=1){setNotice('A campaign must keep at least one business location.');return;}
  const target=locations.find(l=>l.id===locationId);
  if(!window.confirm(`Remove location "${target?.name||'this location'}" from this campaign?`))return;
  const remaining=locations.filter(l=>l.id!==locationId);
  setStore(s=>({...s,campaigns:s.campaigns.map(c=>c.id===campaign.id?{...c,locations:remaining}:c),activeLocation:locationId===loc.id?remaining[0].id:s.activeLocation}));
  setNotice('Business location removed.');
 };
 const deleteCampaign=()=>{
  if(campaigns.length<=1){setNotice('Keep at least one campaign in the workspace.');return;}
  if(!window.confirm(`Delete campaign "${campaign.name}" and its locations?`))return;
  const rest=campaigns.filter(c=>c.id!==campaign.id), next=rest[0];
  setStore(s=>({...s,campaigns:rest,activeCampaign:next.id,activeLocation:next.locations[0]?.id}));
 };
 const updateCampaignDefaults=(patch)=>setStore(s=>({...s,campaigns:s.campaigns.map(c=>c.id===campaign.id?{...c,defaults:{...(c.defaults||DEFAULT_CAMPAIGN.defaults),...patch}}:c)}));
 const toggleDefaultPlatform=(name)=>{const active=campaign.defaults?.platforms||DEFAULT_CAMPAIGN.defaults.platforms;updateCampaignDefaults({platforms:active.includes(name)?active.filter(x=>x!==name):[...active,name]});};
 const togglePlatform=(name)=>{
  const active=loc.platforms||[];
  updateField('platforms',active.includes(name)?active.filter(x=>x!==name):[...active,name]);
 };
 const exportCsv=()=>{
  const rows=[['point_id','latitude','longitude','rank'],...points.map(p=>[p.id,p.lat,p.lng,p.rank??''])];
  download(rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'),'geogrid-rankings.csv','text/csv');
 };
 const importCsv=(file)=>{
  const reader=new FileReader();reader.onload=()=>{
   const lines=String(reader.result).trim().split(/\r?\n/).slice(1), vals={};
   for(const line of lines){const a=line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)?.map(x=>x.replace(/,$/,'').replace(/^"|"$/g,'').replaceAll('""','"'));if(a?.length>=4)vals[a[0]]=a[3]===''?null:Number(a[3]);}
   updatePoints(old=>old.map(p=>({...p,rank:vals[p.id]??p.rank})));setNotice('CSV imported. Review rankings before saving.');
  };reader.readAsText(file);
 };
 const exportReport=()=>{
  const report=`LOCAL SEO GEOGRID REPORT\nCampaign: ${campaign.name}\nBusiness: ${loc.name}\nKeyword: ${loc.keyword}\nLocation: ${loc.location}\nGrid: ${loc.grid} x ${loc.grid}\nRadius: ${loc.radius} ${loc.radiusUnit}\nPlatforms selected: ${(loc.platforms||[]).join(', ')}\nKeyword type: ${loc.keywordType}\nDate: ${new Date().toLocaleString()}\nAverage rank: ${avg===null?'Not available':avg.toFixed(1)}\nTop 3 coverage: ${top3.toFixed(0)}%\nPoints with rankings: ${ranked.length}/${points.length}\n\nPoint rankings\n${points.map(p=>`${p.id}, ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}, ${p.rank??'Not checked'}`).join('\n')}\n\nNote: Rankings are manually entered/imported. Selected platforms are campaign settings, not live scans.`;
  download(report,'geogrid-report.txt','text/plain');
 };
 if(!campaign||!loc)return <div className="empty">No campaign available. Refresh the page.</div>;
 return <div className="app">
  <aside className="sidebar">
   <div className="brand"><div className="brandIcon"><MapPin size={21}/></div><div><b>GeoGrid</b><small>LOCAL RANK TRACKER</small></div></div>
   <div className="sideLabel">WORKSPACE</div>
   {['Overview','Campaign Scan','Campaigns','Scan History','Settings'].map((x,i)=><button key={x} className={`nav ${tab===x?'active':''}`} onClick={()=>setTab(x==='Campaign Scan'?'Campaign Scan':x)}>{[<BarChart3/>,<MapPin/>,<Layers/>,<TrendingUp/>,<Settings2/>][i]}{x}</button>)}
   <div className="sidebarBottom"><div className="freeTag">LOCAL WORKSPACE <span>v1.2</span></div><small>Your campaigns and scans are saved in this browser.</small></div>
  </aside>
  <main className="main">
   <header className="topbar"><div><div className="crumb">LOCAL SEO <span>/</span> {tab.toUpperCase()}</div><h1>{tab==='Overview'?'Local SEO Overview':tab}</h1></div><div className="topRight"><span className="statusDot"/> Local workspace <div className="avatar">G</div></div></header>
   <section className="content">
    <div className="projectBar">
     <div className="projectIcon"><BriefcaseBusiness size={19}/></div>
     <div className="projectMeta"><b>{campaign.name}</b><span>{loc.name} · {loc.keyword||'Add target keyword'} · {loc.location||'Add location'}</span></div>
     <label className="compactSelect"><span>Active location</span><select value={loc.id} onChange={e=>setStore(s=>({...s,activeLocation:e.target.value}))}>{locations.map(l=><option value={l.id} key={l.id}>{l.name}</option>)}</select></label>
     <button className="outline" onClick={()=>setTab('Settings')}><Settings2 size={15}/> Edit settings</button>
    </div>
    {tab==='Campaigns'&&<div className="panel settings campaignSettings">
     <div className="sectionHead"><div><h2>Campaign management</h2><p className="muted">Create separate campaigns and manage business locations.</p></div><button className="primary" onClick={()=>setNewCampaign(v=>!v)}><Plus size={15}/> New campaign</button></div>
     {newCampaign&&<div className="inlineCreate"><input placeholder="Campaign name, e.g. Manchester Locksmith" value={campaignName} onChange={e=>setCampaignName(e.target.value)}/><button className="primary" onClick={createCampaign}>Create</button><button className="secondary" onClick={()=>setNewCampaign(false)}>Cancel</button></div>}
     <div className="campaignList">{campaigns.map(c=><div className={`campaignRow ${c.id===campaign.id?'selected':''}`} key={c.id}><div className="campaignIcon"><Layers size={18}/></div><div className="campaignInfo"><b>{c.name}</b><small>{c.locations.length} business location(s)</small></div><button className="secondary" onClick={()=>{setStore(s=>({...s,activeCampaign:c.id,activeLocation:c.locations[0]?.id}));setTab('Overview')}}>{c.id===campaign.id?'Selected':'Open campaign'}</button></div>)}</div>
     <div className="campaignActions"><button className="secondary" onClick={()=>{setCampaignNameDraft(campaign.name);setEditingCampaignName(v=>!v)}}><Settings2 size={15}/> Rename current campaign</button></div>
     {editingCampaignName&&<div className="inlineCreate"><input aria-label="Campaign name" placeholder="Campaign name" value={campaignNameDraft} onChange={e=>setCampaignNameDraft(e.target.value)}/><button className="primary" onClick={renameCampaign}>Save name</button><button className="secondary" onClick={()=>setEditingCampaignName(false)}>Cancel</button></div>}
     <div className="campaignActions"><button className="secondary" onClick={()=>setNewLocation(v=>!v)}><Plus size={15}/> Add location to current campaign</button><button className="secondary dangerText" onClick={deleteCampaign}><Trash2 size={15}/> Delete current campaign</button></div>
     {newLocation&&<div className="inlineCreate locationCreate"><input placeholder="Business / location name" value={locationName} onChange={e=>setLocationName(e.target.value)}/><input placeholder="Address or city" value={locationAddress} onChange={e=>setLocationAddress(e.target.value)}/><button className="primary" onClick={addLocation}>Add location</button><button className="secondary" onClick={()=>setNewLocation(false)}>Cancel</button></div>}
     <div className="campaignDefaults">
      <h3>Default scan settings</h3><p className="muted">These defaults are copied to new locations. You can change settings separately for each location.</p>
      <div className="formGrid">
       <Field label="Default grid size" value={campaign.defaults?.grid??5} type="select" options={GRID_SIZES} onChange={v=>updateCampaignDefaults({grid:Number(v)})}/>
       <Field label="Default scan radius" value={campaign.defaults?.radius??3} onChange={v=>updateCampaignDefaults({radius:Number(v)})}/>
       <Field label="Default radius unit" value={campaign.defaults?.radiusUnit??'km'} type="select" options={['km','mi']} onChange={v=>updateCampaignDefaults({radiusUnit:v})}/>
       <Field label="Default keyword type" value={campaign.defaults?.keywordType??'Traditional + AI Platforms'} type="select" options={['Traditional Search','AI Platforms','Traditional + AI Platforms']} onChange={v=>updateCampaignDefaults({keywordType:v})}/>
      </div>
      <b className="platformHeading">Default scan platforms</b><div className="platformChoices">{PLATFORMS.map(p=><label className="platformChoice" key={p}><input type="checkbox" checked={(campaign.defaults?.platforms||DEFAULT_CAMPAIGN.defaults.platforms).includes(p)} onChange={()=>toggleDefaultPlatform(p)}/><span>{p}</span></label>)}</div>
     </div>
     <div className="locationList"><h3>Locations in {campaign.name}</h3>{locations.map(l=><div className="locationRow" key={l.id}><Building2 size={16}/><div><b>{l.name}</b><small>{l.location||'Address not set'} · {l.keyword||'Keyword not set'} · {l.grid}×{l.grid} · {l.radius} {l.radiusUnit}</small></div><button className="textBtn" onClick={()=>{setStore(s=>({...s,activeLocation:l.id}));setTab('Settings')}}>Edit settings</button><button className="textBtn dangerText" onClick={()=>deleteLocation(l.id)} title="Remove location"><Trash2 size={14}/></button></div>)}</div>
    </div>}
    {tab==='Settings'&&<div className="panel settings">
     <div className="sectionHead"><div><h2>Campaign and scan settings</h2><p className="muted">Settings apply to the selected business location.</p></div><span className="settingTag">{campaign.name}</span></div>
     <div className="formGrid">
      <Field label="Business / location name" value={loc.name} onChange={v=>updateField('name',v)}/>
      <Field label="Target keyword" value={loc.keyword} onChange={v=>updateField('keyword',v)}/>
      <Field label="Target address / city" value={loc.location} onChange={v=>updateField('location',v)}/>
      <Field label="Grid size" value={loc.grid} type="select" options={GRID_SIZES} onChange={v=>updateField('grid',Number(v))}/>
      <Field label="Centre latitude" value={loc.lat} onChange={v=>updateField('lat',v)}/>
      <Field label="Centre longitude" value={loc.lng} onChange={v=>updateField('lng',v)}/>
      <Field label="Scan radius" value={loc.radius} onChange={v=>updateField('radius',v)}/>
      <Field label="Radius unit" value={loc.radiusUnit} type="select" options={['km','mi']} onChange={v=>updateField('radiusUnit',v)}/>
      <Field label="Keyword type" value={loc.keywordType} type="select" options={['Traditional Search','AI Platforms','Traditional + AI Platforms']} onChange={v=>updateField('keywordType',v)}/>
     </div>
     <div className="platformSection"><b>Scan platforms</b><p className="muted">Choose the platforms you want this campaign to track.</p><div className="platformChoices">{PLATFORMS.map(p=><label className="platformChoice" key={p}><input type="checkbox" checked={(loc.platforms||[]).includes(p)} onChange={()=>togglePlatform(p)}/><span>{p}</span></label>)}</div><small className="platformNote">Platform selection is saved as campaign configuration. Live ranking collection requires a supported data provider or manual entry.</small></div>
     <div className="settingsActions"><button className="primary" onClick={regenerate}><RefreshCw size={15}/> Apply settings and regenerate grid</button><button className="secondary" onClick={()=>setTab('Campaign Scan')}>Open ranking grid</button></div>
    </div>}
    {tab==='Scan History'&&<><div className="sectionHead"><div><h2>Saved scans</h2><p className="muted">Historical snapshots saved in this browser.</p></div><button className="secondary" onClick={()=>setStore(s=>({...s,history:[]}))}><Trash2 size={15}/> Clear history</button></div>{history.length===0?<Empty title="No saved scans yet" text="Enter rankings in the GeoGrid Tracker and save your first scan."/>:<div className="panel tableWrap"><table><thead><tr><th>Date</th><th>Campaign</th><th>Keyword</th><th>Location</th><th>Average rank</th><th>Top 3 points</th></tr></thead><tbody>{history.map(h=><tr key={h.id}><td>{new Date(h.date).toLocaleString()}</td><td>{h.campaign||'—'}</td><td>{h.keyword}</td><td>{h.location}</td><td><b>{h.avg}</b></td><td>{h.top3}/{h.total}</td></tr>)}</tbody></table></div>}</>}
    {(tab==='Overview'||tab==='Campaign Scan')&&<>
     {tab==='Overview'&&<div className="stats"><Stat icon={<Target/>} label="Average map rank" value={avg===null?'—':avg.toFixed(1)} note={ranked.length?`${ranked.length} of ${points.length} points checked`:'No rankings entered'}/><Stat icon={<TrendingUp/>} label="Top 3 coverage" value={ranked.length?`${top3.toFixed(0)}%`:'—'} note={`${ranked.filter(p=>Number(p.rank)<=3).length} points in positions 1–3`}/><Stat icon={<MapPin/>} label="Top 10 positions" value={ranked.length?`${top10}/${ranked.length}`:'—'} note="Among checked grid points"/><Stat icon={<BarChart3/>} label="Grid points" value={points.length} note={`${loc.grid} × ${loc.grid} tracking grid`}/></div>}
     <div className="sectionHead mapHead"><div><h2>{tab==='Overview'?'Local ranking grid':'Campaign scan'}</h2><p className="muted">{loc.grid}×{loc.grid} grid · {loc.radius} {loc.radiusUnit} radius · {(loc.platforms||[]).join(', ')||'No platforms selected'}</p></div><div className="actions"><button className="secondary" onClick={exportCsv}><Download size={15}/> Export CSV</button><label className="secondary fileBtn"><Upload size={15}/> Import CSV<input type="file" accept=".csv,text/csv" onChange={e=>e.target.files[0]&&importCsv(e.target.files[0])}/></label><button className="secondary" onClick={exportReport}><Download size={15}/> Report</button><button className="primary" onClick={saveScan}><RefreshCw size={15}/> Save scan</button></div></div>
     <div className="workspace"><div className="mapPanel"><div className="mapTop"><div><b>Ranking map</b><small>{loc.location} · {loc.grid}×{loc.grid} grid</small></div><div className="legend"><span><i className="green"/>1–3</span><span><i className="orange"/>4–10</span><span><i className="red"/>11+</span><span><i className="gray"/>Not checked</span></div></div><div className="mapBox"><MapContainer key={`${loc.id}-${loc.lat}-${loc.lng}`} center={[Number(loc.lat),Number(loc.lng)]} zoom={12} scrollWheelZoom><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><MapResize/><CircleMarker center={[Number(loc.lat),Number(loc.lng)]} radius={7} pathOptions={{color:'#263b59',fillColor:'#263b59',fillOpacity:1}}><Popup>{loc.name}<br/>Grid centre</Popup></CircleMarker>{points.map((p,i)=><CircleMarker key={p.id} center={[p.lat,p.lng]} radius={16} pathOptions={{color:'#fff',weight:2,fillColor:rankColor(p.rank),fillOpacity:.95}}><Tooltip permanent direction="center" className="rankTooltip">{p.rank??'·'}</Tooltip><Popup><b>Grid point {p.id}</b><br/>Rank: {p.rank??'Not checked'}<br/>Lat: {p.lat.toFixed(5)}<br/>Lng: {p.lng.toFixed(5)}</Popup></CircleMarker>)}</MapContainer></div><div className="mapFoot"><Info size={14}/> Pins show manually entered or imported rankings, not live search results.</div></div>
      <div className="rankPanel"><div className="rankHeader"><div><b>Grid point rankings</b><small>Enter the position found at each location</small></div><button className="textBtn" onClick={()=>setEditing(!editing)}>{editing?'Done':'Edit ranks'}</button></div><div className="rankGrid">{points.map((p,i)=><div className="rankCell" key={p.id}><span className="pointLabel">P{i+1}</span><input aria-label={`Rank for point ${p.id}`} type="number" min="1" max="100" placeholder="—" value={p.rank??''} disabled={!editing} onChange={e=>updatePoints(old=>old.map(x=>x.id===p.id?{...x,rank:e.target.value===''?null:Math.max(1,Number(e.target.value))}:x))}/><small>{p.rank?`#${p.rank}`:'Not checked'}</small></div>)}</div><div className="rankActions"><button className="secondary full" onClick={()=>updatePoints(old=>old.map(x=>({...x,rank:null})))}>Clear rankings</button><button className="primary full" onClick={saveScan}>Save this scan</button></div></div></div>
     {notice&&<div className="notice" onClick={()=>setNotice('')}>{notice} <b>×</b></div>}
     <div className="disclaimer"><Info size={16}/><div><b>Important data note</b><p>This version records manual or CSV-imported rankings. Choosing Google, Apple, Bing or AI platforms does not automatically scan them. Automatic scans need a suitable data provider and backend integration.</p></div></div>
    </>}
   </section>
  </main>
 </div>;
}
function Field({label,value,onChange,type='text',options=[]}){return <label className="field"><span>{label}</span>{type==='select'?<select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input value={value??''} type={type} onChange={e=>onChange(e.target.value)}/>}</label>}
function Stat({icon,label,value,note}){return <div className="stat"><div className="statIcon">{icon}</div><div className="statLabel">{label}</div><div className="statValue">{value}</div><div className="statNote">{note}</div></div>}
function Empty({title,text}){return <div className="empty"><div className="emptyIcon"><Search/></div><b>{title}</b><p>{text}</p></div>}
function download(content,name,type){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
createRoot(document.getElementById('root')).render(<App/>);
