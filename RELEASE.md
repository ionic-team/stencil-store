# Releasing Stencil Store

## Production Releases

Production Releases (or "Prod Releases", "Prod Builds") are installable instances of Stencil Store that are:
- Published to the npm registry for distribution within and outside the Stencil team
- Meant for general consumption by users

### How to Publish

Only members of the Stencil team may create prod builds of Stencil Store.
To publish the package:
1. Navigate to the [Stencil Store Prod Release GitHub Action](https://github.com/ionic-team/stencil-store/actions/workflows/release-prod.yml) in your browser.
1. Select the 'Run Workflow' dropdown on the right hand side of the page
1. The dropdown will ask you for a version type to publish.
Stencil Store follows semantic versioning.
Review the changes on `main` and select the most appropriate release type.
1. Select 'Run Workflow'
1. Allow the workflow to run. Upon completion, the output of the 'publish-npm' action will report the published version string.
1. Navigate to the project's [Releases Page](https://github.com/ionic-team/stencil-store/releases)
1. Select 'Draft a new release'
1. Select the tag of the version you just created in the 'Choose a tag' dropdown
1. Click "Generate release notes"
1. Ensure this is the latest release
1. Hit 'Publish release'

Following a successful run of the workflow, the package can be installed from the npm registry like any other package.

## Development Releases

Development Releases (or "Dev Releases", "Dev Builds") are installable instances of Stencil Store that are:
- Published to the npm registry for distribution within and outside the Stencil team
- Built using the same infrastructure as production releases, with less safety checks
- Used to verify a fix or change to the project prior to a production release

### How to Publish

Only members of the Stencil team may create dev builds of Stencil Store.
To publish the package:
1. Navigate to the [Stencil Store Dev Release GitHub Action](https://github.com/ionic-team/stencil-store/actions/workflows/release-dev.yml) in your browser.
2. Select the 'Run Workflow' dropdown on the right hand side of the page
3. The dropdown will ask you for a branch name to publish from. Any branch may be used here.
4. Select 'Run Workflow'
5. Allow the workflow to run. Upon completion, the output of the 'publish-npm' action will report the published version string.

Following a successful run of the workflow, the package can be installed from the npm registry like any other package.

### Publish Format

Dev Builds are published to the NPM registry under the `@stencil/store` scope.
Unlike production builds, dev builds use a specially formatted version string to express its origins.
Dev builds follow the format `BASE_VERSION-dev.EPOCH_DATE.SHA`, where:
- `BASE_VERSION` is the latest production release changes to the build were based off of
- `EPOCH_DATE` is the number of seconds since January 1st, 1970 in UTC
- `SHA` is the git short SHA of the commit used in the release

As an example: `2.1.0-dev.1677185104.7c87e34` was built:
- With v2.1.0 as the latest production build at the time of the dev build
- On Fri, 26 Jan 2024 13:48:17 UTC
- With the commit `7c87e34`