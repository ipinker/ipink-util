import { Num } from "./types/Common";

type ComparatorKeys = '<' | '<=' | '>' | ">=";

const comparator = {
    '<': (a: Num, b: Num): boolean => a < b,
    '<=': (a: Num, b: Num): boolean => a <= b,
    '>': (a: Num, b: Num): boolean => a > b,
    '>=': (a: Num, b: Num): boolean => a >= b
};
// 对比版本号是否一致
export const compareVersion = (version: Num, range: Num): boolean => {
	const string = range + '';
	const n: number = +(string.match(/\d+/) || NaN);
    const matchStr: Array<string> = string.match(/^[<>]=?|/) || [];
	const op : ComparatorKeys = matchStr[0] as ComparatorKeys;
	return comparator[op] ? comparator[op](version, n) : (version == n || n !== n);
}