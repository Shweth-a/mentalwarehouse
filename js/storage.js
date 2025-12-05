// Hybrid storage helper:
// - On localhost/127.0.0.1: read/write from sessionStorage-backed staging (until saveAll is called)
// - On GitHub Pages or file://: read-only from staticData or data/*.json
const storage = (function(){
  const isLocal = ['localhost','127.0.0.1','0.0.0.0'].includes(location.hostname);
  
  // Expose isDev globally for UI visibility control
  window.isDev = isLocal;

  // Use sessionStorage to persist staging across page navigations
  const STAGING_KEY = '__mw_staging__';
  
  function getStagingFromSession(){
    if(!isLocal) return {};
    try{
      const data = sessionStorage.getItem(STAGING_KEY);
      return data ? JSON.parse(data) : {};
    }catch(e){
      console.warn('Failed to read staging from sessionStorage', e);
      return {};
    }
  }
  
  function saveStagingToSession(staging){
    if(!isLocal) return;
    try{
      sessionStorage.setItem(STAGING_KEY, JSON.stringify(staging));
    }catch(e){
      console.warn('Failed to save staging to sessionStorage', e);
    }
  }

  let staging = getStagingFromSession();

  async function get(key){
    // On localhost: return staged data if available, otherwise fetch from API
    if(isLocal && staging[key]){
      return structuredClone(staging[key]);
    }

    try{
      if(isLocal){
        // On localhost: fetch from API to initialize staging
        const response = await fetch(`/api/${key}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        staging[key] = data; // Initialize staging
        saveStagingToSession(staging);
        return structuredClone(data);
      } else {
        // On GitHub Pages or file://: try to fetch data/*.json
        const response = await fetch(`data/${key}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      }
    }catch(e){
      // Fallback to staticData if available (e.g., on file:// protocol)
      if(typeof staticData !== 'undefined' && staticData[key]){
        const data = structuredClone(staticData[key]);
        if(isLocal){
          staging[key] = data; // Also cache in staging
          saveStagingToSession(staging);
        }
        return data;
      }
      console.error('storage.get error', e);
      return null;
    }
  }

  async function set(key, value){
    if(!isLocal){
      console.warn('storage.set ignored: read-only mode on static host');
      return { readonly:true };
    }
    // On localhost: update staging and persist to sessionStorage
    staging[key] = structuredClone(value);
    saveStagingToSession(staging);
    return { staged:true };
  }

  async function clear(key){
    return set(key, []);
  }

  async function saveAll(){
    if(!isLocal){
      console.warn('saveAll ignored: read-only mode on static host');
      return { readonly:true };
    }
    try{
      const response = await fetch('/api/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staging)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      // Clear staging after successful save
      staging = {};
      sessionStorage.removeItem(STAGING_KEY);
      return result;
    }catch(e){
      console.error('storage.saveAll error', e);
      throw e;
    }
  }

  function id(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  }

  return { get, set, clear, saveAll, id };
})();
