import { expect, test } from 'vitest'
import { isNumber, isTimeString, isDateString } from "../utils/is"

test(`isNumber 1 to equal true \t '1' to equal false \t true to equal false`, () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber('1')).toBe(false);
    expect(isNumber(true)).toBe(false);
})

test(`
    isTimeString "20:20" to equal true \t
    isTimeString "20:20:20" to equal true \t
    isTimeString "20" to equal false \t
    isTimeString "20-20" to equal false
    `, () => {
    expect(isTimeString("20:20")).toBe(true);
    expect(isTimeString("20:20:20")).toBe(true);
    expect(isTimeString("20")).toBe(false);
    expect(isTimeString("20-20")).toBe(false);
})

test(`
    isDateString "2000" to equal true \t
    "2000-20-20" to equal false \t
    "2000-2-20" to equal true \t
    "2000/02/20 20:20:20" to equal true \t
    "2000/02/20 20:20" to equal true \t
    "2000/02/20 20" to equal false \t
    "20000220" to equal false
    "02-20" to equal true
    `, () => {
    expect(isDateString("2000")).toBe(true);
    expect(isDateString("2000-20-20")).toBe(false);
    expect(isDateString("2000-2-20")).toBe(true);
    expect(isDateString("2000/02/20")).toBe(true);
    expect(isDateString("2000/02/20 20:20:20")).toBe(true);
    expect(isDateString("2000-02-20 20:00")).toBe(true);
    expect(isDateString("2000-02-20 20")).toBe(false);
    expect(isDateString("2000/02/20")).toBe(true);
    expect(isDateString("02-20")).toBe(true);
    expect(isDateString("20000220")).toBe(false);
})

/*
test(`* to equal *`, () => {
    expect( ( )).toBe( );
})
 */
