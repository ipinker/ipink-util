import { getPageUrl } from "./get"
import { isString } from "./is"
import {ENV_TYPE, EnvKey, EnvVal, getEnv} from "./env";
import {getSdk, win} from "./config";
import {toast} from "./toast";
import {navigateToMiniProgram} from "./navigation";


const encodeReserveRE = /[!'()*]/g
const encodeReserveReplacer = (c: string) => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
const encode = (str: string): string =>
	encodeURIComponent(str)
		.replace(encodeReserveRE, encodeReserveReplacer)
		.replace(commaRE, ',')

export function decode(str: string): string {
	try {
		return decodeURIComponent(str)
	} catch (err) {
	}
	return str
}

interface QueryType {
	[propName : string] : any
}
// 将url query字符串转化为url query 对象
export function parseQuery(query: string) : QueryType {
	const res: QueryType = {}

	query = query.trim().replace(/^(\?|#|&)/, '')

	if (!query) {
		return res
	}

	query.split('&').forEach(param => {
		const parts: string[] = param.replace(/\+/g, ' ').split('=') || [];
		const key = decode(parts.shift() || "")
		// 去除解码 参数不进行解码
		// const val = parts.length > 0 ? decode(parts.join('=')) : null
		const val = parts.length > 0 ? parts.join('=') : null

		if (res[key] === undefined) {
			res[key] = val
		} else if (Array.isArray(res[key])) {
			res[key].push(val)
		} else {
			res[key] = [res[key], val]
		}
	})

	return res
}


// 将url的query对象转化为url字符串
export function stringifyQuery(obj : QueryType): string {
	const res = obj
		? Object.keys(obj)
			.map(key => {
				const val = obj[key]

				if (val === undefined) return ''

				if (val === null) return encode(key)

				if (Array.isArray(val)) {
					const result: string[] = []
					val.forEach(val2 => {
						if (val2 === undefined) return

						if (val2 === null) result.push(encode(key))

						// 去除编码 防止多次编码
						// result.push(encode(key) + '=' + encode(val2))
						else result.push(encode(key) + '=' + val2)

					})
					return result.join('&')
				}

				// 去除编码 防止多次编码
				// return encode(key) + '=' + encode(val)
				return encode(key) + '=' + val
			})
			.filter(x => x.length > 0)
			.join('&')
		: ""
	return res ? `?${res}` : ''
}

export const getUrlByQuery = stringifyQuery;
export const getQueryByUrl = (url?: string) => {
	url = url || getPageUrl() || "";
    return parseQuery(url.split("?")[1] || "");
};

// 删除url指定部分
export function delUrlParams(url : string, names : string[] | string = []) : string {
	const urlArr : string[] = url.split('?');
	const search : string = urlArr[1];
	if (!search) return url;
	const query : { [propName : string] : string } = {}
	const arr : string[] = search.split("&");
	for (let i = 0; i < arr.length; i++) {
		let [key, value] = arr[i].split("=");
		query[key] = value;
	};
	if (isString(names)) names = [names as string];
	for (let i = 0; i < names.length; i++) {
		delete query[names[i]]
	}
	let queryStr = JSON.stringify(query).replace(/[\"\{\}]/g, "").replace(/\:/g, "=").replace(/\,/g, "&");
	let prefix = urlArr[0];
	return prefix + "?" + queryStr;
}

export const deleteQuery = delUrlParams;

/** @desc 根据Key获取query中的value **/
export function getQueryMember (queryName: string, url?: string) {
	url = url || getPageUrl() || "";

    const query: QueryType = parseQuery(url.split('?')[1] || "");
    return query[queryName];
}

/**
 * 将 【Scheme链接】转变为对象
 * @param scheme
 * @param env
 */
export const getParamsByScheme = (scheme: string, env: EnvKey) => {
	const len = {
		[ENV_TYPE.MY]: 16,
		[ENV_TYPE.WX]: 18
	}
	const start = {
		[ENV_TYPE.MY]: "alipays:",
		[ENV_TYPE.WX]: "wx:"
	}
	let message;
	let params: any = {};
	if (scheme.startsWith(start[env])) {
		var parseQuery = (str: string) => {
			return str.replace(/^.*?\?/, '').split('&').map(s => {
				var p = s.includes('=') ? s.indexOf('=') : s.length;
				return [s.slice(0, p), s.slice(p + 1)].map(decodeURIComponent);
			});
		};
		for (var [k, v] of parseQuery(scheme)) {
			if (k == 'appId') {
				if (v.length != len[env]) {
					message = `! 非 ${len[env]} 位 appId '${v}'`;
					return;
				}
			} else if (k == 'page') {
				k = 'path';
			} else if (k == 'query' && env === ENV_TYPE.MY) {
				var o: any = {};
				for (var [x, y] of parseQuery(v)) {
					o[x] = y;
				}
				v = o;
			} else {
				message = `! 不支持参数 '${k}' `;
				continue;
			}
			params[k] = v;
		}
	} else {
		message = `! 非 ${start[env]} 开头`;
	}
	if (message) {
		try {
			toast(message);
		} catch (e) {}
	}
	return params.appId ? params : "";
}

/**
 * URL 跳转
 * 目前支持: 微信内跳转微信小程序  链接为 weixin:// 或 :/**
 * 目前支持: 支付宝内跳转支付宝小程序  链接为 alipays: /**
 * 目前支持: 打电话 tel://
 * 目前支持: 普通https http
 * @param url
 * @param navigateType 2:redirectTo 3:switchTab 4:reLaunch 1:navigateTo
 */
export const jump = (url: string, navigateType = 1) => {
    let sdk = getSdk();
	let status = false;
	let _jump = navigateType == 2 ? sdk.redirectTo : navigateType == 3 ? sdk.switchTab : navigateType == 4 ? sdk.reLaunch : sdk.navigateTo
	if(sdk && url.startsWith("/")){
		_jump({
			url: url
		});
		status = true
	}
	else if (sdk && url.startsWith("tel://")) {
		const [protocol, content] = url.split("//");
		let phoneNumber = content || protocol;
		if (phoneNumber.indexOf("?") > -1) {
			phoneNumber = phoneNumber.split("?")[0];
		}
		sdk.makePhoneCall({
			phoneNumber
		});
		status = true;
	} else {
		// #ifdef H5
		if(win && typeof document !== "undefined"){
			const env = getEnv();
			if (url.startsWith("http://") || url.startsWith("https://")) {
				if (navigateType == 4) {
					window.location.replace(url);
					window.location.reload();
				}
				win.location.href = url;
				status = true;
			} else if (url.startsWith("alipays://")) {
				if (ENV_TYPE.MY === env) {
					const params = getParamsByScheme(url, ENV_TYPE.MY as EnvKey);
					if (!params || !Object.keys(params).length) status = false;
					else {
						navigateToMiniProgram({
							...params,
							fail: (e: any) => {
								console.log("Navigation.navigateToMiniProgram.ERROR.alipays:  ", e);
							}
						})
						status = true;
					}
				}
				// @ts-ignore
				else if (win && window.AlipayJSBridge) {
					window.location.href = url;
					status = true;
				}
			} else if (url.startsWith("wx://")) {
				if (ENV_TYPE.WX === env || ENV_TYPE.WXMINI === env) {
					const params = getParamsByScheme(url, ENV_TYPE.WX as EnvKey);
					if (!params || !Object.keys(params).length) status = false;
					else {
						navigateToMiniProgram({
							...params,
							fail: (e: any) => {
								console.log("Navigation.navigateToMiniProgram.ERROR.alipays:  ", e);
							}
						})
						status = true;
					}
				}
			} else if (url.startsWith("weixin://")) {
				if (ENV_TYPE.WX === env || ENV_TYPE.WXMINI === env) {
					window.location.href = url;
					status = true;
				}
			} else {
				status = false;
			}
			return status
		}
		// #endif
		// #ifndef H5
		if(sdk){
			if (url.startsWith("https://") || url.startsWith("http://")) {
				_jump({
					url: "/pages/webview/index?url=" + encodeURIComponent(url),
					fail: () => {
						if(typeof plus !== "undefined"){
							plus.runtime.openURL(url)
						}
					}
				});
				status = true
			}
			else status = false;
		}
		// #endif
	}
	return status;
}

interface AddNextUrlOption {
	key?: string,
	delParamArr?: string[]
}
/**
 * 把当前url添加到指定链接后边
 * @param url
 * @param options { AddNextUrlOption }
 * @param options.key 默认【nextUrl】
 */
export const addNextUrl = (url: string, options?: AddNextUrlOption) => {
	options = options || {}
	let callbackUrl = "";
	callbackUrl = getPageUrl();
	if(options.delParamArr){
		callbackUrl = deleteQuery(callbackUrl, options.delParamArr)
	}
	let key = options.key || "nextUrl"
	if (url.indexOf(key) == -1) {
		url = `${url}${url.indexOf("?") > -1 ? '&' : '?'}${key}=${callbackUrl}`
	}
	return url;
}

