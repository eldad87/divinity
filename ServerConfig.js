var config = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},

		{name: 'Character', path: './gameClasses/Character'},
		{name: 'CharacterContainer', path: './gameClasses/CharacterContainer'},
		{name: 'PlayerComponent', path: './gameClasses/components/PlayerComponent'},
		{name: 'CommandComponent', path: './gameClasses/components/CommandComponent'},
		{name: 'ControlComponent', path: './gameClasses/components/ControlComponent'},
        {name: 'ArmorAttackChart', path: './gameClasses/ArmorAttackChart'},
        {name: 'Unit', path: './gameClasses/Unit'},
        {name: 'Archer', path: './gameClasses/Units/Archer'},
        {name: 'Huntress', path: './gameClasses/Units/Huntress'},
		{name: 'tiledExample1', path: './maps/example'}
		//{name: 'EntityOccupyPositionComponent', path: './gameClasses/EntityOccupyPositionComponent'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }