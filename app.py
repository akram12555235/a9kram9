"""
نظام الباكند لموقع منظمة أكرم
Flask Backend API
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import secrets
from datetime import datetime
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # السماح بالطلبات من أي مصدر

DATABASE = 'messaging_system.db'


# ============ خدمة الملفات الثابتة ============

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    if os.path.exists(filename):
        return send_from_directory('.', filename)
    return send_from_directory('.', 'index.html')

# ============ إدارة قاعدة البيانات ============

def get_db():
    """الاتصال بقاعدة البيانات"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """إنشاء جداول قاعدة البيانات"""
    conn = get_db()
    cursor = conn.cursor()
    
    # جدول المستخدمين
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            bio TEXT DEFAULT '',
            profile_image TEXT DEFAULT NULL,
            status TEXT DEFAULT 'pending',
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP DEFAULT NULL,
            rejection_reason TEXT DEFAULT NULL
        )
    ''')
    
    # جدول الجلسات
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # جدول الرسائل العامة (من صفحة التواصل)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_name TEXT NOT NULL,
            sender_email TEXT NOT NULL,
            subject TEXT DEFAULT '',
            content TEXT NOT NULL,
            message_type TEXT DEFAULT 'normal',
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # جدول الرسائل الخاصة بين الأعضاء
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS private_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            subject TEXT DEFAULT '',
            content TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )
    ''')

    # جدول جهات الاتصال
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            contact_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (contact_id) REFERENCES users(id),
            UNIQUE(user_id, contact_id)
        )
    ''')
    
    # إنشاء حساب المسؤول الافتراضي
    admin_exists = cursor.execute('SELECT id FROM users WHERE username = ?', ('admin',)).fetchone()
    if not admin_exists:
        admin_hash = generate_password_hash('akram6_2024')
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, status, is_admin)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('admin', 'admin@akram6.com', admin_hash, 'مسؤول النظام', 'approved', 1))
    
    conn.commit()
    conn.close()
    print("✅ تم إنشاء قاعدة البيانات بنجاح!")

# ============ دوال مساعدة ============

def get_user_by_token(token):
    """الحصول على المستخدم من التوكن"""
    if not token:
        return None
    conn = get_db()
    session = conn.execute('SELECT user_id FROM sessions WHERE token = ?', (token,)).fetchone()
    if session:
        user = conn.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],)).fetchone()
        conn.close()
        return user
    conn.close()
    return None

def generate_token():
    """إنشاء توكن عشوائي"""
    return secrets.token_hex(32)

# ============ API المصادقة ============

@app.route('/api/auth/register', methods=['POST'])
def register():
    """تسجيل حساب جديد"""
    data = request.get_json()
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    bio = data.get('bio', '').strip()
    
    # التحقق من البيانات
    if not username or not email or not password:
        return jsonify({'error': 'جميع الحقول مطلوبة'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'}), 400
    
    conn = get_db()
    
    # التحقق من عدم وجود المستخدم
    existing = conn.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?', 
        (username, email)
    ).fetchone()
    
    if existing:
        conn.close()
        return jsonify({'error': 'اسم المستخدم أو البريد الإلكتروني مستخدم مسبقاً'}), 400
    
    # إنشاء الحساب
    password_hash = generate_password_hash(password)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (username, email, password_hash, full_name, bio, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    ''', (username, email, password_hash, full_name, bio))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'تم إنشاء الحساب بنجاح! في انتظار موافقة الإدارة',
        'status': 'pending'
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """تسجيل الدخول"""
    data = request.get_json()

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'اسم المستخدم وكلمة المرور مطلوبان'}), 400

    conn = get_db()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        (username, username)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401

    if not check_password_hash(user['password_hash'], password):
        conn.close()
        return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401

    # التحقق من حالة الحساب
    if user['status'] == 'pending':
        conn.close()
        return jsonify({'error': 'حسابك في انتظار موافقة الإدارة'}), 403

    if user['status'] == 'rejected':
        conn.close()
        return jsonify({'error': 'تم رفض حسابك. السبب: ' + (user['rejection_reason'] or 'غير محدد')}), 403

    # إنشاء جلسة جديدة
    token = generate_token()
    conn.execute('INSERT INTO sessions (user_id, token) VALUES (?, ?)', (user['id'], token))
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'تم تسجيل الدخول بنجاح',
        'token': token,
        'user_id': user['id'],
        'username': user['username'],
        'is_admin': user['is_admin']
    }), 200


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """تسجيل الخروج"""
    token = request.headers.get('Authorization')
    if token:
        conn = get_db()
        conn.execute('DELETE FROM sessions WHERE token = ?', (token,))
        conn.commit()
        conn.close()
    return jsonify({'message': 'تم تسجيل الخروج'}), 200


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """الحصول على معلومات المستخدم"""
    token = request.headers.get('Authorization')
    current_user = get_user_by_token(token)

    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'المستخدم غير موجود'}), 404

    return jsonify({
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'full_name': user['full_name'],
        'bio': user['bio'],
        'profile_image': user['profile_image'],
        'created_at': user['created_at'],
        'is_admin': user['is_admin']
    }), 200


# ============ API الإدارة ============

@app.route('/api/admin/pending-registrations', methods=['GET'])
def get_pending_registrations():
    """الحصول على طلبات التسجيل المعلقة"""
    token = request.headers.get('Authorization')
    user = get_user_by_token(token)

    if not user or not user['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    pending = conn.execute(
        'SELECT id, username, email, full_name, bio, created_at FROM users WHERE status = ?',
        ('pending',)
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in pending]), 200


@app.route('/api/admin/approve-registration/<int:user_id>', methods=['POST'])
def approve_registration(user_id):
    """الموافقة على طلب تسجيل"""
    token = request.headers.get('Authorization')
    admin = get_user_by_token(token)

    if not admin or not admin['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    conn.execute(
        'UPDATE users SET status = ?, approved_at = ? WHERE id = ?',
        ('approved', datetime.now().isoformat(), user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'تمت الموافقة على الحساب'}), 200


@app.route('/api/admin/reject-registration/<int:user_id>', methods=['POST'])
def reject_registration(user_id):
    """رفض طلب تسجيل"""
    token = request.headers.get('Authorization')
    admin = get_user_by_token(token)

    if not admin or not admin['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    data = request.get_json() or {}
    reason = data.get('reason', '')

    conn = get_db()
    conn.execute(
        'UPDATE users SET status = ?, rejection_reason = ? WHERE id = ?',
        ('rejected', reason, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'تم رفض الحساب'}), 200


@app.route('/api/admin/all-users', methods=['GET'])
def get_all_users():
    """الحصول على جميع المستخدمين"""
    token = request.headers.get('Authorization')
    admin = get_user_by_token(token)

    if not admin or not admin['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    users = conn.execute(
        'SELECT id, username, email, full_name, status, is_admin, created_at FROM users'
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in users]), 200


@app.route('/api/admin/delete-user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """حذف مستخدم"""
    token = request.headers.get('Authorization')
    admin = get_user_by_token(token)

    if not admin or not admin['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    conn.execute('DELETE FROM sessions WHERE user_id = ?', (user_id,))
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'تم حذف المستخدم'}), 200


# ============ API الرسائل ============

@app.route('/api/messages', methods=['GET'])
def get_messages():
    """الحصول على جميع الرسائل"""
    token = request.headers.get('Authorization')
    user = get_user_by_token(token)

    if not user or not user['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    messages = conn.execute(
        'SELECT * FROM messages ORDER BY created_at DESC'
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in messages]), 200


@app.route('/api/messages', methods=['POST'])
def send_message():
    """إرسال رسالة جديدة"""
    data = request.get_json()

    sender_name = data.get('sender_name', '').strip()
    sender_email = data.get('sender_email', '').strip()
    subject = data.get('subject', '').strip()
    content = data.get('content', '').strip()
    message_type = data.get('message_type', 'normal')

    if not sender_name or not sender_email or not content:
        return jsonify({'error': 'الاسم والبريد والرسالة مطلوبة'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (sender_name, sender_email, subject, content, message_type)
        VALUES (?, ?, ?, ?, ?)
    ''', (sender_name, sender_email, subject, content, message_type))

    message_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'تم إرسال الرسالة بنجاح',
        'id': message_id
    }), 201


@app.route('/api/messages/<int:message_id>/read', methods=['POST'])
def mark_message_read(message_id):
    """تحديد الرسالة كمقروءة"""
    token = request.headers.get('Authorization')
    user = get_user_by_token(token)

    if not user or not user['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    conn.execute('UPDATE messages SET is_read = 1 WHERE id = ?', (message_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'تم التحديث'}), 200


@app.route('/api/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    """حذف رسالة"""
    token = request.headers.get('Authorization')
    user = get_user_by_token(token)

    if not user or not user['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    conn.execute('DELETE FROM messages WHERE id = ?', (message_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'تم حذف الرسالة'}), 200


@app.route('/api/messages/stats', methods=['GET'])
def get_message_stats():
    """إحصائيات الرسائل"""
    token = request.headers.get('Authorization')
    user = get_user_by_token(token)

    if not user or not user['is_admin']:
        return jsonify({'error': 'غير مصرح'}), 403

    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM messages').fetchone()[0]
    unread = conn.execute('SELECT COUNT(*) FROM messages WHERE is_read = 0').fetchone()[0]
    conn.close()

    return jsonify({
        'total': total,
        'unread': unread,
        'read': total - unread
    }), 200


# ============ API الملف الشخصي ============

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """الحصول على الملف الشخصي للمستخدم الحالي"""
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'غير مصرح'}), 401

    conn = get_db()
    # إحصائيات المستخدم
    unread = conn.execute(
        'SELECT COUNT(*) FROM private_messages WHERE receiver_id = ? AND is_read = 0',
        (user['id'],)
    ).fetchone()[0]

    contacts_count = conn.execute(
        'SELECT COUNT(*) FROM contacts WHERE user_id = ?',
        (user['id'],)
    ).fetchone()[0]
    conn.close()

    return jsonify({
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'full_name': user['full_name'],
            'bio': user['bio'],
            'profile_image': user['profile_image'],
            'created_at': user['created_at'],
            'is_admin': user['is_admin']
        },
        'stats': {
            'unread_messages': unread,
            'contacts_count': contacts_count
        }
    }), 200


# ============ API المراسلات الخاصة ============

@app.route('/api/messages/inbox', methods=['GET'])
def get_inbox():
    """الرسائل الواردة للمستخدم"""
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'غير مصرح'}), 401

    conn = get_db()
    messages = conn.execute('''
        SELECT pm.*, u.username, u.full_name
        FROM private_messages pm
        JOIN users u ON pm.sender_id = u.id
        WHERE pm.receiver_id = ?
        ORDER BY pm.created_at DESC
    ''', (user['id'],)).fetchall()
    conn.close()

    return jsonify({
        'messages': [dict(row) for row in messages]
    }), 200


@app.route('/api/messages/outbox', methods=['GET'])
def get_outbox():
    """الرسائل المرسلة من المستخدم"""
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'غير مصرح'}), 401

    conn = get_db()
    messages = conn.execute('''
        SELECT pm.*, u.username, u.full_name
        FROM private_messages pm
        JOIN users u ON pm.receiver_id = u.id
        WHERE pm.sender_id = ?
        ORDER BY pm.created_at DESC
    ''', (user['id'],)).fetchall()
    conn.close()

    return jsonify({
        'messages': [dict(row) for row in messages]
    }), 200


@app.route('/api/messages/send', methods=['POST'])
def send_private_message():
    """إرسال رسالة خاصة"""
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'غير مصرح'}), 401

    data = request.get_json()
    receiver_id = data.get('receiver_id')
    subject = data.get('subject', '').strip()
    content = data.get('content', '').strip()

    if not receiver_id or not content:
        return jsonify({'error': 'المستقبل والرسالة مطلوبان'}), 400

    conn = get_db()

    # التحقق من وجود المستقبل
    receiver = conn.execute('SELECT id FROM users WHERE id = ?', (receiver_id,)).fetchone()
    if not receiver:
        conn.close()
        return jsonify({'error': 'المستخدم المستقبل غير موجود'}), 404

    # إرسال الرسالة
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO private_messages (sender_id, receiver_id, subject, content)
        VALUES (?, ?, ?, ?)
    ''', (user['id'], receiver_id, subject, content))

    # إضافة للاتصالات تلقائياً
    cursor.execute('''
        INSERT OR IGNORE INTO contacts (user_id, contact_id) VALUES (?, ?)
    ''', (user['id'], receiver_id))
    cursor.execute('''
        INSERT OR IGNORE INTO contacts (user_id, contact_id) VALUES (?, ?)
    ''', (receiver_id, user['id']))

    conn.commit()
    conn.close()

    return jsonify({'message': 'تم إرسال الرسالة بنجاح'}), 201


@app.route('/api/messages/<int:message_id>/mark-read', methods=['POST'])
def mark_private_message_read(message_id):
    """تحديد الرسالة كمقروءة"""
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'غير مصرح'}), 401

    conn = get_db()
    conn.execute(
        'UPDATE private_messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
        (message_id, user['id'])
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'تم التحديث'}), 200


# ============ API جهات الاتصال ============

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    """الحصول على جهات الاتصال"""
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'غير مصرح'}), 401

    conn = get_db()
    contacts = conn.execute('''
        SELECT u.id, u.username, u.full_name, u.profile_image
        FROM contacts c
        JOIN users u ON c.contact_id = u.id
        WHERE c.user_id = ?
        ORDER BY u.full_name
    ''', (user['id'],)).fetchall()
    conn.close()

    return jsonify({
        'contacts': [dict(row) for row in contacts]
    }), 200


@app.route('/api/users/search', methods=['GET'])
def search_users():
    """البحث عن المستخدمين"""
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'غير مصرح'}), 401

    query = request.args.get('q', '').strip()
    if len(query) < 2:
        return jsonify({'users': []}), 200

    conn = get_db()
    users = conn.execute('''
        SELECT id, username, full_name, profile_image
        FROM users
        WHERE (username LIKE ? OR full_name LIKE ?)
        AND id != ? AND status = 'approved'
        LIMIT 10
    ''', (f'%{query}%', f'%{query}%', user['id'])).fetchall()
    conn.close()

    return jsonify({
        'users': [dict(row) for row in users]
    }), 200


# ============ تشغيل السيرفر ============

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 بدء تشغيل سيرفر منظمة أكرم")
    print("=" * 50)

    # إنشاء قاعدة البيانات
    init_db()

    print("\n📡 السيرفر يعمل على: http://localhost:5000")
    print("📌 بيانات دخول المسؤول:")
    print("   👤 اسم المستخدم: admin")
    print("   🔑 كلمة المرور: akram6_2024")
    print("=" * 50)

    # تشغيل السيرفر
    app.run(host='0.0.0.0', port=5000, debug=True)

