import { GoogleGenAI } from "@google/genai";

class BangkaLensChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.initUI();
        this.setupListeners();
    }

    initUI() {
        // Chatbot Container
        const container = document.createElement('div');
        container.id = 'bangkalens-chatbot';
        container.className = 'fixed bottom-6 right-6 z-[9999] font-sans';
        
        // Floating Button
        const button = document.createElement('button');
        button.id = 'chatbot-toggle';
        button.className = 'w-16 h-16 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-indigo-700 transition-all active:scale-95 group relative';
        button.innerHTML = `
            <i data-lucide="message-circle" class="w-8 h-8 group-hover:rotate-12 transition-transform"></i>
            <span class="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-white"></span>
        `;

        // Chat Window
        const window = document.createElement('div');
        window.id = 'chatbot-window';
        window.className = 'hidden absolute bottom-20 right-0 w-[90vw] sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300';
        window.innerHTML = `
            <div class="p-5 bg-indigo-600 text-white flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <i data-lucide="bot" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="font-bold">BangkaLens Assistant</h3>
                        <div class="flex items-center gap-1.5 text-[10px] opacity-80">
                            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Online & Siap Membantu
                        </div>
                    </div>
                </div>
                <button id="chatbot-close" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <div id="chatbot-messages" class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
                <div class="flex gap-3">
                    <div class="w-8 h-8 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center text-indigo-600">
                        <i data-lucide="bot" class="w-4 h-4"></i>
                    </div>
                    <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 max-w-[80%]">
                        Halo! Saya asisten BangkaLens. Ada yang bisa saya bantu terkait mencari fotografer, editor, atau memasang lowongan kerja di Bangka?
                    </div>
                </div>
            </div>

            <div class="p-4 bg-white border-t border-slate-100">
                <form id="chatbot-form" class="flex gap-2">
                    <input type="text" id="chatbot-input" placeholder="Tanya sesuatu..." class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm">
                    <button type="submit" class="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all flex-shrink-0">
                        <i data-lucide="send" class="w-5 h-5"></i>
                    </button>
                </form>
            </div>
        `;

        container.appendChild(window);
        container.appendChild(button);
        document.body.appendChild(container);

        // Re-init Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        } else if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    setupListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chatbot-close');
        const window = document.getElementById('chatbot-window');
        const form = document.getElementById('chatbot-form');
        const input = document.getElementById('chatbot-input');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = input.value.trim();
            if (!message) return;

            input.value = '';
            this.addMessage(message, 'user');
            await this.getResponse(message);
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        const button = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            window.classList.remove('hidden');
            button.innerHTML = '<i data-lucide="minimize-2" class="w-8 h-8"></i>';
        } else {
            window.classList.add('hidden');
            button.innerHTML = '<i data-lucide="message-circle" class="w-8 h-8 group-hover:rotate-12 transition-transform"></i><span class="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-white"></span>';
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    addMessage(text, sender) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const messageEl = document.createElement('div');
        
        if (sender === 'user') {
            messageEl.className = 'flex justify-end';
            messageEl.innerHTML = `
                <div class="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md text-sm max-w-[80%]">
                    ${text}
                </div>
            `;
        } else {
            messageEl.className = 'flex gap-3';
            messageEl.innerHTML = `
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center text-indigo-600">
                    <i data-lucide="bot" class="w-4 h-4"></i>
                </div>
                <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 max-w-[80%]">
                    ${text}
                </div>
            `;
        }
        
        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    async getResponse(userMessage) {
        // Add loading Indicator
        const messagesDiv = document.getElementById('chatbot-messages');
        const loadingEl = document.createElement('div');
        loadingEl.id = 'chatbot-loading';
        loadingEl.className = 'flex gap-3';
        loadingEl.innerHTML = `
            <div class="w-8 h-8 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center text-indigo-600">
                <i data-lucide="bot" class="w-4 h-4"></i>
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-400 max-w-[80%] flex items-center gap-1">
                Sedang mengetik<span class="animate-bounce">.</span><span class="animate-bounce delay-100">.</span><span class="animate-bounce delay-200">.</span>
            </div>
        `;
        messagesDiv.appendChild(loadingEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: userMessage,
                config: {
                    systemInstruction: `Anda adalah asisten AI untuk "BangkaLens", sebuah marketplace lokal untuk fotografer dan editor di Bangka Belitung.
                    Tugas Anda adalah membantu pengguna menemukan jasa fotografi, video editing, atau memberikan informasi tentang platform ini.
                    
                    Informasi penting:
                    - Lokasi fokus: Pangkalpinang, Sungailiat, Koba, Toboali, Muntok, Belinyu.
                    - Jenis jasa: Wedding, Produk, Event, Dokumentasi, Drone, Editing Video.
                    - Fitur utama: Eksplor Penjasa, Lowongan Kerja (Job Request), Profil Portofolio, Hubungi via WhatsApp.
                    - Nada bicara: Ramah, profesional, membantu, dan menggunakan bahasa Indonesia yang baik namun santai (bisa diselingi logat atau istilah Bangka yang sopan jika relevan, tapi utamakan kejelasan).
                    - Jika ditanya soal harga: Katakan bahwa harga bervariasi tergantung penjasa dan paket yang dipilih, pengguna bisa melihat langsung di profil penjasa.
                    
                    Singkat dan padat dalam menjawab.`
                }
            });

            document.getElementById('chatbot-loading').remove();
            this.addMessage(response.text, 'bot');
        } catch (error) {
            console.error('Gemini Error:', error);
            document.getElementById('chatbot-loading').remove();
            this.addMessage("Maaf, sepertinya ada gangguan koneksi. Coba lagi nanti ya!", 'bot');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bangkaLensChatbot = new BangkaLensChatbot();
});
