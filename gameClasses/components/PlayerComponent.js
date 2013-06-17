/**
 * Adds mouse control to the entity this component is added to.
 * @type {IgeClass}
 */
var PlayerComponent = IgeClass.extend({
	classId: 'PlayerComponent',
	componentId: 'player',
	
	init: function (entity, options) {
		var self = this;

		// Store the entity that this component has been added to
		this._entity = entity;

		// Store any options that were passed to us
		this._options = options;

        if (!ige.isServer) {
            // Listen for the mouse up event
            ige.input.on('mouseUp', function (event, x, y, button) {
                //Prediction
                self._mouseUp(event, x, y, button);

                // Send a message to the server asking to path to this tile
                var endTile = self._entity.parent().mouseToTile();
                ige.network.send('playerControlToTile', [endTile.x, endTile.y]);
            });

            // Listen for mouse events on the texture map
            /*this._entity._parent.mouseUp(function (tileX, tileY, event) {
                // Send a message to the server asking to path to this tile
                ige.network.send('playerControlToTile', [tileX, tileY]);
            });*/
        }
	},

	/**
	 * Handles what we do when a mouseUp event is fired from the engine.
     * @param event
     * @param x
     * @param y
     * @param button
     * @private
     */
	_mouseUp: function (event, x, y, button) {
		// Get the tile co-ordinates that the mouse is currently over
		var endTile = this._entity.parent().mouseToTile(),
			currentPosition = this._entity._translate,
			startTile,
			newPath,
			endPoint = this._entity.path.endPoint(),

            self = this,
            tileChecker = function (tileData, tileX, tileY) {

//                self._entity.parent().occupyTile(tileX, tileY, self._entity.width(), self._entity.height(), self._entity);
/*if(self._entity.path.previousTargetCell()) {
    debugger;
}
if(self._entity.path.currentTargetCell()) {
    debugger;
}*/
                // If the map tile data is set, don't path along it
                return !tileData;
            };;

		// Check if we have a current path, if so, add to it
		if (endPoint) {
			// Use the end point of the existing path as the
			// start point of the new path
			startTile = endPoint;
		} else {
			// Calculate which tile our character is currently "over"
			if (this._entity._parent.isometricMounts()) {
				startTile = this._entity._parent.pointToTile(currentPosition.toIso());
			} else {
				startTile = this._entity._parent.pointToTile(currentPosition);
			}
		}

		// Create a path from the current position to the target tile
		newPath = ige.client.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);

		// Tell the entity to start pathing along the new path
		this._entity
			.path.clear()
			.path.add(newPath)
			.path.start();
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerComponent; }