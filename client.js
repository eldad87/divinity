var Client = IgeClass.extend({
	classId: 'Client',
	init: function () {
        var self = this;
        this.obj = [];
        this.gameTexture = {};


        ige.showStats(1);

		// Enabled texture smoothing when scaling textures
		ige.globalSmoothing(true);

        /*// Add physics and setup physics world
        ige.addComponent(IgeBox2dComponent)
            .box2d.sleep(true)
            .box2d.gravity(0, 0)
            .box2d.createWorld()
            .box2d.start();*/
        ige.addComponent(IgeCannonComponent)
            .cannon.gravity(0, 0, -600)
            .cannon.createWorld();


        // Enable networking
        ige.addComponent(IgeNetIoComponent);

        // Implement our game methods
        this.implement(ClientNetworkEvents);


		// Wait for our textures to load before continuing
		ige.on('texturesLoaded', function () {
			// Create the HTML canvas
			ige.createFrontBuffer(true);
			ige.viewportDepth(true);


            // Ask the engine to start
            ige.start(function (success) {
                // Check if the engine started successfully
                if (success) {

                    // Create the physics world "ground"
                    ige.cannon.createFloor(0, 0, 1);

                    ige.network.start('http://localhost:2000', function () {
                        // Setup the network command listeners
                        ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js

                        // Setup the network stream handler
                        ige.network.addComponent(IgeStreamComponent)
                            .stream.renderLatency(160) // Render the simulation 160 milliseconds in the past

                            // Create a listener that will fire whenever an entity
                            // is created because of the incoming stream data
                            .stream.on('entityCreated', self._onEntityCreated);


                            // Create the scene
                            self.createScene();

                            //Create the tiles
                            self.loadTile();

                        // Ask the server to create an entity for us
                        ige.network.send('playerEntity');
                    });
                }
            });

		});

        // Load our textures
        this.loadTextures();
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
                        .autoSection(40)
                        .isometricMounts(true)
                        .drawBounds(false)
                        .drawBoundsData(false)
                        .drawMouse(true)
                        .mount(self.backScene);
                }


                //Collision
                //ige.box2d.staticsFromMap(layersById.DirtLayer);

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
            .addComponent(CommandComponent, {client: self})
            .Command.enabled(true)
            .addComponent(IgeScreenMoveComponent)
            .screenMove.enabled(true)
            .screenMove.enableContinuousMovement(false)

            .mouseMove(function (event) {
                self.vp1.Command._mouseMove(event);
                self.vp1.screenMove._mouseMove(event);
            })

            .id('vp1')
            .depth(1)
            .autoSize(true)
            .scene(self.mainScene)
            .drawBounds(true)
            .drawBoundsData(true)
            .mount(ige);
    },

    createAI: function() {
        var i, destTileX = - 1, destTileY = -1,
            dirtLayer = ige.$('DirtLayer'),
            objectLayer = ige.$('objectLayer'),
            tileChecker = function (tileData, tileX, tileY) {
                // If the map tile data is set, don't path along it
                return !tileData;
            };


        // Create a bunch of AI characters that will walk around the screen
        // using the path finder to find their way around. When they complete
        // a path they will choose a new random destination and path to it.
        // All the AI character code is in the gameClasses/CharacterAi.js
        for (i = 0; i < 20; i++) {
            // Pick a random tile for the entity to start on
            while (destTileX < 0 || destTileY < 0 || !dirtLayer.map._mapData[destTileY] || !tileChecker(dirtLayer.map._mapData[destTileY][destTileX])) {
                destTileX = Math.random() * 20 | 0;
                destTileY = Math.random() * 20 | 0;
            }

            new CharacterAi(dirtLayer, this.pathFinder)
                .id('aiEntity_' + i)
                .drawBounds(false)
                .drawBoundsData(false)
                .isometric(true) // Set to use isometric movement

                .translateToTile(destTileX, destTileY, 0)
                .addComponent(EntityOccupyPositionComponent)
                .occupyPosition.enabled(true)
                .box2dBody({
                    type: 'dynamic',
                    linearDamping: 0.0,
                    angularDamping: 0.1,
                    allowSleep: true,
                    bullet: true,
                    gravitic: true,
                    fixedRotation: true,
                    fixtures: [{
                        density: 1.0,
                        friction: 0.5,
                        restitution: 0.2,
                        shape: {
                            type: 'rectangle',
                            data: {
                                width: 10,
                                height: 10
                            }
                        }
                    }]
                })
                /*.mouseOver(overFunc)
                .mouseOut(outFunc)*/
                .mount(objectLayer);

            destTileX = -1;
            destTileY = -1;
        }

    },

    loadTextures: function () {
        this.gameTexture.background1 = new IgeTexture('/divinity/assets/textures/backgrounds/grass_and_water.png');
        this.gameTexture.background2 = new IgeTexture('/divinity/assets/textures/backgrounds/tiled_cave_1.png');
        this.gameTexture.background2 = new IgeTexture('/divinity/assets/textures/sprites/vx_chara02_c.png');

        //UI
        this.gameTexture.uiCommandTop = new IgeTexture('/divinity/assets/textures/ui/command_top.png');
        this.gameTexture.uiCommandBottom = new IgeTexture('/divinity/assets/textures/ui/command_bottom.png');

        //Buttons
        this.gameTexture.uiButtonCancel = new IgeTexture('/divinity/assets/textures/ui/uiButton_cancel.png');
        this.gameTexture.uiButtonMove = new IgeTexture('/divinity/assets/textures/ui/uiButton_move.png');
        this.gameTexture.uiButtonAttack = new IgeTexture('/divinity/assets/textures/ui/uiButton_attack.png');
        this.gameTexture.uiButtonBuild = new IgeTexture('/divinity/assets/textures/ui/uiButton_build.png');
        //Sub buttons
        this.gameTexture.uiButtonBuildTreeOfLife = new IgeTexture('/divinity/assets/textures/ui/uiButton_buildTreeOfLife.png');
        this.gameTexture.uiButtonBuildAncientOfWar = new IgeTexture('/divinity/assets/textures/ui/uiButton_buildAncientOfWar.png');

        //Buildings
        this.gameTexture.treeOfLife = new IgeTexture('/divinity/assets/textures/buildings/bank1.png');
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }