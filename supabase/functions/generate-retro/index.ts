import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') || 'https://flow-sensei-khaki.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '300',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { columns, cards } = await req.json()

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not configured in Edge Function secrets')
    }

    // Build a minimized board mapping: just card titles and their column statuses
    const columnMap = new Map(
      (columns || []).map((c: any) => [c.id, c.name])
    )

    const cardSummaries = (cards || [])
      .map((c: any) => `- "${c.title}" → ${columnMap.get(c.column_id) || 'Unknown'}`)
      .join('\n')

    const columnOrder = (columns || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((c: any) => c.name)
      .join(' → ')

const prompt = `You are an expert Agile Coach and Scrum Master. Analyze the following Kanban board snapshot and generate a weekly retrospective.

Board structure (left to right = workflow progression):
${columnOrder}

Cards (title → current column):
${cardSummaries}

Please produce a Markdown retrospective with exactly three sections. You MUST use '###' for headers and standard markdown bullet points ('- ').

### What went well 👍
- Identify strengths, good flow patterns, and completed work. Reference specific card titles where possible.

### What got stuck 🚧
- Identify bottlenecks, blockers, and items that lingered too long in a column. Reference specific card titles where possible.

### Actionable Suggestion for Next Week 💡
- Give ONE specific, practical, and actionable improvement the team can implement immediately.

Be concise and direct. DO NOT output any introductory or concluding paragraphs. Your entire response must ONLY be the three Markdown headers and their corresponding bullet points.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      const errorMessage = errorBody.error?.message || `Groq API returned status ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const reportContent = data.choices?.[0]?.message?.content?.trim()

    if (!reportContent) {
      throw new Error('Groq API returned an empty response')
    }

    return new Response(
      JSON.stringify({ content: reportContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Retro generation error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})