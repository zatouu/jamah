import { describe, expect, it } from 'vitest'
import { localePath, switchLocalePath } from './paths'

describe('paths', () => {
  it('préfixe les chemins par la langue', () => {
    expect(localePath('fr')).toBe('/fr')
    expect(localePath('ar', '/tijaniyya/')).toBe('/ar/tijaniyya')
  })

  it('change de langue en conservant la page', () => {
    expect(switchLocalePath('/fr/maitres/cheikh-ousmane-mbow', 'ar')).toBe('/ar/maitres/cheikh-ousmane-mbow')
    expect(switchLocalePath('/ar', 'fr')).toBe('/fr')
  })
})
