import { performance } from 'perf_hooks';

export class Scheduler<T = string> {
	owners = new OwnerMap<T>();
	getOwner(owner: string) {
		return this.owners.get(owner);
	}

	/**
	 * Add items to an owner's queue.
	 * @param owner e.g. a user id
	 * @param items this will be returned by next()
	 */
	add(owner: string, ...items: T[]) {
		this.getOwner(owner).add(...items);
	}

	timeUsage = new NumberMap<T>();
	lastUsage = new NumberMap<T>();

	private _current: Owner<T> | undefined;

	/**
	 * Fairly decide what should go next.
	 * @param destroy Remove item from queue?
	 * @returns the next item, or undefined.
	 */
	next(destroy: boolean) {
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

		this.lastUsage.set((this._current = pref), performance.now());

		return pref.next(destroy);
	}

	/** Stop counting time. */
	stop() {
		if (this._current) {
			const startTime = this.lastUsage.get(this._current);
			this.timeUsage.add(this._current, performance.now() - startTime);
			this._current = undefined;
		}
	}
}

export class Owner<T> {
	private _map: OwnerMap<T>;
	private _name: string;

	get name() {
		return this._name;
	}

	set name(name: string) {
		this._map.delete(this._name);
		this._map.set((this._name = String(name)), this);
	}

	constructor(name: string, map: OwnerMap<T>) {
		this._map = map;
		this._name = name;
		this.name = name;
	}

	public queue = Array<T>();

	add(...items: T[]) {
		for (const item of items) {
			if (!this.queue.includes(item)) {
				this.queue.push(item);
			}
		}
	}

	next(destroy: boolean) {
		if (destroy) {
			return this.queue.shift();
		} else {
			return this.queue.slice(0, 1).pop();
		}
	}
}

export class OwnerMap<T> extends Map<string, Owner<T>> {
	get(name: string): Owner<T> {
		name = String(name);
		const v = Map.prototype.get.call(this, name);
		if (v) {
			return v;
		} else {
			return new Owner<T>(name, this);
		}
	}
}

export class NumberMap<T> extends WeakMap<Owner<T>, number> {
	get(owner: Owner<T>) {
		const v = WeakMap.prototype.get.call(this, owner);
		if (v) {
			return v;
		} else {
			return 0;
		}
	}
	add(owner: Owner<T>, inc: number) {
		this.set(owner, this.get(owner) + inc);
	}
}
