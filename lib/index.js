'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.NumberMap =
	exports.OwnerMap =
	exports.Owner =
	exports.Scheduler =
		void 0;
const perf_hooks_1 = require('perf_hooks');
class Scheduler {
	constructor() {
		this.owners = new OwnerMap();
		this.timeUsage = new NumberMap();
		this.lastUsage = new NumberMap();
	}
	getOwner(owner) {
		return this.owners.get(owner);
	}
	/**
	 * Add items to an owner's queue.
	 * @param owner e.g. a user id
	 * @param items this will be returned by next()
	 */
	add(owner, ...items) {
		this.getOwner(owner).add(...items);
	}
	/**
	 * Fairly decide what should go next.
	 * @param destroy Remove item from queue?
	 * @returns the next item, or undefined.
	 */
	next(destroy) {
		this.stop();
		const owners = [...this.owners.values()].filter(
			(owner) => owner.queue.length
		);
		const firstOwner = owners.pop(); // order is irrelevant
		if (!firstOwner) {
			return undefined; // no entries queued
		}
		let pref = firstOwner;
		let pref_time = this.timeUsage.get(pref) * this.lastUsage.get(pref);
		for (const cur of owners) {
			const cur_time = this.timeUsage.get(cur) * this.lastUsage.get(cur);
			if (cur_time < pref_time) {
				pref = cur;
				pref_time = cur_time;
			}
		}
		this.lastUsage.set((this._current = pref), perf_hooks_1.performance.now());
		return pref.next(destroy);
	}
	/** Stop counting time. */
	stop() {
		if (this._current) {
			const startTime = this.lastUsage.get(this._current);
			this.timeUsage.add(
				this._current,
				perf_hooks_1.performance.now() - startTime
			);
			this._current = undefined;
		}
	}
}
exports.Scheduler = Scheduler;
class Owner {
	constructor(name, map) {
		this.queue = Array();
		this._map = map;
		this._name = name;
		this.name = name;
	}
	get name() {
		return this._name;
	}
	set name(name) {
		this._map.delete(this._name);
		this._map.set((this._name = String(name)), this);
	}
	add(...items) {
		for (const item of items) {
			if (!this.queue.includes(item)) {
				this.queue.push(item);
			}
		}
	}
	next(destroy) {
		if (destroy) {
			return this.queue.shift();
		} else {
			return this.queue.slice(0, 1).pop();
		}
	}
}
exports.Owner = Owner;
class OwnerMap extends Map {
	get(name) {
		name = String(name);
		const v = Map.prototype.get.call(this, name);
		if (v) {
			return v;
		} else {
			return new Owner(name, this);
		}
	}
}
exports.OwnerMap = OwnerMap;
class NumberMap extends WeakMap {
	get(owner) {
		const v = WeakMap.prototype.get.call(this, owner);
		if (v) {
			return v;
		} else {
			return 0;
		}
	}
	add(owner, inc) {
		this.set(owner, this.get(owner) + inc);
	}
}
exports.NumberMap = NumberMap;
