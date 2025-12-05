// File-based storage helper using server API
const storage = (function(){
  const API_BASE = '/api';
  
  async function get(key){
    try{
      const response = await fetch(`${API_BASE}/${key}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    }catch(e){ 
      console.error('storage.get error', e); 
      return null;
    }
  }
  
  async function set(key, value){
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
