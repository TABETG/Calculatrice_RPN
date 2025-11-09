# RPN Calculator - Frontend

React + TypeScript frontend with modern UI and Docker deployment.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
Access at: http://localhost:5173

### Build
```bash
npm run build
```

### Docker
```bash
docker build -t rpn-frontend .
docker run -p 80:80 rpn-frontend
```

## 🏗️ Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   └── services/       # API services
├── Dockerfile          # Production build
├── nginx.conf         # Nginx configuration
└── package.json
```

## 🔧 Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

## 📦 Technologies

- React 18
- TypeScript 5
- Vite 5
- TailwindCSS 3
- Lucide React (icons)

## 🎨 Features

- Modern glassmorphism design
- Dark/Light theme toggle
- Toast notifications
- Responsive design
- Accessibility (WCAG AA)
- Advanced RPN operations
