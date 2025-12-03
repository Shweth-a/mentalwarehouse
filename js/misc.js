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

  function load(){
    const notes = storage.get('misc') || [];
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

  function save(){
    const notes = storage.get('misc') || [];
    const file = fields.photo.files && fields.photo.files[0];
    const reader = new FileReader();
    const payload = { text: fields.text.value || '' };
    function doSave(photoData){ if(photoData) payload.photo = photoData; if(editingId){ const idx = notes.findIndex(x=>x.id===editingId); if(idx>-1) notes[idx] = {...notes[idx], ...payload } } else { notes.push({ id: storage.id(), ...payload }) } storage.set('misc', notes); closeModal(); load(); }
    if(file){ reader.onload = ()=> doSave(reader.result); reader.readAsDataURL(file); } else { doSave(); }
  }

  grid.addEventListener('click', (e)=>{ const id = e.target.dataset && e.target.dataset.id; if(!id) return; const notes = storage.get('misc') || []; if(e.target.classList.contains('delete')){ storage.set('misc', notes.filter(n=>n.id!==id)); load(); } else if(e.target.classList.contains('edit')){ const f = notes.find(n=>n.id===id); if(f) openModal(f); } });

  addBtn.addEventListener('click', ()=>openModal()); cancelBtn.addEventListener('click', closeModal); saveBtn.addEventListener('click', save); modalBack.addEventListener('click', (e)=>{ if(e.target===modalBack) closeModal() });

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  load();
});
