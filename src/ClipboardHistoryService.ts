import { ClipboardRecord } from "./models/ClipboardRecord";
import { RefreshList } from "./utils/RefreshList";

export class ClipboardHistoryService {
	private records: RefreshList<ClipboardRecord>;

	constructor(recordLimit: number) {
		this.records = new RefreshList(recordLimit, (r1, r2) => r1.text === r2.text);
	}

	updateRecordLimit(recordLimit: number) {
		this.records.updateLimit(recordLimit);
	}

	getRecords(): ClipboardRecord[] {
		return this.records.getElements();
	}

	getRecord(index: number): ClipboardRecord {
		return this.records.getElement(index);
	}

	putRecord(record: ClipboardRecord) {
		const refreshed = this.records.refresh(record);
		if (!refreshed) {
			this.records.add(record);
		}
	}

	refreshRecord(record: ClipboardRecord) {
		this.records.refresh(record);
	}

	clearRecords() {
		this.records.clear();
	}
}
