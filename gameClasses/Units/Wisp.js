var Wisp = Unit.extend({
    classId: 'Wisp',
    init: function () {
        Unit.prototype.init.call(
            this,
            {move:{speed:0.1}, moveStop:{}, build:{}},
            {type: armor.medium, amount: 1},
            {max: 70.0, current: 70.0},
            {max: 0.0, current: 0.0},
            4
        );
    },


    /**
     * Buttons
     */
    buildButton: function(endTile, overEntityId) {
        ige.$('vp1').Command.buildEntitiesActionsGrid([this], ['buildTreeOfLife', 'buildAncientOfWar']);
    },
    cancelButton: function(endTile, overEntityId) {
        ige.$('vp1').Command.rebuildActionButtonsBasedOnSelectedEntities();
    },

    buildTreeOfLifeButton: function(endTile, overEntityId) {

    },
    buildAncientOfWarButton: function(endTile, overEntityId) {

    }

});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Wisp; }