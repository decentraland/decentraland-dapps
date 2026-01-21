export function fromMillisecondsToSeconds(timeInMilliseconds: number): number {
  return Math.floor(timeInMilliseconds / 1000)
}

export function sleep(delay: number) {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}
