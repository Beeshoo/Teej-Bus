
import { User, Ticket, BookingState, Complaint, Driver, UserRole, ChatMessage } from '../types';
import { supabase } from './supabaseClient';
import { calculateTripPrice } from '../constants.tsx';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const BackendAPI = {
  // --- نظام الدردشة المباشرة ---
  async sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        user_id: message.userId,
        user_name: message.userName,
        sender: message.sender,
        text_content: message.text,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      sender: data.sender as 'user' | 'admin' | 'system',
      text: data.text_content,
      timestamp: data.timestamp,
      isRead: data.is_read
    };
  },

  async getUserChatMessages(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data.map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      userName: msg.user_name,
      sender: msg.sender as 'user' | 'admin' | 'system',
      text: msg.text_content,
      timestamp: msg.timestamp,
      isRead: msg.is_read
    }));
  },

  async getAllChatMessages(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data.map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      userName: msg.user_name,
      sender: msg.sender as 'user' | 'admin' | 'system',
      text: msg.text_content,
      timestamp: msg.timestamp,
      isRead: msg.is_read
    }));
  },

  async markChatAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // --- نظام الحسابات وإدارة الجلسات ---
  async signup(userData: any): Promise<{ success: boolean; user?: User; message?: string }> {
    await delay(800);
    
    // التحقق من كود الأمان للمديرين
    if (userData.role === UserRole.ADMIN) {
      if (userData.securityKey !== '2026') {
        return { success: false, message: 'كود تفعيل المدير غير صحيح' };
      }
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone,
      birth_date: userData.birthDate,
      role: userData.role || UserRole.USER,
      license_number: userData.licenseNumber,
      photo_url: userData.photoUrl
    };

    const { data, error } = await supabase
      .from('app_users')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return { success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل' };
      return { success: false, message: error.message };
    }

    const sessionUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birth_date,
      role: data.role as UserRole,
      licenseNumber: data.license_number,
      photoUrl: data.photo_url,
      loggedIn: true
    };

    localStorage.setItem('taj_bus_current_session', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  },

  async login(email: string, pass: string): Promise<{ success: boolean; user?: User; message?: string }> {
    await delay(800);
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email)
      .eq('password', pass)
      .single();

    if (error || !data) {
      return { success: false, message: 'بيانات الدخول غير صحيحة' };
    }

    const sessionUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birth_date,
      role: data.role as UserRole,
      licenseNumber: data.license_number,
      photoUrl: data.photo_url,
      loggedIn: true
    };

    localStorage.setItem('taj_bus_current_session', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  },

  async logout() {
    localStorage.removeItem('taj_bus_current_session');
  },

  async getSession(): Promise<User | null> {
    const session = localStorage.getItem('taj_bus_current_session');
    return session ? JSON.parse(session) : null;
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birth_date,
      role: data.role as UserRole,
      licenseNumber: data.license_number,
      photoUrl: data.photo_url,
      loggedIn: false
    };
  },

  async getTicketById(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return {
      ...data,
      userId: data.user_id,
      driverId: data.driver_id,
      driverName: data.driver_name,
      driverPhoto: data.driver_photo,
      from: data.from_loc,
      to: data.to_loc,
      departureTime: data.departure_time,
      busType: data.bus_type,
      selectedSeats: data.selected_seats,
      paymentId: data.payment_id,
      paymentStatus: data.payment_status
    };
  },

  // --- نظام الحجز وإدارة المقاعد ---
  async getOccupiedSeats(date: string, time: string, from: string, to: string): Promise<number[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('selected_seats')
      .eq('date', date)
      .eq('departure_time', time)
      .eq('from_loc', from)
      .eq('to_loc', to)
      .neq('status', 'cancelled');
    
    if (error) return [];
    return data.flatMap(t => t.selected_seats);
  },

  async createBooking(bookingData: BookingState, userId: string): Promise<{ success: boolean; ticket?: Ticket }> {
    await delay(1200);
    
    // فحص المقاعد
    const occupied = await this.getOccupiedSeats(bookingData.date, bookingData.departureTime, bookingData.from, bookingData.to);
    const isTaken = bookingData.selectedSeats.some(s => occupied.includes(s));
    
    if (isTaken) {
      throw new Error('تعارض: تم حجز هذه المقاعد للتو');
    }

    const price = (bookingData.selectedSeats.length) * calculateTripPrice(bookingData.from, bookingData.to, bookingData.busType);
    const ticketId = 'TAJ-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        id: ticketId,
        user_id: userId,
        date: bookingData.date,
        from_loc: bookingData.from,
        to_loc: bookingData.to,
        departure_time: bookingData.departureTime,
        arrival_time: bookingData.arrivalTime,
        bus_type: bookingData.busType,
        selected_seats: bookingData.selectedSeats,
        price,
        status: 'upcoming',
        payment_status: 'paid',
        payment_id: 'PAY-' + Date.now()
      }])
      .select()
      .single();

    if (error) throw error;
    
    return { 
      success: true, 
      ticket: {
        ...data,
        userId: data.user_id,
        from: data.from_loc,
        to: data.to_loc,
        departureTime: data.departure_time,
        arrivalTime: data.arrival_time,
        busType: data.bus_type as any,
        selectedSeats: data.selected_seats,
        paymentId: data.payment_id,
        paymentStatus: data.payment_status
      } as Ticket 
    };
  },

  async getUserTickets(userId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(t => ({
      ...t,
      userId: t.user_id,
      driverId: t.driver_id,
      driverName: t.driver_name,
      driverPhoto: t.driver_photo,
      from: t.from_loc,
      to: t.to_loc,
      departureTime: t.departure_time,
      busType: t.bus_type,
      selectedSeats: t.selected_seats,
      paymentId: t.payment_id,
      paymentStatus: t.payment_status
    }));
  },

  // --- نظام الشكاوي والمقترحات ---
  async submitComplaint(complaintData: Omit<Complaint, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    await delay(1000);
    const { error } = await supabase
      .from('complaints')
      .insert([{
        user_id: complaintData.userId,
        user_name: complaintData.userName,
        user_email: complaintData.userEmail,
        ticket_id: complaintData.ticketId,
        category: complaintData.category,
        subject: complaintData.subject,
        message: complaintData.message,
        status: 'pending'
      }]);

    if (error) throw error;
    return { success: true, message: 'تم إرسال شكواك بنجاح. سنقوم بالرد عليك في أقرب وقت.' };
  },

  async getUserComplaints(userId: string): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(c => ({
      id: c.id,
      userId: c.user_id,
      userName: c.user_name,
      userEmail: c.user_email,
      ticketId: c.ticket_id,
      category: c.category,
      subject: c.subject,
      message: c.message,
      status: c.status,
      createdAt: c.created_at,
      adminReply: c.admin_reply,
      repliedAt: c.replied_at
    }));
  },

  async getDriverTickets(driverId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(t => ({
      ...t,
      userId: t.user_id,
      driverId: t.driver_id,
      driverName: t.driver_name,
      driverPhoto: t.driver_photo,
      from: t.from_loc,
      to: t.to_loc,
      departureTime: t.departure_time,
      busType: t.bus_type as any,
      selectedSeats: t.selected_seats,
      paymentId: t.payment_id,
      paymentStatus: t.payment_status,
      arrivalTime: t.arrival_time
    }));
  },

  // --- نظام الإدارة والتحكم ---
  async getAllTickets(): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(t => ({
      ...t,
      userId: t.user_id,
      driverId: t.driver_id,
      driverName: t.driver_name,
      driverPhoto: t.driver_photo,
      from: t.from_loc,
      to: t.to_loc,
      departureTime: t.departure_time,
      busType: t.bus_type as any,
      selectedSeats: t.selected_seats,
      paymentId: t.payment_id,
      paymentStatus: t.payment_status,
      arrivalTime: t.arrival_time
    }));
  },

  async getAllComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(c => ({
      id: c.id,
      userId: c.user_id,
      userName: c.user_name,
      userEmail: c.user_email,
      ticketId: c.ticket_id,
      category: c.category,
      subject: c.subject,
      message: c.message,
      status: c.status,
      createdAt: c.created_at,
      adminReply: c.admin_reply,
      repliedAt: c.replied_at
    }));
  },

  async updateComplaintStatus(id: number, status: 'pending' | 'resolved' | 'ignored'): Promise<boolean> {
    const { error } = await supabase
      .from('complaints')
      .update({ status })
      .eq('id', id);
    return !error;
  },

  async replyToComplaint(id: number, adminReply: string): Promise<boolean> {
    const { error } = await supabase
      .from('complaints')
      .update({ 
        admin_reply: adminReply, 
        replied_at: new Date().toISOString(),
        status: 'resolved' 
      })
      .eq('id', id);
    return !error;
  },

  async getDrivers(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name');
    
    if (error) return [];
    return data.map(d => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      licenseNumber: d.license_number,
      status: d.status,
      photoUrl: d.photo_url
    }));
  },

  async addDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
    const id = Math.random().toString(36).substr(2, 9);
    const newDriver = {
      id,
      name: driver.name,
      phone: driver.phone,
      license_number: driver.licenseNumber,
      status: driver.status,
      photo_url: driver.photoUrl
    };
    const { data, error } = await supabase
      .from('drivers')
      .insert([newDriver])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      licenseNumber: data.license_number,
      status: data.status,
      photoUrl: data.photo_url
    };
  },

  async deleteDriver(id: any): Promise<void> {
    await supabase.from('drivers').delete().eq('id', id);
    
    // التحقق من جدول المستخدمين أيضاً
    const { data: user } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (user && user.role === UserRole.DRIVER) {
      await supabase.from('app_users').update({ role: UserRole.USER }).eq('id', id);
    }
  },

  async getDriverById(id: string): Promise<Driver | null> {
    const { data: driver } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();

    if (driver) return {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.license_number,
      status: driver.status,
      photoUrl: driver.photoUrl
    };
    
    const { data: user } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();

    if (user && user.role === UserRole.DRIVER) {
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        licenseNumber: user.license_number || 'غير متوفر',
        status: 'active',
        photoUrl: user.photo_url
      };
    }
    return null;
  },

  async rateTicket(ticketId: string, rating: number, review: string): Promise<boolean> {
    const { error } = await supabase
      .from('tickets')
      .update({ rating, review, status: 'completed' })
      .eq('id', ticketId);
    return !error;
  },

  async cancelTicket(ticketId: string): Promise<boolean> {
    await delay(1000);
    const { error } = await supabase
      .from('tickets')
      .update({ status: 'cancelled', payment_status: 'pending' })
      .eq('id', ticketId);
    return !error;
  },

  async assignDriverToTicket(ticketId: string, driverId: string, driverName: string, driverPhoto?: string): Promise<boolean> {
    const { error } = await supabase
      .from('tickets')
      .update({ driver_id: driverId, driver_name: driverName, driver_photo: driverPhoto })
      .eq('id', ticketId);
    return !error;
  },

  async assignDriverToTrip(from: string, to: string, date: string, time: string, busType: string, driverId: string, driverName: string, driverPhoto?: string): Promise<boolean> {
    const { error } = await supabase
      .from('tickets')
      .update({ driver_id: driverId, driver_name: driverName, driver_photo: driverPhoto })
      .eq('from_loc', from)
      .eq('to_loc', to)
      .eq('date', date)
      .eq('departure_time', time)
      .eq('bus_type', busType);
    
    return !error;
  },

  async getAllData() {
    const { data: users } = await supabase.from('app_users').select('*');
    const { data: tickets } = await supabase.from('tickets').select('*');
    const { data: complaints } = await supabase.from('complaints').select('*');
    const { data: drivers } = await supabase.from('drivers').select('*');
    return { users, tickets, complaints, drivers };
  }
};

