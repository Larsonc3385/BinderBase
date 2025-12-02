/**
 * Service for interacting with the Scryfall API
 * Documentation: https://scryfall.com/docs/api
 */

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

/**
 * Search for cards by name
 * @param {string} cardName - The name of the card to search for
 * @returns {Promise<Object>} - The card data from Scryfall
 */
export async function searchCardByName(cardName) {
  try {
    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}`
    );
    
    if (!response.ok) {
      throw new Error(`Card not found: ${cardName}`);
    }
    
    const cardData = await response.json();
    return {
      name: cardData.name,
      image: cardData.image_uris?.normal || cardData.card_faces?.[0]?.image_uris?.normal,
      scryfallId: cardData.id,
      type: cardData.type_line,
      manaCost: cardData.mana_cost,
      colors: cardData.colors || [],
      oracleText: cardData.oracle_text
    };
  } catch (error) {
    console.error('Error fetching card from Scryfall:', error);
    throw error;
  }
}

/**
 * Search for cards with fuzzy matching
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of matching cards
 */
export async function searchCards(query) {
  try {
    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data.map(card => ({
      name: card.name,
      image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
      scryfallId: card.id,
      type: card.type_line,
      manaCost: card.mana_cost,
      colors: card.colors || []
    }));
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
}

/**
 * Get autocomplete suggestions for card names
 * @param {string} partial - Partial card name
 * @returns {Promise<Array<string>>} - Array of card name suggestions
 */
export async function autocomplete(partial) {
  try {
    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/autocomplete?q=${encodeURIComponent(partial)}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    return [];
  }
}