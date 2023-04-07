# Next + Payload Serverless

This package contains a set of utilities to allow Payload to be deployed seamlessly, serverless, within an existing NextJS project. It adds the Payload admin UI into the NextJS `/app` folder and adds all Payload endpoints into the `pages/api` folder.

To do so, this package exposes a few different helpers. To get started, follow the steps below:

#### 1. Add this package and Payload to your project

```bash
npm install @payloadcms/next-payload payload
# or
yarn add @payloadcms/next-payload payload
```

#### 2. Run the command to extend your Next app with Payload

```bash
npm run next-payload install
# or
yarn next-payload install
```

#### 3. Add `withPayload` to your `next.config`

Payload needs to inject some requirements into your Next config in order to function properly. To install `withPayload`, you need to import it into your `next.config.js` file. Here's an example:

```ts
// next.config.js

const { withPayload } = require("@payloadcms/next-payload");
const path = require("path");

module.exports = withPayload(
  {
    // your Next config here
  },
  {
    configPath: path.resolve(__dirname, "./payload/payload.config.ts"),
  }
);
```

#### 4. Ensure that the newly created `./payload.ts` file has accurate variables

This is a helper file that will allow you to initialize Payload, and then share it across all of your endpoints which is good for warm serverless functions and reusability. Create a file at the root of your project called `getPayload.ts`, with the following contents:

```ts
// getPayload.ts

import { getPayload } from "payload";
import config from "./payload/payload.config";

const getPayload = async () => {
  return getPayloadLocal({
    // Make sure that your environment variables are filled out accordingly
    mongoURL: process.env.MONGODB_URI as string,
    secret: process.env.PAYLOAD_SECRET as string,
    // Notice that we're passing our Payload config
    config,
  });
};

export default getInitializedPayload;
```

And then you're done. Have fun!

## Using the local API

In step 4 above, we are initializing Payload and passing it our Payload config. [The Payload config](https://payloadcms.com/docs/configuration/overview) is central to everything that Payload does.

A great side-effect of having this file located centrally at the root of your project is that you can now import it directly, elsewhere, to leverage the [Payload Local API](https://payloadcms.com/docs/local-api/overview#local-api). The Local API does not use REST or GraphQL, and runs directly on your server talking directly to your database, which saves massively on HTTP-induced latency.

```ts
// app/[slug]/page.tsx

import React from "react";
import { notFound } from "next/navigation";
import getPayload from "../../../payload";

const Page = async ({ params: { slug } }) => {
  const payload = await getPayload();

  const pages = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: slug || "home",
      },
    },
  });

  const page = pages.docs[0];

  if (!page) return notFound();

  return <h1>Hello, this is the "{page.slug}" page!</h1>;
};

export async function generateStaticParams() {
  const payload = await getPayload();

  const pages = await payload.find({
    collection: "pages",
    limit: 0,
  });

  return pages.docs.map(({ slug }) => ({ slug }));
}

export default Page;
```

## Known gotchas

#### Cold start delays

With the nature of serverless functions, you are bound to encounter "cold start" delays when your serverless functions spin up for the first time. Once they're "warm", the problem will go away for a few minutes until the functions become dormant again. But there's little that this package can do about that issue, unfortunately.

If you'd like to avoid cold starts with your Payload API, you can deploy on a server-based platform like [Payload Cloud](https://payloadcms.com/new) instead.

#### Need to sign up for additional vendors

To deploy Payload on Vercel, you'll need to configure additional vendors for the following:

- Database (MongoDB Atlas)
- File storage (AWS S3 or similar) with Payload's [Cloud Storage Plugin](https://github.com/payloadcms/plugin-cloud-storage)
- Email service (Resend, Sendgrid)

If you don't want to go out and sign up for a separate file hosting service, you can just use [Payload Cloud](https://payloadcms.com/new), which gives you file storage, a MongoDB Atlas database, email service by [Resend](https://resend.com), and lots more.
