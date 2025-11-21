import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  return (
    <Html lang="es">
      <Head>
        {/* Inject basePath for client-side asset loading */}
        {basePath && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Force Next.js to use basePath for dynamic imports
                if (window.__NEXT_DATA__) {
                  window.__NEXT_DATA__.assetPrefix = "${basePath}/";
                }
              `,
            }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}