//--------------------------------------------
// Message_SE.js
//--------------------------------------------
/*:
*
* @plugindesc Plays a sound effect while the message is rolling when displaying a message.
* @author: Soulpour777
* @help:
/--------------------------------------------
What is Panning?
Panning is the distribution of a sound signal (either monaural or 
stereophonic pairs) into a new stereo or multi-channel sound field determined 
by a pan control setting. A typical physical recording console has a pan 
control for each incoming source channel.
/--------------------------------------------
* @param SESwitchID
* @desc The switch to activate before you can play
* the sound effect.
* @default 1
*
* @param MessageSE
* @desc The SE you are using for your message.
* @default Cursor1
*
* @param SEVolume
* @desc The volume of sound effect.
* @default 100
*
* @param SEPitch
* @desc The pitch of sound effect.
* @default 100
*
* @param SEPan
* @desc The panning scale of sound effect.
* @default 0
*
*/

(function() {
	var Imported = Imported || {};
	Imported.MessageSoundEffect = true;
	var Soulpour777 = Soulpour777 || {};
	Soulpour777.MessageSoundEffect = {};
	Soulpour777.MessageSoundEffect.params = PluginManager.parameters('Message SE'); 
	var message_sound_effect = String(Soulpour777.MessageSoundEffect.params['MessageSE'] || "Cursor1");
	var message_sound_effect_switch = Number(Soulpour777.MessageSoundEffect.params['SESwitchID'] || 1);
	var message_sound_effect_volume = Number(Soulpour777.MessageSoundEffect.params['SEVolume'] || 100);
	var message_sound_effect_pitch = Number(Soulpour777.MessageSoundEffect.params['SEPitch'] || 100);
	var message_sound_effect_pan = Number(Soulpour777.MessageSoundEffect.params['SEPan'] || 0);
	var soulpour_window_message_initialize = Window_Message.prototype.initialize;
	Window_Message.prototype.character_waiting_time;
	Window_Message.prototype.initialize = function() {
	    soulpour_window_message_initialize.call(this); //call original method
	    this.character_waiting_time = 0; // starts with 0 at initialization
	};

	Window_Message.prototype.playMessageSe = function() {
		this.character_waiting_time += 1;
		var se = {
			name: message_sound_effect,
			volume: message_sound_effect_volume,
			pitch: message_sound_effect_pitch,
			pan: message_sound_effect_pan
		}
		AudioManager.playSe(se);
	}

	// update the message and waits for one character is located here...
	Window_Message.prototype.updateMessage = function() {
	    if (this._textState) {
	        while (!this.isEndOfText(this._textState)) {
	            if (this.needsNewPage(this._textState)) {
	                this.newPage(this._textState);
	            }
	            this.updateShowFast();
	            this.processCharacter(this._textState);
	            if (!this._showFast && !this._lineShowFast) {
	            	if ($gameSwitches.value(message_sound_effect_switch) === true) this.playMessageSe();
	                break;
	            }
	            if (this.pause || this._waitCount > 0) {
	                break;
	            }
	        }
	        if (this.isEndOfText(this._textState)) {
	            this.onEndOfText();
	        }
	        return true;
	    } else {
	        return false;
	    }
	};	
})();