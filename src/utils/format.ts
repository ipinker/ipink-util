
export type FormatTArray<T> = T & { children: T[] }
/**
 * @desc 格式化二级数据 【1，2】 =》 【【】】
 * @param param { type }
 * @return: 
 */
 export function formatTree <T>(nodeList: T[], childKey: string, parentKey: string):  FormatTArray<T>[] {
    childKey = childKey || "id";
    parentKey = parentKey || "pid";
	const map: { [propName : string] : FormatTArray<T> } = {};
	for (var i = 0; i < nodeList.length; i++) {
        const item: any = nodeList[i] as T as any;
        const parentId: string = item[parentKey];
        const childId: string = item[childKey];
		if (!parentId) map[childId] = { ... item, children: [] }
	}
	for (var i = 0; i < nodeList.length; i++) {
        const item: any = nodeList[i] as T as any;
        const parentId: string = item[parentKey];
		if (item[parentId] && map[parentId] && map[parentId].children) {
			map[parentId].children.push(nodeList[i]);
		};
	}
	return Object.values(map);
}
