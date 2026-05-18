import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { matchState } = await req.json()
    const openAiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    const prompt = `Generate a smart fan poll question based on the current cricket match state (${JSON.stringify(matchState)}). Return ONLY a JSON object with exactly two keys: 'question' (string) and 'options' (array of 3 strings). Example: {"question": "Will India cross 200?", "options": ["Yes, easily", "No, wickets will fall", "It will be a close finish"]}`

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
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'OpenAI API error')
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content?.trim()
      const poll = JSON.parse(content)
      return NextResponse.json({ poll })
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '')
      const poll = JSON.parse(cleanText)
      return NextResponse.json({ poll })
    }

    return NextResponse.json({
      poll: {
        question: 'Who will win the match from this situation?',
        options: ['Batting Team', 'Bowling Team', 'Super Over match!']
      }
    })
  } catch (err: any) {
    console.error('AI Poll Error:', err)
    return NextResponse.json({
      poll: {
        question: 'Which bowler will take the next wicket?',
        options: ['Pace Bowler', 'Spin Bowler', 'No wickets this over']
      }
    })
  }
}
