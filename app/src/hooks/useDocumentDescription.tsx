import { useEffect } from 'react'

export const useDocumentDescription = (description: string) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.querySelector('meta[name="description"]')!.setAttribute('content', description)
  }, [description])
}
