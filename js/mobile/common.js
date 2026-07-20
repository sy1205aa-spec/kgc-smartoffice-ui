(function ($, window) {

  this.commonJs = {};
  var doc;
  var win;
  var ANIMATE_SPEED = 200;
  var ANIMATE_EASING = 'easeOutQuad';

  function gnb() {
    var header = $('header'),
      nav = header.children('nav'),
      navCon = nav.children('.navCon'),
      uTile = navCon.children('.uTile'),
      navConWrap = navCon.children('ul'),
      closeBtn = uTile.children('ul').children('li').children('.btn_close'),
      dimmed = nav.children('.dimmed'),
      totalNav = header.find('.gnb .total_nav'),
      conTab = navCon.children('ul').children('li');

    navConWrap.children('li').each(function () {
      var $this = $(this),
        $thisA = $this.children('a'),
        $thisSnb = $this.children('.snb'),
        $dep2A = $thisSnb.children('ul').children('li.add').children('a');
      nav.css('display', 'block');
      resize.on('resize', resizeH);

      function resizeH() {
        navCon.height(wHeight);
        navConWrap.css({
          overflow: 'auto',
          height: navCon.height() - 140 - $('.navFooter').height()
        });
      }
      resizeH();
      /**
      if ($this.hasClass('on')) {
        $this.height($thisA.height() + $thisSnb.height());
      } else {
        $this.css({
          overflow: 'hidden',
          height: $thisA.height()
        });
      }
	  */

      navCon.find('.snb>ul>li.on').removeClass('on').height($dep2A.height());
      navCon.css({
        left: navCon.width()
      });
      nav.css('display', 'none');
      closeBtn.on('click', function () {
        if (navCon.is(':animated')) {
          return;
        }
        dimmed.css('display', 'none');
        closeBtn.css('display', 'none');
        navCon.animate({
          left: navCon.width() + 'px'
        }, ANIMATE_SPEED, function () {
          nav.css('display', 'none')
        });
      });

      dimmed.on('click', function () {
        if (navCon.is(':animated')) {
          return;
        }
        dimmed.css('display', 'none');
        closeBtn.css('display', 'none');
        navCon.animate({
          left: navCon.width() + 'px'
        }, ANIMATE_SPEED, function () {
          nav.css('display', 'none')
        });
      });


      totalNav.on('click', function () {
        if (navCon.is(':animated')) {
          return;
        }
        nav.css('display', 'block');
        dimmed.css('display', 'block');
        closeBtn.css('display', 'block');
        navCon.animate({
          left: 0
        }, ANIMATE_SPEED);
      });


      $thisA.on('click', function () {
        if ($this.is(':animated')) {
          return;
        }
        var _this = $(this),
          dep1 = _this.closest('li'),
          border = $this.outerHeight(true) - $this.height();;

        var siblings = dep1.siblings('.add');
        $.each(siblings, function (idx, li) {
          var __this = $(this);
          if (__this.hasClass('on')) {
            __this.animate({
              height: __this.children('a').height() + border
            }, ANIMATE_SPEED, function () {
              __this.removeClass('on');
            });
          }
        });
        /**
        if (dep1.hasClass('on')) {
          $this.animate({
            height: $thisA.height() + border
          }, ANIMATE_SPEED, function () {
            dep1.removeClass('on');
          });
        } else {
          dep1.addClass('on');
          $this.animate({
            height: $thisSnb.height() + $this.height() + border
          }, ANIMATE_SPEED)
        }
		*/
      });
      var _dep2H = 0;
      $dep2A.on('click', function () {
        if ($this.is(':animated')) {
          return;
        }
        var _this = $(this),
          _dep2 = _this.closest('li'),
          _dep3 = _dep2.children('.nb'),
          border = $this.outerHeight(true) - $this.height();

        if (_dep2.hasClass('on')) {
          _dep2.animate({
            height: _this.height() + border
          }, ANIMATE_SPEED, function () {
            _dep2.removeClass('on');

          });
          $this.animate({
            height: $this.height() - _dep3.height() + border
          }, ANIMATE_SPEED);
        } else {
          $this.animate({
            height: $thisSnb.height() + $thisA.height() + _dep3.height() + border
          }, ANIMATE_SPEED);
          _dep2.addClass('on');
          _dep2.animate({
            height: _this.height() + _dep3.height() + border
          }, ANIMATE_SPEED);
        }
      });
    });
  }

  $(function () {
    doc = $(document);
    win = $(window);
    resize = $({});
    win.on('resize', resizeH);
    resizeH()

    function resizeH() {
      wWidth = win.width();
      wHeight = win.height();
      resize.trigger('resize');
    }
    gnb();
  });

})(jQuery, window)