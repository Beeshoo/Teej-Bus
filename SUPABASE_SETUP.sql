
-- إنشاء جدول المستخدمين
CREATE TABLE app_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    birth_date TEXT,
    role TEXT DEFAULT 'user',
    license_number TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول السائقين
CREATE TABLE drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    license_number TEXT,
    status TEXT DEFAULT 'active',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول التذاكر
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES app_users(id),
    driver_id TEXT,
    driver_name TEXT,
    driver_photo TEXT,
    date TEXT NOT NULL,
    from_loc TEXT NOT NULL,
    to_loc TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    bus_type TEXT NOT NULL,
    selected_seats JSONB NOT NULL,
    price DECIMAL NOT NULL,
    status TEXT DEFAULT 'upcoming',
    payment_status TEXT DEFAULT 'paid',
    payment_id TEXT,
    rating INTEGER,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الشكاوى
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES app_users(id),
    user_name TEXT,
    user_email TEXT,
    ticket_id TEXT,
    category TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الرسائل
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    sender TEXT NOT NULL,
    text_content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- إضافة بعض البيانات الأولية للسائقين
INSERT INTO drivers (id, name, phone, license_number, status, photo_url) VALUES
('dr-1', 'كابتن أحمد المنشاوي', '01012345678', 'L-998877', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'),
('dr-2', 'كابتن محمد عبد العزيز', '01122334455', 'L-554433', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'),
('dr-3', 'كابتن محمود الشافعي', '01233445566', 'L-112233', 'active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'),
('dr-4', 'كابتن حسن البدري', '01555667788', 'L-776655', 'active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop');
