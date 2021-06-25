import { strip0x } from './string_manipulation'

export const packSignatures = (array: any) => {
  const length = array.length.toString()

  const msgLength = length.length === 1 ? `0${length}` : length
  let v = ''
  let r = ''
  let s = ''
  array.forEach((e: any) => {
    v = v.concat(e.v)
    r = r.concat(e.r)
    s = s.concat(e.s)
  })
  return `0x${msgLength}${v}${r}${s}`
}
export const signatureToVRS = (rawSignature: string) => {
  const signature = strip0x(rawSignature)
  const v = signature.substr(64 * 2)
  const r = signature.substr(0, 32 * 2)
  const s = signature.substr(32 * 2, 32 * 2)
  return { v, r, s }
}
export const signaturesFormatted = (signatures: string[]) => {
  return packSignatures(signatures.map(s => signatureToVRS(s)))
}
