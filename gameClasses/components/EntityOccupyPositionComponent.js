/**
 * When added to an Entity, automatically occupy tiles based on entity position
 */
var EntityOccupyPositionComponent = IgeEventingClass.extend({
    classId: 'EntityOccupyPositionComponent',
    componentId: 'occupyPosition',

    /**
     * @constructor
     * @param {IgeObject} entity The object that the component is added to.
     * @param {Object=} options The options object that was passed to the component during
     * the call to addComponent.
     */
    init: function (entity, options) {
        this._entity = entity;
        this._options = options;

        // Set the pan component to inactive to start with
        this._enabled = false;
    },

    /**
     * Gets / sets the enabled flag. If set to true, the
     * position of the entity will be painted on the IgeTileMap2d
     * that the entity is mount to
     * @param {Boolean=} val
     * @return {*}
     */
    enabled: function (val) {
        var self = this;

        if (val !== undefined) {
            this._enabled = val;


            if (this._enabled) {
                this._entity.addBehaviour('occupy_position_behaviour', this._behaviour);
            } else {
                this._entity.removeBehaviour('occupy_position_behaviour');
            }

            return this._entity;
        }

        return this._enabled;
    },

    /**
     * Handle entity movement
     * @private
     */
    _behaviour: function () {
        //Check if prev and current position changed
        var currentOverTilesGeometry = this.overTiles();
        var positionChanged = false;
        for(var i in currentOverTilesGeometry) {
            //Convert point if needed to ISO
            if (this.parent()._mountMode === 1) {
                currentOverTilesGeometry[i].thisToIso();
            }

            if(!this.overTilesGeometry || !this.overTilesGeometry[i]) {
                positionChanged = true;
                continue;
            }
            if(currentOverTilesGeometry[i].x!=this.overTilesGeometry[i].x) {
                positionChanged = true;
                continue;
            }
            if(currentOverTilesGeometry[i].y!=this.overTilesGeometry[i].y) {
                positionChanged = true;
                continue;
            }

        }


        //Only if the player moved, unOccupy && occupy
        if(positionChanged) {
            //unOccupy old position tiles
            for(var i in this.overTilesGeometry) {
                this.parent().unOccupyTile(this.overTilesGeometry[i].x, this.overTilesGeometry[i].y, this.width(), this.height());
            }

            //Occupy current position tiles
            this.overTilesGeometry = currentOverTilesGeometry;
            for(var i in this.overTilesGeometry) {
                this.parent().occupyTile(this.overTilesGeometry[i].x, this.overTilesGeometry[i].y, this.width(), this.height(), this);
            }
        }

    }
});

