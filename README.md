# Add NuGet Registry Action
This action allows users to add one or more NuGet registry to the runner's local sources that they must authenticate against.
The goal is to safeguard the credentials of the NuGet source(s) while still being able to restore from protected NuGet sources.

## Usage
This action can be used on both hosted and self-hosted runners.
GitHub hosted runners are ephemeral which means that at the conclusion of the workflow, the stored credentials are safely destroyed.
If you are using a self-hosted runner, this action **does not** remove the sources it adds.
This means that if you are in a situation where you need to remove the soruces at the conclusion of the workflow, you will need to handle this yourself.

Below outlines the steps that you need to take to leverave this action in your workflow.

### Creating the JSON
First, you must create JSON that defines all of the authenticated sources you wish to add during a workflow execution.
Here is the schema for the JSON:
```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "array",
  "items": [
    {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "password": {
          "type": "string"
        },
        "url": {
          "type": "string"
        },
        "username": {
          "type": "string"
        }
      },
      "required": [
        "name",
        "password",
        "url",
        "username"
      ]
    }
  ]
}
```

Let's say you have NuGet source with the following details:
- URL: https://nuget.myfeed.local
- User Name: `nuget-user`
- Password: `P@$$w0rd`

It is an internal feed that you need to use, so we'll call it `internal`.
The JSON to add this source via the action would look like this:
```json
[
  {
    "name":"internal",
    "password":"P@$$w0rd",
    "url":"https://nuget.myfeed.local",
    "username":"nuget-user"
  }
]
```
Once you have your JSON, this must be safe guared.
The easiest way to achieve this is to use a GitHub Secret either at the repository or organization level.
Which one you choose will depend on your needs.

### Using the Action
```yaml
- uses: webstorm-tech/add-nuget-registry
  id: addNuGetRegistryStep
  with:
    serializedNuGetRegistries: ${{ secrets.NUGET_SOURCES }}
```

## License
The contents of this repository are released under the [MIT License][license].

<!-- Links -->
[license]: ./LICENSE