(() => {
  'use strict';
  let mode = 'tobe';
  let step = 'splash';
  let timer;
  const $ = id => document.getElementById(id);
  const copy = {
    asis: { badge: 'AS-IS · 도입 전', title: '서버 응답이 없으면<br>웹뷰 기본 오류가 노출', description: '앱 실행 후 웹뷰 로드를 시도하지만, 웹 서버가 응답하지 않아 연결 오류 화면이 표시됩니다.', flow: '<span>앱 실행</span><i>→</i><span>웹뷰 로드 시도</span><i>→</i><strong>웹페이지 오류 화면</strong>', first: '1단계 · 앱을 실행하고 웹뷰 로드를 시도합니다.', second: '2단계 · 서버가 응답하지 않아 웹뷰 기본 오류가 표시됩니다.' },
    tobe: { badge: 'TO-BE · 도입 후', title: '웹뷰 로드 전에<br>장애 공지를 먼저 안내', description: '앱 실행 시 Remote Config를 확인하고, 웹페이지 대신 앱의 장애 안내 화면을 표시합니다.', flow: '<span>앱 실행</span><i>→</i><span>Remote Config 확인</span><i>→</i><strong>전체화면 장애 안내</strong>', first: '1단계 · 앱 실행 후 Remote Config를 확인합니다.', second: '2단계 · 웹뷰 로드 전, 장애 사유와 복구 예정 시간을 안내합니다.' }
  };
  function render() {
    const info = copy[mode];
    document.querySelectorAll('[data-mode]').forEach(button => {
      const selected = button.dataset.mode === mode;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $('demo-content').setAttribute('aria-labelledby', 'tab-' + mode);
    document.querySelectorAll('[data-step]').forEach(button => {
      if (button.dataset.step === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    $('result-step-label').textContent = mode === 'tobe' ? '장애 안내' : '웹뷰 오류';
    $('splash-caption').textContent = mode === 'tobe' ? 'Remote Config 확인' : '웹뷰 로드 시도';
    $('splash-screen').hidden = step !== 'splash';
    $('error-screen').hidden = step !== 'result' || mode !== 'asis';
    $('notice-screen').hidden = step !== 'result' || mode !== 'tobe';
    $('end-screen').hidden = step !== 'end';
    $('explain-mode').textContent = info.badge;
    $('explain-title').innerHTML = info.title;
    $('explain-copy').textContent = info.description;
    $('explain-flow').innerHTML = info.flow;
    $('step-description').textContent = step === 'splash' ? info.first : step === 'result' ? info.second : '시연 완료 · 확인 버튼 이후 동작은 시연 종료 화면으로 표현했습니다.';
  }
  function changeStep(next) { clearTimeout(timer); step = next; render(); }
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => { mode = button.dataset.mode; changeStep('splash'); });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      mode = event.key === 'Home' ? 'asis' : event.key === 'End' ? 'tobe' : mode === 'asis' ? 'tobe' : 'asis';
      changeStep('splash'); $('tab-' + mode).focus();
    });
  });
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => changeStep(button.dataset.step)));
  function run() { changeStep('splash'); timer = setTimeout(() => changeStep('result'), 1000); }
  $('run-demo').addEventListener('click', run);
  $('reset-demo').addEventListener('click', () => changeStep('splash'));
  $('notice-confirm').addEventListener('click', () => { changeStep('end'); $('replay').focus(); });
  $('replay').addEventListener('click', () => { run(); $('run-demo').focus(); });
  const viewer = $('image-viewer');
  document.querySelectorAll('.image-preview').forEach(button => button.addEventListener('click', () => {
    $('image-viewer-title').textContent = button.dataset.title;
    $('image-viewer-img').src = button.dataset.image;
    $('image-viewer-img').alt = button.querySelector('img').alt;
    viewer.classList.remove('original-size');
    $('image-zoom').setAttribute('aria-pressed', 'false');
    $('image-zoom').textContent = '원본 크기';
    viewer.showModal();
    viewer.querySelector('.image-viewer-content').scrollTo(0, 0);
  }));
  $('image-close').addEventListener('click', () => viewer.close());
  $('image-zoom').addEventListener('click', () => {
    const original = viewer.classList.toggle('original-size');
    $('image-zoom').setAttribute('aria-pressed', String(original));
    $('image-zoom').textContent = original ? '화면에 맞추기' : '원본 크기';
  });
  render();
})();
