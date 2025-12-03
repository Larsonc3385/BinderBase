# BinderBase

A modern, feature-rich Magic: The Gathering deck builder with an intuitive interface and powerful card management tools.

![BinderBase Logo](https://via.placeholder.com/150x150?text=BB)

## Features

### 🎴 Deck Management
- Create and manage multiple Commander format decks
- Set and manage commanders with automatic color identity enforcement
- Add, remove, and adjust card quantities
- Real-time deck statistics (total cards, unique cards)
- Clear deck functionality

### 🔍 Card Search & Filtering
- Search cards by name using the Scryfall API
- Filter by color identity
- Automatic filtering based on commander's color identity
- Card image preview on hover
- Support for colorless cards

### 💡 Smart Recommendations
- Get AI-powered card suggestions based on your deck
- Multiple recommendation types:
  - **Top Cards**: Most played cards in similar decks
  - **Creatures**: Creature recommendations
  - **Instants & Sorceries**: Spell recommendations
  - **Lands**: Land recommendations
  - **High Synergy**: Cards with strong synergy with your deck
  - **Budget Options**: Cost-effective alternatives
- View inclusion rates and synergy scores
- One-click card addition from recommendations

### 🎨 Modern Gaming Interface
- Dark space theme with magical accents
- Smooth animations and transitions
- Responsive card grid layout
- Interactive hover effects
- Professional typography using Orbitron and Space Mono fonts

### ⚡ Commander Format Support
- Enforce commander color identity rules
- Automatic color filtering when commander is set
- Visual indicators for commander colors
- Commander card preview on hover

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Next-generation frontend build tool
- **Custom CSS** - Modern, gaming-inspired stylesheet

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Supabase** - Cloud PostgreSQL database for deck storage
- **Scryfall API** - MTG card data and images
- **EDHREC API** - Deck recommendations and statistics

### Architecture
- RESTful API design
- Separation of concerns (frontend/backend)
- Service-based backend architecture
- Reactive state management with Vue refs

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/binderbase.git
   cd binderbase
   ```

2. **Set up Supabase**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key
   - Create the database tables (see Database Schema section)

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```bash
   cd backend
   touch .env
   ```
   
   Add your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Install backend dependencies**
   ```bash
   npm install
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Start the backend server**
   ```bash
   cd ../backend
   npm start
   # Server runs on http://localhost:3000
   ```

7. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

8. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
binderbase/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   │   ├── deckService.js
│   │   │   ├── scryfallService.js
│   │   │   └── recommendationsService.js
│   │   ├── db/              # Supabase client
│   │   └── server.js        # Express server
│   ├── .env                 # Environment variables (Supabase credentials)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── deckPage.vue # Main deck builder component
│   │   ├── services/
│   │   │   └── api.js       # API client
│   │   ├── styles.css       # Global styles
│   │   └── main.js          # Vue app entry
│   └── package.json
└── README.md
```

## API Endpoints

### Decks
- `GET /api/decks` - Get all decks
- `GET /api/decks/:id` - Get deck by ID
- `POST /api/decks` - Create new deck
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck
- `POST /api/decks/:id/cards` - Add card to deck
- `PUT /api/decks/:id/cards/:cardName` - Update card quantity
- `DELETE /api/decks/:id/cards/:cardName` - Remove card from deck
- `POST /api/decks/:id/commander` - Set commander
- `DELETE /api/decks/:id/commander` - Remove commander

### Cards
- `GET /api/cards/search?q=:query` - Search cards by name

### Recommendations
- `GET /api/recommendations/:deckId` - Get deck recommendations

## Usage Guide

### Creating a Deck

1. Click the **"+ New Deck"** button in the header
2. Enter a deck name
3. Click **"Create"**
4. Your new deck will be automatically selected

### Setting a Commander

1. Select a deck using the **"Select Deck"** dropdown
2. Click **"Set Commander"** in the Commander section
3. Search for a legendary creature
4. Click on a card to set it as your commander
5. Color filters will automatically update to match commander colors

### Adding Cards

1. Use the search bar to find cards
2. Select color filters (or let commander colors auto-filter)
3. Click on a card in the search results to add it to your deck
4. Use **+** and **-** buttons to adjust quantities
5. Click **×** to remove a card

### Getting Recommendations

1. Click the **"💡 Suggestions"** button
2. Browse recommendations by category
3. Hover over cards to see preview images
4. Click **"Add to Deck"** to add recommended cards

### Commander Color Identity Rules

When a commander is set:
- Only cards matching the commander's color identity can be added
- Color filters are automatically restricted to commander colors
- Colorless cards are always legal
- Cards with colors outside the commander's identity are filtered out

## Color Identity System

BinderBase uses Magic's color identity rules:

- **W** - White (Plains)
- **U** - Blue (Island)
- **B** - Black (Swamp)
- **R** - Red (Mountain)
- **G** - Green (Forest)

Commander color identity includes:
- Mana symbols in the mana cost
- Mana symbols in rules text
- Color indicators
- Both faces of transform/modal cards

## Development

### Backend Development

```bash
cd backend
npm run dev  # Run with nodemon for auto-restart
```

### Frontend Development

```bash
cd frontend
npm run dev  # Run with Vite HMR
```

### Building for Production

```bash
cd frontend
npm run build  # Creates optimized production build
```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory with:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Server Configuration (optional)
PORT=3000
```

**Important**: Never commit your `.env` file to version control. Add it to `.gitignore`:
```
.env
```

### Backend Configuration
Edit `backend/src/server.js` to configure:
- Port (default: 3000)
- CORS settings
- API endpoints

### Frontend Configuration
Edit `frontend/vite.config.js` to configure:
- Dev server port
- API proxy settings
- Build options

## Database Schema

BinderBase uses Supabase (PostgreSQL) for data storage. Create these tables in your Supabase project:

### Decks Table
```sql
CREATE TABLE decks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT DEFAULT 'Commander',
  commander TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Cards Table
```sql
CREATE TABLE cards (
  id BIGSERIAL PRIMARY KEY,
  deck_id BIGINT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Creating Tables in Supabase

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the SQL above
5. Click "Run" to execute

Alternatively, use the Supabase Table Editor to create tables visually.

## Known Issues & Limitations

### Current Limitations
- Only Commander format is supported
- Commander name text may not wrap properly in the display box (minor UI issue)
- Recommendations require active internet connection

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Edge, Brave, Safari)
- Vue Devtools extension may show a badge (can be disabled in browser extensions)

## Troubleshooting

### Cards not appearing in search
- Check that the backend server is running on port 3000
- Verify internet connection (Scryfall API required)
- Check browser console for errors

### Color filtering not working
- Ensure commander is set correctly
- Check backend logs for color_identity data
- Verify the backend is using the updated scryfallService.js with color_identity support

### Database connection errors
- Verify your `.env` file has correct Supabase credentials
- Check that your Supabase project is active
- Ensure tables have been created in Supabase
- Check Supabase dashboard for any connection issues
- Verify your IP isn't blocked by Supabase security rules

### "Failed to fetch" errors
- Confirm backend server is running
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Test Supabase connection in SQL Editor

### Frontend not connecting to backend
- Verify backend is running on http://localhost:3000
- Check CORS settings in server.js
- Inspect network tab in browser DevTools

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ES6+ syntax
- Follow Vue 3 Composition API patterns
- Use meaningful variable names
- Add comments for complex logic

## Future Enhancements

### Planned Features
- [ ] Support for multiple formats (Standard, Modern, etc.)
- [ ] Deck import/export (text, MTGO, Arena)
- [ ] Price tracking integration
- [ ] Deck statistics and analysis
- [ ] Card categorization (by type, CMC, etc.)
- [ ] Mana curve visualization
- [ ] Deck sharing and collaboration
- [ ] Mobile-responsive design improvements
- [ ] Dark/light theme toggle
- [ ] Card collection management
- [ ] Advanced filtering (by type, CMC, rarity, etc.)

### UI Improvements
- [ ] Fix commander name wrapping
- [ ] Add loading states
- [ ] Improve error messages
- [ ] Add keyboard shortcuts
- [ ] Implement drag-and-drop card organization

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Scryfall** - For their amazing MTG card database and API
- **EDHREC** - For deck recommendations and statistics
- **Vue.js Team** - For the excellent framework
- **MTG Community** - For inspiration and feedback

## Contact

- **Project Link**: [https://github.com/yourusername/binderbase](https://github.com/yourusername/binderbase)
- **Issues**: [https://github.com/yourusername/binderbase/issues](https://github.com/yourusername/binderbase/issues)

---

**Built with ❤️ for MTG deck building**

*Wizards of the Coast, Magic: The Gathering, and their logos are trademarks of Wizards of the Coast LLC. BinderBase is not affiliated with or endorsed by Wizards of the Coast.*