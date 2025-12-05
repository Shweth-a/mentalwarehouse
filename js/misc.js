document.addEventListener('DOMContentLoaded', ()=>{
  const grid = document.getElementById('notes-grid');
  const addBtn = document.getElementById('add-note');
  const modalBack = document.getElementById('modal');
  const saveBtn = document.getElementById('save-n');
  const cancelBtn = document.getElementById('cancel-n');
  const fields = { text: document.getElementById('n-text'), photo: document.getElementById('n-photo') };
  let editingId = null;

  function openModal(edit=null){ modalBack.style.display='flex'; modalBack.querySelector('.modal').classList.add('show');
    if(edit){ document.getElementById('modal-title').textContent='Edit note'; fields.text.value = edit.text||''; editingId = edit.id; }
    else { document.getElementById('modal-title').textContent='Add note'; fields.text.value=''; fields.photo.value=null; editingId=null }
  }
  function closeModal(){ modalBack.style.display='none'; modalBack.querySelector('.modal').classList.remove('show') }

  async function load(){
    const notes = await storage.get('misc') || [];
    grid.innerHTML='';
    if(notes.length===0){ grid.innerHTML='<div class="muted-note">No notes yet.</div>'; return }
    notes.forEach(n=>{
      const card = document.createElement('a'); card.className='card'; card.style.display='block';
      card.innerHTML = `
        ${n.photo ? `<img src="${n.photo}" style="width:100%;height:140px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>` : ''}
        <div class="card-title">${escapeHtml(n.text||'')}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn edit" data-id="${n.id}">Edit</button>
          <button class="btn delete" data-id="${n.id}">Delete</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  async function save(){
    const notes = await storage.get('misc') || [];
    const file = fields.photo.files && fields.photo.files[0];
    const reader = new FileReader();
    const payload = { text: fields.text.value || '' };
    async function doSave(photoData){ if(photoData) payload.photo = photoData; if(editingId){ const idx = notes.findIndex(x=>x.id===editingId); if(idx>-1) notes[idx] = {...notes[idx], ...payload } } else { notes.push({ id: storage.id(), ...payload }) } await storage.set('misc', notes); closeModal(); await load(); }
    if(file){ reader.onload = ()=> doSave(reader.result); reader.readAsDataURL(file); } else { doSave(); }
  }

  grid.addEventListener('click', async (e)=>{ const id = e.target.dataset && e.target.dataset.id; if(!id) return; const notes = await storage.get('misc') || []; if(e.target.classList.contains('delete')){ await storage.set('misc', notes.filter(n=>n.id!==id)); await load(); } else if(e.target.classList.contains('edit')){ const f = notes.find(n=>n.id===id); if(f) openModal(f); } });

  addBtn.addEventListener('click', ()=>openModal()); cancelBtn.addEventListener('click', closeModal); saveBtn.addEventListener('click', save); modalBack.addEventListener('click', (e)=>{ if(e.target===modalBack) closeModal() });

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  load();
});
