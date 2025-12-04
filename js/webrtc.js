// Minimal WebRTC DataChannel helper with manual signaling (copy/paste)
(function(){
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  let pc = null;
  let dc = null;
  const logEl = ()=>document.getElementById('log');

  function ensurePC(){
    if(pc) return pc;
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = (e)=>{
      // ICE candidates will be included in final SDP; we don't serialise separately
      appendLog('icecandidate: '+(e.candidate? 'new' : 'null'));
    };
    pc.ondatachannel = (ev)=>{
      dc = ev.channel; setupDC(); appendLog('datachannel received');
    };
    return pc;
  }

  function setupDC(){
    if(!dc) return;
    dc.onopen = ()=> appendLog('datachannel open');
    dc.onclose = ()=> appendLog('datachannel closed');
    dc.onmessage = (ev)=>{
      try{ const msg = JSON.parse(ev.data); window.dispatchEvent(new CustomEvent('webrtc-message',{detail:msg})); }
      catch(e){ appendLog('invalid message') }
    };
  }

  function appendLog(s){ if(logEl()){ logEl().innerText = (new Date().toLocaleTimeString()) + ' — ' + s + '\n' + logEl().innerText } }

  async function createOffer(){
    pc = ensurePC();
    dc = pc.createDataChannel('mw');
    setupDC();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    // wait a short time for ICE to gather
    await new Promise(r=>setTimeout(r,800));
    appendLog('offer created');
    return btoa(JSON.stringify(pc.localDescription));
  }

  async function acceptOffer(offerB64){
    pc = ensurePC();
    const offer = JSON.parse(atob(offerB64));
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    // wait briefly for ICE
    await new Promise(r=>setTimeout(r,800));
    appendLog('answer created');
    return btoa(JSON.stringify(pc.localDescription));
  }

  async function applyAnswer(answerB64){
    if(!pc) throw new Error('PeerConnection not initialized');
    const answer = JSON.parse(atob(answerB64));
    await pc.setRemoteDescription(answer);
    appendLog('remote answer applied');
  }

  function send(obj){ if(dc && dc.readyState==='open'){ dc.send(JSON.stringify(obj)); appendLog('sent:'+obj.type) } else appendLog('dc not open'); }

  function reset(){ try{ if(dc) dc.close(); if(pc) pc.close(); }catch(e){} pc=null; dc=null; appendLog('connection reset') }

  window.mwWebRTC = { createOffer, acceptOffer, applyAnswer, send, reset, log:appendLog };
})();
