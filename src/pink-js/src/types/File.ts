import { Fail } from "./Common";

export interface FileInfo extends Fail {
    path?: string,
    width: number,
    height: number,
    type?: string,
    size?: number,
    name?: string,
    orientation?: string
};