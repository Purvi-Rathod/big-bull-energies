# CNEOX - Binary MLM Platform

A comprehensive binary network marketing platform built with Next.js, Express, MongoDB, and TypeScript.

## 🚀 Features

- **User Management**: Complete user registration, authentication, and profile management
- **Investment System**: Multiple investment packages with ROI tracking
- **Binary Tree**: Advanced binary tree structure with carry forward calculations
- **Referral System**: Multi-level referral tracking and income distribution
- **Career Levels**: Progressive career level system with rewards
- **Wallet System**: Multiple wallet types (ROI, Binary, Referral, Career Level, etc.)
- **Voucher System**: Voucher-based reinvestment mechanism
- **Admin Panel**: Comprehensive admin dashboard for system management
- **Payment Integration**: NOWPayments integration for cryptocurrency payments
- **Support System**: Ticket-based customer support

## 📁 Project Structure

```
binary_system/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js app directory (pages)
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and API client
│   └── public/            # Static assets
│
├── server/                # Express backend application
│   ├── src/
│   │   ├── config/        # Configuration files (CORS, rate limit, security)
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic services
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   ├── lib/           # Third-party integrations
│   │   └── scripts/       # Utility scripts
│   └── tests/             # Test files
│
├── docs/                  # Documentation
│   ├── api/               # API documentation
│   ├── deployment/        # Deployment guides (Docker, production, stagging)
│   ├── development/       # Development notes, releases
│   ├── fixes/             # Bug fix and feature implementation notes
│   ├── performance/       # Performance analysis
│   ├── security/          # Security audits and fixes
│   ├── ci/                # CI/CD and SSH setup guides
│   └── archive/           # Superseded docs
│
├── .github/               # GitHub workflows
│   └── workflows/         # CI/CD pipelines
│
└── scripts/               # Root-level scripts
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Charts**: Recharts
- **Flow Diagrams**: ReactFlow

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Caching**: Redis
- **Email**: Nodemailer

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 📦 Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB instance
- Redis (optional)
- Docker & Docker Compose (for containerized setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd binary_system
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy example files
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env.local
   
   # Edit .env files with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

   Or use Docker Compose:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

### Environment Variables

See `.env.example` files for required environment variables:
- Root: `.env.example`
- Server: `server/.env.example`
- Client: `client/.env.example`

## 🐳 Docker Deployment

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

See `docs/deployment/` for detailed deployment guides.

## 📚 Documentation

- **API Documentation**: Available at `/api-docs` when server is running
- **Deployment**: `docs/deployment/` - Docker, production, stagging
- **Development**: `docs/development/` - Releases, testing
- **CI/CD**: `docs/ci/` - GitHub Actions, SSH setup
- **Architecture**: `docs/architecture/`
- **Full index**: [docs/README.md](./docs/README.md)

## 🧪 Testing

```bash
# Server tests
cd server
npm test

# Client tests (if configured)
cd client
npm test
```

## 🔒 Security

- Rate limiting on all endpoints
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS configuration
- JWT authentication with httpOnly cookies
- Input validation and sanitization

## 📝 Scripts

### Server Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

### Client Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

## 📄 License

[Add your license here]

## 👥 Team

[Add team information here]

## 🔗 Links

- [API Documentation](./docs/api/)
- [Deployment Guide](./docs/deployment/)
- [Development Guide](./docs/development/)
