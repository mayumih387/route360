const createAdapterCloudflare = (adapterOptions) => {
  return {
    name: `gatsby-adapter-cloudflare`,
    // cache hooks...
    adapt({ routesManifest, functionsManifest, trailingSlash, reporter }) {
      // Adapt implementation
      reporter.info("gatsby-adapter-cloudflare is working")
    },
  }
}

module.exports = createAdapterCloudflare
