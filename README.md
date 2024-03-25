## Grant Action
### Requirements
- docker
- act
- npm, node, typescript

### Getting started
After the above requirements are installed you can dogfood the action.

First create a `.env` file with `GITHUB_TOKEN=` set to a developer github token with basic permissions.
- To create a github token see [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

The token just needs basic permissions so that it can download the latest grant release.

After the `.env` file is set a developer should be able to run `act` to see the licenses listed for the given input image.
