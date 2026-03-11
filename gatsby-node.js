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
    const title = node.frontmatter.title || startCase(parent.name)

    let value =  node.frontmatter.slug;
    if(!value && parent.relativePath){
      value = parent.relativePath.replace(parent.ext, '');
    }
    
    if (!value) {
      reporter.panic(`Can not create node with title: ${title} there is no relative path or frontmatter to set the "slug" field`);
      return;
    }

    if (value === 'index') {
      value = '';
    }

    createNodeField({
      name: `slug`,
      node,
      value: `/${value}`
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

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  if (stage === 'build-javascript') {
    const config = getConfig();
    config.devtool = false;
    actions.replaceWebpackConfig(config);
  }
};

// gatsby-node.js
exports.onPostBuild = () => {
  const fs = require('fs');
  const path = require('path');

  console.log('🔒 정규식 기반으로 빌드 경로 제거...');

  function findFiles(dir, extensions = ['.js', '.json']) {
    let files = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(findFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });

    return files;
  }

  const files = findFiles(path.join(process.cwd(), 'public'));
  let processedCount = 0;

  // Only targets root:"<OS-absolute-path>" — safe, won't touch educational content
  const rootPathRegex = /root:"(?:\/(?:Users|home|opt|var)\/|[A-Z]:\\\\)[^"]*"/g;

  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;

      content = content.replace(rootPathRegex, 'root:"."');

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        processedCount++;
        console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
      }
    } catch (error) {
      console.error(`  ❌ ${filePath}: ${error.message}`);
    }
  });

  console.log(`🎉 ${processedCount}개 파일에서 빌드 경로 제거 완료`);
};