/*
	Base.js, version 1.1a
	Copyright 2006-2010, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

var Base = function() {
	// dummy
};

Base.extend = function(_instance, _static) { // subclass

	"use strict";

	var extend = Base.prototype.extend;

	// build the prototype
	Base._prototyping = true;

	var proto = new this();

	extend.call(proto, _instance);

	proto.base = function() {
	// call this method from any other method to invoke that method's ancestor
	};

	delete Base._prototyping;

	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] !== null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};

	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

Base.prototype = {
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
				value = function() {
					var previous = this.base || Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Base.toString;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			// if this object has a customised extend method then use it
			if (!Base._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	}
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	version: "1.1",

	forEach: function(object, block, context) {
		for (var key in object) {
			if (this.prototype[key] === undefined) {
				block.call(context, object[key], key, object);
			}
		}
	},

	implement: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "function") {
				// if it's a function, call it
				arguments[i](this.prototype);
			} else {
				// add the interface using the extend method
				this.prototype.extend(arguments[i]);
			}
		}
		return this;
	},

	toString: function() {
		return String(this.valueOf());
	}
});
/*jshint smarttabs:true */

var FlipClock;

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	"use strict";

	/**
	 * FlipFlock Helper
	 *
	 * @param  object  A jQuery object or CSS select
	 * @param  int     An integer used to start the clock (no. seconds)
	 * @param  object  An object of properties to override the default
	 */

	FlipClock = function(obj, digit, options) {
		if(digit instanceof Object && digit instanceof Date === false) {
			options = digit;
			digit = 0;
		}

		return new FlipClock.Factory(obj, digit, options);
	};

	/**
	 * The global FlipClock.Lang object
	 */

	FlipClock.Lang = {};

	/**
	 * The Base FlipClock class is used to extend all other FlipFlock
	 * classes. It handles the callbacks and the basic setters/getters
	 *
	 * @param 	object  An object of the default properties
	 * @param 	object  An object of properties to override the default
	 */

	FlipClock.Base = Base.extend({

		/**
		 * Build Date
		 */

		buildDate: '2014-12-12',

		/**
		 * Version
		 */

		version: '0.7.7',

		/**
		 * Sets the default options
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */

		constructor: function(_default, options) {
			if(typeof _default !== "object") {
				_default = {};
			}
			if(typeof options !== "object") {
				options = {};
			}
			this.setOptions($.extend(true, {}, _default, options));
		},

		/**
		 * Delegates the callback to the defined method
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */

		callback: function(method) {
		 	if(typeof method === "function") {
				var args = [];

				for(var x = 1; x <= arguments.length; x++) {
					if(arguments[x]) {
						args.push(arguments[x]);
					}
				}

				method.apply(this, args);
			}
		},

		/**
		 * Log a string into the console if it exists
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */

		log: function(str) {
			if(window.console && console.log) {
				console.log(str);
			}
		},

		/**
		 * Get an single option value. Returns false if option does not exist
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */

		getOption: function(index) {
			if(this[index]) {
				return this[index];
			}
			return false;
		},

		/**
		 * Get all options
		 *
		 * @return	bool
		 */

		getOptions: function() {
			return this;
		},

		/**
		 * Set a single option value
		 *
		 * @param 	string 	The name of the option
		 * @param 	mixed 	The value of the option
		 */

		setOption: function(index, value) {
			this[index] = value;
		},

		/**
		 * Set a multiple options by passing a JSON object
		 *
		 * @param 	object 	The object with the options
		 * @param 	mixed 	The value of the option
		 */

		setOptions: function(options) {
			for(var key in options) {
	  			if(typeof options[key] !== "undefined") {
		  			this.setOption(key, options[key]);
		  		}
		  	}
		}

	});

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	"use strict";

	/**
	 * The FlipClock Face class is the base class in which to extend
	 * all other FlockClock.Face classes.
	 *
	 * @param 	object  The parent FlipClock.Factory object
	 * @param 	object  An object of properties to override the default
	 */

	FlipClock.Face = FlipClock.Base.extend({

		/**
		 * Sets whether or not the clock should start upon instantiation
		 */

		autoStart: true,

		/**
		 * An array of jQuery objects used for the dividers (the colons)
		 */

		dividers: [],

		/**
		 * An array of FlipClock.List objects
		 */

		factory: false,

		/**
		 * An array of FlipClock.List objects
		 */

		lists: [],

		/**
		 * Constructor
		 *
		 * @param 	object  The parent FlipClock.Factory object
		 * @param 	object  An object of properties to override the default
		 */

		constructor: function(factory, options) {
			this.dividers = [];
			this.lists = [];
			this.base(options);
			this.factory = factory;
		},

		/**
		 * Build the clock face
		 */

		build: function() {
			if(this.autoStart) {
				this.start();
			}
		},

		/**
		 * Creates a jQuery object used for the digit divider
		 *
		 * @param	mixed 	The divider label text
		 * @param	mixed	Set true to exclude the dots in the divider.
		 *					If not set, is false.
		 */

		createDivider: function(label, css, excludeDots) {
			if(typeof css == "boolean" || !css) {
				excludeDots = css;
				css = label;
			}

			var dots = [
				'<span class="'+this.factory.classes.dot+' top"></span>',
				'<span class="'+this.factory.classes.dot+' bottom"></span>'
			].join('');

			if(excludeDots) {
				dots = '';
			}

			label = this.factory.localize(label);

			var html = [
				'<span class="'+this.factory.classes.divider+' '+(css ? css : '').toLowerCase()+'">',
					'<span class="'+this.factory.classes.label+'">'+(label ? label : '')+'</span>',
					dots,
				'</span>'
			];

			var $html = $(html.join(''));

			this.dividers.push($html);

			return $html;
		},

		/**
		 * Creates a FlipClock.List object and appends it to the DOM
		 *
		 * @param	mixed 	The digit to select in the list
		 * @param	object  An object to override the default properties
		 */

		createList: function(digit, options) {
			if(typeof digit === "object") {
				options = digit;
				digit = 0;
			}

			var obj = new FlipClock.List(this.factory, digit, options);

			this.lists.push(obj);

			return obj;
		},

		/**
		 * Triggers when the clock is reset
		 */

		reset: function() {
			this.factory.time = new FlipClock.Time(
				this.factory,
				this.factory.original ? Math.round(this.factory.original) : 0,
				{
					minimumDigits: this.factory.minimumDigits
				}
			);

			this.flip(this.factory.original, false);
		},

		/**
		 * Append a newly created list to the clock
		 */

		appendDigitToClock: function(obj) {
			obj.$el.append(false);
		},

		/**
		 * Add a digit to the clock face
		 */

		addDigit: function(digit) {
			var obj = this.createList(digit, {
				classes: {
					active: this.factory.classes.active,
					before: this.factory.classes.before,
					flip: this.factory.classes.flip
				}
			});

			this.appendDigitToClock(obj);
		},

		/**
		 * Triggers when the clock is started
		 */

		start: function() {},

		/**
		 * Triggers when the time on the clock stops
		 */

		stop: function() {},

		/**
		 * Auto increments/decrements the value of the clock face
		 */

		autoIncrement: function() {
			if(!this.factory.countdown) {
				this.increment();
			}
			else {
				this.decrement();
			}
		},

		/**
		 * Increments the value of the clock face
		 */

		increment: function() {
			this.factory.time.addSecond();
		},

		/**
		 * Decrements the value of the clock face
		 */

		decrement: function() {
			if(this.factory.time.getTimeSeconds() == 0) {
	        	this.factory.stop()
			}
			else {
				this.factory.time.subSecond();
			}
		},

		/**
		 * Triggers when the numbers on the clock flip
		 */

		flip: function(time, doNotAddPlayClass) {
			var t = this;

			$.each(time, function(i, digit) {
				var list = t.lists[i];

				if(list) {
					if(!doNotAddPlayClass && digit != list.digit) {
						list.play();
					}

					list.select(digit);
				}
				else {
					t.addDigit(digit);
				}
			});
		}

	});

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	"use strict";

	/**
	 * The FlipClock Factory class is used to build the clock and manage
	 * all the public methods.
	 *
	 * @param 	object  A jQuery object or CSS selector used to fetch
	 				    the wrapping DOM nodes
	 * @param 	mixed   This is the digit used to set the clock. If an
	 				    object is passed, 0 will be used.
	 * @param 	object  An object of properties to override the default
	 */

	FlipClock.Factory = FlipClock.Base.extend({

		/**
		 * The clock's animation rate.
		 *
		 * Note, currently this property doesn't do anything.
		 * This property is here to be used in the future to
		 * programmaticaly set the clock's animation speed
		 */

		animationRate: 1000,

		/**
		 * Auto start the clock on page load (True|False)
		 */

		autoStart: true,

		/**
		 * The callback methods
		 */

		callbacks: {
			destroy: false,
			create: false,
			init: false,
			interval: false,
			start: false,
			stop: false,
			reset: false
		},

		/**
		 * The CSS classes
		 */

		classes: {
			active: 'flip-clock-active',
			before: 'flip-clock-before',
			divider: 'flip-clock-divider',
			dot: 'flip-clock-dot',
			label: 'flip-clock-label',
			flip: 'flip',
			play: 'play',
			wrapper: 'flip-clock-wrapper'
		},

		/**
		 * The name of the clock face class in use
		 */

		clockFace: 'HourlyCounter',

		/**
		 * The name of the clock face class in use
		 */

		countdown: false,

		/**
		 * The name of the default clock face class to use if the defined
		 * clockFace variable is not a valid FlipClock.Face object
		 */

		defaultClockFace: 'HourlyCounter',

		/**
		 * The default language
		 */

		defaultLanguage: 'english',

		/**
		 * The jQuery object
		 */

		$el: false,

		/**
		 * The FlipClock.Face object
		 */

		face: true,

		/**
		 * The language object after it has been loaded
		 */

		lang: false,

		/**
		 * The language being used to display labels (string)
		 */

		language: 'english',

		/**
		 * The minimum digits the clock must have
		 */

		minimumDigits: 0,

		/**
		 * The original starting value of the clock. Used for the reset method.
		 */

		original: false,

		/**
		 * Is the clock running? (True|False)
		 */

		running: false,

		/**
		 * The FlipClock.Time object
		 */

		time: false,

		/**
		 * The FlipClock.Timer object
		 */

		timer: false,

		/**
		 * The jQuery object (depcrecated)
		 */

		$wrapper: false,

		/**
		 * Constructor
		 *
		 * @param   object  The wrapping jQuery object
		 * @param	object  Number of seconds used to start the clock
		 * @param	object 	An object override options
		 */

		constructor: function(obj, digit, options) {

			if(!options) {
				options = {};
			}

			this.lists = [];
			this.running = false;
			this.base(options);

			this.$el = $(obj).addClass(this.classes.wrapper);

			// Depcrated support of the $wrapper property.
			this.$wrapper = this.$el;

			this.original = (digit instanceof Date) ? digit : (digit ? Math.round(digit) : 0);

			this.time = new FlipClock.Time(this, this.original, {
				minimumDigits: this.minimumDigits,
				animationRate: this.animationRate
			});

			this.timer = new FlipClock.Timer(this, options);

			this.loadLanguage(this.language);

			this.loadClockFace(this.clockFace, options);

			if(this.autoStart) {
				this.start();
			}

		},

		/**
		 * Load the FlipClock.Face object
		 *
		 * @param	object  The name of the FlickClock.Face class
		 * @param	object 	An object override options
		 */

		loadClockFace: function(name, options) {
			var face, suffix = 'Face', hasStopped = false;

			name = name.ucfirst()+suffix;

			if(this.face.stop) {
				this.stop();
				hasStopped = true;
			}

			this.$el.html('');

			this.time.minimumDigits = this.minimumDigits;

			if(FlipClock[name]) {
				face = new FlipClock[name](this, options);
			}
			else {
				face = new FlipClock[this.defaultClockFace+suffix](this, options);
			}

			face.build();

			this.face = face

			if(hasStopped) {
				this.start();
			}

			return this.face;
		},

		/**
		 * Load the FlipClock.Lang object
		 *
		 * @param	object  The name of the language to load
		 */

		loadLanguage: function(name) {
			var lang;

			if(FlipClock.Lang[name.ucfirst()]) {
				lang = FlipClock.Lang[name.ucfirst()];
			}
			else if(FlipClock.Lang[name]) {
				lang = FlipClock.Lang[name];
			}
			else {
				lang = FlipClock.Lang[this.defaultLanguage];
			}

			return this.lang = lang;
		},

		/**
		 * Localize strings into various languages
		 *
		 * @param	string  The index of the localized string
		 * @param	object  Optionally pass a lang object
		 */

		localize: function(index, obj) {
			var lang = this.lang;

			if(!index) {
				return null;
			}

			var lindex = index.toLowerCase();

			if(typeof obj == "object") {
				lang = obj;
			}

			if(lang && lang[lindex]) {
				return lang[lindex];
			}

			return index;
		},


		/**
		 * Starts the clock
		 */

		start: function(callback) {
			var t = this;

			if(!t.running && (!t.countdown || t.countdown && t.time.time > 0)) {
				t.face.start(t.time);
				t.timer.start(function() {
					t.flip();

					if(typeof callback === "function") {
						callback();
					}
				});
			}
			else {
				t.log('Trying to start timer when countdown already at 0');
			}
		},

		/**
		 * Stops the clock
		 */

		stop: function(callback) {
			this.face.stop();
			this.timer.stop(callback);

			for(var x in this.lists) {
				if (this.lists.hasOwnProperty(x)) {
					this.lists[x].stop();
				}
			}
		},

		/**
		 * Reset the clock
		 */

		reset: function(callback) {
			this.timer.reset(callback);
			this.face.reset();
		},

		/**
		 * Sets the clock time
		 */

		setTime: function(time) {
			this.time.time = time;
			this.flip(true);
		},

		/**
		 * Get the clock time
		 *
		 * @return  object  Returns a FlipClock.Time object
		 */

		getTime: function(time) {
			return this.time;
		},

		/**
		 * Changes the increment of time to up or down (add/sub)
		 */

		setCountdown: function(value) {
			var running = this.running;

			this.countdown = value ? true : false;

			if(running) {
				this.stop();
				this.start();
			}
		},

		/**
		 * Flip the digits on the clock
		 *
		 * @param  array  An array of digits
		 */
		flip: function(doNotAddPlayClass) {
			this.face.flip(false, doNotAddPlayClass);
		}

	});

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	"use strict";

	/**
	 * The FlipClock List class is used to build the list used to create
	 * the card flip effect. This object fascilates selecting the correct
	 * node by passing a specific digit.
	 *
	 * @param 	object  A FlipClock.Factory object
	 * @param 	mixed   This is the digit used to set the clock. If an
	 *				    object is passed, 0 will be used.
	 * @param 	object  An object of properties to override the default
	 */

	FlipClock.List = FlipClock.Base.extend({

		/**
		 * The digit (0-9)
		 */

		digit: 0,

		/**
		 * The CSS classes
		 */

		classes: {
			active: 'flip-clock-active',
			before: 'flip-clock-before',
			flip: 'flip'
		},

		/**
		 * The parent FlipClock.Factory object
		 */

		factory: false,

		/**
		 * The jQuery object
		 */

		$el: false,

		/**
		 * The jQuery object (deprecated)
		 */

		$obj: false,

		/**
		 * The items in the list
		 */

		items: [],

		/**
		 * The last digit
		 */

		lastDigit: 0,

		/**
		 * Constructor
		 *
		 * @param  object  A FlipClock.Factory object
		 * @param  int     An integer use to select the correct digit
		 * @param  object  An object to override the default properties
		 */

		constructor: function(factory, digit, options) {
			this.factory = factory;
			this.digit = digit;
			this.lastDigit = digit;
			this.$el = this.createList();

			// Depcrated support of the $obj property.
			this.$obj = this.$el;

			if(digit > 0) {
				this.select(digit);
			}

			this.factory.$el.append(this.$el);
		},

		/**
		 * Select the digit in the list
		 *
		 * @param  int  A digit 0-9
		 */

		select: function(digit) {
			if(typeof digit === "undefined") {
				digit = this.digit;
			}
			else {
				this.digit = digit;
			}

			if(this.digit != this.lastDigit) {
				var $delete = this.$el.find('.'+this.classes.before).removeClass(this.classes.before);

				this.$el.find('.'+this.classes.active).removeClass(this.classes.active)
													  .addClass(this.classes.before);

				this.appendListItem(this.classes.active, this.digit);

				$delete.remove();

				this.lastDigit = this.digit;
			}
		},

		/**
		 * Adds the play class to the DOM object
		 */

		play: function() {
			this.$el.addClass(this.factory.classes.play);
		},

		/**
		 * Removes the play class to the DOM object
		 */

		stop: function() {
			var t = this;

			setTimeout(function() {
				t.$el.removeClass(t.factory.classes.play);
			}, this.factory.timer.interval);
		},

		/**
		 * Creates the list item HTML and returns as a string
		 */

		createListItem: function(css, value) {
			return [
				'<li class="'+(css ? css : '')+'">',
					'<a href="#">',
						'<div class="up">',
							'<div class="shadow"></div>',
							'<div class="inn">'+(value ? value : '')+'</div>',
						'</div>',
						'<div class="down">',
							'<div class="shadow"></div>',
							'<div class="inn">'+(value ? value : '')+'</div>',
						'</div>',
					'</a>',
				'</li>'
			].join('');
		},

		/**
		 * Append the list item to the parent DOM node
		 */

		appendListItem: function(css, value) {
			var html = this.createListItem(css, value);

			this.$el.append(html);
		},

		/**
		 * Create the list of digits and appends it to the DOM object
		 */

		createList: function() {

			var lastDigit = this.getPrevDigit() ? this.getPrevDigit() : this.digit;

			var html = $([
				'<ul class="'+this.classes.flip+' '+(this.factory.running ? this.factory.classes.play : '')+'">',
					this.createListItem(this.classes.before, lastDigit),
					this.createListItem(this.classes.active, this.digit),
				'</ul>'
			].join(''));

			return html;
		},

		getNextDigit: function() {
			return this.digit == 9 ? 0 : this.digit + 1;
		},

		getPrevDigit: function() {
			return this.digit == 0 ? 9 : this.digit - 1;
		}

	});


}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	"use strict";

	/**
	 * Capitalize the first letter in a string
	 *
	 * @return string
	 */

	String.prototype.ucfirst = function() {
		return this.substr(0, 1).toUpperCase() + this.substr(1);
	};

	/**
	 * jQuery helper method
	 *
	 * @param  int     An integer used to start the clock (no. seconds)
	 * @param  object  An object of properties to override the default
	 */

	$.fn.FlipClock = function(digit, options) {
		return new FlipClock($(this), digit, options);
	};

	/**
	 * jQuery helper method
	 *
	 * @param  int     An integer used to start the clock (no. seconds)
	 * @param  object  An object of properties to override the default
	 */

	$.fn.flipClock = function(digit, options) {
		return $.fn.FlipClock(digit, options);
	};

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	"use strict";

	/**
	 * The FlipClock Time class is used to manage all the time
	 * calculations.
	 *
	 * @param 	object  A FlipClock.Factory object
	 * @param 	mixed   This is the digit used to set the clock. If an
	 *				    object is passed, 0 will be used.
	 * @param 	object  An object of properties to override the default
	 */

	FlipClock.Time = FlipClock.Base.extend({

		/**
		 * The time (in seconds) or a date object
		 */

		time: 0,

		/**
		 * The parent FlipClock.Factory object
		 */

		factory: false,

		/**
		 * The minimum number of digits the clock face must have
		 */

		minimumDigits: 0,

		/**
		 * Constructor
		 *
		 * @param  object  A FlipClock.Factory object
		 * @param  int     An integer use to select the correct digit
		 * @param  object  An object to override the default properties
		 */

		constructor: function(factory, time, options) {
			if(typeof options != "object") {
				options = {};
			}

			if(!options.minimumDigits) {
				options.minimumDigits = factory.minimumDigits;
			}

			this.base(options);
			this.factory = factory;

			if(time) {
				this.time = time;
			}
		},

		/**
		 * Convert a string or integer to an array of digits
		 *
		 * @param   mixed  String or Integer of digits
		 * @return  array  An array of digits
		 */

		convertDigitsToArray: function(str) {
			var data = [];

			str = str.toString();

			for(var x = 0;x < str.length; x++) {
				if(str[x].match(/^\d*$/g)) {
					data.push(str[x]);
				}
			}

			return data;
		},

		/**
		 * Get a specific digit from the time integer
		 *
		 * @param   int    The specific digit to select from the time
		 * @return  mixed  Returns FALSE if no digit is found, otherwise
		 *				   the method returns the defined digit
		 */

		digit: function(i) {
			var timeStr = this.toString();
			var length  = timeStr.length;

			if(timeStr[length - i])	 {
				return timeStr[length - i];
			}

			return false;
		},

		/**
		 * Formats any array of digits into a valid array of digits
		 *
		 * @param   mixed  An array of digits
		 * @return  array  An array of digits
		 */

		digitize: function(obj) {
			var data = [];

			$.each(obj, function(i, value) {
				value = value.toString();

				if(value.length == 1) {
					value = '0'+value;
				}

				for(var x = 0; x < value.length; x++) {
					data.push(value.charAt(x));
				}
			});

			if(data.length > this.minimumDigits) {
				this.minimumDigits = data.length;
			}

			if(this.minimumDigits > data.length) {
				for(var x = data.length; x < this.minimumDigits; x++) {
					data.unshift('0');
				}
			}

			return data;
		},

		/**
		 * Gets a new Date object for the current time
		 *
		 * @return  array  Returns a Date object
		 */

		getDateObject: function() {
			if(this.time instanceof Date) {
				return this.time;
			}

			return new Date((new Date()).getTime() + this.getTimeSeconds() * 1000);
		},

		/**
		 * Gets a digitized daily counter
		 *
		 * @return  object  Returns a digitized object
		 */

		getDayCounter: function(includeSeconds) {
			var digits = [
				this.getDays(),
				this.getHours(true),
				this.getMinutes(true)
			];

			if(includeSeconds) {
				digits.push(this.getSeconds(true));
			}

			return this.digitize(digits);
		},

		/**
		 * Gets number of days
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */

		getDays: function(mod) {
			var days = this.getTimeSeconds() / 60 / 60 / 24;

			if(mod) {
				days = days % 7;
			}

			return Math.floor(days);
		},

		/**
		 * Gets an hourly breakdown
		 *
		 * @return  object  Returns a digitized object
		 */

		getHourCounter: function() {
			var obj = this.digitize([
				this.getHours(),
				this.getMinutes(true),
				this.getSeconds(true)
			]);

			return obj;
		},

		/**
		 * Gets an hourly breakdown
		 *
		 * @return  object  Returns a digitized object
		 */

		getHourly: function() {
			return this.getHourCounter();
		},

		/**
		 * Gets number of hours
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */

		getHours: function(mod) {
			var hours = this.getTimeSeconds() / 60 / 60;

			if(mod) {
				hours = hours % 24;
			}

			return Math.floor(hours);
		},

		/**
		 * Gets the twenty-four hour time
		 *
		 * @return  object  returns a digitized object
		 */

		getMilitaryTime: function(date, showSeconds) {
			if(typeof showSeconds === "undefined") {
				showSeconds = true;
			}

			if(!date) {
				date = this.getDateObject();
			}

			var data  = [
				date.getHours(),
				date.getMinutes()
			];

			if(showSeconds === true) {
				data.push(date.getSeconds());
			}

			return this.digitize(data);
		},

		/**
		 * Gets number of minutes
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */

		getMinutes: function(mod) {
			var minutes = this.getTimeSeconds() / 60;

			if(mod) {
				minutes = minutes % 60;
			}

			return Math.floor(minutes);
		},

		/**
		 * Gets a minute breakdown
		 */

		getMinuteCounter: function() {
			var obj = this.digitize([
				this.getMinutes(),
				this.getSeconds(true)
			]);

			return obj;
		},

		/**
		 * Gets time count in seconds regardless of if targetting date or not.
		 *
		 * @return  int   Returns a floored integer
		 */

		getTimeSeconds: function(date) {
			if(!date) {
				date = new Date();
			}

			if (this.time instanceof Date) {
				if (this.factory.countdown) {
					return Math.max(this.time.getTime()/1000 - date.getTime()/1000,0);
				} else {
					return date.getTime()/1000 - this.time.getTime()/1000 ;
				}
			} else {
				return this.time;
			}
		},

		/**
		 * Gets the current twelve hour time
		 *
		 * @return  object  Returns a digitized object
		 */

		getTime: function(date, showSeconds) {
			if(typeof showSeconds === "undefined") {
				showSeconds = true;
			}

			if(!date) {
				date = this.getDateObject();
			}

			console.log(date);


			var hours = date.getHours();
			var merid = hours > 12 ? 'PM' : 'AM';
			var data   = [
				hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours),
				date.getMinutes()
			];

			if(showSeconds === true) {
				data.push(date.getSeconds());
			}

			return this.digitize(data);
		},

		/**
		 * Gets number of seconds
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a ceiled integer
		 */

		getSeconds: function(mod) {
			var seconds = this.getTimeSeconds();

			if(mod) {
				if(seconds == 60) {
					seconds = 0;
				}
				else {
					seconds = seconds % 60;
				}
			}

			return Math.ceil(seconds);
		},

		/**
		 * Gets number of weeks
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */

		getWeeks: function(mod) {
			var weeks = this.getTimeSeconds() / 60 / 60 / 24 / 7;

			if(mod) {
				weeks = weeks % 52;
			}

			return Math.floor(weeks);
		},

		/**
		 * Removes a specific number of leading zeros from the array.
		 * This method prevents you from removing too many digits, even
		 * if you try.
		 *
		 * @param   int    Total number of digits to remove
		 * @return  array  An array of digits
		 */

		removeLeadingZeros: function(totalDigits, digits) {
			var total    = 0;
			var newArray = [];

			$.each(digits, function(i, digit) {
				if(i < totalDigits) {
					total += parseInt(digits[i], 10);
				}
				else {
					newArray.push(digits[i]);
				}
			});

			if(total === 0) {
				return newArray;
			}

			return digits;
		},

		/**
		 * Adds X second to the current time
		 */

		addSeconds: function(x) {
			if(this.time instanceof Date) {
				this.time.setSeconds(this.time.getSeconds() + x);
			}
			else {
				this.time += x;
			}
		},

		/**
		 * Adds 1 second to the current time
		 */

		addSecond: function() {
			this.addSeconds(1);
		},

		/**
		 * Substracts X seconds from the current time
		 */

		subSeconds: function(x) {
			if(this.time instanceof Date) {
				this.time.setSeconds(this.time.getSeconds() - x);
			}
			else {
				this.time -= x;
			}
		},

		/**
		 * Substracts 1 second from the current time
		 */

		subSecond: function() {
			this.subSeconds(1);
		},

		/**
		 * Converts the object to a human readable string
		 */

		toString: function() {
			return this.getTimeSeconds().toString();
		}

		/*
		getYears: function() {
			return Math.floor(this.time / 60 / 60 / 24 / 7 / 52);
		},

		getDecades: function() {
			return Math.floor(this.getWeeks() / 10);
		}*/
	});

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	"use strict";

	/**
	 * The FlipClock.Timer object managers the JS timers
	 *
	 * @param	object  The parent FlipClock.Factory object
	 * @param	object  Override the default options
	 */

	FlipClock.Timer = FlipClock.Base.extend({

		/**
		 * Callbacks
		 */

		callbacks: {
			destroy: false,
			create: false,
			init: false,
			interval: false,
			start: false,
			stop: false,
			reset: false
		},

		/**
		 * FlipClock timer count (how many intervals have passed)
		 */

		count: 0,

		/**
		 * The parent FlipClock.Factory object
		 */

		factory: false,

		/**
		 * Timer interval (1 second by default)
		 */

		interval: 1000,

		/**
		 * The rate of the animation in milliseconds (not currently in use)
		 */

		animationRate: 1000,

		/**
		 * Constructor
		 *
		 * @return	void
		 */

		constructor: function(factory, options) {
			this.base(options);
			this.factory = factory;
			this.callback(this.callbacks.init);
			this.callback(this.callbacks.create);
		},

		/**
		 * This method gets the elapsed the time as an interger
		 *
		 * @return	void
		 */

		getElapsed: function() {
			return this.count * this.interval;
		},

		/**
		 * This method gets the elapsed the time as a Date object
		 *
		 * @return	void
		 */

		getElapsedTime: function() {
			return new Date(this.time + this.getElapsed());
		},

		/**
		 * This method is resets the timer
		 *
		 * @param 	callback  This method resets the timer back to 0
		 * @return	void
		 */

		reset: function(callback) {
			clearInterval(this.timer);
			this.count = 0;
			this._setInterval(callback);
			this.callback(this.callbacks.reset);
		},

		/**
		 * This method is starts the timer
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */

		start: function(callback) {
			this.factory.running = true;
			this._createTimer(callback);
			this.callback(this.callbacks.start);
		},

		/**
		 * This method is stops the timer
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */

		stop: function(callback) {
			this.factory.running = false;
			this._clearInterval(callback);
			this.callback(this.callbacks.stop);
			this.callback(callback);
		},

		/**
		 * Clear the timer interval
		 *
		 * @return	void
		 */

		_clearInterval: function() {
			clearInterval(this.timer);
		},

		/**
		 * Create the timer object
		 *
		 * @param 	callback  A function that is called once the timer is created
		 * @return	void
		 */

		_createTimer: function(callback) {
			this._setInterval(callback);
		},

		/**
		 * Destroy the timer object
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */

		_destroyTimer: function(callback) {
			this._clearInterval();
			this.timer = false;
			this.callback(callback);
			this.callback(this.callbacks.destroy);
		},

		/**
		 * This method is called each time the timer interval is ran
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */

		_interval: function(callback) {
			this.callback(this.callbacks.interval);
			this.callback(callback);
			this.count++;
		},

		/**
		 * This sets the timer interval
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */

		_setInterval: function(callback) {
			var t = this;

			t._interval(callback);

			t.timer = setInterval(function() {
				t._interval(callback);
			}, this.interval);
		}

	});

}(jQuery));

(function($) {

	/**
	 * Twenty-Four Hour Clock Face
	 *
	 * This class will generate a twenty-four our clock for FlipClock.js
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default
	 */

	FlipClock.TwentyFourHourClockFace = FlipClock.Face.extend({

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */

		constructor: function(factory, options) {
			this.base(factory, options);
		},

		/**
		 * Build the clock face
		 *
		 * @param  object  Pass the time that should be used to display on the clock.
		 */

		build: function(time) {
			var t        = this;
			var children = this.factory.$el.find('ul');

			if(!this.factory.time.time) {
				this.factory.original = new Date();

				this.factory.time = new FlipClock.Time(this.factory, this.factory.original);
			}

			var time = time ? time : this.factory.time.getMilitaryTime(false, this.showSeconds);

			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					t.createList(digit);
				});
			}

			this.createDivider();
			this.createDivider();

			$(this.dividers[0]).insertBefore(this.lists[this.lists.length - 2].$el);
			$(this.dividers[1]).insertBefore(this.lists[this.lists.length - 4].$el);

			this.base();
		},

		/**
		 * Flip the clock face
		 */

		flip: function(time, doNotAddPlayClass) {
			this.autoIncrement();

			time = time ? time : this.factory.time.getMilitaryTime(false, this.showSeconds);

			this.base(time, doNotAddPlayClass);
		}

	});

}(jQuery));
(function($) {

	/**
	 * Counter Clock Face
	 *
	 * This class will generate a generice flip counter. The timer has been
	 * disabled. clock.increment() and clock.decrement() have been added.
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default
	 */

	FlipClock.CounterFace = FlipClock.Face.extend({

		/**
		 * Tells the counter clock face if it should auto-increment
		 */

		shouldAutoIncrement: false,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */

		constructor: function(factory, options) {

			if(typeof options != "object") {
				options = {};
			}

			factory.autoStart = options.autoStart ? true : false;

			if(options.autoStart) {
				this.shouldAutoIncrement = true;
			}

			factory.increment = function() {
				factory.countdown = false;
				factory.setTime(factory.getTime().getTimeSeconds() + 1);
			};

			factory.decrement = function() {
				factory.countdown = true;
				var time = factory.getTime().getTimeSeconds();
				if(time > 0) {
					factory.setTime(time - 1);
				}
			};

			factory.setValue = function(digits) {
				factory.setTime(digits);
			};

			factory.setCounter = function(digits) {
				factory.setTime(digits);
			};

			this.base(factory, options);
		},

		/**
		 * Build the clock face
		 */

		build: function() {
			var t        = this;
			var children = this.factory.$el.find('ul');
			var time 	 = this.factory.getTime().digitize([this.factory.getTime().time]);

			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					var list = t.createList(digit);

					list.select(digit);
				});

			}

			$.each(this.lists, function(i, list) {
				list.play();
			});

			this.base();
		},

		/**
		 * Flip the clock face
		 */

		flip: function(time, doNotAddPlayClass) {
			if(this.shouldAutoIncrement) {
				this.autoIncrement();
			}

			if(!time) {
				time = this.factory.getTime().digitize([this.factory.getTime().time]);
			}

			this.base(time, doNotAddPlayClass);
		},

		/**
		 * Reset the clock face
		 */

		reset: function() {
			this.factory.time = new FlipClock.Time(
				this.factory,
				this.factory.original ? Math.round(this.factory.original) : 0
			);

			this.flip();
		}
	});

}(jQuery));
(function($) {

	/**
	 * Daily Counter Clock Face
	 *
	 * This class will generate a daily counter for FlipClock.js. A
	 * daily counter will track days, hours, minutes, and seconds. If
	 * the number of available digits is exceeded in the count, a new
	 * digit will be created.
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default
	 */

	FlipClock.DailyCounterFace = FlipClock.Face.extend({

		showSeconds: true,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */

		constructor: function(factory, options) {
			this.base(factory, options);
		},

		/**
		 * Build the clock face
		 */

		build: function(time) {
			var t = this;
			var children = this.factory.$el.find('ul');
			var offset = 0;

			time = time ? time : this.factory.time.getDayCounter(this.showSeconds);

			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					t.createList(digit);
				});
			}

			if(this.showSeconds) {
				$(this.createDivider('Seconds')).insertBefore(this.lists[this.lists.length - 2].$el);
			}
			else
			{
				offset = 2;
			}

			$(this.createDivider('Minutes')).insertBefore(this.lists[this.lists.length - 4 + offset].$el);
			$(this.createDivider('Hours')).insertBefore(this.lists[this.lists.length - 6 + offset].$el);
			$(this.createDivider('Days', true)).insertBefore(this.lists[0].$el);

			this.base();
		},

		/**
		 * Flip the clock face
		 */

		flip: function(time, doNotAddPlayClass) {
			if(!time) {
				time = this.factory.time.getDayCounter(this.showSeconds);
			}

			this.autoIncrement();

			this.base(time, doNotAddPlayClass);
		}

	});

}(jQuery));
(function($) {

	/**
	 * Hourly Counter Clock Face
	 *
	 * This class will generate an hourly counter for FlipClock.js. An
	 * hour counter will track hours, minutes, and seconds. If number of
	 * available digits is exceeded in the count, a new digit will be
	 * created.
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default
	 */

	FlipClock.HourlyCounterFace = FlipClock.Face.extend({

		// clearExcessDigits: true,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */

		constructor: function(factory, options) {
			this.base(factory, options);
		},

		/**
		 * Build the clock face
		 */

		build: function(excludeHours, time) {
			var t = this;
			var children = this.factory.$el.find('ul');

			time = time ? time : this.factory.time.getHourCounter();

			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					t.createList(digit);
				});
			}

			$(this.createDivider('Seconds')).insertBefore(this.lists[this.lists.length - 2].$el);
			$(this.createDivider('Minutes')).insertBefore(this.lists[this.lists.length - 4].$el);

			if(!excludeHours) {
				$(this.createDivider('Hours', true)).insertBefore(this.lists[0].$el);
			}

			this.base();
		},

		/**
		 * Flip the clock face
		 */

		flip: function(time, doNotAddPlayClass) {
			if(!time) {
				time = this.factory.time.getHourCounter();
			}

			this.autoIncrement();

			this.base(time, doNotAddPlayClass);
		},

		/**
		 * Append a newly created list to the clock
		 */

		appendDigitToClock: function(obj) {
			this.base(obj);

			this.dividers[0].insertAfter(this.dividers[0].next());
		}

	});

}(jQuery));
(function($) {

	/**
	 * Minute Counter Clock Face
	 *
	 * This class will generate a minute counter for FlipClock.js. A
	 * minute counter will track minutes and seconds. If an hour is
	 * reached, the counter will reset back to 0. (4 digits max)
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default
	 */

	FlipClock.MinuteCounterFace = FlipClock.HourlyCounterFace.extend({

		clearExcessDigits: false,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */

		constructor: function(factory, options) {
			this.base(factory, options);
		},

		/**
		 * Build the clock face
		 */

		build: function() {
			this.base(true, this.factory.time.getMinuteCounter());
		},

		/**
		 * Flip the clock face
		 */

		flip: function(time, doNotAddPlayClass) {
			if(!time) {
				time = this.factory.time.getMinuteCounter();
			}

			this.base(time, doNotAddPlayClass);
		}

	});

}(jQuery));
(function($) {

	/**
	 * Twelve Hour Clock Face
	 *
	 * This class will generate a twelve hour clock for FlipClock.js
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default
	 */

	FlipClock.TwelveHourClockFace = FlipClock.TwentyFourHourClockFace.extend({

		/**
		 * The meridium jQuery DOM object
		 */

		meridium: false,

		/**
		 * The meridium text as string for easy access
		 */

		meridiumText: 'AM',

		/**
		 * Build the clock face
		 *
		 * @param  object  Pass the time that should be used to display on the clock.
		 */

		build: function() {
			var t = this;

			var time = this.factory.time.getTime(false, this.showSeconds);

			this.base(time);
			this.meridiumText = this.getMeridium();
			this.meridium = $([
				'<ul class="flip-clock-meridium">',
					'<li>',
						'<a href="#">'+this.meridiumText+'</a>',
					'</li>',
				'</ul>'
			].join(''));

			this.meridium.insertAfter(this.lists[this.lists.length-1].$el);
		},

		/**
		 * Flip the clock face
		 */

		flip: function(time, doNotAddPlayClass) {
			if(this.meridiumText != this.getMeridium()) {
				this.meridiumText = this.getMeridium();
				this.meridium.find('a').html(this.meridiumText);
			}
			this.base(this.factory.time.getTime(false, this.showSeconds), doNotAddPlayClass);
		},

		/**
		 * Get the current meridium
		 *
		 * @return  string  Returns the meridium (AM|PM)
		 */

		getMeridium: function() {
			return new Date().getHours() >= 12 ? 'PM' : 'AM';
		},

		/**
		 * Is it currently in the post-medirium?
		 *
		 * @return  bool  Returns true or false
		 */

		isPM: function() {
			return this.getMeridium() == 'PM' ? true : false;
		},

		/**
		 * Is it currently before the post-medirium?
		 *
		 * @return  bool  Returns true or false
		 */

		isAM: function() {
			return this.getMeridium() == 'AM' ? true : false;
		}

	});

}(jQuery));
(function($) {

    /**
     * FlipClock Arabic Language Pack
     *
     * This class will be used to translate tokens into the Arabic language.
     *
     */

    FlipClock.Lang.Arabic = {

      'years'   : 'سنوات',
      'months'  : 'شهور',
      'days'    : 'أيام',
      'hours'   : 'ساعات',
      'minutes' : 'دقائق',
      'seconds' : 'ثواني'

    };

    /* Create various aliases for convenience */

    FlipClock.Lang['ar']      = FlipClock.Lang.Arabic;
    FlipClock.Lang['ar-ar']   = FlipClock.Lang.Arabic;
    FlipClock.Lang['arabic']  = FlipClock.Lang.Arabic;

}(jQuery));
(function($) {

	/**
	 * FlipClock Danish Language Pack
	 *
	 * This class will used to translate tokens into the Danish language.
	 *
	 */

	FlipClock.Lang.Danish = {

		'years'   : 'År',
		'months'  : 'Måneder',
		'days'    : 'Dage',
		'hours'   : 'Timer',
		'minutes' : 'Minutter',
		'seconds' : 'Sekunder'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['da']     = FlipClock.Lang.Danish;
	FlipClock.Lang['da-dk']  = FlipClock.Lang.Danish;
	FlipClock.Lang['danish'] = FlipClock.Lang.Danish;

}(jQuery));
(function($) {

	/**
	 * FlipClock German Language Pack
	 *
	 * This class will used to translate tokens into the German language.
	 *
	 */

	FlipClock.Lang.German = {

		'years'   : 'Jahre',
		'months'  : 'Monate',
		'days'    : 'Tage',
		'hours'   : 'Stunden',
		'minutes' : 'Minuten',
		'seconds' : 'Sekunden'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['de']     = FlipClock.Lang.German;
	FlipClock.Lang['de-de']  = FlipClock.Lang.German;
	FlipClock.Lang['german'] = FlipClock.Lang.German;

}(jQuery));
(function($) {

	/**
	 * FlipClock English Language Pack
	 *
	 * This class will used to translate tokens into the English language.
	 *
	 */

	FlipClock.Lang.English = {

		'years'   : 'Years',
		'months'  : 'Months',
		'days'    : 'Days',
		'hours'   : 'Hours',
		'minutes' : 'Minutes',
		'seconds' : 'Seconds'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['en']      = FlipClock.Lang.English;
	FlipClock.Lang['en-us']   = FlipClock.Lang.English;
	FlipClock.Lang['english'] = FlipClock.Lang.English;

}(jQuery));
(function($) {

	/**
	 * FlipClock Spanish Language Pack
	 *
	 * This class will used to translate tokens into the Spanish language.
	 *
	 */

	FlipClock.Lang.Spanish = {

		'years'   : 'Años',
		'months'  : 'Meses',
		'days'    : 'Días',
		'hours'   : 'Horas',
		'minutes' : 'Minutos',
		'seconds' : 'Segundos'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['es']      = FlipClock.Lang.Spanish;
	FlipClock.Lang['es-es']   = FlipClock.Lang.Spanish;
	FlipClock.Lang['spanish'] = FlipClock.Lang.Spanish;

}(jQuery));
(function($) {

	/**
	 * FlipClock Finnish Language Pack
	 *
	 * This class will used to translate tokens into the Finnish language.
	 *
	 */

	FlipClock.Lang.Finnish = {

		'years'   : 'Vuotta',
		'months'  : 'Kuukautta',
		'days'    : 'Päivää',
		'hours'   : 'Tuntia',
		'minutes' : 'Minuuttia',
		'seconds' : 'Sekuntia'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['fi']      = FlipClock.Lang.Finnish;
	FlipClock.Lang['fi-fi']   = FlipClock.Lang.Finnish;
	FlipClock.Lang['finnish'] = FlipClock.Lang.Finnish;

}(jQuery));

(function($) {

  /**
   * FlipClock Canadian French Language Pack
   *
   * This class will used to translate tokens into the Canadian French language.
   *
   */

  FlipClock.Lang.French = {

    'years'   : 'Ans',
    'months'  : 'Mois',
    'days'    : 'Jours',
    'hours'   : 'Heures',
    'minutes' : 'Minutes',
    'seconds' : 'Secondes'

  };

  /* Create various aliases for convenience */

  FlipClock.Lang['fr']      = FlipClock.Lang.French;
  FlipClock.Lang['fr-ca']   = FlipClock.Lang.French;
  FlipClock.Lang['french']  = FlipClock.Lang.French;

}(jQuery));

(function($) {

	/**
	 * FlipClock Italian Language Pack
	 *
	 * This class will used to translate tokens into the Italian language.
	 *
	 */

	FlipClock.Lang.Italian = {

		'years'   : 'Anni',
		'months'  : 'Mesi',
		'days'    : 'Giorni',
		'hours'   : 'Ore',
		'minutes' : 'Minuti',
		'seconds' : 'Secondi'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['it']      = FlipClock.Lang.Italian;
	FlipClock.Lang['it-it']   = FlipClock.Lang.Italian;
	FlipClock.Lang['italian'] = FlipClock.Lang.Italian;

}(jQuery));

(function($) {

  /**
   * FlipClock Latvian Language Pack
   *
   * This class will used to translate tokens into the Latvian language.
   *
   */

  FlipClock.Lang.Latvian = {

    'years'   : 'Gadi',
    'months'  : 'Mēneši',
    'days'    : 'Dienas',
    'hours'   : 'Stundas',
    'minutes' : 'Minūtes',
    'seconds' : 'Sekundes'

  };

  /* Create various aliases for convenience */

  FlipClock.Lang['lv']      = FlipClock.Lang.Latvian;
  FlipClock.Lang['lv-lv']   = FlipClock.Lang.Latvian;
  FlipClock.Lang['latvian'] = FlipClock.Lang.Latvian;

}(jQuery));
(function($) {

    /**
     * FlipClock Dutch Language Pack
     *
     * This class will used to translate tokens into the Dutch language.
     */

    FlipClock.Lang.Dutch = {

        'years'   : 'Jaren',
        'months'  : 'Maanden',
        'days'    : 'Dagen',
        'hours'   : 'Uren',
        'minutes' : 'Minuten',
        'seconds' : 'Seconden'

    };

    /* Create various aliases for convenience */

    FlipClock.Lang['nl']      = FlipClock.Lang.Dutch;
    FlipClock.Lang['nl-be']   = FlipClock.Lang.Dutch;
    FlipClock.Lang['dutch']   = FlipClock.Lang.Dutch;

}(jQuery));

(function($) {

	/**
	 * FlipClock Norwegian-Bokmål Language Pack
	 *
	 * This class will used to translate tokens into the Norwegian language.
	 *
	 */

	FlipClock.Lang.Norwegian = {

		'years'   : 'År',
		'months'  : 'Måneder',
		'days'    : 'Dager',
		'hours'   : 'Timer',
		'minutes' : 'Minutter',
		'seconds' : 'Sekunder'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['no']      = FlipClock.Lang.Norwegian;
	FlipClock.Lang['nb']      = FlipClock.Lang.Norwegian;
	FlipClock.Lang['no-nb']   = FlipClock.Lang.Norwegian;
	FlipClock.Lang['norwegian'] = FlipClock.Lang.Norwegian;

}(jQuery));

(function($) {

	/**
	 * FlipClock Portuguese Language Pack
	 *
	 * This class will used to translate tokens into the Portuguese language.
	 *
	 */

	FlipClock.Lang.Portuguese = {

		'years'   : 'Anos',
		'months'  : 'Meses',
		'days'    : 'Dias',
		'hours'   : 'Horas',
		'minutes' : 'Minutos',
		'seconds' : 'Segundos'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['pt']         = FlipClock.Lang.Portuguese;
	FlipClock.Lang['pt-br']      = FlipClock.Lang.Portuguese;
	FlipClock.Lang['portuguese'] = FlipClock.Lang.Portuguese;

}(jQuery));
(function($) {

  /**
   * FlipClock Russian Language Pack
   *
   * This class will used to translate tokens into the Russian language.
   *
   */

  FlipClock.Lang.Russian = {

    'years'   : 'лет',
    'months'  : 'месяцев',
    'days'    : 'дней',
    'hours'   : 'часов',
    'minutes' : 'минут',
    'seconds' : 'секунд'

  };

  /* Create various aliases for convenience */

  FlipClock.Lang['ru']      = FlipClock.Lang.Russian;
  FlipClock.Lang['ru-ru']   = FlipClock.Lang.Russian;
  FlipClock.Lang['russian']  = FlipClock.Lang.Russian;

}(jQuery));
(function($) {

	/**
	 * FlipClock Swedish Language Pack
	 *
	 * This class will used to translate tokens into the Swedish language.
	 *
	 */

	FlipClock.Lang.Swedish = {

		'years'   : 'År',
		'months'  : 'Månader',
		'days'    : 'Dagar',
		'hours'   : 'Timmar',
		'minutes' : 'Minuter',
		'seconds' : 'Sekunder'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['sv']      = FlipClock.Lang.Swedish;
	FlipClock.Lang['sv-se']   = FlipClock.Lang.Swedish;
	FlipClock.Lang['swedish'] = FlipClock.Lang.Swedish;

}(jQuery));

(function($) {

	/**
	 * FlipClock Chinese Language Pack
	 *
	 * This class will used to translate tokens into the Chinese language.
	 *
	 */

	FlipClock.Lang.Chinese = {

		'years'   : '年',
		'months'  : '月',
		'days'    : '日',
		'hours'   : '时',
		'minutes' : '分',
		'seconds' : '秒'

	};

	/* Create various aliases for convenience */

	FlipClock.Lang['zh']      = FlipClock.Lang.Chinese;
	FlipClock.Lang['zh-cn']   = FlipClock.Lang.Chinese;
	FlipClock.Lang['chinese'] = FlipClock.Lang.Chinese;

}(jQuery));



/* * * * * * * * * * * * * * * * *
 * Pagination
 * javascript page navigation
 * * * * * * * * * * * * * * * * */

var Pagination = {

    code: '',

    // --------------------
    // Utility
    // --------------------

    // converting initialize data
    Extend: function(data) {
        data = data || {};
        Pagination.size = data.size || 300;
        Pagination.page = data.page || 1;
        Pagination.step = data.step || 3;
    },

    // add pages by number (from [s] to [f])
    Add: function(s, f) {
        for (var i = s; i < f; i++) {
            Pagination.code += '<span class="page-number clickable" data-page='+i+'>' + i + '</span>';
        }
    },

    // add last page with separator
    Last: function() {
        Pagination.code += '<span class="page-dot disable">...</span><span class="page-number clickable" data-page='+Pagination.size+'>' + Pagination.size + '</span>';
    },

    // add first page with separator
    First: function() {
        Pagination.code += '<span class="page-number clickable" data-page="1">1</span><span class="page-dot disable">...</span>';
    },



    // --------------------
    // Handlers
    // --------------------

    // change page
    Click: function() {
        Pagination.page = +this.innerHTML;
        Pagination.Start();
    },

    // previous page
    Prev: function() {
        Pagination.page--;
        if (Pagination.page < 1) {
            Pagination.page = 1;
        }
        Pagination.Start();
    },

    // next page
    Next: function() {
        Pagination.page++;
        if (Pagination.page > Pagination.size) {
            Pagination.page = Pagination.size;
        }
        Pagination.Start();
    },



    // --------------------
    // Script
    // --------------------

    // binding pages
    Bind: function() {
        var a = Pagination.e.getElementsByClassName('page-number');
        for (var i = 0; i < a.length; i++) {
            if (+a[i].innerHTML === Pagination.page) a[i].className = 'page-number active';
            a[i].addEventListener('click', Pagination.Click, false);
        }
    },

    // write pagination
    Finish: function() {
        Pagination.e.innerHTML = Pagination.code;
        Pagination.code = '';
        Pagination.Bind();
    },

    // find pagination type
    Start: function() {
        if (Pagination.size < Pagination.step * 2 + 6) {
            Pagination.Add(1, Pagination.size + 1);
        }
        else if (Pagination.page < Pagination.step * 2 + 1) {
            Pagination.Add(1, Pagination.step * 2 + 4);
            Pagination.Last();
        }
        else if (Pagination.page > Pagination.size - Pagination.step * 2) {
            Pagination.First();
            Pagination.Add(Pagination.size - Pagination.step * 2 - 2, Pagination.size + 1);
        }
        else {
            Pagination.First();
            Pagination.Add(Pagination.page - Pagination.step, Pagination.page + Pagination.step + 1);
            Pagination.Last();
        }
        Pagination.Finish();
    },



    // --------------------
    // Initialization
    // --------------------

    // binding buttons
    Buttons: function(e) {
        var nav = e.getElementsByTagName('a');
        nav[0].addEventListener('click', Pagination.Prev, false);
        nav[1].addEventListener('click', Pagination.Next, false);
    },

    // create skeleton
    Create: function(e) {

        var html = [
            '<a></a>', // previous button
            '<span></span>',  // pagination container
            '<a></a>'  // next button
        ];

        e.innerHTML = html.join('');
        Pagination.e = e.getElementsByTagName('span')[0];
        Pagination.Buttons(e);
    },

    // init
    Init: function(e, data) {
        Pagination.Extend(data);
        Pagination.Create(e);
        Pagination.Start();
    }
};


// liquidjs
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Liquid=e()}(this,function(){"use strict";var r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)};function i(t,e){function n(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}var m=function(){return(m=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var i in e=arguments[n])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t}).apply(this,arguments)};function d(s,o,u,a){return new(u||(u=Promise))(function(t,e){function n(t){try{i(a.next(t))}catch(t){e(t)}}function r(t){try{i(a.throw(t))}catch(t){e(t)}}function i(e){e.done?t(e.value):new u(function(t){t(e.value)}).then(n,r)}i((a=a.apply(s,o||[])).next())})}function g(n,r){var i,s,o,t,u={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return t={next:e(0),throw:e(1),return:e(2)},"function"==typeof Symbol&&(t[Symbol.iterator]=function(){return this}),t;function e(e){return function(t){return function(e){if(i)throw new TypeError("Generator is already executing.");for(;u;)try{if(i=1,s&&(o=2&e[0]?s.return:e[0]?s.throw||((o=s.return)&&o.call(s),0):s.next)&&!(o=o.call(s,e[1])).done)return o;switch(s=0,o&&(e=[2&e[0],o.value]),e[0]){case 0:case 1:o=e;break;case 4:return u.label++,{value:e[1],done:!1};case 5:u.label++,s=e[1],e=[0];continue;case 7:e=u.ops.pop(),u.trys.pop();continue;default:if(!(o=0<(o=u.trys).length&&o[o.length-1])&&(6===e[0]||2===e[0])){u=0;continue}if(3===e[0]&&(!o||e[1]>o[0]&&e[1]<o[3])){u.label=e[1];break}if(6===e[0]&&u.label<o[1]){u.label=o[1],o=e;break}if(o&&u.label<o[2]){u.label=o[2],u.ops.push(e);break}o[2]&&u.ops.pop(),u.trys.pop();continue}e=r.call(n,u)}catch(t){e=[6,t],s=0}finally{i=o=0}if(5&e[0])throw e[1];return{value:e[0]?e[1]:void 0,done:!0}}([e,t])}}}var e=Object.prototype.toString;function p(t){return"[object String]"===e.call(t)}function u(t){return"function"==typeof t}function a(t){return c(t)?"":(t=s(t),String(t))}function s(t){return u(t.toLiquid)?s(t.toLiquid()):t}function c(t){return null==t}function v(t){return"[object Array]"===e.call(t)}function o(t,e){for(var n in t=t||{})if(t.hasOwnProperty(n)&&!1===e(t[n],n,t))break;return t}function h(t){return t[t.length-1]}function y(t){var e=typeof t;return null!==t&&("object"===e||"function"===e)}function w(t,e,n){void 0===n&&(n=1);for(var r=[],i=t;i<e;i+=n)r.push(i);return r}function l(t,e,n){void 0===n&&(n=" ");for(var r=e-(t=String(t)).length;0<r--;)t=n+t;return t}var f=function(){function t(){}return t.prototype.valueOf=function(){},t.prototype.liquidMethodMissing=function(t){},t}(),t=function(r){function t(t,e){var n=r.call(this,t.message)||this;return n.originalError=t,n.token=e,n}return i(t,r),t.prototype.update=function(){var i,s,t,o,e=this.originalError,n=(i=this.token,s=i.input.split("\n"),t=Math.max(i.line-2,1),o=Math.min(i.line+3,s.length),w(t,o+1).map(function(t){var e=t===i.line?">> ":"   ",n=l(String(t),String(o).length),r=s[t-1];return""+e+n+"| "+r}).join("\n"));this.message=function(t,e){e.file&&(t+=", file:"+e.file);return t+=", line:"+e.line+", col:"+e.col}(e.message,this.token),this.stack=this.message+"\n"+n+"\n"+this.stack+"\nFrom "+e.stack},t}(Error),b=function(r){function t(t,e){var n=r.call(this,new Error(t),e)||this;return n.name="TokenizationError",r.prototype.update.call(n),n}return i(t,r),t}(t),n=function(r){function t(t,e){var n=r.call(this,t,e)||this;return n.name="ParseError",n.message=t.message,r.prototype.update.call(n),n}return i(t,r),t}(t),T=function(r){function t(t,e){var n=r.call(this,t,e.token)||this;return n.name="RenderError",n.message=t.message,r.prototype.update.call(n),n}return i(t,r),t}(t),x=function(n){function t(t){var e=n.call(this,t)||this;return e.resolvedHTML="",e.name="RenderBreakError",e.message=t+"",e}return i(t,n),t}(Error),E=function(n){function t(t){var e=n.call(this,t)||this;return e.name="AssertionError",e.message=t+"",e}return i(t,n),t}(Error);function k(t,e){if(!t)throw new E(e=e||"expect "+t+" to be true")}var R={root:["."],cache:!1,extname:"",dynamicPartials:!0,trimTagRight:!1,trimTagLeft:!1,trimOutputRight:!1,trimOutputLeft:!1,greedy:!0,tagDelimiterLeft:"{%",tagDelimiterRight:"%}",outputDelimiterLeft:"{{",outputDelimiterRight:"}}",strictFilters:!1,strictVariables:!1};function q(t){var e;return(t=t||{}).hasOwnProperty("root")&&(t.root=v(e=t.root)?e:p(e)?[e]:[]),t}function S(t){return m({},R,t)}var O=function(){function t(t,e){void 0===t&&(t={}),this.scopes=[{}],this.registers={},this.opts=S(e),this.environments=t}return t.prototype.getRegister=function(t,e){return void 0===e&&(e={}),this.registers[t]=this.registers[t]||e},t.prototype.setRegister=function(t,e){return this.registers[t]=e},t.prototype.getAll=function(){return[this.environments].concat(this.scopes).reduce(function(t,e){return m(t,e)},{})},t.prototype.get=function(o){return d(this,void 0,void 0,function(){var e,n,r,i,s;return g(this,function(t){switch(t.label){case 0:return[4,this.parseProp(o)];case 1:for(e=t.sent(),n=this.findScope(e[0])||this.environments,r=0,i=e;r<i.length;r++)if(s=i[r],c(n=M(n,s))&&this.opts.strictVariables)throw new TypeError("undefined variable: "+s);return[2,n]}})})},t.prototype.push=function(t){return this.scopes.push(t)},t.prototype.pop=function(){return this.scopes.pop()},t.prototype.front=function(){return this.scopes[0]},t.prototype.findScope=function(t){for(var e=this.scopes.length-1;0<=e;e--){var n=this.scopes[e];if(t in n)return n}return null},t.prototype.parseProp=function(a){return d(this,void 0,void 0,function(){function e(){r.length&&n.push(r),r=""}var n,r,i,s,o,u;return g(this,function(t){switch(t.label){case 0:a=String(a),n=[],r="",s=0,t.label=1;case 1:if(!(s<a.length))return[3,10];switch(a[s]){case"[":return[3,2];case".":return[3,7]}return[3,8];case 2:return e(),o=a[s+1],/['"]/.test(o)?(k(-1!==(i=a.indexOf(o,s+2)),"unbalanced "+o+": "+a),r=a.slice(s+2,i),e(),s=i+2,[3,6]):[3,3];case 3:return k(-1!==(i=function(t,e){for(var n=1,r=e;r<t.length;r++)if("["===t[r]&&n++,"]"===t[r]&&0===--n)return r;return-1}(a,s+1)),"unbalanced []: "+a),r=a.slice(s+1,i),/^[+-]?\d+$/.test(r)?[3,5]:(u=String,[4,this.get(r)]);case 4:r=u.apply(void 0,[t.sent()]),t.label=5;case 5:e(),s=i+1,t.label=6;case 6:return[3,9];case 7:return e(),s++,[3,9];case 8:r+=a[s++],t.label=9;case 9:return[3,1];case 10:if(e(),!n.length)throw new TypeError('invalid path:"'+a+'"');return[2,n]}})})},t}();function M(t,e){return c(t)?t:(t=s(t))instanceof f?u(t[e])?t[e]():t.hasOwnProperty(e)?t[e]:t.liquidMethodMissing(e):"size"===e?c((n=t).size)&&(v(n)||p(n))?n.length:n.size:t[e];var n}var L=Object.freeze({ParseError:n,TokenizationError:b,RenderBreakError:x,AssertionError:E,Drop:f});var D={readFile:function(r){return d(this,void 0,void 0,function(){return g(this,function(t){return[2,new Promise(function(t,e){var n=new XMLHttpRequest;n.onload=function(){200<=n.status&&n.status<300?t(n.responseText):e(new Error(n.statusText))},n.onerror=function(){e(new Error("An error occurred whilst receiving the response."))},n.open("GET",r),n.send()})]})})},resolve:function(t,e,i){return t.length&&"/"!==h(t)&&(t+="/"),function(t,e){var n=document.createElement("base");n.href=t;var r=document.getElementsByTagName("head")[0];r.insertBefore(n,r.firstChild);var i=document.createElement("a");i.href=e;var s=i.href;return r.removeChild(n),s}(t,e).replace(/^(\w+:\/\/[^/]+)(\/[^?]+)/,function(t,e,n){var r=n.split("/").pop();return/\.\w+$/.test(r)?t:e+n+i})},exists:function(){return d(this,void 0,void 0,function(){return g(this,function(t){return[2,!0]})})}},P=function(t,e,n,r,i){this.trimLeft=!1,this.trimRight=!1,this.type="notset",this.col=r,this.line=n,this.raw=t,this.value=t,this.input=e,this.file=i},F=function(f){function t(t,e,n,r,i,s,o,u){var a=f.call(this,t,n,r,i,u)||this,c="-"===e[0],l="-"===h(e);return a.value=e.slice(c?1:0,l?-1:e.length).trim(),a.trimLeft=c||s,a.trimRight=l||o,a}return i(t,f),t}(P),U=new RegExp(/'[^']*'/.source+"|"+/"[^"]*"/.source),j=new RegExp("(?:"+U.source+"|[^'\"])*"),_=/[+-]?(?:\d+\.?\d*|\.?\d+)/,A=/[\w-]+[?]?/,H=new RegExp("\\[(?:"+U.source+"|[\\w-\\.]+)\\]"),N=new RegExp("(?:"+U.source+"|"+/true|false/.source+"|"+_.source+")"),z=new RegExp(A.source+"(?:\\."+A.source+"|"+H.source+")*"),Y=new RegExp("(?:"+z.source+"|"+_.source+")"),$=new RegExp("\\("+Y.source+"\\.\\."+Y.source+"\\)"),I=new RegExp("\\(("+Y.source+")\\.\\.("+Y.source+")\\)"),C=new RegExp("(?:"+z.source+"|"+N.source+"|"+$.source+")"),B=new RegExp("(?:"+A.source+")\\s*:\\s*(?:"+C.source+")"),V=new RegExp("("+A.source+")\\s*:\\s*("+C.source+")","g"),G=new RegExp("^\\s*("+A.source+")\\s*([\\s\\S]*?)\\s*$"),W=new RegExp("^"+U.source+"$"),J=new RegExp("^"+I.source+"$"),X=[/\s+or\s+/,/\s+and\s+/,/==|!=|<=|>=|<|>|\s+contains\s+/],K=function(c){function t(t,e,n,r,i,s,o){var u=c.call(this,t,e,n,r,i,s.trimTagLeft,s.trimTagRight,o)||this;u.type="tag";var a=u.value.match(G);if(!a)throw new b("illegal tag syntax",u);return u.name=a[1],u.args=a[2],u}return i(t,c),t.is=function(t){return"tag"===t.type},t}(F),Q=function(o){function t(t,e,n,r,i){var s=o.call(this,t,e,n,r,i)||this;return s.type="html",s.value=t,s}return i(t,o),t.is=function(t){return"html"===t.type},t}(P);function Z(t,e){if(t&&Q.is(t)){var n=e?/\s+$/g:/[\t\r ]*$/g;t.value=t.value.replace(n,"")}}function tt(t,e){if(t&&Q.is(t)){var n=e?/^\s+/g:/^[\t\r ]*\n?/g;t.value=t.value.replace(n,"")}}var et,nt,rt=function(a){function t(t,e,n,r,i,s,o){var u=a.call(this,t,e,n,r,i,s.trimOutputLeft,s.trimOutputRight,o)||this;return u.type="output",u}return i(t,a),t.is=function(t){return"output"===t.type},t}(F);(nt=et||(et={}))[nt.HTML=0]="HTML",nt[nt.OUTPUT=1]="OUTPUT",nt[nt.TAG=2]="TAG";var it=function(){function t(t){this.options=S(t)}return t.prototype.tokenize=function(t,e){for(var n=[],r=this.options,i=r.tagDelimiterLeft,s=r.tagDelimiterRight,o=r.outputDelimiterLeft,u=r.outputDelimiterRight,a=0,c=1,l=et.HTML,f="",h=0,p=1,d=1;a<t.length;){if("\n"===t[a]&&(c++,h=a+1),l===et.HTML){if(t.substr(a,o.length)===o){f&&n.push(new Q(f,t,p,d,e)),p=c,d=a-h+1,a+=(f=o).length,l=et.OUTPUT;continue}if(t.substr(a,i.length)===i){f&&n.push(new Q(f,t,p,d,e)),p=c,d=a-h+1,a+=(f=i).length,l=et.TAG;continue}}else{if(l===et.OUTPUT&&t.substr(a,u.length)===u){f+=u,n.push(new rt(f,f.slice(o.length,-u.length),t,p,d,this.options,e)),f="",p=c,d=(a+=u.length)-h+1,l=et.HTML;continue}if(t.substr(a,s.length)===s){f+=s,n.push(new K(f,f.slice(i.length,-s.length),t,p,d,this.options,e)),f="",p=c,d=(a+=s.length)-h+1,l=et.HTML;continue}}f+=t[a++]}if(l===et.HTML)return f&&n.push(new Q(f,t,p,d,e)),function(t,e){e=m({greedy:!0},e);for(var n=!1,r=0;r<t.length;r++){var i=t[r];!n&&i.trimLeft&&Z(t[r-1],e.greedy),K.is(i)&&("raw"===i.name?n=!0:"endraw"===i.name&&(n=!1)),!n&&i.trimRight&&tt(t[r+1],e.greedy)}}(n,this.options),n;var g=l===et.OUTPUT?"output":"tag",v=16<f.length?f.slice(0,13)+"...":f;throw new b(g+' "'+v+'" not closed',new P(f,t,p,d,e))},t}(),st=function(){function t(){}return t.prototype.renderTemplates=function(u,a){return d(this,void 0,void 0,function(){var e,n,r,i,s,o;return g(this,function(t){switch(t.label){case 0:k(a,"unable to evalTemplates: context undefined"),e="",n=0,r=u,t.label=1;case 1:if(!(n<r.length))return[3,6];i=r[n],t.label=2;case 2:return t.trys.push([2,4,,5]),s=e,[4,i.render(a)];case 3:return e=s+t.sent(),[3,5];case 4:if("RenderBreakError"===(o=t.sent()).name)throw o.resolvedHTML=e,o;throw"RenderError"===o.name?o:new T(o,i);case 5:return n++,[3,1];case 6:return[2,e]}})})},t}();function ot(t){return t&&u(t.equals)}var ut=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return i(e,t),e.prototype.equals=function(t){return p(t)||v(t)?0===t.length:!!y(t)&&0===Object.keys(t).length},e.prototype.gt=function(){return!1},e.prototype.geq=function(){return!1},e.prototype.lt=function(){return!1},e.prototype.leq=function(){return!1},e.prototype.valueOf=function(){return""},e}(f),at=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i(t,e),t.prototype.equals=function(t){return!1===t||(!!c(t instanceof f?t.valueOf():t)||(p(t)?/^\s*$/.test(t):e.prototype.equals.call(this,t)))},t}(ut),ct=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return i(e,t),e.prototype.equals=function(t){return c(t instanceof f?t.valueOf():t)||t instanceof at},e.prototype.gt=function(){return!1},e.prototype.geq=function(){return!1},e.prototype.lt=function(){return!1},e.prototype.leq=function(){return!1},e.prototype.valueOf=function(){return null},e}(f),lt={"==":function(t,e){return ot(t)?t.equals(e):ot(e)?e.equals(t):t===e},"!=":function(t,e){return ot(t)?!t.equals(e):ot(e)?!e.equals(t):t!==e},">":function(t,e){return ot(t)?t.gt(e):ot(e)?e.lt(t):e<t},"<":function(t,e){return ot(t)?t.lt(e):ot(e)?e.gt(t):t<e},">=":function(t,e){return ot(t)?t.geq(e):ot(e)?e.leq(t):e<=t},"<=":function(t,e){return ot(t)?t.leq(e):ot(e)?e.geq(t):t<=e},contains:function(t,e){return!(!t||!u(t.indexOf))&&-1<t.indexOf(e)},and:function(t,e){return dt(t)&&dt(e)},or:function(t,e){return dt(t)||dt(e)}};function ft(n,r){return d(this,void 0,void 0,function(){var e;return g(this,function(t){switch(t.label){case 0:return[4,function f(h,p){return d(this,void 0,void 0,function(){var e,n,r,i,s,o,u,a,c,l;return g(this,function(t){switch(t.label){case 0:k(p,"unable to parseExp: scope undefined"),e=X,r=0,t.label=1;case 1:return r<e.length?(i=e[r],s=new RegExp("^("+j.source+")("+i.source+")("+j.source+")$"),(n=h.match(s))?[4,f(n[1],p)]:[3,4]):[3,5];case 2:return o=t.sent(),u=lt[n[2].trim()],[4,f(n[3],p)];case 3:return a=t.sent(),[2,u(o,a)];case 4:return r++,[3,1];case 5:return(n=h.match(J))?[4,pt(n[1],p)]:[3,8];case 6:return c=t.sent(),[4,pt(n[2],p)];case 7:return l=t.sent(),[2,w(+c,+l+1)];case 8:return[2,ht(h,p)]}})})}(n,r)];case 1:return[2,(e=t.sent())instanceof f?e.valueOf():e]}})})}function ht(e,n){return d(this,void 0,void 0,function(){return g(this,function(t){return e?"true"===(e=e.trim())?[2,!0]:"false"===e?[2,!1]:"nil"===e||"null"===e?[2,new ct]:"empty"===e?[2,new ut]:"blank"===e?[2,new at]:isNaN(Number(e))?'"'!==e[0]&&"'"!==e[0]||e[0]!==h(e)?[2,n.get(e)]:[2,e.slice(1,-1)]:[2,Number(e)]:[2,null]})})}function pt(n,r){return d(this,void 0,void 0,function(){var e;return g(this,function(t){switch(t.label){case 0:return[4,ht(n,r)];case 1:return[2,(e=t.sent())instanceof f?e.valueOf():e]}})})}function dt(t){return!gt(t)}function gt(t){return!1===t||null==t}var vt,mt,yt=function(){function c(){}return c.create=function(u,a){return d(this,void 0,void 0,function(){var e,n,r,i,s,o;return g(this,function(t){switch(t.label){case 0:e=new c,V.lastIndex=0,t.label=1;case 1:return(n=V.exec(u))?(r=n[1],i=n[2],s=e,o=r,[4,pt(i,a)]):[3,3];case 2:return s[o]=t.sent(),[3,1];case 3:return[2,e]}})})},c}(),wt=function(t){this.token=t},bt=function(s){function o(t,e,n){var r=s.call(this,t)||this;r.name=t.name;var i=o.impls[t.name];return k(i,"tag "+t.name+" not found"),r.impl=Object.create(i),r.impl.liquid=n,r.impl.parse&&r.impl.parse(t,e),r}return i(o,s),o.prototype.render=function(s){return d(this,void 0,void 0,function(){var e,n,r,i;return g(this,function(t){switch(t.label){case 0:return[4,yt.create(this.token.args,s)];case 1:return e=t.sent(),u((n=this.impl).render)?(i=a,[4,n.render(s,e)]):[3,3];case 2:return r=i.apply(void 0,[t.sent()]),[3,4];case 3:r="",t.label=4;case 4:return[2,r]}})})},o.register=function(t,e){o.impls[t]=e},o.clear=function(){o.impls={}},o.impls={},o}(wt),Tt=function(){function i(t,e,n){var r=i.impls[t];if(!r&&n)throw new TypeError("undefined filter: "+t);this.name=t,this.impl=r||function(t){return t},this.args=e}return i.prototype.render=function(l,f){return d(this,void 0,void 0,function(){var e,n,r,i,s,o,u,a,c;return g(this,function(t){switch(t.label){case 0:e=[],n=0,r=this.args,t.label=1;case 1:return n<r.length?v(i=r[n])?(o=(s=e).push,u=[i[0]],[4,pt(i[1],f)]):[3,3]:[3,6];case 2:return o.apply(s,[u.concat([t.sent()])]),[3,5];case 3:return c=(a=e).push,[4,pt(i,f)];case 4:c.apply(a,[t.sent()]),t.label=5;case 5:return n++,[3,1];case 6:return[2,this.impl.apply({context:f},[l].concat(e))]}})})},i.register=function(t,e){i.impls[t]=e},i.clear=function(){i.impls={}},i.impls={},i}(),xt=function(){function t(t,e){this.handlers={},this.stopRequested=!1,this.tokens=t,this.parseToken=e}return t.prototype.on=function(t,e){return this.handlers[t]=e,this},t.prototype.trigger=function(t,e){var n=this.handlers[t];return!!n&&(n(e),!0)},t.prototype.start=function(){var t;for(this.trigger("start");!this.stopRequested&&(t=this.tokens.shift());)if(!(this.trigger("token",t)||K.is(t)&&this.trigger("tag:"+t.name,t))){var e=this.parseToken(t,this.tokens);this.trigger("template",e)}return this.stopRequested||this.trigger("end"),this},t.prototype.stop=function(){return this.stopRequested=!0,this},t}(),Et=function(){function r(t,e){this.filters=[];var n=r.tokenize(t);this.strictFilters=e,this.initial=n[0],this.parseFilters(n,1)}return r.prototype.parseFilters=function(t,e){for(var n=e;n<t.length;)if("|"===t[n]){for(var r=++n;n<t.length&&"|"!==t[n];)n++;this.parseFilter(t,r,n)}else n++},r.prototype.parseFilter=function(t,e,n){for(var r,i,s=t[e],o=[],u=e+1;u<n+1;u++)u===n||","===t[u]?((r||i)&&o.push(r?[r,i]:i),i=r=void 0):":"===t[u]?(r=i,i=void 0):void 0===i&&(i=t[u]);this.filters.push(new Tt(s,o,this.strictFilters))},r.prototype.value=function(i){return d(this,void 0,void 0,function(){var e,n,r;return g(this,function(t){switch(t.label){case 0:return[4,ft(this.initial,i)];case 1:e=t.sent(),n=0,r=this.filters,t.label=2;case 2:return n<r.length?[4,r[n].render(e,i)]:[3,5];case 3:e=t.sent(),t.label=4;case 4:return n++,[3,2];case 5:return[2,e]}})})},r.tokenize=function(t){for(var e=[],n=0;n<t.length;){var r=t[n];if('"'===r||"'"===r){var i=n;for(n+=2;n<t.length&&t[n-1]!==r;++n);e.push(t.slice(i,n))}else if(/\s/.test(r))n++;else if(/[|,:]/.test(r))e.push(t[n++]);else{for(i=n++;n<t.length&&!/[|,:\s]/.test(t[n]);++n);e.push(t.slice(i,n))}}return e},r}(),kt=function(r){function t(t,e){var n=r.call(this,t)||this;return n.value=new Et(t.value,e),n}return i(t,r),t.prototype.render=function(e){return d(this,void 0,void 0,function(){return g(this,function(t){switch(t.label){case 0:return[4,this.value.value(e)];case 1:return[2,a(t.sent())]}})})},t}(wt),Rt=function(n){function t(t){var e=n.call(this,t)||this;return e.str=t.value,e}return i(t,n),t.prototype.render=function(){return d(this,void 0,void 0,function(){return g(this,function(t){return[2,this.str]})})},t}(wt),qt=function(){function t(t){this.liquid=t}return t.prototype.parse=function(t){for(var e,n=[];e=t.shift();)n.push(this.parseToken(e,t));return n},t.prototype.parseToken=function(e,t){try{return K.is(e)?new bt(e,t,this.liquid):rt.is(e)?new kt(e,this.liquid.options.strictFilters):new Rt(e)}catch(t){throw new n(t,e)}},t.prototype.parseStream=function(t){var n=this;return new xt(t,function(t,e){return n.parseToken(t,e)})},t}(),St=new RegExp("("+A.source+")\\s*=([^]*)"),Ot={parse:function(t){var e=t.args.match(St);k(e,"illegal token "+t.raw),this.key=e[1],this.value=e[2]},render:function(r){return d(this,void 0,void 0,function(){var e,n;return g(this,function(t){switch(t.label){case 0:return e=r.front(),n=this.key,[4,this.liquid.evalValue(this.value,r)];case 1:return e[n]=t.sent(),[2]}})})}},Mt=function(n){function t(t){var e=n.call(this)||this;return e.i=0,e.length=t,e}return i(t,n),t.prototype.next=function(){this.i++},t.prototype.index0=function(){return this.i},t.prototype.index=function(){return this.i+1},t.prototype.first=function(){return 0===this.i},t.prototype.last=function(){return this.i===this.length-1},t.prototype.rindex=function(){return this.length-this.i},t.prototype.rindex0=function(){return this.length-this.i-1},t.prototype.valueOf=function(){return JSON.stringify(this)},t}(f),Lt=new RegExp("^("+A.source+")\\s+in\\s+("+C.source+")(?:\\s+"+B.source+")*(?:\\s+(reversed))?(?:\\s+"+B.source+")*$"),Dt={type:"block",parse:function(t,e){var n,r=this,i=Lt.exec(t.args);k(i,"illegal tag: "+t.raw),this.variable=i[1],this.collection=i[2],this.reversed=!!i[3],this.templates=[],this.elseTemplates=[];var s=this.liquid.parser.parseStream(e).on("start",function(){return n=r.templates}).on("tag:else",function(){return n=r.elseTemplates}).on("tag:endfor",function(){return s.stop()}).on("template",function(t){return n.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")});s.start()},render:function(f,h){return d(this,void 0,void 0,function(){var e,n,r,i,s,o,u,a,c,l;return g(this,function(t){switch(t.label){case 0:return[4,ft(this.collection,f)];case 1:if(v(e=t.sent())||(p(e)&&0<e.length?e=[e]:y(e)&&(e=Object.keys(e).map(function(t){return[t,e[t]]}))),!v(e)||!e.length)return[2,this.liquid.renderer.renderTemplates(this.elseTemplates,f)];n=h.offset||0,r=void 0===h.limit?e.length:h.limit,e=e.slice(n,n+r),this.reversed&&e.reverse(),i={forloop:new Mt(e.length)},f.push(i),s="",o=0,u=e,t.label=2;case 2:if(!(o<u.length))return[3,8];a=u[o],i[this.variable]=a,t.label=3;case 3:return t.trys.push([3,5,,6]),c=s,[4,this.liquid.renderer.renderTemplates(this.templates,f)];case 4:return s=c+t.sent(),[3,6];case 5:if("RenderBreakError"!==(l=t.sent()).name)throw l;return s+=l.resolvedHTML,"break"===l.message?[3,8]:[3,6];case 6:i.forloop.next(),t.label=7;case 7:return o++,[3,2];case 8:return f.pop(),[2,s]}})})}},Pt=new RegExp("("+A.source+")"),Ft={parse:function(t,e){var n=this,r=t.args.match(Pt);k(r,t.args+" not valid identifier"),this.variable=r[1],this.templates=[];var i=this.liquid.parser.parseStream(e);i.on("tag:endcapture",function(){return i.stop()}).on("template",function(t){return n.templates.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")}),i.start()},render:function(n){return d(this,void 0,void 0,function(){var e;return g(this,function(t){switch(t.label){case 0:return[4,this.liquid.renderer.renderTemplates(this.templates,n)];case 1:return e=t.sent(),n.front()[this.variable]=e,[2]}})})}},Ut={parse:function(t,e){var n=this;this.cond=t.args,this.cases=[],this.elseTemplates=[];var r=[],i=this.liquid.parser.parseStream(e).on("tag:when",function(t){n.cases.push({val:t.args,templates:r=[]})}).on("tag:else",function(){return r=n.elseTemplates}).on("tag:endcase",function(){return i.stop()}).on("template",function(t){return r.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")});i.start()},render:function(s){return d(this,void 0,void 0,function(){var e,n,r,i;return g(this,function(t){switch(t.label){case 0:e=0,t.label=1;case 1:return e<this.cases.length?[4,ft((n=this.cases[e]).val,s)]:[3,5];case 2:return r=t.sent(),[4,ft(this.cond,s)];case 3:if(i=t.sent(),r===i)return[2,this.liquid.renderer.renderTemplates(n.templates,s)];t.label=4;case 4:return e++,[3,1];case 5:return[2,this.liquid.renderer.renderTemplates(this.elseTemplates,s)]}})})}},jt={parse:function(t,e){var n=this.liquid.parser.parseStream(e);n.on("token",function(t){"endcomment"===t.name&&n.stop()}).on("end",function(){throw new Error("tag "+t.raw+" not closed")}),n.start()}};(mt=vt||(vt={}))[mt.OUTPUT=0]="OUTPUT",mt[mt.STORE=1]="STORE";var _t=vt,At=/[^\s,]+/,Ht=new RegExp("with\\s+("+C.source+")"),Nt={parse:function(t){var e=At.exec(t.args);e&&(this.staticValue=e[0]),(e=C.exec(t.args))&&(this.value=e[0]),(e=Ht.exec(t.args))&&(this.with=e[1])},render:function(c,l){return d(this,void 0,void 0,function(){var e,n,r,i,s,o,u,a;return g(this,function(t){switch(t.label){case 0:return c.opts.dynamicPartials?W.exec(this.value)?(n=this.value.slice(1,-1),[4,this.liquid.parseAndRender(n,c.getAll(),c.opts)]):[3,2]:[3,5];case 1:return e=t.sent(),[3,4];case 2:return[4,pt(this.value,c)];case 3:e=t.sent(),t.label=4;case 4:return[3,6];case 5:e=this.staticValue,t.label=6;case 6:return k(e,"cannot include with empty filename"),r=c.getRegister("blocks"),i=c.getRegister("blockMode"),c.setRegister("blocks",{}),c.setRegister("blockMode",_t.OUTPUT),this.with?(s=l,o=e,[4,pt(this.with,c)]):[3,8];case 7:s[o]=t.sent(),t.label=8;case 8:return[4,this.liquid.getTemplate(e,c.opts)];case 9:return u=t.sent(),c.push(l),[4,this.liquid.renderer.renderTemplates(u,c)];case 10:return a=t.sent(),c.pop(),c.setRegister("blocks",r),c.setRegister("blockMode",i),[2,a]}})})}},zt={parse:function(t){var e=t.args.match(A);k(e,"illegal identifier "+t.args),this.variable=e[0]},render:function(t){var e=t.environments;return"number"!=typeof e[this.variable]&&(e[this.variable]=0),--e[this.variable]}},Yt=new RegExp("^(?:("+C.source+")\\s*:\\s*)?(.*)$"),$t=new RegExp(C.source,"g"),It={parse:function(t){var e=Yt.exec(t.args);k(e,"illegal tag: "+t.raw),this.group=e[1]||"";var n=e[2];for(this.candidates=[];e=$t.exec(n);)this.candidates.push(e[0]);k(this.candidates.length,"empty candidates: "+t.raw)},render:function(o){return d(this,void 0,void 0,function(){var e,n,r,i,s;return g(this,function(t){switch(t.label){case 0:return[4,pt(this.group,o)];case 1:return e=t.sent(),n="cycle:"+e+":"+this.candidates.join(","),r=o.getRegister("cycle"),void 0===(i=r[n])&&(i=r[n]=0),s=this.candidates[i],i=(i+1)%this.candidates.length,r[n]=i,[2,pt(s,o)]}})})}},Ct={parse:function(t,e){var n,r=this;this.branches=[],this.elseTemplates=[];var i=this.liquid.parser.parseStream(e).on("start",function(){return r.branches.push({cond:t.args,templates:n=[]})}).on("tag:elsif",function(t){r.branches.push({cond:t.args,templates:n=[]})}).on("tag:else",function(){return n=r.elseTemplates}).on("tag:endif",function(){return i.stop()}).on("template",function(t){return n.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")});i.start()},render:function(i){return d(this,void 0,void 0,function(){var e,n,r;return g(this,function(t){switch(t.label){case 0:e=0,n=this.branches,t.label=1;case 1:return e<n.length?[4,ft((r=n[e]).cond,i)]:[3,4];case 2:if(dt(t.sent()))return[2,this.liquid.renderer.renderTemplates(r.templates,i)];t.label=3;case 3:return e++,[3,1];case 4:return[2,this.liquid.renderer.renderTemplates(this.elseTemplates,i)]}})})}},Bt={parse:function(t){var e=t.args.match(A);k(e,"illegal identifier "+t.args),this.variable=e[0]},render:function(t){var e=t.environments;"number"!=typeof e[this.variable]&&(e[this.variable]=0);var n=e[this.variable];return e[this.variable]++,n}},Vt=/\S+/,Gt={parse:function(t,e){var n=Vt.exec(t.args);n&&(this.staticLayout=n[0]),(n=C.exec(t.args))&&(this.layout=n[0]),this.tpls=this.liquid.parser.parse(e)},render:function(u,a){return d(this,void 0,void 0,function(){var e,n,r,i,s,o;return g(this,function(t){switch(t.label){case 0:return u.opts.dynamicPartials?[4,pt(this.layout,u)]:[3,2];case 1:return n=t.sent(),[3,3];case 2:n=this.staticLayout,t.label=3;case 3:return k(e=n,"cannot apply layout with empty filename"),u.setRegister("blockMode",_t.STORE),r=u.getRegister("blocks"),[4,this.liquid.renderer.renderTemplates(this.tpls,u)];case 4:return i=t.sent(),void 0===r[""]&&(r[""]=i),[4,this.liquid.getTemplate(e,u.opts)];case 5:return s=t.sent(),u.push(a),u.setRegister("blockMode",_t.OUTPUT),[4,this.liquid.renderer.renderTemplates(s,u)];case 6:return o=t.sent(),u.pop(),[2,o]}})})}},Wt={parse:function(t,e){var n=this,r=/\w+/.exec(t.args);this.block=r?r[0]:"",this.tpls=[];var i=this.liquid.parser.parseStream(e).on("tag:endblock",function(){return i.stop()}).on("template",function(t){return n.tpls.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")});i.start()},render:function(s){return d(this,void 0,void 0,function(){var e,n,r,i;return g(this,function(t){switch(t.label){case 0:return e=s.getRegister("blocks"),void 0===(n=e[this.block])?[3,1]:(i=n,[3,3]);case 1:return[4,this.liquid.renderer.renderTemplates(this.tpls,s)];case 2:i=t.sent(),t.label=3;case 3:return r=i,s.getRegister("blockMode",_t.OUTPUT)===_t.STORE?(e[this.block]=r,[2,""]):[2,r]}})})}},Jt={parse:function(t,e){var n=this;this.tokens=[];var r=this.liquid.parser.parseStream(e);r.on("token",function(t){"endraw"===t.name?r.stop():n.tokens.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")}),r.start()},render:function(){return this.tokens.map(function(t){return t.raw}).join("")}},Xt=function(r){function t(t,e){var n=r.call(this,t)||this;return n.length=t,n.cols=e,n}return i(t,r),t.prototype.row=function(){return Math.floor(this.i/this.cols)+1},t.prototype.col0=function(){return this.i%this.cols},t.prototype.col=function(){return this.col0()+1},t.prototype.col_first=function(){return 0===this.col0()},t.prototype.col_last=function(){return this.col()===this.cols},t}(Mt),Kt=new RegExp("^("+A.source+")\\s+in\\s+("+C.source+")(?:\\s+"+B.source+")*$"),Qt={assign:Ot,for:Dt,capture:Ft,case:Ut,comment:jt,include:Nt,decrement:zt,increment:Bt,cycle:It,if:Ct,layout:Gt,block:Wt,raw:Jt,tablerow:{parse:function(t,e){var n,r=this,i=Kt.exec(t.args);k(i,"illegal tag: "+t.raw),this.variable=i[1],this.collection=i[2],this.templates=[];var s=this.liquid.parser.parseStream(e).on("start",function(){return n=r.templates}).on("tag:endtablerow",function(){return s.stop()}).on("template",function(t){return n.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")});s.start()},render:function(l,f){return d(this,void 0,void 0,function(){var e,n,r,i,s,o,u,a,c;return g(this,function(t){switch(t.label){case 0:return[4,ft(this.collection,l)];case 1:e=t.sent()||[],n=f.offset||0,r=void 0===f.limit?e.length:f.limit,e=e.slice(n,n+r),i=f.cols||e.length,s=new Xt(e.length,i),o={tablerowloop:s},l.push(o),u="",a=0,t.label=2;case 2:return a<e.length?(o[this.variable]=e[a],0===s.col0()&&(1!==s.row()&&(u+="</tr>"),u+='<tr class="row'+s.row()+'">'),u+='<td class="col'+s.col()+'">',c=u,[4,this.liquid.renderer.renderTemplates(this.templates,l)]):[3,5];case 3:u=c+t.sent(),u+="</td>",t.label=4;case 4:return a++,s.next(),[3,2];case 5:return e.length&&(u+="</tr>"),l.pop(),[2,u]}})})}},unless:{parse:function(t,e){var n,r=this;this.templates=[],this.elseTemplates=[];var i=this.liquid.parser.parseStream(e).on("start",function(){n=r.templates,r.cond=t.args}).on("tag:else",function(){return n=r.elseTemplates}).on("tag:endunless",function(){return i.stop()}).on("template",function(t){return n.push(t)}).on("end",function(){throw new Error("tag "+t.raw+" not closed")});i.start()},render:function(e){return d(this,void 0,void 0,function(){return g(this,function(t){switch(t.label){case 0:return[4,ft(this.cond,e)];case 1:return[2,gt(t.sent())?this.liquid.renderer.renderTemplates(this.templates,e):this.liquid.renderer.renderTemplates(this.elseTemplates,e)]}})})}},break:{render:function(){return d(this,void 0,void 0,function(){return g(this,function(t){throw new x("break")})})}},continue:{render:function(){return d(this,void 0,void 0,function(){return g(this,function(t){throw new x("continue")})})}}},Zt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},te={"&amp;":"&","&lt;":"<","&gt;":">","&#34;":'"',"&#39;":"'"};function ee(t){return String(t).replace(/&|<|>|"|'/g,function(t){return Zt[t]})}var ne={escape:ee,escape_once:function(t){return ee(String(t).replace(/&(amp|lt|gt|#34|#39);/g,function(t){return te[t]}))},newline_to_br:function(t){return t.replace(/\n/g,"<br />")},strip_html:function(t){return t.replace(/<script.*?<\/script>|<!--.*?-->|<style.*?<\/style>|<.*?>/g,"")}},re={append:function(t,e){return t+e},prepend:function(t,e){return e+t},capitalize:function(t){return String(t).charAt(0).toUpperCase()+t.slice(1)},lstrip:function(t){return String(t).replace(/^\s+/,"")},downcase:function(t){return t.toLowerCase()},upcase:function(t){return String(t).toUpperCase()},remove:function(t,e){return t.split(e).join("")},remove_first:function(t,e){return t.replace(e,"")},replace:function(t,e,n){return String(t).split(e).join(n)},replace_first:function(t,e,n){return String(t).replace(e,n)},rstrip:function(t){return String(t).replace(/\s+$/,"")},split:function(t,e){return String(t).split(e)},strip:function(t){return String(t).trim()},strip_newlines:function(t){return String(t).replace(/\n/g,"")},truncate:function(t,e,n){return void 0===e&&(e=50),void 0===n&&(n="..."),(t=String(t)).length<=e?t:t.substr(0,e-n.length)+n},truncatewords:function(t,e,n){void 0===e&&(e=15),void 0===n&&(n="...");var r=t.split(/\s+/),i=r.slice(0,e).join(" ");return r.length>=e&&(i+=n),i}},ie={abs:function(t){return Math.abs(t)},ceil:function(t){return Math.ceil(t)},divided_by:function(t,e){return t/e},floor:function(t){return Math.floor(t)},minus:function(t,e){return t-e},modulo:function(t,e){return t%e},round:function(t,e){void 0===e&&(e=0);var n=Math.pow(10,e);return Math.round(t*n)/n},plus:function(t,e){return Number(t)+Number(e)},times:function(t,e){return t*e}},se={url_decode:function(t){return t.split("+").map(decodeURIComponent).join(" ")},url_encode:function(t){return t.split(" ").map(encodeURIComponent).join("+")}},oe={join:function(t,e){return t.join(void 0===e?" ":e)},last:function(t){return h(t)},first:function(t){return t[0]},map:function(t,e){return t.map(function(t){return t[e]})},reverse:function(t){return t.reverse()},sort:function(t,e){return t.sort(e)},size:function(t){return t.length},concat:function(t,e){return Array.prototype.concat.call(t,e)},slice:function(t,e,n){return void 0===n&&(n=1),e=e<0?t.length+e:e,t.slice(e,e+n)},uniq:function(t){var e={};return(t||[]).filter(function(t){return!e.hasOwnProperty(String(t))&&(e[String(t)]=!0)})},where:function(t,e,n){return t.filter(function(t){return void 0===n?dt(t[e]):t[e]===n})}},ue=["January","February","March","April","May","June","July","August","September","October","November","December"],ae=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ce=ue.map(he),le=ae.map(he),fe={1:"st",2:"nd",3:"rd",default:"th"};function he(t){return t.slice(0,3)}var pe={daysInMonth:function(t){return[31,pe.isLeapYear(t)?29:28,31,30,31,30,31,31,30,31,30,31]},getDayOfYear:function(t){for(var e=0,n=0;n<t.getMonth();++n)e+=pe.daysInMonth(t)[n];return e+t.getDate()},getWeekOfYear:function(t,e){var n=this.getDayOfYear(t)+(e-t.getDay()),r=7-new Date(t.getFullYear(),0,1).getDay()+e;return l(String(Math.floor((n-r)/7)+1),2,"0")},isLeapYear:function(t){var e=t.getFullYear();return!(0!=(3&e)||!(e%100||e%400==0&&e))},getSuffix:function(t){var e=t.getDate().toString(),n=parseInt(e.slice(-1));return fe[n]||fe.default},century:function(t){return parseInt(t.getFullYear().toString().substring(0,2),10)}},de={a:function(t){return le[t.getDay()]},A:function(t){return ae[t.getDay()]},b:function(t){return ce[t.getMonth()]},B:function(t){return ue[t.getMonth()]},c:function(t){return t.toLocaleString()},C:function(t){return pe.century(t)},d:function(t){return l(t.getDate(),2,"0")},e:function(t){return l(t.getDate(),2)},H:function(t){return l(t.getHours(),2,"0")},I:function(t){return l(String(t.getHours()%12||12),2,"0")},j:function(t){return l(pe.getDayOfYear(t),3,"0")},k:function(t){return l(t.getHours(),2)},l:function(t){return l(String(t.getHours()%12||12),2)},L:function(t){return l(t.getMilliseconds(),3,"0")},m:function(t){return l(t.getMonth()+1,2,"0")},M:function(t){return l(t.getMinutes(),2,"0")},p:function(t){return t.getHours()<12?"AM":"PM"},P:function(t){return t.getHours()<12?"am":"pm"},q:function(t){return pe.getSuffix(t)},s:function(t){return Math.round(t.valueOf()/1e3)},S:function(t){return l(t.getSeconds(),2,"0")},u:function(t){return t.getDay()||7},U:function(t){return pe.getWeekOfYear(t,0)},w:function(t){return t.getDay()},W:function(t){return pe.getWeekOfYear(t,1)},x:function(t){return t.toLocaleDateString()},X:function(t){return t.toLocaleTimeString()},y:function(t){return t.getFullYear().toString().substring(2,4)},Y:function(t){return t.getFullYear()},z:function(t){var e=t.getTimezoneOffset()/60*100;return(0<e?"-":"+")+l(String(Math.abs(e)),4,"0")},"%":function(){return"%"}};de.h=de.b,de.N=de.L;var ge=m({},ne,re,ie,se,{date:function(t,e){var n,r=t;return"now"===t?r=new Date:p(t)&&(r=new Date(t)),(n=r)instanceof Date&&!isNaN(n.getTime())?function(t,e){for(var n="",r=e;;){var i=/%./g,s=i.exec(r);if(!s)return n+r;n+=r.slice(0,i.lastIndex-2),r=r.slice(i.lastIndex);var o=s[0].charAt(1),u=de[o];n+=u?u(t):"%"+o}}(r,e):t}},{default:function(t,e){return dt(t)?t:e}},oe);return function(){function e(t){void 0===t&&(t={});var n=this;this.cache={},this.options=S(q(t)),this.parser=new qt(this),this.renderer=new st,this.tokenizer=new it(this.options),o(Qt,function(t,e){return n.registerTag(e,t)}),o(ge,function(t,e){return n.registerFilter(e,t)})}return e.prototype.parse=function(t,e){var n=this.tokenizer.tokenize(t,e);return this.parser.parse(n)},e.prototype.render=function(t,e,n){var r=m({},this.options,q(n)),i=new O(e,r);return this.renderer.renderTemplates(t,i)},e.prototype.parseAndRender=function(n,r,i){return d(this,void 0,void 0,function(){var e;return g(this,function(t){switch(t.label){case 0:return[4,this.parse(n)];case 1:return e=t.sent(),[2,this.render(e,r,i)]}})})},e.prototype.getTemplate=function(f,h){return d(this,void 0,void 0,function(){var e,n,r,i,s,o,u,a,c,l=this;return g(this,function(t){switch(t.label){case 0:e=q(h),n=e.root?e.root.concat(this.options.root):this.options.root,r=n.map(function(t){return D.resolve(t,f,l.options.extname)}),i=0,s=r,t.label=1;case 1:return i<s.length?(o=s[i],[4,D.exists(o)]):[3,5];case 2:return t.sent()?this.options.cache&&this.cache[o]?[2,this.cache[o]]:(a=this.parse,[4,D.readFile(o)]):[3,4];case 3:return u=a.apply(this,[t.sent(),o]),this.options.cache&&(this.cache[o]=u),[2,u];case 4:return i++,[3,1];case 5:throw(c=new Error("ENOENT")).message='ENOENT: Failed to lookup "'+f+'" in "'+n+'"',c.code="ENOENT",c}})})},e.prototype.renderFile=function(r,i,s){return d(this,void 0,void 0,function(){var e,n;return g(this,function(t){switch(t.label){case 0:return e=q(s),[4,this.getTemplate(r,e)];case 1:return n=t.sent(),[2,this.render(n,i,s)]}})})},e.prototype.evalValue=function(t,e){return new Et(t,this.options.strictFilters).value(e)},e.prototype.registerFilter=function(t,e){return Tt.register(t,e)},e.prototype.registerTag=function(t,e){return bt.register(t,e)},e.prototype.plugin=function(t){return t.call(this,e)},e.prototype.express=function(){var i=this;return function(t,e,n){var r={root:this.root};i.renderFile(t,e,r).then(function(t){return n(null,t)},n)}},(e.default=e).isTruthy=dt,e.isFalsy=gt,e.evalExp=ft,e.evalValue=pt,e.Types=L,e}()});
//# sourceMappingURL=liquid.min.js.map





// Cookie
function TPAsetCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function TPAgetCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function TPAeraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
}
