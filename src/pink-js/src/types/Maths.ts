/*
 * @Author: 牛洪法
 * @Date: 2023-05-12 10:17:31
 * @LastEditors: 牛洪法 1242849166@qq.com
 * @LastEditTime: 2023-05-12 14:13:37
 * @FilePath: /Lib/src/pink-js/src/types/Maths.ts
 * @Description: 描述
 */
import { Nums, Num } from "./Common";

type Nums2Num = (...args: Nums) => number;
type Nums2Maths = (...args: Nums) => Maths;

export default interface Maths {

    useChain: boolean;
    isInit: boolean;
    result: number;

    getInstance: (isUseChain?: boolean) => Maths;

    done: () => number;
    base: (num: number) => Maths;
    chain: (key: string, ...args: Nums) => Maths | number;

    add: Nums2Maths;
    adds: Nums2Num;

    sub: Nums2Maths;
    subs: Nums2Num;

    mul: Nums2Maths;
    muls: Nums2Num;


    div: Nums2Maths;
    divs: Nums2Num;

    
    pow: Nums2Maths;
    pows: Nums2Num;
}