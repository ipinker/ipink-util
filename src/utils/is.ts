/**
 * Is 判断， 本文件所有成员方法只能返回 boolean 【 true，false 】， 且方法都已 「is」开头
 * @Author: Gavin New
 * @Create: 24/01/24 16:47:07
 */

import { TinyColor } from "@ctrl/tinycolor";
import {parseDate} from "./date";
import {sdk} from "./config";

/**** 数据类型判断 ****/
// 是否为字符串
export const isString = (str: any): boolean => Object.prototype.toString.call(str) === "[object String]";
// 是否为数组
export const isArray = (arr: any): boolean => Object.prototype.toString.call(arr) === "[object Array]";
// 是否是一个普通对象
export const isObject = (obj: any): boolean => Object.prototype.toString.call(obj) === "[object Object]";
// 是否为 JSON 对象
export const isJson = (obj: any): boolean => isArray(obj) || isObject(obj);
// 是否为函数
export const isFunc = (func: any): boolean => Object.prototype.toString.call(func) === "[object Function]" || typeof func === 'function';
// 是否为布尔值
export const isBoo = (boo: any): boolean => Object.prototype.toString.call(boo) === "[object Boolean]";
// 是否为 Char 类型
export const isChar = (char: any): boolean => isString(char) && char.length === 1;
// 是否为  Dom 对象
export const isDom = (dom: any): boolean => isObject(dom) && dom.nodeType > 0;
// 是否为 错误异常 对象
export const isError = (error: any): boolean => Object.prototype.toString.call(error) === "[object Error]";
// 是否为 NaN
export const isNaN = (value: any): boolean =>  Number.isNaN(value);
// 是否为 null
export const isNull = (value: any, checkString: boolean = false): boolean => (checkString ? value === "null" : false) || (value === null);
// 是都为 数字
export const isNumber = (num: any): boolean => Number.isFinite(num);
// 是否为 undefined
export const isUndefined = (value: any, checkString: boolean = false): boolean => (checkString ? value === "undefined" : false) || (value === void 0);
// 是否为偶数
export const isOdd = (num: any): boolean => isNumber(num) && (num % 2 === 1 || num % 2 === -1);
// 是否为正则对象
export const isRegexp = (error: any): boolean => Object.prototype.toString.call(error) === "[object RegExp]";
export const isRegexpStr = (str: string): boolean => eval(str) instanceof RegExp;
/* 对象判断 */
// 数组是否包含
export const isInArray = (value: any, array: any[] = []): boolean => {
	if (!isArray(array)) return false;
	let has: boolean = false;
	for (let i: number = 0; i < array.length; i++) {
		if (array[i] === value) {
			has = true;
			break;
		}
	}
	return has;
};
// 对象是否包含 key
export const isInObject = (key: string, object: Object): boolean => isObject(object) && Object.prototype.hasOwnProperty.call(object, key);
/* --------------------------------end------------------------------------------ */


/* ------------------------------日期处理---------------------------------------- */
// 是否为 日期对象
export const isDate = (date: any): boolean => Object.prototype.toString.call(date) === "[object Date]";
// 是否未来
export const isFuture = (date: any): boolean => {
	if(!isDate(date)) date = parseDate(date);
	if(isDate(date)) return date.getTime() > new Date().getTime();
	return false;
};
// 是否今年
export const isYear = (date: any, year: number): boolean => {
	if(!isDate(date)) date = parseDate(date);
	if(isDate(date)) return +year === date.getFullYear();
	return false;
}
// 是否今月
export const isMonth = (date: any,  month: number): boolean => {
	if(!isDate(date)) date = parseDate(date);
	if(isDate(date)) return +month === date.getMonth() + 1;
	return false;
}
// 是否周末
// 6: Saturday, 0: Sunday
export const isWeekend = (date: any): boolean => {
	if(!isDate(date)) date = parseDate(date);
	if(isDate(date)) return date.getDay() === 6 || date.getDay() === 0;
	return false;

}
// 是否明天
export const isTomorrow = (date: any): boolean => {
	if(!isDate(date)) date = parseDate(date);
	const now: Date = new Date();
	const tomorrow: Date = new Date(now.setDate(now.getDate() + 1));
	return isDate(date) && date.toDateString() === tomorrow.toDateString();
};
// 是否今天
export const isToday = (date: any): boolean => {
	if(!isDate(date)) date = parseDate(date);
	const today: Date = new Date();
	return isDate(date) && date.toDateString() === today.toDateString();
};
// 是否昨天
export const isYesterday = (date: any): boolean => {
	if(!isDate(date)) date = parseDate(date);
	const now: Date = new Date();
	const yesterday: Date = new Date(now.setDate(now.getDate() - 1));
	return isDate(date) && date.toDateString() === yesterday.toDateString();
};
/** 判断是否为外链 */
export const isExternal = (path: string) => {
    const reg = /^(http?:|https?:|mailto:|tel:)/
    return reg.test(path)
}

/* --------------------------------end------------------------------------------ */


/* --------------------------------空值处理------------------------------------------ */

/**
 * 判断「对象」是否为空值， 该方法只会浅分析，
 * 	例： {} => true, [] => true, “null” | null => true, "undefined" | undefined => true
 * @param: obj { any } 任意值
 * @param: trim { any } 字符串是否先取出首尾空格在进行空判断了； “” => true, "   " => true
 * @return: { boolean }
 */
export const isEmpty = (obj: any, trim = false): boolean => {
	let empty = false;
	if(
		obj === null || obj === "null" ||
		obj === void 0 || obj === "undefined" ||
		(typeof obj === "string" && obj === "") ||
		(typeof obj === "string" && (trim && obj.trim() === ""))
	) empty = true;
	else empty = false;
	return empty;
}

/**
 * 判断「对象」是否为空值，isEmpty的加强版 该方法会对「对象的第一层对象成员」进行分析，[{}] => true, {a: ""} => true;
 * @param: obj { any } 任意值
 * @param: trim { any } 字符串是否先取出首尾空格在进行空判断了； “” => true, "   " => true
 * @return:  {}
 */
export const isEmptyObject = (obj: any, trim: boolean = false): boolean => {
	let empty: boolean = false;
	// 假值
	if (isEmpty(obj, trim)) empty = true;
	// 数组且没长度
	else if (Array.isArray(obj) && !obj.length) empty = true;
	// 数组长度不为 0, 但内容全是假值
	else if (Array.isArray(obj) && obj.length && !(obj.filter(item => !isEmpty(item, trim)).length)) empty = true;
	// 对象且, 属性全部假值
	else if (
		!Array.isArray(obj) &&
		typeof obj === "object" &&
		!(Object.values(obj).filter(item => !isEmpty(item, trim)).length)
	) empty = true;
	else empty = false;
	return empty;
};
/* --------------------------------end------------------------------------------ */


/* --------------------------------字符串处理------------------------------------------ */
// 是否为「JSON序列化」的字符串
export const isJsonString = (string: string): boolean => {
    if (!string) return false;
	if (typeof string != 'string') return false;
	try {
		return typeof JSON.parse(string) == 'object';
	} catch (e) {
		return false;
	}
};
// 是否小写字符串
export const isLowerCase = (string: string): boolean => isString(string) && string === string.toLowerCase();
// 是否大写
export const isUpperCase = (string: string): boolean => isString(string) && string === string.toUpperCase();
// 首字母是否大写
export const isFistCharUpperCase = (string: string): boolean => {
	if(!isString(string)) return false;
	const firstChar: string = string[0];
	return firstChar === firstChar.toUpperCase();
}
// 是否为日期字符串
export const isDateString = (dateString: string): boolean => !isNaN(Date.parse(dateString));
// 是否为时间字符串
export const isTimeString = (timeString: string): boolean => /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/.test(timeString);
/* --------------------------------end------------------------------------------ */


/* --------------------------------业务处理--------------------------------------- */
/**
 * 是否为 电话号码
 * @param: tel { string } 手机号码
 * @param: telType { number } 验证类型 ； 1 不含分机， 2 包含分机， 3 包含【1，2】， 4 包含【1，2，3， 手机号码】
 * @return:  { boolean }
 */
export const isTel = (tel: string, telType: number = 3): boolean => {
	telType = (telType == 1 || telType == 2 || telType == 3 || telType == 4 || false) ? telType : 3;
	let T: RegExp = telType == 1 ? /^\d{7,8}$/ :
		telType == 2 ? /^\d{7,8}-\d{1,6}$/ :
		/^\d{7,8}(-\d{1,6})?$/;
	let T2:RegExp = telType == 1 ? /^0\d{2,3}(-)?\d{7,8}$/ :
		telType == 2 ? /^0\d{2,3}(-)?\d{7,8}-\d{1,6}$/ :
		/^0\d{2,3}(-)?\d{7,8}(-\d{1,6})?$/;
	let P:RegExp = /^1[3,4,5,6,7,8,9]\d{9}$/;

	return telType == 4 ? (T.test(tel) || T2.test(tel) || P.test(tel)) : (T2.test(tel) || T.test(tel));
};
export const isZipCode = (code: string) => /^[0-9]\d{5}$/.test(code);

// 是否为手机号
export const isPhoneNumber = (phone: string): boolean => /^1[3,4,5,6,7,8,9]\d{9}$/.test(phone);
// 是否为邮箱
export const isEmail = (email: string): boolean =>
	/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email);
// 是否是身份证
export const isIdCard = (code: string): boolean => {
	code = code.toString();
	const city = {
		"11": "北京", "12": "天津", "13": "河北", "14": "山西", "15": "内蒙古",
		"21": "辽宁", "22": "吉林", "23": "黑龙江 ",
		"31": "上海", "32": "江苏", "33": "浙江", "34": "安徽", "35": "福建", "36": "江西", "37": "山东",
		"41": "河南", "42": "湖北 ", "43": "湖南", "44": "广东", "45": "广西", "46": "海南",
		"50": "重庆", "51": "四川", "52": "贵州", "53": "云南", "54": "西藏 ",
		"61": "陕西", "62": "甘肃", "63": "青海", "64": "宁夏", "65": "新疆",
		"71": "台湾",
		"81": "香港", "82": "澳门",
		"91": "国外"
	} as const;
	type CityKey = keyof (typeof city);

	// 身份证号格式错误
	if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) return false;
	// 地址编码错误
	const addressCode: CityKey = code.substr(0, 2) as CityKey;
	if (!city[addressCode]) return false;
	if (code.length == 18) {
		let sBirthday: string = code.substr(6, 4) + "-" + Number(code.substr(10, 2)) + "-" + Number(code.substr(12, 2));
		let d: Date = new Date(sBirthday.replace(/-/g, "/"));
		// 非法生日
		if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) return false;
	}
	//18位身份证需要验证最后一位校验位
	if (code.length == 18) {
		const codeArr: string[] = code.split('');
		//∑(ai×Wi)(mod 11)
		//加权因子
		let factor: number[] = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
		//校验位
		let parity: (string | number)[] = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
		let sum: number = 0, ai: number = 0, wi: number = 0, i: number = 0;
		for (; i < 17; i++) {
			ai = +codeArr[i];
			wi = factor[i];
			sum += ai * wi;
		}
		let last: string | number = parity[sum % 11];
		let cardLastChar: string = codeArr[17].toUpperCase();
		// 校验位错误
		if (last != cardLastChar)  return false;
	}
	return true;
};

// 是否是居留证往版（老版本）
const isJuLiuCardV1 = (code: string) => {
	if(!code || !isString(code)) {
		console.error('为获取到正确的居留证件码!')
		return false
	}
	// 证件长度为 15
	if(code.length !== 15) return false
	// 国家和地区代码（1~3） 单个字母 对应的阿拉伯数字
	const map = {
		A: 10,
		B: 11,
		C: 12,
		D: 13,
		E: 14,
		F: 15,
		G: 16,
		H: 17,
		I: 18,
		J: 19,
		K: 20,
		L: 21,
		M: 22,
		N: 23,
		O: 24,
		P: 25,
		Q: 26,
		R: 27,
		S: 28,
		T: 29,
		U: 30,
		V: 31,
		W: 32,
		X: 33,
		Y: 34,
		Z: 35
	} as const;
    type MapType = keyof (typeof map)
	// 无限循环 7 3 1 加权因子
	let wiArr = [7, 3, 1];
	const codeArr = code.split('')
	// 最后一位校验位
	let checkNum = codeArr[codeArr.length - 1]
	let sum = 0
	codeArr.forEach((v, index) => {
		// 证件长度为 15 去除最后一位校验位
		if (index > 13) return
		// 转换地区编码
		let n = map[v as MapType] || v
		//  证件各位 乘以加权因子 相加
		sum += n * wiArr[index % 3]
	});
	// 模数为10 取 余数
	const ai = sum % 10
	// 余数与校验位对比
	return "" + ai == "" + checkNum
}

// 是否是居留证新版
const isJuLiuCardV2 = (code: string) => {
	if(!code || !isString(code)) {
		console.error('为获取到正确的居留证件码!')
		return false
	}
	// 长度为18
	if(code.length !== 18) return false
	// 新版必须是9开头
	if(!code.startsWith('9')) return false
	// 加权因子
	let wiArr = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
	const codeArr = code.split('')
	// 校验码字符集
	let aiArr = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
	// 最后校验位
	let checkNum = codeArr[17].toUpperCase()
	let sum = 0
	codeArr.forEach((v, index) => {
		// 长度为18 去除最后一位校验位
		if (index > 16) return
		// 与加权因子相乘 并且累加
		sum += Number(v) * wiArr[index]
	});
	// 累加和 模数 11 取余数作为索引从校验码合集获取校验码
	const ai = aiArr[sum % 11]
	return ai == checkNum
}

// 是否是居留证(兼容新老版本)
export const isJuLiuCard = (code: string) => isJuLiuCardV1(code) || isJuLiuCardV2(code)

// 是否为 IP
export const isIp = (ip: string): boolean => /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/.test(ip);
// 是否为 IPv6
export const isIpv6 = (ip: string): boolean => /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i.test(ip);
export const isUrl = (url: string): boolean => /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i.test(url);
/* -----------------------------------end--------------------------------------- */


/* -------------------------------设备相关---------------------------------- */
// 是否为 window 全局对象
export const isWindowObject = (value: Object): boolean => value != null && typeof value === 'object' && 'setInterval' in value;
const freeSelf = isWindowObject(typeof self == 'object' && self) && self;
const navigator = freeSelf && freeSelf.navigator;
const platform = (navigator && navigator.platform || '').toLowerCase();
const userAgent = (navigator && navigator.userAgent || '').toLowerCase();
const vendor = (navigator && navigator.vendor || '').toLowerCase();
// Opera
export const isOpera = (): boolean => {
	return userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/) !== null
};
// Opera Mini
export const isOperaMini = (): boolean => {
	return userAgent.match(/opera mini\/(\d+)/) !== null;
};
// Chrome
export const isChrome = (): boolean => {
	return (/google inc/.test(vendor) ? userAgent.match(/(?:chrome|crios)\/(\d+)/) : null) !== null;
};
// FireFox
export const isFirefox = (): boolean => {
	return userAgent.match(/(?:firefox|fxios)\/(\d+)/) !== null;
};
// Edge
export const isEdge = (): boolean => {
	return userAgent.match(/edge\/(\d+)/) !== null;
};
// IE
export const isIe = (): boolean => {
	return userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/) !== null;
};
// 苹果浏览器
export const isSafari = (): boolean => {
	return userAgent.match(/version\/(\d+).+?safari/) !== null;
};
// ipad
export const isIpad = (): boolean => {
	return userAgent.match(/ipad.+?os (\d+)/) !== null;
};
// iphone
export const isIphone = (): boolean => {
	return (isIpad() ? null : userAgent.match(/iphone(?:.+?os (\d+))?/)) !== null ;
};
// ipod
export const isIpod = (): boolean => {
	return userAgent.match(/ipod.+?os (\d+)/) !== null;
};
// 是否为 IOS 设备 for  h5 | uniapp
export const isIos = (): boolean => {
    // #ifdef H5
    if(userAgent){
        return isIpad() || isIphone() || isIpod()
    }
    // #endif
	try{
		const SystemInfo = uni && uni.getSystemInfoSync && uni.getSystemInfoSync();
		// 非 H5 ｜ uniapp 平台不支持判断
		if(!SystemInfo) return false;
		else {
		    if (SystemInfo.platform) return SystemInfo.platform.toLowerCase().indexOf("ios") > -1;
		    if (SystemInfo.osName) return SystemInfo.osName.toLowerCase().indexOf("ios") > -1;
		    if (SystemInfo.system) return SystemInfo.system.toLowerCase().indexOf("ios") > -1;
		}
	}catch(e){
	}
	return false;
};
// 是否为安卓设备 for h5 | uniapp
export const isAndroid = (): boolean => {
    // #ifdef H5
    if(userAgent) {
        return userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1;
    }
    // #endif
	try{
		const SystemInfo = uni && uni.getSystemInfoSync && uni.getSystemInfoSync();
		// 非 H5 ｜ uniapp 平台不支持判断
		if(!SystemInfo) return false;
		else {
			if (SystemInfo.platform) return SystemInfo.platform.toLowerCase().indexOf("android") > -1;
			if (SystemInfo.osName) return SystemInfo.osName.toLowerCase().indexOf("android") > -1;
			if (SystemInfo.system) return SystemInfo.system.toLowerCase().indexOf("android") > -1;
		}
	}catch(e){
	}
	return false;
};

//是否为小程序环境  h5 | uniapp
export const isMini = (): boolean => {
	// #ifdef H5
	if ( navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf("Mini") > -1) return true;
	// #endif
	try{
		const SystemInfo = sdk && sdk.getSystemInfoSync && sdk.getSystemInfoSync();
		// 非 H5 ｜ uniapp 平台不支持判断
		if(SystemInfo && SystemInfo.uniPlatform && SystemInfo.uniPlatform.startsWith("mp")) return true
	}catch(e){
		//TODO handle the exception
	}
	// #ifndef MP
	return false;
	// #endif
	// #ifdef MP
	return true
	// #endif
}

// windows 浏览器
export const isWindows = (): boolean => /win/.test(platform);
// mac 下的浏览器
export const isMac = (): boolean => /mac/.test(platform);
// linux 下的浏览器
export const isLinux = (): boolean => /linux/.test(platform) && !isAndroid();
// 是否为安卓下的 H5
export const isAndroidH5 = (): boolean => /android/.test(userAgent);
// windowsPhone 的 H5
export const isWindowsPhone = (): boolean => isWindows() && /phone/.test(userAgent);
// 是否为安卓 手机移动设备
export const isAndroidPhone = (): boolean => /android/.test(userAgent) && /mobile/.test(userAgent);
// 是否为黑莓手机
export const isBlackberry = (): boolean => /blackberry/.test(userAgent) || /bb10/.test(userAgent);
// 是否为安卓平板电脑
export const isAndroidTablet = (): boolean => /android/.test(userAgent) && !/mobile/.test(userAgent);
// 是否为 手机客户端, 不包括平板
export const isMobile = (): boolean => isIphone() || isIpod() || isAndroidPhone() || isBlackberry() || isWindowsPhone();
// 是否为手机大小尺寸
export const isPhoneSize = (): boolean => {
    if (window.matchMedia) return window.matchMedia("(max-width:500px)").matches;
    return window.innerWidth <= 500;
}
// 是都在线
export const isOnline = () => !navigator || navigator.onLine === true;
// 是否离线
export const isOffline = !isOnline();

/**
 * @desc 判断颜色是否为亮色 ｜ 还是暗色
 * @param param { type }
 * @return:
 */
export const isDarkColor = (color: string) => {
	const colorInfo = new TinyColor(color);
	const { r, g, b, isValid } = colorInfo || {};
	if(!isValid) return false;
	return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}
