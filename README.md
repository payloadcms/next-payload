# Next + Payload Serverless

This package contains a set of utilities to allow Payload to be deployed seamlessly, serverless, within an existing NextJS project.

It exposes a few different helpers:

1. `next-payload add` - a utility to generate serverless handlers for all of Payload's endpoints
2. `next-payload build`- builds the Payload admin UI for production, and then copies it into the NextJS public folder
3. `withPayload` - a NextJS config plugin that adds required Next configuration options for Payload to work properly
