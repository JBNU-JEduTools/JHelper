import styled from '@emotion/styled';
import { graphql, useStaticQuery } from 'gatsby';
import React, { useState } from 'react';
import NavItem from './NavItem';

/**
 * This File was inspired by https://github.com/hasura/gatsby-gitbook-starter
 */

const calculateTreeData = (edges, sidebarConfig) => {
  const originalData = sidebarConfig.ignoreIndex
    ? edges.filter(
        ({
          node: {
            fields: { slug }
          }
        }) => slug !== '/'
      )
    : edges;

  if (originalData.length === 0) {
    return { items: [] };
  }

  const tree = originalData.reduce(
    (
      accu,
      {
        node: {
          fields: { slug, title }
        }
      }
    ) => {
      const parts = slug.split('/');
      let { items: prevItems } = accu;
      for (const part of parts.slice(1, -1)) {
        let tmp = prevItems.find(({ label }) => label === part);
        if (tmp) {
          if (!tmp.items) {
            tmp.items = [];
          }
        } else {
          tmp = { label: part, items: [] };
          prevItems.push(tmp);
        }
        prevItems = tmp.items;
      }
      const existingItem = prevItems.find(({ label }) => label === parts[parts.length - 1]);
      if (existingItem) {
        existingItem.url = slug;
        existingItem.title = title;
      } else {
        prevItems.push({
          label: parts[parts.length - 1],
          url: slug,
          items: [],
          title
        });
      }
      return accu;
    },
    { items: [] }
  );
  const forcedNavOrder = sidebarConfig.forcedNavOrder || [];
  const tmp = [...forcedNavOrder];
  tmp.reverse();
  return tmp.reduce((accu, slug) => {
    const parts = slug.split('/');
    let { items: prevItems } = accu;
    for (const part of parts.slice(1, -1)) {
      let tmp = prevItems.find(({ label }) => label === part);
      if (tmp) {
        if (!tmp.items) {
          tmp.items = [];
        }
      } else {
        tmp = { label: part, items: [] };
        prevItems.push(tmp);
      }
      prevItems = tmp.items;
    }
    prevItems.forEach(item => {
      item.items = item.items.sort(function(a, b) {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
      });
    });
    const index = prevItems.findIndex(({ label }) => label === parts[parts.length - 1]);
    accu.items.unshift(prevItems.splice(index, 1)[0]);
    return accu;
  }, tree);
};

const filterTreeData = (items) => {
  return items.filter(item => item.url !== '/').map(item => {
    if (item.items) {
      item.items = filterTreeData(item.items);
    }
    return item;
  });
};

const Navigation = () => {
  const result = useStaticQuery(graphql`
    query {
      allSite {
        edges {
          node {
            siteMetadata {
              sidebarConfig {
                forcedNavOrder
                ignoreIndex
              }
            }
          }
        }
      }
      allMdx {
        edges {
          node {
            fields {
              slug
              title
            }
          }
        }
      }
    }
  `);
  const { allSite, allMdx } = result;
  const { sidebarConfig } = allSite.edges[0].node.siteMetadata;

  const [treeData] = useState(() => {
    const unfilteredTreeData = calculateTreeData(allMdx.edges, sidebarConfig);
    return { items: filterTreeData(unfilteredTreeData.items) };
  });
  
  return (
    <NavList>
      <NavItem {...treeData} />
    </NavList>
  );
};

const NavList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export default React.memo(Navigation);
