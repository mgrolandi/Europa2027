import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)

export const FAMILIAS = ['Ahmad', 'Barrera', 'Nader']

export function FamilyFilterProvider({ children }) {
  const [selectedFamily, setSelectedFamily] = useState(null)
  return (
    <Ctx.Provider value={{ selectedFamily, setSelectedFamily }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFamilyFilter() {
  return useContext(Ctx)
}
