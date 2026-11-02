/* 퍼블리싱 전용. 외부 API 대신 가상 입차 건의 등록 내역을 보관한다. */
var parkingAutoDemo = (function () {
  'use strict';
  var currentContext = null;
  var sequence = 0;
  var delay = function () { return new Promise(function (resolve) { setTimeout(resolve, 400); }); };
  var clone = function (list) { return list.map(function (item) { return Object.assign({}, item); }); };
  function trace(message) { $('#parkingAutoTrace').append($('<li>').text(message)); }
  function setStatus(state, title, message, hidden) {
    $('#parkingAutoStatus').attr('data-state', state).prop('hidden', !!hidden);
    $('#parkingAutoStatusTitle').text(title || '');
    $('#parkingAutoStatusText').text(message || '');
  }
  function syncControls() {
    $('.demo-chip, #parkingAutoRestart, #parkingVehicleRefresh, #parkingAutoResponse').prop('disabled', isAutoFreeBusy);
    $('#parkingDetailView, #parkingOverview').attr('aria-busy', String(isAutoFreeBusy));
    renderAll();
  }
  function getFreeCoupon() {
    var matches = AVAILABLE_COUPONS.filter(function (coupon) {
      return coupon.isFree && !coupon.is24h && coupon.minutes === 60;
    });
    return matches.length === 1 ? matches[0] : null;
  }
  function hasFree(list, coupon) {
    return list.some(function (item) { return item.discCodeNo === coupon.discCodeNo; });
  }
  function needsFree(rule) {
    return !rule.hasDeleteNeeded && rule.valid24hCount >= rule.required24hCount
      && rule.remainderTargetMinutes > 0 && !rule.hasValidFree;
  }
  function freeRecord(coupon) {
    var ts = getTimestamp();
    nextIdSeq += 1;
    return { id: 'AUTO-' + nextIdSeq, discCodeNo: coupon.discCodeNo, discName: coupon.discName,
      minutes: coupon.minutes, date: ts.date, time: ts.time };
  }
  async function readHistory(context, initialRead) {
    await delay();
    if (initialRead && context.outcome === 'query_error') throw new Error('HISTORY_UNAVAILABLE');
    return clone(context.history);
  }
  async function registerFree(context, coupon) {
    await delay();
    // 다른 탭이 먼저 등록한 상태를 재현한다. 같은 입차 건의 무료권은 1건만 허용한다.
    if (context.outcome === 'duplicate' && !hasFree(context.history, coupon)) context.history.push(freeRecord(coupon));
    if (hasFree(context.history, coupon)) throw new Error('ALREADY_REGISTERED');
    if (context.outcome === 'timeout_empty') throw new Error('TIMEOUT');
    if (context.outcome === 'failure') throw new Error('REGISTER_FAILED');
    context.history.push(freeRecord(coupon));
    if (context.outcome === 'timeout_committed') throw new Error('TIMEOUT');
  }
  async function queryAndAutoRegister(context) {
    if (isAutoFreeBusy) return;
    isAutoFreeBusy = true;
    isAutoFreeDataReady = false;
    $('#parkingAutoTrace').empty();
    setStatus('loading', '할인 정보를 확인하고 있습니다.', '무료할인권 자동등록 대상인지 확인합니다.');
    trace('현재 입차 건의 할인 내역과 사용 가능한 할인권 조회');
    syncControls();
    try {
      var history = await readHistory(context, true);
      if (context !== currentContext) return;
      currentHistoryList = history;
      isAutoFreeDataReady = true;
      var rule = evaluateModularRule(currentParkingMinutes, history);
      var wasFullyCovered = rule.isFullyCovered;
      var coupon = getFreeCoupon();
      if (!coupon || !needsFree(rule)) {
        var reason = !coupon ? '무료 60분권을 명확히 확인할 수 없어 자동등록 제외'
          : hasFree(history, coupon) ? '무료권이 이미 등록되어 있어 추가 호출 없음'
          : rule.hasDeleteNeeded ? '삭제 필요 쿠폰이 있어 자동등록 제외'
          : rule.valid24hCount < rule.required24hCount ? '필요한 24시간권을 먼저 등록해야 하므로 자동등록 제외'
          : '무료권 대상 주차 구간이 아니므로 자동등록 제외';
        trace(reason);
        setStatus('skipped', '', '', true);
        return;
      }
      setStatus('registering', '1시간 무료할인권을 자동등록하고 있습니다.', '완료될 때까지 잠시만 기다려 주세요.');
      trace('무료권 대상·미등록 확인 후 등록 요청 1회');
      var registrationError = null;
      try { await registerFree(context, coupon); }
      catch (error) { registrationError = error; }
      if (context !== currentContext) return;
      if (registrationError) {
        trace(registrationError.message === 'ALREADY_REGISTERED' ? '동시 조회로 중복 등록 오류 수신'
          : registrationError.message === 'TIMEOUT' ? '시간 초과로 등록 결과 불명'
          : '등록 오류 수신');
        setStatus('reconciling', '무료할인권 등록 내역을 확인하고 있습니다.', '등록 요청을 반복하지 않고 실제 내역을 다시 조회합니다.');
      }
      trace('등록 요청을 재시도하지 않고 할인 내역 재조회');
      isAutoFreeDataReady = false;
      currentHistoryList = await readHistory(context, false);
      if (context !== currentContext) return;
      isAutoFreeDataReady = true;
      if (hasFree(currentHistoryList, coupon)) {
        var duplicate = registrationError && registrationError.message === 'ALREADY_REGISTERED';
        var message = duplicate ? '이미 등록된 1시간 무료할인권을 확인했습니다.' : '1시간 무료할인권이 등록되었습니다.';
        setStatus(duplicate ? 'already-registered' : 'registered', message,
          duplicate ? '최신 할인 내역을 반영했습니다. 추가 등록은 하지 않았습니다.' : '총 할인시간과 등록 내역에 반영했습니다.');
        trace(duplicate ? '무료권 1건 확인 · 오류 팝업 없이 정상 화면 복구' : '무료권 1건 확인 · 최신 화면 반영');
        showParkingFeedback(duplicate ? '이미 등록된 무료할인권을 확인했습니다.' : '1시간 무료할인 자동등록 완료');
        if (!wasFullyCovered && evaluateModularRule(currentParkingMinutes, currentHistoryList).isFullyCovered) {
          parkAlert('쿠폰 등록이 완료되어 출차 가능합니다.');
        }
      } else {
        trace('무료권 미등록 확인 · 자동 재시도 중단, 수동 등록 안내');
        setStatus('manual-required', '무료할인권 등록을 확인하지 못했습니다.', '아래 1시간 무료할인 버튼으로 직접 등록해 주세요.');
      }
    } catch (error) {
      if (context !== currentContext) return;
      isAutoFreeDataReady = false;
      trace('할인 내역 조회 실패 · 미등록으로 간주하지 않고 등록 중단');
      setStatus('query-error', '할인 내역을 확인하지 못했습니다.', '쿠폰 등록·삭제는 차량을 다시 조회한 후 이용해 주세요.');
    } finally {
      if (context === currentContext) { isAutoFreeBusy = false; syncControls(); }
    }
  }
  function enter() {
    currentContext = { id: ++sequence, history: clone(currentHistoryList), outcome: $('#parkingAutoResponse').val() || 'success' };
    return queryAndAutoRegister(currentContext);
  }
  function refresh() {
    if (isAutoFreeBusy || !currentContext) return;
    currentContext.outcome = $('#parkingAutoResponse').val() || 'success';
    return queryAndAutoRegister(currentContext);
  }
  function manualChanged(action) {
    if (currentContext) currentContext.history = clone(currentHistoryList);
    setStatus('manual-change', '', '', true);
    trace(action === 'delete' ? '사용자가 쿠폰 삭제 · 내부 갱신에서는 자동등록하지 않음' : '사용자가 쿠폰 등록 · 내부 갱신에서는 자동등록하지 않음');
  }
  function init() {
    $('#parkingVehicleRefresh').on('click', refresh);
    $('#parkingAutoRestart').on('click', function () { if (!isAutoFreeBusy) applyScenario(currentScenarioKey); });
  }
  return { init: init, enter: enter, refresh: refresh, manualChanged: manualChanged };
})();
