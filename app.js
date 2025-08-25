document.addEventListener('DOMContentLoaded', () => {
  // ------- Catálogo ampliado (26 categorías, 10 ítems c/u aprox.) -------
  const CAT = {
    "Frutas": ["manzana","pera","naranja","banana","uva","limón","frutilla","sandía","melón","durazno"],
    "Verduras": ["zanahoria","tomate","lechuga","cebolla","papa","zapallo","pepino","berenjena","espinaca","brócoli"],
    "Animales": ["perro","gato","vaca","caballo","oveja","cerdo","cabra","burro","toro","ciervo"],
    "Aves": ["paloma","gorrión","águila","loro","gallo","pavo","canario","búho","cisne","flamenco"],
    "Insectos": ["mariposa","abeja","hormiga","mosca","mosquito","mariquita","grillo","libélula","saltamontes","avispa"],
    "Muebles": ["mesa","silla","cama","ropero","sofá","estante","escritorio","cómoda","banco","biblioteca"],
    "Electrodomésticos": ["heladera","lavarropas","microondas","licuadora","tostadora","plancha","aspiradora","lavavajillas","ventilador","horno"],
    "Utensilios de cocina": ["cuchara","tenedor","cuchillo","espátula","batidor","cucharón","colador","pelapapas","tabla","rallador"],
    "Herramientas": ["martillo","destornillador","llave inglesa","sierra","alicate","tenaza","cinta métrica","taladro","nivel","pala"],
    "Ropa": ["camisa","pantalón","abrigo","gorra","bufanda","medias","falda","suéter","remera","campera"],
    "Calzado": ["zapato","zapatilla","bota","sandalia","ojota","pantufla","taco","botín","alpargata","zueco"],
    "Transportes": ["auto","colectivo","tren","avión","bicicleta","barco","moto","tranvía","subte","camión"],
    "Partes del cuerpo": ["cabeza","brazo","mano","pierna","pie","ojo","oreja","nariz","boca","espalda"],
    "Colores": ["rojo","azul","verde","amarillo","naranja","violeta","rosa","marrón","gris","negro"],
    "Formas": ["círculo","cuadrado","triángulo","rectángulo","óvalo","rombo","estrella","pentágono","hexágono","corazón"],
    "Profesiones": ["médico","maestra","carpintero","plomero","enfermera","ingeniero","panadero","electricista","jardinero","conductor"],
    "Lugares de la casa": ["cocina","baño","dormitorio","living","comedor","garaje","patio","balcón","lavadero","pasillo"],
    "Materiales": ["madera","metal","plástico","vidrio","papel","cartón","tela","cuero","cerámica","goma"],
    "Clima": ["lluvia","sol","viento","nieve","granizo","neblina","tormenta","arcoíris","nube","relámpago"],
    "Bebidas": ["agua","té","café","leche","jugo","mate","limonada","gaseosa","chocolate caliente","soda"],
    "Comidas": ["sopa","ensalada","pasta","arroz","pizza","empanada","milanesa","guiso","asado","puré"],
    "Instrumentos musicales": ["guitarra","piano","violín","batería","flauta","trompeta","saxofón","acordeón","tambor","ukelele"],
    "Objetos de escuela": ["cuaderno","lápiz","lapicera","goma","regla","cartuchera","mochila","sacapuntas","tijera","libro"],
    "Tecnologías": ["computadora","celular","tablet","impresora","teclado","ratón","monitor","auriculares","cámara","parlante"],
    "Juguetes": ["pelota","muñeca","rompecabezas","trompo","autito","bloque","osito","yo-yo","barrilete","balero"],
    "Flores": ["rosa","tulipán","margarita","girasol","lirio","jazmín","orquídea","clavel","lavanda","hortensia"]
  };

  // ------- Estado y refs -------
  let rondasTotales = 8, ronda = 0, aciertos = 0, nOpc = 4, bar;
  let categoriaActual = null;
  let ultimaCategoria = null; // evitar repetir la misma categoría seguida

  const juegoEl = document.getElementById('juego');
  const progresoEl = document.getElementById('progreso');
  const aciertosEl = document.getElementById('aciertos');

  const btnComenzar = document.getElementById('btnComenzar');
  const btnReiniciar = document.getElementById('btnReiniciar');
  const btnPista = document.getElementById('btnPista');

  const selRondas = document.getElementById('rondas');
  const selOpc = document.getElementById('opciones');
  const selTam = document.getElementById('tamano');

  // ------- Utilidades -------
  const barajar = (arr)=>{ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };

  // elegir categoría evitando una o varias excluidas
  const elegirCategoria = (excluir = [])=>{
    const excl = Array.isArray(excluir) ? excluir : [excluir];
    const keys = Object.keys(CAT).filter(k=> !excl.includes(k));
    return keys[Math.floor(Math.random()*keys.length)];
  };

  const sample = (arr,k)=>{ const c=[...arr]; barajar(c); return c.slice(0,k); };

  function actualizar(){
    progresoEl.textContent = `${Math.min(ronda, rondasTotales)}/${rondasTotales}`;
    aciertosEl.textContent = aciertos;
    if(bar){
      bar.style.width = Math.round((Math.min(ronda, rondasTotales)/rondasTotales)*100) + "%";
    }
  }

  function construirRonda(){
    // Evitar repetir categoría de la ronda anterior
    categoriaActual = elegirCategoria(ultimaCategoria ? [ultimaCategoria] : []);
    const otra = elegirCategoria([categoriaActual]); // intruso de otra categoría

    const correctas = sample(CAT[categoriaActual], Math.max(2, nOpc-1));
    const intruso = sample(CAT[otra], 1)[0];

    let opciones = barajar([
      ...correctas.map(x=>({txt:x, ok:false})),
      {txt:intruso, ok:true, catIntruso:otra}
    ]).slice(0,nOpc);

    // asegurar que el intruso esté presente
    if(!opciones.some(o=>o.ok)){
      opciones[0] = {txt:intruso, ok:true, catIntruso:otra};
      barajar(opciones);
    }

    // guardar para la próxima ronda
    ultimaCategoria = categoriaActual;

    return opciones;
  }

  function renderPregunta(){
    if(ronda >= rondasTotales){ return renderFin(); }

    const opciones = construirRonda();

    juegoEl.innerHTML = `
      <div class="tarjeta" role="group" aria-labelledby="enunciado">
        <div class="progresoBar" aria-hidden="true"><div></div></div>
        <p id="enunciado" class="pregunta">🧠 ¿Qué palabra <strong>no</strong> pertenece al grupo?</p>
        <div class="opciones" id="ops"></div>
        <p id="fb" class="feedback" aria-live="polite"></p>
        <div class="acciones"><button id="next" class="btn principal" disabled>Siguiente</button></div>
      </div>
    `;
    bar = juegoEl.querySelector('.progresoBar>div'); actualizar();

    const cont = document.getElementById('ops');
    opciones.forEach((op, i)=>{
      const b = document.createElement('button');
      b.className = op.ok ? 'correcta' : 'incorrecta';
      b.setAttribute('aria-label', `Opción ${i+1}: ${op.txt}`);
      b.innerHTML = `<strong>${i+1}.</strong> ${op.txt}`;
      b.onclick = ()=> elegir(b, op);
      cont.appendChild(b);
    });

    // Atajos 1..5
    const onKey = (e)=>{
      const n = parseInt(e.key, 10);
      if(n>=1 && n<=5){ cont.children[n-1]?.click(); document.removeEventListener('keydown', onKey); }
    };
    document.addEventListener('keydown', onKey, {once:true});

    // Pista
    btnPista.hidden = false;
    btnPista.onclick = ()=>{
      const fb=document.getElementById('fb');
      fb.className="feedback";
      fb.textContent = `Pista: categoría del grupo = “${categoriaActual}”.`;
    };
  }

  function elegir(btn, op){
    [...document.querySelectorAll('.opciones button')].forEach(b=> b.disabled = true);
    btn.classList.add('marcada');

    const fb = document.getElementById('fb');
    const next = document.getElementById('next');

    if(op.ok){
      aciertos++;
      fb.className="feedback ok";
      fb.textContent=`✔ Correcto. El intruso es “${op.txt}”. La categoría es “${categoriaActual}”.`;
    } else {
      fb.className="feedback bad";
      fb.textContent=`✘ Casi. La categoría del grupo es “${categoriaActual}”.`;
    }

    next.disabled = false; next.focus();
    next.onclick = ()=>{ ronda++; actualizar(); renderPregunta(); };
  }

  function renderFin(){
    juegoEl.innerHTML = `
      <div class="tarjeta">
        <p class="pregunta">🎉 ¡Buen trabajo!</p>
        <p>Tu resultado: <strong>${aciertos}</strong> de <strong>${rondasTotales}</strong>.</p>
        <p>Puedes volver a jugar cambiando el tamaño de texto u opciones por pregunta.</p>
      </div>
    `;
    btnReiniciar.hidden = false;
    btnComenzar.hidden = true;
    btnPista.hidden = true;
  }

  function aplicarTam(){
    document.body.classList.toggle('muy-grande', selTam.value === 'muy-grande');
    try{ localStorage.setItem('intruso_tamano', selTam.value); }catch{}
  }

  function comenzar(){
    rondasTotales = +selRondas.value;
    nOpc = +selOpc.value;
    ronda = 0; aciertos = 0;
    ultimaCategoria = null; // reset para nueva partida
    btnReiniciar.hidden = true;
    btnComenzar.hidden = true;
    btnPista.hidden = false;
    aplicarTam();
    renderPregunta();
  }

  // ------- Eventos -------
  btnComenzar.addEventListener('click', comenzar);
  btnReiniciar.addEventListener('click', ()=>{
    btnComenzar.hidden = false; btnPista.hidden = true;
    juegoEl.innerHTML=""; aciertos = 0; ronda = 0; ultimaCategoria = null; actualizar();
  });
  selTam.addEventListener('change', aplicarTam);

  // ------- Preferencias locales (opcionales) -------
  try{
    const pref = localStorage.getItem('intruso_tamano');
    if(pref){ selTam.value = pref; aplicarTam(); }
  }catch{}

  actualizar();

  // ------- Modal “Acerca de” (si lo tenés en el HTML) -------
  const aboutBtn   = document.getElementById('aboutBtn');
  const aboutModal = document.getElementById('aboutModal');
  const aboutClose = document.getElementById('aboutClose');
  function openAbout(){ aboutModal?.setAttribute('aria-hidden','false'); aboutClose?.focus(); }
  function closeAbout(){ aboutModal?.setAttribute('aria-hidden','true'); }
  aboutBtn?.addEventListener('click', openAbout);
  aboutClose?.addEventListener('click', closeAbout);
  aboutModal?.addEventListener('click', (e)=>{ if(e.target===aboutModal) closeAbout(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeAbout(); });
});

// ---------- Tema claro/oscuro ----------
const themeBtn   = document.getElementById('themeToggle');
const metaTheme  = document.querySelector('meta[name="theme-color"]');

function applyTheme(mode){
  document.documentElement.setAttribute('data-theme', mode);
  if(themeBtn){
    const isDark = (mode === 'dark');
    themeBtn.setAttribute('aria-pressed', String(isDark));
    themeBtn.textContent = isDark ? '🌙 Oscuro' : '🌞 Claro';
  }
  if(metaTheme){ metaTheme.setAttribute('content', mode==='dark' ? '#0b0b0b' : '#ffffff'); }
}

(function initTheme(){
  let mode = 'dark';
  try{
    mode = localStorage.getItem('theme') ||
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }catch{}
  applyTheme(mode);
})();

themeBtn?.addEventListener('click', ()=>{
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  try{ localStorage.setItem('theme', next); }catch{}
  applyTheme(next);
});