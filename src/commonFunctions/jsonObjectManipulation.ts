export function deepEqual<T>(object1: T, object2: T): boolean {

	if (!object1 || !object2) {
		return !object1 && !object2;
	}

	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		const val1 = object1[key];
		const val2 = object2[key];
		const areObjects = isObject(val1) && isObject(val2);
		if (
			(areObjects && !deepEqual(val1, val2)) ||
			(!areObjects && val1 !== val2)
		) {
			return false;
		}
	}

	return true;
}

export function deepCopy<T>(obj: T): T {
	const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; //> may need Z on end
	//parse dates if json to js obj from string 
	const reviver = (key: string, value: unknown): string | Date | unknown => {
		if (typeof value === "string" && dateFormat.test(value)) {
			//console.log(value, " - > ", new Date(value), " UTC STRING = ", new Date(value).toUTCString() ) //> keep for debugging out of BST (remove after 30th oct 22)
			return new Date(value);
		}

		return value;
	}

	return JSON.parse(JSON.stringify(obj), reviver);
}

function isObject(object): boolean {
	return object != null && typeof object === 'object';
}



// attach the .equals method to Array's prototype to call it on any array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arrEquals(a: any[], b: any[]): boolean {
	if (!a && !b) return true;

	// if the other array is a falsy value, return
	if (!a || !b) return false;

	// compare lengths - can save a lot of time 
	if (a.length != b.length)
		return false;

	for (let i = 0, l = a.length; i < l; i++) {
		// Check if we have nested arrays
		if (a[i] instanceof Array && b[i] instanceof Array) {
			// recurse into the nested arrays
			if (!a[i].equals(b[i]))
				return false;
		}
		else if (a[i] != b[i]) {
			// Warning - two different object instances will never be equal: {x:20} != {x:20}
			return false;
		}
	}
	return true;
}

//required for true check, 0 is seen as valid
//!!(0) returns false
export function isTrue(variable: unknown): boolean{
	return  typeof variable !== 'undefined' && variable !== null
}

//allows for prop retrieval via string path
//e.g ["items", "0", "photos"]   - would retrieve a photo array from rma object return item. 
// eslint-disable-next-line @typescript-eslint/ban-types
const traverseObjectByPath = (o: Object, path: string[]):unknown => {
	if(Array.isArray(o[path[0]])){
		if(!isNaN(Number(path[1]))){
			throw "Invalid test prop path passed to validate! Path item following an array should be an index"
		}
		return traverseObjectByPath(o[path[0]][Number(path[1])], path.slice(2));
	}
	if(path.length > 1) return traverseObjectByPath(o[path[0]], path?.slice(1)); // eslint-disable-line @typescript-eslint/no-unused-vars
	else return o[path[0]];
}