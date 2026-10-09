import { prisma } from './prisma'
// @ts-ignore — lob package has no types
import Lob from 'lob'

const lob = new Lob(process.env.LOB_API_KEY)

// The 2-hour edit window: notes wait in PENDING after sending, then this
// submits them to Lob for real printing and mailing.
export const EDIT_WINDOW_MS = 2 * 60 * 60 * 1000

export async function submitNoteToLob(noteId: string): Promise<void> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { sender: true, recipient: true },
  })
  if (!note || note.status !== 'PENDING') return

  const recipientAddress = await prisma.address.findUnique({ where: { userId: note.recipientId } })
  if (!recipientAddress) {
    console.error(`[submitNote] ${noteId}: recipient has no address`)
    await prisma.note.update({ where: { id: noteId }, data: { status: 'FAILED' } })
    return
  }
  const senderAddress = await prisma.address.findUnique({ where: { userId: note.senderId } })

  const toAddress: any = {
    name: note.recipient.displayName,
    address_line1: recipientAddress.encryptedLine1,
    address_city: recipientAddress.encryptedCity,
    address_state: recipientAddress.encryptedState,
    address_zip: recipientAddress.encryptedZip,
    address_country: recipientAddress.encryptedCountry ?? 'US',
  }
  if (recipientAddress.encryptedLine2) toAddress.address_line2 = recipientAddress.encryptedLine2

  const fromAddress: any = senderAddress ? {
    name: note.sender.displayName,
    address_line1: senderAddress.encryptedLine1,
    address_city: senderAddress.encryptedCity,
    address_state: senderAddress.encryptedState,
    address_zip: senderAddress.encryptedZip,
    address_country: senderAddress.encryptedCountry ?? 'US',
  } : {
    name: 'QuteNote',
    address_line1: '123 Main St',
    address_city: 'Austin',
    address_state: 'TX',
    address_zip: '78701',
    address_country: 'US',
  }
  if (senderAddress?.encryptedLine2) fromAddress.address_line2 = senderAddress.encryptedLine2

  const safeText = note.noteText.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Front of the card: the sender's photo full-bleed, or the chosen artist
  // artwork centered on its tint. Art files live on the public site.
  const SITE = process.env.WEB_URL ?? 'https://qutenote.com'
  const CARD_FRONTS: Record<string, { art: string; bg: string }> = {
    'lp-1': { art: 'flower', bg: '#EEE6FA' }, 'lp-2': { art: 'clover', bg: '#F2FBDA' }, 'lp-3': { art: 'heart-torn', bg: '#FBF8F4' },
    'tm-1': { art: 'waves', bg: '#FBF8F4' }, 'tm-2': { art: 'rainbow', bg: '#EEE6FA' }, 'tm-3': { art: 'finger', bg: '#F2FBDA' },
    'id-1': { art: 'coffee', bg: '#FBF8F4' }, 'id-2': { art: 'cake', bg: '#EEE6FA' }, 'id-3': { art: 'gift', bg: '#F2FBDA' },
    'km-1': { art: 'moon', bg: '#E4D9F7' }, 'km-2': { art: 'star-gold', bg: '#EEE6FA' }, 'km-3': { art: 'sun', bg: '#FBF8F4' },
    'ra-1': { art: 'envelope-heart', bg: '#EEE6FA' }, 'ra-2': { art: 'heart-lime', bg: '#FBF8F4' }, 'ra-3': { art: 'popper', bg: '#F2FBDA' },
    'design-1': { art: 'flower', bg: '#EEE6FA' }, 'design-2': { art: 'popper', bg: '#F2FBDA' }, 'design-3': { art: 'star-gold', bg: '#EEE6FA' },
  }
  const front = note.cardDesignId ? CARD_FRONTS[note.cardDesignId] : undefined
  const frontHtml = note.cardImageUrl
    ? `<html><body style="margin:0;width:6in;height:4in;"><img src="${note.cardImageUrl}" style="width:6in;height:4in;object-fit:cover;display:block;" /></body></html>`
    : front
      ? `<html><body style="margin:0;background:${front.bg};width:6in;height:4in;display:flex;align-items:center;justify-content:center;"><img src="${SITE}/site/${front.art}.png" style="width:2.6in;height:2.6in;object-fit:contain;" /></body></html>`
      : `<html><body style="margin:0;background:linear-gradient(135deg,#D9C9F1,#EEE6FA);width:6in;height:4in;display:flex;align-items:center;justify-content:center;"><p style="font-family:Georgia,serif;font-size:48px;color:#5A32D6;text-align:center;">💌</p></body></html>`
  const backHtml = `<html><body style="margin:0;padding:40px;font-family:Georgia,serif;width:6in;height:4in;background:#FBF8F4;"><p style="font-size:22px;color:#2B2238;line-height:1.6;font-style:italic;">${safeText}</p><p style="margin-top:20px;font-size:14px;color:#766E82;">With love, ${note.sender.displayName}</p></body></html>`

  try {
    const postcard = await lob.postcards.create({
      description: `QuteNote from ${note.sender.displayName}`,
      to: toAddress,
      from: fromAddress,
      front: frontHtml,
      back: backHtml,
      size: '6x4',
    })
    await prisma.note.update({ where: { id: note.id }, data: { status: 'SENT', lobNoteId: postcard.id } })
    console.log(`[submitNote] ${noteId} submitted to Lob as ${postcard.id}`)
  } catch (err: any) {
    console.error(`[submitNote] ${noteId} Lob error:`, err?.message ?? err)
  }
}

// Submit every note whose edit window has closed
export async function submitDueNotes(): Promise<void> {
  const due = await prisma.note.findMany({
    where: { status: 'PENDING', createdAt: { lte: new Date(Date.now() - EDIT_WINDOW_MS) } },
    select: { id: true },
    take: 25,
  })
  for (const n of due) await submitNoteToLob(n.id)
}
