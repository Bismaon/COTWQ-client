// Timer.ts

/**
 * A class representing a timer.
 */
export class Timer {
	protected seconds: number;
	protected minutes: number;
	protected hours: number;
	protected timerElement: HTMLElement;
	protected intervalId: NodeJS.Timeout | null;
	protected isStopped: boolean;

	/**
	 * Creates an instance of Timer.
	 */
	constructor() {
		this.seconds = 0;
		this.minutes = 0;
		this.hours = 0;
		this.timerElement = document.getElementById("timer") as HTMLElement;
		this.intervalId = null;
		this.isStopped = true;
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
		this.isStopped = false;
	}

	/**
	 * Stops the timer interval.
	 */
	public stop(): void {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null; // Set intervalId to null after clearing the interval
		} else {
			this.start();
			this.stop();
			this.reset();
		}
		this.isStopped = true;
	}

	/**
	 * Resets the timer to zero.
	 */
	public reset(): void {
		this.seconds = 0;
		this.minutes = 0;
		this.hours = 0;
		this.updateDisplay();
		this.isStopped = true;
	}

	/**
	 * Updates the timer display element with the current time.
	 */
	public updateDisplay(): void {
		const displayHours: string | number =
			this.hours < 10 ? "0" + this.hours : this.hours;
		const displayMinutes: string | number =
			this.minutes < 10 ? "0" + this.minutes : this.minutes;
		const displaySeconds: string | number =
			this.seconds < 10 ? "0" + this.seconds : this.seconds;
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
