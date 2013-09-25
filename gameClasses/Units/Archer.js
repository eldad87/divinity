var Archer = Unit.extend({
    classId: 'Archer',
    init: function () {
        Unit.prototype.init.call(
            this,
            {'move':{speed:1}, 'moveStop':{}, 'attack':{type: attack.piercing, amount: 7, cooldown: 1, range: 3}},
            {type: armor.light, amount: 0},
            {max: 120, current: 120},
            {max: 0, current: 0},
            0
        );
    }
});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Archer; }