// --------------------------------------
// Battle Weather.js
// --------------------------------------
/*:
* @plugindesc Creates a weather during battle.
* @author: Soulpour777
* @help
If you want to deactivate using battle weather, use
this script call:
this.activate_battle_weather(false);
when you want to activate it again:
this.activate_battle_weather(true);
*/
(function() {
	var _soul_alias_game_system_initialize = Game_System.prototype.initialize;
	var _soul_alias_spriteset_battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
	var _soul_alias_spriteset_battle_update = Spriteset_Battle.prototype.update;
	Game_System.prototype._battleWeather;
	Game_System.prototype.initialize = function() {
		this._battleWeather = true;
		_soul_alias_game_system_initialize.call(this);
	}

	Spriteset_Battle.prototype.createLowerLayer = function() {
	    _soul_alias_spriteset_battle_createLowerLayer.call(this);
	    if($gameSystem._battleWeather)this.createWeather();
	};

	Spriteset_Battle.prototype.createWeather = function() {
		this._weather = new Weather();
		this.addChild(this._weather);
	}

	Spriteset_Battle.prototype.update = function() {
	    _soul_alias_spriteset_battle_update.call(this);
	    if($gameSystem._battleWeather)this.updateBattleWeather();
	};

	Spriteset_Battle.prototype.updateBattleWeather = function() {
	    this._weather.type = $gameScreen.weatherType();
	    this._weather.power = $gameScreen.weatherPower();
	    this._weather.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
	    this._weather.origin.y = $gameMap.displayY() * $gameMap.tileHeight();	
	}	
	Game_Interpreter.prototype.activate_battle_weather = function(x) {
		if (x == Number || x === NaN || x === undefined) {
			$gameSystem._battleWeather = true;
		} else {
			$gameSystem._battleWeather = x;
		}
	}
})();