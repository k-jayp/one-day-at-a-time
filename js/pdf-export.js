// ========== SAFETY PLAN PDF EXPORT ==========
// Generates a branded, print-friendly PDF of the user's safety plan
// Uses jsPDF (lazy-loaded from CDN on first use)

const PDF_SECTIONS = [
    { key: 'warningSigns',     title: 'My Warning Signs',       desc: 'Red flags that tell me I might be heading toward trouble', color: [212, 168, 83],  emoji: '⚠️' },
    { key: 'triggers',         title: 'My Triggers',            desc: 'People, places, things, and emotions that put me at risk', color: [191, 106, 58],  emoji: '🔥' },
    { key: 'copingStrategies', title: 'My Coping Strategies',   desc: 'Healthy things I can do when urges hit',                   color: [74, 139, 94],   emoji: '🛡️' },
    { key: 'supportNetwork',   title: 'My Support Network',     desc: 'People I can reach out to',                                color: [91, 143, 191],  emoji: '📞' },
    { key: 'safePlaces',       title: 'My Safe Places',         desc: 'Physical spaces where I feel safe and supported',          color: [122, 159, 138], emoji: '🏠' },
    { key: 'emergencySteps',   title: 'My Emergency Steps',     desc: 'Step-by-step actions for when I\'m in crisis',             color: [196, 90, 90],   emoji: '🚨' },
    { key: 'reasonsToStay',    title: 'My Reasons to Stay',     desc: 'Why my recovery matters',                                  color: [201, 82, 122],  emoji: '❤️' }
];

// Brand colors
const FOREST_GREEN = [45, 90, 61];
const BURNT_ORANGE = [191, 106, 58];
const BEIGE = [250, 246, 240];
const DEEP_BROWN = [61, 50, 41];
const SAND = [230, 221, 210];

// Page dimensions (US Letter in mm)
const PAGE_W = 215.9;
const PAGE_H = 279.4;
const MARGIN = 15;
const CONTENT_W = PAGE_W - (MARGIN * 2);
const HEADER_H = 30;
const FOOTER_H = 16;

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

// ---- Draw branded header ----
function drawHeader(doc) {
    // Forest green banner
    doc.setFillColor(...FOREST_GREEN);
    doc.rect(0, 0, PAGE_W, HEADER_H, 'F');

    // Burnt orange accent line
    doc.setDrawColor(...BURNT_ORANGE);
    doc.setLineWidth(0.8);
    doc.line(0, HEADER_H, PAGE_W, HEADER_H);

    // WDR circle monogram
    const cx = 18, cy = HEADER_H / 2;
    doc.setFillColor(...BURNT_ORANGE);
    doc.circle(cx, cy, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('WDR', cx, cy + 3, { align: 'center' });

    // Brand text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('WE DO RECOVER', PAGE_W / 2, 12, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('One Day at a Time', PAGE_W / 2, 18, { align: 'center' });

    // Crisis numbers
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(220, 220, 220);
    doc.text('Crisis Line: 988  |  SAMHSA: 1-800-662-4357', PAGE_W / 2, 25, { align: 'center' });
}

// ---- Draw footer ----
function drawFooter(doc, pageNum, totalPages) {
    const y = PAGE_H - FOOTER_H;

    // Forest green bar
    doc.setFillColor(...FOREST_GREEN);
    doc.rect(0, y, PAGE_W, FOOTER_H, 'F');

    // Encouraging quote
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(220, 220, 220);
    doc.text('"You built this from a place of strength. Use it when you need it."', PAGE_W / 2, y + 5.5, { align: 'center' });

    // Crisis info + website
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(180, 180, 180);
    doc.text('Crisis: 988  |  SAMHSA: 1-800-662-4357  |  wedorecover.org', PAGE_W / 2, y + 10, { align: 'center' });

    // Page number
    doc.setFontSize(6);
    doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y + 13, { align: 'right' });
}

// ---- Check if we need a page break ----
function checkPageBreak(doc, y, neededHeight, pageState) {
    const maxY = PAGE_H - FOOTER_H - 8;
    if (y + neededHeight > maxY) {
        pageState.count++;
        doc.addPage();
        // Beige background
        doc.setFillColor(...BEIGE);
        doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
        return MARGIN + 5; // reset Y position
    }
    return y;
}

// ---- Draw a single section ----
function drawSection(doc, section, items, startY, pageState) {
    if (!items || items.length === 0) return startY;

    const isContacts = section.key === 'supportNetwork';
    const isNumbered = section.key === 'emergencySteps';

    // Calculate needed height
    const headerHeight = 14;
    let itemsHeight = 0;

    if (isContacts) {
        itemsHeight = items.length * 7;
    } else {
        items.forEach(item => {
            const text = typeof item === 'string' ? item : (item.name || '');
            const lines = doc.splitTextToSize(text, CONTENT_W - 20);
            itemsHeight += lines.length * 5.5;
        });
    }

    const totalHeight = headerHeight + itemsHeight + 10; // 10 for padding

    // Check page break
    let y = checkPageBreak(doc, startY, Math.min(totalHeight, 40), pageState);

    const cardX = MARGIN;
    const cardW = CONTENT_W;
    const cardTop = y;

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...SAND);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardTop, cardW, totalHeight, 3, 3, 'FD');

    // Left accent bar
    doc.setFillColor(...section.color);
    doc.roundedRect(cardX, cardTop, 3, totalHeight, 1.5, 1.5, 'F');
    // Patch the right side of the accent bar (make it square on the right)
    doc.rect(cardX + 1.5, cardTop, 1.5, totalHeight, 'F');

    // Section icon circle
    const iconX = cardX + 10;
    const iconY = cardTop + 8;
    doc.setFillColor(...section.color);
    doc.circle(iconX, iconY, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    // Use first letter as icon placeholder
    const initial = section.title.replace('My ', '').charAt(0);
    doc.text(initial, iconX, iconY + 2, { align: 'center' });

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DEEP_BROWN);
    doc.text(section.title, iconX + 8, cardTop + 7);

    // Section description
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(section.desc, iconX + 8, cardTop + 12);

    // Items
    let itemY = cardTop + headerHeight + 2;
    const itemX = cardX + 12;

    items.forEach((item, idx) => {
        // Check page break for each item
        itemY = checkPageBreak(doc, itemY, 7, pageState);

        if (isContacts) {
            // Contact: name + phone
            const name = item.name || 'Contact';
            const phone = item.phone || '';

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...DEEP_BROWN);
            doc.text(name, itemX, itemY);

            if (phone) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...BURNT_ORANGE);
                doc.text(phone, cardX + cardW - 12, itemY, { align: 'right' });
            }
            itemY += 7;

        } else if (isNumbered) {
            // Numbered step
            const stepNum = String(idx + 1);

            // Number circle
            doc.setFillColor(...section.color);
            doc.circle(itemX + 1.5, itemY - 1.5, 3, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(stepNum, itemX + 1.5, itemY + 1, { align: 'center' });

            // Step text
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...DEEP_BROWN);
            const lines = doc.splitTextToSize(item, CONTENT_W - 28);
            doc.text(lines, itemX + 8, itemY);
            itemY += lines.length * 5;

        } else {
            // Bullet item
            doc.setFillColor(...section.color);
            doc.circle(itemX + 1, itemY - 1.5, 1, 'F');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...DEEP_BROWN);
            const lines = doc.splitTextToSize(item, CONTENT_W - 24);
            doc.text(lines, itemX + 5, itemY);
            itemY += lines.length * 5;
        }
    });

    // Return Y after the card + spacing
    return cardTop + totalHeight + 6;
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

    // Check if at least one section has data
    const hasData = PDF_SECTIONS.some(s => {
        const val = data[s.key];
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

        const pageState = { count: 1 };

        // Page 1 beige background
        doc.setFillColor(...BEIGE);
        doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

        // Header
        drawHeader(doc);

        // Title area
        let y = HEADER_H + 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...DEEP_BROWN);
        doc.text('My Safety Plan', PAGE_W / 2, y, { align: 'center' });

        y += 7;
        const userName = getUserDisplayName();
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(130, 130, 130);
        doc.text(`${userName}  —  ${dateStr}`, PAGE_W / 2, y, { align: 'center' });

        y += 10;

        // Draw each section
        PDF_SECTIONS.forEach(section => {
            const items = data[section.key];
            if (Array.isArray(items) && items.length > 0) {
                y = drawSection(doc, section, items, y, pageState);
            }
        });

        // Draw footers on all pages
        const totalPages = pageState.count;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            drawFooter(doc, i, totalPages);
        }

        // Save
        doc.save('My-Safety-Plan.pdf');

        if (typeof showToast === 'function') showToast('Safety plan downloaded! 📄');
    } catch (error) {
        console.error('PDF generation error:', error);
        if (typeof showToast === 'function') showToast('Could not generate PDF. Please check your connection.');
    }
};
