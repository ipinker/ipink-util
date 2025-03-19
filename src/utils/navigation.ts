import {ENV_TYPE, EnvVal, getEnv} from "./env";
import {getSdk, win} from "./config";
import {showModal} from "./toast";
import {parseQuery} from "./url";

type VersionKey = "release" | "develop" | "trial"
type VersionVal = 0 | 1 | 2
const transformEnv = (env: VersionKey): VersionVal => {
	const envMap: { [propName: string]: VersionVal }  = {
		"release": 0,
		"develop": 1,
		"trial": 2
	}
	return envMap[env as string] || 0
}
// 拼接参数
const transformData = (obj: AnyObject): string => {
	let arr: string[] = [];
	Object.keys(obj).forEach(v => {
		if (v == '_globalData') return
		arr.push(`${v}=${obj[v]}`)
	})
	if (arr.length) {
		return arr.join('&')
	} else {
		return ''
	}
}
export const genJumpUrl = (pageUrl = '', params: AnyObject): string => {
	if (!params) {
		params = {}
	}
	let paramsStr = transformData(params)
	if (!paramsStr) return pageUrl
	return `${pageUrl}${pageUrl.indexOf('?') > -1 ? '&':'?'}${paramsStr}`
}

export interface JumpAppOption {
    /**
     * 微信用
     */
    wxAppId?: string,
    wxPageUrl?: string,
    wxPageUrlParam?: any,

    /**
     * 支付宝用
     */
    alipayAppId?: string,
    alipayPageUrl?: string,
    alipayPageUrlParam?: any,

    /**
     * 通用
     */
    /**
     * h5唤起app使用的是 URL Scheme，
     * @example `
     *  `${appName}:/${path}?${stringifyQuery(pageUrlParam)}`
     * `
     */
    appName?: string,
    appId?: string,
    path?: string,
    pageUrlParam?:AnyObject,
    extraData?: AnyObject,

    /**
     * 回调
     */
    success?: Function,
    fail?: Function,

    /**
     * 跳转弹框
     */
    useModal?: boolean,
    dialogOption?: AnyObject,

    /**
     * 跳转版本
     */
    version?: VersionKey
}
export const navigateToMiniProgram = async (params: JumpAppOption) => {
	const {
		wxAppId,
		wxPageUrl,
		wxPageUrlParam = {},

		alipayAppId,
		alipayPageUrl,
		alipayPageUrlParam = {},

		appName,

		appId,
		path,
		pageUrlParam = {},

		extraData = {},
		success,
		fail,
		useModal = true,

		dialogOption,
		version
	} = params
	if (!params.wxAppId) params.wxAppId = appId
	if (!params.wxPageUrl) params.wxPageUrl = path
	if (!params.wxPageUrlParam) params.wxPageUrlParam = pageUrlParam
	if (!params.alipayAppId) params.alipayAppId = appId
	if (!params.alipayPageUrl) params.alipayPageUrl = path
	if (!params.alipayPageUrlParam) params.alipayPageUrlParam = pageUrlParam
	// #ifdef H5
	const env = getEnv()
	if (!appName && (env === ENV_TYPE.WX || env === ENV_TYPE.APP))  return;
    // @ts-ignore
	if(win && typeof document !== "undefined" &&  env === ENV_TYPE.APP && win.iapp) {
		const miniUrl = genJumpUrl(wxPageUrl, wxPageUrlParam)
        // @ts-ignore
		iapp.launchMiniProgram({
			options: {
				id: appName,
				path: path || miniUrl,
				type: transformEnv(version as VersionKey)
			}
		})
		return
	}
    if(win && win.location){
        win.location.href = `${appName}:/${genJumpUrl(wxPageUrl, pageUrlParam)}`
        return;
    }

	// #endif

    let sdk = getSdk();
	// #ifdef APP
    if(sdk && typeof plus !== "undefined") {
        if(useModal) {
            const res = await showModal({
                title: `即将打开${ appName ? `"${appName}"`:'其他'}应用`,
                cancelText: '取消',
                confirmText: '允许',
                ... (dialogOption || {})
            })
            if(!res) return
        }
        const miniUrl = genJumpUrl(path, pageUrlParam)
        launchAppProgram({
            id: appName || "",
            path: path || miniUrl,
            type: transformEnv(version as VersionKey)
        })
    }
	// #endif


	//#ifdef MP-ALIPAY
    if(sdk && typeof my !== "undefined"){
        var url = genJumpUrl(params.alipayPageUrl, alipayPageUrlParam)
        let queryStr = alipayPageUrlParam._globalData || ""
        let globalData: AnyObject = {}
        if (queryStr) {
            globalData = parseQuery(decodeURIComponent(queryStr || ''))
        }
        my.navigateToMiniProgram({
            appId: appId || alipayAppId || "",
            path: path || url,
            // @ts-ignore
            query: globalData,
            extraData,
            success: (res) => {
                success && success(res)
            },
            fail: (res) => {
                fail && fail()
            }
        });
    }
	//#endif

	//#ifdef MP-WEIXIN
    if(sdk && typeof wx !== "undefined"){

        var url = genJumpUrl(params.wxPageUrl, wxPageUrlParam)
        if (!useModal) {
            wxNavigateToMiniProgram(appId || wxAppId || "", path || url, extraData, success, fail)
            return
        }
        showModal({
            title: `即将打开${ appName ? appName : '其他' }小程序`,
            showCancel: true,
            cancelText: "取消",
            confirmText: "确定",
            ... dialogOption,
            success(r) {
                if (r.cancel) {
                    fail && fail()
                } else {
                    wxNavigateToMiniProgram(appId || wxAppId || "", path || url, extraData, success, fail)
                }
                dialogOption?.success && dialogOption.success();
            },
            fail: () => {
                dialogOption?.fail && dialogOption.fail();
            }
        })
    }
	//#endif
}

function wxNavigateToMiniProgram (appId: string, path: string, extraData?: AnyObject, success?: Function, fail?: Function, version = "release") {
    let sdk = getSdk();
    let params = {
		appId: appId,
		path: path,
		extraData: extraData,
		version,
		success(res: any) {
			success && success(res)
		},
		fail(res: any) {
			fail && fail()
		}
	}
	if(sdk){
        typeof uni !== "undefined" ? uni.navigateToMiniProgram(params) : wx.navigateToMiniProgram(params)
    }
}


interface ILaunchAppProgramOption {
    id: string,
    path: string,
    type?: VersionVal,
    miniProgramType?: "WX" | "MY",
    [propName: string]: any,
}

function launchAppProgram (options: ILaunchAppProgramOption) {
	const enumMiniProgramType = {
		WX: 'weixin',
		MY: 'my'
	}
    const miniProgramType = options.miniProgramType || enumMiniProgramType.WX
	plus.share.getServices((arr = []) => {
		const weixinShare = arr.find(v => v.id == miniProgramType)
		if (weixinShare && miniProgramType == enumMiniProgramType.WX) {
            // @ts-ignore
			weixinShare.launchMiniProgram({id: options.id, type: options.type, path: options.path, ...options});
		}
	}, (e) => {
		console.log("获取分享服务失败： " + JSON.stringify(e))
	});
}
