module.exports = {
  pathPrefix:`JHelper`,
  siteMetadata: {
    title: `Document Of JEdutools`,
    name: `JHelper`,
    siteUrl: `http://jedutools.jbnu.ac.kr`,
    description: `This is my description that will be used in the meta tags and important for search results`,
    social: [
      {
        name: `github`,
        url: `https://github.com/JBNU-JEduTools/JHelper`
      },
      {
        name: `kakao`,
        url: `https://open.kakao.com/o/gNqEqr6c`
      }
    ],
    sidebarConfig: {
      forcedNavOrder: ['/','/JCode','/JStackOverflow','/JHelper'],
      ignoreIndex: false
    }
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `content`,
        name: `content`
      }
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 704
            }
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              icon: false
            }
          },
          `gatsby-remark-embed-video`
        ]
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `JHelper`,
        short_name: `JHelper`,
        start_url: `/`,
        background_color: `#182952`,
        theme_color: `#a2466c`,
        display: `standalone`,
        icon: 'src/site-icon.png'
      }
    },
    `gatsby-plugin-sharp`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-theme-ui`,
    `gatsby-plugin-react-helmet`
  ]
};
