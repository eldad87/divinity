var Archer = Unit.extend({
    classId: 'Archer',
    init: function () {
        Unit.prototype.init.call(
            this,
            {move:{speed:0.1}, moveStop:{}, attack:{type: attack.piercing, amount: 7, range: 3, cooldown: 1, lastUsageTime: 0}},
            {type: armor.light, amount: 0},
            {max: 120.0, current: 120.0},
            {max: 0.0, current: 0.0},
            0
        );
    }
});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Archer; }