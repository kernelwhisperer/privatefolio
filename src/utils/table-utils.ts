export type Order = "asc" | "desc"

export type BaseType = {
  _id: string
}

export type ActiveFilterMap<T extends BaseType> = Partial<Record<keyof T, string | number>>

export type ValueSelector<T> = (row: T) => string | number | undefined

export interface HeadCell<T extends BaseType> {
  filterable?: boolean
  key?: keyof T
  label: string
  numeric?: boolean
  sortable?: boolean
  valueSelector?: ValueSelector<T>
}

export type TableRowComponentProps<T extends BaseType> = {
  headCells: HeadCell<T>[]
  relativeTime: boolean
  row: T
}
