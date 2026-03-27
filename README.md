# Algoviz - Interactive Algorithm Visualizer

A comprehensive web application for visualizing and learning sorting algorithms, graph algorithms, and performance analysis with beautiful animations and interactive UI.

## Features

- **Sorting Algorithm Visualizer**: Visualize 6 popular sorting algorithms (Bubble, Selection, Insertion, Merge, Quick, Heap) with step-by-step execution
- **Graph Algorithm Visualizer**: Explore BFS, DFS, and Dijkstra's algorithm on interactive graphs
- **Algorithm Analysis**: Compare performance metrics (comparisons, swaps, execution time) across algorithms with real-time charts
- **Educational Content**: Detailed explanations, pseudocode, complexity analysis, and advantages/disadvantages for each algorithm
- **Interactive UI**: Smooth animations, speed controls, array size adjustments, and responsive design
- **Real-time Statistics**: Live tracking of comparisons, swaps, and execution time

## Tech Stack

- **Frontend Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom interactive UI components
- **UI Components**: Custom magic/shadcn-inspired components, Lucide React icons
- **Animations**: Framer Motion, GSAP
- **Map UI**: Leaflet + React Leaflet
- **Routing Engines**: GraphHopper / OSRM
- **Map Data**: OpenStreetMap
- **Deployment**: Netlify

## Installation

### Prerequisites
- Node.js 18+ or npm 9+
- Git (for version control)

### Setup

1. **Clone or download the project**
```bash
cd Algoviz
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint checks
npm run lint
```

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   └── algorithms/
│       ├── sorting/page.tsx     # Sorting visualizer
│       ├── graphs/page.tsx      # Graph visualizer
│       ├── analysis/page.tsx    # Performance analysis
│       └── learn/page.tsx       # Learning resources
│
├── components/
│   └── visualizers/
│       ├── SortingVisualizer.tsx  # Sorting algorithm visualizer
│       └── GraphVisualizer.tsx    # Graph algorithm visualizer
│
├── lib/
│   ├── algorithms/
│   │   ├── sorting.ts           # Sorting algorithm implementations
│   │   └── graphs.ts            # Graph algorithm implementations
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
│
└── public/                      # Static assets
```

## Features Breakdown

### 1. Sorting Visualizer
- **Algorithms**: Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Cocktail, Counting, Radix
- **Controls**: 
  - Play/Pause/Reset buttons
  - Speed control (1-100%)
  - Array size adjustment (10-100 elements)
  - Real-time statistics display

### 2. Graph Visualizer
- **Algorithms**: BFS, DFS, Dijkstra, A*, Prim's MST
- **Graph Types**: World/Europe city networks + real map routing mode
- **Features**:
  - Visual node highlighting
  - Visited order tracking
  - Edge weight display
  - Pause/Resume functionality

### 3. Algorithm Analysis
- **Metrics**: Comparisons, Swaps, Execution Time
- **Array Sizes**: 50, 100, 200, 300 elements
- **Visualizations**:
  - Line chart for comparisons
  - Bar chart for execution time
  - Detailed results table

### 4. Learning Hub
- **Content**: Pseudocode, complexity analysis, advantages/disadvantages
- **Algorithm Details**: Description, time/space complexity, key points
- **Expandable Cards**: Easy-to-read accordion layout

## Deployment on Netlify

## Real Map Routing Setup (GraphHopper + OSRM + OSM)

1. **Install dependencies** (already included)
```bash
npm install
```

2. **Create env file**
```bash
cp .env.example .env.local
```

3. **Add GraphHopper API key** to `.env.local`
```bash
GRAPHHOPPER_API_KEY=your_graphhopper_api_key
```

4. **Run app**
```bash
npm run dev
```

5. **Use Graphs page**
- `City Graph Visualizer` tab for algorithm simulations
- `Real Road Routing (Leaflet)` tab for map route engine calls
- `OSRM` works without key (public endpoint)
- `GraphHopper` requires your API key

### Quick Start with GitHub

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/algoviz.git
git push -u origin main
```

2. **Connect to Netlify**
  - Go to [netlify.com](https://netlify.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Algoviz" repo
   - Click "Deploy"

3. **Configure Environment (if needed)**
  - Build command: `npm run build`
  - Publish directory: `.next`
  - Add environment variable in Site Settings -> Environment variables:
    - `GRAPHHOPPER_API_KEY=your_graphhopper_api_key`

4. **Deploy**
  - Netlify will automatically deploy your project
  - Your app will be live at `https://your-site-name.netlify.app`

### Custom Domain (Optional)
- In Netlify Dashboard -> Domain management
- Add your custom domain
- Follow DNS configuration instructions

## Performance Optimizations

- **Client-side Algorithms**: All algorithms run client-side for optimal free tier performance
- **Code Splitting**: Next.js automatically code-splits pages
- **Image Optimization**: Optimized static assets
- **Dynamic Imports**: Heavy components loaded on demand
- **Canvas Rendering**: Efficient graph visualization using HTML5 Canvas

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc.json` - ESLint configuration
- `netlify.toml` - Netlify deployment configuration

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is open source and available under the MIT License.

## Future Enhancements

- [ ] Add more graph algorithms (Kruskal's, Bellman-Ford)
- [ ] Dynamic graph generation
- [ ] Multi-language support
- [ ] Sound effects for sorting steps
- [ ] Dark/Light theme toggle
- [ ] Algorithm comparison mode
- [ ] User-defined custom arrays

## Support

For issues, questions, or suggestions, please open an issue on GitHub or reach out!

---

Built with ❤️ for algorithm enthusiasts and learners everywhere.
