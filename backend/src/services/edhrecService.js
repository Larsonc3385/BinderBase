/**
 * Service for getting card recommendations from EDHRec
 * Note: EDHRec doesn't have an official API, so we'll use their JSON endpoints
 */

const EDHREC_API_BASE = 'https://json.edhrec.com/pages';

/**
 * Get card recommendations for a specific commander
 * @param {string} commanderName - The name of the commander
 * @returns {Promise<Object>} - Card recommendations
 */
export async function getCommanderRecommendations(commanderName) {
  try {
    // Convert commander name to EDHRec URL format
    // Example: "Atraxa, Praetors' Voice" -> "atraxa-praetors-voice"
    const slug = commanderName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove duplicate hyphens

    const response = await fetch(`${EDHREC_API_BASE}/commanders/${slug}.json`);
    
    if (!response.ok) {
      throw new Error(`Commander not found: ${commanderName}`);
    }
    
    const data = await response.json();
    
    // Extract top cards from different categories
    const recommendations = {
      commander: commanderName,
      topCards: [],
      creatures: [],
      instants: [],
      sorceries: [],
      artifacts: [],
      enchantments: [],
      planeswalkers: [],
      lands: []
    };

    // Process card lists from EDHRec data
    if (data.container?.json_dict?.cardlists) {
      const cardlists = data.container.json_dict.cardlists;
      
      cardlists.forEach(list => {
        const category = list.header?.toLowerCase() || '';
        const cards = list.cardviews?.slice(0, 10).map(card => ({
          name: card.name,
          url: card.url,
          inclusion: card.inclusion, // percentage of decks that include this card
          synergy: card.synergy, // synergy score with commander
          sanitized: card.sanitized
        })) || [];

        if (category.includes('top cards')) {
          recommendations.topCards = cards;
        } else if (category.includes('creature')) {
          recommendations.creatures = cards;
        } else if (category.includes('instant')) {
          recommendations.instants = cards;
        } else if (category.includes('sorcery')) {
          recommendations.sorceries = cards;
        } else if (category.includes('artifact')) {
          recommendations.artifacts = cards;
        } else if (category.includes('enchantment')) {
          recommendations.enchantments = cards;
        } else if (category.includes('planeswalker')) {
          recommendations.planeswalkers = cards;
        } else if (category.includes('land')) {
          recommendations.lands = cards;
        }
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error fetching EDHRec recommendations:', error);
    throw error;
  }
}

/**
 * Get recommendations based on color identity
 * @param {Array<string>} colors - Array of color codes (W, U, B, R, G)
 * @returns {Promise<Object>} - Card recommendations for that color identity
 */
export async function getColorRecommendations(colors) {
  try {
    // Sort colors in WUBRG order
    const colorOrder = { W: 0, U: 1, B: 2, R: 3, G: 4 };
    const sortedColors = [...colors].sort((a, b) => colorOrder[a] - colorOrder[b]);
    
    // Create color identity slug
    const colorMap = {
      '': 'colorless',
      'W': 'w',
      'U': 'u',
      'B': 'b',
      'R': 'r',
      'G': 'g',
      'WU': 'wu',
      'WB': 'wb',
      'WR': 'wr',
      'WG': 'wg',
      'UB': 'ub',
      'UR': 'ur',
      'UG': 'ug',
      'BR': 'br',
      'BG': 'bg',
      'RG': 'rg',
      'WUB': 'wub',
      'WUR': 'wur',
      'WUG': 'wug',
      'WBR': 'wbr',
      'WBG': 'wbg',
      'WRG': 'wrg',
      'UBR': 'ubr',
      'UBG': 'ubg',
      'URG': 'urg',
      'BRG': 'brg',
      'WUBR': 'wubr',
      'WUBG': 'wubg',
      'WURG': 'wurg',
      'WBRG': 'wbrg',
      'UBRG': 'ubrg',
      'WUBRG': 'wubrg'
    };

    const colorKey = sortedColors.join('');
    const slug = colorMap[colorKey] || 'colorless';

    const response = await fetch(`${EDHREC_API_BASE}/top/${slug}.json`);
    
    if (!response.ok) {
      throw new Error('Color recommendations not found');
    }
    
    const data = await response.json();
    
    // Extract top cards for this color identity
    const recommendations = {
      colors: sortedColors,
      cards: []
    };

    if (data.container?.json_dict?.cardlists) {
      const topCards = data.container.json_dict.cardlists[0];
      if (topCards?.cardviews) {
        recommendations.cards = topCards.cardviews.slice(0, 20).map(card => ({
          name: card.name,
          url: card.url,
          sanitized: card.sanitized,
          num_decks: card.num_decks
        }));
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Error fetching color recommendations:', error);
    throw error;
  }
}

/**
 * Search for a commander on EDHRec
 * @param {string} query - Commander name to search
 * @returns {Promise<Array>} - List of matching commanders
 */
export async function searchCommanders(query) {
  try {
    // EDHRec's search is done client-side, so we'll use Scryfall to find commanders
    // and then check if they exist on EDHRec
    const scryfallResponse = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}+is:commander`
    );
    
    if (!scryfallResponse.ok) {
      return [];
    }
    
    const data = await scryfallResponse.json();
    
    return data.data.slice(0, 10).map(card => ({
      name: card.name,
      colors: card.color_identity || [],
      image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal
    }));
  } catch (error) {
    console.error('Error searching commanders:', error);
    return [];
  }
}