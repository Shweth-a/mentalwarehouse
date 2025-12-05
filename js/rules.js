document.addEventListener('DOMContentLoaded', ()=>{
  const listEl = document.getElementById('rules-list');
  const addBtn = document.getElementById('add-rule');
  const modalBack = document.getElementById('modal');
  const saveBtn = document.getElementById('save-r');
  const cancelBtn = document.getElementById('cancel-r');
  const field = document.getElementById('r-text');
  let editingId = null;

  function openModal(edit=null){
    modalBack.style.display='flex';
    modalBack.querySelector('.modal').classList.add('show');
    if(edit){
      field.value = edit.text || '';
      editingId = edit.id;
      document.getElementById('modal-title').textContent='Edit rule';
      const del = document.getElementById('delete-r'); if(del) del.style.display = 'inline-block';
    }
    else {
      field.value=''; editingId=null; document.getElementById('modal-title').textContent='Add rule';
      const del = document.getElementById('delete-r'); if(del) del.style.display = 'none';
    }
  }
  function closeModal(){ modalBack.style.display='none'; modalBack.querySelector('.modal').classList.remove('show') }

  async function load(){
    const rules = await storage.get('rules') || [];
    listEl.innerHTML='';
    if(rules.length===0){ listEl.innerHTML='<div class="muted-note">No rules yet. Add some.</div>'; return }
    rules.forEach(r=>{
      const el = document.createElement('div'); el.className='entry-card';
      el.innerHTML = `
        <div style="flex:1">
          <div class="entry-text">${escapeHtml(r.text)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn edit" data-id="${r.id}">Edit</button>
        </div>
      `;
      listEl.appendChild(el);
    });
  }

  async function save(){
    const rules = await storage.get('rules') || [];
    const payload = { text: field.value.trim() };
    if(!payload.text) return closeModal();
    if(editingId){
      const idx = rules.findIndex(r=>r.id===editingId); if(idx>-1) rules[idx] = {...rules[idx], ...payload};
    }else{
      rules.push({ id: storage.id(), ...payload });
    }
    await storage.set('rules', rules); closeModal(); load();
  }

  listEl.addEventListener('click', async (e)=>{
    const id = e.target.dataset && e.target.dataset.id; if(!id) return;
    const rules = await storage.get('rules') || [];
    if(e.target.classList.contains('edit')){ const f = rules.find(r=>r.id===id); if(f) openModal(f); }
  });

  addBtn.addEventListener('click', ()=>openModal());
  cancelBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', save);
  const deleteBtn = document.getElementById('delete-r');
  deleteBtn && deleteBtn.addEventListener('click', async ()=>{
    if(!editingId) return;
    const rules = await storage.get('rules') || [];
    await storage.set('rules', rules.filter(r=>r.id!==editingId));
    editingId = null;
    closeModal(); load();
  });
  modalBack.addEventListener('click', (e)=>{ if(e.target===modalBack) closeModal() });

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  // seeding handled by js/init.js

  load();
});
