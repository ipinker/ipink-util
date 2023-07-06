/*
 * @Author: 牛洪法
 * @Date: 2023-05-12 10:17:22
 * @LastEditors: 牛洪法 1242849166@qq.com
 * @LastEditTime: 2023-05-12 11:46:23
 * @FilePath: /Lib/src/pink-js/src/interface/Common.ts
 * @Description: 公共接口
 */
;


declare const window: any;
export { window };
export type Num = string | number;
export type Nums = Array<number>;

export interface Fail {
    err: { errMsg?: string } | string | null,
    errMsg?: string | null
}


