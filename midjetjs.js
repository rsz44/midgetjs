/* MIT https://github.com/rsz44/midjetjs */

class ReactiveVar {
	constructor(state_instance, value) {
		this.__state_instance = state_instance;
		this.__value = value;
		this.__callbacks = [];
		this.__next_value = null;
		this.hasChange = false;
		this.index = null;
	}

	get value() {
		return (this.hasChange) ? this.__next_value : this.__value;
	}

	set value(value) {
		this.__state_instance._register_change(this);
		this.__next_value = value;
		this.hasChange = true;
	}

	update() {
		if (this.hasChange) {
			let old_value = this.__value;
			this.__value = this.__next_value;
			this.hasChange = false;
			for (var i = this.__callbacks.length - 1; i >= 0; i--) {
				this.index = i;
				this.__callbacks[i](this.__state_instance, this.__value, old_value);
			}
		}
		this.index = null;
	}

	watch(callback) {
		this.__callbacks.push(callback);
	}

	unwatch(callback) {
		var self = this;
		this.__callbacks = this.__callbacks.filter(function(cb) {
			return cb != callback;
		});
	}
}

class Subscription {


	constructor(e) {
		this.event = null;
		this.active = true;
		this.events = [];
		this.callbacks = [];
		this.unregister_next_id = [];
		this.unregister_next = [];
		this.preventNext = false;
		this.index = null;
		this.current_callback_id = null;
		this.event = e;
	}

	unregister_callback(callback) {
		this.unregister_next.push(callback);
	}

	unregister_callback_id(callback_id) {
		this.unregister_next_id.push(callback_id);
	}

	register_callback(callback) {
		var cid = Math.floor(Math.random() * 100)+'-'+Date.now();

		this.callbacks.push([cid, callback]);
		return cid;
	}

	notify(e, payload) {
		this.events.push(payload);
	}

	clean() {
		this.events = [];
		this.index = null;
		var self = this;
		this.callbacks = this.callbacks.filter(function(cb) {
			return !self.unregister_next_id.includes(cb[0]);
		});
		this.callbacks = this.callbacks.filter(function(cb) {
			return !self.unregister_next.includes(cb[1]);
		});
		this.unregister_next_id = [];
		this.unregister_next = [];
	}

	update(state) {
		for (var i = this.events.length - 1; i >= 0; i--) {
			this.index = i;
			if (this.call(state, this.events[i])) {
				this.clean();
				return true;
			}
		}
		this.clean();
	}

	call(state, payload) {
		if (this.active) {
			for (var i = this.callbacks.length - 1; i >= 0; i--) {
				this.current_callback_id = this.callbacks[i][0];
				this.callbacks[i][1](state, this, payload);
				if (this.preventNext) {
					this.preventNext = false;
					return true;
				}
			}
			return false;
		}
		return false;
	}
}

class State {
	constructor() {
		this.__events = [];
		this.subs = {};
		this.__vars = {};

		// update events
		this.__changes = [];
	}

	_register_change(rvar) {
		this.__changes.push(rvar);
	}

	unsubscribe(e, callback) {
		if (!this.__events.includes(e)) {
			this.__events.push(e);
		}
		if (!this.subs.hasOwnProperty(e)) {
			this.subs[e] = new Subscription(e);
		}
		return this.subs[e].unregister_callback(callback);
	}

	subscribe(e, callback) {
		if (!this.__events.includes(e)) {
			this.__events.push(e);
		}
		if (!this.subs.hasOwnProperty(e)) {
			this.subs[e] = new Subscription(e);
		}

		return this.subs[e].register_callback(callback);
	}

	emit(e, payload) {
		if (!this.__events.includes(e)) {
			this.__events.push(e);
		}
		if (this.subs.hasOwnProperty(e)) {
			this.subs[e].notify(this, payload);
		}
	}

	$delete(key) {
		if (this.__vars.hasOwnProperty(key)) {
			delete this.__vars[key];
		}
	}

	$(key, default_value=null) {
		if (!this.__vars.hasOwnProperty(key)) {
			this.__vars[key] = new ReactiveVar(this, default_value);
		}

		return this.__vars[key];
	}

	update() {
		for (var i = this.__events.length - 1; i >= 0; i--) {
			if (this.subs.hasOwnProperty(this.__events[i])) {
				this.subs[this.__events[i]].update(this);
			}
		}

		var to_update = this.__changes;
		this.__changes = [];

		while (to_update.length) {
			var rvar = to_update.shift()

			rvar.update();
		}
	}
}

class ReactiveProperties extends State {
	constructor(properties) {
		super();
		for (const item of Object.entries(properties)) {
			this.$(item[0], item[1]);
		}
		
	}
}



