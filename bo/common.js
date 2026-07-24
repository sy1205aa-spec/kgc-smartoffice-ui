/**
 * Smart Office Back Office - 공통 레이아웃 유틸리티
 */
const BOLayout = {
  // 현재 활성 메뉴 식별
  getActiveMenu() {
    const page = location.pathname.split('/').pop() || 'main.html';
    if (page === 'main.html') return 'DASHBOARD';
    if (page === 'bus-list.html') return 'BUS_MANAGEMENT';
    if (page === 'bus-passengers.html') return 'BUS_PASSENGERS';
    if (page === 'bus-histories.html') return 'BUS_HISTORIES';
    if (page === 'bus-boarding-history.html') return 'BUS_BOARDING_HISTORY';
    if (page === 'parking.html') return 'PARKING_STATUS';
    if (page === 'parking-vehicles.html') return 'PARKING_VEHICLES';
    if (page === 'accounts.html') return 'COMMON_ACCOUNTS';
    if (page === 'roles.html') return 'COMMON_ROLES';
    if (page === 'menus.html') return 'COMMON_MENUS';
    if (page === 'codes.html') return 'COMMON_CODES';
    return '';
  },

  // 사이드바 초기화
  initSidebar() {
    const activeMenu = this.getActiveMenu();
    
    // 활성 메뉴 하이라이트
    document.querySelectorAll('.sidebar__item[data-menu]').forEach(el => {
      if (el.dataset.menu === activeMenu) el.classList.add('is-active');
    });
    document.querySelectorAll('.sidebar__subitem[data-menu]').forEach(el => {
      if (el.dataset.menu === activeMenu) el.classList.add('is-active');
    });

    // 그룹 자동 열기
    if (activeMenu.startsWith('BUS_')) document.getElementById('group-bus')?.classList.add('is-open');
    if (activeMenu.startsWith('PARKING_')) document.getElementById('group-parking')?.classList.add('is-open');
    if (activeMenu.startsWith('COMMON_')) document.getElementById('group-common')?.classList.add('is-open');

    // 사이드바 토글 이벤트
    document.querySelectorAll('[data-sidebar-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.sidebar__menu-group').classList.toggle('is-open');
      });
    });
  },

  // 날짜 세팅
  setBaseDate(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const today = new Date();
    el.textContent = today.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
  },

  // 모달 열기
  openModal(title, message, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    const modal = document.getElementById('commonModal');
    modal.classList.add('is-open');
    document.body.classList.add('has-modal');
    if (onConfirm) {
      document.getElementById('modalConfirmBtn').style.display = '';
      document.getElementById('modalConfirmBtn').onclick = () => { onConfirm(); BOLayout.closeModal(); };
    } else {
      document.getElementById('modalConfirmBtn').style.display = 'none';
    }
  },

  // 모달 닫기
  closeModal() {
    document.getElementById('commonModal')?.classList.remove('is-open');
    document.body.classList.remove('has-modal');
  },

  // 토스트 메시지
  showToast(message, isError = false) {
    const toast = document.getElementById('commonToast');
    toast.textContent = message;
    toast.className = 'common-toast' + (isError ? ' common-toast--error' : '') + ' is-open';
    setTimeout(() => toast.classList.remove('is-open'), 2400);
  },

  // 로딩 바
  showLoading() {
    document.getElementById('ajaxLoading')?.classList.add('is-active');
  },
  hideLoading() {
    document.getElementById('ajaxLoading')?.classList.remove('is-active');
  },

  // 초기화
  init() {
    this.initSidebar();
    this.setBaseDate('baseDate');
    // 모달 backdrop 닫기
    document.getElementById('commonModal')?.querySelector('.common-modal__backdrop')?.addEventListener('click', () => this.closeModal());
  }
};

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => BOLayout.init());
