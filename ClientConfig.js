var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'./maps/example.js',
        './gameClasses/components/IgeScreenMoveComponent.js',
        './gameClasses/components/EntityOccupyPositionComponent.js',

        './gameClasses/ClientNetworkEvents.js',
        './gameClasses/Character.js',
        './gameClasses/CharacterContainer.js',
        './gameClasses/ArmorAttackChart.js',
        './gameClasses/Unit.js',

        './gameClasses/Units/Archer.js',
        './gameClasses/Units/Huntress.js',
        './gameClasses/Units/Wisp.js',

        './gameClasses/ui/EntityUiProgressBar.js',



        './gameClasses/components/ControlComponent.js',
        './gameClasses/components/CommandComponent.js',
        './gameClasses/components/PlayerComponent.js',
        './gameClasses/CharacterAi.js',
        '../ige/engine/ui/IgeUiGridPanel.js',

		/* Standard game scripts */
		'./client.js',
		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }