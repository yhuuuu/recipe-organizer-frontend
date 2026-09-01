import { Recipe } from '@/types/Recipe';

/**
 * Read-only sample recipes shown to visitors who are not signed in, and used
 * as an offline fallback when the API is unreachable.
 *
 * The titles, ingredients and steps are real output from this app's own
 * /api/extract endpoint, run against the sourceUrl of each recipe — so the demo
 * shows what the AI extraction actually produces, not hand-written copy.
 *
 * Photos are swapped for freely licensed ones: the source sites' own photography
 * is copyrighted and cannot ship in a public repo. All are CC BY-SA and require
 * attribution, which lives in the site footer — keep these credits accurate:
 * - Duck:   "Roast leg of duck, Ehrenbach" by Gerda Arendt, CC BY-SA 4.0
 * - Salmon: "Salmon with garlic and herbs..." by HaJunkiyada, CC BY-SA 4.0
 * - Pork:   "Svinemorbrad med bacon og rodfrugter" by cyclonebill, CC BY-SA 2.0
 * - Mapo:   "Authentic Mapo Tofu" by Sichuanfoodlover, CC BY-SA 4.0
 * - Oyakodon: "Oyakodon 003" by Ocdp, CC0 (no attribution required)
 */
export function getDemoRecipes(): Recipe[] {
  return [
    {
      id: 'demo-1',
      title: 'Honey Roast Duck',
      image:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Roast_leg_of_duck%2C_Ehrenbach.jpg/960px-Roast_leg_of_duck%2C_Ehrenbach.jpg',
      ingredients: [
        '2 teaspoons salt',
        '2 teaspoons paprika',
        '1 teaspoon garlic powder',
        '1 teaspoon black pepper',
        '1/4 cup honey',
        '5 pounds whole duck',
        '1/4 onion',
        'Garlic cloves',
        'Fresh rosemary sprigs',
        'Optional: lemon slices or a quartered apple',
      ],
      steps: [
        'Completely defrost the duck in the refrigerator for 2-3 days if frozen. Remove giblets and neck, rinse well inside and out with cold water, and pat completely dry. Let the duck sit at room temperature for 30 minutes.',
        'Use a sharp knife to score the duck breast skin in a diamond pattern, cutting only through the skin and fat, not the meat. Poke or slash other fatty areas near the legs.',
        'Stuff the cavity with garlic cloves, quartered onion, and rosemary sprigs. Optionally use lemon slices or a quartered apple.',
        'Fold loose skin over the cavity openings and truss the legs together with butcher’s twine.',
        'Mix salt, paprika, garlic powder, and black pepper in a small bowl. Rub the seasoning mixture all over the duck.',
        'Place the duck breast-side up on a wire rack over a baking sheet or roasting pan.',
        'Roast at 425°F for 15 minutes. Reduce oven temperature to 350°F and roast for 1 hour and 15 minutes.',
        'At the 60-minute mark, brush half the honey over the duck. After 10 minutes, brush with the remaining honey.',
        'If juices are still pink after 1 1/2 hours total cooking time, roast for another 15 minutes.',
        'Remove from oven, tent with foil, and rest for 15 minutes before carving.',
      ],
      cuisine: 'Western',
      sourceUrl: 'https://houseofnasheats.com/honey-roast-duck-recipe/',
      rating: 5,
      isWishlisted: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'demo-2',
      title: 'Creamy Spinach Stuffed Salmon',
      image:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Liat_Portal_for_Foodie_Disorder_-_Salmon_with_garlic_and_herbs%2C_crushed_potatoes_and_peas.jpg/960px-Liat_Portal_for_Foodie_Disorder_-_Salmon_with_garlic_and_herbs%2C_crushed_potatoes_and_peas.jpg',
      ingredients: [
        '4 skinless salmon fillets',
        '1 pinch salt',
        '1 pinch pepper',
        '2 tablespoons lemon juice',
        '2 tablespoons olive oil, divided',
        '1 tablespoon unsalted butter',
        '4 ounces cream cheese, at room temperature',
        '4 ounces frozen spinach, thawed',
        '1/4 cup parmesan cheese, finely grated',
        '2 teaspoons minced garlic',
        '1 tablespoon unsalted butter (optional garlic butter)',
        '1 tablespoon minced garlic (optional garlic butter)',
        '1 tablespoon lemon juice (optional garlic butter)',
      ],
      steps: [
        'Place each salmon fillet on a flat surface. Season both sides with salt, pepper, 1 tablespoon olive oil and lemon juice. Cut a slit or pocket about 3/4 of the way through each fillet, being careful not to cut all the way through.',
        'Squeeze excess liquid out of the spinach and discard the liquid. In a medium bowl, mix together the spinach, cream cheese, parmesan cheese and garlic. Season with salt and pepper.',
        'Fill salmon pockets with 1-2 tablespoons of the spinach mixture, spreading evenly with the back of a spoon.',
        'For stovetop cooking: Heat butter and remaining olive oil in a skillet over medium-high heat. Add the salmon and cook until golden, about 6-7 minutes. Carefully flip and cook the other side until golden and cooked through, another 6-7 minutes. Optionally cover with a lid and cook for an additional 2-3 minutes if needed.',
        'Transfer salmon to a warm plate. To make garlic butter, melt butter in the remaining pan juices. Add garlic and lemon juice and saute until fragrant, about 30 seconds. Serve with the salmon.',
        'For oven baking: Preheat oven to 350°F (175°C). Place stuffed salmon fillets in a lightly greased baking dish. Bake for 10-15 minutes or until salmon is opaque in the center and flakes easily with a fork.',
        'Pour pan juices into a skillet. Add butter, garlic and lemon juice and saute until fragrant, about 30 seconds. Serve with the salmon.',
      ],
      cuisine: 'Western',
      sourceUrl: 'https://cafedelites.com/creamy-spinach-stuffed-salmon/',
      rating: 5,
      isWishlisted: false,
      createdAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'demo-3',
      title: 'Bacon Wrapped Pork Tenderloin',
      image:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Svinem%C3%B8rbrad_med_bacon_og_rodfrugter_%285018776216%29.jpg/960px-Svinem%C3%B8rbrad_med_bacon_og_rodfrugter_%285018776216%29.jpg',
      ingredients: [
        '8 to 10 slices streaky bacon, long enough to wrap around the pork',
        '1 lb / 500g pork tenderloin, at room temperature',
        'Salt and pepper',
        '1 tbsp olive oil',
        '2 tbsp honey or maple syrup',
      ],
      steps: [
        'Preheat oven to 200°C/390°F (180°C fan).',
        'Lay the bacon strips vertically on a board, slightly overlapping so there is enough bacon to wrap around the pork.',
        'Season the pork with salt and pepper. Tuck the thin end of the fillet under so the pork is an even thickness.',
        'Heat olive oil in an oven-proof skillet over high heat. Sear the pork on all sides until browned, about 5 minutes. Remove and cool slightly.',
        'Place the pork on the bacon strips and roll tightly so the bacon wraps around the fillet. Finish with the seam side down.',
        'Transfer the wrapped pork back into the skillet. Drizzle with honey and brush over the bacon.',
        'Bake for 25 minutes, basting with pan juices at the 20-minute mark, until the internal temperature reaches 65°C / 149°F.',
        'Remove from oven and rest for 5 minutes. Baste again before slicing and serving with the pan juices.',
      ],
      cuisine: 'Western',
      sourceUrl: 'https://www.recipetineats.com/bacon-wrapped-pork-tenderloin/',
      rating: 4,
      isWishlisted: true,
      createdAt: '2024-01-03T00:00:00.000Z',
    },
    {
      id: 'demo-4',
      title: 'Oyakodon (Chicken and Egg Rice Bowl)',
      image:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Oyakodon_003.jpg/960px-Oyakodon_003.jpg',
      ingredients: [
        '½ onion (4 oz, 113 g; peeled)',
        '10 oz boneless, skinless chicken thighs',
        '1 Tbsp sake',
        '3-4 large eggs',
        '½ cup dashi (Japanese soup stock)',
        '2 Tbsp soy sauce',
        '2 Tbsp mirin',
        '2 tsp sugar',
        '2 servings cooked Japanese short-grain rice',
        '4 sprigs mitsuba or green onion/scallion',
        'shichimi togarashi (optional)',
        'Japanese sansho pepper (optional)',
      ],
      steps: [
        'Combine dashi, soy sauce, mirin, and sugar in a bowl and mix until the sugar dissolves.',
        'Slice the onion and chop the mitsuba or green onion.',
        'Trim excess fat from the chicken thighs and cut into bite-sized pieces using the sogigiri cutting technique.',
        'Sprinkle sake over the chicken and let sit for 5 minutes.',
        'Crack the eggs into a bowl and gently cut the egg whites with chopsticks without fully beating the eggs.',
        'Add sliced onions and seasoning mixture to a medium frying pan in a single layer.',
        'Bring to a simmer over medium heat.',
        'Add the chicken on top of the onions and cook uncovered for about 5 minutes until the chicken is no longer pink and the onions are tender, flipping the chicken halfway through.',
        'Increase the heat to medium and drizzle two-thirds of the eggs over the simmering chicken and onions, avoiding the pan edges.',
        'When the eggs are still runny but beginning to set, add the remaining eggs and top with mitsuba or green onion.',
        'Cook until the eggs reach your preferred doneness.',
        'Serve steamed rice in bowls and spoon the chicken, egg mixture, and sauce over the rice.',
        'Garnish with shichimi togarashi and sansho pepper if desired.',
      ],
      cuisine: 'Japanese',
      sourceUrl: 'https://www.justonecookbook.com/oyakodon/',
      rating: 5,
      isWishlisted: false,
      createdAt: '2024-01-04T00:00:00.000Z',
    },
    {
      id: 'demo-5',
      title: 'Mapo Tofu',
      image:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Authentic_Mapo_Tofu.jpg/960px-Authentic_Mapo_Tofu.jpg',
      ingredients: [
        '1/2 cup oil (divided)',
        '1-2 fresh Thai bird chili peppers (thinly sliced)',
        '6-8 dried red chilies (roughly chopped)',
        '1/2-1 1/2 tablespoons Sichuan peppercorns (powdered or finely ground, reserving 1/4 teaspoon for garnish)',
        '3 tablespoons ginger (finely minced)',
        '3 tablespoons garlic (finely minced)',
        '8 ounces ground pork',
        '1-2 tablespoons spicy bean sauce',
        '2/3 cup low sodium chicken broth (or water)',
        '1 pound silken tofu (cut into 1-inch cubes)',
        '1/4 cup water',
        '1 1/2 teaspoons cornstarch',
        '1/4 teaspoon sesame oil (optional)',
        '1/4 teaspoon sugar (optional)',
        '1 scallion (finely chopped)',
      ],
      steps: [
        'Heat a wok or small saucepan over low heat. Add half of the oil along with the fresh and dried chilies. Stir occasionally and cook for about 5 minutes until fragrant, making sure the peppers do not burn. Remove from heat and set aside.',
        'Heat the remaining oil in the wok over medium heat. Add the ginger and cook for 1 minute, then add the garlic and fry for another minute.',
        'Turn the heat to high and add the ground pork. Break up the meat and cook until fully browned.',
        'Add the ground Sichuan peppercorns and stir for 15-30 seconds, being careful not to burn them.',
        'Add the spicy bean sauce and stir well to combine.',
        'Pour in the chicken broth and simmer for about 1 minute.',
        'Mix the water and cornstarch in a small bowl until smooth.',
        'Add the cornstarch slurry to the sauce and stir until the sauce thickens. Add a little more water or stock if needed.',
        'Add the prepared chili oil and peppers back into the wok and stir into the sauce.',
        'Gently add the tofu and toss carefully with a spatula to coat in the sauce. Cook for 3-5 minutes.',
        'Stir in the sesame oil, sugar, and scallions. Cook until the scallions are just wilted.',
        'Serve hot, garnished with additional Sichuan peppercorn powder if desired.',
      ],
      cuisine: 'Chinese',
      sourceUrl: 'https://thewoksoflife.com/ma-po-tofu-real-deal/',
      rating: 5,
      isWishlisted: true,
      createdAt: '2024-01-05T00:00:00.000Z',
    },
  ];
}

export function findDemoRecipe(id: string): Recipe | null {
  return getDemoRecipes().find((recipe) => recipe.id === id) || null;
}
