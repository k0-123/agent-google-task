import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { matchState, batsman, bowler } = await req.json()
    const openAiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    const prompt = `Provide a 1-line tactical prediction hint for the next ball between bowler ${bowler || 'the bowler'} and batsman ${batsman || 'the batsman'} given the current match state (${JSON.stringify(matchState)}). Keep it under 15 words.`

    if (openAiKey && openAiKey !== 'your-openai-api-key') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'OpenAI API error')
      }

      const data = await response.json()
      const hint = data.choices[0]?.message?.content?.trim() || 'Look for a yorker aimed at the stumps.'
      return NextResponse.json({ hint })
    }

    if (geminiKey && geminiKey !== 'your-gemini-api-key') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (!response.ok) {
        throw new Error('Gemini API error')
      }

      const data = await response.json()
      const hint = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Look for a yorker aimed at the stumps.'
      return NextResponse.json({ hint })
    }

    return NextResponse.json({
      hint: 'Watch for a slower ball cutter outside off stump.'
    })
  } catch (err: any) {
    console.error('AI Hint Error:', err)
    return NextResponse.json({
      hint: 'Expect a tight delivery attacking the stumps.'
    })
  }
}
