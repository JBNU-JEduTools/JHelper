const React = require('react');
const GlobalContextProvider = require('./src/context/GlobalContextProvider').default;
const { MDXProvider } = require('@mdx-js/react');
const ObfuscatedEmail = require('./src/components/ObfuscatedEmail').default;

export const wrapRootElement = ({ element }) => (
  <GlobalContextProvider>
    <MDXProvider components={{ ObfuscatedEmail: ObfuscatedEmail }}>
      {element}
    </MDXProvider>
  </GlobalContextProvider>
);

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <meta
      key="csp"
      httpEquiv="Content-Security-Policy"
      content="default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; connect-src 'self'; manifest-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
    />
  ]);
};
