export const keyOfEnum = <V, T extends { [name: string]: V }>(enumDef: T, value: V): string =>
	Object.keys(enumDef)[Object.values(enumDef).indexOf(value)];
