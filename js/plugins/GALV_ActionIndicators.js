//-----------------------------------------------------------------------------
//  Galv's Action Indicators
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_ActionIndicators.js
//-----------------------------------------------------------------------------
//  2015-12-04 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_ActionIndicators = true;

var Galv = Galv || {};        // Galv's main object
Galv.AI = Galv.AI || {};      // Galv's plugin stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Display an icon when the player is able to interact with an event. View help for comment tag.
 *
 * @author Galv - galvs-scripts.com
 *
 * @param Y Offset
 * @desc Pixel offset for icon's Y position
 * @default 0
 *
 * @help
 *   Galv's Action Indicators
 * ----------------------------------------------------------------------------
 * This plugin will enable you to display an icon when the player is facing an
 * event that has the below code in a 'comment' command anywhere in the active
 * event page.
 *
 *   <actionIcon: id>       // The code to use in a COMMENT within and event.
 *                          // id = the icon ID to use for the indicator.
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.AI.y = Number(PluginManager.parameters('Galv_ActionIndicators')["Y Offset"]);
Galv.AI.needRefresh = false;

//-----------------------------------------------------------------------------
// Game_Map

var Galv_Game_Map_requestRefresh = Game_Map.prototype.requestRefresh;
Game_Map.prototype.requestRefresh = function(mapId) {
	Galv_Game_Map_requestRefresh.call(this,mapId);
	Galv.AI.needRefresh = true;
};


//-----------------------------------------------------------------------------
// Game_Player

var Galv_Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
Game_CharacterBase.prototype.moveStraight = function(d) {
	Galv_Game_CharacterBase_moveStraight.call(this,d);
	Galv.AI.needRefresh = true;
};

Galv.AI.checkActionIcon = function() {
	var x2 = $gameMap.roundXWithDirection($gamePlayer._x, $gamePlayer._direction);
    var y2 = $gameMap.roundYWithDirection($gamePlayer._y, $gamePlayer._direction);
	var action = {'eventId': 0, 'iconId': 0};
	
	$gameMap.eventsXy(x2, y2).forEach(function(event) {
		// check events icon settings
		var icon = 0;
		
		if (event.page()) {
			var listCount = event.page().list.length;
			
			for (var i = 0; i < listCount; i++) {
				if (event.page().list[i].code === 108) {
					var iconCheck = event.page().list[i].parameters[0].match(/<actionIcon: (.*)>/i);
					if (iconCheck) {
						icon = Number(iconCheck[1]);
						break;
					};
				};
			};
		};
		
		// create target object
		action = {
			'eventId': event._eventId,
			'iconId': icon
		};
	});
	$gamePlayer.actionIconTarget = action;
};


//-----------------------------------------------------------------------------
// Spriteset_Map

var Galv_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
	Galv_Spriteset_Map_createLowerLayer.call(this);
	this.createActionIconSprite();
};

Spriteset_Map.prototype.createActionIconSprite = function() {
	this._actionIconSprite = new Sprite_ActionIcon();
	this._tilemap.addChild(this._actionIconSprite);
};


//-----------------------------------------------------------------------------
// Sprite_ActionIcon

function Sprite_ActionIcon() {
    this.initialize.apply(this, arguments);
}

Sprite_ActionIcon.prototype = Object.create(Sprite.prototype);
Sprite_ActionIcon.prototype.constructor = Sprite_ActionIcon;

Sprite_ActionIcon.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
	$gamePlayer.actionIconTarget = $gamePlayer.actionIconTarget || {'eventId': 0, 'iconId': 0}; 
	this._iconIndex = 0;
	this.z = 5;
	this.changeBitmap();
	this._tileWidth = $gameMap.tileWidth();
	this._tileHeight = $gameMap.tileHeight();
	this._offsetX = -(Window_Base._iconWidth / 2);
	this._offsetY = -38 + Galv.AI.y;
	this.anchor.y = 1;
	this._float = 0.1;
	this.mod = 0.2;
	Galv.AI.needRefresh = true;
};

Sprite_ActionIcon.prototype.changeBitmap = function() {
	if ($gamePlayer.actionIconTarget.eventId <= 0) {
		this._iconIndex = 0;
	} else {
		this._iconIndex = $gamePlayer.actionIconTarget.iconId;
	};

	var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
	var sx = this._iconIndex % 16 * pw;
    var sy = Math.floor(this._iconIndex / 16) * ph;
	
	this.bitmap = new Bitmap(pw,ph);
	if (this._iconIndex <= 0) return;
    var bitmap = ImageManager.loadSystem('IconSet');
    this.bitmap.blt(bitmap, sx, sy, pw, ph, 0, 0);
	this.scale.y = 0.1;
	this.opacity = 0;
	this.mod = 0.2;
	this._float = 0.1;
	
	Galv.AI.needRefresh = false;
};

Sprite_ActionIcon.prototype.update = function() {
    Sprite.prototype.update.call(this);
	
	if (Galv.AI.needRefresh) Galv.AI.checkActionIcon();
	if (this._iconIndex !== $gamePlayer.actionIconTarget.iconId) this.changeBitmap();
	if (this._iconIndex <= 0) return;

	this.x = $gameMap.events()[$gamePlayer.actionIconTarget.eventId - 1].screenX() + this._offsetX;
	this.y = $gameMap.events()[$gamePlayer.actionIconTarget.eventId - 1].screenY() + this._offsetY + this._float;

	this.scale.y = Math.min(this.scale.y + 0.1,1);
	this.opacity += 80;

	this._float += this.mod;
	if (this._float < -0.1) {
		this.mod = Math.min(this.mod + 0.01,0.2);
	} else if (this._float >= 0.1) {
		this.mod = Math.max(this.mod + -0.01,-0.2);
	};

};
})();