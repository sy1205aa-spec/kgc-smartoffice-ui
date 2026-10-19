/**
 * KGC 스마트오피스 ↔ 구 스마트웍스 원격 통합 메뉴 동기화 스크립트 (menu-sync.js)
 *
 * [설계 목적]
 * 1. 구 스마트웍스(works.kgc.co.kr)의 공통 헤더(WEB-INF/jsp/egovframework/com/usc/com/top.jsp) 하단에
 *    <script src="https://smartworks.kgc.co.kr/static/assets/js/web/menu-sync.js" defer></script>
 *    단 1줄만 추가하여, 신규 스마트오피스(smartworks.kgc.co.kr)의 전체 GNB 메뉴를 100% 동일하게 노출합니다.
 * 2. 양쪽 시스템에 동일한 메뉴가 노출되므로 새 탭(target="_blank")을 띄우지 않고
 *    현재 탭(target="_self")에서 단일 웹사이트처럼 자연스럽게 이동합니다.
 * 3. 향후 스마트오피스에서 메뉴명 변경, 순서 조정, 신규 메뉴 추가/숨김 처리 시
 *    구 스마트웍스(동아피엠) 소스 수정이나 재배포 없이 즉시 자동 반영됩니다.
 */
(function (window, document) {
  'use strict';

  var STORAGE_KEY_MENUS = 'KGC_SO_UNIFIED_MENUS_V1';
  var STORAGE_KEY_SYNC_ENABLED = 'KGC_SO_MENU_SYNC_ENABLED_V1';

  // 현재 페이지가 구 스마트웍스(/web/works/*) 하위인지 판별
  var pathname = window.location.pathname || '';
  var isLegacyWorksPage = pathname.indexOf('/works/') !== -1;

  // 상대 경로 자동 보정 (목업 환경 및 실제 운영 환경 호환)
  var webRootPrefix = isLegacyWorksPage ? '../' : './';
  var assetRootPrefix = isLegacyWorksPage ? '../../' : '../';

  // 구 스마트웍스 원본 top.jsp 기본 메뉴 (동기화 OFF 비교 시연용)
  var LEGACY_ORIGINAL_MENUS = [
    {
      menuId: 'seat',
      menuName: '좌석예약',
      iconClass: 'seat',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/seat.html',
      prodUrl: '/usc/swc/selectSmrtCnterResveList.do',
      matchKeywords: ['seat.html', 'selectSmrtCnterResveList'],
      sortOrder: 1,
      useYn: 'Y'
    },
    {
      menuId: 'meeting',
      menuName: '회의실예약',
      iconClass: 'meet',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/meeting.html',
      prodUrl: '/usc/mtg/selectUscMtgResveDayList.do',
      matchKeywords: ['meeting.html', 'meeting_map.html', 'meeting_week.html', 'meeting_month.html', 'selectUscMtgResve'],
      sortOrder: 2,
      useYn: 'Y'
    },
    {
      menuId: 'locker',
      menuName: '사물함예약',
      iconClass: 'locker',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/locker.html',
      prodUrl: '/usc/loc/selectLockerResveList.do',
      matchKeywords: ['locker.html', 'selectLockerResveList'],
      sortOrder: 3,
      useYn: 'Y'
    },
    {
      menuId: 'myReserv',
      menuName: '나의예약',
      iconClass: 'myReserv',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/myresv.html',
      prodUrl: '/usc/swc/selectSmrtCnterMyResveList.do',
      matchKeywords: ['myresv.html', 'myresv_meeting.html', 'myresv_locker.html', 'MyResveList'],
      sortOrder: 4,
      useYn: 'Y'
    }
  ];

  // 스마트오피스 통합 메뉴 기본값 (GET /api/web/menus 응답 규격과 동일)
  var DEFAULT_UNIFIED_MENUS = [
    {
      menuId: 'dashboard',
      menuName: '대시보드',
      iconClass: 'dashboard',
      targetSys: 'SMARTOFFICE',
      soRelUrl: 'main.html',
      prodUrl: 'https://smartworks.kgc.co.kr/web/main',
      matchKeywords: ['main.html', '/web/main'],
      sortOrder: 1,
      useYn: 'Y',
      isNewInSo: true
    },
    {
      menuId: 'seat',
      menuName: '좌석예약',
      iconClass: 'seat',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/seat.html',
      prodUrl: 'https://works.kgc.co.kr/usc/swc/selectSmrtCnterResveList.do',
      matchKeywords: ['seat.html', 'selectSmrtCnterResveList'],
      sortOrder: 2,
      useYn: 'Y',
      isNewInSo: false
    },
    {
      menuId: 'meeting',
      menuName: '회의실예약',
      iconClass: 'meet',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/meeting.html',
      prodUrl: 'https://works.kgc.co.kr/usc/mtg/selectUscMtgResveDayList.do',
      matchKeywords: ['meeting.html', 'meeting_map.html', 'meeting_week.html', 'meeting_month.html', 'selectUscMtgResve'],
      sortOrder: 3,
      useYn: 'Y',
      isNewInSo: false
    },
    {
      menuId: 'locker',
      menuName: '사물함예약',
      iconClass: 'locker',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/locker.html',
      prodUrl: 'https://works.kgc.co.kr/usc/loc/selectLockerResveList.do',
      matchKeywords: ['locker.html', 'selectLockerResveList'],
      sortOrder: 4,
      useYn: 'Y',
      isNewInSo: false
    },
    {
      menuId: 'parking',
      menuName: '주차정산',
      iconClass: 'parking',
      targetSys: 'SMARTOFFICE',
      soRelUrl: 'parking.html',
      prodUrl: 'https://smartworks.kgc.co.kr/web/parking',
      matchKeywords: ['parking.html', '/web/parking'],
      sortOrder: 5,
      useYn: 'Y',
      isNewInSo: true
    },
    {
      menuId: 'bus',
      menuName: '셔틀버스',
      iconClass: 'bus',
      targetSys: 'SMARTOFFICE',
      soRelUrl: 'busReservation.html',
      prodUrl: 'https://smartworks.kgc.co.kr/web/bus',
      matchKeywords: ['busReservation.html', '/web/bus'],
      sortOrder: 6,
      useYn: 'Y',
      isNewInSo: true
    },
    {
      menuId: 'myReserv',
      menuName: '나의예약',
      iconClass: 'myReserv',
      targetSys: 'SMARTWORKS',
      soRelUrl: 'works/myresv.html',
      prodUrl: 'https://works.kgc.co.kr/usc/swc/selectSmrtCnterMyResveList.do',
      matchKeywords: ['myresv.html', 'myresv_meeting.html', 'myresv_locker.html', 'MyResveList'],
      sortOrder: 7,
      useYn: 'Y',
      isNewInSo: false
    },
    {
      menuId: 'notice',
      menuName: '공지사항',
      iconClass: 'notice',
      targetSys: 'SMARTOFFICE',
      soRelUrl: 'main.html?notice=1',
      prodUrl: 'https://smartworks.kgc.co.kr/web/notice',
      matchKeywords: ['notice=1', '/web/notice'],
      sortOrder: 8,
      useYn: 'N',
      isNewInSo: true
    },
    {
      menuId: 'faq',
      menuName: 'FAQ 안내',
      iconClass: 'faq',
      targetSys: 'SMARTOFFICE',
      soRelUrl: 'main.html?faq=1',
      prodUrl: 'https://smartworks.kgc.co.kr/web/faq',
      matchKeywords: ['faq=1', '/web/faq'],
      sortOrder: 9,
      useYn: 'N',
      isNewInSo: true
    }
  ];

  function cloneMenus(list) {
    return JSON.parse(JSON.stringify(list));
  }

  function loadUnifiedMenus() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY_MENUS);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore storage error
    }
    return cloneMenus(DEFAULT_UNIFIED_MENUS);
  }

  function saveUnifiedMenus(menus) {
    try {
      window.localStorage.setItem(STORAGE_KEY_MENUS, JSON.stringify(menus));
    } catch (e) {
      // ignore
    }
  }

  function isSyncEnabled() {
    try {
      var val = window.localStorage.getItem(STORAGE_KEY_SYNC_ENABLED);
      return val !== 'N';
    } catch (e) {
      return true;
    }
  }

  function setSyncEnabled(enabled) {
    try {
      window.localStorage.setItem(STORAGE_KEY_SYNC_ENABLED, enabled ? 'Y' : 'N');
    } catch (e) {
      // ignore
    }
  }

  /**
   * 1. 구 스마트웍스(works.kgc.co.kr)에 없는 신규 메뉴 아이콘 CSS 및 시뮬레이터 스타일 동적 주입
   */
  function injectDynamicStyles() {
    if (document.getElementById('so-menu-sync-styles')) {
      return;
    }
    var menuImgBase = assetRootPrefix + 'images/web/menu';
    var btnImgBase = assetRootPrefix + 'images/web_a/btn';

    var css = [
      '/* menu-sync.js: 통합 GNB 아이콘 동적 주입 (구 스마트웍스 CSS 무수정 호환) */',
      '#header { flex-shrink: 0; z-index: 100; }',
      '#logo > span { display: inline-block !important; }',
      '#head ul.menu li > a.dashboard { background-image: url("' + menuImgBase + '/ico_dashboard.svg") !important; }',
      '#head ul.menu li > a.seat { background-image: url("' + menuImgBase + '/ico_seat.svg") !important; }',
      '#head ul.menu li > a.meet { background-image: url("' + menuImgBase + '/ico_meet.svg") !important; }',
      '#head ul.menu li > a.locker { background-image: url("' + menuImgBase + '/ico_locker.svg") !important; }',
      '#head ul.menu li > a.parking { background-image: url("' + menuImgBase + '/ico_parking.svg") !important; }',
      '#head ul.menu li > a.bus { background-image: url("' + menuImgBase + '/ico_bus.svg") !important; }',
      '#head ul.menu li > a.myReserv { background-image: url("' + menuImgBase + '/ico_myReserv.svg") !important; }',
      '#head ul.menu li > a.notice { background-image: url("' + btnImgBase + '/ico_notice.svg") !important; }',
      '#head ul.menu li > a.faq { background-image: url("' + btnImgBase + '/ico_faq.svg") !important; }',
      '#head ul.menu li > a.dashboard.on, #head ul.menu li > a.dashboard:hover { background-image: url("' + menuImgBase + '/ico_dashboard_on.svg") !important; }',
      '#head ul.menu li > a.seat.on, #head ul.menu li > a.seat:hover { background-image: url("' + menuImgBase + '/ico_seat_on.svg") !important; }',
      '#head ul.menu li > a.meet.on, #head ul.menu li > a.meet:hover { background-image: url("' + menuImgBase + '/ico_meet_on.svg") !important; }',
      '#head ul.menu li > a.locker.on, #head ul.menu li > a.locker:hover { background-image: url("' + menuImgBase + '/ico_locker_on.svg") !important; }',
      '#head ul.menu li > a.parking.on, #head ul.menu li > a.parking:hover { background-image: url("' + menuImgBase + '/ico_parking_on.svg") !important; }',
      '#head ul.menu li > a.bus.on, #head ul.menu li > a.bus:hover { background-image: url("' + menuImgBase + '/ico_bus_on.svg") !important; }',
      '#head ul.menu li > a.myReserv.on, #head ul.menu li > a.myReserv:hover { background-image: url("' + menuImgBase + '/ico_myReserv_on.svg") !important; }',
      '#head ul.menu li > a.notice.on, #head ul.menu li > a.notice:hover { background-image: url("' + btnImgBase + '/ico_notice_.svg") !important; }',
      '#head ul.menu li > a.faq.on, #head ul.menu li > a.faq:hover { background-image: url("' + btnImgBase + '/ico_faq_.svg") !important; }',
      '@media screen and (max-width: 1440px) { #logo > span { display: none !important; } }',

      '/* 시연용 상단 도메인 & menu-sync 상태 표시 바 */',
      '#so-sync-status-bar {',
      '  position: sticky; top: 0; left: 0; width: 100%; z-index: 9999;',
      '  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;',
      '  padding: 7px 24px; box-sizing: border-box;',
      '  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif; font-size: 12.5px;',
      '  color: #f8fafc; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.18);',
      '}',
      '#so-sync-status-bar.sys-smartoffice { background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #10b981; }',
      '#so-sync-status-bar.sys-smartworks { background: linear-gradient(90deg, #1e1b4b 0%, #312e81 100%); border-bottom: 2px solid #f59e0b; }',
      '#so-sync-status-bar .sync-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }',
      '#so-sync-status-bar .sys-pill {',
      '  display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px;',
      '  font-weight: 800; font-size: 11.5px; letter-spacing: -0.2px;',
      '}',
      '#so-sync-status-bar.sys-smartoffice .sys-pill { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.45); }',
      '#so-sync-status-bar.sys-smartworks .sys-pill { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.45); }',
      '#so-sync-status-bar .domain-url { font-family: monospace; font-size: 12px; color: #cbd5e1; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 4px; }',
      '#so-sync-status-bar .sync-desc { color: #e2e8f0; font-weight: 500; }',
      '#so-sync-status-bar .sync-desc strong { color: #fff; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }',
      '#so-sync-status-bar .sync-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }',
      '#so-sync-status-bar .sync-btn {',
      '  display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 6px;',
      '  font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,0.22);',
      '  background: rgba(255,255,255,0.1); color: #fff; transition: all 0.15s ease;',
      '}',
      '#so-sync-status-bar .sync-btn:hover { background: rgba(255,255,255,0.2); }',
      '#so-sync-status-bar .sync-btn.btn-toggle-on { background: #10b981; border-color: #059669; color: #fff; }',
      '#so-sync-status-bar .sync-btn.btn-toggle-off { background: #ef4444; border-color: #dc2626; color: #fff; }',
      '#so-sync-status-bar .sync-btn.btn-quick-add { background: #3b82f6; border-color: #2563eb; color: #fff; }',
      '#so-sync-status-bar .sync-btn.btn-open-mgr { background: #D71635; border-color: #b8122d; color: #fff; }',

      '/* 구 스마트웍스 화면에서 동기화된 신규 메뉴 하이라이트 뱃지 */',
      '#head ul.menu li > a .so-sync-dot {',
      '  display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;',
      '  margin-left: 3px; vertical-align: super;',
      '}',

      '/* 실시간 메뉴 관리 시뮬레이터 모달 */',
      '#so-menu-mgr-backdrop {',
      '  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); z-index: 100000;',
      '  display: none; align-items: center; justify-content: center; backdrop-filter: blur(3px);',
      '  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;',
      '}',
      '#so-menu-mgr-modal {',
      '  width: 680px; max-width: 94vw; background: #fff; border-radius: 16px;',
      '  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); overflow: hidden; color: #0f172a;',
      '}',
      '#so-menu-mgr-modal .mgr-head {',
      '  padding: 18px 24px; background: #0f172a; color: #fff; display: flex; justify-content: space-between; align-items: center;',
      '}',
      '#so-menu-mgr-modal .mgr-head h3 { margin: 0; font-size: 17px; font-weight: 800; }',
      '#so-menu-mgr-modal .mgr-head p { margin: 4px 0 0; font-size: 12.5px; color: #94a3b8; }',
      '#so-menu-mgr-modal .mgr-close { background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; line-height: 1; }',
      '#so-menu-mgr-modal .mgr-body { padding: 20px 24px; max-height: 70vh; overflow-y: auto; }',
      '#so-menu-mgr-modal .mgr-notice {',
      '  padding: 12px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;',
      '  font-size: 12.5px; color: #166534; margin-bottom: 16px; line-height: 1.55;',
      '}',
      '#so-menu-mgr-modal table { width: 100%; border-collapse: collapse; font-size: 13px; }',
      '#so-menu-mgr-modal th { background: #f8fafc; color: #475569; font-weight: 700; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; }',
      '#so-menu-mgr-modal td { padding: 9px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; vertical-align: middle; }',
      '#so-menu-mgr-modal input[type="text"] {',
      '  width: 120px; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 600;',
      '}',
      '#so-menu-mgr-modal .sys-tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }',
      '#so-menu-mgr-modal .sys-tag.so { background: #dcfce7; color: #15803d; }',
      '#so-menu-mgr-modal .sys-tag.sw { background: #fef3c7; color: #b45309; }',
      '#so-menu-mgr-modal .order-btn {',
      '  padding: 2px 7px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; font-size: 11px;',
      '}',
      '#so-menu-mgr-modal .mgr-foot {',
      '  padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;',
      '}',
      '#so-menu-mgr-modal .mgr-foot button {',
      '  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid transparent;',
      '}',
      '#so-menu-mgr-modal .btn-reset { background: #fff; border-color: #cbd5e1 !important; color: #475569; }',
      '#so-menu-mgr-modal .btn-save { background: #D71635; color: #fff; }'
    ].join('\n');

    var styleEl = document.createElement('style');
    styleEl.id = 'so-menu-sync-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  /**
   * 현재 페이지 URL과 메뉴의 matchKeywords가 일치하는지 판별
   */
  function isMenuActive(menu) {
    var currentUrl = window.location.pathname + window.location.search;
    if (!menu.matchKeywords) return false;
    for (var i = 0; i < menu.matchKeywords.length; i++) {
      if (currentUrl.indexOf(menu.matchKeywords[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * 2. 상단 GNB 메뉴(#head ul.menu) 및 로고/Home 링크를 원격 메뉴 설정으로 동기화
   */
  function renderHeaderMenus() {
    var menuUl = document.querySelector('#header #head .head_L ul.menu') || document.querySelector('#head ul.menu');
    if (!menuUl) {
      return;
    }

    var syncOn = isSyncEnabled();
    var homeHref = webRootPrefix + 'main.html';

    // 로고 및 Home 버튼을 스마트오피스 메인 대시보드로 연결 (_self 이동)
    var logoAnchor = document.querySelector('#logo > a');
    if (logoAnchor) {
      logoAnchor.setAttribute('href', syncOn ? homeHref : (isLegacyWorksPage ? './seat.html' : homeHref));
    }
    var homeAnchor = document.querySelector('#gnb li.tnb a:first-child');
    if (homeAnchor) {
      homeAnchor.setAttribute('href', syncOn ? homeHref : (isLegacyWorksPage ? './seat.html' : homeHref));
    }

    var sourceMenus = (!syncOn && isLegacyWorksPage) ? cloneMenus(LEGACY_ORIGINAL_MENUS) : loadUnifiedMenus();
    var activeMenus = sourceMenus
      .filter(function (m) { return m.useYn === 'Y'; })
      .sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });

    // 현재 URL과 일치하는 활성 메뉴 찾기 (notice/faq 쿼리스트링 우선)
    var matchedMenuId = null;
    for (var i = activeMenus.length - 1; i >= 0; i--) {
      if (isMenuActive(activeMenus[i])) {
        matchedMenuId = activeMenus[i].menuId;
        break;
      }
    }

    var html = activeMenus.map(function (menu) {
      var href = webRootPrefix + menu.soRelUrl;
      var isOn = (menu.menuId === matchedMenuId);
      var cls = 'ico ' + menu.iconClass + (isOn ? ' on' : '');
      var sysLabel = menu.targetSys === 'SMARTOFFICE' ? '스마트오피스' : '구 스마트웍스';
      var titleText = menu.menuName + ' (' + sysLabel + ' - 현재 탭 이동)';
      var dotHtml = (isLegacyWorksPage && syncOn && menu.isNewInSo)
        ? '<i class="so-sync-dot" title="menu-sync.js로 자동 동기화된 스마트오피스 메뉴"></i>'
        : '';

      return (
        '<li>' +
          '<a href="' + href + '" target="_self" class="' + cls + '" data-menu="' + menu.menuId + '" title="' + titleText + '">' +
            '<span>' + menu.menuName + dotHtml + '</span>' +
          '</a>' +
        '</li>'
      );
    }).join('');

    menuUl.innerHTML = html;
  }

  /**
   * 3. 시연용 상단 도메인 & menu-sync.js 실시간 제어 바 렌더링
   */
  function renderSyncStatusBar() {
    var existing = document.getElementById('so-sync-status-bar');
    if (existing) {
      existing.parentNode.removeChild(existing);
    }

    var syncOn = isSyncEnabled();
    var menus = loadUnifiedMenus();
    var noticeMenu = menus.find(function (m) { return m.menuId === 'notice'; });
    var isNoticeActive = noticeMenu && noticeMenu.useYn === 'Y';

    var bar = document.createElement('div');
    bar.id = 'so-sync-status-bar';
    bar.className = isLegacyWorksPage ? 'sys-smartworks' : 'sys-smartoffice';

    var sysBadgeText = isLegacyWorksPage
      ? '🟠 구 스마트웍스 (동아피엠 JSP)'
      : '🟢 신규 스마트오피스 (PC Web)';
    var domainText = isLegacyWorksPage
      ? 'works.kgc.co.kr/usc/...'
      : 'smartworks.kgc.co.kr/web/...';
    var descHtml = isLegacyWorksPage
      ? (syncOn
          ? '<code>top.jsp</code> 내 <strong>menu-sync.js 1줄 주입</strong>으로 스마트오피스 메뉴가 실시간 동기화되었습니다. (초록점 <span style="color:#34d399;">●</span> = 동기화된 신규 메뉴)'
          : '⚠️ <strong>[동기화 OFF 상태]</strong> 구 스마트웍스 원본 <code>top.jsp</code> (기존 4개 메뉴만 노출되어 대시보드/주차/셔틀 이동 불가)')
      : '양쪽 시스템이 <strong>동일한 통합 GNB</strong>를 공유하므로 새 탭(<code>_blank</code>) 없이 <strong>현재 탭(<code>_self</code>)</strong>에서 하나의 사이트처럼 이동합니다.';

    bar.innerHTML =
      '<div class="sync-left">' +
        '<span class="sys-pill">' + sysBadgeText + '</span>' +
        '<span class="domain-url">' + domainText + '</span>' +
        '<span class="sync-desc">' + descHtml + '</span>' +
      '</div>' +
      '<div class="sync-actions">' +
        '<button type="button" class="sync-btn ' + (syncOn ? 'btn-toggle-on' : 'btn-toggle-off') + '" id="btnToggleMenuSync" title="구 스마트웍스 top.jsp에 menu-sync.js 적용 전/후를 비교합니다">' +
          (syncOn ? '✓ menu-sync.js 동기화: ON (통합메뉴)' : '✕ menu-sync.js 동기화: OFF (구 원본 4개)') +
        '</button>' +
        '<button type="button" class="sync-btn btn-quick-add" id="btnQuickToggleNotice" title="스마트오피스에서 신규 메뉴 추가 시 구 스마트웍스에도 무배포로 즉시 반영되는지 테스트합니다">' +
          (isNoticeActive ? '➖ [공지사항] 신메뉴 제거 테스트' : '➕ [공지사항] 신메뉴 추가 테스트') +
        '</button>' +
        '<button type="button" class="sync-btn btn-open-mgr" id="btnOpenMenuMgr">' +
          '⚙️ 통합 메뉴 설정 변경' +
        '</button>' +
      '</div>';

    document.body.insertBefore(bar, document.body.firstChild);

    document.getElementById('btnToggleMenuSync').addEventListener('click', function () {
      setSyncEnabled(!isSyncEnabled());
      renderHeaderMenus();
      renderSyncStatusBar();
    });

    document.getElementById('btnQuickToggleNotice').addEventListener('click', function () {
      var list = loadUnifiedMenus();
      list.forEach(function (m) {
        if (m.menuId === 'notice') {
          m.useYn = (m.useYn === 'Y') ? 'N' : 'Y';
        }
      });
      saveUnifiedMenus(list);
      setSyncEnabled(true);
      renderHeaderMenus();
      renderSyncStatusBar();
    });

    document.getElementById('btnOpenMenuMgr').addEventListener('click', function () {
      openMenuManagerModal();
    });
  }

  /**
   * 4. 통합 메뉴 실시간 관리 시뮬레이터 모달 (메뉴명 변경 / 순서 조정 / 사용여부 ON·OFF)
   */
  function openMenuManagerModal() {
    var backdrop = document.getElementById('so-menu-mgr-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'so-menu-mgr-backdrop';
      document.body.appendChild(backdrop);
    }

    var workingMenus = loadUnifiedMenus().sort(function (a, b) {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    function renderModalContent() {
      var rowsHtml = workingMenus.map(function (m, idx) {
        var sysBadge = m.targetSys === 'SMARTOFFICE'
          ? '<span class="sys-tag so">신규 스마트오피스</span>'
          : '<span class="sys-tag sw">구 스마트웍스</span>';
        return (
          '<tr data-idx="' + idx + '">' +
            '<td><strong>' + (idx + 1) + '</strong></td>' +
            '<td><code>' + m.menuId + '</code></td>' +
            '<td><input type="text" class="inp-menu-name" data-idx="' + idx + '" value="' + m.menuName + '"></td>' +
            '<td>' + sysBadge + '</td>' +
            '<td>' +
              '<button type="button" class="order-btn btn-up" data-idx="' + idx + '" ' + (idx === 0 ? 'disabled' : '') + '>▲</button> ' +
              '<button type="button" class="order-btn btn-dn" data-idx="' + idx + '" ' + (idx === workingMenus.length - 1 ? 'disabled' : '') + '>▼</button>' +
            '</td>' +
            '<td>' +
              '<input type="checkbox" class="chk-use-yn" data-idx="' + idx + '" ' + (m.useYn === 'Y' ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;">' +
            '</td>' +
          '</tr>'
        );
      }).join('');

      backdrop.innerHTML =
        '<div id="so-menu-mgr-modal">' +
          '<div class="mgr-head">' +
            '<div>' +
              '<h3>🎛️ 스마트오피스 통합 메뉴(GET /api/web/menus) 실시간 관리 시뮬레이터</h3>' +
              '<p>여기서 메뉴명·순서·노출여부를 변경하면 구 스마트웍스(works.kgc.co.kr) 재배포 없이 양쪽 시스템 GNB에 즉시 반영됩니다.</p>' +
            '</div>' +
            '<button type="button" class="mgr-close" id="btnCloseMenuMgr">&times;</button>' +
          '</div>' +
          '<div class="mgr-body">' +
            '<div class="mgr-notice">' +
              '💡 <strong>기술 검증 포인트:</strong> 구 스마트웍스의 <code>WEB-INF/jsp/egovframework/com/usc/com/top.jsp</code>(53개 화면 공통 헤더)에 ' +
              '<code>menu-sync.js</code> 단 1줄만 삽입하면, 스마트오피스 메뉴가 변경될 때 구 스마트웍스 상단 GNB도 실시간으로 자동 동기화됩니다.' +
            '</div>' +
            '<table>' +
              '<thead>' +
                '<tr><th>순서</th><th>메뉴 ID</th><th>노출 메뉴명 (수정 가능)</th><th>연결 시스템 (_self)</th><th>순서 변경</th><th>노출(useYn)</th></tr>' +
              '</thead>' +
              '<tbody>' + rowsHtml + '</tbody>' +
            '</table>' +
          '</div>' +
          '<div class="mgr-foot">' +
            '<button type="button" class="btn-reset" id="btnResetMenus">기본 7개 메뉴로 초기화</button>' +
            '<div>' +
              '<button type="button" class="btn-save" id="btnSaveMenus">변경사항 즉시 반영 (양쪽 사이트 동기화)</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      backdrop.querySelector('#btnCloseMenuMgr').addEventListener('click', function () {
        backdrop.style.display = 'none';
      });

      Array.prototype.forEach.call(backdrop.querySelectorAll('.inp-menu-name'), function (inp) {
        inp.addEventListener('input', function () {
          var i = parseInt(this.getAttribute('data-idx'), 10);
          workingMenus[i].menuName = this.value;
        });
      });

      Array.prototype.forEach.call(backdrop.querySelectorAll('.chk-use-yn'), function (chk) {
        chk.addEventListener('change', function () {
          var i = parseInt(this.getAttribute('data-idx'), 10);
          workingMenus[i].useYn = this.checked ? 'Y' : 'N';
        });
      });

      Array.prototype.forEach.call(backdrop.querySelectorAll('.btn-up'), function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(this.getAttribute('data-idx'), 10);
          if (i > 0) {
            var tmp = workingMenus[i - 1];
            workingMenus[i - 1] = workingMenus[i];
            workingMenus[i] = tmp;
            workingMenus.forEach(function (item, index) { item.sortOrder = index + 1; });
            renderModalContent();
          }
        });
      });

      Array.prototype.forEach.call(backdrop.querySelectorAll('.btn-dn'), function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(this.getAttribute('data-idx'), 10);
          if (i < workingMenus.length - 1) {
            var tmp = workingMenus[i + 1];
            workingMenus[i + 1] = workingMenus[i];
            workingMenus[i] = tmp;
            workingMenus.forEach(function (item, index) { item.sortOrder = index + 1; });
            renderModalContent();
          }
        });
      });

      backdrop.querySelector('#btnResetMenus').addEventListener('click', function () {
        workingMenus = cloneMenus(DEFAULT_UNIFIED_MENUS);
        saveUnifiedMenus(workingMenus);
        setSyncEnabled(true);
        renderHeaderMenus();
        renderSyncStatusBar();
        backdrop.style.display = 'none';
      });

      backdrop.querySelector('#btnSaveMenus').addEventListener('click', function () {
        workingMenus.forEach(function (item, index) { item.sortOrder = index + 1; });
        saveUnifiedMenus(workingMenus);
        setSyncEnabled(true);
        renderHeaderMenus();
        renderSyncStatusBar();
        backdrop.style.display = 'none';
      });
    }

    renderModalContent();
    backdrop.style.display = 'flex';
  }

  function init() {
    injectDynamicStyles();
    renderHeaderMenus();
    renderSyncStatusBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SmartOfficeMenuSync = {
    refresh: function () {
      renderHeaderMenus();
      renderSyncStatusBar();
    },
    openManager: openMenuManagerModal
  };
})(window, document);
