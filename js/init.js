// Centralized seeding logic for the Mental Warehouse app
(function(){
  const movieSeed = [
    { title: 'Twilight: New Moon', date: '2025-08-21', location: 'Shwetha', rating_shwetha: '6.0', rating_sarvesh: '5.0', notes: '' },
    { title: 'The Proposal', date: '2025-xx-xx', location: 'Sarvesh', rating_shwetha: '', rating_sarvesh: '', notes: '' },
    { title: 'F1: The Movie', date: '2025-09-08', location: 'Sarvesh', rating_shwetha: '9.2', rating_sarvesh: '7.4', notes: '' },
    { title: 'How to Train Your Dragon 2', date: '2025-09-09', location: 'Shwetha', rating_shwetha: '8.1', rating_sarvesh: '7', notes: '' },
    { title: "Harry Potter and the Philosopher's Stone", date: '2025-xx-xx', location: 'xxxxxxx', rating_shwetha: '9', rating_sarvesh: '6.3', notes: '' }
  ];

  const rulesSeed = [
    { text: 'no take backs' },
    { text: 'the older person is always right' },
    { text: "no modifying my (shwetha's) rules" },
    { text: 'only 1 use of each excuse is allowed per conversation' }
  ];

  function ensureSeeds(){
    try{
      // movies
      let movies = storage.get('movies');
      if(!Array.isArray(movies) || movies.length===0){
        const withIds = movieSeed.map(m=>({ id: storage.id(), ...m }));
        storage.set('movies', withIds);
      }
      // rules
      let rules = storage.get('rules');
      if(!Array.isArray(rules) || rules.length===0){
        const withIds = rulesSeed.map(r=>({ id: storage.id(), ...r }));
        storage.set('rules', withIds);
      }
    }catch(e){ console.warn('init.ensureSeeds failed', e) }
  }

  // expose for debugging and explicit calls
  window.mentalwarehouseInit = { ensureSeeds };
  document.addEventListener('DOMContentLoaded', ensureSeeds);
})();
