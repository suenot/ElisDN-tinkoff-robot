import { Criteria, JsonView, Schema } from '../criteria'
import { v4 } from 'uuid'
import None from './None'

class Static implements Criteria {
  private readonly id: string
  private readonly value: number

  constructor(value: number, id: string = v4()) {
    this.id = id
    this.value = value
  }

  static getSchema(): Schema {
    return {
      type: 'static',
      name: 'Значение',
      multiple: false,
      params: [
        {
          type: 'value',
          name: 'Равно',
        },
      ],
      input: [],
    }
  }

  static blank() {
    return new Static(0)
  }

  static fromJSON(data: JsonView) {
    const value = data.params.find((input) => input.type === 'value')
    return new Static(value?.value || 0, data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'static',
      params: [
        {
          type: 'value',
          value: this.value,
        },
      ],
      input: [],
    }
  }

  without(id: string): Criteria {
    if (this.id === id) {
      return new None()
    }
    return this
  }

  with(id: string, criteria: Criteria): Criteria {
    if (this.id === id) {
      return criteria
    }
    return this
  }
}

export default Static