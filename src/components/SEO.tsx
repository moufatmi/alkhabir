import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEO = ({
    title = "الخبير | Alkhabir - المساعد الذكي للقانوني",
    description = "منصة الخبير القانونية: مساعد ذكي للقضاة، المحامين، والطلبة. تحليل القضايا، الإجابة على الأسئلة القانونية، وتوليد التقارير.",
    keywords = "قانون, محامي, قاضي, المغرب, استشارات قانونية, ذكاء اصطناعي, تحليل قانوني",
    image = "/og-image.jpg", // Default OG image path, needs to be created or mapped
    url = "https://alkhabir.tech",
    type = "website",
}: SEOProps) => {
    const siteTitle = "الخبير | Alkhabir";
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

    // Structured Data (JSON-LD)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Alkhabir",
        "url": "https://alkhabir.tech",
        "description": description,
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://alkhabir.tech/?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content="ar_MA" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};
