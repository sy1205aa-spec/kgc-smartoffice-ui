/* 현업 검토용 공통 헤더. 운영 API 대신 정적 메뉴와 브라우저 내 시연 설정을 사용합니다. */
(function () {
  'use strict';
  const root = new URL('./', document.currentScript.src);
  const asset = new URL('../images/web_a/', root);
  const key = 'KGC_PC_PREVIEW_MENUS_1020';
  const defaults = [
    {id:'dashboard',name:'대시보드',icon:'dashboard',url:'main.html'},
    {id:'seat',name:'좌석예약',icon:'seat',url:'works/seat.html'},
    {id:'meeting',name:'회의실예약',icon:'meeting',url:'works/meeting.html'},
    {id:'locker',name:'사물함예약',icon:'locker',url:'works/locker.html'},
    {id:'parking',name:'주차정산',icon:'parking',url:'parking.html'},
    {id:'bus',name:'셔틀버스',icon:'bus',url:'busReservation.html'},
    {id:'myreserv',name:'나의예약',icon:'myreserv',url:'works/myresv.html'}
  ];
  const href = path => new URL(path, root).href;
  const activeId = () => {
    const file = location.pathname.split('/').pop();
    if (file.startsWith('meeting')) return 'meeting';
    if (file.startsWith('myresv')) return 'myreserv';
    return (defaults.find(m => m.url.split('/').pop() === file) || {}).id;
  };
  function menus() {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
    if (!Array.isArray(saved)) saved = [];
    return defaults.map(m => ({...m, ...(saved.find(s => s.id === m.id) || {}), url:m.url}));
  }
  function link(m, compact) {
    const a = document.createElement('a');
    a.href = href(m.url);
    a.target = '_self';
    a.dataset.menu = m.id;
    a.className = compact ? 'portal-menu-link' : 'portal-menu-tile';
    if (activeId() === m.id) a.setAttribute('aria-current','page');
    const img = document.createElement('img');
    img.src = new URL('ico/ico_menu_' + m.icon + '.svg',asset).href;
    img.alt = '';
    const text = document.createElement('span');
    text.textContent = m.name;
    a.append(img,text);
    return a;
  }
  function render() {
    let header = document.getElementById('portalHeader');
    if (!header) return;
    header.className = 'portal-header';
    header.innerHTML = '<div class="portal-header-inner"><a class="portal-brand" aria-label="스마트오피스 대시보드"><img alt="KGC"><span>스마트오피스</span></a><nav class="portal-menu" aria-label="주 메뉴"></nav><div class="portal-user"><span><strong>홍길동</strong>님</span><button type="button" class="portal-logout" aria-label="로그아웃"><img alt=""></button><button type="button" class="portal-all" aria-label="전체 메뉴" aria-expanded="false" aria-controls="portalAllMenus"><span></span><span></span><span></span></button></div></div><div id="portalAllMenus" class="portal-all-panel" hidden><div class="portal-panel-inner"><div class="portal-panel-title"><strong>전체 서비스</strong><span>필요한 서비스를 한곳에서 이용하세요.</span></div><nav class="portal-menu-grid" aria-label="전체 서비스 메뉴"></nav></div></div>';
    header.querySelector('.portal-brand').href = href('main.html');
    header.querySelector('.portal-brand img').src = new URL('../images/mobile_a/common/logo.svg',root).href;
    header.querySelector('.portal-logout img').src = new URL('ico/ico_header_logout.svg',asset).href;
    for (const m of menus().filter(m=>m.enabled !== false)) {
      header.querySelector('.portal-menu').append(link(m,true));
      header.querySelector('.portal-menu-grid').append(link(m,false));
    }
    const toggle = header.querySelector('.portal-all');
    toggle.onclick = () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded',String(open));
      header.querySelector('.portal-all-panel').hidden = !open;
    };
    header.querySelector('.portal-logout').onclick = () => {
      if (window.soConfirmAlert) window.soConfirmAlert('로그아웃 하시겠습니까?',()=>location.assign(href('login.html')),'로그아웃');
      else if (confirm('로그아웃 하시겠습니까?')) location.assign(href('login.html'));
    };
  }
  function setup() {
    const css=document.createElement('link'); css.rel='stylesheet'; css.href=href('presentation.css'); document.head.append(css);
    document.documentElement.classList.add('portal-preview');
    render();
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape') {
        const b=document.querySelector('.portal-all[aria-expanded="true"]');
        if(b){b.click();b.focus();}
      }
    });
    document.addEventListener('click',e=>{
      const b=document.querySelector('.portal-all[aria-expanded="true"]');
      if(b && !e.target.closest('#portalHeader')) b.click();
    });
    document.querySelectorAll('.card-icon').forEach((el,i)=>{
      const img=document.createElement('img'); img.src=new URL('ico/ico_menu_'+['seat','meeting','locker'][i]+'.svg',asset).href;img.alt='';el.replaceChildren(img);
    });
    document.querySelectorAll('.service-icon').forEach(el=>el.setAttribute('aria-hidden','true'));
    const hero=document.querySelector('.hero-text');
    if(hero){const label=document.createElement('p');label.className='portal-eyebrow';label.textContent='MY SMART OFFICE';hero.prepend(label);}
    if(!location.pathname.includes('/works/')) {
      const badge=document.createElement('a');badge.href=href('index.html');badge.className='portal-preview-note';badge.textContent='화면 시안 · 예시 데이터';document.body.append(badge);
    }
    const qr=document.querySelector('.qr-image-wrap');
    if(qr){qr.innerHTML='<div class="portal-qr-placeholder"><span>APP</span><small>설치 QR 준비중</small></div>';const guide=document.querySelector('.qr-guide-text');if(guide)guide.innerHTML='<p>스마트오피스를 모바일에서도 편리하게</p><small>설치 주소 확정 후 QR 코드가 제공됩니다.</small>';}
    const manager=document.getElementById('menuPreviewRows');
    if(manager) setupManager(manager);
  }
  function setupManager(container) {
    for(const m of menus()) {
      const row=document.createElement('label');row.className='menu-edit-row';
      const check=document.createElement('input');check.type='checkbox';check.checked=m.enabled!==false;check.dataset.id=m.id;
      const name=document.createElement('input');name.type='text';name.value=m.name;name.maxLength=12;name.setAttribute('aria-label',m.name+' 메뉴 이름');
      const system=document.createElement('span');system.textContent=m.url.includes('works/')?'공간예약':'스마트오피스';
      if(m.id==='dashboard'){check.disabled=true;check.title='대시보드는 항상 표시합니다.';}
      row.append(check,name,system);container.append(row);
    }
    document.getElementById('savePreviewMenus').onclick=()=>{
      const data=[...container.children].map(row=>({id:row.children[0].dataset.id,enabled:row.children[0].checked,name:row.children[1].value.trim() || defaults.find(m=>m.id===row.children[0].dataset.id).name}));
      try {localStorage.setItem(key,JSON.stringify(data));document.getElementById('menuSaveStatus').textContent='반영했습니다. 대시보드와 예약 화면에서 같은 메뉴를 확인하세요.';render();}
      catch(_){document.getElementById('menuSaveStatus').textContent='브라우저 저장소를 사용할 수 없습니다. 로컬 HTTP 서버로 열어주세요.';}
    };
    document.getElementById('resetPreviewMenus').onclick=()=>{try{localStorage.removeItem(key);}catch(_){} location.reload();};
  }
  window.addEventListener('storage',e=>{if(e.key===key)render();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
