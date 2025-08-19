# ENGAGE ENGINE - LinkedIn Agent Dashboard

A comprehensive admin dashboard for managing your LinkedIn automation and outreach campaigns. Built with React, TypeScript, and shadcn/ui components.

## Features

### 🎯 **Dashboard Overview**
- Real-time budget tracking (Comments, Connects, DMs, Replies, Likes)
- Health status monitoring with captcha detection
- Live activity feed with status indicators
- Pause/Resume controls with DRY RUN mode

### 📊 **Posts Management**
- Discover and filter posts by niche, score, and engagement
- Generate comment and DM drafts automatically
- Post scoring and filtering system
- Company and author insights

### ⏰ **Queue Management**
- Monitor pending tasks (Comments, DMs, Replies)
- Real-time status tracking
- Reference link management
- Payload preview and editing

### ✍️ **Drafts Management**
- Organize drafts by type (Comments, Outreach, Replies)
- Copy drafts to clipboard
- Bulk clear operations
- Intent classification and confidence scoring

### 📥 **Inbox Monitoring**
- Read-only thread management
- Unread message tracking
- Thread link organization

### ⚙️ **Settings & Configuration**
- Niche management with chip-based selection
- JSON configuration editor
- Import/Export functionality
- Timezone awareness

### 📝 **Logs & Monitoring**
- Real-time log streaming
- Level-based filtering (INFO, ERROR)
- Failure screenshot links
- Activity timeline

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React Hooks + Context
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd linkedinagent
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Main site header with navigation
│   ├── Terminal.tsx    # Animated terminal component
│   ├── EmailForm.tsx   # Email collection form
│   └── FeatureCard.tsx # Feature showcase cards
├── pages/              # Page components
│   ├── Index.tsx       # Landing page
│   ├── Dashboard.tsx   # Main admin dashboard
│   └── ...             # Other pages
├── lib/                # Utility libraries
│   ├── api-client.ts   # API client with caching
│   └── utils.ts        # Helper functions
├── hooks/              # Custom React hooks
└── config/             # Configuration files
```

## API Endpoints

The dashboard expects the following API endpoints:

### Health & Status
- `GET /api/health` - System health check
- `GET /api/counters` - Usage counters and metrics

### Content Management
- `GET /api/posts?since=48h&niche=*` - Discover posts
- `GET /api/queue?kind=COMMENT|DM|REPLY&niche=*` - Queue status

### Drafts
- `GET /api/drafts/comments` - Comment drafts
- `GET /api/drafts/outreach` - Outreach drafts  
- `GET /api/drafts/replies` - Reply drafts
- `POST /api/drafts/clear {kind}` - Clear drafts

### Settings
- `GET /api/settings/niche` - Get niche configuration
- `PUT /api/settings/niche` - Update niche settings

### Control
- `POST /api/pause` - Pause automation
- `POST /api/resume` - Resume automation

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Authentication (if needed)
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=password

# Feature Flags
VITE_DRY_RUN=true
VITE_ENABLE_WEBSOCKET=false
```

### Niche Configuration

Configure your target niches in the Settings tab:

```json
{
  "niches": [
    {
      "name": "AI",
      "keywords": ["artificial intelligence", "machine learning", "AI"],
      "minScore": 7.0,
      "enabled": true
    },
    {
      "name": "Automation",
      "keywords": ["automation", "workflow", "efficiency"],
      "minScore": 6.5,
      "enabled": true
    }
  ]
}
```

## Usage

### 1. **Dashboard Overview**
- Monitor your daily engagement budgets
- Check system health and captcha status
- Review recent activity and actions

### 2. **Post Discovery**
- Browse posts by niche and engagement score
- Generate comment and DM drafts
- Filter by company, author, or content

### 3. **Queue Management**
- Monitor pending automation tasks
- Track execution status and timing
- Review payloads before execution

### 4. **Draft Management**
- Organize and review generated content
- Copy drafts to clipboard for manual review
- Clear old or unwanted drafts

### 5. **Settings & Configuration**
- Manage target niches and keywords
- Configure engagement limits and timing
- Export/import configuration

## Development

### Adding New Features

1. **Create new components** in `src/components/`
2. **Add new pages** in `src/pages/`
3. **Update routing** in `src/App.tsx`
4. **Add API endpoints** in `src/lib/api-client.ts`

### Styling

- Use Tailwind CSS classes for styling
- Follow shadcn/ui component patterns
- Maintain consistent spacing and typography

### State Management

- Use React hooks for local state
- Consider Context API for global state
- Implement proper error boundaries

## Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check API endpoint configuration
   - Verify CORS settings on backend
   - Check network connectivity

2. **Component Loading Issues**
   - Clear browser cache
   - Check console for JavaScript errors
   - Verify all dependencies are installed

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts
   - Verify shadcn/ui component imports

### Debug Mode

Enable debug logging by setting:

```env
VITE_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**ENGAGE ENGINE** - Automate your LinkedIn outreach with AI-powered precision.
