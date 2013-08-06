var Wisp = Unit.extend({
    classId: 'Wisp',
    init: function () {
        Unit.prototype.init.call(
            this,
            {move:{speed:0.1}, build:{}},
            {buildGeneric:{range:0, isRepeatable: true, cooldown: 1, lastUsageTime:0, progress:40}, moveStop:{}, buildTreeOfLife:{}},
            {type: armor.medium, amount: 1},
            {max: 70.0, current: 70.0},
            {max: 0.0, current: 0.0},
            4
        );
    },


    /**
     * Buttons
     */
    buildButton: function(pos, selectedEntities, target) {
       this.getCommand().buildEntitiesActionsGrid([this], ['buildTreeOfLife', 'buildAncientOfWar']);
       return true; //Stop stoppropagation
    },

    buildTreeOfLifeButton: function(pos, selectedEntities, target) {
        return this._buildButtonHelper(TreeOfLife, target);
    }
});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Wisp; }