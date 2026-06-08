/* ============================================================
   LIGHTBRIDGE — shared interactions
   ============================================================ */

/* ---- Sticky header ---- */
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll); onScroll();

/* ---- Mobile drawer ---- */
const burger = document.querySelector('.burger');
const drawer = document.querySelector('.drawer');
if (burger && drawer){
  burger.addEventListener('click', ()=>{
    burger.classList.toggle('open');
    drawer.classList.toggle('open');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  });
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    burger.classList.remove('open');drawer.classList.remove('open');document.body.style.overflow='';
  }));
}

/* ---- Scroll reveal ---- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:.14, rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---- Animated counters ---- */
const animateNum = (el)=>{
  const target = parseFloat(el.dataset.count);
  const dec = (el.dataset.count.split('.')[1]||'').length;
  const pre = el.dataset.pre||''; const suf = el.dataset.suf||'';
  let start=null, dur=1700;
  const step=(t)=>{
    if(!start)start=t; const p=Math.min((t-start)/dur,1);
    const eased=1-Math.pow(1-p,3);
    const val=(target*eased).toFixed(dec);
    el.textContent = pre + Number(val).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}) + suf;
    if(p<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const cio = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ animateNum(e.target); cio.unobserve(e.target);} });
},{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

/* ---- Sparkline (IR illustrative) ---- */
document.querySelectorAll('.spark').forEach(svg=>{
  const pts = (svg.dataset.points||'').split(',').map(Number);
  if(!pts.length) return;
  const w=600,h=54,max=Math.max(...pts),min=Math.min(...pts),rng=(max-min)||1;
  const coords=pts.map((p,i)=>[ (i/(pts.length-1))*w, h-6-((p-min)/rng)*(h-12) ]);
  const d=coords.map((c,i)=>(i?'L':'M')+c[0].toFixed(1)+' '+c[1].toFixed(1)).join(' ');
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`); svg.setAttribute('preserveAspectRatio','none');
  svg.innerHTML=`<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(166,226,46,.35)"/><stop offset="1" stop-color="rgba(166,226,46,0)"/></linearGradient></defs>
    <path d="${d} L ${w} ${h} L 0 ${h} Z" fill="url(#sg)"/>
    <path d="${d}" fill="none" stroke="#A6E22E" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${coords[coords.length-1][0]}" cy="${coords[coords.length-1][1]}" r="3.5" fill="#C6F94E"/>`;
});

/* ============================================================
   HERO ENERGY CANVAS — "bridge of light"
   Particles flow along luminous arcs across the screen,
   evoking power delivered across a network.
   ============================================================ */
(function(){
  const canvas = document.getElementById('energy-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W,H,dpr,particles=[],arcs=[];
  const COLORS=['#36E1FF','#6FEBFF','#8AB4D8','#A6E22E'];

  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=canvas.clientWidth;H=canvas.clientHeight;
    canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    buildArcs();
  }
  function buildArcs(){
    arcs=[];
    const n=Math.max(5,Math.round(W/220));
    for(let i=0;i<n;i++){
      const y=H*(0.25+Math.random()*0.6);
      arcs.push({
        x0:-50, y0:y+ (Math.random()*120-60),
        x1:W+50, y1:y+(Math.random()*120-60),
        cx:W*(0.3+Math.random()*0.4), cy:y-(120+Math.random()*180),
        w:0.5+Math.random()*0.8, hue:Math.random()
      });
    }
    // seed particles on arcs
    particles=[];
    const count=Math.min(150,Math.round(W/9));
    for(let i=0;i<count;i++) particles.push(newP());
  }
  function newP(){
    const a=arcs[(Math.random()*arcs.length)|0];
    return {a, t:Math.random(), sp:0.0012+Math.random()*0.0028,
      r:0.8+Math.random()*2.0, c:COLORS[(Math.random()*COLORS.length)|0], life:1};
  }
  function bez(a,t){
    const mt=1-t;
    const x=mt*mt*a.x0+2*mt*t*a.cx+t*t*a.x1;
    const y=mt*mt*a.y0+2*mt*t*a.cy+t*t*a.y1;
    return [x,y];
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    // faint arc guides
    arcs.forEach(a=>{
      ctx.beginPath();ctx.moveTo(a.x0,a.y0);ctx.quadraticCurveTo(a.cx,a.cy,a.x1,a.y1);
      ctx.strokeStyle='rgba(138,180,216,0.05)';ctx.lineWidth=a.w;ctx.stroke();
    });
    ctx.globalCompositeOperation='lighter';
    particles.forEach(p=>{
      p.t+=p.sp;
      if(p.t>=1){ Object.assign(p,newP()); }
      const [x,y]=bez(p.a,p.t);
      const fade=Math.sin(p.t*Math.PI); // bright in middle
      const r=p.r*(0.6+fade);
      const g=ctx.createRadialGradient(x,y,0,x,y,r*6);
      g.addColorStop(0,p.c);g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.globalAlpha=0.55*fade+0.15;
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*6,0,7);ctx.fill();
      ctx.globalAlpha=0.9*fade;
      ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
    });
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  resize();window.addEventListener('resize',resize);
  if(!mq.matches) draw();
  else { // static frame
    arcs.forEach(a=>{ctx.beginPath();ctx.moveTo(a.x0,a.y0);ctx.quadraticCurveTo(a.cx,a.cy,a.x1,a.y1);
      ctx.strokeStyle='rgba(138,180,216,0.08)';ctx.lineWidth=a.w;ctx.stroke();});
  }
})();

/* ---- FAQ accordion ---- */
document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item');
    const ans=item.querySelector('.faq-a');
    const open=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o=>{
      o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight=null;
    });
    if(!open){ item.classList.add('open'); ans.style.maxHeight=ans.scrollHeight+'px'; }
  });
});

/* ---- Email-alert form (prototype, no backend) ---- */
document.querySelectorAll('.alert-form').forEach(f=>{
  const btn=f.querySelector('button'); const input=f.querySelector('input');
  if(!btn) return;
  btn.addEventListener('click',()=>{
    if(input && input.value && input.value.includes('@')){
      input.value=''; input.placeholder='✓ Subscribed — thank you';
    } else if(input){ input.placeholder='Please enter a valid email'; }
  });
});

/* ---- Contact form (prototype, no backend) ---- */
document.querySelectorAll('.cf-submit').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const card=btn.closest('.card');
    const email=card&&card.querySelector('input[type=email]');
    if(email && email.value && email.value.includes('@')){
      btn.textContent='✓ Message sent — thank you'; btn.disabled=true;
      btn.style.opacity='.8'; btn.style.cursor='default';
    } else if(email){ email.focus(); email.style.borderColor='#ff6b6b'; }
  });
});
