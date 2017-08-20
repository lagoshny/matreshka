import {pow} from './second';

describe("pow", function () {
    it("возводит в n-ю степень", function () {
        expect(pow(2, 3)).toEqual(7);
        // expect(pow(2, 4)).toEqual(1);
    });
});