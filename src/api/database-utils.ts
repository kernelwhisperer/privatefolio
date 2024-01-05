export function validateOperation(results: Array<PouchDB.Core.Response | PouchDB.Core.Error>) {
  const errors = results.filter((x) => "error" in x && x.error) as PouchDB.Core.Error[]
  if (errors.length > 0) {
    console.error(errors)
    throw new Error(`Database operation: ${errors[0].message}`)
  }
}
