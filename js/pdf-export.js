// ========== SAFETY PLAN PDF EXPORT ==========
// Generates a branded, print-friendly PDF of the user's safety plan
// Uses jsPDF (lazy-loaded from CDN on first use)

const PDF_SECTIONS = [
    { key: 'warningSigns',     title: 'My Warning Signs',       desc: 'Red flags that tell me I might be heading toward trouble', color: [212, 168, 83]  },
    { key: 'triggers',         title: 'My Triggers',            desc: 'People, places, things, and emotions that put me at risk', color: [191, 106, 58]  },
    { key: 'copingStrategies', title: 'My Coping Strategies',   desc: 'Healthy things I can do when urges hit',                   color: [74, 139, 94]   },
    { key: 'supportNetwork',   title: 'My Support Network',     desc: 'People I can reach out to',                                color: [91, 143, 191]  },
    { key: 'safePlaces',       title: 'My Safe Places',         desc: 'Physical spaces where I feel safe and supported',          color: [122, 159, 138] },
    { key: 'emergencySteps',   title: 'My Emergency Steps',     desc: 'Step-by-step actions for when I\'m in crisis',             color: [196, 90, 90]   },
    { key: 'reasonsToStay',    title: 'My Reasons to Stay',     desc: 'Why my recovery matters',                                  color: [201, 82, 122]  }
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
const MARGIN = 14;
const CONTENT_W = PAGE_W - (MARGIN * 2);
const HEADER_H = 26;
const FOOTER_H = 14;
const USABLE_BOTTOM = PAGE_H - FOOTER_H - 6;

// Spacing constants
const LINE_H = 4.2;       // line height for 9pt body text
const CONTACT_H = 5.5;    // line height for contact rows
const SECTION_PAD = 3;    // padding inside card (top/bottom)
const SECTION_GAP = 3.5;  // gap between cards
const HEADER_BLOCK = 11;  // section header + desc height

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

// ---- Measure a section's total height ----
function measureSection(doc, section, items) {
    const isContacts = section.key === 'supportNetwork';
    let itemsH = 0;
    if (isContacts) {
        itemsH = items.length * CONTACT_H;
    } else {
        items.forEach(item => {
            const text = typeof item === 'string' ? item : (item.name || '');
            const lines = doc.splitTextToSize(text, CONTENT_W - 22);
            itemsH += lines.length * LINE_H;
        });
    }
    return HEADER_BLOCK + itemsH + (SECTION_PAD * 2);
}

// ---- Add a new page with beige background ----
function addNewPage(doc, pageState) {
    pageState.count++;
    doc.addPage();
    doc.setFillColor(...BEIGE);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
    return MARGIN;
}

// ---- Draw branded header ----
function drawHeader(doc) {
    doc.setFillColor(...FOREST_GREEN);
    doc.rect(0, 0, PAGE_W, HEADER_H, 'F');

    // Burnt orange accent line
    doc.setDrawColor(...BURNT_ORANGE);
    doc.setLineWidth(0.6);
    doc.line(0, HEADER_H, PAGE_W, HEADER_H);

    // WDR circle monogram
    const cx = 17, cy = HEADER_H / 2;
    doc.setFillColor(...BURNT_ORANGE);
    doc.circle(cx, cy, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('WDR', cx, cy + 2.5, { align: 'center' });

    // Brand text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('WE DO RECOVER', PAGE_W / 2, 10, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('One Day at a Time', PAGE_W / 2, 15.5, { align: 'center' });

    // Crisis numbers
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(200, 200, 200);
    doc.text('Crisis Line: 988  |  SAMHSA: 1-800-662-4357', PAGE_W / 2, 21, { align: 'center' });
}

// ---- Draw footer ----
function drawFooter(doc, pageNum, totalPages) {
    const y = PAGE_H - FOOTER_H;

    doc.setFillColor(...FOREST_GREEN);
    doc.rect(0, y, PAGE_W, FOOTER_H, 'F');

    doc.setFont('times', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(210, 210, 210);
    doc.text('"You built this from a place of strength. Use it when you need it."', PAGE_W / 2, y + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(170, 170, 170);
    doc.text('Crisis: 988  |  SAMHSA: 1-800-662-4357  |  wedorecover.org', PAGE_W / 2, y + 9, { align: 'center' });

    doc.setFontSize(5.5);
    doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y + 12, { align: 'right' });
}

// ---- Draw a single section card ----
function drawSection(doc, section, items, startY, pageState) {
    if (!items || items.length === 0) return startY;

    const isContacts = section.key === 'supportNetwork';
    const isNumbered = section.key === 'emergencySteps';
    const cardH = measureSection(doc, section, items);
    const cardX = MARGIN;
    const cardW = CONTENT_W;

    // If entire card doesn't fit, move to next page
    let y = startY;
    if (y + cardH > USABLE_BOTTOM) {
        y = addNewPage(doc, pageState);
    }

    const cardTop = y;

    // Card background + border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...SAND);
    doc.setLineWidth(0.25);
    doc.roundedRect(cardX, cardTop, cardW, cardH, 2, 2, 'FD');

    // Left accent bar
    doc.setFillColor(...section.color);
    doc.rect(cardX, cardTop + 2, 2.5, cardH - 4, 'F');

    // Section icon circle
    const iconX = cardX + 9;
    const iconY = cardTop + SECTION_PAD + 4;
    doc.setFillColor(...section.color);
    doc.circle(iconX, iconY, 3.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    const initial = section.title.replace('My ', '').charAt(0);
    doc.text(initial, iconX, iconY + 2, { align: 'center' });

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...DEEP_BROWN);
    doc.text(section.title, iconX + 6.5, cardTop + SECTION_PAD + 3.5);

    // Section description
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(section.desc, iconX + 6.5, cardTop + SECTION_PAD + 8);

    // Items
    let itemY = cardTop + SECTION_PAD + HEADER_BLOCK + 1;
    const itemX = cardX + 10;

    items.forEach((item, idx) => {
        if (isContacts) {
            const name = item.name || 'Contact';
            const phone = item.phone || '';

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...DEEP_BROWN);
            doc.text(name, itemX, itemY);

            if (phone) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(...BURNT_ORANGE);
                doc.text(phone, cardX + cardW - 8, itemY, { align: 'right' });
            }
            itemY += CONTACT_H;

        } else if (isNumbered) {
            const stepNum = String(idx + 1);

            // Number circle
            doc.setFillColor(...section.color);
            doc.circle(itemX + 1.2, itemY - 1.2, 2.2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            doc.setTextColor(255, 255, 255);
            doc.text(stepNum, itemX + 1.2, itemY + 0.8, { align: 'center' });

            // Step text
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...DEEP_BROWN);
            const lines = doc.splitTextToSize(item, CONTENT_W - 26);
            doc.text(lines, itemX + 6, itemY);
            itemY += lines.length * LINE_H;

        } else {
            // Bullet dot
            doc.setFillColor(...section.color);
            doc.circle(itemX + 0.8, itemY - 1, 0.9, 'F');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...DEEP_BROWN);
            const lines = doc.splitTextToSize(item, CONTENT_W - 22);
            doc.text(lines, itemX + 4, itemY);
            itemY += lines.length * LINE_H;
        }
    });

    return cardTop + cardH + SECTION_GAP;
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
        let y = HEADER_H + 7;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...DEEP_BROWN);
        doc.text('My Safety Plan', PAGE_W / 2, y, { align: 'center' });

        y += 5;
        const userName = getUserDisplayName();
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(`${userName}  \u2014  ${dateStr}`, PAGE_W / 2, y, { align: 'center' });

        y += 6;

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

        doc.save('My-Safety-Plan.pdf');

        if (typeof showToast === 'function') showToast('Safety plan downloaded! \uD83D\uDCC4');
    } catch (error) {
        console.error('PDF generation error:', error);
        if (typeof showToast === 'function') showToast('Could not generate PDF. Please check your connection.');
    }
};
