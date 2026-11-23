(function(){
  // Numero WhatsApp collegato al link wa.me/message/5WP3QA3OBPK4P1
  var WA_NUMBER = '3908118215743';

  var header = document.querySelector('.site-header');
  function onScroll(){ if(header) header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  var burger = document.querySelector('.burger');
  if(burger){
    burger.addEventListener('click', function(){
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-menu a').forEach(function(a){
      a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded','false'); });
    });
  }
  document.querySelectorAll('.nav-dd>button').forEach(function(b){
    b.addEventListener('click', function(){ var p=b.parentElement; var o=p.classList.toggle('open'); b.setAttribute('aria-expanded', o?'true':'false'); });
  });
  document.addEventListener('click', function(e){
    document.querySelectorAll('.nav-dd.open').forEach(function(d){ if(!d.contains(e.target)){ d.classList.remove('open'); } });
  });

  // Reveal
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  // Forms -> Netlify Forms + WhatsApp
  function encode(data){
    return Object.keys(data).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(data[k]); }).join('&');
  }
  document.querySelectorAll('form.js-wa-form').forEach(function(form){
    form.setAttribute('novalidate','');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = true, first = null;
      form.querySelectorAll('.field').forEach(function(f){ f.classList.remove('invalid'); });
      form.querySelectorAll('[required]').forEach(function(inp){
        var valid = true;
        if(inp.type === 'checkbox'){ valid = inp.checked; }
        else if(inp.type === 'radio'){ valid = !!form.querySelector('input[name="'+inp.name+'"]:checked'); }
        else { valid = inp.value.trim() !== '' && (inp.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())); }
        if(inp.type === 'tel' && valid){ valid = inp.value.replace(/[^0-9]/g,'').length >= 8; }
        if(!valid){
          ok = false;
          var wrap = inp.closest('.field') || inp.closest('.consent');
          if(wrap) wrap.classList.add('invalid');
          if(!first) first = inp;
        }
      });
      if(!ok){ if(first){ first.focus({preventScroll:true}); first.scrollIntoView({behavior:'smooth', block:'center'}); } return; }

      var fd = new FormData(form), data = {}, lines = [];
      var title = form.getAttribute('data-title') || 'Richiesta dal sito';
      lines.push('*' + title + '*');
      fd.forEach(function(v,k){
        data[k] = data[k] ? data[k] + ', ' + v : v;
      });
      form.querySelectorAll('[data-label]').forEach(function(inp){
        var k = inp.name; if(!k || lines._seen && lines._seen[k]) return;
        lines._seen = lines._seen || {}; lines._seen[k] = 1;
        var v = data[k]; if(!v || k === 'privacy') return;
        lines.push(inp.getAttribute('data-label') + ': ' + String(v).trim());
      });
      var text = lines.join('\n');
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);

      // Salva anche su Netlify Forms
      try{
        fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:encode(data), keepalive:true}).catch(function(){});
      }catch(err){}

      var success = form.parentElement.querySelector('.form-success');
      var waBtn = success && success.querySelector('.js-wa-again');
      if(waBtn) waBtn.setAttribute('href', url);
      var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if(success){ form.style.display = 'none'; success.classList.add('show'); success.scrollIntoView({behavior:'smooth', block:'center'}); }
      if(isMobile){ window.location.href = url; }
      else { var w = window.open(url, '_blank', 'noopener'); if(!w){ window.location.href = url; } }
    });
    form.querySelectorAll('input,select,textarea').forEach(function(inp){
      inp.addEventListener('input', function(){ var w = inp.closest('.field') || inp.closest('.consent'); if(w) w.classList.remove('invalid'); });
      inp.addEventListener('change', function(){ var w = inp.closest('.field') || inp.closest('.consent'); if(w) w.classList.remove('invalid'); });
    });
  });


  // Popup locandina: compare all'ingresso per 4 secondi (una volta per sessione)
  (function(){
    var PROMO_URL = 'corso-panettone.html';
    if (location.pathname.indexOf('corso-panettone') !== -1) return;
    // Il popup non compare più dal 25 novembre 2026 (ora italiana)
    var PROMO_FINE = new Date('2026-11-25T00:00:00+01:00');
    if (new Date() >= PROMO_FINE) return;
    try { if (sessionStorage.getItem('promoPanettone')) return; } catch(e){}
    var box = document.createElement('div');
    box.className = 'promo'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Nuovo corso in arrivo');
    box.innerHTML = '<div class="promo-card">' +
      '<div class="promo-head">Nuovo corso in arrivo</div>' +
      '<button class="promo-close" type="button" aria-label="Chiudi">&times;</button>' +
      '<a class="promo-link" href="' + PROMO_URL + '">' +
        '<img src="img/locandina-panettone-sm.webp" srcset="img/locandina-panettone-sm.webp 720w, img/locandina-panettone-lg.webp 1200w" sizes="420px" width="720" height="900" alt="Corso di panettone artigianale con Marco Manzi, sabato 28 e domenica 29 novembre, 200 euro, Pizzeria Giotto Firenze">' +
        '<span class="promo-cta">Scopri il corso e iscriviti &rarr;</span>' +
      '</a><span class="promo-bar"></span></div>';
    var timer;
    function close(){ box.classList.remove('show'); clearTimeout(timer); setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); }, 500); document.removeEventListener('keydown', onKey); }
    function onKey(e){ if(e.key === 'Escape') close(); }
    box.addEventListener('click', function(e){ if(e.target === box || e.target.closest('.promo-close')) close(); });
    var img = box.querySelector('img');
    function open(){
      document.body.appendChild(box);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ box.classList.add('show'); }); });
      timer = setTimeout(close, 4400);
      document.addEventListener('keydown', onKey);
      try { sessionStorage.setItem('promoPanettone','1'); } catch(e){}
    }
    var started = false;
    function start(){ if(started) return; started = true; setTimeout(open, 600); }
    var pre = new Image(); pre.onload = start; pre.onerror = start; pre.src = 'img/locandina-panettone-sm.webp';
    setTimeout(start, 2500);
  })();

  var y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
})();
