import { TinyColor } from "@ctrl/tinycolor";
import { isObject } from "./is";
import { compareVersion } from "./util";
export interface KeyValue<T> {
    [ propName: string ]: T
}
/**
 * @desc 获取页面的url
 * @return: { currentPageLong: string, currentPage: string }
 */
export const getPageUrl = (): { currentPageLong?: string, currentPage?: string } => {
	// 仅出现在 H5 平台下的代码
	// #ifdef H5
    if(window?.location){
    	return {
            currentPageLong: window.location.href,
            currentPage: window.location.href
        };
    }
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

/**
 * @desc 根据出生日期判断年龄
 * @param birthStr { string }
 * @return: 
 */
export function getAgeByBirth (birthDate: string): number {
	const r: RegExpMatchArray | null = birthDate.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
	if (r == null) return 0;
    const rArr: number[] = (r as RegExpMatchArray).map(item => +item);
	const d: Date = new Date(rArr[1], rArr[3] - 1, rArr[4]);
	if (d.getFullYear() == rArr[1] && (d.getMonth() + 1) == rArr[3] && d.getDate() == rArr[4]) {
		const Y: number = new Date().getFullYear();
		return ((Y - rArr[1]));
	}
	return 0;
}

/**
 * @desc 根据出生日期计算出生了几天;
 * @param birthStr { string }
 * @return: 
 */
export function getBirthDays (birthDate: string): number {
	let now: number = Date.now(); //现在的时间
	let bir: number = new Date(birthDate.split("-").join("/")).getTime();
	let date: number = (now - bir) / 86400000;
	return date;
}

/**
 * @desc 根据身份证获取出生日期
 * @param idCard { string }
 * @return: 1990/01/01
 */
export function getBirthByID (idCard: string): string {
	let birthday = "";
	if (idCard != null && idCard != "") {
		if (idCard.length == 15) {
			birthday = "19" + idCard.slice(6, 12);
		} else if (idCard.length == 18) {
			birthday = idCard.slice(6, 14);
		}
		birthday = birthday.replace(/(.{4})(.{2})/, "$1/$2/");
	}
	return birthday;
}

/**
 * @desc 将目标转化为JSON string => JSON | JSON -> JSON
 * @param param { type }
 * @return: 
 */
export function getJson (target: any) {
	let json: { [ propName : string ] : any } = {};
	try {
		json = JSON.parse(target);
	} catch (err) {
		json = {};
	}
	return json;
}

/**
 * @desc 根据身份证获取地区、出生年月、性别
 * @param sId { string } 身份证
 * @param type { 0： 地区 | 1： 生日 | 2： 性别 }
 * @return: 
 */
export function getIdCardInfo(sId: string, type: 0 | 1 | 2): string {
	if (sId.length == 15) {
		sId = sId.replace(/([\d]{6})(\d{9})/, "$119$2x");
	}
	const CityArray = {
		11: "北京",
		12: "天津",
		13: "河北",
		14: "山西",
		15: "内蒙古",
		21: "辽宁",
		22: "吉林",
		23: "黑龙江",
		31: "上海",
		32: "江苏",
		33: "浙江",
		34: "安徽",
		35: "福建",
		36: "江西",
		37: "山东",
		41: "河南",
		42: "湖北",
		43: "湖南",
		44: "广东",
		45: "广西",
		46: "海南",
		50: "重庆",
		51: "四川",
		52: "贵州",
		53: "云南",
		54: "西藏",
		61: "陕西",
		62: "甘肃",
		63: "青海",
		64: "宁夏",
		65: "新疆",
		71: "台湾",
		81: "香港",
		82: "澳门",
		91: "国外"
	} as const;
    type CityType = keyof (typeof CityArray);
	let iSum: number = 0;
	if (!/^\d{17}(\d|x)$/i.test(sId)) return "";
	sId = sId.replace(/x$/i, "a");
	if (CityArray[parseInt(sId.substr(0, 2)) as CityType] == null){
        console.warn("Error:非法地区");
        return "";
    }
	let sBirthday: string = sId.substr(6, 4) + "/" + Number(sId.substr(10, 2)) + "/" + Number(sId.substr(12, 2));
	const d: Date = new Date(sBirthday);
	if (sBirthday != (d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate())) {
        console.warn("Error:非法生日");
        return "";
    }
	for (var i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11)
	if (iSum % 11 != 1) {
        console.warn("Error:非法证号");
        return "";
    }
	if (type == 0) {
		return CityArray[parseInt(sId.substr(0, 2)) as CityType]
	} else if (type == 1) {
		return sBirthday
	} else {
		return (+sId.substr(16, 1)) % 2 ? "男" : "女";
	}
}
/**
 * @desc 获取Canvas上下文（用于uniapp）
 * @param id { string } canvas 的 id
 * @param ctx { this } 页面的实例，v2: this, v3: getCurrentInstance()
 * @return: 
 */
export const getCanvas = (id: string, ctx: any): Promise<any> => {
    if(!uni?.getSystemInfoSync) return Promise.resolve(null);
	let context: any = null;
	let version = uni.getSystemInfoSync().SDKVersion;
	return new Promise((resolve, reject) => {
		if (version && compareVersion(version, "2.9.0") >= 0) {
			let view: UniApp.NodesRef = uni.createSelectorQuery().in(ctx).select("#" + id)
			view.fields({
				node: true
			}, () => {}).exec(
				data => {
					let Canvas = data[0].node;
					context = Canvas ? Canvas.getContext('2d') : uni.createCanvasContext(id, ctx);
					resolve(context);
				}
			);
		} else {
			context = uni.createCanvasContext(id, ctx);
			resolve(context);
		}
	});
}

/**
 * @desc 获取字符串的大小
 * @param str { string }
 * @param key { mb | kb | gb } 单位
 * @return: 
 */
export const getStringSize = (str: string, key?: "mb" | "kb" | "gb") => {
    // 使用UTF-8编码计算字符串的字节长度
	let totalBytes: number = new Blob([str]).size;
	let kb: number = totalBytes / 1024;
	// 将字节长度转换为兆字节（MB）
	let mb: number = kb / 1024;
	// 将字节长度转换为兆字节（MB）
	let gb: number = mb / 1024;
	const map = {
        gb,
		mb,
		kb 
	};
	return key ? map[key] : map;
}

/**
 * @desc 给一个颜色的加透明度
 * @param param { type }
 * @return: 
 */
export const getOpacityColor = (color: string, opacity: number) => {
    const colorInfo: TinyColor= new TinyColor(color);
    if(!colorInfo.isValid) return color;
	return new TinyColor(color).setAlpha(opacity).toRgbString();
}
