import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

const AbsoluteLink = ({ href, children, ...props }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `);

  const siteUrl = data.site.siteMetadata.siteUrl;
  let fullUrl = href;

  if (href && href.startsWith('/')) {
    fullUrl = siteUrl + href;
  }

  return (
    <a href={fullUrl} {...props}>
      {children}
    </a>
  );
};

export default AbsoluteLink;
