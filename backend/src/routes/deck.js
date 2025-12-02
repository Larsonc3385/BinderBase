import { Router } from 'express';
import { DBClient } from '../data/supabaseController.js';
import { searchCardByName, searchCards, autocomplete } from '../services/scryfallService.js';

// Add logging middleware for debugging
const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

const router = Router();

// Add logging
router.use(logRequest);

/**
 * GET /decks
 * Get all decks for a user
 */
router.get('/decks', async (req, res) => {
  try {
    console.log('Fetching all decks from database...');
    
    const { data, error } = await DBClient
      .from('deckname')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} decks`);
    res.json({ success: true, decks: data || [] });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    });
  }
});

/**
 * POST /decks
 * Create a new deck
 */
router.post('/decks', async (req, res) => {
  try {
    const { name, format, commander } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Deck name is required' });
    }

    const { data, error } = await DBClient
      .from('deckname')
      .insert([{ name, format: format || 'Commander', commander }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, deck: data });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /decks/:deckId
 * Get a specific deck with all its cards
 */
router.get('/decks/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;

    // Get deck info
    const { data: deck, error: deckError } = await DBClient
      .from('deckname')
      .select('*')
      .eq('id', deckId)
      .single();

    if (deckError) throw deckError;

    // Get all cards in the deck
    const { data: cards, error: cardsError } = await DBClient
      .from('decklist')
      .select('*')
      .eq('deck_id', deckId)
      .order('card_name', { ascending: true });

    if (cardsError) throw cardsError;

    res.json({
      success: true,
      deck: {
        ...deck,
        cards: cards || []
      }
    });
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /decks/:deckId/cards
 * Add a card to a deck
 */
router.post('/decks/:deckId/cards', async (req, res) => {
  try {
    const { deckId } = req.params;
    const { cardName, quantity = 1 } = req.body;

    if (!cardName) {
      return res.status(400).json({ success: false, error: 'Card name is required' });
    }

    // Fetch card data from Scryfall
    const cardData = await searchCardByName(cardName);

    // Check if card already exists in deck
    const { data: existing, error: checkError } = await DBClient
      .from('decklist')
      .select('*')
      .eq('deck_id', deckId)
      .eq('card_name', cardData.name)
      .maybeSingle();

    if (checkError) throw checkError;

    let result;

    if (existing) {
      // Update quantity if card exists
      const { data, error } = await DBClient
        .from('decklist')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new card
      const { data, error } = await DBClient
        .from('decklist')
        .insert([{
          deck_id: deckId,
          card_name: cardData.name,
          card_image: cardData.image,
          quantity: quantity
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({ success: true, card: result });
  } catch (error) {
    console.error('Error adding card to deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /decks/:deckId/cards/:cardId
 * Update card quantity in deck
 */
router.put('/decks/:deckId/cards/:cardId', async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, error: 'Valid quantity is required' });
    }

    // If quantity is 0, delete the card
    if (quantity === 0) {
      const { error } = await DBClient
        .from('decklist')
        .delete()
        .eq('id', cardId)
        .eq('deck_id', deckId);

      if (error) throw error;

      return res.json({ success: true, message: 'Card removed from deck' });
    }

    // Update quantity
    const { data, error } = await DBClient
      .from('decklist')
      .update({ quantity })
      .eq('id', cardId)
      .eq('deck_id', deckId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, card: data });
  } catch (error) {
    console.error('Error updating card quantity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /decks/:deckId/cards/:cardId
 * Remove a card from deck
 */
router.delete('/decks/:deckId/cards/:cardId', async (req, res) => {
  try {
    const { deckId, cardId } = req.params;

    const { error } = await DBClient
      .from('decklist')
      .delete()
      .eq('id', cardId)
      .eq('deck_id', deckId);

    if (error) throw error;

    res.json({ success: true, message: 'Card removed from deck' });
  } catch (error) {
    console.error('Error removing card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /cards/search
 * Search for cards using Scryfall API
 */
router.get('/cards/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const cards = await searchCards(q);
    res.json({ success: true, cards });
  } catch (error) {
    console.error('Error searching cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /cards/autocomplete
 * Get autocomplete suggestions for card names
 */
router.get('/cards/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const suggestions = await autocomplete(q);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error getting autocomplete:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /decks/:deckId
 * Delete a deck and all its cards
 */
router.delete('/decks/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;

    // Delete all cards in the deck first
    const { error: cardsError } = await DBClient
      .from('decklist')
      .delete()
      .eq('deck_id', deckId);

    if (cardsError) throw cardsError;

    // Delete the deck
    const { error: deckError } = await DBClient
      .from('deckname')
      .delete()
      .eq('id', deckId);

    if (deckError) throw deckError;

    res.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;