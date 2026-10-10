import Head from "next/head";
import { FunctionComponent } from "react";

type Props = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
};

const SITE_NAME = "Apple Store Mbarara";

const SeoHead: FunctionComponent<Props> = ({ title, description, image, url, type = "website" }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}

      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Head>
  );
};

export default SeoHead;
