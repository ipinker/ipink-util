import {extend} from "@dcloudio/uni-app";

export interface UniElement extends UniNamespace.NodeInfo {}

export interface CanvasContext extends UniNamespace.CanvasContext {
    /**
     * 绘制图像到画布
     */
    drawImage(imageResource: string | HTMLImageElement, dx?: number, dy?: number, dWidth?: number, dHeigt?: number, sx?: number, sy?: number, sWidth?: number, sHeight?: number): void;
    toDataURL({}): Promise<string>;
}

export interface CanvasElement extends HTMLCanvasElement {

    // getContext(contextId: "2d"): CanvasContext

}
