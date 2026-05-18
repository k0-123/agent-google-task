import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { matchState, last6Balls } = await req.json()
    const openAiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    const prompt = `Act as an expert cricket commentator like Harsha Bhogle. Analyze the last 6 balls (${JSON.stringify(last6Balls)}) and current match state (${JSON.stringify(matchState)}). Provide a 2-sentence dramatic summary.`

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
      const commentary = data.choices[0]?.message?.content?.trim() || 'What an over! The momentum continues to shift in this high-octane encounter.'
      return NextResponse.json({ commentary })
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
      const commentary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'What an over! The momentum continues to shift in this high-octane encounter.'
      return NextResponse.json({ commentary })
    }

    return NextResponse.json({
      commentary: 'What an over! The momentum continues to shift in this high-octane encounter as the bowlers tighten their grip.'
    })
  } catch (err: any) {
    console.error('AI Analysis Error:', err)
    return NextResponse.json({
      commentary: 'What a thrilling phase of the match! Every delivery is proving crucial in determining the final outcome.'
    })
  }
}
