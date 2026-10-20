/**
 * KGC 스마트오피스 PC Web 시연용 공통 유틸리티 (web/common.js)
 * - 1019 퍼블리싱 GNB 메가메뉴(menuToggle) 및 공통 모달 팝업(soAlert, soConfirmAlert)
 * - 로그인 없이 바로 확인 가능한 독립 목업 환경 제공
 */

$(function () {
    init1019MenuToggle();
    init1019AlertEvents();
    initLogoutHandler();
});

/* 1019 GNB 전체 메뉴(햄버거 버튼) 토글 */
function init1019MenuToggle() {
    var $header = $('header');
    var $nav = $header.find('nav');
    var $btn = $('.btnMenuToggle');
    var $navCon = $nav.find('.navCon');

    $navCon.css({ height: '', overflow: '' });
    $navCon.find('ul').first().css({ height: '', overflow: '' });

    $btn.off('click.menuToggle').on('click.menuToggle', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if ($header.hasClass('is-open')) {
            $header.removeClass('is-open');
            $btn.removeClass('is-open');
            $nav.stop(true, true).slideUp(300);
        } else {
            $header.addClass('is-open');
            $btn.addClass('is-open');
            $nav.stop(true, true).slideDown(300);
        }
    });

    /* 메뉴 외부 클릭 시 닫기 */
    $(document).off('click.menuToggleClose').on('click.menuToggleClose', function (e) {
        if ($header.hasClass('is-open') && !$(e.target).closest('header').length) {
            $header.removeClass('is-open');
            $btn.removeClass('is-open');
            $nav.stop(true, true).slideUp(300);
        }
    });
}

/* 1019 퍼블리싱 알림/확인 레이어 팝업 닫기 이벤트 */
function init1019AlertEvents() {
    $('.alertOpenBtn').off('click.alertOpen').on('click.alertOpen', function () {
        $('#modal-window').fadeIn(200);
    });
    $(document).off('click.layerClose', '.alertCloseBtn, .btn-layerClose').on('click.layerClose', '.alertCloseBtn, .btn-layerClose', function () {
        $('#modal-window').fadeOut(200);
    });
}

/* 로그아웃 처리 */
function initLogoutHandler() {
    $(document).off('click.logout', '.btnLogout, #logoutBtn').on('click.logout', '.btnLogout, #logoutBtn', function (e) {
        e.preventDefault();
        soConfirmAlert('로그아웃 하시겠습니까?', function () {
            window.location.href = './login.html';
        }, '로그아웃');
    });
}

/* 1019 퍼블리싱 디자인 호환 soAlert */
window.soAlert = function (message, callback, title) {
    var $modal = $('#modal-window');
    if (!$modal.length) {
        alert(message);
        if (typeof callback === 'function') callback();
        return;
    }
    $('#modal-title').text(title || '알림');
    $('#modal-text').html(String(message || '').replace(/\n/g, '<br>'));
    var $btns = $('#modal-buttons').empty();

    var $ok = $('<a href="javascript:void(0);" class="modal-btn btn medium pri btn-layerClose">확인</a>');
    $ok.on('click', function (e) {
        e.preventDefault();
        $modal.fadeOut(200);
        if (typeof callback === 'function') callback();
    });

    $btns.append($ok);
    $modal.fadeIn(200);
};

/* 1019 퍼블리싱 디자인 호환 soConfirmAlert */
window.soConfirmAlert = function (message, confirmCallback, title, cancelCallback) {
    var $modal = $('#modal-window');
    if (!$modal.length) {
        if (confirm(message)) {
            if (typeof confirmCallback === 'function') confirmCallback();
        } else {
            if (typeof cancelCallback === 'function') cancelCallback();
        }
        return;
    }
    $('#modal-title').text(title || '확인');
    $('#modal-text').html(String(message || '').replace(/\n/g, '<br>'));
    var $btns = $('#modal-buttons').empty();

    var $cancel = $('<a href="javascript:void(0);" class="modal-btn btn medium sec btn-layerClose">취소</a>');
    $cancel.on('click', function (e) {
        e.preventDefault();
        $modal.fadeOut(200);
        if (typeof cancelCallback === 'function') cancelCallback();
    });

    var $ok = $('<a href="javascript:void(0);" class="modal-btn btn medium pri btn-layerClose">확인</a>');
    $ok.on('click', function (e) {
        e.preventDefault();
        $modal.fadeOut(200);
        if (typeof confirmCallback === 'function') confirmCallback();
    });

    $btns.append($cancel).append($ok);
    $modal.fadeIn(200);
};
