import { validateNuGetRegistriesJSON } from '../src/nuget-service'

const validJsonValues = [
  [1, true, '[{"name":"unit test","password":"P@$$w0rd","url":"https://nuget.myfeed.local","username":"nuget-user"}]'],
  [
    2,
    true,
    '[{"name":"unit test 1","password":"P@$$w0rd","url":"https://nuget1.myfeed.local","username":"nuget-user"},{"name":"unit test 2","password":"P@$$w0rd","url":"https://nuget2.myfeed.local","username":"nuget-user"}]'
  ],
  [3, false, '[{"name":"unit test","url":"https://nuget.myfeed.local","username":"nuget-user"}]'],
  [4, false, '[{"name":"unit test","password":"P@$$w0rd","username":"nuget-user"}]'],
  [5, false, '[{"name":"unit test","password":"P@$$w0rd","url":"https://nuget.myfeed.local"}]']
]

describe('nuget-service', () => {
  describe('validateNuGetRegistries', () => {
    test.each(validJsonValues)('index %p should return %p', (index, expected, json) => {
      const isValid = validateNuGetRegistriesJSON(json as string)
      expect(isValid).toBe(expected as boolean)
    })
  })
})
