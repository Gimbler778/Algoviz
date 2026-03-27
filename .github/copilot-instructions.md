<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements: Next.js algorithm visualizer with sorting, graphs, analysis, and Netlify deployment
- [x] Scaffold the Project: Next.js with TypeScript, Tailwind CSS, ESLint, and App Router
- [x] Customize the Project: Add algorithm visualizations, components, and analysis features
- [x] Install Required Extensions: None required for Next.js
- [ ] Install Dependencies: Run `npm install` to install all packages
- [ ] Compile the Project: Run `npm run build` to verify the build
- [ ] Create and Run Task: Configure dev server task
- [ ] Launch the Project: Run `npm run dev` for development
- [x] Ensure Documentation is Complete: README.md and project configuration are current

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── algorithms/        # Algorithm pages and results
├── components/            # Reusable React components
│   ├── visualizers/       # Sorting and graph visualizers
│   ├── analysis/          # Performance analysis and charts
│   ├── ui/               # shadcn/ui components
│   └── common/           # Common components
├── lib/                   # Utility functions and helpers
│   ├── algorithms/       # Algorithm implementations
│   ├── utils.ts          # General utilities
│   └── types.ts          # TypeScript types
├── styles/              # Global styles
└── public/             # Static assets
```

## Stack & Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion, GSAP
- **Visualizations**: Canvas/SVG animations with Framer Motion & GSAP
- **Data Analysis**: Recharts for charts and graphs
- **Icons**: Lucide React
- **Deployment**: Netlify

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint

## Key Features

1. **Sorting Algorithm Visualizer**: Step-through visualization of sorting algorithms with speed control
2. **Graph Algorithm Visualizer**: Pathfinding, BFS, DFS visualizations
3. **Algorithm Analysis**: Complexity analysis, performance metrics, comparison charts
4. **Educational Content**: Detailed explanations and pseudocode for each algorithm
5. **Interactive UI**: Beautiful, responsive UI with smooth animations

## Deployment

Configured for Netlify deployment. Push to GitHub and connect repository to Netlify.

## Notes

- All algorithm implementations are client-side for optimal performance on free tier
- Magic UI components can be integrated from community packages
- GSAP and Framer Motion provide smooth animations without heavy dependencies
