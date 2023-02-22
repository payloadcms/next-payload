# Next + Payload Serverless

> Warning - this package is in active development and is likely to change until it hits version 1.0.0. You should expect breaking changes and bugs if you attempt to use it right now.

This package contains a set of utilities to allow Payload to be deployed seamlessly, serverless, within an existing NextJS project. It adds the Payload admin UI into the NextJS `/app` folder and adds all Payload endpoints into the `pages/api` folder.

To do so, this package exposes a few different helpers. To get started, follow the steps below:

#### 1. Run `next-payload install`

This script automatically adds all Payload endpoints to your NextJS project. To use it, add a script to your `package.json` like the following:

```
  "install:payload": "next-payload install",
```

And then run `yarn install:payload` within your folder. You will see a bunch of new endpoints automatically injected into your Next `/pages` folder.

#### 2. Ensure that the newly created `./payload.ts` file has accurate variables

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

You'll notice that we are initializing Payload and passing it our Payload config. [The Payload config](https://payloadcms.com/docs/configuration/overview) is central to everything that Payload does.

A great side-effect of having this file located centrally at the root of your project is that you can now import it directly, elsewhere, to leverage the [Payload Local API](https://payloadcms.com/docs/local-api/overview#local-api). The Local API does not use REST or GraphQL, and runs directly on your server talking directly to your database, which saves massively on HTTP-induced latency.

Here's an example of using the Local API within an `/app/[slug]/page.tsx` file::

```ts
import React from 'react';
import { notFound } from 'next/navigation'
import getPayload from '../../../payload';

const Page = async ({ params: { slug } }) => {
  const payload = await getPayload();

  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug || 'home',
      },
    }
  });

  const page = pages.docs[0];

  if (!page) return notFound()

  return (
    <h1>
      Hello, this is the "{page.slug}" page!
    </h1>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload();

  const pages = await payload.find({
    collection: 'pages',
    limit: 0,
  })

  return pages.docs.map(({ slug }) => ({ slug }))
}

export default Page;
```

#### 3. Install `withPayload`

The last thing we need to do is wrap your Next config with `withPayload`. Payload needs to inject some requirements into your Next config in order to function properly. To install `withPayload`, you need to import it into your `next.config.js` file. Here's an example:

```js
const { withPayload } = require("@payloadcms/next-payload");

module.exports = withPayload({
  // your Next config here
});
```

And then you're done. Have fun!
