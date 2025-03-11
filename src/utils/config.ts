interface IConfig {
	appName?: string
	appID?: string
	API_PREFIX?: string
	URL?: string
	SOCKET_URL?: string
	UPLOAD_URL?: string
	ORIGIN_URL?: string
	AUTH_URL?: string
	LOGIN_URL?: string
	TIMEOUT?: number
	LANGUAGE?: string
	[prop: string]: any
}
// 全剧配置文件
export class Config {
	/**
	 * App name
	 */
	static appName = "互联网门诊"
	/**
	 * App id
	 */
	static appID = ""
	/**
	 * 语言
	 */
	static	LANGUAGE = ""
	/**
	 * API 请求前缀
	 */
	static API_PREFIX = ""
	/**
	 * Url
	 */
	static URL = ""; // HTTP 一般请求url
	static SOCKET_URL = ""; // socket url
	static UPLOAD_URL = ""; // 上传 url
	static ORIGIN_URL = ""; // 跳转的URL前缀
	static AUTH_URL = "";   // 授权url
	static LOGIN_URL = "";  // 登陆url
	/**
	 * Http
	 */
	static TIMEOUT = 60000;// 请求超时时间


	// 设置配置信息
	static setConfig(params: IConfig) {
		if (params) {
			Object.keys(params).forEach((v: keyof IConfig) => {
				// @ts-ignore
				Config[v] = params[v]
			})
		}
	}
}

// @ts-ignore
export const sdk: Uni = "undefined" != typeof uni ? uni : "undefined" != typeof wx ? wx : "undefined" != typeof my ? my : "undefined" != typeof qq ? qq : "undefined" != typeof swan ? swan : null; // uni | wx | qq | my
// @ts-ignore
export const win: Window = "undefined" != typeof window ? window : "undefined" != this ? this : "undefined" != self ? self : null; // window | self | this

