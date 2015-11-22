//=============================================================================
// CraftingSystem.js
//=============================================================================

/*:
 * @plugindesc Craft items, weapons and armors based on categorized recipe books.
 * @author Julian "Szyu" Heinen
 *
 * @param Categories
 * @desc The names of the categories.
 * @default Blacksmith, Alchemy
 * 
 * @param Price Text
 * @desc Text used for item's price in status display 
 * @default Price
 * 
 * @param Equip Text
 * @desc Text used for item's equipment type in status display 
 * @default Equip
 * 
 * @param Type Text
 * @desc Text used for item's equipment type in status display 
 * @default Type
 * 
 * @param Ingredients Text
 * @desc Text used for indicating an item's crafting ingredients
 * @default Ingredients:
 * 
 * @param Currency Text
 * @desc Text used for currency ingredients
 * @default Currency
 * 
 * @param Item Crafted Text
 * @desc Text used after crafting an item
 * @default Item crafted:
 * 
 *
 * @help
 *  
 * Plugin Command:
 *   CraftingSystem open 0    		# Opens the crafting scene for category #0
 *   CraftingSystem add_recipe 5: w3		# Adds the recipe of weapon #3 to recipe book #5
 *   CraftingSystem remove_recipe 5: a1	# Removes the recipe of armor #1 from recipe book #5
 *
 * Defining recipes for items, weapons and armors in their notes:
 *    <recipe>
 *    i: 1, 5	# requires 5 of item #1
 *    w: 3, 2	# requires 2 of weapon #3
 *    a: 2, 5	# requires 5 of armor #2
 *    c: 1000	# requires 1000 of currency
 *    </recipe>
 *
 * Defining recipe books (only items) in their notes:
 *    <recipe_book>
 *    category: x	# recipe book is of category #x
 *    i: 1, 3, 4	# recipe book contains the recipes of items #1, #3 and #4
 *    w: 3 		# recipe book contains the recipes of weapon #3
 *    a: 2, 1 		# recipe book contains the recipes of armors #1 and #2
 *    </recipe_book>
 *
 */
 
(function(){
	var parameters = PluginManager.parameters('CraftingSystem');
	var categories = parameters['Categories'].replace(/^\s+|\s+$/gm,'').split(',') || ['Blacksmithing', 'Alchemy'];
	var priceText = String(parameters['Price Text'] || 'Price');
    var equipText = String(parameters['Equip Text'] || 'Equip');
    var typeText = String(parameters['Type Text'] || 'Type');
    var ingredientsText = String(parameters['Ingredients Text'] || 'Ingredients:');
	var currencyText = String(parameters['Currency Text'] || 'Currency');
	var itemCraftedText = String(parameters['Item Crafted Text'] || 'Item crafted:');

	/*----------------------------------------------
	* Game_Interpreter
	*---------------------------------------------*/
	var _szcrsy_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args){
		_szcrsy_Game_Interpreter_pluginCommand.call(this, command, args);

		console.log(categories);
		console.log(priceText);
		console.log(equipText);
		console.log(typeText);
		console.log(ingredientsText);
		console.log(currencyText);
		console.log(itemCraftedText);

		if (command == 'CraftingSystem'){
			switch (args[0]){
				case 'open':
					SceneManager.push(Scene_CraftingMenu)
					SceneManager.prepareNextScene(args[1])
					break;
				case 'add_recipe':
					this.addRecipes(args.splice(1,args.length-1));
					break;
				case 'remove_recipe':
					this.removeRecipes(args.splice(1,args.length-1));
					break;
			}
		}
	};
	
	Game_Interpreter.prototype.addRecipes = function(args){
		var book = $dataItems[parseInt(args[0])];
		var item;
		var regex;
		if (book._recipe_book == null) return;

		for (var i=1;i<args.length;i++){
			regex = args[i].match(/([iwa])(\d+)/i);
			switch (regex[1]){
				case 'i': item = $dataItems[parseInt(regex[2])]; break;
				case 'w': item = $dataWeapons[parseInt(regex[2])]; break;
				case 'a': item = $dataArmors[parseInt(regex[2])]; break;
			}
			if (item._ingredients == null) continue;
			if (book._recipe_book['recipes'].filter(function(obj){return obj == item;}).length > 0) continue;
			book._recipe_book['recipes'].push(item)
		}
	}

	Game_Interpreter.prototype.removeRecipes = function(args){
		var book = $dataItems[parseInt(args[0])];
		var item;
		var regex;
		if (book._recipe_book == null) return;

		for (var i=1;i<args.length;i++){
			regex = args[i].match(/([iwa])(\d+)/i);
			switch (regex[1]){
				case 'i': item = $dataItems[parseInt(regex[2])]; break;
				case 'w': item = $dataWeapons[parseInt(regex[2])]; break;
				case 'a': item = $dataArmors[parseInt(regex[2])]; break;
			}
			if (item._ingredients == null) continue;
			if (book._recipe_book['recipes'].filter(function(obj){return obj == item;}).length == 0) continue;
			book._recipe_book['recipes'].splice(book._recipe_book['recipes'].indexOf(item), 1);
		}
	}


	/*----------------------------------------------
	* DataManager
	*---------------------------------------------*/
	var _szcrsy_DataManager_createGameObjects = DataManager.createGameObjects;
	DataManager.createGameObjects = function() {
		_szcrsy_DataManager_createGameObjects.call(this);
		// Create recipe book object
		this.load_recipeBooks();
		this.load_ingredientLists();
	}

	DataManager.load_recipeBooks = function() {
		$dataItems.forEach(function(item){
			if (item == null) {return;}
			item._recipe_book = null;
			if (item.note.match(/<recipe_book>[\s\S]*<\/recipe_book>/m)){
				item._recipe_book = {'recipes':[]};
				var cat;
				// check if category is correct
				if ((cat = item.note.match(/category:\s*(\d+)/m))){
					item._recipe_book['category'] = parseInt(cat[1]);
					//now item is sure to be a recipe book with correct category
					var rec;
					var db;
					item.note.match(/([iwa]:\s*[\d+,\s]*)/gim).forEach(function(recipe_line){
						rec = recipe_line.match(/([iwa]):\s*([\d+,\s]*)/i);
						switch (rec[1]){
							case 'w': db = $dataWeapons; break;
							case 'a': db = $dataArmors; break;
							case 'i': db = $dataItems; break;
						}
						rec[2].split(',').forEach(function(id){
							item._recipe_book['recipes'].push(db[parseInt(id)]);
						}, this);
					}, this);

				}
			}
		}, this);
	}

	DataManager.load_ingredientLists = function(){
		var dbs = [$dataItems, $dataWeapons, $dataArmors];
		dbs.forEach(function(db){
			db.filter(function(obj){return obj != null;}).forEach(function(item){
				item._ingredients = null;
				if (item.note.match(/<recipe>[\s\S]*<\/recipe>/gim)){
					item._ingredients = [];

					item.note.match(/([iwa]:\s*\d+,\s*\d+|[c]:\s*\d+)/gim).forEach(function(ing_line){
						var ing = ing_line.match(/([iwa]):\s*(\d+),\s*(\d+)|([c]):\s*(\d+)/i);
						var ing_db;
						var needed;
						if (ing[1] != null){
							switch (ing[1]){
								case 'w': ing_db = $dataWeapons[parseInt(ing[2])]; break;
								case 'a': ing_db = $dataArmors[parseInt(ing[2])]; break;
								case 'i': ing_db = $dataItems[parseInt(ing[2])]; break;
							}
						} else {
							if (ing[4] == 'c'){
								ing_db = currencyText;
							}
						}
						if (ing_db == currencyText){
							needed = parseInt(ing[5]);
						} else {
							needed = parseInt(ing[3]);
						}
						item._ingredients.push({'item': ing_db, 'amount':needed});
					},this);
				}
			},this);
		},this);
	}

	var _szcrsy_DataManager_makeSaveContents = DataManager.makeSaveContents;
	DataManager.makeSaveContents = function() {
	    // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
	    var contents = _szcrsy_DataManager_makeSaveContents.call(this);
	    var recipe_books = {};
	    $dataItems.filter(function(item){return item != null && item._recipe_book != null;}).forEach(function(item){
	    	recipe_books[item.id] = item._recipe_book;
	    },this);
	    contents.recipe_books       = recipe_books;
	    return contents;
	};

	var _szcrsy_DataManager_extractSaveContents = DataManager.extractSaveContents;
	DataManager.extractSaveContents = function(contents) {
		_szcrsy_DataManager_extractSaveContents.call(this, contents);
		var recipe_books = contents.recipe_books;
		for (var key in recipe_books){
			$dataItems[key]._recipe_book = recipe_books[key];
		}
	};

	/*----------------------------------------------
	* Scene_CraftingMenu
	*---------------------------------------------*/
	function Scene_CraftingMenu() {
		this.initialize.apply(this, arguments);
	}
	
	Scene_CraftingMenu.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_CraftingMenu.prototype.constructor = Scene_CraftingMenu;
	
	Scene_CraftingMenu.prototype.initialize = function(){
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_CraftingMenu.prototype.prepare = function(category) {
		this._category = category;
	};
	
	Scene_CraftingMenu.prototype.create = function(){
		Scene_MenuBase.prototype.create.call(this);

		// Create category window
		this._categoryWindow = new Window_CraftingCategory(this._category);
		this.addWindow(this._categoryWindow);
		// Create item window
		this._indexWindow = new Window_CraftingItems(0, this._categoryWindow.height, this._category);
		this._indexWindow.setHandler('cancel', this.popScene.bind(this));
		this._indexWindow.setHandler('ok', this.onCraft.bind(this));
		this.addWindow(this._indexWindow);
		// Create Item Status Window
		var swy = this._indexWindow.y+this._indexWindow.height;
		this._statusWindow = new Window_CraftingItemStatus(-Graphics.boxWidth, swy, Graphics.boxWidth, Graphics.boxHeight-swy);
		this.addWindow(this._statusWindow);
		this._indexWindow.setStatusWindow(this._statusWindow);
		// Create Item Ingredients window
		this._ingredientsWindow = new Window_CraftingIngredients(0,swy, Graphics.boxWidth, Graphics.boxHeight-swy);
		this.addWindow(this._ingredientsWindow);
		this._indexWindow.setIngredientsWindow(this._ingredientsWindow);

		this._indexWindow.setHandler('pagedown', this.showStatus.bind(this)); // W
		
		this._messageWindow = new Window_Message();
		this.addWindow(this._messageWindow);
	    this._messageWindow.subWindows().forEach(function(window) {
	        this.addWindow(window);
	    }, this);

		this._activeWindow = 0;
	};

	Scene_CraftingMenu.prototype.onCraft = function(){
		$gameParty.gainItem(this._indexWindow.item(), 1);
		this.loseIngredients();
		// Show gain item Message
		$gameMessage.setBackground(0);
        $gameMessage.setPositionType(1);
		$gameMessage.add(itemCraftedText+'\n' + this._indexWindow.item().name);
	};


	Scene_CraftingMenu.prototype.showStatus = function(){
		if (this._activeWindow !== 1){
			var sw = this._statusWindow;
			var iw = this._ingredientsWindow;
			iw.move(Graphics.boxWidth,iw.y, iw.width, iw.height);
			sw.move(0, sw.y, sw.width, sw.height);
			this._activeWindow = 1;
			this._indexWindow.setHandler('pageup', this.showIngredients.bind(this)); // Q
			delete this._indexWindow._handlers['pagedown'];
		}
		this._indexWindow.activate();
	};

	Scene_CraftingMenu.prototype.showIngredients = function(){
		if (this._activeWindow !== 0){
			var sw = this._statusWindow;
			var iw = this._ingredientsWindow;
			sw.move(-Graphics.boxWidth, sw.y, sw.width, sw.height);
			iw.move(0,iw.y, iw.width, iw.height);
			this._activeWindow = 0;
			this._indexWindow.setHandler('pagedown', this.showStatus.bind(this)); // W
			delete this._indexWindow._handlers['pageup'];
		}
		this._indexWindow.activate();
	};

	Scene_CraftingMenu.prototype.loseIngredients = function(){
		var item = this._indexWindow.item();
       	var ing;
       	var db;
       	var needed;

       	item._ingredients.forEach(function(ing){
       		needed = ing['amount'];
       		if (ing['item'] == currencyText){
       			$gameParty.loseGold(needed);
       		} else {
       			$gameParty.loseItem(ing['item'], needed);
       		}
       	}, this);
		this._ingredientsWindow.refresh();
	};
	
	/*----------------------------------------------
	* Window_CraftingCategory
	*---------------------------------------------*/
	function Window_CraftingCategory(){
		this.initialize.apply(this, arguments);
	}

	Window_CraftingCategory.prototype = Object.create(Window_Base.prototype);
	Window_CraftingCategory.prototype.constructor = Window_CraftingCategory;

	Window_CraftingCategory.prototype.initialize = function(category) {
		this._category = category;
		Window_Base.prototype.initialize.call(this, 0,0,Graphics.boxWidth, this.fittingHeight(1));
		this.refresh();
	};

	Window_CraftingCategory.prototype.refresh = function(){
		this.drawText(categories[this._category], 0,0,this.contents.width, this.lineHeight(), 'center');
	};
	
	/*----------------------------------------------
	* Window_CraftingItems
	*---------------------------------------------*/
	function Window_CraftingItems(){
		this.initialize.apply(this, arguments);
	}
	
	Window_CraftingItems.prototype = Object.create(Window_Selectable.prototype);
	Window_CraftingItems.prototype.constructor = Window_CraftingItems;
	
	Window_CraftingItems.lastTopRow = 0;
    Window_CraftingItems.lastIndex  = 0;
	
	Window_CraftingItems.prototype.initialize = function(x,y, category) {
		var width = Graphics.boxWidth;
		var height = this.fittingHeight(4);
		this._category = parseInt(category);
		Window_Selectable.prototype.initialize.call(this, x,y,width, height);
		this.refresh();
		this.setTopRow(Window_CraftingItems.lastTopRow);
        this.select(Window_CraftingItems.lastIndex);
        this.activate();
	};
	
	Window_CraftingItems.prototype.maxCols = function(){
		return 3;
	};
	
	Window_CraftingItems.prototype.maxItems = function(){
		return this._list ? this._list.length : 0;
	};
	
	Window_CraftingItems.prototype.setStatusWindow = function(statusWindow) {
        this._statusWindow = statusWindow;
        this.updateStatus();
    };
	
	Window_CraftingItems.prototype.setIngredientsWindow = function(ingredientsWindow) {
        this._ingredientsWindow = ingredientsWindow;
        this.updateIngredients();
    };
	
	Window_CraftingItems.prototype.update = function(){
		if (!$gameMessage.isBusy()){
			Window_Selectable.prototype.update.call(this);
			this.updateStatus();
			this.updateIngredients();
		}
	};

	Window_CraftingItems.prototype.updateStatus = function() {
        if (this._statusWindow) {
            var item = this._list[this.index()];
            this._statusWindow.setItem(item);
        }
    };

    Window_CraftingItems.prototype.updateIngredients = function() {
        if (this._ingredientsWindow) {
            var item = this._list[this.index()];
            this._ingredientsWindow.setItem(item);
        }
    };
	
	Window_CraftingItems.prototype.refresh = function(){

		var i, item;
		var cat, c2;
		this._list = [];
		cat = parseInt(this._category);
		$gameParty.allItems().filter(function(item){
			return item._recipe_book != null && cat === parseInt(item._recipe_book['category']);
		}).forEach(function(item){
			item._recipe_book.recipes.forEach(function(rec_item){
				this._list.push(rec_item);
			},this);
		}, this);;
		
		this.createContents();
		this.drawAllItems();
	};

	
	Window_CraftingItems.prototype.drawItem = function(index){
		var item = this._list[index];
		var rect = this.itemRect(index);
		var width = rect.width - this.textPadding();
		this.drawItemName(item, rect.x, rect.y, width);
	};
	
	Window_CraftingItems.prototype.processCancel = function(){
		Window_Selectable.prototype.processCancel.call(this);
		Window_CraftingItems.lastTopRow = this.topRow();
        Window_CraftingItems.lastIndex = this.index();
	};

	Window_CraftingItems.prototype.processOk = function() {
	    if (this.itemIngredientsMet()) {
	        this.playOkSound();
	        this.updateInputData();
	        this.callOkHandler();
	    } else {
	        this.playBuzzerSound();
	    }
	};

	Window_CraftingItems.prototype.item = function() {
    	var index = this.index();
    	return this._list && index >= 0 ? this._list[index] : null;
 
    };
	
	Window_CraftingItems.prototype.itemIngredientsMet = function(){
		var item = this.item();
		var met = true;
		if (item == null) return false;

		var existingCount = 0, needed = 0;
		item._ingredients.forEach(function(ing){
			needed = ing['amount'];
			if (ing['item'] == currencyText){
				existingCount = $gameParty.gold();
			}
			else{
				existingCount = $gameParty.numItems(ing['item']);
			}
			//console.log('ex: ' + existingCount + '; needed: ' + needed + '; RESULT: ' + (existingCount < needed));
			if (existingCount < needed){
				met = false;
			}
		}, this);
		return met;
	};

	/*----------------------------------------------
	* Window_CraftingItemStatus
	*---------------------------------------------*/
	function Window_CraftingItemStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_CraftingItemStatus.prototype = Object.create(Window_Base.prototype);
    Window_CraftingItemStatus.prototype.constructor = Window_CraftingItemStatus;

    Window_CraftingItemStatus.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };

    Window_CraftingItemStatus.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_CraftingItemStatus.prototype.refresh = function() {
    	var item = this._item;
        var x = 0;
        var y = 0;
        var lineHeight = this.lineHeight();

        this.contents.clear();

        this.drawItemName(item, x, y);

        x = this.textPadding();
        y = lineHeight + this.textPadding();

        var price = item.price > 0 ? item.price : '-';
        this.changeTextColor(this.systemColor());
        this.drawText(priceText, x, y, 120);
        this.resetTextColor();
        this.drawText(price, x + 120, y, 120, 'right');
        y += lineHeight;

        if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
            var etype = $dataSystem.equipTypes[item.etypeId];
            this.changeTextColor(this.systemColor());
            this.drawText(equipText, x, y, 120);
            this.resetTextColor();
            this.drawText(etype, x + 120, y, 120, 'right');
            y += lineHeight;

            var type;
            if (DataManager.isWeapon(item)) {
                type = $dataSystem.weaponTypes[item.wtypeId];
            } else {
                type = $dataSystem.armorTypes[item.atypeId];
            }
            this.changeTextColor(this.systemColor());
            this.drawText(typeText, x, y, 120);
            this.resetTextColor();
            this.drawText(type, x + 120, y, 120, 'right');

            x = this.textPadding() + 300;
            y = lineHeight + this.textPadding();
            for (var i = 2; i < 8; i++) {
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.param(i), x, y, 160);
                this.resetTextColor();
                this.drawText(item.params[i], x + 160, y, 60, 'right');
                y += lineHeight;
            }
        }

        x = 0;
        y = this.textPadding() * 2 + lineHeight * 7;
        this.drawTextEx(item.description, x, y);
        /*var item = this._item;
        var x = 0;
        var y = 0;
        var lineHeight = this.lineHeight();

        this.contents.clear();
        this.drawItemName(item, x, y);

        x = this.textPadding();
        y = lineHeight + this.textPadding();

        var price = item.price > 0 ? item.price : '-';
        this.changeTextColor(this.systemColor());
        this.drawText(priceText, x, y, 120);
        this.resetTextColor();
        this.drawText(price, x + 120, y, 120, 'right');
        y += lineHeight;

        if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
            var etype = $dataSystem.equipTypes[item.etypeId];
            this.changeTextColor(this.systemColor());
            this.drawText(equipText, x, y, 120);
            this.resetTextColor();
            this.drawText(etype, x + 120, y, 120, 'right');
            y += lineHeight;

            var type;
            if (DataManager.isWeapon(item)) {
                type = $dataSystem.weaponTypes[item.wtypeId];
            } else {
                type = $dataSystem.armorTypes[item.atypeId];
            }
            this.changeTextColor(this.systemColor());
            this.drawText(typeText, x, y, 120);
            this.resetTextColor();
            this.drawText(type, x + 120, y, 120, 'right');

            x = this.textPadding() + 300;
            y = lineHeight + this.textPadding();
            for (var i = 2; i < 8; i++) {
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.param(i), x, y, 160);
                this.resetTextColor();
                this.drawText(item.params[i], x + 160, y, 60, 'right');
                y += lineHeight;
            }
        }

        x = 0;
        y = this.textPadding() * 2 + lineHeight * 7;
        this.drawTextEx(item.description, x, y);*/
    };



    /*----------------------------------------------
	* Window_CraftingIngredients
	*---------------------------------------------*/
	function Window_CraftingIngredients() {
        this.initialize.apply(this, arguments);
    }

    Window_CraftingIngredients.prototype = Object.create(Window_Base.prototype);
    Window_CraftingIngredients.prototype.constructor = Window_CraftingIngredients;

    Window_CraftingIngredients.prototype.initialize = function(x,y,width, height){
    	Window_Base.prototype.initialize.call(this, x,y,width, height);
    }

    Window_CraftingIngredients.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_CraftingIngredients.prototype.refresh = function(){
    	this.contents.clear();
    	var x=0;
    	var y=0;
    	var lineHeight = this.lineHeight();
    	var width = this.contents.width - this.textPadding() * 2;


    	var existingCount = 0, needed = 0;
    	this.changeTextColor(this.systemColor());
		this.drawText(ingredientsText, x, y, width);
		this.resetTextColor();
		this._item._ingredients.forEach(function(ing){
			y += lineHeight;
			needed = ing['amount'];
			if (ing['item'] == currencyText){
				existingCount = $gameParty.gold();
				this.drawText(ing['item'], x, y, width);
			}
			else{
				existingCount = $gameParty.numItems(ing['item']);
				this.drawItemName(ing['item'], x, y, width);
			}
			this.drawText('/' + needed, x, y, width, 'right');

			if (existingCount < needed) 
				this.changeTextColor(this.crisisColor());
			else 
				this.changeTextColor(this.powerUpColor());
			this.drawText(existingCount, x, y, width-this.textWidth('/' + needed), 'right');
			this.resetTextColor();
		}, this);
    }

})();