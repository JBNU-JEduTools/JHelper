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



// gatsby-node.js
exports.onPostBuild = () => {
  const fs = require('fs');
  const path = require('path');
  
  console.log('🔒 화이트리스트 방식으로 빌드 경로만 제거...');
  
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
  
  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;
      
      // 🎯 정확히 아는 빌드 경로만 화이트리스트로 제거
      const exactBuildPaths = [
        // 현재 확인된 빌드 경로들만
        'C:\\\\Users\\\\oslab\\\\develop\\\\jhelper-sec',
        '/home/runner/work/JHelper/JHelper',
        '/opt/buildhome/repo',
        '/opt/build/repo', 
        '/vercel/path0',
        // 향후 발견되는 빌드 경로 추가
      ];
      
      exactBuildPaths.forEach(buildPath => {
        // 정확한 문자열 매칭만 (정규식 사용 안함)
        if (content.includes(buildPath)) {
          // 컨텍스트 확인: MDX 설정 객체 내부인지 체크
          const beforePath = content.substring(0, content.indexOf(buildPath));
          const isInMdxConfig = beforePath.includes('root:"') || 
                               beforePath.includes('"root":') ||
                               beforePath.includes('root:');
          
          if (isInMdxConfig) {
            // MDX 설정에서만 제거
            content = content.replace(buildPath, '.');
            console.log(`    🔧 빌드 경로 제거: ${buildPath}`);
          } else {
            // 교육 내용일 가능성이 높으므로 건드리지 않음
            console.log(`    📚 교육 내용 보존: ${buildPath}`);
          }
        }
      });
      
      // root 속성의 값만 정확히 타겟팅
      const rootPatterns = exactBuildPaths.map(buildPath => {
        // 이스케이프 처리
        const escaped = buildPath.replace(/[\\]/g, '\\\\');
        return {
          pattern: new RegExp(`root:"${escaped}"`, 'g'),
          replacement: 'root:"."'
        };
      });
      
      rootPatterns.forEach(({pattern, replacement}) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          console.log(`    🔧 root 속성 수정됨`);
        }
      });
      
      // 변경사항이 있으면 파일 저장
      if (content !== original) {
        fs.writeFileSync(filePath, content);
        processedCount++;
        console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
      }
    } catch (error) {
      console.error(`  ❌ ${filePath}: ${error.message}`);
    }
  });
  
  console.log(`🎉 ${processedCount}개 파일에서 빌드 경로만 제거 완료`);
};