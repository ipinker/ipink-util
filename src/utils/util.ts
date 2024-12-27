import { isArray, isNumber, isObject, isString, isSafari, isIpad, isIphone, isIpod } from "./is";
import { KeyValue } from './get';
import { TinyColor } from "@ctrl/tinycolor";


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
 * @desc Uni.showToast 快捷调用
 * @param title { string | UniApp.ShowToastOptions } 
 * @param icon { "none" | "success" | "loading" | "error" | "fail" | "exception" } default "none"
 * @param mask { boolean } default false
 * @return: 
 */
export function toast (
    title: string | UniApp.ShowToastOptions, 
    icon?: "none" | "success" | "loading" | "error" | "fail" | "exception", 
    mask?: boolean, duration?: number
    ) {
	try{
		
		if(!uni || !uni.showToast) return ;
		if(isString(title)){
			const options: UniApp.ShowToastOptions = {
				title: title as string,
				icon: "none",
				mask: false
			};
			if(mask) options.mask = mask;
			if(duration) options.duration = duration;
			if(icon) options.icon = icon;
			uni.showToast(options)
		}
		else {
			const options = title as UniApp.ShowToastOptions;
			options.icon = options.icon || "none";
			uni.showToast(options);
		}
	}catch(e){
		//TODO handle the exception
	}
}


/**
 * @description 返回上一级
 * @param delta { number } 返回的层级数量
 */
export function navigateBack(delta?: number) {
    delta = delta || 1;
    //#ifdef H5
    if(window && window.history){
        window.history.go(Number('-' + delta));
        return 
    }
	//#endif
	//#ifndef H5
	try{
		uni && uni.navigateBack && uni.navigateBack({ delta: delta });
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
    if(document && window && window.getSelection){
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
        } catch (error) {  }
        return;
    }
	// #endif
	// #ifndef H5
	try{
		uni && uni.setClipboardData && uni.setClipboardData({
			data: val,
			success: () => {
		        tip && toast(tip);
		        success && success();
		    },
			fail: () => fail && fail()
		});
	}catch(e){
		//TODO handle the exception
	}
	// #endif
}

/** @desc key 是否在对象上 **/
export function hasKey (obj: { [propName: string] : any }, key: string) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

