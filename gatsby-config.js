module.exports = {
  pathPrefix: `/`,
  siteMetadata: {
    title: `Document Of JEdutools`,
    name: `JHelper`,
    siteUrl: `https://jhelper.jbnu.ac.kr`,
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
      forcedNavOrder: ['/JCloud', '/Litmus', '/JCode', '/JFlow', '/JHelper', '/JIGSSO (통합 로그인)', '/Portal'],
      ignoreIndex: false
    }
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `Inter\:400,500,600,700`
        ],
        display: 'swap'
      }
    },
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
              maxWidth: 1200,
              quality: 80,
              linkImagesToOriginal: true,
              disableBgImageOnAlpha: true
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
