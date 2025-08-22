
export interface Brand {
    id: string;
    slug: string;
    name: string;
    logo: string;
    tagline: string;
    description: string;
    attestations: {
        vaidyaCount: number;
        clinicCount: number;
        certification: string;
    };
    testimonials?: {
        author: string;
        quote: string;
    }[];
}
