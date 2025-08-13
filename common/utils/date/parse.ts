export function parseHHMMSSToSecondOffset(timeString: string): number {
  const parts = timeString.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid time format. Expected HH:MM:SS');
  }
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid time format. All parts must be numbers');
  }
  
  if (hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error('Invalid time values');
  }
  
  return hours * 3600 + minutes * 60 + seconds;
}
