# Apps Sync System

## Overview

The "See Our Apps" section on the homepage automatically syncs with your main apps page. When you edit, add, or remove apps from the main apps data, the homepage section will automatically reflect those changes.

## How It Works

### 1. **Single Source of Truth**
- All app data is stored in `src/data/apps.ts`
- Both the homepage "See Our Apps" section and the main `/apps` page read from this same file
- No duplication of data - everything stays in sync automatically

### 2. **Automatic Filtering**
- The homepage only shows apps that have demos available
- Currently filters for apps with IDs: `'writing-editor'` and `'ai-logistics-optimizer-2'`
- When you add new demo apps, they'll automatically appear on the homepage

### 3. **Real-time Updates**
- Any changes to app titles, descriptions, features, or technologies are immediately reflected
- Adding new apps automatically makes them available on both pages
- Removing apps automatically removes them from both pages

## File Structure

```
src/
├── data/
│   └── apps.ts          ← Single source of truth for all app data
├── components/
│   └── SeeOurApps.tsx   ← Homepage apps section
└── pages/
    ├── Index.tsx         ← Homepage (includes SeeOurApps)
    └── Apps.tsx          ← Main apps page
```

## Adding New Demo Apps

To add a new demo app that will appear on both pages:

1. **Add to `src/data/apps.ts`:**
```typescript
{
  id: 'your-new-app-id',
  title: 'Your New App Title',
  description: 'App description...',
  image: '/path-to-image.png',
  category: 'Productivity',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  technologies: ['React', 'TypeScript', 'API'],
  demoUrl: '/apps/your-new-app-id',
  demoMetrics: [
    { title: 'Metric 1', value: 'Value 1' },
    { title: 'Metric 2', value: 'Value 2' }
  ],
  demoHighlights: [
    'Highlight 1',
    'Highlight 2'
  ]
}
```

2. **Add the route in `src/App.tsx`:**
```typescript
<Route path="/apps/your-new-app-id" element={<YourNewApp />} />
```

3. **Create the app page component** (if it doesn't exist)

4. **The app will automatically appear** on both the homepage and the main apps page

## Current Demo Apps

### AI Logistics Optimizer
- **ID**: `writing-editor`
- **Demo Metrics**: Savings ($2.4M), Fuel Efficiency (94.2%), On-Time (87.5%), Route Optimization (91.8%)
- **Highlights**: Live Fleet Map, Route optimization, Real-time alerts, Performance analytics

### AI Real Estate Deal Analyzer
- **ID**: `ai-logistics-optimizer-2`
- **Demo Metrics**: Total Units (152), Portfolio Value ($25.5M), Avg Cap Rate (6.7%), Cash Flow ($269K)
- **Highlights**: Multi-property analysis, AI insights, PDF reporting, Market data integration

## Customization Options

### Styling
- Modify `src/components/SeeOurApps.tsx` to change the visual appearance
- Update colors, spacing, animations, and layout
- The component uses Tailwind CSS for styling

### Content Display
- Adjust how many features/technologies are shown before "+X more"
- Modify the demo metrics grid layout
- Change the demo highlights format

### Filtering Logic
- Update the `demoApps` filter in `SeeOurApps.tsx` to change which apps appear on the homepage
- Add more sophisticated filtering based on categories, features, or other criteria

## Benefits of This System

1. **No Duplication**: Single source of truth for all app data
2. **Automatic Sync**: Changes propagate to all pages instantly
3. **Easy Maintenance**: Update app information in one place
4. **Consistent Experience**: Same information across all pages
5. **Scalable**: Easy to add new apps without touching multiple files

## Troubleshooting

### App Not Appearing on Homepage
- Check if the app ID is included in the `demoApps` filter
- Verify the app has a valid `demoUrl`
- Ensure the app data is properly formatted in `apps.ts`

### Styling Issues
- Check Tailwind CSS classes in `SeeOurApps.tsx`
- Verify component imports and dependencies
- Check for CSS conflicts with other components

### Performance
- The system is lightweight and efficient
- No API calls or database queries - everything is static data
- Fast rendering with smooth animations
