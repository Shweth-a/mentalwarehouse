document.addEventListener('DOMContentLoaded', ()=>{
  const listEl = document.getElementById('movies-list');
  const addBtn = document.getElementById('add-movie');
  const modalBack = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const saveBtn = document.getElementById('save-m');
  const cancelBtn = document.getElementById('cancel-m');

  // Hide add button if not in dev mode
  if(!window.isDev && addBtn) addBtn.style.display = 'none';

  const fields = {
    title: document.getElementById('m-title'),
    date: document.getElementById('m-date'),
    ratingShwetha: document.getElementById('m-rating-shwetha'),
    ratingSarvesh: document.getElementById('m-rating-sarvesh'),
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
      fields.ratingShwetha.value = edit.rating_shwetha || '';
      fields.ratingSarvesh.value = edit.rating_sarvesh || '';
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

  async function load(){
    try{
      const movies = await storage.get('movies') || [];
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
              ${window.isDev ? `<button class="btn edit" data-id="${m.id}" style="background:var(--bg);border:1px solid rgba(11,18,32,0.06)">Edit</button>` : ''}
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

  async function save(){
    const movies = await storage.get('movies') || [];
    const payload = {
      title: fields.title.value.trim(),
      date: fields.date.value || new Date().toISOString().slice(0,10),
      rating_shwetha: fields.ratingShwetha.value || '',
      rating_sarvesh: fields.ratingSarvesh.value || '',
      location: fields.location.value || '',
      notes: fields.notes.value || ''
    };
    if(editingId){
      const idx = movies.findIndex(x=>x.id===editingId);
      if(idx>-1){ movies[idx] = {...movies[idx], ...payload} }
    }else{
      movies.push({ id: storage.id(), ...payload });
    }
    await storage.set('movies', movies);
    closeModal(); await load();
  }

  // small helper
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  // events
  addBtn.addEventListener('click', ()=>openModal());
  cancelBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', save);
  const deleteBtn = document.getElementById('delete-m');
  deleteBtn && deleteBtn.addEventListener('click', async ()=>{
    if(!editingId) return;
    const movies = await storage.get('movies') || [];
    const filtered = movies.filter(m=>m.id!==editingId);
    await storage.set('movies', filtered);
    editingId = null;
    closeModal(); await load();
  });
  modalBack.addEventListener('click', (e)=>{ if(e.target===modalBack) closeModal() });
  listEl.addEventListener('click', async (e)=>{
    const id = e.target.dataset && e.target.dataset.id;
    if(!id) return;
    if(e.target.classList.contains('edit')){
      const movies = await storage.get('movies') || [];
      const found = movies.find(m=>m.id===id);
      if(found) openModal(found);
    }
  });
  // seeding handled by js/init.js

  load();
});
