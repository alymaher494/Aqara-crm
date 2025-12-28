/**
 * ElevateAPI WhatsApp Integration
 * Provides helper functions to send WhatsApp messages via ElevateAPI
 */

interface SendMessageResponse {
    success: boolean
    messageId?: string
    error?: string
}

interface MessagePayload {
    to: string
    body: string
    type?: 'text' | 'template' | 'media'
}

/**
 * Sanitizes phone numbers by removing spaces, dashes, and other characters
 * Ensures the number starts with country code
 */
export function sanitizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '')

    // If starts with 0, assume Egypt and replace with +20
    if (cleaned.startsWith('0')) {
        cleaned = '+20' + cleaned.substring(1)
    }

    // If doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
        // If starts with 20 (Egypt code), add +
        if (cleaned.startsWith('20')) {
            cleaned = '+' + cleaned
        } else {
            // Assume Egypt by default
            cleaned = '+20' + cleaned
        }
    }

    return cleaned
}

/**
 * Sends a WhatsApp message via ElevateAPI
 */
export async function sendWhatsAppMessage(
    to: string,
    body: string
): Promise<SendMessageResponse> {
    const apiUrl = process.env.ELEVATE_API_URL
    const apiKey = process.env.ELEVATE_API_KEY

    if (!apiUrl || !apiKey) {
        console.error('ElevateAPI credentials not configured')
        return {
            success: false,
            error: 'WhatsApp API not configured. Please set ELEVATE_API_URL and ELEVATE_API_KEY.'
        }
    }

    // Sanitize the phone number
    const sanitizedPhone = sanitizePhoneNumber(to)

    try {
        const response = await fetch(`${apiUrl}/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
            },
            body: JSON.stringify({
                to: sanitizedPhone,
                type: 'text',
                text: {
                    body: body
                }
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('ElevateAPI Error:', data)
            return {
                success: false,
                error: data.message || data.error || `HTTP ${response.status}`
            }
        }

        return {
            success: true,
            messageId: data.messageId || data.id
        }
    } catch (error) {
        console.error('ElevateAPI Network Error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        }
    }
}

/**
 * Sends a WhatsApp template message (for approved templates)
 */
export async function sendWhatsAppTemplate(
    to: string,
    templateName: string,
    parameters?: Record<string, string>
): Promise<SendMessageResponse> {
    const apiUrl = process.env.ELEVATE_API_URL
    const apiKey = process.env.ELEVATE_API_KEY

    if (!apiUrl || !apiKey) {
        return {
            success: false,
            error: 'WhatsApp API not configured'
        }
    }

    const sanitizedPhone = sanitizePhoneNumber(to)

    try {
        const response = await fetch(`${apiUrl}/messages/send-template`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
            },
            body: JSON.stringify({
                to: sanitizedPhone,
                template: {
                    name: templateName,
                    language: { code: 'en' },
                    components: parameters ? [
                        {
                            type: 'body',
                            parameters: Object.values(parameters).map(value => ({
                                type: 'text',
                                text: value
                            }))
                        }
                    ] : []
                }
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            return {
                success: false,
                error: data.message || `HTTP ${response.status}`
            }
        }

        return {
            success: true,
            messageId: data.messageId || data.id
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        }
    }
}

/**
 * Bulk send messages to multiple recipients
 * Returns summary of successful/failed sends
 */
export async function sendBulkWhatsAppMessages(
    recipients: { phone: string; message: string }[]
): Promise<{
    total: number
    successful: number
    failed: number
    results: { phone: string; success: boolean; error?: string }[]
}> {
    const results: { phone: string; success: boolean; error?: string }[] = []

    for (const recipient of recipients) {
        const result = await sendWhatsAppMessage(recipient.phone, recipient.message)
        results.push({
            phone: recipient.phone,
            success: result.success,
            error: result.error
        })

        // Add small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    return {
        total: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    }
}
