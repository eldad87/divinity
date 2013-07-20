var Wisp = Unit.extend({
    classId: 'Wisp',
    init: function () {
        Unit.prototype.init.call(
            this,
            {move:{speed:0.1}, build:{}},
            {moveStop:{}, buildTreeOfLife:{range:0, isRepeatable: true, cooldown: 1, lastUsageTime:0}},
            {type: armor.medium, amount: 1},
            {max: 70.0, current: 70.0},
            {max: 0.0, current: 0.0},
            4
        );
    },


    /**
     * Buttons
     */
    buildButton: function(pos, selectedEntities, endTile, overEntityId) {
       this.getCommand().buildEntitiesActionsGrid([this], ['buildTreeOfLife', 'buildAncientOfWar']);
       return true; //Stop stoppropagation
    },

    buildTreeOfLifeButton: function(pos, selectedEntities, endTile, overEntityId) {
        if(!endTile) {
            //Click on button, set cursor with building
            var tempItem = new TreeOfLife( this.parent(), -1000, -1000);

            this.getCommand().cursorItem(tempItem);
            return true; //Stop stoppropagation
        }

        //Click on map, check if can build

        //Reset cursor
        this.getCommand().cursorItem(false);

        //Build


        return true; //Stop stoppropagation
    }
});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Wisp; }