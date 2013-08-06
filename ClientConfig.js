var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'./maps/example.js',
        './gameClasses/components/IgeScreenMoveComponent.js',
        './gameClasses/components/EntityOccupyPositionComponent.js',

        './gameClasses/ClientNetworkEvents.js',
        './gameClasses/Character.js',
        './gameClasses/BaseEntity.js',
        './gameClasses/ArmorAttackChart.js',
        './gameClasses/Unit.js',

        './gameClasses/Units/Archer.js',
        './gameClasses/Units/Huntress.js',
        './gameClasses/Units/Wisp.js',

        './gameClasses/Building.js',
        './gameClasses/Buildings/TreeOfLife.js',

        './gameClasses/ui/EntityUiProgressBar.js',



        './gameClasses/components/ControlComponent.js',
        './gameClasses/components/CommandComponent.js',
        './gameClasses/components/PlayerComponent.js',
        './gameClasses/CharacterAi.js',
        '../ige/engine/ui/IgeUiGridPanel.js',
        '../ige/engine/components/physics/cannon/lib_cannon.js',

		/* Standard game scripts */
		'./client.js',
		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }