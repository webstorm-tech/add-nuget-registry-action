import * as core from '@actions/core'
import * as nugetService from './nuget-service'
import { NuGetRegistry } from './nuget-registry'

async function run(): Promise<void> {
  try {
    const serializedNuGetRegistries = core.getInput('serializedNuGetRegistries')

    core.debug(`serializedNuGetRegistries: ${serializedNuGetRegistries}`)

    if (!nugetService.validateNuGetRegistriesJSON(serializedNuGetRegistries)) {
      core.setFailed('Unable to deserialize the NuGet registries.')
      return
    }

    const nugetRegistries: NuGetRegistry[] = nugetService.deserializeNuGetRegistries(serializedNuGetRegistries)

    for (const nugetRegistry of nugetRegistries) {
      if (await nugetService.nugetRegistryExists(nugetRegistry)) {
        await nugetService.removeNuGetRegistry(nugetRegistry)
      }

      nugetService.addNuGetRegistry(nugetRegistry)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
