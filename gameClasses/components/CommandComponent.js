/**
 * When added to a viewport, automatically adds mouse controlling
 * capabilities. I.e select units, move units etc.
 */
var CommandComponent = IgeEventingClass.extend({
	classId: 'CommandComponent',
	componentId: 'Command',

	/**
	 * @constructor
	 * @param {IgeObject} entity The object that the component is added to.
	 * @param {Object=} options The options object that was passed to the component during
	 * the call to addComponent.
	 */
	init: function (entity, options) {
		this._entity = entity;
		this._options = options;

		// Set the zoom component to inactive to start with
		this._enabled = false;


        this._mouseStart = [];
        this._mouseEnd = [];

        this._overEntity  = false;
        this._selectedEntities = [];
	},

	/**
	 * Sets / gets the enabled flag. If set to true, zoom
	 * operations will be processed. If false, no zooming will
	 * occur.
	 * @param {Boolean=} val
	 * @return {*}
	 */
	enabled: function (val) {
		var self = this;

		if (val !== undefined) {
			this._enabled = val;

            if (!ige.isServer) {
                if (this._enabled) {
                    // Listen for the mouse events we need to operate a mouse pan
                    this._entity.mouseDown(function (event) { self._mouseDown(event); });
                    this._entity.mouseUp(function (event) { self._mouseUp(event); });
                } else {
                    // Remove the zoom start data
                    delete this._mouseStart;
                }
			}

			return this._entity;
		}

		return this._enabled;
	},

    /**
     * Mouse ove an entity
     * @param val
     * @returns {*}
     */
    entityOver: function(val) {
        if (val !== undefined) {
            this._overEntity = val;

            ige.log('Entity over ' + val);
            return this._entity;
        }

        return this._overEntity;
    },

    /**
     * Select entities
     * @param val
     * @returns {Array}
     */
    selectedEntities: function(val) {
        if (val !== undefined) {
            this._selectedEntities = val;

            ige.log('Selected entities: ' + this._selectedEntities.length );

            return this._selectedEntities;
        }

        return this._selectedEntities;
    },

	/**
	 * Handles the mouseDown event. Records the mouse starting position.
	 * @param event
	 * @private
	 */
	_mouseDown: function (event) {
		if (this._enabled && event.igeViewport.id() === this._entity.id()) {
			// Record the mouse down position - select starting
			this._mouseStart = ige._mousePos.clone();

            this._mouseMoved = false;
		}
	},

	/**
	 * Handles the mouse up event. Finishes the mouse selecting and
	 * removes the starting mouse position.
	 * @param event
	 * @private
	 */
	_mouseUp: function (event) {
		if (this._enabled) {
			// End the select
			if (this._mouseStart) {
                //this._options.objectLayer.pointToTile(ige._mousePos );
				this._mouseEnd = ige._mousePos.clone();

                //Check if mouse moved
                if(this._mouseStart.x != this._mouseEnd.x || this._mouseStart.y !=  this._mouseEnd.y) {
                    this._handleSelection( [ControlComponent.prototype.typeOwn] );
                } else {
                    this._handleClick();
                }

				// Remove the start/end daya
				delete this._mouseStart;
				delete this._mouseEnd;
			}
		}
    },


    /**
     * Handle click
     * @private
     */
    _handleClick: function() {

        var overEntity = this.entityOver(),
            selectedEntities = this.selectedEntities();

        if(overEntity==false) {
            if(!selectedEntities.length) {
                return true; //Nothing to do
            }

            //Move to tile
            var endTile = this._options.objectLayer.pointToTile(this._mouseEnd);
            for(var i in selectedEntities) {
                selectedEntities[i].Control.moveToTile(endTile);
            }

        } else {
            switch(overEntity.Control.controlType()) {
                case ControlComponent.prototype.typeOwn:
                    this.selectedEntities([overEntity]);
                    break;

                case ControlComponent.prototype.typeAlly:
                    this.selectedEntities([]);
                    break;

                case ControlComponent.prototype.typeEnemy:
                    if(!selectedEntities.length) {
                        return true; //Nothing to do
                    }

                    //TODO: Attack
                    break;
            }
        }
    },



    /**
     * Select entities
     * @param allowedControlTypes
     * @private
     */
    _handleSelection: function( allowedControlTypes ) {
        var startTile = this._mouseStart,
            endTile = this._mouseEnd;
        /*if(this._options.objectLayer.isometricMounts()) {
            startTile.toIso();
            endTile.toIso();
        }*/
        startTile = this._options.objectLayer.pointToTile(startTile);
        endTile = this._options.objectLayer.pointToTile(endTile);
        

        var topLeft = {
                x: startTile.x > endTile.x ? endTile.x : startTile.x,
                y: startTile.y > endTile.y ? endTile.y : startTile.y
            },
            bottomRight = {
                x: startTile.x < endTile.x ? endTile.x : startTile.x,
                y: startTile.y < endTile.y ? endTile.y : startTile.y
            },
            width = (topLeft.x > bottomRight.x ? topLeft.x - bottomRight.x : bottomRight.x - topLeft.x),
            height = (topLeft.y > bottomRight.y ? topLeft.y - bottomRight.y : bottomRight.y - topLeft.y);


        //Get entities in selection.
        var selectedEntities = this._getEntitiesInRect(this._options.objectLayer, topLeft.x, topLeft.y, width, height);

        //Go over selected entities and remove unrelated
        var filteredEntities = [];
        if(selectedEntities && allowedControlTypes) {
            for(var i in selectedEntities) {
                if(allowedControlTypes.indexOf( selectedEntities[i].Control.controlType() ) == -1) {
                    //Skip entity
                    continue;
                }

                filteredEntities.push(selectedEntities[i]);
            }
        }

        //Set selected entities
        this.selectedEntities(filteredEntities);
    },

    /**
     * Return all entities in objectLayer that located inside the given rect
     *
     * @param objectLayer
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {Array}
     * @private
     */
    _getEntitiesInRect: function (objectLayer, x, y, width, height) {
        var xi, yi, res = [];

        if (width === undefined) { width = 1; }
        if (height === undefined) { height = 1; }

        if (x !== undefined && y !== undefined) {
            for (yi = 0; yi <= height; yi++) {
                for (xi = 0; xi <= width; xi++) {
                    var data = objectLayer.map.tileData(x + xi, y + yi);
                    if(!data) {
                        continue;
                    }

                    if( data.indexOf == undefined) {
                        res.push(data);
                    } else {
                        res.concat(data);
                    }
                }
            }
        }

        return res;
    }


});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = CommandComponent; }