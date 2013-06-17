var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;
		ige.timeScale(1);

		// Define an object to hold references to our player entities
		this.players = {};
		
		// Define an array to hold our tile data
		this.tileData = [];

        // Add physics and setup physics world
        ige.addComponent(IgeBox2dComponent)
            .box2d.sleep(true)
            .box2d.gravity(0, 0)
            .box2d.createWorld()
            .box2d.start();

		// Add the server-side game methods / event handlers
		this.implement(ServerNetworkEvents);

		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {

						
						ige.network.define('playerEntity', self._onPlayerEntity);
						ige.network.define('playerControlToTile', self._onPlayerControlToTile);

						ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
						ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);


                        // Create the scene
                        self.createScene();

                        //Create the tiles
                        self.loadTile();
					}
				});
			});
	},


    loadTile: function() {
        var self = this;

        // Load the Tiled map data and handle the return data
        ige.addComponent(IgeTiledComponent)
            .tiled.loadJson(tiledExample1 /*tiledMap*/ /* you can also use a url: 'maps/example.js'*/, function (layerArray, layersById) {

                for (i = 0; i < layerArray.length; i++) {
                    if (layerArray[i].type !== 'tilelayer') {
                        continue;
                    }

                    layerArray[i]
                        .tileWidth(20)
                        .tileHeight(20)
                        //.autoSection(40)
                        .isometricMounts(true)
                        .drawBounds(false)
                        .drawBoundsData(false)
                        .drawMouse(true)
                        .mount(self.backScene);
                }


                //Collision
                ige.box2d.staticsFromMap(layersById.DirtLayer);

                // Create a path-finder
                self.pathFinder = new IgePathFinder()
                    .neighbourLimit(1000); // Set a high limit because we are using a large maps

                //self.createAI();
            });
    },

    createScene: function() {
        var self = this;

        // Create the scene
        self.mainScene = new IgeScene2d()
            .id('mainScene')
            .translateTo(0, 0, 0)
            .drawBounds(false)
            .drawBoundsData(false);

        self.backScene = new IgeScene2d()
            .id('backScene')
            .depth(0)
            .drawBounds(false)
            .drawBoundsData(false)
            .mount(self.mainScene);

        self.objectLayer = new IgeTileMap2d()
            .id('objectLayer')
            .depth(1)
            .isometricMounts(true)
            .drawBounds(false)
            .drawBoundsData(false)
            .highlightOccupied(true)
            .tileWidth(20)
            .tileHeight(20)
            .mount(self.mainScene);

        // Create the main viewport
        self.vp1 = new IgeViewport()
            /*.addComponent(CommandComponent, {objectLayer: self.objectLayer})
            .Command.enabled(true)*/
            /*.addComponent(IgeScreenMoveComponent)
            .screenMove.enabled(true)*/
            .id('vp1')
            .depth(1)
            .autoSize(true)
            .scene(self.mainScene)
            .drawBounds(true)
            .drawBoundsData(true)
            .mount(ige);
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }