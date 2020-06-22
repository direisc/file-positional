import stringFormatter from './string-formatter'
import * as _ from 'lodash'

// Version of formatter with type-checking turned off to test runtime functionality
const rtStringFormatter: any = stringFormatter

describe('String formatter execution raise Exception', () => {
  it('If map is null', () => {
    expect(() => rtStringFormatter(null, null)).toThrow(
      'map is null or undefined'
    )
  })
  it('If map is not an object', () => {
    expect(() => rtStringFormatter('something', null)).toThrow(
      'map is not an object'
    )
  })

  it('If map object is empty', () => {
    expect(() => rtStringFormatter({}, null)).toThrow('map object is empty')
  })

  it('If field map object not contain size', () => {
    expect(() =>
      rtStringFormatter({ paddingPosition: 'end', name: 'someField' }, null)
    ).toThrow('map size is required')
  })

  it('If data is not a string and straight option', () => {
    expect(() =>
      rtStringFormatter(
        { size: 10, name: 'someField', type: 'string', straight: true },
        100
      )
    ).toThrow('field has not compatible type')
  })

  it('Size is less than 1', () => {
    expect(() => rtStringFormatter({ size: 0, name: 'someField' }, '')).toThrow(
      'map size must be greater than 0'
    )
  })

  it('If padding position is not allowed', () => {
    const paddingPosition = 'notvalidpad'
    expect(() =>
      rtStringFormatter(
        { size: 10, name: 'someField', type: 'string', paddingPosition },
        ''
      )
    ).toThrow(`padding position "${paddingPosition}" not allowed`)
  })

  it('If padding symbol is more of one char', () => {
    expect(() =>
      rtStringFormatter(
        { size: 10, name: 'someField', type: 'string', paddingSymbol: '@.@' },
        ''
      )
    ).toThrow('paddingSymbol cannot have length > 1')
  })
})

describe('String formatter execution result', () => {
  it("size 10 and data '', result lenght is 10 ", () => {
    expect(
      _.size(
        rtStringFormatter({ size: 10, name: 'someField', type: 'string' }, '')
      )
    ).toBe(10)
  })

  it("size 10 and long data 'somelongstring', result lenght is 10 ", () => {
    expect(
      _.size(
        rtStringFormatter(
          { size: 10, name: 'someField', type: 'string' },
          'somelongstring'
        )
      )
    ).toBe(10)
  })

  it("size 10 and long data 'somelongstring', result is 'somelongst'", () => {
    expect(
      rtStringFormatter(
        { size: 10, name: 'someField', type: 'string' },
        'somelongstring'
      )
    ).toBe('somelongst')
  })

  it("size 10 and same size data 'somestring', result lenght is 10 ", () => {
    expect(
      _.size(
        rtStringFormatter(
          { size: 10, name: 'someField', type: 'string' },
          'somestring'
        )
      )
    ).toBe(10)
  })

  it("size 10 and same size data 'somestring', result is 'somestring'", () => {
    expect(
      rtStringFormatter(
        { size: 10, name: 'someField', type: 'string' },
        'somestring'
      )
    ).toBe('somestring')
  })

  it("size 10 and spaced data 'str ing', result lenght is 10", () => {
    expect(
      _.size(
        rtStringFormatter(
          { size: 10, name: 'someField', type: 'string' },
          'str ing'
        )
      )
    ).toBe(10)
  })

  it("size 10 and spaced data 'str ing', result is 'str ing   '", () => {
    expect(
      rtStringFormatter(
        { size: 10, name: 'someField', type: 'string' },
        'str ing'
      )
    ).toBe('str ing   ')
  })

  it("paddingPosition 'start' data = 'str ing', result is '   str ing'", () => {
    expect(
      rtStringFormatter(
        {
          size: 10,
          paddingPosition: 'start',
          name: 'someField',
          type: 'string',
        },
        'str ing'
      )
    ).toBe('   str ing')
  })

  it("end paddingSymbol '@' data 'str ing', result is 'str ing@@@'", () => {
    expect(
      rtStringFormatter(
        { size: 10, paddingSymbol: '@', name: 'someField', type: 'string' },
        'str ing'
      )
    ).toBe('str ing@@@')
  })

  it("start paddingSymbol '@' data 'str ing',result is '@@@str ing'", () => {
    expect(
      rtStringFormatter(
        {
          size: 10,
          paddingPosition: 'start',
          paddingSymbol: '@',
          name: 'someField',
          type: 'string',
        },
        'str ing'
      )
    ).toBe('@@@str ing')
  })
})