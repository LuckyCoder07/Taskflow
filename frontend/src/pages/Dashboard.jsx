// src/pages/Dashboard.jsx — Uses global CSS classes (no CSS modules)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TaskModal from '../components/TaskModal';

const TAGS = { Work:'#6366F1', Personal:'#A78BFA', Bug:'#F87171', Feature:'#34D399', Design:'#FBBF24', Research:'#22D3EE' };
const PRIS = {
  urgent:{ l:'Urgent', c:'#F87171', bg:'rgba(248,113,113,.15)' },
  high:  { l:'High',   c:'#FB923C', bg:'rgba(251,146,60,.15)' },
  medium:{ l:'Medium', c:'#FBBF24', bg:'rgba(251,191,36,.15)' },
  low:   { l:'Low',    c:'#34D399', bg:'rgba(52,211,153,.15)' },
};
const COLS = [
  { id:'todo',        lbl:'To do',       c:'#818CF8', bg:'rgba(129,140,248,.12)' },
  { id:'in-progress', lbl:'In progress', c:'#FBBF24', bg:'rgba(251,191,36,.12)' },
  { id:'done',        lbl:'Done',        c:'#34D399', bg:'rgba(52,211,153,.12)' },
];

function isLate(d,s){ return d && s!=='done' && new Date(d)<new Date(); }
function fmtD(d){ return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''; }
function prog(t){ return t.subtasks?.length ? Math.round(t.subtasks.filter(s=>s.done).length/t.subtasks.length*100) : null; }

export default function Dashboard() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState('kanban');
  const [sf,      setSf]      = useState('all');
  const [srch,    setSrch]    = useState('');
  const [tagF,    setTagF]    = useState(null);
  const [priF,    setPriF]    = useState(null);
  const [showFP,  setShowFP]  = useState(false);
  const [modal,   setModal]   = useState(false);
  const [editT,   setEditT]   = useState(null);
  const [expC,    setExpC]    = useState(null);
  const [qa,      setQa]      = useState(null);
  const [qt,      setQt]      = useState('');
  const [toast,   setToast]   = useState(null);

  const fetchTasks = useCallback(async () => {
    try { const { data } = await api.get('/tasks'); setTasks(data); }
    catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const notify = (msg, type='ok') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2700);
  };

  const saveT = async (data) => {
    try {
      const payload = {
        title: data.title, description: data.description,
        status: data.status, priority: data.priority,
        tags: data.tags, dueDate: data.dueDate || null,
        subtasks: data.subtasks.map(s=>({ text: s.text||s.t, done: s.done })),
      };
      if (editT) {
        const { data: u } = await api.put(`/tasks/${editT._id}`, payload);
        setTasks(ts => ts.map(x => x._id===editT._id ? u : x));
        notify('Task updated ✓');
      } else {
        const { data: c } = await api.post('/tasks', payload);
        setTasks(ts => [c, ...ts]);
        notify('Task created ✓');
      }
    } catch(e){ console.error(e); notify('Something went wrong','err'); }
    setModal(false);
  };

  const delT = async (id) => {
    try { await api.delete(`/tasks/${id}`); setTasks(ts=>ts.filter(x=>x._id!==id)); setExpC(null); notify('Task deleted','err'); }
    catch(e){ console.error(e); }
  };
  const pinT = async (id) => {
    const task = tasks.find(t=>t._id===id);
    try { const { data } = await api.put(`/tasks/${id}`,{pinned:!task.pinned}); setTasks(ts=>ts.map(x=>x._id===id?data:x)); }
    catch(e){ console.error(e); }
  };
  const updSt = async (id, status) => {
    try { const { data } = await api.put(`/tasks/${id}`,{status}); setTasks(ts=>ts.map(x=>x._id===id?data:x)); notify('Status updated'); }
    catch(e){ console.error(e); }
  };
  const doQA = async (col) => {
    if (!qt.trim()){ setQa(null); return; }
    try {
      const { data } = await api.post('/tasks',{title:qt,status:col,priority:'medium',tags:[],subtasks:[]});
      setTasks(ts=>[data,...ts]); notify('Task added ✓');
    } catch(e){ console.error(e); }
    setQt(''); setQa(null);
  };

  const cnt = {
    all: tasks.length,
    todo: tasks.filter(t=>t.status==='todo').length,
    'in-progress': tasks.filter(t=>t.status==='in-progress').length,
    done: tasks.filter(t=>t.status==='done').length,
    pin:  tasks.filter(t=>t.pinned).length,
  };

  const filtered = tasks.filter(t => {
    if (sf==='pin' && !t.pinned) return false;
    if (sf!=='all' && sf!=='pin' && t.status!==sf) return false;
    if (srch && !t.title.toLowerCase().includes(srch.toLowerCase())) return false;
    if (tagF && !t.tags?.includes(tagF)) return false;
    if (priF && t.priority!==priF) return false;
    return true;
  });

  const NAV = [
    {id:'all',ic:'⊞',l:'All tasks',n:cnt.all},
    {id:'todo',ic:'○',l:'To do',n:cnt.todo},
    {id:'in-progress',ic:'◑',l:'In progress',n:cnt['in-progress']},
    {id:'done',ic:'●',l:'Done',n:cnt.done},
    {id:'pin',ic:'📌',l:'Pinned',n:cnt.pin},
  ];
  const pageTitle = sf==='all'?'All tasks':sf==='pin'?'Pinned':NAV.find(n=>n.id===sf)?.l;

  const STATS = [
    {l:'Total',v:cnt.all,c:'#818CF8',bg:'rgba(129,140,248,.12)',i:'📋'},
    {l:'To do',v:cnt.todo,c:'var(--pri)',bg:'var(--priD)',i:'○'},
    {l:'In progress',v:cnt['in-progress'],c:'var(--warn)',bg:'var(--warnD)',i:'◑'},
    {l:'Done',v:cnt.done,c:'var(--ok)',bg:'var(--okD)',i:'✓'},
  ];

  return (
    <div className="tf-dash" onClick={()=>{setShowFP(false);setExpC(null);}}>

      {/* ── SIDEBAR ── */}
      <aside className="tf-sb">
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'3px 7px',marginBottom:20,fontSize:14,fontWeight:700}}>
          <div style={{width:26,height:26,borderRadius:7,background:'linear-gradient(135deg,var(--pri),var(--acc))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0,boxShadow:'0 3px 10px var(--priG)'}}>📋</div>
          TaskFlow
        </div>

        <span style={{fontSize:10,fontWeight:600,color:'var(--txh)',textTransform:'uppercase',letterSpacing:.8,padding:'0 7px',margin:'5px 0 3px',display:'block'}}>Views</span>
        {NAV.map(item => (
          <button key={item.id} className={`tf-sb-item ${sf===item.id?'active':''}`}
            onClick={()=>{setSf(item.id);setTagF(null);setPriF(null);}}>
            <span style={{fontSize:12,width:14,textAlign:'center'}}>{item.ic}</span>
            {item.l}
            <span className="tf-sb-num">{item.n}</span>
          </button>
        ))}

        <span style={{fontSize:10,fontWeight:600,color:'var(--txh)',textTransform:'uppercase',letterSpacing:.8,padding:'0 7px',margin:'10px 0 3px',display:'block'}}>Tags</span>
        {Object.entries(TAGS).slice(0,5).map(([tag,color]) => (
          <button key={tag} className={`tf-sb-item ${tagF===tag?'active':''}`}
            style={tagF===tag?{color,borderColor:color+'40',background:color+'14'}:{}}
            onClick={()=>setTagF(tagF===tag?null:tag)}>
            <span style={{width:7,height:7,borderRadius:'50%',background:color,display:'inline-block',flexShrink:0}}/>
            {tag}
            <span className="tf-sb-num">{tasks.filter(t=>t.tags?.includes(tag)).length}</span>
          </button>
        ))}

        <div style={{height:1,background:'var(--b1)',margin:'8px 6px'}}/>

        <div style={{marginTop:'auto',paddingTop:8,borderTop:'1px solid var(--b1)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 6px',borderRadius:9,marginBottom:5}}>
            <div className="tf-av">{(user?.name||'U')[0].toUpperCase()}</div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:11,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
              <div style={{fontSize:10,color:'var(--txm)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
            </div>
            <button className="tf-th-btn" onClick={toggleTheme} title="Toggle theme">{theme==='dark'?'☀️':'🌙'}</button>
          </div>
          <button className="tf-lo-btn" onClick={()=>{logout();navigate('/');}}>↪ Sign out</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="tf-main">

        {/* Topbar */}
        <header className="tf-topb" onClick={e=>e.stopPropagation()}>
          <div>
            <div style={{fontSize:14,fontWeight:700}}>{pageTitle}</div>
            <div style={{fontSize:10,color:'var(--txm)'}}>{filtered.length} task{filtered.length!==1?'s':''}</div>
          </div>
          <div className="tf-srch">
            <span style={{color:'var(--txh)',fontSize:13}}>⌕</span>
            <input placeholder="Search tasks…" value={srch} onChange={e=>setSrch(e.target.value)}/>
          </div>
          {/* Filter */}
          <div style={{position:'relative'}} onClick={e=>e.stopPropagation()}>
            <button className={`tf-ic-btn ${(tagF||priF)?'on':''}`} onClick={()=>setShowFP(f=>!f)}>⊟</button>
            {showFP && (
              <div className="tf-fp">
                <div style={{fontSize:9,fontWeight:600,color:'var(--txh)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Priority</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                  {Object.entries(PRIS).map(([k,v])=>(
                    <button key={k} className={`tf-fp-opt ${priF===k?'on':''}`}
                      style={priF===k?{borderColor:v.c,color:v.c,background:v.bg}:{}}
                      onClick={()=>setPriF(priF===k?null:k)}>{v.l}</button>
                  ))}
                </div>
                <div style={{fontSize:9,fontWeight:600,color:'var(--txh)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Tags</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                  {Object.entries(TAGS).map(([tag,color])=>(
                    <button key={tag} className={`tf-fp-opt ${tagF===tag?'on':''}`}
                      style={tagF===tag?{borderColor:color,color,background:color+'20'}:{}}
                      onClick={()=>setTagF(tagF===tag?null:tag)}>{tag}</button>
                  ))}
                </div>
                <button className="tf-fp-clr" onClick={()=>{setTagF(null);setPriF(null);setShowFP(false);}}>✕ Clear filters</button>
              </div>
            )}
          </div>
          {/* View toggle */}
          <div style={{display:'flex',background:'var(--bg)',border:'1px solid var(--b1)',borderRadius:8,padding:2,gap:1}}>
            {[['kanban','⊞'],['list','☰'],['analytics','📊']].map(([v,ic])=>(
              <button key={v} className={`tf-vt-btn ${view===v?'on':''}`} onClick={()=>setView(v)} title={v}>{ic}</button>
            ))}
          </div>
          <button className="tf-btn-pri" onClick={()=>{setEditT(null);setModal(true);}}>+ Add task</button>
        </header>

        {/* Stats */}
        <div className="tf-stats">
          {STATS.map(s=>(
            <div key={s.l} className="tf-sc">
              <div className="tf-sc-ic" style={{background:s.bg,color:s.c}}>{s.i}</div>
              <div>
                <div style={{fontSize:19,fontWeight:700,lineHeight:1,color:s.c}}>{s.v}</div>
                <div style={{fontSize:10,color:'var(--txm)',marginTop:2}}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && <div className="tf-load">Loading your tasks…</div>}

        {/* KANBAN */}
        {!loading && view==='kanban' && (
          <div className="tf-board" onClick={()=>{setShowFP(false);setExpC(null);}}>
            {COLS.map(col => {
              const colTs = filtered.filter(t=>t.status===col.id);
              const isQA  = qa===col.id;
              return (
                <div key={col.id} className="tf-kcol">
                  <div style={{display:'flex',alignItems:'center',gap:7,padding:'8px 11px',borderRadius:11,marginBottom:3,background:col.bg}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:col.c,flexShrink:0}}/>
                    <span style={{fontSize:11,fontWeight:600,flex:1,color:col.c}}>{col.lbl}</span>
                    <span style={{fontSize:10,fontWeight:600,padding:'1px 7px',borderRadius:20,color:col.c,background:col.c+'22'}}>{colTs.length}</span>
                  </div>
                  {colTs.length===0 && !isQA && (
                    <div className="tf-empty" onClick={()=>setQa(col.id)}>+ Add a task</div>
                  )}
                  {colTs.map(t => (
                    <TaskCard key={t._id} task={t}
                      expanded={expC===t._id}
                      onExpand={id=>setExpC(expC===id?null:id)}
                      onEdit={t=>{setEditT(t);setModal(true);setExpC(null);}}
                      onDelete={delT} onPin={pinT} onStatus={updSt}/>
                  ))}
                  {isQA ? (
                    <div style={{display:'flex',gap:5,marginTop:3}}>
                      <input autoFocus className="tf-qa-inp" placeholder="Task title…" value={qt}
                        onChange={e=>setQt(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter')doQA(col.id);if(e.key==='Escape'){setQa(null);setQt('');}}}/>
                      <button className="tf-qa-go" onClick={()=>doQA(col.id)}>+</button>
                    </div>
                  ) : colTs.length>0 && (
                    <button className="tf-qa-more" onClick={()=>setQa(col.id)}>+ Quick add</button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* LIST */}
        {!loading && view==='list' && (
          <div className="tf-lv">
            <table className="tf-tbl">
              <thead><tr>
                {['Task','Status','Priority','Tags','Progress','Due','Actions'].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(task => {
                  const pc = PRIS[task.priority]||PRIS.medium;
                  const sc = COLS.find(c=>c.id===task.status)||COLS[0];
                  const p  = prog(task);
                  const late = isLate(task.dueDate,task.status);
                  return (
                    <tr key={task._id}>
                      <td>
                        <div style={{fontWeight:600,fontSize:12}}>{task.pinned?'📌 ':''}{task.title}</div>
                        {task.description&&<div style={{fontSize:10,color:'var(--txm)',marginTop:2}}>{task.description}</div>}
                      </td>
                      <td><span className="tf-badge" style={{color:sc.c,background:sc.bg}}>{sc.lbl}</span></td>
                      <td><span className="tf-badge" style={{color:pc.c,background:pc.bg}}>{pc.l}</span></td>
                      <td><div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                        {task.tags?.map(tg=><span key={tg} className="tf-tag" style={{background:(TAGS[tg]||'#888')+'22',color:TAGS[tg]||'#888'}}>{tg}</span>)}
                      </div></td>
                      <td>{p!==null?<div style={{display:'flex',alignItems:'center',gap:5}}>
                        <div className="tf-prog-bar" style={{width:52}}><div className="tf-prog-fill" style={{width:`${p}%`}}/></div>
                        <span style={{fontSize:9,color:'var(--txm)'}}>{p}%</span>
                      </div>:<span style={{color:'var(--txh)'}}>—</span>}</td>
                      <td style={{color:late?'var(--err)':'var(--txm)',fontSize:10}}>{task.dueDate?fmtD(task.dueDate):'—'}</td>
                      <td><div style={{display:'flex',gap:4}}>
                        <button className="tf-ac-btn" onClick={()=>{setEditT(task);setModal(true);}}>✏</button>
                        <button className="tf-ac-btn del" onClick={()=>delT(task._id)}>🗑</button>
                      </div></td>
                    </tr>
                  );
                })}
                {filtered.length===0&&<tr><td colSpan={7} style={{textAlign:'center',color:'var(--txh)',padding:40,fontSize:13}}>No tasks found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ANALYTICS */}
        {!loading && view==='analytics' && <AnalyticsView tasks={tasks} cnt={cnt}/>}
      </div>

      {modal && <TaskModal task={editT} onSave={saveT} onClose={()=>setModal(false)}/>}
      {toast && (
        <div className="tf-toast">
          <div className="tf-toast-ic" style={{background:toast.type==='err'?'var(--errD)':'var(--okD)',color:toast.type==='err'?'var(--err)':'var(--ok)'}}>
            {toast.type==='err'?'✕':'✓'}
          </div>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Task Card ── */
function TaskCard({task,expanded,onExpand,onEdit,onDelete,onPin,onStatus}){
  const pc = PRIS[task.priority]||PRIS.medium;
  const p  = prog(task);
  const late = isLate(task.dueDate,task.status);
  return (
    <div className={`tf-card ${task.pinned?'pinned':''}`} onClick={()=>onExpand(task._id)}>
      {task.pinned&&<div style={{position:'absolute',top:8,right:8,fontSize:10,opacity:.65}}>📌</div>}
      <div style={{fontSize:12,fontWeight:600,lineHeight:1.45,marginBottom:5,paddingRight:16}}>{task.title}</div>
      {task.description&&<div style={{fontSize:11,color:'var(--txm)',lineHeight:1.5,marginBottom:8}}>{task.description}</div>}
      {p!==null&&(
        <div style={{marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--txm)',marginBottom:4}}>
            <span>Subtasks</span><span>{task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>
          </div>
          <div className="tf-prog-bar"><div className="tf-prog-fill" style={{width:`${p}%`}}/></div>
        </div>
      )}
      <div style={{display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>
        <span className="tf-badge" style={{color:pc.c,background:pc.bg}}>{pc.l}</span>
        {task.tags?.map(tg=><span key={tg} className="tf-tag" style={{background:(TAGS[tg]||'#888')+'22',color:TAGS[tg]||'#888'}}>{tg}</span>)}
        {task.dueDate&&<span style={{marginLeft:'auto',fontSize:9,color:late?'var(--err)':'var(--txh)'}}>📅 {fmtD(task.dueDate)}{late?' ⚠':''}</span>}
      </div>
      {expanded&&(
        <div className="tf-actions" onClick={e=>e.stopPropagation()}>
          <select className="tf-sts-sel" value={task.status} onChange={e=>onStatus(task._id,e.target.value)}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <button className="tf-ac-btn" onClick={()=>onPin(task._id)}>{task.pinned?'Unpin':'📌 Pin'}</button>
          <button className="tf-ac-btn" onClick={()=>onEdit(task)}>✏ Edit</button>
          <button className="tf-ac-btn del" onClick={()=>onDelete(task._id)}>🗑</button>
        </div>
      )}
    </div>
  );
}

/* ── Analytics ── */
function AnalyticsView({tasks,cnt}){
  const pct = n => tasks.length ? n/tasks.length*100 : 0;
  return (
    <div className="tf-av">
      <div className="tf-an-grid">
        <div className="tf-an-card">
          <div style={{fontSize:10,fontWeight:600,color:'var(--txm)',textTransform:'uppercase',letterSpacing:.5,marginBottom:13}}>Tasks by status</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:78}}>
            {COLS.map(col=>{const n=tasks.filter(t=>t.status===col.id).length;return(
              <div key={col.id} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,height:'100%',justifyContent:'flex-end'}}>
                <span style={{fontSize:11,fontWeight:700,color:col.c}}>{n}</span>
                <div style={{width:'100%',borderRadius:'3px 3px 0 0',background:col.c,opacity:.85,height:`${Math.max(pct(n),6)}%`,transition:'height .9s ease'}}/>
                <span style={{fontSize:8,color:'var(--txh)'}}>{col.lbl}</span>
              </div>
            );})}
          </div>
        </div>
        <div className="tf-an-card">
          <div style={{fontSize:10,fontWeight:600,color:'var(--txm)',textTransform:'uppercase',letterSpacing:.5,marginBottom:13}}>Priority breakdown</div>
          {Object.entries(PRIS).map(([k,v])=>{const n=tasks.filter(t=>t.priority===k).length;return(
            <div key={k} style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
              <span style={{fontSize:10,color:'var(--txm)',width:54,flexShrink:0}}>{v.l}</span>
              <div className="tf-pb-bg"><div className="tf-pb-fill" style={{width:`${pct(n)}%`,background:v.c}}/></div>
              <span style={{fontSize:10,fontWeight:600,color:v.c,minWidth:16,textAlign:'right'}}>{n}</span>
            </div>
          );})}
        </div>
        <div className="tf-an-card">
          <div style={{fontSize:10,fontWeight:600,color:'var(--txm)',textTransform:'uppercase',letterSpacing:.5,marginBottom:13}}>Tag distribution</div>
          {Object.entries(TAGS).map(([tag,color])=>{const n=tasks.filter(t=>t.tags?.includes(tag)).length;return(
            <div key={tag} style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
              <span style={{fontSize:10,color:'var(--txm)',width:54,flexShrink:0}}>{tag}</span>
              <div className="tf-pb-bg"><div className="tf-pb-fill" style={{width:`${pct(n)}%`,background:color}}/></div>
              <span style={{fontSize:10,fontWeight:600,color,minWidth:16,textAlign:'right'}}>{n}</span>
            </div>
          );})}
        </div>
        <div className="tf-an-card">
          <div style={{fontSize:10,fontWeight:600,color:'var(--txm)',textTransform:'uppercase',letterSpacing:.5,marginBottom:13}}>Summary</div>
          {[
            {l:'Completion rate',v:tasks.length?Math.round(cnt.done/tasks.length*100)+'%':'0%',c:'var(--ok)'},
            {l:'Pinned tasks',v:cnt.pin,c:'var(--warn)'},
            {l:'Overdue tasks',v:tasks.filter(t=>isLate(t.dueDate,t.status)).length,c:'var(--err)'},
            {l:'With subtasks',v:tasks.filter(t=>t.subtasks?.length>0).length,c:'var(--pri)'},
            {l:'Avg subtasks',v:tasks.length?(tasks.reduce((a,t)=>a+(t.subtasks?.length||0),0)/tasks.length).toFixed(1):'0',c:'var(--sec)'},
          ].map(item=>(
            <div key={item.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
              <span style={{fontSize:11,color:'var(--txm)'}}>{item.l}</span>
              <span style={{fontSize:14,fontWeight:700,color:item.c}}>{item.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
