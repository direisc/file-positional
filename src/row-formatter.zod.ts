import lodash from 'lodash'
import moment from 'moment'
import { z } from 'zod'
import { DateFieldSpec, FieldSpec, FloatFieldSpec, RowData, WriteOptions } from './Types.js'
import {
  getFillStringOfSymbol,
  getPadder,
  getPaddingPositionOrDef,
  getPaddingSymbol,
} from './utils.js'

const defaultOptions = {
  rowEnd: '',
}

const concatData = <T>(data: RowData<T>) => (acc: string, field: FieldSpec, _i: number) => acc + (data as any)[field.name]

const rowFormatterWithZod = <T>(
  maps: Array<FieldSpec>,
  data: RowData<T>,
  options?: Partial<WriteOptions>
) => {
  if (typeof maps !== 'object') {
    throw new Error('mapping is not an array')
  }
  if (lodash.isEmpty(maps)) {
    throw new Error('mapping is empty')
  }
  if (!data) {
    throw new Error('data is null')
  }
  if (typeof data !== 'object') {
    throw new Error('data is not an object')
  }

  // Construct zod
  type zodTypeMap = 'string' | 'date' | 'number'
  const zodObject: any = {}
  maps.map((map) => {
    const zodType: zodTypeMap = ['float', 'integer'].includes(
      map.type as any
    )
      ? 'number'
      : map.type === 'string'
        ? 'string'
        : map.type === 'date'
          ? 'date'
          : 'string'
    const paddingDefault = zodType === 'number' ? 'start' : 'end'
    zodObject[map.name] = (z.coerce[zodType]() as any)
      .transform((value: any) => {
        if (zodType === 'date') {
          return new Date(value)
        }
        return value
      })
      .superRefine((value: any, ctx: any) => {
        if (zodType !== 'date' && value.toString().length > map.size) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Value ${value} exceed size ${map.size}`,
          })
        }
      })
      .transform((value: any) => {
        let str = ''

        if (zodType === 'number') {
          const _map = map as FloatFieldSpec
          // Format it according to the options passed
          const precision = !_map.precision ? 0 : _map.precision
          if (_map.dotNotation) {
            str = value.toFixed(precision).toString()
          } else {
            str = Math.trunc(value * Math.pow(10, precision)).toString()
          }
        } else if (zodType === 'date') {
          const _map = map as DateFieldSpec
          const base = moment(value)
          const convention = _map.format?.utc ? base.utc() : base
          if (!_map.format?.dateFormat) {
            str = convention.toISOString()
          } else {
            str = convention.format(_map.format.dateFormat)
          }
          // using no library for ISO string
          // str = (value as unknown as Date).toISOString()
        } else {
          str = `${value}`
        }

        return getPadder(
          getPaddingPositionOrDef(map.paddingPosition, paddingDefault)
        )(
          str.substring(0, map.size),
          getFillStringOfSymbol(getPaddingSymbol(map.paddingSymbol))(
            map.size - lodash.size(str)
          )
        )
      })
  })

  const schema = z.object(zodObject)
  const parsedData = schema.parse(data)

  const opt: WriteOptions = { ...defaultOptions, ...options }

  return maps.reduce(concatData(parsedData), '') + opt.rowEnd
}

export default rowFormatterWithZod
