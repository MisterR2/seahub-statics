(function ($) {
    function isTouchEvent(t) {
        return !/^(4|mouse)$/.test(t.pointerType)
    }

    function getEventsNS(t, e) {
        e || (e = "");
        var i = {};
        for (var n in t) i[n.split(" ").join(e + " ") + e] = t[n];
        return i
    }
    var menuTrees = [],
        mouse = !1,
        touchEvents = "ontouchstart" in window,
        mouseDetectionEnabled = !1,
        requestAnimationFrame = window.requestAnimationFrame || function (t) {
            return setTimeout(t, 1e3 / 60)
        },
        cancelAnimationFrame = window.cancelAnimationFrame || function (t) {
            clearTimeout(t)
        },
        canAnimate = !!$.fn.animate;
    return $.SmartMenus = function (t, e) {
        this.$root = $(t), this.opts = e, this.rootId = "", this.accessIdPrefix = "", this.$subArrow = null, this.activatedItems = [], this.visibleSubMenus = [], this.showTimeout = 0, this.hideTimeout = 0, this.scrollTimeout = 0, this.clickActivated = !1, this.focusActivated = !1, this.zIndexInc = 0, this.idInc = 0, this.$firstLink = null, this.$firstSub = null, this.disabled = !1, this.$disableOverlay = null, this.$touchScrollingSub = null, this.cssTransforms3d = "perspective" in t.style || "webkitPerspective" in t.style, this.wasCollapsible = !1, this.init()
    }, $.extend($.SmartMenus, {
        hideAll: function () {
            $.each(menuTrees, function () {
                this.menuHideAll()
            })
        },
        destroy: function () {
            for (; menuTrees.length;) menuTrees[0].destroy();
            initMouseDetection(!0)
        },
        prototype: {
            init: function (t) {
                var e = this;
                if (!t) {
                    menuTrees.push(this), this.rootId = ((new Date).getTime() + Math.random() + "").replace(/\D/g, ""), this.accessIdPrefix = "sm-" + this.rootId + "-", this.$root.hasClass("sm-rtl") && (this.opts.rightToLeftSubMenus = !0);
                    var i = ".smartmenus";
                    this.$root.data("smartmenus", this).attr("data-smartmenus-id", this.rootId).dataSM("level", 1).on(getEventsNS({
                        "mouseover focusin": $.proxy(this.rootOver, this),
                        "mouseout focusout": $.proxy(this.rootOut, this),
                        keydown: $.proxy(this.rootKeyDown, this)
                    }, i)).on(getEventsNS({
                        mouseenter: $.proxy(this.itemEnter, this),
                        mouseleave: $.proxy(this.itemLeave, this),
                        mousedown: $.proxy(this.itemDown, this),
                        focus: $.proxy(this.itemFocus, this),
                        blur: $.proxy(this.itemBlur, this),
                        click: $.proxy(this.itemClick, this)
                    }, i), "a"), i += this.rootId, this.opts.hideOnClick && $(document).on(getEventsNS({
                        touchstart: $.proxy(this.docTouchStart, this),
                        touchmove: $.proxy(this.docTouchMove, this),
                        touchend: $.proxy(this.docTouchEnd, this),
                        click: $.proxy(this.docClick, this)
                    }, i)), $(window).on(getEventsNS({
                        "resize orientationchange": $.proxy(this.winResize, this)
                    }, i)), this.opts.subIndicators && (this.$subArrow = $("<span/>").addClass("sub-arrow"), this.opts.subIndicatorsText && this.$subArrow.html(this.opts.subIndicatorsText)), initMouseDetection()
                }
                if (this.$firstSub = this.$root.find("ul").each(function () {
                        e.menuInit($(this))
                    }).eq(0), this.$firstLink = this.$root.find("a").eq(0), this.opts.markCurrentItem) {
                    var n = /(index|default)\.[^#\?\/]*/i,
                        o = /#.*/,
                        s = window.location.href.replace(n, ""),
                        r = s.replace(o, "");
                    this.$root.find("a:not(.mega-menu a)").each(function () {
                        var t = this.href.replace(n, ""),
                            i = $(this);
                        (t == s || t == r) && (i.addClass("current"), e.opts.markCurrentTree && i.parentsUntil("[data-smartmenus-id]", "ul").each(function () {
                            $(this).dataSM("parent-a").addClass("current")
                        }))
                    })
                }
                this.wasCollapsible = this.isCollapsible()
            },
            destroy: function (t) {
                if (!t) {
                    var e = ".smartmenus";
                    this.$root.removeData("smartmenus").removeAttr("data-smartmenus-id").removeDataSM("level").off(e), e += this.rootId, $(document).off(e), $(window).off(e), this.opts.subIndicators && (this.$subArrow = null)
                }
                this.menuHideAll();
                var i = this;
                this.$root.find("ul").each(function () {
                    var t = $(this);
                    t.dataSM("scroll-arrows") && t.dataSM("scroll-arrows").remove(), t.dataSM("shown-before") && ((i.opts.subMenusMinWidth || i.opts.subMenusMaxWidth) && t.css({
                        width: "",
                        minWidth: "",
                        maxWidth: ""
                    }).removeClass("sm-nowrap"), t.dataSM("scroll-arrows") && t.dataSM("scroll-arrows").remove(), t.css({
                        zIndex: "",
                        top: "",
                        left: "",
                        marginLeft: "",
                        marginTop: "",
                        display: ""
                    })), 0 == (t.attr("id") || "").indexOf(i.accessIdPrefix) && t.removeAttr("id")
                }).removeDataSM("in-mega").removeDataSM("shown-before").removeDataSM("scroll-arrows").removeDataSM("parent-a").removeDataSM("level").removeDataSM("beforefirstshowfired").removeAttr("role").removeAttr("aria-hidden").removeAttr("aria-labelledby").removeAttr("aria-expanded"), this.$root.find("a.has-submenu").each(function () {
                    var t = $(this);
                    0 == t.attr("id").indexOf(i.accessIdPrefix) && t.removeAttr("id")
                }).removeClass("has-submenu").removeDataSM("sub").removeAttr("aria-haspopup").removeAttr("aria-controls").removeAttr("aria-expanded").closest("li").removeDataSM("sub"), this.opts.subIndicators && this.$root.find("span.sub-arrow").remove(), this.opts.markCurrentItem && this.$root.find("a.current").removeClass("current"), t || (this.$root = null, this.$firstLink = null, this.$firstSub = null, this.$disableOverlay && (this.$disableOverlay.remove(), this.$disableOverlay = null), menuTrees.splice($.inArray(this, menuTrees), 1))
            },
            disable: function (t) {
                if (!this.disabled) {
                    if (this.menuHideAll(), !t && !this.opts.isPopup && this.$root.is(":visible")) {
                        var e = this.$root.offset();
                        this.$disableOverlay = $('<div class="sm-jquery-disable-overlay"/>').css({
                            position: "absolute",
                            top: e.top,
                            left: e.left,
                            width: this.$root.outerWidth(),
                            height: this.$root.outerHeight(),
                            zIndex: this.getStartZIndex(!0),
                            opacity: 0
                        }).appendTo(document.body)
                    }
                    this.disabled = !0
                }
            },
            docClick: function (t) {
                return this.$touchScrollingSub ? void(this.$touchScrollingSub = null) : void((this.visibleSubMenus.length && !$.contains(this.$root[0], t.target) || $(t.target).closest("a").length) && this.menuHideAll())
            },
            docTouchEnd: function () {
                if (this.lastTouch) {
                    if (!(!this.visibleSubMenus.length || void 0 !== this.lastTouch.x2 && this.lastTouch.x1 != this.lastTouch.x2 || void 0 !== this.lastTouch.y2 && this.lastTouch.y1 != this.lastTouch.y2 || this.lastTouch.target && $.contains(this.$root[0], this.lastTouch.target))) {
                        this.hideTimeout && (clearTimeout(this.hideTimeout), this.hideTimeout = 0);
                        var t = this;
                        this.hideTimeout = setTimeout(function () {
                            t.menuHideAll()
                        }, 350)
                    }
                    this.lastTouch = null
                }
            },
            docTouchMove: function (t) {
                if (this.lastTouch) {
                    var e = t.originalEvent.touches[0];
                    this.lastTouch.x2 = e.pageX, this.lastTouch.y2 = e.pageY
                }
            },
            docTouchStart: function (t) {
                var e = t.originalEvent.touches[0];
                this.lastTouch = {
                    x1: e.pageX,
                    y1: e.pageY,
                    target: e.target
                }
            },
            enable: function () {
                this.disabled && (this.$disableOverlay && (this.$disableOverlay.remove(), this.$disableOverlay = null), this.disabled = !1)
            },
            getClosestMenu: function (t) {
                for (var e = $(t).closest("ul"); e.dataSM("in-mega");) e = e.parent().closest("ul");
                return e[0] || null
            },
            getHeight: function (t) {
                return this.getOffset(t, !0)
            },
            getOffset: function (t, e) {
                var i;
                "none" == t.css("display") && (i = {
                    position: t[0].style.position,
                    visibility: t[0].style.visibility
                }, t.css({
                    position: "absolute",
                    visibility: "hidden"
                }).show());
                var n = t[0].getBoundingClientRect && t[0].getBoundingClientRect(),
                    o = n && (e ? n.height || n.bottom - n.top : n.width || n.right - n.left);
                return o || 0 === o || (o = e ? t[0].offsetHeight : t[0].offsetWidth), i && t.hide().css(i), o
            },
            getStartZIndex: function (t) {
                var e = parseInt(this[t ? "$root" : "$firstSub"].css("z-index"));
                return !t && isNaN(e) && (e = parseInt(this.$root.css("z-index"))), isNaN(e) ? 1 : e
            },
            getTouchPoint: function (t) {
                return t.touches && t.touches[0] || t.changedTouches && t.changedTouches[0] || t
            },
            getViewport: function (t) {
                var e = t ? "Height" : "Width",
                    i = document.documentElement["client" + e],
                    n = window["inner" + e];
                return n && (i = Math.min(i, n)), i
            },
            getViewportHeight: function () {
                return this.getViewport(!0)
            },
            getViewportWidth: function () {
                return this.getViewport()
            },
            getWidth: function (t) {
                return this.getOffset(t)
            },
            handleEvents: function () {
                return !this.disabled && this.isCSSOn()
            },
            handleItemEvents: function (t) {
                return this.handleEvents() && !this.isLinkInMegaMenu(t)
            },
            isCollapsible: function () {
                return "static" == this.$firstSub.css("position")
            },
            isCSSOn: function () {
                return "inline" != this.$firstLink.css("display")
            },
            isFixed: function () {
                var t = "fixed" == this.$root.css("position");
                return t || this.$root.parentsUntil("body").each(function () {
                    return "fixed" == $(this).css("position") ? (t = !0, !1) : void 0
                }), t
            },
            isLinkInMegaMenu: function (t) {
                return $(this.getClosestMenu(t[0])).hasClass("mega-menu")
            },
            isTouchMode: function () {
                return !mouse || this.opts.noMouseOver || this.isCollapsible()
            },
            itemActivate: function (t, e) {
                var i = t.closest("ul"),
                    n = i.dataSM("level");
                if (n > 1 && (!this.activatedItems[n - 2] || this.activatedItems[n - 2][0] != i.dataSM("parent-a")[0])) {
                    var o = this;
                    $(i.parentsUntil("[data-smartmenus-id]", "ul").get().reverse()).add(i).each(function () {
                        o.itemActivate($(this).dataSM("parent-a"))
                    })
                }
                if ((!this.isCollapsible() || e) && this.menuHideSubMenus(this.activatedItems[n - 1] && this.activatedItems[n - 1][0] == t[0] ? n : n - 1), this.activatedItems[n - 1] = t, !1 !== this.$root.triggerHandler("activate.smapi", t[0])) {
                    var s = t.dataSM("sub");
                    s && (this.isTouchMode() || !this.opts.showOnClick || this.clickActivated) && this.menuShow(s)
                }
            },
            itemBlur: function (t) {
                var e = $(t.currentTarget);
                this.handleItemEvents(e) && this.$root.triggerHandler("blur.smapi", e[0])
            },
            itemClick: function (t) {
                var e = $(t.currentTarget);
                if (this.handleItemEvents(e)) {
                    if (this.$touchScrollingSub && this.$touchScrollingSub[0] == e.closest("ul")[0]) return this.$touchScrollingSub = null, t.stopPropagation(), !1;
                    if (!1 === this.$root.triggerHandler("click.smapi", e[0])) return !1;
                    var i = e.dataSM("sub"),
                        n = !!i && 2 == i.dataSM("level");
                    if (i) {
                        var o = $(t.target).is(".sub-arrow"),
                            s = this.isCollapsible(),
                            r = /toggle$/.test(this.opts.collapsibleBehavior),
                            a = /link$/.test(this.opts.collapsibleBehavior),
                            l = /^accordion/.test(this.opts.collapsibleBehavior);
                        if (i.is(":visible")) {
                            if (!s && this.opts.showOnClick && n) return this.menuHide(i), this.clickActivated = !1, this.focusActivated = !1, !1;
                            if (s && (r || o)) return this.itemActivate(e, l), this.menuHide(i), !1
                        } else if ((!a || !s || o) && (!s && this.opts.showOnClick && n && (this.clickActivated = !0), this.itemActivate(e, l), i.is(":visible"))) return this.focusActivated = !0, !1
                    }
                    return !(!s && this.opts.showOnClick && n || e.hasClass("disabled") || !1 === this.$root.triggerHandler("select.smapi", e[0])) && void 0
                }
            },
            itemDown: function (t) {
                var e = $(t.currentTarget);
                this.handleItemEvents(e) && e.dataSM("mousedown", !0)
            },
            itemEnter: function (t) {
                var e = $(t.currentTarget);
                if (this.handleItemEvents(e)) {
                    if (!this.isTouchMode()) {
                        this.showTimeout && (clearTimeout(this.showTimeout), this.showTimeout = 0);
                        var i = this;
                        this.showTimeout = setTimeout(function () {
                            i.itemActivate(e)
                        }, this.opts.showOnClick && 1 == e.closest("ul").dataSM("level") ? 1 : this.opts.showTimeout)
                    }
                    this.$root.triggerHandler("mouseenter.smapi", e[0])
                }
            },
            itemFocus: function (t) {
                var e = $(t.currentTarget);
                this.handleItemEvents(e) && (!this.focusActivated || this.isTouchMode() && e.dataSM("mousedown") || this.activatedItems.length && this.activatedItems[this.activatedItems.length - 1][0] == e[0] || this.itemActivate(e, !0), this.$root.triggerHandler("focus.smapi", e[0]))
            },
            itemLeave: function (t) {
                var e = $(t.currentTarget);
                this.handleItemEvents(e) && (this.isTouchMode() || (e[0].blur(), this.showTimeout && (clearTimeout(this.showTimeout), this.showTimeout = 0)), e.removeDataSM("mousedown"), this.$root.triggerHandler("mouseleave.smapi", e[0]))
            },
            menuHide: function (t) {
                if (!1 !== this.$root.triggerHandler("beforehide.smapi", t[0]) && (canAnimate && t.stop(!0, !0), "none" != t.css("display"))) {
                    var e = function () {
                        t.css("z-index", "")
                    };
                    this.isCollapsible() ? canAnimate && this.opts.collapsibleHideFunction ? this.opts.collapsibleHideFunction.call(this, t, e) : t.hide(this.opts.collapsibleHideDuration, e) : canAnimate && this.opts.hideFunction ? this.opts.hideFunction.call(this, t, e) : t.hide(this.opts.hideDuration, e), t.dataSM("scroll") && (this.menuScrollStop(t), t.css({
                        "touch-action": "",
                        "-ms-touch-action": "",
                        "-webkit-transform": "",
                        transform: ""
                    }).off(".smartmenus_scroll").removeDataSM("scroll").dataSM("scroll-arrows").hide()), t.dataSM("parent-a").removeClass("highlighted").attr("aria-expanded", "false"), t.attr({
                        "aria-expanded": "false",
                        "aria-hidden": "true"
                    });
                    var i = t.dataSM("level");
                    this.activatedItems.splice(i - 1, 1), this.visibleSubMenus.splice($.inArray(t, this.visibleSubMenus), 1), this.$root.triggerHandler("hide.smapi", t[0])
                }
            },
            menuHideAll: function () {
                this.showTimeout && (clearTimeout(this.showTimeout), this.showTimeout = 0);
                for (var t = this.opts.isPopup ? 1 : 0, e = this.visibleSubMenus.length - 1; e >= t; e--) this.menuHide(this.visibleSubMenus[e]);
                this.opts.isPopup && (canAnimate && this.$root.stop(!0, !0), this.$root.is(":visible") && (canAnimate && this.opts.hideFunction ? this.opts.hideFunction.call(this, this.$root) : this.$root.hide(this.opts.hideDuration))), this.activatedItems = [], this.visibleSubMenus = [], this.clickActivated = !1, this.focusActivated = !1, this.zIndexInc = 0, this.$root.triggerHandler("hideAll.smapi")
            },
            menuHideSubMenus: function (t) {
                for (var e = this.activatedItems.length - 1; e >= t; e--) {
                    var i = this.activatedItems[e].dataSM("sub");
                    i && this.menuHide(i)
                }
            },
            menuInit: function (t) {
                if (!t.dataSM("in-mega")) {
                    t.hasClass("mega-menu") && t.find("ul").dataSM("in-mega", !0);
                    for (var e = 2, i = t[0];
                        (i = i.parentNode.parentNode) != this.$root[0];) e++;
                    var n = t.prevAll("a").eq(-1);
                    n.length || (n = t.prevAll().find("a").eq(-1)), n.addClass("has-submenu").dataSM("sub", t), t.dataSM("parent-a", n).dataSM("level", e).parent().dataSM("sub", t);
                    var o = n.attr("id") || this.accessIdPrefix + ++this.idInc,
                        s = t.attr("id") || this.accessIdPrefix + ++this.idInc;
                    n.attr({
                        id: o,
                        "aria-haspopup": "true",
                        "aria-controls": s,
                        "aria-expanded": "false"
                    }), t.attr({
                        id: s,
                        role: "group",
                        "aria-hidden": "true",
                        "aria-labelledby": o,
                        "aria-expanded": "false"
                    }), this.opts.subIndicators && n[this.opts.subIndicatorsPos](this.$subArrow.clone())
                }
            },
            menuPosition: function (t) {
                var e, i, n = t.dataSM("parent-a"),
                    o = n.closest("li"),
                    s = o.parent(),
                    r = t.dataSM("level"),
                    a = this.getWidth(t),
                    l = this.getHeight(t),
                    u = n.offset(),
                    c = u.left,
                    h = u.top,
                    d = this.getWidth(n),
                    p = this.getHeight(n),
                    m = $(window),
                    f = m.scrollLeft(),
                    g = m.scrollTop(),
                    v = this.getViewportWidth(),
                    y = this.getViewportHeight(),
                    b = s.parent().is("[data-sm-horizontal-sub]") || 2 == r && !s.hasClass("sm-vertical"),
                    w = this.opts.rightToLeftSubMenus && !o.is("[data-sm-reverse]") || !this.opts.rightToLeftSubMenus && o.is("[data-sm-reverse]"),
                    x = 2 == r ? this.opts.mainMenuSubOffsetX : this.opts.subMenusSubOffsetX,
                    T = 2 == r ? this.opts.mainMenuSubOffsetY : this.opts.subMenusSubOffsetY;
                if (b ? (e = w ? d - a - x : x, i = this.opts.bottomToTopSubMenus ? -l - T : p + T) : (e = w ? x - a : d - x, i = this.opts.bottomToTopSubMenus ? p - T - l : T), this.opts.keepInViewport) {
                    var _ = c + e,
                        S = h + i;
                    if (w && f > _ ? e = b ? f - _ + e : d - x : !w && _ + a > f + v && (e = b ? f + v - a - _ + e : x - a), b || (y > l && S + l > g + y ? i += g + y - l - S : (l >= y || g > S) && (i += g - S)), b && (S + l > g + y + .49 || g > S) || !b && l > y + .49) {
                        var C = this;
                        t.dataSM("scroll-arrows") || t.dataSM("scroll-arrows", $([$('<span class="scroll-up"><span class="scroll-up-arrow"></span></span>')[0], $('<span class="scroll-down"><span class="scroll-down-arrow"></span></span>')[0]]).on({
                            mouseenter: function () {
                                t.dataSM("scroll").up = $(this).hasClass("scroll-up"), C.menuScroll(t)
                            },
                            mouseleave: function (e) {
                                C.menuScrollStop(t), C.menuScrollOut(t, e)
                            },
                            "mousewheel DOMMouseScroll": function (t) {
                                t.preventDefault()
                            }
                        }).insertAfter(t));
                        var k = ".smartmenus_scroll";
                        if (t.dataSM("scroll", {
                                y: this.cssTransforms3d ? 0 : i - p,
                                step: 1,
                                itemH: p,
                                subH: l,
                                arrowDownH: this.getHeight(t.dataSM("scroll-arrows").eq(1))
                            }).on(getEventsNS({
                                mouseover: function (e) {
                                    C.menuScrollOver(t, e)
                                },
                                mouseout: function (e) {
                                    C.menuScrollOut(t, e)
                                },
                                "mousewheel DOMMouseScroll": function (e) {
                                    C.menuScrollMousewheel(t, e)
                                }
                            }, k)).dataSM("scroll-arrows").css({
                                top: "auto",
                                left: "0",
                                marginLeft: e + (parseInt(t.css("border-left-width")) || 0),
                                width: a - (parseInt(t.css("border-left-width")) || 0) - (parseInt(t.css("border-right-width")) || 0),
                                zIndex: t.css("z-index")
                            }).eq(b && this.opts.bottomToTopSubMenus ? 0 : 1).show(), this.isFixed()) {
                            var A = {};
                            A[touchEvents ? "touchstart touchmove touchend" : "pointerdown pointermove pointerup MSPointerDown MSPointerMove MSPointerUp"] = function (e) {
                                C.menuScrollTouch(t, e)
                            }, t.css({
                                "touch-action": "none",
                                "-ms-touch-action": "none"
                            }).on(getEventsNS(A, k))
                        }
                    }
                }
                t.css({
                    top: "auto",
                    left: "0",
                    marginLeft: e,
                    marginTop: i - p
                })
            },
            menuScroll: function (t, e, i) {
                var n, o = t.dataSM("scroll"),
                    s = t.dataSM("scroll-arrows"),
                    r = o.up ? o.upEnd : o.downEnd;
                if (!e && o.momentum) {
                    if (o.momentum *= .92, n = o.momentum, .5 > n) return void this.menuScrollStop(t)
                } else n = i || (e || !this.opts.scrollAccelerate ? this.opts.scrollStep : Math.floor(o.step));
                var a = t.dataSM("level");
                if (this.activatedItems[a - 1] && this.activatedItems[a - 1].dataSM("sub") && this.activatedItems[a - 1].dataSM("sub").is(":visible") && this.menuHideSubMenus(a - 1), o.y = o.up && o.y >= r || !o.up && r >= o.y ? o.y : Math.abs(r - o.y) > n ? o.y + (o.up ? n : -n) : r, t.css(this.cssTransforms3d ? {
                        "-webkit-transform": "translate3d(0, " + o.y + "px, 0)",
                        transform: "translate3d(0, " + o.y + "px, 0)"
                    } : {
                        marginTop: o.y
                    }), mouse && (o.up && o.y > o.downEnd || !o.up && o.y < o.upEnd) && s.eq(o.up ? 1 : 0).show(), o.y == r) mouse && s.eq(o.up ? 0 : 1).hide(), this.menuScrollStop(t);
                else if (!e) {
                    this.opts.scrollAccelerate && o.step < this.opts.scrollStep && (o.step += .2);
                    var l = this;
                    this.scrollTimeout = requestAnimationFrame(function () {
                        l.menuScroll(t)
                    })
                }
            },
            menuScrollMousewheel: function (t, e) {
                if (this.getClosestMenu(e.target) == t[0]) {
                    e = e.originalEvent;
                    var i = (e.wheelDelta || -e.detail) > 0;
                    t.dataSM("scroll-arrows").eq(i ? 0 : 1).is(":visible") && (t.dataSM("scroll").up = i, this.menuScroll(t, !0))
                }
                e.preventDefault()
            },
            menuScrollOut: function (t, e) {
                mouse && (/^scroll-(up|down)/.test((e.relatedTarget || "").className) || (t[0] == e.relatedTarget || $.contains(t[0], e.relatedTarget)) && this.getClosestMenu(e.relatedTarget) == t[0] || t.dataSM("scroll-arrows").css("visibility", "hidden"))
            },
            menuScrollOver: function (t, e) {
                if (mouse && !/^scroll-(up|down)/.test(e.target.className) && this.getClosestMenu(e.target) == t[0]) {
                    this.menuScrollRefreshData(t);
                    var i = t.dataSM("scroll"),
                        n = $(window).scrollTop() - t.dataSM("parent-a").offset().top - i.itemH;
                    t.dataSM("scroll-arrows").eq(0).css("margin-top", n).end().eq(1).css("margin-top", n + this.getViewportHeight() - i.arrowDownH).end().css("visibility", "visible")
                }
            },
            menuScrollRefreshData: function (t) {
                var e = t.dataSM("scroll"),
                    i = $(window).scrollTop() - t.dataSM("parent-a").offset().top - e.itemH;
                this.cssTransforms3d && (i = -(parseFloat(t.css("margin-top")) - i)), $.extend(e, {
                    upEnd: i,
                    downEnd: i + this.getViewportHeight() - e.subH
                })
            },
            menuScrollStop: function (t) {
                return this.scrollTimeout ? (cancelAnimationFrame(this.scrollTimeout), this.scrollTimeout = 0, t.dataSM("scroll").step = 1, !0) : void 0
            },
            menuScrollTouch: function (t, e) {
                if (e = e.originalEvent, isTouchEvent(e)) {
                    var i = this.getTouchPoint(e);
                    if (this.getClosestMenu(i.target) == t[0]) {
                        var n = t.dataSM("scroll");
                        if (/(start|down)$/i.test(e.type)) this.menuScrollStop(t) ? (e.preventDefault(), this.$touchScrollingSub = t) : this.$touchScrollingSub = null, this.menuScrollRefreshData(t), $.extend(n, {
                            touchStartY: i.pageY,
                            touchStartTime: e.timeStamp
                        });
                        else if (/move$/i.test(e.type)) {
                            var o = void 0 !== n.touchY ? n.touchY : n.touchStartY;
                            if (void 0 !== o && o != i.pageY) {
                                this.$touchScrollingSub = t;
                                var s = i.pageY > o;
                                void 0 !== n.up && n.up != s && $.extend(n, {
                                    touchStartY: i.pageY,
                                    touchStartTime: e.timeStamp
                                }), $.extend(n, {
                                    up: s,
                                    touchY: i.pageY
                                }), this.menuScroll(t, !0, Math.abs(i.pageY - o))
                            }
                            e.preventDefault()
                        } else void 0 !== n.touchY && ((n.momentum = 15 * Math.pow(Math.abs(i.pageY - n.touchStartY) / (e.timeStamp - n.touchStartTime), 2)) && (this.menuScrollStop(t), this.menuScroll(t), e.preventDefault()), delete n.touchY)
                    }
                }
            },
            menuShow: function (t) {
                if ((t.dataSM("beforefirstshowfired") || (t.dataSM("beforefirstshowfired", !0), !1 !== this.$root.triggerHandler("beforefirstshow.smapi", t[0]))) && !1 !== this.$root.triggerHandler("beforeshow.smapi", t[0]) && (t.dataSM("shown-before", !0), canAnimate && t.stop(!0, !0), !t.is(":visible"))) {
                    var e = t.dataSM("parent-a"),
                        i = this.isCollapsible();
                    if ((this.opts.keepHighlighted || i) && e.addClass("highlighted"), i) t.removeClass("sm-nowrap").css({
                        zIndex: "",
                        width: "auto",
                        minWidth: "",
                        maxWidth: "",
                        top: "",
                        left: "",
                        marginLeft: "",
                        marginTop: ""
                    });
                    else {
                        if (t.css("z-index", this.zIndexInc = (this.zIndexInc || this.getStartZIndex()) + 1), (this.opts.subMenusMinWidth || this.opts.subMenusMaxWidth) && (t.css({
                                width: "auto",
                                minWidth: "",
                                maxWidth: ""
                            }).addClass("sm-nowrap"), this.opts.subMenusMinWidth && t.css("min-width", this.opts.subMenusMinWidth), this.opts.subMenusMaxWidth)) {
                            var n = this.getWidth(t);
                            t.css("max-width", this.opts.subMenusMaxWidth), n > this.getWidth(t) && t.removeClass("sm-nowrap").css("width", this.opts.subMenusMaxWidth)
                        }
                        this.menuPosition(t)
                    }
                    var o = function () {
                        t.css("overflow", "")
                    };
                    i ? canAnimate && this.opts.collapsibleShowFunction ? this.opts.collapsibleShowFunction.call(this, t, o) : t.show(this.opts.collapsibleShowDuration, o) : canAnimate && this.opts.showFunction ? this.opts.showFunction.call(this, t, o) : t.show(this.opts.showDuration, o), e.attr("aria-expanded", "true"), t.attr({
                        "aria-expanded": "true",
                        "aria-hidden": "false"
                    }), this.visibleSubMenus.push(t), this.$root.triggerHandler("show.smapi", t[0])
                }
            },
            popupHide: function (t) {
                this.hideTimeout && (clearTimeout(this.hideTimeout), this.hideTimeout = 0);
                var e = this;
                this.hideTimeout = setTimeout(function () {
                    e.menuHideAll()
                }, t ? 1 : this.opts.hideTimeout)
            },
            popupShow: function (t, e) {
                if (this.opts.isPopup) {
                    if (this.hideTimeout && (clearTimeout(this.hideTimeout), this.hideTimeout = 0), this.$root.dataSM("shown-before", !0), canAnimate && this.$root.stop(!0, !0), !this.$root.is(":visible")) {
                        this.$root.css({
                            left: t,
                            top: e
                        });
                        var i = this,
                            n = function () {
                                i.$root.css("overflow", "")
                            };
                        canAnimate && this.opts.showFunction ? this.opts.showFunction.call(this, this.$root, n) : this.$root.show(this.opts.showDuration, n), this.visibleSubMenus[0] = this.$root
                    }
                } else alert('SmartMenus jQuery Error:\n\nIf you want to show this menu via the "popupShow" method, set the isPopup:true option.')
            },
            refresh: function () {
                this.destroy(!0), this.init(!0)
            },
            rootKeyDown: function (t) {
                if (this.handleEvents()) switch (t.keyCode) {
                    case 27:
                        var e = this.activatedItems[0];
                        if (e) {
                            this.menuHideAll(), e[0].focus();
                            var i = e.dataSM("sub");
                            i && this.menuHide(i)
                        }
                        break;
                    case 32:
                        var n = $(t.target);
                        n.is("a") && this.handleItemEvents(n) && (i = n.dataSM("sub"), i && !i.is(":visible") && (this.itemClick({
                            currentTarget: t.target
                        }), t.preventDefault()))
                }
            },
            rootOut: function (t) {
                if (this.handleEvents() && !this.isTouchMode() && t.target != this.$root[0] && (this.hideTimeout && (clearTimeout(this.hideTimeout), this.hideTimeout = 0), !this.opts.showOnClick || !this.opts.hideOnClick)) {
                    var e = this;
                    this.hideTimeout = setTimeout(function () {
                        e.menuHideAll()
                    }, this.opts.hideTimeout)
                }
            },
            rootOver: function (t) {
                this.handleEvents() && !this.isTouchMode() && t.target != this.$root[0] && this.hideTimeout && (clearTimeout(this.hideTimeout), this.hideTimeout = 0)
            },
            winResize: function (t) {
                if (this.handleEvents()) {
                    if (!("onorientationchange" in window) || "orientationchange" == t.type) {
                        var e = this.isCollapsible();
                        this.wasCollapsible && e || (this.activatedItems.length && this.activatedItems[this.activatedItems.length - 1][0].blur(), this.menuHideAll()), this.wasCollapsible = e
                    }
                } else if (this.$disableOverlay) {
                    var i = this.$root.offset();
                    this.$disableOverlay.css({
                        top: i.top,
                        left: i.left,
                        width: this.$root.outerWidth(),
                        height: this.$root.outerHeight()
                    })
                }
            }
        }
    }), $.fn.dataSM = function (t, e) {
        return e ? this.data(t + "_smartmenus", e) : this.data(t + "_smartmenus")
    }, $.fn.removeDataSM = function (t) {
        return this.removeData(t + "_smartmenus")
    }, $.fn.smartmenus = function (options) {
        if ("string" == typeof options) {
            var args = arguments,
                method = options;
            return Array.prototype.shift.call(args), this.each(function () {
                var t = $(this).data("smartmenus");
                t && t[method] && t[method].apply(t, args)
            })
        }
        return this.each(function () {
            var dataOpts = $(this).data("sm-options") || null;
            if (dataOpts && "object" != typeof dataOpts) try {
                dataOpts = eval("(" + dataOpts + ")")
            } catch (t) {
                dataOpts = null, alert('ERROR\n\nSmartMenus jQuery init:\nInvalid "data-sm-options" attribute value syntax.')
            }
            new $.SmartMenus(this, $.extend({}, $.fn.smartmenus.defaults, options, dataOpts))
        })
    }, $.fn.smartmenus.defaults = {
        isPopup: !1,
        mainMenuSubOffsetX: 0,
        mainMenuSubOffsetY: 0,
        subMenusSubOffsetX: 0,
        subMenusSubOffsetY: 0,
        subMenusMinWidth: "10rem",
        subMenusMaxWidth: "25rem",
        subIndicators: !0,
        subIndicatorsPos: "append",
        subIndicatorsText: "",
        scrollStep: 30,
        scrollAccelerate: !0,
        showTimeout: 200,
        hideTimeout: 200,
        showDuration: 0,
        showFunction: null,
        hideDuration: 0,
        hideFunction: function (t, e) {
            t.fadeOut(200, e)
        },
        collapsibleShowDuration: 0,
        collapsibleShowFunction: function (t, e) {
            t.slideDown(200, e)
        },
        collapsibleHideDuration: 0,
        collapsibleHideFunction: function (t, e) {
            t.slideUp(200, e)
        },
        showOnClick: !1,
        hideOnClick: !0,
        noMouseOver: !1,
        keepInViewport: !0,
        keepHighlighted: !0,
        markCurrentItem: !1,
        markCurrentTree: !0,
        rightToLeftSubMenus: !1,
        bottomToTopSubMenus: !1,
        collapsibleBehavior: "link"
    }, $
}),
function (t) {
    "function" == typeof define && define.amd ? define(["jquery", "smartmenus"], t) : "object" == typeof module && "object" == typeof module.exports ? module.exports = t(require("jquery")) : t(jQuery)
}(function (t) {
    return t.extend(t.SmartMenus.Bootstrap = {}, {
        keydownFix: !1,
        init: function () {
            var e = t("ul.navbar-nav:not([data-sm-skip])");
            e.each(function () {
                var e = t(this),
                    i = e.data("smartmenus");
                if (!i) {
                    var n, o = e.is("[data-sm-skip-collapsible-behavior]"),
                        s = e.hasClass("ml-auto") || e.prevAll(".mr-auto").length > 0;

                    function r() {
                        e.find("a.current").each(function () {
                            var e = t(this);
                            (e.hasClass("dropdown-item") ? e : e.parent()).addClass("active")
                        }), e.find("a.has-submenu").each(function () {
                            var e = t(this);
                            e.is('[data-toggle="dropdown"]') && e.dataSM("bs-data-toggle-dropdown", !0).removeAttr("data-toggle"), !o && e.hasClass("dropdown-toggle") && e.dataSM("bs-dropdown-toggle", !0).removeClass("dropdown-toggle")
                        })
                    }

                    function a() {
                        e.find("a.current").each(function () {
                            var e = t(this);
                            (e.hasClass("active") ? e : e.parent()).removeClass("active")
                        }), e.find("a.has-submenu").each(function () {
                            var e = t(this);
                            e.dataSM("bs-dropdown-toggle") && e.addClass("dropdown-toggle").removeDataSM("bs-dropdown-toggle"), e.dataSM("bs-data-toggle-dropdown") && e.attr("data-toggle", "dropdown").removeDataSM("bs-data-toggle-dropdown")
                        })
                    }

                    function l(t) {
                        var o = i.getViewportWidth();
                        (o != n || t) && (i.isCollapsible() ? e.addClass("sm-collapsible") : e.removeClass("sm-collapsible"), n = o)
                    }
                    e.smartmenus({
                        subMenusSubOffsetX: -8,
                        subMenusSubOffsetY: 0,
                        subIndicators: !o,
                        collapsibleShowFunction: null,
                        collapsibleHideFunction: null,
                        rightToLeftSubMenus: s,
                        bottomToTopSubMenus: e.closest(".fixed-bottom").length > 0,
                        bootstrapHighlightClasses: ""
                    }).on({
                        "show.smapi": function (e, n) {
                            var o = t(n),
                                s = o.dataSM("scroll-arrows");
                            s && s.css("background-color", o.css("background-color")), o.parent().addClass("show"), i.opts.keepHighlighted && o.dataSM("level") > 2 && o.prevAll("a").addClass(i.opts.bootstrapHighlightClasses)
                        },
                        "hide.smapi": function (e, n) {
                            var o = t(n);
                            o.parent().removeClass("show"), i.opts.keepHighlighted && o.dataSM("level") > 2 && o.prevAll("a").removeClass(i.opts.bootstrapHighlightClasses)
                        }
                    }), i = e.data("smartmenus"), r(), i.refresh = function () {
                        t.SmartMenus.prototype.refresh.call(this), r(), l(!0)
                    }, i.destroy = function (e) {
                        a(), t.SmartMenus.prototype.destroy.call(this, e)
                    }, o && (i.opts.collapsibleBehavior = "toggle"), l(), t(window).on("resize.smartmenus" + i.rootId, l)
                }
            }), e.length && !t.SmartMenus.Bootstrap.keydownFix && (t(document).off("keydown.bs.dropdown.data-api", ".dropdown-menu"), t.fn.dropdown && t.fn.dropdown.Constructor && "function" == typeof t.fn.dropdown.Constructor._dataApiKeydownHandler && t(document).on("keydown.bs.dropdown.data-api", ".dropdown-menu.show", t.fn.dropdown.Constructor._dataApiKeydownHandler), t.SmartMenus.Bootstrap.keydownFix = !0)
        }
    }), t(t.SmartMenus.Bootstrap.init), t
}),
function (t, e) {
    "function" == typeof define && define.amd ? define([], function () {
        return e()
    }) : "object" == typeof exports ? module.exports = e() : t.Headhesive = e()
}(this, function () {
    "use strict";
    var t = function (e, i) {
            for (var n in i) i.hasOwnProperty(n) && (e[n] = "object" == typeof i[n] ? t(e[n], i[n]) : i[n]);
            return e
        },
        e = function (t, e) {
            var i, n, o, s = Date.now || function () {
                    return (new Date).getTime()
                },
                r = null,
                a = 0,
                l = function () {
                    a = s(), r = null, o = t.apply(i, n), i = n = null
                };
            return function () {
                var u = s(),
                    c = e - (u - a);
                return i = this, n = arguments, 0 >= c ? (clearTimeout(r), r = null, a = u, o = t.apply(i, n), i = n = null) : r || (r = setTimeout(l, c)), o
            }
        },
        i = function () {
            return void 0 !== window.pageYOffset ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
        },
        n = function (t, e) {
            for (var i = 0, n = t.offsetHeight; t;) i += t.offsetTop, t = t.offsetParent;
            return "bottom" === e && (i += n), i
        },
        o = function (e, i) {
            "querySelector" in document && "addEventListener" in window && (this.visible = !1, this.options = {
                offset: 300,
                offsetSide: "top",
                classes: {
                    clone: "headhesive",
                    stick: "headhesive--stick",
                    unstick: "headhesive--unstick"
                },
                throttle: 250,
                onInit: function () {},
                onStick: function () {},
                onUnstick: function () {},
                onDestroy: function () {}
            }, this.elem = "string" == typeof e ? document.querySelector(e) : e, this.options = t(this.options, i), this.init())
        };
    return o.prototype = {
        constructor: o,
        init: function () {
            if (this.clonedElem = this.elem.cloneNode(!0), this.clonedElem.className += " " + this.options.classes.clone, document.body.insertBefore(this.clonedElem, document.body.firstChild), "number" == typeof this.options.offset) this.scrollOffset = this.options.offset;
            else {
                if ("string" != typeof this.options.offset) throw new Error("Invalid offset: " + this.options.offset);
                this._setScrollOffset()
            }
            this._throttleUpdate = e(this.update.bind(this), this.options.throttle), this._throttleScrollOffset = e(this._setScrollOffset.bind(this), this.options.throttle), window.addEventListener("scroll", this._throttleUpdate, !1), window.addEventListener("resize", this._throttleScrollOffset, !1), this.options.onInit.call(this)
        },
        _setScrollOffset: function () {
            "string" == typeof this.options.offset && (this.scrollOffset = n(document.querySelector(this.options.offset), this.options.offsetSide))
        },
        destroy: function () {
            document.body.removeChild(this.clonedElem), window.removeEventListener("scroll", this._throttleUpdate), window.removeEventListener("resize", this._throttleScrollOffset), this.options.onDestroy.call(this)
        },
        stick: function () {
            this.visible || (this.clonedElem.className = this.clonedElem.className.replace(new RegExp("(^|\\s)*" + this.options.classes.unstick + "(\\s|$)*", "g"), ""), this.clonedElem.className += " " + this.options.classes.stick, this.visible = !0, this.options.onStick.call(this))
        },
        unstick: function () {
            this.visible && (this.clonedElem.className = this.clonedElem.className.replace(new RegExp("(^|\\s)*" + this.options.classes.stick + "(\\s|$)*", "g"), ""), this.clonedElem.className += " " + this.options.classes.unstick, this.visible = !1, this.options.onUnstick.call(this))
        },
        update: function () {
            i() > this.scrollOffset ? this.stick() : this.unstick()
        }
    }, o
}),
function (t) {
    var e = navigator.userAgent;
    t.HTMLPictureElement && /ecko/.test(e) && e.match(/rv\:(\d+)/) && RegExp.$1 < 45 && addEventListener("resize", function () {
        var e, i = document.createElement("source"),
            n = function (t) {
                var e, n, o = t.parentNode;
                "PICTURE" === o.nodeName.toUpperCase() ? (e = i.cloneNode(), o.insertBefore(e, o.firstElementChild), setTimeout(function () {
                    o.removeChild(e)
                })) : (!t._pfLastSize || t.offsetWidth > t._pfLastSize) && (t._pfLastSize = t.offsetWidth, n = t.sizes, t.sizes += ",100vw", setTimeout(function () {
                    t.sizes = n
                }))
            },
            o = function () {
                var t, e = document.querySelectorAll("picture > img, img[srcset][sizes]");
                for (t = 0; t < e.length; t++) n(e[t])
            },
            s = function () {
                clearTimeout(e), e = setTimeout(o, 99)
            },
            r = t.matchMedia && matchMedia("(orientation: landscape)"),
            a = function () {
                s(), r && r.addListener && r.addListener(s)
            };
        return i.srcset = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", /^[c|i]|d$/.test(document.readyState || "") ? a() : document.addEventListener("DOMContentLoaded", a), s
    }())
}(window),
function (t, e, i) {
    "use strict";

    function n(t) {
        return " " === t || "\t" === t || "\n" === t || "\f" === t || "\r" === t
    }

    function o(e, i) {
        var n = new t.Image;
        return n.onerror = function () {
            $[e] = !1, tt()
        }, n.onload = function () {
            $[e] = 1 === n.width, tt()
        }, n.src = i, "pending"
    }

    function s() {
        D = !1, H = t.devicePixelRatio, q = {}, N = {}, v.DPR = H || 1, F.width = Math.max(t.innerWidth || 0, S.clientWidth), F.height = Math.max(t.innerHeight || 0, S.clientHeight), F.vw = F.width / 100, F.vh = F.height / 100, g = [F.height, F.width, H].join("-"), F.em = v.getEmValue(), F.rem = F.em
    }

    function r(t, e, i, n) {
        var o, s, r, a;
        return "saveData" === C.algorithm ? t > 2.7 ? a = i + 1 : (s = e - i, o = Math.pow(t - .6, 1.5), r = s * o, n && (r += .1 * o), a = t + r) : a = i > 1 ? Math.sqrt(t * e) : t, a > i
    }

    function a(t) {
        var e, i = v.getSet(t),
            n = !1;
        "pending" !== i && (n = g, i && (e = v.setRes(i), v.applySetCandidate(e, t))), t[v.ns].evaled = n
    }

    function l(t, e) {
        return t.res - e.res
    }

    function u(t, e, i) {
        var n;
        return !i && e && (i = t[v.ns].sets, i = i && i[i.length - 1]), n = c(e, i), n && (e = v.makeUrl(e), t[v.ns].curSrc = e, t[v.ns].curCan = n, n.res || J(n, n.set.sizes)), n
    }

    function c(t, e) {
        var i, n, o;
        if (t && e)
            for (o = v.parseSet(e), t = v.makeUrl(t), i = 0; i < o.length; i++)
                if (t === v.makeUrl(o[i].url)) {
                    n = o[i];
                    break
                } return n
    }

    function h(t, e) {
        var i, n, o, s, r = t.getElementsByTagName("source");
        for (i = 0, n = r.length; n > i; i++) o = r[i], o[v.ns] = !0, s = o.getAttribute("srcset"), s && e.push({
            srcset: s,
            media: o.getAttribute("media"),
            type: o.getAttribute("type"),
            sizes: o.getAttribute("sizes")
        })
    }

    function d(t, e) {
        function i(e) {
            var i, n = e.exec(t.substring(d));
            return n ? (i = n[0], d += i.length, i) : void 0
        }

        function o() {
            var t, i, n, o, s, l, u, c, h, d = !1,
                m = {};
            for (o = 0; o < a.length; o++) s = a[o], l = s[s.length - 1], u = s.substring(0, s.length - 1), c = parseInt(u, 10), h = parseFloat(u), Q.test(u) && "w" === l ? ((t || i) && (d = !0), 0 === c ? d = !0 : t = c) : G.test(u) && "x" === l ? ((t || i || n) && (d = !0), 0 > h ? d = !0 : i = h) : Q.test(u) && "h" === l ? ((n || i) && (d = !0), 0 === c ? d = !0 : n = c) : d = !0;
            d || (m.url = r, t && (m.w = t), i && (m.d = i), n && (m.h = n), n || i || t || (m.d = 1), 1 === m.d && (e.has1x = !0), m.set = e, p.push(m))
        }

        function s() {
            for (i(B), l = "", u = "in descriptor";;) {
                if (c = t.charAt(d), "in descriptor" === u)
                    if (n(c)) l && (a.push(l), l = "", u = "after descriptor");
                    else {
                        if ("," === c) return d += 1, l && a.push(l), void o();
                        if ("(" === c) l += c, u = "in parens";
                        else {
                            if ("" === c) return l && a.push(l), void o();
                            l += c
                        }
                    }
                else if ("in parens" === u)
                    if (")" === c) l += c, u = "in descriptor";
                    else {
                        if ("" === c) return a.push(l), void o();
                        l += c
                    }
                else if ("after descriptor" === u)
                    if (n(c));
                    else {
                        if ("" === c) return void o();
                        u = "in descriptor", d -= 1
                    } d += 1
            }
        }
        for (var r, a, l, u, c, h = t.length, d = 0, p = [];;) {
            if (i(V), d >= h) return p;
            r = i(U), a = [], "," === r.slice(-1) ? (r = r.replace(Y, ""), o()) : s()
        }
    }

    function p(t) {
        function e(t) {
            function e() {
                s && (r.push(s), s = "")
            }

            function i() {
                r[0] && (a.push(r), r = [])
            }
            for (var o, s = "", r = [], a = [], l = 0, u = 0, c = !1;;) {
                if (o = t.charAt(u), "" === o) return e(), i(), a;
                if (c) {
                    if ("*" === o && "/" === t[u + 1]) {
                        c = !1, u += 2, e();
                        continue
                    }
                    u += 1
                } else {
                    if (n(o)) {
                        if (t.charAt(u - 1) && n(t.charAt(u - 1)) || !s) {
                            u += 1;
                            continue
                        }
                        if (0 === l) {
                            e(), u += 1;
                            continue
                        }
                        o = " "
                    } else if ("(" === o) l += 1;
                    else if (")" === o) l -= 1;
                    else {
                        if ("," === o) {
                            e(), i(), u += 1;
                            continue
                        }
                        if ("/" === o && "*" === t.charAt(u + 1)) {
                            c = !0, u += 2;
                            continue
                        }
                    }
                    s += o, u += 1
                }
            }
        }

        function i(t) {
            return !!(c.test(t) && parseFloat(t) >= 0) || !!h.test(t) || "0" === t || "-0" === t || "+0" === t
        }
        var o, s, r, a, l, u, c = /^(?:[+-]?[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?(?:ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmin|vmax|vw)$/i,
            h = /^calc\((?:[0-9a-z \.\+\-\*\/\(\)]+)\)$/i;
        for (s = e(t), r = s.length, o = 0; r > o; o++)
            if (a = s[o], l = a[a.length - 1], i(l)) {
                if (u = l, a.pop(), 0 === a.length) return u;
                if (a = a.join(" "), v.matchesMedia(a)) return u
            } return "100vw"
    }
    e.createElement("picture");
    var m, f, g, v = {},
        y = !1,
        b = function () {},
        w = e.createElement("img"),
        x = w.getAttribute,
        T = w.setAttribute,
        _ = w.removeAttribute,
        S = e.documentElement,
        $ = {},
        C = {
            algorithm: ""
        },
        k = "data-pfsrc",
        A = k + "set",
        E = navigator.userAgent,
        M = /rident/.test(E) || /ecko/.test(E) && E.match(/rv\:(\d+)/) && RegExp.$1 > 35,
        I = "currentSrc",
        O = /\s+\+?\d+(e\d+)?w/,
        P = /(\([^)]+\))?\s*(.+)/,
        j = t.picturefillCFG,
        z = "position:absolute;left:0;visibility:hidden;display:block;padding:0;border:none;font-size:1em;width:1em;overflow:hidden;clip:rect(0px, 0px, 0px, 0px)",
        L = "font-size:100%!important;",
        D = !0,
        q = {},
        N = {},
        H = t.devicePixelRatio,
        F = {
            px: 1,
            in: 96
        },
        W = e.createElement("a"),
        R = !1,
        B = /^[ \t\n\r\u000c]+/,
        V = /^[, \t\n\r\u000c]+/,
        U = /^[^ \t\n\r\u000c]+/,
        Y = /[,]+$/,
        Q = /^\d+$/,
        G = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/,
        X = function (t, e, i, n) {
            t.addEventListener ? t.addEventListener(e, i, n || !1) : t.attachEvent && t.attachEvent("on" + e, i)
        },
        K = function (t) {
            var e = {};
            return function (i) {
                return i in e || (e[i] = t(i)), e[i]
            }
        },
        Z = function () {
            var t = /^([\d\.]+)(em|vw|px)$/,
                e = function () {
                    for (var t = arguments, e = 0, i = t[0]; ++e in t;) i = i.replace(t[e], t[++e]);
                    return i
                },
                i = K(function (t) {
                    return "return " + e((t || "").toLowerCase(), /\band\b/g, "&&", /,/g, "||", /min-([a-z-\s]+):/g, "e.$1>=", /max-([a-z-\s]+):/g, "e.$1<=", /calc([^)]+)/g, "($1)", /(\d+[\.]*[\d]*)([a-z]+)/g, "($1 * e.$2)", /^(?!(e.[a-z]|[0-9\.&=|><\+\-\*\(\)\/])).*/gi, "") + ";"
                });
            return function (e, n) {
                var o;
                if (!(e in q))
                    if (q[e] = !1, n && (o = e.match(t))) q[e] = o[1] * F[o[2]];
                    else try {
                        q[e] = new Function("e", i(e))(F)
                    } catch (t) {}
                return q[e]
            }
        }(),
        J = function (t, e) {
            return t.w ? (t.cWidth = v.calcListLength(e || "100vw"), t.res = t.w / t.cWidth) : t.res = t.d, t
        },
        tt = function (t) {
            if (y) {
                var i, n, o, s = t || {};
                if (s.elements && 1 === s.elements.nodeType && ("IMG" === s.elements.nodeName.toUpperCase() ? s.elements = [s.elements] : (s.context = s.elements, s.elements = null)), i = s.elements || v.qsa(s.context || e, s.reevaluate || s.reselect ? v.sel : v.selShort), o = i.length) {
                    for (v.setupRun(s), R = !0, n = 0; o > n; n++) v.fillImg(i[n], s);
                    v.teardownRun(s)
                }
            }
        };
    t.console && console.warn, I in w || (I = "src"), $["image/jpeg"] = !0, $["image/gif"] = !0, $["image/png"] = !0, $["image/svg+xml"] = e.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1"), v.ns = ("pf" + (new Date).getTime()).substr(0, 9), v.supSrcset = "srcset" in w, v.supSizes = "sizes" in w, v.supPicture = !!t.HTMLPictureElement, v.supSrcset && v.supPicture && !v.supSizes && function (t) {
        w.srcset = "data:,a", t.src = "data:,a", v.supSrcset = w.complete === t.complete, v.supPicture = v.supSrcset && v.supPicture
    }(e.createElement("img")), v.supSrcset && !v.supSizes ? function () {
        var t = "data:image/gif;base64,R0lGODlhAgABAPAAAP///wAAACH5BAAAAAAALAAAAAACAAEAAAICBAoAOw==",
            i = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
            n = e.createElement("img"),
            o = function () {
                var t = n.width;
                2 === t && (v.supSizes = !0), f = v.supSrcset && !v.supSizes, y = !0, setTimeout(tt)
            };
        n.onload = o, n.onerror = o, n.setAttribute("sizes", "9px"), n.srcset = i + " 1w," + t + " 9w", n.src = i
    }() : y = !0, v.selShort = "picture>img,img[srcset]", v.sel = v.selShort, v.cfg = C, v.DPR = H || 1, v.u = F, v.types = $, v.setSize = b, v.makeUrl = K(function (t) {
        return W.href = t, W.href
    }), v.qsa = function (t, e) {
        return "querySelector" in t ? t.querySelectorAll(e) : []
    }, v.matchesMedia = function () {
        return t.matchMedia && (matchMedia("(min-width: 0.1em)") || {}).matches ? v.matchesMedia = function (t) {
            return !t || matchMedia(t).matches
        } : v.matchesMedia = v.mMQ, v.matchesMedia.apply(this, arguments)
    }, v.mMQ = function (t) {
        return !t || Z(t)
    }, v.calcLength = function (t) {
        var e = Z(t, !0) || !1;
        return 0 > e && (e = !1), e
    }, v.supportsType = function (t) {
        return !t || $[t]
    }, v.parseSize = K(function (t) {
        var e = (t || "").match(P);
        return {
            media: e && e[1],
            length: e && e[2]
        }
    }), v.parseSet = function (t) {
        return t.cands || (t.cands = d(t.srcset, t)), t.cands
    }, v.getEmValue = function () {
        var t;
        if (!m && (t = e.body)) {
            var i = e.createElement("div"),
                n = S.style.cssText,
                o = t.style.cssText;
            i.style.cssText = z, S.style.cssText = L, t.style.cssText = L, t.appendChild(i), m = i.offsetWidth, t.removeChild(i), m = parseFloat(m, 10), S.style.cssText = n, t.style.cssText = o
        }
        return m || 16
    }, v.calcListLength = function (t) {
        if (!(t in N) || C.uT) {
            var e = v.calcLength(p(t));
            N[t] = e || F.width
        }
        return N[t]
    }, v.setRes = function (t) {
        var e;
        if (t) {
            e = v.parseSet(t);
            for (var i = 0, n = e.length; n > i; i++) J(e[i], t.sizes)
        }
        return e
    }, v.setRes.res = J, v.applySetCandidate = function (t, e) {
        if (t.length) {
            var i, n, o, s, a, c, h, d, p, m = e[v.ns],
                f = v.DPR;
            if (c = m.curSrc || e[I], h = m.curCan || u(e, c, t[0].set), h && h.set === t[0].set && (p = M && !e.complete && h.res - .1 > f, p || (h.cached = !0, h.res >= f && (a = h))), !a)
                for (t.sort(l), s = t.length, a = t[s - 1], n = 0; s > n; n++)
                    if (i = t[n], i.res >= f) {
                        o = n - 1, a = t[o] && (p || c !== v.makeUrl(i.url)) && r(t[o].res, i.res, f, t[o].cached) ? t[o] : i;
                        break
                    } a && (d = v.makeUrl(a.url), m.curSrc = d, m.curCan = a, d !== c && v.setSrc(e, a), v.setSize(e))
        }
    }, v.setSrc = function (t, e) {
        var i;
        t.src = e.url, "image/svg+xml" === e.set.type && (i = t.style.width, t.style.width = t.offsetWidth + 1 + "px", t.offsetWidth + 1 && (t.style.width = i))
    }, v.getSet = function (t) {
        var e, i, n, o = !1,
            s = t[v.ns].sets;
        for (e = 0; e < s.length && !o; e++)
            if (i = s[e], i.srcset && v.matchesMedia(i.media) && (n = v.supportsType(i.type))) {
                "pending" === n && (i = n), o = i;
                break
            } return o
    }, v.parseSets = function (t, e, n) {
        var o, s, r, a, l = e && "PICTURE" === e.nodeName.toUpperCase(),
            u = t[v.ns];
        (u.src === i || n.src) && (u.src = x.call(t, "src"), u.src ? T.call(t, k, u.src) : _.call(t, k)), (u.srcset === i || n.srcset || !v.supSrcset || t.srcset) && (o = x.call(t, "srcset"), u.srcset = o, a = !0), u.sets = [], l && (u.pic = !0, h(e, u.sets)), u.srcset ? (s = {
            srcset: u.srcset,
            sizes: x.call(t, "sizes")
        }, u.sets.push(s), r = (f || u.src) && O.test(u.srcset || ""), r || !u.src || c(u.src, s) || s.has1x || (s.srcset += ", " + u.src, s.cands.push({
            url: u.src,
            d: 1,
            set: s
        }))) : u.src && u.sets.push({
            srcset: u.src,
            sizes: null
        }), u.curCan = null, u.curSrc = i, u.supported = !(l || s && !v.supSrcset || r && !v.supSizes), a && v.supSrcset && !u.supported && (o ? (T.call(t, A, o), t.srcset = "") : _.call(t, A)), u.supported && !u.srcset && (!u.src && t.src || t.src !== v.makeUrl(u.src)) && (null === u.src ? t.removeAttribute("src") : t.src = u.src), u.parsed = !0
    }, v.fillImg = function (t, e) {
        var i, n = e.reselect || e.reevaluate;
        t[v.ns] || (t[v.ns] = {}), i = t[v.ns], (n || i.evaled !== g) && ((!i.parsed || e.reevaluate) && v.parseSets(t, t.parentNode, e), i.supported ? i.evaled = g : a(t))
    }, v.setupRun = function () {
        (!R || D || H !== t.devicePixelRatio) && s()
    }, v.supPicture ? (tt = b, v.fillImg = b) : function () {
        var i, n = t.attachEvent ? /d$|^c/ : /d$|^c|^i/,
            o = function () {
                var t = e.readyState || "";
                s = setTimeout(o, "loading" === t ? 200 : 999), e.body && (v.fillImgs(), i = i || n.test(t), i && clearTimeout(s))
            },
            s = setTimeout(o, e.body ? 9 : 99),
            r = function (t, e) {
                var i, n, o = function () {
                    var s = new Date - n;
                    e > s ? i = setTimeout(o, e - s) : (i = null, t())
                };
                return function () {
                    n = new Date, i || (i = setTimeout(o, e))
                }
            },
            a = S.clientHeight,
            l = function () {
                D = Math.max(t.innerWidth || 0, S.clientWidth) !== F.width || S.clientHeight !== a, a = S.clientHeight, D && v.fillImgs()
            };
        X(t, "resize", r(l, 99)), X(e, "readystatechange", o)
    }(), v.picturefill = tt, v.fillImgs = tt, v.teardownRun = b, tt._ = v, t.picturefillCFG = {
        pf: v,
        push: function (t) {
            var e = t.shift();
            "function" == typeof v[e] ? v[e].apply(v, t) : (C[e] = t[0], R && v.fillImgs({
                reselect: !0
            }))
        }
    };
    for (; j && j.length;) t.picturefillCFG.push(j.shift());
    t.picturefill = tt, "object" == typeof module && "object" == typeof module.exports ? module.exports = tt : "function" == typeof define && define.amd && define("picturefill", function () {
        return tt
    }), v.supPicture || ($["image/webp"] = o("image/webp", "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA=="))
}(window, document),
function (t) {
    t.fn.hmbrgr = function (e) {
        function i(e) {
            t(e).css({
                width: a.width,
                height: a.height
            }).html("<span /><span /><span />").find("span").css({
                position: "absolute",
                width: "100%",
                height: a.barHeight,
                "border-radius": a.barRadius,
                "background-color": a.barColor,
                "transition-duration": a.speed + "ms"
            }), n(e), t.isFunction(a.onInit) && a.onInit.call(this)
        }

        function n(e) {
            t(e).data("clickable", !0).find("span").eq(0).css({
                top: l
            }), t(e).find("span").eq(1).css({
                top: u
            }), t(e).find("span").eq(2).css({
                top: c
            })
        }

        function o(e) {
            t(e).on("click", function (i) {
                i.preventDefault(), t(this).data("clickable") && (t(this).data("clickable", !1), t(e).toggleClass("cross"), t(e).hasClass("cross") ? s(e) : r(e))
            })
        }

        function s(e) {
            t(e).find("span").css({
                top: u
            }), setTimeout(function () {
                t(e).addClass(a.animation).data("clickable", !0), t.isFunction(a.onOpen) && a.onOpen.call(this)
            }, a.speed)
        }

        function r(e) {
            t(e).removeClass(a.animation), setTimeout(function () {
                n(e), t.isFunction(a.onClose) && a.onClose.call(this)
            }, a.speed)
        }
        var a = t.extend({
                width: 60,
                height: 50,
                speed: 200,
                barHeight: 8,
                barRadius: 0,
                barColor: "#ffffff",
                animation: "expand",
                onInit: null,
                onOpen: null,
                onClose: null
            }, e),
            l = 0,
            u = a.height / 2 - a.barHeight / 2,
            c = a.height - a.barHeight;
        return this.each(function () {
            i(this), o(this)
        })
    }
}(jQuery),
function (t, e) {
    function i(t) {
        return (f = f || new XMLSerializer).serializeToString(t)
    }

    function n(t, e) {
        var i, n, o, s, r = k + N++,
            a = /url\("?#([a-zA-Z][\w:.-]*)"?\)/g,
            l = t.querySelectorAll("[id]"),
            u = e ? [] : $,
            c = {},
            h = [],
            d = !1;
        if (l[b]) {
            for (o = 0; o < l[b]; o++)(n = l[o].localName) in L && (c[n] = 1);
            for (n in c)(L[n] || [n]).forEach(function (t) {
                h.indexOf(t) < 0 && h.push(t)
            });
            h[b] && h.push(w);
            var p, m, f, g = t[y]("*"),
                v = t;
            for (o = -1; v != $;) {
                if (v.localName == w)(f = (m = v.textContent) && m.replace(a, function (t, e) {
                    return u && (u[e] = 1), "url(#" + e + r + ")"
                })) !== m && (v.textContent = f);
                else if (v.hasAttributes()) {
                    for (s = 0; s < h[b]; s++) p = h[s], (f = (m = v[S](p)) && m.replace(a, function (t, e) {
                        return u && (u[e] = 1), "url(#" + e + r + ")"
                    })) !== m && v[_](p, f);
                    ["xlink:href", "href"].forEach(function (t) {
                        var e = v[S](t);
                        /^\s*#/.test(e) && (e = e.trim(), v[_](t, e + r), u && (u[e.substring(1)] = 1))
                    })
                }
                v = g[++o]
            }
            for (o = 0; o < l[b]; o++) i = l[o], u && !u[i.id] || (i.id += r, d = !0)
        }
        return d
    }

    function o(t, i, n, o) {
        if (i) {
            i[_]("data-inject-url", n);
            var s = t.parentNode;
            if (s) {
                o.copyAttributes && function (t, i) {
                    for (var n, o, s, r = t.attributes, a = 0; a < r[b]; a++)
                        if (o = (n = r[a]).name, -1 == O.indexOf(o))
                            if (s = n.value, o == x) {
                                var l, u = i.firstElementChild;
                                u && u.localName.toLowerCase() == x ? l = u : (l = e[v + "NS"]("http://www.w3.org/2000/svg", x), i.insertBefore(l, u)), l.textContent = s
                            } else i[_](o, s)
                }(t, i);
                var r = o.beforeInject,
                    l = r && r(t, i) || i;
                s.replaceChild(l, t), t[C] = D, a(t);
                var u = o.afterInject;
                u && u(t, l)
            }
        } else c(t, o)
    }

    function s() {
        for (var t = {}, e = arguments, i = 0; i < e[b]; i++) {
            var n = e[i];
            for (var o in n) n.hasOwnProperty(o) && (t[o] = n[o])
        }
        return t
    }

    function r(t, i) {
        if (i) {
            var n;
            try {
                n = function (t) {
                    return (g = g || new DOMParser).parseFromString(t, "text/xml")
                }(t)
            } catch (t) {
                return $
            }
            return n[y]("parsererror")[b] ? $ : n.documentElement
        }
        var o = e.createElement("div");
        return o.innerHTML = t, o.firstElementChild
    }

    function a(t) {
        t.removeAttribute("onload")
    }

    function l(t) {
        console.error("SVGInject: " + t)
    }

    function u(t, e, i) {
        t[C] = q, i.onFail ? i.onFail(t, e) : l(e)
    }

    function c(t, e) {
        a(t), u(t, I, e)
    }

    function h(t, e) {
        a(t), u(t, M, e)
    }

    function d(t, e) {
        u(t, E, e)
    }

    function p(t) {
        t.onload = $, t.onerror = $
    }

    function m(t) {
        l("no img element")
    }
    var f, g, v = "createElement",
        y = "getElementsByTagName",
        b = "length",
        w = "style",
        x = "title",
        T = "undefined",
        _ = "setAttribute",
        S = "getAttribute",
        $ = null,
        C = "__svgInject",
        k = "--inject-",
        A = new RegExp(k + "\\d+", "g"),
        E = "LOAD_FAIL",
        M = "SVG_NOT_SUPPORTED",
        I = "SVG_INVALID",
        O = ["src", "alt", "onload", "onerror"],
        P = e[v]("a"),
        j = typeof SVGRect != T,
        z = {
            useCache: !0,
            copyAttributes: !0,
            makeIdsUnique: !0
        },
        L = {
            clipPath: ["clip-path"],
            "color-profile": $,
            cursor: $,
            filter: $,
            linearGradient: ["fill", "stroke"],
            marker: ["marker", "marker-end", "marker-mid", "marker-start"],
            mask: $,
            pattern: ["fill", "stroke"],
            radialGradient: ["fill", "stroke"]
        },
        D = 1,
        q = 2,
        N = 1,
        H = function l(u, f) {
            function g(t, e) {
                e = s(_, e);
                var i = function (i) {
                    var n = function () {
                        var t = e.onAllFinish;
                        t && t(), i && i()
                    };
                    if (t && typeof t[b] != T) {
                        var o = 0,
                            s = t[b];
                        if (0 == s) n();
                        else
                            for (var r = function () {
                                    ++o == s && n()
                                }, a = 0; a < s; a++) x(t[a], e, r)
                    } else x(t, e, n)
                };
                return typeof Promise == T ? i() : new Promise(i)
            }

            function x(t, e, s) {
                if (t) {
                    var a = t[C];
                    if (a) Array.isArray(a) ? a.push(s) : s();
                    else {
                        if (p(t), !j) return h(t, e), void s();
                        var l = e.beforeLoad,
                            u = l && l(t) || t[S]("src");
                        if (!u) return "" === u && d(t, e), void s();
                        var f = [];
                        t[C] = f;
                        var g = function () {
                                s(), f.forEach(function (t) {
                                    t()
                                })
                            },
                            v = function (t) {
                                return P.href = t, P.href
                            }(u),
                            y = e.useCache,
                            b = e.makeIdsUnique,
                            w = function (t) {
                                y && (M[v].forEach(function (e) {
                                    e(t)
                                }), M[v] = t)
                            };
                        if (y) {
                            var x, _ = function (s) {
                                if (s === E) d(t, e);
                                else if (s === I) c(t, e);
                                else {
                                    var a, l = s[0],
                                        u = s[1],
                                        h = s[2];
                                    b && (l === $ ? (l = n(a = r(u, !1), !1), s[0] = l, s[2] = l && i(a)) : l && (u = function (t) {
                                        return t.replace(A, k + N++)
                                    }(h))), a = a || r(u, !1), o(t, a, v, e)
                                }
                                g()
                            };
                            if (typeof (x = M[v]) != T) return void(x.isCallbackQueue ? x.push(_) : _(x));
                            (x = []).isCallbackQueue = !0, M[v] = x
                        }! function (t, e, i) {
                            if (t) {
                                var n = new XMLHttpRequest;
                                n.onreadystatechange = function () {
                                    if (4 == n.readyState) {
                                        var t = n.status;
                                        200 == t ? e(n.responseXML, n.responseText.trim()) : 400 <= t ? i() : 0 == t && i()
                                    }
                                }, n.open("GET", t, !0), n.send()
                            }
                        }(v, function (s, a) {
                            var l = s instanceof Document ? s.documentElement : r(a, !0),
                                u = e.afterLoad;
                            if (u) {
                                var h = u(l, a) || l;
                                if (h) {
                                    var d = "string" == typeof h;
                                    a = d ? h : i(l), l = d ? r(h, !0) : h
                                }
                            }
                            if (l instanceof SVGElement) {
                                var p = $;
                                if (b && (p = n(l, !1)), y) {
                                    var m = p && i(l);
                                    w([p, a, m])
                                }
                                o(t, l, v, e)
                            } else c(t, e), w(I);
                            g()
                        }, function () {
                            d(t, e), w(E), g()
                        })
                    }
                } else m()
            }
            var _ = s(z, f),
                M = {};
            return j && function (t) {
                var i = e[y]("head")[0];
                if (i) {
                    var n = e[v](w);
                    n.type = "text/css", n.appendChild(e.createTextNode(t)), i.appendChild(n)
                }
            }('img[onload^="' + u + '("]{visibility:hidden;}'), g.setOptions = function (t) {
                _ = s(_, t)
            }, g.create = l, g.err = function (t, e) {
                t ? t[C] != q && (p(t), j ? (a(t), d(t, _)) : h(t, _), e && (a(t), t.src = e)) : m()
            }, t[u] = g
        }("SVGInject");
    "object" == typeof module && "object" == typeof module.exports && (module.exports = H)
}(window, document),
function (t, e) {
    "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function (i) {
        return e(t, i)
    }) : "object" == typeof module && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery)
}(window, function (t, e) {
    "use strict";

    function i(i, s, a) {
        function l(t, e, n) {
            var o, s = "$()." + i + '("' + e + '")';
            return t.each(function (t, l) {
                var u = a.data(l, i);
                if (u) {
                    var c = u[e];
                    if (c && "_" != e.charAt(0)) {
                        var h = c.apply(u, n);
                        o = void 0 === o ? h : o
                    } else r(s + " is not a valid method")
                } else r(i + " not initialized. Cannot call methods, i.e. " + s)
            }), void 0 !== o ? o : t
        }

        function u(t, e) {
            t.each(function (t, n) {
                var o = a.data(n, i);
                o ? (o.option(e), o._init()) : (o = new s(n, e), a.data(n, i, o))
            })
        }
        a = a || e || t.jQuery, a && (s.prototype.option || (s.prototype.option = function (t) {
            a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t))
        }), a.fn[i] = function (t) {
            if ("string" == typeof t) {
                var e = o.call(arguments, 1);
                return l(this, t, e)
            }
            return u(this, t), this
        }, n(a))
    }

    function n(t) {
        !t || t && t.bridget || (t.bridget = i)
    }
    var o = Array.prototype.slice,
        s = t.console,
        r = void 0 === s ? function () {} : function (t) {
            s.error(t)
        };
    return n(e || t.jQuery), i
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == typeof module && module.exports ? module.exports = e() : t.EvEmitter = e()
}("undefined" != typeof window ? window : this, function () {
    function t() {}
    var e = t.prototype;
    return e.on = function (t, e) {
        if (t && e) {
            var i = this._events = this._events || {},
                n = i[t] = i[t] || [];
            return -1 == n.indexOf(e) && n.push(e), this
        }
    }, e.once = function (t, e) {
        if (t && e) {
            this.on(t, e);
            var i = this._onceEvents = this._onceEvents || {},
                n = i[t] = i[t] || {};
            return n[e] = !0, this
        }
    }, e.off = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
            var n = i.indexOf(e);
            return -1 != n && i.splice(n, 1), this
        }
    }, e.emitEvent = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
            i = i.slice(0), e = e || [];
            for (var n = this._onceEvents && this._onceEvents[t], o = 0; o < i.length; o++) {
                var s = i[o],
                    r = n && n[s];
                r && (this.off(t, s), delete n[s]), s.apply(this, e)
            }
            return this
        }
    }, e.allOff = function () {
        delete this._events, delete this._onceEvents
    }, t
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("get-size/get-size", e) : "object" == typeof module && module.exports ? module.exports = e() : t.getSize = e()
}(window, function () {
    "use strict";

    function t(t) {
        var e = parseFloat(t),
            i = -1 == t.indexOf("%") && !isNaN(e);
        return i && e
    }

    function e() {}

    function i() {
        for (var t = {
                width: 0,
                height: 0,
                innerWidth: 0,
                innerHeight: 0,
                outerWidth: 0,
                outerHeight: 0
            }, e = 0; e < u; e++) {
            var i = l[e];
            t[i] = 0
        }
        return t
    }

    function n(t) {
        var e = getComputedStyle(t);
        return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1"), e
    }

    function o() {
        if (!c) {
            c = !0;
            var e = document.createElement("div");
            e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";
            var i = document.body || document.documentElement;
            i.appendChild(e);
            var o = n(e);
            r = 200 == Math.round(t(o.width)), s.isBoxSizeOuter = r, i.removeChild(e)
        }
    }

    function s(e) {
        if (o(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == typeof e && e.nodeType) {
            var s = n(e);
            if ("none" == s.display) return i();
            var a = {};
            a.width = e.offsetWidth, a.height = e.offsetHeight;
            for (var c = a.isBorderBox = "border-box" == s.boxSizing, h = 0; h < u; h++) {
                var d = l[h],
                    p = s[d],
                    m = parseFloat(p);
                a[d] = isNaN(m) ? 0 : m
            }
            var f = a.paddingLeft + a.paddingRight,
                g = a.paddingTop + a.paddingBottom,
                v = a.marginLeft + a.marginRight,
                y = a.marginTop + a.marginBottom,
                b = a.borderLeftWidth + a.borderRightWidth,
                w = a.borderTopWidth + a.borderBottomWidth,
                x = c && r,
                T = t(s.width);
            !1 !== T && (a.width = T + (x ? 0 : f + b));
            var _ = t(s.height);
            return !1 !== _ && (a.height = _ + (x ? 0 : g + w)), a.innerWidth = a.width - (f + b), a.innerHeight = a.height - (g + w), a.outerWidth = a.width + v, a.outerHeight = a.height + y, a
        }
    }
    var r, a = "undefined" == typeof console ? e : function (t) {
            console.error(t)
        },
        l = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
        u = l.length,
        c = !1;
    return s
}),
function (t, e) {
    "use strict";
    "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == typeof module && module.exports ? module.exports = e() : t.matchesSelector = e()
}(window, function () {
    "use strict";
    var t = function () {
        var t = window.Element.prototype;
        if (t.matches) return "matches";
        if (t.matchesSelector) return "matchesSelector";
        for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
            var n = e[i],
                o = n + "MatchesSelector";
            if (t[o]) return o
        }
    }();
    return function (e, i) {
        return e[t](i)
    }
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function (i) {
        return e(t, i)
    }) : "object" == typeof module && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector)
}(window, function (t, e) {
    var i = {
            extend: function (t, e) {
                for (var i in e) t[i] = e[i];
                return t
            },
            modulo: function (t, e) {
                return (t % e + e) % e
            }
        },
        n = Array.prototype.slice;
    i.makeArray = function (t) {
        if (Array.isArray(t)) return t;
        if (null == t) return [];
        var e = "object" == typeof t && "number" == typeof t.length;
        return e ? n.call(t) : [t]
    }, i.removeFrom = function (t, e) {
        var i = t.indexOf(e); - 1 != i && t.splice(i, 1)
    }, i.getParent = function (t, i) {
        for (; t.parentNode && t != document.body;)
            if (t = t.parentNode, e(t, i)) return t
    }, i.getQueryElement = function (t) {
        return "string" == typeof t ? document.querySelector(t) : t
    }, i.handleEvent = function (t) {
        var e = "on" + t.type;
        this[e] && this[e](t)
    }, i.filterFindElements = function (t, n) {
        t = i.makeArray(t);
        var o = [];
        return t.forEach(function (t) {
            if (t instanceof HTMLElement) {
                if (!n) return void o.push(t);
                e(t, n) && o.push(t);
                for (var i = t.querySelectorAll(n), s = 0; s < i.length; s++) o.push(i[s])
            }
        }), o
    }, i.debounceMethod = function (t, e, i) {
        i = i || 100;
        var n = t.prototype[e],
            o = e + "Timeout";
        t.prototype[e] = function () {
            var t = this[o];
            clearTimeout(t);
            var e = arguments,
                s = this;
            this[o] = setTimeout(function () {
                n.apply(s, e), delete s[o]
            }, i)
        }
    }, i.docReady = function (t) {
        var e = document.readyState;
        "complete" == e || "interactive" == e ? setTimeout(t) : document.addEventListener("DOMContentLoaded", t)
    }, i.toDashed = function (t) {
        return t.replace(/(.)([A-Z])/g, function (t, e, i) {
            return e + "-" + i
        }).toLowerCase()
    };
    var o = t.console;
    return i.htmlInit = function (e, n) {
        i.docReady(function () {
            var s = i.toDashed(n),
                r = "data-" + s,
                a = document.querySelectorAll("[" + r + "]"),
                l = document.querySelectorAll(".js-" + s),
                u = i.makeArray(a).concat(i.makeArray(l)),
                c = r + "-options",
                h = t.jQuery;
            u.forEach(function (t) {
                var i, s = t.getAttribute(r) || t.getAttribute(c);
                try {
                    i = s && JSON.parse(s)
                } catch (e) {
                    return void(o && o.error("Error parsing " + r + " on " + t.className + ": " + e))
                }
                var a = new e(t, i);
                h && h.data(t, n, a)
            })
        })
    }, i
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("outlayer/item", ["ev-emitter/ev-emitter", "get-size/get-size"], e) : "object" == typeof module && module.exports ? module.exports = e(require("ev-emitter"), require("get-size")) : (t.Outlayer = {}, t.Outlayer.Item = e(t.EvEmitter, t.getSize))
}(window, function (t, e) {
    "use strict";

    function i(t) {
        for (var e in t) return !1;
        return !0
    }

    function n(t, e) {
        t && (this.element = t, this.layout = e, this.position = {
            x: 0,
            y: 0
        }, this._create())
    }

    function o(t) {
        return t.replace(/([A-Z])/g, function (t) {
            return "-" + t.toLowerCase()
        })
    }
    var s = document.documentElement.style,
        r = "string" == typeof s.transition ? "transition" : "WebkitTransition",
        a = "string" == typeof s.transform ? "transform" : "WebkitTransform",
        l = {
            WebkitTransition: "webkitTransitionEnd",
            transition: "transitionend"
        } [r],
        u = {
            transform: a,
            transition: r,
            transitionDuration: r + "Duration",
            transitionProperty: r + "Property",
            transitionDelay: r + "Delay"
        },
        c = n.prototype = Object.create(t.prototype);
    c.constructor = n, c._create = function () {
        this._transn = {
            ingProperties: {},
            clean: {},
            onEnd: {}
        }, this.css({
            position: "absolute"
        })
    }, c.handleEvent = function (t) {
        var e = "on" + t.type;
        this[e] && this[e](t)
    }, c.getSize = function () {
        this.size = e(this.element)
    }, c.css = function (t) {
        var e = this.element.style;
        for (var i in t) {
            var n = u[i] || i;
            e[n] = t[i]
        }
    }, c.getPosition = function () {
        var t = getComputedStyle(this.element),
            e = this.layout._getOption("originLeft"),
            i = this.layout._getOption("originTop"),
            n = t[e ? "left" : "right"],
            o = t[i ? "top" : "bottom"],
            s = parseFloat(n),
            r = parseFloat(o),
            a = this.layout.size; - 1 != n.indexOf("%") && (s = s / 100 * a.width), -1 != o.indexOf("%") && (r = r / 100 * a.height), s = isNaN(s) ? 0 : s, r = isNaN(r) ? 0 : r, s -= e ? a.paddingLeft : a.paddingRight, r -= i ? a.paddingTop : a.paddingBottom, this.position.x = s, this.position.y = r
    }, c.layoutPosition = function () {
        var t = this.layout.size,
            e = {},
            i = this.layout._getOption("originLeft"),
            n = this.layout._getOption("originTop"),
            o = i ? "paddingLeft" : "paddingRight",
            s = i ? "left" : "right",
            r = i ? "right" : "left",
            a = this.position.x + t[o];
        e[s] = this.getXValue(a), e[r] = "";
        var l = n ? "paddingTop" : "paddingBottom",
            u = n ? "top" : "bottom",
            c = n ? "bottom" : "top",
            h = this.position.y + t[l];
        e[u] = this.getYValue(h), e[c] = "", this.css(e), this.emitEvent("layout", [this])
    }, c.getXValue = function (t) {
        var e = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && !e ? t / this.layout.size.width * 100 + "%" : t + "px"
    }, c.getYValue = function (t) {
        var e = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && e ? t / this.layout.size.height * 100 + "%" : t + "px"
    }, c._transitionTo = function (t, e) {
        this.getPosition();
        var i = this.position.x,
            n = this.position.y,
            o = t == this.position.x && e == this.position.y;
        if (this.setPosition(t, e), !o || this.isTransitioning) {
            var s = t - i,
                r = e - n,
                a = {};
            a.transform = this.getTranslate(s, r), this.transition({
                to: a,
                onTransitionEnd: {
                    transform: this.layoutPosition
                },
                isCleaning: !0
            })
        } else this.layoutPosition()
    }, c.getTranslate = function (t, e) {
        var i = this.layout._getOption("originLeft"),
            n = this.layout._getOption("originTop");
        return t = i ? t : -t, e = n ? e : -e, "translate3d(" + t + "px, " + e + "px, 0)"
    }, c.goTo = function (t, e) {
        this.setPosition(t, e), this.layoutPosition()
    }, c.moveTo = c._transitionTo, c.setPosition = function (t, e) {
        this.position.x = parseFloat(t), this.position.y = parseFloat(e)
    }, c._nonTransition = function (t) {
        for (var e in this.css(t.to), t.isCleaning && this._removeStyles(t.to), t.onTransitionEnd) t.onTransitionEnd[e].call(this)
    }, c.transition = function (t) {
        if (parseFloat(this.layout.options.transitionDuration)) {
            var e = this._transn;
            for (var i in t.onTransitionEnd) e.onEnd[i] = t.onTransitionEnd[i];
            for (i in t.to) e.ingProperties[i] = !0, t.isCleaning && (e.clean[i] = !0);
            t.from && (this.css(t.from), this.element.offsetHeight), this.enableTransition(t.to), this.css(t.to), this.isTransitioning = !0
        } else this._nonTransition(t)
    };
    var h = "opacity," + o(a);
    c.enableTransition = function () {
        if (!this.isTransitioning) {
            var t = this.layout.options.transitionDuration;
            t = "number" == typeof t ? t + "ms" : t, this.css({
                transitionProperty: h,
                transitionDuration: t,
                transitionDelay: this.staggerDelay || 0
            }), this.element.addEventListener(l, this, !1)
        }
    }, c.onwebkitTransitionEnd = function (t) {
        this.ontransitionend(t)
    }, c.onotransitionend = function (t) {
        this.ontransitionend(t)
    };
    var d = {
        "-webkit-transform": "transform"
    };
    c.ontransitionend = function (t) {
        if (t.target === this.element) {
            var e = this._transn,
                n = d[t.propertyName] || t.propertyName;
            if (delete e.ingProperties[n], i(e.ingProperties) && this.disableTransition(), n in e.clean && (this.element.style[t.propertyName] = "", delete e.clean[n]), n in e.onEnd) {
                var o = e.onEnd[n];
                o.call(this), delete e.onEnd[n]
            }
            this.emitEvent("transitionEnd", [this])
        }
    }, c.disableTransition = function () {
        this.removeTransitionStyles(), this.element.removeEventListener(l, this, !1), this.isTransitioning = !1
    }, c._removeStyles = function (t) {
        var e = {};
        for (var i in t) e[i] = "";
        this.css(e)
    };
    var p = {
        transitionProperty: "",
        transitionDuration: "",
        transitionDelay: ""
    };
    return c.removeTransitionStyles = function () {
        this.css(p)
    }, c.stagger = function (t) {
        t = isNaN(t) ? 0 : t, this.staggerDelay = t + "ms"
    }, c.removeElem = function () {
        this.element.parentNode.removeChild(this.element), this.css({
            display: ""
        }), this.emitEvent("remove", [this])
    }, c.remove = function () {
        return r && parseFloat(this.layout.options.transitionDuration) ? (this.once("transitionEnd", function () {
            this.removeElem()
        }), void this.hide()) : void this.removeElem()
    }, c.reveal = function () {
        delete this.isHidden, this.css({
            display: ""
        });
        var t = this.layout.options,
            e = {},
            i = this.getHideRevealTransitionEndProperty("visibleStyle");
        e[i] = this.onRevealTransitionEnd, this.transition({
            from: t.hiddenStyle,
            to: t.visibleStyle,
            isCleaning: !0,
            onTransitionEnd: e
        })
    }, c.onRevealTransitionEnd = function () {
        this.isHidden || this.emitEvent("reveal")
    }, c.getHideRevealTransitionEndProperty = function (t) {
        var e = this.layout.options[t];
        if (e.opacity) return "opacity";
        for (var i in e) return i
    }, c.hide = function () {
        this.isHidden = !0, this.css({
            display: ""
        });
        var t = this.layout.options,
            e = {},
            i = this.getHideRevealTransitionEndProperty("hiddenStyle");
        e[i] = this.onHideTransitionEnd, this.transition({
            from: t.visibleStyle,
            to: t.hiddenStyle,
            isCleaning: !0,
            onTransitionEnd: e
        })
    }, c.onHideTransitionEnd = function () {
        this.isHidden && (this.css({
            display: "none"
        }), this.emitEvent("hide"))
    }, c.destroy = function () {
        this.css({
            position: "",
            left: "",
            right: "",
            top: "",
            bottom: "",
            transition: "",
            transform: ""
        })
    }, n
}),
function (t, e) {
    "use strict";
    "function" == typeof define && define.amd ? define("outlayer/outlayer", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./item"], function (i, n, o, s) {
        return e(t, i, n, o, s)
    }) : "object" == typeof module && module.exports ? module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./item")) : t.Outlayer = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, t.Outlayer.Item)
}(window, function (t, e, i, n, o) {
    "use strict";

    function s(t, e) {
        var i = n.getQueryElement(t);
        if (i) {
            this.element = i, u && (this.$element = u(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e);
            var o = ++h;
            this.element.outlayerGUID = o, d[o] = this, this._create();
            var s = this._getOption("initLayout");
            s && this.layout()
        } else l && l.error("Bad element for " + this.constructor.namespace + ": " + (i || t))
    }

    function r(t) {
        function e() {
            t.apply(this, arguments)
        }
        return e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e
    }

    function a(t) {
        if ("number" == typeof t) return t;
        var e = t.match(/(^\d*\.?\d*)(\w*)/),
            i = e && e[1],
            n = e && e[2];
        if (!i.length) return 0;
        i = parseFloat(i);
        var o = m[n] || 1;
        return i * o
    }
    var l = t.console,
        u = t.jQuery,
        c = function () {},
        h = 0,
        d = {};
    s.namespace = "outlayer", s.Item = o, s.defaults = {
        containerStyle: {
            position: "relative"
        },
        initLayout: !0,
        originLeft: !0,
        originTop: !0,
        resize: !0,
        resizeContainer: !0,
        transitionDuration: "0.4s",
        hiddenStyle: {
            opacity: 0,
            transform: "scale(0.001)"
        },
        visibleStyle: {
            opacity: 1,
            transform: "scale(1)"
        }
    };
    var p = s.prototype;
    n.extend(p, e.prototype), p.option = function (t) {
            n.extend(this.options, t)
        }, p._getOption = function (t) {
            var e = this.constructor.compatOptions[t];
            return e && void 0 !== this.options[e] ? this.options[e] : this.options[t]
        }, s.compatOptions = {
            initLayout: "isInitLayout",
            horizontal: "isHorizontal",
            layoutInstant: "isLayoutInstant",
            originLeft: "isOriginLeft",
            originTop: "isOriginTop",
            resize: "isResizeBound",
            resizeContainer: "isResizingContainer"
        }, p._create = function () {
            this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), n.extend(this.element.style, this.options.containerStyle);
            var t = this._getOption("resize");
            t && this.bindResize()
        }, p.reloadItems = function () {
            this.items = this._itemize(this.element.children)
        }, p._itemize = function (t) {
            for (var e = this._filterFindItemElements(t), i = this.constructor.Item, n = [], o = 0; o < e.length; o++) {
                var s = e[o],
                    r = new i(s, this);
                n.push(r)
            }
            return n
        }, p._filterFindItemElements = function (t) {
            return n.filterFindElements(t, this.options.itemSelector)
        }, p.getItemElements = function () {
            return this.items.map(function (t) {
                return t.element
            })
        }, p.layout = function () {
            this._resetLayout(), this._manageStamps();
            var t = this._getOption("layoutInstant"),
                e = void 0 !== t ? t : !this._isLayoutInited;
            this.layoutItems(this.items, e), this._isLayoutInited = !0
        }, p._init = p.layout, p._resetLayout = function () {
            this.getSize()
        }, p.getSize = function () {
            this.size = i(this.element)
        }, p._getMeasurement = function (t, e) {
            var n, o = this.options[t];
            o ? ("string" == typeof o ? n = this.element.querySelector(o) : o instanceof HTMLElement && (n = o), this[t] = n ? i(n)[e] : o) : this[t] = 0
        }, p.layoutItems = function (t, e) {
            t = this._getItemsForLayout(t), this._layoutItems(t, e), this._postLayout()
        }, p._getItemsForLayout = function (t) {
            return t.filter(function (t) {
                return !t.isIgnored
            })
        },
        p._layoutItems = function (t, e) {
            if (this._emitCompleteOnItems("layout", t), t && t.length) {
                var i = [];
                t.forEach(function (t) {
                    var n = this._getItemLayoutPosition(t);
                    n.item = t, n.isInstant = e || t.isLayoutInstant, i.push(n)
                }, this), this._processLayoutQueue(i)
            }
        }, p._getItemLayoutPosition = function () {
            return {
                x: 0,
                y: 0
            }
        }, p._processLayoutQueue = function (t) {
            this.updateStagger(), t.forEach(function (t, e) {
                this._positionItem(t.item, t.x, t.y, t.isInstant, e)
            }, this)
        }, p.updateStagger = function () {
            var t = this.options.stagger;
            return null == t ? void(this.stagger = 0) : (this.stagger = a(t), this.stagger)
        }, p._positionItem = function (t, e, i, n, o) {
            n ? t.goTo(e, i) : (t.stagger(o * this.stagger), t.moveTo(e, i))
        }, p._postLayout = function () {
            this.resizeContainer()
        }, p.resizeContainer = function () {
            var t = this._getOption("resizeContainer");
            if (t) {
                var e = this._getContainerSize();
                e && (this._setContainerMeasure(e.width, !0), this._setContainerMeasure(e.height, !1))
            }
        }, p._getContainerSize = c, p._setContainerMeasure = function (t, e) {
            if (void 0 !== t) {
                var i = this.size;
                i.isBorderBox && (t += e ? i.paddingLeft + i.paddingRight + i.borderLeftWidth + i.borderRightWidth : i.paddingBottom + i.paddingTop + i.borderTopWidth + i.borderBottomWidth), t = Math.max(t, 0), this.element.style[e ? "width" : "height"] = t + "px"
            }
        }, p._emitCompleteOnItems = function (t, e) {
            function i() {
                o.dispatchEvent(t + "Complete", null, [e])
            }

            function n() {
                r++, r == s && i()
            }
            var o = this,
                s = e.length;
            if (e && s) {
                var r = 0;
                e.forEach(function (e) {
                    e.once(t, n)
                })
            } else i()
        }, p.dispatchEvent = function (t, e, i) {
            var n = e ? [e].concat(i) : i;
            if (this.emitEvent(t, n), u)
                if (this.$element = this.$element || u(this.element), e) {
                    var o = u.Event(e);
                    o.type = t, this.$element.trigger(o, i)
                } else this.$element.trigger(t, i)
        }, p.ignore = function (t) {
            var e = this.getItem(t);
            e && (e.isIgnored = !0)
        }, p.unignore = function (t) {
            var e = this.getItem(t);
            e && delete e.isIgnored
        }, p.stamp = function (t) {
            t = this._find(t), t && (this.stamps = this.stamps.concat(t), t.forEach(this.ignore, this))
        }, p.unstamp = function (t) {
            t = this._find(t), t && t.forEach(function (t) {
                n.removeFrom(this.stamps, t), this.unignore(t)
            }, this)
        }, p._find = function (t) {
            if (t) return "string" == typeof t && (t = this.element.querySelectorAll(t)), n.makeArray(t)
        }, p._manageStamps = function () {
            this.stamps && this.stamps.length && (this._getBoundingRect(), this.stamps.forEach(this._manageStamp, this))
        }, p._getBoundingRect = function () {
            var t = this.element.getBoundingClientRect(),
                e = this.size;
            this._boundingRect = {
                left: t.left + e.paddingLeft + e.borderLeftWidth,
                top: t.top + e.paddingTop + e.borderTopWidth,
                right: t.right - (e.paddingRight + e.borderRightWidth),
                bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth)
            }
        }, p._manageStamp = c, p._getElementOffset = function (t) {
            var e = t.getBoundingClientRect(),
                n = this._boundingRect,
                o = i(t),
                s = {
                    left: e.left - n.left - o.marginLeft,
                    top: e.top - n.top - o.marginTop,
                    right: n.right - e.right - o.marginRight,
                    bottom: n.bottom - e.bottom - o.marginBottom
                };
            return s
        }, p.handleEvent = n.handleEvent, p.bindResize = function () {
            t.addEventListener("resize", this), this.isResizeBound = !0
        }, p.unbindResize = function () {
            t.removeEventListener("resize", this), this.isResizeBound = !1
        }, p.onresize = function () {
            this.resize()
        }, n.debounceMethod(s, "onresize", 100), p.resize = function () {
            this.isResizeBound && this.needsResizeLayout() && this.layout()
        }, p.needsResizeLayout = function () {
            var t = i(this.element),
                e = this.size && t;
            return e && t.innerWidth !== this.size.innerWidth
        }, p.addItems = function (t) {
            var e = this._itemize(t);
            return e.length && (this.items = this.items.concat(e)), e
        }, p.appended = function (t) {
            var e = this.addItems(t);
            e.length && (this.layoutItems(e, !0), this.reveal(e))
        }, p.prepended = function (t) {
            var e = this._itemize(t);
            if (e.length) {
                var i = this.items.slice(0);
                this.items = e.concat(i), this._resetLayout(), this._manageStamps(), this.layoutItems(e, !0), this.reveal(e), this.layoutItems(i)
            }
        }, p.reveal = function (t) {
            if (this._emitCompleteOnItems("reveal", t), t && t.length) {
                var e = this.updateStagger();
                t.forEach(function (t, i) {
                    t.stagger(i * e), t.reveal()
                })
            }
        }, p.hide = function (t) {
            if (this._emitCompleteOnItems("hide", t), t && t.length) {
                var e = this.updateStagger();
                t.forEach(function (t, i) {
                    t.stagger(i * e), t.hide()
                })
            }
        }, p.revealItemElements = function (t) {
            var e = this.getItems(t);
            this.reveal(e)
        }, p.hideItemElements = function (t) {
            var e = this.getItems(t);
            this.hide(e)
        }, p.getItem = function (t) {
            for (var e = 0; e < this.items.length; e++) {
                var i = this.items[e];
                if (i.element == t) return i
            }
        }, p.getItems = function (t) {
            t = n.makeArray(t);
            var e = [];
            return t.forEach(function (t) {
                var i = this.getItem(t);
                i && e.push(i)
            }, this), e
        }, p.remove = function (t) {
            var e = this.getItems(t);
            this._emitCompleteOnItems("remove", e), e && e.length && e.forEach(function (t) {
                t.remove(), n.removeFrom(this.items, t)
            }, this)
        }, p.destroy = function () {
            var t = this.element.style;
            t.height = "", t.position = "", t.width = "", this.items.forEach(function (t) {
                t.destroy()
            }), this.unbindResize();
            var e = this.element.outlayerGUID;
            delete d[e], delete this.element.outlayerGUID, u && u.removeData(this.element, this.constructor.namespace)
        }, s.data = function (t) {
            t = n.getQueryElement(t);
            var e = t && t.outlayerGUID;
            return e && d[e]
        }, s.create = function (t, e) {
            var i = r(s);
            return i.defaults = n.extend({}, s.defaults), n.extend(i.defaults, e), i.compatOptions = n.extend({}, s.compatOptions), i.namespace = t, i.data = s.data, i.Item = r(o), n.htmlInit(i, t), u && u.bridget && u.bridget(t, i), i
        };
    var m = {
        ms: 1,
        s: 1e3
    };
    return s.Item = o, s
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("isotope-layout/js/item", ["outlayer/outlayer"], e) : "object" == typeof module && module.exports ? module.exports = e(require("outlayer")) : (t.Isotope = t.Isotope || {}, t.Isotope.Item = e(t.Outlayer))
}(window, function (t) {
    "use strict";

    function e() {
        t.Item.apply(this, arguments)
    }
    var i = e.prototype = Object.create(t.Item.prototype),
        n = i._create;
    i._create = function () {
        this.id = this.layout.itemGUID++, n.call(this), this.sortData = {}
    }, i.updateSortData = function () {
        if (!this.isIgnored) {
            this.sortData.id = this.id, this.sortData["original-order"] = this.id, this.sortData.random = Math.random();
            var t = this.layout.options.getSortData,
                e = this.layout._sorters;
            for (var i in t) {
                var n = e[i];
                this.sortData[i] = n(this.element, this)
            }
        }
    };
    var o = i.destroy;
    return i.destroy = function () {
        o.apply(this, arguments), this.css({
            display: ""
        })
    }, e
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("isotope-layout/js/layout-mode", ["get-size/get-size", "outlayer/outlayer"], e) : "object" == typeof module && module.exports ? module.exports = e(require("get-size"), require("outlayer")) : (t.Isotope = t.Isotope || {}, t.Isotope.LayoutMode = e(t.getSize, t.Outlayer))
}(window, function (t, e) {
    "use strict";

    function i(t) {
        this.isotope = t, t && (this.options = t.options[this.namespace], this.element = t.element, this.items = t.filteredItems, this.size = t.size)
    }
    var n = i.prototype,
        o = ["_resetLayout", "_getItemLayoutPosition", "_manageStamp", "_getContainerSize", "_getElementOffset", "needsResizeLayout", "_getOption"];
    return o.forEach(function (t) {
        n[t] = function () {
            return e.prototype[t].apply(this.isotope, arguments)
        }
    }), n.needsVerticalResizeLayout = function () {
        var e = t(this.isotope.element),
            i = this.isotope.size && e;
        return i && e.innerHeight != this.isotope.size.innerHeight
    }, n._getMeasurement = function () {
        this.isotope._getMeasurement.apply(this, arguments)
    }, n.getColumnWidth = function () {
        this.getSegmentSize("column", "Width")
    }, n.getRowHeight = function () {
        this.getSegmentSize("row", "Height")
    }, n.getSegmentSize = function (t, e) {
        var i = t + e,
            n = "outer" + e;
        if (this._getMeasurement(i, n), !this[i]) {
            var o = this.getFirstItemSize();
            this[i] = o && o[n] || this.isotope.size["inner" + e]
        }
    }, n.getFirstItemSize = function () {
        var e = this.isotope.filteredItems[0];
        return e && e.element && t(e.element)
    }, n.layout = function () {
        this.isotope.layout.apply(this.isotope, arguments)
    }, n.getSize = function () {
        this.isotope.getSize(), this.size = this.isotope.size
    }, i.modes = {}, i.create = function (t, e) {
        function o() {
            i.apply(this, arguments)
        }
        return o.prototype = Object.create(n), o.prototype.constructor = o, e && (o.options = e), o.prototype.namespace = t, i.modes[t] = o, o
    }, i
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("masonry-layout/masonry", ["outlayer/outlayer", "get-size/get-size"], e) : "object" == typeof module && module.exports ? module.exports = e(require("outlayer"), require("get-size")) : t.Masonry = e(t.Outlayer, t.getSize)
}(window, function (t, e) {
    var i = t.create("masonry");
    i.compatOptions.fitWidth = "isFitWidth";
    var n = i.prototype;
    return n._resetLayout = function () {
        this.getSize(), this._getMeasurement("columnWidth", "outerWidth"), this._getMeasurement("gutter", "outerWidth"), this.measureColumns(), this.colYs = [];
        for (var t = 0; t < this.cols; t++) this.colYs.push(0);
        this.maxY = 0, this.horizontalColIndex = 0
    }, n.measureColumns = function () {
        if (this.getContainerWidth(), !this.columnWidth) {
            var t = this.items[0],
                i = t && t.element;
            this.columnWidth = i && e(i).outerWidth || this.containerWidth
        }
        var n = this.columnWidth += this.gutter,
            o = this.containerWidth + this.gutter,
            s = o / n,
            r = n - o % n,
            a = r && r < 1 ? "round" : "floor";
        s = Math[a](s), this.cols = Math.max(s, 1)
    }, n.getContainerWidth = function () {
        var t = this._getOption("fitWidth"),
            i = t ? this.element.parentNode : this.element,
            n = e(i);
        this.containerWidth = n && n.innerWidth
    }, n._getItemLayoutPosition = function (t) {
        t.getSize();
        var e = t.size.outerWidth % this.columnWidth,
            i = e && e < 1 ? "round" : "ceil",
            n = Math[i](t.size.outerWidth / this.columnWidth);
        n = Math.min(n, this.cols);
        for (var o = this.options.horizontalOrder ? "_getHorizontalColPosition" : "_getTopColPosition", s = this[o](n, t), r = {
                x: this.columnWidth * s.col,
                y: s.y
            }, a = s.y + t.size.outerHeight, l = n + s.col, u = s.col; u < l; u++) this.colYs[u] = a;
        return r
    }, n._getTopColPosition = function (t) {
        var e = this._getTopColGroup(t),
            i = Math.min.apply(Math, e);
        return {
            col: e.indexOf(i),
            y: i
        }
    }, n._getTopColGroup = function (t) {
        if (t < 2) return this.colYs;
        for (var e = [], i = this.cols + 1 - t, n = 0; n < i; n++) e[n] = this._getColGroupY(n, t);
        return e
    }, n._getColGroupY = function (t, e) {
        if (e < 2) return this.colYs[t];
        var i = this.colYs.slice(t, t + e);
        return Math.max.apply(Math, i)
    }, n._getHorizontalColPosition = function (t, e) {
        var i = this.horizontalColIndex % this.cols,
            n = t > 1 && i + t > this.cols;
        i = n ? 0 : i;
        var o = e.size.outerWidth && e.size.outerHeight;
        return this.horizontalColIndex = o ? i + t : this.horizontalColIndex, {
            col: i,
            y: this._getColGroupY(i, t)
        }
    }, n._manageStamp = function (t) {
        var i = e(t),
            n = this._getElementOffset(t),
            o = this._getOption("originLeft"),
            s = o ? n.left : n.right,
            r = s + i.outerWidth,
            a = Math.floor(s / this.columnWidth);
        a = Math.max(0, a);
        var l = Math.floor(r / this.columnWidth);
        l -= r % this.columnWidth ? 0 : 1, l = Math.min(this.cols - 1, l);
        for (var u = this._getOption("originTop"), c = (u ? n.top : n.bottom) + i.outerHeight, h = a; h <= l; h++) this.colYs[h] = Math.max(c, this.colYs[h])
    }, n._getContainerSize = function () {
        this.maxY = Math.max.apply(Math, this.colYs);
        var t = {
            height: this.maxY
        };
        return this._getOption("fitWidth") && (t.width = this._getContainerFitWidth()), t
    }, n._getContainerFitWidth = function () {
        for (var t = 0, e = this.cols; --e && 0 === this.colYs[e];) t++;
        return (this.cols - t) * this.columnWidth - this.gutter
    }, n.needsResizeLayout = function () {
        var t = this.containerWidth;
        return this.getContainerWidth(), t != this.containerWidth
    }, i
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("isotope-layout/js/layout-modes/masonry", ["../layout-mode", "masonry-layout/masonry"], e) : "object" == typeof module && module.exports ? module.exports = e(require("../layout-mode"), require("masonry-layout")) : e(t.Isotope.LayoutMode, t.Masonry)
}(window, function (t, e) {
    "use strict";
    var i = t.create("masonry"),
        n = i.prototype,
        o = {
            _getElementOffset: !0,
            layout: !0,
            _getMeasurement: !0
        };
    for (var s in e.prototype) o[s] || (n[s] = e.prototype[s]);
    var r = n.measureColumns;
    n.measureColumns = function () {
        this.items = this.isotope.filteredItems, r.call(this)
    };
    var a = n._getOption;
    return n._getOption = function (t) {
        return "fitWidth" == t ? void 0 !== this.options.isFitWidth ? this.options.isFitWidth : this.options.fitWidth : a.apply(this.isotope, arguments)
    }, i
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("isotope-layout/js/layout-modes/fit-rows", ["../layout-mode"], e) : "object" == typeof exports ? module.exports = e(require("../layout-mode")) : e(t.Isotope.LayoutMode)
}(window, function (t) {
    "use strict";
    var e = t.create("fitRows"),
        i = e.prototype;
    return i._resetLayout = function () {
        this.x = 0, this.y = 0, this.maxY = 0, this._getMeasurement("gutter", "outerWidth")
    }, i._getItemLayoutPosition = function (t) {
        t.getSize();
        var e = t.size.outerWidth + this.gutter,
            i = this.isotope.size.innerWidth + this.gutter;
        0 !== this.x && e + this.x > i && (this.x = 0, this.y = this.maxY);
        var n = {
            x: this.x,
            y: this.y
        };
        return this.maxY = Math.max(this.maxY, this.y + t.size.outerHeight), this.x += e, n
    }, i._getContainerSize = function () {
        return {
            height: this.maxY
        }
    }, e
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("isotope-layout/js/layout-modes/vertical", ["../layout-mode"], e) : "object" == typeof module && module.exports ? module.exports = e(require("../layout-mode")) : e(t.Isotope.LayoutMode)
}(window, function (t) {
    "use strict";
    var e = t.create("vertical", {
            horizontalAlignment: 0
        }),
        i = e.prototype;
    return i._resetLayout = function () {
        this.y = 0
    }, i._getItemLayoutPosition = function (t) {
        t.getSize();
        var e = (this.isotope.size.innerWidth - t.size.outerWidth) * this.options.horizontalAlignment,
            i = this.y;
        return this.y += t.size.outerHeight, {
            x: e,
            y: i
        }
    }, i._getContainerSize = function () {
        return {
            height: this.y
        }
    }, e
}),
function (t, e) {
    "function" == typeof define && define.amd ? define(["outlayer/outlayer", "get-size/get-size", "desandro-matches-selector/matches-selector", "fizzy-ui-utils/utils", "isotope-layout/js/item", "isotope-layout/js/layout-mode", "isotope-layout/js/layout-modes/masonry", "isotope-layout/js/layout-modes/fit-rows", "isotope-layout/js/layout-modes/vertical"], function (i, n, o, s, r, a) {
        return e(t, i, n, o, s, r, a)
    }) : "object" == typeof module && module.exports ? module.exports = e(t, require("outlayer"), require("get-size"), require("desandro-matches-selector"), require("fizzy-ui-utils"), require("isotope-layout/js/item"), require("isotope-layout/js/layout-mode"), require("isotope-layout/js/layout-modes/masonry"), require("isotope-layout/js/layout-modes/fit-rows"), require("isotope-layout/js/layout-modes/vertical")) : t.Isotope = e(t, t.Outlayer, t.getSize, t.matchesSelector, t.fizzyUIUtils, t.Isotope.Item, t.Isotope.LayoutMode)
}(window, function (t, e, i, n, o, s, r) {
    function a(t, e) {
        return function (i, n) {
            for (var o = 0; o < t.length; o++) {
                var s = t[o],
                    r = i.sortData[s],
                    a = n.sortData[s];
                if (r > a || r < a) {
                    var l = void 0 !== e[s] ? e[s] : e,
                        u = l ? 1 : -1;
                    return (r > a ? 1 : -1) * u
                }
            }
            return 0
        }
    }
    var l = t.jQuery,
        u = String.prototype.trim ? function (t) {
            return t.trim()
        } : function (t) {
            return t.replace(/^\s+|\s+$/g, "")
        },
        c = e.create("isotope", {
            layoutMode: "masonry",
            isJQueryFiltering: !0,
            sortAscending: !0
        });
    c.Item = s, c.LayoutMode = r;
    var h = c.prototype;
    h._create = function () {
        for (var t in this.itemGUID = 0, this._sorters = {}, this._getSorters(), e.prototype._create.call(this), this.modes = {}, this.filteredItems = this.items, this.sortHistory = ["original-order"], r.modes) this._initLayoutMode(t)
    }, h.reloadItems = function () {
        this.itemGUID = 0, e.prototype.reloadItems.call(this)
    }, h._itemize = function () {
        for (var t = e.prototype._itemize.apply(this, arguments), i = 0; i < t.length; i++) {
            var n = t[i];
            n.id = this.itemGUID++
        }
        return this._updateItemsSortData(t), t
    }, h._initLayoutMode = function (t) {
        var e = r.modes[t],
            i = this.options[t] || {};
        this.options[t] = e.options ? o.extend(e.options, i) : i, this.modes[t] = new e(this)
    }, h.layout = function () {
        return !this._isLayoutInited && this._getOption("initLayout") ? void this.arrange() : void this._layout()
    }, h._layout = function () {
        var t = this._getIsInstant();
        this._resetLayout(), this._manageStamps(), this.layoutItems(this.filteredItems, t), this._isLayoutInited = !0
    }, h.arrange = function (t) {
        this.option(t), this._getIsInstant();
        var e = this._filter(this.items);
        this.filteredItems = e.matches, this._bindArrangeComplete(), this._isInstant ? this._noTransition(this._hideReveal, [e]) : this._hideReveal(e), this._sort(), this._layout()
    }, h._init = h.arrange, h._hideReveal = function (t) {
        this.reveal(t.needReveal), this.hide(t.needHide)
    }, h._getIsInstant = function () {
        var t = this._getOption("layoutInstant"),
            e = void 0 !== t ? t : !this._isLayoutInited;
        return this._isInstant = e, e
    }, h._bindArrangeComplete = function () {
        function t() {
            e && i && n && o.dispatchEvent("arrangeComplete", null, [o.filteredItems])
        }
        var e, i, n, o = this;
        this.once("layoutComplete", function () {
            e = !0, t()
        }), this.once("hideComplete", function () {
            i = !0, t()
        }), this.once("revealComplete", function () {
            n = !0, t()
        })
    }, h._filter = function (t) {
        var e = this.options.filter;
        e = e || "*";
        for (var i = [], n = [], o = [], s = this._getFilterTest(e), r = 0; r < t.length; r++) {
            var a = t[r];
            if (!a.isIgnored) {
                var l = s(a);
                l && i.push(a), l && a.isHidden ? n.push(a) : l || a.isHidden || o.push(a)
            }
        }
        return {
            matches: i,
            needReveal: n,
            needHide: o
        }
    }, h._getFilterTest = function (t) {
        return l && this.options.isJQueryFiltering ? function (e) {
            return l(e.element).is(t)
        } : "function" == typeof t ? function (e) {
            return t(e.element)
        } : function (e) {
            return n(e.element, t)
        }
    }, h.updateSortData = function (t) {
        var e;
        t ? (t = o.makeArray(t), e = this.getItems(t)) : e = this.items, this._getSorters(), this._updateItemsSortData(e)
    }, h._getSorters = function () {
        var t = this.options.getSortData;
        for (var e in t) {
            var i = t[e];
            this._sorters[e] = d(i)
        }
    }, h._updateItemsSortData = function (t) {
        for (var e = t && t.length, i = 0; e && i < e; i++) {
            var n = t[i];
            n.updateSortData()
        }
    };
    var d = function () {
        function t(t) {
            if ("string" != typeof t) return t;
            var i = u(t).split(" "),
                n = i[0],
                o = n.match(/^\[(.+)\]$/),
                s = o && o[1],
                r = e(s, n),
                a = c.sortDataParsers[i[1]];
            return a ? function (t) {
                return t && a(r(t))
            } : function (t) {
                return t && r(t)
            }
        }

        function e(t, e) {
            return t ? function (e) {
                return e.getAttribute(t)
            } : function (t) {
                var i = t.querySelector(e);
                return i && i.textContent
            }
        }
        return t
    }();
    c.sortDataParsers = {
        parseInt: function (t) {
            return parseInt(t, 10)
        },
        parseFloat: function (t) {
            return parseFloat(t)
        }
    }, h._sort = function () {
        if (this.options.sortBy) {
            var t = o.makeArray(this.options.sortBy);
            this._getIsSameSortBy(t) || (this.sortHistory = t.concat(this.sortHistory));
            var e = a(this.sortHistory, this.options.sortAscending);
            this.filteredItems.sort(e)
        }
    }, h._getIsSameSortBy = function (t) {
        for (var e = 0; e < t.length; e++)
            if (t[e] != this.sortHistory[e]) return !1;
        return !0
    }, h._mode = function () {
        var t = this.options.layoutMode,
            e = this.modes[t];
        if (!e) throw new Error("No layout mode: " + t);
        return e.options = this.options[t], e
    }, h._resetLayout = function () {
        e.prototype._resetLayout.call(this), this._mode()._resetLayout()
    }, h._getItemLayoutPosition = function (t) {
        return this._mode()._getItemLayoutPosition(t)
    }, h._manageStamp = function (t) {
        this._mode()._manageStamp(t)
    }, h._getContainerSize = function () {
        return this._mode()._getContainerSize()
    }, h.needsResizeLayout = function () {
        return this._mode().needsResizeLayout()
    }, h.appended = function (t) {
        var e = this.addItems(t);
        if (e.length) {
            var i = this._filterRevealAdded(e);
            this.filteredItems = this.filteredItems.concat(i)
        }
    }, h.prepended = function (t) {
        var e = this._itemize(t);
        if (e.length) {
            this._resetLayout(), this._manageStamps();
            var i = this._filterRevealAdded(e);
            this.layoutItems(this.filteredItems), this.filteredItems = i.concat(this.filteredItems), this.items = e.concat(this.items)
        }
    }, h._filterRevealAdded = function (t) {
        var e = this._filter(t);
        return this.hide(e.needHide), this.reveal(e.matches), this.layoutItems(e.matches, !0), e.matches
    }, h.insert = function (t) {
        var e = this.addItems(t);
        if (e.length) {
            var i, n, o = e.length;
            for (i = 0; i < o; i++) n = e[i], this.element.appendChild(n.element);
            var s = this._filter(e).matches;
            for (i = 0; i < o; i++) e[i].isLayoutInstant = !0;
            for (this.arrange(), i = 0; i < o; i++) delete e[i].isLayoutInstant;
            this.reveal(s)
        }
    };
    var p = h.remove;
    return h.remove = function (t) {
        t = o.makeArray(t);
        var e = this.getItems(t);
        p.call(this, t);
        for (var i = e && e.length, n = 0; i && n < i; n++) {
            var s = e[n];
            o.removeFrom(this.filteredItems, s)
        }
    }, h.shuffle = function () {
        for (var t = 0; t < this.items.length; t++) {
            var e = this.items[t];
            e.sortData.random = Math.random()
        }
        this.options.sortBy = "random", this._sort(), this._layout()
    }, h._noTransition = function (t, e) {
        var i = this.options.transitionDuration;
        this.options.transitionDuration = 0;
        var n = t.apply(this, e);
        return this.options.transitionDuration = i, n
    }, h.getFilteredItemElements = function () {
        return this.filteredItems.map(function (t) {
            return t.element
        })
    }, c
}),
function (t, e) {
    "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == typeof module && module.exports ? module.exports = e() : t.EvEmitter = e()
}(this, function () {
    function t() {}
    var e = t.prototype;
    return e.on = function (t, e) {
        if (t && e) {
            var i = this._events = this._events || {},
                n = i[t] = i[t] || [];
            return -1 == n.indexOf(e) && n.push(e), this
        }
    }, e.once = function (t, e) {
        if (t && e) {
            this.on(t, e);
            var i = this._onceEvents = this._onceEvents || {},
                n = i[t] = i[t] || [];
            return n[e] = !0, this
        }
    }, e.off = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
            var n = i.indexOf(e);
            return -1 != n && i.splice(n, 1), this
        }
    }, e.emitEvent = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
            var n = 0,
                o = i[n];
            e = e || [];
            for (var s = this._onceEvents && this._onceEvents[t]; o;) {
                var r = s && s[o];
                r && (this.off(t, o), delete s[o]), o.apply(this, e), n += r ? 0 : 1, o = i[n]
            }
            return this
        }
    }, t
}),
function (t, e) {
    "use strict";
    "function" == typeof define && define.amd ? define(["ev-emitter/ev-emitter"], function (i) {
        return e(t, i)
    }) : "object" == typeof module && module.exports ? module.exports = e(t, require("ev-emitter")) : t.imagesLoaded = e(t, t.EvEmitter)
}(window, function (t, e) {
    function i(t, e) {
        for (var i in e) t[i] = e[i];
        return t
    }

    function n(t) {
        var e = [];
        if (Array.isArray(t)) e = t;
        else if ("number" == typeof t.length)
            for (var i = 0; i < t.length; i++) e.push(t[i]);
        else e.push(t);
        return e
    }

    function o(t, e, s) {
        return this instanceof o ? ("string" == typeof t && (t = document.querySelectorAll(t)), this.elements = n(t), this.options = i({}, this.options), "function" == typeof e ? s = e : i(this.options, e), s && this.on("always", s), this.getImages(), a && (this.jqDeferred = new a.Deferred), void setTimeout(function () {
            this.check()
        }.bind(this))) : new o(t, e, s)
    }

    function s(t) {
        this.img = t
    }

    function r(t, e) {
        this.url = t, this.element = e, this.img = new Image
    }
    var a = t.jQuery,
        l = t.console;
    o.prototype = Object.create(e.prototype), o.prototype.options = {}, o.prototype.getImages = function () {
        this.images = [], this.elements.forEach(this.addElementImages, this)
    }, o.prototype.addElementImages = function (t) {
        "IMG" == t.nodeName && this.addImage(t), !0 === this.options.background && this.addElementBackgroundImages(t);
        var e = t.nodeType;
        if (e && u[e]) {
            for (var i = t.querySelectorAll("img"), n = 0; n < i.length; n++) {
                var o = i[n];
                this.addImage(o)
            }
            if ("string" == typeof this.options.background) {
                var s = t.querySelectorAll(this.options.background);
                for (n = 0; n < s.length; n++) {
                    var r = s[n];
                    this.addElementBackgroundImages(r)
                }
            }
        }
    };
    var u = {
        1: !0,
        9: !0,
        11: !0
    };
    return o.prototype.addElementBackgroundImages = function (t) {
        var e = getComputedStyle(t);
        if (e)
            for (var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(e.backgroundImage); null !== n;) {
                var o = n && n[2];
                o && this.addBackground(o, t), n = i.exec(e.backgroundImage)
            }
    }, o.prototype.addImage = function (t) {
        var e = new s(t);
        this.images.push(e)
    }, o.prototype.addBackground = function (t, e) {
        var i = new r(t, e);
        this.images.push(i)
    }, o.prototype.check = function () {
        function t(t, i, n) {
            setTimeout(function () {
                e.progress(t, i, n)
            })
        }
        var e = this;
        return this.progressedCount = 0, this.hasAnyBroken = !1, this.images.length ? void this.images.forEach(function (e) {
            e.once("progress", t), e.check()
        }) : void this.complete()
    }, o.prototype.progress = function (t, e, i) {
        this.progressedCount++, this.hasAnyBroken = this.hasAnyBroken || !t.isLoaded, this.emitEvent("progress", [this, t, e]), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, t), this.progressedCount == this.images.length && this.complete(), this.options.debug && l && l.log("progress: " + i, t, e)
    }, o.prototype.complete = function () {
        var t = this.hasAnyBroken ? "fail" : "done";
        if (this.isComplete = !0, this.emitEvent(t, [this]), this.emitEvent("always", [this]), this.jqDeferred) {
            var e = this.hasAnyBroken ? "reject" : "resolve";
            this.jqDeferred[e](this)
        }
    }, s.prototype = Object.create(e.prototype), s.prototype.check = function () {
        var t = this.getIsImageComplete();
        return t ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image, this.proxyImage.addEventListener("load", this), this.proxyImage.addEventListener("error", this), this.img.addEventListener("load", this), this.img.addEventListener("error", this), void(this.proxyImage.src = this.img.src))
    }, s.prototype.getIsImageComplete = function () {
        return this.img.complete && void 0 !== this.img.naturalWidth
    }, s.prototype.confirm = function (t, e) {
        this.isLoaded = t, this.emitEvent("progress", [this, this.img, e])
    }, s.prototype.handleEvent = function (t) {
        var e = "on" + t.type;
        this[e] && this[e](t)
    }, s.prototype.onload = function () {
        this.confirm(!0, "onload"), this.unbindEvents()
    }, s.prototype.onerror = function () {
        this.confirm(!1, "onerror"), this.unbindEvents()
    }, s.prototype.unbindEvents = function () {
        this.proxyImage.removeEventListener("load", this), this.proxyImage.removeEventListener("error", this), this.img.removeEventListener("load", this), this.img.removeEventListener("error", this)
    }, r.prototype = Object.create(s.prototype), r.prototype.check = function () {
        this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.url;
        var t = this.getIsImageComplete();
        t && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents())
    }, r.prototype.unbindEvents = function () {
        this.img.removeEventListener("load", this), this.img.removeEventListener("error", this)
    }, r.prototype.confirm = function (t, e) {
        this.isLoaded = t, this.emitEvent("progress", [this, this.element, e])
    }, o.makeJQueryPlugin = function (e) {
        e = e || t.jQuery, e && (a = e, a.fn.imagesLoaded = function (t, e) {
            var i = new o(this, t, e);
            return i.jqDeferred.promise(a(this))
        })
    }, o.makeJQueryPlugin(), o
}),
function (t, e, i, n) {
    function o(e, i) {
        this.settings = null, this.options = t.extend({}, o.Defaults, i), this.$element = t(e), this._handlers = {}, this._plugins = {}, this._supress = {}, this._current = null, this._speed = null, this._coordinates = [], this._breakpoint = null, this._width = null, this._items = [], this._clones = [], this._mergers = [], this._widths = [], this._invalidated = {}, this._pipe = [], this._drag = {
            time: null,
            target: null,
            pointer: null,
            stage: {
                start: null,
                current: null
            },
            direction: null
        }, this._states = {
            current: {},
            tags: {
                initializing: ["busy"],
                animating: ["busy"],
                dragging: ["interacting"]
            }
        }, t.each(["onResize", "onThrottledResize"], t.proxy(function (e, i) {
            this._handlers[i] = t.proxy(this[i], this)
        }, this)), t.each(o.Plugins, t.proxy(function (t, e) {
            this._plugins[t.charAt(0).toLowerCase() + t.slice(1)] = new e(this)
        }, this)), t.each(o.Workers, t.proxy(function (e, i) {
            this._pipe.push({
                filter: i.filter,
                run: t.proxy(i.run, this)
            })
        }, this)), this.setup(), this.initialize()
    }
    o.Defaults = {
        items: 3,
        loop: !1,
        center: !1,
        rewind: !1,
        checkVisibility: !0,
        mouseDrag: !0,
        touchDrag: !0,
        pullDrag: !0,
        freeDrag: !1,
        margin: 0,
        stagePadding: 0,
        merge: !1,
        mergeFit: !0,
        autoWidth: !1,
        startPosition: 0,
        rtl: !1,
        smartSpeed: 250,
        fluidSpeed: !1,
        dragEndSpeed: !1,
        responsive: {},
        responsiveRefreshRate: 200,
        responsiveBaseElement: e,
        fallbackEasing: "swing",
        slideTransition: "",
        info: !1,
        nestedItemSelector: !1,
        itemElement: "div",
        stageElement: "div",
        refreshClass: "owl-refresh",
        loadedClass: "owl-loaded",
        loadingClass: "owl-loading",
        rtlClass: "owl-rtl",
        responsiveClass: "owl-responsive",
        dragClass: "owl-drag",
        itemClass: "owl-item",
        stageClass: "owl-stage",
        stageOuterClass: "owl-stage-outer",
        grabClass: "owl-grab"
    }, o.Width = {
        Default: "default",
        Inner: "inner",
        Outer: "outer"
    }, o.Type = {
        Event: "event",
        State: "state"
    }, o.Plugins = {}, o.Workers = [{
        filter: ["width", "settings"],
        run: function () {
            this._width = this.$element.width()
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function (t) {
            t.current = this._items && this._items[this.relative(this._current)]
        }
    }, {
        filter: ["items", "settings"],
        run: function () {
            this.$stage.children(".cloned").remove()
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function (t) {
            var e = this.settings.margin || "",
                i = !this.settings.autoWidth,
                n = this.settings.rtl,
                o = {
                    width: "auto",
                    "margin-left": n ? e : "",
                    "margin-right": n ? "" : e
                };
            !i && this.$stage.children().css(o), t.css = o
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function (t) {
            var e = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
                i = null,
                n = this._items.length,
                o = !this.settings.autoWidth,
                s = [];
            for (t.items = {
                    merge: !1,
                    width: e
                }; n--;) i = this._mergers[n], i = this.settings.mergeFit && Math.min(i, this.settings.items) || i, t.items.merge = i > 1 || t.items.merge, s[n] = o ? e * i : this._items[n].width();
            this._widths = s
        }
    }, {
        filter: ["items", "settings"],
        run: function () {
            var e = [],
                i = this._items,
                n = this.settings,
                o = Math.max(2 * n.items, 4),
                s = 2 * Math.ceil(i.length / 2),
                r = n.loop && i.length ? n.rewind ? o : Math.max(o, s) : 0,
                a = "",
                l = "";
            for (r /= 2; r > 0;) e.push(this.normalize(e.length / 2, !0)), a += i[e[e.length - 1]][0].outerHTML, e.push(this.normalize(i.length - 1 - (e.length - 1) / 2, !0)), l = i[e[e.length - 1]][0].outerHTML + l, r -= 1;
            this._clones = e, t(a).addClass("cloned").appendTo(this.$stage), t(l).addClass("cloned").prependTo(this.$stage)
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function () {
            for (var t = this.settings.rtl ? 1 : -1, e = this._clones.length + this._items.length, i = -1, n = 0, o = 0, s = []; ++i < e;) n = s[i - 1] || 0, o = this._widths[this.relative(i)] + this.settings.margin, s.push(n + o * t);
            this._coordinates = s
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function () {
            var t = this.settings.stagePadding,
                e = this._coordinates,
                i = {
                    width: Math.ceil(Math.abs(e[e.length - 1])) + 2 * t,
                    "padding-left": t || "",
                    "padding-right": t || ""
                };
            this.$stage.css(i)
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function (t) {
            var e = this._coordinates.length,
                i = !this.settings.autoWidth,
                n = this.$stage.children();
            if (i && t.items.merge)
                for (; e--;) t.css.width = this._widths[this.relative(e)], n.eq(e).css(t.css);
            else i && (t.css.width = t.items.width, n.css(t.css))
        }
    }, {
        filter: ["items"],
        run: function () {
            this._coordinates.length < 1 && this.$stage.removeAttr("style")
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function (t) {
            t.current = t.current ? this.$stage.children().index(t.current) : 0, t.current = Math.max(this.minimum(), Math.min(this.maximum(), t.current)), this.reset(t.current)
        }
    }, {
        filter: ["position"],
        run: function () {
            this.animate(this.coordinates(this._current))
        }
    }, {
        filter: ["width", "position", "items", "settings"],
        run: function () {
            var t, e, i, n, o = this.settings.rtl ? 1 : -1,
                s = 2 * this.settings.stagePadding,
                r = this.coordinates(this.current()) + s,
                a = r + this.width() * o,
                l = [];
            for (i = 0, n = this._coordinates.length; i < n; i++) t = this._coordinates[i - 1] || 0, e = Math.abs(this._coordinates[i]) + s * o, (this.op(t, "<=", r) && this.op(t, ">", a) || this.op(e, "<", r) && this.op(e, ">", a)) && l.push(i);
            this.$stage.children(".active").removeClass("active"), this.$stage.children(":eq(" + l.join("), :eq(") + ")").addClass("active"), this.$stage.children(".center").removeClass("center"), this.settings.center && this.$stage.children().eq(this.current()).addClass("center")
        }
    }], o.prototype.initializeStage = function () {
        this.$stage = this.$element.find("." + this.settings.stageClass), this.$stage.length || (this.$element.addClass(this.options.loadingClass), this.$stage = t("<" + this.settings.stageElement + ">", {
            class: this.settings.stageClass
        }).wrap(t("<div/>", {
            class: this.settings.stageOuterClass
        })), this.$element.append(this.$stage.parent()))
    }, o.prototype.initializeItems = function () {
        var e = this.$element.find(".owl-item");
        if (e.length) return this._items = e.get().map(function (e) {
            return t(e)
        }), this._mergers = this._items.map(function () {
            return 1
        }), void this.refresh();
        this.replace(this.$element.children().not(this.$stage.parent())), this.isVisible() ? this.refresh() : this.invalidate("width"), this.$element.removeClass(this.options.loadingClass).addClass(this.options.loadedClass)
    }, o.prototype.initialize = function () {
        var t, e, i;
        this.enter("initializing"), this.trigger("initialize"), this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl), this.settings.autoWidth && !this.is("pre-loading") && (t = this.$element.find("img"), e = this.settings.nestedItemSelector ? "." + this.settings.nestedItemSelector : n, i = this.$element.children(e).width(), t.length && i <= 0 && this.preloadAutoWidthImages(t)), this.initializeStage(), this.initializeItems(), this.registerEventHandlers(), this.leave("initializing"), this.trigger("initialized")
    }, o.prototype.isVisible = function () {
        return !this.settings.checkVisibility || this.$element.is(":visible")
    }, o.prototype.setup = function () {
        var e = this.viewport(),
            i = this.options.responsive,
            n = -1,
            o = null;
        i ? (t.each(i, function (t) {
            t <= e && t > n && (n = Number(t))
        }), o = t.extend({}, this.options, i[n]), "function" == typeof o.stagePadding && (o.stagePadding = o.stagePadding()), delete o.responsive, o.responsiveClass && this.$element.attr("class", this.$element.attr("class").replace(new RegExp("(" + this.options.responsiveClass + "-)\\S+\\s", "g"), "$1" + n))) : o = t.extend({}, this.options), this.trigger("change", {
            property: {
                name: "settings",
                value: o
            }
        }), this._breakpoint = n, this.settings = o, this.invalidate("settings"), this.trigger("changed", {
            property: {
                name: "settings",
                value: this.settings
            }
        })
    }, o.prototype.optionsLogic = function () {
        this.settings.autoWidth && (this.settings.stagePadding = !1, this.settings.merge = !1)
    }, o.prototype.prepare = function (e) {
        var i = this.trigger("prepare", {
            content: e
        });
        return i.data || (i.data = t("<" + this.settings.itemElement + "/>").addClass(this.options.itemClass).append(e)), this.trigger("prepared", {
            content: i.data
        }), i.data
    }, o.prototype.update = function () {
        for (var e = 0, i = this._pipe.length, n = t.proxy(function (t) {
                return this[t]
            }, this._invalidated), o = {}; e < i;)(this._invalidated.all || t.grep(this._pipe[e].filter, n).length > 0) && this._pipe[e].run(o), e++;
        this._invalidated = {}, !this.is("valid") && this.enter("valid")
    }, o.prototype.width = function (t) {
        switch (t = t || o.Width.Default) {
            case o.Width.Inner:
            case o.Width.Outer:
                return this._width;
            default:
                return this._width - 2 * this.settings.stagePadding + this.settings.margin
        }
    }, o.prototype.refresh = function () {
        this.enter("refreshing"), this.trigger("refresh"), this.setup(), this.optionsLogic(), this.$element.addClass(this.options.refreshClass), this.update(), this.$element.removeClass(this.options.refreshClass), this.leave("refreshing"), this.trigger("refreshed")
    }, o.prototype.onThrottledResize = function () {
        e.clearTimeout(this.resizeTimer), this.resizeTimer = e.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate)
    }, o.prototype.onResize = function () {
        return !!this._items.length && this._width !== this.$element.width() && !!this.isVisible() && (this.enter("resizing"), this.trigger("resize").isDefaultPrevented() ? (this.leave("resizing"), !1) : (this.invalidate("width"), this.refresh(), this.leave("resizing"), void this.trigger("resized")))
    }, o.prototype.registerEventHandlers = function () {
        t.support.transition && this.$stage.on(t.support.transition.end + ".owl.core", t.proxy(this.onTransitionEnd, this)), !1 !== this.settings.responsive && this.on(e, "resize", this._handlers.onThrottledResize), this.settings.mouseDrag && (this.$element.addClass(this.options.dragClass), this.$stage.on("mousedown.owl.core", t.proxy(this.onDragStart, this)), this.$stage.on("dragstart.owl.core selectstart.owl.core", function () {
            return !1
        })), this.settings.touchDrag && (this.$stage.on("touchstart.owl.core", t.proxy(this.onDragStart, this)), this.$stage.on("touchcancel.owl.core", t.proxy(this.onDragEnd, this)))
    }, o.prototype.onDragStart = function (e) {
        var n = null;
        3 !== e.which && (t.support.transform ? (n = this.$stage.css("transform").replace(/.*\(|\)| /g, "").split(","), n = {
            x: n[16 === n.length ? 12 : 4],
            y: n[16 === n.length ? 13 : 5]
        }) : (n = this.$stage.position(), n = {
            x: this.settings.rtl ? n.left + this.$stage.width() - this.width() + this.settings.margin : n.left,
            y: n.top
        }), this.is("animating") && (t.support.transform ? this.animate(n.x) : this.$stage.stop(), this.invalidate("position")), this.$element.toggleClass(this.options.grabClass, "mousedown" === e.type), this.speed(0), this._drag.time = (new Date).getTime(), this._drag.target = t(e.target), this._drag.stage.start = n, this._drag.stage.current = n, this._drag.pointer = this.pointer(e), t(i).on("mouseup.owl.core touchend.owl.core", t.proxy(this.onDragEnd, this)), t(i).one("mousemove.owl.core touchmove.owl.core", t.proxy(function (e) {
            var n = this.difference(this._drag.pointer, this.pointer(e));
            t(i).on("mousemove.owl.core touchmove.owl.core", t.proxy(this.onDragMove, this)), Math.abs(n.x) < Math.abs(n.y) && this.is("valid") || (e.preventDefault(), this.enter("dragging"), this.trigger("drag"))
        }, this)))
    }, o.prototype.onDragMove = function (t) {
        var e = null,
            i = null,
            n = null,
            o = this.difference(this._drag.pointer, this.pointer(t)),
            s = this.difference(this._drag.stage.start, o);
        this.is("dragging") && (t.preventDefault(), this.settings.loop ? (e = this.coordinates(this.minimum()), i = this.coordinates(this.maximum() + 1) - e, s.x = ((s.x - e) % i + i) % i + e) : (e = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum()), i = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum()), n = this.settings.pullDrag ? -1 * o.x / 5 : 0, s.x = Math.max(Math.min(s.x, e + n), i + n)), this._drag.stage.current = s, this.animate(s.x))
    }, o.prototype.onDragEnd = function (e) {
        var n = this.difference(this._drag.pointer, this.pointer(e)),
            o = this._drag.stage.current,
            s = n.x > 0 ^ this.settings.rtl ? "left" : "right";
        t(i).off(".owl.core"), this.$element.removeClass(this.options.grabClass), (0 !== n.x && this.is("dragging") || !this.is("valid")) && (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed), this.current(this.closest(o.x, 0 !== n.x ? s : this._drag.direction)), this.invalidate("position"), this.update(), this._drag.direction = s, (Math.abs(n.x) > 3 || (new Date).getTime() - this._drag.time > 300) && this._drag.target.one("click.owl.core", function () {
            return !1
        })), this.is("dragging") && (this.leave("dragging"), this.trigger("dragged"))
    }, o.prototype.closest = function (e, i) {
        var o = -1,
            s = 30,
            r = this.width(),
            a = this.coordinates();
        return this.settings.freeDrag || t.each(a, t.proxy(function (t, l) {
            return "left" === i && e > l - s && e < l + s ? o = t : "right" === i && e > l - r - s && e < l - r + s ? o = t + 1 : this.op(e, "<", l) && this.op(e, ">", a[t + 1] !== n ? a[t + 1] : l - r) && (o = "left" === i ? t + 1 : t), -1 === o
        }, this)), this.settings.loop || (this.op(e, ">", a[this.minimum()]) ? o = e = this.minimum() : this.op(e, "<", a[this.maximum()]) && (o = e = this.maximum())), o
    }, o.prototype.animate = function (e) {
        var i = this.speed() > 0;
        this.is("animating") && this.onTransitionEnd(), i && (this.enter("animating"), this.trigger("translate")), t.support.transform3d && t.support.transition ? this.$stage.css({
            transform: "translate3d(" + e + "px,0px,0px)",
            transition: this.speed() / 1e3 + "s" + (this.settings.slideTransition ? " " + this.settings.slideTransition : "")
        }) : i ? this.$stage.animate({
            left: e + "px"
        }, this.speed(), this.settings.fallbackEasing, t.proxy(this.onTransitionEnd, this)) : this.$stage.css({
            left: e + "px"
        })
    }, o.prototype.is = function (t) {
        return this._states.current[t] && this._states.current[t] > 0
    }, o.prototype.current = function (t) {
        if (t === n) return this._current;
        if (0 === this._items.length) return n;
        if (t = this.normalize(t), this._current !== t) {
            var e = this.trigger("change", {
                property: {
                    name: "position",
                    value: t
                }
            });
            e.data !== n && (t = this.normalize(e.data)), this._current = t, this.invalidate("position"), this.trigger("changed", {
                property: {
                    name: "position",
                    value: this._current
                }
            })
        }
        return this._current
    }, o.prototype.invalidate = function (e) {
        return "string" === t.type(e) && (this._invalidated[e] = !0, this.is("valid") && this.leave("valid")), t.map(this._invalidated, function (t, e) {
            return e
        })
    }, o.prototype.reset = function (t) {
        (t = this.normalize(t)) !== n && (this._speed = 0, this._current = t, this.suppress(["translate", "translated"]), this.animate(this.coordinates(t)), this.release(["translate", "translated"]))
    }, o.prototype.normalize = function (t, e) {
        var i = this._items.length,
            o = e ? 0 : this._clones.length;
        return !this.isNumeric(t) || i < 1 ? t = n : (t < 0 || t >= i + o) && (t = ((t - o / 2) % i + i) % i + o / 2), t
    }, o.prototype.relative = function (t) {
        return t -= this._clones.length / 2, this.normalize(t, !0)
    }, o.prototype.maximum = function (t) {
        var e, i, n, o = this.settings,
            s = this._coordinates.length;
        if (o.loop) s = this._clones.length / 2 + this._items.length - 1;
        else if (o.autoWidth || o.merge) {
            if (e = this._items.length)
                for (i = this._items[--e].width(), n = this.$element.width(); e-- && !((i += this._items[e].width() + this.settings.margin) > n););
            s = e + 1
        } else s = o.center ? this._items.length - 1 : this._items.length - o.items;
        return t && (s -= this._clones.length / 2), Math.max(s, 0)
    }, o.prototype.minimum = function (t) {
        return t ? 0 : this._clones.length / 2
    }, o.prototype.items = function (t) {
        return t === n ? this._items.slice() : (t = this.normalize(t, !0), this._items[t])
    }, o.prototype.mergers = function (t) {
        return t === n ? this._mergers.slice() : (t = this.normalize(t, !0), this._mergers[t])
    }, o.prototype.clones = function (e) {
        var i = this._clones.length / 2,
            o = i + this._items.length,
            s = function (t) {
                return t % 2 == 0 ? o + t / 2 : i - (t + 1) / 2
            };
        return e === n ? t.map(this._clones, function (t, e) {
            return s(e)
        }) : t.map(this._clones, function (t, i) {
            return t === e ? s(i) : null
        })
    }, o.prototype.speed = function (t) {
        return t !== n && (this._speed = t), this._speed
    }, o.prototype.coordinates = function (e) {
        var i, o = 1,
            s = e - 1;
        return e === n ? t.map(this._coordinates, t.proxy(function (t, e) {
            return this.coordinates(e)
        }, this)) : (this.settings.center ? (this.settings.rtl && (o = -1, s = e + 1), i = this._coordinates[e], i += (this.width() - i + (this._coordinates[s] || 0)) / 2 * o) : i = this._coordinates[s] || 0, i = Math.ceil(i))
    }, o.prototype.duration = function (t, e, i) {
        return 0 === i ? 0 : Math.min(Math.max(Math.abs(e - t), 1), 6) * Math.abs(i || this.settings.smartSpeed)
    }, o.prototype.to = function (t, e) {
        var i = this.current(),
            n = null,
            o = t - this.relative(i),
            s = (o > 0) - (o < 0),
            r = this._items.length,
            a = this.minimum(),
            l = this.maximum();
        this.settings.loop ? (!this.settings.rewind && Math.abs(o) > r / 2 && (o += -1 * s * r), t = i + o, (n = ((t - a) % r + r) % r + a) !== t && n - o <= l && n - o > 0 && (i = n - o, t = n, this.reset(i))) : this.settings.rewind ? (l += 1, t = (t % l + l) % l) : t = Math.max(a, Math.min(l, t)), this.speed(this.duration(i, t, e)), this.current(t), this.isVisible() && this.update()
    }, o.prototype.next = function (t) {
        t = t || !1, this.to(this.relative(this.current()) + 1, t)
    }, o.prototype.prev = function (t) {
        t = t || !1, this.to(this.relative(this.current()) - 1, t)
    }, o.prototype.onTransitionEnd = function (t) {
        if (t !== n && (t.stopPropagation(), (t.target || t.srcElement || t.originalTarget) !== this.$stage.get(0))) return !1;
        this.leave("animating"), this.trigger("translated")
    }, o.prototype.viewport = function () {
        var n;
        return this.options.responsiveBaseElement !== e ? n = t(this.options.responsiveBaseElement).width() : e.innerWidth ? n = e.innerWidth : i.documentElement && i.documentElement.clientWidth ? n = i.documentElement.clientWidth : console.warn("Can not detect viewport width."), n
    }, o.prototype.replace = function (e) {
        this.$stage.empty(), this._items = [], e && (e = e instanceof jQuery ? e : t(e)), this.settings.nestedItemSelector && (e = e.find("." + this.settings.nestedItemSelector)), e.filter(function () {
            return 1 === this.nodeType
        }).each(t.proxy(function (t, e) {
            e = this.prepare(e), this.$stage.append(e), this._items.push(e), this._mergers.push(1 * e.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)
        }, this)), this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0), this.invalidate("items")
    }, o.prototype.add = function (e, i) {
        var o = this.relative(this._current);
        i = i === n ? this._items.length : this.normalize(i, !0), e = e instanceof jQuery ? e : t(e), this.trigger("add", {
            content: e,
            position: i
        }), e = this.prepare(e), 0 === this._items.length || i === this._items.length ? (0 === this._items.length && this.$stage.append(e), 0 !== this._items.length && this._items[i - 1].after(e), this._items.push(e), this._mergers.push(1 * e.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)) : (this._items[i].before(e), this._items.splice(i, 0, e), this._mergers.splice(i, 0, 1 * e.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)), this._items[o] && this.reset(this._items[o].index()), this.invalidate("items"), this.trigger("added", {
            content: e,
            position: i
        })
    }, o.prototype.remove = function (t) {
        (t = this.normalize(t, !0)) !== n && (this.trigger("remove", {
            content: this._items[t],
            position: t
        }), this._items[t].remove(), this._items.splice(t, 1), this._mergers.splice(t, 1), this.invalidate("items"), this.trigger("removed", {
            content: null,
            position: t
        }))
    }, o.prototype.preloadAutoWidthImages = function (e) {
        e.each(t.proxy(function (e, i) {
            this.enter("pre-loading"), i = t(i), t(new Image).one("load", t.proxy(function (t) {
                i.attr("src", t.target.src), i.css("opacity", 1), this.leave("pre-loading"), !this.is("pre-loading") && !this.is("initializing") && this.refresh()
            }, this)).attr("src", i.attr("src") || i.attr("data-src") || i.attr("data-src-retina"))
        }, this))
    }, o.prototype.destroy = function () {
        for (var n in this.$element.off(".owl.core"), this.$stage.off(".owl.core"), t(i).off(".owl.core"), !1 !== this.settings.responsive && (e.clearTimeout(this.resizeTimer), this.off(e, "resize", this._handlers.onThrottledResize)), this._plugins) this._plugins[n].destroy();
        this.$stage.children(".cloned").remove(), this.$stage.unwrap(), this.$stage.children().contents().unwrap(), this.$stage.children().unwrap(), this.$stage.remove(), this.$element.removeClass(this.options.refreshClass).removeClass(this.options.loadingClass).removeClass(this.options.loadedClass).removeClass(this.options.rtlClass).removeClass(this.options.dragClass).removeClass(this.options.grabClass).attr("class", this.$element.attr("class").replace(new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"), "")).removeData("owl.carousel")
    }, o.prototype.op = function (t, e, i) {
        var n = this.settings.rtl;
        switch (e) {
            case "<":
                return n ? t > i : t < i;
            case ">":
                return n ? t < i : t > i;
            case ">=":
                return n ? t <= i : t >= i;
            case "<=":
                return n ? t >= i : t <= i
        }
    }, o.prototype.on = function (t, e, i, n) {
        t.addEventListener ? t.addEventListener(e, i, n) : t.attachEvent && t.attachEvent("on" + e, i)
    }, o.prototype.off = function (t, e, i, n) {
        t.removeEventListener ? t.removeEventListener(e, i, n) : t.detachEvent && t.detachEvent("on" + e, i)
    }, o.prototype.trigger = function (e, i, n, s, r) {
        var a = {
                item: {
                    count: this._items.length,
                    index: this.current()
                }
            },
            l = t.camelCase(t.grep(["on", e, n], function (t) {
                return t
            }).join("-").toLowerCase()),
            u = t.Event([e, "owl", n || "carousel"].join(".").toLowerCase(), t.extend({
                relatedTarget: this
            }, a, i));
        return this._supress[e] || (t.each(this._plugins, function (t, e) {
            e.onTrigger && e.onTrigger(u)
        }), this.register({
            type: o.Type.Event,
            name: e
        }), this.$element.trigger(u), this.settings && "function" == typeof this.settings[l] && this.settings[l].call(this, u)), u
    }, o.prototype.enter = function (e) {
        t.each([e].concat(this._states.tags[e] || []), t.proxy(function (t, e) {
            this._states.current[e] === n && (this._states.current[e] = 0), this._states.current[e]++
        }, this))
    }, o.prototype.leave = function (e) {
        t.each([e].concat(this._states.tags[e] || []), t.proxy(function (t, e) {
            this._states.current[e]--
        }, this))
    }, o.prototype.register = function (e) {
        if (e.type === o.Type.Event) {
            if (t.event.special[e.name] || (t.event.special[e.name] = {}), !t.event.special[e.name].owl) {
                var i = t.event.special[e.name]._default;
                t.event.special[e.name]._default = function (t) {
                    return !i || !i.apply || t.namespace && -1 !== t.namespace.indexOf("owl") ? t.namespace && t.namespace.indexOf("owl") > -1 : i.apply(this, arguments)
                }, t.event.special[e.name].owl = !0
            }
        } else e.type === o.Type.State && (this._states.tags[e.name] ? this._states.tags[e.name] = this._states.tags[e.name].concat(e.tags) : this._states.tags[e.name] = e.tags, this._states.tags[e.name] = t.grep(this._states.tags[e.name], t.proxy(function (i, n) {
            return t.inArray(i, this._states.tags[e.name]) === n
        }, this)))
    }, o.prototype.suppress = function (e) {
        t.each(e, t.proxy(function (t, e) {
            this._supress[e] = !0
        }, this))
    }, o.prototype.release = function (e) {
        t.each(e, t.proxy(function (t, e) {
            delete this._supress[e]
        }, this))
    }, o.prototype.pointer = function (t) {
        var i = {
            x: null,
            y: null
        };
        return t = t.originalEvent || t || e.event, t = t.touches && t.touches.length ? t.touches[0] : t.changedTouches && t.changedTouches.length ? t.changedTouches[0] : t, t.pageX ? (i.x = t.pageX, i.y = t.pageY) : (i.x = t.clientX, i.y = t.clientY), i
    }, o.prototype.isNumeric = function (t) {
        return !isNaN(parseFloat(t))
    }, o.prototype.difference = function (t, e) {
        return {
            x: t.x - e.x,
            y: t.y - e.y
        }
    }, t.fn.owlCarousel = function (e) {
        var i = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var n = t(this),
                s = n.data("owl.carousel");
            s || (s = new o(this, "object" == typeof e && e), n.data("owl.carousel", s), t.each(["next", "prev", "to", "destroy", "refresh", "replace", "add", "remove"], function (e, i) {
                s.register({
                    type: o.Type.Event,
                    name: i
                }), s.$element.on(i + ".owl.carousel.core", t.proxy(function (t) {
                    t.namespace && t.relatedTarget !== this && (this.suppress([i]), s[i].apply(this, [].slice.call(arguments, 1)), this.release([i]))
                }, s))
            })), "string" == typeof e && "_" !== e.charAt(0) && s[e].apply(s, i)
        })
    }, t.fn.owlCarousel.Constructor = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    var o = function (e) {
        this._core = e, this._interval = null, this._visible = null, this._handlers = {
            "initialized.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.settings.autoRefresh && this.watch()
            }, this)
        }, this._core.options = t.extend({}, o.Defaults, this._core.options), this._core.$element.on(this._handlers)
    };
    o.Defaults = {
        autoRefresh: !0,
        autoRefreshInterval: 500
    }, o.prototype.watch = function () {
        this._interval || (this._visible = this._core.isVisible(), this._interval = e.setInterval(t.proxy(this.refresh, this), this._core.settings.autoRefreshInterval))
    }, o.prototype.refresh = function () {
        this._core.isVisible() !== this._visible && (this._visible = !this._visible, this._core.$element.toggleClass("owl-hidden", !this._visible), this._visible && this._core.invalidate("width") && this._core.refresh())
    }, o.prototype.destroy = function () {
        var t, i;
        for (t in e.clearInterval(this._interval), this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (i in Object.getOwnPropertyNames(this)) "function" != typeof this[i] && (this[i] = null)
    }, t.fn.owlCarousel.Constructor.Plugins.AutoRefresh = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    var o = function (e) {
        this._core = e, this._loaded = [], this._handlers = {
            "initialized.owl.carousel change.owl.carousel resized.owl.carousel": t.proxy(function (e) {
                if (e.namespace && this._core.settings && this._core.settings.lazyLoad && (e.property && "position" == e.property.name || "initialized" == e.type)) {
                    var i = this._core.settings,
                        o = i.center && Math.ceil(i.items / 2) || i.items,
                        s = i.center && -1 * o || 0,
                        r = (e.property && e.property.value !== n ? e.property.value : this._core.current()) + s,
                        a = this._core.clones().length,
                        l = t.proxy(function (t, e) {
                            this.load(e)
                        }, this);
                    for (i.lazyLoadEager > 0 && (o += i.lazyLoadEager, i.loop && (r -= i.lazyLoadEager, o++)); s++ < o;) this.load(a / 2 + this._core.relative(r)), a && t.each(this._core.clones(this._core.relative(r)), l), r++
                }
            }, this)
        }, this._core.options = t.extend({}, o.Defaults, this._core.options), this._core.$element.on(this._handlers)
    };
    o.Defaults = {
        lazyLoad: !1,
        lazyLoadEager: 0
    }, o.prototype.load = function (i) {
        var n = this._core.$stage.children().eq(i),
            o = n && n.find(".owl-lazy");
        !o || t.inArray(n.get(0), this._loaded) > -1 || (o.each(t.proxy(function (i, n) {
            var o, s = t(n),
                r = e.devicePixelRatio > 1 && s.attr("data-src-retina") || s.attr("data-src") || s.attr("data-srcset");
            this._core.trigger("load", {
                element: s,
                url: r
            }, "lazy"), s.is("img") ? s.one("load.owl.lazy", t.proxy(function () {
                s.css("opacity", 1), this._core.trigger("loaded", {
                    element: s,
                    url: r
                }, "lazy")
            }, this)).attr("src", r) : s.is("source") ? s.one("load.owl.lazy", t.proxy(function () {
                this._core.trigger("loaded", {
                    element: s,
                    url: r
                }, "lazy")
            }, this)).attr("srcset", r) : (o = new Image, o.onload = t.proxy(function () {
                s.css({
                    "background-image": 'url("' + r + '")',
                    opacity: "1"
                }), this._core.trigger("loaded", {
                    element: s,
                    url: r
                }, "lazy")
            }, this), o.src = r)
        }, this)), this._loaded.push(n.get(0)))
    }, o.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this._core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, t.fn.owlCarousel.Constructor.Plugins.Lazy = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    var o = function (i) {
        this._core = i, this._previousHeight = null, this._handlers = {
            "initialized.owl.carousel refreshed.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.settings.autoHeight && this.update()
            }, this),
            "changed.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.settings.autoHeight && "position" === t.property.name && this.update()
            }, this),
            "loaded.owl.lazy": t.proxy(function (t) {
                t.namespace && this._core.settings.autoHeight && t.element.closest("." + this._core.settings.itemClass).index() === this._core.current() && this.update()
            }, this)
        }, this._core.options = t.extend({}, o.Defaults, this._core.options), this._core.$element.on(this._handlers), this._intervalId = null;
        var n = this;
        t(e).on("load", function () {
            n._core.settings.autoHeight && n.update()
        }), t(e).resize(function () {
            n._core.settings.autoHeight && (null != n._intervalId && clearTimeout(n._intervalId), n._intervalId = setTimeout(function () {
                n.update()
            }, 250))
        })
    };
    o.Defaults = {
        autoHeight: !1,
        autoHeightClass: "owl-height"
    }, o.prototype.update = function () {
        var e = this._core._current,
            i = e + this._core.settings.items,
            n = this._core.settings.lazyLoad,
            o = this._core.$stage.children().toArray().slice(e, i),
            s = [],
            r = 0;
        t.each(o, function (e, i) {
            s.push(t(i).height())
        }), r = Math.max.apply(null, s), r <= 1 && n && this._previousHeight && (r = this._previousHeight), this._previousHeight = r, this._core.$stage.parent().height(r).addClass(this._core.settings.autoHeightClass)
    }, o.prototype.destroy = function () {
        var t, e;
        for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, t.fn.owlCarousel.Constructor.Plugins.AutoHeight = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    var o = function (e) {
        this._core = e, this._videos = {}, this._playing = null, this._handlers = {
            "initialized.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.register({
                    type: "state",
                    name: "playing",
                    tags: ["interacting"]
                })
            }, this),
            "resize.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.settings.video && this.isInFullScreen() && t.preventDefault()
            }, this),
            "refreshed.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.is("resizing") && this._core.$stage.find(".cloned .owl-video-frame").remove()
            }, this),
            "changed.owl.carousel": t.proxy(function (t) {
                t.namespace && "position" === t.property.name && this._playing && this.stop()
            }, this),
            "prepared.owl.carousel": t.proxy(function (e) {
                if (e.namespace) {
                    var i = t(e.content).find(".owl-video");
                    i.length && (i.css("display", "none"), this.fetch(i, t(e.content)))
                }
            }, this)
        }, this._core.options = t.extend({}, o.Defaults, this._core.options), this._core.$element.on(this._handlers), this._core.$element.on("click.owl.video", ".owl-video-play-icon", t.proxy(function (t) {
            this.play(t)
        }, this))
    };
    o.Defaults = {
        video: !1,
        videoHeight: !1,
        videoWidth: !1
    }, o.prototype.fetch = function (t, e) {
        var i = t.attr("data-vimeo-id") ? "vimeo" : t.attr("data-vzaar-id") ? "vzaar" : "youtube",
            n = t.attr("data-vimeo-id") || t.attr("data-youtube-id") || t.attr("data-vzaar-id"),
            o = t.attr("data-width") || this._core.settings.videoWidth,
            s = t.attr("data-height") || this._core.settings.videoHeight,
            r = t.attr("href");
        if (!r) throw new Error("Missing video URL.");
        if (n = r.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/), n[3].indexOf("youtu") > -1) i = "youtube";
        else if (n[3].indexOf("vimeo") > -1) i = "vimeo";
        else {
            if (!(n[3].indexOf("vzaar") > -1)) throw new Error("Video URL not supported.");
            i = "vzaar"
        }
        n = n[6], this._videos[r] = {
            type: i,
            id: n,
            width: o,
            height: s
        }, e.attr("data-video", r), this.thumbnail(t, this._videos[r])
    }, o.prototype.thumbnail = function (e, i) {
        var n, o, s, r = i.width && i.height ? "width:" + i.width + "px;height:" + i.height + "px;" : "",
            a = e.find("img"),
            l = "src",
            u = "",
            c = this._core.settings,
            h = function (i) {
                o = '<div class="owl-video-play-icon"></div>', n = c.lazyLoad ? t("<div/>", {
                    class: "owl-video-tn " + u,
                    srcType: i
                }) : t("<div/>", {
                    class: "owl-video-tn",
                    style: "opacity:1;background-image:url(" + i + ")"
                }), e.after(n), e.after(o)
            };
        if (e.wrap(t("<div/>", {
                class: "owl-video-wrapper",
                style: r
            })), this._core.settings.lazyLoad && (l = "data-src", u = "owl-lazy"), a.length) return h(a.attr(l)), a.remove(), !1;
        "youtube" === i.type ? (s = "//img.youtube.com/vi/" + i.id + "/hqdefault.jpg", h(s)) : "vimeo" === i.type ? t.ajax({
            type: "GET",
            url: "//vimeo.com/api/v2/video/" + i.id + ".json",
            jsonp: "callback",
            dataType: "jsonp",
            success: function (t) {
                s = t[0].thumbnail_large, h(s)
            }
        }) : "vzaar" === i.type && t.ajax({
            type: "GET",
            url: "//vzaar.com/api/videos/" + i.id + ".json",
            jsonp: "callback",
            dataType: "jsonp",
            success: function (t) {
                s = t.framegrab_url, h(s)
            }
        })
    }, o.prototype.stop = function () {
        this._core.trigger("stop", null, "video"), this._playing.find(".owl-video-frame").remove(), this._playing.removeClass("owl-video-playing"), this._playing = null, this._core.leave("playing"), this._core.trigger("stopped", null, "video")
    }, o.prototype.play = function (e) {
        var i, n = t(e.target),
            o = n.closest("." + this._core.settings.itemClass),
            s = this._videos[o.attr("data-video")],
            r = s.width || "100%",
            a = s.height || this._core.$stage.height();
        this._playing || (this._core.enter("playing"), this._core.trigger("play", null, "video"), o = this._core.items(this._core.relative(o.index())), this._core.reset(o.index()), i = t('<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>'), i.attr("height", a), i.attr("width", r), "youtube" === s.type ? i.attr("src", "//www.youtube.com/embed/" + s.id + "?autoplay=1&rel=0&v=" + s.id) : "vimeo" === s.type ? i.attr("src", "//player.vimeo.com/video/" + s.id + "?autoplay=1") : "vzaar" === s.type && i.attr("src", "//view.vzaar.com/" + s.id + "/player?autoplay=true"), t(i).wrap('<div class="owl-video-frame" />').insertAfter(o.find(".owl-video")), this._playing = o.addClass("owl-video-playing"))
    }, o.prototype.isInFullScreen = function () {
        var e = i.fullscreenElement || i.mozFullScreenElement || i.webkitFullscreenElement;
        return e && t(e).parent().hasClass("owl-video-frame")
    }, o.prototype.destroy = function () {
        var t, e;
        for (t in this._core.$element.off("click.owl.video"), this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, t.fn.owlCarousel.Constructor.Plugins.Video = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    var o = function (e) {
        this.core = e, this.core.options = t.extend({}, o.Defaults, this.core.options), this.swapping = !0, this.previous = n, this.next = n, this.handlers = {
            "change.owl.carousel": t.proxy(function (t) {
                t.namespace && "position" == t.property.name && (this.previous = this.core.current(), this.next = t.property.value)
            }, this),
            "drag.owl.carousel dragged.owl.carousel translated.owl.carousel": t.proxy(function (t) {
                t.namespace && (this.swapping = "translated" == t.type)
            }, this),
            "translate.owl.carousel": t.proxy(function (t) {
                t.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn) && this.swap()
            }, this)
        }, this.core.$element.on(this.handlers)
    };
    o.Defaults = {
        animateOut: !1,
        animateIn: !1
    }, o.prototype.swap = function () {
        if (1 === this.core.settings.items && t.support.animation && t.support.transition) {
            this.core.speed(0);
            var e, i = t.proxy(this.clear, this),
                n = this.core.$stage.children().eq(this.previous),
                o = this.core.$stage.children().eq(this.next),
                s = this.core.settings.animateIn,
                r = this.core.settings.animateOut;
            this.core.current() !== this.previous && (r && (e = this.core.coordinates(this.previous) - this.core.coordinates(this.next), n.one(t.support.animation.end, i).css({
                left: e + "px"
            }).addClass("animated owl-animated-out").addClass(r)), s && o.one(t.support.animation.end, i).addClass("animated owl-animated-in").addClass(s))
        }
    }, o.prototype.clear = function (e) {
        t(e.target).css({
            left: ""
        }).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut), this.core.onTransitionEnd()
    }, o.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this.core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, t.fn.owlCarousel.Constructor.Plugins.Animate = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    var o = function (e) {
        this._core = e, this._call = null, this._time = 0, this._timeout = 0, this._paused = !0, this._handlers = {
            "changed.owl.carousel": t.proxy(function (t) {
                t.namespace && "settings" === t.property.name ? this._core.settings.autoplay ? this.play() : this.stop() : t.namespace && "position" === t.property.name && this._paused && (this._time = 0)
            }, this),
            "initialized.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.settings.autoplay && this.play()
            }, this),
            "play.owl.autoplay": t.proxy(function (t, e, i) {
                t.namespace && this.play(e, i)
            }, this),
            "stop.owl.autoplay": t.proxy(function (t) {
                t.namespace && this.stop()
            }, this),
            "mouseover.owl.autoplay": t.proxy(function () {
                this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause()
            }, this),
            "mouseleave.owl.autoplay": t.proxy(function () {
                this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.play()
            }, this),
            "touchstart.owl.core": t.proxy(function () {
                this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause()
            }, this),
            "touchend.owl.core": t.proxy(function () {
                this._core.settings.autoplayHoverPause && this.play()
            }, this)
        }, this._core.$element.on(this._handlers), this._core.options = t.extend({}, o.Defaults, this._core.options)
    };
    o.Defaults = {
        autoplay: !1,
        autoplayTimeout: 5e3,
        autoplayHoverPause: !1,
        autoplaySpeed: !1
    }, o.prototype._next = function (n) {
        this._call = e.setTimeout(t.proxy(this._next, this, n), this._timeout * (Math.round(this.read() / this._timeout) + 1) - this.read()), this._core.is("interacting") || i.hidden || this._core.next(n || this._core.settings.autoplaySpeed)
    }, o.prototype.read = function () {
        return (new Date).getTime() - this._time
    }, o.prototype.play = function (i, n) {
        var o;
        this._core.is("rotating") || this._core.enter("rotating"), i = i || this._core.settings.autoplayTimeout, o = Math.min(this._time % (this._timeout || i), i), this._paused ? (this._time = this.read(), this._paused = !1) : e.clearTimeout(this._call), this._time += this.read() % i - o, this._timeout = i, this._call = e.setTimeout(t.proxy(this._next, this, n), i - o)
    }, o.prototype.stop = function () {
        this._core.is("rotating") && (this._time = 0, this._paused = !0, e.clearTimeout(this._call), this._core.leave("rotating"))
    }, o.prototype.pause = function () {
        this._core.is("rotating") && !this._paused && (this._time = this.read(), this._paused = !0, e.clearTimeout(this._call))
    }, o.prototype.destroy = function () {
        var t, e;
        for (t in this.stop(), this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, t.fn.owlCarousel.Constructor.Plugins.autoplay = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    "use strict";
    var o = function (e) {
        this._core = e, this._initialized = !1, this._pages = [], this._controls = {}, this._templates = [], this.$element = this._core.$element, this._overrides = {
            next: this._core.next,
            prev: this._core.prev,
            to: this._core.to
        }, this._handlers = {
            "prepared.owl.carousel": t.proxy(function (e) {
                e.namespace && this._core.settings.dotsData && this._templates.push('<div class="' + this._core.settings.dotClass + '">' + t(e.content).find("[data-dot]").addBack("[data-dot]").attr("data-dot") + "</div>")
            }, this),
            "added.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.settings.dotsData && this._templates.splice(t.position, 0, this._templates.pop())
            }, this),
            "remove.owl.carousel": t.proxy(function (t) {
                t.namespace && this._core.settings.dotsData && this._templates.splice(t.position, 1)
            }, this),
            "changed.owl.carousel": t.proxy(function (t) {
                t.namespace && "position" == t.property.name && this.draw()
            }, this),
            "initialized.owl.carousel": t.proxy(function (t) {
                t.namespace && !this._initialized && (this._core.trigger("initialize", null, "navigation"), this.initialize(), this.update(), this.draw(), this._initialized = !0, this._core.trigger("initialized", null, "navigation"))
            }, this),
            "refreshed.owl.carousel": t.proxy(function (t) {
                t.namespace && this._initialized && (this._core.trigger("refresh", null, "navigation"), this.update(), this.draw(), this._core.trigger("refreshed", null, "navigation"))
            }, this)
        }, this._core.options = t.extend({}, o.Defaults, this._core.options), this.$element.on(this._handlers)
    };
    o.Defaults = {
        nav: !1,
        navText: ['<span aria-label="Previous">&#x2039;</span>', '<span aria-label="Next">&#x203a;</span>'],
        navSpeed: !1,
        navElement: 'button type="button" role="presentation"',
        navContainer: !1,
        navContainerClass: "owl-nav",
        navClass: ["owl-prev", "owl-next"],
        slideBy: 1,
        dotClass: "owl-dot",
        dotsClass: "owl-dots",
        dots: !0,
        dotsEach: !1,
        dotsData: !1,
        dotsSpeed: !1,
        dotsContainer: !1
    }, o.prototype.initialize = function () {
        var e, i = this._core.settings;
        for (e in this._controls.$relative = (i.navContainer ? t(i.navContainer) : t("<div>").addClass(i.navContainerClass).appendTo(this.$element)).addClass("disabled"), this._controls.$previous = t("<" + i.navElement + ">").addClass(i.navClass[0]).html(i.navText[0]).prependTo(this._controls.$relative).on("click", t.proxy(function (t) {
                this.prev(i.navSpeed)
            }, this)), this._controls.$next = t("<" + i.navElement + ">").addClass(i.navClass[1]).html(i.navText[1]).appendTo(this._controls.$relative).on("click", t.proxy(function (t) {
                this.next(i.navSpeed)
            }, this)), i.dotsData || (this._templates = [t('<button role="button">').addClass(i.dotClass).append(t("<span>")).prop("outerHTML")]), this._controls.$absolute = (i.dotsContainer ? t(i.dotsContainer) : t("<div>").addClass(i.dotsClass).appendTo(this.$element)).addClass("disabled"), this._controls.$absolute.on("click", "button", t.proxy(function (e) {
                var n = t(e.target).parent().is(this._controls.$absolute) ? t(e.target).index() : t(e.target).parent().index();
                e.preventDefault(), this.to(n, i.dotsSpeed)
            }, this)), this._overrides) this._core[e] = t.proxy(this[e], this)
    }, o.prototype.destroy = function () {
        var t, e, i, n, o;
        for (t in o = this._core.settings, this._handlers) this.$element.off(t, this._handlers[t]);
        for (e in this._controls) "$relative" === e && o.navContainer ? this._controls[e].html("") : this._controls[e].remove();
        for (n in this.overides) this._core[n] = this._overrides[n];
        for (i in Object.getOwnPropertyNames(this)) "function" != typeof this[i] && (this[i] = null)
    }, o.prototype.update = function () {
        var t, e, i = this._core.clones().length / 2,
            n = i + this._core.items().length,
            o = this._core.maximum(!0),
            s = this._core.settings,
            r = s.center || s.autoWidth || s.dotsData ? 1 : s.dotsEach || s.items;
        if ("page" !== s.slideBy && (s.slideBy = Math.min(s.slideBy, s.items)), s.dots || "page" == s.slideBy)
            for (this._pages = [], t = i, e = 0; t < n; t++) {
                if (e >= r || 0 === e) {
                    if (this._pages.push({
                            start: Math.min(o, t - i),
                            end: t - i + r - 1
                        }), Math.min(o, t - i) === o) break;
                    e = 0
                }
                e += this._core.mergers(this._core.relative(t))
            }
    }, o.prototype.draw = function () {
        var e, i = this._core.settings,
            n = this._core.items().length <= i.items,
            o = this._core.relative(this._core.current()),
            s = i.loop || i.rewind;
        this._controls.$relative.toggleClass("disabled", !i.nav || n), i.nav && (this._controls.$previous.toggleClass("disabled", !s && o <= this._core.minimum(!0)), this._controls.$next.toggleClass("disabled", !s && o >= this._core.maximum(!0))), this._controls.$absolute.toggleClass("disabled", !i.dots || n), i.dots && (e = this._pages.length - this._controls.$absolute.children().length, i.dotsData && 0 !== e ? this._controls.$absolute.html(this._templates.join("")) : e > 0 ? this._controls.$absolute.append(new Array(e + 1).join(this._templates[0])) : e < 0 && this._controls.$absolute.children().slice(e).remove(), this._controls.$absolute.find(".active").removeClass("active"), this._controls.$absolute.children().eq(t.inArray(this.current(), this._pages)).addClass("active"))
    }, o.prototype.onTrigger = function (e) {
        var i = this._core.settings;
        e.page = {
            index: t.inArray(this.current(), this._pages),
            count: this._pages.length,
            size: i && (i.center || i.autoWidth || i.dotsData ? 1 : i.dotsEach || i.items)
        }
    }, o.prototype.current = function () {
        var e = this._core.relative(this._core.current());
        return t.grep(this._pages, t.proxy(function (t, i) {
            return t.start <= e && t.end >= e
        }, this)).pop()
    }, o.prototype.getPosition = function (e) {
        var i, n, o = this._core.settings;
        return "page" == o.slideBy ? (i = t.inArray(this.current(), this._pages), n = this._pages.length, e ? ++i : --i, i = this._pages[(i % n + n) % n].start) : (i = this._core.relative(this._core.current()), n = this._core.items().length, e ? i += o.slideBy : i -= o.slideBy), i
    }, o.prototype.next = function (e) {
        t.proxy(this._overrides.to, this._core)(this.getPosition(!0), e)
    }, o.prototype.prev = function (e) {
        t.proxy(this._overrides.to, this._core)(this.getPosition(!1), e)
    }, o.prototype.to = function (e, i, n) {
        var o;
        !n && this._pages.length ? (o = this._pages.length, t.proxy(this._overrides.to, this._core)(this._pages[(e % o + o) % o].start, i)) : t.proxy(this._overrides.to, this._core)(e, i)
    }, t.fn.owlCarousel.Constructor.Plugins.Navigation = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    "use strict";
    var o = function (i) {
        this._core = i, this._hashes = {}, this.$element = this._core.$element, this._handlers = {
            "initialized.owl.carousel": t.proxy(function (i) {
                i.namespace && "URLHash" === this._core.settings.startPosition && t(e).trigger("hashchange.owl.navigation")
            }, this),
            "prepared.owl.carousel": t.proxy(function (e) {
                if (e.namespace) {
                    var i = t(e.content).find("[data-hash]").addBack("[data-hash]").attr("data-hash");
                    if (!i) return;
                    this._hashes[i] = e.content
                }
            }, this),
            "changed.owl.carousel": t.proxy(function (i) {
                if (i.namespace && "position" === i.property.name) {
                    var n = this._core.items(this._core.relative(this._core.current())),
                        o = t.map(this._hashes, function (t, e) {
                            return t === n ? e : null
                        }).join();
                    if (!o || e.location.hash.slice(1) === o) return;
                    e.location.hash = o
                }
            }, this)
        }, this._core.options = t.extend({}, o.Defaults, this._core.options), this.$element.on(this._handlers), t(e).on("hashchange.owl.navigation", t.proxy(function (t) {
            var i = e.location.hash.substring(1),
                o = this._core.$stage.children(),
                s = this._hashes[i] && o.index(this._hashes[i]);
            s !== n && s !== this._core.current() && this._core.to(this._core.relative(s), !1, !0)
        }, this))
    };
    o.Defaults = {
        URLhashListener: !1
    }, o.prototype.destroy = function () {
        var i, n;
        for (i in t(e).off("hashchange.owl.navigation"), this._handlers) this._core.$element.off(i, this._handlers[i]);
        for (n in Object.getOwnPropertyNames(this)) "function" != typeof this[n] && (this[n] = null)
    }, t.fn.owlCarousel.Constructor.Plugins.Hash = o
}(window.Zepto || window.jQuery, window, document),
function (t, e, i, n) {
    function o(e, i) {
        var o = !1,
            s = e.charAt(0).toUpperCase() + e.slice(1);
        return t.each((e + " " + a.join(s + " ") + s).split(" "), function (t, e) {
            if (r[e] !== n) return o = !i || e, !1
        }), o
    }

    function s(t) {
        return o(t, !0)
    }
    var r = t("<support>").get(0).style,
        a = "Webkit Moz O ms".split(" "),
        l = {
            transition: {
                end: {
                    WebkitTransition: "webkitTransitionEnd",
                    MozTransition: "transitionend",
                    OTransition: "oTransitionEnd",
                    transition: "transitionend"
                }
            },
            animation: {
                end: {
                    WebkitAnimation: "webkitAnimationEnd",
                    MozAnimation: "animationend",
                    OAnimation: "oAnimationEnd",
                    animation: "animationend"
                }
            }
        },
        u = {
            csstransforms: function () {
                return !!o("transform")
            },
            csstransforms3d: function () {
                return !!o("perspective")
            },
            csstransitions: function () {
                return !!o("transition")
            },
            cssanimations: function () {
                return !!o("animation")
            }
        };
    u.csstransitions() && (t.support.transition = new String(s("transition")), t.support.transition.end = l.transition.end[t.support.transition]), u.cssanimations() && (t.support.animation = new String(s("animation")), t.support.animation.end = l.animation.end[t.support.animation]), u.csstransforms() && (t.support.transform = new String(s("transform")), t.support.transform3d = u.csstransforms3d())
}(window.Zepto || window.jQuery, window, document), "object" == typeof navigator && function (t, e) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define("Plyr", e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).Plyr = e()
    }(this, function () {
        "use strict";

        function t(e) {
            return (t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
                return typeof t
            } : function (t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
            })(e)
        }

        function e(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }

        function i(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
            }
        }

        function n(t, e, n) {
            return e && i(t.prototype, e), n && i(t, n), t
        }

        function o(t, e, i) {
            return e in t ? Object.defineProperty(t, e, {
                value: i,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = i, t
        }

        function s(t, e) {
            var i = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(t);
                e && (n = n.filter(function (e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                })), i.push.apply(i, n)
            }
            return i
        }

        function r(t) {
            for (var e = 1; e < arguments.length; e++) {
                var i = null != arguments[e] ? arguments[e] : {};
                e % 2 ? s(Object(i), !0).forEach(function (e) {
                    o(t, e, i[e])
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(i)) : s(Object(i)).forEach(function (e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(i, e))
                })
            }
            return t
        }

        function a(t, e) {
            if (null == t) return {};
            var i, n, o = function (t, e) {
                if (null == t) return {};
                var i, n, o = {},
                    s = Object.keys(t);
                for (n = 0; n < s.length; n++) i = s[n], e.indexOf(i) >= 0 || (o[i] = t[i]);
                return o
            }(t, e);
            if (Object.getOwnPropertySymbols) {
                var s = Object.getOwnPropertySymbols(t);
                for (n = 0; n < s.length; n++) i = s[n], e.indexOf(i) >= 0 || Object.prototype.propertyIsEnumerable.call(t, i) && (o[i] = t[i])
            }
            return o
        }

        function l(t, e) {
            return function (t) {
                if (Array.isArray(t)) return t
            }(t) || function (t, e) {
                if ("undefined" != typeof Symbol && Symbol.iterator in Object(t)) {
                    var i = [],
                        n = !0,
                        o = !1,
                        s = void 0;
                    try {
                        for (var r, a = t[Symbol.iterator](); !(n = (r = a.next()).done) && (i.push(r.value), !e || i.length !== e); n = !0);
                    } catch (t) {
                        o = !0, s = t
                    } finally {
                        try {
                            n || null == a.return || a.return()
                        } finally {
                            if (o) throw s
                        }
                    }
                    return i
                }
            }(t, e) || c(t, e) || function () {
                throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
            }()
        }

        function u(t) {
            return function (t) {
                if (Array.isArray(t)) return h(t)
            }(t) || function (t) {
                if ("undefined" != typeof Symbol && Symbol.iterator in Object(t)) return Array.from(t)
            }(t) || c(t) || function () {
                throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
            }()
        }

        function c(t, e) {
            if (t) {
                if ("string" == typeof t) return h(t, e);
                var i = Object.prototype.toString.call(t).slice(8, -1);
                return "Object" === i && t.constructor && (i = t.constructor.name), "Map" === i || "Set" === i ? Array.from(t) : "Arguments" === i || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i) ? h(t, e) : void 0
            }
        }

        function h(t, e) {
            (null == e || e > t.length) && (e = t.length);
            for (var i = 0, n = new Array(e); i < e; i++) n[i] = t[i];
            return n
        }

        function d(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
            }
        }

        function p(t, e, i) {
            return e in t ? Object.defineProperty(t, e, {
                value: i,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = i, t
        }

        function m(t, e) {
            var i = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(t);
                e && (n = n.filter(function (e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                })), i.push.apply(i, n)
            }
            return i
        }

        function f(t) {
            for (var e = 1; e < arguments.length; e++) {
                var i = null != arguments[e] ? arguments[e] : {};
                e % 2 ? m(Object(i), !0).forEach(function (e) {
                    p(t, e, i[e])
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(i)) : m(Object(i)).forEach(function (e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(i, e))
                })
            }
            return t
        }

        function g(t, e) {
            return function () {
                return Array.from(document.querySelectorAll(e)).includes(this)
            }.call(t, e)
        }

        function v(t, e) {
            if (1 > e) {
                var i = function (t) {
                    var e = "".concat(t).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
                    return e ? Math.max(0, (e[1] ? e[1].length : 0) - (e[2] ? +e[2] : 0)) : 0
                }(e);
                return parseFloat(t.toFixed(i))
            }
            return Math.round(t / e) * e
        }

        function y(t, e) {
            setTimeout(function () {
                try {
                    t.hidden = !0, t.offsetHeight, t.hidden = !1
                } catch (t) {}
            }, e)
        }

        function b(t, e) {
            return e.split(".").reduce(function (t, e) {
                return t && t[e]
            }, t)
        }

        function w() {
            for (var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, e = arguments.length, i = new Array(e > 1 ? e - 1 : 0), n = 1; n < e; n++) i[n - 1] = arguments[n];
            if (!i.length) return t;
            var s = i.shift();
            return Dt(s) ? (Object.keys(s).forEach(function (e) {
                Dt(s[e]) ? (Object.keys(t).includes(e) || Object.assign(t, o({}, e, {})), w(t[e], s[e])) : Object.assign(t, o({}, e, s[e]))
            }), w.apply(void 0, [t].concat(i))) : t
        }

        function x(t, e) {
            var i = t.length ? t : [t];
            Array.from(i).reverse().forEach(function (t, i) {
                var n = i > 0 ? e.cloneNode(!0) : e,
                    o = t.parentNode,
                    s = t.nextSibling;
                n.appendChild(t), s ? o.insertBefore(n, s) : o.appendChild(n)
            })
        }

        function T(t, e) {
            Bt(t) && !Xt(e) && Object.entries(e).filter(function (t) {
                var e = l(t, 2)[1];
                return !Lt(e)
            }).forEach(function (e) {
                var i = l(e, 2),
                    n = i[0],
                    o = i[1];
                return t.setAttribute(n, o)
            })
        }

        function _(t, e, i) {
            var n = document.createElement(t);
            return Dt(e) && T(n, e), Nt(i) && (n.innerText = i), n
        }

        function S(t, e, i, n) {
            Bt(e) && e.appendChild(_(t, i, n))
        }

        function $(t) {
            Rt(t) || Wt(t) ? Array.from(t).forEach($) : Bt(t) && Bt(t.parentNode) && t.parentNode.removeChild(t)
        }

        function C(t) {
            if (Bt(t))
                for (var e = t.childNodes.length; e > 0;) t.removeChild(t.lastChild), e -= 1
        }

        function k(t, e) {
            return Bt(e) && Bt(e.parentNode) && Bt(t) ? (e.parentNode.replaceChild(t, e), t) : null
        }

        function A(t, e) {
            if (!Nt(t) || Xt(t)) return {};
            var i = {},
                n = w({}, e);
            return t.split(",").forEach(function (t) {
                var e = t.trim(),
                    o = e.replace(".", ""),
                    s = e.replace(/[[\]]/g, "").split("="),
                    r = l(s, 1)[0],
                    a = s.length > 1 ? s[1].replace(/["']/g, "") : "";
                switch (e.charAt(0)) {
                    case ".":
                        Nt(n.class) ? i.class = "".concat(n.class, " ").concat(o) : i.class = o;
                        break;
                    case "#":
                        i.id = e.replace("#", "");
                        break;
                    case "[":
                        i[r] = a
                }
            }), w(n, i)
        }

        function E(t, e) {
            if (Bt(t)) {
                var i = e;
                Ht(i) || (i = !t.hidden), t.hidden = i
            }
        }

        function M(t, e, i) {
            if (Rt(t)) return Array.from(t).map(function (t) {
                return M(t, e, i)
            });
            if (Bt(t)) {
                var n = "toggle";
                return void 0 !== i && (n = i ? "add" : "remove"), t.classList[n](e), t.classList.contains(e)
            }
            return !1
        }

        function I(t, e) {
            return Bt(t) && t.classList.contains(e)
        }

        function O(t, e) {
            var i = Element.prototype;
            return (i.matches || i.webkitMatchesSelector || i.mozMatchesSelector || i.msMatchesSelector || function () {
                return Array.from(document.querySelectorAll(e)).includes(this)
            }).call(t, e)
        }

        function P(t) {
            return this.elements.container.querySelectorAll(t)
        }

        function j(t) {
            return this.elements.container.querySelector(t)
        }

        function z() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null,
                e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            Bt(t) && (t.focus({
                preventScroll: !0
            }), e && M(t, this.config.classNames.tabFocus))
        }

        function L(t, e, i) {
            var n = this,
                o = arguments.length > 3 && void 0 !== arguments[3] && arguments[3],
                s = !(arguments.length > 4 && void 0 !== arguments[4]) || arguments[4],
                r = arguments.length > 5 && void 0 !== arguments[5] && arguments[5];
            if (t && "addEventListener" in t && !Xt(e) && Ft(i)) {
                var a = e.split(" "),
                    l = r;
                ee && (l = {
                    passive: s,
                    capture: r
                }), a.forEach(function (e) {
                    n && n.eventListeners && o && n.eventListeners.push({
                        element: t,
                        type: e,
                        callback: i,
                        options: l
                    }), t[o ? "addEventListener" : "removeEventListener"](e, i, l)
                })
            }
        }

        function D(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
                i = arguments.length > 2 ? arguments[2] : void 0,
                n = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3],
                o = arguments.length > 4 && void 0 !== arguments[4] && arguments[4];
            L.call(this, t, e, i, !0, n, o)
        }

        function q(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
                i = arguments.length > 2 ? arguments[2] : void 0,
                n = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3],
                o = arguments.length > 4 && void 0 !== arguments[4] && arguments[4];
            L.call(this, t, e, i, !1, n, o)
        }

        function N(t) {
            var e = this,
                i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
                n = arguments.length > 2 ? arguments[2] : void 0,
                o = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3],
                s = arguments.length > 4 && void 0 !== arguments[4] && arguments[4],
                r = function r() {
                    q(t, i, r, o, s);
                    for (var a = arguments.length, l = new Array(a), u = 0; u < a; u++) l[u] = arguments[u];
                    n.apply(e, l)
                };
            L.call(this, t, i, r, !0, o, s)
        }

        function H(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
                i = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
                n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
            if (Bt(t) && !Xt(e)) {
                var o = new CustomEvent(e, {
                    bubbles: i,
                    detail: r(r({}, n), {}, {
                        plyr: this
                    })
                });
                t.dispatchEvent(o)
            }
        }

        function F() {
            this && this.eventListeners && (this.eventListeners.forEach(function (t) {
                var e = t.element,
                    i = t.type,
                    n = t.callback,
                    o = t.options;
                e.removeEventListener(i, n, o)
            }), this.eventListeners = [])
        }

        function W() {
            var t = this;
            return new Promise(function (e) {
                return t.ready ? setTimeout(e, 0) : D.call(t, t.elements.container, "ready", e)
            }).then(function () {})
        }

        function R(t) {
            Qt(t) && t.then(null, function () {})
        }

        function B(t) {
            return !!(Wt(t) || Nt(t) && t.includes(":")) && (Wt(t) ? t : t.split(":")).map(Number).every(qt)
        }

        function V(t) {
            if (!Wt(t) || !t.every(qt)) return null;
            var e = l(t, 2),
                i = e[0],
                n = e[1],
                o = function t(e, i) {
                    return 0 === i ? e : t(i, e % i)
                }(i, n);
            return [i / o, n / o]
        }

        function U(t) {
            var e = function (t) {
                    return B(t) ? t.split(":").map(Number) : null
                },
                i = e(t);
            if (null === i && (i = e(this.config.ratio)), null === i && !Xt(this.embed) && Wt(this.embed.ratio) && (i = this.embed.ratio), null === i && this.isHTML5) {
                var n = this.media;
                i = V([n.videoWidth, n.videoHeight])
            }
            return i
        }

        function Y(t) {
            if (!this.isVideo) return {};
            var e = this.elements.wrapper,
                i = U.call(this, t),
                n = l(Wt(i) ? i : [0, 0], 2),
                o = 100 / n[0] * n[1];
            if (e.style.paddingBottom = "".concat(o, "%"), this.isVimeo && !this.config.vimeo.premium && this.supported.ui) {
                var s = 100 / this.media.offsetWidth * parseInt(window.getComputedStyle(this.media).paddingBottom, 10),
                    r = (s - o) / (s / 50);
                this.fullscreen.active ? e.style.paddingBottom = null : this.media.style.transform = "translateY(-".concat(r, "%)")
            } else this.isHTML5 && e.classList.toggle(this.config.classNames.videoFixedRatio, null !== i);
            return {
                padding: o,
                ratio: i
            }
        }

        function Q(t) {
            return Wt(t) ? t.filter(function (e, i) {
                return t.indexOf(e) === i
            }) : t
        }

        function G(t) {
            for (var e = arguments.length, i = new Array(e > 1 ? e - 1 : 0), n = 1; n < e; n++) i[n - 1] = arguments[n];
            return Xt(t) ? t : t.toString().replace(/{(\d+)}/g, function (t, e) {
                return i[e].toString()
            })
        }

        function X() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
                e = t.toString();
            return e = ne(e, "-", " "), e = ne(e, "_", " "), e = oe(e), ne(e, " ", "")
        }

        function K(t) {
            var e = document.createElement("div");
            return e.appendChild(t), e.innerHTML
        }

        function Z(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "text";
            return new Promise(function (i, n) {
                try {
                    var o = new XMLHttpRequest;
                    if (!("withCredentials" in o)) return;
                    o.addEventListener("load", function () {
                        if ("text" === e) try {
                            i(JSON.parse(o.responseText))
                        } catch (t) {
                            i(o.responseText)
                        } else i(o.response)
                    }), o.addEventListener("error", function () {
                        throw new Error(o.status)
                    }), o.open("GET", t, !0), o.responseType = e, o.send()
                } catch (t) {
                    n(t)
                }
            })
        }

        function J(t, e) {
            if (Nt(t)) {
                var i = "cache",
                    n = Nt(e),
                    o = function () {
                        return null !== document.getElementById(e)
                    },
                    s = function (t, e) {
                        t.innerHTML = e, n && o() || document.body.insertAdjacentElement("afterbegin", t)
                    };
                if (!n || !o()) {
                    var r = ae.supported,
                        a = document.createElement("div");
                    if (a.setAttribute("hidden", ""), n && a.setAttribute("id", e), r) {
                        var l = window.localStorage.getItem("".concat(i, "-").concat(e));
                        if (null !== l) {
                            var u = JSON.parse(l);
                            s(a, u.content)
                        }
                    }
                    Z(t).then(function (t) {
                        Xt(t) || (r && window.localStorage.setItem("".concat(i, "-").concat(e), JSON.stringify({
                            content: t
                        })), s(a, t))
                    }).catch(function () {})
                }
            }
        }

        function tt() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
                e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
                i = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
            if (!qt(t)) return tt(void 0, e, i);
            var n = function (t) {
                    return "0".concat(t).slice(-2)
                },
                o = le(t),
                s = ue(t),
                r = ce(t);
            return o = e || o > 0 ? "".concat(o, ":") : "", "".concat(i && t > 0 ? "-" : "").concat(o).concat(n(s), ":").concat(n(r))
        }

        function et(t) {
            var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
                i = t;
            if (e) {
                var n = document.createElement("a");
                n.href = i, i = n.href
            }
            try {
                return new URL(i)
            } catch (t) {
                return null
            }
        }

        function it(t) {
            var e = new URLSearchParams;
            return Dt(t) && Object.entries(t).forEach(function (t) {
                var i = l(t, 2),
                    n = i[0],
                    o = i[1];
                e.set(n, o)
            }), e
        }

        function nt(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1;
            return new Promise(function (i, n) {
                var o = new Image,
                    s = function () {
                        delete o.onload, delete o.onerror, (o.naturalWidth >= e ? i : n)(o)
                    };
                Object.assign(o, {
                    onload: s,
                    onerror: s,
                    src: t
                })
            })
        }

        function ot(t) {
            return new Promise(function (e, i) {
                $e(t, {
                    success: e,
                    error: i
                })
            })
        }

        function st(t) {
            t && !this.embed.hasPlayed && (this.embed.hasPlayed = !0), this.media.paused === t && (this.media.paused = !t, H.call(this, this.media, t ? "play" : "pause"))
        }

        function rt(t) {
            t && !this.embed.hasPlayed && (this.embed.hasPlayed = !0), this.media.paused === t && (this.media.paused = !t, H.call(this, this.media, t ? "play" : "pause"))
        }

        function at(t) {
            return t.noCookie ? "https://www.youtube-nocookie.com" : "http:" === window.location.protocol ? "http://www.youtube.com" : void 0
        }
        var lt, ut, ct, ht, dt = {
                addCSS: !0,
                thumbWidth: 15,
                watch: !0
            },
            pt = function (t) {
                return null != t ? t.constructor : null
            },
            mt = function (t, e) {
                return !!(t && e && t instanceof e)
            },
            ft = function (t) {
                return null == t
            },
            gt = function (t) {
                return pt(t) === Object
            },
            vt = function (t) {
                return pt(t) === String
            },
            yt = function (t) {
                return Array.isArray(t)
            },
            bt = function (t) {
                return mt(t, NodeList)
            },
            wt = vt,
            xt = yt,
            Tt = bt,
            _t = function (t) {
                return mt(t, Element)
            },
            St = function (t) {
                return mt(t, Event)
            },
            $t = function (t) {
                return ft(t) || (vt(t) || yt(t) || bt(t)) && !t.length || gt(t) && !Object.keys(t).length
            },
            Ct = function () {
                function t(e, i) {
                    (function (t, e) {
                        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
                    })(this, t), _t(e) ? this.element = e : wt(e) && (this.element = document.querySelector(e)), _t(this.element) && $t(this.element.rangeTouch) && (this.config = f({}, dt, {}, i), this.init())
                }
                return function (t, e, i) {
                    e && d(t.prototype, e), i && d(t, i)
                }(t, [{
                    key: "init",
                    value: function () {
                        t.enabled && (this.config.addCSS && (this.element.style.userSelect = "none", this.element.style.webKitUserSelect = "none", this.element.style.touchAction = "manipulation"), this.listeners(!0), this.element.rangeTouch = this)
                    }
                }, {
                    key: "destroy",
                    value: function () {
                        t.enabled && (this.config.addCSS && (this.element.style.userSelect = "", this.element.style.webKitUserSelect = "", this.element.style.touchAction = ""), this.listeners(!1), this.element.rangeTouch = null)
                    }
                }, {
                    key: "listeners",
                    value: function (t) {
                        var e = this,
                            i = t ? "addEventListener" : "removeEventListener";
                        ["touchstart", "touchmove", "touchend"].forEach(function (t) {
                            e.element[i](t, function (t) {
                                return e.set(t)
                            }, !1)
                        })
                    }
                }, {
                    key: "get",
                    value: function (e) {
                        if (!t.enabled || !St(e)) return null;
                        var i, n = e.target,
                            o = e.changedTouches[0],
                            s = parseFloat(n.getAttribute("min")) || 0,
                            r = parseFloat(n.getAttribute("max")) || 100,
                            a = parseFloat(n.getAttribute("step")) || 1,
                            l = n.getBoundingClientRect(),
                            u = 100 / l.width * (this.config.thumbWidth / 2) / 100;
                        return 0 > (i = 100 / l.width * (o.clientX - l.left)) ? i = 0 : 100 < i && (i = 100), 50 > i ? i -= (100 - 2 * i) * u : 50 < i && (i += 2 * (i - 50) * u), s + v(i / 100 * (r - s), a)
                    }
                }, {
                    key: "set",
                    value: function (e) {
                        t.enabled && St(e) && !e.target.disabled && (e.preventDefault(), e.target.value = this.get(e), function (t, e) {
                            if (t && e) {
                                var i = new Event(e, {
                                    bubbles: !0
                                });
                                t.dispatchEvent(i)
                            }
                        }(e.target, "touchend" === e.type ? "change" : "input"))
                    }
                }], [{
                    key: "setup",
                    value: function (e) {
                        var i = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {},
                            n = null;
                        if ($t(e) || wt(e) ? n = Array.from(document.querySelectorAll(wt(e) ? e : 'input[type="range"]')) : _t(e) ? n = [e] : Tt(e) ? n = Array.from(e) : xt(e) && (n = e.filter(_t)), $t(n)) return null;
                        var o = f({}, dt, {}, i);
                        if (wt(e) && o.watch) {
                            var s = new MutationObserver(function (i) {
                                Array.from(i).forEach(function (i) {
                                    Array.from(i.addedNodes).forEach(function (i) {
                                        _t(i) && g(i, e) && new t(i, o)
                                    })
                                })
                            });
                            s.observe(document.body, {
                                childList: !0,
                                subtree: !0
                            })
                        }
                        return n.map(function (e) {
                            return new t(e, i)
                        })
                    }
                }, {
                    key: "enabled",
                    get: function () {
                        return "ontouchstart" in document.documentElement
                    }
                }]), t
            }(),
            kt = function (t) {
                return null != t ? t.constructor : null
            },
            At = function (t, e) {
                return Boolean(t && e && t instanceof e)
            },
            Et = function (t) {
                return null == t
            },
            Mt = function (t) {
                return kt(t) === Object
            },
            It = function (t) {
                return kt(t) === String
            },
            Ot = function (t) {
                return kt(t) === Function
            },
            Pt = function (t) {
                return Array.isArray(t)
            },
            jt = function (t) {
                return At(t, NodeList)
            },
            zt = function (t) {
                return Et(t) || (It(t) || Pt(t) || jt(t)) && !t.length || Mt(t) && !Object.keys(t).length
            },
            Lt = Et,
            Dt = Mt,
            qt = function (t) {
                return kt(t) === Number && !Number.isNaN(t)
            },
            Nt = It,
            Ht = function (t) {
                return kt(t) === Boolean
            },
            Ft = Ot,
            Wt = Pt,
            Rt = jt,
            Bt = function (e) {
                return null !== e && "object" === t(e) && 1 === e.nodeType && "object" === t(e.style) && "object" === t(e.ownerDocument)
            },
            Vt = function (t) {
                return At(t, Event)
            },
            Ut = function (t) {
                return At(t, KeyboardEvent)
            },
            Yt = function (t) {
                return At(t, TextTrack) || !Et(t) && It(t.kind)
            },
            Qt = function (t) {
                return At(t, Promise) && Ot(t.then)
            },
            Gt = function (t) {
                if (At(t, window.URL)) return !0;
                if (!It(t)) return !1;
                var e = t;
                t.startsWith("http://") && t.startsWith("https://") || (e = "http://".concat(t));
                try {
                    return !zt(new URL(e).hostname)
                } catch (t) {
                    return !1
                }
            },
            Xt = zt,
            Kt = (lt = document.createElement("span"), ut = {
                WebkitTransition: "webkitTransitionEnd",
                MozTransition: "transitionend",
                OTransition: "oTransitionEnd otransitionend",
                transition: "transitionend"
            }, ct = Object.keys(ut).find(function (t) {
                return void 0 !== lt.style[t]
            }), !!Nt(ct) && ut[ct]),
            Zt = {
                isIE: !!document.documentMode,
                isEdge: window.navigator.userAgent.includes("Edge"),
                isWebkit: "WebkitAppearance" in document.documentElement.style && !/Edge/.test(navigator.userAgent),
                isIPhone: /(iPhone|iPod)/gi.test(navigator.platform),
                isIos: /(iPad|iPhone|iPod)/gi.test(navigator.platform)
            },
            Jt = {
                "audio/ogg": "vorbis",
                "audio/wav": "1",
                "video/webm": "vp8, vorbis",
                "video/mp4": "avc1.42E01E, mp4a.40.2",
                "video/ogg": "theora"
            },
            te = {
                audio: "canPlayType" in document.createElement("audio"),
                video: "canPlayType" in document.createElement("video"),
                check: function (t, e, i) {
                    var n = Zt.isIPhone && i && te.playsinline,
                        o = te[t] || "html5" !== e;
                    return {
                        api: o,
                        ui: o && te.rangeInput && ("video" !== t || !Zt.isIPhone || n)
                    }
                },
                pip: !(Zt.isIPhone || !Ft(_("video").webkitSetPresentationMode) && (!document.pictureInPictureEnabled || _("video").disablePictureInPicture)),
                airplay: Ft(window.WebKitPlaybackTargetAvailabilityEvent),
                playsinline: "playsInline" in document.createElement("video"),
                mime: function (t) {
                    if (Xt(t)) return !1;
                    var e = l(t.split("/"), 1)[0],
                        i = t;
                    if (!this.isHTML5 || e !== this.type) return !1;
                    Object.keys(Jt).includes(i) && (i += '; codecs="'.concat(Jt[t], '"'));
                    try {
                        return Boolean(i && this.media.canPlayType(i).replace(/no/, ""))
                    } catch (t) {
                        return !1
                    }
                },
                textTracks: "textTracks" in document.createElement("video"),
                rangeInput: (ht = document.createElement("input"), ht.type = "range", "range" === ht.type),
                touch: "ontouchstart" in document.documentElement,
                transitions: !1 !== Kt,
                reducedMotion: "matchMedia" in window && window.matchMedia("(prefers-reduced-motion)").matches
            },
            ee = function () {
                var t = !1;
                try {
                    var e = Object.defineProperty({}, "passive", {
                        get: function () {
                            return t = !0, null
                        }
                    });
                    window.addEventListener("test", null, e), window.removeEventListener("test", null, e)
                } catch (t) {}
                return t
            }(),
            ie = {
                getSources: function () {
                    var t = this;
                    return this.isHTML5 ? Array.from(this.media.querySelectorAll("source")).filter(function (e) {
                        var i = e.getAttribute("type");
                        return !!Xt(i) || te.mime.call(t, i)
                    }) : []
                },
                getQualityOptions: function () {
                    return this.config.quality.forced ? this.config.quality.options : ie.getSources.call(this).map(function (t) {
                        return Number(t.getAttribute("size"))
                    }).filter(Boolean)
                },
                setup: function () {
                    if (this.isHTML5) {
                        var t = this;
                        t.options.speed = t.config.speed.options, Xt(this.config.ratio) || Y.call(t), Object.defineProperty(t.media, "quality", {
                            get: function () {
                                var e = ie.getSources.call(t).find(function (e) {
                                    return e.getAttribute("src") === t.source
                                });
                                return e && Number(e.getAttribute("size"))
                            },
                            set: function (e) {
                                if (t.quality !== e) {
                                    if (t.config.quality.forced && Ft(t.config.quality.onChange)) t.config.quality.onChange(e);
                                    else {
                                        var i = ie.getSources.call(t).find(function (t) {
                                            return Number(t.getAttribute("size")) === e
                                        });
                                        if (!i) return;
                                        var n = t.media,
                                            o = n.currentTime,
                                            s = n.paused,
                                            r = n.preload,
                                            a = n.readyState,
                                            l = n.playbackRate;
                                        t.media.src = i.getAttribute("src"), ("none" !== r || a) && (t.once("loadedmetadata", function () {
                                            t.speed = l, t.currentTime = o, s || R(t.play())
                                        }), t.media.load())
                                    }
                                    H.call(t, t.media, "qualitychange", !1, {
                                        quality: e
                                    })
                                }
                            }
                        })
                    }
                },
                cancelRequests: function () {
                    this.isHTML5 && ($(ie.getSources.call(this)), this.media.setAttribute("src", this.config.blankVideo), this.media.load(), this.debug.log("Cancelled network requests"))
                }
            },
            ne = function () {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
                    e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
                    i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "";
                return t.replace(new RegExp(e.toString().replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1"), "g"), i.toString())
            },
            oe = function () {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
                return t.toString().replace(/\w\S*/g, function (t) {
                    return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()
                })
            },
            se = {
                pip: "PIP",
                airplay: "AirPlay",
                html5: "HTML5",
                vimeo: "Vimeo",
                youtube: "YouTube"
            },
            re = function () {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
                    e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                if (Xt(t) || Xt(e)) return "";
                var i = b(e.i18n, t);
                if (Xt(i)) return Object.keys(se).includes(t) ? se[t] : "";
                var n = {
                    "{seektime}": e.seekTime,
                    "{title}": e.title
                };
                return Object.entries(n).forEach(function (t) {
                    var e = l(t, 2),
                        n = e[0],
                        o = e[1];
                    i = ne(i, n, o)
                }), i
            },
            ae = function () {
                function t(i) {
                    var n = this;
                    e(this, t), o(this, "get", function (e) {
                        if (!t.supported || !n.enabled) return null;
                        var i = window.localStorage.getItem(n.key);
                        if (Xt(i)) return null;
                        var o = JSON.parse(i);
                        return Nt(e) && e.length ? o[e] : o
                    }), o(this, "set", function (e) {
                        if (t.supported && n.enabled && Dt(e)) {
                            var i = n.get();
                            Xt(i) && (i = {}), w(i, e), window.localStorage.setItem(n.key, JSON.stringify(i))
                        }
                    }), this.enabled = i.config.storage.enabled, this.key = i.config.storage.key
                }
                return n(t, null, [{
                    key: "supported",
                    get: function () {
                        try {
                            if (!("localStorage" in window)) return !1;
                            var t = "___test";
                            return window.localStorage.setItem(t, t), window.localStorage.removeItem(t), !0
                        } catch (t) {
                            return !1
                        }
                    }
                }]), t
            }(),
            le = function (t) {
                return Math.trunc(t / 60 / 60 % 60, 10)
            },
            ue = function (t) {
                return Math.trunc(t / 60 % 60, 10)
            },
            ce = function (t) {
                return Math.trunc(t % 60, 10)
            },
            he = {
                getIconUrl: function () {
                    var t = new URL(this.config.iconUrl, window.location).host !== window.location.host || Zt.isIE && !window.svg4everybody;
                    return {
                        url: this.config.iconUrl,
                        cors: t
                    }
                },
                findElements: function () {
                    try {
                        return this.elements.controls = j.call(this, this.config.selectors.controls.wrapper), this.elements.buttons = {
                            play: P.call(this, this.config.selectors.buttons.play),
                            pause: j.call(this, this.config.selectors.buttons.pause),
                            restart: j.call(this, this.config.selectors.buttons.restart),
                            rewind: j.call(this, this.config.selectors.buttons.rewind),
                            fastForward: j.call(this, this.config.selectors.buttons.fastForward),
                            mute: j.call(this, this.config.selectors.buttons.mute),
                            pip: j.call(this, this.config.selectors.buttons.pip),
                            airplay: j.call(this, this.config.selectors.buttons.airplay),
                            settings: j.call(this, this.config.selectors.buttons.settings),
                            captions: j.call(this, this.config.selectors.buttons.captions),
                            fullscreen: j.call(this, this.config.selectors.buttons.fullscreen)
                        }, this.elements.progress = j.call(this, this.config.selectors.progress), this.elements.inputs = {
                            seek: j.call(this, this.config.selectors.inputs.seek),
                            volume: j.call(this, this.config.selectors.inputs.volume)
                        }, this.elements.display = {
                            buffer: j.call(this, this.config.selectors.display.buffer),
                            currentTime: j.call(this, this.config.selectors.display.currentTime),
                            duration: j.call(this, this.config.selectors.display.duration)
                        }, Bt(this.elements.progress) && (this.elements.display.seekTooltip = this.elements.progress.querySelector(".".concat(this.config.classNames.tooltip))), !0
                    } catch (t) {
                        return this.debug.warn("It looks like there is a problem with your custom controls HTML", t), this.toggleNativeControls(!0), !1
                    }
                },
                createIcon: function (t, e) {
                    var i = "http://www.w3.org/2000/svg",
                        n = he.getIconUrl.call(this),
                        o = "".concat(n.cors ? "" : n.url, "#").concat(this.config.iconPrefix),
                        s = document.createElementNS(i, "svg");
                    T(s, w(e, {
                        "aria-hidden": "true",
                        focusable: "false"
                    }));
                    var r = document.createElementNS(i, "use"),
                        a = "".concat(o, "-").concat(t);
                    return "href" in r && r.setAttributeNS("http://www.w3.org/1999/xlink", "href", a), r.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a), s.appendChild(r), s
                },
                createLabel: function (t) {
                    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                        i = re(t, this.config),
                        n = r(r({}, e), {}, {
                            class: [e.class, this.config.classNames.hidden].filter(Boolean).join(" ")
                        });
                    return _("span", n, i)
                },
                createBadge: function (t) {
                    if (Xt(t)) return null;
                    var e = _("span", {
                        class: this.config.classNames.menu.value
                    });
                    return e.appendChild(_("span", {
                        class: this.config.classNames.menu.badge
                    }, t)), e
                },
                createButton: function (t, e) {
                    var i = this,
                        n = w({}, e),
                        o = function () {
                            var t = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "").toString();
                            return (t = X(t)).charAt(0).toLowerCase() + t.slice(1)
                        }(t),
                        s = {
                            element: "button",
                            toggle: !1,
                            label: null,
                            icon: null,
                            labelPressed: null,
                            iconPressed: null
                        };
                    switch (["element", "icon", "label"].forEach(function (t) {
                        Object.keys(n).includes(t) && (s[t] = n[t], delete n[t])
                    }), "button" !== s.element || Object.keys(n).includes("type") || (n.type = "button"), Object.keys(n).includes("class") ? n.class.split(" ").some(function (t) {
                        return t === i.config.classNames.control
                    }) || w(n, {
                        class: "".concat(n.class, " ").concat(this.config.classNames.control)
                    }) : n.class = this.config.classNames.control, t) {
                        case "play":
                            s.toggle = !0, s.label = "play", s.labelPressed = "pause", s.icon = "play", s.iconPressed = "pause";
                            break;
                        case "mute":
                            s.toggle = !0, s.label = "mute", s.labelPressed = "unmute", s.icon = "volume", s.iconPressed = "muted";
                            break;
                        case "captions":
                            s.toggle = !0, s.label = "enableCaptions", s.labelPressed = "disableCaptions", s.icon = "captions-off", s.iconPressed = "captions-on";
                            break;
                        case "fullscreen":
                            s.toggle = !0, s.label = "enterFullscreen", s.labelPressed = "exitFullscreen", s.icon = "enter-fullscreen", s.iconPressed = "exit-fullscreen";
                            break;
                        case "play-large":
                            n.class += " ".concat(this.config.classNames.control, "--overlaid"), o = "play", s.label = "play", s.icon = "play";
                            break;
                        default:
                            Xt(s.label) && (s.label = o), Xt(s.icon) && (s.icon = t)
                    }
                    var r = _(s.element);
                    return s.toggle ? (r.appendChild(he.createIcon.call(this, s.iconPressed, {
                        class: "icon--pressed"
                    })), r.appendChild(he.createIcon.call(this, s.icon, {
                        class: "icon--not-pressed"
                    })), r.appendChild(he.createLabel.call(this, s.labelPressed, {
                        class: "label--pressed"
                    })), r.appendChild(he.createLabel.call(this, s.label, {
                        class: "label--not-pressed"
                    }))) : (r.appendChild(he.createIcon.call(this, s.icon)), r.appendChild(he.createLabel.call(this, s.label))), w(n, A(this.config.selectors.buttons[o], n)), T(r, n), "play" === o ? (Wt(this.elements.buttons[o]) || (this.elements.buttons[o] = []), this.elements.buttons[o].push(r)) : this.elements.buttons[o] = r, r
                },
                createRange: function (t, e) {
                    var i = _("input", w(A(this.config.selectors.inputs[t]), {
                        type: "range",
                        min: 0,
                        max: 100,
                        step: .01,
                        value: 0,
                        autocomplete: "off",
                        role: "slider",
                        "aria-label": re(t, this.config),
                        "aria-valuemin": 0,
                        "aria-valuemax": 100,
                        "aria-valuenow": 0
                    }, e));
                    return this.elements.inputs[t] = i, he.updateRangeFill.call(this, i), Ct.setup(i), i
                },
                createProgress: function (t, e) {
                    var i = _("progress", w(A(this.config.selectors.display[t]), {
                        min: 0,
                        max: 100,
                        value: 0,
                        role: "progressbar",
                        "aria-hidden": !0
                    }, e));
                    if ("volume" !== t) {
                        i.appendChild(_("span", null, "0"));
                        var n = {
                                played: "played",
                                buffer: "buffered"
                            } [t],
                            o = n ? re(n, this.config) : "";
                        i.innerText = "% ".concat(o.toLowerCase())
                    }
                    return this.elements.display[t] = i, i
                },
                createTime: function (t, e) {
                    var i = A(this.config.selectors.display[t], e),
                        n = _("div", w(i, {
                            class: "".concat(i.class ? i.class : "", " ").concat(this.config.classNames.display.time, " ").trim(),
                            "aria-label": re(t, this.config)
                        }), "00:00");
                    return this.elements.display[t] = n, n
                },
                bindMenuItemShortcuts: function (t, e) {
                    var i = this;
                    D.call(this, t, "keydown keyup", function (n) {
                        if ([32, 38, 39, 40].includes(n.which) && (n.preventDefault(), n.stopPropagation(), "keydown" !== n.type)) {
                            var o, s = O(t, '[role="menuitemradio"]');
                            !s && [32, 39].includes(n.which) ? he.showMenuPanel.call(i, e, !0) : 32 !== n.which && (40 === n.which || s && 39 === n.which ? (o = t.nextElementSibling, Bt(o) || (o = t.parentNode.firstElementChild)) : (o = t.previousElementSibling, Bt(o) || (o = t.parentNode.lastElementChild)), z.call(i, o, !0))
                        }
                    }, !1), D.call(this, t, "keyup", function (t) {
                        13 === t.which && he.focusFirstMenuItem.call(i, null, !0)
                    })
                },
                createMenuItem: function (t) {
                    var e = this,
                        i = t.value,
                        n = t.list,
                        o = t.type,
                        s = t.title,
                        r = t.badge,
                        a = void 0 === r ? null : r,
                        l = t.checked,
                        u = void 0 !== l && l,
                        c = A(this.config.selectors.inputs[o]),
                        h = _("button", w(c, {
                            type: "button",
                            role: "menuitemradio",
                            class: "".concat(this.config.classNames.control, " ").concat(c.class ? c.class : "").trim(),
                            "aria-checked": u,
                            value: i
                        })),
                        d = _("span");
                    d.innerHTML = s, Bt(a) && d.appendChild(a), h.appendChild(d), Object.defineProperty(h, "checked", {
                        enumerable: !0,
                        get: function () {
                            return "true" === h.getAttribute("aria-checked")
                        },
                        set: function (t) {
                            t && Array.from(h.parentNode.children).filter(function (t) {
                                return O(t, '[role="menuitemradio"]')
                            }).forEach(function (t) {
                                return t.setAttribute("aria-checked", "false")
                            }), h.setAttribute("aria-checked", t ? "true" : "false")
                        }
                    }), this.listeners.bind(h, "click keyup", function (t) {
                        if (!Ut(t) || 32 === t.which) {
                            switch (t.preventDefault(), t.stopPropagation(), h.checked = !0, o) {
                                case "language":
                                    e.currentTrack = Number(i);
                                    break;
                                case "quality":
                                    e.quality = i;
                                    break;
                                case "speed":
                                    e.speed = parseFloat(i)
                            }
                            he.showMenuPanel.call(e, "home", Ut(t))
                        }
                    }, o, !1), he.bindMenuItemShortcuts.call(this, h, o), n.appendChild(h)
                },
                formatTime: function () {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
                        e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                    if (!qt(t)) return t;
                    var i = le(this.duration) > 0;
                    return tt(t, i, e)
                },
                updateTimeDisplay: function () {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null,
                        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                        i = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                    Bt(t) && qt(e) && (t.innerText = he.formatTime(e, i))
                },
                updateVolume: function () {
                    this.supported.ui && (Bt(this.elements.inputs.volume) && he.setRange.call(this, this.elements.inputs.volume, this.muted ? 0 : this.volume), Bt(this.elements.buttons.mute) && (this.elements.buttons.mute.pressed = this.muted || 0 === this.volume))
                },
                setRange: function (t) {
                    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
                    Bt(t) && (t.value = e, he.updateRangeFill.call(this, t))
                },
                updateProgress: function (t) {
                    var e = this;
                    if (this.supported.ui && Vt(t)) {
                        var i, n, o = 0;
                        if (t) switch (t.type) {
                            case "timeupdate":
                            case "seeking":
                            case "seeked":
                                i = this.currentTime, n = this.duration, o = 0 === i || 0 === n || Number.isNaN(i) || Number.isNaN(n) ? 0 : (i / n * 100).toFixed(2), "timeupdate" === t.type && he.setRange.call(this, this.elements.inputs.seek, o);
                                break;
                            case "playing":
                            case "progress":
                                ! function (t, i) {
                                    var n = qt(i) ? i : 0,
                                        o = Bt(t) ? t : e.elements.display.buffer;
                                    if (Bt(o)) {
                                        o.value = n;
                                        var s = o.getElementsByTagName("span")[0];
                                        Bt(s) && (s.childNodes[0].nodeValue = n)
                                    }
                                }(this.elements.display.buffer, 100 * this.buffered)
                        }
                    }
                },
                updateRangeFill: function (t) {
                    var e = Vt(t) ? t.target : t;
                    if (Bt(e) && "range" === e.getAttribute("type")) {
                        if (O(e, this.config.selectors.inputs.seek)) {
                            e.setAttribute("aria-valuenow", this.currentTime);
                            var i = he.formatTime(this.currentTime),
                                n = he.formatTime(this.duration),
                                o = re("seekLabel", this.config);
                            e.setAttribute("aria-valuetext", o.replace("{currentTime}", i).replace("{duration}", n))
                        } else if (O(e, this.config.selectors.inputs.volume)) {
                            var s = 100 * e.value;
                            e.setAttribute("aria-valuenow", s), e.setAttribute("aria-valuetext", "".concat(s.toFixed(1), "%"))
                        } else e.setAttribute("aria-valuenow", e.value);
                        Zt.isWebkit && e.style.setProperty("--value", "".concat(e.value / e.max * 100, "%"))
                    }
                },
                updateSeekTooltip: function (t) {
                    var e = this;
                    if (this.config.tooltips.seek && Bt(this.elements.inputs.seek) && Bt(this.elements.display.seekTooltip) && 0 !== this.duration) {
                        var i = "".concat(this.config.classNames.tooltip, "--visible"),
                            n = function (t) {
                                return M(e.elements.display.seekTooltip, i, t)
                            };
                        if (this.touch) n(!1);
                        else {
                            var o = 0,
                                s = this.elements.progress.getBoundingClientRect();
                            if (Vt(t)) o = 100 / s.width * (t.pageX - s.left);
                            else {
                                if (!I(this.elements.display.seekTooltip, i)) return;
                                o = parseFloat(this.elements.display.seekTooltip.style.left, 10)
                            }
                            o < 0 ? o = 0 : o > 100 && (o = 100), he.updateTimeDisplay.call(this, this.elements.display.seekTooltip, this.duration / 100 * o), this.elements.display.seekTooltip.style.left = "".concat(o, "%"), Vt(t) && ["mouseenter", "mouseleave"].includes(t.type) && n("mouseenter" === t.type)
                        }
                    }
                },
                timeUpdate: function (t) {
                    var e = !Bt(this.elements.display.duration) && this.config.invertTime;
                    he.updateTimeDisplay.call(this, this.elements.display.currentTime, e ? this.duration - this.currentTime : this.currentTime, e), t && "timeupdate" === t.type && this.media.seeking || he.updateProgress.call(this, t)
                },
                durationUpdate: function () {
                    if (this.supported.ui && (this.config.invertTime || !this.currentTime)) {
                        if (this.duration >= Math.pow(2, 32)) return E(this.elements.display.currentTime, !0), void E(this.elements.progress, !0);
                        Bt(this.elements.inputs.seek) && this.elements.inputs.seek.setAttribute("aria-valuemax", this.duration);
                        var t = Bt(this.elements.display.duration);
                        !t && this.config.displayDuration && this.paused && he.updateTimeDisplay.call(this, this.elements.display.currentTime, this.duration), t && he.updateTimeDisplay.call(this, this.elements.display.duration, this.duration), he.updateSeekTooltip.call(this)
                    }
                },
                toggleMenuButton: function (t, e) {
                    E(this.elements.settings.buttons[t], !e)
                },
                updateSetting: function (t, e, i) {
                    var n = this.elements.settings.panels[t],
                        o = null,
                        s = e;
                    if ("captions" === t) o = this.currentTrack;
                    else {
                        if (o = Xt(i) ? this[t] : i, Xt(o) && (o = this.config[t].default), !Xt(this.options[t]) && !this.options[t].includes(o)) return void this.debug.warn("Unsupported value of '".concat(o, "' for ").concat(t));
                        if (!this.config[t].options.includes(o)) return void this.debug.warn("Disabled value of '".concat(o, "' for ").concat(t))
                    }
                    if (Bt(s) || (s = n && n.querySelector('[role="menu"]')), Bt(s)) {
                        this.elements.settings.buttons[t].querySelector(".".concat(this.config.classNames.menu.value)).innerHTML = he.getLabel.call(this, t, o);
                        var r = s && s.querySelector('[value="'.concat(o, '"]'));
                        Bt(r) && (r.checked = !0)
                    }
                },
                getLabel: function (t, e) {
                    switch (t) {
                        case "speed":
                            return 1 === e ? re("normal", this.config) : "".concat(e, "&times;");
                        case "quality":
                            if (qt(e)) {
                                var i = re("qualityLabel.".concat(e), this.config);
                                return i.length ? i : "".concat(e, "p")
                            }
                            return oe(e);
                        case "captions":
                            return de.getLabel.call(this);
                        default:
                            return null
                    }
                },
                setQualityMenu: function (t) {
                    var e = this;
                    if (Bt(this.elements.settings.panels.quality)) {
                        var i = "quality",
                            n = this.elements.settings.panels.quality.querySelector('[role="menu"]');
                        Wt(t) && (this.options.quality = Q(t).filter(function (t) {
                            return e.config.quality.options.includes(t)
                        }));
                        var o = !Xt(this.options.quality) && this.options.quality.length > 1;
                        if (he.toggleMenuButton.call(this, i, o), C(n), he.checkMenu.call(this), o) {
                            var s = function (t) {
                                var i = re("qualityBadge.".concat(t), e.config);
                                return i.length ? he.createBadge.call(e, i) : null
                            };
                            this.options.quality.sort(function (t, i) {
                                var n = e.config.quality.options;
                                return n.indexOf(t) > n.indexOf(i) ? 1 : -1
                            }).forEach(function (t) {
                                he.createMenuItem.call(e, {
                                    value: t,
                                    list: n,
                                    type: i,
                                    title: he.getLabel.call(e, "quality", t),
                                    badge: s(t)
                                })
                            }), he.updateSetting.call(this, i, n)
                        }
                    }
                },
                setCaptionsMenu: function () {
                    var t = this;
                    if (Bt(this.elements.settings.panels.captions)) {
                        var e = "captions",
                            i = this.elements.settings.panels.captions.querySelector('[role="menu"]'),
                            n = de.getTracks.call(this),
                            o = Boolean(n.length);
                        if (he.toggleMenuButton.call(this, e, o), C(i), he.checkMenu.call(this), o) {
                            var s = n.map(function (e, n) {
                                return {
                                    value: n,
                                    checked: t.captions.toggled && t.currentTrack === n,
                                    title: de.getLabel.call(t, e),
                                    badge: e.language && he.createBadge.call(t, e.language.toUpperCase()),
                                    list: i,
                                    type: "language"
                                }
                            });
                            s.unshift({
                                value: -1,
                                checked: !this.captions.toggled,
                                title: re("disabled", this.config),
                                list: i,
                                type: "language"
                            }), s.forEach(he.createMenuItem.bind(this)), he.updateSetting.call(this, e, i)
                        }
                    }
                },
                setSpeedMenu: function () {
                    var t = this;
                    if (Bt(this.elements.settings.panels.speed)) {
                        var e = "speed",
                            i = this.elements.settings.panels.speed.querySelector('[role="menu"]');
                        this.options.speed = this.options.speed.filter(function (e) {
                            return e >= t.minimumSpeed && e <= t.maximumSpeed
                        });
                        var n = !Xt(this.options.speed) && this.options.speed.length > 1;
                        he.toggleMenuButton.call(this, e, n), C(i), he.checkMenu.call(this), n && (this.options.speed.forEach(function (n) {
                            he.createMenuItem.call(t, {
                                value: n,
                                list: i,
                                type: e,
                                title: he.getLabel.call(t, "speed", n)
                            })
                        }), he.updateSetting.call(this, e, i))
                    }
                },
                checkMenu: function () {
                    var t = this.elements.settings.buttons,
                        e = !Xt(t) && Object.values(t).some(function (t) {
                            return !t.hidden
                        });
                    E(this.elements.settings.menu, !e)
                },
                focusFirstMenuItem: function (t) {
                    var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                    if (!this.elements.settings.popup.hidden) {
                        var i = t;
                        Bt(i) || (i = Object.values(this.elements.settings.panels).find(function (t) {
                            return !t.hidden
                        }));
                        var n = i.querySelector('[role^="menuitem"]');
                        z.call(this, n, e)
                    }
                },
                toggleMenu: function (t) {
                    var e = this.elements.settings.popup,
                        i = this.elements.buttons.settings;
                    if (Bt(e) && Bt(i)) {
                        var n = e.hidden,
                            o = n;
                        if (Ht(t)) o = t;
                        else if (Ut(t) && 27 === t.which) o = !1;
                        else if (Vt(t)) {
                            var s = Ft(t.composedPath) ? t.composedPath()[0] : t.target,
                                r = e.contains(s);
                            if (r || !r && t.target !== i && o) return
                        }
                        i.setAttribute("aria-expanded", o), E(e, !o), M(this.elements.container, this.config.classNames.menu.open, o), o && Ut(t) ? he.focusFirstMenuItem.call(this, null, !0) : o || n || z.call(this, i, Ut(t))
                    }
                },
                getMenuSize: function (t) {
                    var e = t.cloneNode(!0);
                    e.style.position = "absolute", e.style.opacity = 0, e.removeAttribute("hidden"), t.parentNode.appendChild(e);
                    var i = e.scrollWidth,
                        n = e.scrollHeight;
                    return $(e), {
                        width: i,
                        height: n
                    }
                },
                showMenuPanel: function () {
                    var t = this,
                        e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
                        i = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
                        n = this.elements.container.querySelector("#plyr-settings-".concat(this.id, "-").concat(e));
                    if (Bt(n)) {
                        var o = n.parentNode,
                            s = Array.from(o.children).find(function (t) {
                                return !t.hidden
                            });
                        if (te.transitions && !te.reducedMotion) {
                            o.style.width = "".concat(s.scrollWidth, "px"), o.style.height = "".concat(s.scrollHeight, "px");
                            var r = he.getMenuSize.call(this, n),
                                a = function e(i) {
                                    i.target === o && ["width", "height"].includes(i.propertyName) && (o.style.width = "", o.style.height = "", q.call(t, o, Kt, e))
                                };
                            D.call(this, o, Kt, a), o.style.width = "".concat(r.width, "px"), o.style.height = "".concat(r.height, "px")
                        }
                        E(s, !0), E(n, !1), he.focusFirstMenuItem.call(this, n, i)
                    }
                },
                setDownloadUrl: function () {
                    var t = this.elements.buttons.download;
                    Bt(t) && t.setAttribute("href", this.download)
                },
                create: function (t) {
                    var e = this,
                        i = he.bindMenuItemShortcuts,
                        n = he.createButton,
                        o = he.createProgress,
                        s = he.createRange,
                        r = he.createTime,
                        a = he.setQualityMenu,
                        l = he.setSpeedMenu,
                        u = he.showMenuPanel;
                    this.elements.controls = null, Wt(this.config.controls) && this.config.controls.includes("play-large") && this.elements.container.appendChild(n.call(this, "play-large"));
                    var c = _("div", A(this.config.selectors.controls.wrapper));
                    this.elements.controls = c;
                    var h = {
                        class: "plyr__controls__item"
                    };
                    return Q(Wt(this.config.controls) ? this.config.controls : []).forEach(function (a) {
                        if ("restart" === a && c.appendChild(n.call(e, "restart", h)), "rewind" === a && c.appendChild(n.call(e, "rewind", h)), "play" === a && c.appendChild(n.call(e, "play", h)), "fast-forward" === a && c.appendChild(n.call(e, "fast-forward", h)), "progress" === a) {
                            var l = _("div", {
                                    class: "".concat(h.class, " plyr__progress__container")
                                }),
                                d = _("div", A(e.config.selectors.progress));
                            if (d.appendChild(s.call(e, "seek", {
                                    id: "plyr-seek-".concat(t.id)
                                })), d.appendChild(o.call(e, "buffer")), e.config.tooltips.seek) {
                                var p = _("span", {
                                    class: e.config.classNames.tooltip
                                }, "00:00");
                                d.appendChild(p), e.elements.display.seekTooltip = p
                            }
                            e.elements.progress = d, l.appendChild(e.elements.progress), c.appendChild(l)
                        }
                        if ("current-time" === a && c.appendChild(r.call(e, "currentTime", h)), "duration" === a && c.appendChild(r.call(e, "duration", h)), "mute" === a || "volume" === a) {
                            var m = e.elements.volume;
                            if (Bt(m) && c.contains(m) || (m = _("div", w({}, h, {
                                    class: "".concat(h.class, " plyr__volume").trim()
                                })), e.elements.volume = m, c.appendChild(m)), "mute" === a && m.appendChild(n.call(e, "mute")), "volume" === a && !Zt.isIos) {
                                var f = {
                                    max: 1,
                                    step: .05,
                                    value: e.config.volume
                                };
                                m.appendChild(s.call(e, "volume", w(f, {
                                    id: "plyr-volume-".concat(t.id)
                                })))
                            }
                        }
                        if ("captions" === a && c.appendChild(n.call(e, "captions", h)), "settings" === a && !Xt(e.config.settings)) {
                            var g = _("div", w({}, h, {
                                class: "".concat(h.class, " plyr__menu").trim(),
                                hidden: ""
                            }));
                            g.appendChild(n.call(e, "settings", {
                                "aria-haspopup": !0,
                                "aria-controls": "plyr-settings-".concat(t.id),
                                "aria-expanded": !1
                            }));
                            var v = _("div", {
                                    class: "plyr__menu__container",
                                    id: "plyr-settings-".concat(t.id),
                                    hidden: ""
                                }),
                                y = _("div"),
                                b = _("div", {
                                    id: "plyr-settings-".concat(t.id, "-home")
                                }),
                                x = _("div", {
                                    role: "menu"
                                });
                            b.appendChild(x), y.appendChild(b), e.elements.settings.panels.home = b, e.config.settings.forEach(function (n) {
                                var o = _("button", w(A(e.config.selectors.buttons.settings), {
                                    type: "button",
                                    class: "".concat(e.config.classNames.control, " ").concat(e.config.classNames.control, "--forward"),
                                    role: "menuitem",
                                    "aria-haspopup": !0,
                                    hidden: ""
                                }));
                                i.call(e, o, n), D.call(e, o, "click", function () {
                                    u.call(e, n, !1)
                                });
                                var s = _("span", null, re(n, e.config)),
                                    r = _("span", {
                                        class: e.config.classNames.menu.value
                                    });
                                r.innerHTML = t[n], s.appendChild(r), o.appendChild(s), x.appendChild(o);
                                var a = _("div", {
                                        id: "plyr-settings-".concat(t.id, "-").concat(n),
                                        hidden: ""
                                    }),
                                    l = _("button", {
                                        type: "button",
                                        class: "".concat(e.config.classNames.control, " ").concat(e.config.classNames.control, "--back")
                                    });
                                l.appendChild(_("span", {
                                    "aria-hidden": !0
                                }, re(n, e.config))), l.appendChild(_("span", {
                                    class: e.config.classNames.hidden
                                }, re("menuBack", e.config))), D.call(e, a, "keydown", function (t) {
                                    37 === t.which && (t.preventDefault(), t.stopPropagation(), u.call(e, "home", !0))
                                }, !1), D.call(e, l, "click", function () {
                                    u.call(e, "home", !1)
                                }), a.appendChild(l), a.appendChild(_("div", {
                                    role: "menu"
                                })), y.appendChild(a), e.elements.settings.buttons[n] = o, e.elements.settings.panels[n] = a
                            }), v.appendChild(y), g.appendChild(v), c.appendChild(g), e.elements.settings.popup = v, e.elements.settings.menu = g
                        }
                        if ("pip" === a && te.pip && c.appendChild(n.call(e, "pip", h)), "airplay" === a && te.airplay && c.appendChild(n.call(e, "airplay", h)), "download" === a) {
                            var T = w({}, h, {
                                element: "a",
                                href: e.download,
                                target: "_blank"
                            });
                            e.isHTML5 && (T.download = "");
                            var S = e.config.urls.download;
                            !Gt(S) && e.isEmbed && w(T, {
                                icon: "logo-".concat(e.provider),
                                label: e.provider
                            }), c.appendChild(n.call(e, "download", T))
                        }
                        "fullscreen" === a && c.appendChild(n.call(e, "fullscreen", h))
                    }), this.isHTML5 && a.call(this, ie.getQualityOptions.call(this)), l.call(this), c
                },
                inject: function () {
                    var t = this;
                    if (this.config.loadSprite) {
                        var e = he.getIconUrl.call(this);
                        e.cors && J(e.url, "sprite-plyr")
                    }
                    this.id = Math.floor(1e4 * Math.random());
                    var i = null;
                    this.elements.controls = null;
                    var n, o, s = {
                            id: this.id,
                            seektime: this.config.seekTime,
                            title: this.config.title
                        },
                        r = !0;
                    if (Ft(this.config.controls) && (this.config.controls = this.config.controls.call(this, s)), this.config.controls || (this.config.controls = []), Bt(this.config.controls) || Nt(this.config.controls) ? i = this.config.controls : (i = he.create.call(this, {
                            id: this.id,
                            seektime: this.config.seekTime,
                            speed: this.speed,
                            quality: this.quality,
                            captions: de.getLabel.call(this)
                        }), r = !1), r && Nt(this.config.controls) && (n = i, Object.entries(s).forEach(function (t) {
                            var e = l(t, 2),
                                i = e[0],
                                o = e[1];
                            n = ne(n, "{".concat(i, "}"), o)
                        }), i = n), Nt(this.config.selectors.controls.container) && (o = document.querySelector(this.config.selectors.controls.container)), Bt(o) || (o = this.elements.container), o[Bt(i) ? "insertAdjacentElement" : "insertAdjacentHTML"]("afterbegin", i), Bt(this.elements.controls) || he.findElements.call(this), !Xt(this.elements.buttons)) {
                        var a = function (e) {
                            var i = t.config.classNames.controlPressed;
                            Object.defineProperty(e, "pressed", {
                                enumerable: !0,
                                get: function () {
                                    return I(e, i)
                                },
                                set: function () {
                                    var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                                    M(e, i, t)
                                }
                            })
                        };
                        Object.values(this.elements.buttons).filter(Boolean).forEach(function (t) {
                            Wt(t) || Rt(t) ? Array.from(t).filter(Boolean).forEach(a) : a(t)
                        })
                    }
                    if (Zt.isEdge && y(o), this.config.tooltips.controls) {
                        var u = this.config,
                            c = u.classNames,
                            h = u.selectors,
                            d = "".concat(h.controls.wrapper, " ").concat(h.labels, " .").concat(c.hidden),
                            p = P.call(this, d);
                        Array.from(p).forEach(function (e) {
                            M(e, t.config.classNames.hidden, !1), M(e, t.config.classNames.tooltip, !0)
                        })
                    }
                }
            },
            de = {
                setup: function () {
                    if (this.supported.ui)
                        if (!this.isVideo || this.isYouTube || this.isHTML5 && !te.textTracks) Wt(this.config.controls) && this.config.controls.includes("settings") && this.config.settings.includes("captions") && he.setCaptionsMenu.call(this);
                        else {
                            if (Bt(this.elements.captions) || (this.elements.captions = _("div", A(this.config.selectors.captions)), function (t, e) {
                                    Bt(t) && Bt(e) && e.parentNode.insertBefore(t, e.nextSibling)
                                }(this.elements.captions, this.elements.wrapper)), Zt.isIE && window.URL) {
                                var t = this.media.querySelectorAll("track");
                                Array.from(t).forEach(function (t) {
                                    var e = t.getAttribute("src"),
                                        i = et(e);
                                    null !== i && i.hostname !== window.location.href.hostname && ["http:", "https:"].includes(i.protocol) && Z(e, "blob").then(function (e) {
                                        t.setAttribute("src", window.URL.createObjectURL(e))
                                    }).catch(function () {
                                        $(t)
                                    })
                                })
                            }
                            var e = Q((navigator.languages || [navigator.language || navigator.userLanguage || "en"]).map(function (t) {
                                    return t.split("-")[0]
                                })),
                                i = (this.storage.get("language") || this.config.captions.language || "auto").toLowerCase();
                            "auto" === i && (i = l(e, 1)[0]);
                            var n = this.storage.get("captions");
                            if (Ht(n) || (n = this.config.captions.active), Object.assign(this.captions, {
                                    toggled: !1,
                                    active: n,
                                    language: i,
                                    languages: e
                                }), this.isHTML5) {
                                var o = this.config.captions.update ? "addtrack removetrack" : "removetrack";
                                D.call(this, this.media.textTracks, o, de.update.bind(this))
                            }
                            setTimeout(de.update.bind(this), 0)
                        }
                },
                update: function () {
                    var t = this,
                        e = de.getTracks.call(this, !0),
                        i = this.captions,
                        n = i.active,
                        o = i.language,
                        s = i.meta,
                        r = i.currentTrackNode,
                        a = Boolean(e.find(function (t) {
                            return t.language === o
                        }));
                    this.isHTML5 && this.isVideo && e.filter(function (t) {
                        return !s.get(t)
                    }).forEach(function (e) {
                        t.debug.log("Track added", e), s.set(e, {
                            default: "showing" === e.mode
                        }), "showing" === e.mode && (e.mode = "hidden"), D.call(t, e, "cuechange", function () {
                            return de.updateCues.call(t)
                        })
                    }), (a && this.language !== o || !e.includes(r)) && (de.setLanguage.call(this, o), de.toggle.call(this, n && a)), M(this.elements.container, this.config.classNames.captions.enabled, !Xt(e)), Wt(this.config.controls) && this.config.controls.includes("settings") && this.config.settings.includes("captions") && he.setCaptionsMenu.call(this)
                },
                toggle: function (t) {
                    var e = this,
                        i = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                    if (this.supported.ui) {
                        var n = this.captions.toggled,
                            o = this.config.classNames.captions.active,
                            s = Lt(t) ? !n : t;
                        if (s !== n) {
                            if (i || (this.captions.active = s, this.storage.set({
                                    captions: s
                                })), !this.language && s && !i) {
                                var r = de.getTracks.call(this),
                                    a = de.findTrack.call(this, [this.captions.language].concat(u(this.captions.languages)), !0);
                                return this.captions.language = a.language, void de.set.call(this, r.indexOf(a))
                            }
                            this.elements.buttons.captions && (this.elements.buttons.captions.pressed = s), M(this.elements.container, o, s), this.captions.toggled = s, he.updateSetting.call(this, "captions"), H.call(this, this.media, s ? "captionsenabled" : "captionsdisabled")
                        }
                        setTimeout(function () {
                            s && e.captions.toggled && (e.captions.currentTrackNode.mode = "hidden")
                        })
                    }
                },
                set: function (t) {
                    var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
                        i = de.getTracks.call(this);
                    if (-1 !== t)
                        if (qt(t))
                            if (t in i) {
                                if (this.captions.currentTrack !== t) {
                                    this.captions.currentTrack = t;
                                    var n = i[t],
                                        o = n || {},
                                        s = o.language;
                                    this.captions.currentTrackNode = n, he.updateSetting.call(this, "captions"), e || (this.captions.language = s, this.storage.set({
                                        language: s
                                    })), this.isVimeo && this.embed.enableTextTrack(s), H.call(this, this.media, "languagechange")
                                }
                                de.toggle.call(this, !0, e), this.isHTML5 && this.isVideo && de.updateCues.call(this)
                            } else this.debug.warn("Track not found", t);
                    else this.debug.warn("Invalid caption argument", t);
                    else de.toggle.call(this, !1, e)
                },
                setLanguage: function (t) {
                    var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                    if (Nt(t)) {
                        var i = t.toLowerCase();
                        this.captions.language = i;
                        var n = de.getTracks.call(this),
                            o = de.findTrack.call(this, [i]);
                        de.set.call(this, n.indexOf(o), e)
                    } else this.debug.warn("Invalid language argument", t)
                },
                getTracks: function () {
                    var t = this,
                        e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
                        i = Array.from((this.media || {}).textTracks || []);
                    return i.filter(function (i) {
                        return !t.isHTML5 || e || t.captions.meta.has(i)
                    }).filter(function (t) {
                        return ["captions", "subtitles"].includes(t.kind)
                    })
                },
                findTrack: function (t) {
                    var e, i = this,
                        n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
                        o = de.getTracks.call(this),
                        s = function (t) {
                            return Number((i.captions.meta.get(t) || {}).default)
                        },
                        r = Array.from(o).sort(function (t, e) {
                            return s(e) - s(t)
                        });
                    return t.every(function (t) {
                        return !(e = r.find(function (e) {
                            return e.language === t
                        }))
                    }), e || (n ? r[0] : void 0)
                },
                getCurrentTrack: function () {
                    return de.getTracks.call(this)[this.currentTrack]
                },
                getLabel: function (t) {
                    var e = t;
                    return !Yt(e) && te.textTracks && this.captions.toggled && (e = de.getCurrentTrack.call(this)), Yt(e) ? Xt(e.label) ? Xt(e.language) ? re("enabled", this.config) : t.language.toUpperCase() : e.label : re("disabled", this.config)
                },
                updateCues: function (t) {
                    if (this.supported.ui)
                        if (Bt(this.elements.captions))
                            if (Lt(t) || Array.isArray(t)) {
                                var e = t;
                                if (!e) {
                                    var i = de.getCurrentTrack.call(this);
                                    e = Array.from((i || {}).activeCues || []).map(function (t) {
                                        return t.getCueAsHTML()
                                    }).map(K)
                                }
                                var n = e.map(function (t) {
                                    return t.trim()
                                }).join("\n");
                                if (n !== this.elements.captions.innerHTML) {
                                    C(this.elements.captions);
                                    var o = _("span", A(this.config.selectors.caption));
                                    o.innerHTML = n, this.elements.captions.appendChild(o), H.call(this, this.media, "cuechange")
                                }
                            } else this.debug.warn("updateCues: Invalid input", t);
                    else this.debug.warn("No captions element to render to")
                }
            },
            pe = {
                enabled: !0,
                title: "",
                debug: !1,
                autoplay: !1,
                autopause: !0,
                playsinline: !0,
                seekTime: 10,
                volume: 1,
                muted: !1,
                duration: null,
                displayDuration: !0,
                invertTime: !0,
                toggleInvert: !0,
                ratio: null,
                clickToPlay: !0,
                hideControls: !0,
                resetOnEnd: !1,
                disableContextMenu: !0,
                loadSprite: !0,
                iconPrefix: "plyr",
                iconUrl: "https://cdn.plyr.io/3.6.4/plyr.svg",
                blankVideo: "https://cdn.plyr.io/static/blank.mp4",
                quality: {
                    default: 576,
                    options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
                    forced: !1,
                    onChange: null
                },
                loop: {
                    active: !1
                },
                speed: {
                    selected: 1,
                    options: [.5, .75, 1, 1.25, 1.5, 1.75, 2, 4]
                },
                keyboard: {
                    focused: !0,
                    global: !1
                },
                tooltips: {
                    controls: !1,
                    seek: !0
                },
                captions: {
                    active: !1,
                    language: "auto",
                    update: !1
                },
                fullscreen: {
                    enabled: !0,
                    fallback: !0,
                    iosNative: !1
                },
                storage: {
                    enabled: !0,
                    key: "plyr"
                },
                controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "captions", "settings", "pip", "airplay", "fullscreen"],
                settings: ["captions", "quality", "speed"],
                i18n: {
                    restart: "Restart",
                    rewind: "Rewind {seektime}s",
                    play: "Play",
                    pause: "Pause",
                    fastForward: "Forward {seektime}s",
                    seek: "Seek",
                    seekLabel: "{currentTime} of {duration}",
                    played: "Played",
                    buffered: "Buffered",
                    currentTime: "Current time",
                    duration: "Duration",
                    volume: "Volume",
                    mute: "Mute",
                    unmute: "Unmute",
                    enableCaptions: "Enable captions",
                    disableCaptions: "Disable captions",
                    download: "Download",
                    enterFullscreen: "Enter fullscreen",
                    exitFullscreen: "Exit fullscreen",
                    frameTitle: "Player for {title}",
                    captions: "Captions",
                    settings: "Settings",
                    pip: "PIP",
                    menuBack: "Go back to previous menu",
                    speed: "Speed",
                    normal: "Normal",
                    quality: "Quality",
                    loop: "Loop",
                    start: "Start",
                    end: "End",
                    all: "All",
                    reset: "Reset",
                    disabled: "Disabled",
                    enabled: "Enabled",
                    advertisement: "Ad",
                    qualityBadge: {
                        2160: "4K",
                        1440: "HD",
                        1080: "HD",
                        720: "HD",
                        576: "SD",
                        480: "SD"
                    }
                },
                urls: {
                    download: null,
                    vimeo: {
                        sdk: "https://player.vimeo.com/api/player.js",
                        iframe: "https://player.vimeo.com/video/{0}?{1}",
                        api: "https://vimeo.com/api/oembed.json?url={0}"
                    },
                    youtube: {
                        sdk: "https://www.youtube.com/iframe_api",
                        api: "https://noembed.com/embed?url=https://www.youtube.com/watch?v={0}"
                    },
                    googleIMA: {
                        sdk: "https://imasdk.googleapis.com/js/sdkloader/ima3.js"
                    }
                },
                listeners: {
                    seek: null,
                    play: null,
                    pause: null,
                    restart: null,
                    rewind: null,
                    fastForward: null,
                    mute: null,
                    volume: null,
                    captions: null,
                    download: null,
                    fullscreen: null,
                    pip: null,
                    airplay: null,
                    speed: null,
                    quality: null,
                    loop: null,
                    language: null
                },
                events: ["ended", "progress", "stalled", "playing", "waiting", "canplay", "canplaythrough", "loadstart", "loadeddata", "loadedmetadata", "timeupdate", "volumechange", "play", "pause", "error", "seeking", "seeked", "emptied", "ratechange", "cuechange", "download", "enterfullscreen", "exitfullscreen", "captionsenabled", "captionsdisabled", "languagechange", "controlshidden", "controlsshown", "ready", "statechange", "qualitychange", "adsloaded", "adscontentpause", "adscontentresume", "adstarted", "adsmidpoint", "adscomplete", "adsallcomplete", "adsimpression", "adsclick"],
                selectors: {
                    editable: "input, textarea, select, [contenteditable]",
                    container: ".plyr",
                    controls: {
                        container: null,
                        wrapper: ".plyr__controls"
                    },
                    labels: "[data-plyr]",
                    buttons: {
                        play: '[data-plyr="play"]',
                        pause: '[data-plyr="pause"]',
                        restart: '[data-plyr="restart"]',
                        rewind: '[data-plyr="rewind"]',
                        fastForward: '[data-plyr="fast-forward"]',
                        mute: '[data-plyr="mute"]',
                        captions: '[data-plyr="captions"]',
                        download: '[data-plyr="download"]',
                        fullscreen: '[data-plyr="fullscreen"]',
                        pip: '[data-plyr="pip"]',
                        airplay: '[data-plyr="airplay"]',
                        settings: '[data-plyr="settings"]',
                        loop: '[data-plyr="loop"]'
                    },
                    inputs: {
                        seek: '[data-plyr="seek"]',
                        volume: '[data-plyr="volume"]',
                        speed: '[data-plyr="speed"]',
                        language: '[data-plyr="language"]',
                        quality: '[data-plyr="quality"]'
                    },
                    display: {
                        currentTime: ".plyr__time--current",
                        duration: ".plyr__time--duration",
                        buffer: ".plyr__progress__buffer",
                        loop: ".plyr__progress__loop",
                        volume: ".plyr__volume--display"
                    },
                    progress: ".plyr__progress",
                    captions: ".plyr__captions",
                    caption: ".plyr__caption"
                },
                classNames: {
                    type: "plyr--{0}",
                    provider: "plyr--{0}",
                    video: "plyr__video-wrapper",
                    embed: "plyr__video-embed",
                    videoFixedRatio: "plyr__video-wrapper--fixed-ratio",
                    embedContainer: "plyr__video-embed__container",
                    poster: "plyr__poster",
                    posterEnabled: "plyr__poster-enabled",
                    ads: "plyr__ads",
                    control: "plyr__control",
                    controlPressed: "plyr__control--pressed",
                    playing: "plyr--playing",
                    paused: "plyr--paused",
                    stopped: "plyr--stopped",
                    loading: "plyr--loading",
                    hover: "plyr--hover",
                    tooltip: "plyr__tooltip",
                    cues: "plyr__cues",
                    hidden: "plyr__sr-only",
                    hideControls: "plyr--hide-controls",
                    isIos: "plyr--is-ios",
                    isTouch: "plyr--is-touch",
                    uiSupported: "plyr--full-ui",
                    noTransition: "plyr--no-transition",
                    display: {
                        time: "plyr__time"
                    },
                    menu: {
                        value: "plyr__menu__value",
                        badge: "plyr__badge",
                        open: "plyr--menu-open"
                    },
                    captions: {
                        enabled: "plyr--captions-enabled",
                        active: "plyr--captions-active"
                    },
                    fullscreen: {
                        enabled: "plyr--fullscreen-enabled",
                        fallback: "plyr--fullscreen-fallback"
                    },
                    pip: {
                        supported: "plyr--pip-supported",
                        active: "plyr--pip-active"
                    },
                    airplay: {
                        supported: "plyr--airplay-supported",
                        active: "plyr--airplay-active"
                    },
                    tabFocus: "plyr__tab-focus",
                    previewThumbnails: {
                        thumbContainer: "plyr__preview-thumb",
                        thumbContainerShown: "plyr__preview-thumb--is-shown",
                        imageContainer: "plyr__preview-thumb__image-container",
                        timeContainer: "plyr__preview-thumb__time-container",
                        scrubbingContainer: "plyr__preview-scrubbing",
                        scrubbingContainerShown: "plyr__preview-scrubbing--is-shown"
                    }
                },
                attributes: {
                    embed: {
                        provider: "data-plyr-provider",
                        id: "data-plyr-embed-id"
                    }
                },
                ads: {
                    enabled: !1,
                    publisherId: "",
                    tagUrl: ""
                },
                previewThumbnails: {
                    enabled: !1,
                    src: ""
                },
                vimeo: {
                    byline: !1,
                    portrait: !1,
                    title: !1,
                    speed: !0,
                    transparent: !1,
                    customControls: !0,
                    referrerPolicy: null,
                    premium: !1
                },
                youtube: {
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    customControls: !0,
                    noCookie: !1
                }
            },
            me = "picture-in-picture",
            fe = "inline",
            ge = {
                html5: "html5",
                youtube: "youtube",
                vimeo: "vimeo"
            },
            ve = "audio",
            ye = "video",
            be = function () {},
            we = function () {
                function t() {
                    var i = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                    e(this, t), this.enabled = window.console && i, this.enabled && this.log("Debugging enabled")
                }
                return n(t, [{
                    key: "log",
                    get: function () {
                        return this.enabled ? Function.prototype.bind.call(console.log, console) : be
                    }
                }, {
                    key: "warn",
                    get: function () {
                        return this.enabled ? Function.prototype.bind.call(console.warn, console) : be
                    }
                }, {
                    key: "error",
                    get: function () {
                        return this.enabled ? Function.prototype.bind.call(console.error, console) : be
                    }
                }]), t
            }(),
            xe = function () {
                function t(i) {
                    var n = this;
                    e(this, t), o(this, "onChange", function () {
                        if (n.enabled) {
                            var t = n.player.elements.buttons.fullscreen;
                            Bt(t) && (t.pressed = n.active);
                            var e = n.target === n.player.media ? n.target : n.player.elements.container;
                            H.call(n.player, e, n.active ? "enterfullscreen" : "exitfullscreen", !0)
                        }
                    }), o(this, "toggleFallback", function () {
                        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                        if (t ? n.scrollPosition = {
                                x: window.scrollX || 0,
                                y: window.scrollY || 0
                            } : window.scrollTo(n.scrollPosition.x, n.scrollPosition.y), document.body.style.overflow = t ? "hidden" : "", M(n.target, n.player.config.classNames.fullscreen.fallback, t), Zt.isIos) {
                            var e = document.head.querySelector('meta[name="viewport"]'),
                                i = "viewport-fit=cover";
                            e || (e = document.createElement("meta")).setAttribute("name", "viewport");
                            var o = Nt(e.content) && e.content.includes(i);
                            t ? (n.cleanupViewport = !o, o || (e.content += ",".concat(i))) : n.cleanupViewport && (e.content = e.content.split(",").filter(function (t) {
                                return t.trim() !== i
                            }).join(","))
                        }
                        n.onChange()
                    }), o(this, "trapFocus", function (t) {
                        if (!Zt.isIos && n.active && "Tab" === t.key && 9 === t.keyCode) {
                            var e = document.activeElement,
                                i = P.call(n.player, "a[href], button:not(:disabled), input:not(:disabled), [tabindex]"),
                                o = l(i, 1)[0],
                                s = i[i.length - 1];
                            e !== s || t.shiftKey ? e === o && t.shiftKey && (s.focus(), t.preventDefault()) : (o.focus(), t.preventDefault())
                        }
                    }), o(this, "update", function () {
                        var e;
                        n.enabled ? (e = n.forceFallback ? "Fallback (forced)" : t.native ? "Native" : "Fallback", n.player.debug.log("".concat(e, " fullscreen enabled"))) : n.player.debug.log("Fullscreen not supported and fallback disabled"), M(n.player.elements.container, n.player.config.classNames.fullscreen.enabled, n.enabled)
                    }), o(this, "enter", function () {
                        n.enabled && (Zt.isIos && n.player.config.fullscreen.iosNative ? n.player.isVimeo ? n.player.embed.requestFullscreen() : n.target.webkitEnterFullscreen() : !t.native || n.forceFallback ? n.toggleFallback(!0) : n.prefix ? Xt(n.prefix) || n.target["".concat(n.prefix, "Request").concat(n.property)]() : n.target.requestFullscreen({
                            navigationUI: "hide"
                        }))
                    }), o(this, "exit", function () {
                        if (n.enabled)
                            if (Zt.isIos && n.player.config.fullscreen.iosNative) n.target.webkitExitFullscreen(), R(n.player.play());
                            else if (!t.native || n.forceFallback) n.toggleFallback(!1);
                        else if (n.prefix) {
                            if (!Xt(n.prefix)) {
                                var e = "moz" === n.prefix ? "Cancel" : "Exit";
                                document["".concat(n.prefix).concat(e).concat(n.property)]()
                            }
                        } else(document.cancelFullScreen || document.exitFullscreen).call(document)
                    }), o(this, "toggle", function () {
                        n.active ? n.exit() : n.enter()
                    }), this.player = i, this.prefix = t.prefix, this.property = t.property, this.scrollPosition = {
                        x: 0,
                        y: 0
                    }, this.forceFallback = "force" === i.config.fullscreen.fallback, this.player.elements.fullscreen = i.config.fullscreen.container && function (t, e) {
                        return (Element.prototype.closest || function () {
                            var t = this;
                            do {
                                if (O.matches(t, e)) return t;
                                t = t.parentElement || t.parentNode
                            } while (null !== t && 1 === t.nodeType);
                            return null
                        }).call(t, e)
                    }(this.player.elements.container, i.config.fullscreen.container), D.call(this.player, document, "ms" === this.prefix ? "MSFullscreenChange" : "".concat(this.prefix, "fullscreenchange"), function () {
                        n.onChange()
                    }), D.call(this.player, this.player.elements.container, "dblclick", function (t) {
                        Bt(n.player.elements.controls) && n.player.elements.controls.contains(t.target) || n.player.listeners.proxy(t, n.toggle, "fullscreen")
                    }), D.call(this, this.player.elements.container, "keydown", function (t) {
                        return n.trapFocus(t)
                    }), this.update()
                }
                return n(t, [{
                    key: "usingNative",
                    get: function () {
                        return t.native && !this.forceFallback
                    }
                }, {
                    key: "enabled",
                    get: function () {
                        return (t.native || this.player.config.fullscreen.fallback) && this.player.config.fullscreen.enabled && this.player.supported.ui && this.player.isVideo
                    }
                }, {
                    key: "active",
                    get: function () {
                        if (!this.enabled) return !1;
                        if (!t.native || this.forceFallback) return I(this.target, this.player.config.classNames.fullscreen.fallback);
                        var e = this.prefix ? document["".concat(this.prefix).concat(this.property, "Element")] : document.fullscreenElement;
                        return e && e.shadowRoot ? e === this.target.getRootNode().host : e === this.target
                    }
                }, {
                    key: "target",
                    get: function () {
                        return Zt.isIos && this.player.config.fullscreen.iosNative ? this.player.media : this.player.elements.fullscreen || this.player.elements.container
                    }
                }], [{
                    key: "native",
                    get: function () {
                        return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled)
                    }
                }, {
                    key: "prefix",
                    get: function () {
                        if (Ft(document.exitFullscreen)) return "";
                        var t = "";
                        return ["webkit", "moz", "ms"].some(function (e) {
                            return !(!Ft(document["".concat(e, "ExitFullscreen")]) && !Ft(document["".concat(e, "CancelFullScreen")]) || (t = e, 0))
                        }), t
                    }
                }, {
                    key: "property",
                    get: function () {
                        return "moz" === this.prefix ? "FullScreen" : "Fullscreen"
                    }
                }]), t
            }(),
            Te = {
                addStyleHook: function () {
                    M(this.elements.container, this.config.selectors.container.replace(".", ""), !0), M(this.elements.container, this.config.classNames.uiSupported, this.supported.ui)
                },
                toggleNativeControls: function () {
                    var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                    t && this.isHTML5 ? this.media.setAttribute("controls", "") : this.media.removeAttribute("controls")
                },
                build: function () {
                    var t = this;
                    if (this.listeners.media(), !this.supported.ui) return this.debug.warn("Basic support only for ".concat(this.provider, " ").concat(this.type)), void Te.toggleNativeControls.call(this, !0);
                    Bt(this.elements.controls) || (he.inject.call(this), this.listeners.controls()), Te.toggleNativeControls.call(this), this.isHTML5 && de.setup.call(this), this.volume = null, this.muted = null, this.loop = null, this.quality = null, this.speed = null, he.updateVolume.call(this), he.timeUpdate.call(this), Te.checkPlaying.call(this), M(this.elements.container, this.config.classNames.pip.supported, te.pip && this.isHTML5 && this.isVideo), M(this.elements.container, this.config.classNames.airplay.supported, te.airplay && this.isHTML5), M(this.elements.container, this.config.classNames.isIos, Zt.isIos), M(this.elements.container, this.config.classNames.isTouch, this.touch), this.ready = !0, setTimeout(function () {
                        H.call(t, t.media, "ready")
                    }, 0), Te.setTitle.call(this), this.poster && Te.setPoster.call(this, this.poster, !1).catch(function () {}), this.config.duration && he.durationUpdate.call(this)
                },
                setTitle: function () {
                    var t = re("play", this.config);
                    if (Nt(this.config.title) && !Xt(this.config.title) && (t += ", ".concat(this.config.title)), Array.from(this.elements.buttons.play || []).forEach(function (e) {
                            e.setAttribute("aria-label", t)
                        }), this.isEmbed) {
                        var e = j.call(this, "iframe");
                        if (!Bt(e)) return;
                        var i = Xt(this.config.title) ? "video" : this.config.title,
                            n = re("frameTitle", this.config);
                        e.setAttribute("title", n.replace("{title}", i))
                    }
                },
                togglePoster: function (t) {
                    M(this.elements.container, this.config.classNames.posterEnabled, t)
                },
                setPoster: function (t) {
                    var e = this,
                        i = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                    return i && this.poster ? Promise.reject(new Error("Poster already set")) : (this.media.setAttribute("data-poster", t), this.elements.poster.removeAttribute("hidden"), W.call(this).then(function () {
                        return nt(t)
                    }).catch(function (i) {
                        throw t === e.poster && Te.togglePoster.call(e, !1), i
                    }).then(function () {
                        if (t !== e.poster) throw new Error("setPoster cancelled by later call to setPoster")
                    }).then(function () {
                        return Object.assign(e.elements.poster.style, {
                            backgroundImage: "url('".concat(t, "')"),
                            backgroundSize: ""
                        }), Te.togglePoster.call(e, !0), t
                    }))
                },
                checkPlaying: function (t) {
                    var e = this;
                    M(this.elements.container, this.config.classNames.playing, this.playing), M(this.elements.container, this.config.classNames.paused, this.paused), M(this.elements.container, this.config.classNames.stopped, this.stopped), Array.from(this.elements.buttons.play || []).forEach(function (t) {
                        Object.assign(t, {
                            pressed: e.playing
                        }), t.setAttribute("aria-label", re(e.playing ? "pause" : "play", e.config))
                    }), Vt(t) && "timeupdate" === t.type || Te.toggleControls.call(this)
                },
                checkLoading: function (t) {
                    var e = this;
                    this.loading = ["stalled", "waiting"].includes(t.type), clearTimeout(this.timers.loading), this.timers.loading = setTimeout(function () {
                        M(e.elements.container, e.config.classNames.loading, e.loading), Te.toggleControls.call(e)
                    }, this.loading ? 250 : 0)
                },
                toggleControls: function (t) {
                    var e = this.elements.controls;
                    if (e && this.config.hideControls) {
                        var i = this.touch && this.lastSeekTime + 2e3 > Date.now();
                        this.toggleControls(Boolean(t || this.loading || this.paused || e.pressed || e.hover || i))
                    }
                },
                migrateStyles: function () {
                    var t = this;
                    Object.values(r({}, this.media.style)).filter(function (t) {
                        return !Xt(t) && Nt(t) && t.startsWith("--plyr")
                    }).forEach(function (e) {
                        t.elements.container.style.setProperty(e, t.media.style.getPropertyValue(e)), t.media.style.removeProperty(e)
                    }), Xt(this.media.style) && this.media.removeAttribute("style")
                }
            },
            _e = function () {
                function t(i) {
                    var n = this;
                    e(this, t), o(this, "firstTouch", function () {
                        var t = n.player,
                            e = t.elements;
                        t.touch = !0, M(e.container, t.config.classNames.isTouch, !0)
                    }), o(this, "setTabFocus", function (t) {
                        var e = n.player,
                            i = e.elements;
                        if (clearTimeout(n.focusTimer), "keydown" !== t.type || 9 === t.which) {
                            "keydown" === t.type && (n.lastKeyDown = t.timeStamp);
                            var o, s = t.timeStamp - n.lastKeyDown <= 20;
                            ("focus" !== t.type || s) && (o = e.config.classNames.tabFocus, M(P.call(e, ".".concat(o)), o, !1), "focusout" !== t.type && (n.focusTimer = setTimeout(function () {
                                var t = document.activeElement;
                                i.container.contains(t) && M(document.activeElement, e.config.classNames.tabFocus, !0)
                            }, 10)))
                        }
                    }), o(this, "global", function () {
                        var t = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0],
                            e = n.player;
                        e.config.keyboard.global && L.call(e, window, "keydown keyup", n.handleKey, t, !1), L.call(e, document.body, "click", n.toggleMenu, t), N.call(e, document.body, "touchstart", n.firstTouch), L.call(e, document.body, "keydown focus blur focusout", n.setTabFocus, t, !1, !0)
                    }), o(this, "container", function () {
                        var t = n.player,
                            e = t.config,
                            i = t.elements,
                            o = t.timers;
                        !e.keyboard.global && e.keyboard.focused && D.call(t, i.container, "keydown keyup", n.handleKey, !1), D.call(t, i.container, "mousemove mouseleave touchstart touchmove enterfullscreen exitfullscreen", function (e) {
                            var n = i.controls;
                            n && "enterfullscreen" === e.type && (n.pressed = !1, n.hover = !1);
                            var s = 0;
                            ["touchstart", "touchmove", "mousemove"].includes(e.type) && (Te.toggleControls.call(t, !0), s = t.touch ? 3e3 : 2e3), clearTimeout(o.controls), o.controls = setTimeout(function () {
                                return Te.toggleControls.call(t, !1)
                            }, s)
                        });
                        var s = function (e) {
                                if (!e) return Y.call(t);
                                var n = i.container.getBoundingClientRect(),
                                    o = n.width,
                                    s = n.height;
                                return Y.call(t, "".concat(o, ":").concat(s))
                            },
                            r = function () {
                                clearTimeout(o.resized), o.resized = setTimeout(s, 50)
                            };
                        D.call(t, i.container, "enterfullscreen exitfullscreen", function (e) {
                            var n = t.fullscreen,
                                o = n.target,
                                a = n.usingNative;
                            if (o === i.container && (t.isEmbed || !Xt(t.config.ratio))) {
                                var u = "enterfullscreen" === e.type,
                                    c = s(u);
                                c.padding,
                                    function (e, i, n) {
                                        if (t.isVimeo && !t.config.vimeo.premium) {
                                            var o = t.elements.wrapper.firstChild,
                                                s = l(e, 2)[1],
                                                r = l(U.call(t), 2),
                                                a = r[0],
                                                u = r[1];
                                            o.style.maxWidth = n ? "".concat(s / u * a, "px") : null, o.style.margin = n ? "0 auto" : null
                                        }
                                    }(c.ratio, 0, u), u && setTimeout(function () {
                                        return y(i.container)
                                    }, 100), a || (u ? D.call(t, window, "resize", r) : q.call(t, window, "resize", r))
                            }
                        })
                    }), o(this, "media", function () {
                        var t = n.player,
                            e = t.elements;
                        if (D.call(t, t.media, "timeupdate seeking seeked", function (e) {
                                return he.timeUpdate.call(t, e)
                            }), D.call(t, t.media, "durationchange loadeddata loadedmetadata", function (e) {
                                return he.durationUpdate.call(t, e)
                            }), D.call(t, t.media, "ended", function () {
                                t.isHTML5 && t.isVideo && t.config.resetOnEnd && (t.restart(), t.pause())
                            }), D.call(t, t.media, "progress playing seeking seeked", function (e) {
                                return he.updateProgress.call(t, e)
                            }), D.call(t, t.media, "volumechange", function (e) {
                                return he.updateVolume.call(t, e)
                            }), D.call(t, t.media, "playing play pause ended emptied timeupdate", function (e) {
                                return Te.checkPlaying.call(t, e)
                            }), D.call(t, t.media, "waiting canplay seeked playing", function (e) {
                                return Te.checkLoading.call(t, e)
                            }), t.supported.ui && t.config.clickToPlay && !t.isAudio) {
                            var i = j.call(t, ".".concat(t.config.classNames.video));
                            if (!Bt(i)) return;
                            D.call(t, e.container, "click", function (o) {
                                ([e.container, i].includes(o.target) || i.contains(o.target)) && (t.touch && t.config.hideControls || (t.ended ? (n.proxy(o, t.restart, "restart"), n.proxy(o, function () {
                                    R(t.play())
                                }, "play")) : n.proxy(o, function () {
                                    R(t.togglePlay())
                                }, "play")))
                            })
                        }
                        t.supported.ui && t.config.disableContextMenu && D.call(t, e.wrapper, "contextmenu", function (t) {
                            t.preventDefault()
                        }, !1), D.call(t, t.media, "volumechange", function () {
                            t.storage.set({
                                volume: t.volume,
                                muted: t.muted
                            })
                        }), D.call(t, t.media, "ratechange", function () {
                            he.updateSetting.call(t, "speed"), t.storage.set({
                                speed: t.speed
                            })
                        }), D.call(t, t.media, "qualitychange", function (e) {
                            he.updateSetting.call(t, "quality", null, e.detail.quality)
                        }), D.call(t, t.media, "ready qualitychange", function () {
                            he.setDownloadUrl.call(t)
                        });
                        var o = t.config.events.concat(["keyup", "keydown"]).join(" ");
                        D.call(t, t.media, o, function (i) {
                            var n = i.detail,
                                o = void 0 === n ? {} : n;
                            "error" === i.type && (o = t.media.error), H.call(t, e.container, i.type, !0, o)
                        })
                    }), o(this, "proxy", function (t, e, i) {
                        var o = n.player,
                            s = o.config.listeners[i],
                            r = !0;
                        Ft(s) && (r = s.call(o, t)), !1 !== r && Ft(e) && e.call(o, t)
                    }), o(this, "bind", function (t, e, i, o) {
                        var s = !(arguments.length > 4 && void 0 !== arguments[4]) || arguments[4],
                            r = n.player,
                            a = r.config.listeners[o],
                            l = Ft(a);
                        D.call(r, t, e, function (t) {
                            return n.proxy(t, i, o)
                        }, s && !l)
                    }), o(this, "controls", function () {
                        var t = n.player,
                            e = t.elements,
                            i = Zt.isIE ? "change" : "input";
                        if (e.buttons.play && Array.from(e.buttons.play).forEach(function (e) {
                                n.bind(e, "click", function () {
                                    R(t.togglePlay())
                                }, "play")
                            }), n.bind(e.buttons.restart, "click", t.restart, "restart"), n.bind(e.buttons.rewind, "click", function () {
                                t.lastSeekTime = Date.now(), t.rewind()
                            }, "rewind"), n.bind(e.buttons.fastForward, "click", function () {
                                t.lastSeekTime = Date.now(), t.forward()
                            }, "fastForward"), n.bind(e.buttons.mute, "click", function () {
                                t.muted = !t.muted
                            }, "mute"), n.bind(e.buttons.captions, "click", function () {
                                return t.toggleCaptions()
                            }), n.bind(e.buttons.download, "click", function () {
                                H.call(t, t.media, "download")
                            }, "download"), n.bind(e.buttons.fullscreen, "click", function () {
                                t.fullscreen.toggle()
                            }, "fullscreen"), n.bind(e.buttons.pip, "click", function () {
                                t.pip = "toggle"
                            }, "pip"), n.bind(e.buttons.airplay, "click", t.airplay, "airplay"), n.bind(e.buttons.settings, "click", function (e) {
                                e.stopPropagation(), e.preventDefault(), he.toggleMenu.call(t, e)
                            }, null, !1), n.bind(e.buttons.settings, "keyup", function (e) {
                                var i = e.which;
                                [13, 32].includes(i) && (13 !== i ? (e.preventDefault(), e.stopPropagation(), he.toggleMenu.call(t, e)) : he.focusFirstMenuItem.call(t, null, !0))
                            }, null, !1), n.bind(e.settings.menu, "keydown", function (e) {
                                27 === e.which && he.toggleMenu.call(t, e)
                            }), n.bind(e.inputs.seek, "mousedown mousemove", function (t) {
                                var i = e.progress.getBoundingClientRect(),
                                    n = 100 / i.width * (t.pageX - i.left);
                                t.currentTarget.setAttribute("seek-value", n)
                            }), n.bind(e.inputs.seek, "mousedown mouseup keydown keyup touchstart touchend", function (e) {
                                var i = e.currentTarget,
                                    n = e.keyCode ? e.keyCode : e.which,
                                    o = "play-on-seeked";
                                if (!Ut(e) || 39 === n || 37 === n) {
                                    t.lastSeekTime = Date.now();
                                    var s = i.hasAttribute(o),
                                        r = ["mouseup", "touchend", "keyup"].includes(e.type);
                                    s && r ? (i.removeAttribute(o), R(t.play())) : !r && t.playing && (i.setAttribute(o, ""), t.pause())
                                }
                            }), Zt.isIos) {
                            var o = P.call(t, 'input[type="range"]');
                            Array.from(o).forEach(function (t) {
                                return n.bind(t, i, function (t) {
                                    return y(t.target)
                                })
                            })
                        }
                        n.bind(e.inputs.seek, i, function (e) {
                            var i = e.currentTarget,
                                n = i.getAttribute("seek-value");
                            Xt(n) && (n = i.value), i.removeAttribute("seek-value"), t.currentTime = n / i.max * t.duration
                        }, "seek"), n.bind(e.progress, "mouseenter mouseleave mousemove", function (e) {
                            return he.updateSeekTooltip.call(t, e)
                        }), n.bind(e.progress, "mousemove touchmove", function (e) {
                            var i = t.previewThumbnails;
                            i && i.loaded && i.startMove(e)
                        }), n.bind(e.progress, "mouseleave touchend click", function () {
                            var e = t.previewThumbnails;
                            e && e.loaded && e.endMove(!1, !0)
                        }), n.bind(e.progress, "mousedown touchstart", function (e) {
                            var i = t.previewThumbnails;
                            i && i.loaded && i.startScrubbing(e)
                        }), n.bind(e.progress, "mouseup touchend", function (e) {
                            var i = t.previewThumbnails;
                            i && i.loaded && i.endScrubbing(e)
                        }), Zt.isWebkit && Array.from(P.call(t, 'input[type="range"]')).forEach(function (e) {
                            n.bind(e, "input", function (e) {
                                return he.updateRangeFill.call(t, e.target)
                            })
                        }), t.config.toggleInvert && !Bt(e.display.duration) && n.bind(e.display.currentTime, "click", function () {
                            0 !== t.currentTime && (t.config.invertTime = !t.config.invertTime, he.timeUpdate.call(t))
                        }), n.bind(e.inputs.volume, i, function (e) {
                            t.volume = e.target.value
                        }, "volume"), n.bind(e.controls, "mouseenter mouseleave", function (i) {
                            e.controls.hover = !t.touch && "mouseenter" === i.type
                        }), e.fullscreen && Array.from(e.fullscreen.children).filter(function (t) {
                            return !t.contains(e.container)
                        }).forEach(function (i) {
                            n.bind(i, "mouseenter mouseleave", function (i) {
                                e.controls.hover = !t.touch && "mouseenter" === i.type
                            })
                        }), n.bind(e.controls, "mousedown mouseup touchstart touchend touchcancel", function (t) {
                            e.controls.pressed = ["mousedown", "touchstart"].includes(t.type)
                        }), n.bind(e.controls, "focusin", function () {
                            var i = t.config,
                                o = t.timers;
                            M(e.controls, i.classNames.noTransition, !0), Te.toggleControls.call(t, !0), setTimeout(function () {
                                M(e.controls, i.classNames.noTransition, !1)
                            }, 0);
                            var s = n.touch ? 3e3 : 4e3;
                            clearTimeout(o.controls), o.controls = setTimeout(function () {
                                return Te.toggleControls.call(t, !1)
                            }, s)
                        }), n.bind(e.inputs.volume, "wheel", function (e) {
                            var i = e.webkitDirectionInvertedFromDevice,
                                n = l([e.deltaX, -e.deltaY].map(function (t) {
                                    return i ? -t : t
                                }), 2),
                                o = n[0],
                                s = n[1],
                                r = Math.sign(Math.abs(o) > Math.abs(s) ? o : s);
                            t.increaseVolume(r / 50);
                            var a = t.media.volume;
                            (1 === r && a < 1 || -1 === r && a > 0) && e.preventDefault()
                        }, "volume", !1)
                    }), this.player = i, this.lastKey = null, this.focusTimer = null, this.lastKeyDown = null, this.handleKey = this.handleKey.bind(this), this.toggleMenu = this.toggleMenu.bind(this), this.setTabFocus = this.setTabFocus.bind(this), this.firstTouch = this.firstTouch.bind(this)
                }
                return n(t, [{
                    key: "handleKey",
                    value: function (t) {
                        var e = this.player,
                            i = e.elements,
                            n = t.keyCode ? t.keyCode : t.which,
                            o = "keydown" === t.type,
                            s = o && n === this.lastKey;
                        if (!(t.altKey || t.ctrlKey || t.metaKey || t.shiftKey) && qt(n))
                            if (o) {
                                var r = document.activeElement;
                                if (Bt(r)) {
                                    var a = e.config.selectors.editable;
                                    if (r !== i.inputs.seek && O(r, a)) return;
                                    if (32 === t.which && O(r, 'button, [role^="menuitem"]')) return
                                }
                                switch ([32, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 56, 57, 67, 70, 73, 75, 76, 77, 79].includes(n) && (t.preventDefault(), t.stopPropagation()), n) {
                                    case 48:
                                    case 49:
                                    case 50:
                                    case 51:
                                    case 52:
                                    case 53:
                                    case 54:
                                    case 55:
                                    case 56:
                                    case 57:
                                        s || (e.currentTime = e.duration / 10 * (n - 48));
                                        break;
                                    case 32:
                                    case 75:
                                        s || R(e.togglePlay());
                                        break;
                                    case 38:
                                        e.increaseVolume(.1);
                                        break;
                                    case 40:
                                        e.decreaseVolume(.1);
                                        break;
                                    case 77:
                                        s || (e.muted = !e.muted);
                                        break;
                                    case 39:
                                        e.forward();
                                        break;
                                    case 37:
                                        e.rewind();
                                        break;
                                    case 70:
                                        e.fullscreen.toggle();
                                        break;
                                    case 67:
                                        s || e.toggleCaptions();
                                        break;
                                    case 76:
                                        e.loop = !e.loop
                                }
                                27 === n && !e.fullscreen.usingNative && e.fullscreen.active && e.fullscreen.toggle(), this.lastKey = n
                            } else this.lastKey = null
                    }
                }, {
                    key: "toggleMenu",
                    value: function (t) {
                        he.toggleMenu.call(this.player, t)
                    }
                }]), t
            }();
        "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;
        var Se, $e = function (t, e) {
                return t(e = {
                    exports: {}
                }, e.exports), e.exports
            }(function (t, e) {
                t.exports = function () {
                    function t(t, e) {
                        t = t.push ? t : [t];
                        var i, n, o, s = [],
                            r = t.length,
                            a = r;
                        for (i = function (t, i) {
                                i.length && s.push(t), --a || e(s)
                            }; r--;) n = t[r], (o = l[n]) ? i(n, o) : (u[n] = u[n] || []).push(i)
                    }

                    function e(t, e) {
                        if (t) {
                            var i = u[t];
                            if (l[t] = e, i)
                                for (; i.length;) i[0](t, e), i.splice(0, 1)
                        }
                    }

                    function i(t, e) {
                        t.call && (t = {
                            success: t
                        }), e.length ? (t.error || r)(e) : (t.success || r)(t)
                    }

                    function n(t, e, i, o) {
                        var s, a, l = document,
                            u = i.async,
                            c = (i.numRetries || 0) + 1,
                            h = i.before || r,
                            d = t.replace(/[\?|#].*$/, ""),
                            p = t.replace(/^(css|img)!/, "");
                        o = o || 0, /(^css!|\.css$)/.test(d) ? ((a = l.createElement("link")).rel = "stylesheet", a.href = p, (s = "hideFocus" in a) && a.relList && (s = 0, a.rel = "preload", a.as = "style")) : /(^img!|\.(png|gif|jpg|svg|webp)$)/.test(d) ? (a = l.createElement("img")).src = p : ((a = l.createElement("script")).src = t, a.async = void 0 === u || u), a.onload = a.onerror = a.onbeforeload = function (r) {
                            var l = r.type[0];
                            if (s) try {
                                a.sheet.cssText.length || (l = "e")
                            } catch (r) {
                                18 != r.code && (l = "e")
                            }
                            if ("e" == l) {
                                if ((o += 1) < c) return n(t, e, i, o)
                            } else if ("preload" == a.rel && "style" == a.as) return a.rel = "stylesheet";
                            e(t, l, r.defaultPrevented)
                        }, !1 !== h(t, a) && l.head.appendChild(a)
                    }

                    function o(t, e, i) {
                        var o, s, r = (t = t.push ? t : [t]).length,
                            a = r,
                            l = [];
                        for (o = function (t, i, n) {
                                if ("e" == i && l.push(t), "b" == i) {
                                    if (!n) return;
                                    l.push(t)
                                }--r || e(l)
                            }, s = 0; s < a; s++) n(t[s], o, i)
                    }

                    function s(t, n, s) {
                        function r(n, s) {
                            o(t, function (t) {
                                i(u, t), n && i({
                                    success: n,
                                    error: s
                                }, t), e(l, t)
                            }, u)
                        }
                        var l, u;
                        if (n && n.trim && (l = n), u = (l ? s : n) || {}, l) {
                            if (l in a) throw "LoadJS";
                            a[l] = !0
                        }
                        if (u.returnPromise) return new Promise(r);
                        r()
                    }
                    var r = function () {},
                        a = {},
                        l = {},
                        u = {};
                    return s.ready = function (e, n) {
                        return t(e, function (t) {
                            i(n, t)
                        }), s
                    }, s.done = function (t) {
                        e(t, [])
                    }, s.reset = function () {
                        a = {}, l = {}, u = {}
                    }, s.isDefined = function (t) {
                        return t in a
                    }, s
                }()
            }),
            Ce = {
                setup: function () {
                    var t = this;
                    M(t.elements.wrapper, t.config.classNames.embed, !0), t.options.speed = t.config.speed.options, Y.call(t), Dt(window.Vimeo) ? Ce.ready.call(t) : ot(t.config.urls.vimeo.sdk).then(function () {
                        Ce.ready.call(t)
                    }).catch(function (e) {
                        t.debug.warn("Vimeo SDK (player.js) failed to load", e)
                    })
                },
                ready: function () {
                    var t = this,
                        e = this,
                        i = e.config.vimeo,
                        n = i.premium,
                        o = i.referrerPolicy,
                        s = a(i, ["premium", "referrerPolicy"]);
                    n && Object.assign(s, {
                        controls: !1,
                        sidedock: !1
                    });
                    var u = it(r({
                            loop: e.config.loop.active,
                            autoplay: e.autoplay,
                            muted: e.muted,
                            gesture: "media",
                            playsinline: !this.config.fullscreen.iosNative
                        }, s)),
                        c = e.media.getAttribute("src");
                    Xt(c) && (c = e.media.getAttribute(e.config.attributes.embed.id));
                    var h, d = Xt(h = c) ? null : qt(Number(h)) ? h : h.match(/^.*(vimeo.com\/|video\/)(\d+).*/) ? RegExp.$2 : h,
                        p = _("iframe"),
                        m = G(e.config.urls.vimeo.iframe, d, u);
                    if (p.setAttribute("src", m), p.setAttribute("allowfullscreen", ""), p.setAttribute("allow", ["autoplay", "fullscreen", "picture-in-picture"].join("; ")), Xt(o) || p.setAttribute("referrerPolicy", o), n || !i.customControls) p.setAttribute("data-poster", e.poster), e.media = k(p, e.media);
                    else {
                        var f = _("div", {
                            class: e.config.classNames.embedContainer,
                            "data-poster": e.poster
                        });
                        f.appendChild(p), e.media = k(f, e.media)
                    }
                    i.customControls || Z(G(e.config.urls.vimeo.api, m)).then(function (t) {
                        !Xt(t) && t.thumbnail_url && Te.setPoster.call(e, t.thumbnail_url).catch(function () {})
                    }), e.embed = new window.Vimeo.Player(p, {
                        autopause: e.config.autopause,
                        muted: e.muted
                    }), e.media.paused = !0, e.media.currentTime = 0, e.supported.ui && e.embed.disableTextTrack(), e.media.play = function () {
                        return st.call(e, !0), e.embed.play()
                    }, e.media.pause = function () {
                        return st.call(e, !1), e.embed.pause()
                    }, e.media.stop = function () {
                        e.pause(), e.currentTime = 0
                    };
                    var g = e.media.currentTime;
                    Object.defineProperty(e.media, "currentTime", {
                        get: function () {
                            return g
                        },
                        set: function (t) {
                            var i = e.embed,
                                n = e.media,
                                o = e.paused,
                                s = e.volume,
                                r = o && !i.hasPlayed;
                            n.seeking = !0, H.call(e, n, "seeking"), Promise.resolve(r && i.setVolume(0)).then(function () {
                                return i.setCurrentTime(t)
                            }).then(function () {
                                return r && i.pause()
                            }).then(function () {
                                return r && i.setVolume(s)
                            }).catch(function () {})
                        }
                    });
                    var v = e.config.speed.selected;
                    Object.defineProperty(e.media, "playbackRate", {
                        get: function () {
                            return v
                        },
                        set: function (t) {
                            e.embed.setPlaybackRate(t).then(function () {
                                v = t, H.call(e, e.media, "ratechange")
                            }).catch(function () {
                                e.options.speed = [1]
                            })
                        }
                    });
                    var y = e.config.volume;
                    Object.defineProperty(e.media, "volume", {
                        get: function () {
                            return y
                        },
                        set: function (t) {
                            e.embed.setVolume(t).then(function () {
                                y = t, H.call(e, e.media, "volumechange")
                            })
                        }
                    });
                    var b = e.config.muted;
                    Object.defineProperty(e.media, "muted", {
                        get: function () {
                            return b
                        },
                        set: function (t) {
                            var i = !!Ht(t) && t;
                            e.embed.setVolume(i ? 0 : e.config.volume).then(function () {
                                b = i, H.call(e, e.media, "volumechange")
                            })
                        }
                    });
                    var w, x = e.config.loop;
                    Object.defineProperty(e.media, "loop", {
                        get: function () {
                            return x
                        },
                        set: function (t) {
                            var i = Ht(t) ? t : e.config.loop.active;
                            e.embed.setLoop(i).then(function () {
                                x = i
                            })
                        }
                    }), e.embed.getVideoUrl().then(function (t) {
                        w = t, he.setDownloadUrl.call(e)
                    }).catch(function (e) {
                        t.debug.warn(e)
                    }), Object.defineProperty(e.media, "currentSrc", {
                        get: function () {
                            return w
                        }
                    }), Object.defineProperty(e.media, "ended", {
                        get: function () {
                            return e.currentTime === e.duration
                        }
                    }), Promise.all([e.embed.getVideoWidth(), e.embed.getVideoHeight()]).then(function (i) {
                        var n = l(i, 2),
                            o = n[0],
                            s = n[1];
                        e.embed.ratio = [o, s], Y.call(t)
                    }), e.embed.setAutopause(e.config.autopause).then(function (t) {
                        e.config.autopause = t
                    }), e.embed.getVideoTitle().then(function (i) {
                        e.config.title = i, Te.setTitle.call(t)
                    }), e.embed.getCurrentTime().then(function (t) {
                        g = t, H.call(e, e.media, "timeupdate")
                    }), e.embed.getDuration().then(function (t) {
                        e.media.duration = t, H.call(e, e.media, "durationchange")
                    }), e.embed.getTextTracks().then(function (t) {
                        e.media.textTracks = t, de.setup.call(e)
                    }), e.embed.on("cuechange", function (t) {
                        var i = t.cues,
                            n = (void 0 === i ? [] : i).map(function (t) {
                                return function (t) {
                                    var e = document.createDocumentFragment(),
                                        i = document.createElement("div");
                                    return e.appendChild(i), i.innerHTML = t, e.firstChild.innerText
                                }(t.text)
                            });
                        de.updateCues.call(e, n)
                    }), e.embed.on("loaded", function () {
                        e.embed.getPaused().then(function (t) {
                            st.call(e, !t), t || H.call(e, e.media, "playing")
                        }), Bt(e.embed.element) && e.supported.ui && e.embed.element.setAttribute("tabindex", -1)
                    }), e.embed.on("bufferstart", function () {
                        H.call(e, e.media, "waiting")
                    }), e.embed.on("bufferend", function () {
                        H.call(e, e.media, "playing")
                    }), e.embed.on("play", function () {
                        st.call(e, !0), H.call(e, e.media, "playing")
                    }), e.embed.on("pause", function () {
                        st.call(e, !1)
                    }), e.embed.on("timeupdate", function (t) {
                        e.media.seeking = !1, g = t.seconds, H.call(e, e.media, "timeupdate")
                    }), e.embed.on("progress", function (t) {
                        e.media.buffered = t.percent, H.call(e, e.media, "progress"), 1 === parseInt(t.percent, 10) && H.call(e, e.media, "canplaythrough"), e.embed.getDuration().then(function (t) {
                            t !== e.media.duration && (e.media.duration = t, H.call(e, e.media, "durationchange"))
                        })
                    }), e.embed.on("seeked", function () {
                        e.media.seeking = !1, H.call(e, e.media, "seeked")
                    }), e.embed.on("ended", function () {
                        e.media.paused = !0, H.call(e, e.media, "ended")
                    }), e.embed.on("error", function (t) {
                        e.media.error = t, H.call(e, e.media, "error")
                    }), i.customControls && setTimeout(function () {
                        return Te.build.call(e)
                    }, 0)
                }
            },
            ke = {
                setup: function () {
                    var t = this;
                    if (M(this.elements.wrapper, this.config.classNames.embed, !0), Dt(window.YT) && Ft(window.YT.Player)) ke.ready.call(this);
                    else {
                        var e = window.onYouTubeIframeAPIReady;
                        window.onYouTubeIframeAPIReady = function () {
                            Ft(e) && e(), ke.ready.call(t)
                        }, ot(this.config.urls.youtube.sdk).catch(function (e) {
                            t.debug.warn("YouTube API failed to load", e)
                        })
                    }
                },
                getTitle: function (t) {
                    var e = this;
                    Z(G(this.config.urls.youtube.api, t)).then(function (t) {
                        if (Dt(t)) {
                            var i = t.title,
                                n = t.height,
                                o = t.width;
                            e.config.title = i, Te.setTitle.call(e), e.embed.ratio = [o, n]
                        }
                        Y.call(e)
                    }).catch(function () {
                        Y.call(e)
                    })
                },
                ready: function () {
                    var t = this,
                        e = t.config.youtube,
                        i = t.media && t.media.getAttribute("id");
                    if (Xt(i) || !i.startsWith("youtube-")) {
                        var n = t.media.getAttribute("src");
                        Xt(n) && (n = t.media.getAttribute(this.config.attributes.embed.id));
                        var o, s, r = Xt(o = n) ? null : o.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/) ? RegExp.$2 : o,
                            a = _("div", {
                                id: (s = t.provider, "".concat(s, "-").concat(Math.floor(1e4 * Math.random()))),
                                "data-poster": e.customControls ? t.poster : void 0
                            });
                        if (t.media = k(a, t.media), e.customControls) {
                            var l = function (t) {
                                return "https://i.ytimg.com/vi/".concat(r, "/").concat(t, "default.jpg")
                            };
                            nt(l("maxres"), 121).catch(function () {
                                return nt(l("sd"), 121)
                            }).catch(function () {
                                return nt(l("hq"))
                            }).then(function (e) {
                                return Te.setPoster.call(t, e.src)
                            }).then(function (e) {
                                e.includes("maxres") || (t.elements.poster.style.backgroundSize = "cover")
                            }).catch(function () {})
                        }
                        t.embed = new window.YT.Player(t.media, {
                            videoId: r,
                            host: at(e),
                            playerVars: w({}, {
                                autoplay: t.config.autoplay ? 1 : 0,
                                hl: t.config.hl,
                                controls: t.supported.ui && e.customControls ? 0 : 1,
                                disablekb: 1,
                                playsinline: t.config.fullscreen.iosNative ? 0 : 1,
                                cc_load_policy: t.captions.active ? 1 : 0,
                                cc_lang_pref: t.config.captions.language,
                                widget_referrer: window ? window.location.href : null
                            }, e),
                            events: {
                                onError: function (e) {
                                    if (!t.media.error) {
                                        var i = e.data,
                                            n = {
                                                2: "The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.",
                                                5: "The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.",
                                                100: "The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.",
                                                101: "The owner of the requested video does not allow it to be played in embedded players.",
                                                150: "The owner of the requested video does not allow it to be played in embedded players."
                                            } [i] || "An unknown error occured";
                                        t.media.error = {
                                            code: i,
                                            message: n
                                        }, H.call(t, t.media, "error")
                                    }
                                },
                                onPlaybackRateChange: function (e) {
                                    var i = e.target;
                                    t.media.playbackRate = i.getPlaybackRate(), H.call(t, t.media, "ratechange")
                                },
                                onReady: function (i) {
                                    if (!Ft(t.media.play)) {
                                        var n = i.target;
                                        ke.getTitle.call(t, r), t.media.play = function () {
                                            rt.call(t, !0), n.playVideo()
                                        }, t.media.pause = function () {
                                            rt.call(t, !1), n.pauseVideo()
                                        }, t.media.stop = function () {
                                            n.stopVideo()
                                        }, t.media.duration = n.getDuration(), t.media.paused = !0, t.media.currentTime = 0, Object.defineProperty(t.media, "currentTime", {
                                            get: function () {
                                                return Number(n.getCurrentTime())
                                            },
                                            set: function (e) {
                                                t.paused && !t.embed.hasPlayed && t.embed.mute(), t.media.seeking = !0, H.call(t, t.media, "seeking"), n.seekTo(e)
                                            }
                                        }), Object.defineProperty(t.media, "playbackRate", {
                                            get: function () {
                                                return n.getPlaybackRate()
                                            },
                                            set: function (t) {
                                                n.setPlaybackRate(t)
                                            }
                                        });
                                        var o = t.config.volume;
                                        Object.defineProperty(t.media, "volume", {
                                            get: function () {
                                                return o
                                            },
                                            set: function (e) {
                                                o = e, n.setVolume(100 * o), H.call(t, t.media, "volumechange")
                                            }
                                        });
                                        var s = t.config.muted;
                                        Object.defineProperty(t.media, "muted", {
                                            get: function () {
                                                return s
                                            },
                                            set: function (e) {
                                                var i = Ht(e) ? e : s;
                                                s = i, n[i ? "mute" : "unMute"](), n.setVolume(100 * o), H.call(t, t.media, "volumechange")
                                            }
                                        }), Object.defineProperty(t.media, "currentSrc", {
                                            get: function () {
                                                return n.getVideoUrl()
                                            }
                                        }), Object.defineProperty(t.media, "ended", {
                                            get: function () {
                                                return t.currentTime === t.duration
                                            }
                                        });
                                        var a = n.getAvailablePlaybackRates();
                                        t.options.speed = a.filter(function (e) {
                                            return t.config.speed.options.includes(e)
                                        }), t.supported.ui && e.customControls && t.media.setAttribute("tabindex", -1), H.call(t, t.media, "timeupdate"), H.call(t, t.media, "durationchange"), clearInterval(t.timers.buffering), t.timers.buffering = setInterval(function () {
                                            t.media.buffered = n.getVideoLoadedFraction(), (null === t.media.lastBuffered || t.media.lastBuffered < t.media.buffered) && H.call(t, t.media, "progress"), t.media.lastBuffered = t.media.buffered, 1 === t.media.buffered && (clearInterval(t.timers.buffering), H.call(t, t.media, "canplaythrough"))
                                        }, 200), e.customControls && setTimeout(function () {
                                            return Te.build.call(t)
                                        }, 50)
                                    }
                                },
                                onStateChange: function (i) {
                                    var n = i.target;
                                    switch (clearInterval(t.timers.playing), t.media.seeking && [1, 2].includes(i.data) && (t.media.seeking = !1, H.call(t, t.media, "seeked")), i.data) {
                                        case -1:
                                            H.call(t, t.media, "timeupdate"), t.media.buffered = n.getVideoLoadedFraction(), H.call(t, t.media, "progress");
                                            break;
                                        case 0:
                                            rt.call(t, !1), t.media.loop ? (n.stopVideo(), n.playVideo()) : H.call(t, t.media, "ended");
                                            break;
                                        case 1:
                                            e.customControls && !t.config.autoplay && t.media.paused && !t.embed.hasPlayed ? t.media.pause() : (rt.call(t, !0), H.call(t, t.media, "playing"), t.timers.playing = setInterval(function () {
                                                H.call(t, t.media, "timeupdate")
                                            }, 50), t.media.duration !== n.getDuration() && (t.media.duration = n.getDuration(), H.call(t, t.media, "durationchange")));
                                            break;
                                        case 2:
                                            t.muted || t.embed.unMute(), rt.call(t, !1);
                                            break;
                                        case 3:
                                            H.call(t, t.media, "waiting")
                                    }
                                    H.call(t, t.elements.container, "statechange", !1, {
                                        code: i.data
                                    })
                                }
                            }
                        })
                    }
                }
            },
            Ae = {
                setup: function () {
                    this.media ? (M(this.elements.container, this.config.classNames.type.replace("{0}", this.type), !0), M(this.elements.container, this.config.classNames.provider.replace("{0}", this.provider), !0), this.isEmbed && M(this.elements.container, this.config.classNames.type.replace("{0}", "video"), !0), this.isVideo && (this.elements.wrapper = _("div", {
                        class: this.config.classNames.video
                    }), x(this.media, this.elements.wrapper), this.elements.poster = _("div", {
                        class: this.config.classNames.poster,
                        hidden: ""
                    }), this.elements.wrapper.appendChild(this.elements.poster)), this.isHTML5 ? ie.setup.call(this) : this.isYouTube ? ke.setup.call(this) : this.isVimeo && Ce.setup.call(this)) : this.debug.warn("No media element found!")
                }
            },
            Ee = function () {
                function t(i) {
                    var n = this;
                    e(this, t), o(this, "load", function () {
                        n.enabled && (Dt(window.google) && Dt(window.google.ima) ? n.ready() : ot(n.player.config.urls.googleIMA.sdk).then(function () {
                            n.ready()
                        }).catch(function () {
                            n.trigger("error", new Error("Google IMA SDK failed to load"))
                        }))
                    }), o(this, "ready", function () {
                        var t;
                        n.enabled || ((t = n).manager && t.manager.destroy(), t.elements.displayContainer && t.elements.displayContainer.destroy(), t.elements.container.remove()), n.startSafetyTimer(12e3, "ready()"), n.managerPromise.then(function () {
                            n.clearSafetyTimer("onAdsManagerLoaded()")
                        }), n.listeners(), n.setupIMA()
                    }), o(this, "setupIMA", function () {
                        n.elements.container = _("div", {
                            class: n.player.config.classNames.ads
                        }), n.player.elements.container.appendChild(n.elements.container), google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED), google.ima.settings.setLocale(n.player.config.ads.language), google.ima.settings.setDisableCustomPlaybackForIOS10Plus(n.player.config.playsinline), n.elements.displayContainer = new google.ima.AdDisplayContainer(n.elements.container, n.player.media), n.loader = new google.ima.AdsLoader(n.elements.displayContainer), n.loader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, function (t) {
                            return n.onAdsManagerLoaded(t)
                        }, !1), n.loader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, function (t) {
                            return n.onAdError(t)
                        }, !1), n.requestAds()
                    }), o(this, "requestAds", function () {
                        var t = n.player.elements.container;
                        try {
                            var e = new google.ima.AdsRequest;
                            e.adTagUrl = n.tagUrl, e.linearAdSlotWidth = t.offsetWidth, e.linearAdSlotHeight = t.offsetHeight, e.nonLinearAdSlotWidth = t.offsetWidth, e.nonLinearAdSlotHeight = t.offsetHeight, e.forceNonLinearFullSlot = !1, e.setAdWillPlayMuted(!n.player.muted), n.loader.requestAds(e)
                        } catch (t) {
                            n.onAdError(t)
                        }
                    }), o(this, "pollCountdown", function () {
                        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                        if (!t) return clearInterval(n.countdownTimer), void n.elements.container.removeAttribute("data-badge-text");
                        var e = function () {
                            var t = tt(Math.max(n.manager.getRemainingTime(), 0)),
                                e = "".concat(re("advertisement", n.player.config), " - ").concat(t);
                            n.elements.container.setAttribute("data-badge-text", e)
                        };
                        n.countdownTimer = setInterval(e, 100)
                    }), o(this, "onAdsManagerLoaded", function (t) {
                        if (n.enabled) {
                            var e = new google.ima.AdsRenderingSettings;
                            e.restoreCustomPlaybackStateOnAdBreakComplete = !0, e.enablePreloading = !0, n.manager = t.getAdsManager(n.player, e), n.cuePoints = n.manager.getCuePoints(), n.manager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, function (t) {
                                return n.onAdError(t)
                            }), Object.keys(google.ima.AdEvent.Type).forEach(function (t) {
                                n.manager.addEventListener(google.ima.AdEvent.Type[t], function (t) {
                                    return n.onAdEvent(t)
                                })
                            }), n.trigger("loaded")
                        }
                    }), o(this, "addCuePoints", function () {
                        Xt(n.cuePoints) || n.cuePoints.forEach(function (t) {
                            if (0 !== t && -1 !== t && t < n.player.duration) {
                                var e = n.player.elements.progress;
                                if (Bt(e)) {
                                    var i = 100 / n.player.duration * t,
                                        o = _("span", {
                                            class: n.player.config.classNames.cues
                                        });
                                    o.style.left = "".concat(i.toString(), "%"), e.appendChild(o)
                                }
                            }
                        })
                    }), o(this, "onAdEvent", function (t) {
                        var e = n.player.elements.container,
                            i = t.getAd(),
                            o = t.getAdData();
                        switch (function (t) {
                            H.call(n.player, n.player.media, "ads".concat(t.replace(/_/g, "").toLowerCase()))
                        }(t.type), t.type) {
                            case google.ima.AdEvent.Type.LOADED:
                                n.trigger("loaded"), n.pollCountdown(!0), i.isLinear() || (i.width = e.offsetWidth, i.height = e.offsetHeight);
                                break;
                            case google.ima.AdEvent.Type.STARTED:
                                n.manager.setVolume(n.player.volume);
                                break;
                            case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
                                n.player.ended ? n.loadAds() : n.loader.contentComplete();
                                break;
                            case google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED:
                                n.pauseContent();
                                break;
                            case google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED:
                                n.pollCountdown(), n.resumeContent();
                                break;
                            case google.ima.AdEvent.Type.LOG:
                                o.adError && n.player.debug.warn("Non-fatal ad error: ".concat(o.adError.getMessage()))
                        }
                    }), o(this, "onAdError", function (t) {
                        n.cancel(),
                            n.player.debug.warn("Ads error", t)
                    }), o(this, "listeners", function () {
                        var t, e = n.player.elements.container;
                        n.player.on("canplay", function () {
                            n.addCuePoints()
                        }), n.player.on("ended", function () {
                            n.loader.contentComplete()
                        }), n.player.on("timeupdate", function () {
                            t = n.player.currentTime
                        }), n.player.on("seeked", function () {
                            var e = n.player.currentTime;
                            Xt(n.cuePoints) || n.cuePoints.forEach(function (i, o) {
                                t < i && i < e && (n.manager.discardAdBreak(), n.cuePoints.splice(o, 1))
                            })
                        }), window.addEventListener("resize", function () {
                            n.manager && n.manager.resize(e.offsetWidth, e.offsetHeight, google.ima.ViewMode.NORMAL)
                        })
                    }), o(this, "play", function () {
                        var t = n.player.elements.container;
                        n.managerPromise || n.resumeContent(), n.managerPromise.then(function () {
                            n.manager.setVolume(n.player.volume), n.elements.displayContainer.initialize();
                            try {
                                n.initialized || (n.manager.init(t.offsetWidth, t.offsetHeight, google.ima.ViewMode.NORMAL), n.manager.start()), n.initialized = !0
                            } catch (t) {
                                n.onAdError(t)
                            }
                        }).catch(function () {})
                    }), o(this, "resumeContent", function () {
                        n.elements.container.style.zIndex = "", n.playing = !1, R(n.player.media.play())
                    }), o(this, "pauseContent", function () {
                        n.elements.container.style.zIndex = 3, n.playing = !0, n.player.media.pause()
                    }), o(this, "cancel", function () {
                        n.initialized && n.resumeContent(), n.trigger("error"), n.loadAds()
                    }), o(this, "loadAds", function () {
                        n.managerPromise.then(function () {
                            n.manager && n.manager.destroy(), n.managerPromise = new Promise(function (t) {
                                n.on("loaded", t), n.player.debug.log(n.manager)
                            }), n.initialized = !1, n.requestAds()
                        }).catch(function () {})
                    }), o(this, "trigger", function (t) {
                        for (var e = arguments.length, i = new Array(e > 1 ? e - 1 : 0), o = 1; o < e; o++) i[o - 1] = arguments[o];
                        var s = n.events[t];
                        Wt(s) && s.forEach(function (t) {
                            Ft(t) && t.apply(n, i)
                        })
                    }), o(this, "on", function (t, e) {
                        return Wt(n.events[t]) || (n.events[t] = []), n.events[t].push(e), n
                    }), o(this, "startSafetyTimer", function (t, e) {
                        n.player.debug.log("Safety timer invoked from: ".concat(e)), n.safetyTimer = setTimeout(function () {
                            n.cancel(), n.clearSafetyTimer("startSafetyTimer()")
                        }, t)
                    }), o(this, "clearSafetyTimer", function (t) {
                        Lt(n.safetyTimer) || (n.player.debug.log("Safety timer cleared from: ".concat(t)), clearTimeout(n.safetyTimer), n.safetyTimer = null)
                    }), this.player = i, this.config = i.config.ads, this.playing = !1, this.initialized = !1, this.elements = {
                        container: null,
                        displayContainer: null
                    }, this.manager = null, this.loader = null, this.cuePoints = null, this.events = {}, this.safetyTimer = null, this.countdownTimer = null, this.managerPromise = new Promise(function (t, e) {
                        n.on("loaded", t), n.on("error", e)
                    }), this.load()
                }
                return n(t, [{
                    key: "enabled",
                    get: function () {
                        var t = this.config;
                        return this.player.isHTML5 && this.player.isVideo && t.enabled && (!Xt(t.publisherId) || Gt(t.tagUrl))
                    }
                }, {
                    key: "tagUrl",
                    get: function () {
                        var t = this.config;
                        if (Gt(t.tagUrl)) return t.tagUrl;
                        var e = {
                            AV_PUBLISHERID: "58c25bb0073ef448b1087ad6",
                            AV_CHANNELID: "5a0458dc28a06145e4519d21",
                            AV_URL: window.location.hostname,
                            cb: Date.now(),
                            AV_WIDTH: 640,
                            AV_HEIGHT: 480,
                            AV_CDIM2: t.publisherId
                        };
                        return "".concat("https://go.aniview.com/api/adserver6/vast/", "?").concat(it(e))
                    }
                }]), t
            }(),
            Me = function (t, e) {
                var i = {};
                return t > e.width / e.height ? (i.width = e.width, i.height = 1 / t * e.width) : (i.height = e.height, i.width = t * e.height), i
            },
            Ie = function () {
                function t(i) {
                    var n = this;
                    e(this, t), o(this, "load", function () {
                        n.player.elements.display.seekTooltip && (n.player.elements.display.seekTooltip.hidden = n.enabled), n.enabled && n.getThumbnails().then(function () {
                            n.enabled && (n.render(), n.determineContainerAutoSizing(), n.loaded = !0)
                        })
                    }), o(this, "getThumbnails", function () {
                        return new Promise(function (t) {
                            var e = n.player.config.previewThumbnails.src;
                            if (Xt(e)) throw new Error("Missing previewThumbnails.src config attribute");
                            var i = function () {
                                n.thumbnails.sort(function (t, e) {
                                    return t.height - e.height
                                }), n.player.debug.log("Preview thumbnails", n.thumbnails), t()
                            };
                            if (Ft(e)) e(function (t) {
                                n.thumbnails = t, i()
                            });
                            else {
                                var o = (Nt(e) ? [e] : e).map(function (t) {
                                    return n.getThumbnail(t)
                                });
                                Promise.all(o).then(i)
                            }
                        })
                    }), o(this, "getThumbnail", function (t) {
                        return new Promise(function (e) {
                            Z(t).then(function (i) {
                                var o, s, r = {
                                    frames: (o = i, s = [], o.split(/\r\n\r\n|\n\n|\r\r/).forEach(function (t) {
                                        var e = {};
                                        t.split(/\r\n|\n|\r/).forEach(function (t) {
                                            if (qt(e.startTime)) {
                                                if (!Xt(t.trim()) && Xt(e.text)) {
                                                    var i = t.trim().split("#xywh="),
                                                        n = l(i, 1);
                                                    if (e.text = n[0], i[1]) {
                                                        var o = l(i[1].split(","), 4);
                                                        e.x = o[0], e.y = o[1], e.w = o[2], e.h = o[3]
                                                    }
                                                }
                                            } else {
                                                var s = t.match(/([0-9]{2})?:?([0-9]{2}):([0-9]{2}).([0-9]{2,3})( ?--> ?)([0-9]{2})?:?([0-9]{2}):([0-9]{2}).([0-9]{2,3})/);
                                                s && (e.startTime = 60 * Number(s[1] || 0) * 60 + 60 * Number(s[2]) + Number(s[3]) + Number("0.".concat(s[4])), e.endTime = 60 * Number(s[6] || 0) * 60 + 60 * Number(s[7]) + Number(s[8]) + Number("0.".concat(s[9])))
                                            }
                                        }), e.text && s.push(e)
                                    }), s),
                                    height: null,
                                    urlPrefix: ""
                                };
                                r.frames[0].text.startsWith("/") || r.frames[0].text.startsWith("http://") || r.frames[0].text.startsWith("https://") || (r.urlPrefix = t.substring(0, t.lastIndexOf("/") + 1));
                                var a = new Image;
                                a.onload = function () {
                                    r.height = a.naturalHeight, r.width = a.naturalWidth, n.thumbnails.push(r), e()
                                }, a.src = r.urlPrefix + r.frames[0].text
                            })
                        })
                    }), o(this, "startMove", function (t) {
                        if (n.loaded && Vt(t) && ["touchmove", "mousemove"].includes(t.type) && n.player.media.duration) {
                            if ("touchmove" === t.type) n.seekTime = n.player.media.duration * (n.player.elements.inputs.seek.value / 100);
                            else {
                                var e = n.player.elements.progress.getBoundingClientRect(),
                                    i = 100 / e.width * (t.pageX - e.left);
                                n.seekTime = n.player.media.duration * (i / 100), n.seekTime < 0 && (n.seekTime = 0), n.seekTime > n.player.media.duration - 1 && (n.seekTime = n.player.media.duration - 1), n.mousePosX = t.pageX, n.elements.thumb.time.innerText = tt(n.seekTime)
                            }
                            n.showImageAtCurrentTime()
                        }
                    }), o(this, "endMove", function () {
                        n.toggleThumbContainer(!1, !0)
                    }), o(this, "startScrubbing", function (t) {
                        (Lt(t.button) || !1 === t.button || 0 === t.button) && (n.mouseDown = !0, n.player.media.duration && (n.toggleScrubbingContainer(!0), n.toggleThumbContainer(!1, !0), n.showImageAtCurrentTime()))
                    }), o(this, "endScrubbing", function () {
                        n.mouseDown = !1, Math.ceil(n.lastTime) === Math.ceil(n.player.media.currentTime) ? n.toggleScrubbingContainer(!1) : N.call(n.player, n.player.media, "timeupdate", function () {
                            n.mouseDown || n.toggleScrubbingContainer(!1)
                        })
                    }), o(this, "listeners", function () {
                        n.player.on("play", function () {
                            n.toggleThumbContainer(!1, !0)
                        }), n.player.on("seeked", function () {
                            n.toggleThumbContainer(!1)
                        }), n.player.on("timeupdate", function () {
                            n.lastTime = n.player.media.currentTime
                        })
                    }), o(this, "render", function () {
                        n.elements.thumb.container = _("div", {
                            class: n.player.config.classNames.previewThumbnails.thumbContainer
                        }), n.elements.thumb.imageContainer = _("div", {
                            class: n.player.config.classNames.previewThumbnails.imageContainer
                        }), n.elements.thumb.container.appendChild(n.elements.thumb.imageContainer);
                        var t = _("div", {
                            class: n.player.config.classNames.previewThumbnails.timeContainer
                        });
                        n.elements.thumb.time = _("span", {}, "00:00"), t.appendChild(n.elements.thumb.time), n.elements.thumb.container.appendChild(t), Bt(n.player.elements.progress) && n.player.elements.progress.appendChild(n.elements.thumb.container), n.elements.scrubbing.container = _("div", {
                            class: n.player.config.classNames.previewThumbnails.scrubbingContainer
                        }), n.player.elements.wrapper.appendChild(n.elements.scrubbing.container)
                    }), o(this, "destroy", function () {
                        n.elements.thumb.container && n.elements.thumb.container.remove(), n.elements.scrubbing.container && n.elements.scrubbing.container.remove()
                    }), o(this, "showImageAtCurrentTime", function () {
                        n.mouseDown ? n.setScrubbingContainerSize() : n.setThumbContainerSizeAndPos();
                        var t = n.thumbnails[0].frames.findIndex(function (t) {
                                return n.seekTime >= t.startTime && n.seekTime <= t.endTime
                            }),
                            e = t >= 0,
                            i = 0;
                        n.mouseDown || n.toggleThumbContainer(e), e && (n.thumbnails.forEach(function (e, o) {
                            n.loadedImages.includes(e.frames[t].text) && (i = o)
                        }), t !== n.showingThumb && (n.showingThumb = t, n.loadImage(i)))
                    }), o(this, "loadImage", function () {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
                            e = n.showingThumb,
                            i = n.thumbnails[t],
                            o = i.urlPrefix,
                            s = i.frames[e],
                            r = i.frames[e].text,
                            a = o + r;
                        if (n.currentImageElement && n.currentImageElement.dataset.filename === r) n.showImage(n.currentImageElement, s, t, e, r, !1), n.currentImageElement.dataset.index = e, n.removeOldImages(n.currentImageElement);
                        else {
                            n.loadingImage && n.usingSprites && (n.loadingImage.onload = null);
                            var l = new Image;
                            l.src = a, l.dataset.index = e, l.dataset.filename = r, n.showingThumbFilename = r, n.player.debug.log("Loading image: ".concat(a)), l.onload = function () {
                                return n.showImage(l, s, t, e, r, !0)
                            }, n.loadingImage = l, n.removeOldImages(l)
                        }
                    }), o(this, "showImage", function (t, e, i, o, s) {
                        var r = !(arguments.length > 5 && void 0 !== arguments[5]) || arguments[5];
                        n.player.debug.log("Showing thumb: ".concat(s, ". num: ").concat(o, ". qual: ").concat(i, ". newimg: ").concat(r)), n.setImageSizeAndOffset(t, e), r && (n.currentImageContainer.appendChild(t), n.currentImageElement = t, n.loadedImages.includes(s) || n.loadedImages.push(s)), n.preloadNearby(o, !0).then(n.preloadNearby(o, !1)).then(n.getHigherQuality(i, t, e, s))
                    }), o(this, "removeOldImages", function (t) {
                        Array.from(n.currentImageContainer.children).forEach(function (e) {
                            if ("img" === e.tagName.toLowerCase()) {
                                var i = n.usingSprites ? 500 : 1e3;
                                if (e.dataset.index !== t.dataset.index && !e.dataset.deleting) {
                                    e.dataset.deleting = !0;
                                    var o = n.currentImageContainer;
                                    setTimeout(function () {
                                        o.removeChild(e), n.player.debug.log("Removing thumb: ".concat(e.dataset.filename))
                                    }, i)
                                }
                            }
                        })
                    }), o(this, "preloadNearby", function (t) {
                        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                        return new Promise(function (i) {
                            setTimeout(function () {
                                var o = n.thumbnails[0].frames[t].text;
                                if (n.showingThumbFilename === o) {
                                    var s;
                                    s = e ? n.thumbnails[0].frames.slice(t) : n.thumbnails[0].frames.slice(0, t).reverse();
                                    var r = !1;
                                    s.forEach(function (t) {
                                        var e = t.text;
                                        if (e !== o && !n.loadedImages.includes(e)) {
                                            r = !0, n.player.debug.log("Preloading thumb filename: ".concat(e));
                                            var s = n.thumbnails[0].urlPrefix + e,
                                                a = new Image;
                                            a.src = s, a.onload = function () {
                                                n.player.debug.log("Preloaded thumb filename: ".concat(e)), n.loadedImages.includes(e) || n.loadedImages.push(e), i()
                                            }
                                        }
                                    }), r || i()
                                }
                            }, 300)
                        })
                    }), o(this, "getHigherQuality", function (t, e, i, o) {
                        if (t < n.thumbnails.length - 1) {
                            var s = e.naturalHeight;
                            n.usingSprites && (s = i.h), s < n.thumbContainerHeight && setTimeout(function () {
                                n.showingThumbFilename === o && (n.player.debug.log("Showing higher quality thumb for: ".concat(o)), n.loadImage(t + 1))
                            }, 300)
                        }
                    }), o(this, "toggleThumbContainer", function () {
                        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
                            e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
                            i = n.player.config.classNames.previewThumbnails.thumbContainerShown;
                        n.elements.thumb.container.classList.toggle(i, t), !t && e && (n.showingThumb = null, n.showingThumbFilename = null)
                    }), o(this, "toggleScrubbingContainer", function () {
                        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
                            e = n.player.config.classNames.previewThumbnails.scrubbingContainerShown;
                        n.elements.scrubbing.container.classList.toggle(e, t), t || (n.showingThumb = null, n.showingThumbFilename = null)
                    }), o(this, "determineContainerAutoSizing", function () {
                        (n.elements.thumb.imageContainer.clientHeight > 20 || n.elements.thumb.imageContainer.clientWidth > 20) && (n.sizeSpecifiedInCSS = !0)
                    }), o(this, "setThumbContainerSizeAndPos", function () {
                        if (n.sizeSpecifiedInCSS) {
                            if (n.elements.thumb.imageContainer.clientHeight > 20 && n.elements.thumb.imageContainer.clientWidth < 20) {
                                var t = Math.floor(n.elements.thumb.imageContainer.clientHeight * n.thumbAspectRatio);
                                n.elements.thumb.imageContainer.style.width = "".concat(t, "px")
                            } else if (n.elements.thumb.imageContainer.clientHeight < 20 && n.elements.thumb.imageContainer.clientWidth > 20) {
                                var e = Math.floor(n.elements.thumb.imageContainer.clientWidth / n.thumbAspectRatio);
                                n.elements.thumb.imageContainer.style.height = "".concat(e, "px")
                            }
                        } else {
                            var i = Math.floor(n.thumbContainerHeight * n.thumbAspectRatio);
                            n.elements.thumb.imageContainer.style.height = "".concat(n.thumbContainerHeight, "px"), n.elements.thumb.imageContainer.style.width = "".concat(i, "px")
                        }
                        n.setThumbContainerPos()
                    }), o(this, "setThumbContainerPos", function () {
                        var t = n.player.elements.progress.getBoundingClientRect(),
                            e = n.player.elements.container.getBoundingClientRect(),
                            i = n.elements.thumb.container,
                            o = e.left - t.left + 10,
                            s = e.right - t.left - i.clientWidth - 10,
                            r = n.mousePosX - t.left - i.clientWidth / 2;
                        r < o && (r = o), r > s && (r = s), i.style.left = "".concat(r, "px")
                    }), o(this, "setScrubbingContainerSize", function () {
                        var t = Me(n.thumbAspectRatio, {
                                width: n.player.media.clientWidth,
                                height: n.player.media.clientHeight
                            }),
                            e = t.width,
                            i = t.height;
                        n.elements.scrubbing.container.style.width = "".concat(e, "px"), n.elements.scrubbing.container.style.height = "".concat(i, "px")
                    }), o(this, "setImageSizeAndOffset", function (t, e) {
                        if (n.usingSprites) {
                            var i = n.thumbContainerHeight / e.h;
                            t.style.height = "".concat(t.naturalHeight * i, "px"), t.style.width = "".concat(t.naturalWidth * i, "px"), t.style.left = "-".concat(e.x * i, "px"), t.style.top = "-".concat(e.y * i, "px")
                        }
                    }), this.player = i, this.thumbnails = [], this.loaded = !1, this.lastMouseMoveTime = Date.now(), this.mouseDown = !1, this.loadedImages = [], this.elements = {
                        thumb: {},
                        scrubbing: {}
                    }, this.load()
                }
                return n(t, [{
                    key: "enabled",
                    get: function () {
                        return this.player.isHTML5 && this.player.isVideo && this.player.config.previewThumbnails.enabled
                    }
                }, {
                    key: "currentImageContainer",
                    get: function () {
                        return this.mouseDown ? this.elements.scrubbing.container : this.elements.thumb.imageContainer
                    }
                }, {
                    key: "usingSprites",
                    get: function () {
                        return Object.keys(this.thumbnails[0].frames[0]).includes("w")
                    }
                }, {
                    key: "thumbAspectRatio",
                    get: function () {
                        return this.usingSprites ? this.thumbnails[0].frames[0].w / this.thumbnails[0].frames[0].h : this.thumbnails[0].width / this.thumbnails[0].height
                    }
                }, {
                    key: "thumbContainerHeight",
                    get: function () {
                        return this.mouseDown ? Me(this.thumbAspectRatio, {
                            width: this.player.media.clientWidth,
                            height: this.player.media.clientHeight
                        }).height : this.sizeSpecifiedInCSS ? this.elements.thumb.imageContainer.clientHeight : Math.floor(this.player.media.clientWidth / this.thumbAspectRatio / 4)
                    }
                }, {
                    key: "currentImageElement",
                    get: function () {
                        return this.mouseDown ? this.currentScrubbingImageElement : this.currentThumbnailImageElement
                    },
                    set: function (t) {
                        this.mouseDown ? this.currentScrubbingImageElement = t : this.currentThumbnailImageElement = t
                    }
                }]), t
            }(),
            Oe = {
                insertElements: function (t, e) {
                    var i = this;
                    Nt(e) ? S(t, this.media, {
                        src: e
                    }) : Wt(e) && e.forEach(function (e) {
                        S(t, i.media, e)
                    })
                },
                change: function (t) {
                    var e = this;
                    b(t, "sources.length") ? (ie.cancelRequests.call(this), this.destroy.call(this, function () {
                        e.options.quality = [], $(e.media), e.media = null, Bt(e.elements.container) && e.elements.container.removeAttribute("class");
                        var i = t.sources,
                            n = t.type,
                            o = l(i, 1)[0],
                            s = o.provider,
                            r = void 0 === s ? ge.html5 : s,
                            a = o.src,
                            u = "html5" === r ? n : "div",
                            c = "html5" === r ? {} : {
                                src: a
                            };
                        Object.assign(e, {
                            provider: r,
                            type: n,
                            supported: te.check(n, r, e.config.playsinline),
                            media: _(u, c)
                        }), e.elements.container.appendChild(e.media), Ht(t.autoplay) && (e.config.autoplay = t.autoplay), e.isHTML5 && (e.config.crossorigin && e.media.setAttribute("crossorigin", ""), e.config.autoplay && e.media.setAttribute("autoplay", ""), Xt(t.poster) || (e.poster = t.poster), e.config.loop.active && e.media.setAttribute("loop", ""), e.config.muted && e.media.setAttribute("muted", ""), e.config.playsinline && e.media.setAttribute("playsinline", "")), Te.addStyleHook.call(e), e.isHTML5 && Oe.insertElements.call(e, "source", i), e.config.title = t.title, Ae.setup.call(e), e.isHTML5 && Object.keys(t).includes("tracks") && Oe.insertElements.call(e, "track", t.tracks), (e.isHTML5 || e.isEmbed && !e.supported.ui) && Te.build.call(e), e.isHTML5 && e.media.load(), Xt(t.previewThumbnails) || (Object.assign(e.config.previewThumbnails, t.previewThumbnails), e.previewThumbnails && e.previewThumbnails.loaded && (e.previewThumbnails.destroy(), e.previewThumbnails = null), e.config.previewThumbnails.enabled && (e.previewThumbnails = new Ie(e))), e.fullscreen.update()
                    }, !0)) : this.debug.warn("Invalid source format")
                }
            },
            Pe = function () {
                function t(i, n) {
                    var s = this;
                    if (e(this, t), o(this, "play", function () {
                            return Ft(s.media.play) ? (s.ads && s.ads.enabled && s.ads.managerPromise.then(function () {
                                return s.ads.play()
                            }).catch(function () {
                                return R(s.media.play())
                            }), s.media.play()) : null
                        }), o(this, "pause", function () {
                            return s.playing && Ft(s.media.pause) ? s.media.pause() : null
                        }), o(this, "togglePlay", function (t) {
                            return (Ht(t) ? t : !s.playing) ? s.play() : s.pause()
                        }), o(this, "stop", function () {
                            s.isHTML5 ? (s.pause(), s.restart()) : Ft(s.media.stop) && s.media.stop()
                        }), o(this, "restart", function () {
                            s.currentTime = 0
                        }), o(this, "rewind", function (t) {
                            s.currentTime -= qt(t) ? t : s.config.seekTime
                        }), o(this, "forward", function (t) {
                            s.currentTime += qt(t) ? t : s.config.seekTime
                        }), o(this, "increaseVolume", function (t) {
                            var e = s.media.muted ? 0 : s.volume;
                            s.volume = e + (qt(t) ? t : 0)
                        }), o(this, "decreaseVolume", function (t) {
                            s.increaseVolume(-t)
                        }), o(this, "airplay", function () {
                            te.airplay && s.media.webkitShowPlaybackTargetPicker()
                        }), o(this, "toggleControls", function (t) {
                            if (s.supported.ui && !s.isAudio) {
                                var e = I(s.elements.container, s.config.classNames.hideControls),
                                    i = void 0 === t ? void 0 : !t,
                                    n = M(s.elements.container, s.config.classNames.hideControls, i);
                                if (n && Wt(s.config.controls) && s.config.controls.includes("settings") && !Xt(s.config.settings) && he.toggleMenu.call(s, !1), n !== e) {
                                    var o = n ? "controlshidden" : "controlsshown";
                                    H.call(s, s.media, o)
                                }
                                return !n
                            }
                            return !1
                        }), o(this, "on", function (t, e) {
                            D.call(s, s.elements.container, t, e)
                        }), o(this, "once", function (t, e) {
                            N.call(s, s.elements.container, t, e)
                        }), o(this, "off", function (t, e) {
                            q(s.elements.container, t, e)
                        }), o(this, "destroy", function (t) {
                            var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            if (s.ready) {
                                var i = function () {
                                    document.body.style.overflow = "", s.embed = null, e ? (Object.keys(s.elements).length && ($(s.elements.buttons.play), $(s.elements.captions), $(s.elements.controls), $(s.elements.wrapper), s.elements.buttons.play = null, s.elements.captions = null, s.elements.controls = null, s.elements.wrapper = null), Ft(t) && t()) : (F.call(s), ie.cancelRequests.call(s), k(s.elements.original, s.elements.container), H.call(s, s.elements.original, "destroyed", !0), Ft(t) && t.call(s.elements.original), s.ready = !1, setTimeout(function () {
                                        s.elements = null, s.media = null
                                    }, 200))
                                };
                                s.stop(), clearTimeout(s.timers.loading), clearTimeout(s.timers.controls), clearTimeout(s.timers.resized), s.isHTML5 ? (Te.toggleNativeControls.call(s, !0), i()) : s.isYouTube ? (clearInterval(s.timers.buffering), clearInterval(s.timers.playing), null !== s.embed && Ft(s.embed.destroy) && s.embed.destroy(), i()) : s.isVimeo && (null !== s.embed && s.embed.unload().then(i), setTimeout(i, 200))
                            }
                        }), o(this, "supports", function (t) {
                            return te.mime.call(s, t)
                        }), this.timers = {}, this.ready = !1, this.loading = !1, this.failed = !1, this.touch = te.touch, this.media = i, Nt(this.media) && (this.media = document.querySelectorAll(this.media)), (window.jQuery && this.media instanceof jQuery || Rt(this.media) || Wt(this.media)) && (this.media = this.media[0]), this.config = w({}, pe, t.defaults, n || {}, function () {
                            try {
                                return JSON.parse(s.media.getAttribute("data-plyr-config"))
                            } catch (t) {
                                return {}
                            }
                        }()), this.elements = {
                            container: null,
                            fullscreen: null,
                            captions: null,
                            buttons: {},
                            display: {},
                            progress: {},
                            inputs: {},
                            settings: {
                                popup: null,
                                menu: null,
                                panels: {},
                                buttons: {}
                            }
                        }, this.captions = {
                            active: null,
                            currentTrack: -1,
                            meta: new WeakMap
                        }, this.fullscreen = {
                            active: !1
                        }, this.options = {
                            speed: [],
                            quality: []
                        }, this.debug = new we(this.config.debug), this.debug.log("Config", this.config), this.debug.log("Support", te), !Lt(this.media) && Bt(this.media))
                        if (this.media.plyr) this.debug.warn("Target already setup");
                        else if (this.config.enabled)
                        if (te.check().api) {
                            var r = this.media.cloneNode(!0);
                            r.autoplay = !1, this.elements.original = r;
                            var a = this.media.tagName.toLowerCase(),
                                l = null,
                                u = null;
                            switch (a) {
                                case "div":
                                    if (l = this.media.querySelector("iframe"), Bt(l)) {
                                        if (u = et(l.getAttribute("src")), this.provider = function (t) {
                                                return /^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(t) ? ge.youtube : /^https?:\/\/player.vimeo.com\/video\/\d{0,9}(?=\b|\/)/.test(t) ? ge.vimeo : null
                                            }(u.toString()), this.elements.container = this.media, this.media = l, this.elements.container.className = "", u.search.length) {
                                            var c = ["1", "true"];
                                            c.includes(u.searchParams.get("autoplay")) && (this.config.autoplay = !0), c.includes(u.searchParams.get("loop")) && (this.config.loop.active = !0), this.isYouTube ? (this.config.playsinline = c.includes(u.searchParams.get("playsinline")), this.config.youtube.hl = u.searchParams.get("hl")) : this.config.playsinline = !0
                                        }
                                    } else this.provider = this.media.getAttribute(this.config.attributes.embed.provider), this.media.removeAttribute(this.config.attributes.embed.provider);
                                    if (Xt(this.provider) || !Object.values(ge).includes(this.provider)) return void this.debug.error("Setup failed: Invalid provider");
                                    this.type = ye;
                                    break;
                                case "video":
                                case "audio":
                                    this.type = a, this.provider = ge.html5, this.media.hasAttribute("crossorigin") && (this.config.crossorigin = !0), this.media.hasAttribute("autoplay") && (this.config.autoplay = !0), (this.media.hasAttribute("playsinline") || this.media.hasAttribute("webkit-playsinline")) && (this.config.playsinline = !0), this.media.hasAttribute("muted") && (this.config.muted = !0), this.media.hasAttribute("loop") && (this.config.loop.active = !0);
                                    break;
                                default:
                                    return void this.debug.error("Setup failed: unsupported type")
                            }
                            this.supported = te.check(this.type, this.provider, this.config.playsinline), this.supported.api ? (this.eventListeners = [], this.listeners = new _e(this), this.storage = new ae(this), this.media.plyr = this, Bt(this.elements.container) || (this.elements.container = _("div", {
                                tabindex: 0
                            }), x(this.media, this.elements.container)), Te.migrateStyles.call(this), Te.addStyleHook.call(this), Ae.setup.call(this), this.config.debug && D.call(this, this.elements.container, this.config.events.join(" "), function (t) {
                                s.debug.log("event: ".concat(t.type))
                            }), this.fullscreen = new xe(this), (this.isHTML5 || this.isEmbed && !this.supported.ui) && Te.build.call(this), this.listeners.container(), this.listeners.global(), this.config.ads.enabled && (this.ads = new Ee(this)), this.isHTML5 && this.config.autoplay && this.once("canplay", function () {
                                return R(s.play())
                            }), this.lastSeekTime = 0, this.config.previewThumbnails.enabled && (this.previewThumbnails = new Ie(this))) : this.debug.error("Setup failed: no support")
                        } else this.debug.error("Setup failed: no support");
                    else this.debug.error("Setup failed: disabled by config");
                    else this.debug.error("Setup failed: no suitable element passed")
                }
                return n(t, [{
                    key: "toggleCaptions",
                    value: function (t) {
                        de.toggle.call(this, t, !1)
                    }
                }, {
                    key: "isHTML5",
                    get: function () {
                        return this.provider === ge.html5
                    }
                }, {
                    key: "isEmbed",
                    get: function () {
                        return this.isYouTube || this.isVimeo
                    }
                }, {
                    key: "isYouTube",
                    get: function () {
                        return this.provider === ge.youtube
                    }
                }, {
                    key: "isVimeo",
                    get: function () {
                        return this.provider === ge.vimeo
                    }
                }, {
                    key: "isVideo",
                    get: function () {
                        return this.type === ye
                    }
                }, {
                    key: "isAudio",
                    get: function () {
                        return this.type === ve
                    }
                }, {
                    key: "playing",
                    get: function () {
                        return Boolean(this.ready && !this.paused && !this.ended)
                    }
                }, {
                    key: "paused",
                    get: function () {
                        return Boolean(this.media.paused)
                    }
                }, {
                    key: "stopped",
                    get: function () {
                        return Boolean(this.paused && 0 === this.currentTime)
                    }
                }, {
                    key: "ended",
                    get: function () {
                        return Boolean(this.media.ended)
                    }
                }, {
                    key: "currentTime",
                    set: function (t) {
                        if (this.duration) {
                            var e = qt(t) && t > 0;
                            this.media.currentTime = e ? Math.min(t, this.duration) : 0, this.debug.log("Seeking to ".concat(this.currentTime, " seconds"))
                        }
                    },
                    get: function () {
                        return Number(this.media.currentTime)
                    }
                }, {
                    key: "buffered",
                    get: function () {
                        var t = this.media.buffered;
                        return qt(t) ? t : t && t.length && this.duration > 0 ? t.end(0) / this.duration : 0
                    }
                }, {
                    key: "seeking",
                    get: function () {
                        return Boolean(this.media.seeking)
                    }
                }, {
                    key: "duration",
                    get: function () {
                        var t = parseFloat(this.config.duration),
                            e = (this.media || {}).duration,
                            i = qt(e) && e !== 1 / 0 ? e : 0;
                        return t || i
                    }
                }, {
                    key: "volume",
                    set: function (t) {
                        var e = t;
                        Nt(e) && (e = Number(e)), qt(e) || (e = this.storage.get("volume")), qt(e) || (e = this.config.volume), e > 1 && (e = 1), e < 0 && (e = 0), this.config.volume = e, this.media.volume = e, !Xt(t) && this.muted && e > 0 && (this.muted = !1)
                    },
                    get: function () {
                        return Number(this.media.volume)
                    }
                }, {
                    key: "muted",
                    set: function (t) {
                        var e = t;
                        Ht(e) || (e = this.storage.get("muted")), Ht(e) || (e = this.config.muted), this.config.muted = e, this.media.muted = e
                    },
                    get: function () {
                        return Boolean(this.media.muted)
                    }
                }, {
                    key: "hasAudio",
                    get: function () {
                        return !this.isHTML5 || !!this.isAudio || Boolean(this.media.mozHasAudio) || Boolean(this.media.webkitAudioDecodedByteCount) || Boolean(this.media.audioTracks && this.media.audioTracks.length)
                    }
                }, {
                    key: "speed",
                    set: function (t) {
                        var e = this,
                            i = null;
                        qt(t) && (i = t), qt(i) || (i = this.storage.get("speed")), qt(i) || (i = this.config.speed.selected);
                        var n = this.minimumSpeed,
                            o = this.maximumSpeed;
                        i = function () {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
                                e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                                i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 255;
                            return Math.min(Math.max(t, e), i)
                        }(i, n, o), this.config.speed.selected = i, setTimeout(function () {
                            e.media.playbackRate = i
                        }, 0)
                    },
                    get: function () {
                        return Number(this.media.playbackRate)
                    }
                }, {
                    key: "minimumSpeed",
                    get: function () {
                        return this.isYouTube ? Math.min.apply(Math, u(this.options.speed)) : this.isVimeo ? .5 : .0625
                    }
                }, {
                    key: "maximumSpeed",
                    get: function () {
                        return this.isYouTube ? Math.max.apply(Math, u(this.options.speed)) : this.isVimeo ? 2 : 16
                    }
                }, {
                    key: "quality",
                    set: function (t) {
                        var e = this.config.quality,
                            i = this.options.quality;
                        if (i.length) {
                            var n = [!Xt(t) && Number(t), this.storage.get("quality"), e.selected, e.default].find(qt),
                                o = !0;
                            if (!i.includes(n)) {
                                var s = function (t, e) {
                                    return Wt(t) && t.length ? t.reduce(function (t, i) {
                                        return Math.abs(i - e) < Math.abs(t - e) ? i : t
                                    }) : null
                                }(i, n);
                                this.debug.warn("Unsupported quality option: ".concat(n, ", using ").concat(s, " instead")), n = s, o = !1
                            }
                            e.selected = n, this.media.quality = n, o && this.storage.set({
                                quality: n
                            })
                        }
                    },
                    get: function () {
                        return this.media.quality
                    }
                }, {
                    key: "loop",
                    set: function (t) {
                        var e = Ht(t) ? t : this.config.loop.active;
                        this.config.loop.active = e, this.media.loop = e
                    },
                    get: function () {
                        return Boolean(this.media.loop)
                    }
                }, {
                    key: "source",
                    set: function (t) {
                        Oe.change.call(this, t)
                    },
                    get: function () {
                        return this.media.currentSrc
                    }
                }, {
                    key: "download",
                    get: function () {
                        var t = this.config.urls.download;
                        return Gt(t) ? t : this.source
                    },
                    set: function (t) {
                        Gt(t) && (this.config.urls.download = t, he.setDownloadUrl.call(this))
                    }
                }, {
                    key: "poster",
                    set: function (t) {
                        this.isVideo ? Te.setPoster.call(this, t, !1).catch(function () {}) : this.debug.warn("Poster can only be set for video")
                    },
                    get: function () {
                        return this.isVideo ? this.media.getAttribute("poster") || this.media.getAttribute("data-poster") : null
                    }
                }, {
                    key: "ratio",
                    get: function () {
                        if (!this.isVideo) return null;
                        var t = V(U.call(this));
                        return Wt(t) ? t.join(":") : t
                    },
                    set: function (t) {
                        this.isVideo ? Nt(t) && B(t) ? (this.config.ratio = t, Y.call(this)) : this.debug.error("Invalid aspect ratio specified (".concat(t, ")")) : this.debug.warn("Aspect ratio can only be set for video")
                    }
                }, {
                    key: "autoplay",
                    set: function (t) {
                        var e = Ht(t) ? t : this.config.autoplay;
                        this.config.autoplay = e
                    },
                    get: function () {
                        return Boolean(this.config.autoplay)
                    }
                }, {
                    key: "currentTrack",
                    set: function (t) {
                        de.set.call(this, t, !1)
                    },
                    get: function () {
                        var t = this.captions,
                            e = t.toggled,
                            i = t.currentTrack;
                        return e ? i : -1
                    }
                }, {
                    key: "language",
                    set: function (t) {
                        de.setLanguage.call(this, t, !1)
                    },
                    get: function () {
                        return (de.getCurrentTrack.call(this) || {}).language
                    }
                }, {
                    key: "pip",
                    set: function (t) {
                        if (te.pip) {
                            var e = Ht(t) ? t : !this.pip;
                            Ft(this.media.webkitSetPresentationMode) && this.media.webkitSetPresentationMode(e ? me : fe), Ft(this.media.requestPictureInPicture) && (!this.pip && e ? this.media.requestPictureInPicture() : this.pip && !e && document.exitPictureInPicture())
                        }
                    },
                    get: function () {
                        return te.pip ? Xt(this.media.webkitPresentationMode) ? this.media === document.pictureInPictureElement : this.media.webkitPresentationMode === me : null
                    }
                }], [{
                    key: "supported",
                    value: function (t, e, i) {
                        return te.check(t, e, i)
                    }
                }, {
                    key: "loadSprite",
                    value: function (t, e) {
                        return J(t, e)
                    }
                }, {
                    key: "setup",
                    value: function (e) {
                        var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                            n = null;
                        return Nt(e) ? n = Array.from(document.querySelectorAll(e)) : Rt(e) ? n = Array.from(e) : Wt(e) && (n = e.filter(Bt)), Xt(n) ? null : n.map(function (e) {
                            return new t(e, i)
                        })
                    }
                }]), t
            }();
        return Pe.defaults = (Se = pe, JSON.parse(JSON.stringify(Se))), Pe
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof module && module.exports ? module.exports = e(require("jquery")) : e(t.jQuery)
    }(this, function (t) {
        ! function () {
            "use strict";

            function e(e, n) {
                if (this.el = e, this.$el = t(e), this.s = t.extend({}, i, n), this.s.dynamic && "undefined" !== this.s.dynamicEl && this.s.dynamicEl.constructor === Array && !this.s.dynamicEl.length) throw "When using dynamic mode, you must also define dynamicEl as an Array.";
                return this.modules = {}, this.lGalleryOn = !1, this.lgBusy = !1, this.hideBartimeout = !1, this.isTouch = "ontouchstart" in document.documentElement, this.s.slideEndAnimatoin && (this.s.hideControlOnEnd = !1), this.s.dynamic ? this.$items = this.s.dynamicEl : "this" === this.s.selector ? this.$items = this.$el : "" !== this.s.selector ? this.s.selectWithin ? this.$items = t(this.s.selectWithin).find(this.s.selector) : this.$items = this.$el.find(t(this.s.selector)) : this.$items = this.$el.children(), this.$slide = "", this.$outer = "", this.init(), this
            }
            var i = {
                mode: "lg-slide",
                cssEasing: "ease",
                easing: "linear",
                speed: 600,
                height: "100%",
                width: "100%",
                addClass: "",
                startClass: "lg-start-zoom",
                backdropDuration: 150,
                hideBarsDelay: 6e3,
                useLeft: !1,
                closable: !0,
                loop: !0,
                escKey: !0,
                keyPress: !0,
                controls: !0,
                slideEndAnimatoin: !0,
                hideControlOnEnd: !1,
                mousewheel: !0,
                getCaptionFromTitleOrAlt: !0,
                appendSubHtmlTo: ".lg-sub-html",
                subHtmlSelectorRelative: !1,
                preload: 1,
                showAfterLoad: !0,
                selector: "",
                selectWithin: "",
                nextHtml: "",
                prevHtml: "",
                index: !1,
                iframeMaxWidth: "100%",
                download: !0,
                counter: !0,
                appendCounterTo: ".lg-toolbar",
                swipeThreshold: 50,
                enableSwipe: !0,
                enableDrag: !0,
                dynamic: !1,
                dynamicEl: [],
                galleryId: 1
            };
            e.prototype.init = function () {
                var e = this;
                e.s.preload > e.$items.length && (e.s.preload = e.$items.length);
                var i = window.location.hash;
                i.indexOf("lg=" + this.s.galleryId) > 0 && (e.index = parseInt(i.split("&slide=")[1], 10), t("body").addClass("lg-from-hash"), t("body").hasClass("lg-on") || (setTimeout(function () {
                    e.build(e.index)
                }), t("body").addClass("lg-on"))), e.s.dynamic ? (e.$el.trigger("onBeforeOpen.lg"), e.index = e.s.index || 0, t("body").hasClass("lg-on") || setTimeout(function () {
                    e.build(e.index), t("body").addClass("lg-on")
                })) : e.$items.on("click.lgcustom", function (i) {
                    try {
                        i.preventDefault(), i.preventDefault()
                    } catch (t) {
                        i.returnValue = !1
                    }
                    e.$el.trigger("onBeforeOpen.lg"), e.index = e.s.index || e.$items.index(this), t("body").hasClass("lg-on") || (e.build(e.index), t("body").addClass("lg-on"))
                })
            }, e.prototype.build = function (e) {
                var i = this;
                i.structure(), t.each(t.fn.lightGallery.modules, function (e) {
                    i.modules[e] = new t.fn.lightGallery.modules[e](i.el)
                }), i.slide(e, !1, !1, !1), i.s.keyPress && i.keyPress(), i.$items.length > 1 ? (i.arrow(), setTimeout(function () {
                    i.enableDrag(), i.enableSwipe()
                }, 50), i.s.mousewheel && i.mousewheel()) : i.$slide.on("click.lg", function () {
                    i.$el.trigger("onSlideClick.lg")
                }), i.counter(), i.closeGallery(), i.$el.trigger("onAfterOpen.lg"), i.$outer.on("mousemove.lg click.lg touchstart.lg", function () {
                    i.$outer.removeClass("lg-hide-items"), clearTimeout(i.hideBartimeout), i.hideBartimeout = setTimeout(function () {
                        i.$outer.addClass("lg-hide-items")
                    }, i.s.hideBarsDelay)
                }), i.$outer.trigger("mousemove.lg")
            }, e.prototype.structure = function () {
                var e, i = "",
                    n = "",
                    o = 0,
                    s = "",
                    r = this;
                for (t("body").append('<div class="lg-backdrop"></div>'), t(".lg-backdrop").css("transition-duration", this.s.backdropDuration + "ms"), o = 0; o < this.$items.length; o++) i += '<div class="lg-item"></div>';
                if (this.s.controls && this.$items.length > 1 && (n = '<div class="lg-actions"><button class="lg-prev lg-icon">' + this.s.prevHtml + '</button><button class="lg-next lg-icon">' + this.s.nextHtml + "</button></div>"), ".lg-sub-html" === this.s.appendSubHtmlTo && (s = '<div class="lg-sub-html"></div>'), e = '<div class="lg-outer ' + this.s.addClass + " " + this.s.startClass + '"><div class="lg" style="width:' + this.s.width + "; height:" + this.s.height + '"><div class="lg-inner">' + i + '</div><div class="lg-toolbar lg-group"><span class="lg-close lg-icon"></span></div>' + n + s + "</div></div>", t("body").append(e), this.$outer = t(".lg-outer"), this.$slide = this.$outer.find(".lg-item"), this.s.useLeft ? (this.$outer.addClass("lg-use-left"), this.s.mode = "lg-slide") : this.$outer.addClass("lg-use-css3"), r.setTop(), t(window).on("resize.lg orientationchange.lg", function () {
                        setTimeout(function () {
                            r.setTop()
                        }, 100)
                    }), this.$slide.eq(this.index).addClass("lg-current"), this.doCss() ? this.$outer.addClass("lg-css3") : (this.$outer.addClass("lg-css"), this.s.speed = 0), this.$outer.addClass(this.s.mode), this.s.enableDrag && this.$items.length > 1 && this.$outer.addClass("lg-grab"), this.s.showAfterLoad && this.$outer.addClass("lg-show-after-load"),
                    this.doCss()) {
                    var a = this.$outer.find(".lg-inner");
                    a.css("transition-timing-function", this.s.cssEasing), a.css("transition-duration", this.s.speed + "ms")
                }
                setTimeout(function () {
                    t(".lg-backdrop").addClass("in")
                }), setTimeout(function () {
                    r.$outer.addClass("lg-visible")
                }, this.s.backdropDuration), this.s.download && this.$outer.find(".lg-toolbar").append('<a id="lg-download" target="_blank" download class="lg-download lg-icon"></a>'), this.prevScrollTop = t(window).scrollTop()
            }, e.prototype.setTop = function () {
                if ("100%" !== this.s.height) {
                    var e = t(window).height(),
                        i = (e - parseInt(this.s.height, 10)) / 2,
                        n = this.$outer.find(".lg");
                    e >= parseInt(this.s.height, 10) ? n.css("top", i + "px") : n.css("top", "0px")
                }
            }, e.prototype.doCss = function () {
                return !! function () {
                    var t = ["transition", "MozTransition", "WebkitTransition", "OTransition", "msTransition", "KhtmlTransition"],
                        e = document.documentElement,
                        i = 0;
                    for (i = 0; i < t.length; i++)
                        if (t[i] in e.style) return !0
                }()
            }, e.prototype.isVideo = function (t, e) {
                var i;
                if (i = this.s.dynamic ? this.s.dynamicEl[e].html : this.$items.eq(e).attr("data-html"), !t) return i ? {
                    html5: !0
                } : (console.error("lightGallery :- data-src is not pvovided on slide item " + (e + 1) + ". Please make sure the selector property is properly configured. More info - http://sachinchoolur.github.io/lightGallery/demos/html-markup.html"), !1);
                var n = t.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com|be-nocookie\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)/i),
                    o = t.match(/\/\/(?:www\.)?vimeo.com\/([0-9a-z\-_]+)/i),
                    s = t.match(/\/\/(?:www\.)?dai.ly\/([0-9a-z\-_]+)/i),
                    r = t.match(/\/\/(?:www\.)?(?:vk\.com|vkontakte\.ru)\/(?:video_ext\.php\?)(.*)/i);
                return n ? {
                    youtube: n
                } : o ? {
                    vimeo: o
                } : s ? {
                    dailymotion: s
                } : r ? {
                    vk: r
                } : void 0
            }, e.prototype.counter = function () {
                this.s.counter && t(this.s.appendCounterTo).append('<div id="lg-counter"><span id="lg-counter-current">' + (parseInt(this.index, 10) + 1) + '</span> / <span id="lg-counter-all">' + this.$items.length + "</span></div>")
            }, e.prototype.addHtml = function (e) {
                var i, n, o = null;
                if (this.s.dynamic ? this.s.dynamicEl[e].subHtmlUrl ? i = this.s.dynamicEl[e].subHtmlUrl : o = this.s.dynamicEl[e].subHtml : (n = this.$items.eq(e), n.attr("data-sub-html-url") ? i = n.attr("data-sub-html-url") : (o = n.attr("data-sub-html"), this.s.getCaptionFromTitleOrAlt && !o && (o = n.attr("title") || n.find("img").first().attr("alt")))), !i)
                    if (null != o) {
                        var s = o.substring(0, 1);
                        "." !== s && "#" !== s || (o = this.s.subHtmlSelectorRelative && !this.s.dynamic ? n.find(o).html() : t(o).html())
                    } else o = "";
                ".lg-sub-html" === this.s.appendSubHtmlTo ? i ? this.$outer.find(this.s.appendSubHtmlTo).load(i) : this.$outer.find(this.s.appendSubHtmlTo).html(o) : i ? this.$slide.eq(e).load(i) : this.$slide.eq(e).append(o), null != o && ("" === o ? this.$outer.find(this.s.appendSubHtmlTo).addClass("lg-empty-html") : this.$outer.find(this.s.appendSubHtmlTo).removeClass("lg-empty-html")), this.$el.trigger("onAfterAppendSubHtml.lg", [e])
            }, e.prototype.preload = function (t) {
                var e = 1,
                    i = 1;
                for (e = 1; e <= this.s.preload && !(e >= this.$items.length - t); e++) this.loadContent(t + e, !1, 0);
                for (i = 1; i <= this.s.preload && !(t - i < 0); i++) this.loadContent(t - i, !1, 0)
            }, e.prototype.loadContent = function (e, i, n) {
                var o, s, r, a, l, u, c = this,
                    h = !1,
                    d = function (e) {
                        for (var i = [], n = [], o = 0; o < e.length; o++) {
                            var r = e[o].split(" ");
                            "" === r[0] && r.splice(0, 1), n.push(r[0]), i.push(r[1])
                        }
                        for (var a = t(window).width(), l = 0; l < i.length; l++)
                            if (parseInt(i[l], 10) > a) {
                                s = n[l];
                                break
                            }
                    };
                c.s.dynamic ? (c.s.dynamicEl[e].poster && (h = !0, r = c.s.dynamicEl[e].poster), u = c.s.dynamicEl[e].html, s = c.s.dynamicEl[e].src, c.s.dynamicEl[e].responsive && d(c.s.dynamicEl[e].responsive.split(",")), a = c.s.dynamicEl[e].srcset, l = c.s.dynamicEl[e].sizes) : (c.$items.eq(e).attr("data-poster") && (h = !0, r = c.$items.eq(e).attr("data-poster")), u = c.$items.eq(e).attr("data-html"), s = c.$items.eq(e).attr("href") || c.$items.eq(e).attr("data-src"), c.$items.eq(e).attr("data-responsive") && d(c.$items.eq(e).attr("data-responsive").split(",")), a = c.$items.eq(e).attr("data-srcset"), l = c.$items.eq(e).attr("data-sizes"));
                var p = !1;
                c.s.dynamic ? c.s.dynamicEl[e].iframe && (p = !0) : "true" === c.$items.eq(e).attr("data-iframe") && (p = !0);
                var m = c.isVideo(s, e);
                if (!c.$slide.eq(e).hasClass("lg-loaded")) {
                    if (p) c.$slide.eq(e).prepend('<div class="lg-video-cont lg-has-iframe" style="max-width:' + c.s.iframeMaxWidth + '"><div class="lg-video"><iframe class="lg-object" frameborder="0" src="' + s + '"  allowfullscreen="true"></iframe></div></div>');
                    else if (h) {
                        var f = "";
                        f = m && m.youtube ? "lg-has-youtube" : m && m.vimeo ? "lg-has-vimeo" : "lg-has-html5", c.$slide.eq(e).prepend('<div class="lg-video-cont ' + f + ' "><div class="lg-video"><span class="lg-video-play"></span><img class="lg-object lg-has-poster" src="' + r + '" /></div></div>')
                    } else m ? (c.$slide.eq(e).prepend('<div class="lg-video-cont "><div class="lg-video"></div></div>'), c.$el.trigger("hasVideo.lg", [e, s, u])) : c.$slide.eq(e).prepend('<div class="lg-img-wrap"><img class="lg-object lg-image" src="' + s + '" /></div>');
                    if (c.$el.trigger("onAferAppendSlide.lg", [e]), o = c.$slide.eq(e).find(".lg-object"), l && o.attr("sizes", l), a) {
                        o.attr("srcset", a);
                        try {
                            picturefill({
                                elements: [o[0]]
                            })
                        } catch (t) {
                            console.warn("lightGallery :- If you want srcset to be supported for older browser please include picturefil version 2 javascript library in your document.")
                        }
                    }
                    ".lg-sub-html" !== this.s.appendSubHtmlTo && c.addHtml(e), c.$slide.eq(e).addClass("lg-loaded")
                }
                c.$slide.eq(e).find(".lg-object").on("load.lg error.lg", function () {
                    var i = 0;
                    n && !t("body").hasClass("lg-from-hash") && (i = n), setTimeout(function () {
                        c.$slide.eq(e).addClass("lg-complete"), c.$el.trigger("onSlideItemLoad.lg", [e, n || 0])
                    }, i)
                }), m && m.html5 && !h && c.$slide.eq(e).addClass("lg-complete"), !0 === i && (c.$slide.eq(e).hasClass("lg-complete") ? c.preload(e) : c.$slide.eq(e).find(".lg-object").on("load.lg error.lg", function () {
                    c.preload(e)
                }))
            }, e.prototype.slide = function (e, i, n, o) {
                var s = this.$outer.find(".lg-current").index(),
                    r = this;
                if (!r.lGalleryOn || s !== e) {
                    var a, l, u, c = this.$slide.length,
                        h = r.lGalleryOn ? this.s.speed : 0;
                    if (!r.lgBusy) this.s.download && (a = r.s.dynamic ? !1 !== r.s.dynamicEl[e].downloadUrl && (r.s.dynamicEl[e].downloadUrl || r.s.dynamicEl[e].src) : "false" !== r.$items.eq(e).attr("data-download-url") && (r.$items.eq(e).attr("data-download-url") || r.$items.eq(e).attr("href") || r.$items.eq(e).attr("data-src")), a ? (t("#lg-download").attr("href", a), r.$outer.removeClass("lg-hide-download")) : r.$outer.addClass("lg-hide-download")), this.$el.trigger("onBeforeSlide.lg", [s, e, i, n]), r.lgBusy = !0, clearTimeout(r.hideBartimeout), ".lg-sub-html" === this.s.appendSubHtmlTo && setTimeout(function () {
                        r.addHtml(e)
                    }, h), this.arrowDisable(e), o || (e < s ? o = "prev" : e > s && (o = "next")), i ? (this.$slide.removeClass("lg-prev-slide lg-current lg-next-slide"), c > 2 ? (l = e - 1, u = e + 1, 0 === e && s === c - 1 ? (u = 0, l = c - 1) : e === c - 1 && 0 === s && (u = 0, l = c - 1)) : (l = 0, u = 1), "prev" === o ? r.$slide.eq(u).addClass("lg-next-slide") : r.$slide.eq(l).addClass("lg-prev-slide"), r.$slide.eq(e).addClass("lg-current")) : (r.$outer.addClass("lg-no-trans"), this.$slide.removeClass("lg-prev-slide lg-next-slide"), "prev" === o ? (this.$slide.eq(e).addClass("lg-prev-slide"), this.$slide.eq(s).addClass("lg-next-slide")) : (this.$slide.eq(e).addClass("lg-next-slide"), this.$slide.eq(s).addClass("lg-prev-slide")), setTimeout(function () {
                        r.$slide.removeClass("lg-current"), r.$slide.eq(e).addClass("lg-current"), r.$outer.removeClass("lg-no-trans")
                    }, 50)), r.lGalleryOn ? (setTimeout(function () {
                        r.loadContent(e, !0, 0)
                    }, this.s.speed + 50), setTimeout(function () {
                        r.lgBusy = !1, r.$el.trigger("onAfterSlide.lg", [s, e, i, n])
                    }, this.s.speed)) : (r.loadContent(e, !0, r.s.backdropDuration), r.lgBusy = !1, r.$el.trigger("onAfterSlide.lg", [s, e, i, n])), r.lGalleryOn = !0, this.s.counter && t("#lg-counter-current").text(e + 1);
                    r.index = e
                }
            }, e.prototype.goToNextSlide = function (t) {
                var e = this,
                    i = e.s.loop;
                t && e.$slide.length < 3 && (i = !1), e.lgBusy || (e.index + 1 < e.$slide.length ? (e.index++, e.$el.trigger("onBeforeNextSlide.lg", [e.index]), e.slide(e.index, t, !1, "next")) : i ? (e.index = 0, e.$el.trigger("onBeforeNextSlide.lg", [e.index]), e.slide(e.index, t, !1, "next")) : e.s.slideEndAnimatoin && !t && (e.$outer.addClass("lg-right-end"), setTimeout(function () {
                    e.$outer.removeClass("lg-right-end")
                }, 400)))
            }, e.prototype.goToPrevSlide = function (t) {
                var e = this,
                    i = e.s.loop;
                t && e.$slide.length < 3 && (i = !1), e.lgBusy || (e.index > 0 ? (e.index--, e.$el.trigger("onBeforePrevSlide.lg", [e.index, t]), e.slide(e.index, t, !1, "prev")) : i ? (e.index = e.$items.length - 1, e.$el.trigger("onBeforePrevSlide.lg", [e.index, t]), e.slide(e.index, t, !1, "prev")) : e.s.slideEndAnimatoin && !t && (e.$outer.addClass("lg-left-end"), setTimeout(function () {
                    e.$outer.removeClass("lg-left-end")
                }, 400)))
            }, e.prototype.keyPress = function () {
                var e = this;
                this.$items.length > 1 && t(window).on("keyup.lg", function (t) {
                    e.$items.length > 1 && (37 === t.keyCode && (t.preventDefault(), e.goToPrevSlide()), 39 === t.keyCode && (t.preventDefault(), e.goToNextSlide()))
                }), t(window).on("keydown.lg", function (t) {
                    !0 === e.s.escKey && 27 === t.keyCode && (t.preventDefault(), e.$outer.hasClass("lg-thumb-open") ? e.$outer.removeClass("lg-thumb-open") : e.destroy())
                })
            }, e.prototype.arrow = function () {
                var t = this;
                this.$outer.find(".lg-prev").on("click.lg", function () {
                    t.goToPrevSlide()
                }), this.$outer.find(".lg-next").on("click.lg", function () {
                    t.goToNextSlide()
                })
            }, e.prototype.arrowDisable = function (t) {
                !this.s.loop && this.s.hideControlOnEnd && (t + 1 < this.$slide.length ? this.$outer.find(".lg-next").removeAttr("disabled").removeClass("disabled") : this.$outer.find(".lg-next").attr("disabled", "disabled").addClass("disabled"), t > 0 ? this.$outer.find(".lg-prev").removeAttr("disabled").removeClass("disabled") : this.$outer.find(".lg-prev").attr("disabled", "disabled").addClass("disabled"))
            }, e.prototype.setTranslate = function (t, e, i) {
                this.s.useLeft ? t.css("left", e) : t.css({
                    transform: "translate3d(" + e + "px, " + i + "px, 0px)"
                })
            }, e.prototype.touchMove = function (e, i) {
                var n = i - e;
                Math.abs(n) > 15 && (this.$outer.addClass("lg-dragging"), this.setTranslate(this.$slide.eq(this.index), n, 0), this.setTranslate(t(".lg-prev-slide"), -this.$slide.eq(this.index).width() + n, 0), this.setTranslate(t(".lg-next-slide"), this.$slide.eq(this.index).width() + n, 0))
            }, e.prototype.touchEnd = function (t) {
                var e = this;
                "lg-slide" !== e.s.mode && e.$outer.addClass("lg-slide"), this.$slide.not(".lg-current, .lg-prev-slide, .lg-next-slide").css("opacity", "0"), setTimeout(function () {
                    e.$outer.removeClass("lg-dragging"), t < 0 && Math.abs(t) > e.s.swipeThreshold ? e.goToNextSlide(!0) : t > 0 && Math.abs(t) > e.s.swipeThreshold ? e.goToPrevSlide(!0) : Math.abs(t) < 5 && e.$el.trigger("onSlideClick.lg"), e.$slide.removeAttr("style")
                }), setTimeout(function () {
                    e.$outer.hasClass("lg-dragging") || "lg-slide" === e.s.mode || e.$outer.removeClass("lg-slide")
                }, e.s.speed + 100)
            }, e.prototype.enableSwipe = function () {
                var t = this,
                    e = 0,
                    i = 0,
                    n = !1;
                t.s.enableSwipe && t.doCss() && (t.$slide.on("touchstart.lg", function (i) {
                    t.$outer.hasClass("lg-zoomed") || t.lgBusy || (i.preventDefault(), t.manageSwipeClass(), e = i.originalEvent.targetTouches[0].pageX)
                }), t.$slide.on("touchmove.lg", function (o) {
                    t.$outer.hasClass("lg-zoomed") || (o.preventDefault(), i = o.originalEvent.targetTouches[0].pageX, t.touchMove(e, i), n = !0)
                }), t.$slide.on("touchend.lg", function () {
                    t.$outer.hasClass("lg-zoomed") || (n ? (n = !1, t.touchEnd(i - e)) : t.$el.trigger("onSlideClick.lg"))
                }))
            }, e.prototype.enableDrag = function () {
                var e = this,
                    i = 0,
                    n = 0,
                    o = !1,
                    s = !1;
                e.s.enableDrag && e.doCss() && (e.$slide.on("mousedown.lg", function (n) {
                    e.$outer.hasClass("lg-zoomed") || e.lgBusy || t(n.target).text().trim() || (n.preventDefault(), e.manageSwipeClass(), i = n.pageX, o = !0, e.$outer.scrollLeft += 1, e.$outer.scrollLeft -= 1, e.$outer.removeClass("lg-grab").addClass("lg-grabbing"), e.$el.trigger("onDragstart.lg"))
                }), t(window).on("mousemove.lg", function (t) {
                    o && (s = !0, n = t.pageX, e.touchMove(i, n), e.$el.trigger("onDragmove.lg"))
                }), t(window).on("mouseup.lg", function (r) {
                    s ? (s = !1, e.touchEnd(n - i), e.$el.trigger("onDragend.lg")) : (t(r.target).hasClass("lg-object") || t(r.target).hasClass("lg-video-play")) && e.$el.trigger("onSlideClick.lg"), o && (o = !1, e.$outer.removeClass("lg-grabbing").addClass("lg-grab"))
                }))
            }, e.prototype.manageSwipeClass = function () {
                var t = this.index + 1,
                    e = this.index - 1;
                this.s.loop && this.$slide.length > 2 && (0 === this.index ? e = this.$slide.length - 1 : this.index === this.$slide.length - 1 && (t = 0)), this.$slide.removeClass("lg-next-slide lg-prev-slide"), e > -1 && this.$slide.eq(e).addClass("lg-prev-slide"), this.$slide.eq(t).addClass("lg-next-slide")
            }, e.prototype.mousewheel = function () {
                var t = this;
                t.$outer.on("mousewheel.lg", function (e) {
                    e.deltaY && (e.deltaY > 0 ? t.goToPrevSlide() : t.goToNextSlide(), e.preventDefault())
                })
            }, e.prototype.closeGallery = function () {
                var e = this,
                    i = !1;
                this.$outer.find(".lg-close").on("click.lg", function () {
                    e.destroy()
                }), e.s.closable && (e.$outer.on("mousedown.lg", function (e) {
                    i = !!(t(e.target).is(".lg-outer") || t(e.target).is(".lg-item ") || t(e.target).is(".lg-img-wrap"))
                }), e.$outer.on("mousemove.lg", function () {
                    i = !1
                }), e.$outer.on("mouseup.lg", function (n) {
                    (t(n.target).is(".lg-outer") || t(n.target).is(".lg-item ") || t(n.target).is(".lg-img-wrap") && i) && (e.$outer.hasClass("lg-dragging") || e.destroy())
                }))
            }, e.prototype.destroy = function (e) {
                var i = this;
                e || (i.$el.trigger("onBeforeClose.lg"), t(window).scrollTop(i.prevScrollTop)), e && (i.s.dynamic || this.$items.off("click.lg click.lgcustom"), t.removeData(i.el, "lightGallery")), this.$el.off(".lg.tm"), t.each(t.fn.lightGallery.modules, function (t) {
                    i.modules[t] && i.modules[t].destroy()
                }), this.lGalleryOn = !1, clearTimeout(i.hideBartimeout), this.hideBartimeout = !1, t(window).off(".lg"), t("body").removeClass("lg-on lg-from-hash"), i.$outer && i.$outer.removeClass("lg-visible"), t(".lg-backdrop").removeClass("in"), setTimeout(function () {
                    i.$outer && i.$outer.remove(), t(".lg-backdrop").remove(), e || i.$el.trigger("onCloseAfter.lg")
                }, i.s.backdropDuration + 50)
            }, t.fn.lightGallery = function (i) {
                return this.each(function () {
                    if (t.data(this, "lightGallery")) try {
                        t(this).data("lightGallery").init()
                    } catch (t) {
                        console.error("lightGallery has not initiated properly")
                    } else t.data(this, "lightGallery", new e(this, i))
                })
            }, t.fn.lightGallery.modules = {}
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
    }(0, function (t) {
        ! function () {
            "use strict";
            var e = {
                    autoplay: !1,
                    pause: 5e3,
                    progressBar: !0,
                    fourceAutoplay: !1,
                    autoplayControls: !0,
                    appendAutoplayControlsTo: ".lg-toolbar"
                },
                i = function (i) {
                    return this.core = t(i).data("lightGallery"), this.$el = t(i), !(this.core.$items.length < 2) && (this.core.s = t.extend({}, e, this.core.s), this.interval = !1, this.fromAuto = !0, this.canceledOnTouch = !1, this.fourceAutoplayTemp = this.core.s.fourceAutoplay, this.core.doCss() || (this.core.s.progressBar = !1), this.init(), this)
                };
            i.prototype.init = function () {
                var t = this;
                t.core.s.autoplayControls && t.controls(), t.core.s.progressBar && t.core.$outer.find(".lg").append('<div class="lg-progress-bar"><div class="lg-progress"></div></div>'), t.progress(), t.core.s.autoplay && t.$el.one("onSlideItemLoad.lg.tm", function () {
                    t.startlAuto()
                }), t.$el.on("onDragstart.lg.tm touchstart.lg.tm", function () {
                    t.interval && (t.cancelAuto(), t.canceledOnTouch = !0)
                }), t.$el.on("onDragend.lg.tm touchend.lg.tm onSlideClick.lg.tm", function () {
                    !t.interval && t.canceledOnTouch && (t.startlAuto(), t.canceledOnTouch = !1)
                })
            }, i.prototype.progress = function () {
                var t, e, i = this;
                i.$el.on("onBeforeSlide.lg.tm", function () {
                    i.core.s.progressBar && i.fromAuto && (t = i.core.$outer.find(".lg-progress-bar"), e = i.core.$outer.find(".lg-progress"), i.interval && (e.removeAttr("style"), t.removeClass("lg-start"), setTimeout(function () {
                        e.css("transition", "width " + (i.core.s.speed + i.core.s.pause) + "ms ease 0s"), t.addClass("lg-start")
                    }, 20))), i.fromAuto || i.core.s.fourceAutoplay || i.cancelAuto(), i.fromAuto = !1
                })
            }, i.prototype.controls = function () {
                var e = this;
                t(this.core.s.appendAutoplayControlsTo).append('<span class="lg-autoplay-button lg-icon"></span>'), e.core.$outer.find(".lg-autoplay-button").on("click.lg", function () {
                    t(e.core.$outer).hasClass("lg-show-autoplay") ? (e.cancelAuto(), e.core.s.fourceAutoplay = !1) : e.interval || (e.startlAuto(), e.core.s.fourceAutoplay = e.fourceAutoplayTemp)
                })
            }, i.prototype.startlAuto = function () {
                var t = this;
                t.core.$outer.find(".lg-progress").css("transition", "width " + (t.core.s.speed + t.core.s.pause) + "ms ease 0s"), t.core.$outer.addClass("lg-show-autoplay"), t.core.$outer.find(".lg-progress-bar").addClass("lg-start"), t.interval = setInterval(function () {
                    t.core.index + 1 < t.core.$items.length ? t.core.index++ : t.core.index = 0, t.fromAuto = !0, t.core.slide(t.core.index, !1, !1, "next")
                }, t.core.s.speed + t.core.s.pause)
            }, i.prototype.cancelAuto = function () {
                clearInterval(this.interval), this.interval = !1, this.core.$outer.find(".lg-progress").removeAttr("style"), this.core.$outer.removeClass("lg-show-autoplay"), this.core.$outer.find(".lg-progress-bar").removeClass("lg-start")
            }, i.prototype.destroy = function () {
                this.cancelAuto(), this.core.$outer.find(".lg-progress-bar").remove()
            }, t.fn.lightGallery.modules.autoplay = i
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof module && module.exports ? module.exports = e(require("jquery")) : e(t.jQuery)
    }(this, function (t) {
        ! function () {
            "use strict";

            function e() {
                return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement
            }
            var i = {
                    fullScreen: !0
                },
                n = function (e) {
                    return this.core = t(e).data("lightGallery"), this.$el = t(e), this.core.s = t.extend({}, i, this.core.s), this.init(), this
                };
            n.prototype.init = function () {
                var t = "";
                if (this.core.s.fullScreen) {
                    if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled)) return;
                    t = '<span class="lg-fullscreen lg-icon"></span>', this.core.$outer.find(".lg-toolbar").append(t), this.fullScreen()
                }
            }, n.prototype.requestFullscreen = function () {
                var t = document.documentElement;
                t.requestFullscreen ? t.requestFullscreen() : t.msRequestFullscreen ? t.msRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitRequestFullscreen && t.webkitRequestFullscreen()
            }, n.prototype.exitFullscreen = function () {
                document.exitFullscreen ? document.exitFullscreen() : document.msExitFullscreen ? document.msExitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen()
            }, n.prototype.fullScreen = function () {
                var i = this;
                t(document).on("fullscreenchange.lg webkitfullscreenchange.lg mozfullscreenchange.lg MSFullscreenChange.lg", function () {
                    i.core.$outer.toggleClass("lg-fullscreen-on")
                }), this.core.$outer.find(".lg-fullscreen").on("click.lg", function () {
                    e() ? i.exitFullscreen() : i.requestFullscreen()
                })
            }, n.prototype.destroy = function () {
                e() && this.exitFullscreen(), t(document).off("fullscreenchange.lg webkitfullscreenchange.lg mozfullscreenchange.lg MSFullscreenChange.lg")
            }, t.fn.lightGallery.modules.fullscreen = n
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
    }(0, function (t) {
        ! function () {
            "use strict";
            var e = {
                    pager: !1
                },
                i = function (i) {
                    return this.core = t(i).data("lightGallery"), this.$el = t(i), this.core.s = t.extend({}, e, this.core.s), this.core.s.pager && this.core.$items.length > 1 && this.init(), this
                };
            i.prototype.init = function () {
                var e, i, n, o = this,
                    s = "";
                if (o.core.$outer.find(".lg").append('<div class="lg-pager-outer"></div>'), o.core.s.dynamic)
                    for (var r = 0; r < o.core.s.dynamicEl.length; r++) s += '<span class="lg-pager-cont"> <span class="lg-pager"></span><div class="lg-pager-thumb-cont"><span class="lg-caret"></span> <img src="' + o.core.s.dynamicEl[r].thumb + '" /></div></span>';
                else o.core.$items.each(function () {
                    o.core.s.exThumbImage ? s += '<span class="lg-pager-cont"> <span class="lg-pager"></span><div class="lg-pager-thumb-cont"><span class="lg-caret"></span> <img src="' + t(this).attr(o.core.s.exThumbImage) + '" /></div></span>' : s += '<span class="lg-pager-cont"> <span class="lg-pager"></span><div class="lg-pager-thumb-cont"><span class="lg-caret"></span> <img src="' + t(this).find("img").attr("src") + '" /></div></span>'
                });
                i = o.core.$outer.find(".lg-pager-outer"), i.html(s), e = o.core.$outer.find(".lg-pager-cont"), e.on("click.lg touchend.lg", function () {
                    var e = t(this);
                    o.core.index = e.index(), o.core.slide(o.core.index, !1, !0, !1)
                }), i.on("mouseover.lg", function () {
                    clearTimeout(n), i.addClass("lg-pager-hover")
                }), i.on("mouseout.lg", function () {
                    n = setTimeout(function () {
                        i.removeClass("lg-pager-hover")
                    })
                }), o.core.$el.on("onBeforeSlide.lg.tm", function (t, i, n) {
                    e.removeClass("lg-pager-active"), e.eq(n).addClass("lg-pager-active")
                })
            }, i.prototype.destroy = function () {}, t.fn.lightGallery.modules.pager = i
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
    }(0, function (t) {
        ! function () {
            "use strict";
            var e = {
                    thumbnail: !0,
                    animateThumb: !0,
                    currentPagerPosition: "middle",
                    thumbWidth: 100,
                    thumbHeight: "80px",
                    thumbContHeight: 100,
                    thumbMargin: 5,
                    exThumbImage: !1,
                    showThumbByDefault: !0,
                    toogleThumb: !0,
                    pullCaptionUp: !0,
                    enableThumbDrag: !0,
                    enableThumbSwipe: !0,
                    swipeThreshold: 50,
                    loadYoutubeThumbnail: !0,
                    youtubeThumbSize: 1,
                    loadVimeoThumbnail: !0,
                    vimeoThumbSize: "thumbnail_small",
                    loadDailymotionThumbnail: !0
                },
                i = function (i) {
                    return this.core = t(i).data("lightGallery"), this.core.s = t.extend({}, e, this.core.s), this.$el = t(i), this.$thumbOuter = null, this.thumbOuterWidth = 0, this.thumbTotalWidth = this.core.$items.length * (this.core.s.thumbWidth + this.core.s.thumbMargin), this.thumbIndex = this.core.index, this.core.s.animateThumb && (this.core.s.thumbHeight = "100%"), this.left = 0, this.init(), this
                };
            i.prototype.init = function () {
                var t = this;
                this.core.s.thumbnail && this.core.$items.length > 1 && (this.core.s.showThumbByDefault && setTimeout(function () {
                    t.core.$outer.addClass("lg-thumb-open")
                }, 700), this.core.s.pullCaptionUp && this.core.$outer.addClass("lg-pull-caption-up"), this.build(), this.core.s.animateThumb && this.core.doCss() ? (this.core.s.enableThumbDrag && this.enableThumbDrag(), this.core.s.enableThumbSwipe && this.enableThumbSwipe(), this.thumbClickable = !1) : this.thumbClickable = !0, this.toogle(), this.thumbkeyPress())
            }, i.prototype.build = function () {
                function e(t, e, i) {
                    var r, a = n.core.isVideo(t, i) || {},
                        l = "";
                    a.youtube || a.vimeo || a.dailymotion ? a.youtube ? r = n.core.s.loadYoutubeThumbnail ? "//img.youtube.com/vi/" + a.youtube[1] + "/" + n.core.s.youtubeThumbSize + ".jpg" : e : a.vimeo ? n.core.s.loadVimeoThumbnail ? (r = "//i.vimeocdn.com/video/error_" + s + ".jpg", l = a.vimeo[1]) : r = e : a.dailymotion && (r = n.core.s.loadDailymotionThumbnail ? "//www.dailymotion.com/thumbnail/video/" + a.dailymotion[1] : e) : r = e, o += '<div data-vimeo-id="' + l + '" class="lg-thumb-item" style="width:' + n.core.s.thumbWidth + "px; height: " + n.core.s.thumbHeight + "; margin-right: " + n.core.s.thumbMargin + 'px"><img src="' + r + '" /></div>', l = ""
                }
                var i, n = this,
                    o = "",
                    s = "",
                    r = '<div class="lg-thumb-outer"><div class="lg-thumb lg-group"></div></div>';
                switch (this.core.s.vimeoThumbSize) {
                    case "thumbnail_large":
                        s = "640";
                        break;
                    case "thumbnail_medium":
                        s = "200x150";
                        break;
                    case "thumbnail_small":
                        s = "100x75"
                }
                if (n.core.$outer.addClass("lg-has-thumb"), n.core.$outer.find(".lg").append(r), n.$thumbOuter = n.core.$outer.find(".lg-thumb-outer"), n.thumbOuterWidth = n.$thumbOuter.width(), n.core.s.animateThumb && n.core.$outer.find(".lg-thumb").css({
                        width: n.thumbTotalWidth + "px",
                        position: "relative"
                    }), this.core.s.animateThumb && n.$thumbOuter.css("height", n.core.s.thumbContHeight + "px"), n.core.s.dynamic)
                    for (var a = 0; a < n.core.s.dynamicEl.length; a++) e(n.core.s.dynamicEl[a].src, n.core.s.dynamicEl[a].thumb, a);
                else n.core.$items.each(function (i) {
                    n.core.s.exThumbImage ? e(t(this).attr("href") || t(this).attr("data-src"), t(this).attr(n.core.s.exThumbImage), i) : e(t(this).attr("href") || t(this).attr("data-src"), t(this).find("img").attr("src"), i)
                });
                n.core.$outer.find(".lg-thumb").html(o), i = n.core.$outer.find(".lg-thumb-item"), i.each(function () {
                    var e = t(this),
                        i = e.attr("data-vimeo-id");
                    i && t.getJSON("//www.vimeo.com/api/v2/video/" + i + ".json?callback=?", {
                        format: "json"
                    }, function (t) {
                        e.find("img").attr("src", t[0][n.core.s.vimeoThumbSize])
                    })
                }), i.eq(n.core.index).addClass("active"), n.core.$el.on("onBeforeSlide.lg.tm", function () {
                    i.removeClass("active"), i.eq(n.core.index).addClass("active")
                }), i.on("click.lg touchend.lg", function () {
                    var e = t(this);
                    setTimeout(function () {
                        (n.thumbClickable && !n.core.lgBusy || !n.core.doCss()) && (n.core.index = e.index(), n.core.slide(n.core.index, !1, !0, !1))
                    }, 50)
                }), n.core.$el.on("onBeforeSlide.lg.tm", function () {
                    n.animateThumb(n.core.index)
                }), t(window).on("resize.lg.thumb orientationchange.lg.thumb", function () {
                    setTimeout(function () {
                        n.animateThumb(n.core.index), n.thumbOuterWidth = n.$thumbOuter.width()
                    }, 200)
                })
            }, i.prototype.setTranslate = function (t) {
                this.core.$outer.find(".lg-thumb").css({
                    transform: "translate3d(-" + t + "px, 0px, 0px)"
                })
            }, i.prototype.animateThumb = function (t) {
                var e = this.core.$outer.find(".lg-thumb");
                if (this.core.s.animateThumb) {
                    var i;
                    switch (this.core.s.currentPagerPosition) {
                        case "left":
                            i = 0;
                            break;
                        case "middle":
                            i = this.thumbOuterWidth / 2 - this.core.s.thumbWidth / 2;
                            break;
                        case "right":
                            i = this.thumbOuterWidth - this.core.s.thumbWidth
                    }
                    this.left = (this.core.s.thumbWidth + this.core.s.thumbMargin) * t - 1 - i, this.left > this.thumbTotalWidth - this.thumbOuterWidth && (this.left = this.thumbTotalWidth - this.thumbOuterWidth), this.left < 0 && (this.left = 0), this.core.lGalleryOn ? (e.hasClass("on") || this.core.$outer.find(".lg-thumb").css("transition-duration", this.core.s.speed + "ms"), this.core.doCss() || e.animate({
                        left: -this.left + "px"
                    }, this.core.s.speed)) : this.core.doCss() || e.css("left", -this.left + "px"), this.setTranslate(this.left)
                }
            }, i.prototype.enableThumbDrag = function () {
                var e = this,
                    i = 0,
                    n = 0,
                    o = !1,
                    s = !1,
                    r = 0;
                e.$thumbOuter.addClass("lg-grab"), e.core.$outer.find(".lg-thumb").on("mousedown.lg.thumb", function (t) {
                    e.thumbTotalWidth > e.thumbOuterWidth && (t.preventDefault(), i = t.pageX, o = !0, e.core.$outer.scrollLeft += 1, e.core.$outer.scrollLeft -= 1, e.thumbClickable = !1, e.$thumbOuter.removeClass("lg-grab").addClass("lg-grabbing"))
                }), t(window).on("mousemove.lg.thumb", function (t) {
                    o && (r = e.left, s = !0, n = t.pageX, e.$thumbOuter.addClass("lg-dragging"), r -= n - i, r > e.thumbTotalWidth - e.thumbOuterWidth && (r = e.thumbTotalWidth - e.thumbOuterWidth), r < 0 && (r = 0), e.setTranslate(r))
                }), t(window).on("mouseup.lg.thumb", function () {
                    s ? (s = !1, e.$thumbOuter.removeClass("lg-dragging"), e.left = r, Math.abs(n - i) < e.core.s.swipeThreshold && (e.thumbClickable = !0)) : e.thumbClickable = !0, o && (o = !1, e.$thumbOuter.removeClass("lg-grabbing").addClass("lg-grab"))
                })
            }, i.prototype.enableThumbSwipe = function () {
                var t = this,
                    e = 0,
                    i = 0,
                    n = !1,
                    o = 0;
                t.core.$outer.find(".lg-thumb").on("touchstart.lg", function (i) {
                    t.thumbTotalWidth > t.thumbOuterWidth && (i.preventDefault(), e = i.originalEvent.targetTouches[0].pageX, t.thumbClickable = !1)
                }), t.core.$outer.find(".lg-thumb").on("touchmove.lg", function (s) {
                    t.thumbTotalWidth > t.thumbOuterWidth && (s.preventDefault(), i = s.originalEvent.targetTouches[0].pageX, n = !0, t.$thumbOuter.addClass("lg-dragging"), o = t.left, o -= i - e, o > t.thumbTotalWidth - t.thumbOuterWidth && (o = t.thumbTotalWidth - t.thumbOuterWidth), o < 0 && (o = 0), t.setTranslate(o))
                }), t.core.$outer.find(".lg-thumb").on("touchend.lg", function () {
                    t.thumbTotalWidth > t.thumbOuterWidth && n ? (n = !1, t.$thumbOuter.removeClass("lg-dragging"), Math.abs(i - e) < t.core.s.swipeThreshold && (t.thumbClickable = !0), t.left = o) : t.thumbClickable = !0
                })
            }, i.prototype.toogle = function () {
                var t = this;
                t.core.s.toogleThumb && (t.core.$outer.addClass("lg-can-toggle"), t.$thumbOuter.append('<span class="lg-toogle-thumb lg-icon"></span>'), t.core.$outer.find(".lg-toogle-thumb").on("click.lg", function () {
                    t.core.$outer.toggleClass("lg-thumb-open")
                }))
            }, i.prototype.thumbkeyPress = function () {
                var e = this;
                t(window).on("keydown.lg.thumb", function (t) {
                    38 === t.keyCode ? (t.preventDefault(), e.core.$outer.addClass("lg-thumb-open")) : 40 === t.keyCode && (t.preventDefault(), e.core.$outer.removeClass("lg-thumb-open"))
                })
            }, i.prototype.destroy = function () {
                this.core.s.thumbnail && this.core.$items.length > 1 && (t(window).off("resize.lg.thumb orientationchange.lg.thumb keydown.lg.thumb"), this.$thumbOuter.remove(), this.core.$outer.removeClass("lg-has-thumb"))
            }, t.fn.lightGallery.modules.Thumbnail = i
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof module && module.exports ? module.exports = e(require("jquery")) : e(t.jQuery)
    }(this, function (t) {
        ! function () {
            "use strict";

            function e(t, e, i, n) {
                var o = this;
                if (o.core.$slide.eq(e).find(".lg-video").append(o.loadVideo(i, "lg-object", !0, e, n)), n)
                    if (o.core.s.videojs) try {
                        videojs(o.core.$slide.eq(e).find(".lg-html5").get(0), o.core.s.videojsOptions, function () {
                            !o.videoLoaded && o.core.s.autoplayFirstVideo && this.play()
                        })
                    } catch (t) {
                        console.error("Make sure you have included videojs")
                    } else !o.videoLoaded && o.core.s.autoplayFirstVideo && o.core.$slide.eq(e).find(".lg-html5").get(0).play()
            }

            function i(t, e) {
                var i = this.core.$slide.eq(e).find(".lg-video-cont");
                i.hasClass("lg-has-iframe") || (i.css("max-width", this.core.s.videoMaxWidth), this.videoLoaded = !0)
            }

            function n(e, i, n) {
                var o, s = this,
                    r = s.core.$slide.eq(i),
                    a = r.find(".lg-youtube").get(0),
                    l = r.find(".lg-vimeo").get(0),
                    u = r.find(".lg-dailymotion").get(0),
                    c = r.find(".lg-vk").get(0),
                    h = r.find(".lg-html5").get(0);
                if (a) a.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
                else if (l) try {
                        $f(l).api("pause")
                    } catch (t) {
                        console.error("Make sure you have included froogaloop2 js")
                    } else if (u) u.contentWindow.postMessage("pause", "*");
                    else if (h)
                    if (s.core.s.videojs) try {
                        videojs(h).pause()
                    } catch (t) {
                        console.error("Make sure you have included videojs")
                    } else h.pause();
                c && t(c).attr("src", t(c).attr("src").replace("&autoplay", "&noplay")), o = s.core.s.dynamic ? s.core.s.dynamicEl[n].src : s.core.$items.eq(n).attr("href") || s.core.$items.eq(n).attr("data-src");
                var d = s.core.isVideo(o, n) || {};
                (d.youtube || d.vimeo || d.dailymotion || d.vk) && s.core.$outer.addClass("lg-hide-download")
            }
            var o = {
                    videoMaxWidth: "855px",
                    autoplayFirstVideo: !0,
                    youtubePlayerParams: !1,
                    vimeoPlayerParams: !1,
                    dailymotionPlayerParams: !1,
                    vkPlayerParams: !1,
                    videojs: !1,
                    videojsOptions: {}
                },
                s = function (e) {
                    return this.core = t(e).data("lightGallery"), this.$el = t(e), this.core.s = t.extend({}, o, this.core.s), this.videoLoaded = !1, this.init(), this
                };
            s.prototype.init = function () {
                var o = this;
                o.core.$el.on("hasVideo.lg.tm", e.bind(this)), o.core.$el.on("onAferAppendSlide.lg.tm", i.bind(this)), o.core.doCss() && o.core.$items.length > 1 && (o.core.s.enableSwipe || o.core.s.enableDrag) ? o.core.$el.on("onSlideClick.lg.tm", function () {
                    var t = o.core.$slide.eq(o.core.index);
                    o.loadVideoOnclick(t)
                }) : o.core.$slide.on("click.lg", function () {
                    o.loadVideoOnclick(t(this))
                }), o.core.$el.on("onBeforeSlide.lg.tm", n.bind(this)), o.core.$el.on("onAfterSlide.lg.tm", function (t, e) {
                    o.core.$slide.eq(e).removeClass("lg-video-playing")
                }), o.core.s.autoplayFirstVideo && o.core.$el.on("onAferAppendSlide.lg.tm", function (t, e) {
                    if (!o.core.lGalleryOn) {
                        var i = o.core.$slide.eq(e);
                        setTimeout(function () {
                            o.loadVideoOnclick(i)
                        }, 100)
                    }
                })
            }, s.prototype.loadVideo = function (e, i, n, o, s) {
                var r = "",
                    a = 1,
                    l = "",
                    u = this.core.isVideo(e, o) || {};
                if (n && (a = this.videoLoaded ? 0 : this.core.s.autoplayFirstVideo ? 1 : 0), u.youtube) l = "?wmode=opaque&autoplay=" + a + "&enablejsapi=1", this.core.s.youtubePlayerParams && (l = l + "&" + t.param(this.core.s.youtubePlayerParams)), r = '<iframe class="lg-video-object lg-youtube ' + i + '" width="560" height="315" src="//www.youtube.com/embed/' + u.youtube[1] + l + '" frameborder="0" allowfullscreen></iframe>';
                else if (u.vimeo) l = "?autoplay=" + a + "&api=1", this.core.s.vimeoPlayerParams && (l = l + "&" + t.param(this.core.s.vimeoPlayerParams)), r = '<iframe class="lg-video-object lg-vimeo ' + i + '" width="560" height="315"  src="//player.vimeo.com/video/' + u.vimeo[1] + l + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
                else if (u.dailymotion) l = "?wmode=opaque&autoplay=" + a + "&api=postMessage", this.core.s.dailymotionPlayerParams && (l = l + "&" + t.param(this.core.s.dailymotionPlayerParams)), r = '<iframe class="lg-video-object lg-dailymotion ' + i + '" width="560" height="315" src="//www.dailymotion.com/embed/video/' + u.dailymotion[1] + l + '" frameborder="0" allowfullscreen></iframe>';
                else if (u.html5) {
                    var c = s.substring(0, 1);
                    "." !== c && "#" !== c || (s = t(s).html()), r = s
                } else u.vk && (l = "&autoplay=" + a, this.core.s.vkPlayerParams && (l = l + "&" + t.param(this.core.s.vkPlayerParams)), r = '<iframe class="lg-video-object lg-vk ' + i + '" width="560" height="315" src="//vk.com/video_ext.php?' + u.vk[1] + l + '" frameborder="0" allowfullscreen></iframe>');
                return r
            }, s.prototype.loadVideoOnclick = function (t) {
                var e = this;
                if (t.find(".lg-object").hasClass("lg-has-poster") && t.find(".lg-object").is(":visible"))
                    if (t.hasClass("lg-has-video")) {
                        var i = t.find(".lg-youtube").get(0),
                            n = t.find(".lg-vimeo").get(0),
                            o = t.find(".lg-dailymotion").get(0),
                            s = t.find(".lg-html5").get(0);
                        if (i) i.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
                        else if (n) try {
                                $f(n).api("play")
                            } catch (t) {
                                console.error("Make sure you have included froogaloop2 js")
                            } else if (o) o.contentWindow.postMessage("play", "*");
                            else if (s)
                            if (e.core.s.videojs) try {
                                videojs(s).play()
                            } catch (t) {
                                console.error("Make sure you have included videojs")
                            } else s.play();
                        t.addClass("lg-video-playing")
                    } else {
                        t.addClass("lg-video-playing lg-has-video");
                        var r, a, l = function (i, n) {
                            if (t.find(".lg-video").append(e.loadVideo(i, "", !1, e.core.index, n)), n)
                                if (e.core.s.videojs) try {
                                    videojs(e.core.$slide.eq(e.core.index).find(".lg-html5").get(0), e.core.s.videojsOptions, function () {
                                        this.play()
                                    })
                                } catch (t) {
                                    console.error("Make sure you have included videojs")
                                } else e.core.$slide.eq(e.core.index).find(".lg-html5").get(0).play()
                        };
                        e.core.s.dynamic ? (r = e.core.s.dynamicEl[e.core.index].src, a = e.core.s.dynamicEl[e.core.index].html, l(r, a)) : (r = e.core.$items.eq(e.core.index).attr("href") || e.core.$items.eq(e.core.index).attr("data-src"), a = e.core.$items.eq(e.core.index).attr("data-html"), l(r, a));
                        var u = t.find(".lg-object");
                        t.find(".lg-video").append(u), t.find(".lg-video-object").hasClass("lg-html5") || (t.removeClass("lg-complete"), t.find(".lg-video-object").on("load.lg error.lg", function () {
                            t.addClass("lg-complete")
                        }))
                    }
            }, s.prototype.destroy = function () {
                this.videoLoaded = !1
            }, t.fn.lightGallery.modules.video = s
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
    }(0, function (t) {
        ! function () {
            "use strict";
            var e = function () {
                    var t = !1,
                        e = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
                    return e && parseInt(e[2], 10) < 54 && (t = !0), t
                },
                i = {
                    scale: 1,
                    zoom: !0,
                    actualSize: !0,
                    enableZoomAfter: 300,
                    useLeftForZoom: e()
                },
                n = function (e) {
                    return this.core = t(e).data("lightGallery"), this.core.s = t.extend({}, i, this.core.s), this.core.s.zoom && this.core.doCss() && (this.init(), this.zoomabletimeout = !1, this.pageX = t(window).width() / 2, this.pageY = t(window).height() / 2 + t(window).scrollTop()), this
                };
            n.prototype.init = function () {
                var e = this,
                    i = '<span id="lg-zoom-in" class="lg-icon"></span><span id="lg-zoom-out" class="lg-icon"></span>';
                e.core.s.actualSize && (i += '<span id="lg-actual-size" class="lg-icon"></span>'), e.core.s.useLeftForZoom ? e.core.$outer.addClass("lg-use-left-for-zoom") : e.core.$outer.addClass("lg-use-transition-for-zoom"), this.core.$outer.find(".lg-toolbar").append(i), e.core.$el.on("onSlideItemLoad.lg.tm.zoom", function (i, n, o) {
                    var s = e.core.s.enableZoomAfter + o;
                    t("body").hasClass("lg-from-hash") && o ? s = 0 : t("body").removeClass("lg-from-hash"), e.zoomabletimeout = setTimeout(function () {
                        e.core.$slide.eq(n).addClass("lg-zoomable")
                    }, s + 30)
                });
                var n = 1,
                    o = function (i) {
                        var n, o, s = e.core.$outer.find(".lg-current .lg-image"),
                            r = (t(window).width() - s.prop("offsetWidth")) / 2,
                            a = (t(window).height() - s.prop("offsetHeight")) / 2 + t(window).scrollTop();
                        n = e.pageX - r, o = e.pageY - a;
                        var l = (i - 1) * n,
                            u = (i - 1) * o;
                        s.css("transform", "scale3d(" + i + ", " + i + ", 1)").attr("data-scale", i), e.core.s.useLeftForZoom ? s.parent().css({
                            left: -l + "px",
                            top: -u + "px"
                        }).attr("data-x", l).attr("data-y", u) : s.parent().css("transform", "translate3d(-" + l + "px, -" + u + "px, 0)").attr("data-x", l).attr("data-y", u)
                    },
                    s = function () {
                        n > 1 ? e.core.$outer.addClass("lg-zoomed") : e.resetZoom(), n < 1 && (n = 1), o(n)
                    },
                    r = function (i, o, r, a) {
                        var l, u, c = o.prop("offsetWidth");
                        l = e.core.s.dynamic ? e.core.s.dynamicEl[r].width || o[0].naturalWidth || c : e.core.$items.eq(r).attr("data-width") || o[0].naturalWidth || c, e.core.$outer.hasClass("lg-zoomed") ? n = 1 : l > c && (u = l / c, n = u || 2), a ? (e.pageX = t(window).width() / 2, e.pageY = t(window).height() / 2 + t(window).scrollTop()) : (e.pageX = i.pageX || i.originalEvent.targetTouches[0].pageX, e.pageY = i.pageY || i.originalEvent.targetTouches[0].pageY), s(), setTimeout(function () {
                            e.core.$outer.removeClass("lg-grabbing").addClass("lg-grab")
                        }, 10)
                    },
                    a = !1;
                e.core.$el.on("onAferAppendSlide.lg.tm.zoom", function (t, i) {
                    var n = e.core.$slide.eq(i).find(".lg-image");
                    n.on("dblclick", function (t) {
                        r(t, n, i)
                    }), n.on("touchstart", function (t) {
                        a ? (clearTimeout(a), a = null, r(t, n, i)) : a = setTimeout(function () {
                            a = null
                        }, 300), t.preventDefault()
                    })
                }), t(window).on("resize.lg.zoom scroll.lg.zoom orientationchange.lg.zoom", function () {
                    e.pageX = t(window).width() / 2, e.pageY = t(window).height() / 2 + t(window).scrollTop(), o(n)
                }), t("#lg-zoom-out").on("click.lg", function () {
                    e.core.$outer.find(".lg-current .lg-image").length && (n -= e.core.s.scale, s())
                }), t("#lg-zoom-in").on("click.lg", function () {
                    e.core.$outer.find(".lg-current .lg-image").length && (n += e.core.s.scale, s())
                }), t("#lg-actual-size").on("click.lg", function (t) {
                    r(t, e.core.$slide.eq(e.core.index).find(".lg-image"), e.core.index, !0)
                }), e.core.$el.on("onBeforeSlide.lg.tm", function () {
                    n = 1, e.resetZoom()
                }), e.zoomDrag(), e.zoomSwipe()
            }, n.prototype.resetZoom = function () {
                this.core.$outer.removeClass("lg-zoomed"), this.core.$slide.find(".lg-img-wrap").removeAttr("style data-x data-y"), this.core.$slide.find(".lg-image").removeAttr("style data-scale"), this.pageX = t(window).width() / 2, this.pageY = t(window).height() / 2 + t(window).scrollTop()
            }, n.prototype.zoomSwipe = function () {
                var t = this,
                    e = {},
                    i = {},
                    n = !1,
                    o = !1,
                    s = !1;
                t.core.$slide.on("touchstart.lg", function (i) {
                    if (t.core.$outer.hasClass("lg-zoomed")) {
                        var n = t.core.$slide.eq(t.core.index).find(".lg-object");
                        s = n.prop("offsetHeight") * n.attr("data-scale") > t.core.$outer.find(".lg").height(), o = n.prop("offsetWidth") * n.attr("data-scale") > t.core.$outer.find(".lg").width(), (o || s) && (i.preventDefault(), e = {
                            x: i.originalEvent.targetTouches[0].pageX,
                            y: i.originalEvent.targetTouches[0].pageY
                        })
                    }
                }), t.core.$slide.on("touchmove.lg", function (r) {
                    if (t.core.$outer.hasClass("lg-zoomed")) {
                        var a, l, u = t.core.$slide.eq(t.core.index).find(".lg-img-wrap");
                        r.preventDefault(), n = !0, i = {
                            x: r.originalEvent.targetTouches[0].pageX,
                            y: r.originalEvent.targetTouches[0].pageY
                        }, t.core.$outer.addClass("lg-zoom-dragging"), l = s ? -Math.abs(u.attr("data-y")) + (i.y - e.y) : -Math.abs(u.attr("data-y")), a = o ? -Math.abs(u.attr("data-x")) + (i.x - e.x) : -Math.abs(u.attr("data-x")), (Math.abs(i.x - e.x) > 15 || Math.abs(i.y - e.y) > 15) && (t.core.s.useLeftForZoom ? u.css({
                            left: a + "px",
                            top: l + "px"
                        }) : u.css("transform", "translate3d(" + a + "px, " + l + "px, 0)"))
                    }
                }), t.core.$slide.on("touchend.lg", function () {
                    t.core.$outer.hasClass("lg-zoomed") && n && (n = !1, t.core.$outer.removeClass("lg-zoom-dragging"), t.touchendZoom(e, i, o, s))
                })
            }, n.prototype.zoomDrag = function () {
                var e = this,
                    i = {},
                    n = {},
                    o = !1,
                    s = !1,
                    r = !1,
                    a = !1;
                e.core.$slide.on("mousedown.lg.zoom", function (n) {
                    var s = e.core.$slide.eq(e.core.index).find(".lg-object");
                    a = s.prop("offsetHeight") * s.attr("data-scale") > e.core.$outer.find(".lg").height(), r = s.prop("offsetWidth") * s.attr("data-scale") > e.core.$outer.find(".lg").width(), e.core.$outer.hasClass("lg-zoomed") && t(n.target).hasClass("lg-object") && (r || a) && (n.preventDefault(), i = {
                        x: n.pageX,
                        y: n.pageY
                    }, o = !0, e.core.$outer.scrollLeft += 1, e.core.$outer.scrollLeft -= 1, e.core.$outer.removeClass("lg-grab").addClass("lg-grabbing"))
                }), t(window).on("mousemove.lg.zoom", function (t) {
                    if (o) {
                        var l, u, c = e.core.$slide.eq(e.core.index).find(".lg-img-wrap");
                        s = !0, n = {
                            x: t.pageX,
                            y: t.pageY
                        }, e.core.$outer.addClass("lg-zoom-dragging"), u = a ? -Math.abs(c.attr("data-y")) + (n.y - i.y) : -Math.abs(c.attr("data-y")), l = r ? -Math.abs(c.attr("data-x")) + (n.x - i.x) : -Math.abs(c.attr("data-x")), e.core.s.useLeftForZoom ? c.css({
                            left: l + "px",
                            top: u + "px"
                        }) : c.css("transform", "translate3d(" + l + "px, " + u + "px, 0)")
                    }
                }), t(window).on("mouseup.lg.zoom", function (t) {
                    o && (o = !1, e.core.$outer.removeClass("lg-zoom-dragging"), !s || i.x === n.x && i.y === n.y || (n = {
                        x: t.pageX,
                        y: t.pageY
                    }, e.touchendZoom(i, n, r, a)), s = !1), e.core.$outer.removeClass("lg-grabbing").addClass("lg-grab")
                })
            }, n.prototype.touchendZoom = function (t, e, i, n) {
                var o = this,
                    s = o.core.$slide.eq(o.core.index).find(".lg-img-wrap"),
                    r = o.core.$slide.eq(o.core.index).find(".lg-object"),
                    a = -Math.abs(s.attr("data-x")) + (e.x - t.x),
                    l = -Math.abs(s.attr("data-y")) + (e.y - t.y),
                    u = (o.core.$outer.find(".lg").height() - r.prop("offsetHeight")) / 2,
                    c = Math.abs(r.prop("offsetHeight") * Math.abs(r.attr("data-scale")) - o.core.$outer.find(".lg").height() + u),
                    h = (o.core.$outer.find(".lg").width() - r.prop("offsetWidth")) / 2,
                    d = Math.abs(r.prop("offsetWidth") * Math.abs(r.attr("data-scale")) - o.core.$outer.find(".lg").width() + h);
                (Math.abs(e.x - t.x) > 15 || Math.abs(e.y - t.y) > 15) && (n && (l <= -c ? l = -c : l >= -u && (l = -u)), i && (a <= -d ? a = -d : a >= -h && (a = -h)), n ? s.attr("data-y", Math.abs(l)) : l = -Math.abs(s.attr("data-y")), i ? s.attr("data-x", Math.abs(a)) : a = -Math.abs(s.attr("data-x")), o.core.s.useLeftForZoom ? s.css({
                    left: a + "px",
                    top: l + "px"
                }) : s.css("transform", "translate3d(" + a + "px, " + l + "px, 0)"))
            }, n.prototype.destroy = function () {
                var e = this;
                e.core.$el.off(".lg.zoom"), t(window).off(".lg.zoom"), e.core.$slide.off(".lg.zoom"), e.core.$el.off(".lg.tm.zoom"), e.resetZoom(), clearTimeout(e.zoomabletimeout), e.zoomabletimeout = !1
            }, t.fn.lightGallery.modules.zoom = n
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
    }(0, function (t) {
        ! function () {
            "use strict";
            var e = {
                    hash: !0
                },
                i = function (i) {
                    return this.core = t(i).data("lightGallery"), this.core.s = t.extend({}, e, this.core.s), this.core.s.hash && (this.oldHash = window.location.hash, this.init()), this
                };
            i.prototype.init = function () {
                var e, i = this;
                i.core.$el.on("onAfterSlide.lg.tm", function (t, e, n) {
                    history.replaceState ? history.replaceState(null, null, window.location.pathname + window.location.search + "#lg=" + i.core.s.galleryId + "&slide=" + n) : window.location.hash = "lg=" + i.core.s.galleryId + "&slide=" + n
                }), t(window).on("hashchange.lg.hash", function () {
                    e = window.location.hash;
                    var t = parseInt(e.split("&slide=")[1], 10);
                    e.indexOf("lg=" + i.core.s.galleryId) > -1 ? i.core.slide(t, !1, !1) : i.core.lGalleryOn && i.core.destroy()
                })
            }, i.prototype.destroy = function () {
                this.core.s.hash && (this.oldHash && this.oldHash.indexOf("lg=" + this.core.s.galleryId) < 0 ? history.replaceState ? history.replaceState(null, null, this.oldHash) : window.location.hash = this.oldHash : history.replaceState ? history.replaceState(null, document.title, window.location.pathname + window.location.search) : window.location.hash = "", this.core.$el.off(".lg.hash"))
            }, t.fn.lightGallery.modules.hash = i
        }()
    }),
    function (t, e) {
        "function" == typeof define && define.amd ? define(["jquery"], function (t) {
            return e(t)
        }) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
    }(0, function (t) {
        ! function () {
            "use strict";
            var e = {
                    share: !0,
                    facebook: !0,
                    facebookDropdownText: "Facebook",
                    twitter: !0,
                    twitterDropdownText: "Twitter",
                    googlePlus: !0,
                    googlePlusDropdownText: "GooglePlus",
                    pinterest: !0,
                    pinterestDropdownText: "Pinterest"
                },
                i = function (i) {
                    return this.core = t(i).data("lightGallery"), this.core.s = t.extend({}, e, this.core.s), this.core.s.share && this.init(), this
                };
            i.prototype.init = function () {
                var e = this,
                    i = '<span id="lg-share" class="lg-icon"><ul class="lg-dropdown" style="position: absolute;">';
                i += e.core.s.facebook ? '<li><a id="lg-share-facebook" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.facebookDropdownText + "</span></a></li>" : "", i += e.core.s.twitter ? '<li><a id="lg-share-twitter" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.twitterDropdownText + "</span></a></li>" : "", i += e.core.s.googlePlus ? '<li><a id="lg-share-googleplus" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.googlePlusDropdownText + "</span></a></li>" : "", i += e.core.s.pinterest ? '<li><a id="lg-share-pinterest" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.pinterestDropdownText + "</span></a></li>" : "", i += "</ul></span>", this.core.$outer.find(".lg-toolbar").append(i), this.core.$outer.find(".lg").append('<div id="lg-dropdown-overlay"></div>'), t("#lg-share").on("click.lg", function () {
                    e.core.$outer.toggleClass("lg-dropdown-active")
                }), t("#lg-dropdown-overlay").on("click.lg", function () {
                    e.core.$outer.removeClass("lg-dropdown-active")
                }), e.core.$el.on("onAfterSlide.lg.tm", function (i, n, o) {
                    setTimeout(function () {
                        t("#lg-share-facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(e.getSahreProps(o, "facebookShareUrl") || window.location.href)), t("#lg-share-twitter").attr("href", "https://twitter.com/intent/tweet?text=" + e.getSahreProps(o, "tweetText") + "&url=" + encodeURIComponent(e.getSahreProps(o, "twitterShareUrl") || window.location.href)), t("#lg-share-googleplus").attr("href", "https://plus.google.com/share?url=" + encodeURIComponent(e.getSahreProps(o, "googleplusShareUrl") || window.location.href)), t("#lg-share-pinterest").attr("href", "http://www.pinterest.com/pin/create/button/?url=" + encodeURIComponent(e.getSahreProps(o, "pinterestShareUrl") || window.location.href) + "&media=" + encodeURIComponent(e.getSahreProps(o, "src")) + "&description=" + e.getSahreProps(o, "pinterestText"))
                    }, 100)
                })
            }, i.prototype.getSahreProps = function (t, e) {
                var i = "";
                if (this.core.s.dynamic) i = this.core.s.dynamicEl[t][e];
                else {
                    var n = this.core.$items.eq(t).attr("href"),
                        o = this.core.$items.eq(t).data(e);
                    i = "src" === e && n || o
                }
                return i
            }, i.prototype.destroy = function () {}, t.fn.lightGallery.modules.share = i
        }()
    }),
    function (t) {
        "function" == typeof define && define.amd ? define(["jquery"], t) : "object" == typeof exports ? module.exports = t : t(jQuery)
    }(function (t) {
        function e(e) {
            var r = e || window.event,
                a = l.call(arguments, 1),
                u = 0,
                h = 0,
                d = 0,
                p = 0,
                m = 0,
                f = 0;
            if (e = t.event.fix(r), e.type = "mousewheel", "detail" in r && (d = -1 * r.detail), "wheelDelta" in r && (d = r.wheelDelta), "wheelDeltaY" in r && (d = r.wheelDeltaY), "wheelDeltaX" in r && (h = -1 * r.wheelDeltaX), "axis" in r && r.axis === r.HORIZONTAL_AXIS && (h = -1 * d, d = 0), u = 0 === d ? h : d, "deltaY" in r && (d = -1 * r.deltaY, u = d), "deltaX" in r && (h = r.deltaX, 0 === d && (u = -1 * h)), 0 !== d || 0 !== h) {
                if (1 === r.deltaMode) {
                    var g = t.data(this, "mousewheel-line-height");
                    u *= g, d *= g, h *= g
                } else if (2 === r.deltaMode) {
                    var v = t.data(this, "mousewheel-page-height");
                    u *= v, d *= v, h *= v
                }
                if (p = Math.max(Math.abs(d), Math.abs(h)), (!s || s > p) && (s = p, n(r, p) && (s /= 40)), n(r, p) && (u /= 40, h /= 40, d /= 40), u = Math[u >= 1 ? "floor" : "ceil"](u / s), h = Math[h >= 1 ? "floor" : "ceil"](h / s), d = Math[d >= 1 ? "floor" : "ceil"](d / s), c.settings.normalizeOffset && this.getBoundingClientRect) {
                    var y = this.getBoundingClientRect();
                    m = e.clientX - y.left, f = e.clientY - y.top
                }
                return e.deltaX = h, e.deltaY = d, e.deltaFactor = s, e.offsetX = m, e.offsetY = f, e.deltaMode = 0, a.unshift(e, u, h, d), o && clearTimeout(o), o = setTimeout(i, 200), (t.event.dispatch || t.event.handle).apply(this, a)
            }
        }

        function i() {
            s = null
        }

        function n(t, e) {
            return c.settings.adjustOldDeltas && "mousewheel" === t.type && e % 120 == 0
        }
        var o, s, r = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
            a = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
            l = Array.prototype.slice;
        if (t.event.fixHooks)
            for (var u = r.length; u;) t.event.fixHooks[r[--u]] = t.event.mouseHooks;
        var c = t.event.special.mousewheel = {
            version: "3.1.12",
            setup: function () {
                if (this.addEventListener)
                    for (var i = a.length; i;) this.addEventListener(a[--i], e, !1);
                else this.onmousewheel = e;
                t.data(this, "mousewheel-line-height", c.getLineHeight(this)), t.data(this, "mousewheel-page-height", c.getPageHeight(this))
            },
            teardown: function () {
                if (this.removeEventListener)
                    for (var i = a.length; i;) this.removeEventListener(a[--i], e, !1);
                else this.onmousewheel = null;
                t.removeData(this, "mousewheel-line-height"), t.removeData(this, "mousewheel-page-height")
            },
            getLineHeight: function (e) {
                var i = t(e),
                    n = i["offsetParent" in t.fn ? "offsetParent" : "parent"]();
                return n.length || (n = t("body")), parseInt(n.css("fontSize"), 10) || parseInt(i.css("fontSize"), 10) || 16
            },
            getPageHeight: function (e) {
                return t(e).height()
            },
            settings: {
                adjustOldDeltas: !0,
                normalizeOffset: !0
            }
        };
        t.fn.extend({
            mousewheel: function (t) {
                return t ? this.bind("mousewheel", t) : this.trigger("mousewheel")
            },
            unmousewheel: function (t) {
                return this.unbind("mousewheel", t)
            }
        })
    }),
    function (t) {
        "use strict";

        function e(e) {
            return e.is('[type="checkbox"]') ? e.prop("checked") : e.is('[type="radio"]') ? !!t('[name="' + e.attr("name") + '"]:checked').length : e.is("select[multiple]") ? (e.val() || []).length : e.val()
        }

        function i(e) {
            return this.each(function () {
                var i = t(this),
                    o = t.extend({}, n.DEFAULTS, i.data(), "object" == typeof e && e),
                    s = i.data("bs.validator");
                (s || "destroy" != e) && (s || i.data("bs.validator", s = new n(this, o)), "string" == typeof e && s[e]())
            })
        }
        var n = function (i, o) {
            this.options = o, this.validators = t.extend({}, n.VALIDATORS, o.custom), this.$element = t(i), this.$btn = t('button[type="submit"], input[type="submit"]').filter('[form="' + this.$element.attr("id") + '"]').add(this.$element.find('input[type="submit"], button[type="submit"]')), this.update(), this.$element.on("input.bs.validator change.bs.validator focusout.bs.validator", t.proxy(this.onInput, this)), this.$element.on("submit.bs.validator", t.proxy(this.onSubmit, this)), this.$element.on("reset.bs.validator", t.proxy(this.reset, this)), this.$element.find("[data-match]").each(function () {
                var i = t(this),
                    n = i.attr("data-match");
                t(n).on("input.bs.validator", function () {
                    e(i) && i.trigger("input.bs.validator")
                })
            }), this.$inputs.filter(function () {
                return e(t(this)) && !t(this).closest(".has-error").length
            }).trigger("focusout"), this.$element.attr("novalidate", !0)
        };
        n.VERSION = "0.11.9", n.INPUT_SELECTOR = ':input:not([type="hidden"], [type="submit"], [type="reset"], button)', n.FOCUS_OFFSET = 20, n.DEFAULTS = {
            delay: 500,
            html: !1,
            disable: !0,
            focus: !0,
            custom: {},
            errors: {
                match: "Does not match",
                minlength: "Not long enough"
            },
            feedback: {
                success: "glyphicon-ok",
                error: "glyphicon-remove"
            }
        }, n.VALIDATORS = {
            native: function (t) {
                var e = t[0];
                return e.checkValidity ? !e.checkValidity() && !e.validity.valid && (e.validationMessage || "error!") : void 0
            },
            match: function (e) {
                var i = e.attr("data-match");
                return e.val() !== t(i).val() && n.DEFAULTS.errors.match
            },
            minlength: function (t) {
                var e = t.attr("data-minlength");
                return t.val().length < e && n.DEFAULTS.errors.minlength
            }
        }, n.prototype.update = function () {
            var e = this;
            return this.$inputs = this.$element.find(n.INPUT_SELECTOR).add(this.$element.find('[data-validate="true"]')).not(this.$element.find('[data-validate="false"]').each(function () {
                e.clearErrors(t(this))
            })), this.toggleSubmit(), this
        }, n.prototype.onInput = function (e) {
            var i = this,
                n = t(e.target),
                o = "focusout" !== e.type;
            this.$inputs.is(n) && this.validateInput(n, o).done(function () {
                i.toggleSubmit()
            })
        }, n.prototype.validateInput = function (i, n) {
            var o = (e(i), i.data("bs.validator.errors"));
            i.is('[type="radio"]') && (i = this.$element.find('input[name="' + i.attr("name") + '"]'));
            var s = t.Event("validate.bs.validator", {
                relatedTarget: i[0]
            });
            if (this.$element.trigger(s), !s.isDefaultPrevented()) {
                var r = this;
                return this.runValidators(i).done(function (e) {
                    i.data("bs.validator.errors", e), e.length ? n ? r.defer(i, r.showErrors) : r.showErrors(i) : r.clearErrors(i), o && e.toString() === o.toString() || (s = e.length ? t.Event("invalid.bs.validator", {
                        relatedTarget: i[0],
                        detail: e
                    }) : t.Event("valid.bs.validator", {
                        relatedTarget: i[0],
                        detail: o
                    }), r.$element.trigger(s)), r.toggleSubmit(), r.$element.trigger(t.Event("validated.bs.validator", {
                        relatedTarget: i[0]
                    }))
                })
            }
        }, n.prototype.runValidators = function (i) {
            function n(t) {
                return i.attr("data-" + t + "-error")
            }

            function o() {
                var t = i[0].validity;
                return t.typeMismatch ? i.attr("data-type-error") : t.patternMismatch ? i.attr("data-pattern-error") : t.stepMismatch ? i.attr("data-step-error") : t.rangeOverflow ? i.attr("data-max-error") : t.rangeUnderflow ? i.attr("data-min-error") : t.valueMissing ? i.attr("data-required-error") : null
            }

            function s() {
                return i.attr("data-error")
            }

            function r(t) {
                return n(t) || o() || s()
            }
            var a = [],
                l = t.Deferred();
            return i.data("bs.validator.deferred") && i.data("bs.validator.deferred").reject(), i.data("bs.validator.deferred", l), t.each(this.validators, t.proxy(function (t, n) {
                var o = null;
                !e(i) && !i.attr("required") || void 0 === i.attr("data-" + t) && "native" != t || !(o = n.call(this, i)) || (o = r(t) || o, !~a.indexOf(o) && a.push(o))
            }, this)), !a.length && e(i) && i.attr("data-remote") ? this.defer(i, function () {
                var n = {};
                n[i.attr("name")] = e(i), t.get(i.attr("data-remote"), n).fail(function (t, e, i) {
                    a.push(r("remote") || i)
                }).always(function () {
                    l.resolve(a)
                })
            }) : l.resolve(a), l.promise()
        }, n.prototype.validate = function () {
            var e = this;
            return t.when(this.$inputs.map(function () {
                return e.validateInput(t(this), !1)
            })).then(function () {
                e.toggleSubmit(), e.focusError()
            }), this
        }, n.prototype.focusError = function () {
            if (this.options.focus) {
                var e = this.$element.find(".has-error :input:first");
                0 !== e.length && (t("html, body").animate({
                    scrollTop: e.offset().top - n.FOCUS_OFFSET
                }, 250), e.focus())
            }
        }, n.prototype.showErrors = function (e) {
            var i = this.options.html ? "html" : "text",
                n = e.data("bs.validator.errors"),
                o = e.closest(".form-label-group"),
                s = o.find(".help-block.with-errors"),
                r = o.find(".form-control-feedback");
            n.length && (n = t("<ul/>").addClass("list-unstyled mb-0").append(t.map(n, function (e) {
                return t("<li/>")[i](e)
            })), void 0 === s.data("bs.validator.originalContent") && s.data("bs.validator.originalContent", s.html()), s.empty().append(n), o.addClass("has-error has-danger"), o.hasClass("has-feedback") && r.removeClass(this.options.feedback.success) && r.addClass(this.options.feedback.error) && o.removeClass("has-success"))
        }, n.prototype.clearErrors = function (t) {
            var i = t.closest(".form-label-group"),
                n = i.find(".help-block.with-errors"),
                o = i.find(".form-control-feedback");
            n.html(n.data("bs.validator.originalContent")), i.removeClass("has-error has-danger has-success"), i.hasClass("has-feedback") && o.removeClass(this.options.feedback.error) && o.removeClass(this.options.feedback.success) && e(t) && o.addClass(this.options.feedback.success) && i.addClass("has-success")
        }, n.prototype.hasErrors = function () {
            function e() {
                return !!(t(this).data("bs.validator.errors") || []).length
            }
            return !!this.$inputs.filter(e).length
        }, n.prototype.isIncomplete = function () {
            function i() {
                var i = e(t(this));
                return !("string" == typeof i ? t.trim(i) : i)
            }
            return !!this.$inputs.filter("[required]").filter(i).length
        }, n.prototype.onSubmit = function (t) {
            this.validate(), (this.isIncomplete() || this.hasErrors()) && t.preventDefault()
        }, n.prototype.toggleSubmit = function () {
            this.options.disable && this.$btn.toggleClass("disabled", this.isIncomplete() || this.hasErrors())
        }, n.prototype.defer = function (e, i) {
            return i = t.proxy(i, this, e), this.options.delay ? (window.clearTimeout(e.data("bs.validator.timeout")), void e.data("bs.validator.timeout", window.setTimeout(i, this.options.delay))) : i()
        }, n.prototype.reset = function () {
            return this.$element.find(".form-control-feedback").removeClass(this.options.feedback.error).removeClass(this.options.feedback.success), this.$inputs.removeData(["bs.validator.errors", "bs.validator.deferred"]).each(function () {
                var e = t(this),
                    i = e.data("bs.validator.timeout");
                window.clearTimeout(i) && e.removeData("bs.validator.timeout")
            }), this.$element.find(".help-block.with-errors").each(function () {
                var e = t(this),
                    i = e.data("bs.validator.originalContent");
                e.removeData("bs.validator.originalContent").html(i)
            }), this.$btn.removeClass("disabled"), this.$element.find(".has-error, .has-danger, .has-success").removeClass("has-error has-danger has-success"), this
        }, n.prototype.destroy = function () {
            return this.reset(), this.$element.removeAttr("novalidate").removeData("bs.validator").off(".bs.validator"), this.$inputs.off(".bs.validator"), this.options = null, this.validators = null, this.$element = null, this.$btn = null, this.$inputs = null, this
        };
        var o = t.fn.validator;
        t.fn.validator = i, t.fn.validator.Constructor = n, t.fn.validator.noConflict = function () {
            return t.fn.validator = o, this
        }, t(window).on("load", function () {
            t('form[data-toggle="validator"]').each(function () {
                var e = t(this);
                i.call(e, e.data())
            })
        })
    }(jQuery),
    function (t) {
        if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
        else if ("function" == typeof define && define.amd) define([], t);
        else {
            var e;
            e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.ProgressBar = t()
        }
    }(function () {
        var t;
        return function t(e, i, n) {
            function o(r, a) {
                if (!i[r]) {
                    if (!e[r]) {
                        var l = "function" == typeof require && require;
                        if (!a && l) return l(r, !0);
                        if (s) return s(r, !0);
                        var u = new Error("Cannot find module '" + r + "'");
                        throw u.code = "MODULE_NOT_FOUND", u
                    }
                    var c = i[r] = {
                        exports: {}
                    };
                    e[r][0].call(c.exports, function (t) {
                        var i = e[r][1][t];
                        return o(i || t)
                    }, c, c.exports, t, e, i, n)
                }
                return i[r].exports
            }
            for (var s = "function" == typeof require && require, r = 0; r < n.length; r++) o(n[r]);
            return o
        }({
            1: [function (e, i, n) {
                (function () {
                    var e = this || Function("return this")(),
                        o = function () {
                            "use strict";

                            function o() {}

                            function s(t, e) {
                                var i;
                                for (i in t) Object.hasOwnProperty.call(t, i) && e(i)
                            }

                            function r(t, e) {
                                return s(e, function (i) {
                                    t[i] = e[i]
                                }), t
                            }

                            function a(t, e) {
                                s(e, function (i) {
                                    void 0 === t[i] && (t[i] = e[i])
                                })
                            }

                            function l(t, e, i, n, o, s, r) {
                                var a, l, c, h = s > t ? 0 : (t - s) / o;
                                for (a in e) e.hasOwnProperty(a) && (l = r[a], c = "function" == typeof l ? l : m[l], e[a] = u(i[a], n[a], c, h));
                                return e
                            }

                            function u(t, e, i, n) {
                                return t + (e - t) * i(n)
                            }

                            function c(t, e) {
                                var i = p.prototype.filter,
                                    n = t._filterArgs;
                                s(i, function (o) {
                                    void 0 !== i[o][e] && i[o][e].apply(t, n)
                                })
                            }

                            function h(t, e, i, n, o, s, r, a, u, h, d) {
                                g = e + i + n, v = Math.min(d || S(), g), y = v >= g, b = n - (g - v), t.isPlaying() && (y ? (u(r, t._attachment, b), t.stop(!0)) : (t._scheduleId = h(t._timeoutHandler, T), c(t, "beforeTween"), e + i > v ? l(1, o, s, r, 1, 1, a) : l(v, o, s, r, n, e + i, a), c(t, "afterTween"), u(o, t._attachment, b)))
                            }

                            function d(t, e) {
                                var i = {},
                                    n = typeof e;
                                return s(t, "string" === n || "function" === n ? function (t) {
                                    i[t] = e
                                } : function (t) {
                                    i[t] || (i[t] = e[t] || w)
                                }), i
                            }

                            function p(t, e) {
                                this._currentState = t || {}, this._configured = !1, this._scheduleFunction = f, void 0 !== e && this.setConfig(e)
                            }
                            var m, f, g, v, y, b, w = "linear",
                                x = 500,
                                T = 1e3 / 60,
                                _ = Date.now ? Date.now : function () {
                                    return +new Date
                                },
                                S = "undefined" != typeof SHIFTY_DEBUG_NOW ? SHIFTY_DEBUG_NOW : _;
                            return f = "undefined" != typeof window && (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || window.mozCancelRequestAnimationFrame && window.mozRequestAnimationFrame) || setTimeout, p.prototype.tween = function (t) {
                                return this._isTweening ? this : (void 0 === t && this._configured || this.setConfig(t), this._timestamp = S(), this._start(this.get(), this._attachment), this.resume())
                            }, p.prototype.setConfig = function (t) {
                                t = t || {}, this._configured = !0, this._attachment = t.attachment, this._pausedAtTime = null, this._scheduleId = null, this._delay = t.delay || 0, this._start = t.start || o, this._step = t.step || o, this._finish = t.finish || o, this._duration = t.duration || x, this._currentState = r({}, t.from) || this.get(), this._originalState = this.get(), this._targetState = r({}, t.to) || this.get();
                                var e = this;
                                this._timeoutHandler = function () {
                                    h(e, e._timestamp, e._delay, e._duration, e._currentState, e._originalState, e._targetState, e._easing, e._step, e._scheduleFunction)
                                };
                                var i = this._currentState,
                                    n = this._targetState;
                                return a(n, i), this._easing = d(i, t.easing || w), this._filterArgs = [i, this._originalState, n, this._easing], c(this, "tweenCreated"), this
                            }, p.prototype.get = function () {
                                return r({}, this._currentState)
                            }, p.prototype.set = function (t) {
                                this._currentState = t
                            }, p.prototype.pause = function () {
                                return this._pausedAtTime = S(), this._isPaused = !0, this
                            }, p.prototype.resume = function () {
                                return this._isPaused && (this._timestamp += S() - this._pausedAtTime), this._isPaused = !1, this._isTweening = !0, this._timeoutHandler(), this
                            }, p.prototype.seek = function (t) {
                                t = Math.max(t, 0);
                                var e = S();
                                return this._timestamp + t === 0 ? this : (this._timestamp = e - t, this.isPlaying() || (this._isTweening = !0, this._isPaused = !1, h(this, this._timestamp, this._delay, this._duration, this._currentState, this._originalState, this._targetState, this._easing, this._step, this._scheduleFunction, e), this.pause()), this)
                            }, p.prototype.stop = function (t) {
                                return this._isTweening = !1, this._isPaused = !1, this._timeoutHandler = o, (e.cancelAnimationFrame || e.webkitCancelAnimationFrame || e.oCancelAnimationFrame || e.msCancelAnimationFrame || e.mozCancelRequestAnimationFrame || e.clearTimeout)(this._scheduleId), t && (c(this, "beforeTween"), l(1, this._currentState, this._originalState, this._targetState, 1, 0, this._easing), c(this, "afterTween"), c(this, "afterTweenEnd"), this._finish.call(this, this._currentState, this._attachment)), this
                            }, p.prototype.isPlaying = function () {
                                return this._isTweening && !this._isPaused
                            }, p.prototype.setScheduleFunction = function (t) {
                                this._scheduleFunction = t
                            }, p.prototype.dispose = function () {
                                var t;
                                for (t in this) this.hasOwnProperty(t) && delete this[t]
                            }, p.prototype.filter = {}, p.prototype.formula = {
                                linear: function (t) {
                                    return t
                                }
                            }, m = p.prototype.formula, r(p, {
                                now: S,
                                each: s,
                                tweenProps: l,
                                tweenProp: u,
                                applyFilter: c,
                                shallowCopy: r,
                                defaults: a,
                                composeEasingObject: d
                            }), "function" == typeof SHIFTY_DEBUG_NOW && (e.timeoutHandler = h), "object" == typeof n ? i.exports = p : "function" == typeof t && t.amd ? t(function () {
                                return p
                            }) : void 0 === e.Tweenable && (e.Tweenable = p), p
                        }();
                    o.shallowCopy(o.prototype.formula, {
                            easeInQuad: function (t) {
                                return Math.pow(t, 2)
                            },
                            easeOutQuad: function (t) {
                                return -(Math.pow(t - 1, 2) - 1)
                            },
                            easeInOutQuad: function (t) {
                                return (t /= .5) < 1 ? .5 * Math.pow(t, 2) : -.5 * ((t -= 2) * t - 2)
                            },
                            easeInCubic: function (t) {
                                return Math.pow(t, 3)
                            },
                            easeOutCubic: function (t) {
                                return Math.pow(t - 1, 3) + 1
                            },
                            easeInOutCubic: function (t) {
                                return (t /= .5) < 1 ? .5 * Math.pow(t, 3) : .5 * (Math.pow(t - 2, 3) + 2)
                            },
                            easeInQuart: function (t) {
                                return Math.pow(t, 4)
                            },
                            easeOutQuart: function (t) {
                                return -(Math.pow(t - 1, 4) - 1)
                            },
                            easeInOutQuart: function (t) {
                                return (t /= .5) < 1 ? .5 * Math.pow(t, 4) : -.5 * ((t -= 2) * Math.pow(t, 3) - 2)
                            },
                            easeInQuint: function (t) {
                                return Math.pow(t, 5)
                            },
                            easeOutQuint: function (t) {
                                return Math.pow(t - 1, 5) + 1
                            },
                            easeInOutQuint: function (t) {
                                return (t /= .5) < 1 ? .5 * Math.pow(t, 5) : .5 * (Math.pow(t - 2, 5) + 2)
                            },
                            easeInSine: function (t) {
                                return 1 - Math.cos(t * (Math.PI / 2))
                            },
                            easeOutSine: function (t) {
                                return Math.sin(t * (Math.PI / 2))
                            },
                            easeInOutSine: function (t) {
                                return -.5 * (Math.cos(Math.PI * t) - 1)
                            },
                            easeInExpo: function (t) {
                                return 0 === t ? 0 : Math.pow(2, 10 * (t - 1))
                            },
                            easeOutExpo: function (t) {
                                return 1 === t ? 1 : 1 - Math.pow(2, -10 * t)
                            },
                            easeInOutExpo: function (t) {
                                return 0 === t ? 0 : 1 === t ? 1 : (t /= .5) < 1 ? .5 * Math.pow(2, 10 * (t - 1)) : .5 * (2 - Math.pow(2, -10 * --t))
                            },
                            easeInCirc: function (t) {
                                return -(Math.sqrt(1 - t * t) - 1)
                            },
                            easeOutCirc: function (t) {
                                return Math.sqrt(1 - Math.pow(t - 1, 2))
                            },
                            easeInOutCirc: function (t) {
                                return (t /= .5) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
                            },
                            easeOutBounce: function (t) {
                                return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
                            },
                            easeInBack: function (t) {
                                var e = 1.70158;
                                return t * t * ((e + 1) * t - e)
                            },
                            easeOutBack: function (t) {
                                var e = 1.70158;
                                return (t -= 1) * t * ((e + 1) * t + e) + 1
                            },
                            easeInOutBack: function (t) {
                                var e = 1.70158;
                                return (t /= .5) < 1 ? t * t * ((1 + (e *= 1.525)) * t - e) * .5 : .5 * ((t -= 2) * t * ((1 + (e *= 1.525)) * t + e) + 2)
                            },
                            elastic: function (t) {
                                return -1 * Math.pow(4, -8 * t) * Math.sin((6 * t - 1) * (2 * Math.PI) / 2) + 1
                            },
                            swingFromTo: function (t) {
                                var e = 1.70158;
                                return (t /= .5) < 1 ? t * t * ((1 + (e *= 1.525)) * t - e) * .5 : .5 * ((t -= 2) * t * ((1 + (e *= 1.525)) * t + e) + 2)
                            },
                            swingFrom: function (t) {
                                var e = 1.70158;
                                return t * t * ((e + 1) * t - e)
                            },
                            swingTo: function (t) {
                                var e = 1.70158;
                                return (t -= 1) * t * ((e + 1) * t + e) + 1
                            },
                            bounce: function (t) {
                                return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
                            },
                            bouncePast: function (t) {
                                return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 2 - (7.5625 * (t -= 1.5 / 2.75) * t + .75) : 2.5 / 2.75 > t ? 2 - (7.5625 * (t -= 2.25 / 2.75) * t + .9375) : 2 - (7.5625 * (t -= 2.625 / 2.75) * t + .984375)
                            },
                            easeFromTo: function (t) {
                                return (t /= .5) < 1 ? .5 * Math.pow(t, 4) : -.5 * ((t -= 2) * Math.pow(t, 3) - 2)
                            },
                            easeFrom: function (t) {
                                return Math.pow(t, 4)
                            },
                            easeTo: function (t) {
                                return Math.pow(t, .25)
                            }
                        }),
                        function () {
                            function t(t, e, i, n, o, s) {
                                function r(t) {
                                    return ((p * t + m) * t + f) * t
                                }

                                function a(t) {
                                    return ((g * t + v) * t + y) * t
                                }

                                function l(t) {
                                    return (3 * p * t + 2 * m) * t + f
                                }

                                function u(t) {
                                    return 1 / (200 * t)
                                }

                                function c(t, e) {
                                    return a(d(t, e))
                                }

                                function h(t) {
                                    return t >= 0 ? t : 0 - t
                                }

                                function d(t, e) {
                                    var i, n, o, s, a, u;
                                    for (o = t, u = 0; 8 > u; u++) {
                                        if (s = r(o) - t, h(s) < e) return o;
                                        if (a = l(o), h(a) < 1e-6) break;
                                        o -= s / a
                                    }
                                    if (i = 0, n = 1, o = t, i > o) return i;
                                    if (o > n) return n;
                                    for (; n > i;) {
                                        if (s = r(o), h(s - t) < e) return o;
                                        t > s ? i = o : n = o, o = .5 * (n - i) + i
                                    }
                                    return o
                                }
                                var p = 0,
                                    m = 0,
                                    f = 0,
                                    g = 0,
                                    v = 0,
                                    y = 0;
                                return f = 3 * e, m = 3 * (n - e) - f, p = 1 - f - m, y = 3 * i, v = 3 * (o - i) - y, g = 1 - y - v, c(t, u(s))
                            }

                            function e(e, i, n, o) {
                                return function (s) {
                                    return t(s, e, i, n, o, 1)
                                }
                            }
                            o.setBezierFunction = function (t, i, n, s, r) {
                                var a = e(i, n, s, r);
                                return a.displayName = t, a.x1 = i, a.y1 = n, a.x2 = s, a.y2 = r, o.prototype.formula[t] = a
                            }, o.unsetBezierFunction = function (t) {
                                delete o.prototype.formula[t]
                            }
                        }(),
                        function () {
                            function t(t, e, i, n, s, r) {
                                return o.tweenProps(n, e, t, i, 1, r, s)
                            }
                            var e = new o;
                            e._filterArgs = [], o.interpolate = function (i, n, s, r, a) {
                                var l = o.shallowCopy({}, i),
                                    u = a || 0,
                                    c = o.composeEasingObject(i, r || "linear");
                                e.set({});
                                var h = e._filterArgs;
                                h.length = 0, h[0] = l, h[1] = i, h[2] = n, h[3] = c, o.applyFilter(e, "tweenCreated"), o.applyFilter(e, "beforeTween");
                                var d = t(i, l, n, s, c, u);
                                return o.applyFilter(e, "afterTween"), d
                            }
                        }(),
                        function (t) {
                            function e(t, e) {
                                var i, n = [],
                                    o = t.length;
                                for (i = 0; o > i; i++) n.push("_" + e + "_" + i);
                                return n
                            }

                            function i(t) {
                                var e = t.match(x);
                                return e ? (1 === e.length || t[0].match(w)) && e.unshift("") : e = ["", ""], e.join(C)
                            }

                            function n(e) {
                                t.each(e, function (t) {
                                    var i = e[t];
                                    "string" == typeof i && i.match($) && (e[t] = o(i))
                                })
                            }

                            function o(t) {
                                return l($, t, s)
                            }

                            function s(t) {
                                var e = r(t);
                                return "rgb(" + e[0] + "," + e[1] + "," + e[2] + ")"
                            }

                            function r(t) {
                                return t = t.replace(/#/, ""), 3 === t.length && (t = t.split(""), t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2]), k[0] = a(t.substr(0, 2)), k[1] = a(t.substr(2, 2)), k[2] = a(t.substr(4, 2)), k
                            }

                            function a(t) {
                                return parseInt(t, 16)
                            }

                            function l(t, e, i) {
                                var n = e.match(t),
                                    o = e.replace(t, C);
                                if (n)
                                    for (var s, r = n.length, a = 0; r > a; a++) s = n.shift(), o = o.replace(C, i(s));
                                return o
                            }

                            function u(t) {
                                return l(_, t, c)
                            }

                            function c(t) {
                                for (var e = t.match(T), i = e.length, n = t.match(S)[0], o = 0; i > o; o++) n += parseInt(e[o], 10) + ",";
                                return n.slice(0, -1) + ")"
                            }

                            function h(n) {
                                var o = {};
                                return t.each(n, function (t) {
                                    var s = n[t];
                                    if ("string" == typeof s) {
                                        var r = v(s);
                                        o[t] = {
                                            formatString: i(s),
                                            chunkNames: e(r, t)
                                        }
                                    }
                                }), o
                            }

                            function d(e, i) {
                                t.each(i, function (t) {
                                    for (var n = e[t], o = v(n), s = o.length, r = 0; s > r; r++) e[i[t].chunkNames[r]] = +o[r];
                                    delete e[t]
                                })
                            }

                            function p(e, i) {
                                t.each(i, function (t) {
                                    var n = e[t],
                                        o = m(e, i[t].chunkNames),
                                        s = f(o, i[t].chunkNames);
                                    n = g(i[t].formatString, s), e[t] = u(n)
                                })
                            }

                            function m(t, e) {
                                for (var i, n = {}, o = e.length, s = 0; o > s; s++) i = e[s], n[i] = t[i], delete t[i];
                                return n
                            }

                            function f(t, e) {
                                A.length = 0;
                                for (var i = e.length, n = 0; i > n; n++) A.push(t[e[n]]);
                                return A
                            }

                            function g(t, e) {
                                for (var i = t, n = e.length, o = 0; n > o; o++) i = i.replace(C, +e[o].toFixed(4));
                                return i
                            }

                            function v(t) {
                                return t.match(T)
                            }

                            function y(e, i) {
                                t.each(i, function (t) {
                                    var n, o = i[t],
                                        s = o.chunkNames,
                                        r = s.length,
                                        a = e[t];
                                    if ("string" == typeof a) {
                                        var l = a.split(" "),
                                            u = l[l.length - 1];
                                        for (n = 0; r > n; n++) e[s[n]] = l[n] || u
                                    } else
                                        for (n = 0; r > n; n++) e[s[n]] = a;
                                    delete e[t]
                                })
                            }

                            function b(e, i) {
                                t.each(i, function (t) {
                                    var n = i[t],
                                        o = n.chunkNames,
                                        s = o.length,
                                        r = e[o[0]],
                                        a = typeof r;
                                    if ("string" === a) {
                                        for (var l = "", u = 0; s > u; u++) l += " " + e[o[u]], delete e[o[u]];
                                        e[t] = l.substr(1)
                                    } else e[t] = r
                                })
                            }
                            var w = /(\d|\-|\.)/,
                                x = /([^\-0-9\.]+)/g,
                                T = /[0-9.\-]+/g,
                                _ = new RegExp("rgb\\(" + T.source + /,\s*/.source + T.source + /,\s*/.source + T.source + "\\)", "g"),
                                S = /^.*\(/,
                                $ = /#([0-9]|[a-f]){3,6}/gi,
                                C = "VAL",
                                k = [],
                                A = [];
                            t.prototype.filter.token = {
                                tweenCreated: function (t, e, i, o) {
                                    n(t), n(e), n(i), this._tokenData = h(t)
                                },
                                beforeTween: function (t, e, i, n) {
                                    y(n, this._tokenData), d(t, this._tokenData), d(e, this._tokenData), d(i, this._tokenData)
                                },
                                afterTween: function (t, e, i, n) {
                                    p(t, this._tokenData), p(e, this._tokenData), p(i, this._tokenData), b(n, this._tokenData)
                                }
                            }
                        }(o)
                }).call(null)
            }, {}],
            2: [function (t, e, i) {
                var n = t("./shape"),
                    o = t("./utils"),
                    s = function (t, e) {
                        this._pathTemplate = "M 50,50 m 0,-{radius} a {radius},{radius} 0 1 1 0,{2radius} a {radius},{radius} 0 1 1 0,-{2radius}", this.containerAspectRatio = 1, n.apply(this, arguments)
                    };
                s.prototype = new n, s.prototype.constructor = s, s.prototype._pathString = function (t) {
                    var e = t.strokeWidth;
                    t.trailWidth && t.trailWidth > t.strokeWidth && (e = t.trailWidth);
                    var i = 50 - e / 2;
                    return o.render(this._pathTemplate, {
                        radius: i,
                        "2radius": 2 * i
                    })
                }, s.prototype._trailString = function (t) {
                    return this._pathString(t)
                }, e.exports = s
            }, {
                "./shape": 7,
                "./utils": 8
            }],
            3: [function (t, e, i) {
                var n = t("./shape"),
                    o = t("./utils"),
                    s = function (t, e) {
                        this._pathTemplate = "M 0,{center} L 100,{center}", n.apply(this, arguments)
                    };
                s.prototype = new n, s.prototype.constructor = s, s.prototype._initializeSvg = function (t, e) {
                    t.setAttribute("viewBox", "0 0 100 " + e.strokeWidth), t.setAttribute("preserveAspectRatio", "none")
                }, s.prototype._pathString = function (t) {
                    return o.render(this._pathTemplate, {
                        center: t.strokeWidth / 2
                    })
                }, s.prototype._trailString = function (t) {
                    return this._pathString(t)
                }, e.exports = s
            }, {
                "./shape": 7,
                "./utils": 8
            }],
            4: [function (t, e, i) {
                e.exports = {
                    Line: t("./line"),
                    Circle: t("./circle"),
                    SemiCircle: t("./semicircle"),
                    Path: t("./path"),
                    Shape: t("./shape"),
                    utils: t("./utils")
                }
            }, {
                "./circle": 2,
                "./line": 3,
                "./path": 5,
                "./semicircle": 6,
                "./shape": 7,
                "./utils": 8
            }],
            5: [function (t, e, i) {
                var n = t("shifty"),
                    o = t("./utils"),
                    s = {
                        easeIn: "easeInCubic",
                        easeOut: "easeOutCubic",
                        easeInOut: "easeInOutCubic"
                    },
                    r = function t(e, i) {
                        if (!(this instanceof t)) throw new Error("Constructor was called without new keyword");
                        var n;
                        i = o.extend({
                            duration: 800,
                            easing: "linear",
                            from: {},
                            to: {},
                            step: function () {}
                        }, i), n = o.isString(e) ? document.querySelector(e) : e, this.path = n, this._opts = i, this._tweenable = null;
                        var s = this.path.getTotalLength();
                        this.path.style.strokeDasharray = s + " " + s, this.set(0)
                    };
                r.prototype.value = function () {
                    var t = this._getComputedDashOffset(),
                        e = this.path.getTotalLength(),
                        i = 1 - t / e;
                    return parseFloat(i.toFixed(6), 10)
                }, r.prototype.set = function (t) {
                    this.stop(), this.path.style.strokeDashoffset = this._progressToOffset(t);
                    var e = this._opts.step;
                    if (o.isFunction(e)) {
                        var i = this._easing(this._opts.easing),
                            n = this._calculateTo(t, i),
                            s = this._opts.shape || this;
                        e(n, s, this._opts.attachment)
                    }
                }, r.prototype.stop = function () {
                    this._stopTween(), this.path.style.strokeDashoffset = this._getComputedDashOffset()
                }, r.prototype.animate = function (t, e, i) {
                    e = e || {}, o.isFunction(e) && (i = e, e = {});
                    var s = o.extend({}, e),
                        r = o.extend({}, this._opts);
                    e = o.extend(r, e);
                    var a = this._easing(e.easing),
                        l = this._resolveFromAndTo(t, a, s);
                    this.stop(), this.path.getBoundingClientRect();
                    var u = this._getComputedDashOffset(),
                        c = this._progressToOffset(t),
                        h = this;
                    this._tweenable = new n, this._tweenable.tween({
                        from: o.extend({
                            offset: u
                        }, l.from),
                        to: o.extend({
                            offset: c
                        }, l.to),
                        duration: e.duration,
                        easing: a,
                        step: function (t) {
                            h.path.style.strokeDashoffset = t.offset;
                            var i = e.shape || h;
                            e.step(t, i, e.attachment)
                        },
                        finish: function (t) {
                            o.isFunction(i) && i()
                        }
                    })
                }, r.prototype._getComputedDashOffset = function () {
                    var t = window.getComputedStyle(this.path, null);
                    return parseFloat(t.getPropertyValue("stroke-dashoffset"), 10)
                }, r.prototype._progressToOffset = function (t) {
                    var e = this.path.getTotalLength();
                    return e - t * e
                }, r.prototype._resolveFromAndTo = function (t, e, i) {
                    return i.from && i.to ? {
                        from: i.from,
                        to: i.to
                    } : {
                        from: this._calculateFrom(e),
                        to: this._calculateTo(t, e)
                    }
                }, r.prototype._calculateFrom = function (t) {
                    return n.interpolate(this._opts.from, this._opts.to, this.value(), t)
                }, r.prototype._calculateTo = function (t, e) {
                    return n.interpolate(this._opts.from, this._opts.to, t, e)
                }, r.prototype._stopTween = function () {
                    null !== this._tweenable && (this._tweenable.stop(), this._tweenable = null)
                }, r.prototype._easing = function (t) {
                    return s.hasOwnProperty(t) ? s[t] : t
                }, e.exports = r
            }, {
                "./utils": 8,
                shifty: 1
            }],
            6: [function (t, e, i) {
                var n = t("./shape"),
                    o = t("./circle"),
                    s = t("./utils"),
                    r = function (t, e) {
                        this._pathTemplate = "M 50,50 m -{radius},0 a {radius},{radius} 0 1 1 {2radius},0", this.containerAspectRatio = 2, n.apply(this, arguments)
                    };
                r.prototype = new n, r.prototype.constructor = r, r.prototype._initializeSvg = function (t, e) {
                    t.setAttribute("viewBox", "0 0 100 50")
                }, r.prototype._initializeTextContainer = function (t, e, i) {
                    t.text.style && (i.style.top = "auto", i.style.bottom = "0", t.text.alignToBottom ? s.setStyle(i, "transform", "translate(-50%, 0)") : s.setStyle(i, "transform", "translate(-50%, 50%)"))
                }, r.prototype._pathString = o.prototype._pathString, r.prototype._trailString = o.prototype._trailString, e.exports = r
            }, {
                "./circle": 2,
                "./shape": 7,
                "./utils": 8
            }],
            7: [function (t, e, i) {
                var n = t("./path"),
                    o = t("./utils"),
                    s = "Object is destroyed",
                    r = function t(e, i) {
                        if (!(this instanceof t)) throw new Error("Constructor was called without new keyword");
                        if (0 !== arguments.length) {
                            this._opts = o.extend({
                                color: "#555",
                                strokeWidth: 1,
                                trailColor: null,
                                trailWidth: null,
                                fill: null,
                                text: {
                                    style: {
                                        color: null,
                                        position: "absolute",
                                        left: "50%",
                                        top: "50%",
                                        padding: 0,
                                        margin: 0,
                                        transform: {
                                            prefix: !0,
                                            value: "translate(-50%, -50%)"
                                        }
                                    },
                                    autoStyleContainer: !0,
                                    alignToBottom: !0,
                                    value: null,
                                    className: "progressbar-text"
                                },
                                svgStyle: {
                                    display: "block",
                                    width: "100%"
                                },
                                warnings: !1
                            }, i, !0), o.isObject(i) && void 0 !== i.svgStyle && (this._opts.svgStyle = i.svgStyle), o.isObject(i) && o.isObject(i.text) && void 0 !== i.text.style && (this._opts.text.style = i.text.style);
                            var s, r = this._createSvgView(this._opts);
                            if (s = o.isString(e) ? document.querySelector(e) : e, !s) throw new Error("Container does not exist: " + e);
                            this._container = s, this._container.appendChild(r.svg), this._opts.warnings && this._warnContainerAspectRatio(this._container), this._opts.svgStyle && o.setStyles(r.svg, this._opts.svgStyle), this.svg = r.svg, this.path = r.path, this.trail = r.trail, this.text = null;
                            var a = o.extend({
                                attachment: void 0,
                                shape: this
                            }, this._opts);
                            this._progressPath = new n(r.path, a), o.isObject(this._opts.text) && null !== this._opts.text.value && this.setText(this._opts.text.value)
                        }
                    };
                r.prototype.animate = function (t, e, i) {
                    if (null === this._progressPath) throw new Error(s);
                    this._progressPath.animate(t, e, i)
                }, r.prototype.stop = function () {
                    if (null === this._progressPath) throw new Error(s);
                    void 0 !== this._progressPath && this._progressPath.stop()
                }, r.prototype.destroy = function () {
                    if (null === this._progressPath) throw new Error(s);
                    this.stop(), this.svg.parentNode.removeChild(this.svg), this.svg = null, this.path = null, this.trail = null, this._progressPath = null, null !== this.text && (this.text.parentNode.removeChild(this.text), this.text = null)
                }, r.prototype.set = function (t) {
                    if (null === this._progressPath) throw new Error(s);
                    this._progressPath.set(t)
                }, r.prototype.value = function () {
                    if (null === this._progressPath) throw new Error(s);
                    return void 0 === this._progressPath ? 0 : this._progressPath.value()
                }, r.prototype.setText = function (t) {
                    if (null === this._progressPath) throw new Error(s);
                    null === this.text && (this.text = this._createTextContainer(this._opts, this._container), this._container.appendChild(this.text)), o.isObject(t) ? (o.removeChildren(this.text), this.text.appendChild(t)) : this.text.innerHTML = t
                }, r.prototype._createSvgView = function (t) {
                    var e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    this._initializeSvg(e, t);
                    var i = null;
                    (t.trailColor || t.trailWidth) && (i = this._createTrail(t), e.appendChild(i));
                    var n = this._createPath(t);
                    return e.appendChild(n), {
                        svg: e,
                        path: n,
                        trail: i
                    }
                }, r.prototype._initializeSvg = function (t, e) {
                    t.setAttribute("viewBox", "0 0 100 100")
                }, r.prototype._createPath = function (t) {
                    var e = this._pathString(t);
                    return this._createPathElement(e, t)
                }, r.prototype._createTrail = function (t) {
                    var e = this._trailString(t),
                        i = o.extend({}, t);
                    return i.trailColor || (i.trailColor = "#eee"), i.trailWidth || (i.trailWidth = i.strokeWidth), i.color = i.trailColor, i.strokeWidth = i.trailWidth, i.fill = null, this._createPathElement(e, i)
                }, r.prototype._createPathElement = function (t, e) {
                    var i = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    return i.setAttribute("d", t), i.setAttribute("stroke", e.color), i.setAttribute("stroke-width", e.strokeWidth), e.fill ? i.setAttribute("fill", e.fill) : i.setAttribute("fill-opacity", "0"), i
                }, r.prototype._createTextContainer = function (t, e) {
                    var i = document.createElement("div");
                    i.className = t.text.className;
                    var n = t.text.style;
                    return n && (t.text.autoStyleContainer && (e.style.position = "relative"), o.setStyles(i, n), n.color || (i.style.color = t.color)), this._initializeTextContainer(t, e, i), i
                }, r.prototype._initializeTextContainer = function (t, e, i) {}, r.prototype._pathString = function (t) {
                    throw new Error("Override this function for each progress bar")
                }, r.prototype._trailString = function (t) {
                    throw new Error("Override this function for each progress bar")
                }, r.prototype._warnContainerAspectRatio = function (t) {
                    if (this.containerAspectRatio) {
                        var e = window.getComputedStyle(t, null),
                            i = parseFloat(e.getPropertyValue("width"), 10),
                            n = parseFloat(e.getPropertyValue("height"), 10);
                        o.floatEquals(this.containerAspectRatio, i / n) || (console.warn("Incorrect aspect ratio of container", "#" + t.id, "detected:", e.getPropertyValue("width") + "(width)", "/", e.getPropertyValue("height") + "(height)", "=", i / n), console.warn("Aspect ratio of should be", this.containerAspectRatio))
                    }
                }, e.exports = r
            }, {
                "./path": 5,
                "./utils": 8
            }],
            8: [function (t, e, i) {
                function n(t, e, i) {
                    for (var o in t = t || {}, e = e || {}, i = i || !1, e)
                        if (e.hasOwnProperty(o)) {
                            var s = t[o],
                                r = e[o];
                            i && h(s) && h(r) ? t[o] = n(s, r, i) : t[o] = r
                        } return t
                }

                function o(t, e) {
                    var i = t;
                    for (var n in e)
                        if (e.hasOwnProperty(n)) {
                            var o = e[n],
                                s = "\\{" + n + "\\}",
                                r = new RegExp(s, "g");
                            i = i.replace(r, o)
                        } return i
                }

                function s(t, e, i) {
                    for (var n = t.style, o = 0; o < f.length; ++o) {
                        var s = f[o];
                        n[s + a(e)] = i
                    }
                    n[e] = i
                }

                function r(t, e) {
                    d(e, function (e, i) {
                        null != e && (h(e) && !0 === e.prefix ? s(t, i, e.value) : t.style[i] = e)
                    })
                }

                function a(t) {
                    return t.charAt(0).toUpperCase() + t.slice(1)
                }

                function l(t) {
                    return "string" == typeof t || t instanceof String
                }

                function u(t) {
                    return "function" == typeof t
                }

                function c(t) {
                    return "[object Array]" === Object.prototype.toString.call(t)
                }

                function h(t) {
                    if (c(t)) return !1;
                    var e = typeof t;
                    return "object" === e && !!t
                }

                function d(t, e) {
                    for (var i in t)
                        if (t.hasOwnProperty(i)) {
                            var n = t[i];
                            e(n, i)
                        }
                }

                function p(t, e) {
                    return Math.abs(t - e) < g
                }

                function m(t) {
                    for (; t.firstChild;) t.removeChild(t.firstChild)
                }
                var f = "Webkit Moz O ms".split(" "),
                    g = .001;
                e.exports = {
                    extend: n,
                    render: o,
                    setStyle: s,
                    setStyles: r,
                    capitalize: a,
                    isString: l,
                    isFunction: u,
                    isObject: h,
                    forEachObject: d,
                    floatEquals: p,
                    removeChildren: m
                }
            }, {}]
        }, {}, [4])(4)
    }),
    function () {
        "use strict";

        function t(n) {
            if (!n) throw new Error("No options passed to Waypoint constructor");
            if (!n.element) throw new Error("No element option passed to Waypoint constructor");
            if (!n.handler) throw new Error("No handler option passed to Waypoint constructor");
            this.key = "waypoint-" + e, this.options = t.Adapter.extend({}, t.defaults, n), this.element = this.options.element, this.adapter = new t.Adapter(this.element), this.callback = n.handler, this.axis = this.options.horizontal ? "horizontal" : "vertical", this.enabled = this.options.enabled, this.triggerPoint = null, this.group = t.Group.findOrCreate({
                name: this.options.group,
                axis: this.axis
            }), this.context = t.Context.findOrCreateByElement(this.options.context), t.offsetAliases[this.options.offset] && (this.options.offset = t.offsetAliases[this.options.offset]), this.group.add(this), this.context.add(this), i[this.key] = this, e += 1
        }
        var e = 0,
            i = {};
        t.prototype.queueTrigger = function (t) {
            this.group.queueTrigger(this, t)
        }, t.prototype.trigger = function (t) {
            this.enabled && this.callback && this.callback.apply(this, t)
        }, t.prototype.destroy = function () {
            this.context.remove(this), this.group.remove(this), delete i[this.key]
        }, t.prototype.disable = function () {
            return this.enabled = !1, this
        }, t.prototype.enable = function () {
            return this.context.refresh(), this.enabled = !0, this
        }, t.prototype.next = function () {
            return this.group.next(this)
        }, t.prototype.previous = function () {
            return this.group.previous(this)
        }, t.invokeAll = function (t) {
            var e = [];
            for (var n in i) e.push(i[n]);
            for (var o = 0, s = e.length; s > o; o++) e[o][t]()
        }, t.destroyAll = function () {
            t.invokeAll("destroy")
        }, t.disableAll = function () {
            t.invokeAll("disable")
        }, t.enableAll = function () {
            for (var e in t.Context.refreshAll(), i) i[e].enabled = !0;
            return this
        }, t.refreshAll = function () {
            t.Context.refreshAll()
        }, t.viewportHeight = function () {
            return window.innerHeight || document.documentElement.clientHeight
        }, t.viewportWidth = function () {
            return document.documentElement.clientWidth
        }, t.adapters = [], t.defaults = {
            context: window,
            continuous: !0,
            enabled: !0,
            group: "default",
            horizontal: !1,
            offset: 0
        }, t.offsetAliases = {
            "bottom-in-view": function () {
                return this.context.innerHeight() - this.adapter.outerHeight()
            },
            "right-in-view": function () {
                return this.context.innerWidth() - this.adapter.outerWidth()
            }
        }, window.Waypoint = t
    }(),
    function () {
        "use strict";

        function t(t) {
            window.setTimeout(t, 1e3 / 60)
        }

        function e(t) {
            this.element = t, this.Adapter = o.Adapter, this.adapter = new this.Adapter(t), this.key = "waypoint-context-" + i, this.didScroll = !1, this.didResize = !1, this.oldScroll = {
                x: this.adapter.scrollLeft(),
                y: this.adapter.scrollTop()
            }, this.waypoints = {
                vertical: {},
                horizontal: {}
            }, t.waypointContextKey = this.key, n[t.waypointContextKey] = this, i += 1, o.windowContext || (o.windowContext = !0, o.windowContext = new e(window)), this.createThrottledScrollHandler(), this.createThrottledResizeHandler()
        }
        var i = 0,
            n = {},
            o = window.Waypoint,
            s = window.onload;
        e.prototype.add = function (t) {
            var e = t.options.horizontal ? "horizontal" : "vertical";
            this.waypoints[e][t.key] = t, this.refresh()
        }, e.prototype.checkEmpty = function () {
            var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
                e = this.Adapter.isEmptyObject(this.waypoints.vertical),
                i = this.element == this.element.window;
            t && e && !i && (this.adapter.off(".waypoints"), delete n[this.key])
        }, e.prototype.createThrottledResizeHandler = function () {
            function t() {
                e.handleResize(), e.didResize = !1
            }
            var e = this;
            this.adapter.on("resize.waypoints", function () {
                e.didResize || (e.didResize = !0, o.requestAnimationFrame(t))
            })
        }, e.prototype.createThrottledScrollHandler = function () {
            function t() {
                e.handleScroll(), e.didScroll = !1
            }
            var e = this;
            this.adapter.on("scroll.waypoints", function () {
                (!e.didScroll || o.isTouch) && (e.didScroll = !0, o.requestAnimationFrame(t))
            })
        }, e.prototype.handleResize = function () {
            o.Context.refreshAll()
        }, e.prototype.handleScroll = function () {
            var t = {},
                e = {
                    horizontal: {
                        newScroll: this.adapter.scrollLeft(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left"
                    },
                    vertical: {
                        newScroll: this.adapter.scrollTop(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up"
                    }
                };
            for (var i in e) {
                var n = e[i],
                    o = n.newScroll > n.oldScroll,
                    s = o ? n.forward : n.backward;
                for (var r in this.waypoints[i]) {
                    var a = this.waypoints[i][r];
                    if (null !== a.triggerPoint) {
                        var l = n.oldScroll < a.triggerPoint,
                            u = n.newScroll >= a.triggerPoint,
                            c = l && u,
                            h = !l && !u;
                        (c || h) && (a.queueTrigger(s), t[a.group.id] = a.group)
                    }
                }
            }
            for (var d in t) t[d].flushTriggers();
            this.oldScroll = {
                x: e.horizontal.newScroll,
                y: e.vertical.newScroll
            }
        }, e.prototype.innerHeight = function () {
            return this.element == this.element.window ? o.viewportHeight() : this.adapter.innerHeight()
        }, e.prototype.remove = function (t) {
            delete this.waypoints[t.axis][t.key], this.checkEmpty()
        }, e.prototype.innerWidth = function () {
            return this.element == this.element.window ? o.viewportWidth() : this.adapter.innerWidth()
        }, e.prototype.destroy = function () {
            var t = [];
            for (var e in this.waypoints)
                for (var i in this.waypoints[e]) t.push(this.waypoints[e][i]);
            for (var n = 0, o = t.length; o > n; n++) t[n].destroy()
        }, e.prototype.refresh = function () {
            var t, e = this.element == this.element.window,
                i = e ? void 0 : this.adapter.offset(),
                n = {};
            for (var s in this.handleScroll(), t = {
                    horizontal: {
                        contextOffset: e ? 0 : i.left,
                        contextScroll: e ? 0 : this.oldScroll.x,
                        contextDimension: this.innerWidth(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left",
                        offsetProp: "left"
                    },
                    vertical: {
                        contextOffset: e ? 0 : i.top,
                        contextScroll: e ? 0 : this.oldScroll.y,
                        contextDimension: this.innerHeight(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up",
                        offsetProp: "top"
                    }
                }, t) {
                var r = t[s];
                for (var a in this.waypoints[s]) {
                    var l, u, c, h, d, p = this.waypoints[s][a],
                        m = p.options.offset,
                        f = p.triggerPoint,
                        g = 0,
                        v = null == f;
                    p.element !== p.element.window && (g = p.adapter.offset()[r.offsetProp]), "function" == typeof m ? m = m.apply(p) : "string" == typeof m && (m = parseFloat(m), p.options.offset.indexOf("%") > -1 && (m = Math.ceil(r.contextDimension * m / 100))), l = r.contextScroll - r.contextOffset, p.triggerPoint = Math.floor(g + l - m), u = f < r.oldScroll, c = p.triggerPoint >= r.oldScroll, h = u && c, d = !u && !c, !v && h ? (p.queueTrigger(r.backward), n[p.group.id] = p.group) : !v && d ? (p.queueTrigger(r.forward), n[p.group.id] = p.group) : v && r.oldScroll >= p.triggerPoint && (p.queueTrigger(r.forward), n[p.group.id] = p.group)
                }
            }
            return o.requestAnimationFrame(function () {
                for (var t in n) n[t].flushTriggers()
            }), this
        }, e.findOrCreateByElement = function (t) {
            return e.findByElement(t) || new e(t)
        }, e.refreshAll = function () {
            for (var t in n) n[t].refresh()
        }, e.findByElement = function (t) {
            return n[t.waypointContextKey]
        }, window.onload = function () {
            s && s(), e.refreshAll()
        }, o.requestAnimationFrame = function (e) {
            var i = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || t;
            i.call(window, e)
        }, o.Context = e
    }(),
    function () {
        "use strict";

        function t(t, e) {
            return t.triggerPoint - e.triggerPoint
        }

        function e(t, e) {
            return e.triggerPoint - t.triggerPoint
        }

        function i(t) {
            this.name = t.name, this.axis = t.axis, this.id = this.name + "-" + this.axis, this.waypoints = [], this.clearTriggerQueues(), n[this.axis][this.name] = this
        }
        var n = {
                vertical: {},
                horizontal: {}
            },
            o = window.Waypoint;
        i.prototype.add = function (t) {
            this.waypoints.push(t)
        }, i.prototype.clearTriggerQueues = function () {
            this.triggerQueues = {
                up: [],
                down: [],
                left: [],
                right: []
            }
        }, i.prototype.flushTriggers = function () {
            for (var i in this.triggerQueues) {
                var n = this.triggerQueues[i],
                    o = "up" === i || "left" === i;
                n.sort(o ? e : t);
                for (var s = 0, r = n.length; r > s; s += 1) {
                    var a = n[s];
                    (a.options.continuous || s === n.length - 1) && a.trigger([i])
                }
            }
            this.clearTriggerQueues()
        }, i.prototype.next = function (e) {
            this.waypoints.sort(t);
            var i = o.Adapter.inArray(e, this.waypoints),
                n = i === this.waypoints.length - 1;
            return n ? null : this.waypoints[i + 1]
        }, i.prototype.previous = function (e) {
            this.waypoints.sort(t);
            var i = o.Adapter.inArray(e, this.waypoints);
            return i ? this.waypoints[i - 1] : null
        }, i.prototype.queueTrigger = function (t, e) {
            this.triggerQueues[e].push(t)
        }, i.prototype.remove = function (t) {
            var e = o.Adapter.inArray(t, this.waypoints);
            e > -1 && this.waypoints.splice(e, 1)
        }, i.prototype.first = function () {
            return this.waypoints[0]
        }, i.prototype.last = function () {
            return this.waypoints[this.waypoints.length - 1]
        }, i.findOrCreate = function (t) {
            return n[t.axis][t.name] || new i(t)
        }, o.Group = i
    }(),
    function () {
        "use strict";

        function t(t) {
            this.$element = e(t)
        }
        var e = window.jQuery,
            i = window.Waypoint;
        e.each(["innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop"], function (e, i) {
            t.prototype[i] = function () {
                var t = Array.prototype.slice.call(arguments);
                return this.$element[i].apply(this.$element, t)
            }
        }), e.each(["extend", "inArray", "isEmptyObject"], function (i, n) {
            t[n] = e[n]
        }), i.adapters.push({
            name: "jquery",
            Adapter: t
        }), i.Adapter = t
    }(),
    function () {
        "use strict";

        function t(t) {
            return function () {
                var i = [],
                    n = arguments[0];
                return t.isFunction(arguments[0]) && (n = t.extend({}, arguments[1]), n.handler = arguments[0]), this.each(function () {
                    var o = t.extend({}, n, {
                        element: this
                    });
                    "string" == typeof o.context && (o.context = t(this).closest(o.context)[0]), i.push(new e(o))
                }), i
            }
        }
        var e = window.Waypoint;
        window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)), window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto))
    }(),
    function (t, e) {
        "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.counterUp = e() : t.counterUp = e()
    }(window, function () {
        return function (t) {
            function e(n) {
                if (i[n]) return i[n].exports;
                var o = i[n] = {
                    i: n,
                    l: !1,
                    exports: {}
                };
                return t[n].call(o.exports, o, o.exports, e), o.l = !0, o.exports
            }
            var i = {};
            return e.m = t, e.c = i, e.d = function (t, i, n) {
                e.o(t, i) || Object.defineProperty(t, i, {
                    enumerable: !0,
                    get: n
                })
            }, e.r = function (t) {
                "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
                    value: "Module"
                }), Object.defineProperty(t, "__esModule", {
                    value: !0
                })
            }, e.t = function (t, i) {
                if (1 & i && (t = e(t)), 8 & i) return t;
                if (4 & i && "object" == typeof t && t && t.__esModule) return t;
                var n = Object.create(null);
                if (e.r(n), Object.defineProperty(n, "default", {
                        enumerable: !0,
                        value: t
                    }), 2 & i && "string" != typeof t)
                    for (var o in t) e.d(n, o, function (e) {
                        return t[e]
                    }.bind(null, o));
                return n
            }, e.n = function (t) {
                var i = t && t.__esModule ? function () {
                    return t.default
                } : function () {
                    return t
                };
                return e.d(i, "a", i), i
            }, e.o = function (t, e) {
                return Object.prototype.hasOwnProperty.call(t, e)
            }, e.p = "", e(e.s = 0)
        }([function (t, e, i) {
            "use strict";
            i.r(e), i.d(e, "divideNumbers", function () {
                return o
            }), i.d(e, "hasComma", function () {
                return s
            }), i.d(e, "isFloat", function () {
                return r
            }), i.d(e, "decimalPlaces", function () {
                return a
            }), e.default = function (t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                    i = e.action,
                    s = void 0 === i ? "start" : i,
                    r = e.duration,
                    a = void 0 === r ? 1e3 : r,
                    l = e.delay,
                    u = void 0 === l ? 16 : l,
                    c = e.lang,
                    h = void 0 === c ? void 0 : c;
                if ("stop" !== s) {
                    if (n(t), /[0-9]/.test(t.innerHTML)) {
                        var d = o(t.innerHTML, {
                            duration: a || t.getAttribute("data-duration"),
                            lang: h || document.querySelector("html").getAttribute("lang") || void 0,
                            delay: u || t.getAttribute("data-delay")
                        });
                        t._countUpOrigInnerHTML = t.innerHTML, t.innerHTML = d[0], t.style.visibility = "visible", t.countUpTimeout = setTimeout(function e() {
                            t.innerHTML = d.shift(), d.length ? (clearTimeout(t.countUpTimeout), t.countUpTimeout = setTimeout(e, u)) : t._countUpOrigInnerHTML = void 0
                        }, u)
                    }
                } else n(t)
            };
            var n = function (t) {
                    clearTimeout(t.countUpTimeout), t._countUpOrigInnerHTML && (t.innerHTML = t._countUpOrigInnerHTML, t._countUpOrigInnerHTML = void 0), t.style.visibility = ""
                },
                o = function (t) {
                    for (var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, i = e.duration, n = void 0 === i ? 1e3 : i, o = e.delay, s = void 0 === o ? 16 : o, r = e.lang, a = void 0 === r ? void 0 : r, l = n / s, u = t.toString().split(/(<[^>]+>|[0-9.][,.0-9]*[0-9]*)/), c = [], h = 0; h < l; h++) c.push("");
                    for (var d = 0; d < u.length; d++)
                        if (/([0-9.][,.0-9]*[0-9]*)/.test(u[d]) && !/<[^>]+>/.test(u[d])) {
                            var p = u[d],
                                m = /[0-9]+,[0-9]+/.test(p);
                            p = p.replace(/,/g, "");
                            for (var f = /^[0-9]+\.[0-9]+$/.test(p), g = f ? (p.split(".")[1] || []).length : 0, v = c.length - 1, y = l; y >= 1; y--) {
                                var b = parseInt(p / l * y, 10);
                                f && (b = parseFloat(p / l * y).toFixed(g), b = parseFloat(b).toLocaleString(a)), m && (b = b.toLocaleString(a)), c[v--] += b
                            }
                        } else
                            for (var w = 0; w < l; w++) c[w] += u[d];
                    return c[c.length] = t.toString(), c
                },
                s = function (t) {
                    return /[0-9]+,[0-9]+/.test(t)
                },
                r = function (t) {
                    return /^[0-9]+\.[0-9]+$/.test(t)
                },
                a = function (t) {
                    return r(t) ? (t.split(".")[1] || []).length : 0
                }
        }])
    }),
    function (t, e, i, n) {
        "use strict";

        function o(e, i) {
            function n() {
                o.options.originalVideoW = o.options.$video[0].videoWidth, o.options.originalVideoH = o.options.$video[0].videoHeight, o.initialised || o.init()
            }
            var o = this;
            this.element = e, this.options = t.extend({}, r, i), this._defaults = r, this._name = s, this.options.$video = t(e), this.detectBrowser(), this.shimRequestAnimationFrame(), this.options.has3d = this.detect3d(), this.options.$videoWrap.css({
                position: "relative",
                overflow: "hidden",
                "z-index": "10"
            }), this.options.$video.css({
                position: "absolute",
                "z-index": "1"
            }), this.options.$video.on("canplay canplaythrough", n), this.options.$video[0].readyState > 3 && n()
        }
        var s = "backgroundVideo",
            r = {
                $videoWrap: t(".video-wrapper-inner"),
                $outerWrap: t(e),
                $window: t(e),
                minimumVideoWidth: 400,
                preventContextMenu: !1,
                parallax: !0,
                parallaxOptions: {
                    effect: 1.5
                },
                pauseVideoOnViewLoss: !1
            };
        o.prototype = {
            init: function () {
                var t = this;
                this.initialised = !0, this.lastPosition = -1, this.ticking = !1, this.options.$window.resize(function () {
                    t.positionObject()
                }), this.options.parallax && this.options.$window.on("scroll", function () {
                    t.update()
                }), this.options.pauseVideoOnViewLoss && this.playPauseVideo(), this.options.preventContextMenu && this.options.$video.on("contextmenu", function () {
                    return !1
                }), this.options.$window.trigger("resize")
            },
            requestTick: function () {
                var t = this;
                this.ticking || (e.requestAnimationFrame(t.positionObject.bind(t)), this.ticking = !0)
            },
            update: function () {
                this.lastPosition = e.pageYOffset, this.requestTick()
            },
            detect3d: function () {
                var t, o, s = i.createElement("p"),
                    r = {
                        WebkitTransform: "-webkit-transform",
                        OTransform: "-o-transform",
                        MSTransform: "-ms-transform",
                        MozTransform: "-moz-transform",
                        transform: "transform"
                    };
                for (t in i.body.insertBefore(s, i.body.lastChild), r) s.style[t] !== n && (s.style[t] = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)", o = e.getComputedStyle(s).getPropertyValue(r[t]));
                return s.parentNode.removeChild(s), o !== n && "none" !== o
            },
            detectBrowser: function () {
                var t = navigator.userAgent.toLowerCase();
                t.indexOf("chrome") > -1 || t.indexOf("safari") > -1 ? (this.options.browser = "webkit", this.options.browserPrexix = "-webkit-") : t.indexOf("firefox") > -1 ? (this.options.browser = "firefox", this.options.browserPrexix = "-moz-") : -1 !== t.indexOf("MSIE") || t.indexOf("Trident/") > 0 ? (this.options.browser = "ie", this.options.browserPrexix = "-ms-") : t.indexOf("Opera") > -1 && (this.options.browser = "opera", this.options.browserPrexix = "-o-")
            },
            scaleObject: function () {
                var t, e, i;
                return this.options.$videoWrap.width(this.options.$outerWrap.width()), this.options.$videoWrap.height(this.options.$outerWrap.height()), t = this.options.$window.width() / this.options.originalVideoW, e = this.options.$window.height() / this.options.originalVideoH, i = t > e ? t : e, i * this.options.originalVideoW < this.options.minimumVideoWidth && (i = this.options.minimumVideoWidth / this.options.originalVideoW), this.options.$video.width(i * this.options.originalVideoW), this.options.$video.height(i * this.options.originalVideoH), {
                    xPos: -parseInt(this.options.$video.width() - this.options.$window.width()) / 2,
                    yPos: parseInt(this.options.$video.height() - this.options.$window.height()) / 2
                }
            },
            positionObject: function () {
                var t = this,
                    i = e.pageYOffset,
                    n = this.scaleObject(this.options.$video, t.options.$videoWrap),
                    o = n.xPos,
                    s = n.yPos;
                s = this.options.parallax ? i >= 0 ? this.calculateYPos(s, i) : this.calculateYPos(s, 0) : -s, t.options.has3d ? (this.options.$video.css(t.options.browserPrexix + "transform3d", "translate3d(-" + o + "px, " + s + "px, 0)"), this.options.$video.css("transform", "translate3d(" + o + "px, " + s + "px, 0)")) : (this.options.$video.css(t.options.browserPrexix + "transform", "translate(-" + o + "px, " + s + "px)"), this.options.$video.css("transform", "translate(" + o + "px, " + s + "px)")), this.ticking = !1
            },
            calculateYPos: function (t, e) {
                var i, n;
                return i = parseInt(this.options.$videoWrap.offset().top), n = i - e, -(n / this.options.parallaxOptions.effect + t)
            },
            disableParallax: function () {
                this.options.$window.unbind(".backgroundVideoParallax")
            },
            playPauseVideo: function () {
                var t = this;
                this.options.$window.on("scroll.backgroundVideoPlayPause", function () {
                    t.options.$window.scrollTop() < t.options.$videoWrap.height() ? t.options.$video.get(0).play() : t.options.$video.get(0).pause()
                })
            },
            shimRequestAnimationFrame: function () {
                for (var t = 0, i = ["ms", "moz", "webkit", "o"], n = 0; n < i.length && !e.requestAnimationFrame; ++n) e.requestAnimationFrame = e[i[n] + "RequestAnimationFrame"], e.cancelAnimationFrame = e[i[n] + "CancelAnimationFrame"] || e[i[n] + "CancelRequestAnimationFrame"];
                e.requestAnimationFrame || (e.requestAnimationFrame = function (i) {
                    var n = (new Date).getTime(),
                        o = Math.max(0, 16 - (n - t)),
                        s = e.setTimeout(function () {
                            i(n + o)
                        }, o);
                    return t = n + o, s
                }), e.cancelAnimationFrame || (e.cancelAnimationFrame = function (t) {
                    clearTimeout(t)
                })
            }
        }, t.fn[s] = function (e) {
            return this.each(function () {
                t.data(this, "plugin_" + s) || t.data(this, "plugin_" + s, new o(this, e))
            })
        }
    }(jQuery, window, document);
var Typer = function (t) {
    console.log("constructor called"), this.element = t;
    var e = t.dataset.delim || ",",
        i = t.dataset.words || "override these,sample typing";
    this.words = i.split(e).filter(function (t) {
        return t
    }), this.delay = t.dataset.delay || 200, this.deleteDelay = t.dataset.deleteDelay || 800, this.progress = {
        word: 0,
        char: 0,
        building: !0,
        atWordEnd: !1
    }, this.typing = !0;
    var n = t.dataset.colors || "";
    this.colors = n.split(","), this.element.style.color = this.colors[0], this.colorIndex = 0, this.doTyping()
};
Typer.prototype.start = function () {
    this.typing || (this.typing = !0, this.doTyping())
}, Typer.prototype.stop = function () {
    this.typing = !1
}, Typer.prototype.doTyping = function () {
    var t = this.element,
        e = this.progress,
        i = e.word,
        n = e.char,
        o = this.words[i][n];
    if (e.atWordEnd = !1, this.cursor) {
        this.cursor.element.style.opacity = "1", this.cursor.on = !0, clearInterval(this.cursor.interval);
        var s = this.cursor;
        this.cursor.interval = setInterval(function () {
            s.updateBlinkState()
        }, 400)
    }
    e.building ? (t.innerHTML += o, e.char += 1, e.char == this.words[i].length && (e.building = !1, e.atWordEnd = !0)) : (t.innerHTML = t.innerHTML.slice(0, -1), this.element.innerHTML || (e.building = !0, e.word = (e.word + 1) % this.words.length, e.char = 0, this.colorIndex = (this.colorIndex + 1) % this.colors.length, this.element.style.color = this.colors[this.colorIndex]));
    var r = this;
    setTimeout(function () {
        r.typing && r.doTyping()
    }, e.atWordEnd ? this.deleteDelay : this.delay)
};
var Cursor = function (t) {
    this.element = t, this.cursorDisplay = t.dataset.cursorDisplay || "|", this.owner = typers[t.dataset.owner] || "", t.innerHTML = this.cursorDisplay, this.on = !0, t.style.transition = "all 0.1s";
    var e = this;
    this.interval = setInterval(function () {
        e.updateBlinkState()
    }, 400)
};
Cursor.prototype.updateBlinkState = function () {
        this.on ? (this.element.style.opacity = "0", this.on = !1) : (this.element.style.opacity = "1", this.on = !0)
    }, TyperSetup(),
    function (t, e) {
        "function" == typeof define && define.amd ? define([], e) : "object" == typeof module && module.exports ? module.exports = e() : t.Rellax = e()
    }("undefined" != typeof window ? window : global, function () {
        var t = function (e, i) {
            function n() {
                if (3 === o.options.breakpoints.length && Array.isArray(o.options.breakpoints)) {
                    var t, e = !0,
                        i = !0;
                    if (o.options.breakpoints.forEach(function (n) {
                            "number" != typeof n && (i = !1), null !== t && n < t && (e = !1), t = n
                        }), e && i) return
                }
                o.options.breakpoints = [576, 768, 1201], console.warn("Rellax: You must pass an array of 3 numbers in ascending order to the breakpoints option. Defaults reverted")
            }
            var o = Object.create(t.prototype),
                s = 0,
                r = 0,
                a = 0,
                l = 0,
                u = [],
                c = !0,
                h = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (t) {
                    return setTimeout(t, 1e3 / 60)
                },
                d = null,
                p = !1;
            try {
                var m = Object.defineProperty({}, "passive", {
                    get: function () {
                        p = !0
                    }
                });
                window.addEventListener("testPassive", null, m), window.removeEventListener("testPassive", null, m)
            } catch (t) {}
            var f = window.cancelAnimationFrame || window.mozCancelAnimationFrame || clearTimeout,
                g = window.transformProp || function () {
                    var t = document.createElement("div");
                    if (null === t.style.transform) {
                        var e, i = ["Webkit", "Moz", "ms"];
                        for (e in i)
                            if (void 0 !== t.style[i[e] + "Transform"]) return i[e] + "Transform"
                    }
                    return "transform"
                }();
            if (o.options = {
                    speed: -2,
                    verticalSpeed: null,
                    horizontalSpeed: null,
                    breakpoints: [576, 768, 1201],
                    center: !1,
                    wrapper: null,
                    relativeToWrapper: !1,
                    round: !0,
                    vertical: !0,
                    horizontal: !1,
                    verticalScrollAxis: "y",
                    horizontalScrollAxis: "x",
                    callback: function () {}
                }, i && Object.keys(i).forEach(function (t) {
                    o.options[t] = i[t]
                }), i && i.breakpoints && n(), e || (e = ".rellax"), m = "string" == typeof e ? document.querySelectorAll(e) : [e], 0 < m.length) {
                if (o.elems = m, o.options.wrapper && !o.options.wrapper.nodeType) {
                    if (!(m = document.querySelector(o.options.wrapper))) return void console.warn("Rellax: The wrapper you're trying to use doesn't exist.");
                    o.options.wrapper = m
                }
                var v, y = function () {
                        for (var t = 0; t < u.length; t++) o.elems[t].style.cssText = u[t].style;
                        for (u = [], r = window.innerHeight, l = window.innerWidth, t = o.options.breakpoints, v = l < t[0] ? "xs" : l >= t[0] && l < t[1] ? "sm" : l >= t[1] && l < t[2] ? "md" : "lg", b(), t = 0; t < o.elems.length; t++) {
                            var e = void 0,
                                i = o.elems[t],
                                n = i.getAttribute("data-rellax-percentage"),
                                s = i.getAttribute("data-rellax-speed"),
                                a = i.getAttribute("data-rellax-xs-speed"),
                                h = i.getAttribute("data-rellax-mobile-speed"),
                                d = i.getAttribute("data-rellax-tablet-speed"),
                                p = i.getAttribute("data-rellax-desktop-speed"),
                                m = i.getAttribute("data-rellax-vertical-speed"),
                                f = i.getAttribute("data-rellax-horizontal-speed"),
                                g = i.getAttribute("data-rellax-vertical-scroll-axis"),
                                x = i.getAttribute("data-rellax-horizontal-scroll-axis"),
                                S = i.getAttribute("data-rellax-zindex") || 0,
                                $ = i.getAttribute("data-rellax-min"),
                                C = i.getAttribute("data-rellax-max"),
                                k = i.getAttribute("data-rellax-min-x"),
                                A = i.getAttribute("data-rellax-max-x"),
                                E = i.getAttribute("data-rellax-min-y"),
                                M = i.getAttribute("data-rellax-max-y"),
                                I = !0;
                            a || h || d || p ? e = {
                                xs: a,
                                sm: h,
                                md: d,
                                lg: p
                            } : I = !1, a = o.options.wrapper ? o.options.wrapper.scrollTop : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop, o.options.relativeToWrapper && (a = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) - o.options.wrapper.offsetTop);
                            var O = o.options.vertical && (n || o.options.center) ? a : 0,
                                P = o.options.horizontal && (n || o.options.center) ? o.options.wrapper ? o.options.wrapper.scrollLeft : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft : 0;
                            a = O + i.getBoundingClientRect().top, h = i.clientHeight || i.offsetHeight || i.scrollHeight, d = P + i.getBoundingClientRect().left, p = i.clientWidth || i.offsetWidth || i.scrollWidth, O = n || (O - a + r) / (h + r), n = n || (P - d + l) / (p + l), o.options.center && (O = n = .5), e = I && null !== e[v] ? Number(e[v]) : s || o.options.speed, m = m || o.options.verticalSpeed, f = f || o.options.horizontalSpeed, g = g || o.options.verticalScrollAxis, x = x || o.options.horizontalScrollAxis, s = w(n, O, e, m, f), i = i.style.cssText, I = "", (n = /transform\s*:/i.exec(i)) && (I = i.slice(n.index), I = (n = I.indexOf(";")) ? " " + I.slice(11, n).replace(/\s/g, "") : " " + I.slice(11).replace(/\s/g, "")), u.push({
                                baseX: s.x,
                                baseY: s.y,
                                top: a,
                                left: d,
                                height: h,
                                width: p,
                                speed: e,
                                verticalSpeed: m,
                                horizontalSpeed: f,
                                verticalScrollAxis: g,
                                horizontalScrollAxis: x,
                                style: i,
                                transform: I,
                                zindex: S,
                                min: $,
                                max: C,
                                minX: k,
                                maxX: A,
                                minY: E,
                                maxY: M
                            })
                        }
                        _(), c && (window.addEventListener("resize", y), c = !1, T())
                    },
                    b = function () {
                        var t = s,
                            e = a;
                        return s = o.options.wrapper ? o.options.wrapper.scrollTop : (document.documentElement || document.body.parentNode || document.body).scrollTop || window.pageYOffset, a = o.options.wrapper ? o.options.wrapper.scrollLeft : (document.documentElement || document.body.parentNode || document.body).scrollLeft || window.pageXOffset, o.options.relativeToWrapper && (s = ((document.documentElement || document.body.parentNode || document.body).scrollTop || window.pageYOffset) - o.options.wrapper.offsetTop), !!(t != s && o.options.vertical || e != a && o.options.horizontal)
                    },
                    w = function (t, e, i, n, s) {
                        var r = {};
                        return t = 100 * (s || i) * (1 - t), e = 100 * (n || i) * (1 - e), r.x = o.options.round ? Math.round(t) : Math.round(100 * t) / 100, r.y = o.options.round ? Math.round(e) : Math.round(100 * e) / 100, r
                    },
                    x = function () {
                        window.removeEventListener("resize", x), window.removeEventListener("orientationchange", x), (o.options.wrapper ? o.options.wrapper : window).removeEventListener("scroll", x), (o.options.wrapper ? o.options.wrapper : document).removeEventListener("touchmove", x), d = h(T)
                    },
                    T = function () {
                        b() && !1 === c ? (_(), d = h(T)) : (d = null, window.addEventListener("resize", x), window.addEventListener("orientationchange", x), (o.options.wrapper ? o.options.wrapper : window).addEventListener("scroll", x, !!p && {
                            passive: !0
                        }), (o.options.wrapper ? o.options.wrapper : document).addEventListener("touchmove", x, !!p && {
                            passive: !0
                        }))
                    },
                    _ = function () {
                        for (var t, e = 0; e < o.elems.length; e++) {
                            var i = u[e].verticalScrollAxis.toLowerCase(),
                                n = u[e].horizontalScrollAxis.toLowerCase();
                            t = -1 != i.indexOf("x") ? s : 0, i = -1 != i.indexOf("y") ? s : 0;
                            var c = -1 != n.indexOf("x") ? a : 0;
                            n = -1 != n.indexOf("y") ? a : 0, t = w((t + c - u[e].left + l) / (u[e].width + l), (i + n - u[e].top + r) / (u[e].height + r), u[e].speed, u[e].verticalSpeed, u[e].horizontalSpeed), n = t.y - u[e].baseY, i = t.x - u[e].baseX, null !== u[e].min && (o.options.vertical && !o.options.horizontal && (n = n <= u[e].min ? u[e].min : n), o.options.horizontal && !o.options.vertical && (i = i <= u[e].min ? u[e].min : i)), null != u[e].minY && (n = n <= u[e].minY ? u[e].minY : n), null != u[e].minX && (i = i <= u[e].minX ? u[e].minX : i), null !== u[e].max && (o.options.vertical && !o.options.horizontal && (n = n >= u[e].max ? u[e].max : n), o.options.horizontal && !o.options.vertical && (i = i >= u[e].max ? u[e].max : i)), null != u[e].maxY && (n = n >= u[e].maxY ? u[e].maxY : n), null != u[e].maxX && (i = i >= u[e].maxX ? u[e].maxX : i), o.elems[e].style[g] = "translate3d(" + (o.options.horizontal ? i : "0") + "px," + (o.options.vertical ? n : "0") + "px," + u[e].zindex + "px) " + u[e].transform
                        }
                        o.options.callback(t)
                    };
                return o.destroy = function () {
                    for (var t = 0; t < o.elems.length; t++) o.elems[t].style.cssText = u[t].style;
                    c || (window.removeEventListener("resize", y), c = !0), f(d), d = null
                }, y(), o.refresh = y, o
            }
            console.warn("Rellax: The elements you're trying to select don't exist.")
        };
        return t
    });
class DoubleCenterException {
    constructor() {
        window.console.error('iTooltip Error: positionX and positionY properties cannot be "center" at the same time.')
    }
}
class iTooltip {
    constructor(t = "*") {
        const e = "*" !== t ? t : "*[title]";
        this.objects = document.querySelectorAll(e)
    }
    init(t = {}) {
        if (this.settings = Object.assign({
                className: "tooltip",
                indentX: 10,
                indentY: 15,
                positionX: "right",
                positionY: "bottom"
            }, t), "center" === this.settings.positionX && "center" === this.settings.positionY) throw new DoubleCenterException;
        this.objects.forEach(t => {
            t.getAttribute("title") && (t.addEventListener("mouseenter", t => this.createTooltip(t)), t.addEventListener("mouseleave", t => this.removeTooltip(t)))
        })
    }
    createTooltip(t) {
        const e = t.target;
        this.tooltip = document.createElement("div"), this.tooltip.classList.add(this.settings.className), this.tooltip.innerHTML = e.getAttribute("title");
        var i = t.target.className.split(" ").find(t => t.startsWith("itooltip-"));
        i && this.tooltip.classList.add(i), this.tooltip.style.position = "absolute", this.changePosition(t), e.removeAttribute("title"), document.body.appendChild(this.tooltip), e.addEventListener("mousemove", t => this.changePosition(t))
    }
    removeTooltip(t) {
        t.target.setAttribute("title", this.tooltip.innerHTML), this.tooltip.remove()
    }
    changePosition(t) {
        const [e, i] = this.getSizeTooltip(), n = this.getEdges(t), o = window.pageYOffset || document.documentElement.scrollTop;
        let s = t.pageY,
            r = t.pageX;
        if (r = "right" === this.settings.positionX ? n.right <= e ? t.clientX - e - this.settings.indentX : t.clientX + this.settings.indentX : "left" === this.settings.positionX ? n.left <= e ? n.left + this.settings.indentX : t.clientX - e - this.settings.indentX : n.left <= Math.round(e / 2) ? t.clientX - n.left : t.clientX - Math.round(e / 2), "top" === this.settings.positionY) s = n.top <= i ? o + t.clientY + this.settings.indentY : t.pageY - i - this.settings.indentY;
        else if ("bottom" === this.settings.positionY) s = n.bottom < i && n.top > i + this.settings.indentY ? t.pageY - i - this.settings.indentY : o + t.clientY + this.settings.indentY;
        else {
            let t = Math.round(i / 2);
            n.bottom <= t && (t = Math.round(i - n.bottom)), n.top <= t && (t = n.top), s -= t
        }
        this.tooltip.style.top = `${s}px`, this.tooltip.style.left = `${r}px`
    }
    getSizeTooltip() {
        const t = this.tooltip.getBoundingClientRect();
        return [t.right - t.left, t.bottom - t.top]
    }
    getEdges(t) {
        const e = document.documentElement;
        return {
            left: t.clientX,
            right: e.clientWidth - t.clientX,
            top: t.clientY,
            bottom: e.clientHeight - t.clientY
        }
    }
}! function (t) {
    "function" == typeof define && define.amd ? define(["jquery"], t) : "undefined" != typeof exports ? module.exports = t(require("jquery")) : t(jQuery)
}(function ($) {
    var ShowMoreItems = window.ShowMoreItems || {};
    ShowMoreItems = function (t, e) {
        $(t).addClass("showMoreItemsList");
        var i, n = this,
            o = {
                nowNum: 1,
                startNum: 1,
                afterNum: 1,
                original: !1,
                moreText: "Show more",
                noMoreText: "No more",
                backMoreText: "Reset",
                responsive: "",
                after: function () {}
            };
        i = $(t).data("showMoreItems") || {}, n.defaults = $.extend({}, o, e, i), n.options = $.extend({}, o, e, i), n.registerBreakpoints(t), n.init(t)
    }, ShowMoreItems.prototype.init = function (t) {
        var e = this;
        return e.sum = $(t).children().length, e.runData(t, e), !1
    }, ShowMoreItems.prototype.runData = function (t, e) {
        var i = this;
        i.goOut = !1, $(t).children().hide(), $(t).next(".button-box").remove(), i.nowNum = e.options.nowNum - 1, i.goNum = i.nowNum + e.options.startNum, i.sum <= e.options.startNum && (i.goNum = i.sum, i.goOut = !0);
        for (var n = i.nowNum; n < i.goNum; n++) $(t).children().eq(n).show(), i.nowNum += 1;
        i.goOut || $(t).after('<div class="button-box text-center mt-10"><button class="btn rounded-pill btn-soft-ash addListData">' + e.options.moreText + "</button></div>"), $(t).next().on("click", ".addListData", function (n) {
            i.goNum = i.nowNum + e.options.afterNum, i.sum <= i.goNum && (i.goNum = i.sum, i.goOut = !0);
            for (var o = i.nowNum; o < i.goNum; o++) $(t).children().eq(o).show(), i.nowNum += 1;
            i.goOut && e.options.original ? $(this).text(e.options.backMoreText).addClass("original") : i.goOut && $(this).text(e.options.noMoreText).addClass("d-none"), e.options.after()
        }), $(t).next().on("click", ".original", function (t) {
            return $(this).removeClass("original"), i.reflesh($(this)), !1
        })
    }, ShowMoreItems.prototype.reflesh = function (t) {
        thisE = t.parent().prev(), t.remove(), this.registerBreakpoints(t), this.init(thisE)
    }, ShowMoreItems.prototype.registerBreakpoints = function (t) {
        var e = this;
        e.options.responsive && (ResponsiveArr = e.options.responsive, ResponsiveArr = ResponsiveArr.sort(function (t, e) {
            return t.breakpoint > e.breakpoint ? -1 : 1
        }), e.options.responsive = ResponsiveArr, e.Oindex = -1, e.Owidth = $(window).width(), $.each(e.options.responsive, function (t, i) {
            $(window).width() <= i.breakpoint && (e.Oindex = t, i = i.settings, e.options = $.extend({}, e.options, i))
        }), $(window).resize(function () {
            return run = !1, $(window).width() < e.Owidth && (e.Owidth = $(window).width(), $.each(e.options.responsive, function (t, i) {
                if (e.Owidth <= i.breakpoint && e.Oindex < t) return e.Oindex = t, i = i.settings, e.options = $.extend({}, e.options, e.defaults), e.options = $.extend({}, e.options, i), run = !0, e.Oindex
            })), $(window).width() > e.Owidth && (e.Owidth = $(window).width(), $.each(ResponsiveArr, function (t, i) {
                if (e.Owidth > i.breakpoint && e.Oindex > t - 1) return e.Oindex = t - 1, -1 != e.Oindex ? (i = ResponsiveArr[t - 1].settings, e.options = $.extend({}, e.options, e.defaults), e.options = $.extend({}, e.options, i), run = !0) : (e.options = $.extend({}, e.options, e.defaults), run = !0), e.Oindex
            })), 1 == run && e.runData(t, e), !1
        }))
    }, $.fn.showMoreItems = function () {
        var t, e, i = this,
            n = arguments[0],
            o = Array.prototype.slice.call(arguments, 1),
            s = i.length;
        for (t = 0; t < s; t++)
            if ("object" == typeof n || void 0 === n ? i[t].showMoreItems = new ShowMoreItems(i[t], n) : e = i[t].showMoreItems[n].apply(i[t].showMoreItems, o), void 0 !== e) return e;
        return i
    }, $(function () {
        if ($('[data-showMoreItems="true"]').length) {
            if (selecter = $('[data-showMoreItems="true"]'), "true" == selecter.attr("data-showMoreItems")) {
                var settings = {
                    nowNum: 1,
                    getView: 0,
                    startNum: 1,
                    afterNum: 1,
                    original: !1,
                    moreText: "Show more",
                    noMoreText: "No more",
                    backMoreText: "Reset",
                    responsive: "",
                    after: function () {}
                };
                selecter.attr("data-nowNum") && (settings.nowNum = parseInt(selecter.attr("data-nowNum"))), selecter.attr("data-startNum") && (settings.startNum = parseInt(selecter.attr("data-startNum"))), selecter.attr("data-afterNum") && (settings.afterNum = parseInt(selecter.attr("data-afterNum"))), selecter.attr("data-original") && (settings.original = Boolean(selecter.attr("data-original"))), selecter.attr("data-moreText") && (settings.moreText = selecter.attr("data-moreText")), selecter.attr("data-noMoreText") && (settings.noMoreText = selecter.attr("data-noMoreText")), selecter.attr("data-backMoreText") && (settings.backMoreText = selecter.attr("data-backMoreText")), selecter.attr("data-responsive") && (settings.responsive = eval(selecter.attr("data-responsive")))
            }
            $('[data-showMoreItems="true"]').showMoreItems(settings)
        }
    })
});
var $jscomp = $jscomp || {};
$jscomp.scope = {}, $jscomp.arrayIteratorImpl = function (t) {
    var e = 0;
    return function () {
        return e < t.length ? {
            done: !1,
            value: t[e++]
        } : {
            done: !0
        }
    }
}, $jscomp.arrayIterator = function (t) {
    return {
        next: $jscomp.arrayIteratorImpl(t)
    }
}, $jscomp.ASSUME_ES5 = !1, $jscomp.ASSUME_NO_NATIVE_MAP = !1, $jscomp.ASSUME_NO_NATIVE_SET = !1, $jscomp.SIMPLE_FROUND_POLYFILL = !1, $jscomp.ISOLATE_POLYFILLS = !1, $jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function (t, e, i) {
    return t == Array.prototype || t == Object.prototype ? t : (t[e] = i.value, t)
}, $jscomp.getGlobal = function (t) {
    t = ["object" == typeof globalThis && globalThis, t, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
    for (var e = 0; e < t.length; ++e) {
        var i = t[e];
        if (i && i.Math == Math) return i
    }
    throw Error("Cannot find global object")
}, $jscomp.global = $jscomp.getGlobal(this), $jscomp.IS_SYMBOL_NATIVE = "function" == typeof Symbol && "symbol" == typeof Symbol("x"), $jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE, $jscomp.polyfills = {}, $jscomp.propertyToPolyfillSymbol = {}, $jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (t, e) {
    var i = $jscomp.propertyToPolyfillSymbol[e];
    return null == i ? t[e] : (i = t[i], void 0 !== i ? i : t[e])
};
$jscomp.polyfill = function (t, e, i, n) {
    e && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(t, e, i, n) : $jscomp.polyfillUnisolated(t, e, i, n))
}, $jscomp.polyfillUnisolated = function (t, e, i, n) {
    for (i = $jscomp.global, t = t.split("."), n = 0; n < t.length - 1; n++) {
        var o = t[n];
        o in i || (i[o] = {}), i = i[o]
    }
    t = t[t.length - 1], n = i[t], e = e(n), e != n && null != e && $jscomp.defineProperty(i, t, {
        configurable: !0,
        writable: !0,
        value: e
    })
}, $jscomp.polyfillIsolated = function (t, e, i, n) {
    var o = t.split(".");
    t = 1 === o.length, n = o[0], n = !t && n in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
    for (var s = 0; s < o.length - 1; s++) {
        var r = o[s];
        r in n || (n[r] = {}), n = n[r]
    }
    o = o[o.length - 1], i = $jscomp.IS_SYMBOL_NATIVE && "es6" === i ? n[o] : null, e = e(i), null != e && (t ? $jscomp.defineProperty($jscomp.polyfills, o, {
        configurable: !0,
        writable: !0,
        value: e
    }) : e !== i && ($jscomp.propertyToPolyfillSymbol[o] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global.Symbol(o) : $jscomp.POLYFILL_PREFIX + o, o = $jscomp.propertyToPolyfillSymbol[o], $jscomp.defineProperty(n, o, {
        configurable: !0,
        writable: !0,
        value: e
    })))
}, $jscomp.initSymbol = function () {}, $jscomp.polyfill("Symbol", function (t) {
    if (t) return t;
    var e = function (t, e) {
        this.$jscomp$symbol$id_ = t, $jscomp.defineProperty(this, "description", {
            configurable: !0,
            writable: !0,
            value: e
        })
    };
    e.prototype.toString = function () {
        return this.$jscomp$symbol$id_
    };
    var i = 0,
        n = function (t) {
            if (this instanceof n) throw new TypeError("Symbol is not a constructor");
            return new e("jscomp_symbol_" + (t || "") + "_" + i++, t)
        };
    return n
}, "es6", "es3"), $jscomp.initSymbolIterator = function () {}, $jscomp.polyfill("Symbol.iterator", function (t) {
    if (t) return t;
    t = Symbol("Symbol.iterator");
    for (var e = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), i = 0; i < e.length; i++) {
        var n = $jscomp.global[e[i]];
        "function" == typeof n && "function" != typeof n.prototype[t] && $jscomp.defineProperty(n.prototype, t, {
            configurable: !0,
            writable: !0,
            value: function () {
                return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))
            }
        })
    }
    return t
}, "es6", "es3"), $jscomp.initSymbolAsyncIterator = function () {}, $jscomp.iteratorPrototype = function (t) {
    return t = {
        next: t
    }, t[Symbol.iterator] = function () {
        return this
    }, t
}, $jscomp.iteratorFromArray = function (t, e) {
    t instanceof String && (t += "");
    var i = 0,
        n = {
            next: function () {
                if (i < t.length) {
                    var o = i++;
                    return {
                        value: e(o, t[o]),
                        done: !1
                    }
                }
                return n.next = function () {
                    return {
                        done: !0,
                        value: void 0
                    }
                }, n.next()
            }
        };
    return n[Symbol.iterator] = function () {
        return n
    }, n
}, $jscomp.polyfill("Array.prototype.keys", function (t) {
    return t || function () {
        return $jscomp.iteratorFromArray(this, function (t) {
            return t
        })
    }
}, "es6", "es3");
var scrollCue = function () {
    var t, e, i, n = {},
        o = 0,
        s = !0,
        r = !0,
        a = !1,
        l = !1,
        u = {
            duration: 600,
            interval: -.7,
            percentage: .75,
            enable: !0,
            docSlider: !1,
            pageChangeReset: !1
        };
    return n = {
        setEvents: function (t) {
            var e = function () {
                s && (requestAnimationFrame(function () {
                    s = !0, r && (n.setQuery(), n.runQuery())
                }), s = !1)
            };
            if (r && !t && window.addEventListener("load", n.runQuery), window.addEventListener("scroll", e), a) {
                t = docSlider.getElements().pages;
                for (var i = 0; i < t.length; i++) t[i].addEventListener("scroll", function (t) {
                    var i = docSlider.getCurrentIndex() + "";
                    if (t = t.target.getAttribute("data-ds-index"), i !== t) return !1;
                    docSlider._getWheelEnable() && e()
                })
            }
            window.addEventListener("resize", function () {
                0 < o && clearTimeout(o), o = setTimeout(function () {
                    r && (n.searchElements(), n.setQuery(), n.runQuery())
                }, 200)
            })
        },
        setOptions: function (t, e) {
            var i = {};
            if (void 0 !== t) return Object.keys(t).forEach(function (o) {
                "[object Object]" === Object.prototype.toString.call(t[o]) ? i[o] = n.setOptions(t[o], e[o]) : (i[o] = t[o], void 0 !== e && void 0 !== e[o] && (i[o] = e[o]))
            }), i
        },
        searchElements: function () {
            t = [];
            for (var e = document.querySelectorAll("[data-cues]:not([data-disabled])"), o = 0; o < e.length; o++) {
                for (var s = e[o], r = 0; r < s.children.length; r++) {
                    var l = s.children[r];
                    n.setAttrPtoC(l, "data-cue", s, "data-cues", ""), n.setAttrPtoC(l, "data-duration", s, "data-duration", !1), n.setAttrPtoC(l, "data-interval", s, "data-interval", !1), n.setAttrPtoC(l, "data-sort", s, "data-sort", !1), n.setAttrPtoC(l, "data-addClass", s, "data-addClass", !1), n.setAttrPtoC(l, "data-group", s, "data-group", !1), n.setAttrPtoC(l, "data-delay", s, "data-delay", !1)
                }
                s.setAttribute("data-disabled", "true")
            }
            for (e = document.querySelectorAll('[data-cue]:not([data-show="true"])'), o = 0; o < e.length; o++) s = e[o], t.push({
                elm: s,
                cue: n.getAttr(s, "data-cue", "fadeIn"),
                duration: Number(n.getAttr(s, "data-duration", i.duration)),
                interval: Number(n.getAttr(s, "data-interval", i.interval)),
                order: n.getOrderNumber(s),
                sort: n.getAttr(s, "data-sort", null),
                addClass: n.getAttr(s, "data-addClass", null),
                group: n.getAttr(s, "data-group", null),
                delay: Number(n.getAttr(s, "data-delay", 0))
            });
            if (a)
                for (e = docSlider.getElements().pages.length, o = 0; o < e; o++)
                    for (s = document.querySelectorAll('[data-ds-index="' + o + '"] [data-cue]:not([data-scpage])'), r = 0; r < s.length; r++) s[r].setAttribute("data-scpage", o)
        },
        sortElements: function () {
            for (var t = arguments[0], e = [].slice.call(arguments).slice(1), i = {
                    $jscomp$loop$prop$i$4: 0
                }; i.$jscomp$loop$prop$i$4 < e.length; i = {
                    $jscomp$loop$prop$i$4: i.$jscomp$loop$prop$i$4
                }, i.$jscomp$loop$prop$i$4++) t.sort(function (t) {
                return function (i, n) {
                    var o = void 0 === e[t.$jscomp$loop$prop$i$4][1] || e[t.$jscomp$loop$prop$i$4][1],
                        s = e[t.$jscomp$loop$prop$i$4][0];
                    return i[s] > n[s] ? o ? 1 : -1 : i[s] < n[s] ? o ? -1 : 1 : 0
                }
            }(i))
        },
        randElements: function (t) {
            for (var e = t.length - 1; 0 < e; e--) {
                var i = Math.floor(Math.random() * (e + 1)),
                    n = t[e];
                t[e] = t[i], t[i] = n
            }
            return t
        },
        setDurationValue: function (t, e, i) {
            return void 0 === e ? t : (e = e.duration, t = -1 === (i + "").indexOf(".") ? t + e + i : t + e + e * i, 0 > t ? 0 : t)
        },
        getOrderNumber: function (t) {
            return t.hasAttribute("data-order") ? (t = Number(t.getAttribute("data-order")), 0 <= t ? t : Math.pow(2, 53) - 1 + t) : Math.pow(2, 52) - 1
        },
        setAttrPtoC: function (t, e, i, n, o) {
            i.hasAttribute(n) ? t.hasAttribute(e) || t.setAttribute(e, i.getAttribute(n)) : !1 !== o && t.setAttribute(e, o)
        },
        getAttr: function (t, e, i) {
            return t.hasAttribute(e) ? t.getAttribute(e) : i
        },
        getOffsetTop: function (t) {
            return t.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop)
        },
        setClassNames: function (t, e) {
            if (e) {
                e = e.split(" ");
                for (var i = 0; i < e.length; i++) t.classList.add(e[i])
            }
        },
        setQuery: function () {
            e = {};
            for (var i = 0; i < t.length; i++) {
                var o = t[i],
                    s = o.group ? o.group : "$" + n.getOffsetTop(o.elm);
                if (!o.elm.hasAttribute("data-show")) {
                    if (a) {
                        var r = o.elm.getAttribute("data-scpage"),
                            l = docSlider.getCurrentIndex() + "";
                        if (r !== l && null !== r) continue
                    }
                    void 0 === e[s] && (e[s] = []), e[s].push(o)
                }
            }
        },
        runQuery: function () {
            for (var t = Object.keys(e), i = {}, o = 0; o < t.length; i = {
                    $jscomp$loop$prop$elms$6: i.$jscomp$loop$prop$elms$6,
                    $jscomp$loop$prop$interval$7: i.$jscomp$loop$prop$interval$7
                }, o++)
                if (i.$jscomp$loop$prop$elms$6 = e[t[o]], n.isElementIn(i.$jscomp$loop$prop$elms$6[0].elm)) {
                    "reverse" === i.$jscomp$loop$prop$elms$6[0].sort ? i.$jscomp$loop$prop$elms$6.reverse() : "random" === i.$jscomp$loop$prop$elms$6[0].sort && n.randElements(i.$jscomp$loop$prop$elms$6), n.sortElements(i.$jscomp$loop$prop$elms$6, ["order"]);
                    for (var s = i.$jscomp$loop$prop$interval$7 = 0; s < i.$jscomp$loop$prop$elms$6.length; s++)(function (t) {
                        return function (e) {
                            t.$jscomp$loop$prop$elms$6[e].elm.setAttribute("data-show", "true"), n.setClassNames(t.$jscomp$loop$prop$elms$6[e].elm, t.$jscomp$loop$prop$elms$6[e].addClass), t.$jscomp$loop$prop$interval$7 = n.setDurationValue(t.$jscomp$loop$prop$interval$7, t.$jscomp$loop$prop$elms$6[e - 1], t.$jscomp$loop$prop$elms$6[e].interval), t.$jscomp$loop$prop$elms$6[e].elm.style.animationName = t.$jscomp$loop$prop$elms$6[e].cue, t.$jscomp$loop$prop$elms$6[e].elm.style.animationDuration = t.$jscomp$loop$prop$elms$6[e].duration + "ms", t.$jscomp$loop$prop$elms$6[e].elm.style.animationTimingFunction = "ease", t.$jscomp$loop$prop$elms$6[e].elm.style.animationDelay = t.$jscomp$loop$prop$interval$7 + t.$jscomp$loop$prop$elms$6[e].delay + "ms", t.$jscomp$loop$prop$elms$6[e].elm.style.animationDirection = "normal", t.$jscomp$loop$prop$elms$6[e].elm.style.animationFillMode = "both"
                        }
                    })(i)(s);
                    delete e[t[o]]
                }
        },
        isElementIn: function (t) {
            var e = t.hasAttribute("data-scpage") ? n.isScrollEndWithDocSlider : n.isScrollEnd;
            return window.pageYOffset > n.getOffsetTop(t) - window.innerHeight * i.percentage || e()
        },
        isScrollEnd: function () {
            var t = window.document.documentElement;
            return (window.document.body.scrollTop || t.scrollTop) >= t.scrollHeight - t.clientHeight
        },
        isScrollEndWithDocSlider: function () {
            var t = docSlider.getCurrentPage();
            return t.scrollTop >= t.scrollHeight - t.clientHeight
        }
    }, {
        init: function (t) {
            i = n.setOptions(u, t), r = i.enable, a = i.docSlider, l = i.pageChangeReset, a || (n.setEvents(), n.searchElements(), n.setQuery())
        },
        update: function () {
            r && (n.searchElements(), n.setQuery(), n.runQuery())
        },
        enable: function (t) {
            r = void 0 === t ? !r : t, scrollCue.update()
        },
        _hasDocSlider: function () {
            return a
        },
        _hasPageChangeReset: function () {
            return l
        },
        _initWithDocSlider: function (t) {
            n.setEvents(t), n.searchElements(), n.setQuery()
        },
        _updateWithDocSlider: function () {
            r && (n.setQuery(), n.runQuery())
        },
        _searchElements: function () {
            n.searchElements()
        }
    }
}();
! function (t) {
    "function" == typeof define && define.amd ? define(["jquery"], function (e) {
        return t(e)
    }) : "object" == typeof module && "object" == typeof module.exports ? exports = t(require("jquery")) : t(jQuery)
}(function (t) {
    function e(t) {
        var e = 7.5625,
            i = 2.75;
        return t < 1 / i ? e * t * t : t < 2 / i ? e * (t -= 1.5 / i) * t + .75 : t < 2.5 / i ? e * (t -= 2.25 / i) * t + .9375 : e * (t -= 2.625 / i) * t + .984375
    }
    t.easing.jswing = t.easing.swing;
    var i = Math.pow,
        n = Math.sqrt,
        o = Math.sin,
        s = Math.cos,
        r = Math.PI,
        a = 1.70158,
        l = 1.525 * a,
        u = 2 * r / 3,
        c = 2 * r / 4.5;
    t.extend(t.easing, {
        def: "easeOutQuad",
        swing: function (e) {
            return t.easing[t.easing.def](e)
        },
        easeInQuad: function (t) {
            return t * t
        },
        easeOutQuad: function (t) {
            return 1 - (1 - t) * (1 - t)
        },
        easeInOutQuad: function (t) {
            return t < .5 ? 2 * t * t : 1 - i(-2 * t + 2, 2) / 2
        },
        easeInCubic: function (t) {
            return t * t * t
        },
        easeOutCubic: function (t) {
            return 1 - i(1 - t, 3)
        },
        easeInOutCubic: function (t) {
            return t < .5 ? 4 * t * t * t : 1 - i(-2 * t + 2, 3) / 2
        },
        easeInQuart: function (t) {
            return t * t * t * t
        },
        easeOutQuart: function (t) {
            return 1 - i(1 - t, 4)
        },
        easeInOutQuart: function (t) {
            return t < .5 ? 8 * t * t * t * t : 1 - i(-2 * t + 2, 4) / 2
        },
        easeInQuint: function (t) {
            return t * t * t * t * t
        },
        easeOutQuint: function (t) {
            return 1 - i(1 - t, 5)
        },
        easeInOutQuint: function (t) {
            return t < .5 ? 16 * t * t * t * t * t : 1 - i(-2 * t + 2, 5) / 2
        },
        easeInSine: function (t) {
            return 1 - s(t * r / 2)
        },
        easeOutSine: function (t) {
            return o(t * r / 2)
        },
        easeInOutSine: function (t) {
            return -(s(r * t) - 1) / 2
        },
        easeInExpo: function (t) {
            return 0 === t ? 0 : i(2, 10 * t - 10)
        },
        easeOutExpo: function (t) {
            return 1 === t ? 1 : 1 - i(2, -10 * t)
        },
        easeInOutExpo: function (t) {
            return 0 === t ? 0 : 1 === t ? 1 : t < .5 ? i(2, 20 * t - 10) / 2 : (2 - i(2, -20 * t + 10)) / 2
        },
        easeInCirc: function (t) {
            return 1 - n(1 - i(t, 2))
        },
        easeOutCirc: function (t) {
            return n(1 - i(t - 1, 2))
        },
        easeInOutCirc: function (t) {
            return t < .5 ? (1 - n(1 - i(2 * t, 2))) / 2 : (n(1 - i(-2 * t + 2, 2)) + 1) / 2
        },
        easeInElastic: function (t) {
            return 0 === t ? 0 : 1 === t ? 1 : -i(2, 10 * t - 10) * o((10 * t - 10.75) * u)
        },
        easeOutElastic: function (t) {
            return 0 === t ? 0 : 1 === t ? 1 : i(2, -10 * t) * o((10 * t - .75) * u) + 1
        },
        easeInOutElastic: function (t) {
            return 0 === t ? 0 : 1 === t ? 1 : t < .5 ? -i(2, 20 * t - 10) * o((20 * t - 11.125) * c) / 2 : i(2, -20 * t + 10) * o((20 * t - 11.125) * c) / 2 + 1
        },
        easeInBack: function (t) {
            return (a + 1) * t * t * t - a * t * t
        },
        easeOutBack: function (t) {
            return 1 + (a + 1) * i(t - 1, 3) + a * i(t - 1, 2)
        },
        easeInOutBack: function (t) {
            return t < .5 ? i(2 * t, 2) * (7.189819 * t - l) / 2 : (i(2 * t - 2, 2) * ((l + 1) * (2 * t - 2) + l) + 2) / 2
        },
        easeInBounce: function (t) {
            return 1 - e(1 - t)
        },
        easeOutBounce: e,
        easeInOutBounce: function (t) {
            return t < .5 ? (1 - e(1 - 2 * t)) / 2 : (1 + e(2 * t - 1)) / 2
        }
    })
});