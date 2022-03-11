!function (f, h) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = h() : "function" == typeof define && define.amd ? define(h) : f.scrollnav = h()
}(this, function () {
    function f(f, h) {
        var y, E = {};
        for (y in f) Object.prototype.hasOwnProperty.call(f, y) && (E[y] = f[y]);
        for (y in h) Object.prototype.hasOwnProperty.call(h, y) && (E[y] = h[y]);
        return E
    }

    function h(f, h) {
        if ("object" != typeof f) return Promise.reject(new Error("First argument must be an object"));
        if ("object" != typeof (h = h || document.body)) return Promise.reject(new Error("Second argument must be an object"));
        var y = h.getBoundingClientRect();
        return f.getBoundingClientRect().top - y.top
    }

    function y(f, E, w) {
        void 0 === w && (w = "md-nav");
        var L = [];
        return w += "__", f.forEach(function (f, O) {
            var x = [], j = function (f, h) {
                if ("object" != typeof f) return Promise.reject(new Error("First argument must be an object"));
                var y = f.id;
                if (!y) {
                    if ("string" != typeof h) return Promise.reject(new Error("Second argument must be a string"));
                    f.id = y = h
                }
                return y
            }(f, w + (O + 1));
            E.subSections && f.matches(E.sections) && (x = y(function (f, h, y) {
                var E = [];
                for (f = f.nextElementSibling; f && !f.matches(h);) !y || f.matches(y) ? (E.push(f), f = f.nextElementSibling) : f = f.nextElementSibling;
                return E
            }(f, E.sections, E.subSections), E, j));
            L.push({id: j, text: f.innerText || f.textContent, offsetTop: h(f), subSections: x})
        }), L
    }

    function E(f) {
        var h = document.createElement("nav");
        return h.className = "md-nav", h.innerHTML = function f(h, y) {
            void 0 === y && (y = !1);
            var E = "md-nav" + "__", w = "\n    " + h.map(function (h) {
                return '<li class="' + E + 'item" data-sn-section="' + h.id + '">\n            <a class="' + E + 'link" href="#' + h.id + '">' + h.text + "</a>\n            " + (h.subSections && h.subSections.length ? "" + f(h.subSections, !0) : "") + "\n          </li>"
            }).join("") + "\n  ";
            return '\n    <ol class="' + E + 'list">\n      ' + w + "\n    </ol>\n  "
        }(f), h
    }

    function w(f) {
        return f.forEach(function (f) {
            var y = document.querySelector("#" + f.id);
            f.offsetTop = h(y), f.subSections.length && (f.subSections = w(f.subSections))
        }), f
    }

    function L(f, h) {
        var y = f.getAttribute("href");
        return "#" === y.charAt(0) && (y = y.substr(1)), function f(h, y) {
            var E;
            h.forEach(function (h) {
                h.id === y && (E = h), h.subSections && void 0 === E && (E = f(h.subSections, y))
            });
            return E
        }(h, y).offsetTop
    }

    var O, x, j, _ = function (f) {
        return function (h) {
            return Math.pow(h, f)
        }
    }, M = function (f) {
        return function (h) {
            return 1 - Math.abs(Math.pow(h - 1, f))
        }
    }, I = function (f) {
        return function (h) {
            return h < .5 ? _(f)(2 * h) / 2 : M(f)(2 * h - 1) / 2 + .5
        }
    }, Q = {
        linear: I(1),
        easeInQuad: _(2),
        easeOutQuad: M(2),
        easeInOutQuad: I(2),
        easeInCubic: _(3),
        easeOutCubic: M(3),
        easeInOutCubic: I(3),
        easeInQuart: _(4),
        easeOutQuart: M(4),
        easeInOutQuart: I(4),
        easeInQuint: _(5),
        easeOutQuint: M(5),
        easeInOutQuint: I(5)
    };

    function C(f, h) {
        return new Promise(function (y, E) {
            if ("number" != typeof f) return E(new Error("First argument must be a number"));
            if ("string" != typeof (h = h || "linear")) return E(new Error("Second argument must be a string"));
            var w, L = window.pageYOffset, O = f - L, x = function (f) {
                var h = Math.abs(f / 2);
                return Math.min(Math.max(h, 250), 1200)
            }(O), j = 20, _ = 0;
            !function f() {
                w = Q[h]((_ += j) / x), window.scroll(0, w * O + L), _ < x ? setTimeout(f, j) : y(window.pageYOffset)
            }()
        })
    }

    function q(f) {
        function h() {
            var h = window.scrollY || window.pageYOffset || document.body.scrollTop, y = h + .4 * window.innerHeight,
                E = function f(h, y, E) {
                    var w, L;
                    h.forEach(function (f) {
                        f.offsetTop > E ? !w && f.offsetTop < y && (w = f) : w = f
                    }), w && w.subSections.length && (L = f(w.subSections, y, E)) && (w = L);
                    return w
                }(f.data, h, y);
            return function (f, h) {
                var y = h.querySelector("[data-sn-active]");
                if (f) {
                    var E = h.querySelector("[data-sn-section=" + f.id + "]");
                    E && E !== y && (y && (y.classList.remove("md-nav__link--active"), y.removeAttribute("data-sn-active")), E.classList.add("md-nav__link--active"), E.setAttribute("data-sn-active", !0))
                } else y && (y.classList.remove("md-nav__link--active"), y.removeAttribute("data-sn-active"))
            }(E, f.nav), E
        }

        return window.addEventListener("scroll", h), h
    }

    function B(f) {
        return f instanceof Element
    }

    return Element.prototype.matches || (Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector), {
        init: function (h, _) {
            if (this.settings = f({
                sections: "h2",
                insertTarget: h,
                insertLocation: "before",
                easingStyle: "easeOutQuad",
                updateHistory: !0
            }, _), B(h)) if (!this.settings.insertTarget || B(this.settings.insertTarget)) if (["append", "prepend", "after", "before"].includes(this.settings.insertLocation)) {
                var M, I, Q, F, R = h.querySelectorAll(this.settings.sections);
                if (R.length) return this.data = y(R, this.settings), this.nav = E(this.data), I = (M = this).settings.insertTarget, "append" === (Q = M.settings.insertLocation) ? I.appendChild(M.nav) : "prepend" === Q ? I.insertBefore(M.nav, I.firstChild) : "before" === Q ? I.parentNode.insertBefore(M.nav, I) : "after" === Q && I.parentNode.insertBefore(M.nav, I.nextSibling), O = function (f) {
                    var h = f.settings;

                    function y(y) {
                        y.preventDefault();
                        var E = .39 * window.innerHeight;
                        return C(L(y.target, f.data) - E, h.easingStyle).then(function () {
                            h.updateHistory && history.replaceState({}, "", y.target.getAttribute("href")), h.onScroll && h.onScroll()
                        })
                    }

                    return f.nav.querySelectorAll("a").forEach(function (f) {
                        f.addEventListener("click", y)
                    }), y
                }(this), x = q(this), j = function (f) {
                    function h() {
                        f.data = w(f.data)
                    }

                    return window.addEventListener("resize", h), h
                }(this), this.settings.debug && ((F = document.createElement("div")).className = "snDebugger", F.setAttribute("style", "\n      position: fixed;\n      top: 40%;\n      height: 0px;\n      border-bottom:5px solid red;\n      border-top: 5px solid blue;\n      width: 100%;\n      opacity: .5;\n      pointer-events: none;\n    "), document.body.appendChild(F)), this.settings.onInit ? this.settings.onInit() : void 0;
                this.settings.debug && console.error('\n        scrollnav build failed, could not find any "' + this.settings.sections + '"\n        elements inside of "' + h + '"\n      ')
            } else this.settings.debug && console.error('\n        scrollnav build failed, options.insertLocation "' + this.settings.insertLocation + '" is not a valid option\n      '); else this.settings.debug && console.error('\n        scrollnav build failed, options.insertTarget "' + h + '" is not an HTML Element\n      '); else this.settings.debug && console.error('\n        scrollnav build failed, content argument "' + h + '" is not an HTML Element\n      ')
        }, destroy: function (h) {
            if (this.settings = f(this.settings, h), function (f, h) {
                f.querySelectorAll("a").forEach(function (f) {
                    f.removeEventListener("click", h)
                })
            }(this.nav, O), function (f) {
                window.removeEventListener("scroll", f)
            }(x), function (f) {
                window.removeEventListener("resize", f)
            }(j), this.nav.remove(), this.settings.onDestroy) return this.settings.onDestroy()
        }, updatePositions: function (h) {
            if (this.settings = f(this.settings, h), this.data = w(this.data), this.settings.onUpdatePositions) return this.settings.onUpdatePositions()
        }
    }
});
