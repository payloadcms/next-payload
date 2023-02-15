const withPayload = (config) => {
  return {
    ...config,
    rewrites: async () => {
      const incomingRewrites = typeof config.rewrites === 'function' ? await config.rewrites() : config.rewrites;
      const resultingRewrites = [ ...incomingRewrites || [] ]

      if (process.env.NODE_ENV === 'production') {
        resultingRewrites.push({
          "source": "/admin",
          "destination": "/admin/index.html"
        })

        resultingRewrites.push({
          "source": "/admin/:path*",
          "destination": "/admin/index.html"
        })
      }
    },
    transpilePackages: [
      ...config.transpilePackages || [],
      'payload',
      'mongoose'
    ]
  }
}

module.exports = withPayload