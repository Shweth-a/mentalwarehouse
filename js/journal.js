document.addEventListener('DOMContentLoaded', ()=>{
  const listEl = document.getElementById('journal-list');
  const addBtn = document.getElementById('add-entry');
  const modalBack = document.getElementById('modal');
  const saveBtn = document.getElementById('save-j');
  const cancelBtn = document.getElementById('cancel-j');

  const fields = {
    date: document.getElementById('j-date'),
    photo: document.getElementById('j-photo'),
    location: document.getElementById('j-location'),
    text: document.getElementById('j-text')
  };

  let editingId = null;

  function openModal(edit=null){
    modalBack.style.display='flex';
    modalBack.querySelector('.modal').classList.add('show');
    if(edit){
      document.getElementById('modal-title').textContent='Edit entry';
      fields.date.value = edit.date || '';
      fields.location.value = edit.location || edit.who || '';
      fields.text.value = edit.text || '';
      editingId = edit.id;
    }else{
      document.getElementById('modal-title').textContent='Add journal entry';
      fields.date.value = new Date().toISOString().slice(0,10);
      fields.location.value = '';
      fields.text.value = '';
      // clear file input correctly
      try{ fields.photo.value = '' }catch(e){}
      editingId = null;
    }
  }
  function closeModal(){ modalBack.style.display='none'; modalBack.querySelector('.modal').classList.remove('show') }

  function load(){
    try{
      let items = storage.get('journal');
      if(!Array.isArray(items)) items = [];
      try{ items.sort((a,b)=> (b.date||'').localeCompare(a.date||'')); }catch(e){ console.warn('journal.load sort failed', e) }
      listEl.innerHTML='';
      if(items.length===0){ listEl.innerHTML='<div class="muted-note">No entries yet.</div>'; return }
      items.forEach(it=>{
        const el = document.createElement('div'); el.className='entry-card';
          const photoHtml = it.photo ? `<a href="${it.photo}" target="_blank" rel="noopener"><img class="thumb" src="${it.photo}"></a>` : '';
          el.innerHTML = `
            <div class="control-stack">
              <button class="icon-btn edit" data-id="${it.id}" title="Edit">⋯</button>
              <button class="icon-btn btn small delete" data-id="${it.id}" title="Delete">🗑</button>
            </div>
            <div class="media">
              ${photoHtml}
            </div>
            <div class="body">
              <div class="meta-sub">${it.date || ''} • ${escapeHtml(it.location || '')}</div>
              <p class="entry-text">${escapeHtml(it.text || '')}</p>
            </div>
          `;
        listEl.appendChild(el);
      });
    }catch(err){
      console.error('journal.load failed', err);
      listEl.innerHTML = '<div class="muted-note">Unable to load journal (see console).</div>';
    }
  }

  // export/import removed per user request

  function save(){
    let items = storage.get('journal');
    if(!Array.isArray(items)) items = [];
    const reader = new FileReader();
    const file = fields.photo.files && fields.photo.files[0];
    const payload = { date: fields.date.value || new Date().toISOString().slice(0,10), text: fields.text.value || '' };
    function doSave(photoData){
      if(photoData) payload.photo = photoData;
      if(editingId){
        const idx = items.findIndex(x=>x.id===editingId);
        if(idx>-1) items[idx] = {...items[idx], ...payload};
      }else{
        items.push({ id: storage.id(), ...payload });
      }
      storage.set('journal', items);
      closeModal(); load();
    }
    if(file){
      reader.onload = ()=> doSave(reader.result);
      reader.readAsDataURL(file);
    }else{
      doSave();
    }
  }

  listEl.addEventListener('click', (e)=>{
    const id = e.target.dataset && e.target.dataset.id; if(!id) return;
    const items = storage.get('journal') || [];
    if(e.target.classList.contains('delete')){
      storage.set('journal', items.filter(i=>i.id!==id)); load();
    }else if(e.target.classList.contains('edit')){
      const found = items.find(i=>i.id===id); if(found) openModal(found);
    }
  });

  addBtn.addEventListener('click', ()=>openModal());
  cancelBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', save);
  modalBack.addEventListener('click', (e)=>{ if(e.target===modalBack) closeModal() });

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  load();
});
