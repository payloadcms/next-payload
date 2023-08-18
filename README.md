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
npx next-payload install
# or
yarn next-payload install
```

#### 3. Your `.env` should include:

```env
# mongo connection string
MONGODB_URI=mongodb://127.0.0.1/create-next-app-serverless
# payload secret
PAYLOAD_SECRET=SOME_SECRET
# path to your payload.config file
PAYLOAD_CONFIG_PATH=payload/payload.config.ts
```

#### 4. Add `withPayload` to your `next.config`

Payload needs to inject some requirements into your Next config in order to function properly. To install `withPayload`, you need to import it into your `next.config.js` file. Here's an example:

```ts
// next.config.js
const path = require("path");
const { withPayload } = require("@payloadcms/next-payload");

module.exports = withPayload(
  {
    // your Next config here
  },
  {
    // The second argument to `withPayload`
    // allows you to specify paths to your Payload dependencies
    // and configure the admin route to your Payload CMS.

    // Point to your Payload config (Required)
    configPath: path.resolve(__dirname, "./payload/payload.config.ts"),

    // Point to custom Payload CSS (optional)
    cssPath: path.resolve(__dirname, "./css/my-custom-payload-styles.css"),

    // Point to your exported, initialized Payload instance (optional, default shown below`)
    payloadPath: path.resolve(process.cwd(), "./payload/payloadClient.ts"),

    // Set a custom Payload admin route (optional, default is `/admin`)
    // NOTE: Read the "Set a custom admin route" section in the payload/next-payload README.
    adminRoute: "/admin",
  }
);
```

And then you're done. Have fun!

## Using the local API

The `payload/payloadClient.ts` file will be added for you after running `yarn next-payload install` (step 2). You can import `getPayloadClient` from that file from within server components to leverage the [Payloads Local API](https://payloadcms.com/docs/local-api/overview#local-api). The Local API does not use REST or GraphQL, and runs directly on your server talking directly to your database, which saves massively on HTTP-induced latency.

Here is an example:

```ts
// app/[slug]/page.tsx

import React from "react";
import { notFound } from "next/navigation";
import { getPayloadClient } from "../../payload/payloadClient";

const Page = async ({ params: { slug } }) => {
  const payload = await getPayloadClient();

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
  const payload = await getPayloadClient();

  const pages = await payload.find({
    collection: "pages",
    limit: 0,
  });

  return pages.docs.map(({ slug }) => ({ slug }));
}

export default Page;
```

## Set a custom admin route

Payload makes it simple to set a [custom `admin` route](https://payloadcms.com/docs/configuration/overview#options). However, since we are using `next-payload` and relying on Next.js to handle all routing, we need to also tell Next.js to rewrite all admin related routes to Payload.

This is handled automatically by wrapping the Next.js configuration in `withPayload`, which by default sets the admin route to `/admin`. If you wish to change this default behavior, we need to do a couple of things.

In the following example, we are changing the admin route to `/dashboard`.

#### 1. Configure the `admin` route in `payload/payload.config.ts` as per the [Payload documentation](https://payloadcms.com/docs/configuration/overview#options).

```ts
export default buildConfig({
  // ... Payload config goes here
  routes: {
    admin: "/dashboard",
  },
});
```

#### 2. Rename the `admin` directory under `/app` to `dashboard`.

#### 3. Set `adminRoute: "/dashboard",` in the Payload configuration in `next.config.js` as per the documentation above.

## Known gotchas

#### Custom endpoint handlers

To use custom endpoints Next.JS requires you to put a path segment in between two dynamic route parameters. Therefore it is necessary to add some segment, which defaults to `endpoints`. This can be adjusted through editing the name of the folder.

##### Example API call

```ts
// Expected
const data = await fetch('https://YOUR_CUSTOM_URL/api/[collection]/[...path]');
// Required change
const data = await fetch('https://YOUR_CUSTOM_URL/api/[collection]/endpoints/[...path]');
```

#### Cold start delays

With the nature of serverless functions, you are bound to encounter "cold start" delays when your serverless functions spin up for the first time. Once they're "warm", the problem will go away for a few minutes until the functions become dormant again. But there's little that this package can do about that issue, unfortunately.

If you'd like to avoid cold starts with your Payload API, you can deploy on a server-based platform like [Payload Cloud](https://payloadcms.com/new) instead.

#### Need to sign up for additional vendors

To deploy Payload on Vercel, you'll need to configure additional vendors for the following:

- Database (MongoDB Atlas)
- File storage (AWS S3 or similar) with Payload's [Cloud Storage Plugin](https://github.com/payloadcms/plugin-cloud-storage)
- Email service (Resend, Sendgrid)

If you don't want to go out and sign up for a separate file hosting service, you can just use [Payload Cloud](https://payloadcms.com/new), which gives you file storage, a MongoDB Atlas database, email service by [Resend](https://resend.com), and lots more.
