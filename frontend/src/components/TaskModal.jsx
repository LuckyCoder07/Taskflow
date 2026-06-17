import React, { useState, useRef } from 'react';

const TAGS = { Work:'#6366F1', Personal:'#A78BFA', Bug:'#F87171', Feature:'#34D399', Design:'#FBBF24', Research:'#22D3EE' };

const inp = {
  width:'100%', padding:'9px 11px', border:'1px solid var(--b2)',
  borderRadius:9, background:'var(--bg)', color:'var(--tx)',
  fontSize:13, fontFamily:'inherit', outline:'none', transition:'all .2s',
};
const sel = { ...inp, cursor:'pointer' };
const ta  = { ...inp, resize:'vertical', minHeight:70 };

export default function TaskModal({ task, onSave, onClose }) {
  const [f, setF] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'medium',
    tags:        task?.tags        || [],
    subtasks:    task?.subtasks    || [],
    dueDate:     task?.dueDate     ? task.dueDate.slice(0,10) : '',
  });
  const [ns,  setNs]  = useState('');
  const [err, setErr] = useState('');
  const sid = useRef((task?.subtasks?.length||0)+1);

  const addSub = () => { if(!ns.trim()) return; setF(x=>({...x, subtasks:[...x.subtasks,{id:sid.current++,t:ns,done:false}]})); setNs(''); };
  const delSub = id => setF(x=>({...x, subtasks:x.subtasks.filter(s=>s.id!==id)}));
  const togSub = id => setF(x=>({...x, subtasks:x.subtasks.map(s=>s.id===id?{...s,done:!s.done}:s)}));
  const togTag = tag => setF(x=>({...x, tags:x.tags.includes(tag)?x.tags.filter(t=>t!==tag):[...x.tags,tag]}));
  const submit = () => { if(!f.title.trim()){setErr('Title required');return;} onSave(f); };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',
        justifyContent:'center',zIndex:200,padding:16,backdropFilter:'blur(5px)',animation:'fadeIn .2s ease'}}>
      <div style={{background:'var(--sur)',border:'1px solid var(--b2)',borderRadius:20,padding:26,
        width:'100%',maxWidth:510,maxHeight:'90vh',overflowY:'auto',
        animation:'scaleIn .28s cubic-bezier(.4,0,.2,1)',boxShadow:'0 24px 64px rgba(0,0,0,.35)',position:'relative'}}>

        {/* Gradient top bar */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,borderRadius:'20px 20px 0 0',
          background:'linear-gradient(90deg,var(--pri),var(--acc),var(--sec))',backgroundSize:'200%',animation:'gradShift 3s infinite'}}/>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{fontSize:15,fontWeight:700}}>{task?'Edit task':'New task'}</h2>
          <button onClick={onClose} style={{width:28,height:28,background:'var(--bg)',border:'1px solid var(--b1)',
            borderRadius:7,color:'var(--txm)',cursor:'pointer',fontSize:16,display:'flex',
            alignItems:'center',justifyContent:'center',transition:'all .2s'}}>×</button>
        </div>

        {err && <div style={{background:'var(--errD)',border:'1px solid var(--err)',color:'var(--err)',
          padding:'9px 12px',borderRadius:8,fontSize:12,marginBottom:12}}>{err}</div>}

        {/* Title */}
        <Field label="Title *">
          <input style={inp} placeholder="What needs to be done?" value={f.title}
            onChange={e=>setF({...f,title:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea style={ta} placeholder="Add more details…" value={f.description}
            onChange={e=>setF({...f,description:e.target.value})}/>
        </Field>

        {/* Status + Priority */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Field label="Status">
            <select style={sel} value={f.status} onChange={e=>setF({...f,status:e.target.value})}>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </Field>
          <Field label="Priority">
            <select style={sel} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </Field>
        </div>

        {/* Due date */}
        <Field label="Due date">
          <input style={inp} type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/>
        </Field>

        {/* Tags */}
        <Field label="Tags">
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:5}}>
            {Object.entries(TAGS).map(([tag,color])=>(
              <button key={tag} onClick={()=>togTag(tag)}
                style={{padding:'3px 9px',borderRadius:6,fontSize:10,fontWeight:500,cursor:'pointer',
                  fontFamily:'inherit',background:color+'20',color,transition:'all .18s',
                  border:`1px solid ${f.tags.includes(tag)?color:'transparent'}`,
                  boxShadow:f.tags.includes(tag)?`0 0 0 2px ${color}44`:'none'}}>
                {f.tags.includes(tag)?'✓ ':''}{tag}
              </button>
            ))}
          </div>
        </Field>

        {/* Subtasks */}
        <Field label="Subtasks">
          {f.subtasks.length>0 && (
            <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:7}}>
              {f.subtasks.map(s=>(
                <div key={s.id} style={{display:'flex',alignItems:'center',gap:7,padding:'6px 9px',
                  background:'var(--bg)',border:'1px solid var(--b1)',borderRadius:7,fontSize:11}}>
                  <div onClick={()=>togSub(s.id)}
                    style={{width:14,height:14,borderRadius:4,flexShrink:0,cursor:'pointer',
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,
                      border:s.done?'none':'1.5px solid var(--b2)',color:'#fff',transition:'all .18s',
                      background:s.done?'linear-gradient(135deg,var(--pri),var(--acc))':'transparent'}}>
                    {s.done?'✓':''}
                  </div>
                  <span style={{flex:1,textDecoration:s.done?'line-through':'none',color:s.done?'var(--txm)':'var(--tx)'}}>{s.t}</span>
                  <button onClick={()=>delSub(s.id)} style={{background:'none',border:'none',color:'var(--txh)',cursor:'pointer',fontSize:13,padding:'0 2px'}}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex',gap:6}}>
            <input placeholder="Add subtask…" value={ns} onChange={e=>setNs(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addSub()}
              style={{flex:1,padding:'6px 9px',border:'1px solid var(--b1)',borderRadius:7,
                background:'var(--bg)',color:'var(--tx)',fontSize:11,fontFamily:'inherit',outline:'none'}}/>
            <button onClick={addSub}
              style={{padding:'6px 11px',border:'1px solid var(--pri)',borderRadius:7,
                background:'var(--priD)',color:'var(--pri)',fontSize:10,fontWeight:600,
                cursor:'pointer',fontFamily:'inherit',transition:'all .18s'}}>+ Add</button>
          </div>
        </Field>

        <div style={{display:'flex',gap:9,marginTop:18,justifyContent:'flex-end'}}>
          <button onClick={onClose}
            style={{padding:'8px 16px',borderRadius:9,border:'1px solid var(--b2)',
              background:'var(--bg)',color:'var(--txm)',fontSize:12,fontWeight:500,
              cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
          <button onClick={submit}
            style={{padding:'8px 20px',borderRadius:9,border:'none',fontSize:12,fontWeight:600,
              cursor:'pointer',fontFamily:'inherit',color:'#fff',
              background:'linear-gradient(135deg,var(--pri),var(--acc))',
              boxShadow:'0 4px 14px var(--priG)',transition:'transform .2s,box-shadow .2s'}}>
            {task?'Save changes':'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{marginBottom:13}}>
      <label style={{display:'block',fontSize:10,fontWeight:600,color:'var(--txm)',
        textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5}}>{label}</label>
      {children}
    </div>
  );
}
