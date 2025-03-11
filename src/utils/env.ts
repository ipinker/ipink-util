export type EnvKey = "WEB" | "WX" | "ALIPAY" | "WXMINI" | "MY" | "ESHIMIN" | "SWAN" | "KF" | "DY" | "TT" | "APP"
export type EnvVal = "WEB" | "WX" | "ALIPAY" | "WXMINI" | "MY" | "ESHIMIN" | "SWAN" | "GifShow" | "Bytedance" | "TT" | "iApp"
interface IEnvType {
	[ propName : string ]: EnvVal
}
export const ENV_TYPE: IEnvType = {
	// 普通浏览器
	WEB: 'WEB',
	// 微信公众号
	WX: 'WX',
	// 支付宝浏览器
	ALIPAY: 'ALIPAY',
	// 微信小程序
	WXMINI: "WXMINI",
	// 支付宝小程序
	MY: "MY",
	// 随身办
	ESHIMIN: "ESHIMIN",
	// 百度小程序
	SWAN: "SWAN",
	// 快手小程序
	KF: "GifShow",
	// 抖音小程序
	DY: "Bytedance",
	// 头条小程序
	TT: "TT",
	// 自己内部App运行环境；如果自己内部不是请设置 navigator.userAgent
	APP: "iApp",
}
/**
 * 判断是否是小程序环境
 */
export const isMiniProgram = (): boolean => {
	try {
		return /miniprogram/i.test(navigator.userAgent.toLocaleLowerCase())
	} catch (err) {
		return false
	}
}

/**
 * 获取当前浏览器的环境变量
 */
export function getEnv(): EnvVal {
	if (/micromessenger/i.test(navigator.userAgent.toLocaleLowerCase())) {
		if (isMiniProgram()) {
			return ENV_TYPE.WXMINI;
		}
		return ENV_TYPE.WX;
	}
	else if (/alipay/i.test(navigator.userAgent.toLocaleLowerCase())) {
		if (isMiniProgram()) {
			return ENV_TYPE.MY;
		}
		return ENV_TYPE.ALIPAY;
	}
	else if (navigator.userAgent.toLocaleLowerCase().indexOf('eshiminapp') > -1) {
		return ENV_TYPE.ESHIMIN;
	}
	else if (/swan\//.test(window.navigator.userAgent) || /^webswan-/.test(window.name)) {
		return ENV_TYPE.SWAN;
	}
	else if(/iapp/i.test(navigator.userAgent.toLocaleLowerCase())) {
		return ENV_TYPE.APP;
	}
	// 快手小程序 todo

	// 抖音小程序 todo

	// 头条小程序 todo
	else {
		return ENV_TYPE.WEB;
	}
}
