var Archer = Unit.extend({
    classId: 'Archer',
    init: function () {
        Unit.prototype.init.call(
            this,
            ['move', 'stopMove', 'attack'],
            1,
            {type: attack.piercing, amount: 10, cooldown: 1, range: 3},
            {type: armor.light, amount: 0},
            {max: 120, current: 120},
            {max: 0, current: 0},
            0
        );
    }
});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Archer; }