const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 1. CONFIGURATION
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1491874696784777310/qzZJcI4BvXVRtKCCb8zv2IyLSC0BJqvAllZR12_XCYkhFoO5BXxT1V0gVZ2HMaqIMHDm'; 
const PORT = process.env.PORT || 3000;
const SUBMISSION_LIMIT = 3; 
const incarnationDatabase = {}; 

app.use(express.json());

// 2. BACKEND LOGIC
app.post('/transmit', upload.single('file'), async (req, res) => {
    const { incarnationId, nickname, type } = req.body;
    const senderName = nickname || `Incarnation ${incarnationId.substring(0,8)}`;

    if (!incarnationDatabase[incarnationId]) incarnationDatabase[incarnationId] = { emoji: 0, sticker: 0 };
    const user = incarnationDatabase[incarnationId];
    
    if (user[type] >= SUBMISSION_LIMIT) return res.status(403).json({ error: `[QUOTA EXCEEDED: 3/3]` });

    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: 'offering.png' });
        const payload = {
            embeds: [{
                title: "[The Theatre Nebula - New Offering]",
                color: 5814783,
                description: `**Sender Name:** \`${senderName}\`\n**System ID:** \`${incarnationId.substring(0,8)}\`\n**Asset Type:** ${type.toUpperCase()}\n**Count:** [${user[type] + 1}/${SUBMISSION_LIMIT}]`
            }]
        };
        formData.append('payload_json', JSON.stringify(payload));
        await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', body: formData });
        user[type]++;
        res.json({ success: true, counts: user });
    } catch (err) { res.status(500).json({ error: "[CONNECTION LOST.]" }); }
});

// 3. FRONTEND (CLEAN TEXT VERSION)
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Main Scenario #01]</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.5/croppie.min.css" />
    <style>
        body { background: #000; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; overflow-x: hidden; }
        .window { background: #3498db; width: 95%; max-width: 500px; padding: 55px 45px; position: relative; box-shadow: 0 0 40px rgba(52, 152, 219, 0.5); box-sizing: border-box; }
        .window::before { content: ""; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid rgba(255, 255, 255, 0.8); pointer-events: none; }
        .window::after { content: ""; position: absolute; top: 16px; left: 16px; right: 16px; bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.4); pointer-events: none; }
        .glitch-tl { position: absolute; top: -5px; left: -5px; width: 45px; height: 45px; border-top: 6px solid #3498db; border-left: 6px solid #3498db; }
        .glitch-br { position: absolute; bottom: -5px; right: -5px; width: 45px; height: 45px; border-bottom: 6px solid #3498db; border-right: 6px solid #3498db; }
        .system-controls { position: absolute; top: 18px; right: 20px; font-family: monospace; font-size: 11px; letter-spacing: 3px; }
        h2 { text-align: center; font-size: 1.1rem; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px; }
        .scenario-log { max-height: 180px; overflow-y: auto; margin-bottom: 25px; padding-right: 10px; scrollbar-width: thin; scrollbar-color: white transparent; }
        .scenario-log::-webkit-scrollbar { width: 4px; }
        .scenario-log::-webkit-scrollbar-thumb { background: white; }
        .details { font-size: 0.85rem; line-height: 2; font-weight: bold; text-transform: uppercase; }
        .input-group { margin-bottom: 12px; }
        label { font-size: 0.75rem; display: block; margin-bottom: 5px; opacity: 0.9; font-weight: bold; }
        select, input[type="text"], input[type="file"], .btn { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid white; color: white; padding: 12px; font-weight: bold; font-size: 0.85rem; box-sizing: border-box; }
        .btn { background: white; color: #3498db; cursor: pointer; border: none; margin-top: 15px; text-transform: uppercase; }
        #preview-section { display: none; text-align: center; margin-top: 20px; }
        #preview-img { border: 2px solid white; max-width: 160px; background: #000; margin-bottom: 15px; }
        #crop-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100; flex-direction: column; align-items: center; justify-content: center; }
        .crop-container { background: #3498db; padding: 25px; border: 2px solid white; width: 90%; max-width: 400px; }
    </style>
</head>
<body>
    <div class="window">
        <div class="glitch-tl"></div><div class="glitch-br"></div><div class="system-controls">_ ▢ X</div>
        <h2>&lt;MAIN SCENARIO #1 - ASSET OFFERING&gt;</h2>
        <div id="initial-ui">
            <div class="scenario-log">
                <div class="details">
                    CATEGORY: MAIN<br>
                    DIFFICULTY: F<br>
                    CLEAR CONDITION: TRANSMIT BEST ASSETS TO THE THEATRE NEBULA.<br>
                    TIME LIMIT: 7 DAYS<br>
                    REWARDS: SPECIAL DISCORD ROLE<br>
                    PENALTY FOR FAILURE: ???
                </div>
            </div>
            <div class="input-group">
                <label>[IDENTIFY YOURSELF]</label>
                <input type="text" id="nickname" placeholder="ENTER DISCORD NAME...">
            </div>
            <div class="input-group">
                <label>[SELECT CATEGORY]</label>
                <select id="type"><option value="emoji">EMOJI</option><option value="sticker">STICKER</option></select>
            </div>
            <div class="input-group">
                <label>[FILE SELECTION]</label>
                <input type="file" id="fileInput" accept="image/*">
            </div>
        </div>
        <div id="preview-section">
            <p style="font-size: 0.8rem; margin-bottom: 10px;">[PREVIEWING OFFERING]</p>
            <img id="preview-img" src="">
            <button class="btn" id="finalizeBtn">VALIDATE & TRANSMIT</button>
        </div>
        <p id="msg" style="text-align:center; font-size:0.75rem; margin-top:15px;"></p>
    </div>
    <div id="crop-overlay">
        <div class="crop-container">
            <p style="text-align:center; font-size: 0.85rem; margin-bottom: 15px;">[ADJUST ASSET PROBABILITY]</p>
            <div id="crop-tool"></div>
            <button class="btn" id="confirmCropBtn">CONFIRM CROP</button>
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.5/croppie.min.js"></script>
    <script>
        let croppie; let finalBlob;
        let id = localStorage.getItem('inc_id') || Math.random().toString(36).slice(2);
        localStorage.setItem('inc_id', id);
        const fileInput = document.getElementById('fileInput');
        fileInput.onchange = function() {
            if (!this.files[0]) return;
            const size = document.getElementById('type').value === 'sticker' ? 320 : 128;
            document.getElementById('crop-overlay').style.display = 'flex';
            if (croppie) croppie.destroy();
            croppie = new Croppie(document.getElementById('crop-tool'), {
                viewport: { width: size, height: size, type: 'square' },
                boundary: { width: 300, height: 300 }, 
                showZoomer: true
            });
            const reader = new FileReader();
            reader.onload = (e) => croppie.bind({ url: e.target.result });
            reader.readAsDataURL(this.files[0]);
        };
        document.getElementById('confirmCropBtn').onclick = () => {
            const size = document.getElementById('type').value === 'sticker' ? 320 : 128;
            croppie.result({ type: 'blob', size: { width: size, height: size } }).then(blob => {
                finalBlob = blob;
                document.getElementById('crop-overlay').style.display = 'none';
                document.getElementById('initial-ui').style.display = 'none';
                document.getElementById('preview-section').style.display = 'block';
                document.getElementById('preview-img').src = URL.createObjectURL(blob);
            });
        };
        document.getElementById('finalizeBtn').onclick = () => {
            const formData = new FormData();
            formData.append('file', finalBlob);
            formData.append('incarnationId', id);
            formData.append('nickname', document.getElementById('nickname').value);
            formData.append('type', document.getElementById('type').value);
            document.getElementById('msg').innerText = "[TRANSMITTING...]";
            fetch('/transmit', { method: 'POST', body: formData })
            .then(res => res.json()).then(data => {
                document.getElementById('msg').innerText = data.success ? "[OFFERING ACCEPTED.]" : data.error;
            });
        };
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => console.log("System Active."));
