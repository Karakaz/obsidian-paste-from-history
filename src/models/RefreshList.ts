export class RefreshList<T> {
	private limit: number;
	private elements: T[] = [];
	private equalityCheck: (e1: T, e2: T) => boolean;

	constructor(limit: number, equalityCheck: (e1: T, e2: T) => boolean) {
		this.limit = limit;
		this.equalityCheck = equalityCheck;
	}

	updateLimit(limit: number) {
		if (limit !== this.limit) {
			if (limit < this.elements.length) {
				this.elements = this.elements.slice(0, limit);
			}
			this.limit = limit;
		}
	}

	getElements(): T[] {
		return [...this.elements];
	}

    /**
     * Moves existing element to start of the list
     * @returns `true` if element exists in the list, `false` otherwise
     */
	refresh(element: T): boolean {
		const index = this.elements.findIndex((e) => this.equalityCheck(e, element));
		if (index > 0) {
			this.elements.splice(index, 1);
			this.elements.unshift(element);
			return true;
		} else if (index === 0) {
			return true;
		}
		return false;
	}

	add(element: T) {
		const length = this.elements.unshift(element);
		if (length > this.limit) {
			this.elements.pop();
		}
	}

    clear() {
        this.elements = [];
    }
}
