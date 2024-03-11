
/**
 * @description 返回上一级
 * @param delta { number } 返回的层级数量
 */
export function navigateBack(delta?: number) {
    delta = delta || 1;
    //#ifdef H5
	window?.history && window.history.go(Number('-' + delta));
	//#endif
	//#ifndef H5
	uni?.navigateBack && uni.navigateBack({ delta: delta });
	//#endif
}

/**
 * @description 对比版本
 * @param v1 { string } 新版本
 * @param v2 { string } 旧版本
 * @return 0：版本一致，1: 版本过旧，-1：版本过新
 */
export const compareVersion = (v1: string, v2: string): -1 | 0 | 1 => {
    const v1s: string[] = v1.split('.');
    const v2s: string[] = v2.split('.');
	const len = Math.max(v1s.length, v2s.length)

	while (v1s.length < len) {
		v1s.push('0')
	}

	while (v2s.length < len) {
		v2s.push('0')
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1s[i])
		const num2 = parseInt(v2s[i])

		if (num1 > num2) {
			return 1
		} else if (num1 < num2) {
			return -1
		}
	}

	return 0
}


/**
 * @desc 设置页面标题
 * @param title { string }
 * @return: 
 */
export const setTitle = (title: string): void => {
	// H5平台
	//#ifdef  H5
    // @ts-ignore
	if (window?.AlipayJSBridge) AlipayJSBridge.call("setTitle", { title: title });
    else {
		document.title = title;
	}
    return;
	//#endif 
	// 除了 H5 平台，其它平台均存在的代码
	// #ifndef H5
	uni?.setNavigationBarTitle && uni.setNavigationBarTitle({ title: title })
	// #endif
}

/**
 * @desc 获取页面的url
 * @return: { currentPageLong: string, currentPage: string }
 */
export const getPageUrl = (): { currentPageLong?: string, currentPage?: string } => {
	// 仅出现在 H5 平台下的代码
	// #ifdef H5
	return {
		currentPageLong: window.location.href,
		currentPage: window.location.href
	};
	// #endif

	// 除了 H5 平台，其它平台均存在的代码
	// #ifndef H5
    if(!getCurrentPages) return {};
	// 除了 H5 平台，其它平台均存在的代码
	var pages = getCurrentPages(); //获取加载的页面
	var currentPage: any = pages[pages.length - 1]; //获取当前页面的对象
	var url: string = currentPage.route as unknown as string; //当前页面url
	var options = currentPage?.options; //获取url中所带的参数
	//拼接url的参数
	currentPage = (url + '?');
	for (var key in options) {
		var value = options[key]
		currentPage += key + '=' + value + '&';
	}
	currentPage = currentPage.substring(0, currentPage.length -
		1
	);
	//得到的值为当前页面及页面地址链接的参数 示例：  outpatientService/yuyue/index?outPatientNumber=111
	let _currentPage = '/' + currentPage
	let currentPageLong = '/' + currentPage; //当前页面的全链接
	return {
		currentPageLong,
		currentPage: _currentPage
	};
	// #endif
}

export type FormatTArray<T> = T & { children: T[] }
/**
 * @desc 格式化二级数据 【1，2】 =》 【【】】
 * @param param { type }
 * @return: 
 */
 export function formatTree <T>(nodeList: T[], childKey: string, parentKey: string):  FormatTArray<T>[] {
    childKey = childKey || "id";
    parentKey = parentKey || "pid";
	const map: { [propName : string] : { [propName : string] : any[] } } = {};
	for (var i = 0; i < nodeList.length; i++) {
		if (!nodeList[i][parentKey]) map[nodeList[i][childKey]] = {
			... (nodeList[i] as { [propName : string]: any }),
			children: []
		};
	}
	for (var i = 0; i < nodeList.length; i++) {
		if (nodeList[i][parentKey] && map[nodeList[i][parentKey]]?.children) {
			map[nodeList[i][parentKey]].children.push(nodeList[i]);
		};
	}
	return Object.values(map);
}