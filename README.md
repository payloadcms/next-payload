# Next + Payload Serverless

> Warning - this package is in active development and is likely to change until it hits version 1.0.0. You should expect breaking changes and bugs if you attempt to use it right now.

This package contains a set of utilities to allow Payload to be deployed seamlessly, serverless, within an existing NextJS project.

It exposes a few different helpers. To get started, follow the steps below:

#### 1. Run `next-payload install`

This script automatically adds all Payload endpoints to your NextJS project. To use it, add a script to your `package.json` like the following:

```
  "install:payload": "next-payload install",
```

And then run `yarn install:payload` within your folder. You will see a bunch of new endpoints automatically injected into your Next `/pages` folder.

#### 2. Install `withPayload`

Payload needs to inject some requirements into your Next config in order to function properly. To install `withPayload`, you need to import it into your `next.config.js` file. Here's an example:

```js
const { withPayload } = require("@payloadcms/next-payload");

module.exports = withPayload({
  // your Next config here
});
```

#### 3. Add a `payload.ts` file to the root folder of your project

This is a helper file that will allow you to initialize Payload, and then share it across all of your endpoints which is good for warm serverless functions and reusability. Create a file at the root of your project called `payload.ts`, with the following contents:

```ts
import { getPayload } from "payload";
import config from "./payload/payload.config";

const getInitializedPayload = async () => {
  return getPayload({
    // Make sure that your environment variables are filled out accordingly
    mongoURL: process.env.MONGODB_URI as string,
    secret: process.env.PAYLOAD_SECRET as string,
    // Notice that we're passing our Payload config
    config,
  });
};

export default getInitializedPayload;
```

You'll notice that we are initializing Payload and passing it our Payload config. [The Payload config](https://payloadcms.com/docs/configuration/overview) is central to everything that Payload does, and you'll need to create a `payload.config.ts` file to import.

A great side-effect of having this file located centrally at the root of your project is that you can now import it directly, elsewhere, to leverage the [Payload Local API](https://payloadcms.com/docs/local-api/overview#local-api). The Local API does not use REST or GraphQL, and runs directly on your server talking directly to your database, which saves massively on HTTP-induced latency.

Here's an example of using the Local API within `getStaticProps`:

```ts
// Your newly created `payload.ts file
import getPayload from "../payload";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const payload = await getPayload();

  const query = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: params.slug,
      },
    },
  });

  const page = pages.docs[0];

  return {
    props: {
      page: page,
    },
  };
};
```
