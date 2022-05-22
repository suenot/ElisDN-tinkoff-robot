export type SchemaParam = {
  type: string
  name: string
}

export type SchemaInput = {
  type: string
  name: string
  multiple: boolean
}

export type Schema = {
  type: string
  name: string
  multiple: boolean
  params: SchemaParam[]
  input: SchemaInput[]
}

export type JsonView = {
  id: string
  type: string
  params: JsonParamView[]
  input: JsonInputView[]
}

export type JsonParamView = {
  type: string
  value: number | null
}

export type JsonInputView = {
  type: string
  value: JsonView | null
}

type Order = {
  id: string
  date: Date
  buy: boolean
  lots: number
  price: number
}

export class Data {
  constructor(public readonly date: Date, public readonly price: number, public readonly order: Order | null) {}

  static blank(date: Date = new Date()): Data {
    return new Data(date, 0, null)
  }

  withPrice(price: number) {
    return new Data(this.date, price, this.order)
  }

  withOrder(order: Order) {
    return new Data(this.date, this.price, order)
  }
}

export class Metric {
  constructor(public readonly id: string, public readonly name: string, public readonly value: number) {}
}

export class Result {
  public readonly value: number[] | number
  public readonly metrics: Metric[]

  constructor(value: number[] | number, metrics: Metric[]) {
    this.value = value
    this.metrics = metrics
  }
}

export interface Criteria {
  without(id: string): Criteria
  with(id: string, criteria: Criteria): Criteria
  toJSON(): JsonView
  eval(data: Data): Result
}
