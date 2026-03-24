# Air Conditioner Calculator (Next.js + shadcn/ui)

This project rewrites the original air conditioner calculator into a Next.js app using shadcn-style UI components.

## Setup

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Features

- Calculate ping from room length and width:
  - `length (m) * width (m) * 0.3025`
- Convert ping to cooling load:
  - `Kcal/h = ping * 600`
  - `kW = (ping * 600) / 860`
- Formula hint toggle
- Clear all values and computed results
