const path = require('path')

module.exports = {
  siteMetadata: {
    title: `Primitive Ecosystem`,
    description: `Library of documentation, resources, and interfaces for the Primitive protocol.`,
    author: `@primitivefinance`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-root-import`,
      options: {
        components: path.join(__dirname, 'src/components'),
        hooks: path.join(__dirname, 'src/hooks'),
        src: path.join(__dirname, 'src'),
        pages: path.join(__dirname, 'src/pages'),
        views: path.join(__dirname, 'src/views'),
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`Nunito Sans\:300, 400, 500, 600, 700`],
        display: 'swap',
      },
    },
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        jsx: true,
      },
    },
  ],
}
