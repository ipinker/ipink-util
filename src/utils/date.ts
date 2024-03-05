/**
 * 日期工具类
 * @Author: Gavin New
 * @Create: 2024/02/27 13:48
 */
import {isDate, isNumber, isString} from "./is"
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