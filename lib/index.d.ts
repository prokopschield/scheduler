export declare class Scheduler<T = string> {
	owners: OwnerMap<T>;
	getOwner(owner: string): Owner<T>;
	/**
	 * Add items to an owner's queue.
	 * @param owner e.g. a user id
	 * @param items this will be returned by next()
	 */
	add(owner: string, ...items: T[]): void;
	timeUsage: NumberMap<T>;
	lastUsage: NumberMap<T>;
	private _current;
	/**
	 * Fairly decide what should go next.
	 * @param destroy Remove item from queue?
	 * @returns the next item, or undefined.
	 */
	next(destroy: boolean): T | undefined;
	/** Stop counting time. */
	stop(): void;
}
export declare class Owner<T> {
	private _map;
	private _name;
	get name(): string;
	set name(name: string);
	constructor(name: string, map: OwnerMap<T>);
	queue: T[];
	add(...items: T[]): void;
	next(destroy: boolean): T | undefined;
}
export declare class OwnerMap<T> extends Map<string, Owner<T>> {
	get(name: string): Owner<T>;
}
export declare class NumberMap<T> extends WeakMap<Owner<T>, number> {
	get(owner: Owner<T>): any;
	add(owner: Owner<T>, inc: number): void;
}
