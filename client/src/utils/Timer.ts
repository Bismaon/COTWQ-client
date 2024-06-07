// Timer.ts

/**
 * A class representing a timer.
 */
export class Timer {
	protected seconds: number;
	protected minutes: number;
	protected hours: number;
	protected timerElement: HTMLElement;
	protected intervalId: NodeJS.Timer | null;

	/**
	 * Creates an instance of Timer.
	 */
	constructor() {
		this.seconds = 0;
		this.minutes = 0;
		this.hours = 0;
		this.timerElement = document.getElementById("timer") as HTMLElement;
		this.intervalId = null;
	}

	/**
	 * Starts the timer interval.
	 */
	public start(): void {
		this.intervalId = setInterval(() => {
			this.seconds++;
			if (this.seconds >= 60) {
				this.seconds = 0;
				this.minutes++;
				if (this.minutes >= 60) {
					this.minutes = 0;
					this.hours++;
				}
			}
			this.updateDisplay();
		}, 1000);
	}

	/**
	 * Stops the timer interval.
	 */
	public stop(): void {
		if (this.intervalId !== null && this.intervalId !== undefined) {
			clearInterval(this.intervalId);
		}
	}

	/**
	 * Resets the timer to zero.
	 */
	public reset(): void {
		this.seconds = 0;
		this.minutes = 0;
		this.hours = 0;
		this.updateDisplay();
	}

	/**
	 * Updates the timer display element with the current time.
	 */
	public updateDisplay(): void {
		const displayHours: string | number = this.hours < 10 ? "0" + this.hours : this.hours;
		const displayMinutes: string | number = this.minutes < 10 ? "0" + this.minutes : this.minutes;
		const displaySeconds: string | number = this.seconds < 10 ? "0" + this.seconds : this.seconds;
		this.timerElement.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}`;
	}

	/**
	 * Returns the timer as a string in the format "hours:minutes:seconds".
	 * @returns The timer as a string.
	 */
	public toString(): string {
		return `${this.hours}:${this.minutes}:${this.seconds}`;
	}

	/**
	 * Returns the timer as a number (hours * 10000 + minutes * 100 + seconds).
	 * @returns The timer as a number.
	 */
	public toNumber(): number {
		return this.hours * 10000 + this.minutes * 100 + this.seconds;
	}
}
