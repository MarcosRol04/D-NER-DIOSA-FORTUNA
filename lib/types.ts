export type Category = {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductOptionGroup = {
  id: string;
  name: string; // ex: "Mărime"
  type: "single" | "multiple"; // single = radio, multiple = checkbox
  required: boolean;
  display_order: number;
  choices: ProductOptionChoice[];
};

export type ProductOptionChoice = {
  id: string;
  label: string; // ex: "Mare"
  price_delta: number; // ex: 5 (lei), poate fi 0
  display_order: number;
};

export type Product = {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  option_groups?: ProductOptionGroup[];
};

export type RestaurantSettings = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  opening_hours: string | null;
  primary_color: string | null;
  created_at: string;
  updated_at: string;
};

export type SelectedOption = {
  group_id: string;
  group_name: string;
  choice_id: string;
  choice_label: string;
  price_delta: number;
};

export type CartItem = {
  line_id: string; // identificator unic al liniei din coș (produs + opțiuni)
  product_id: string;
  name: string;
  unit_price: number; // preț de bază + opțiuni
  base_price: number;
  image_url: string | null;
  quantity: number;
  selected_options: SelectedOption[];
};
