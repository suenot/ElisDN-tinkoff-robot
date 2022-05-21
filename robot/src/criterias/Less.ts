import { Criteria, JsonView, Schema } from '../robot/criteria'
import { v4 } from 'uuid'
import None from './None'

class Less implements Criteria {
  private readonly id: string
  private readonly that: Criteria
  private readonly than: Criteria

  constructor(that: Criteria, than: Criteria, id: string = v4()) {
    this.id = id
    this.that = that
    this.than = than
  }

  static getSchema(): Schema {
    return {
      type: 'less',
      name: 'Меньше',
      multiple: false,
      params: [],
      input: [
        {
          type: 'that',
          name: 'что',
          multiple: false,
        },
        {
          type: 'than',
          name: 'чего',
          multiple: false,
        },
      ],
    }
  }

  static blank() {
    return new Less(new None(), new None())
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static fromJSON(data: JsonView, next: Function) {
    const that = data.input.find((input) => input.type === 'that')
    const than = data.input.find((input) => input.type === 'than')

    return new Less(next(that?.value || null), next(than?.value || null), data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'less',
      params: [],
      input: [
        {
          type: 'that',
          value: this.that.toJSON(),
        },
        {
          type: 'than',
          value: this.than.toJSON(),
        },
      ],
    }
  }

  without(id: string): Criteria {
    if (this.id === id) {
      return new None()
    }
    return new Less(this.that.without(id), this.than.without(id))
  }

  with(id: string, criteria: Criteria): Criteria {
    if (this.id === id) {
      return criteria
    }
    return new Less(this.that.with(id, criteria), this.than.with(id, criteria))
  }
}

export default Less