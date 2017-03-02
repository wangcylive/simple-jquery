/**
 * Created by wangchunyang on 16/4/15.
 */
;(function (factory) {
    if ("function" === typeof define && define.amd) {
        define(factory);
    } else if ("object" === typeof exports) {
        module.exports = factory();
    } else {
        window.$ = factory();
    }
}(function () {
    var $ = function (selector) {
        return new $.fn.init(selector);
    };

    var version = "1.3.0",
        expando = "JQ" + (version + Math.random() + "").replace(/\D/g, ""),
        guid = 0;  // globally unique identifier

    $.expando = expando;
    $.version = version;

    var _eventsCache = {};

    function setElemGuid(elem) {
        if (!elem.hasOwnProperty(expando)) {
            Object.defineProperty(elem, expando, {
                value: ++guid
            });
        }

        return elem[expando];
    }

    function getElemEvents(elem, event) {
        if (elem.hasOwnProperty(expando)) {
            var elemGuid = elem[expando];

            var events = _eventsCache[event];

            if (events) {
                events = events.filter(function (item) {
                    return item.guid === elemGuid;
                });

                if (events.length > 0) {
                    return events;
                }
            }
        }

        return [];
    }

    var _defaultDisplayCache = {};

    (function () {
        if (typeof window.CustomEvent === "function") {
            return false;
        }
        function CustomEvent(event, params) {
            params = params || {bubbles: false, cancelable: false, detail: null};
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    }());

    function createEvents(types, params) {
        var events = [];
        params = params || {bubbles: false, cancelable: false, detail: null};

        if ("string" === typeof types && (types = $.trim(types))) {
            types = types.split(/\s+/);

            types.forEach(function (event) {
                events.push(new CustomEvent(event, params));
            });

        }

        return events;
    }

    function _eventHandler(event) {
        var _this = this;

        if (_eventsCache[event.type]) {
            _eventsCache[event.type].filter(function (item) {
                return item.guid === _this[expando];
            }).forEach(function (item) {
                if (item.selector == null) {  // not event delegation
                    item.handler.call(_this, event);
                } else {

                    // has event delegation, the first step to use querySelectorAll found nodes,
                    // then match and event.target, if matched call event handler.
                    // iterative bubbling up unit the target is equal to the delegate object.
                    var matchNodeList = [];

                    try {
                        matchNodeList = arrFn.slice.call(_this.querySelectorAll(item.selector), 0);
                    } catch (e) {
                    }

                    var target = event.target;

                    while (target !== _this) {
                        if (-1 !== matchNodeList.indexOf(target)) {
                            item.handler.call(target, event);
                        }

                        target = target.parentNode;
                    }
                }
            });
        }
    }

    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

    var objToString = Object.prototype.toString;

    var arrFn = Array.prototype;

    $.css = function (elem, style) {
        if (elem && 1 === elem.nodeType) {
            return window.getComputedStyle(elem, null)[style]
        }
    };

    $.isHidden = function (elem) {
        return $.css(elem, "display") === "none";
    };

    $.trim = function (text) {
        return text == null ? "" : (text + "").replace(rtrim, "");
    };

    $.isArray = function (arg) {
        return Array.isArray(arg);
    };

    $.arrayFrom = function (arg) {
        if (Array.from) {
            return Array.from(arg);
        } else {
            return Array.prototype.slice.call(arg, 0);
        }
    };

    $.isObject = function (arg) {
        return objToString.call(arg) === "[object Object]";
    };

    function showHide(elements, show) {
        var elem, style, nodeName;

        for (var i = 0; i < elements.length; i++) {
            elem = elements[i];
            style = elem.style;
            nodeName = elem.nodeName;

            if (show) {
                style.display = "";

                if ($.isHidden(elem)) {
                    if (_defaultDisplayCache.hasOwnProperty(nodeName)) {
                        style.display = _defaultDisplayCache[nodeName];
                    } else {
                        style.display = _defaultDisplayCache[nodeName] = defaultDisplay(elem.nodeName);
                    }
                } else {
                    _defaultDisplayCache[nodeName] = $.css(elem, "display");
                }
            } else {
                if (!$.isHidden(elem)) {
                    _defaultDisplayCache[nodeName] = $.css(elem, "display");

                    style.display = "none";
                }
            }
        }
    }

    function defaultDisplay(nodeName) {
        var elem = document.createElement(nodeName);
        document.body.appendChild(elem);

        var display = $.css(elem, "display");

        document.body.removeChild(elem);

        return display;
    }

    $.fn = $.prototype = {
        constructor: $,
        eq: function (index) {
            if ("number" === typeof index) {
                var item = this[index];

                return $.fn.init(item);
            }

            return this;
        },
        first: function () {
            return $.fn.eq.call(this, 0);
        },
        last: function () {
            var index = this.length - 1;
            return $.fn.eq.call(this, index);
        },
        append: function (content) {
            var frag = document.createDocumentFragment();

            if (content instanceof $ || /^\[object (NodeList|HTMLCollection)]$/.test(objToString.call(content))) {
                if (this.last()[0]) {
                    arrFn.slice.call(content).forEach(function (item) {
                        frag.appendChild(item);
                    });

                    this.last()[0].appendChild(frag);
                }
            } else if (typeof content === "string") {
                this.each(function (item) {
                    item.appendChild(document.createTextNode(content));
                });
            } else if (1 === content.nodeType || 11 === content.nodeType) {
                if (this.last()[0]) {
                    this.last()[0].appendChild(content);
                }
            }

            frag = null;
            return this;
        },
        attr: function (name, value) {
            if ($.isObject(name)) {
                this.each(function (elem) {
                    for (var x in name) {
                        if (name.hasOwnProperty(x)) {
                            try {
                                elem.setAttribute(x, name[x]);
                            } catch (e) {
                            }
                        }
                    }
                });
            } else if ("string" === typeof name && (name = $.trim(name))) {
                if (arguments.length <= 1) {
                    var elem = this.first()[0];

                    return elem ? elem.getAttribute(name) : null;
                } else {
                    this.each(function (elem) {
                        elem.setAttribute(name, value + "");
                    });
                }
            }

            return this;
        },
        prop: function (name, value) {
            if ($.isObject(name)) {
                this.each(function (elem) {
                    for (var x in name) {
                        if (name.hasOwnProperty(x)) {
                            elem[x] = name[x];
                        }
                    }
                });
            } else if ("string" === typeof name && (name = $.trim(name))) {
                if (arguments.length <= 1) {
                    var elem = this.first()[0];

                    return elem ? elem[name] : null;
                } else {
                    this.each(function (elem) {
                        elem[name] = value;
                    });
                }
            }

            return this;
        },
        css: function (name, value) {
            if ($.isObject(name)) {
                this.each(function (elem) {
                    for (var x in name) {
                        if (name.hasOwnProperty(x)) {
                            elem.style[x] = name[x];
                        }
                    }
                })
            } else if ("string" === typeof name && (name = $.trim(name))) {
                if (arguments.length === 1) {
                    var elem = this.first()[0];

                    return $.css(elem, name);
                } else if (arguments.length >= 2) {
                    this.each(function (elem) {
                        elem.style[name] = value;
                    })
                }
            }

            return this;
        },
        each: function (callback) {
            var length = this.length;

            if (length > 0 && "function" === typeof callback) {
                var i = 0,
                    elem;

                for (i; i < length; i++) {
                    elem = this[i];
                    callback.call(elem, elem, i);
                }
            }

            return this;
        },
        on: function (types, selector, handler, one) {
            var _this = this;

            if (handler == null) {
                handler = selector;
                selector = undefined;
            }

            if (!handler) {
                return this;
            }

            if (!handler.hasOwnProperty("guid")) {
                handler.guid = ++guid;
            }

            var eventsArr = $.trim(types).split(/\s+/);

            if (eventsArr.length > 0) {
                this.each(function (elem) {
                    var elemGuid = setElemGuid(elem);

                    eventsArr.forEach(function (event) {
                        _eventsCache[event] = _eventsCache[event] || [];

                        var elemEvents = getElemEvents(elem, event);

                        if (0 === elemEvents.length) {
                            elem.addEventListener(event, _eventHandler, false);
                        }

                        var handlerObj = {
                            guid: elemGuid,
                            type: event,
                            handler: handler,
                            selector: selector,
                            elem: elem
                        };

                        if (one === 1) {
                            handlerObj.handler = function (event) {
                                $.fn.off.call(_this, event.type, selector, handlerObj.handler);

                                handler.apply(elem, arguments);
                            };

                            handlerObj.handler.guid = handler.guid;
                        }

                        _eventsCache[event].push(handlerObj);
                    });
                });
            }

            return this;
        },
        one: function (types, selector, handler) {
            $.fn.on.call(this, types, selector, handler, 1);

            return this;
        },
        off: function (types, selector, handler) {
            if (handler == null) {
                handler = selector;
                selector = undefined;
            }

            if ("" === $.trim(types)) {
                this.each(function (elem) {
                    var elemGuid = elem[expando];

                    if (elemGuid) {
                        for (var x in _eventsCache) {
                            _eventsCache[x] = _eventsCache[x].filter(function (item) {
                                return item.guid !== elemGuid;
                            });

                            elem.removeEventListener(x, _eventHandler, false);
                        }
                    }
                });
            } else {
                var eventsArr = $.trim(types).split(/\s+/);

                this.each(function (elem) {
                    var elemGuid = elem[expando];

                    if (elemGuid !== undefined) {
                        eventsArr.forEach(function (event) {
                            var _eventsArr = _eventsCache[event];
                            if (_eventsArr) {
                                if (!handler) {
                                    _eventsCache[event] = _eventsArr.filter(function (item) {
                                        return item.guid !== elemGuid || item.selector !== selector;
                                    });
                                } else {
                                    _eventsCache[event] = _eventsArr.filter(function (item) {
                                        return item.guid !== elemGuid || item.selector !== selector ||
                                            item.handler.guid !== handler.guid;
                                    })
                                }

                                if (getElemEvents(elem, event).length === 0) {
                                    elem.removeEventListener(event, _eventHandler, false);
                                }
                            }
                        });
                    }
                });
            }

            return this;
        },
        trigger: function (types, params) {
            params = params || {
                    bubbles: true,
                    cancelable: true,
                    detail: null
                };
            var events = createEvents(types, params);

            this.each(function (elem) {
                events.forEach(function (event) {
                    elem.dispatchEvent(event);
                })
            });

            return this;
        },
        addClass: function (className) {
            if ("string" === typeof className && (className = $.trim(className))) {
                className = className.split(/\s+/);

                this.each(function (itemNode) {
                    var curClassName = itemNode.className.split(/\s+/);

                    className.forEach(function (itemName) {
                        if (-1 === curClassName.indexOf(itemName)) {
                            curClassName.push(itemName);
                        }
                    });

                    itemNode.className = curClassName.join(" ");
                });
            }

            return this;
        },
        removeClass: function (className) {
            if ("string" === typeof className && (className = $.trim(className))) {
                className = className.split(/\s+/);

                this.each(function (itemNode) {
                    var curClassName = itemNode.className.split(/\s+/);

                    className.forEach(function (itemName) {
                        var index = curClassName.indexOf(itemName);

                        if (-1 !== index) {
                            curClassName.splice(index, 1);
                        }
                    });

                    itemNode.className = curClassName.join(" ");
                })
            }

            return this;
        },
        hasClass: function (className) {
            if ("string" === typeof className && (className = $.trim(className)) && this.length > 0) {
                className = className.split(/\s+/);

                var has = true;

                for (var i = 0; i < this.length; i++) {
                    var itemNode = this[i];

                    has = className.every(function (itemName) {
                        return -1 !== itemNode.className.split(/\s+/).indexOf(itemName);
                    });

                    if (!has) {
                        return false;
                    }
                }

                return has;
            } else {
                return false;
            }
        },
        show: function () {
            showHide(this, 1);

            return this;
        },
        hide: function () {
            showHide(this);

            return this;
        },
        html: function (string) {
            if (arguments.length > 0) {
                this.each(function (elem) {
                    elem.innerHTML = string + "";
                })
            } else {
                var elem = this.first()[0];

                return elem ? elem.innerHTML : "";
            }

            return this;
        },
        text: function (string) {
            if (arguments.length > 0) {
                this.each(function (elem) {
                    elem.textContent = string + "";
                })
            } else {
                var elem = this.first()[0];

                return elem ? elem.textContent : "";
            }

            return this;
        },
        empty: function () {
            this.each(function (elem) {
                if (elem.childNodes) {
                    var childNodes = elem.childNodes;

                    childNodes = $.arrayFrom(childNodes);

                    childNodes.forEach(function (item) {
                        elem.removeChild(item);
                    });
                }
            });

            return this;
        },
        remove: function () {
            this.each(function (elem) {
                if (elem.parentNode) {
                    $(elem).off();

                    elem.parentNode.removeChild(elem);
                }
            });

            return this;
        },
        find: function (selector) {
            this.selector = selector;

            var arrayElem = [];

            this.each(function (elem) {
                try {
                    var htmlCollection = elem.querySelectorAll(selector);

                    htmlCollection = $.arrayFrom(htmlCollection);

                    arrayElem = arrayElem.concat(htmlCollection);
                } catch (e) {
                }
            });

            return $(arrayElem);
        }
    };

    $.fn.init = function (selector) {
        var _this = this;

        if (selector == null) {
            return _this;
        }

        if (1 === selector.nodeType) {
            _this[0] = selector;
            _this.selector = "";
            _this.length = 1;

            return _this;
        } else if (/^\[object (NodeList|HTMLCollection)]$/.test(objToString.call(selector))) {
            var elemArr = $.arrayFrom(selector).filter(function (item) {
                return 1 === item.nodeType;
            });

            if (elemArr.length > 0) {
                elemArr.forEach(function (item, index) {
                    _this[index] = item;
                });

                _this.selector = "";
                _this.length = elemArr.length;
            }

            return _this;
        } else if (11 === selector.nodeType) {
            var fragElemArr = $.arrayFrom(selector.children);

            if (fragElemArr.length > 0) {
                fragElemArr.forEach(function (item, index) {
                    _this[index] = item;
                });

                _this.selector = "";
                _this.length = fragElemArr.length;
            }

            return _this;
        } else {
            if (selector === window || selector === document) {
                _this[0] = selector;
                _this.selector = "";
                _this.length = 1;

                return _this;
            } else if ("string" === typeof selector && (selector = $.trim(selector))) {
                var nodeList, nodeLength;

                try {
                    nodeList = document.querySelectorAll(selector);
                    nodeLength = nodeList.length;
                } catch (e) {
                }

                if (nodeLength > 0) {
                    for (var i = 0; i < nodeLength; i++) {
                        _this[i] = nodeList[i];
                    }
                    _this.selector = selector;
                    _this.length = nodeLength;
                }
            } else if ($.isArray(selector)) {

                selector = selector.filter(function (item) {
                    return item.nodeType === 1;
                });

                selector.forEach(function (item, index) {
                    _this[index] = item;
                });

                _this.length = selector.length;
            }

            return _this;
        }
    };

    $.fn.init.prototype = $.fn;

    return $;
}));