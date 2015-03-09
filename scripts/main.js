darkest = (function($, ko, _){
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
            console.log.apply(console, arguments);
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

        self.show_modal = function(mode) {
            self.mode(mode);
            self.parent.select_hero(self);
            $('#details').modal('show');
        }

    };

    var MainViewModel = function() {
        var self = this;
        self.hero_list = ko.observableArray(
            ['bounty_hunter', 'crusader', 'grave_robber', 'hellion',
                'highwayman', 'jester', 'leper', 'occultist', 'plague_doctor', 'vestal']);
        self.heroes = ko.observableArray();
        self.selected = ko.observable(-1);

        self.selected_hero = ko.computed(function() {
            if (self.heroes().length > 0) {
                return self.heroes()[self.selected()];
            } else {
                return new Hero({name:"", resistances:{stun:0,disease:0,debuff:0,move:0,trap:0,poison:0,death_blow:0,bleed:0}});
            }
        });

        self.select_hero = function(hero) {
            self.selected(_.indexOf(self.heroes(), hero));
        };

        self.selected_level = ko.observable(0);
        self.select_level = function(level) {
            console.log(level);
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
        };

        self.svn_revision = ko.observable();

        $.get('data/svn_revision.txt', function(data) {
            self.svn_revision(data);
        });

    };

    debug(get_debug_timer(), "creating viewmodel.");
    var ViewModel = new MainViewModel();

    // start loading data before domready fires
    debug(get_debug_timer(), "start loading data.");
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
        debug(get_debug_timer(), "dom ready.");
        $.when.apply($, calls).done( function() {
            debug(get_debug_timer(), "loading done.");
            _.forEach(hero_data, function(data) {
                ViewModel.add_hero(new Hero(data, ViewModel))
            });
            ViewModel.selected(0);

            $('.item', '#hero-tabs').tab();
            $('#heroes-dropdown').dropdown();

            // remove dimmer if all loading is done.
            ko.applyBindings(ViewModel);
            $('#main-dimmer').dimmer('hide');
        });
    });

    return {
        info: ViewModel,
        debug: {
            hero_data: hero_data
        }
    };

})(jQuery, ko, _);
