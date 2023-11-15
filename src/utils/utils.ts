/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {String}    A string hash
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @see https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
 * @see https://devdocs.io/openjdk~8/java/lang/string#hashCode--
 */
export function hashString(str: string): string {
  let hash = 0
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash + chr) >>> 0 // Convert to 32bit unsigned integer
  }
  return hash.toString()
}
