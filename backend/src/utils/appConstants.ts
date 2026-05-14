export const PRODUCT_CATEGORIES = [
    'Veg Pickles',
    'Non-Veg Pickles',
    'Sweets & Hots',
    'Veg Biryanis',
    'Non-Veg Biryanis',
    'Dairy-Items',
    'KiranStore',
    'Rotis & Pulkas',
    'Fresh-Vegetables',
    'Raw-Meat & Fish',
    'Masalas-Powders'
] as const;

export const STORE_TYPES = [
    'Veg-Restaurant',
    'NonVeg-Restaurant',
    'Kirana-Store',
    'Dairy-Items',
    'Sweets-Hots',
    'Vegetables',
    'Meat-Fish',
    'IceCream'
] as const;

export const STORE_CATEGORY_MAP: Record<string, string[]> = {
    'Veg-Restaurant': ['Veg Biryanis', 'Rotis & Pulkas', 'Sweets & Hots', 'Veg Pickles'],
    'NonVeg-Restaurant': ['Non-Veg Biryanis', 'Veg Biryanis', 'Rotis & Pulkas', 'Sweets & Hots', 'Non-Veg Pickles'],
    'Kirana-Store': ['KiranStore', 'Dairy-Items', 'Veg Pickles', 'Non-Veg Pickles', 'Masalas-Powders'],
    'Dairy-Items': ['Dairy-Items', 'Sweets & Hots'],
    'Sweets-Hots': ['Sweets & Hots', 'Veg Pickles', 'Masalas-Powders'],
    'Vegetables': ['Fresh-Vegetables', 'KiranStore'],
    'Meat-Fish': ['Raw-Meat & Fish', 'Non-Veg Pickles'],
    'IceCream': ['Sweets & Hots']
};