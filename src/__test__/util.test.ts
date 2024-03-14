import { expect, test } from 'vitest'
import { compareVersion } from "../utils/util"

test(`compareVersion 1.0.1 1.0.1 to equal 0 \t compareVersion 1.0.1 1.0.0 to equal 1 \t compareVersion 1.0.0 1.0.1 to equal -1`, () => {
    expect(compareVersion("1.0.1", "1.0.1")).toBe(0);
    expect(compareVersion("1.0.1", "1.0.0")).toBe(1);
    expect(compareVersion("1.0.0", "1.0.1")).toBe(-1);
})
