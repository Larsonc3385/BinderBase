import { Router } from 'express';
import { DBClient } from '../data/supabaseController.js';
import { searchCardByName, searchCards, autocomplete } from '../services/scryfallService.js';
import { getCommanderRecommendations } from '../services/edhrecService.js';

const router = Router();

router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

router.get('/decks', async (req, res) => {
  try {
    const { username } = req.query;
    console.log('Fetching decks, username:', username);

    let query = DBClient
      .from('deckname')
      .select('*')
      .order('created_at', { ascending: false });

    if (username) query = query.eq('builtBy', username);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, decks: data || [] });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/decks', async (req, res) => {
  try {
    const { name, format, commander, username } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Deck name is required' });

    const { data, error } = await DBClient
      .from('deckname')
      .insert([{ name, format: format || 'Commander', commander, builtBy: username || null }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, deck: data });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/decks/:deckId/commander', async (req, res) => {
  try {
    const { deckId } = req.params;
    const { commander } = req.body;

    const { data, error } = await DBClient
      .from('deckname')
      .update({ commander })
      .eq('id', deckId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, deck: data });
  } catch (error) {
    console.error('Error setting commander:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/decks/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;
    const { username } = req.query;

    let deckQuery = DBClient
      .from('deckname')
      .select('*')
      .eq('id', deckId);

    if (username) deckQuery = deckQuery.eq('builtBy', username);

    const { data: deck, error: deckError } = await deckQuery.single();
    if (deckError) throw deckError;

    const { data: cards, error: cardsError } = await DBClient
      .from('decklist')
      .select('*')
      .eq('deck_id', deckId)
      .order('card_name', { ascending: true });

    if (cardsError) throw cardsError;

    res.json({ success: true, deck: { ...deck, cards: cards || [] } });
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/decks/:deckId/cards', async (req, res) => {
  try {
    const { deckId } = req.params;
    const { cardName, quantity = 1 } = req.body;

    if (!cardName) return res.status(400).json({ success: false, error: 'Card name is required' });

    const cardData = await searchCardByName(cardName);

    const { data: existing, error: checkError } = await DBClient
      .from('decklist')
      .select('*')
      .eq('deck_id', deckId)
      .eq('card_name', cardData.name)
      .maybeSingle();

    if (checkError) throw checkError;

    let result;

    if (existing) {
      const { data, error } = await DBClient
        .from('decklist')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await DBClient
        .from('decklist')
        .insert([{ deck_id: deckId, card_name: cardData.name, card_image: cardData.image, quantity }])
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

router.put('/decks/:deckId/cards/:cardId', async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0)
      return res.status(400).json({ success: false, error: 'Valid quantity is required' });

    if (quantity === 0) {
      const { error } = await DBClient.from('decklist').delete().eq('id', cardId).eq('deck_id', deckId);
      if (error) throw error;
      return res.json({ success: true, message: 'Card removed from deck' });
    }

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

router.delete('/decks/:deckId/cards/:cardId', async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const { error } = await DBClient.from('decklist').delete().eq('id', cardId).eq('deck_id', deckId);
    if (error) throw error;
    res.json({ success: true, message: 'Card removed from deck' });
  } catch (error) {
    console.error('Error removing card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cards/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query is required' });
    const cards = await searchCards(q);
    res.json({ success: true, cards });
  } catch (error) {
    console.error('Error searching cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cards/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });
    const suggestions = await autocomplete(q);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error getting autocomplete:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/recommendations/commander/:commanderName', async (req, res) => {
  try {
    const { commanderName } = req.params;
    const recommendations = await getCommanderRecommendations(commanderName);
    res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/decks/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;

    const { error: cardsError } = await DBClient.from('decklist').delete().eq('deck_id', deckId);
    if (cardsError) throw cardsError;

    const { error: deckError } = await DBClient.from('deckname').delete().eq('id', deckId);
    if (deckError) throw deckError;

    res.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;