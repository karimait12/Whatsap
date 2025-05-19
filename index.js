const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

// تحميل بيانات الجلسة من ملف JSON
const sessionData = JSON.parse(fs.readFileSync('cards.json', 'utf-8'));

// وظيفة لتهيئة البوت
async function startBot() {
    // إنشاء ملف مؤقت لحفظ الجلسة
    const tempSessionPath = './tempSession.json';
    fs.writeFileSync(tempSessionPath, JSON.stringify(sessionData));

    // تهيئة حالة الاتصال
    const { state, saveState } = useSingleFileAuthState(tempSessionPath);

    // إنشاء اتصال بالواتساب
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // تعطيل عرض رمز QR
    });

    // معالجة الأحداث
    sock.ev.on('messages.upsert', async (m) => {
        console.log('رسالة جديدة:', m);

        const message = m.messages[0];
        if (!message.message) return;

        const sender = message.key.remoteJid;
        const text = message.message.conversation;

        console.log(`رسالة من ${sender}: ${text}`);

        // إرسال رد
        if (text) {
            await sock.sendMessage(sender, { text: 'مرحبًا! هذا بوت واتساب.' });
        }
    });

    // حفظ حالة الاتصال عند أي تغيير
    sock.ev.on('creds.update', saveState);
}

// بدء البوت
startBot().catch((err) => console.error('حدث خطأ:', err));
