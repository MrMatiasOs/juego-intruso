document.addEventListener('DOMContentLoaded', () => {
  const CAT = {
    "Frutas": ["manzana","pera","naranja","banana","uva","limón","frutilla","sandía","melón"],
    "Animales": ["perro","gato","vaca","caballo","oveja","pato","pez","gallina","conejo"],
    "Ropa": ["camisa","pantalón","zapato","abrigo","gorra","bufanda","medias","falda"],
    "Herramientas": ["martillo","destornillador","llave inglesa","sierra","alicate","tenaza","cinta métrica"],
    "Bebidas": ["agua","té","café","leche","jugo","mate","limonada"],
    "Muebles": ["mesa","silla","cama","ropero","sofa","estante","escritorio"],
    "Transportes": ["auto","colectivo","tren","avión","bicicleta","barco","moto"],
    "Verduras": ["zanahoria","tomate","lechuga","cebolla","papa","zapallo","pepino"]
  };

  let rondasTotales = 8, ronda = 0, aciertos = 0, nOpc = 4, bar;

  const juegoEl = document.getElementById('juego');
  const progresoEl = document.getElementById('progreso');
  const aciertosEl = document.getElementById('aciertos');
  const btnComenzar = document.getElementById('btnComenzar');
  const btnReiniciar = document.getElementById('btnReiniciar');
  const btnPista = document.getElementById('btnPista');
  const selRondas = document.getElementById('rondas');
  const selOpc = document.getElementById('opciones');
  const selTam = document.getElementById('tamano');

  const barajar = (arr)=>{ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };
  const elegirCategoria = (excluir=null)=> Object.keys(CAT).filter(k=>k!==excluir)[Math.floor(Math.random()* (Object.keys(CAT).length-(excluir?1:0)))];
  const sample = (arr,k)=>{ const c=[...arr]; barajar(c); return c.slice(0,k); };

  function actualizar(){ progresoEl.textContent = `${Math.min(ronda, rondasTotales)}/${rondasTotales}`; aciertosEl.textContent = aciertos; if(bar){ bar.style.width = Math.round((Math.min(ronda, rondasTotales)/rondasTotales)*100) + "%"; } }

  function construirRonda(){
    const cat = elegirCategoria(); const otra = elegirCategoria(cat);
    const correctas = sample(CAT[cat], Math.max(2, nOpc-1));
    const intruso = sample(CAT[otra], 1)[0];
    let opciones = barajar([ ...correctas.map(x=>({txt:x, ok:false})), {txt:intruso, ok:true, catIntruso:otra} ]).slice(0,nOpc);
    if(!opciones.some(o=>o.ok)){ opciones[0]={txt:intruso,ok:true,catIntruso:otra}; barajar(opciones); }
    return { cat, opciones };
  }

  function renderPregunta(){
    if(ronda >= rondasTotales){ return renderFin(); }
    const { cat, opciones } = construirRonda();
    juegoEl.innerHTML = `
      <div class="tarjeta">
        <div class="progresoBar"><div></div></div>
        <p class="pregunta">🧠 ¿Qué palabra <strong>no</strong> pertenece al grupo?</p>
        <div class="opciones" id="ops"></div>
        <p id="fb" class="feedback" aria-live="polite"></p>
        <div class="acciones"><button id="next" class="btn principal" disabled>Siguiente</button></div>
      </div>`;
    bar = juegoEl.querySelector('.progresoBar>div'); actualizar();

    const cont = document.getElementById('ops');
    opciones.forEach((op,i)=>{
      const b = document.createElement('button');
      b.className = op.ok ? 'correcta' : 'incorrecta';
      b.innerHTML = `<strong>${i+1}.</strong> ${op.txt}`;
      b.onclick = ()=> elegir(b, op, cat);
      cont.appendChild(b);
    });

    document.addEventListener('keydown', function onKey(e){ const n=+e.key; if(n>=1 && n<=5){ cont.children[n-1]?.click(); document.removeEventListener('keydown', onKey); } }, {once:true});

    btnPista.hidden = false;
    btnPista.onclick = ()=>{ const fb=document.getElementById('fb'); fb.className="feedback"; fb.textContent = `Pista: categoría del grupo = “${cat}”.`; };
  }

  function elegir(btn, op, cat){
    [...document.querySelectorAll('.opciones button')].forEach(b=> b.disabled=true);
    btn.classList.add('marcada');
    const fb = document.getElementById('fb'); const next = document.getElementById('next');
    if(op.ok){ aciertos++; fb.className="feedback ok"; fb.textContent=`✔ Correcto. El intruso es “${op.txt}”. La categoría es “${cat}”.`; }
    else { fb.className="feedback bad"; fb.textContent=`✘ Casi. La categoría del grupo es “${cat}”.`; }
    next.disabled = false; next.focus();
    next.onclick = ()=>{ ronda++; actualizar(); renderPregunta(); };
  }

  function renderFin(){
    juegoEl.innerHTML = `<div class="tarjeta"><p class="pregunta">🎉 ¡Buen trabajo!</p><p>Tu resultado: <strong>${aciertos}</strong> de <strong>${rondasTotales}</strong>.</p></div>`;
    btnReiniciar.hidden=false; btnComenzar.hidden=true; btnPista.hidden=true;
  }

  function comenzar(){
    document.body.classList.toggle('muy-grande', selTam.value==='muy-grande');
    rondasTotales = +selRondas.value; nOpc = +selOpc.value; ronda=0; aciertos=0;
    btnReiniciar.hidden=true; btnComenzar.hidden=true; btnPista.hidden=false;
    renderPregunta();
  }

  btnComenzar.addEventListener('click', comenzar);
  btnReiniciar.addEventListener('click', ()=>{ btnComenzar.hidden=false; btnPista.hidden=true; juegoEl.innerHTML=""; aciertos=0; ronda=0; actualizar(); });
  selTam.addEventListener('change', ()=> document.body.classList.toggle('muy-grande', selTam.value==='muy-grande'));
  actualizar();
});
