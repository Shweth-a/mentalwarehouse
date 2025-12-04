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
  return { get, set, clear, id }
})();
