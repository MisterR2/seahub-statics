$(document).ready(function () {
    "use strict";

    function a() {
        if ($(".rellax").length) {
            var a = new Rellax(".rellax", {
                speed: 2,
                center: !0,
                breakpoints: [576, 992, 1201]
            });
            $(".projects-overflow").imagesLoaded(function () {
                a.refresh()
            })
        }
    }

    function t() {
        scrollCue.init({
            interval: -400,
            duration: 700,
            percentage: .8
        })
    }

    function o() {
        $(".grid").each(function (a, t) {
            var o = $(t),
                e = o.find(".isotope").imagesLoaded(function () {
                    e.isotope({
                        itemSelector: ".item",
                        layoutMode: "masonry",
                        percentPosition: !0,
                        masonry: {
                            columnWidth: e.width() / 12
                        },
                        transitionDuration: "0.7s"
                    })
                });
            $(window).resize(function () {
                e.isotope({
                    masonry: {
                        columnWidth: e.width() / 12
                    }
                })
            }), $(window).on("load", function () {
                e.isotope({
                    masonry: {
                        columnWidth: e.width() / 12
                    }
                })
            }), o.find(".isotope-filter").on("click", "a", function () {
                var a = $(this).attr("data-filter");
                e.isotope({
                    filter: a
                })
            })
        }), $(".isotope-filter").each(function (a, t) {
            var o = $(t);
            o.on("click", "a", function () {
                o.find(".active").removeClass("active"), $(this).addClass("active")
            })
        })
    }

    function e() {
        $(".show-more").each(function () {
            var e = $(this);
            e.showMoreItems({
                startNum: e.data("showstart"),
                afterNum: e.data("showafter"),
                moreText: "Show More",
                after: function () {
                    o(), a(), t()
                }
            })
        })
    }

    function n() {
        var a = $(".light-gallery-wrapper");
        a.lightGallery({
            thumbnail: !1,
            selector: ".lightbox",
            mode: "lg-fade",
            download: !1,
            autoplayControls: !1,
            zoom: !1,
            fullScreen: !1,
            videoMaxWidth: "1000px",
            loop: !1,
            counter: !1,
            hash: !1,
            closable: !0,
            mousewheel: !0,
            videojs: !0,
            videoAutoplay: !0,
            share: !1
        })
    }

    function i() {
        $(".contact-form").validator({
            disable: !1,
            focus: !1
        }), $(".contact-form").on("submit", function (a) {
            if (!a.isDefaultPrevented()) {
                var t = "contact/contact.php";
                return $.ajax({
                    type: "POST",
                    url: t,
                    data: $(this).serialize(),
                    success: function (a) {
                        var t = "alert-" + a.type,
                            o = a.message,
                            e = '<div class="alert ' + t + ' alert-dismissible fade show"><button type="button" class="btn-close" data-dismiss="alert" aria-label="Close"></button>' + o + "</div>";
                        t && o && ($(".contact-form").find(".messages").html(e), $(".contact-form")[0].reset())
                    }
                }), !1
            }
        })
    }
    if ($(".navbar").length) {
        var s = {
            offset: 350,
            offsetSide: "top",
            classes: {
                clone: "banner--clone fixed",
                stick: "banner--stick",
                unstick: "banner--unstick"
            },
            onStick: function () {
                $($.SmartMenus.Bootstrap.init);
                var a = $(".navbar:not(.fixed) .language-select .dropdown-menu");
                a.removeClass("show")
            },
            onUnstick: function () {
                var a = $(".navbar.fixed .language-select .dropdown-menu");
                a.removeClass("show")
            }
        };
        new Headhesive(".navbar", s)
    }
    $(function () {
        $(".navbar .navbar-nav:not(.navbar-nav-other)").bind({
            "show.smapi": function (a, t) {
                $(t).removeClass("hide-animation").addClass("show-animation")
            },
            "hide.smapi": function (a, t) {
                $(t).removeClass("show-animation").addClass("hide-animation")
            }
        }).on("animationend webkitAnimationEnd oanimationend MSAnimationEnd", "ul", function (a) {
            $(this).removeClass("show-animation hide-animation"), a.stopPropagation()
        })
    });
    var r = $(".hamburger.animate"),
        l = ($(".language-select .dropdown-menu"), $(".cart-dropdown .dropdown-menu")),
        c = $(".offcanvas-nav"),
        d = $('[data-toggle="offcanvas-nav"]'),
        u = $(".offcanvas-nav-close"),
        p = $(".offcanvas-info"),
        m = $(".offcanvas-info-close"),
        f = $('[data-toggle="offcanvas-info"]');
    r.on("click", function () {
        r.toggleClass("active")
    }), d.on("click", function (a) {
        a.stopPropagation(), c.toggleClass("open")
    }), c.on("click", function (a) {
        a.stopPropagation()
    }), l.on("click", function (a) {
        a.stopPropagation()
    }), u.on("click", function (a) {
        c.removeClass("open"), r.removeClass("active")
    }), f.on("click", function (a) {
        a.stopPropagation(), p.toggleClass("open")
    }), p.on("click", function (a) {
        a.stopPropagation()
    }), $(document).on("click", function () {
        c.removeClass("open"), p.removeClass("open"), r.removeClass("active")
    }), m.on("click", function (a) {
        p.removeClass("open")
    }), $(".onepage .navbar li a.scroll").on("click", function () {
        c.removeClass("open"), r.removeClass("active")
    });
    var h = $(".navbar:not(.banner--clone)").outerHeight(),
        g = 75,
        v = {
            "padding-top": g + "px",
            "margin-top": "-" + g + "px"
        };
    $(".onepage section").css(v);
    var w = {
        "padding-top": h + "px",
        "margin-top": "-" + h + "px"
    };
    $(".onepage section:first-of-type").css(w);
    var y = $('.onepage .navbar ul.navbar-nav a[href="#"]');
    y.on("click", function (a) {
        a.preventDefault()
    }), $(function () {
        function a(a) {
            a = a.length ? a : $("[name=" + this.hash.slice(1) + "]");
            a.length && $("html,body").animate({
                scrollTop: a.offset().top
            }, 1500, "easeInOutExpo")
        }
        setTimeout(function () {
            if (location.hash) {
                window.scrollTo(0, 0);
                var t = location.hash.split("#");
                a($("#" + t[1]))
            }
        }, 1), $('a.scroll[href*="#"]:not([href="#"])').on("click", function () {
            if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) return a($(this.hash)), !1
        })
    }), SVGInject(document.querySelectorAll("img.svg-inject")), $(".bg-image").css("background-image", function () {
        var a = "url(" + $(this).data("image-src") + ")";
        return a
    }), $(".overlay:not(.caption) > a, .overlay:not(.caption) > span").prepend('<span class="bg"></span>'), a(), t(), scrollCue.update(), o(), e(), $(".basic-slider").each(function () {
        var a = $(this);
        a.owlCarousel({
            items: 1,
            nav: a.data("nav"),
            navText: ["<i class='uil-arrow-left'></i>", "<i class='uil-arrow-right'></i>"],
            dots: !0,
            dotsEach: !0,
            autoHeight: !0,
            loop: !0,
            margin: a.data("margin")
        })
    }), $(".carousel").each(function () {
        var a = $(this);
        a.owlCarousel({
            autoHeight: !1,
            nav: a.data("nav"),
            navText: ["<i class='uil-arrow-left'></i>", "<i class='uil-arrow-right'></i>"],
            dots: a.data("dots"),
            dotsEach: !0,
            loop: a.data("loop"),
            margin: a.data("margin"),
            autoplay: a.data("autoplay"),
            autoplayTimeout: a.data("autoplay-timeout"),
            responsive: a.data("responsive")
        })
    }), $(".hero-slider").each(function () {
        var a = $(this);
        a.owlCarousel({
            items: 1,
            nav: $(this).data("nav"),
            navText: ["<i class='uil-arrow-left'></i>", "<i class='uil-arrow-right'></i>"],
            dots: $(this).data("dots"),
            dotsEach: !0,
            autoHeight: !0,
            loop: !0,
            autoplay: a.data("autoplay"),
            autoplayTimeout: 5e3,
            onInitialized: function () {
                a.trigger("stop.owl.autoplay"), setTimeout(function () {
                    a.trigger("play.owl.autoplay")
                }, 3e3)
            },
            autoplayHoverPause: !0,
            margin: 0,
            animateIn: "fadeIn",
            animateOut: "fadeOut"
        }), a.on("changed.owl.carousel", a => {
            $(".owl-item.active").find(".animated-caption").each(function (a, t) {
                $(this).removeClass("animate__animated").removeClass($(this).data("anim"))
            });
            var t = $(".owl-item").eq(a.item.index);
            t.find(".animated-caption").each(function (a, t) {
                var o = $(this).data("anim-delay"),
                    e = $(this).data("anim-duration");
                $(this).addClass("animate__animated").addClass($(this).data("anim")).css({
                    "animation-delay": o + "ms",
                    "animation-duration": e + "ms"
                })
            })
        }), a.trigger("refresh.owl.carousel")
    });
    var b = $(".animated-captions");
    b.find(".animated-caption").each(function () {
        var a = $(this).data("anim-delay"),
            t = $(this).data("anim-duration");
        $(this).addClass("animate__animated").addClass($(this).data("anim")).css({
            "animation-delay": a + "ms",
            "animation-duration": t + "ms"
        })
    }), n();
    Plyr.setup(".player", {
        loadSprite: !0
    });
    var C = $(".progressbar.line");
    if (C.each(function (a) {
            var t = new ProgressBar.Line(this, {
                    strokeWidth: 3,
                    trailWidth: 3,
                    duration: 3e3,
                    easing: "easeInOut",
                    text: {
                        style: {
                            color: "inherit",
                            position: "absolute",
                            right: "0",
                            top: "-30px",
                            padding: 0,
                            margin: 0,
                            transform: null
                        },
                        autoStyleContainer: !1
                    },
                    step: function (a, t, o) {
                        t.setText(Math.round(100 * t.value()) + " %")
                    }
                }),
                o = $(this).attr("data-value") / 100;
            C.waypoint(function () {
                t.animate(o)
            }, {
                offset: "100%"
            })
        }), $(".progress-wrap").length) {
        var k = document.querySelector(".progress-wrap path"),
            x = k.getTotalLength();
        k.style.transition = k.style.WebkitTransition = "none", k.style.strokeDasharray = x + " " + x, k.style.strokeDashoffset = x, k.getBoundingClientRect(), k.style.transition = k.style.WebkitTransition = "stroke-dashoffset 10ms linear";
        var T = function () {
            var a = $(window).scrollTop(),
                t = $(document).height() - $(window).height(),
                o = x - a * x / t;
            k.style.strokeDashoffset = o
        };
        T(), $(window).scroll(T);
        var S = 50,
            P = 550;
        jQuery(window).on("scroll", function () {
            jQuery(this).scrollTop() > S ? jQuery(".progress-wrap").addClass("active-progress") : jQuery(".progress-wrap").removeClass("active-progress")
        }), jQuery(".progress-wrap").on("click", function (a) {
            return a.preventDefault(), jQuery("html, body").animate({
                scrollTop: 0
            }, P), !1
        })
    }
    jQuery(function (a) {
        var t = window.counterUp.default,
            o = a(".counter");
        o.each(function (o, e) {
            new Waypoint({
                element: a(this),
                handler: function () {
                    t(e, {
                        duration: 1e3,
                        delay: 50
                    }), this.destroy()
                },
                offset: "bottom-in-view"
            })
        })
    });
    var A = [].slice.call(document.querySelectorAll(".has-tooltip")),
        j = (A.map(function (a) {
            return new bootstrap.Tooltip(a)
        }), [].slice.call(document.querySelectorAll(".has-popover"), {
            trigger: "focus"
        })),
        W = (j.map(function (a) {
            return new bootstrap.Popover(a)
        }), new iTooltip(".itooltip"));
    W.init({
        className: "itooltip-inner",
        indentX: 15,
        indentY: 15,
        positionX: "right",
        positionY: "bottom"
    }), $(".video-wrapper video").backgroundVideo({
        $outerWrap: $(".video-wrapper"),
        pauseVideoOnViewLoss: !1,
        parallaxOptions: {
            effect: 6
        }
    });
    var O = !!(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || "MacIntel" === navigator.platform && navigator.maxTouchPoints > 1 || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i));
    O && $(".image-wrapper").addClass("mobile"), i();
    var E = window.innerWidth,
        M = $("body").innerWidth(),
        q = E - M,
        I = document.querySelectorAll(".modal");
    if (I.forEach(a => {
            a.addEventListener("show.bs.modal", function (a) {
                $(".navbar.fixed").css("padding-right", q), $(".progress-wrap").css("margin-right", q)
            }), a.addEventListener("hidden.bs.modal", function (a) {
                $(".navbar.fixed").css("padding-right", ""), $(".progress-wrap").css("margin-right", "")
            })
        }), $(".modal-popup").length > 0) {
        var D = new bootstrap.Modal(document.querySelector(".modal-popup"));
        document.querySelector(".modal-popup");
        setTimeout(function () {
            D.show()
        }, 200)
    }
    $(".page-loading").delay(350).fadeOut("slow"), $(".page-loading .status").fadeOut("slow"), $(".pricing-wrapper").each(function (a, t) {
        var o = $(t);
        o.find(".pricing-switcher").on("click", function () {
            o.find(".pricing-switcher").toggleClass("pricing-switcher-active"), o.find(".price").removeClass("price-hidden"), o.find(".price").toggleClass("price-show price-hide")
        })
    })
});