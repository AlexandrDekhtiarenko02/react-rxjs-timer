import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Observable, takeUntil, Subject, debounceTime, map, filter, buffer, fromEvent } from 'rxjs'
import './timerStyles.scss'

export const MyTimer = () => {
	const [time, setTime] = useState(0)
	const [timerStatus, setTimerStatus] = useState('stop')
	const waitButtonRef = useRef()
	const waitAction$ = useMemo(() => new Subject())

	const start = useCallback(() => setTimerStatus('start'), [])
	const reset = useCallback(() => setTime(0), [])
	const stop = useCallback(() => {
		setTimerStatus('stop')
		setTime(0)
	}, [])
	const wait = useCallback(() => {
		waitAction$.next('click')
		waitAction$.next('click')
	}, [])

	useEffect(() => {
		const waitButtonEvent$ = fromEvent(waitButtonRef.current, 'click')
		const timer$ = new Observable(observer => {
			let oneSecond = 1000
			const timerId = setInterval(() => {
				if (timerStatus === 'start') {
					observer.next(oneSecond)
				}
			}, 1000)
			return () => {
				clearInterval(timerId)
			}
		})
		const doubleClick$ = waitButtonEvent$.pipe(
			buffer(waitButtonEvent$.pipe(debounceTime(300))),
			map(clicks => clicks.length),
			filter(clicksLength => clicksLength >= 2)
		)
		doubleClick$.subscribe(_ => {
			setTimerStatus('stop')
		})
		const unsubscrision$ = timer$.pipe(takeUntil(waitAction$)).subscribe(val => {
			setTime(prev => prev + val)
		})
		return () => {
			unsubscrision$.unsubscribe()
		}
	}, [timerStatus])

	return (
		<div className='timer'>
			<h1 className='timer-title'>React RxJs Timer</h1>
			<span className='timer-time-label'>{new Date(time).toISOString().slice(11, 19)}</span>
			<div className='timer-actions'>
				<button onClick={start}>start</button>
				<button onClick={stop}>stop</button>
				<button onClick={reset}>reset</button>
				<button ref={waitButtonRef} onClick={wait}>
					wait
				</button>
			</div>
		</div>
	)
}
