# Sarvodaya Higher Secondary School - Fee Management System

A comprehensive web application for managing school development fees and bus transportation fees.

## Features

- 🔐 **Secure Authentication**: Role-based access for Admin and Class Teachers
- 👥 **Student Management**: Complete CRUD operations with CSV import/export
- 💰 **Fee Collection**: Development fees, bus fees, and special payments
- 📄 **Receipt Generation**: Professional printable receipts
- 📊 **Dashboard & Reports**: Real-time analytics and comprehensive reporting
- ⚙️ **Settings Management**: Configurable fee structures and bus stops

## User Roles

### Admin
- Username: `admin`
- Password: `admin`
- Full system access

### Class Teachers
- Username pattern: `class[1-12][a-e]` (e.g., `class1a`, `class12e`)
- Password: `admin`
- Access to own class students only

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sarvodaya-fee-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure Supabase:
   - Create a new Supabase project
   - Copy your project URL and anon key to `.env`
   - Run the database migrations (see Database Setup)

5. Start the development server:
```bash
npm run dev
```

## Database Setup

### Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update your `.env` file with these values

### Database Schema

The application uses the following main tables:
- `users` - System users (admin and teachers)
- `students` - Student records
- `payments` - Fee payment records
- `fee_configurations` - Development fee settings per class
- `bus_stops` - Bus stop locations and fees

### Running Migrations

Execute the SQL files in the `supabase/migrations` folder in your Supabase SQL editor:

1. `create_users_table.sql`
2. `create_students_table.sql`
3. `create_payments_table.sql`
4. `create_fee_configurations_table.sql`
5. `create_bus_stops_table.sql`

## Deployment

### GitHub Setup

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Production Deployment

The application can be deployed to:
- Vercel
- Netlify
- Railway
- Any static hosting service

Make sure to set your environment variables in your deployment platform.

## Usage

### For Administrators

1. Login with admin credentials
2. Configure fee structures in Settings
3. Add/import student data
4. Monitor collections through Dashboard
5. Generate reports as needed

### For Class Teachers

1. Login with class-specific credentials
2. View and manage your class students
3. Process fee payments
4. Generate receipts
5. View payment reports for your class

## Security Features

- Password hashing with bcrypt
- Role-based access control
- Session management
- Input validation and sanitization
- SQL injection protection via Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the school administration.