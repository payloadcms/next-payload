# Email Configuration

To configure your email service. Enter your email configuration in the `payload/getPayloadClient.{ts,js}` file.

Example:

```ts
// payload/getPayloadClient.ts

if (!cached.promise) {
  cached.promise = await getPayload({
    // Make sure that your environment variables are filled out accordingly
    mongoURL: process.env.MONGODB_URI as string,
    secret: process.env.PAYLOAD_SECRET as string,
    config: config,
    email: {
      fromAddress: 'admin@test.com',
      fromName: 'Admin',
      logMockCredentials: true,
    }
  })
}
```

For more information on how to configure emails for Payload CMS, refer to the [Email Documentation](https://payloadcms.com/docs/email/overview).
