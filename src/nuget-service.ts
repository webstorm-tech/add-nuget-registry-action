import * as core from '@actions/core'
import * as exec from '@actions/exec'
import Ajv, { type JSONSchemaType } from 'ajv'
import { ExecOptions } from '@actions/exec'
import { NuGetRegistry } from './nuget-registry'

const NuGetRegistrySchema: JSONSchemaType<NuGetRegistry[]> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      password: { type: 'string' },
      url: { type: 'string' },
      username: { type: 'string' }
    },
    required: ['name', 'password', 'url', 'username']
  }
}

export async function addNuGetRegistry(nugetRegistry: NuGetRegistry): Promise<void> {
  core.info(`Adding NuGet registry ${nugetRegistry.url}`)
  await exec.exec('dotnet', [
    'nuget',
    'add',
    'source',
    nugetRegistry.url,
    '--username',
    nugetRegistry.username,
    '--password',
    nugetRegistry.password,
    '--store-password-in-clear-text',
    '--name',
    nugetRegistry.name
  ])
}

export function deserializeNuGetRegistries(serializedNuGetRegistries: string): NuGetRegistry[] {
  core.debug('Deserializing JSON...')
  const data = JSON.parse(serializedNuGetRegistries)

  return data as NuGetRegistry[]
}

export async function listLocalNuGetRegistries(): Promise<NuGetRegistry[]> {
  core.info('Listing local NuGet sources')
  const nugetRegistries: NuGetRegistry[] = []

  let errorOutput = ''
  let standardOutput = ''

  const options: ExecOptions = {}
  options.listeners = {
    stdout: (data: Buffer) => {
      standardOutput += data.toString()
    },
    stderr: (data: Buffer) => {
      errorOutput += data.toString()
    }
  }
  options.silent = true

  await exec.exec('dotnet', ['nuget', 'list', 'source'], options)

  core.debug(standardOutput)
  core.debug(errorOutput)

  const lines = standardOutput.split('\n')

  for (let index = 1; index < lines.length; index += 2) {
    if (lines[index].trim() === '') {
      continue
    }

    const sourceName = lines[index].replace('[Enabled]', '').replace('[Disabled]', '').substring(5).trim()

    const sourceUrl = lines[index + 1].trim()

    core.debug(`Local Source: ${sourceName} - ${sourceUrl}`)

    nugetRegistries.push({
      name: sourceName,
      password: '',
      url: sourceUrl,
      username: ''
    })
  }

  return nugetRegistries
}

export async function nugetRegistryExists(nugetRegistry: NuGetRegistry): Promise<boolean> {
  const localNuGetRegistries = await listLocalNuGetRegistries()

  for (const localNuGetRegistry of localNuGetRegistries) {
    if (
      localNuGetRegistry.name.toLowerCase() === nugetRegistry.name.toLowerCase() ||
      localNuGetRegistry.url.toLowerCase() === nugetRegistry.url.toLowerCase()
    ) {
      core.info(`NuGet source ${nugetRegistry.name} - ${nugetRegistry.url} exists locally`)
      core.debug(`Matched on Source Name: ${localNuGetRegistry.name.toLowerCase() === nugetRegistry.name.toLowerCase()}`)
      core.debug(`Matched on Source URL: ${localNuGetRegistry.url.toLowerCase() === nugetRegistry.url.toLowerCase()}`)
      return true
    }
  }

  return false
}

export async function removeNuGetRegistry(nugetRegistry: NuGetRegistry): Promise<void> {
  const localNuGetRegistries = await listLocalNuGetRegistries()

  for (const localNuGetRegistry of localNuGetRegistries) {
    if (
      localNuGetRegistry.name.toLowerCase() === nugetRegistry.name.toLowerCase() ||
      localNuGetRegistry.url.toLowerCase() === nugetRegistry.url.toLowerCase()
    ) {
      core.info(`Removing existing local NuGet source ${nugetRegistry.name} - ${nugetRegistry.url}`)
      await exec.exec('dotnet', ['nuget', 'remove', 'source', localNuGetRegistry.name])
    }
  }
}

export function validateNuGetRegistriesJSON(serializedNuGetRegistries: string): boolean {
  core.debug('Creating Ajv isntance...')
  const ajv = new Ajv()

  core.debug('Compling validator...')
  const validate = ajv.compile(NuGetRegistrySchema)

  core.debug('Deserializing JSON...')
  let data = null

  try {
    data = JSON.parse(serializedNuGetRegistries)
  } catch (error) {
    core.error('The value for `serializedNuGetRegistries` is not valid JSON')
    return false
  }

  core.debug('Validating data...')
  const isValid = validate(data)

  core.debug(`Is Valid: ${isValid}`)

  return isValid
}
