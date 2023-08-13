export class FetchError<T extends { message: string }> extends Error {
  data

  constructor(data: T) {
    super(data.message)

    this.name = this.constructor.name
    this.data = data
  }
}
