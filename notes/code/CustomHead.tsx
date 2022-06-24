import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { isBrowser, isUrl } from 'utils';

export interface Meta {
  title?: string;
  description?: string;
  /** absolute (https?://...) or relative path */
  image?: string;
  type?: string;
  date?: string;
}

const CustomHead = ({ ...customMeta }: Meta) => {
  const router = useRouter();
  const baseUrl = isBrowser() && window.location.origin; // without '/'

  const defaultMeta = {
    title: 'Next.js Prisma Boilerplate',
    description: 'Full stack boilerplate with Next.js, Prisma, Tailwind and Docker.',
    image: `${baseUrl}/images/banner.png`,
    type: 'website',
  };

  // returns image with absolute path
  const handleCustomMeta = (_meta: Meta): Meta => {
    const { image } = _meta;
    if (!image || isUrl(image)) return _meta;
    return { ..._meta, image: `${baseUrl}${image}` };
  };

  const meta = { ...defaultMeta, ...handleCustomMeta(customMeta) };

  return (
    <Head>
      <title>{meta.title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />

      <meta name="robots" content="follow, index" />
      <meta content={meta.description} name="description" />
      <link rel="canonical" href={`${baseUrl}${router.asPath}`} />

      {/* og */}
      <meta property="og:url" content={`${baseUrl}${router.asPath}`} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content="Next.js Prisma Boilerplate" />
      <meta property="og:description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:image" content={meta.image} />

      {/* tw */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@my_acc" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      {meta.date && <meta property="article:published_time" content={meta.date} />}
    </Head>
  );
};

export default CustomHead;
