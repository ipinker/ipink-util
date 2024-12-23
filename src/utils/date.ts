/**
 * 日期工具类
 * @Author: Gavin New
 * @Create: 2024/02/27 13:48
 */
import {isDate, isNumber, isNaN, isString} from "./is";

export interface DateInfo {
    currentTime?: string | number
    year?: string | number
    month?: string | number
    day?: string | number
    week?: string | number
    weekNew?: string | number
    hour?: string | number
    minute?: string | number
    second?: string | number
    milliSecond?: string | number
    time?: number | string
    ymd?: string
    md?: string
}
/** @desc 日期对象， 日期字符串 ｜ 日期时间戳 **/
export type DateValue = Date | string | number;
export type LangValue = "zh-Hant" | "zh-Hans" | "en";
export type NumberValue = string | number;
/**
 * 将目标转成 「Date」对象
 * @param: target { any }
 * @return:  {}
 */
export const parseDate = (target: unknown): Date | null => {
    if(isDate(target)) return target as Date;
    if(isNumber(target)) return new Date(target as number);
    if(isString(target)) {
        const timestamp: number = Date.parse(target as string);
        if(isNaN(timestamp)) return null;
        return new Date(timestamp);
    }
    return null;
}
/**
 * @desc 一个日期转换为 2020/02/02 ｜ 2020-02-02
 * @param time 日期字符或者时间戳 { string | number }
 * @return: 
 */
export const getDate = (
        time?: DateValue | undefined, type?: -1 | 0 | 1 | 2 | 3 | 4 | 5, s?: string
    ): DateInfo | string => {
    s = s || "/";
	let date: Date = new Date(); 
	if(isNumber(time)) date = new Date(time as number);
	else if(isString(time)){
        const _time = time as string;
		if( _time.indexOf("-") > -1) date = new Date(_time.split("-").join("/"));
		else date = new Date(time as string);
	} else if (isDate(time)) date = time as unknown as Date;
	let year: string = '' + date.getFullYear();
	let month: string = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1 + '';
	
	let day: string = date.getDate() < 10 ? "0" + date.getDate() : date.getDate() + '';
	let hour: string = date.getHours() < 10 ? '0' + date.getHours() : date.getHours() + '';
	let minute: string = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() + '';
	let second: string = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() + '';
	let milliSecond = date.getMilliseconds();
	let currentTime = year + s + month + s + day + ' ' + hour + ':' + minute + ":" + second;
	if(type == 1) return year + s + month + s + day;
	else if (type == 2) return hour + ':' + minute;
	else if (type == 3) return year + s + month;
	else if (type == 4) return year;
	else if (type == 5) return month + s + day;
	else if(type == -1){
		return {
			currentTime,
			year,
			month,
			day,
			hour,
			minute,
			second,
			milliSecond
		};
	}
	else return currentTime;
}
/**
 * @desc 获取最近多少周
 * @param weekCount 周的数量 { number }
 * @param split 日期分隔符 { number }
 * @return: [ string, string ]
 */
export const getRecentWeek = (
    weekCount: number = 0, split: string = '/'
    ): [ string, string ] => {
	const date: Date = new Date();
	let totalDayCount: number = weekCount * 7;
	let startDayCount: number = 7;
	let endDayCount: number = 13;
	let weekDate: Date = new Date(date.getTime() - 7 * 24 * 3600 * 1000);// 计算开始时间用
	let weekDate2: Date = new Date(date.getTime() - 7 * 24 * 3600 * 1000);// 计算结束时间用
	let day: number = weekDate.getDay();
	let time: number = weekDate.getDate() - day + (day===0?-6:1);
	let startDate: Date = new Date(weekDate.setDate(time + (startDayCount - totalDayCount)));
	let endDate: Date = new Date(weekDate2.setDate(time + (endDayCount - totalDayCount)));
	let startDay: number = startDate.getDate();
	let startMonth: number = startDate.getMonth()+1;
	let endDay: number = endDate.getDate();
	let endMonth: number = endDate.getMonth()+1;
	let start: string = startDate.getFullYear() + split + 
		(startMonth < 10 ? '0' + startMonth : startMonth) + split + 
		(startDay < 10 ? '0'+ startDay : startDay) + 
		' 00:00:00';
	const end: string = endDate.getFullYear() + split + 
		(endMonth < 10 ? '0' + endMonth : endMonth) + split + 
		(endDay < 10 ? '0' + endDay : endDay) +  
		" 23:59:59";
	return [start, end]
};
/**
 * @desc 获取最近多少月
 * @param monthCount 月数 { number }
 * @param split 日期分隔符 { number }
 * @param targetDate 开始日期（可选） { DateValue }
 * @return: [string, string]
 */
export const getRecentMonth = (
    monthCount: number = 0, split: string = '/', targetDate?: DateValue
    ): [string, string] => {
    if(isString(targetDate)) targetDate = (targetDate as string).split("-").join("/");
	const date = targetDate ? new Date(targetDate) : new Date();

	date.setMonth(date.getMonth() - monthCount);
	let y: number = date.getFullYear();
	let m: number | string = date.getMonth() + 1;
	date.setMonth(date.getMonth() + 1);
	date.setDate(0);
	let d: number | string = date.getDate();
	m = m < 10 ? "0" + m : m;
	d = d < 10 ? "0" + d : d;
	let start = y + split + m + split + "01 00:00:00";
	let end = y + split + m + split + d + " 23:59:59";
	return [start, end];
};

/**
 * @desc 获取最近多少年
 * @param yearCount 年数 { number }
 * @param split 日期分隔符 { number }
 * @param targetDate 开始日期（可选） { DateValue }
 * @return: [string, string]
 */
export const getRecentYear = (
    yearCount: number = 0, split: string = '/', targetDate?: DateValue
    ) => {
    if(isString(targetDate)) targetDate = (targetDate as string).split("-").join("/");
	const date = targetDate ? new Date(targetDate) : new Date();
	let y = date.getFullYear() - yearCount;
	date.setMonth(12);
	date.setDate(0);
	let d = date.getDate();
	let start = y + split + "01" + split + "01 00:00:00";
	let end = y + split + "12" + split + d + " 23:59:59";
	return [start, end];
}
/**
 *  @desc 获取最近多少天
 *  @param dayCount 最近多少月， 过去 -> 未来 { number }
 *  @param split 返回的日期分隔符 { string }
 *  @param targetDate 开始日期（可选） { DateValue }
 *  @return (1) => ["2022-12-22", "2022-12-23"]
 */
export const getRecentDay = (
    dayCount: number = 1, split: string = '/', targetDate?: DateValue
    ) => {
    if(isString(targetDate)) targetDate = (targetDate as string).split("-").join("/");
	var d = targetDate ? new Date(targetDate) : new Date();
	d.setDate(d.getDate() + dayCount); //获取n天后的日期
	let yy = d.getFullYear();
	let mm = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
	let dd = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
	let day = yy + split + mm + split + dd;
	let today = getDate(void 0, 1);
	return [day, today].sort();
}
/**
 *  @desc 获取某天的具体信息
 *  @param day 目标日期（时间戳， 日期字符串， Date对象） { number | string | Date }
 *  @param split 返回的日期分隔符 { string }
 *  @return { DateInfo }
 */
export const getSomeday = (day: DateValue, split: string = "/"): DateInfo => {
    if(isString(day)) day = (day as string).split("-").join("/");
	let today = new Date(day);

	let tYear = today.getFullYear();
	let tMonth = formatNumber(today.getMonth() + 1);
	let tDate = formatNumber(today.getDate());
	let tWeek = today.getDay();
	let tTime = parseInt('' + (today.getTime() / 1000));
    let hour = formatNumber(today.getHours())
	let minute = formatNumber(today.getMinutes());
	let second = formatNumber(today.getSeconds())
	let milliSecond = today.getMilliseconds();

	const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

	function formatNumber(n: number | string) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}
	return {
		'time': tTime, // 时间戳
		'year': tYear,
		'month': tMonth,
		'day': tDate,
        hour,
        minute,
        second,
        milliSecond,
		'week': week[tWeek],
		"md": tMonth + split + tDate,
		"ymd": tYear + split + tMonth + split + tDate,
		"currentTime": tYear + split + tMonth + split + tDate + " " + hour + ":" + minute + ":" + second,
	};
}
/** 
  * 获取一个时间范围 
  * 
  * @param type 1：本周 | 2：获取上一周 | 3：获取本月 | 4：获取上月 | 5：获取今年的开始和结束时间 | 6：获取去年的开始和结束时间
  * @param sign 日期分隔符 /
  * @param count 最近多少天 优先使用这个
  * 
  * @return [start, end]
  * 
  */ 
export const getDateScoped = (
    type: 1 | 2 | 3 | 4 | 5 | 6, sign: string = "/", count: number = -1
    ): [ string, string ] => {
        let _now = getDate(void 0, 1, sign);
        let end = _now + " 23:59:49"
		, timestamp = Date.now()
		, date: Date = new Date()
		, start: string = _now + " 00:00:00";
	;
	if(count > 0){
		start = getDate(timestamp - (1000 * 60 * 60 * 24 * count), 1, sign) + " 00:00:00";
	}
	else {
		// 本周
		if(type == 1){
			const [ _start, _end ] = getRecentWeek(0, sign);
			start = _start;
			end = _end;
		}
		// 获取上一周
		else if(type == 2){
			const [ _start, _end ] = getRecentWeek(1, sign);
			start = _start;
			end = _end;
		}
		// 获取本月
		else if(type == 3) {
			let month: number | string = date.getMonth() + 1;
			if (month < 10) {
				month = '0'+month;
			}
			let year = date.getFullYear();
			start = year+sign+month+sign+'01 00:00:00';
		}
		// 获取上月
		else if(type == 4) {
			let year = date.getFullYear();
			let month: number | string = date.getMonth();
			if (month === 0) {
				month = 12;
				year = year-1;
			} else if (month < 10) {
				month = '0'+month;
			}
			let monthDate = new Date(year, +month, 0);
			start = year+sign+month+sign+'01 00:00:00';
			end = year+sign+month+sign+monthDate.getDate() +  " 23:59:59";
		}
		// 获取今年的开始和结束时间
		else if(type == 5) {
			var year = date.getFullYear();
			start = year+sign+'01'+sign+'01 00:00:00';
			end = year+sign+'12'+sign+'31 23:59:59';
		}
		// 获取去年的开始和结束时间
		else if(type == 6) {
			var year = date.getFullYear()-1;
			start = year+sign+'01'+sign+'01 00:00:00';
			end = year+sign+'12'+sign+'31 23:59:59';
		}
	}
	
	return [start, end];
};


/**
 * @desc 计算两个时间相差多少天
 * @param { String } target (feature)
 * @param { String } today or (old)
 */
export const getDaysBetween = (target: DateValue, current?: DateValue): number => {
    if(isString(target)) target = (target as string).split("-").join("/");
    if(current && isString(current)) current = (current as string).split("-").join("/");
	let startDate;
	if(Array.isArray(target)) target = target[0]
	if(typeof target == "string" && target.indexOf(" ") > -1) target = target.split(" ")[0]
	if (!target) return 0;
	try {
		current = getDate(current, 1) as string;
		startDate = new Date(current + " 00:00:00").getTime();
		let endDate = new Date(target + " 00:00:00").getTime();
		if (startDate == endDate) return 0;
		let days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000);
		return days;
	} catch (e) {
		return 0;
	}
};

/**
 *  @desc 获取周几
 *  @param date 目标日期 { DateValue ｜【0-6】 }
 *  @param lang 语言， 默认 zh-Han { "zh-Hant" | "en" | LangValue }
 *  @return ("2024-02-02") => "星期五", ("2024-02-02", 'en') => "Fri"
 */
export const getWeek = (date: DateValue, lang?: LangValue): string => {
	var day;
	if(typeof date == 'number' && date < 7) day = date;
	else {
        if(isString(date)) date = (date as string).split("-").join("/");
		day = new Date(date).getDay();
	}
	lang = lang || "zh-Hant";
	const weekLang = new Map([
		[0, "Sun"],
		[1, "Mon"],
		[2, "Tue"],
		[3, "Wed"],
		[4, "Thu"],
		[5, "Fri"],
		[6, "Sat"]
	]);
	var weeks = new Array(
		"周日", "周一", "周二", "周三", "周四", "周五", "周六"
	);
	var week: string = lang.startsWith("zh-Han") ? weeks[day] : weekLang.get(day) as string;
	return week;
}

type TransformDateOption = {
    date: DateValue
    type: 0 | 0.5 | 1 | 2 | 3 | 4 | 5
    sign: string
    lang: 'zh-Hant' | 'zh-Hans' | 'en'
}
/**
 *  @desc 输出中英文日期格式
 *  @param options.date 目标日期（日期字符串） { string }
 *  @param options.type 输出格式, 默认：4，Optional[0，1，2，3，4，5]【年月日， 年， 月， 日， 月日， 周 】 { string }
 *  @param options.sign 日期字符串的分隔符 { string }
 *  @param options.lang 语言 { LangValue : 'zh-Hant' | 'zh-Hans' | 'en' }
 *  @return ("2024-02-02") => "2024年2月2日", ("2024-02-02", 'en') => “Feb. 2nd, 2024”
 */
export const transformDate = (options : TransformDateOption): string => {
	let { date, type = 4, sign = "/", lang } = options;
	if (!date) return "";
    if(isString(date)) {
		const hasSign = (date as string).indexOf("-") > -1;
		date = (date as string).split(hasSign ? "-" : "/").join(sign);
	}
    else date = getDate(date, 1, sign) as string;
	lang = lang || "zh-Han";
	const monthLang = new Map([
		[1, "Jan."],
		[2, "Feb."],
		[3, "Mar."],
		[4, "Apr."],
		[5, "May."],
		[6, "Jun."],
		[7, "Jul."],
		[8, "Aug."],
		[9, "Sept."],
		[10, "Oct."],
		[11, "Nov."],
		[12, "Dec."],
	]);
	const dayLang = new Map([
		[1, "1st"],
		[2, "2nd"],
		[3, "3rd"],
		[4, "4th"],
		[5, "5th"],
		[6, " 6th"],
		[7, "7th"],
		[8, "8th"],
		[9, "9th"],
		[10, "10th"],
		[11, "11th"],
		[12, "12th"],
		[13, "13th"],
		[14, "14th"],
		[15, "15th"],
		[16, "16th"],
		[17, "17th"],
		[18, "18th"],
		[19, "19th"],
		[20, "20th"],
		[21, "21st"],
		[22, "22nd"],
		[23, "23rd"],
		[24, "24th"],
		[25, "25th"],
		[26, "26th"],
		[27, "27th"],
		[28, "28th"],
		[29, "29th"],
		[30, "30th"],
		[31, "31st"]
	]);

	// 0年月日 0.5年月  1年  2月 3日 4月日 5周 
	let str = "";
	let strArr = date.split(sign).map(item => Number(item));
	try {
		if (!type) {
			str = (
				lang.startsWith('zh-Han') ? strArr[0] + "年" + strArr[1] + "月" + strArr[2] + "日" :
					monthLang.get(strArr[1]) + " " + strArr[2] + ", " + strArr[0]
			);
		}
		if (type == 0.5) {
			str = (
				lang.startsWith('zh-Han') ? strArr[0] + "年" + strArr[1] + "月" :
					monthLang.get(strArr[1]) + " " + strArr[0]
			);
		}
		if (type == 1) {
			str = (
				lang.startsWith('zh-Han') ? strArr[0] + "年" :
					strArr[0] + ''
			);
		}
		if (type == 2) {
			str = (
				lang.startsWith('zh-Han') ? strArr[1] + "月" :
					monthLang.get(strArr[1]) + ''
			);
		}
		if (type == 3) {
			str = (
				lang.startsWith('zh-Han') ? strArr[2] + "日" :
					dayLang.get(strArr[2]) + ''
			);
		}
		if (type == 4) {
			str = (
				lang.startsWith('zh-Han') ? strArr[1] + "月" + strArr[2] + "日" :
					monthLang.get(strArr[1]) + " " + strArr[2]
			);
		}
		if (type == 5) {
			str = getWeek(date, lang);
		}
	} catch (e) {
		str = date;
	}
	return str || date;
}


/**
 * @desc 时间格式化
 * @param { Number } year
 * @param { Number } month
 * @param { Number } day
 * @param { Number } type 1:y-m-d; 2: 年月日 
 */
export const formatDate = (year: NumberValue, month: NumberValue, day: NumberValue, sign = "/") => {
	let y = year;
    let m = month
    if (m && (m as number) < 10) m = `0${m}`;
    let d = day
    if (d && (d as number) < 10) d = `0${d}`;
	return (y ? y + sign:'') + m + (d ? sign + d : '');
};