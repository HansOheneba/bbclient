export type Product = {
  id: string;
  name: string;
  category: "boba" | "iced-tea" | "shawarma";
  description: string;
  price: number;
  image: string;
  variants?: {
    name: string;
    options: string[];
  }[];
};

export const products: Product[] = [
  // Boba
  {
    id: "boba-1",
    name: "Classic Milk Tea Boba",
    category: "boba",
    description: "Smooth and creamy milk tea with chewy tapioca pearls",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
      {
        name: "Sugar Level",
        options: ["0%", "25%", "50%", "75%", "100%"],
      },
      {
        name: "Ice Level",
        options: ["Light", "Regular", "Extra"],
      },
    ],
  },
  {
    id: "boba-2",
    name: "Taro Boba",
    category: "boba",
    description: "Vibrant purple taro milk tea with signature boba pearls",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
      {
        name: "Sugar Level",
        options: ["0%", "25%", "50%", "75%", "100%"],
      },
    ],
  },
  {
    id: "boba-3",
    name: "Mango Boba",
    category: "boba",
    description: "Refreshing mango flavored boba tea with fresh mango bits",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
      {
        name: "Topping",
        options: ["Boba", "Popping Boba", "Pudding", "Jelly"],
      },
    ],
  },
  {
    id: "boba-4",
    name: "Strawberry Boba",
    category: "boba",
    description: "Sweet and tangy strawberry milk tea with chewy boba",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
    ],
  },

  // Iced Tea
  {
    id: "tea-1",
    name: "Jasmine Green Iced Tea",
    category: "iced-tea",
    description: "Crisp and aromatic jasmine green tea, perfectly chilled",
    price: 4.49,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
      {
        name: "Sugar Level",
        options: ["No Sugar", "Light", "Regular", "Extra Sweet"],
      },
    ],
  },
  {
    id: "tea-2",
    name: "Lemon Iced Tea",
    category: "iced-tea",
    description:
      "Zesty lemon infused iced tea with a perfect balance of tart and sweet",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
      {
        name: "Honey/Sugar",
        options: ["No Sweetener", "Honey", "Regular Sugar"],
      },
    ],
  },
  {
    id: "tea-3",
    name: "Peach Iced Tea",
    category: "iced-tea",
    description: "Smooth peach flavored iced tea with natural ingredients",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
    ],
  },
  {
    id: "tea-4",
    name: "Mango Iced Tea",
    category: "iced-tea",
    description: "Tropical mango flavored iced tea, refreshingly smooth",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Small (16oz)", "Large (24oz)"],
      },
    ],
  },

  // Shawarma
  {
    id: "shawarma-1",
    name: "Chicken Shawarma",
    category: "shawarma",
    description:
      "Tender marinated chicken with authentic spices, served in flatbread",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Regular", "Large"],
      },
      {
        name: "Sauce",
        options: ["Garlic Sauce", "Tahini Sauce", "Both"],
      },
      {
        name: "Vegetables",
        options: ["Standard", "Extra Veggies", "Light Veggies"],
      },
    ],
  },
  {
    id: "shawarma-2",
    name: "Beef Shawarma",
    category: "shawarma",
    description:
      "Succulent marinated beef with Mediterranean spices, served warm",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Regular", "Large"],
      },
      {
        name: "Sauce",
        options: ["Garlic Sauce", "Tahini Sauce", "Both"],
      },
    ],
  },
  {
    id: "shawarma-3",
    name: "Mixed Shawarma",
    category: "shawarma",
    description: "Combination of tender chicken and beef with fresh vegetables",
    price: 10.49,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Regular", "Large"],
      },
      {
        name: "Meat Ratio",
        options: ["50/50", "More Chicken", "More Beef"],
      },
    ],
  },
  {
    id: "shawarma-4",
    name: "Vegetarian Shawarma",
    category: "shawarma",
    description:
      "Delicious plant-based shawarma with seasoned vegetables and falafel",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1599599810694-b3ba31ba36cd?w=400",
    variants: [
      {
        name: "Size",
        options: ["Regular", "Large"],
      },
      {
        name: "Extra Protein",
        options: ["None", "Falafel", "Hummus"],
      },
    ],
  },
];

export const getProductsByCategory = (category: Product["category"]) => {
  return products.filter((p) => p.category === category);
};

export const getProductById = (id: string) => {
  return products.find((p) => p.id === id);
};
