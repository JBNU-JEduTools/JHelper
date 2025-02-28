import React from 'react';
import GlobalContextProvider from './src/context/GlobalContextProvider';
import { MDXProvider } from '@mdx-js/react';
import AbsoluteLink from './src/components/AbsoluteLink';

export const wrapRootElement = ({ element }) => (
  <GlobalContextProvider>
    <MDXProvider components={{ a: AbsoluteLink }}>
      {element}
    </MDXProvider>
  </GlobalContextProvider>
);
