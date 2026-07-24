// 공통 레이아웃 HTML 삽입 유틸리티
// 각 페이지 <body> 태그 안에 아래 스크립트를 포함하여 헤더/사이드바/푸터를 동적 삽입

const BO_LAYOUT_HTML = `
<!-- 로딩 바 -->
<div class="ajax-loading" id="ajaxLoading"><span class="ajax-loading__bar"></span></div>

<!-- 헤더 -->
<header class="topbar">
  <a class="topbar__brand" href="main.html">
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#087b5b"/>
      <text x="20" y="27" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="Inter,sans-serif">SO</text>
      <text x="56" y="17" fill="#17202a" font-size="13" font-weight="900" font-family="Inter,sans-serif">Smart Office</text>
      <text x="56" y="32" fill="#6d7782" font-size="10" font-family="Inter,sans-serif">Back Office</text>
    </svg>
  </a>
  <div class="topbar__actions">
    <span class="topbar__environment">ADMIN</span>
    <span class="topbar__user">
      <strong>관리자</strong>
      <small>admin</small>
    </span>
    <button class="button button--ghost button--small" type="button" onclick="if(confirm('로그아웃 하시겠습니까?')) location.href='login.html'">로그아웃</button>
  </div>
</header>

<!-- 사이드바 -->
<aside class="sidebar" id="sidebar">
  <div class="sidebar__section">
    <p class="sidebar__label">MANAGEMENT</p>
    <nav class="sidebar__nav" aria-label="관리 메뉴">
      <a class="sidebar__item" data-menu="DASHBOARD" href="main.html">
        <span class="sidebar__icon">D</span>
        <span>대시보드</span>
      </a>
      <div class="sidebar__menu-group" id="group-bus">
        <button class="sidebar__item sidebar__item--parent" type="button" data-sidebar-toggle>
          <span class="sidebar__icon">B</span>
          <span>통근버스</span>
          <span class="sidebar__chevron" aria-hidden="true"></span>
        </button>
        <div class="sidebar__subnav" data-sidebar-panel>
          <a class="sidebar__subitem" data-menu="BUS_MANAGEMENT" href="bus-list.html">버스관리</a>
          <a class="sidebar__subitem" data-menu="BUS_PASSENGERS" href="bus-passengers.html">탑승자관리</a>
          <a class="sidebar__subitem" data-menu="BUS_HISTORIES" href="bus-histories.html">탑승자관리이력</a>
          <a class="sidebar__subitem" data-menu="BUS_BOARDING_HISTORY" href="bus-boarding-history.html">탑승이력</a>
        </div>
      </div>
      <div class="sidebar__menu-group" id="group-parking">
        <button class="sidebar__item sidebar__item--parent" type="button" data-sidebar-toggle>
          <span class="sidebar__icon">P</span>
          <span>주차관리</span>
          <span class="sidebar__chevron" aria-hidden="true"></span>
        </button>
        <div class="sidebar__subnav" data-sidebar-panel>
          <a class="sidebar__subitem" data-menu="PARKING_STATUS" href="parking.html">주차할인현황</a>
          <a class="sidebar__subitem" data-menu="PARKING_VEHICLES" href="parking-vehicles.html">차량관리</a>
        </div>
      </div>
      <div class="sidebar__menu-group" id="group-common">
        <button class="sidebar__item sidebar__item--parent" type="button" data-sidebar-toggle>
          <span class="sidebar__icon">C</span>
          <span>공통관리</span>
          <span class="sidebar__chevron" aria-hidden="true"></span>
        </button>
        <div class="sidebar__subnav" data-sidebar-panel>
          <a class="sidebar__subitem" data-menu="COMMON_ACCOUNTS" href="accounts.html">계정관리</a>
          <a class="sidebar__subitem" data-menu="COMMON_ROLES" href="roles.html">권한관리</a>
          <a class="sidebar__subitem" data-menu="COMMON_MENUS" href="menus.html">메뉴관리</a>
          <a class="sidebar__subitem" data-menu="COMMON_CODES" href="codes.html">공통코드관리</a>
        </div>
      </div>
    </nav>
  </div>
</aside>
`;

const BO_FOOTER_HTML = `
<footer class="footer">
  <span>© 2026 Smart Office</span>
  <span>GS ITM · Back Office System</span>
</footer>
<div class="common-modal" id="commonModal">
  <button class="common-modal__backdrop" type="button"></button>
  <div class="common-modal__dialog">
    <h2 id="modalTitle">알림</h2>
    <p id="modalMessage"></p>
    <div class="common-modal__actions">
      <button class="button button--ghost button--small" type="button" id="modalCancelBtn">닫기</button>
      <button class="button button--danger button--small" type="button" id="modalConfirmBtn" style="display:none">확인</button>
    </div>
  </div>
</div>
<div class="common-toast" id="commonToast"></div>
`;

// 레이아웃 자동 삽입
document.addEventListener('DOMContentLoaded', () => {
  // body 맨 앞에 헤더/사이드바 삽입
  const layoutDiv = document.createElement('div');
  layoutDiv.innerHTML = BO_LAYOUT_HTML;
  document.body.insertBefore(layoutDiv, document.body.firstChild);
  
  // body 맨 뒤에 푸터/모달 삽입
  const footerDiv = document.createElement('div');
  footerDiv.innerHTML = BO_FOOTER_HTML;
  document.body.appendChild(footerDiv);

  // 모달 이벤트
  document.getElementById('modalCancelBtn').addEventListener('click', BOLayout.closeModal.bind(BOLayout));
  document.querySelector('.common-modal__backdrop').addEventListener('click', BOLayout.closeModal.bind(BOLayout));

  // 공통 초기화
  BOLayout.init();
});
