<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>J.A.R.V.I.S</title>
<style>
body{background:#000;color:#00e5ff;font-family:monospace;text-align:center;padding:10px}
#chat{height:280px;overflow-y:auto;border:1px solid #00e5ff;padding:10px;text-align:left}
.msg{margin:8px;padding:8px;border-radius:8px}
.user{background:#003a4a;color:#fff}
.ai{background:#001a20}
input{width:60%;padding:12px}
button{padding:12px;background:#00e5ff;border:none;font-weight:bold;margin:2px}
#status{color:yellow;font-size:13px}
</style>
</head>
<body>
<h1>J.A.R.V.I.S</h1>
<p id="status">Checking...</p>
<div id="chat"></div><br>
<input id="msg" placeholder="Type here...">
<button id="send">SEND</button>
<button id="mic-btn">🎙</button>
<button id="test">TEST API</button>
<button id="reset">RESET KEY</button>

<script>
let API_KEY = localStorage.getItem('jarvis_key');
if(!API_KEY){
  API_KEY = prompt('Enter your Gemini API Key:');
  if(API_KEY) localStorage.setItem('jarvis_key', API_KEY);
}
document.getElementById('status').innerText = API_KEY ? 'API Key Found: ' + API_KEY.slice(0,8) + '...' : 'NO API KEY';

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
const chat = document.getElementById('chat');
const input = document.getElementById('msg');
const micBtn = document.getElementById('mic-btn');

async function callGemini(p){
  let lastErr;
  for(const m of MODELS){
    try{
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + m + ":generateContent?key=" + API_KEY,
      {method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({contents:[{parts:[{text:"You are JARVIS. Reply short. User: " + p}]}]})});
      const data = await res.json();
      if(data.error){ lastErr = new Error(m + " : " + data.error.message); continue; }
      return data.candidates[0].content.parts[0].text;
    }catch(e){ lastErr = e; }
  }
  throw lastErr;
}
async function askGemini(p){
  add('J.A.R.V.I.S: Thinking...','ai');
  try{
    const reply = await callGemini(p);
    chat.lastChild.innerText = 'J.A.R.V.I.S: ' + reply;
    speak(reply);
  }catch(e){ chat.lastChild.innerText = 'J.A.R.V.I.S: ERROR - ' + e.message; }
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if(!SR){ document.getElementById('status').innerText = 'MIC NOT SUPPORTED - Use Chrome, not File Manager. Use HTTP Server.'; }
const rec = SR ? new SR() : null;
if(rec){
  rec.lang = 'en-US';
  rec.onresult = (e) => { const t = e.results[0][0].transcript; add('YOU: ' + t,'user'); askGemini(t); };
  micBtn.onclick = () => { try{ rec.start(); micBtn.innerText='LISTENING...'; }catch(err){ alert(err.message); } };
  rec.onend = () => { micBtn.innerText='🎙'; };
  rec.onerror = (e) => { alert('Mic Error: ' + e.error + ' - Allow Mic permission in Chrome'); };
}
let voices=[];
function loadVoices(){ voices=speechSynthesis.getVoices(); }
loadVoices(); speechSynthesis.onvoiceschanged=loadVoices;
function speak(t){ const u=new SpeechSynthesisUtterance(t); u.rate=1.05; u.pitch=0.85; const v=voices.find(v=>v.lang.startsWith('en')); if(v) u.voice=v; speechSynthesis.speak(u); }
document.getElementById('send').onclick=()=>{ const t=input.value.trim(); if(!t)return; add('YOU: '+t,'user'); input.value=''; askGemini(t); };
document.getElementById('test').onclick=async()=>{ add('TESTING API...','ai'); try{ const r=await callGemini('Say Hi'); chat.lastChild.innerText='TEST SUCCESS: '+r; }catch(e){ chat.lastChild.innerText='TEST FAILED: '+e.message; } };
document.getElementById('reset').onclick=()=>{ localStorage.removeItem('jarvis_key'); location.reload(); };
function add(t,w){ const d=document.createElement('div'); d.className='msg '+w; d.innerText=t; chat.appendChild(d); chat.scrollTop=chat.scrollHeight; }
</script>
</body>
</html>
