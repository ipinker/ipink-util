import { TinyColor } from "@ctrl/tinycolor"

/**
 * 获取颜色的对象， 方便输出各种格式的颜色， 或者加工颜色再输出
 * @param color { string }
 */
export const getColorObj = (color: string): TinyColor => {
    return new TinyColor(color)
}

/**
 * @desc 给一个颜色的加透明度
 * @param param { string }
 * @return: {string}
 */
export const getOpacityColor = (color: string, opacity: number): string => {
    const colorInfo: TinyColor = getColorObj(color);
    if(!colorInfo.isValid) return color;
	return colorInfo.setAlpha(opacity).toRgbString();
}
