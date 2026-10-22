export interface Category {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  itemCount: number;
  tag: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "mom-baby",
    slug: "mom-baby",
    name: "MOM & BABY",
    subtitle: "Thoughtful finds for little ones and moms.",
    description: "Gentle baby nail trimmers, safe teething toys, developmental play mats, and mother essentials engineered with love.",
    image: "/assets/images/baby-nail-trimmer-345704.jpg",
    itemCount: 0,
    tag: "Popular"
  },
  {
    id: "home-kitchen",
    slug: "home-kitchen",
    name: "Home & Kitchen",
    subtitle: "Make daily routines simpler.",
    description: "Clever kitchen tools, portable juicers, smart dispensers, and space-saving home organizers.",
    image: "/assets/images/img_9_image_9.jpg",
    itemCount: 0,
    tag: "Everyday Essentials"
  },
  {
    id: "fun-clever-finds",
    slug: "fun-clever-finds",
    name: "Fun & Clever Finds",
    subtitle: "Little discoveries worth exploring.",
    description: "Interactive sound books, educational phonics, creative kits, and engaging screen-free toys.",
    image: "/assets/images/sg-11134201-8258y-mrijem69q5mv52.jpg",
    itemCount: 0,
    tag: "Curated"
  },
  {
    id: "smart-gadgets",
    slug: "smart-gadgets",
    name: "Smart Gadgets",
    subtitle: "Clever solutions for everyday tasks.",
    description: "Touch desk lamps, wireless charging solutions, handy electronic tools, and innovative lifestyle electronics.",
    image: "/assets/images/05c4b395-69c2-4496-b44a-9226c253cbcb.jpg",
    itemCount: 0,
    tag: "New Arrivals"
  }
];
