import {CloseLoadingType, ContentType, InterceptorType, LoadingType, Method, ToastType} from "./typing";
import {IToast} from "./toast";

export declare interface IConfig {
	appName?: string
	appId?: string
	language?: string

	axios?: any
	api_prefix?: string
	request_url?: string
	socket_url?: string
	origin_url?: string
	login_url?: string
	token_key?: string
	request_timeout?: number
	request_method?: Method
	[prop: string]: any
}
// 全剧配置文件
export class Config {
	/**
	 * App name
	 */
	static appName = ""
	/**
	 * App id
	 */
	static appId = ""
	/**
	 * 语言
	 */
	static	language = ""
	/**
	 * API 请求前缀
	 */
	static api_prefix = ""
	/**
	 * Url Option
	 */
	static request_url = ""; // HTTP 一般请求url
	static request_method: Method = "POST"; // 默认请求方法
	static socket_url = ""; // socket url
	static origin_url = ""; // 跳转的URL前缀
	static login_url = "";  // 登陆url
	static token_key = "A__APP_TOKEN__Z" // Token 存储key
	static request_timeout = 60000;// 请求超时时间
	/**
	 * Http
	 */
	static axios: any = null;

	/**
	 * 组件内部调用内部的toast方法时， 是否用内部定义的html toast， 否则使用uni.showToast
	 */
	static use_inner_toast: boolean = true;
	/**
	 * toast 持续时间
	 */
	static toast_duration: number = 2400;

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

declare interface IHttpConfig {
    /**
     * 请求的URL
     */
    base_url?: string
    /**
     * 超时时间
     */
    timeout?: number
	content_type?: ContentType
    /**
     * 默认方法
     */
    default_method?: Method
    /**
     * 获取token函数吗未设置则取 Storage.get(AxiosConfig.token_key)
     */
    getToken?: null | (() => string)
	/**
	 * Token 验证类型， 默认： Bearer
	 */
	token_type?: string
    /**
     * 获取Token的Key， 默认使用的是  import {Storage} from "ipink-util";Storage.get
     */
    token_key?: string
    /**
     * 外部传入的axios包
     */
    axios?: any | null
    /**
     * 请求前缀
     */
    api_prefix?: string ;
    /**
     * 上传请求前缀
     */
    upload_prefix?: string ;

	/**
	 * 文件上传后后段接收的 key
	 */
	upload_key?: string;
	/**
	 * 文件上传成功后用来取值，仅限于 example
	 * 单文件上传 取data， data[0];多文件直接返回data
	 * 如果设置了 upload_receive_key ， 则会判定data不存在，会在顶级结构取该属性， 取不到则会取 data[upload_receive_key]
	 * @example `
	 * 	{
	 * 	    data: "https://.../demo.png",
	 * 	    // or
	 * 	    data: ["https://.../demo.png"]
	 * 	}
	 * `
	 */
	upload_receive_key?: string;
    /**
     * 错误弹窗体方法
     */
    toast?: null | ToastType;
	/**
	 * 报错时是否调用toast
	 */
	show_toast?: boolean;
	/**
	 * 接口请求时是否开启loading, 仅适用与uniapp环境下
	 */
	show_loading?: boolean
	loading?: null | LoadingType;
	closeLoading: null | CloseLoadingType
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确， 否则赋值 [ok：false]
     */
    code_key?: string
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确，依赖为该值 默认为 1
     */
    code_value?: string | number
    /**
     * 默认错误信息
     */
    default_error_msg?: string
	/**
	 * http 请求拦截器， 在这里可设置自定义操作
	 * @param type 拦截到的类型
	 * @param data 可修改的源数据， return data 即修改完成
	 *
	 * @example `
	 *	HttpConfig.interceptor = (type, data) => {
	 *
	 *	    switch (type) {
	 *	    	// 入参
	 *	        case "data":
	 *	        	break;
	 *	        // 出参
	 *	        case "response":
	 *	        	break;
	 *
	 *	    }
	 *	    return data
	 *	}
	 * `
	 */
	interceptor?: InterceptorType | null
    /**
     * 设置默认配置
     * @param params { IHttpConfig }
     */
    setConfig?: (params: IHttpConfig) => void

}
export class HttpConfig {
    /**
     * 请求的URL
     */
    static base_url: string = Config.request_url;
    /**
     * 超时时间
     */
    static timeout: number = Config.request_timeout;
	static content_type: string = "application/json";
    /**
     * 默认方法
     */
    static default_method: Method = Config.request_method;
    /**
     * 获取token函数吗未设置则取 Storage.get(AxiosConfig.token_key)
     */
    static getToken: null | (() => string) = null
	static token_type: string = "Bearer"
    /**
     * 获取Token的Key， 默认使用的是  import {Storage} from "ipink-util";Storage.get
     */
    static token_key: string = Config.token_key
    /**
     * 外部传入的axios包, uniapp 环境下使用 request；js环境下使用 http
     */
    static axios: any | null = Config.axios
    /**
     * 请求前缀
     */
    static api_prefix: string = Config.api_prefix;
    /**
     * 上传请求前缀
     */
    static upload_prefix: string = HttpConfig.api_prefix;
	/**
	 * 文件上传成功后用来取值，仅限于 example
	 * 单文件上传 取data， data[0];多文件直接返回data
	 * 如果设置了 upload_receive_key ， 则会判定data不存在，会在顶级结构取该属性， 取不到则会取 data[upload_receive_key]
	 * @example `
	 * 	{
	 * 	    data: "https://.../demo.png",
	 * 	    // or
	 * 	    data: ["https://.../demo.png"]
	 * 	}
	 * `
	 */
	static upload_receive_key: string = "";
	/**
	 * 文件上传后后段接收的 key
	 */
	static upload_key?: string = "file"
    /**
     * 错误弹窗体方法
     */
    static toast: null | ((title: string | IToast) => void) = null;
	/**
	 * 报错时是否调用toast
	 */
	static show_toast = false

	/**
	 * 接口请求时是否开启loading, 仅适用与uniapp环境下
	 */
	static show_loading = false
	static loading: null | LoadingType  = null;
	static closeLoading: null | CloseLoadingType = null;
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确， 否则赋值 [ok：false]
     */
    static code_key: string = "code"
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确，依赖为该值 默认为 1
     */
    static code_value: string | number = 1
    /**
     * 默认错误信息
     */
    static default_error_msg: string = "数据响应失败！"

	/**
	 * http 请求拦截器， 在这里可设置自定义操作
	 * @param type 拦截到的类型
	 * @param data 可修改的源数据， return data 即修改完成
	 *
	 * @example `
	 *	HttpConfig.interceptor = (type, data) => {
	 *
	 *	    switch (type) {
	 *	    	// 请求前，对配置和入参做一些处理
	 *	        case "BeforeRequest":
	 *	    	// 执行中， data为RequestTask， 可执行 RequestTask.abort() 终止请求
	 *	        case "ExecRequest":
	 *	        	typeof data = { abort: () => void }
	 *	        	break;
	 *	    	// 请求完成，对出参做一些处理， 例如： 整体出参揭秘等
	 *	        case "AfterRequest":
	 *	        	break;
	 *	    	// upload 方法，选择文件后对选择的文件做一些处理；虽然该函数提供 choosedCallback：() => boolean 入参函数
	 *	        case "ChoosedFile":
	 *	        	break;
	 *	    	// UploadFile | UploadMoreFile 方法，对上传完成后的数据进行一些处理
	 *	        case "UploadFiled":
	 *	        	break;
	 *
	 *
	 *
	 *	    }
	 *	    return data
	 *	}
	 * `
	 */
	static interceptor: null |  InterceptorType = null
    /**
     * 设置默认配置
     * @param params { IHttpConfig }
     */
    static setConfig(params: IHttpConfig): void {
        Object.keys(params || {}).forEach((key: string) => {
            // @ts-ignore
            AxiosConfig[key] = params[key]
        })
    }
}

/**
 * 拦截器内部盼盼是否存在，存在即调用调用
 * @param type
 * @param data
 */
export function interceptor(type: string, data: any) {
    if(typeof HttpConfig.interceptor === "function") {
        return HttpConfig.interceptor(type, data);
    }
    return data;
}

// @ts-ignore
export const sdk: Uni = "undefined" != typeof uni ? uni : "undefined" != typeof wx ? wx : "undefined" != typeof my ? my : "undefined" != typeof qq ? qq : "undefined" != typeof swan ? swan : null; // uni | wx | qq | my
// @ts-ignore
export const win: Window = "undefined" != typeof window ? window : "undefined" != this ? this : "undefined" != self ? self : null; // window | self | this

