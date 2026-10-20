$(function () {
  menuToggle();
  alertPopup();
});

function menuToggle() {
  var $header = $('header');
  var $nav = $header.find('nav');
  var $btn = $('.btnMenuToggle');
  var $navCon = $nav.find('.navCon');

  /* 모바일 JS가 inline으로 설정한 height/overflow 제거 */
  $navCon.css({ height: '', overflow: '' });
  $navCon.find('ul').first().css({ height: '', overflow: '' });

  $btn.off('click');
  $btn.on('click', function () {
    if ($header.hasClass('is-open')) {
      $header.removeClass('is-open');
      $btn.removeClass('is-open');
      $nav.slideUp(300);
    } else {
      $header.addClass('is-open');
      $btn.addClass('is-open');
      $nav.slideDown(300);
    }
  });

  /* 메뉴 외부 클릭 시 닫기 */
  $(document).on('click', function (e) {
    if ($header.hasClass('is-open') && !$(e.target).closest('header').length) {
      $header.removeClass('is-open');
      $btn.removeClass('is-open');
      $nav.slideUp(300);
    }
  });
}

/* 공통 알림 팝업 */
function alertPopup() {
  $('#modal-window').hide();
  $('.alertOpenBtn').on('click', function () {
    $('#modal-window').fadeIn(200);
  });
  $(document).on('click', '.alertCloseBtn, .btn-layerClose', function () {
    $('#modal-window').fadeOut(200);
  });
}

/* 주차정산 상세 — 할인 쿠폰 선택 토글 */
$(document).on('click', '.discount_coupon:not(:disabled)', function () {
  var $this = $(this);
  var isOn = $this.hasClass('is-on');
  $('.discount_coupon').removeClass('is-on');
  if (!isOn) $this.addClass('is-on');
});
