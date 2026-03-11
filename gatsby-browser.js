import React from 'react';
import GlobalContextProvider from './src/context/GlobalContextProvider';
import { MDXProvider } from '@mdx-js/react';
import AbsoluteLink from './src/components/AbsoluteLink';
import ObfuscatedEmail from './src/components/ObfuscatedEmail';

export const wrapRootElement = ({ element }) => (
  <GlobalContextProvider>
    <MDXProvider components={{ a: AbsoluteLink, ObfuscatedEmail: ObfuscatedEmail }}>
      {element}
    </MDXProvider>
  </GlobalContextProvider>
);
