import { getPageUrl } from "./get"
import { isString } from "./is"


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
    
	url = url || getPageUrl().currentPageLong || "";
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
	url = url || getPageUrl().currentPageLong || "";

    const query: QueryType = parseQuery(url.split('?')[1] || "");
    return query[queryName];
}