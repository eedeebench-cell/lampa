/* Online Mod Direct Play v1.1.1
 * Install alongside https://nb557.github.io/plugins/online_mod.js
 * Uses Lampa's existing source button; no provider or player overrides.
 */
(function () {
    'use strict';

    function install() {
        var lampa = window.Lampa;
        if (!lampa || !lampa.Select || !lampa.Lang ||
            !lampa.Listener || typeof lampa.Listener.follow !== 'function') return false;

        var original = lampa.Select.show;
        if (typeof original !== 'function') return false;
        if (original.onlineModDirectPlay) return true;

        function show(options) {
            if (options &&
                options.title === lampa.Lang.translate('settings_rest_source') &&
                Array.isArray(options.items) &&
                typeof options.onSelect === 'function') {
                for (var i = 0; i < options.items.length; i++) {
                    var item = options.items[i];
                    if (item && !item.hide && item.btn &&
                        typeof item.btn.is === 'function' &&
                        item.btn.is('.full-start__button.view--online_mod') &&
                        !item.btn.is('.hide')) {
                        // The normal menu uses this same callback to open Online Mod.
                        return options.onSelect(item);
                    }
                }
            }
            return original.apply(this, arguments);
        }

        show.onlineModDirectPlay = true;
        lampa.Select.show = show;

        // Move the original button, preserving Lampa's trailer handler.
        // The full event runs before controller navigation is collected.
        lampa.Listener.follow('full', function (event) {
            if (!event || event.type !== 'complite' || !event.object ||
                !event.object.activity || typeof event.object.activity.render !== 'function') return;
            var root = event.object.activity.render();
            if (!root || typeof root.find !== 'function') return;
            var play = root.find('.full-start-new__buttons .button--play');
            var trailers = root.find('.buttons--container .view--trailer').not('.hide');
            if (!play.length || !trailers.length) return;
            trailers.insertAfter(play);
            trailers.on('hover:focus', function () {
                if (event.link && event.link.items && event.link.items[0]) {
                    event.link.items[0].last = this;
                }
            });
        });
        return true;
    }

    if (!install()) {
        var attempts = 0;
        var timer = setInterval(function () {
            if (install() || ++attempts >= 120) clearInterval(timer);
        }, 500);
    }
}());
