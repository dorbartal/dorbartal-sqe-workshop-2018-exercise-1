import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import * as codeTable from '../src/js/codeTable';

describe('The javascript parser', () => {

    it('Test 1 - is parsing an empty function correctly', () => {
        var obj = codeTable.buildTable(parseCode('function test1(){}'));
        assert.equal(obj.length,2);
    });

    it('Test 2 - For statement, assignment', () => {
        var obj = codeTable.buildTable(parseCode('function test2(b, c){for (let x=0; x<8; x++)b=c+1;}'));
        assert.equal(obj[4].condition,'let x=0; x < 8; x++');
    });

    it('Test 3 - Member, if, else', () => {
        var obj = codeTable.buildTable(parseCode('function test3(arr, b, c){if (arr[b]>c)b=c;else if (arr[2]<=c)c=-2;else{b++;++c;}if (b==c)return -1;return (b);}'));
        assert.equal(obj[5].type,'if statement');
        assert.equal(obj[10].value,'b++');
    });

    it('Test 4 - While, return', () => {
        var obj = codeTable.buildTable(parseCode('function test4(a, b){while (a>b){a++;}return false;}'));
        assert.equal(obj[2].type,'variable declaration');
    });

    it('Test 5 - Return null', () => {
        var obj = codeTable.buildTable(parseCode('function test5(){return null;}'));
        assert.equal(obj[2].value,null);
    });

    it('Test 6 - Binary expression, while, return', () => {
        var obj = codeTable.buildTable(parseCode('function test6(b){let a;let a = (a+4)/8;while (a>b)a++;return a++;}'));
        assert.equal(obj[5].condition,'a > b');
    });

    it('Test 7 - No parameters, Unary with identifier' , () => {
        var obj = codeTable.buildTable(parseCode('function test7(){var x, y; return -x;}'));
        assert.equal(obj[3].name,'y');
    });

    it('Test 8 - Class test' , () => {
        var obj = codeTable.buildTable(parseCode('function binarySearch(X, V, n){let low, high, mid;low = 0;high = n - 1;while (low <= high){mid = (low + high)/2;if (X < V[mid])high = mid - 1;else if (X > V[mid])low = mid + 1;else return mid;}return -1;}'));
        assert.equal(obj[10].condition,'low <= high');
        assert.equal(obj[1].name,'binarySearch');
    });

    it('Test 9 - Update' , () => {
        var obj = codeTable.buildTable(parseCode('function test9(){let n = 2; while (n>10) {n++;}}'));
        assert.equal(obj[4].type,'update expression');
        assert.equal(obj[4].value,'n++');
    });

    it('Test 10 - Update' , () => {
        var obj = codeTable.buildTable(parseCode('function test10(){let n = 2; while (n>10) {++n;}}'));
        assert.equal(obj[4].value,'++n');
    });
});
