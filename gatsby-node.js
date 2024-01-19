const startCase = require('lodash/startCase');

exports.createPages = async ({ actions, graphql, reporter }) => {
  const result = await graphql(
    `
      {
        allMdx {
          edges {
            node {
              fields {
                id
                slug
              }
              tableOfContents
            }
          }
        }
      }
    `
  );
  if (result.errors) {
    reporter.panic('error loading content', result.errors);
    return;
  }
  result.data.allMdx.edges.forEach(({ node }) => {
    actions.createPage({
      path: node.fields.slug ? node.fields.slug : '/',
      component: require.resolve('./src/templates/docs'),
      context: {
        id: node.fields.id
      }
    });
  });
};

exports.onCreateNode = ({ node, getNode, actions, reporter }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `Mdx`) {
    const parent = getNode(node.parent);
    const title = node.frontmatter.title || startCase(parent.name);

    let slugValue = node.frontmatter.slug;
    if (!slugValue && parent.relativePath) {
      slugValue = parent.relativePath.replace(parent.ext, '');
    }

    if (!slugValue) {
      reporter.panic(`Cannot create node with title: ${title}, there is no relative path or frontmatter to set the "slug" field`);
      return;
    }

    if (slugValue === 'index') {
      slugValue = '';
    }

    if (slugValue.startsWith('/JHelper/')) {
      slugValue = slugValue.replace('/JHelper', '');
    }

    createNodeField({
      name: `slug`,
      node,
      value: `/${slugValue}`
    });

    createNodeField({
      name: 'id',
      node,
      value: node.id
    });

    createNodeField({
      name: 'title',
      node,
      value: title
    });
  }
};
