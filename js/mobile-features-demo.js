(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let environment = 'web';
  let bioEnabled = false;
  let modalReturnFocus;
  const modal = $('featureModal');
  const status = message => { $('featureStatus').textContent = message; };
  function closeModal() {
    modal.hidden = true;
    $('featureHome').inert = false;
    $('featureMenu').inert = false;
    $('featureDownload').inert = false;
    document.querySelector('.feature-footer').inert = false;
    document.querySelector('.feature-header').inert = false;
    if (modalReturnFocus && modalReturnFocus.isConnected && modalReturnFocus.getClientRects().length) modalReturnFocus.focus();
  }
  function showModal(title, message, actions) {
    if (modal.hidden) modalReturnFocus = document.activeElement;
    $('featureModalTitle').textContent = title;
    $('featureModalMessage').textContent = message;
    $('featureModalActions').replaceChildren();
    actions.forEach(action => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = action.label;
      if (action.primary) button.className = 'primary';
      button.addEventListener('click', () => { closeModal(); if (action.run) action.run(); });
      $('featureModalActions').append(button);
    });
    modal.hidden = false;
    $('featureHome').inert = true;
    $('featureMenu').inert = true;
    $('featureDownload').inert = true;
    document.querySelector('.feature-footer').inert = true;
    document.querySelector('.feature-header').inert = true;
    $('featureModalActions').querySelector('button').focus();
  }
  function alertMessage(message) { showModal('알림', message, [{ label: '확인', primary: true }]); }
  function syncBio() { $('bioToggle').checked = bioEnabled; }
  function setMenu(open) {
    $('featureMenu').hidden = !open;
    $('menuOpen').setAttribute('aria-expanded', String(open));
    if (open) {
      $('menuClose').focus();
      status(environment === 'web' ? '모바일웹 전체 메뉴: 생체인증 사용 항목이 노출되지 않습니다.' : '모바일앱 전체 메뉴: 생체인증 사용 토글을 켜거나 끌 수 있습니다.');
    } else $('menuOpen').focus();
  }
  function setEnvironment(next) {
    closeModal(); environment = next;
    $('featureMenu').hidden = true;
    $('menuOpen').setAttribute('aria-expanded', 'false');
    $('featureDownload').hidden = true;
    $('browserBar').hidden = next === 'app';
    $('bioMenu').hidden = next !== 'app';
    const label = next === 'app' ? '모바일앱 접속' : '모바일웹 접속';
    $('environmentBadge').textContent = label;
    $('menuEnvironment').textContent = label;
    document.querySelectorAll('[data-env]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.env === next)));
    $('featureExplainTitle').innerHTML = next === 'app' ? '앱에서 바로 사용하는<br>QR·생체인증' : '모바일웹에서는<br>앱 이용을 안내합니다';
    $('featureExplainCopy').textContent = next === 'app' ? 'QR 인증은 앱의 카메라를 호출합니다. 햄버거 메뉴에는 생체인증 사용 토글이 표시되며, 인증 성공 시에만 ON 상태로 바뀝니다.' : '하단 QR 인증을 누르면 앱 전용 기능임을 안내하고, 앱 다운로드 페이지로 이동할지 확인합니다. 생체인증 메뉴는 표시하지 않습니다.';
    syncBio(); status('하단 QR 인증 또는 상단 햄버거 메뉴를 눌러 보세요.');
  }
  function openQr() {
    if (environment === 'web') {
      status('모바일웹 QR 인증: 앱 전용 기능 안내 후 다운로드 이동 여부를 확인합니다.');
      showModal('앱 안내', 'QR 스캔은 스마트오피스 전용 앱에서만 지원됩니다.\n\n앱 다운로드 페이지로 이동하시겠습니까?', [
        { label: '취소', run: () => status('다운로드 이동을 취소했습니다. 모바일웹 화면을 유지합니다.') },
        { label: '확인', primary: true, run: () => { $('featureDownload').hidden = false; status('FO의 앱 다운로드 페이지 이동을 시연 화면으로 표시했습니다.'); } }
      ]);
    } else {
      status('모바일앱 QR 인증: 네이티브 QR 스캐너 호출을 모의 표시합니다.');
      showModal('QR 스캐너 · 시연', '앱에서는 네이티브 카메라로 QR 코드를 인식합니다.\n시연용 결과를 선택해 주세요.', [
        { label: '취소' }, { label: '인식 완료', primary: true, run: () => alertMessage('QR 인식 완료 · 시연용 결과입니다. 실제 인증은 처리하지 않았습니다.') }
      ]);
    }
  }
  $('menuOpen').addEventListener('click', () => setMenu(true));
  $('menuClose').addEventListener('click', () => setMenu(false));
  $('qrOpen').addEventListener('click', openQr);
  $('downloadBack').addEventListener('click', () => { $('featureDownload').hidden = true; $('qrOpen').focus(); });
  document.querySelectorAll('[data-env]').forEach(button => button.addEventListener('click', () => setEnvironment(button.dataset.env)));
  document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => {
    const scenario = button.dataset.scenario;
    setEnvironment(scenario === 'bio' ? 'app' : 'web');
    if (scenario === 'qr') openQr(); else setMenu(true);
  }));
  $('bioToggle').addEventListener('change', () => {
    syncBio();
    if (environment !== 'app') return;
    if (!bioEnabled) {
      status('생체인증 ON 요청: 단말 인증 성공 후에만 활성화됩니다.');
      showModal('생체인증 · 단말 인증 시연', '실제 단말 인증 대신 결과를 선택해 주세요.\n인증이 완료되기 전에는 토글이 켜지지 않습니다.', [
        { label: '취소', run: () => status('생체인증 요청을 취소했습니다. 기존 OFF 상태를 유지합니다.') },
        { label: '인증 실패', run: () => { status('인증 실패: 기존 OFF 상태를 유지합니다.'); alertMessage('생체인증에 실패하였습니다.\n단말내 생체인증 등록유무를 확인해주신 후 이용해주시기 바랍니다'); } },
        { label: '인증 성공', primary: true, run: () => { bioEnabled = true; syncBio(); status('생체인증 등록 성공: 토글이 ON 상태로 변경되었습니다.'); alertMessage('생체 인증 등록이 완료되었습니다.'); } }
      ]);
    } else {
      showModal('생체인증 해제', '생체인증 사용을 해제하시겠습니까?\n해제 시 다음 로그인부터 아이디/비밀번호 로그인을 사용해야 합니다.', [
        { label: '취소', run: () => status('해제를 취소했습니다. 기존 ON 상태를 유지합니다.') },
        { label: '확인', primary: true, run: () => { bioEnabled = false; syncBio(); status('생체인증 해제 완료: 토글이 OFF 상태로 변경되었습니다.'); alertMessage('생체인증이 해제되었습니다.'); } }
      ]);
    }
  });
  $('featureReset').addEventListener('click', () => { bioEnabled = false; setEnvironment('web'); status('시연을 초기화했습니다. 모바일웹 접속 · 생체인증 OFF 상태입니다.'); });
  modal.addEventListener('keydown', event => {
    const buttons = [...modal.querySelectorAll('button')];
    if (event.key === 'Escape') { event.preventDefault(); buttons[0].click(); }
    if (event.key === 'Tab') {
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  setEnvironment('web');
})();
