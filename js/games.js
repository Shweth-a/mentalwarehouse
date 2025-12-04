document.addEventListener('DOMContentLoaded', ()=>{
  const log = (s)=>{ const el=document.getElementById('log'); if(el) el.innerText = (new Date().toLocaleTimeString()) + ' — ' + s + '\n' + el.innerText }
  const status = (s, sel='#conn-status')=>{ const el=document.querySelector(sel); if(el) el.textContent = s }

  // --- WebRTC controls (manual signaling) ---
  document.getElementById('create-offer').addEventListener('click', async ()=>{
    try{ status('Creating offer...'); const b64 = await mwWebRTC.createOffer(); document.getElementById('sig-box').value = b64; status('Offer created — share this text'); log('offer created'); }
    catch(e){ log('offer error:'+e.message); status('Error creating offer') }
  });

  document.getElementById('accept-offer').addEventListener('click', ()=>{ status('Paste offer into the box, then click Apply'); });
  document.getElementById('apply-sig').addEventListener('click', async ()=>{
    const val = document.getElementById('sig-box').value.trim(); if(!val) return;
    // Heuristic: if we have no pc and no local desc, try acceptOffer; if we have pc but no remote, try applyAnswer
    try{
      if(!window.mwWebRTC) throw new Error('webrtc helper missing');
      // If the box looks like an offer (contains "type":"offer") then accept and produce answer
      const parsed = JSON.parse(atob(val));
      if(parsed && parsed.type==='offer'){
        status('Accepting offer and creating answer...');
        const answer = await mwWebRTC.acceptOffer(val);
        document.getElementById('sig-box').value = answer;
        status('Answer created — send this back to originator');
        log('accepted offer');
        return;
      }
    }catch(e){ /* not an offer */ }

    try{ await mwWebRTC.applyAnswer(val); status('Connected (answer applied)'); log('applied answer'); }
    catch(err){ log('apply error:'+err.message); status('Failed to apply'); }
  });

  document.getElementById('reset-conn').addEventListener('click', ()=>{ mwWebRTC.reset(); status('Connection reset'); log('reset'); });

  // forward webrtc messages to UI
  window.addEventListener('webrtc-message',(ev)=>{
    const msg = ev.detail; log('recv:'+msg.type);
    if(msg.type==='ttt-move') handleRemoteTTT(msg.payload);
    if(msg.type==='rps-play') handleRemoteRPS(msg.payload);
  });

  // --- TicTacToe ---
  const boardEl = document.getElementById('ttt-board');
  let ttt = { cells: Array(9).fill(''), turn: 'X', localTurn:true, remote:false };

  function renderBoard(){ boardEl.innerHTML=''; ttt.cells.forEach((v,i)=>{ const c = document.createElement('div'); c.className='cell'; c.dataset.i=i; c.textContent = v; c.addEventListener('click', ()=> onCell(i)); boardEl.appendChild(c) }) }
  function onCell(i){ if(ttt.cells[i]) return; // occupied
    // if in remote mode, only allow move when localTurn true
    if(ttt.remote && !ttt.localTurn) return;
    const mark = ttt.turn; ttt.cells[i]=mark; renderBoard(); // broadcast if remote
    if(ttt.remote) mwWebRTC.send({ type:'ttt-move', payload:{i,mark} });
    // toggle turn
    ttt.turn = (ttt.turn==='X')?'O':'X'; ttt.localTurn = !ttt.localTurn;
    updateTTTStatus();
  }
  function handleRemoteTTT(p){ if(typeof p.i==='number' && p.mark){ ttt.cells[p.i]=p.mark; ttt.turn = (p.mark==='X')?'O':'X'; ttt.localTurn = true; renderBoard(); updateTTTStatus(); } }
  function resetTTT(){ ttt = { cells:Array(9).fill(''), turn:'X', localTurn:true, remote:ttt.remote }; renderBoard(); updateTTTStatus(); }
  function updateTTTStatus(){ document.getElementById('ttt-status').textContent = ttt.remote ? ('Remote mode — your turn: '+ (ttt.localTurn? 'yes':'no')) : 'Local mode'; }

  document.getElementById('ttt-local').addEventListener('click', ()=>{ ttt.remote=false; ttt.localTurn=true; updateTTTStatus(); log('ttt local mode') });
  document.getElementById('ttt-reset').addEventListener('click', ()=>{ resetTTT(); log('ttt reset') });

  // --- RPS ---
  let rps = { me:null, them:null, remote:false };
  function resolveRPS(){ if(rps.me && rps.them){ const a=rps.me, b=rps.them; let res='Tie'; if((a==='rock'&&b==='scissors')||(a==='scissors'&&b==='paper')||(a==='paper'&&b==='rock')) res='You win'; else if(a!==b) res='You lose'; document.getElementById('rps-result').textContent = `You: ${a} — Them: ${b} — ${res}`; rps.me=rps.them=null; } }
  function handleRemoteRPS(choice){ rps.them = choice; resolveRPS(); }
  document.querySelectorAll('.rps-buttons button').forEach(b=>b.addEventListener('click', ()=>{
    const choice = b.dataset.choice; rps.me = choice; if(mwWebRTC) mwWebRTC.send({type:'rps-play', payload:choice}); else log('local rps: waiting for opponent'); resolveRPS(); }));

  // On connection open store remote mode flag so UI knows to send moves
  // We detect datachannel open via logs and set ttt.remote true when open
  const origLog = log; // keep
  // also patch mwWebRTC.log if exists
  if(window.mwWebRTC){ const orig = window.mwWebRTC.log; window.mwWebRTC.log = function(s){ orig(s); if(s.indexOf('datachannel open')>-1){ ttt.remote=true; rps.remote=true; status('Connected'); updateTTTStatus(); } } }

  // initial render
  renderBoard(); updateTTTStatus();
  log('games ready');
});
