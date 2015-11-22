//-----------------------------------------------------------------------------
// Story_Book.js
//-----------------------------------------------------------------------------
/*:
* @plugindesc Creates a story book scene to view the backstory of your game.
* @author Soulpour777
* @param Background
* @desc The main background of your story book, when presented.
* @default Book
*
* @help 
* //-----------------------------------------------------------------------------
// Story_Book.js
//-----------------------------------------------------------------------------
* All string values or worded values that are used in this plugin should be used
* without the "" marks. For example, the MusicName parameter should be named with
Theme1 instead of adding "Theme1".
* -------------------------------------------------------------------------------
* This plugin is plug and play. For parameters and changes, simply go to the 
parameters here in the plugin manager and change them the way you want it 
to behave.

Parameters:
    - Story Image, Text X Axis, Text Y Axis and Text Scroll Speed
    - Book Particle, Scroll X and Scroll Y
    - Skip Availability
    - Music Name, Volume, Pitch and Pan

Open Features:
 - availability to skip.
 - availability to present stories and even credits in scrolling manner.

Images should be placed under img / pictures folder.

To call the scene, place this on the script call event:

SceneManager.goto(Story_Book);

* 
* -------------------------------------------------------------------------------
* Author: Soulpour777
* -------------------------------------------------------------------------------
* @param StoryText
* @desc The picture that contains the text (png format) of the story.
* @default Storyline
*
* @param TextXAxis
* @desc The X axis or vertical position of the Storyline picture on the scene at start.
* @default 0
*
* @param TextYAxis
* @desc The Y axis or vertical position of the Storyline picture on the scene at start.
* @default 620
*
* @param TextScrollSpeed
* @desc The speed of the text picture to scroll on your story book.
* @default 0.30
*
* @param BookParticles
* @desc The name of the picture your Particle Picture is named.
* @default BookParticle
*
* @param ParticleOpacity
* @desc The opacity the particles will be viewed.
* @default 150
*
* @param ParticleWidth
* @desc The width of the particle image you use.
* @default 816
*
* @param ParticleHeight
* @desc The height of the particle image you use.
* @default 624
*
* @param ParticleScrollSpeedX
* @desc The speed of the particles when moving (X Axis).
* @default 0
*
* @param ParticleScrollSpeedY
* @desc The speed of the particles when moving (Y Axis).
* @default 0.80
*
* @param SkipAvailable
* @desc The availability of skipping the story book.
* @default false
*
* @param MusicName
* @desc The name of the music you wanted to use in the story book.
* @default Theme1
*
* @param MusicVolume
* @desc The volume of the music used in the story book.
* @default 100
*
* @param MusicPitch
* @desc The pitch of the music used in the story book.
* @default 100
*
* @param MusicPanning
* @desc The panning value of the music used in the story book.
* @default 0
*/
//-----------------------------------------------------------------------------

var params = PluginManager.parameters('Story Book Ex');
var _storyBook_particleWidth = Number(params['ParticleWidth'] || 816);
var _storyBook_particleHeight = Number(params['ParticleHeight'] || 624);
var _storyBook_background = String(params['Background'] || "Book");
var _storyBook_overlayPicture = String(params['StoryText'] || "Storyline");
var _storyBook_overlayPicture_location_x = Number(params['TextXAxis'] || 0);
var _storyBook_overlayPicture_location_y = Number(params['TextYAxis'] || 620);
var _storyBook_overlayPicture_scrollSpeed = Number(params['TextScrollSpeed'] || 20);
var _storyBook_particle_picture = String(params['BookParticles'] || "BookParticle");
var _storyBook_canSkip = String(params['SkipAvailable'] || "false");
var _storyBook_particle_x_speed = Number(params['ParticleScrollSpeedX'] || 0);
var _storyBook_particle_y_speed = Number(params['ParticleScrollSpeedY'] || 0.80);
var _storyBook_particle_opacity = Number(params['ParticleOpacity'] || 150);
var _storyBook_music_name = String(params['MusicName'] || "Theme1");
var _storyBook_music_volume = Number(params['MusicVolume'] || 100);
var _storyBook_music_pitch = Number(params['MusicPitch'] || 100);
var _storyBook_music_pan = Number(params['MusicPanning'] || 0);;

function Story_Book() {
    this.initialize.apply(this, arguments);
}

Story_Book.prototype = Object.create(Scene_Base.prototype);
Story_Book.prototype.constructor = Story_Book;
Story_Book.prototype.background_sprite;
Story_Book.prototype.overlay_story;
Story_Book.prototype.book_particles;
Story_Book.prototype.skipOk;

Story_Book.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this.skipOk = _storyBook_canSkip;
};

Story_Book.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.playStoryBookSong();
    this.createPreface();
    this.createStoryline();
    this.createBookParticle();
};

Story_Book.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this.startFadeIn(this.slowFadeSpeed(), false);
};

Story_Book.prototype.update = function() {
    if (this.isActive() && !this.isBusy() && this.isTriggered()) {
        if(this.skipOk === "true") {
            this.returnBack();
        }
    }
    if (this.overlay_story.y <= -_storyBook_overlayPicture_location_y * 2 && this.isActive() && !this.isBusy()) {
        this.returnBack();
    }
    this.updateStoryline();
    this.updateBookParticle();
    Scene_Base.prototype.update.call(this);
};


Story_Book.prototype.updateStoryline = function() {
    this.overlay_story.y -= _storyBook_overlayPicture_scrollSpeed;
}

Story_Book.prototype.updateBookParticle = function() {
    this.book_particles.opacity = _storyBook_particle_opacity;
    this.book_particles.origin.x += _storyBook_particle_x_speed;
    this.book_particles.origin.y += _storyBook_particle_y_speed;
}

Story_Book.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
    this.fadeOutAll();
};

Story_Book.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    AudioManager.stopAll();
};

Story_Book.prototype.playStoryBookSong = function() {
    AudioManager.stopMe();
    AudioManager.stopBgs();
    var audio = {
      name: _storyBook_music_name,
      volume: _storyBook_music_volume,
      pitch: _storyBook_music_pitch,
      pan: _storyBook_music_pan
    }
    AudioManager.playBgm(audio);
};

Story_Book.prototype.createPreface = function() {
    this.background_sprite = new Sprite();
    this.background_sprite.bitmap = ImageManager.loadPicture(_storyBook_background);
    this.addChildAt(this.background_sprite, 0);
};

Story_Book.prototype.createStoryline = function() {
    this.overlay_story = new Sprite();
    this.overlay_story.bitmap = ImageManager.loadPicture(_storyBook_overlayPicture);
    this.overlay_story.x = _storyBook_overlayPicture_location_x;
    this.overlay_story.y = _storyBook_overlayPicture_location_y;
    this.addChildAt(this.overlay_story, 1);
}

Story_Book.prototype.createBookParticle = function() {
    this.book_particles = new TilingSprite();
    this.book_particles.move(0, 0, _storyBook_particleWidth, _storyBook_particleHeight);
    this.book_particles.bitmap = ImageManager.loadPicture(_storyBook_particle_picture);
    this.addChildAt(this.book_particles, 2);
}

Story_Book.prototype.isTriggered = function() {
    return Input.isTriggered('ok') || TouchInput.isTriggered();
};

Story_Book.prototype.returnBack = function() {
    SceneManager.goto(Scene_Map);
};

console.log("Story Book Ex Plugin by Soulpour is active.");