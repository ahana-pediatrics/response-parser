import {expect} from 'chai';
import {$num, $str, $enum, $bool, Processor} from '../src/ResponseParser';

interface ErrorTest {
  value: unknown;
  type: string;
}

const errorTests = [
  {value: 0, type: 'number'},
  {value: '', type: 'string'},
  {value: true, type: 'boolean'},
  {value: null, type: 'null'},
  {value: undefined, type: 'undefined'},
  {value: [], type: 'array'},
  {value: {}, type: 'object'},
];

const expectErrors = <T>(
  $processor: Processor<T>,
  expectedType: string,
  tests: ErrorTest[],
) => {
  tests.forEach(test => {
    if (test.type !== expectedType) {
      //@ts-expect-error
      expect(() => $processor(test.value)).to.throw(
        `Could not parse '${test.value}' of type ${test.type} into ${expectedType}`,
      );
    }
  });
};

describe('ResponseParser', () => {
  describe('.$num', () => {
    it('parses a number into a number', () => {
      expect($num(4)).to.equal(4);
    });
    it('parses a numeric string into a number', () => {
      expect($num('4')).to.equal(4);
    });
    it('throws an error on bad input', () => {
      expectErrors($num, 'number', errorTests);
    });
  });

  describe('.$str', () => {
    it('parses a string into a string', () => {
      expect($str('test')).to.equal('test');
    });
    it('throws an error on bad input', () => {
      expectErrors($str, 'string', errorTests);
    });
  });

  describe('.$enum', () => {
    it('parses an enum into an enum', () => {
      enum TestEnum {
        Alpha = 'alpha',
        Beta = 'beta',
      }
      expect($enum(TestEnum)('alpha')).to.equal(TestEnum.Alpha);
    });
    it('throws an error on an invalid enum value', () => {
      enum TestEnum {
        Alpha = 'alpha',
        Beta = 'beta',
      }
      expect(() => $enum(TestEnum)('gamma')).to.throw(
        "Could not parse 'gamma' of type string into enum",
      );
    });
    it('throws an error on bad input', () => {
      enum TestEnum {
        Alpha = 'alpha',
        Beta = 'beta',
      }
      expectErrors($enum(TestEnum), 'enum', errorTests);
    });
  });

  describe('.$bool', () => {
    it('parses a boolean into a boolean', () => {
      expect($bool(true)).to.be.true;
      expect($bool(false)).to.be.false;
    });
    it('throws an error on bad input', () => {
      expectErrors($bool, 'boolean', errorTests);
    });
  });
});
