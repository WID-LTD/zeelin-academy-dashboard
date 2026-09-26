(function(){
  'use strict';
  function starsIn(row){ return Array.from(row.querySelectorAll('[data-star],[data-platform-star]')); }
  function valueOf(el){ return Number(el.getAttribute('data-star')||el.getAttribute('data-platform-star')||0); }
  function preview(row,n,on){
    starsIn(row).forEach(star=>star.classList.toggle('platform-star-preview',on&&valueOf(star)<=n));
  }
  document.addEventListener('mouseover',e=>{
    const star=e.target.closest&&e.target.closest('[data-star],[data-platform-star]');
    if(!star) return;
    const row=star.closest('.star-row,[data-rating-group]');
    if(row) preview(row,valueOf(star),true);
  });
  document.addEventListener('mouseout',e=>{
    const star=e.target.closest&&e.target.closest('[data-star],[data-platform-star]');
    if(!star) return;
    const row=star.closest('.star-row,[data-rating-group]');
    if(row&&!row.contains(e.relatedTarget)) preview(row,0,false);
  });
  document.addEventListener('click',e=>{
    const star=e.target.closest&&e.target.closest('[data-star],[data-platform-star]');
    if(!star||star.classList.contains('starb')) return;
    const row=star.closest('.star-row,[data-rating-group]');
    if(!row) return;
    const n=valueOf(star);
    starsIn(row).forEach(s=>{
      const v=valueOf(s);
      s.classList.toggle('platform-star-selected',v<=n);
      s.setAttribute('aria-checked',v===n?'true':'false');
    });
  });
})();