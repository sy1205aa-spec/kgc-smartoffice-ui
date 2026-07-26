(function ($, window) {

  this.commonJs = {};
  var doc;
  var win;
  var ANIMATE_SPEED = 200;

  // 공통 NAV HTML 템플릿 (inc_nav.html 폴백용)
  var defaultNavHtml = '<nav style="display: none">' +
    '<div class="navCon">' +
    '  <div class="uTile"><ul><li><a href="#" class="btn_ico btn_close btn-layerClose rotateIn"><i class="ico close">닫기</i></a></li></ul></div>' +
    '  <div class="myinfor"><ul class="infor"><li class="nm"><span>홍길동<em>관리자</em></span><span class="group"><em>관리팀</em></span></li></ul></div>' +
    '  <div class="clear"></div>' +
    '  <ul>' +
    '    <li><dl><dt><a href="./menu_versions.html"><span><img src="./images/mobile_a/common/ic_dashboard.svg" alt="" />대시보드</span></a></dt></dl></li>' +
    '    <li><dl><dt><a href="./booking.html?resveYn=N"><span><img src="./images/mobile_a/common/ic_chair.svg" alt="" />좌석예약</span></a><button type="button" class="btn_menu_toggle">접고 펼치기</button></dt>' +
    '      <dd><ul>' +
    '        <li><a href="./booking.html?resveYn=N"><span>좌석예약</span></a></li>' +
    '        <li><a href="./employee_search.html"><span>직원검색</span></a></li>' +
    '        <li><a href="./fixed_seat.html"><span>고정석신청</span></a></li>' +
    '        <li><a href="./fixed_seat_no_status.html"><span>고정석신청 (현황제외)</span></a></li>' +
    '      </ul></dd></dl></li>' +
    '    <li><dl><dt><a href="./meeting_search.html"><span><img src="./images/mobile_a/common/ic_office.svg" alt="" />회의실예약</span></a><button type="button" class="btn_menu_toggle">접고 펼치기</button></dt>' +
    '      <dd><ul>' +
    '        <li><a href="./meeting_search.html"><span>시간 검색 예약</span></a></li>' +
    '        <li><a href="./meeting_search.html"><span>회의실 검색 예약</span></a></li>' +
    '        <li><a href="./my_reservations.html"><span>예약현황 조회</span></a></li>' +
    '      </ul></dd></dl></li>' +
    '    <li><dl><dt><a href="./locker_search.html"><span><img src="./images/mobile_a/common/ic_locker.svg" alt="" />사물함예약</span></a></dt></dl></li>' +
    '    <li><dl><dt><a href="./parking_search.html"><span><img src="./images/mobile_a/common/ic_parking.svg" alt="" />주차정산</span></a><button type="button" class="btn_menu_toggle">접고 펼치기</button></dt>' +
    '      <dd><ul><li><a href="./parking_search.html"><span>주차정산</span></a></li></ul></dd></dl></li>' +
    '    <li><dl><dt><a href="./booking.html"><span>출퇴근 버스</span></a><button type="button" class="btn_menu_toggle">접고 펼치기</button></dt>' +
    '      <dd><ul><li><a href="./booking.html"><span>QR 인증</span></a></li><li><a href="./shuttle_request.html"><span>셔틀탑승 신청</span></a></li></ul></dd></dl></li>' +
    '    <li><dl><dt><a href="./my_reservations.html"><span><img src="./images/mobile_a/common/ic_calendar.svg" alt="" />나의예약</span></a><button type="button" class="btn_menu_toggle">접고 펼치기</button></dt>' +
    '      <dd><ul>' +
    '        <li><a href="./my_reservations.html"><span>나의 좌석 이용현황</span></a></li>' +
    '        <li><a href="./my_reservations.html"><span>나의 회의실 예약현황</span></a></li>' +
    '        <li><a href="./my_reservations.html"><span>나의 사물함 예약현황</span></a></li>' +
    '      </ul></dd></dl></li>' +
    '    <li><dl><dt><a href="./login.html"><span><img src="./images/mobile_a/common/ic_logout.svg" alt="" />로그아웃</span></a></dt></dl></li>' +
    '  </ul>' +
    '</div>' +
    '<div class="dimmed btn-layerClose"></div>' +
    '</nav>';

  function loadNavInclude(callback) {
    var $header = $('header');
    if ($header.length === 0) return;

    if ($header.children('nav').length > 0) {
      initGnbEvents();
      if (typeof callback === 'function') callback();
      return;
    }

    $.get('./inc_nav.html', function (data) {
      $header.append(data);
      initGnbEvents();
      if (typeof callback === 'function') callback();
    }).fail(function () {
      $header.append(defaultNavHtml);
      initGnbEvents();
      if (typeof callback === 'function') callback();
    });
  }

  function highlightActiveMenu() {
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPath) return;

    $('header nav a').each(function () {
      var href = $(this).attr('href');
      if (!href || href === '#') return;
      var hrefFile = href.split('./').pop().split('?')[0];

      if (hrefFile === currentPath) {
        $(this).css({ 'color': '#D71635', 'font-weight': 'bold' });
        var $parentDd = $(this).closest('dd');
        if ($parentDd.length > 0) {
          $parentDd.show();
          $parentDd.closest('li').addClass('on');
        }
      }
    });
  }

  function openGnbMenu() {
    var $navEl = $('header nav');
    var $conEl = $navEl.find('.navCon');
    $navEl.addClass('is-open').show().css('display', 'block');
    $conEl.show().css('display', 'block').stop().animate({ left: '0px' }, ANIMATE_SPEED);
  }

  function closeGnbMenu() {
    var $navEl = $('header nav');
    var $conEl = $navEl.find('.navCon');
    var w = $conEl.width() || $(window).width();
    $conEl.stop().animate({ left: w + 'px' }, ANIMATE_SPEED, function () {
      $navEl.removeClass('is-open').hide();
    });
  }

  function initGnbEvents() {
    var $header = $('header');
    var $nav = $header.children('nav');
    if ($nav.length === 0) return;

    var $navCon = $nav.children('.navCon');
    highlightActiveMenu();

    // 초기 오프스크린 위치 설정
    $navCon.css({ 'position': 'relative', 'left': '100%' });
    $nav.hide();

    // 메뉴 열기 이벤트 핸들러
    $(document).off('click.gnbOpen', '.total_nav, .total_nav.btn-layer').on('click.gnbOpen', '.total_nav, .total_nav.btn-layer', function (e) {
      e.preventDefault();
      openGnbMenu();
    });

    // 메뉴 닫기 이벤트 핸들러
    $(document).off('click.gnbClose', '.btn-layerClose, .btn_close, .dimmed').on('click.gnbClose', '.btn-layerClose, .btn_close, .dimmed', function (e) {
      e.preventDefault();
      closeGnbMenu();
    });

    // 2뎁스 아코디언 토글 핸들러
    $(document).off('click.gnbToggle', '.btn_menu_toggle').on('click.gnbToggle', '.btn_menu_toggle', function (e) {
      e.preventDefault();
      var $li = $(this).closest('li');
      var $dd = $(this).parent().next('dd');
      if ($dd.is(':visible')) {
        $dd.slideUp(ANIMATE_SPEED);
        $li.removeClass('on');
      } else {
        $dd.slideDown(ANIMATE_SPEED);
        $li.addClass('on');
      }
    });
  }

  // 기존 inline script 호환용 전역 함수 노출
  window.openGnbMenu = openGnbMenu;
  window.closeGnbMenu = closeGnbMenu;

  $(function () {
    doc = $(document);
    win = $(window);
    loadNavInclude();
  });

})(jQuery, window);