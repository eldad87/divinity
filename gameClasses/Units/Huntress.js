var Huntress = Unit.extend({
    classId: 'Huntress',
    init: function () {
        Unit.prototype.init.call(
            this,
            {move:{speed:0.1}, moveStop:{}, 'attack':{type: attack.normal, amount: 10, range: 1, cooldown: 1, lastUsageTime:0}},
            {type: armor.medium, amount: 2},
            {max: 240.0, current: 240.0},
            {max: 0.0, current: 0.0},
            4
        );
    }
});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Huntress; }