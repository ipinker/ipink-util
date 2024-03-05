
/**
 * @description 返回上一级
 * @param delta { number } 返回的层级数量
 */
export function navigateBack(delta?: number) {
    delta = delta || 1;
    //#ifdef H5
	window?.history && window.history.go(Number('-' + delta));
	//#endif
	//#ifndef H5
	uni?.navigateBack && uni.navigateBack({ delta: delta });
	//#endif
}

/**
 * @description 对比版本
 * @param v1 { string } 新版本
 * @param v2 { string } 旧版本
 */
export const compareVersion = (v1: string, v2: string): number => {
    const v1s: string[] = v1.split('.');
    const v2s: string[] = v2.split('.');
	const len = Math.max(v1s.length, v2s.length)

	while (v1s.length < len) {
		v1s.push('0')
	}

	while (v2s.length < len) {
		v2s.push('0')
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1s[i])
		const num2 = parseInt(v2s[i])

		if (num1 > num2) {
			return 1
		} else if (num1 < num2) {
			return -1
		}
	}

	return 0
}
