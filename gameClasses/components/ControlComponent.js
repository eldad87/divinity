/**
 * Determine if the client can control or interact with this entity
 * @type {IgeClass}
 */
var ControlComponent = IgeClass.extend({
	classId: 'ControlComponent',
	componentId: 'Control',

    //Type of control
    typeOwn: 1,
    typeAlly: 2,
    typeEnemy: 3,


	
	init: function (entity, options) {
		var self = this;

		// Store the entity that this component has been added to
		this._entity = entity;

        // Default, everyone are enemies
		this._controlType = this.typeEnemy;

		// Store any options that were passed to us
		this._options = options;


        if (!ige.isServer) {
            var overFunc = function(event) {
                    event.igeViewport.Command.entityOver(this);
                },
                outFunc = function(event) {
                    event.igeViewport.Command.entityOver(false);
                };

            this._entity
                .mouseOver(overFunc)
                .mouseOut(outFunc);
        }
	},

    controlType: function(val) {
        if (val !== undefined) {
            this._controlType = val;

            return this._entity;
        }

        return this._controlType;
    },

    /**
     * Move entity
     * @param endTile
     * @private
     */
    moveToTile: function (endTile) {
        // Get the tile co-ordinates that the mouse is currently over
        var currentPosition = this._entity._translate,
            startTile,
            newPath,

            tileChecker = function (tileData, tileX, tileY) {
                // If the map tile data is set, don't path along it
                return !tileData;
            };

        // Calculate which tile our character is currently "over"
        if (this._entity._parent.isometricMounts()) {
            startTile = this._entity._parent.pointToTile(currentPosition.toIso());
        } else {
            startTile = this._entity._parent.pointToTile(currentPosition);
        }


        if(endTile==startTile) {
            return true; //Nothin to do
        }

        // Send a message to the server asking to path to this tile
        ige.network.send('playerControlToTile', [endTile.x, endTile.y]);  //TODO: do it for all selected entities

        // Create a path from the current position to the target tile
        newPath = ige.client.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);

        // Tell the entity to start pathing along the new path
        this._entity
            .path.clear()
            .path.add(newPath)
            .path.start();
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ControlComponent; }