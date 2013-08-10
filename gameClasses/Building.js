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
            /*this.box2dBody({
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
                        type: 'box'
                    }
                }]
            });*/
            this.cannonBody({
                type: 'static',
                mass: 0,
                fixtures: [{
                    shape: {
                        type: 'box'
                    }
                }]
            });
        }
        /* CEXCLUDE */
    },

    _getMountedTextureEntity: function() {
        return this.imageEntity;
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
    },


    /**
     * Places the item down on the map by setting the tiles it
     * is "over" as occupied by the item on the tile map.
     * @return {*}
     */
    place: function () {
        // Call the occupyTile method with the tile details.
        // This method doesn't exist in IgeEntity but is instead
        // added to an entity when that entity is mounted to a
        // tile map. The method tells the tile map that the
        // entity is mounted to that the tiles specified are now
        // taken up by this entity.
        this.occupyTile(
            this.data('tileX'),
            this.data('tileY'),
            this.data('tileWidth'),
            this.data('tileHeight')
        );

        //ige.log('BUILDING occupying: ' + this.data('tileX') + ', ' + this.data('tileY') + ', ' + this.data('tileWidth') + ', ' + this.data('tileHeight'));
        this.data('placed', true);

        return this;
    },

    /**
     * Handles destroying the entity from memory.
     */
    destroy: function () {
        // Un-occupy the tiles this entity currently occupies
        if (this.data('placed')) {
            this.unOccupyTile(
                this.data('tileX'),
                this.data('tileY'),
                this.data('tileWidth'),
                this.data('tileHeight')
            );

            this.data('placed', false);
        }

        // Call the parent class destroy method
        BaseEntity.prototype.destroy.call(this);
    },

    getType: function() {
        return 'Building';
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Building; }