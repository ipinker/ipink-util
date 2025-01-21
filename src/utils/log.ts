import { isNumber, isString } from "./is"

type ColorMap = {
	success ?: string,
	warning ?: string,
	error ?: string,
	info ?: string,
	primary ?: string,
	img ?: string
}
type TitleMap = {
	success ?: string,
	warning ?: string,
	error ?: string,
	info ?: string,
	primary ?: string,
	img ?: string
}
/**
 * 打印扩展配置
 */
interface PrintOption {		
	// 打印主题色
	color?: string, 
	// 设置打印的标题
	title?: string
	// 只会在每行的开头配置标志色块
	block?: boolean
}
export interface ILogConfig {
	/**
	 * 配置五种打印的配色
	 */
	colorMap ?: ColorMap,
	/**
	 * 1. 是否取第一个入参作为标题, 默认false, 但可以通过[3]实现
	 * 2. 如果开启了此项, 且如果入参只有一个成员, 则同等于未开启此项, 但可以通过[3]实现
	 * 3. 可以使用  log.title("标题").info("info message") 设置title
	 */
	hasTitle ?: boolean,
	/**
	 * 配置五种打印的默认标题
	 */
	titleMap ?: TitleMap
	// 只会在每行的开头配置标志色块, 或者 log.block().info()
	block?: boolean
}
/**
 * 
 * 带颜色的醒目打印 Log
 * @example
 * `
	import { log, Log } from "ipink-util"
	// Use log instance
	log.info("呵呵") // "呵呵"
	log.title("标题").info("Info message!") // 标题 Info message!
	// 给全局log加上默认标题, 或者首个字符串为标题
	log.setOption({ hasTitle: true })
	log.info("呵呵") // Info 呵呵
	log.info("标题", "呵呵") // 标题 呵呵
	log.info("标题", {})  // 标题 {}
	log.title().info("标题", "呵呵")
	log.error("标题", "呵呵")
	log.warning("标题", "呵呵")
	log.success("标题", "呵呵")
	log.primary("标题", "呵呵")
	// Use Log class 
	var logInstance = new Log({ hasTitle: true });
	logInstance.info("呵呵") // Info 呵呵
 `
 */
export class Log {
		static instance: Log | null = null;
		/**
		 * 通过该函数获取实例, 可以保证实例一直存在, 且配置一直是最新的.
		 * @param option { ILogConfig }
		 */
		static getInstance(options?: ILogConfig) {
			// 未获取到实例则重新创建;
			if(!Log.instance) {
				Log.instance = new Log(options)
			}
			// 获取到实例则初始化options, 保持配置最新
			else {
				Log.instance.setOption(options)
			}
			return Log.instance;
		}
		colorMap: ColorMap = {
			success: "#67c23a",
			warning: "#e6a23c",
			error: "#f56c6c",
			// info: "#909399",
			info: "#999935",
			primary: "#409EFF",
			img: "#409EFF"
		}
		titleMap = {
			success: "Success",
			warning: "Warning",
			error: "Error",
			info: "Info",
			primary: "Primary",
			img: ""
		}
		hasTitle: boolean = false;
		useBlock: boolean = false;
		constructor(options?: ILogConfig) {
		    this.setOption(options);
		}
		/**
		 * 同步配置信息
		 */
		setOption(options?: ILogConfig) {
			if(!options) return ;
			
		    if(options.colorMap){
				this.colorMap = Object.assign(this.colorMap, options.colorMap);
			}
			
		    if(options.titleMap){
				this.titleMap = Object.assign(this.titleMap, options.titleMap);
			}
			
			if("hasTitle" in options) this.hasTitle = options.hasTitle || false;
			if("block" in options) this.useBlock = options.block || false;
			
		}
		img(url: string, scale = 1) {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				const dom = document.createElement('canvas');
				const ctx = dom.getContext('2d');
				if (ctx) {
					dom.width = img.width, dom.height = img.height;
					ctx.fillStyle = 'red';
					ctx.fillRect(0, 0, dom.width, dom.height);
					ctx.drawImage(img, 0, 0);
					const base64 = dom.toDataURL('image/png');
					let title = this.printTitle || ""
					let content = `${title ? '%c ' + title : ""} %c sup?`
					let arr = [content]
					if(title) arr.push(`background:${this.colorMap.img}; border:1px solid ${this.colorMap.img}; padding: 2px; border-radius: 2px 0 0 2px; color: #fff;line-height: 16px;`)
					arr.push(`font-size: 1px;padding: ${Math.floor((img.height * scale) / 2)}px ${Math.floor((img.width * scale) / 2)}px;background-image: url(${base64});background-repeat: no-repeat;background-size: ${img.width * scale}px ${img.height * scale}px;color: transparent;
						`)
					console.log(... arr);
				}
				this.printTitle = "";
			};
			img.src = url;
		}
		
		printTitle: string = "";
		title(title?: string) {
			this.printTitle = title || "";
			return this;
		}
		
		extMessage: string = "";
		ext(extMessage?: string) {
			this.extMessage = extMessage || "";
			return this;
		}
		/**
		 * 打印函数
		 * 针对于args成员取餐规则
		 * @param args { any[] }
		 */
		printf(args: any[], options?: PrintOption) {
			const {
				color, title, block = this.useOnceBlock || this.useBlock
			} = options || {};
			let arr: any[] = [];
			if(!block){
				let printTitle = title || (this.hasTitle ? (args.length > 1 && (isString(args[0]) || isNumber(args[0])) ? args.splice(0, 1) : this.titleMap.info) : "")
				let content = (isString(args[0]) || isNumber(args[0])) ? args.splice(0, 1) : ""
				let str = ""
				if(printTitle) str += `%c ${printTitle || ""} `
				if(content) str += `%c ${content} `
				if(this.extMessage) str += `%c ${this.extMessage} `
				str += "%c "
				arr.push(str)
				if(printTitle) arr.push(`background:${color}; border:1px solid ${color}; padding: 2px; border-radius: 2px 0 0 2px; color: #fff;line-height: 16px; font-weight: bold;`)
				if(content) arr.push(`border:1px solid ${color}; padding: 2px; border-radius: 0 ${this.extMessage ? "0 0" : "2px 2px"} 0; color: ${color};line-height: 16px;`)
				if(this.extMessage) arr.push(`background:${color}; border:1px solid ${color}; padding: 2px; border-radius: 0 2px 2px 0; color: #fff;line-height: 16px;`)
				arr.push('background:transparent')
				arr = arr.concat(args);
			}
			else {
				arr = ["%c \u00A0", `font-size: 3px;line-height: 18px; padding: 2px; border-radius: 8px 0 0 8px; background-color: ${color}`, ... args]
			}
			console.log(... arr);
			this.extMessage = this.printTitle = "";
			this.useOnceBlock = false;
		}
		/**
		 * 打印info信息
		 * @param title { string }
		 * @param args { string | string[] }
		 */
		info (... args: any[]){
			this.printf(args, { color: this.colorMap.info, title: this.printTitle} );
		}
		
		success (... args: any[]){
			this.printf(args, { color: this.colorMap.info, title: this.printTitle });
		}
		
		warning (... args: any[]){
			this.printf(args, { color: this.colorMap.info, title: this.printTitle });
		}
		
		error (... args: any[]){
			this.printf(args, { color: this.colorMap.info, title: this.printTitle });
		}
		
		primary (... args: any[]){
			this.printf(args, { color: this.colorMap.info, title: this.printTitle });
		}
		
		/**
		 * 设置title, 使用log.title("Title").color("Content", "red")
		 */
		color(content: string, color = this.colorMap.primary) {
			this.printf([content], { color, title: this.printTitle });
		}
		useOnceBlock = false;
		block() {
			this.useOnceBlock = true;
			return this;
		}
		
	}

// https://github.com/pangxieju/consoleshow/blob/master/index.js
export const log = new Log();