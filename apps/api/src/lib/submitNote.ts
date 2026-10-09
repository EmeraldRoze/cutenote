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
  const frontHtml = `<html><body style="margin:0;background:linear-gradient(135deg,#D9C9F1,#EEE6FA);width:6in;height:4in;display:flex;align-items:center;justify-content:center;"><p style="font-family:Georgia,serif;font-size:48px;color:#5A32D6;text-align:center;">💌</p></body></html>`
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
