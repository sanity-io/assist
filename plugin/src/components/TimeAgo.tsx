import {formatDistanceToNow} from 'date-fns'
import {useEffect, useReducer} from 'react'

function useInterval(ms: number) {
  const [tick, update] = useReducer((n) => n + 1, 0)

  useEffect(() => {
    const i = setInterval(update, ms)
    return () => clearInterval(i)
  }, [ms])
  return tick
}

export function TimeAgo({date}: {date?: string}) {
  useInterval(1000)
  const timeSince = formatDistanceToNow(date ? new Date(date) : new Date())
  return <span title={timeSince}>{timeSince} ago</span>
}
