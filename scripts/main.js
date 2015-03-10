require.config({
    baseUrl: "",
    paths: {
        "knockout": "//cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-debug",
        "lodash": "//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.4.0/lodash.min",
        "moment": "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min",
        "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min",
        "semantic": "//cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.11.1/semantic.min",
        "knockout-amd-helpers": "scripts/lib/knockout-amd-helpers",
        "text": "scripts/lib/text",
        "darkest": "scripts/darkest"
    },
    shim: {
        "semantic": {
            deps: ["jquery"],
            // Export multiple functions: http://stackoverflow.com/a/18650150/14731
            exports: "$",
            init: function($) {
                return {
                    "$.fn.dimmer": $.fn.dimmer,
                    "$.fn.dimmer.settings": $.fn.dimmer.settings,
                    "$.fn.dropdown": $.fn.dropdown,
                    "$.fn.dropdown.settings": $.fn.dropdown.settings,
                    "$.fn.modal": $.fn.modal,
                    "$.fn.modal.settings": $.fn.modal.settings,
                    "$.fn.popup": $.fn.popup,
                    "$.fn.popup.settings": $.fn.popup.settings,
                    "$.fn.search": $.fn.search,
                    "$.fn.search.settings": $.fn.search.settings,
                    "$.fn.tab": $.fn.tab,
                    "$.fn.tab.settings": $.fn.tab.settings,
                    "$.fn.transition": $.fn.transition,
                    "$.fn.transition.settings": $.fn.transition.settings
                };
            }
        }
    }
});

require(['darkest'], function(darkest) {
    // populate the module to the global namespace
    window.darkest = darkest;
});