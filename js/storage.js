// Simple storage helper used across pages
const storage = (function(){
  const prefix = 'mentalwarehouse:';
  function get(key){
    try{
      const raw = localStorage.getItem(prefix+key);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ console.error('storage.get parse', e); return null }
  }
  function set(key, value){
    try{
      localStorage.setItem(prefix+key, JSON.stringify(value));
    }catch(e){ console.error('storage.set', e) }
  }
  function clear(key){ localStorage.removeItem(prefix+key) }
  function id(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }
  // export/import helpers
  function exportAll(){
    try{
      const keys = ['movies','journal','rules','misc'];
      const out = {};
      keys.forEach(k=>{ const v = get(k); if(v!=null) out[k]=v });
      return out;
    }catch(e){ console.error('exportAll',e); return null }
  }
  function importAll(obj){
    try{
      if(!obj || typeof obj !== 'object') return false;
      Object.keys(obj).forEach(k=> set(k, obj[k]) );
      return true;
    }catch(e){ console.error('importAll',e); return false }
  }

  return { get, set, clear, id, exportAll, importAll }
})();
