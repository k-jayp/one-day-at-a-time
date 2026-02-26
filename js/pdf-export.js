// ========== SAFETY PLAN PDF EXPORT ==========
// Generates a branded single-page grid PDF matching the template layout
// Layout: 3-column top row (Warning Signs, Triggers, How I Cope)
//         2-column bottom row (Immediate Steps, Who to Call)
// Uses jsPDF with embedded logo and custom Google Fonts (Lato, Open Sans)

// ---- Lazy-load jsPDF ----
function loadJsPdf() {
    return new Promise((resolve, reject) => {
        if (window.jspdf) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load PDF library'));
        document.head.appendChild(script);
    });
}

// ---- Load logo image as data URL ----
async function loadLogoImage() {
    try {
        const resp = await fetch('favicon-192.png');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Could not load logo image:', e);
        return null;
    }
}

// ---- Load TTF font from URL and register with jsPDF ----
async function loadCustomFont(doc, url, vfsName, fontFamily, fontStyle) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        // Convert ArrayBuffer to base64 in chunks (avoid call stack overflow)
        let binary = '';
        const chunk = 8192;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        const base64 = btoa(binary);
        doc.addFileToVFS(vfsName, base64);
        doc.addFont(vfsName, fontFamily, fontStyle);
        return true;
    } catch (e) {
        console.warn(`Could not load font ${fontFamily}:`, e);
        return false;
    }
}

// ---- Get user display name ----
function getUserDisplayName() {
    if (typeof window.getCurrentUser === 'function') {
        const user = window.getCurrentUser();
        if (user?.displayName) return user.displayName;
    }
    return localStorage.getItem('preferredName') || 'Recovery Friend';
}

// ---- Main export function ----
window.downloadSafetyPlanPdf = async function() {
    const data = window.rppData;
    if (!data) {
        if (typeof showToast === 'function') showToast('No safety plan data to export');
        return;
    }

    const relevantKeys = ['warningSigns', 'triggers', 'copingStrategies', 'emergencySteps', 'supportNetwork'];
    const hasData = relevantKeys.some(key => {
        const val = data[key];
        return Array.isArray(val) && val.length > 0;
    });
    if (!hasData) {
        if (typeof showToast === 'function') showToast('Add items to your safety plan first');
        return;
    }

    try {
        if (typeof showToast === 'function') showToast('Generating your PDF...');

        await loadJsPdf();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'letter' });

        // Load logo and fonts in parallel
        const FONT_BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl/lato';
        const [logoDataUrl, hasLatoBlack, hasLatoRegular, hasLatoBold] = await Promise.all([
            loadLogoImage(),
            loadCustomFont(doc, `${FONT_BASE}/Lato-Black.ttf`, 'Lato-Black.ttf', 'Lato', 'bold'),
            loadCustomFont(doc, `${FONT_BASE}/Lato-Regular.ttf`, 'Lato-Regular.ttf', 'LatoBody', 'normal'),
            loadCustomFont(doc, `${FONT_BASE}/Lato-Bold.ttf`, 'Lato-Bold.ttf', 'LatoBody', 'bold')
        ]);

        // Font helpers (fall back to helvetica if custom fonts failed)
        const heading = hasLatoBlack ? 'Lato' : 'helvetica';
        const body = hasLatoRegular ? 'LatoBody' : 'helvetica';

        // ---- Page constants ----
        const PW = 215.9, PH = 279.4;
        const M = 12;
        const GW = PW - M * 2;

        // Colors
        const GREEN   = [45, 90, 61];
        const GOLD    = [196, 153, 59];
        const BROWN   = [61, 50, 41];
        const BEIGE   = [228, 207, 180];
        const TXT     = [50, 50, 50];
        const BORDER  = [30, 30, 30];

        // Layout measurements
        const HEADER_H    = 36;
        const GRID_TOP    = HEADER_H + 3;
        const HDR_BAR_H   = 9;
        const TOP_CONTENT = 52;
        const TOP_ROW_H   = HDR_BAR_H + TOP_CONTENT;
        const GAP         = 3;
        const BOT_TOP     = GRID_TOP + TOP_ROW_H + GAP;
        const BOT_CONTENT = PH - BOT_TOP - HDR_BAR_H - M;
        const BOT_ROW_H   = HDR_BAR_H + BOT_CONTENT;
        const COL3_W      = GW / 3;
        const COL2_W      = GW / 2;
        const PAD         = 4;
        const LINE_H      = 4.8;

        // ---- 1. Full page dark green background ----
        doc.setFillColor(...GREEN);
        doc.rect(0, 0, PW, PH, 'F');

        // ---- 2. Header ----
        const logoSize = 16;
        const logoX = M + 2;
        const logoY = (HEADER_H - logoSize) / 2;

        if (logoDataUrl) {
            // Embed the real WDR logo
            doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
        } else {
            // Fallback: draw a simple circle if logo failed to load
            const cx = logoX + logoSize / 2;
            const cy = logoY + logoSize / 2;
            doc.setFillColor(191, 106, 58);
            doc.circle(cx, cy, logoSize / 2, 'F');
            doc.setFont(heading, 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(255, 255, 255);
            doc.text('WDR', cx, cy + 2.5, { align: 'center' });
        }

        // Brand text
        const textLeft = logoX + logoSize + 4;
        doc.setFont(heading, 'bold');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('WE DO RECOVER', textLeft, 14);

        doc.setFont(body, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(200, 200, 200);
        doc.text('O N E   D A Y   A T   A   T I M E', textLeft, 21);

        // Thin separator line below header
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(M, HEADER_H, PW - M, HEADER_H);

        // ---- 3. TOP ROW — 3 columns ----
        const topTitles = ['WARNING SIGNS', 'TRIGGERS', 'HOW I COPE'];
        const topKeys   = ['warningSigns', 'triggers', 'copingStrategies'];

        for (let i = 0; i < 3; i++) {
            const x = M + i * COL3_W;

            // Gold header bar
            doc.setFillColor(...GOLD);
            doc.rect(x, GRID_TOP, COL3_W, HDR_BAR_H, 'F');

            // Header text
            doc.setFont(heading, 'bold');
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.text(topTitles[i], x + COL3_W / 2, GRID_TOP + 6, { align: 'center' });

            // Beige content area
            doc.setFillColor(...BEIGE);
            doc.rect(x, GRID_TOP + HDR_BAR_H, COL3_W, TOP_CONTENT, 'F');

            // Cell border
            doc.setDrawColor(...BORDER);
            doc.setLineWidth(0.4);
            doc.rect(x, GRID_TOP, COL3_W, TOP_ROW_H);

            // Fill in items
            const items = data[topKeys[i]] || [];
            let ty = GRID_TOP + HDR_BAR_H + PAD + 1;
            const maxW = COL3_W - PAD * 2;

            doc.setFont(body, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...TXT);

            items.forEach(item => {
                const text = typeof item === 'string' ? item : '';
                if (!text || ty > GRID_TOP + TOP_ROW_H - 3) return;
                const lines = doc.splitTextToSize('\u2022  ' + text, maxW);
                lines.forEach(line => {
                    if (ty > GRID_TOP + TOP_ROW_H - 3) return;
                    doc.text(line, x + PAD, ty);
                    ty += LINE_H;
                });
            });
        }

        // ---- 4. BOTTOM LEFT — Immediate Steps to Take ----
        const blX = M;

        // Dark brown header bar
        doc.setFillColor(...BROWN);
        doc.rect(blX, BOT_TOP, COL2_W, HDR_BAR_H, 'F');

        doc.setFont(heading, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('IMMEDIATE STEPS TO TAKE', blX + COL2_W / 2, BOT_TOP + 6, { align: 'center' });

        // Beige content area
        doc.setFillColor(...BEIGE);
        doc.rect(blX, BOT_TOP + HDR_BAR_H, COL2_W, BOT_CONTENT, 'F');

        // Cell border
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.4);
        doc.rect(blX, BOT_TOP, COL2_W, BOT_ROW_H);

        // Fill emergency steps
        const steps = data.emergencySteps || [];
        let sy = BOT_TOP + HDR_BAR_H + PAD + 1;
        const stepMaxW = COL2_W - PAD * 2;

        doc.setFont(body, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...TXT);

        steps.forEach((step, idx) => {
            if (sy > BOT_TOP + BOT_ROW_H - 3) return;
            const lines = doc.splitTextToSize((idx + 1) + '.  ' + step, stepMaxW);
            lines.forEach(line => {
                if (sy > BOT_TOP + BOT_ROW_H - 3) return;
                doc.text(line, blX + PAD, sy);
                sy += LINE_H;
            });
        });

        // ---- 5. BOTTOM RIGHT — Who to Call ----
        const brX = M + COL2_W;

        // Dark brown header bar
        doc.setFillColor(...BROWN);
        doc.rect(brX, BOT_TOP, COL2_W, HDR_BAR_H, 'F');

        doc.setFont(heading, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('WHO TO CALL', brX + COL2_W / 2, BOT_TOP + 6, { align: 'center' });

        // Beige content area
        doc.setFillColor(...BEIGE);
        doc.rect(brX, BOT_TOP + HDR_BAR_H, COL2_W, BOT_CONTENT, 'F');

        // Cell border
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.4);
        doc.rect(brX, BOT_TOP, COL2_W, BOT_ROW_H);

        // Vertical divider splitting name | phone
        const halfCol = COL2_W / 2;
        doc.setDrawColor(180, 170, 155);
        doc.setLineWidth(0.2);
        doc.line(brX + halfCol, BOT_TOP + HDR_BAR_H, brX + halfCol, BOT_TOP + BOT_ROW_H);

        // Fill contacts
        const contacts = data.supportNetwork || [];
        let cy = BOT_TOP + HDR_BAR_H + PAD + 1;

        contacts.forEach(contact => {
            if (cy > BOT_TOP + BOT_ROW_H - 3) return;
            const name  = contact.name || '';
            const phone = contact.phone || '';

            // Name (left sub-column, bold)
            doc.setFont(body, hasLatoBold ? 'bold' : 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...TXT);
            doc.text(name, brX + PAD, cy);

            // Phone (right sub-column)
            doc.setFont(body, 'normal');
            doc.text(phone, brX + halfCol + PAD, cy);

            cy += LINE_H + 1.5;
        });

        // ---- Save ----
        doc.save('My-Safety-Plan.pdf');

        if (typeof showToast === 'function') showToast('Safety plan downloaded! \uD83D\uDCC4');
    } catch (error) {
        console.error('PDF generation error:', error);
        if (typeof showToast === 'function') showToast('Could not generate PDF. Please check your connection.');
    }
};
