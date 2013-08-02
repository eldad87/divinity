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

        /* CEXCLUDE */
        if (ige.isServer) {
            // Set bounding box
            this.box2dBody({
                type: 'static',
                linearDamping: 0.0,
                angularDamping: 0.1,
                allowSleep: true,
                bullet: false,
                gravitic: true,
                fixedRotation: false,
                fixtures: [{
                    density: 1.0,
                    friction: 0.5,
                    restitution: 0.2,
                    shape: {
                        type: 'circle'
                    }
                }]
            });
        }
        /* CEXCLUDE */
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
    },


    /**
     * Building progress
     */
    addBuildingProgress: function(val) {
        var bp = this.getUnitSetting('custom', 'buildingProgress')  || 0;
        bp += val;

        this.setUnitSetting('custom', 'buildingProgress', bp);
        return this;
    },

    renderBuildingProgress: function() {
        var self = this;

        // Define the player fuel bar
        new EntityUiProgressBar()
            .id( self.id() + '_building_progress')
            .max(self.getUnitSetting('healthPoints').max)
            .min(0)
            .bindMethod(self, self.getUnitSetting ,['custom', 'buildingProgress'])
            .top(-1 * self.size3d().y + 10)
            .drawBounds(false)
            .drawBoundsData(false)
            .highlight(false)
            .width(self.size3d().x * 2)
            .height(5)
            .barColor('#00dce6')
            .mount(this);
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Building; }