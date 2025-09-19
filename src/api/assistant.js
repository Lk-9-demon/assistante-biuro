// api/assistant.js  (CommonJS, без ESM)
module.exports = async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
	if (req.method === 'OPTIONS') return res.status(200).end()

	try {
		const { message, threadId } = req.body || {}
		if (!message) return res.status(400).json({ error: 'Missing message' })

		const OPENAI_KEY = process.env.OPENAI_API_KEY
		const ASSISTANT_ID = process.env.ASSISTANT_ID
		if (!OPENAI_KEY || !ASSISTANT_ID) {
			return res.status(500).json({ error: 'Server not configured' })
		}

		// 1) створити thread (або взяти існуючий)
		let thread = threadId
		if (!thread) {
			const r = await fetch('https://api.openai.com/v1/threads', {
				method: 'POST',
				headers: { Authorization: `Bearer ${OPENAI_KEY}` },
			})
			const j = await r.json()
			thread = j.id
		}

		// 2) додати повідомлення користувача
		await fetch(`https://api.openai.com/v1/threads/${thread}/messages`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ role: 'user', content: message }),
		})

		// 3) запустити асистента
		const run = await fetch(
			`https://api.openai.com/v1/threads/${thread}/runs`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${OPENAI_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ assistant_id: ASSISTANT_ID }),
			}
		).then(r => r.json())

		// 4) чекати завершення
		for (let i = 0; i < 25; i++) {
			const st = await fetch(
				`https://api.openai.com/v1/threads/${thread}/runs/${run.id}`,
				{ headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
			).then(r => r.json())
			if (st.status === 'completed') break
			await new Promise(s => setTimeout(s, 700))
		}

		// 5) взяти останню відповідь
		const msgs = await fetch(
			`https://api.openai.com/v1/threads/${thread}/messages?order=desc&limit=1`,
			{ headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
		).then(r => r.json())

		const answer =
			(msgs &&
				msgs.data &&
				msgs.data[0] &&
				msgs.data[0].content &&
				msgs.data[0].content[0] &&
				msgs.data[0].content[0].text &&
				msgs.data[0].content[0].text.value) ||
			'Niestety, nie mam obecnie wystarczających informacji, aby dokładnie odpowiedzieć. Proszę skontaktować się z Biurem:\n- Telefon: +48 123 456 789\n- E-mail: kontakt@biurorachunkowe-skierniewice.pl\n- Formularz: https://biurorachunkowe-skierniewice.pl/kontakt'

		res.status(200).json({ answer, threadId: thread })
	} catch (e) {
		console.error(e)
		res.status(500).json({ error: 'Server error' })
	}
}
