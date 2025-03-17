import {Storage} from "./cache";
import {Config, getSdk} from "./config";
import ShowModalOptions = UniNamespace.ShowModalOptions;
import ShowToastOption = WechatMiniprogram.ShowToastOption;


export const htmlToast = (content: string, duration = 3000, complete?: Function, mask?: boolean, success?: Function, fail?: Function) => {
	let errMsg = {

	}
	try{
		if(typeof document == "undefined" || !document.createElement) {
			errMsg = {
				errMsg: "不支持【document】对象！"
			}
			fail && fail(errMsg);
			complete && complete(errMsg);
		}
		if(mask){
			stopTouchEvent();
		}
		const toastStyle = `
			.toast_container { }
			.toast-box { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 99998; text-align: center;  animation: toast-fadein 3s forwards; -webkit-animation: toast-fadein 3s forwards; background: rgba(17,17,17,.8); font-size: calc(100vw / 750); max-width: 85vw; white-space:normal;  padding: 10px 15px; border-radius: 5px; box-sizing:content-box; line-height: calc(100vw / 750 * 42px); }
			.toast-content { padding: 0; font-size: 28em !important; overflow: hidden; position: relative; color: #ffffff; word-break: break-all; }
			@keyframes toast-fadein { 0% {opacity: 0.1;} 10% {opacity: 1;} 30% { opacity: 1; } 60% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }
		`
		// 创建style标签
		const style = document.createElement('style');
		// 设置style属性
		style.type = 'text/css';
		style.id = "toast-style";
		// 将 keyframes样式写入style内
		style.innerHTML = toastStyle;
		var toastBox = document.querySelector("div.toast-box");
    	let sdk = getSdk();
		if (!toastBox) {
			var toast_container = document.createElement("div"); //父节点
			toast_container.className = "toast_container"; //classname
			var toast_div = document.createElement("div"); //父节点
			// 将style样式存放到box标签
			toast_container.appendChild(style);
			toast_container.appendChild(toast_div);
			toast_div.className = "toast-box"; //classname
			toast_div.style.cssText = `animation-duration: ${duration/ 1000}s;`;
			var alert_p = document.createElement("p");
			alert_p.className = "toast-content";
			alert_p.innerHTML = content;
			toast_div.appendChild(alert_p);
			((document.getElementsByTagName("uni-app") && document.getElementsByTagName("uni-app")[0]) || document.body).appendChild(toast_container);
			let timeId = setTimeout(function() {
				clearTimeout(timeId);
				removeChild();
				complete && complete();
				success && success();
			}, duration);
			sdk?.addInterceptor && sdk.addInterceptor('navigateTo', {
				success(e) {
					clearTimeout(timeId);
					removeChild();
				}
			})
			sdk?.addInterceptor && sdk.addInterceptor('navigateBack', {
				success(e) {
					clearTimeout(timeId);
					removeChild();
				}
			})


		}
		function removeChild() {
			let target: Element = document.getElementsByClassName("toast_container") && document.getElementsByClassName("toast_container")[0];
			if(target){
				target.parentElement!.removeChild(target);
				if(mask){
					startTouchEvent();
				}
			}
		}
		function touchDefault(e: any) {
			e.stopPropagation();
			e.preventDefault();
		}
		function stopTouchEvent() {
			document.addEventListener('touchstart', touchDefault, false);
			document.addEventListener('touchmove', touchDefault, false);
			document.addEventListener('touchend', touchDefault, false);
		}
		function startTouchEvent() {
			document.removeEventListener('touchstart', touchDefault, false);
			document.removeEventListener('touchmove', touchDefault, false);
			document.removeEventListener('touchend', touchDefault, false);
		}
	}catch(e){
		fail && fail(e);
		complete && complete(e);
	}
}

export interface IToast {
	/**  @desc 标题  **/
	title?: string,
	/**  @desc 图标  **/
	icon?: "success" | "error" |"fail" | "exception" | "loading" | "none",
	/**  @desc 是否允许穿透  **/
	mask?: boolean,
	/**  @desc 持续时间  **/
	duration?: number,
	/**  @desc 无论成功还是失败回调  **/
	complete?: Function,
	/**  @desc 成功回调  **/
	success?: Function,
	/**  @desc 失败回调  **/
	fail?: Function,
}
export const toast = (options: IToast | string) => {
	let {
		title = "",
		icon="none",
		mask=false,
		duration = Config.toast_duration,
		complete,
		success,
		fail,
		...args
	} = (options || {}) as IToast;
	if(typeof options === "string"){
		title = options;
	}
	if(!title) return "";
	// @ts-ignore
	if(Config.use_inner_toast && typeof document !== "undefined" && document.createElement) {
		return htmlToast(title, duration, complete, mask, success, fail);
	}
	let sdk = getSdk();
	if(sdk) sdk.showToast({
		title,
		icon,
		mask,
		duration,
		success,
		fail,
		...args,
		complete
	} as ShowToastOption)
	else {
		let errMsg = {
			errMsg: "不支持【document】对象！"
		}
		fail && fail(errMsg);
		complete && complete(errMsg);
	}
}

export const showModal = (options: ShowModalOptions): Promise<boolean> => {
	return new Promise(resolve =>{

    	let sdk = getSdk();
		if(sdk){
			uni.showModal({
				... (options || {}),
				success: (e: any) => {
					options?.success && options.success(e)
					resolve(true);
				},
				fail: (e: any) => {
					options?.fail && options.fail(e)
					resolve(false);
				}
			})
		}
		else {
			resolve(true);
		}
	});
}
