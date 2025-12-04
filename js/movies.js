document.addEventListener('DOMContentLoaded', ()=>{
  const listEl = document.getElementById('movies-list');
  const addBtn = document.getElementById('add-movie');
  const modalBack = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const saveBtn = document.getElementById('save-m');
  const cancelBtn = document.getElementById('cancel-m');

  const fields = {
    title: document.getElementById('m-title'),
    date: document.getElementById('m-date'),
    rating: document.getElementById('m-rating'),
    location: document.getElementById('m-location'),
    notes: document.getElementById('m-notes')
  }

  let editingId = null;

  function openModal(edit=null){
    modalBack.style.display='flex';
    modalBack.querySelector('.modal').classList.add('show');
    if(edit){
      modalTitle.textContent='Edit movie'
      fields.title.value = edit.title || '';
      fields.date.value = edit.date || '';
      fields.rating.value = edit.rating || '';
      // support legacy `who` key as well as new `location`
      fields.location.value = edit.location || edit.who || '';
      fields.notes.value = edit.notes || '';
      editingId = edit.id;
      // show delete button in edit mode
      const del = document.getElementById('delete-m');
      if(del) del.style.display = 'inline-block';
    }else{
      modalTitle.textContent='Add movie'
      Object.values(fields).forEach(f=>f.value='');
      editingId = null;
      fields.date.value = new Date().toISOString().slice(0,10);
      const del = document.getElementById('delete-m');
      if(del) del.style.display = 'none';
    }
  }
  function closeModal(){
    modalBack.style.display='none';
    modalBack.querySelector('.modal').classList.remove('show');
  }

  function load(){
    try{
      const movies = storage.get('movies') || [];
      movies.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
      listEl.innerHTML='';
      if(movies.length===0){
        listEl.innerHTML = '<div class="muted-note">No movies yet — add one.</div>';
        return;
      }
      movies.forEach(m=>{
      const div = document.createElement('div');
      div.className='entry-card';
      div.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <!-- Top line: title + date + location (with icons) -->
          <div class="entry-row-top" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div style="flex:1;min-width:0;overflow:hidden">
              <strong style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(m.title)}</strong>
            </div>
            <div class="meta-right" style="display:flex;gap:12px;align-items:center;min-width:240px;justify-content:flex-end">
              <span class="meta-item date" style="display:flex;gap:6px;align-items:center;color:var(--muted);font-size:13px;justify-content:flex-end">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 10h10M7 14h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>${escapeHtml(m.date||'-')}</span>
              </span>
              <span class="meta-item loc" style="display:flex;gap:6px;align-items:center;color:var(--muted);font-size:13px;justify-content:flex-end">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 10c0 6-9 11-9 11S3 16 3 10a9 9 0 1 1 18 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>${escapeHtml(m.location || m.who || '-')}</span>
              </span>
            </div>
          </div>

          <!-- Second line: ratings left, edit button right -->
          <div class="entry-row-bottom" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div style="display:flex;gap:8px;align-items:center">
              <div class="rating-badge you">${m.rating_shwetha!=null && m.rating_shwetha!=='' ? escapeHtml(m.rating_shwetha) : '-'}</div>
              <div class="rating-badge them">${m.rating_sarvesh!=null && m.rating_sarvesh!=='' ? escapeHtml(m.rating_sarvesh) : '-'}</div>
            </div>

            <div style="margin-left:auto">
              <button class="btn edit" data-id="${m.id}" style="background:var(--bg);border:1px solid rgba(11,18,32,0.06)">Edit</button>
            </div>
          </div>

          <div class="entry-text">${escapeHtml(m.notes||'')}</div>
        </div>
      `;
      listEl.appendChild(div);
      });
    }catch(err){
      console.error('movies.load failed', err);
      listEl.innerHTML = '<div class="muted-note">Unable to load movies (see console).</div>';
    }
  }

  function save(){
    const movies = storage.get('movies') || [];
    const payload = {
      title: fields.title.value.trim(),
      date: fields.date.value || new Date().toISOString().slice(0,10),
      rating: fields.rating.value || '',
      rating_shwetha: fields.rating.value || '',
      rating_sarvesh: '',
      location: fields.location.value || '',
      notes: fields.notes.value || ''
    };
    if(editingId){
      const idx = movies.findIndex(x=>x.id===editingId);
      if(idx>-1){ movies[idx] = {...movies[idx], ...payload} }
    }else{
      movies.push({ id: storage.id(), ...payload });
    }
    storage.set('movies', movies);
    closeModal(); load();
  }

  // small helper
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  // events
  addBtn.addEventListener('click', ()=>openModal());
  cancelBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', save);
  const deleteBtn = document.getElementById('delete-m');
  deleteBtn && deleteBtn.addEventListener('click', ()=>{
    if(!editingId) return;
    const movies = storage.get('movies') || [];
    const filtered = movies.filter(m=>m.id!==editingId);
    storage.set('movies', filtered);
    editingId = null;
    closeModal(); load();
  });
  modalBack.addEventListener('click', (e)=>{ if(e.target===modalBack) closeModal() });
  listEl.addEventListener('click', (e)=>{
    const id = e.target.dataset && e.target.dataset.id;
    if(!id) return;
    if(e.target.classList.contains('edit')){
      const movies = storage.get('movies') || [];
      const found = movies.find(m=>m.id===id);
      if(found) openModal(found);
    }
  });
  // Seed default movies if none exist
  (function seedIfEmpty(){
    const existing = storage.get('movies');
    if(!existing || existing.length===0){
      const seed = [
        { id: storage.id(), title: 'Twilight: New Moon', date: '2025-08-21', location: 'Shwetha', rating_shwetha: '6.0', rating_sarvesh: '5.0', notes: '' },
        { id: storage.id(), title: 'The Proposal', date: '2025-xx-xx', location: 'Sarvesh', rating_shwetha: '', rating_sarvesh: '', notes: '' },
        { id: storage.id(), title: 'F1: The Movie', date: '2025-09-08', location: 'Sarvesh', rating_shwetha: '9.2', rating_sarvesh: '7.4', notes: '' },
        { id: storage.id(), title: 'How to Train Your Dragon 2', date: '2025-09-09', location: 'Shwetha', rating_shwetha: '8.1', rating_sarvesh: '7', notes: '' },
        { id: storage.id(), title: "Harry Potter and the Philosopher's Stone", date: '2025-xx-xx', location: 'xxxxxxx', rating_shwetha: '9', rating_sarvesh: '6.3', notes: '' },
        { id: storage.id(), title: 'Harry Potter and the Chamber of Secrets', date: '2025-xx-xx', location: 'xxxxxxx', rating_shwetha: '', rating_sarvesh: '', notes: '' },
        { id: storage.id(), title: 'Harry Potter and the Prisoner of Azkaban', date: '2025-xx-xx', location: 'xxxxxxx', rating_shwetha: '', rating_sarvesh: '', notes: '' },
        { id: storage.id(), title: 'Harry Potter and the Goblet of Fire', date: '2025-xx-xx', location: 'xxxxxxx', rating_shwetha: '', rating_sarvesh: '', notes: '' }
      ];
      storage.set('movies', seed);
    }
  })();

  load();
});
