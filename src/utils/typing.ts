
export declare type Method =
    | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'
    | 'purge' | 'PURGE'
    | 'link' | 'LINK'
    | 'unlink' | 'UNLINK';

export declare type ResponseType =
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream';

export declare type responseEncoding =
    | 'ascii' | 'ASCII'
    | 'ansi' | 'ANSI'
    | 'binary' | 'BINARY'
    | 'base64' | 'BASE64'
    | 'base64url' | 'BASE64URL'
    | 'hex' | 'HEX'
    | 'latin1' | 'LATIN1'
    | 'ucs-2' | 'UCS-2'
    | 'ucs2' | 'UCS2'
    | 'utf-8' | 'UTF-8'
    | 'utf8' | 'UTF8'
    | 'utf16le' | 'UTF16LE';


export declare type CommonRequestHeadersList = 'Accept' | 'Content-Length' | 'User-Agent' | 'Content-Encoding' | 'Authorization';

export declare type ContentType =
    'text/html'
    | 'text/plain'
    | 'multipart/form-data'
    | 'application/json'
    | 'application/x-www-form-urlencoded'
    | 'application/octet-stream'
    | string;

export declare type CommonResponseHeadersList = 'Server' | 'Content-Type' | 'Content-Length' | 'Cache-Control' | 'Content-Encoding';

export interface RawAxiosHeaders {
    [key: string]: any;
}

export type RawAxiosRequestHeaders = Partial<RawAxiosHeaders & {
    [Key in CommonRequestHeadersList]: any;
} & {
    'Content-Type': ContentType
}>;
export type RawCommonResponseHeaders = {
    [Key in CommonResponseHeadersList]: any;
} & {
    "set-cookie": string[];
};

export type RawAxiosResponseHeaders = Partial<RawAxiosHeaders & RawCommonResponseHeaders>;
export type MethodsHeaders = Partial<{
    [Key in Method as Lowercase<Key>]: any;
} & { common: any }>;

export interface GenericAbortSignal {
    readonly aborted: boolean;
    onabort?: ((...args: any) => any) | null;
    addEventListener?: (...args: any) => any;
    removeEventListener?: (...args: any) => any;
}

export interface TransitionalOptions {
    silentJSONParsing?: boolean;
    forcedJSONParsing?: boolean;
    clarifyTimeoutError?: boolean;
}

export interface Cancel {
    message: string | undefined;
}

export interface CancelToken {
    promise: Promise<Cancel>;
    reason?: Cancel;

    throwIfRequested(): void;
}

export interface AxiosBasicCredentials {
    username: string;
    password: string;
}

export interface AxiosProxyConfig {
    host: string;
    port: number;
    auth?: AxiosBasicCredentials;
    protocol?: string;
}

export enum HttpStatusCode {
    Continue = 100,
    SwitchingProtocols = 101,
    Processing = 102,
    EarlyHints = 103,
    Ok = 200,
    Created = 201,
    Accepted = 202,
    NonAuthoritativeInformation = 203,
    NoContent = 204,
    ResetContent = 205,
    PartialContent = 206,
    MultiStatus = 207,
    AlreadyReported = 208,
    ImUsed = 226,
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    SeeOther = 303,
    NotModified = 304,
    UseProxy = 305,
    Unused = 306,
    TemporaryRedirect = 307,
    PermanentRedirect = 308,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    ProxyAuthenticationRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    PayloadTooLarge = 413,
    UriTooLong = 414,
    UnsupportedMediaType = 415,
    RangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    ImATeapot = 418,
    MisdirectedRequest = 421,
    UnprocessableEntity = 422,
    Locked = 423,
    FailedDependency = 424,
    TooEarly = 425,
    UpgradeRequired = 426,
    PreconditionRequired = 428,
    TooManyRequests = 429,
    RequestHeaderFieldsTooLarge = 431,
    UnavailableForLegalReasons = 451,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HttpVersionNotSupported = 505,
    VariantAlsoNegotiates = 506,
    InsufficientStorage = 507,
    LoopDetected = 508,
    NotExtended = 510,
    NetworkAuthenticationRequired = 511,
}

export type BrowserProgressEvent = any;

/**
 * 内置相应类型
 */
export declare interface IResponse<T> extends AnyObject {
    ok?: boolean
    code?: number | string
    data?: T
    msg: string | null
    err?: IErrorResponse
}

/**
 * Uni http 响应的response类型，
 */
export declare interface IBaseResponse <K> {
    data: K,
    statusCode: number,
    header: RawAxiosResponseHeaders | MethodsHeaders & Headers,
    cookies: string[]
}
export declare interface IErrorResponse {
    errCode: string
    errMsg: string
    errSubject?: string
    cause?: string
    data?: string
}
export declare interface IUploadResponse extends IResponse<string | AnyObject> {
    local?: string
}
export declare interface IUploadMoreResponse extends IResponse<string[] | AnyObject[]> {
    local?: string[]
}
export type LoadingType = (title: string | WechatMiniprogram.ShowLoadingOption) => any
export type CloseLoadingType = () => any
export type ToastType = (title: string | UniNamespace.ShowToastOptions) => void

export type InterceptorTypeEnum =
    | "BeforeRequest"
    | "ExecRequest"
    | "AfterRequest"
    | "AfterChooseFile"
    | "BeforeUpload"
    | "ExecUpload"
    | "AfterUpload"
    | "401"
    | "403"
    | "404"
    | "408"
    | "500"
    | "501"
    | "502"
    | "508"
    | string
/**
     * http 请求拦截器， 在这里可设置自定义操作
     * @param type { InterceptorTypeEnum } 拦截到的类型
     * @param data { any } 可修改的源数据， return data 即修改完成
     *
     * @example `
     *    HttpConfig.interceptor = (type: InterceptorTypeEnum, data: any) => {
     *
     *        switch (type) {
     *            // 请求前，对配置和入参做一些处理
     *            case "BeforeRequest":
     *            // 执行中， data为RequestTask， 可执行 RequestTask.abort() 终止请求
     *            case "ExecRequest":
     *                typeof data = { abort: () => void }
     *                break;
     *            // 请求完成，对出参做一些处理， 例如： 整体出参揭秘等
     *            case "AfterRequest":
     *                break;
     *            // upload 方法，选择文件后对选择的文件做一些处理；虽然该函数提供 choosedCallback：() => boolean 入参函数
     *            case "AfterChooseFile":
     *                break;
     *            // 调用UploadFile前，对配置和入参做一些处理
     *            case "BeforeUpload":
     *                break;
	 *			  // 调用UploadFile时, 对请求进行管理
     *            case "ExecUpload":
	 *				  typeof data = {
	 *					abort: () => void
	 *					onProgressUpdate: ({progress: number, totalBytesSent: number, totalBytesExpectedToSend: number}) => {} // 监听上传进度变化
	 *					onHeadersReceived // 仅微信小程序平台支持, 见官方文档
	 *					offProgressUpdate // 仅微信小程序平台支持, 见官方文档
	 *					offHeadersReceived // 仅微信小程序平台支持, 见官方文档
	 *				  }
     *                break;
     *            // UploadFile | UploadMoreFile 方法，对上传完成后的数据进行一些处理
     *            case "AfterUpload":
     *                break;
     *
     *
     *        }
     *        return data
     *    }
     * `
     */
export type InterceptorType = (type: InterceptorTypeEnum, data: any) => any

export type IfUnknown<T, K> = unknown extends T ? (T extends unknown ? K : T) : T;
