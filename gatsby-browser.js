import React from 'react';
import GlobalContextProvider from './src/context/GlobalContextProvider';
import { MDXProvider } from '@mdx-js/react';
import ObfuscatedEmail from './src/components/ObfuscatedEmail';

export const wrapRootElement = ({ element }) => (
  <GlobalContextProvider>
    <MDXProvider components={{ ObfuscatedEmail: ObfuscatedEmail }}>
      {element}
    </MDXProvider>
  </GlobalContextProvider>
);
