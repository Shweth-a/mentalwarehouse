// Hybrid storage helper:
// - On localhost/127.0.0.1: read/write via dev API (/api) to data/*.json
// - On GitHub Pages (or any non-local host): read-only from data/*.json; set/clear are no-ops
const storage = (function(){
  const isLocal = ['localhost','127.0.0.1','0.0.0.0'].includes(location.hostname);
  const API_BASE = '/api';

  async function get(key){
    try{
      if(isLocal){
        const response = await fetch(`${API_BASE}/${key}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } else {
        const response = await fetch(`data/${key}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      }
    }catch(e){
      console.error('storage.get error', e);
      return null;
    }
  }

  async function set(key, value){
    if(!isLocal){
      console.warn('storage.set ignored: read-only mode on static host');
      return { readonly:true };
    }
    try{
      const response = await fetch(`${API_BASE}/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    }catch(e){
      console.error('storage.set error', e);
      throw e;
    }
  }

  async function clear(key){
    return set(key, []);
  }

  function id(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  }

  return { get, set, clear, id };
})();
