var Wisp = Unit.extend({
    classId: 'Wisp',
    init: function () {
        Unit.prototype.init.call(
            this,
            {move:{speed:0.1}, build:{}},
            {buildGeneric:{range:0, isRepeatable: true, cooldown: 1, lastUsageTime:0}, moveStop:{}, buildTreeOfLife:{}},
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
        return this._build(TreeOfLife, target);
    },

    buildGenericAction: function(target, args) {
        ige.log('building...');
        return true;
    },

    _build: function(building, target) {
        if(!target) {
            //Click on button, set cursor with building
            var tempItem = new building( this.parent(), -1000, -1000);

            this.getCommand().cursorItem(tempItem);

            //Reset actions-buttons grid
            this.getCommand().buildEntitiesActionsGrid([this], []);

            return true; //Stop stoppropagation
        }


        var cursorItem = this.getCommand().cursorItem();
        if(!cursorItem) {
            return false;
        }

        //Click on map, check if can build
        if(cursorItem.isOnDirt() || cursorItem.isOnEntity()) {
            return false;
        }

        //Reset cursor
        this.getCommand().cursorItem(false, true);



        //Build
        if(target.x==undefined) {
            //Selected entity provided, get it's position
            //target = this._getEntityTile(target);
            target = target._translate;
        }

        this.action('buildGeneric', target, [cursorItem.id()]);

        return true; //Stop stoppropagation
    }

});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Wisp; }