/**
 * When added to a viewport, automatically adds scrolling by mouse position
 * capabilities to the viewport's camera.
 *
 * TODO: limit rect (x, y, width, height)
 */
var IgeScreenMoveComponent = IgeEventingClass.extend({
	classId: 'IgeScreenMoveComponent',
	componentId: 'screenMove',

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
        // Set continuous movement check to start with
		this._continuousMovement = false;
	},

	/**
	 * Gets / sets the enabled flag. If set to true, pan
	 * operations will be processed. If false, no panning will
	 * occur.
	 * @param {Boolean=} val
	 * @return {*}
	 */
	enabled: function (val) {
		var self = this;

		if (val !== undefined) {
			this._enabled = val;

			if (this._enabled) {
				// Listen for the mouse events we need to operate a mouse pan
                this._entity.mouseMove(function (event) { self._mouseMove(event); });
			}

			return this._entity;
		}

		return this._enabled;
	},

    enableContinuousMovement: function(val) {
        if (val !== undefined) {
            this._continuousMovement = val;

            return this._entity;
        }

        return this._continuousMovement;
    },

	/**
	 * Handles the mouse move event. Translates the camera as the mouse
	 * moves across the screen boarders.
	 * @param event
	 * @param eventId
	 * @private
	 */
	_mouseMove: function (event, eventId) {

		if (this._enabled) {
            /**
             * This method is called even when the mouse is out of the screen
             * Therefore, on this case, its important to execute this method once at a time
             */
            if(eventId && this._eventId!=eventId) {
                return true;
            }

            var
                curMousePos = ige._mousePos.clone(),

                viewWidth = this._entity._geometry.x/2,
                viewheight = this._entity._geometry.y/2,

                panFinalX = 0,
                panFinalY = 0,

                moveRadiusBoarderPercentage = 0.03,
                movmentPecentage = 0.03;


            /**
             * Calc to which direction the camera need to move
             */
            //Top
            if( curMousePos.y < -1 * (viewheight-(viewheight*moveRadiusBoarderPercentage))) {
                panFinalY -= movmentPecentage*viewheight;
            }

            //Right
            if( curMousePos.x > viewWidth-(viewWidth*moveRadiusBoarderPercentage)) {
                panFinalX += movmentPecentage*viewWidth;
            }

            //Bottom
            if( curMousePos.y > viewheight-(viewheight*moveRadiusBoarderPercentage)) {
                panFinalY += movmentPecentage*viewheight;
            }

            //Left
            if( ige._mousePos.x < -1 * (viewWidth-(viewWidth*moveRadiusBoarderPercentage))) {
                panFinalX -= movmentPecentage*viewWidth;
            }


            /**
             * Move camera
             */
            if(panFinalX!==0 || panFinalY!==0) {
                panFinalX /= this._entity.camera._scale.x;
                panFinalY /= this._entity.camera._scale.y;


                var point = new IgePoint();
                point.init(panFinalX, panFinalY, 0);

                this._entity.camera.panBy(
                    point,
                    1000,
                    'outSine'
                );

                this.emit('screenMove');


                /**
                 * Every new mouse move, set a new 'setInterval', and give it an ID
                 * that way, only a SINGLE setInterval will actually perform the movment eventually.
                 * @type {number}
                 */
                if(this.enableContinuousMovement()) {
                    var eventId = new Date().getTime();
                    this._eventId = eventId;
                    self = this;
                    setInterval(function () { self._mouseMove(event, eventId); }, 50);
                }
            }
		}
	}
});

