// PC parking preview: rules and scenarios aligned with parking_detail.html.

    // ==========================================================================
    // 주차권 등록 개선 (24시간 모듈러 룰 엔진 & 인터랙티브 가이드 목업)
    // ==========================================================================
    var DAY_MINUTES = 1440;               // 24시간 (1,440분)
    var LONG_TERM_THRESHOLD_MINUTES = 660; // 11시간 (660분)
    var DISCOUNT_GRACE_MINUTES = 30;      // 30분 여유 한도

    // 외부 연동 API에서 내려오는 5종 할인권 명칭 그대로 유지
    var AVAILABLE_COUPONS = [
      { discCodeNo: 1, discName: '1시간 무료할인', minutes: 60, isFree: true, is24h: false },
      { discCodeNo: 2, discName: '30분 유료할인', minutes: 30, isFree: false, is24h: false },
      { discCodeNo: 3, discName: '1시간 유료할인', minutes: 60, isFree: false, is24h: false },
      { discCodeNo: 5, discName: '3시간 유료할인', minutes: 180, isFree: false, is24h: false },
      { discCodeNo: 4, discName: '24시간 유료할인', minutes: 1440, isFree: false, is24h: true }
    ];

    // 개발방향서 5장 주차 시나리오별 프리셋
    var SCENARIOS = {
      needed: { inDtm: '2026.10.27 05:00:00', parkingMinutes: 300, history: [
        { id: 'N-1', discCodeNo: 1, minutes: 60, date: '26.10.27', time: '09:00' },
        { id: 'N-2', discCodeNo: 5, minutes: 180, date: '26.10.27', time: '09:01' }
      ] },
      complete: { inDtm: '2026.10.27 05:00:00', parkingMinutes: 300, history: [
        { id: 'C-1', discCodeNo: 1, minutes: 60, date: '26.10.27', time: '09:00' },
        { id: 'C-2', discCodeNo: 5, minutes: 180, date: '26.10.27', time: '09:01' },
        { id: 'C-3', discCodeNo: 3, minutes: 60, date: '26.10.27', time: '09:02' }
      ] },
      exchange: { inDtm: '2026.10.27 05:00:00', parkingMinutes: 810, history: [
        { id: 'E-1', discCodeNo: 1, minutes: 60, date: '26.10.27', time: '09:00' },
        { id: 'E-2', discCodeNo: 3, minutes: 60, date: '26.10.27', time: '09:01' }
      ] },
      case2: {
        label: '사례 2 · 13시간 30분 주차 (당일 장기 · 기존 쿠폰 있음)',
        inDtm: '2026.07.15 07:00:00',
        parkingMinutes: 810, // 13시간 30분 (N=0, R=13.5h >= 11h)
        history: [
          { id: 'H-1', discCodeNo: 1, discName: '1시간 무료할인', minutes: 60, date: '26.07.15', time: '09:12' },
          { id: 'H-2', discCodeNo: 3, discName: '1시간 유료할인', minutes: 60, date: '26.07.15', time: '09:12' }
        ]
      },
      case1a: {
        label: '사례 1-A · 5시간 주차 (11시간 미만 일반 주차)',
        inDtm: '2026.07.15 13:30:00',
        parkingMinutes: 300, // 5시간 (N=0, R=5h < 11h)
        history: []
      },
      case1b: {
        label: '사례 1-B · 10시간 주차 (3시간권 3회 연속 다건 등록)',
        inDtm: '2026.07.15 08:30:00',
        parkingMinutes: 600, // 10시간 (N=0, R=10h < 11h)
        history: [
          { id: 'H-10', discCodeNo: 1, discName: '1시간 무료할인', minutes: 60, date: '26.07.15', time: '09:00' }
        ]
      },
      case3: {
        label: '사례 3 · 25시간 주차 (24h 1장 + 잔여 1h 무료권)',
        inDtm: '2026.07.14 17:30:00',
        parkingMinutes: 1500, // 25시간 (N=1, R=1h < 11h)
        history: []
      },
      case4: {
        label: '사례 4 · 35시간 주차 (24h + 잔여 11h ➔ 24시간권 2장)',
        inDtm: '2026.07.14 07:30:00',
        parkingMinutes: 2100, // 35시간 (N=1, R=11h >= 11h)
        history: [
          { id: 'H-40', discCodeNo: 4, discName: '24시간 유료할인', minutes: 1440, date: '26.07.14', time: '18:00' }
        ]
      }
    };

    var currentScenarioKey = 'case2';
    var currentParkingMinutes = 810;
    var currentHistoryList = [];
    var nextIdSeq = 100;
    function parkAlert(msg, cb) { soAlert(msg, cb); }
    function parkConfirm(msg, cb) { soConfirmAlert(msg, cb); }

    function pad2(n) {
      return String(n).padStart(2, '0');
    }

    function getTimestamp() {
      var now = new Date();
      var yy = pad2(now.getFullYear() % 100);
      var mm = pad2(now.getMonth() + 1);
      var dd = pad2(now.getDate());
      var hh = pad2(now.getHours());
      var mi = pad2(now.getMinutes());
      return { date: yy + '.' + mm + '.' + dd, time: hh + ':' + mi };
    }

    function formatMinutesText(totalMinutes) {
      var mins = Math.max(Number(totalMinutes) || 0, 0);
      if (mins === 0) return '0분';
      var hours = Math.floor(mins / 60);
      var rem = mins % 60;
      if (hours > 0 && rem > 0) return hours + '시간 ' + rem + '분';
      if (hours > 0) return hours + '시간';
      return rem + '분';
    }

    function formatParkingDuration(totalMinutes) {
      var mins = Math.max(Number(totalMinutes) || 0, 0);
      var hours = Math.floor(mins / 60);
      var rem = mins % 60;
      if (hours > 0 && rem > 0) return hours + '시간 ' + rem + '분';
      if (hours > 0) return hours + '시간';
      return rem + '분';
    }

    // 24시간 모듈러 룰 엔진 계산
    function evaluateModularRule(parkingMinutes, historyList) {
      var safeMinutes = Math.max(Number(parkingMinutes) || 0, 0);
      var list = historyList || [];

      var completedDays = Math.floor(safeMinutes / DAY_MINUTES); // N (일수)
      var remainderMinutes = safeMinutes % DAY_MINUTES;          // R (잔여 시간)
      var isRemainderLongTerm = remainderMinutes >= LONG_TERM_THRESHOLD_MINUTES;

      var required24hCount = 0;
      var remainderTargetMinutes = 0;
      var zoneType = 'ZONE_1';

      if (completedDays === 0 && !isRemainderLongTerm) {
        zoneType = 'ZONE_1'; // 구간 ① 일반 주차 (<11h)
        required24hCount = 0;
        remainderTargetMinutes = remainderMinutes;
      } else if ((completedDays === 0 && isRemainderLongTerm) || (completedDays === 1 && remainderMinutes === 0)) {
        zoneType = 'ZONE_2'; // 구간 ② 당일 장기 (11h ~ 24h)
        required24hCount = 1;
        remainderTargetMinutes = 0;
      } else if (completedDays >= 1 && !isRemainderLongTerm) {
        zoneType = 'ZONE_3'; // 구간 ③ 다일 주차 (잔여 <11h)
        required24hCount = completedDays;
        remainderTargetMinutes = remainderMinutes;
      } else {
        zoneType = 'ZONE_4'; // 구간 ④ 다일 장기 (잔여 >=11h)
        required24hCount = completedDays + 1;
        remainderTargetMinutes = 0;
      }

      var seen24h = 0;
      var seenFree = 0;
      var accNon24hMinutes = 0;
      var acceptedPaidMinutes = 0;
      // 무료권이 마지막에 재등록되거나 누락되어 있어도 60분을 먼저 확보한다.
      var reservedFreeMinutes = remainderTargetMinutes > 0 ? 60 : 0;
      var maxNon24hAllowed = remainderTargetMinutes > 0
        ? (remainderTargetMinutes + DISCOUNT_GRACE_MINUTES)
        : 0;
      var hasAnyFreeInHistory = list.some(function (h) { return h.discCodeNo === 1; });
      var hasPaidWithoutFree = remainderTargetMinutes > 0 && !hasAnyFreeInHistory
        && list.some(function (item) { return item.discCodeNo !== 1 && item.discCodeNo !== 4 && item.minutes < DAY_MINUTES; });

      var historyAnnotations = list.map(function (item) {
        var is24h = item.discCodeNo === 4 || item.minutes >= DAY_MINUTES;
        var isFree = item.discCodeNo === 1;
        var mins = Number(item.minutes) || 0;
        var needsDelete = false;

        if (is24h) {
          seen24h += 1;
          if (seen24h > required24hCount) {
            needsDelete = true;
          }
        } else {
          if (remainderTargetMinutes === 0) {
            needsDelete = true;
          } else if (isFree) {
            seenFree += 1;
            if (seenFree > 1) {
              needsDelete = true;
            } else {
              accNon24hMinutes += mins;
            }
          } else {
            if (reservedFreeMinutes + acceptedPaidMinutes + mins > maxNon24hAllowed) {
              needsDelete = true;
            } else {
              acceptedPaidMinutes += mins;
              accNon24hMinutes += mins;
            }
          }
        }

        return {
          item: item,
          needsDelete: needsDelete
        };
      });

      var deleteNeededCount = historyAnnotations.filter(function (a) { return a.needsDelete; }).length;
      var hasDeleteNeeded = deleteNeededCount > 0;
      var valid24hCount = Math.min(seen24h, required24hCount);
      var hasValidFree = seenFree >= 1 && remainderTargetMinutes > 0;
      var uncoveredRemainderMinutes = Math.max(remainderTargetMinutes - accNon24hMinutes, 0);
      var remainingAdditionalNon24hLimit = Math.max(maxNon24hAllowed - reservedFreeMinutes - acceptedPaidMinutes, 0);
      var totalDiscountMinutes = list.reduce(function (sum, item) { return sum + (Number(item.minutes) || 0); }, 0);
      var isFullyCovered = !hasDeleteNeeded
        && (valid24hCount >= required24hCount)
        && (remainderTargetMinutes === 0 || hasValidFree)
        && (uncoveredRemainderMinutes <= 0)
        && (totalDiscountMinutes >= safeMinutes);
      // 현재 시간이 모두 정산되어도 사전 등록을 위한 30분 여유권은 허용한다.
      var canAddGraceCoupon = isFullyCovered && hasValidFree
        && remainingAdditionalNon24hLimit >= DISCOUNT_GRACE_MINUTES;

      return {
        parkingMinutes: safeMinutes,
        completedDays: completedDays,
        remainderMinutes: remainderMinutes,
        zoneType: zoneType,
        required24hCount: required24hCount,
        remainderTargetMinutes: remainderTargetMinutes,
        valid24hCount: valid24hCount,
        hasValidFree: hasValidFree,
        hasPaidWithoutFree: hasPaidWithoutFree,
        accNon24hMinutes: accNon24hMinutes,
        uncoveredRemainderMinutes: uncoveredRemainderMinutes,
        remainingAdditionalNon24hLimit: remainingAdditionalNon24hLimit,
        historyAnnotations: historyAnnotations,
        deleteNeededCount: deleteNeededCount,
        hasDeleteNeeded: hasDeleteNeeded,
        totalDiscountMinutes: totalDiscountMinutes,
        isFullyCovered: isFullyCovered,
        canAddGraceCoupon: canAddGraceCoupon
      };
    }

    function getDeleteNeededAlertMessage(rule) {
      if (rule.hasPaidWithoutFree && rule.valid24hCount >= rule.required24hCount) {
        return '무료 1시간권을 포함하면 할인 한도를 초과합니다.\n[삭제 필요] 표시된 초과 쿠폰만 삭제한 뒤 무료 1시간권을 다시 등록해 주세요. 정상 쿠폰은 유지됩니다.';
      }
      if (rule.required24hCount === 0) {
        return '현재 주차시간 기준에 맞지 않는 할인권이 있습니다.\n목록에서 [삭제 필요] 표시된 할인권만 삭제해 주세요.';
      }
      if (rule.zoneType === 'ZONE_3') {
        return '잔여 한도를 초과한 할인권을 먼저 삭제해야 24시간 이용권을 등록할 수 있습니다.\n목록에서 [삭제 필요] 표시된 할인권만 삭제해 주세요.';
      }
      return '기존에 등록된 할인권을 먼저 삭제해야 24시간 이용권을 등록할 수 있습니다.\n목록에서 [삭제 필요] 할인권을 삭제해 주세요.';
    }

    function focusFirstDeleteNeededItem() {
      var $firstTarget = $('#parkingDiscountHistory .body.is-delete-needed').first();
      if (!$firstTarget.length) return;

      var $container = $('#contents');
      if ($container.length) {
        var targetTop = $firstTarget.offset().top - $container.offset().top + $container.scrollTop() - 80;
        $container.animate({ scrollTop: Math.max(targetTop, 0) }, 300);
      }
      $firstTarget.removeClass('pulse-focus');
      void $firstTarget[0].offsetWidth;
      $firstTarget.addClass('pulse-focus');
      $firstTarget.find('.btn_del').trigger('focus');
    }

    function formatMetricMinutes(minutes) {
      return formatMinutesText(minutes).replace(/시간|분/g, '<small class="pd-unit">$&</small>');
    }

    var parkingFeedbackTimer;
    function showParkingFeedback(message) {
      clearTimeout(parkingFeedbackTimer);
      $('#parkingFeedback').text(message).prop('hidden', false);
      parkingFeedbackTimer = setTimeout(function () { $('#parkingFeedback').prop('hidden', true); }, 2200);
    }

    function renderAll() {
      var rule = evaluateModularRule(currentParkingMinutes, currentHistoryList);
      var remainingMinutes = Math.max(0, currentParkingMinutes - rule.totalDiscountMinutes);
      var progressPct = rule.isFullyCovered
        ? 100
        : (currentParkingMinutes > 0
          ? Math.min(100, Math.round((rule.totalDiscountMinutes / currentParkingMinutes) * 100))
          : 0);

      $('#fieldParkingTime').html(formatMetricMinutes(currentParkingMinutes));
      $('#fieldDiscountTotalTime').html(formatMetricMinutes(rule.totalDiscountMinutes));
      $('#demoRuleFormula').text(
        'N=' + rule.completedDays + '일, R=' + formatMinutesText(rule.remainderMinutes)
      );

      $('#fieldRemainingTime').html(formatMetricMinutes(remainingMinutes));
      $('#parkingProgressBar').css('width', progressPct + '%');
      $('#parkingOverview').toggleClass('is-complete', rule.isFullyCovered);
      $('#parkingCompleteNotice').prop('hidden', !rule.isFullyCovered);
      $('#parkingCleanupLink').prop('hidden', !rule.hasDeleteNeeded);
      $('#parkingCleanupText').text('기존 쿠폰 ' + rule.deleteNeededCount + '건 삭제 필요');
      $('#parkingHistoryCount').text(currentHistoryList.length + '건');
      $('#parkingDeleteCount').text('삭제 필요 ' + rule.deleteNeededCount + '건').prop('hidden', !rule.hasDeleteNeeded);
      if (rule.hasDeleteNeeded) $('#parkingHistorySection').prop('open', true);

      var recommendedHourlyCodeNo = null;
      if (
        !rule.hasDeleteNeeded &&
        rule.valid24hCount >= rule.required24hCount &&
        rule.remainderTargetMinutes > 0 &&
        rule.hasValidFree &&
        rule.uncoveredRemainderMinutes > 0
      ) {
        if (rule.uncoveredRemainderMinutes >= 120 && 180 <= rule.remainingAdditionalNon24hLimit) {
          recommendedHourlyCodeNo = 5; // 3시간 유료할인 추천
        } else if (rule.uncoveredRemainderMinutes > 30 && 60 <= rule.remainingAdditionalNon24hLimit) {
          recommendedHourlyCodeNo = 3; // 1시간 유료할인 추천
        } else if (30 <= rule.remainingAdditionalNon24hLimit) {
          recommendedHourlyCodeNo = 2; // 30분 유료할인 추천
        }
      }

      var guideTitle;
      var guide;
      if (rule.hasDeleteNeeded) {
        guideTitle = (rule.required24hCount > 0 && rule.remainderTargetMinutes === 0)
          ? '24시간 이용권 대상입니다'
          : '기존 할인권 정리가 필요합니다';
        if (rule.hasPaidWithoutFree && rule.valid24hCount >= rule.required24hCount) {
          guide = '초과 쿠폰만 삭제한 뒤 무료 1시간권을 다시 등록해 주세요. 정상 쿠폰은 유지됩니다.';
        } else if (rule.zoneType === 'ZONE_3') {
          guide = '초과 쿠폰만 삭제해 주세요. 유효한 할인권은 유지됩니다.';
        } else if (rule.required24hCount > 0 && rule.remainderTargetMinutes === 0) {
          guide = '기존 등록된 쿠폰 ' + rule.deleteNeededCount + '건을 먼저 삭제한 뒤 [24시간 유료할인]을 등록해 주세요.';
        } else {
          guide = '기준에 맞지 않는 할인권을 삭제해 주세요.';
        }
      } else if (rule.isFullyCovered) {
        guideTitle = '할인 등록이 완료되었습니다';
        guide = rule.canAddGraceCoupon
          ? '출차 여유 시간이 필요하면 [30분 유료할인]을 추가 등록할 수 있습니다.'
          : '모든 주차시간에 대한 할인이 정상 적용되었습니다.';
      } else if (rule.valid24hCount < rule.required24hCount) {
        guideTitle = formatMinutesText(remainingMinutes) + ' 추가 할인이 필요합니다';
        guide = '우선선택 표시된 [24시간 유료할인]을 선택하면 정산이 진행됩니다.';
      } else if (!rule.hasValidFree) {
        guideTitle = formatMinutesText(remainingMinutes) + ' 추가 할인이 필요합니다';
        guide = rule.hasPaidWithoutFree
          ? '기존 유료권은 유지됩니다. [1시간 무료할인]을 다시 등록해 주세요.'
          : '우선선택 표시된 [1시간 무료할인]을 먼저 등록해 주세요.';
      } else {
        guideTitle = formatMinutesText(remainingMinutes) + ' 추가 할인이 필요합니다';
        var recCoupon = AVAILABLE_COUPONS.find(function (c) { return c.discCodeNo === recommendedHourlyCodeNo; });
        guide = recCoupon
          ? '우선선택 표시된 [' + recCoupon.discName + ']을 선택하면 정산이 완료됩니다.'
          : '남은 시간에 맞춰 우선선택 할인권을 등록해 주세요.';
      }
      $('#parkingGuideTitle').text(guideTitle);
      $('#parkingGuideMessage').html(guide);

      // 2. 할인등록 내역 리스트 렌더링
      var $history = $('#parkingDiscountHistory').empty();

      if (currentHistoryList.length === 0) {
        $history.append('<div class="body parking-empty">할인등록 내역이 없습니다.</div>');
      } else {
        rule.historyAnnotations.forEach(function (annotation) {
          var h = annotation.item;
          var $body = $('<div>', {
            'class': 'body' + (annotation.needsDelete ? ' is-delete-needed' : ''),
            'data-history-id': h.id
          });

          var coupon = AVAILABLE_COUPONS.find(function (c) { return c.discCodeNo === h.discCodeNo; });
          var $nameRow = $('<span>', { 'class': 'pd-history-name' }).text(coupon ? coupon.discName : h.discName);
          if (annotation.needsDelete) {
            $nameRow.append($('<span>', { 'class': 'badge-delete-needed' }).text('삭제 필요'));
          }
          var $info = $('<div>', { 'class': 'discount_info' })
            .append($nameRow)
            .append($('<span>', { 'class': 'pd-history-date' }).text(h.date + ' ' + h.time));

          var $delBtn = $('<button>', { type: 'button', 'class': 'btn_del', title: '삭제' }).text('삭제');
          $body.append($info).append($delBtn);
          $history.append($body);
        });
      }

      // 3. 사용 가능한 할인권 렌더링 (2열 버튼과 우측 상단 코너탭 추천 뱃지 표시)
      var $couponList = $('#parkingDiscountCodeList').empty();

      AVAILABLE_COUPONS.forEach(function (coupon) {
        var isEnabled = false;
        var isRecommended = false;
        var requiresDeleteBeforeUse = false;

        if (coupon.is24h) {
          if (rule.valid24hCount < rule.required24hCount) {
            requiresDeleteBeforeUse = rule.hasDeleteNeeded;
            isEnabled = !requiresDeleteBeforeUse;
            isRecommended = isEnabled;
          } else {
            isEnabled = false;
          }
        } else if (coupon.isFree) {
          if (
            !rule.hasDeleteNeeded &&
            rule.valid24hCount >= rule.required24hCount &&
            rule.remainderTargetMinutes > 0 &&
            !rule.hasValidFree
          ) {
            isEnabled = true;
            isRecommended = true;
          } else {
            isEnabled = false;
          }
        } else {
          if (
            !rule.hasDeleteNeeded &&
            rule.valid24hCount >= rule.required24hCount &&
            rule.remainderTargetMinutes > 0 &&
            rule.hasValidFree &&
            (rule.uncoveredRemainderMinutes > 0 || (coupon.discCodeNo === 2 && rule.canAddGraceCoupon)) &&
            coupon.minutes <= rule.remainingAdditionalNon24hLimit
          ) {
            isEnabled = true;
            isRecommended = (coupon.discCodeNo === recommendedHourlyCodeNo);
          } else {
            isEnabled = false;
          }
        }

        var $btn = $('<button>', {
          type: 'button',
          'class': 'discount_coupon' + (isRecommended ? ' is-recommended' : ''),
          disabled: !isEnabled,
          'data-disc-code-no': coupon.discCodeNo,
          'data-requires-delete': requiresDeleteBeforeUse ? 'true' : 'false'
        });

        $btn.append($('<span>', { 'class': 'title' }).text(coupon.discName));
        if (isRecommended) {
          $btn.append($('<span>', { 'class': 'badge-recommend' }).text('우선선택'));
        }

        $couponList.append($('<li>').append($btn));
      });
    }

    function applyScenario(key) {
      var preset = SCENARIOS[key] || SCENARIOS.case2;
      currentScenarioKey = key in SCENARIOS ? key : 'case2';
      currentParkingMinutes = preset.parkingMinutes;
      currentHistoryList = preset.history.map(function (item) {
        return $.extend({}, item);
      });
      $('#fieldInDtm').text(preset.inDtm.slice(0, 16)).attr('datetime', preset.inDtm.replace(/\./g, '-').replace(' ', 'T'));
      $('.demo-chip').removeClass('active');
      $('.demo-chip[data-scenario="' + currentScenarioKey + '"]').addClass('active');
      renderAll();
    }

    function initParking() {
      var tooltipAutoOpenTimer = null;
      var tooltipAutoCloseTimer = null;

      function clearTooltipTimers() {
        clearTimeout(tooltipAutoOpenTimer);
        clearTimeout(tooltipAutoCloseTimer);
      }

      function openParkingTooltip() {
        $('#parkingTooltipWrap').addClass('is-open');
        $('#parkingTooltipBtn').attr('aria-expanded', 'true');
      }

      function closeParkingTooltip() {
        clearTooltipTimers();
        $('#parkingTooltipWrap').removeClass('is-open');
        $('#parkingTooltipBtn').attr('aria-expanded', 'false');
      }

      function showInitialTooltipGuide() {
        clearTooltipTimers();
        tooltipAutoOpenTimer = setTimeout(function () {
          openParkingTooltip();
          tooltipAutoCloseTimer = setTimeout(function () {
            closeParkingTooltip();
          }, 2800);
        }, 250);
      }

      $('#parkingTooltipBtn').on('click', function (e) {
        e.stopPropagation();
        clearTooltipTimers();
        var $wrap = $('#parkingTooltipWrap');
        var nextOpen = !$wrap.hasClass('is-open');
        $wrap.toggleClass('is-open', nextOpen);
        $(this).attr('aria-expanded', String(nextOpen));
      });
      $('#parkingGuideBubble').on('click', function (e) {
        e.stopPropagation();
        closeParkingTooltip();
      });
      $(document).on('click', function (e) {
        if (!$(e.target).closest('#parkingTooltipWrap').length) {
          closeParkingTooltip();
        }
      });
      $('#contents').add(window).on('scroll', function () {
        if ($('#parkingTooltipWrap').hasClass('is-open')) {
          closeParkingTooltip();
        }
      });
      $('#parkingCleanupLink').on('click', function () {
        $('#parkingHistorySection').prop('open', true);
        focusFirstDeleteNeededItem();
      });
      // URL 파라미터(?scenario=case1a 등) 지원
      var params = new URLSearchParams(window.location.search);
      var requestedScenario = params.get('scenario');
      var initialScenario = Object.prototype.hasOwnProperty.call(SCENARIOS, requestedScenario) ? requestedScenario : 'needed';
      applyScenario(initialScenario);
      initDesktopParking(params);
      showInitialTooltipGuide();

      // 시나리오 전환 칩 클릭
      $(document).on('click', '.demo-chip', function () {
        var key = $(this).data('scenario');
        applyScenario(key);
      });

      // 할인등록 내역 삭제 버튼
      $(document).on('click', '.btn_del', function () {
        var $body = $(this).closest('.body');
        var historyId = $body.data('history-id');
        parkConfirm('선택한 할인등록 내역을 삭제하시겠습니까?', function () {
          currentHistoryList = currentHistoryList.filter(function (item) {
            return String(item.id) !== String(historyId);
          });
          renderAll();
          showParkingFeedback('할인권이 삭제되었습니다.');
        });
      });

      // 사용 가능한 할인권 클릭
      $(document).on('click', '.discount_coupon:not(:disabled)', function () {
        var $btn = $(this);
        var requiresDelete = $btn.attr('data-requires-delete') === 'true';

        // 4.3: 11시간 이상인데 기존 쿠폰이 남아있는 상태에서 [24시간 유료할인] 클릭 시 삭제 유도 팝업 + 스크롤 포커스
        if (requiresDelete) {
          parkAlert(
            getDeleteNeededAlertMessage(evaluateModularRule(currentParkingMinutes, currentHistoryList)),
            function () {
              focusFirstDeleteNeededItem();
            }
          );
          return;
        }

        var codeNo = Number($btn.data('disc-code-no'));
        var coupon = AVAILABLE_COUPONS.find(function (c) { return c.discCodeNo === codeNo; });
        if (!coupon) return;

        var wasFullyCovered = evaluateModularRule(currentParkingMinutes, currentHistoryList).isFullyCovered;
        var ts = getTimestamp();
        nextIdSeq += 1;
        currentHistoryList.push({
          id: 'H-' + nextIdSeq,
          discCodeNo: coupon.discCodeNo,
          discName: coupon.discName,
          minutes: coupon.minutes,
          date: ts.date,
          time: ts.time
        });

        renderAll();
        showParkingFeedback(coupon.discName + ' 등록 완료');
        if (!wasFullyCovered && evaluateModularRule(currentParkingMinutes, currentHistoryList).isFullyCovered) {
          parkAlert('쿠폰 등록이 완료되어 출차 가능합니다.');
        }
      });
    }

    $(function () {
      initParking();
    });
  
function switchParkingView(view) {
  var isSearch = view === 'search';
  $('#parkingSearchView').toggle(isSearch);
  $('#parkingDetailView').toggle(!isSearch);
  $('.demo-btn[data-view]').removeClass('active').filter('[data-view="' + view + '"]').addClass('active');
  if (!isSearch) {
    $('#fieldVehicleNo').text($('#parkingVehicleNo').val().trim() || '03러 2873');
    if (view === 'detail_empty') applyScenario('case1a');
  }
}
function initDesktopParking(params) {
  $('#parkingSearchBtn').on('click', function () {
    if (!$('#parkingVehicleNo').val().trim()) {
      soAlert('차량번호를 입력해 주세요.\n예) 03러 2873', function () { $('#parkingVehicleNo').trigger('focus'); });
      return;
    }
    switchParkingView('detail');
  });
  $('#parkingVehicleNo').on('keydown', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); $('#parkingSearchBtn').trigger('click'); }
  });
  $('.demo-btn[data-view]').on('click', function () {
    var view = $(this).attr('data-view');
    if (view === 'detail') applyScenario('needed');
    switchParkingView(view);
  });
  $('.demo-chip').on('click.desktop', function () { switchParkingView('detail'); });
  var aliases = { search: 'search', detail: 'detail', empty: 'detail_empty' };
  var view = params.get('view') || aliases[params.get('scenario')];
  if (!view) view = Object.prototype.hasOwnProperty.call(SCENARIOS, params.get('scenario')) ? 'detail' : 'search';
  switchParkingView(['search', 'detail', 'detail_empty'].includes(view) ? view : 'search');
}
