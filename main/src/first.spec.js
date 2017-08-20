import {pow} from 'first';

describe("pow", function () {
    it("возводит в n-ю степень", function () {
        expect(pow(2, 3)).toEqual(6);
        // expect(pow(2, 4)).toEqual(1);
    });
});