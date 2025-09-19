'use client'
import { useEffect } from 'react'

export default function Home() {
	// useEffect(() => {
	// 	const sendMessage = async () => {
	// 		try {
	// 			const res = await fetch('/api/assistant', {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({ message: 'podaj mi numer do biura' }),
	// 			})

	// 			if (!res.ok) {
	// 				console.error('Server error:', res.status)
	// 				return
	// 			}

	// 			const data = await res.json()
	// 			console.log('Server response:', data)
	// 		} catch (err) {
	// 			console.error('Fetch error:', err)
	// 		}
	// 	}

	// 	sendMessage()
	// }, [])
	return (
		<>
			<div></div>
		</>
	)
}
