// REPLACE with your Firebase Project Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAjhi25Q8urRDAS33nxMl3J3PCh8u8-b64",
    authDomain: "igelectrons.firebaseapp.com",
    projectId: "igelectrons",
    databaseURL: "https://igelectrons-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Ambient Audio Bypass
const amb = document.getElementById('bgAmbient');
const startAudio = () => {
    amb.play().catch(() => {});
    document.removeEventListener('click', startAudio);
};
document.addEventListener('click', startAudio);

let catalog = [];

// Load Inventory
db.ref('inventory').on('value', snap => {
    const val = snap.val();
    catalog = [];
    for (let key in val) {
        catalog.push({ id: key, ...val[key] });
    }
    renderShowcase(catalog);
    renderDashList();
});

function renderShowcase(data) {
    const grid = document.getElementById('pGrid');
    grid.innerHTML = data.map(p => {
        const waLink = `https://wa.me/919876898832?text=${encodeURIComponent(`Hi Vijay Electronics Mukerian, I am interested in the ${p.name}. Please share details.`)}`;
        return `
            <article class="item-card">
                <div class="media-box"><img src="${p.img}" alt="${p.name}"></div>
                <div style="font-size: 0.6rem; color: #555; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">${p.cat}</div>
                <h3>${p.name}</h3>
                <div class="item-price">₹${parseInt(p.price).toLocaleString('en-IN')}</div>
                <a href="${waLink}" target="_blank" class="wa-inquiry">
                    <i class="ph-fill ph-whatsapp-logo"></i> ASK ON WHATSAPP
                </a>
            </article>
        `;
    }).join('');
}

// Admin Functions
function openDash() {
    if(prompt("Enter Access PIN:") === "ig99") {
        document.getElementById('dashPanel').classList.add('open');
    }
}

function closeDash() {
    document.getElementById('dashPanel').classList.remove('open');
}

function commitData() {
    const id = document.getElementById('editKey').value;
    const file = document.getElementById('imgIn').files[0];
    
    const sendToDB = (imgUri = null) => {
        const entry = {
            name: document.getElementById('nameIn').value,
            cat: document.getElementById('catIn').value,
            price: document.getElementById('priceIn').value,
            desc: document.getElementById('descIn').value
        };
        if(imgUri) entry.img = imgUri;

        if(id) {
            db.ref('inventory/' + id).update(entry);
        } else {
            db.ref('inventory').push(entry);
        }
        alert("Showroom Updated!");
        resetForm();
    };

    if(file) {
        const r = new FileReader();
        r.onloadend = () => sendToDB(r.result);
        r.readAsDataURL(file);
    } else {
        sendToDB();
    }
}

function renderDashList() {
    document.getElementById('miniList').innerHTML = catalog.map(p => `
        <div class="mini-item">
            <span style="font-size: 0.8rem;">${p.name}</span>
            <div>
                <i class="ph ph-pencil-simple" onclick="loadItem('${p.id}')" style="margin-right: 12px; cursor: pointer; color: #666;"></i>
                <i class="ph ph-trash-simple" onclick="dropItem('${p.id}')" style="cursor: pointer; color: #ff4444;"></i>
            </div>
        </div>
    `).join('');
}

function loadItem(id) {
    const p = catalog.find(x => x.id === id);
    document.getElementById('editKey').value = p.id;
    document.getElementById('nameIn').value = p.name;
    document.getElementById('catIn').value = p.cat;
    document.getElementById('priceIn').value = p.price;
    document.getElementById('descIn').value = p.desc;
}

function dropItem(id) {
    if(confirm("Delete this product permanently?")) db.ref('inventory/' + id).remove();
}

function resetForm() {
    ['editKey','nameIn','priceIn','descIn','imgIn'].forEach(el => document.getElementById(el).value = '');
}

function handleSearch() {
    const term = document.getElementById('pSearch').value.toLowerCase();
    renderShowcase(catalog.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.cat.toLowerCase().includes(term)
    ));
}
