import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', schema }) => {
  const siteTitle = 'Shivam Traders';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Premium Hindu God Murtis`;
  const desc = description || 'Shop premium handcrafted Hindu God Murtis. Brass, Marble, Wood idols delivered across India. 100% authentic, secure payments, COD available.';
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://shivamtraders.com';
  const img = image || `${siteUrl}/og-image.jpg`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
};

export default SEO;
