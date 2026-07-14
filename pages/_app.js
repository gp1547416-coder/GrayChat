// pages/_app.js
import '../styles/globals.css'   // relative import – works without any config

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
