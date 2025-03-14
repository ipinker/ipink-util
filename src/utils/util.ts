import {
	isArray,
	isNumber,
	isObject,
	isString,
	isSafari,
	isIpad,
	isIphone,
	isIpod,
	isToday,
	isMini,
	isAndroid
} from "./is";
import {getPageUrl, KeyValue} from './get';
import {ENV_TYPE, getEnv, isMiniProgram} from "./env";
import {getSdk, win} from "./config";
import {toast} from "./toast";
import {Storage} from "./cache"


export interface IErrorBase {
	errMsg?: string,
	errCode?: string
}

export interface ISuccessBase extends IErrorBase {
	ok: boolean,
	msg?: string
}

const base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -
	1,
	-
	1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
	12, 13,
	14,
	15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
	36, 37,
	38, 39, 40,
	41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
/**
 * @desc Base64 编码
 * @param str { string }
 * @return: {string}
 */
export function base64encode (str: string): string {
    let out: string = "", i: number = 0, len: number = str.length;
    let c1: number, c2: number, c3: number;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}
/**
 * @desc Base64 解码
 * @param str { string }
 * @return: {string}
 */
export function base64decode (str: string): string {
    if (str == "" || str == null || str == undefined) {
        return "";
    }
    let c1: number, c2: number, c3: number, c4: number;
    let i: number = 0, len: number = str.length, out: string = "";

    while (i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1)
            break;

        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1)
            break;

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61)
                return out;
            c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1)
            break;

        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61)
                return out;
            c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}


/**
 * @description 返回上一级
 * @param delta { number } 返回的层级数量
 */
export function navigateBack(delta?: number) {
    delta = delta || 1;
    //#ifdef H5
    if(typeof window !== "undefined" && window.history){
        window.history.go(Number('-' + delta));
        return
    }
	//#endif
    let sdk = getSdk();
	//#ifndef H5
	try{
		if(sdk){
			sdk.navigateBack && sdk.navigateBack({ delta: delta });
		}
	}catch(e){
	}
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
 * @desc 生成GUID
 * @return: { string }
 */
export function uuid(sign = "-"): string {
	let d: number = new Date().getTime();
	let uuid = `xxxxxxxx${sign}xxxx${sign}4xxx${sign}yxxx${sign}xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}


/**
 * @desc 填充字符串
 * @param target 源字符串 { type }
 * @param fill 需要填充的字符 { type }
 * @param len 填充长度 { type }
 * @return: (0.1, 0, 2) => "0.100"
 */
export function fillStr (target: string | number, fill: string, len: number): string {
    if(!isString(target) && !isNumber(target)) return target as string;
    if(isNumber(target)) target = "" + target;
    for (var i = 0; i < len; i++) {
        target += fill
    }
	return target as string;
}

// en 11.2w  ,  sp  11,000.00 ,
//
/**
 * @desc 转换数字格式 11000 -> 11K(en) -> 1万1(cn) -> 11,000(sp)
 * @param num { number } 目标数字
 * @param type { "en" | "cn" | "sp" } 目标数字
 * @param fixed { number } 小数部分长度
 * @return:
 */
export const converNumber = (num: number | string, type: "en" | "cn" | "sp", fixed = 1): string => {
	num = "" + num;
	let left: string = num.split(".")[0];
	let right: string = num.split(".")[1] || "";
	let rl: number = right.length;
	let fl: number = left.length;
	if (type === "en") {
		if (fl < 4) left + "." + right;
		let conver = {
			"K": 1000,
			"W": 10000,
			"M": 1000000,
			"B": 1000000000
		} as const;
        type ConverType = keyof (typeof conver);
		let symbol: string = fl <= 4 ? "K" :
			fl <= 6 ? "W" :
			fl <= 12 ? "M" :
			"B";
		let value: string = ((+left) / conver[symbol as ConverType]).toFixed(fixed);
		let _vr = value.split(".")[1] || "";
		if (_vr.length > fixed) {
			value = value.split(".")[0] + _vr.slice(0, fixed);
		}
		return value + symbol;
	}

	if (type === "cn") {
		if (fl < 4) left + "." + right;
		let conver = {
			" ": 1,
			"万": 10000,
			"亿": 100000000
		};
        type ConverType = keyof (typeof conver);
		let _symbol: string = fl <= 5 ? " " :
			fl <= 11 ? "万" :
			"亿";
		let _value: string = ((+left) / conver[_symbol as ConverType]).toFixed(fixed);
		let _vr = ("" + _value).split(".")[1] || "";
		if (_vr.length > fixed) {
			_value = ("" + _value).split(".")[0] + _vr.slice(0, fixed);
		}
		return _value + _symbol;
	}
	if (type === "sp") {
		right = rl <= fixed ?
			fillStr(right, "0", fixed - rl) :
			right.slice(0, fixed);
		if (fl < 4) left + "." + right;
		let count: number = 0;
		let arr: string[] = [];
		for (let i = left.length - 1; i >= 0; i--) {
			if (count % 3 === 0 && count !== 0) {
				arr.unshift(",");
			}
			arr.unshift(left[i]);
			count++;
		}
		return arr.join("") + "." + right;
	}
    return "" + num;
}

/** @desc 首字母大写 **/
export const firstCharCase = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();


/**
 * @desc 从数组中找到目标，并插入到数组最前方
 * @param arr 目标数组 { T[] }
 * @param target 查找对象 { T[] }
 * @param options 扩展
 * @param options.key 如果是对象，需要提供唯一 key { keyof T }
 * @param options.type push | unshift { push | unshift }
 * @return: { T[] }
 */
export function findTargetAndRemove <T> (
    arr: T[], target: T, options: {  key?: string, type?: "push" | "unshift" }) {
    const { key = "id", type = "unshift" } = options || {};
	const index = arr.findIndex((item: T) => {
        if((isString(item) || isNumber(item)) && item === target) return item;
        const _item: KeyValue<any> = item as KeyValue<any>;
        const _target: KeyValue<any> = target as KeyValue<any>;
		if (_item[key] == _target[key]) {
			return item;
		}
	});
    if (index == -1) {
        arr[type](target);
    }
    else {
        const _target = arr.splice(index, 1);
        arr[type](Object.keys(target as KeyValue<any>).length == 1 ? (_target as T) : target);
    }

	return arr;
}


// Promise.all
function handlerPromise <T, E = null> (promiseList: Promise<T | E>[]): Promise<T | E>[] {
	return promiseList.map(
        (promise: Promise<T | E>) =>
        promise.then((res: T | E) => res, (err: E) => err)
    );
};
/**
 * @desc Promise.all 解决ALl catch 中断
 * @param param { type }
 * @return:
 */
export function allSettled <T, E> (promiseList: Promise<T | E>[]): Promise<(Awaited<T> | Awaited<E>)[]> {
	return Promise.all(handlerPromise(promiseList));
}

/**
 * @desc 防抖, 一定时间范围被只执行最后一次
 * @param func { Function }
 * @param time { number } ms
 * @return:
 */
export function debounce(func: Function, time: number, immediate?: boolean): Function {
	if (!time || time <= 0) return func;
	let timeId: any = undefined;

	return function() {
		if(timeId) clearTimeout(timeId);
        if(immediate) {
            const isCall = !timeId;
            timeId = setTimeout(() => {
                timeId = null;
            }, time)
            if(isCall){
                // @ts-ignore
                func.apply(this, arguments);
            }
        }
        else {
            timeId = setTimeout(() => {
                // @ts-ignore
                func.apply(this, arguments);
            }, time)
        }
	}
}

/**
 * @desc 节流, 一定范围内只执行第一次
 * @param func { Function }
 * @param time { number } ms
 * @return:
 */
export function throttle(func: Function, time: number) {
	let timeId: any = undefined,
		start: number | undefined;
	return function(...args : any[]) {
		let now: number | undefined = new Date().getTime();
		if (!start) start = now;
		if (now - start > time) {
			clearTimeout(timeId);
			timeId = start = now = undefined;
            // @ts-ignore
			func.apply(this, args);
		} else {
			if (timeId) return;
			timeId = setTimeout(() => {
                // @ts-ignore
				func.apply(this, args);
				timeId = start = now = undefined;
			}, time)
		}
	}
}
export type CopyOptionsType = {
    /** @desc 复制成功提示， 不传不提示 **/
    tip: string,
    success?: Function,
    fail?: Function
}

/**
 * @description 复制文本内容
 * @param val { string } 复制文本内容
 * @param options { CopyOptionsType } 可选内容
 * @param options.tip { string } 复制成功提示文本，不传则不提示
 * @param options.success { Function } 复制成功回调
 * @param options.fail { Function } 复制失败回调
 */
export function copyValue (val: string, options?: CopyOptionsType) {
    const { tip, success, fail } = options || {};
    // #ifdef H5
    // @ts-ignore
    if(typeof document !== "undefined" && window && window.getSelection){
        let platform = ''
        if( isSafari() || isIpad() || isIphone() || isIpod() ) platform = 'ios';
        try {
            if (platform == 'ios') {
                // @ts-ignore
                window.getSelection().removeAllRanges(); //这段代码必须放在前面否则无效
                let inputDom = document.createElement('input');
                document.body.appendChild(inputDom); // 把标签添加给body
                // @ts-ignore
                inputDom.style.opacity = 0; //设置input标签设置为透明(不可见)
                inputDom.value = val; // 修改文本框的内容
                let range = document.createRange();
                // 选中需要复制的节点
                range.selectNode(inputDom);
                // 执行选中元素
                // @ts-ignore
                window.getSelection().addRange(range);
                inputDom.select();
                inputDom.setSelectionRange(0, inputDom.value.length); //适配高版本ios
                // 执行 copy 操作
                document.execCommand('copy');
                // @ts-ignore
                window.getSelection().removeAllRanges();
                document.body.removeChild(inputDom)
            } else {
                var _input = document.createElement('input')
                _input.value = val;
                document.body.appendChild(_input)
                _input.select()
                document.execCommand('Copy')
                _input.remove()
            }
            tip && toast(tip);
            success && success();
        } catch (error: any) {
			fail && fail(error)
		}
        return;
    }
	// #endif
    let sdk = getSdk();
	// #ifndef H5
	try{
		sdk && sdk.setClipboardData && sdk.setClipboardData({
			data: val,
			success: () => {
		        tip && toast(tip);
		        success && success();
		    },
			fail: (e: any) => fail && fail(e)
		});
	}catch(e: any){
		fail && fail(e)
	}
	// #endif
}

/** @desc key 是否在对象上 **/
export function hasKey (obj: { [propName: string] : any }, key: string) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}


/**
 * 设置页面title
 * @param title
 * 如果title被base64编码且需要解析，页面query需要拼上 base64=1
 * @example `
 * 	import { base64encode, jump } from "ipink-util"
 * 	const title = base64encode("呵呵")
 * 	jump("/pages/home/index?title=" + title + "&base64=1");
 *
 * 	当前页面的url:  localhost:8080/app/#/pages/home/index?title=dsadqweqeqweqwe&base64=1
 * 	setTitleName(title) => "呵呵"
 * 	当前页面的url:  localhost:8080/app/#/pages/home/index?title=dsadqweqeqweqwe
 * 	setTitleName(title) => "dsadqweqeqweqwe"
 * `
 */
export const setTitleName = (title = "") => {
	if(typeof window !== "undefined" && typeof document !== "undefined") {
		try {
			// 链接中的title是base64编码的需要先进行解码
			let url = getPageUrl()
			if (url.indexOf("base64=1") > -1) {
				title = decodeURIComponent(base64decode(title));
			}
		} catch (e) {
			title = "";
		}
		const env = getEnv()
		// 支付宝小程序内部的title 用网页修改title方式设置
		if (ENV_TYPE.MY === env) {
			document.title = title
			return
		}
		else if (ENV_TYPE.ALIPAY === env) {
			const setAlipayTitle = () => {
				// @ts-ignore
				AlipayJSBridge.call("setTitle", { title: title });
			}
			// @ts-ignore
			if (window.AlipayJSBridge && AlipayJSBridge) {
				setAlipayTitle()
			} else {
				document.addEventListener('AlipayJSBridgeReady', setAlipayTitle, false)
			}
			return
		}
	}
    let sdk = getSdk();
	sdk && sdk.setNavigationBarTitle({
		title: title,
		fail: () => {
			if(typeof document !== "undefined") document.title = title;
		}
	})
}
/**
 * 字符脱敏
 * @param str
 * @param begin 从第几位开始
 * @param end   倒数从第几位结束
 */
const desensitization = (str: string, begin = 3, end = begin) => {
	if (!str || str.length <= begin + end) return str;
    end = str.length - end
	let firstStr = str.slice(0, begin);
	let lastStr = str.slice(end);
	let middleStr = str.substring(begin, Math.abs(end)).replace(/[\s\S]/ig, '*');
	let tempStr = firstStr + middleStr + lastStr;
	return tempStr;
}

interface IGetRefInfoOption {
	size?: boolean,
	rect?: boolean,
	scrollOffset?: boolean
}
/***
 * 在UniApp中 获取元素的布局信息
 * @param {*} ref :  #id .class tag
 * @return {*} that : this
 * @return { IGetRefInfoOption } options
 */
export const getRefInfo = (ref: string, that: any, options?: IGetRefInfoOption) => {
	if (!options) {
		options = {
			size: true,
			rect: true,
			scrollOffset: true
		}
	}
    let sdk = getSdk();
	if(!sdk) return Promise.resolve(null);
	return new Promise((resolve) => {
		if (!ref) {
			resolve(null);
		}
		try {
			let view = uni.createSelectorQuery().in(that).select(ref);
			view.fields(options, data => {
				resolve(data ? {
					...data,
					ref
				} : null);
			}).exec();
		} catch (e) {
			resolve(null);
		}
	});
}

interface IGetLocationOption {
	success?: Function,
	fail?: Function,
	complete?: Function,
	/**  @deprecated 已废弃  **/
	callback?: Function,
	isToast?: boolean,
	/**
	 * 使用后今日不再掉用成功
	 */
	isUseRefuseTime?: boolean,
	/**
	 * 初始化WxJsSdk的函数， 可以将初始化微信jssdk的逻辑写在该函数内
	 */
	initWxSdkCallback?: () => Promise<any>
}
/**
 * 获取经纬度
 * @param { IGetLocationOption } options
 */
export const getLocation = async (options: IGetLocationOption) => {
	const {
		callback,
		success,
		fail,
		complete,
		isToast = false,
		isUseRefuseTime = false,
		initWxSdkCallback
	} = options || {}
	return new Promise(async (resolve) => {
		if (isUseRefuseTime) {
			const refuseTime = Storage.getItem('IsRefuseGetLocation')
			if (refuseTime && isToday(refuseTime)) {
				callback && callback(false, {})
				return resolve(null)
			}
		}

		let isAlipay = false,
			err: any = null
		// #ifdef H5
		if(typeof document !== 'undefined' && win) {
			try {
				let env = getEnv()
				if (env == ENV_TYPE.ALIPAY || env == ENV_TYPE.MY) {
					isAlipay = true
					// @ts-ignore
					window.AlipayJSBridge && AlipayJSBridge.call('getCurrentLocation', {bizType: '$s'}, (result: any) => {
						if (result.error) {
							callback && callback()
							if (result.error == 11) {
								// @ts-ignore
								AlipayJSBridge.call('showAuthGuide', {bizType: '$s', authType: 'LBS'}, function(r: any) {
									fail && fail({
										... result,
										errMsg: result.errorMessage
									})
								});
							} else {
								fail && fail({
									... result,
									errMsg: result.errorMessage
								})
								toast(result.errorMessage);
							}
							complete && complete()
							resolve(null)
						}
						else {
							callback && callback(result)
							success && success(result)
							complete && complete(result)
							resolve(result)
						}
					});

					return ;
				}
				else if (env == ENV_TYPE.WX || env == ENV_TYPE.WXMINI) {
					// 是否需要初始化微信sdk
					if (initWxSdkCallback) {
						await initWxSdkCallback()
					}
					wx.getLocation({
						// 默认为wgs84的 gps 坐标，如果要返回直接给 openLocation 用的火星坐标，可传入'gcj02'
						type: 'gcj02',
						success: (res) => {
							callback && callback(res)
							success && success(res)
							complete && complete(res)
							resolve(res)
						},
						fail: (e) => {
							callback && callback()
							fail && fail(e)
							complete && complete()
							resolve(null)
						},
						cancel: function(res: any) {
							callback && callback()
							fail && fail({
								errMsg: res.errMsg || "用户拒绝授权获取地理位置信息"
							})
							complete && complete()
							resolve(null)
							if (isUseRefuseTime) {
								// 使用微信内置的提示框
								const result = confirm('用户拒绝授权获取地理位置，今日是否不再提示!');
								if (result) {
									Storage.setItem('IsRefuseGetLocation', new Date())
								}
							}
						}
					});
					return
				}
				// @ts-ignore
				else if (env == ENV_TYPE.SWAN && typeof swan !== "undefined" && swan.getLocation) {
					// @ts-ignore
					swan.getLocation({
						type: 'gcj02',
						success: (res: any) => {
							callback && callback(res)
							success && success(res)
							complete && complete(res)
							resolve(res)
						},
						fail: (err: any) => {
							callback && callback()
							fail && fail(err)
							complete && complete()
							resolve(null)
						}
					});
					return ;
				}
			} catch (e: any) {
				err = {
					... (e || {}),
					errMsg: e?.errMsg || e?.message || "获取失败"
				}
			}
		}
		// #endif

		try {
    		let sdk = getSdk();
			if(sdk){
				// 默认为 wgs84 返回 gps 坐标，gcj02 返回国测局坐标
				let type = 'gcj02'
				// #ifdef H5
				type = typeof document !== "undefined" && isAlipay ? 'wgs84' : 'gcj02'
				// #endif
				// #ifdef MP
				if(isMini()) type = 'wgs84'
				// #endif
				uni.getLocation({
					type,
					highAccuracyExpireTime: 1000,
					success: (res) => {
						callback && callback(res);
						success && success(res);
						complete && complete(res)
						resolve(res)
					},
					fail: (err) => {
						callback && callback();
						fail && fail(err)
						complete && complete()
						resolve(null)
					}
				});
				return ;
			}
		} catch (e: any) {
			err = {
				... (e || {}),
				errMsg: e?.errMsg || e?.message || "获取失败"
			}
		}
		callback && callback();
		fail && fail({
			... (err || {}),
			errMsg: err?.errMsg || "获取失败"
		})
		complete && complete()
		resolve(null)
	})
}


let EARTH_RADIUS = 6378137.0; //单位M
let PI = Math.PI;
function getRad(d: number): number {
	return d * PI / 180.0;
}
/**
 * 计算两个坐标之间的距离, 单位 米（m）
 * @param {number} lng1 坐标经度1
 * @param {number} lat1 坐标纬度1
 * @param {number} lng2 坐标经度2
 * @param {number} lat2 坐标纬度2
 * @example `
 * 	const result = getGreatCircleDistance(116.2317, 39.5427, 116.1127, 38.1456)
 * 	console.log(result) //155866.2671
 * `
 *
 */
export function getGreatCircleDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
	let radLat1 = getRad(lat1);
	let radLat2 = getRad(lat2);
	let a = radLat1 - radLat2;
	let b = getRad(lng1) - getRad(lng2);
	let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	s = s * EARTH_RADIUS;
	s = Math.round(s * 10000) / 10000.0;
	return s;
}

interface IPostMessageOption {
	/**
	 * 自己定义的通信时间标识
	 */
	type: string,
	/**
	 * 通信传递参数
	 */
	params: AnyObject,
	success: (data: IPostMessageResult) => void,
	fail: (err: IErrorBase) => void,
	complete: (data: IPostMessageResult | IErrorBase) => void,
}

interface IPostMessageResult extends ISuccessBase {
}
/**
 * @desc h5 与 父级应用通信
 * @param { Object } options
 * params.type 事件类型
 * params.success
 * params.fail
 * params.options Data
 */
export function postMessage(options : IPostMessageOption): Promise<IPostMessageResult | IErrorBase> {
	const env = getEnv();
	return new Promise((resolve) => {
		if(typeof document !== 'undefined' && win) {
			try {
				const {
					type,
					params = {},
					success,
					fail
				} = options || {}
				//  消息内容
				const msgData = {
					data: {
						type: type,
						params
					}
				}
				// 消息回调
				const callBack = () => {
					resolve({
						ok: true
					})
					success({
						ok: true
					})
				}
				switch (env) {
					case ENV_TYPE.MY:

						// @ts-ignore
						my.postMessage({
							type: type,
							params
						});
						// @ts-ignore
						my.onMessage = (e) => {
							const {
								ok,
								result,
								type
							} = e
							if (ok) {
								if (typeof success == 'function') {
									success(e)
								}
								resolve(e)
							} else {
								if (typeof fail == 'function') {
									fail(e)
								}
								resolve({
									... (e || {}),
									errMsg: e?.errMsg || e?.message || "获取信息失败"
								})
							}
						}
						break;
					case ENV_TYPE.WX:
					case ENV_TYPE.WXMINI:
						// @ts-ignore
						wx.miniProgram.postMessage(msgData)
						// 微信小程序webview中无法直接通信  直接回调成功
						callBack()
						break;
					case ENV_TYPE.SWAN:
						// @ts-ignore
						swan.webView.postMessage(msgData)
						// 百度小程序webview中无法直接通信  直接回调成功
						callBack()
						break
					case ENV_TYPE.TT:
						// @ts-ignore
						tt.miniProgram.postMessage(msgData)
						// 抖音小程序webview中无法直接通信  直接回调成功
						callBack()
						break
					default:
						window.postMessage(msgData)
						callBack()
						break;
				}

			} catch (e) {
				resolve({
					ok: false,
					... (e || {})
				})
			}
		}
		else {
			resolve({
				ok: true,
				errMsg: "非浏览器环境调用"
			})
		}
	})
}
/**
 * webview内返回主应用首页
 * @param delta { number }
 */
export const backMainAppHome = (delta = 1) => {
	// #ifdef H5
	if(typeof document !== 'undefined' && win) {
		const env = getEnv()
		if (ENV_TYPE.WXMINI === env && typeof wx !== "undefined") {
			// @ts-ignore
			wx.miniProgram.navigateBack({
				delta
			});
			return true;
		}
		else if (ENV_TYPE.MY === env && typeof my !== "undefined") {
			// @ts-ignore
			my.navigateBack({
				delta
			});
			return true;
		}
		// @ts-ignore
		else if (ENV_TYPE.SWAN === env && typeof swan !== "undefined") {
			// @ts-ignore
			swan.webView.navigateBack({
				delta
			});
			return true;
		}
		// @ts-ignore
		else if (sdk && sdk?.webView?.navigateBack) {
			// @ts-ignore
			sdk.webView.navigateBack({
				delta
			});
			return true;
		}
		// #endif
		uni.navigateBack({
			delta: delta
		});
	}
	return true;
}


/**
 * uniapp 检查白屏
 * @param nextTick { Vue.nextTick }
 * @param ref
 * @example `
 *  const ctx = getCurrentInstance()?.proxy
 * 	checkWhiteScreen(ctx, ".content")
 *
 * 	checkWhiteScreen(this, ".content")
 * `
 */
export const checkWhiteScreen = (that: any, ref = ".content") => {
	try {
		that.$nextTick(() => {
			const query = uni.createSelectorQuery().in(that);
			query.select(ref).boundingClientRect((data: any) => {
				if (!data || data.height == 0) {
					window.location.reload();
				}
			}).exec();
		})
	} catch (e) {}
}

interface IScanCodeOption {
	success?: (opt: {code: string}) => void

	/**
	 * 小程序webview扫码完成调用api指定key为【cacheKey】存储到云端，webview找时机使用【cacheKey】去云端取值
	 */
	cacheKey?: string,
	/**
	 * 微信公众号该参数比传
	 */
	jsCodeInfo?: {

	}
}
export const BAR_CODE_TYPE = ["EAN_8", "EAN_13", "CODE_25", "CODE_39", "CODE_128", "UPC_A", "UPC_E"];
/**
 * 扫码
 * @param options { IScanCodeOption }
 */
export const scanCode = (options: IScanCodeOption) => {
	const {
		success,
		cacheKey,
		jsCodeInfo = {}
	} = options || {};
	const empty = {
		code: ""
	}
	return new Promise(async (resolve) => {
		try {
			if (navigator.userAgent.indexOf("AlipayClient") >= 0) {
				if (isMini()) {
					// @ts-ignore
					my.onMessage = (e) => {
						var result = JSON.parse(e.messageDetail);
						let opt = {
							code: result.scanCode
						};
						if (success) {
							success(opt);
						}
						resolve(opt);
					};
					// @ts-ignore
					my.postMessage({
						messageType: "scan",
					});
				} else {
					// @ts-ignore
					if (window.AlipayJSBridge && AlipayJSBridge) {
					// @ts-ignore
						AlipayJSBridge.call(
							'scan', {
								scanType: ['qrCode', 'barCode']
							},
							(result: any) => {
								let opt = {
									code: ""
								};
								if (result.barCode) {
									opt.code = result.barCode;
								}
								if (result.qrCode) {
									opt.code = result.qrCode;
								}
								if (success) {
									success(opt);
								}
								resolve(opt);
							},
							(err: any) => {
								toast("识别失败: " + JSON.stringify(err))
								if (success) {
									success(empty);
								}
								resolve(empty);
							}
						);
					} else {
						toast("扫码调用失败");
						if (success) {
							success(empty);
						}
						resolve(empty);
					}
				}
			}
			else if (navigator.userAgent.indexOf("MicroMessenger") >= 0 && typeof wx !== "undefined") {
				if (isMiniProgram()) {
					// @ts-ignore
					wx.miniProgram.postMessage({
						data: {
							type: "scan",
							params: {
								cacheKey
							}
						}
					});
					if (success) {
						success(empty);
					}
					return resolve(empty);
				}
				// @ts-ignore
				wx.config({
					debug: 0,
					... (jsCodeInfo || {}),
					jsApiList: ["scanQRCode"], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});
				// @ts-ignore
				wx.ready(() => {
					// @ts-ignore
					wx.scanQRCode({
						needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
						scanType: [
							"qrCode",
							"barCode",
							"datamatrix",
						], // 可以指定扫二维码还是一维码，默认二者都有
						success: (result: any) => {
							let commaIndex = result.resultStr.indexOf(',');
							try {
								const target = BAR_CODE_TYPE.find(item => item
									.toLocaleUpperCase() == result.resultStr
									.slice(0, commaIndex));
								if (target) {
									result.resultStr = result.resultStr.slice(
										commaIndex + 1);
								}
							} catch (e) {}
							let opt = {
								code: result.resultStr
							};
							if (success) {
								success(opt);
							}
							resolve(opt);
						},
						fail: (res: any) => {
							toast(JSON.stringify(res));
							if (success) {
								success(empty);
							}
							resolve(empty);
						}
					});
				});
			}
			else {
				uni.scanCode({
					success: function (res) {
						let opt = {
							code: res.result
						}
						if (success) {
							success(opt);
						}
						resolve(opt);
					},
					fail() {
						toast("当前环境暂不支持扫码！");
						if (success) {
							success(empty);
						}
						resolve(empty);
					}
				});
			}

		} catch (e: any) {

			toast(e?.errMsg || e?.message || JSON.stringify(e));
			if (success) {
				success(empty);
			}
			resolve(empty);
		}
	});
}

/**
 * 数组扁平化 多维转一维
 * @param {T[]} arr
 */
export function flattenArray<T> (arr: any[]): T[] {
	let result: T[] = [];

	// 遍历数组中的每一项
	arr.forEach(item => {
		if (Array.isArray(item)) {
			// 如果元素是数组，递归调用 flattenArray 函数
			result = result.concat(flattenArray(item));
		} else {
			// 如果元素是普通元素，直接推入结果数组
			result.push(item);
		}
	});

	return result;
}

export type FormatTArray<T> = T & { children: T[] }
/**
 * 将一位数组根据指定的key(例如pid), 进行分组为子父级结构
 * 类似函数 formatTree， 如果对id也自定义可以使用 formatTree
 * @param {T[]} arr
 * @param {String} key = "pid"
 */
export function buildHierarchyArray <T extends { id: string | number }>(arr: T[], key : keyof T): FormatTArray<T>[] {
	let result: FormatTArray<T>[] = [];
	let map: { [propName: string]: FormatTArray<T> } = {};

	// 创建一个 map，用于存储每个元素，便于后续查找
	arr.forEach((item: T) => {
		map[item.id] = {
			...item,
			children: []
		}; // 复制 item 并初始化 children 属性
	});

	// 遍历数组，构建树形结构
	arr.forEach((item: T) => {
		let pid = item[key] as FormatTArray<T>;
		if (pid === null || pid === undefined) {
			// 如果没有 pid，说明是根节点，直接放入结果数组
			result.push(map[item.id]);
		} else {
			// 否则，将当前元素添加到其父元素的 children 数组中
			if (pid) {
				pid.children.push(map[item.id]);
			}
		}
	});

	return result;
}

/**
 * 格式化二级数据 【1，2】 =》 【【】】
 * 类似函数 formatTree
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

