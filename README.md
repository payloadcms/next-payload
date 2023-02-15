# Payload Vercel Functions

This project is a proof-of-concept that outputs each of Payload's HTTP endpoints to a Vercel serverless function.

It uses a build script to do three things:

1. Copy the Admin UI files to Vercel's `/public` folder
2. Inject a `handler` for each of Payload's endpoints into the Vercel `/api` folder
3. Set up a rewrite for sending all traffic from `/admin/*` to the admin UI `index.html` file

### Bugs / workarounds

There are a few bugs / workarounds that we have had to work around:

#### Need to build BEFORE pushing to Vercel

Unfortunately, we need to build _before_ we deploy to Vercel, because otherwise Vercel won't see our dynamically added `/api` handlers. They apparently need to be present on _push_, rather than be output during the build step.

#### Cold starts

Right now, cold starts are a little problematic because of the fact that we've split out each Payload endpoint into a separate Vercel function. This means that each endpoint will need to be cold-started. We could write a script that keeps each endpoint alive, alleviating the cold-start problem.

#### Forcing Vercel to include Payload config files

The only way we could figure out how to force Vercel to include Payload `/dist` files is to use `fs` to read the config in `payload.js`. If we simply access the config, Vercel will include the files. But if we do not, Vercel will not include any Payload files from `/dist`.

We attempted to use the `includeFiles` Vercel config property, but the below `vercel.json` config did not work:

```js
{
  "functions": {
    "api/**/*.js": {
      "includeFiles": "/dist/**/*"
    }
  }
}
```

#### Route conflicts

Supposedly, handlers _without_ route parameters should take precedence over those with parameters, but unfortunately this is not working.

We would like to have a handler at `/api/_preferences/[key].js` but unfortunately it is not accessible, and our `/api/[collection]/[id].js` receives all the traffic meant to be sent to our preferences handler.

## What's missing

##### Versions

We have not handled any versions functionality, but that will just be more of the same.

##### Dynamically writing to an existing `vercel.json`

We need to dynamically inject our required properties into an existing `vercel.json` file in case it already exists. Should be very easy to do.

##### Abstracting into a `postbuild` step

We could easily export this repo's functionality into an NPM module so that this all happens easily and behind the scenes.

##### Converting `/handlers/api` folder to TypeScript

For maintainability, we should refactor the project to TypeScript but this is just a nice-to-have.

## Development

To test / build with these handlers, follow the steps below:

1. Run `cp .env.example .env` to create an `.env`
1. Make sure you have a Mongo database accessible via the URL in your `.env`
1. Run `vercel dev`
