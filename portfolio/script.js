(function(){
var db,cur,urls=[];
var req=indexedDB.open("sean-portfolio",1);
req.onupgradeneeded=function(){req.result.createObjectStore("w",{keyPath:"id"})};
req.onsuccess=function(){db=req.result;render()};
req.onerror=function(){render()};
function all(cb){if(!db)return cb([]);try{var r=db.transaction("w").objectStore("w").getAll();r.onsuccess=function(){cb(r.result||[])};r.onerror=function(){cb([])}}catch(e){cb([])}}
function put(o,cb){if(!db)return cb&&cb();try{var t=db.transaction("w","readwrite");t.objectStore("w").put(o);t.oncomplete=function(){cb&&cb()}}catch(e){cb&&cb()}}
function del(id,cb){try{var t=db.transaction("w","readwrite");t.objectStore("w").delete(id);t.oncomplete=cb}catch(e){cb()}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function render(){
  urls.forEach(function(u){URL.revokeObjectURL(u)});urls=[];
  all(function(list){
    ["music","web"].forEach(function(s){
      var g=document.getElementById("g-"+s),items=list.filter(function(w){return w.s===s}).sort(function(a,b){return b.id-a.id});
      if(!items.length){g.innerHTML='<div class="empty">No works yet — tap + Add to upload.</div>';return}
      g.innerHTML="";
      items.forEach(function(w){
        var d=document.createElement("div");d.className="w";var m="",link="";
        if(w.blob){var u=URL.createObjectURL(w.blob);urls.push(u);var t=w.type||"";
          if(t.indexOf("image/")==0)m='<img src="'+u+'" alt="'+esc(w.title)+'">';
          else if(t.indexOf("video/")==0)m='<video src="'+u+'" controls playsinline></video>';
          else if(t.indexOf("audio/")==0)m='<audio src="'+u+'" controls></audio>';
          else m='<a class="b" href="'+u+'" target="_blank" rel="noopener">Open '+esc(w.name||"file")+'</a>';}
        else m='<span style="font-size:28px">↗</span>';
        if(w.url)link=' · <a href="'+esc(w.url)+'" target="_blank" rel="noopener">Visit</a>';
        d.innerHTML='<div class="m">'+m+'</div><div class="t">'+esc(w.title)+link+'</div><button class="x" aria-label="Delete">×</button>';
        d.querySelector(".x").onclick=function(){if(confirm("Delete this work?"))del(w.id,render)};
        g.appendChild(d);
      });
    });
  });
}
var dlg=document.getElementById("dlg"),ti=document.getElementById("ti"),ur=document.getElementById("ur"),fi=document.getElementById("fi");
document.querySelectorAll("[data-add]").forEach(function(b){b.onclick=function(){
  cur=b.dataset.add;ti.value="";ur.value="";fi.value="";
  document.getElementById("urlw").style.display=cur==="web"?"block":"none";
  fi.accept=cur==="music"?"image/*,video/*,audio/*,application/pdf":"image/*,.pdf,.zip,.html,.css,.js,*/*";
  document.getElementById("fl").textContent=cur==="music"?"Screenshot, video, PDF or audio":"Screenshot, image, file or folder (zip)";
  document.getElementById("dt").textContent=cur==="music"?"Add original work":"Add web work";
  dlg.showModal();}});
document.getElementById("cn").onclick=function(){dlg.close()};
document.getElementById("sv").onclick=function(){
  var f=fi.files[0],u=ur.value.trim();
  if(!ti.value.trim()&&!f){ti.focus();return}
  if(!f&&!u)return;
  put({id:Date.now(),s:cur,title:ti.value.trim()||(f?f.name:u),url:u,blob:f||null,type:f?f.type:"",name:f?f.name:""},function(){dlg.close();render()});
};
})();