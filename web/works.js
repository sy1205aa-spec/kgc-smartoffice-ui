/**
 * 구 스마트웍스 스냅샷 화면(web/works/*.html) 보정 스크립트
 * - 회의실 표: jQuery floatThead 가 떼어낸 머리행(.floatThead-container) 복원
 * - 도면(#zoomArea)을 도면 영역(#zoomContainer) 크기에 맞춰 가운데 배치
 */
(function () {
  'use strict';

  var MARGIN = 24;
  var MIN_HEIGHT = 600;

  function fitMap() {
    var container = document.getElementById('zoomContainer');
    var area = document.getElementById('zoomArea');
    if (!container || !area || !area.parentElement) {
      return;
    }

    var viewport = area.parentElement;
    var box = document.getElementById('zoomContent') || container;
    var top = box.getBoundingClientRect().top + window.pageYOffset;
    var height = Math.max(MIN_HEIGHT, window.innerHeight - top - 40);
    box.style.height = height + 'px';
    container.style.height = height + 'px';
    viewport.style.width = '100%';
    viewport.style.height = height + 'px';

    var map = area.querySelector('.map_box') || area;
    var mapWidth = map.offsetWidth;
    var mapHeight = map.offsetHeight;
    if (!mapWidth || !mapHeight) {
      return;
    }

    var width = viewport.clientWidth;
    var scale = Math.min((width - MARGIN * 2) / mapWidth, (height - MARGIN * 2) / mapHeight);
    var x = (width - mapWidth * scale) / 2;
    var y = (height - mapHeight * scale) / 2;
    area.style.transition = 'none';
    area.style.transformOrigin = '0 0';
    area.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
  }

  function restoreTableHeads() {
    var containers = document.querySelectorAll('.floatThead-container');
    Array.prototype.forEach.call(containers, function (container) {
      var head = container.querySelector('thead');
      var table = container.nextElementSibling;
      while (table && table.tagName !== 'TABLE') {
        var next = table.nextElementSibling;
        if (table.tagName === 'FTHFOOT') {
          table.parentNode.removeChild(table);
        }
        table = next;
      }
      if (!head || !table) {
        return;
      }
      var oldHead = table.querySelector('thead');
      if (oldHead) {
        table.replaceChild(head, oldHead);
      } else {
        table.insertBefore(head, table.tBodies[0] || null);
      }
      container.parentNode.removeChild(container);
    });
  }

  document.addEventListener('DOMContentLoaded', restoreTableHeads);
  window.addEventListener('load', fitMap);
  window.addEventListener('resize', fitMap);
})();
