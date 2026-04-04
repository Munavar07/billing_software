import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib'
import { getInvoice } from './fs-db'

const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

function inWords(numValue: number): string {
    let numStr = Math.floor(numValue).toString().replace(/[\, ]/g, '');
    let n = ("000000000" + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    var str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'CRORE ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'LAKH ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'THOUSAND ' : '';
    str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'HUNDRED ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
    return str.trim() === '' ? 'ZERO' : str.trim();
}

function formatAmountToWords(amount: number): string {
    const dhs = Math.floor(amount);
    const fils = Math.round((amount - dhs) * 100);
    const dhsWords = inWords(dhs);
    const filsWords = inWords(fils);

    if (fils === 0) return `${dhsWords} DHS AND ZERO FILS`;
    return `${dhsWords} DHS AND ${filsWords} FILS`;
}

export async function generateInvoicePdf(id: string): Promise<Uint8Array | null> {
    const invoice = await getInvoice(id)
    if (!invoice) return null


    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 portrait
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()

    const drawText = (text: string, x: number, y: number, size: number, f: PDFFont, color = rgb(0, 0, 0)) => {
        page.drawText(text, { x, y, size, font: f, color })
    }

    // --- Header Left: Company Info ---
    let yLeft = height - 160 // giving space for the logo area
    drawText('BIZNET BUSINESSMEN SERVICES', 40, yLeft, 14, fontBold)
    const companyAddress = [
        'AL AIN, SANAYIA, UAE',
        'Tel: 037343124, 037343116',
        'Mob: 0502506244',
        'Email: najamalthuraya207@gmail.com'
    ]
    yLeft -= 15
    companyAddress.forEach(line => {
        let isBoldLine = line.startsWith('Tel:') || line.startsWith('Mob:') || line.startsWith('Email:')
        if (isBoldLine) {
            const splitIndex = line.indexOf(': ') + 2
            const label = line.substring(0, splitIndex)
            const val = line.substring(splitIndex)
            drawText(label, 40, yLeft, 10, fontBold)
            const labelWidth = fontBold.widthOfTextAtSize(label, 10)
            drawText(val, 40 + labelWidth, yLeft, 10, font)
        } else {
            drawText(line, 40, yLeft, 10, font)
        }
        yLeft -= 14
    })

    // --- Header Right: INVOICE title ---
    const rightMargin = width - 40
    const titleText = 'INVOICE'
    const titleWidth = fontBold.widthOfTextAtSize(titleText, 24)
    drawText(titleText, rightMargin - titleWidth, height - 70, 24, fontBold)

    // Invoice Meta
    let yRight = height - 120
    const metaLines = [
        { label: 'Invoice #:', value: invoice.invoice_number },
        { label: 'Generated on:', value: new Date(invoice.created_at || invoice.date).toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) },
        { label: 'Created By:', value: 'Admin' }
    ]

    metaLines.forEach(line => {
        const valWidth = font.widthOfTextAtSize(line.value, 10)
        const labelText = `${line.label} `
        const labelWidth = fontBold.widthOfTextAtSize(labelText, 10)
        drawText(line.value, rightMargin - valWidth, yRight, 10, font)
        drawText(labelText, rightMargin - valWidth - labelWidth, yRight, 10, fontBold)
        yRight -= 14
    })

    yRight -= 10 // Space before billing info

    // Billing Info (Right Aligned in block)
    const billingTitle = 'Billing to'
    const billingWidth = fontBold.widthOfTextAtSize(billingTitle, 10)
    drawText(billingTitle, rightMargin - billingWidth, yRight, 10, fontBold)
    yRight -= 15

    const clientNameStr = invoice.client_name.toUpperCase()
    const clientNameWidth = fontBold.widthOfTextAtSize(clientNameStr, 12)
    drawText(clientNameStr, rightMargin - clientNameWidth, yRight, 12, fontBold)
    yRight -= 14

    // Contact No / Email if applicable 
    // We do not have them in DB directly so we will put placeholders that user can fill or remove. 
    // If not, we omit. For now, matching image exactly with empty Email and hardcoded contact.
    // Let's just draw the labels.
    const contactLine = 'Contact No: '
    // if client name has numbers, maybe extract? No, let's leave blank since we have no DB column.
    const cWidth = fontBold.widthOfTextAtSize(contactLine, 10)
    drawText(contactLine, rightMargin - cWidth, yRight, 10, fontBold)
    yRight -= 14
    const emailLine = 'Email: '
    const emWidth = fontBold.widthOfTextAtSize(emailLine, 10)
    drawText(emailLine, rightMargin - emWidth, yRight, 10, fontBold)

    // --- Table ---
    let yTable = height - 340

    // Table Header Background
    page.drawRectangle({
        x: 40,
        y: yTable,
        width: width - 80,
        height: 25,
        color: rgb(0.92, 0.92, 0.92)
    })

    const tY = yTable + 8
    drawText('#', 45, tY, 10, font)
    drawText('Service', 70, tY, 10, font)
    drawText('Description', 200, tY, 10, font)
    drawText('Qty', 380, tY, 10, font)
    drawText('Fees (AED)', 440, tY, 10, font)
    drawText('Total (AED)', 505, tY, 10, font)

    let yRow = yTable - 20

    // Rows
    const drawRow = (idx: number, service: string, desc: string, rate: number) => {
        drawText(idx.toString(), 45, yRow + 5, 10, font)
        drawText(service, 70, yRow + 5, 10, font) // No arabic translation for now to avoid font issues, keep it generic.
        drawText(desc, 200, yRow + 5, 10, font)
        drawText('1', 380, yRow + 5, 10, font)
        drawText(rate.toFixed(2), 440, yRow + 5, 10, font)
        drawText(rate.toFixed(2), 510, yRow + 5, 10, font)

        // Horizontal line separator
        page.drawLine({
            start: { x: 40, y: yRow },
            end: { x: width - 40, y: yRow },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8)
        })

        yRow -= 20
    }

    let lineIndex = 1
    const serviceTitle = 'Professional Services'
    const serviceDesc = invoice.invoice_description || `Services - ${invoice.client_name}`
    drawRow(lineIndex++, serviceTitle, serviceDesc, invoice.amount)

    // Totals Background Lines
    // Add gray background to totals lines
    page.drawRectangle({
        x: 40,
        y: yRow - 20,
        width: width - 80,
        height: 25,
        color: rgb(0.95, 0.95, 0.95)
    })

    drawText('Total', 250, yRow - 20 + 8, 10, font)
    drawText((lineIndex - 1).toString(), 380, yRow - 20 + 8, 10, font)
    drawText(invoice.amount.toFixed(2), 440, yRow - 20 + 8, 10, font)
    drawText(invoice.amount.toFixed(2), 510, yRow - 20 + 8, 10, fontBold)
    yRow -= 45 // move down past the total background

    // Grand Total
    const labelX = 400
    const valueX = 510

    drawText('Grand Total (AED)', labelX - 20, yRow, 10, fontBold)
    drawText(invoice.amount.toFixed(2), valueX, yRow, 10, fontBold)
    yRow -= 20

    page.drawLine({ start: { x: 40, y: yRow + 10 }, end: { x: width - 40, y: yRow + 10 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) })

    drawText('Paid (AED)', labelX - 20, yRow, 10, font)
    drawText(invoice.paid.toFixed(2), valueX, yRow, 10, font)
    yRow -= 20

    page.drawLine({ start: { x: 40, y: yRow + 10 }, end: { x: width - 40, y: yRow + 10 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) })

    drawText('Amount Due (AED)', labelX - 20, yRow, 10, font)
    drawText(invoice.amount_due.toFixed(2), valueX, yRow, 10, font)
    yRow -= 20

    // Amount in words
    page.drawRectangle({
        x: 40,
        y: yRow - 5,
        width: width - 80,
        height: 20,
        color: rgb(0.92, 0.92, 0.92)
    })
    drawText('In Words:', 45, yRow, 10, font)
    drawText(formatAmountToWords(invoice.amount), 150, yRow, 10, fontBold)

    // Bottom Line / Footer
    page.drawLine({ start: { x: 40, y: 100 }, end: { x: width - 40, y: 100 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) })

    // Optional Space for QR could be here around x: width - 90, y: 40, but since user said no QR, we leave it blank.

    // Draw Inv number at bottom right
    const footerNumStr = invoice.invoice_number
    const footerNumWidth = font.widthOfTextAtSize(footerNumStr, 8)
    drawText(footerNumStr, width - 40 - footerNumWidth, 80, 8, font)

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
}
