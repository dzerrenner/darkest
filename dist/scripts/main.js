require.config({
    baseUrl: "",
    paths: {
        "knockout": "//cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-debug",
        "lodash": "//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.4.0/lodash.min",
        "moment": "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min",
        "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min",
        "semantic": "//cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.11.1/semantic.min",
        "knockout-amd-helpers": "scripts/lib/knockout-amd-helpers",
        "text": "scripts/lib/text"
    }
});

// darkest = (function($, ko, _){
require(["jquery", "knockout", "lodash", "moment", "semantic", "knockout-amd-helpers", "text"], function($, ko, _, moment){
    function composeString(bindingConfig) {
        var result = bindingConfig.value;
        if (bindingConfig.prefix) {
            result = bindingConfig.prefix + result;
        }
        if (bindingConfig.suffix) {
            result += bindingConfig.suffix;
        }
        return result;
    }

    var get_debug_timer = function() {
        return "[" + moment().diff(DDEBUG.darkest_timer) + "ms]";
    };

    var debug = function() {
        if (DDEBUG.active) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(get_debug_timer());
            console.log.apply(console, args);
        }
    };

    ko.bindingHandlers.formatAttr = {
        init: function(element, accessor) {
            $(element).attr(accessor().attr, composeString(accessor()));
        },
        update: function(element, accessor) {
            $(element).attr(accessor().attr, composeString(accessor()));
        }
    };

    var Resistance = function(name, value) {
        var self = this;
        self.name = ko.observable(_.startCase(name));
        self.value = ko.observable(_.trimRight(value, '%'));
    };

    var Hero = function(data, parent) {
        var self = this;
        self.parent = parent;
        self.data = data;
        self.name = ko.computed(function() {
            var name = self.data.name;
            return _.startCase(name);
        });
        self.raw_name = ko.computed(function() {
            return self.data.name;
        });

        self.armour = ko.observableArray(_.values(self.data.armour));
        self.weapon = ko.observableArray(_.values(self.data.weapon));

        var skills = self.data.combat_skills;
        var skill_array = [];
        _.forEach(skills, function(l, name) {
            skill_array.push({name: _.startCase(name), skills: l});
        });

        self.skills = ko.observableArray(skill_array);

        self.resistances = ko.observableArray();
        _.forEach(self.data.resistances, function(n,v) {
            self.resistances.push(new Resistance(v,n));
        });

        self.getResistance = function(name) {
            return _.find(self.resistances(), function(res) {
                return res.name() == name;
            });
        };

        self.get_weapon = function(key) {
            return self.weapon()[self.parent.selected_level()][key];
        };

        self.get_armour = function(key) {
            return self.armour()[self.parent.selected_level()][key];
        };

        self.get_spd = function() {
            return parseInt(self.get_weapon('spd')) + parseInt(self.get_armour('spd'));
        };

        self.tags = ko.computed(function() {
            var tags = self.data ? self.data.tags || [] : [];
            return tags.join(", ");
        });

        self.mode = ko.observable('Resistances');
    };

    var MainViewModel = function() {
        var self = this;
        self.hero_list = ko.observableArray(
            ['bounty_hunter', 'crusader', 'grave_robber', 'hellion',
                'highwayman', 'jester', 'leper', 'occultist', 'plague_doctor', 'vestal']);
        self.heroes = ko.observableArray();
        self.selected = ko.observable(-1);

        self.selected_hero = ko.computed(function() {
            if (DDEBUG.acitve) {
                var name = "undefined";
                if (self.heroes()[self.selected()]) {
                    name = self.heroes()[self.selected()].name();
                }
                debug("selected_hero: ", self.selected(), name);
            }
            return self.heroes()[self.selected()];
        });

        self.show_details = function(hero) {
            debug("show hero");
            self.select_hero(hero);
            self.nav({section: 'heroes', page: 'details'});
        };

        self.select_hero = function(hero) {
            debug("select_hero");
            self.selected(_.indexOf(self.heroes(), hero));
        };

        self.selected_level = ko.observable(0);
        self.select_level = function(level) {
            self.selected_level(level);
        };
        self.inc_level = function() {
            if (self.selected_level() < 4) {
                self.selected_level(self.selected_level() + 1);
            }
        };
        self.dec_level = function() {
            if (self.selected_level() > 0) {
                self.selected_level(self.selected_level() - 1);
            }
        };

        self.add_hero = function(hero) {
            self.heroes.push(hero);
            self.selected(self.heroes().length - 1);
        };

        self.nav = ko.observable({section: 'heroes', page: 'overview'});


        self.show_hero_overview = ko.computed(function() {
            var nav = self.nav();
            return (nav.section == 'heroes' && nav.page == 'overview');
        });

        self.svn_revision = ko.observable();

        $.get('data/svn_revision.txt', function(data) {
            self.svn_revision(data);
        });

        if (DDEBUG.active) {
            self.selected_level.subscribe(function(newValue) {
                debug("new upgrade level selected:", newValue);
            });
            self.selected.subscribe(function(newValue) {
                debug("new hero selected:", newValue);
            });
        }
    };

    debug("creating viewmodel.");
    var viewmodel = new MainViewModel();

    // start loading data before domready fires
    debug("start loading data.");
    // TODO: move this to the beginning of the markup to speed up loading time

    var hero_list = ['bounty_hunter', 'crusader', 'grave_robber', 'hellion',
        'highwayman', 'jester', 'leper', 'occultist', 'plague_doctor', 'vestal'];
    var hero_data = [];
    var calls = [];
    _.forEach(hero_list, function(hero) {
        calls.push($.getJSON('data/heroes/' + hero + ".json", function(data) {
            hero_data.push(data);
        }));
    });

    // end loading code

    $(document).ready(function() {
        debug("dom ready.");
        $.when.apply($, calls).done( function() {
            debug("loading done, creating hero instances.");
            _.forEach(_.sortBy(hero_data, 'name'), function(data) {
                debug("add hero:", data.name);
                viewmodel.add_hero(new Hero(data, viewmodel))
            });
            debug("object creation done.");
            viewmodel.selected(0);

            $('.item', '#hero-tabs').tab();
            $('#heroes-dropdown').dropdown();

            // remove dimmer if all loading is done.
            ko.applyBindings(viewmodel);
            $('#main-dimmer').dimmer('hide');
        });
    });

    return {
        info: viewmodel,
        debug: {
            hero_data: hero_data
        }
    };

});
