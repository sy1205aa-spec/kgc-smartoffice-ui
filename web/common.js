/**
 * KGC 스마트오피스 PC Web 시연용 공통 유틸리티 (web/common.js)
 * - 로그인 없이 바로 확인 가능한 독립 목업 환경 제공
 * - 공통 모달 (soAlert, soConfirmAlert) 및 헤더 로그아웃 시연 동작
 */

window.soAlert = function (message, callback, title) {
    const $modal = $('#modal-window');
    $('#modal-title').text(title || '알림');
    $('#modal-text').text(message || '');
    const $btns = $('#modal-buttons').empty();
    const $ok = $('<a href="javascript:void(0);" class="btn-modal-pri">확인</a>');
    $ok.on('click', function () {
        $modal.hide();
        if (typeof callback === 'function') callback();
    });
    $btns.append($('<li></li>').append($ok));
    $modal.css('display', 'flex');
};

window.soConfirmAlert = function (message, confirmCallback, title, cancelCallback) {
    const $modal = $('#modal-window');
    $('#modal-title').text(title || '확인');
    $('#modal-text').text(message || '');
    const $btns = $('#modal-buttons').empty();

    const $cancel = $('<a href="javascript:void(0);" class="btn-modal-sec">취소</a>');
    $cancel.on('click', function () {
        $modal.hide();
        if (typeof cancelCallback === 'function') cancelCallback();
    });

    const $ok = $('<a href="javascript:void(0);" class="btn-modal-pri">확인</a>');
    $ok.on('click', function () {
        $modal.hide();
        if (typeof confirmCallback === 'function') confirmCallback();
    });

    $btns.append($('<li></li>').append($cancel));
    $btns.append($('<li></li>').append($ok));
    $modal.css('display', 'flex');
};

$(function () {
    // 로그아웃 버튼 클릭 시 확인 모달 후 PC 로그인 화면으로 이동
    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        soConfirmAlert('로그아웃 하시겠습니까?', function () {
            window.location.href = './login.html';
        }, '로그아웃');
    });
});
