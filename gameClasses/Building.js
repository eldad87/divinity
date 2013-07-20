var Building = BaseEntity.extend({
    classId: 'Building',

    /**
     *
     * @param actions - main actions, will be displayed when unit is selected
     * @param subActions - actions that will appear on navigation (I.e build)
     * @param armor
     * @param hp
     * @param mana
     */
    init: function (actions, subActions, armor, hp, mana) {
        BaseEntity.prototype.init.call(this, actions, subActions, armor, hp, mana);
    },

    isOnDirt: function() {
        return ige.$('DirtLayer').map.collision( this.data('tileX'), this.data('tileY'),
                                                    this.data('tileWidth'), this.data('tileHeight') );
    },

    isOnEntity: function() {
        // Check the tile is not currently occupied!
        return this.parent().map.collision( this.data('tileX'), this.data('tileY'),
                                                    this.data('tileWidth'), this.data('tileHeight') );
    },

    changeOpacityBasedOnTopography: function() {
        var isOnDirt =  this.isOnDirt(),
            isOnEntity = this.isOnEntity();

        if(isOnDirt && isOnEntity) {
            this.opacity(0.1);
        } else if(isOnDirt || isOnEntity) {
            this.opacity(0.2);
        } else {
            this.opacity(0.8);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Building; }