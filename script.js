// script.js - সম্পূর্ণ কোড (সর্বশেষ আপডেট)

let products = JSON.parse(localStorage.getItem('products')) || [];
let sliders = JSON.parse(localStorage.getItem('sliders')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
const adminPassword = '6242';

// ──────────────────────────────────────────────
// অ্যাডমিন লগইন
// ──────────────────────────────────────────────
function loginAdmin() {
    const pass = document.getElementById('admin-password')?.value;
    if (pass === adminPassword) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        showSection('add-product');
    } else {
        alert('ভুল পাসওয়ার্ড');
    }
}

function togglePassword() {
    const input = document.getElementById('admin-password');
    const icon = document.querySelector('.toggle-password');
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

document.getElementById('admin-password')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') loginAdmin();
});

// ──────────────────────────────────────────────
// সেকশন সুইচ
// ──────────────────────────────────────────────
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    // রিফ্রেশ যেখানে দরকার
    if (sectionId === 'products-list') refreshProductList();
    if (sectionId === 'sliders-list') refreshSliderList();
    if (sectionId === 'orders') renderOrders?.();
}

// ──────────────────────────────────────────────
// প্রোডাক্ট যোগ (base64 ছবি সহ)
// ──────────────────────────────────────────────
document.getElementById('product-form')?.addEventListener('submit', async e => {
    e.preventDefault();

    const files = document.getElementById('product-images')?.files || [];
    if (files.length > 10) {
        alert('সর্বোচ্চ 3টা ছবি আপলোড করা যাবে');
        return;
    }

    const base64Images = [];
    for (let file of files) {
        try {
            const base64 = await fileToBase64(file);
            base64Images.push(base64);
        } catch (err) {
            console.error("Image conversion error:", err);
        }
    }

    const newProduct = {
        id: Date.now(),
        name: document.getElementById('product-name')?.value.trim() || '',
        price: document.getElementById('product-price')?.value || 0,
        oldPrice: document.getElementById('product-old-price')?.value || 0,
        stock: document.getElementById('product-stock')?.value || 0,
        description: document.getElementById('product-description')?.value.trim() || '',
        images: base64Images
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    alert('প্রোডাক্ট যোগ হয়েছে!');
    e.target.reset();
    document.getElementById('product-preview') && (document.getElementById('product-preview').innerHTML = '');
    refreshProductList();
});

// ──────────────────────────────────────────────
// স্লাইডার যোগ (base64)
// ──────────────────────────────────────────────
document.getElementById('slider-form')?.addEventListener('submit', async e => {
    e.preventDefault();

    const files = document.getElementById('slider-images')?.files || [];
    const newImages = [];

    for (let file of files) {
        try {
            const base64 = await fileToBase64(file);
            newImages.push(base64);
        } catch (err) {
            console.error("Slider image error:", err);
        }
    }

    sliders.push(...newImages);
    localStorage.setItem('sliders', JSON.stringify(sliders));
    alert('ছবি(গুলো) যোগ হয়েছে!');
    e.target.reset();
    document.getElementById('slider-preview') && (document.getElementById('slider-preview').innerHTML = '');
    refreshSliderList();
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
    });
}

// প্রিভিউ
document.getElementById('product-images')?.addEventListener('change', previewImages.bind(null, 'product-preview'));
document.getElementById('slider-images')?.addEventListener('change', previewImages.bind(null, 'slider-preview'));

function previewImages(previewId, e) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    preview.innerHTML = '';

    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `<img src="${ev.target.result}" alt="preview">`;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// ──────────────────────────────────────────────
// প্রোডাক্ট লিস্ট (অ্যাডমিন)
// ──────────────────────────────────────────────
function refreshProductList() {
    const container = document.getElementById('all-products-list');
    const count = document.getElementById('product-count');
    if (!container || !count) return;

    container.innerHTML = '';
    count.textContent = products.length;

    products.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'admin-product-item';
        const img = p.images?.[0] || '';
        div.innerHTML = `
            ${img ? `<img src="${img}" alt="${p.name}">` : '<div style="height:140px;background:#eee;display:flex;align-items:center;justify-content:center;">No image</div>'}
            <p><strong>${p.name}</strong></p>
            <p>দাম: ${p.price} টাকা</p>
            <p>আগের: <s>${p.oldPrice || 0} টাকা</s></p>
            <p>স্টক: ${p.stock}</p>
            <button class="delete-btn" onclick="deleteProduct(${i})">ডিলিট</button>
        `;
        container.appendChild(div);
    });
}

function deleteProduct(index) {
    if (!confirm('প্রোডাক্ট ডিলিট করবেন?')) return;
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    refreshProductList();
    renderProducts(); // ইউজার পেজ আপডেট
}

// ──────────────────────────────────────────────
// স্লাইডার লিস্ট (অ্যাডমিন)
// ──────────────────────────────────────────────
function refreshSliderList() {
    const container = document.getElementById('all-sliders-list');
    const count = document.getElementById('slider-count');
    if (!container || !count) return;

    container.innerHTML = '';
    count.textContent = sliders.length;

    sliders.forEach((img, i) => {
        const div = document.createElement('div');
        div.className = 'admin-slider-item';
        div.innerHTML = `
            <img src="${img}" alt="Slide ${i+1}">
            <button class="delete-btn" onclick="deleteSlider(${i})">ডিলিট</button>
        `;
        container.appendChild(div);
    });
}

function deleteSlider(index) {
    if (!confirm('ছবি ডিলিট করবেন?')) return;
    sliders.splice(index, 1);
    localStorage.setItem('sliders', JSON.stringify(sliders));
    refreshSliderList();
    renderSlideshow();
}

// ──────────────────────────────────────────────
// ইউজার পেজ — প্রোডাক্ট দেখানো
// ──────────────────────────────────────────────
function renderProducts() {
    const container = document.getElementById('products-list');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#777;">কোনো প্রোডাক্ট এখনো যোগ করা হয়নি</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const img = p.images?.[0] || '';
        card.innerHTML = `
            ${img ? `<img src="${img}" alt="${p.name}">` : '<div class="no-image">No image</div>'}
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div>
                    <span class="product-price">${p.price} টাকা</span>
                    ${Number(p.oldPrice) > 0 ? `<span class="product-old-price">${p.oldPrice} টাকা</span>` : ''}
                </div>
                <div class="product-stock">স্টক: ${p.stock}</div>
                <button class="order-btn" onclick="goToOrder(${p.id})">অর্ডার করুন</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ──────────────────────────────────────────────
// স্লাইডশো
// ──────────────────────────────────────────────
function renderSlideshow() {
    const el = document.getElementById('slideshow');
    if (!el || sliders.length === 0) return;

    el.innerHTML = '';
    sliders.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'slide' + (i === 0 ? ' active' : '');
        slide.innerHTML = `<img src="${src}" alt="Slide ${i+1}" style="width:100%; height:100%; object-fit:cover;">`;
        el.appendChild(slide);
    });

    // অটো স্লাইড (যদি চান)
    let idx = 0;
    setInterval(() => {
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        idx = (idx + 1) % sliders.length;
        document.querySelectorAll('.slide')[idx].classList.add('active');
    }, 4000);
}

// ──────────────────────────────────────────────
// অন্যান্য ফাংশন (অর্ডার, কার্ট, ডিটেল ইত্যাদি)
// ──────────────────────────────────────────────
// ... আপনার আগের অর্ডার, renderOrders, goToOrder, goToDetail, renderProductDetail, renderUserOrders ইত্যাদি ফাংশন এখানে রাখুন ...

// ──────────────────────────────────────────────
// বাংলাদেশের সম্পূর্ণ বিভাগ-জেলা-উপজেলা ডাটা
// ──────────────────────────────────────────────
const bdAddressData = {
    "Barishal": {
        districts: {
            "Barguna": ["Amtali", "Bamna", "Barguna Sadar", "Betagi", "Patharghata", "Taltali"],
            "Barishal": ["Agailjhara", "Babuganj", "Bakerganj", "Banari Para", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur", "Barishal Sadar"],
            "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
            "Jhalokati": ["Jhalokati Sadar", "Kanthalia", "Nalchiti", "Rajapur"],
            "Patuakhali": ["Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali"],
            "Pirojpur": ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Pirojpur Sadar", "Zianagar"]
        }
    },
    "Chattogram": {
        districts: {
            "Bandarban": ["Alikadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"],
            "Brahmanbaria": ["Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar", "Brahmanbaria Sadar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"],
            "Chandpur": ["Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"],
            "Chattogram": ["Anowara", "Bayezid", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Halishahar", "Hathazari", "Lohagara", "Mirsharai", "Pahartali", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"],
            "Cox's Bazar": ["Chakaria", "Cox's Bazar Sadar", "Eidgaon", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhia"],
            "Cumilla": ["Barura", "Brahmanpara", "Burichong", "Chandina", "Chauddagram", "Cumilla Adarsha Sadar", "Cumilla Dakshin Sadar", "Daudkandi", "Debidwar", "Homna", "Laksam", "Lalmai", "Meghna", "Monohorgonj", "Muradnagar", "Nangalkot", "Titas"],
            "Feni": ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"],
            "Khagrachhari": ["Dighinala", "Khagrachhari Sadar", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Mohalchhari", "Panchhari", "Ramgarh"],
            "Noakhali": ["Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Noakhali Sadar", "Senbagh", "Sonaimuri", "Subarnachar"]
        }
    },
    "Dhaka": {
        districts: {
            "Dhaka": ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar"],
            "Faridpur": ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
            "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
            "Gopalganj": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
            "Jamalpur": ["Bakshiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"],
            "Kishoreganj": ["Astagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"],
            "Madaripur": ["Dasar", "Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"],
            "Manikganj": ["Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", "Shibaloy", "Singair"],
            "Munshiganj": ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"],
            "Mymensingh": ["Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gouripur", "Haluaghat", "Ishwarganj", "Muktagacha", "Mymensingh Sadar", "Nandail", "Phulpur", "Tarakanda", "Trishal"],
            "Narayanganj": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
            "Narsingdi": ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"],
            "Netrokona": ["Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"],
            "Rajbari": ["Baliakandi", "Goalanda", "Pangsha", "Rajbari Sadar", "Kalukhali"],
            "Shariatpur": ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira"],
            "Sherpur": ["Jhenaigati", "Nakla", "Nalitabari", "Sreebardi", "Sherpur Sadar"],
            "Tangail": ["Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"]
        }
    },
    "Khulna": {
        districts: {
            "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
            "Chuadanga": ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"],
            "Jashore": ["Abhaynagar", "Bagherpara", "Chaugachha", "Jashore Sadar", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
            "Jhenaidah": ["Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
            "Khulna": ["Batiaghata", "Dacope", "Daulatpur", "Dumuria", "Dighalia", "Khulna Sadar", "Koira", "Paikgacha", "Phultala", "Rupsha", "Terokhada"],
            "Kushtia": ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"],
            "Magura": ["Magura Sadar", "Mohammadpur", "Sreepur", "Shalikha"],
            "Meherpur": ["Gangni", "Meherpur Sadar", "Mujibnagar"],
            "Narail": ["Kalia", "Lohagara", "Narail Sadar"],
            "Satkhira": ["Assasuni", "Debhata", "Kaliganj", "Kolaroa", "Satkhira Sadar", "Shyamnagar", "Tala"]
        }
    },
    "Mymensingh": {
        districts: {
            "Jamalpur": ["Bakshiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"],
            "Mymensingh": ["Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gouripur", "Haluaghat", "Ishwarganj", "Muktagacha", "Mymensingh Sadar", "Nandail", "Phulpur", "Tarakanda", "Trishal"],
            "Netrokona": ["Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"],
            "Sherpur": ["Jhenaigati", "Nakla", "Nalitabari", "Sreebardi", "Sherpur Sadar"]
        }
    },
    "Rajshahi": {
        districts: {
            "Bogura": ["Adamdighi", "Bogura Sadar", "Dhunat", "Dhupchanchia", "Gabtoli", "Kahaloo", "Nandigram", "Sariakandi", "Shahjahanpur", "Sherpur", "Shibganj", "Sonatola"],
            "Joypurhat": ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"],
            "Naogaon": ["Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
            "Natore": ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra"],
            "Chapai Nawabganj": ["Bholahat", "Chapai Nawabganj Sadar", "Gomostapur", "Nachol", "Shibganj"],
            "Pabna": ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"],
            "Rajshahi": ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohonpur", "Paba", "Puthia", "Tanore"],
            "Sirajganj": ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara"]
        }
    },
    "Rangpur": {
        districts: {
            "Dinajpur": ["Birampur", "Birganj", "Biral", "Chirirbandar", "Dinajpur Sadar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharol", "Khansama", "Nawabganj", "Parbatipur", "Phulchhari"],
            "Gaibandha": ["Fulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
            "Kurigram": ["Bhurungamari", "Char Rajibpur", "Chilmari", "Kurigram Sadar", "Nageshwari", "Phulbari", "Rajarhat", "Ulipur"],
            "Lalmonirhat": ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"],
            "Nilphamari": ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"],
            "Panchagarh": ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tentulia"],
            "Rangpur": ["Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Rangpur Sadar", "Taraganj"],
            "Thakurgaon": ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"]
        }
    },
    "Sylhet": {
        districts: {
            "Habiganj": ["Ajmiriganj", "Bahubal", "Baniachang", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj"],
            "Maulvibazar": ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Maulvibazar Sadar", "Rajnagar", "Sreemangal"],
            "Sunamganj": ["Bishwambarpur", "Chhatak", "Dakshin Sunamganj", "Derai", "Dharampasha", "Doarabazar", "Jamalganj", "Madhyanagar", "Shantiganj", "Sullah", "Sunamganj Sadar", "Tahirpur"],
            "Sylhet": ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Sylhet Sadar", "Zakiganj"]
        }
    }
};

// ──────────────────────────────────────────────
// অ্যাড্রেস চেইনড ড্রপডাউন
// ──────────────────────────────────────────────
function updateDivision() {
    const country = document.getElementById("country")?.value;
    const divSelect = document.getElementById("division");
    if (!divSelect) return;

    divSelect.innerHTML = '<option value="">বিভাগ সিলেক্ট করুন</option>';

    if (country === "BD" || country === "Bangladesh") {
        Object.keys(bdAddressData).sort().forEach(div => {
            const opt = document.createElement("option");
            opt.value = div;
            opt.textContent = div;
            divSelect.appendChild(opt);
        });
    }
}

function updateDistrict() {
    const div = document.getElementById("division")?.value;
    const distSelect = document.getElementById("district");
    if (!distSelect) return;

    distSelect.innerHTML = '<option value="">জেলা সিলেক্ট করুন</option>';

    if (bdAddressData[div]) {
        Object.keys(bdAddressData[div].districts).sort().forEach(d => {
            const opt = document.createElement("option");
            opt.value = d;
            opt.textContent = d;
            distSelect.appendChild(opt);
        });
    }
}

function updateUpazila() {
    const div = document.getElementById("division")?.value;
    const dist = document.getElementById("district")?.value;
    const upaSelect = document.getElementById("upazila");
    if (!upaSelect) return;

    upaSelect.innerHTML = '<option value="">উপজেলা সিলেক্ট করুন</option>';

    if (bdAddressData[div]?.districts?.[dist]) {
        bdAddressData[div].districts[dist].sort().forEach(u => {
            const opt = document.createElement("option");
            opt.value = u;
            opt.textContent = u;
            upaSelect.appendChild(opt);
        });
    }
}

// ──────────────────────────────────────────────
// ইনিশিয়াল লোড
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // ইউজার পেজ
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        renderSlideshow();
        renderProducts();
    }

    // অর্ডার পেজে অ্যাড্রেস লোড
    if (window.location.pathname.includes('order.html')) {
        updateDivision();  // দেশ BD হলে বিভাগ লোড হবে
    }

    // অ্যাডমিন প্যানেল ওপেন থাকলে
    if (document.getElementById('admin-panel')?.style.display !== 'none') {
        refreshProductList();
        refreshSliderList();
    }
});

// ──────────────────────────────────────────────
// অন্যান্য ফাংশন (যেগুলো আপনার আগের কোডে ছিল)
// ──────────────────────────────────────────────
// goToAdmin, goToUserPage, goToCart, goToOrder, goToDetail,
// renderProductDetail, renderOrderProduct, renderUserOrders,
// searchProducts, renderOrders, updateOrderStatus, deleteOrder
// ... এগুলো আপনার পুরানো কোড থেকে কপি করে এখানে রাখুন ...

// শেষ লাইন
console.log("script.js loaded - version with full BD divisions, districts, upazilas");
// পেমেন্ট মেথড চেঞ্জ হলে ট্রানজেকশন ফিল্ড দেখানো/লুকানো
document.getElementById('payment-method')?.addEventListener('change', function() {
    const method = this.value;
    const transField = document.getElementById('transaction-field');
    const codNote = document.getElementById('cod-note');

    // সবকিছু লুকিয়ে ফেলি প্রথমে
    if (transField) transField.style.display = 'none';
    if (codNote) codNote.style.display = 'none';

    // bKash, Nagad, Rocket, Upay হলে ট্রানজেকশন ফিল্ড দেখাবে
    if (['bKash', 'Nagad', 'Rocket', 'Upay'].includes(method)) {
        if (transField) {
            transField.style.display = 'block';
            // অর্ডার সাবমিটের সময় ট্রানজেকশন আইডি required করতে চাইলে এখানে required যোগ করা যায়
            document.getElementById('transaction-id').setAttribute('required', 'required');
        }
    }
    // COD হলে নোট দেখাবে
    else if (method === 'COD') {
        if (codNote) codNote.style.display = 'block';
        // ট্রানজেকশন ফিল্ড required না করা
        document.getElementById('transaction-id')?.removeAttribute('required');
    }
});

// অর্ডার// পুরানো submit listener বন্ধ করে নতুনটা ফোর্স করে চালু করা
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-details');
    if (!form) return;

    // পুরানো listener যদি থাকে তাহলে বন্ধ করা (clone করে নতুন করে attach)
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', function(e) {
        e.preventDefault(); // পুরানো submit বন্ধ

        const productId = parseInt(localStorage.getItem('currentProductId'));
        const product = products.find(p => p.id === productId);

        if (!product) return;

        const formData = new FormData(this);

        const newOrder = {
            productId: productId,
            productName: product.name,
            quantity: currentQuantity || 1,
            userName: formData.get('user-name')?.trim() || '',
            mobile: formData.get('mobile')?.trim() || '',
            email: formData.get('email')?.trim() || 'N/A',
            country: formData.get('country') || '',
            division: formData.get('division') || '',
            district: formData.get('district') || '',
            upazila: formData.get('upazila') || '',
            address: formData.get('address')?.trim() || '',
            payment: formData.get('payment-method') || 'COD',
            transactionId: formData.get('transaction-id')?.trim() || '',
            totalAmount: (currentProductPrice || product.price) * (currentQuantity || 1),
            status: 'pending',
            orderDate: new Date().toLocaleString('bn-BD')
        };

        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // ফর্ম খালি
        this.reset();

        // সরাসরি হোমে চলে যাওয়া — কোনো অ্যালার্ট নেই
        window.location.href = 'index.html';
    });
});
// মন্তব্য জমা দেওয়া + লিস্ট আপডেট
function submitReview() {
    const textElement = document.getElementById('review-text');
    const authorElement = document.getElementById('review-author');

    if (!textElement) {
        console.error("review-text ইনপুট পাওয়া যায়নি!");
        return;
    }

    const text = textElement.value.trim();
    const author = authorElement ? authorElement.value.trim() || 'অতিথি' : 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const productId = parseInt(localStorage.getItem('currentProductId'));
    if (isNaN(productId)) {
        console.error("currentProductId পাওয়া যায়নি!");
        return;
    }

    const newReview = {
        id: 'rev' + Date.now(),
        productId: productId,
        rating: selectedRating,
        text: text,
        author: author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // রিভিউ অ্যারেতে যোগ
    reviews.push(newReview);

    // localStorage-এ সেভ
    localStorage.setItem('reviews', JSON.stringify(reviews));

    console.log("নতুন মন্তব্য যোগ হয়েছে:", newReview); // ডিবাগের জন্য

    // লিস্ট আপডেট
    loadProductReviews(productId);

    // ফর্ম রিসেট
    textElement.value = '';
    if (authorElement) authorElement.value = '';
    selectedRating = 0;
    setRating(0);
}

// রিভিউ লোড + নতুন মন্তব্য দেখানো
function loadProductReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) {
        console.error("reviews-list div পাওয়া যায়নি!");
        return;
    }

    list.innerHTML = ''; // পুরানো ক্লিয়ার

    const productReviews = reviews.filter(r => r.productId === productId);

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:30px;">কোনো মন্তব্য এখনো নেই। প্রথম মন্তব্য দিন!</p>';
        return;
    }

    // নতুন থেকে পুরানো (reverse order)
    productReviews.sort((a, b) => b.id.localeCompare(a.id));

    productReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-author">${review.author}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-date">${review.date}</div>
        `;
        list.appendChild(div);
    });

    // নতুন মন্তব্যের পর অটো নিচে স্ক্রল
    list.scrollTop = list.scrollHeight;
}
// সাইড মেনু টগল (আগের ফাংশন আপডেট)
function toggleSideMenu() {
    const menu = document.getElementById('side-menu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// কার্ট আইকন → ইউজারের অর্ডার দেখা (cart.html)
function goToCart() {
    window.location.href = 'cart.html';
}

// প্রোডাক্ট থেকে অর্ডার করুন বাটন
function goToOrder(productId) {
    localStorage.setItem('currentProductId', productId);
    window.location.href = 'order.html';
}

// প্রোডাক্ট রেন্ডার ফাংশন (অর্ডার বাটন ঠিক করা)
function renderProducts() {
    const container = document.getElementById('products-list');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#777;">কোনো প্রোডাক্ট এখনো যোগ করা হয়নি</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : '';

        card.innerHTML = `
            ${mainImage ? `<img src="${mainImage}" alt="${product.name}">` : '<div class="no-image">ছবি নেই</div>'}
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div>
                    <span class="product-price">${product.price} টাকা</span>
                    ${Number(product.oldPrice) > 0 ? `<span class="product-old-price">${product.oldPrice} টাকা</span>` : ''}
                </div>
                <div class="product-stock">স্টক: ${product.stock}</div>
                <button class="order-btn" onclick="goToOrder(${product.id})">অর্ডার করুন</button>
            </div>
        `;

        container.appendChild(card);
    });
}
function searchProducts() {
    const query = prompt("কোন প্রোডাক্ট খুঁজছেন?", "");
    if (!query || query.trim() === "") {
        alert("কোনো কিছু লিখুন");
        return;
    }

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    );

    if (filtered.length === 0) {
        alert("কোনো প্রোডাক্ট পাওয়া যায়নি: " + query);
        return;
    }

    let message = "পাওয়া গেছে " + filtered.length + " টি প্রোডাক্ট:\n";
    filtered.forEach(p => {
        message += "- " + p.name + " (" + p.price + " টাকা)\n";
    });
    alert(message);
}
// সাইড মেনু খোলা/বন্ধ করা
function toggleSideMenu() {
    const menu = document.getElementById('side-menu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// অ্যাডমিন পেজে যাওয়া
function goToAdmin() {
    // লগইন চেক করতে চাইলে এখানে লজিক যোগ করতে পারেন
    window.location.href = 'admin.html';
}
function goToUserPage() {
    window.location.href = 'index.html';  // আপনার ইউজার পেজের নাম যদি index.html হয়
}
function refreshProductList() {
    const container = document.getElementById('all-products-list');
    const countEl = document.getElementById('product-count');

    if (!container || !countEl) return;

    // পুরো কন্টেইনার খালি করা (এটা না করলে পুরানো কার্ড থেকে যায়)
    container.innerHTML = '';

    // কাউন্ট আপডেট
    countEl.textContent = products.length;

    // নতুন করে সব প্রোডাক্ট যোগ করা
    products.forEach((product, index) => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';

        const imgSrc = product.images?.[0] || '';

        item.innerHTML = `
            ${imgSrc ? `<img src="${imgSrc}" alt="${product.name}">` : '<div style="height:140px;background:#eee;display:flex;align-items:center;justify-content:center;">ছবি নেই</div>'}
            <p><strong>${product.name}</strong></p>
            <p>দাম: ${product.price} টাকা</p>
            <p>আগের: <s>${product.oldPrice || 0} টাকা</s></p>
            <p>স্টক: ${product.stock}</p>
            <span class="delete-cross" onclick="deleteProduct(${index})">×</span>
        `;

        container.appendChild(item);
    });
}
// অর্ডার সাবমিট (order.html থেকে)
document.getElementById('order-details')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        alert("প্রোডাক্ট পাওয়া যায়নি!");
        return;
    }

    const newOrder = {
        productId: id,
        productName: product.name,
        quantity: document.getElementById('quantity')?.value || 1,
        userName: document.getElementById('user-name')?.value.trim(),
        mobile: document.getElementById('mobile')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        country: document.getElementById('country')?.value,
        division: document.getElementById('division')?.value,
        district: document.getElementById('district')?.value,
        upazila: document.getElementById('upazila')?.value,
        address: document.getElementById('address')?.value.trim(),
        payment: document.getElementById('payment-method')?.value,
        transactionId: document.getElementById('transaction-id')?.value.trim() || '',
        status: 'pending',
        orderDate: new Date().toLocaleString('bn-BD')
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    alert('অর্ডার কনফার্ম হয়েছে!');
    window.location.href = 'index.html';
});

// অ্যাডমিনে অর্ডার দেখানো
function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;

    list.innerHTML = '';

    orders.forEach((order, index) => {
        const div = document.createElement('div');
        div.classList.add('order-item');
        div.innerHTML = `
            <p><strong>অর্ডারকারী:</strong> ${order.userName || 'N/A'}</p>
            <p><strong>মোবাইল:</strong> ${order.mobile || 'N/A'}</p>
            <p><strong>প্রোডাক্ট:</strong> ${order.productName}</p>
            <p><strong>কোয়ান্টিটি:</strong> ${order.quantity}</p>
            <p><strong>ঠিকানা:</strong> ${order.address || 'N/A'} (${order.upazila}, ${order.district}, ${order.division})</p>
            <p><strong>পেমেন্ট:</strong> ${order.payment} ${order.transactionId ? `(ট্রানজেকশন: ${order.transactionId})` : ''}</p>
            <p><strong>স্ট্যাটাস:</strong> ${order.status || 'pending'}</p>
            <p><strong>তারিখ:</strong> ${order.orderDate || 'N/A'}</p>
            <button onclick="updateOrderStatus(${index}, 'pending')">পেন্ডিং</button>
            <button onclick="updateOrderStatus(${index}, 'successful')">সাকসেসফুল</button>
            <button onclick="deleteOrder(${index})">ডিলিট</button>
        `;
        list.appendChild(div);
    });

    if (orders.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">কোনো অর্ডার এখনো আসেনি</p>';
    }
}

function updateOrderStatus(index, status) {
    orders[index].status = status;
    localStorage.setItem('orders', JSON.stringify(orders));
    renderOrders();
}

function deleteOrder(index) {
    if (!confirm('এই অর্ডার ডিলিট করতে চান?')) return;
    orders.splice(index, 1);
    localStorage.setItem('orders', JSON.stringify(orders));
    renderOrders();
}
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    if (sectionId === 'orders') {
        renderOrders();
    }
    if (sectionId === 'products-list') {
        refreshProductList();
    }
    if (sectionId === 'sliders-list') {
        refreshSliderList();
    }
}
// পেমেন্ট মেথড চেঞ্জ হলে ট্রানজেকশন ফিল্ড দেখানো
function toggleTransactionField() {
    const method = document.getElementById('payment-method')?.value;
    const transField = document.getElementById('transaction-field');
    const codNote = document.getElementById('cod-note');

    if (!transField || !codNote) return;

    transField.style.display = 'none';
    codNote.style.display = 'none';

    if (['bKash', 'Nagad', 'Rocket', 'Upay'].includes(method)) {
        transField.style.display = 'block';
    } else if (method === 'COD') {
        codNote.style.display = 'block';
    }
}

// অর্ডার পেজ লোড হলে প্রোডাক্ট দেখানো (কোয়ান্টিটি ছাড়া)
function renderOrderProduct() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);
    const preview = document.getElementById('product-preview');
    const nameDisplay = document.getElementById('product-name-display');
    const priceDisplay = document.getElementById('product-price-display');
    const totalDisplay = document.getElementById('total-price-display');

    if (!product || !preview) {
        preview.innerHTML = '<p style="text-align:center; padding:40px;">প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }

    const mainImg = product.images?.[0] || '';
    preview.innerHTML = mainImg ? `<img src="${mainImg}" alt="${product.name}">` : '<p>ছবি নেই</p>';

    nameDisplay.textContent = product.name;
    priceDisplay.textContent = product.price;
    totalDisplay.textContent = product.price + " টাকা";
}

// অর্ডার সাবমিট (কোয়ান্টিটি ছাড়া)
document.getElementById('order-details')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        alert("প্রোডাক্ট পাওয়া যায়নি!");
        return;
    }

    const method = document.getElementById('payment-method').value;
    let transactionId = '';

    if (['bKash', 'Nagad', 'Rocket', 'Upay'].includes(method)) {
        transactionId = document.getElementById('transaction-id')?.value.trim();
        if (!transactionId) {
            alert('ট্রানজেকশন আইডি দিন!');
            return;
        }
    }

    const newOrder = {
        productId: id,
        productName: product.name,
        quantity: 1,  // কোয়ান্টিটি ফিক্সড ১
        userName: document.getElementById('user-name').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        email: document.getElementById('email').value.trim() || 'N/A',
        country: document.getElementById('country').value,
        division: document.getElementById('division').value,
        district: document.getElementById('district').value,
        upazila: document.getElementById('upazila').value,
        address: document.getElementById('address').value.trim(),
        payment: method,
        transactionId: transactionId,
        status: 'pending',
        orderDate: new Date().toLocaleString('bn-BD')
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    alert('অর্ডার কনফার্ম হয়েছে!');
    window.location.href = 'index.html';
});

// পেজ লোড হলে প্রোডাক্ট দেখানো + ট্রানজেকশন ফিল্ড রিসেট
document.addEventListener('DOMContentLoaded', () => {
    renderOrderProduct();
    toggleTransactionField();  // প্রথমে লুকিয়ে রাখা
    updateDivision();          // বিভাগ লোড
});
// কার্ট অ্যারে (localStorage থেকে লোড)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// প্রোডাক্ট কার্টে যোগ করা
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return alert("প্রোডাক্ট পাওয়া যায়নি");

    // ইতিমধ্যে কার্টে আছে কি না চেক
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.images?.[0] || '',
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} কার্টে যোগ হয়েছে!`);
}

// কার্টে যাওয়া
function goToCart() {
    window.location.href = 'cart.html';
}
let currentQuantity = 1;
let currentProductPrice = 0;

// অর্ডার পেজ লোড হলে প্রোডাক্ট দেখানো
function renderOrderProduct() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);
    
    const preview = document.getElementById('product-preview');
    const nameDisplay = document.getElementById('product-name-display');
    const priceDisplay = document.getElementById('product-price-display');
    const totalDisplay = document.getElementById('total-price-display');
    const qtyDisplay = document.getElementById('quantity-display');

    if (!product || !preview) {
        preview.innerHTML = '<p style="text-align:center; padding:40px;">প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }

    const mainImg = product.images?.[0] || '';
    preview.innerHTML = mainImg ? `<img src="${mainImg}" alt="${product.name}">` : '<p>ছবি নেই</p>';

    nameDisplay.textContent = product.name;
    priceDisplay.textContent = product.price;
    currentProductPrice = Number(product.price);
    
    currentQuantity = 1;
    qtyDisplay.textContent = currentQuantity;
    updateTotalPrice();
}

function changeQuantity(change) {
    const qtyDisplay = document.getElementById('quantity-display');
    let newQty = currentQuantity + change;
    
    if (newQty < 1) newQty = 1;  // ১ এর নিচে যাবে না
    
    currentQuantity = newQty;
    qtyDisplay.textContent = currentQuantity;
    updateTotalPrice();
}

function updateTotalPrice() {
    const total = currentProductPrice * currentQuantity;
    document.getElementById('total-price-display').textContent = total + " টাকা";
}

// পেমেন্ট মেথড চেঞ্জ হলে
function toggleTransactionField() {
    const method = document.getElementById('payment-method')?.value;
    const transField = document.getElementById('transaction-field');
    const codNote = document.getElementById('cod-note');

    if (!transField || !codNote) return;

    transField.style.display = 'none';
    codNote.style.display = 'none';

    if (['bKash', 'Nagad', 'Rocket', 'Upay'].includes(method)) {
        transField.style.display = 'block';
    } else if (method === 'COD') {
        codNote.style.display = 'block';
    }
}

// অর্ডার সাবমিট
document.getElementById('order-details')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);
    if (!product) return alert("প্রোডাক্ট পাওয়া যায়নি");

    const method = document.getElementById('payment-method').value;
    let transactionId = '';

    if (['bKash', 'Nagad', 'Rocket', 'Upay'].includes(method)) {
        transactionId = document.getElementById('transaction-id')?.value.trim();
        if (!transactionId) return alert('ট্রানজেকশন আইডি দিন!');
    }

    const newOrder = {
        productId: id,
        productName: product.name,
        quantity: currentQuantity,
        userName: document.getElementById('user-name').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        email: document.getElementById('email').value.trim() || 'N/A',
        country: document.getElementById('country').value,
        division: document.getElementById('division').value,
        district: document.getElementById('district').value,
        upazila: document.getElementById('upazila').value,
        address: document.getElementById('address').value.trim(),
        payment: method,
        transactionId: transactionId,
        totalAmount: currentProductPrice * currentQuantity,
        status: 'pending',
        orderDate: new Date().toLocaleString('bn-BD')
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    alert('অর্ডার কনফার্ম হয়েছে!');
    localStorage.removeItem('currentProductId');
    window.location.href = 'index.html';
});

// পেজ লোড
document.addEventListener('DOMContentLoaded', () => {
    renderOrderProduct();
    toggleTransactionField();
    updateDivision();
});
// মাই অর্ডার দেখানোর জন্য নতুন ফাংশন
function showMyOrders() {
    // সাইড মেনু বন্ধ করুন
    toggleSideMenu();

    // নতুন পেজে নিয়ে যাওয়া (অথবা মোডাল দেখানো)
    window.location.href = 'my-orders.html';
}
function showMyOrders() {
    toggleSideMenu();  // মেনু বন্ধ করুন
    window.location.href = 'my-orders.html';
}
document.getElementById('order-details')?.addEventListener('submit', (e) => {
    e.preventDefault();

    // লোডিং দেখানো
    document.getElementById('loading').style.display = 'flex';

    // ... আপনার আগের অর্ডার প্রসেসিং কোড ...

    // অর্ডার সফল হলে (অথবা অ্যালার্টের পর) লোডিং লুকানো
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        alert('অর্ডার কনফার্ম হয়েছে!');
        window.location.href = 'index.html';
    }, 1500);  // ১.৫ সেকেন্ড পর লুকাবে (আসল প্রসেসিং হলে এই টাইমার সরান)
});
document.getElementById('loading').style.display = 'flex';
document.body.style.overflow = 'hidden';
// লুকানোর সময়
document.body.style.overflow = 'auto';
// পেজ লোড হলে আইকন অ্যানিমেশন চালু করা
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.classList.add('animate');
        });
    }, 500); // ০.৫ সেকেন্ড পর অ্যানিমেশন শুরু হবে
});
// সার্চ ইনপুট লিসেনার
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.querySelector('.search-clear');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();

            // ক্লিয়ার বাটন দেখানো/লুকানো
            if (query.length > 0) {
                clearBtn.classList.add('show');
            } else {
                clearBtn.classList.remove('show');
            }

            filterProducts(query);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }
});

// প্রোডাক্ট ফিল্টার করা
function filterProducts(query) {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.product-description')?.textContent.toLowerCase() || '';

        if (name.includes(query) || description.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// সার্চ ক্লিয়ার করা
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        document.querySelector('.search-clear').classList.remove('show');
        filterProducts(''); // সব প্রোডাক্ট দেখানো
    }
}
// ==================== Debounce Utility ====================
function debounce(func, delay = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// ==================== সার্চ ইনিশিয়ালাইজ ====================
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.querySelector('.search-clear');

    if (!searchInput) return;

    // Debounce দিয়ে ফিল্টার ফাংশন তৈরি
    const debouncedFilter = debounce((query) => {
        filterProducts(query);
    }, 300);

    // ইনপুট ইভেন্ট
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        // ক্লিয়ার বাটন দেখানো/লুকানো
        clearBtn.classList.toggle('show', query.length > 0);

        // Debounce সহ ফিল্টার কল
        debouncedFilter(query);
    });

    // ক্লিয়ার বাটন
    clearBtn?.addEventListener('click', clearSearch);
}

// ==================== ফিল্টার ফাংশন (আগের মতোই) ====================
function filterProducts(query) {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        card.style.display = name.includes(query) ? 'block' : 'none';
    });
}

// ==================== ক্লিয়ার সার্চ ====================
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.value = '';
    document.querySelector('.search-clear')?.classList.remove('show');
    filterProducts('');        // সব প্রোডাক্ট দেখানো
}

// ==================== পেজ লোড হলে ====================
document.addEventListener('DOMContentLoaded', () => {
    initSearch();              // ← Debounce সহ সার্চ চালু
    // অন্যান্য ইনিশিয়ালাইজেশন (renderProducts, renderSlideshow ইত্যাদি)
});
// প্রোডাক্ট ডিটেইল লোড
function renderProductDetail() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        document.getElementById('product-detail').innerHTML = '<p style="text-align:center; padding:40px;">প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }

    document.getElementById('page-title').textContent = `${product.name} | ওয়েবসাইট নাম`;

    // ছবি গ্যালারি
    const gallery = document.getElementById('image-gallery');
    gallery.innerHTML = '';
    (product.images || []).forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = product.name;
        gallery.appendChild(img);
    });

    // টেক্সট
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price + " টাকা";
    document.getElementById('product-old-price').textContent = product.oldPrice ? product.oldPrice + " টাকা" : '';
    document.getElementById('product-stock').textContent = product.stock;
    document.getElementById('product-description').textContent = product.description || "বিস্তারিত বিবরণ নেই";

    // রিভিউ লোড
    loadProductReviews(id);
}
// রিভিউ জমা দেওয়া (লগইন ছাড়াই)
function submitReview() {
    const text = document.getElementById('review-text').value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput?.value.trim() || 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const id = parseInt(localStorage.getItem('currentProductId'));

    reviews.push({
        id: 'rev' + Date.now(), // ইউনিক আইডি
        productId: id,
        rating: selectedRating,
        text,
        author,
        date: new Date().toLocaleDateString('bn-BD'),
        likes: 0,
        likedBy: [] // লাইকের জন্য লিস্ট
    });

    // রিভিউ লোড করা
    loadProductReviews(id);

    // ফর্ম রিসেট
    document.getElementById('review-text').value = '';
    authorInput && (authorInput.value = '');
    selectedRating = 0;
    setRating(0);
    alert('মন্তব্য যোগ হয়েছে! ধন্যবাদ।');
}
// প্রোডাক্টের ছবিতে চাপ দিলে রিভিউ সেকশনে নিয়ে যাওয়া
function goToProductReviews(productId) {
    localStorage.setItem('currentProductId', productId);
    localStorage.setItem('scrollToReviews', 'true');  // ফ্ল্যাগ সেট করা
    window.location.href = 'product-detail.html';
}
// লাইক টগল করা
function toggleLike(reviewId) {
    if (!currentUserMobile) {
        alert("লাইক করতে লগইন করুন");
        toggleLogin();
        return;
    }

    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const alreadyLiked = review.likedBy?.includes(currentUserMobile);

    if (alreadyLiked) {
        // লাইক কমানো
        review.likes = Math.max(0, (review.likes || 0) - 1);
        review.likedBy = review.likedBy.filter(m => m !== currentUserMobile);
    } else {
        // লাইক বাড়ানো
        review.likes = (review.likes || 0) + 1;
        if (!review.likedBy) review.likedBy = [];
        review.likedBy.push(currentUserMobile);
    }

    // লাইক সেভ (আপাতত মেমরিতে; চাইলে localStorage-এ রাখুন)
    loadProductReviews(parseInt(localStorage.getItem('currentProductId')));
}

// রিভিউ লোড করার সময় লাইক বাটন আপডেট করা (loadProductReviews ফাংশনে)
function loadProductReviews(productId) {
    const list = document.getElementById('product-reviews-list');
    list.innerHTML = '';

    const productReviews = reviews.filter(r => r.productId === productId);

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777;">কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>';
        return;
    }

    productReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-author">${review.author}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-date">${review.date}</div>
            
            <div class="review-like">
                <button class="like-btn ${review.likedBy?.includes(currentUserMobile) ? 'liked' : ''}" 
                        onclick="toggleLike('${review.id}')">
                    ❤️ <span class="like-count">${review.likes || 0}</span>
                </button>
            </div>
        `;
        list.appendChild(div);
    });
}
// Enter চাপলে সার্চ রেজাল্ট পেজে যাওয়া
function goToSearchResults() {
    const query = document.getElementById('search-input')?.value.trim();
    if (!query) return;

    localStorage.setItem('searchQuery', query);
    window.location.href = 'search-results.html';
}

// সার্চ ক্লিয়ার করা (আগের ফাংশন আপডেট)
function clearSearch() {
    const input = document.getElementById('search-input');
    if (input) {
        input.value = '';
        document.querySelector('.search-clear').classList.remove('show');
        // হোম পেজে থাকলে সব প্রোডাক্ট দেখানো
        if (window.location.pathname.includes('index.html')) {
            filterProducts('');
        }
    }
}
// অর্ডার কনফার্ম সাবমিট (সাথে সাথে কনফার্ম হয়ে যাবে)
document.getElementById('order-details')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        alert("প্রোডাক্ট পাওয়া যায়নি!");
        return;
    }

    const method = document.getElementById('payment-method').value;
    let transactionId = '';

    // অনলাইন পেমেন্ট হলে ট্রানজেকশন আইডি চেক
    if (['bKash', 'Nagad', 'Rocket', 'Upay'].includes(method)) {
        transactionId = document.getElementById('transaction-id')?.value.trim();
        if (!transactionId) {
            alert('ট্রানজেকশন আইডি দিন!');
            return;
        }
    }

    const newOrder = {
        productId: id,
        productName: product.name,
        quantity: currentQuantity,
        userName: document.getElementById('user-name').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        email: document.getElementById('email').value.trim() || 'N/A',
        country: document.getElementById('country').value,
        division: document.getElementById('division').value,
        district: document.getElementById('district').value,
        upazila: document.getElementById('upazila').value,
        address: document.getElementById('address').value.trim(),
        payment: method,
        transactionId: transactionId,
        totalAmount: currentProductPrice * currentQuantity,
        status: 'pending',
        orderDate: new Date().toLocaleString('bn-BD')
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // সাথে সাথে কনফার্ম হয়ে যাবে (কোনো অ্যালার্ট ছাড়াই)
    // ইউজারকে হোম পেজে নিয়ে যাওয়া
    window.location.href = 'index.html';
});
// অর্ডার সাবমিটের পর
orders.push(newOrder);
localStorage.setItem('orders', JSON.stringify(orders));

// থ্যাঙ্ক ইউ মেসেজ দেখানো
const thankYou = document.createElement('div');
thankYou.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%; 
    background:rgba(0,0,0,0.6); z-index:3000; display:flex; 
    align-items:center; justify-content:center;
`;
thankYou.innerHTML = `
    <div style="background:white; padding:40px; border-radius:16px; text-align:center;">
        <h2 style="color:#4caf50;">অর্ডার কনফার্ম হয়েছে!</h2>
        <p>আপনার অর্ডার নেওয়া হয়েছে। ধন্যবাদ!</p>
        <p>হোম পেজে ফিরে যাচ্ছি...</p>
    </div>
`;
document.body.appendChild(thankYou);

setTimeout(() => {
    thankYou.remove();
    window.location.href = 'index.html';
}, 2500); // ২.৫ সেকেন্ড পর হোমে যাবে
// অর্ডার কনফার্ম সাবমিট (সাথে সাথে কনফার্ম হয়ে যাবে)
document.getElementById('order-details')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        alert("প্রোডাক্ট পাওয়া যায়নি!");
        return;
    }

    const method = document.getElementById('payment-method').value;
    let transactionId = '';

    // অনলাইন পেমেন্ট হলে ট্রানজেকশন আইডি চেক
    if (['bKash', 'Nagad', 'Rocket', 'Upay'].includes(method)) {
        transactionId = document.getElementById('transaction-id')?.value.trim();
        if (!transactionId) {
            alert('ট্রানজেকশন আইডি দিন!');
            return;
        }
    }

    const newOrder = {
        productId: id,
        productName: product.name,
        quantity: currentQuantity,
        userName: document.getElementById('user-name').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        email: document.getElementById('email').value.trim() || 'N/A',
        country: document.getElementById('country').value,
        division: document.getElementById('division').value,
        district: document.getElementById('district').value,
        upazila: document.getElementById('upazila').value,
        address: document.getElementById('address').value.trim(),
        payment: method,
        transactionId: transactionId,
        totalAmount: currentProductPrice * currentQuantity,
        status: 'pending',
        orderDate: new Date().toLocaleString('bn-BD')
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // সাথে সাথে কনফার্ম হয়ে যাবে (কোনো অ্যালার্ট ছাড়াই)
    // ইউজারকে হোম পেজে নিয়ে যাওয়া
    window.location.href = 'index.html';
});
// সার্চ মডাল খোলা/বন্ধ
function openSearchModal() {
    document.getElementById('search-modal')?.classList.add('show');
    document.getElementById('modal-search-input')?.focus();
}

function closeSearchModal() {
    document.getElementById('search-modal')?.classList.remove('show');
}

// Enter চাপলে সার্চ রেজাল্ট পেজে যাওয়া
function goToSearchResults() {
    const query = document.getElementById('modal-search-input')?.value.trim();
    if (!query) return alert('কিছু লিখুন');

    localStorage.setItem('searchQuery', query);
    window.location.href = 'search-results.html';
}
// search-results.html-এর script-এ কার্ডে রিভিউ কাউন্ট যোগ করুন
card.innerHTML = `
    ${p.images?.[0] ? `<img src="${p.images[0]}" alt="${p.name}">` : '<div class="no-image">ছবি নেই</div>'}
    <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div>
            <span class="product-price">${p.price} টাকা</span>
            ${p.oldPrice > 0 ? `<span class="product-old-price">${p.oldPrice} টাকা</span>` : ''}
        </div>
        <div class="product-stock">স্টক: ${p.stock}</div>
        <div class="review-count">
            রিভিউ: ${reviews.filter(r => r.productId === p.id).length}
        </div>
    </div>
`;
// প্রোডাক্ট ডিটেইল লোড (ছবি + রিভিউ সব দেখাবে)
function renderProductDetail() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        document.getElementById('product-detail').innerHTML = '<p style="text-align:center; padding:40px;">প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }

    // পেজ টাইটেল
    document.getElementById('page-title').textContent = `${product.name} | ওয়েবসাইট নাম`;

    // সব ছবি গ্যালারিতে লোড
    const gallery = document.getElementById('image-gallery');
    gallery.innerHTML = '';
    if (product.images?.length > 0) {
        product.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = product.name;
            gallery.appendChild(img);
        });
    } else {
        gallery.innerHTML = '<p style="text-align:center; color:#777;">কোনো ছবি নেই</p>';
    }

    // অন্যান্য তথ্য
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price + " টাকা";
    document.getElementById('product-old-price').textContent = product.oldPrice ? product.oldPrice + " টাকা" : '';
    document.getElementById('product-stock').textContent = product.stock;
    document.getElementById('product-description').textContent = product.description || "বিস্তারিত বিবরণ নেই";

    // রিভিউ লোড (সব মন্তব্য দেখাবে)
    loadProductReviews(id);
}

// রিভিউ লোড (সব মন্তব্য দেখানো)
function loadProductReviews(productId) {
    const list = document.getElementById('product-reviews-list');
    if (!list) return;

    list.innerHTML = '';

    const productReviews = reviews.filter(r => r.productId === productId);

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">এই প্রোডাক্টের কোনো মন্তব্য এখনো নেই</p>';
        return;
    }

    productReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-author">${review.author}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-date">${review.date}</div>

            <div class="review-like">
                <button class="like-btn ${review.likedBy?.includes(currentUserMobile) ? 'liked' : ''}" 
                        onclick="toggleLike('${review.id}')">
                    ❤️ <span class="like-count">${review.likes || 0}</span>
                </button>
            </div>
        `;
        list.appendChild(div);
    });
}
function renderProductDetail() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        document.getElementById('product-detail').innerHTML = '<p style="text-align:center; padding:40px; color:red;">প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }

    // পেজ টাইটেল
    document.getElementById('page-title').textContent = `${product.name} | ওয়েবসাইট নাম`;

    // ছবি গ্যালারি
    const gallery = document.getElementById('image-gallery');
    gallery.innerHTML = '';

    if (product.images && product.images.length > 0) {
        product.images.forEach(src => {
            if (src && src.startsWith('data:image')) {  // base64 চেক
                const img = document.createElement('img');
                img.src = src;
                img.alt = product.name;
                img.loading = "lazy";
                img.style.cssText = "max-width:100%; height:auto; border-radius:12px;";
                gallery.appendChild(img);
            }
        });
    } else {
        gallery.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">কোনো ছবি যোগ করা হয়নি</p>';
    }

    // বাকি তথ্য (নাম, দাম, স্টক, ডেসক্রিপশন)
    document.getElementById('product-name').textContent = product.name || 'নাম নেই';
    document.getElementById('product-price').textContent = product.price ? product.price + " টাকা" : 'দাম নেই';
    document.getElementById('product-old-price').textContent = product.oldPrice ? product.oldPrice + " টাকা" : '';
    document.getElementById('product-stock').textContent = product.stock ?? 'স্টক নেই';
    document.getElementById('product-description').textContent = product.description || "বিস্তারিত বিবরণ নেই";

    // রিভিউ লোড
    loadProductReviews(id);
}
function addToCartFromDetail() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    if (!id) return alert("প্রোডাক্ট আইডি পাওয়া যায়নি");
    
    addToCart(id, currentQuantity); // আপনার আগের addToCart ফাংশন কল করুন
    alert("কার্টে যোগ হয়েছে!");
}
function renderProducts() {
    const container = document.getElementById('products-list');
    if (!container) return;
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#777;">কোনো প্রোডাক্ট এখনো যোগ করা হয়নি</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';  // হাতের চিহ্ন দেখাবে
        card.onclick = () => goToProductDetail(product.id);  // পুরো কার্ডে চাপ দিলে ডিটেইল পেজে

        const mainImage = product.images && product.images.length > 0 ? product.images[0] : '';

        card.innerHTML = `
            ${mainImage ? `<img src="${mainImage}" alt="${product.name}">` : '<div class="no-image">ছবি নেই</div>'}
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div>
                    <span class="product-price">${product.price} টাকা</span>
                    ${Number(product.oldPrice) > 0 ? `<span class="product-old-price">${product.oldPrice} টাকা</span>` : ''}
                </div>
                <div class="product-stock">স্টক: ${product.stock}</div>
                <button class="order-btn" onclick="event.stopPropagation(); goToOrder(${product.id})">অর্ডার করুন</button>
            </div>
        `;

        container.appendChild(card);
    });
}
// প্রোডাক্ট কার্ডে চাপ দিলে ডিটেইল পেজে নিয়ে যাওয়া
function goToProductDetail(productId) {
    localStorage.setItem('currentProductId', productId);
    window.location.href = 'product-detail.html';
}
function goToProductDetail(productId) {
    localStorage.setItem('currentProductId', productId);
    window.location.href = 'product-detail.html';
}
function renderProductDetail() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        document.getElementById('product-detail-page').innerHTML = '<p style="text-align:center; padding:40px; color:#777;">প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }

    document.getElementById('page-title').textContent = `${product.name} | ওয়েবসাইট নাম`;

    // সব ছবি গ্যালারিতে
    const gallery = document.getElementById('image-gallery');
    gallery.innerHTML = '';
    if (product.images && product.images.length > 0) {
        product.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = product.name;
            img.loading = "lazy";
            gallery.appendChild(img);
        });
    } else {
        gallery.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">কোনো ছবি যোগ করা হয়নি</p>';
    }

    // তথ্য লোড
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price + " টাকা";
    document.getElementById('product-old-price').textContent = product.oldPrice ? product.oldPrice + " টাকা" : '';
    document.getElementById('product-stock').textContent = product.stock;
    document.getElementById('product-description').textContent = product.description || "বিস্তারিত বিবরণ নেই";

    // রিভিউ লোড
    loadProductReviews(id);
}

// অর্ডার পেজে নিয়ে যাওয়া (ডিটেইল পেজ থেকে)
function goToOrderFromDetail() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    localStorage.setItem('currentProductId', id);
    window.location.href = 'order.html';
}
// রিভিউ জমা দেওয়া (লগইন ছাড়াই)
function submitReview() {
    const text = document.getElementById('review-text').value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput?.value.trim() || 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const id = parseInt(localStorage.getItem('currentProductId'));

    // নতুন রিভিউ অবজেক্ট
    const newReview = {
        id: 'rev' + Date.now(), // ইউনিক আইডি
        productId: id,
        rating: selectedRating,
        text,
        author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        likes: 0,
        likedBy: []
    };

    // রিভিউ অ্যারেতে যোগ করা
    reviews.push(newReview);

    // স্থায়ীভাবে সেভ করা (পেজ রিফ্রেশ করলেও থাকবে)
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // সাথে সাথে রিভিউ লিস্ট আপডেট
    loadProductReviews(id);

    // ফর্ম রিসেট
    document.getElementById('review-text').value = '';
    if (authorInput) authorInput.value = '';
    selectedRating = 0;
    setRating(0);

    alert('মন্তব্য যোগ হয়েছে! ধন্যবাদ।');
}
function loadProductReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = '';

    const productReviews = reviews.filter(r => r.productId === productId);

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">কোনো মন্তব্য এখনো নেই। প্রথম মন্তব্য দিন!</p>';
        return;
    }

    productReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-author">${review.author}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-date">${review.date}</div>
        `;
        list.appendChild(div);
    });
}
function renderProductDetail() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);

    if (!product) {
        document.getElementById('product-detail-page').innerHTML = '<p style="text-align:center; padding:60px; color:#777;">প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }

    document.getElementById('page-title').textContent = `${product.name} | ওয়েবসাইট নাম`;

    // ছবি গ্যালারি লোড
    const gallery = document.getElementById('image-gallery');
    gallery.innerHTML = '';

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach(src => {
            if (src && src.startsWith('data:image')) {  // base64 চেক
                const img = document.createElement('img');
                img.src = src;
                img.alt = product.name;
                img.loading = "lazy";
                img.onerror = () => { img.src = 'https://via.placeholder.com/300?text=ছবি+নেই'; }; // ভুল হলে প্লেসহোল্ডার
                gallery.appendChild(img);
            }
        });
    } else {
        gallery.innerHTML = '<p style="text-align:center; color:#777; padding:30px; font-size:1.2rem;">কোনো ছবি যোগ করা হয়নি</p>';
    }

    // ডিটেইলস লোড
    document.getElementById('product-name').textContent = product.name || 'নাম নেই';
    document.getElementById('product-price').textContent = product.price ? product.price + " টাকা" : 'দাম নেই';
    document.getElementById('product-old-price').textContent = product.oldPrice ? product.oldPrice + " টাকা" : '';
    document.getElementById('product-stock').textContent = product.stock || 'স্টক নেই';
    document.getElementById('product-description').textContent = product.description || "বিস্তারিত বিবরণ নেই";

    loadProductReviews(id);
}
card.onclick = () => {
    localStorage.setItem('currentProductId', product.id);
    window.location.href = 'product-detail.html';
};
// ছবি গ্যালারি লোড
const gallery = document.getElementById('image-gallery');
gallery.innerHTML = '';

if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach(src => {
        if (src && src.startsWith('data:image')) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = product.name;
            img.loading = "lazy";
            gallery.appendChild(img);
        }
    });
} else {
    gallery.innerHTML = '<p style="text-align:center; color:#777; padding:30px;">কোনো ছবি যোগ করা হয়নি</p>';
}
function setRating(rating) {
    selectedRating = rating;

    // সব স্টারকে আগে ডিফল্ট করা
    document.querySelectorAll('.rating-input .star').forEach(star => {
        star.classList.remove('active');
    });

    // নির্বাচিত রেটিং পর্যন্ত গ্লো করা
    document.querySelectorAll('.rating-input .star').forEach(star => {
        if (parseInt(star.getAttribute('data-value')) <= rating) {
            star.classList.add('active');
        }
    });
}
function submitReview() {
    const text = document.getElementById('review-text').value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput?.value.trim() || 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const id = parseInt(localStorage.getItem('currentProductId'));

    const newReview = {
        id: 'rev' + Date.now(),
        productId: id,
        rating: selectedRating,
        text,
        author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        likes: 0,
        likedBy: []
    };

    reviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews)); // স্থায়ী সেভ

    // সাথে সাথে লিস্ট আপডেট
    loadProductReviews(id);

    // ফর্ম রিসেট + স্টার গ্লো রিমুভ
    document.getElementById('review-text').value = '';
    if (authorInput) authorInput.value = '';
    selectedRating = 0;
    setRating(0); // সব স্টার ডিফল্টে ফিরে যাবে
    alert('মন্তব্য যোগ হয়েছে! ধন্যবাদ।');
}
// স্টার সিলেক্ট করলে গ্লো করা
function setRating(rating) {
    selectedRating = rating;

    document.querySelectorAll('.rating-input .star').forEach(star => {
        const value = parseInt(star.getAttribute('data-value'));
        if (value <= rating) {
            star.style.color = '#f39c12';
            star.style.textShadow = '0 0 10px #f39c12';
        } else {
            star.style.color = '#ddd';
            star.style.textShadow = 'none';
        }
    });
}

// মন্তব্য জমা দেওয়া + সাথে সাথে লিস্টে যোগ
function submitReview() {
    const text = document.getElementById('review-text').value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput?.value.trim() || 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const id = parseInt(localStorage.getItem('currentProductId'));

    const newReview = {
        id: 'rev' + Date.now(),
        productId: id,
        rating: selectedRating,
        text,
        author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // রিভিউ অ্যারেতে যোগ করা
    reviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews)); // স্থায়ী সেভ

    // সাথে সাথে লিস্ট আপডেট (নতুন মন্তব্য উপরে)
    loadProductReviews(id);

    // ফর্ম রিসেট
    document.getElementById('review-text').value = '';
    if (authorInput) authorInput.value = '';
    selectedRating = 0;
    setRating(0); // স্টার আবার ধূসর হয়ে যাবে
    alert('মন্তব্য যোগ হয়েছে!');
}
// রিভিউ জমা দেওয়া + সাথে সাথে লিস্ট আপডেট
function submitReview() {
    const text = document.getElementById('review-text')?.value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput?.value.trim() || 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const productId = parseInt(localStorage.getItem('currentProductId'));

    const newReview = {
        id: 'rev' + Date.now(),
        productId: productId,
        rating: selectedRating,
        text: text,
        author: author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // রিভিউ অ্যারেতে যোগ করা
    reviews.push(newReview);

    // স্থায়ী সেভ (পেজ রিফ্রেশ করলেও থাকবে)
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // সাথে সাথে লিস্ট আপডেট (নতুন মন্তব্য উপরে)
    loadProductReviews(productId);

    // ফর্ম রিসেট
    document.getElementById('review-text').value = '';
    if (authorInput) authorInput.value = '';
    selectedRating = 0;
    setRating(0);

    alert('মন্তব্য যোগ হয়েছে! ধন্যবাদ।');
}

// রিভিউ লোড করা (নতুন থেকে পুরানো)
function loadProductReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = ''; // পুরানো কনটেন্ট মুছে ফেলা

    // ফিল্টার + নতুন থেকে পুরানো সাজানো (reverse)
    const productReviews = reviews
        .filter(r => r.productId === productId)
        .sort((a, b) => b.id.localeCompare(a.id)); // নতুন প্রথমে

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">কোনো মন্তব্য এখনো নেই। প্রথম মন্তব্য দিন!</p>';
        return;
    }

    productReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-author">${review.author}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-date">${review.date}</div>
        `;
        list.appendChild(div);
    });
}
function submitReview() {
    console.log("মন্তব্য জমা দিন বাটনে চাপ দেওয়া হয়েছে"); // ← চেক করার জন্য

    const text = document.getElementById('review-text')?.value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput?.value.trim() || 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const productId = parseInt(localStorage.getItem('currentProductId'));
    if (!productId || isNaN(productId)) {
        alert('প্রোডাক্ট আইডি পাওয়া যায়নি!');
        return;
    }

    const newReview = {
        id: 'rev' + Date.now(),
        productId: productId,
        rating: selectedRating,
        text: text,
        author: author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // রিভিউ যোগ করা
    reviews.push(newReview);

    // স্থায়ী সেভ
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // লিস্ট আপডেট
    loadProductReviews(productId);

    // ফর্ম রিসেট
    document.getElementById('review-text').value = '';
    if (authorInput) authorInput.value = '';
    selectedRating = 0;
    setRating(0);

    alert('মন্তব্য যোগ হয়েছে!');
}
function loadProductReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) {
        console.log("reviews-list div পাওয়া যায়নি!");
        return;
    }

    list.innerHTML = '';

    const productReviews = reviews.filter(r => r.productId === productId);

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:30px;">কোনো মন্তব্য এখনো নেই। প্রথম মন্তব্য দিন!</p>';
        return;
    }

    // নতুন থেকে পুরানো সাজানো
    productReviews.sort((a, b) => b.id.localeCompare(a.id));

    productReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-author">${review.author}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-date">${review.date}</div>
        `;
        list.appendChild(div);
    });

    // নতুন মন্তব্যের পর অটো নিচে স্ক্রল
    list.scrollTop = list.scrollHeight;
}
// মন্তব্য জমা দেওয়া + সাথে সাথে লিস্ট আপডেট
function submitReview() {
    const text = document.getElementById('review-text')?.value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput?.value.trim() || 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const productId = parseInt(localStorage.getItem('currentProductId'));

    const newReview = {
        id: 'rev' + Date.now(),
        productId: productId,
        rating: selectedRating,
        text: text,
        author: author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // রিভিউ যোগ করা
    reviews.push(newReview);

    // স্থায়ী সেভ
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // লিস্ট আপডেট
    loadProductReviews(productId);

    // ফর্ম রিসেট
    document.getElementById('review-text').value = '';
    if (authorInput) authorInput.value = '';
    selectedRating = 0;
    setRating(0);

    alert('মন্তব্য যোগ হয়েছে! ধন্যবাদ।');
}

// রিভিউ লোড + নতুন মন্তব্যের পর অটো নিচে স্ক্রল
function loadProductReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = '';

    const productReviews = reviews
        .filter(r => r.productId === productId)
        .sort((a, b) => b.id.localeCompare(a.id)); // নতুন প্রথমে

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:30px;">কোনো মন্তব্য এখনো নেই। প্রথম মন্তব্য দিন!</p>';
    } else {
        productReviews.forEach(review => {
            const div = document.createElement('div');
            div.className = 'review-item';
            div.innerHTML = `
                <div class="review-header">
                    <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <div class="review-author">${review.author}</div>
                </div>
                <p class="review-text">${review.text}</p>
                <div class="review-date">${review.date}</div>
            `;
            list.appendChild(div);
        });
    }

    // নতুন মন্তব্যের পর অটো নিচে স্ক্রল
    list.scrollTop = list.scrollHeight;
}
// পুরানো submit listener বন্ধ করে নতুনটা ফোর্স করে চালু করা
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-details');
    if (!form) return;

    // পুরানো listener যদি থাকে তাহলে বন্ধ করা (clone করে নতুন করে attach)
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', function(e) {
        e.preventDefault(); // পুরানো submit বন্ধ

        const productId = parseInt(localStorage.getItem('currentProductId'));
        const product = products.find(p => p.id === productId);

        if (!product) return;

        const formData = new FormData(this);

        const newOrder = {
            productId: productId,
            productName: product.name,
            quantity: currentQuantity || 1,
            userName: formData.get('user-name')?.trim() || '',
            mobile: formData.get('mobile')?.trim() || '',
            email: formData.get('email')?.trim() || 'N/A',
            country: formData.get('country') || '',
            division: formData.get('division') || '',
            district: formData.get('district') || '',
            upazila: formData.get('upazila') || '',
            address: formData.get('address')?.trim() || '',
            payment: formData.get('payment-method') || 'COD',
            transactionId: formData.get('transaction-id')?.trim() || '',
            totalAmount: (currentProductPrice || product.price) * (currentQuantity || 1),
            status: 'pending',
            orderDate: new Date().toLocaleString('bn-BD')
        };

        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // ফর্ম খালি
        this.reset();

        // সরাসরি হোমে চলে যাওয়া — কোনো অ্যালার্ট নেই
        window.location.href = 'index.html';
    });
});
// মন্তব্য জমা দেওয়া + লিস্টে দেখানো + ফর্ম খালি
function submitReview() {
    const text = document.getElementById('review-text').value.trim();
    const authorInput = document.getElementById('review-author');
    const author = authorInput ? authorInput.value.trim() || 'অতিথি' : 'অতিথি';

    if (!text || selectedRating === 0) {
        alert('রেটিং ও মন্তব্য দিন!');
        return;
    }

    const productId = parseInt(localStorage.getItem('currentProductId'));

    const newReview = {
        id: 'rev' + Date.now(),
        productId: productId,
        rating: selectedRating,
        text: text,
        author: author,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    reviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // লিস্ট আপডেট + অটো স্ক্রল
    loadProductReviews(productId);

    // ফর্ম খালি
    document.getElementById('review-text').value = '';
    if (authorInput) authorInput.value = '';
    selectedRating = 0;
    setRating(0);
}

// লিস্ট আপডেট + নতুন মন্তব্য উপরে + অটো স্ক্রল
function loadProductReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = '';

    const productReviews = reviews
        .filter(r => r.productId === productId)
        .sort((a, b) => b.id.localeCompare(a.id)); // নতুন প্রথমে

    if (productReviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:30px;">কোনো মন্তব্য এখনো নেই। প্রথম মন্তব্য দিন!</p>';
        return;
    }

    productReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-author">${review.author}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-date">${review.date}</div>
        `;
        list.appendChild(div);
    });

    // নতুন মন্তব্যের পর অটো নিচে স্ক্রল
    list.scrollTop = list.scrollHeight;
}
// অর্ডারকারীর তথ্য PDF-এ ডাউনলোড করা
function downloadOrderPDF(index) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const order = orders[index];

    if (!order) {
        console.error("অর্ডার পাওয়া যায়নি");
        return;
    }

    // PDF হেডার
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0); // সবুজ রঙ
    doc.text("অর্ডার ডিটেইলস", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // কালো রঙ

    let y = 40;

    doc.text(`অর্ডার নং: ${index + 1}`, 20, y); y += 10;
    doc.text(`তারিখ: ${order.orderDate || 'N/A'}`, 20, y); y += 15;

    doc.text(`ক্রেতার নাম: ${order.userName || 'N/A'}`, 20, y); y += 10;
    doc.text(`মোবাইল: ${order.mobile || 'N/A'}`, 20, y); y += 10;
    doc.text(`ইমেইল: ${order.email || 'N/A'}`, 20, y); y += 15;

    doc.text(`ঠিকানা: ${order.address || 'N/A'}`, 20, y); y += 10;
    doc.text(`উপজেলা: ${order.upazila || 'N/A'}`, 20, y); y += 10;
    doc.text(`জেলা: ${order.district || 'N/A'}`, 20, y); y += 10;
    doc.text(`বিভাগ: ${order.division || 'N/A'}`, 20, y); y += 15;

    doc.text(`প্রোডাক্ট: ${order.productName}`, 20, y); y += 10;
    doc.text(`কোয়ান্টিটি: ${order.quantity || 1}`, 20, y); y += 10;
    doc.text(`মোট দাম: ${order.totalAmount} টাকা`, 20, y); y += 15;

    doc.text(`পেমেন্ট মেথড: ${order.payment || 'COD'}`, 20, y); y += 10;
    if (order.transactionId) {
        doc.text(`ট্রানজেকশন আইডি: ${order.transactionId}`, 20, y); y += 10;
    }

    doc.text(`স্ট্যাটাস: ${order.status || 'pending'}`, 20, y);

    // PDF ডাউনলোড — সরাসরি মোবাইলে সেভ হবে
    doc.save(`Order_${index + 1}_${order.mobile || 'guest'}.pdf`);
}
// অর্ডার PDF ডাউনলোড ফাংশন
function downloadOrderPDF(index) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const order = orders[index];

    if (!order) return;

    // PDF-এর হেডার
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0); // সবুজ
    doc.text("অর্ডার ডিটেইলস", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // কালো

    let y = 40;

    doc.text(`অর্ডার নং: ${index + 1}`, 20, y); y += 10;
    doc.text(`তারিখ: ${order.orderDate || 'N/A'}`, 20, y); y += 15;

    doc.text(`ক্রেতার নাম: ${order.userName || 'N/A'}`, 20, y); y += 10;
    doc.text(`মোবাইল: ${order.mobile || 'N/A'}`, 20, y); y += 10;
    doc.text(`ইমেইল: ${order.email || 'N/A'}`, 20, y); y += 15;

    doc.text(`ঠিকানা: ${order.address || 'N/A'}`, 20, y); y += 10;
    doc.text(`উপজেলা: ${order.upazila || 'N/A'}`, 20, y); y += 10;
    doc.text(`জেলা: ${order.district || 'N/A'}`, 20, y); y += 10;
    doc.text(`বিভাগ: ${order.division || 'N/A'}`, 20, y); y += 15;

    doc.text(`প্রোডাক্ট: ${order.productName}`, 20, y); y += 10;
    doc.text(`কোয়ান্টিটি: ${order.quantity || 1}`, 20, y); y += 10;
    doc.text(`মোট দাম: ${order.totalAmount} টাকা`, 20, y); y += 15;

    doc.text(`পেমেন্ট: ${order.payment || 'COD'}`, 20, y); y += 10;
    if (order.transactionId) {
        doc.text(`ট্রানজেকশন আইডি: ${order.transactionId}`, 20, y); y += 10;
    }

    doc.text(`স্ট্যাটাস: ${order.status || 'pending'}`, 20, y);

    // ফাইল ডাউনলোড
    doc.save(`Order_${index + 1}_${order.mobile || 'guest'}.pdf`);
}
function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;

    list.innerHTML = '';

    orders.forEach((order, index) => {
        const div = document.createElement('div');
        div.classList.add('order-item');
        div.innerHTML = `
            <p><strong>অর্ডারকারী:</strong> ${order.userName || 'N/A'}</p>
            <p><strong>মোবাইল:</strong> ${order.mobile || 'N/A'}</p>
            <p><strong>প্রোডাক্ট:</strong> ${order.productName}</p>
            <p><strong>কোয়ান্টিটি:</strong> ${order.quantity}</p>
            <p><strong>ঠিকানা:</strong> ${order.address || 'N/A'} (${order.upazila}, ${order.district}, ${order.division})</p>
            <p><strong>পেমেন্ট:</strong> ${order.payment} ${order.transactionId ? `(ট্রানজেকশন: ${order.transactionId})` : ''}</p>
            <p><strong>স্ট্যাটাস:</strong> ${order.status || 'pending'}</p>
            <p><strong>তারিখ:</strong> ${order.orderDate || 'N/A'}</p>
            <button onclick="updateOrderStatus(${index}, 'pending')">পেন্ডিং</button>
            <button onclick="updateOrderStatus(${index}, 'successful')">সাকসেস</button>
            <button onclick="deleteOrder(${index})">ডিলিট</button>
            
            <!-- নতুন: PDF ডাউনলোড বাটন যোগ করা হয়েছে -->
            <button onclick="downloadOrderPDF(${index})" style="margin-left: 10px; padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 6px; cursor: pointer;">
                PDF ডাউনলোড
            </button>
        `;
        list.appendChild(div);
    });

    if (orders.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">কোনো অর্ডার এখনো আসেনি</p>';
    }
}