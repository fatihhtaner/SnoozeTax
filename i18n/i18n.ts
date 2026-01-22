import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
    en: {
        welcome: 'Good Morning',
        snooze: 'Snooze',
        stop: 'Wake Up',
        penalty_confirm: 'Snooze for %{amount}?',
        settings: 'Settings',
        language: 'Language',
        sign_out: 'Sign Out',
        profile: 'Profile',
        email: 'Email',
        display_name: 'Display Name',
        feedback: 'Feedback',
        rate_app: 'Rate App',
        privacy_policy: 'Privacy Policy',
        privacy_policy_text: `
PRIVACY POLICY FOR SNOOZETAX

Last updated: January 23, 2026

1. INTRODUCTION
Welcome to SnoozeTax ("we," "our," or "us"). We accept your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our mobile application (the "App").

2. INFORMATION WE COLLECT

A. Personal Data
We may collect personal information that you voluntarily provide to us when registering with the App, such as:
- Name / Display Name
- Email address
- Password (encrypted)
- Profile information

B. Financial Data
Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) is handled by our payment processor (Stripe). We do not store your full financial information on our servers.

C. Usage Data
We may automatically collect information about your interactions with the App, such as:
- Logs of alarm creation and snooze patterns
- Device information (model, OS version)
- Crash logs for debugging

3. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Create and manage your account.
- Process payments for "Snooze Penalties".
- Send you notifications related to your alarms.
- Improve the App's performance and user experience.
- Prevent fraudulent transactions.

4. DISCLOSURE OF YOUR INFORMATION
We may share information with third parties only in the following situations:
- Service Providers: With third-party vendors (like Firebase for authentication/database and Stripe for payments) who perform services for us.
- Legal Requirements: If required to do so by law or in response to valid requests by public authorities.

5. SECURITY OF YOUR INFORMATION
We use administrative, technical, and physical security measures to help protect your personal information. However, please be aware that no security measures are perfect or impenetrable.

6. YOUR DATA RIGHTS
Depending on your location, you may have the right to:
- Request access to the personal data we hold about you.
- Request correction of any inaccurate data.
- Request deletion of your account and personal data.

7. CONTACT US
If you have questions or comments about this Privacy Policy, please contact us at:

Website: https://ibrahimfatihtaner.com/#contact
`,
        version: 'Version',
        switch_to_en: 'Switch to English?',
        switch_to_tr: 'Switch to Turkish?',
        error: 'Error',
        failed_sign_out: 'Failed to sign out',
        no_alarms: 'No alarms set. Sleep tight!',
        add_alarm_hint: 'Tap + to start paying for your sleep.',
        tap_plus_to_create: 'Tap + to create an alarm.',
        tab_alarms: 'Alarms',
        tab_stats: 'Stats',
        tab_profile: 'Profile',
        edit_alarm: 'Edit Alarm',
        new_alarm: 'New Alarm',
        repeat: 'Repeat',
        sound: 'Sound',
        penalty_amount: 'Penalty Amount ($)',
        penalty_hint: 'Cost per snooze button tap.',
        label_input: 'Label',
        default_label: 'Wake Up',
        save_alarm: 'Save Alarm',
        delete_alarm: 'Delete Alarm',
        delete_confirm_msg: 'Are you sure?',
        cancel: 'Cancel',
        delete: 'Delete',
        invalid_penalty: 'Invalid Penalty',
        invalid_penalty_msg: 'Please enter a valid amount.',
        error_load: 'Failed to load alarm',
        error_save: 'Failed to save alarm',
        error_delete: 'Failed to delete alarm',
        every_day: 'Every day',
        once: 'Once',
        penalty_label: 'Penalty',
        day_short_0: 'Sun',
        day_short_1: 'Mon',
        day_short_2: 'Tue',
        day_short_3: 'Wed',
        day_short_4: 'Thu',
        day_short_5: 'Fri',
        day_short_6: 'Sat',
        dashboard_title: 'Dashboard',
        dashboard_subtitle: 'Track your progress & losses.',
        total_lost: 'TOTAL LOST',
        lost: 'Lost',
        money_slept_away: 'Money literally slept away.',
        snoozes: 'Snoozes',
        score: 'Score',
        motivation_title: 'Keep going!',
        motivation_text: 'Every morning you wake up on time, you are saving money and building discipline.',
        wake_up_success_msg: 'You saved money by waking up on time! ☀️',
        im_up: "I'M UP!",
        stop_alarm: 'Stop Alarm',
        payment_required: 'Payment Required',
        payment_warning: 'You are about to pay to sleep 9 more minutes.',
        processing: 'Processing...',
        pay_now: 'Pay Now',
        payment_successful: 'Payment Successful',
        snooze_success_msg: 'Alarm snoozed for 9 minutes.',
        transaction_failed: 'Transaction failed.',
        // Auth screens
        sign_in: 'Sign In',
        sign_up: 'Sign Up',
        password: 'Password',
        full_name: 'Full Name',
        confirm_password: 'Confirm Password',
        password_mismatch: 'Passwords do not match.',
        create_account: 'Create Account',
        dont_have_account: "Don't have an account?",
        already_have_account: 'Already have an account?',
        fill_all_fields: 'Please fill in all fields.',
        account_created: 'Account created successfully!',
        login_failed: 'Login Failed',
        registration_failed: 'Registration Failed',
        email_password_required: 'Please enter both email and password.',
        success: 'Success',
        continue_with_google: 'Continue with Google',
        continue_with_apple: 'Continue with Apple',
        or_divider: 'OR',
        social_auth_error: 'Social sign-in failed',
        delete_account: 'Delete Account',
        delete_account_confirm: 'This action is irreversible. All your data will be lost.',
        // Errors
        errors: {
            invalid_email: 'Invalid email address.',
            user_disabled: 'This account has been disabled.',
            user_not_found: 'No account found with this email.',
            wrong_password: 'Incorrect password.',
            email_in_use: 'Email is already in use.',
            weak_password: 'Password should be at least 6 characters.',
            operation_not_allowed: 'Operation not allowed.',
            requires_recent_login: 'Please log in again to continue.',
            credential_in_use: 'This account is already linked to another user.',
            invalid_credential: 'Invalid credentials.',
            too_many_requests: 'Too many attempts. Please try again later.',
            network_error: 'Network error. Please check your connection.',
            unknown: 'An unknown error occurred.',
        },
        // Penalty Tiers
        tier_mild: 'Mild',
        tier_medium: 'Medium',
        tier_harsh: 'Harsh',
        tier_nuclear: 'Nuclear',
        // Sound Names
        sound_classic: 'Classic',
        sound_rain: 'Rain',
        sound_energize: 'Energize',
        sound_forest: 'Forest',
        sound_ocean: 'Ocean',
        sound_piano: 'Piano',
        sound_alarm_clock_beep: 'Alarm Clock Beep',
        sound_alarm_digital_clock_beep: 'Digital Clock Beep',
        sound_alarm_tone: 'Alarm Tone',
        sound_alert: 'Alert',
        sound_battleship: 'Battleship',
        sound_casino_jackpot: 'Casino Jackpot',
        sound_casino_win: 'Casino Win',
        sound_city_alert: 'City Siren',
        sound_classic_short: 'Classic Short',
        sound_classic_winner: 'Classic Winner',
        sound_critical: 'Critical',
        sound_data_scaner: 'Data Scanner',
        sound_digital_buzzer: 'Digital Buzzer',
        sound_emergency_alert: 'Emergency Alert',
        sound_facility_alarm: 'Facility Alarm',
        sound_facility: 'Facility',
        sound_game_notification: 'Game Notification',
        sound_interface_hint: 'Interface Hint',
        sound_morning_clock: 'Morning Clock',
        sound_retro_game: 'Retro Game',
        sound_rooster: 'Rooster',
        sound_scanning_sci_fi: 'Sci-Fi Scan',
        sound_security_breach: 'Security Breach',
        sound_short_rooster: 'Short Rooster',
        sound_slot_machine_payout: 'Slot Payout',
        sound_slot_machine_win: 'Slot Win',
        sound_alert_hall: 'Hall Alert',
        sound_space_shooter: 'Space Shooter',
        sound_spaceship: 'Spaceship',
        sound_street_public: 'Street Public',
        sound_vintage_warning: 'Vintage Warning',
        sound_warning_buzzer: 'Warning Buzzer',
        default_sound: 'Classic',
    },
    tr: {
        welcome: 'Günaydın',
        snooze: 'Ertele',
        stop: 'Uyan',
        penalty_confirm: '%{amount} karşılığında ertele?',
        settings: 'Ayarlar',
        language: 'Dil',
        sign_out: 'Çıkış Yap',
        profile: 'Profil',
        email: 'E-posta',
        display_name: 'Görünen Ad',
        feedback: 'Geri Bildirim',
        rate_app: 'Uygulamayı Değerlendir',
        privacy_policy: 'Gizlilik Politikası',
        privacy_policy_text: `
SNOOZETAX GİZLİLİK POLİTİKASI

Son güncelleme: 23 Ocak 2026

1. GİRİŞ
SnoozeTax ("biz", "bizim") olarak gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, mobil uygulamamızı ("Uygulama") kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.

2. TOPLADIĞIMIZ BİLGİLER

A. Kişisel Veriler
Uygulamaya kayıt olurken gönüllü olarak sağladığınız kişisel bilgileri toplayabiliriz:
- İsim / Görünen Ad
- E-posta adresi
- Şifre (şifrelenmiş)
- Profil bilgileri

B. Finansal Veriler
Ödeme yönteminizle ilgili veriler (örn. kredi kartı numarası, son kullanma tarihi) ödeme işlemcimiz (Stripe) tarafından işlenir. Tam finansal bilgilerinizi sunucularımızda saklamayız.

C. Kullanım Verileri
Uygulama ile etkileşimleriniz hakkında otomatik olarak bilgi toplayabiliriz:
- Alarm oluşturma ve erteleme (snooze) kayıtları
- Cihaz bilgileri (model, işletim sistemi sürümü)
- Hata ayıklama için çökme raporları

3. BİLGİLERİNİZİ NASIL KULLANIYORUZ
Topladığımız bilgileri şu amaçlarla kullanırız:
- Hesabınızı oluşturmak ve yönetmek.
- "Erteleme Cezaları" için ödemeleri işlemek.
- Alarmlarınızla ilgili bildirimler göndermek.
- Uygulama performansını ve kullanıcı deneyimini iyileştirmek.
- Hileli işlemleri önlemek.

4. BİLGİLERİNİZİN PAYLAŞIMI
Bilgileri yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşabiliriz:
- Hizmet Sağlayıcılar: Bizim adımıza hizmet veren üçüncü taraf satıcılarla (kimlik doğrulama/veritabanı için Firebase ve ödemeler için Stripe gibi).
- Yasal Gereklilikler: Kanunen gerekli olduğunda veya kamu otoritelerinin geçerli taleplerine yanıt olarak.

5. BİLGİLERİNİZİN GÜVENLİĞİ
Kişisel bilgilerinizi korumak için idari, teknik ve fiziksel güvenlik önlemleri kullanıyoruz. Ancak, hiçbir güvenlik önleminin mükemmel veya aşılamaz olmadığını lütfen unutmayın.

6. VERİ HAKLARINIZ
Konumunuza bağlı olarak şu haklara sahip olabilirsiniz:
- Hakkınızda tuttuğumuz kişisel verilere erişim talebi.
- Yanlış verilerin düzeltilmesini talep etme.
- Hesabınızın ve kişisel verilerinizin silinmesini talep etme.

7. İLETİŞİM
Bu Gizlilik Politikası hakkında sorularınız veya yorumlarınız varsa, lütfen bizimle iletişime geçin:

Web Sitesi: https://ibrahimfatihtaner.com/#contact
`,
        version: 'Sürüm',
        switch_to_en: 'İngilizceye geç?',
        switch_to_tr: 'Türkçeye geç?',
        error: 'Hata',
        failed_sign_out: 'Çıkış yapılamadı',
        no_alarms: 'Alarm yok. Mışıl mışıl uyu!',
        add_alarm_hint: 'Uykunu cezalandırmak için +\'ya bas.',
        tap_plus_to_create: 'Alarm oluşturmak için + tuşuna basın.',
        tab_alarms: 'Alarmlar',
        tab_stats: 'İstatistik',
        tab_profile: 'Profil',
        edit_alarm: 'Alarmı Düzenle',
        new_alarm: 'Yeni Alarm',
        repeat: 'Tekrar',
        sound: 'Ses',
        penalty_amount: 'Ceza Miktarı ($)',
        penalty_hint: 'Erteleme başına ücret.',
        label_input: 'Etiket',
        default_label: 'Uyan',
        save_alarm: 'Alarmı Kaydet',
        delete_alarm: 'Alarmı Sil',
        delete_confirm_msg: 'Emin misiniz?',
        cancel: 'İptal',
        delete: 'Sil',
        invalid_penalty: 'Geçersiz Ceza',
        invalid_penalty_msg: 'Lütfen geçerli bir miktar girin.',
        error_load: 'Alarm yüklenemedi',
        error_save: 'Alarm kaydedilemedi',
        error_delete: 'Alarm silinemedi',
        every_day: 'Her gün',
        once: 'Bir kez',
        penalty_label: 'Ceza',
        day_short_0: 'Paz',
        day_short_1: 'Pzt',
        day_short_2: 'Sal',
        day_short_3: 'Çar',
        day_short_4: 'Per',
        day_short_5: 'Cum',
        day_short_6: 'Cmt',
        dashboard_title: 'Panel',
        dashboard_subtitle: 'İlerlemeni ve kayıplarını takip et.',
        total_lost: 'TOPLAM KAYIP',
        lost: 'Kayıp',
        money_slept_away: 'Uykuya giden paralar.',
        snoozes: 'Ertelemeler',
        score: 'Puan',
        motivation_title: 'Devam et!',
        motivation_text: 'Zamanında uyandığın her sabah para biriktiriyor ve disiplin kazanıyorsun.',
        wake_up_success_msg: 'Zamanında uyanarak para biriktirdin! ☀️',
        im_up: 'UYANDIM!',
        stop_alarm: 'Alarmı Durdur',
        payment_required: 'Ödeme Gerekli',
        payment_warning: '9 dakika daha uyumak için ödeme yapmak üzeresin.',
        processing: 'İşleniyor...',
        pay_now: 'Şimdi Öde',
        payment_successful: 'Ödeme Başarılı',
        snooze_success_msg: 'Alarm 9 dakika ertelendi.',
        transaction_failed: 'İşlem başarısız.',
        // Auth screens
        sign_in: 'Giriş Yap',
        sign_up: 'Kayıt Ol',
        password: 'Şifre',
        full_name: 'Ad Soyad',
        confirm_password: 'Şifreyi Onayla',
        password_mismatch: 'Şifreler uyuşmuyor.',
        create_account: 'Hesap Oluştur',
        dont_have_account: 'Hesabınız yok mu?',
        already_have_account: 'Zaten hesabınız var mı?',
        fill_all_fields: 'Lütfen tüm alanları doldurun.',
        account_created: 'Hesap başarıyla oluşturuldu!',
        login_failed: 'Giriş Başarısız',
        registration_failed: 'Kayıt Başarısız',
        email_password_required: 'Lütfen e-posta ve şifre girin.',
        success: 'Başarılı',
        continue_with_google: 'Google ile Devam Et',
        continue_with_apple: 'Apple ile Devam Et',
        or_divider: 'VEYA',
        social_auth_error: 'Sosyal giriş başarısız',
        delete_account: 'Hesabı Sil',
        delete_account_confirm: 'Bu işlem geri alınamaz. Tüm verileriniz silinecek.',
        // Errors
        errors: {
            invalid_email: 'Geçersiz e-posta adresi.',
            user_disabled: 'Bu hesap devre dışı bırakıldı.',
            user_not_found: 'Bu e-posta ile kayıtlı hesap bulunamadı.',
            wrong_password: 'Şifre yanlış.',
            email_in_use: 'Bu e-posta adresi zaten kullanımda.',
            weak_password: 'Şifre en az 6 karakter olmalıdır.',
            operation_not_allowed: 'İşleme izin verilmiyor.',
            requires_recent_login: 'Devam etmek için lütfen tekrar giriş yapın.',
            credential_in_use: 'Bu hesap zaten başka bir kullanıcıya bağlı.',
            invalid_credential: 'Geçersiz kimlik bilgileri.',
            too_many_requests: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
            network_error: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.',
            unknown: 'Bilinmeyen bir hata oluştu.',
        },
        // Penalty Tiers
        tier_mild: 'Kolay',
        tier_medium: 'Orta',
        tier_harsh: 'Zor',
        tier_nuclear: 'Nükleer',
        // Sound Names
        sound_classic: 'Klasik',
        sound_rain: 'Yağmur',
        sound_energize: 'Enerji',
        sound_forest: 'Orman',
        sound_ocean: 'Okyanus',
        sound_piano: 'Piyano',
        sound_alarm_clock_beep: 'Alarm Saati Bip',
        sound_alarm_digital_clock_beep: 'Dijital Saat Bip',
        sound_alarm_tone: 'Alarm Tonu',
        sound_alert: 'Uyarı',
        sound_battleship: 'Savaş Gemisi',
        sound_casino_jackpot: 'Casino Jackpot',
        sound_casino_win: 'Casino Kazanç',
        sound_city_alert: 'Şehir Sireni',
        sound_classic_short: 'Klasik Kısa',
        sound_classic_winner: 'Klasik Kazanan',
        sound_critical: 'Kritik',
        sound_data_scaner: 'Veri Tarayıcı',
        sound_digital_buzzer: 'Dijital Buzzer',
        sound_emergency_alert: 'Acil Durum',
        sound_facility_alarm: 'Tesis Alarmı',
        sound_facility: 'Tesis',
        sound_game_notification: 'Oyun Bildirimi',
        sound_interface_hint: 'Arayüz İpucu',
        sound_morning_clock: 'Sabah Saati',
        sound_retro_game: 'Retro Oyun',
        sound_rooster: 'Horoz',
        sound_scanning_sci_fi: 'Bilim Kurgu Tarama',
        sound_security_breach: 'Güvenlik İhlali',
        sound_short_rooster: 'Kısa Horoz',
        sound_slot_machine_payout: 'Slot Ödeme',
        sound_slot_machine_win: 'Slot Kazanma',
        sound_alert_hall: 'Salon Uyarısı',
        sound_space_shooter: 'Uzay Avcısı',
        sound_spaceship: 'Uzay Gemisi',
        sound_street_public: 'Cadde',
        sound_vintage_warning: 'Eski Tarz Uyarı',
        sound_warning_buzzer: 'Uyarı Buzzer',
        default_sound: 'Klasik',
    },
    de: {
        welcome: 'Guten Morgen',
        snooze: 'Schlummern',
        stop: 'Aufwachen',
        penalty_confirm: 'Schlummern für %{amount}?',
        settings: 'Einstellungen',
        language: 'Sprache',
        sign_out: 'Abmelden',
        profile: 'Profil',
        email: 'E-Mail',
        display_name: 'Anzeigename',
        feedback: 'Feedback',
        rate_app: 'App bewerten',
        privacy_policy: 'Datenschutzrichtlinie',
        privacy_policy_text: `
DATENSCHUTZERKLÄRUNG FÜR SNOOZETAX

Zuletzt aktualisiert: 23. Januar 2026

1. EINFÜHRUNG
Willkommen bei SnoozeTax ("wir", "unser" oder "uns"). Wir nehmen Ihre Privatsphäre ernst. Diese Datenschutzerklärung erläutert, wie wir Ihre Informationen sammeln, verwenden, offenlegen und schützen, wenn Sie unsere mobile Anwendung (die "App") nutzen.

2. INFORMATIONEN, DIE WIR SAMMELN

A. Personenbezogene Daten
Wir können personenbezogene Daten sammeln, die Sie uns freiwillig bei der Registrierung in der App zur Verfügung stellen, wie z.B.:
- Name / Anzeigename
- E-Mail-Adresse
- Passwort (verschlüsselt)
- Profilinformationen

B. Finanzdaten
Finanzinformationen, wie Daten zu Ihrer Zahlungsmethode (z.B. gültige Kreditkartennummer, Kartenmarke, Ablaufdatum), werden von unserem Zahlungsabwickler (Stripe) verarbeitet. Wir speichern Ihre vollständigen Finanzdaten nicht auf unseren Servern.

C. Nutzungsdaten
Wir können automatisch Informationen über Ihre Interaktionen mit der App sammeln, wie z.B.:
- Protokolle über Alarmerstellung und Schlummermuster
- Geräteinformationen (Modell, OS-Version)
- Absturzberichte zur Fehlerbehebung

3. WIE WIR IHRE INFORMATIONEN VERWENDEN
Wir verwenden die gesammelten Informationen, um:
- Ihr Konto zu erstellen und zu verwalten.
- Zahlungen für "Schlummerstrafen" zu verarbeiten.
- Ihnen Benachrichtigungen zu Ihren Alarmen zu senden.
- Die Leistung der App und die Benutzererfahrung zu verbessern.
- Betrügerische Transaktionen zu verhindern.

4. WEITERGABE IHRER INFORMATIONEN
Wir geben Informationen nur in folgenden Situationen an Dritte weiter:
- Dienstleister: An Drittanbieter (wie Firebase für Authentifizierung/Datenbank und Stripe für Zahlungen), die Dienstleistungen für uns erbringen.
- Gesetzliche Anforderungen: Wenn dies gesetzlich vorgeschrieben ist oder als Reaktion auf gültige Anfragen von Behörden.

5. SICHERHEIT IHRER INFORMATIONEN
Wir setzen administrative, technische und physische Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten zu schützen. Bitte beachten Sie jedoch, dass keine Sicherheitsmaßnahme perfekt oder undurchdringlich ist.

6. IHRE DATENRECHTE
Je nach Standort haben Sie möglicherweise das Recht:
- Auskunft über die von uns über Sie gespeicherten personenbezogenen Daten zu verlangen.
- Die Berichtigung unrichtiger Daten zu verlangen.
- Die Löschung Ihres Kontos und Ihrer personenbezogenen Daten zu verlangen.

7. KONTAKT
Wenn Sie Fragen oder Kommentare zu dieser Datenschutzerklärung haben, kontaktieren Sie uns bitte unter:

Webseite: https://ibrahimfatihtaner.com/#contact
`,
        version: 'Version',
        switch_to_en: 'Zu Englisch wechseln?',
        switch_to_tr: 'Zu Türkisch wechseln?',
        error: 'Fehler',
        failed_sign_out: 'Abmeldung fehlgeschlagen',
        no_alarms: 'Keine Wecker gestellt. Schlaf gut!',
        add_alarm_hint: 'Tippe +, um für deinen Schlaf zu bezahlen.',
        tap_plus_to_create: 'Tippen Sie auf +, um einen Alarm zu erstellen.',
        tab_alarms: 'Wecker',
        tab_stats: 'Statistik',
        tab_profile: 'Profil',
        edit_alarm: 'Wecker bearbeiten',
        new_alarm: 'Neuer Wecker',
        repeat: 'Wiederholen',
        sound: 'Ton',
        penalty_amount: 'Strafbetrag ($)',
        penalty_hint: 'Kosten pro Schlummertaste.',
        label_input: 'Bezeichnung',
        default_label: 'Aufwachen',
        save_alarm: 'Wecker speichern',
        delete_alarm: 'Wecker löschen',
        delete_confirm_msg: 'Bist du sicher?',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        invalid_penalty: 'Ungültige Strafe',
        invalid_penalty_msg: 'Bitte gib einen gültigen Betrag ein.',
        error_load: 'Wecker konnte nicht geladen werden',
        error_save: 'Wecker konnte nicht gespeichert werden',
        error_delete: 'Wecker konnte nicht gelöscht werden',
        every_day: 'Jeden Tag',
        once: 'Einmal',
        penalty_label: 'Strafe',
        day_short_0: 'So',
        day_short_1: 'Mo',
        day_short_2: 'Di',
        day_short_3: 'Mi',
        day_short_4: 'Do',
        day_short_5: 'Fr',
        day_short_6: 'Sa',
        dashboard_title: 'Dashboard',
        dashboard_subtitle: 'Verfolge deinen Fortschritt.',
        total_lost: 'GESAMTVERLUST',
        lost: 'Verlust',
        money_slept_away: 'Geld im Schlaf verloren.',
        snoozes: 'Schlummer',
        score: 'Punktzahl',
        motivation_title: 'Weiter so!',
        motivation_text: 'Jeden Morgen, an dem du pünktlich aufwachst, sparst du Geld und baust Disziplin auf.',
        wake_up_success_msg: 'Du hast Geld gespart, indem du pünktlich aufgewacht bist! ☀️',
        im_up: 'ICH BIN WACH!',
        stop_alarm: 'Alarm Stoppen',
        payment_required: 'Zahlung Erforderlich',
        payment_warning: 'Du bist dabei, für 9 Minuten mehr Schlaf zu bezahlen.',
        processing: 'Verarbeitung...',
        pay_now: 'Jetzt zahlen',
        payment_successful: 'Zahlung erfolgreich',
        snooze_success_msg: 'Alarm für 9 Minuten geschlummert.',
        transaction_failed: 'Transaktion fehlgeschlagen.',
        // Auth screens
        sign_in: 'Anmelden',
        sign_up: 'Registrieren',
        password: 'Passwort',
        full_name: 'Vollständiger Name',
        confirm_password: 'Passwort bestätigen',
        password_mismatch: 'Passwörter stimmen nicht überein.',
        create_account: 'Konto erstellen',
        dont_have_account: 'Noch kein Konto?',
        already_have_account: 'Bereits ein Konto?',
        fill_all_fields: 'Bitte füllen Sie alle Felder aus.',
        account_created: 'Konto erfolgreich erstellt!',
        login_failed: 'Anmeldung fehlgeschlagen',
        registration_failed: 'Registrierung fehlgeschlagen',
        email_password_required: 'Bitte E-Mail und Passwort eingeben.',
        success: 'Erfolg',
        continue_with_google: 'Mit Google fortfahren',
        continue_with_apple: 'Mit Apple fortfahren',
        or_divider: 'ODER',
        social_auth_error: 'Soziale Anmeldung fehlgeschlagen',
        delete_account: 'Konto löschen',
        delete_account_confirm: 'Diese Aktion ist irreversibel. Alle Ihre Daten gehen verloren.',
        // Errors - German
        errors: {
            invalid_email: 'Ungültige E-Mail-Adresse.',
            user_disabled: 'Dieses Konto wurde deaktiviert.',
            user_not_found: 'Kein Konto mit dieser E-Mail gefunden.',
            wrong_password: 'Falsches Passwort.',
            email_in_use: 'E-Mail wird bereits verwendet.',
            weak_password: 'Passwort muss mindestens 6 Zeichen lang sein.',
            operation_not_allowed: 'Vorgang nicht zulässig.',
            requires_recent_login: 'Bitte melden Sie sich erneut an.',
            credential_in_use: 'Dieses Konto ist bereits verknüpft.',
            invalid_credential: 'Ungültige Anmeldeinformationen.',
            too_many_requests: 'Zu viele Versuche. Bitte versuchen Sie es später erneut.',
            network_error: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
            unknown: 'Ein unbekannter Fehler ist aufgetreten.',
        },
        // Penalty Tiers
        tier_mild: 'Mild',
        tier_medium: 'Mittel',
        tier_harsh: 'Hart',
        tier_nuclear: 'Nuklear',
        // Sound Names
        sound_classic: 'Klassisch',
        sound_rain: 'Regen',
        sound_energize: 'Energie',
        sound_forest: 'Wald',
        sound_ocean: 'Ozean',
        sound_piano: 'Klavier',
        default_sound: 'Klassisch',
    },
    fr: {
        welcome: 'Bonjour',
        snooze: 'Snooze',
        stop: 'Réveillez-vous',
        penalty_confirm: 'Snooze pour %{amount}?',
        settings: 'Paramètres',
        language: 'Langue',
        sign_out: 'Se déconnecter',
        profile: 'Profil',
        email: 'Email',
        display_name: 'Nom d\'affichage',
        feedback: 'Commentaires',
        rate_app: 'Évaluer l\'application',
        privacy_policy: 'Politique de confidentialité',
        privacy_policy_text: `
POLITIQUE DE CONFIDENTIALITÉ DE SNOOZETAX

Dernière mise à jour : 23 janvier 2026

1. INTRODUCTION
Bienvenue sur SnoozeTax ("nous", "notre" ou "nos"). Nous prenons votre vie privée au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre application mobile (l'"Application").

2. INFORMATIONS QUE NOUS COLLECTONS

A. Données personnelles
Nous pouvons collecter des informations personnelles que vous nous fournissez volontairement lors de votre inscription à l'Application, telles que :
- Nom / Nom d'affichage
- Adresse e-mail
- Mot de passe (chiffré)
- Informations de profil

B. Données financières
Les informations financières, telles que les données relatives à votre mode de paiement (par exemple, numéro de carte de crédit valide, marque de la carte, date d'expiration), sont traitées par notre processeur de paiement (Stripe). Nous ne stockons pas vos informations financières complètes sur nos serveurs.

C. Données d'utilisation
Nous pouvons collecter automatiquement des informations sur vos interactions avec l'Application, telles que :
- Journaux de création d'alarmes et modèles de répétition (snooze)
- Informations sur l'appareil (modèle, version du système d'exploitation)
- Rapports de plantage pour le débogage

3. COMMENT NOUS UTILISONS VOS INFORMATIONS
Nous utilisons les informations que nous collectons pour :
- Créer et gérer votre compte.
- Traiter les paiements pour les "Pénalités de Snooze".
- Vous envoyer des notifications liées à vos alarmes.
- Améliorer les performances de l'Application et l'expérience utilisateur.
- Prévenir les transactions frauduleuses.

4. DIVULGATION DE VOS INFORMATIONS
Nous pouvons partager des informations avec des tiers uniquement dans les situations suivantes :
- Prestataires de services : Avec des fournisseurs tiers (comme Firebase pour l'authentification/base de données et Stripe pour les paiements) qui effectuent des services pour nous.
- Exigences légales : Si la loi l'exige ou en réponse à des demandes valides des autorités publiques.

5. SÉCURITÉ DE VOS INFORMATIONS
Nous utilisons des mesures de sécurité administratives, techniques et physiques pour aider à protéger vos informations personnelles. Cependant, veuillez noter qu'aucune mesure de sécurité n'est parfaite ou impénétrable.

6. VOS DROITS SUR LES DONNÉES
Selon votre emplacement, vous pouvez avoir le droit de :
- Demander l'accès aux données personnelles que nous détenons à votre sujet.
- Demander la correction de toute donnée inexacte.
- Demander la suppression de votre compte et de vos données personnelles.

7. CONTACTEZ-NOUS
Si vous avez des questions ou des commentaires sur cette politique de confidentialité, veuillez nous contacter à :

Site Web : https://ibrahimfatihtaner.com/#contact
`,
        version: 'Version',
        switch_to_en: 'Passer à l\'anglais?',
        switch_to_tr: 'Passer au turc?',
        error: 'Erreur',
        failed_sign_out: 'Échec de la déconnexion',
        no_alarms: 'Aucun réveil défini. Dormez bien !',
        add_alarm_hint: 'Appuyez sur + pour commencer à payer pour votre sommeil.',
        tap_plus_to_create: 'Appuyez sur + pour créer une alarme.',
        tab_alarms: 'Réveils',
        tab_stats: 'Stats',
        tab_profile: 'Profil',
        edit_alarm: 'Modifier l\'alarme',
        new_alarm: 'Nouvelle alarme',
        repeat: 'Répéter',
        sound: 'Sonnerie',
        penalty_amount: 'Montant de la pénalité ($)',
        penalty_hint: 'Coût par appui sur snooze.',
        label_input: 'Libellé',
        default_label: 'Réveil',
        save_alarm: 'Enregistrer',
        delete_alarm: 'Supprimer',
        delete_confirm_msg: 'Êtes-vous sûr ?',
        cancel: 'Annuler',
        delete: 'Supprimer',
        invalid_penalty: 'Pénalité invalide',
        invalid_penalty_msg: 'Veuillez entrer un montant valide.',
        error_load: 'Échec du chargement de l\'alarme',
        error_save: 'Échec de l\'enregistrement',
        error_delete: 'Échec de la suppression',
        every_day: 'Tous les jours',
        once: 'Une fois',
        penalty_label: 'Pénalité',
        day_short_0: 'Dim',
        day_short_1: 'Lun',
        day_short_2: 'Mar',
        day_short_3: 'Mer',
        day_short_4: 'Jeu',
        day_short_5: 'Ven',
        day_short_6: 'Sam',
        dashboard_title: 'Tableau de bord',
        dashboard_subtitle: 'Suivez vos progrès et vos pertes.',
        total_lost: 'PERTE TOTALE',
        lost: 'Perdu',
        money_slept_away: 'L\'argent littéralement dormi.',
        snoozes: 'Snoozes',
        score: 'Score',
        motivation_title: 'Continuez comme ça !',
        motivation_text: 'Chaque matin où vous vous réveillez à l\'heure, vous économisez de l\'argent et renforcez votre discipline.',
        wake_up_success_msg: 'Vous avez économisé de l\'argent en vous réveillant à l\'heure ! ☀️',
        im_up: 'JE SUIS RÉVEILLÉ!',
        stop_alarm: 'Arrêter l\'alarme',
        payment_required: 'Paiement requis',
        payment_warning: 'Vous êtes sur le point de payer pour dormir 9 minutes de plus.',
        processing: 'Traitement...',
        pay_now: 'Payer maintenant',
        payment_successful: 'Paiement réussi',
        snooze_success_msg: 'Alarme reportée de 9 minutes.',
        transaction_failed: 'Échec de la transaction.',
        // Auth screens
        sign_in: 'Se connecter',
        sign_up: "S'inscrire",
        password: 'Mot de passe',
        full_name: 'Nom complet',
        confirm_password: 'Confirmer le mot de passe',
        password_mismatch: 'Les mots de passe ne correspondent pas.',
        create_account: 'Créer un compte',
        dont_have_account: "Pas encore de compte?",
        already_have_account: 'Vous avez déjà un compte?',
        fill_all_fields: 'Veuillez remplir tous les champs.',
        account_created: 'Compte créé avec succès!',
        login_failed: 'Échec de la connexion',
        registration_failed: "Échec de l'inscription",
        email_password_required: 'Veuillez entrer email et mot de passe.',
        success: 'Succès',
        continue_with_google: 'Continuer avec Google',
        continue_with_apple: 'Continuer avec Apple',
        or_divider: 'OU',
        social_auth_error: 'Échec de la connexion sociale',
        delete_account: 'Supprimer le compte',
        delete_account_confirm: 'Cette action est irréversible. Toutes vos données seront perdues.',
        // Errors - French
        errors: {
            invalid_email: 'Adresse e-mail invalide.',
            user_disabled: 'Ce compte a été désactivé.',
            user_not_found: 'Aucun compte trouvé avec cet e-mail.',
            wrong_password: 'Mot de passe incorrect.',
            email_in_use: 'L\'e-mail est déjà utilisé.',
            weak_password: 'Le mot de passe doit comporter au moins 6 caractères.',
            operation_not_allowed: 'Opération non autorisée.',
            requires_recent_login: 'Veuillez vous reconnecter pour continuer.',
            credential_in_use: 'Ce compte est déjà lié.',
            invalid_credential: 'Identifiants invalides.',
            too_many_requests: 'Trop de tentatives. Veuillez réessayer plus tard.',
            network_error: 'Erreur réseau. Veuillez vérifier votre connexion.',
            unknown: 'Une erreur inconnue s\'est produite.',
        },
        // Penalty Tiers
        tier_mild: 'Doux',
        tier_medium: 'Moyen',
        tier_harsh: 'Sévère',
        tier_nuclear: 'Nucléaire',
        // Sound Names
        sound_classic: 'Classique',
        sound_rain: 'Pluie',
        sound_energize: 'Énergie',
        sound_forest: 'Forêt',
        sound_ocean: 'Océan',
        sound_piano: 'Piano',
        default_sound: 'Classique',
    },
    es: {
        welcome: 'Buenos días',
        snooze: 'Posponer',
        stop: 'Despertar',
        penalty_confirm: '¿Posponer por %{amount}?',
        settings: 'Configuración',
        language: 'Idioma',
        sign_out: 'Cerrar sesión',
        profile: 'Perfil',
        email: 'Correo electrónico',
        display_name: 'Nombre para mostrar',
        feedback: 'Comentarios',
        rate_app: 'Calificar aplicación',
        privacy_policy: 'Política de privacidad',
        privacy_policy_text: `
POLÍTICA DE PRIVACIDAD DE SNOOZETAX

Última actualización: 23 de enero de 2026

1. INTRODUCCIÓN
Bienvenido a SnoozeTax ("nosotros", "nuestro" o "nos"). Nos tomamos su privacidad en serio. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestra aplicación móvil (la "Aplicación").

2. INFORMACIÓN QUE RECOPILAMOS

A. Datos personales
Podemos recopilar información personal que usted nos proporcione voluntariamente al registrarse en la Aplicación, como:
- Nombre / Nombre para mostrar
- Dirección de correo electrónico
- Contraseña (cifrada)
- Información de perfil

B. Datos financieros
La información financiera, como los datos relacionados con su método de pago (por ejemplo, número de tarjeta de crédito válido, marca de la tarjeta, fecha de vencimiento), es manejada por nuestro procesador de pagos (Stripe). No almacenamos su información financiera completa en nuestros servidores.

C. Datos de uso
Podemos recopilar automáticamente información sobre sus interacciones con la Aplicación, como:
- Registros de creación de alarmas y patrones de repetición (snooze)
- Información del dispositivo (modelo, versión del sistema operativo)
- Registros de fallos para depuración

3. CÓMO USAMOS SU INFORMACIÓN
Usamos la información que recopilamos para:
- Crear y administrar su cuenta.
- Procesar pagos por "Penalizaciones de Snooze".
- Enviarle notificaciones relacionadas con sus alarmas.
- Mejorar el rendimiento de la Aplicación y la experiencia del usuario.
- Prevenir transacciones fraudulentas.

4. DIVULGACIÓN DE SU INFORMACIÓN
Podemos compartir información con terceros solo en las siguientes situaciones:
- Proveedores de servicios: Con proveedores externos (como Firebase para autenticación/base de datos y Stripe para pagos) que realizan servicios para nosotros.
- Requisitos legales: Si así lo exige la ley o en respuesta a solicitudes válidas de autoridades públicas.

5. SEGURIDAD DE SU INFORMACIÓN
Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger su información personal. Sin embargo, tenga en cuenta que ninguna medida de seguridad es perfecta o impenetrable.

6. SUS DERECHOS DE DATOS
Dependiendo de su ubicación, usted puede tener derecho a:
- Solicitar acceso a los datos personales que tenemos sobre usted.
- Solicitar la corrección de cualquier dato inexacto.
- Solicitar la eliminación de su cuenta y datos personales.

7. CONTÁCTENOS
Si tiene preguntas o comentarios sobre esta Política de Privacidad, contáctenos en:

Sitio web: https://ibrahimfatihtaner.com/#contact
`,
        version: 'Versión',
        switch_to_en: '¿Cambiar a inglés?',
        switch_to_tr: '¿Cambiar a turco?',
        error: 'Error',
        failed_sign_out: 'Error al cerrar sesión',
        no_alarms: 'No hay alarmas. ¡Duerme bien!',
        add_alarm_hint: 'Toca + para empezar a pagar por tu sueño.',
        tap_plus_to_create: 'Toque + para crear una alarma.',
        tab_alarms: 'Alarmas',
        tab_stats: 'Estadísticas',
        tab_profile: 'Perfil',
        edit_alarm: 'Editar alarma',
        new_alarm: 'Nueva alarma',
        repeat: 'Repetir',
        sound: 'Sonido',
        penalty_amount: 'Monto de penalización ($)',
        penalty_hint: 'Costo por toque de posponer.',
        label_input: 'Etiqueta',
        default_label: 'Despertar',
        save_alarm: 'Guardar',
        delete_alarm: 'Eliminar',
        delete_confirm_msg: '¿Estás seguro?',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        invalid_penalty: 'Penalización inválida',
        invalid_penalty_msg: 'Por favor ingrese un monto válido.',
        error_load: 'Error al cargar alarma',
        error_save: 'Error al guardar alarma',
        error_delete: 'Error al eliminar alarma',
        every_day: 'Todos los días',
        once: 'Una vez',
        penalty_label: 'Penalización',
        day_short_0: 'Dom',
        day_short_1: 'Lun',
        day_short_2: 'Mar',
        day_short_3: 'Mié',
        day_short_4: 'Jue',
        day_short_5: 'Vie',
        day_short_6: 'Sáb',
        dashboard_title: 'Tablero',
        dashboard_subtitle: 'Sigue tu progreso y pérdidas.',
        total_lost: 'PÉRDIDA TOTAL',
        lost: 'Perdido',
        money_slept_away: 'Dinero literalmente dormido.',
        snoozes: 'Posposiciones',
        score: 'Puntuación',
        motivation_title: '¡Sigue así!',
        motivation_text: 'Cada mañana que te despiertas a tiempo, ahorras dinero y construyes disciplina.',
        wake_up_success_msg: '¡Ahorraste dinero al despertar a tiempo! ☀️',
        im_up: '¡DESPIERTO!',
        stop_alarm: 'Detener alarma',
        payment_required: 'Pago requerido',
        payment_warning: 'Estás a punto de pagar por dormir 9 minutos más.',
        processing: 'Procesando...',
        pay_now: 'Pagar ahora',
        payment_successful: 'Pago exitoso',
        snooze_success_msg: 'Alarma pospuesta 9 minutos.',
        transaction_failed: 'Transacción fallida.',
        // Auth screens
        sign_in: 'Iniciar sesión',
        sign_up: 'Registrarse',
        password: 'Contraseña',
        full_name: 'Nombre completo',
        confirm_password: 'Confirmar contraseña',
        password_mismatch: 'Las contraseñas no coinciden.',
        create_account: 'Crear cuenta',
        dont_have_account: '¿No tienes cuenta?',
        already_have_account: '¿Ya tienes cuenta?',
        fill_all_fields: 'Por favor complete todos los campos.',
        account_created: '¡Cuenta creada exitosamente!',
        login_failed: 'Inicio de sesión fallido',
        registration_failed: 'Registro fallido',
        email_password_required: 'Por favor ingrese email y contraseña.',
        success: 'Éxito',
        continue_with_google: 'Continuar con Google',
        continue_with_apple: 'Continuar con Apple',
        or_divider: 'O',
        social_auth_error: 'Inicio de sesión social fallido',
        delete_account: 'Eliminar cuenta',
        delete_account_confirm: 'Esta acción es irreversible. Se perderán todos sus datos.',
        // Errors - Spanish
        errors: {
            invalid_email: 'Dirección de correo electrónico no válida.',
            user_disabled: 'Esta cuenta ha sido deshabilitada.',
            user_not_found: 'No se encontró ninguna cuenta con este correo.',
            wrong_password: 'Contraseña incorrecta.',
            email_in_use: 'El correo electrónico ya está en uso.',
            weak_password: 'La contraseña debe tener al menos 6 caracteres.',
            operation_not_allowed: 'Operación no permitida.',
            requires_recent_login: 'Por favor inicie sesión nuevamente.',
            credential_in_use: 'Esta cuenta ya está vinculada.',
            invalid_credential: 'Credenciales no válidas.',
            too_many_requests: 'Demasiados intentos. Inténtelo de nuevo más tarde.',
            network_error: 'Error de red. Verifique su conexión.',
            unknown: 'Ocurrió un error desconocido.',
        },
        // Penalty Tiers
        tier_mild: 'Suave',
        tier_medium: 'Medio',
        tier_harsh: 'Severo',
        tier_nuclear: 'Nuclear',
        // Sound Names
        sound_classic: 'Clásico',
        sound_rain: 'Lluvia',
        sound_energize: 'Energía',
        sound_forest: 'Bosque',
        sound_ocean: 'Océano',
        sound_piano: 'Piano',
        default_sound: 'Clásico',
    },
});

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;

export { i18n };
