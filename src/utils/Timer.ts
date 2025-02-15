// Timer.ts

/**
 * A class representing a timer.
 */
export class Timer {
	protected _seconds: number;
	protected _minutes: number;
	protected _hours: number;
	protected _timerElement: HTMLElement | undefined;
	protected _intervalId: NodeJS.Timeout | null;
	protected _isStopped: boolean;

	/**
	 * Creates an instance of Timer.
	 */
	constructor() {
		this._seconds = 0;
		this._minutes = 0;
		this._hours = 0;
		this._intervalId = null;
		this._isStopped = true;
		this._setElement = false;
	}

	protected _setElement: boolean;

	public get setElement(): boolean {
		return this._setElement;
	}

	public set setElement(value: boolean) {
		this._setElement = value;
	}

	public setTimerElement(timerDiv: HTMLElement): void {
		this._timerElement = timerDiv;
		this._setElement = true;
	}

	/**
	 * Starts the timer interval.
	 */
	public start(): void {
		this._intervalId = setInterval(() => {
			this._seconds++;
			if (this._seconds >= 60) {
				this._seconds = 0;
				this._minutes++;
				if (this._minutes >= 60) {
					this._minutes = 0;
					this._hours++;
				}
			}
			this.updateDisplay();
		}, 1000);
		this._isStopped = false;
	}

	/**
	 * Stops the timer interval.
	 */
	public stop(): void {
		if (this._intervalId !== null) {
			clearInterval(this._intervalId);
			this._intervalId = null; // Set intervalId to null after clearing the interval
		} else {
			this.start();
			this.stop();
			this.reset();
		}
		this._isStopped = true;
	}

	/**
	 * Resets the timer to zero.
	 */
	public reset(): void {
		this._seconds = 0;
		this._minutes = 0;
		this._hours = 0;
		this.updateDisplay();
		this._isStopped = true;
	}

	/**
	 * Updates the timer display element with the current time.
	 */
	public updateDisplay(): void {
		const displayHours: string | number =
			this._hours < 10 ? "0" + this._hours : this._hours;
		const displayMinutes: string | number =
			this._minutes < 10 ? "0" + this._minutes : this._minutes;
		const displaySeconds: string | number =
			this._seconds < 10 ? "0" + this._seconds : this._seconds;
		if (this._timerElement)
			this._timerElement.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}`;
	}

	/**
	 * Returns the timer as a string in the format "hours:minutes:seconds".
	 * @returns The timer as a string.
	 */
	public toString(): string {
		let hours: string;
		let minutes: string;
		let seconds: string = String(this._seconds);
		if (this._hours === 0) {
			hours = "";
		} else if (this._hours < 10) {
			hours = `0${this._hours}:`;
		} else {
			hours = `${this._hours}:`;
		}
		if (this._minutes === 0) {
			minutes = "";
		} else if (this._minutes < 10) {
			minutes = `0${this._minutes}:`;
		} else {
			minutes = `${this._minutes}:`;
		}
		if (this._seconds < 10) {
			seconds = `0${this._seconds}`;
		}
		return hours + minutes + seconds;
	}

	/**
	 * Returns the timer as a number (hours * 10000 + minutes * 100 + seconds).
	 * @returns The timer as a number.
	 */
	public toNumber(): number {
		return this._hours * 10000 + this._minutes * 100 + this._seconds;
	}

	public toStore(): string {
		let hours: string,
			minutes: string,
			seconds: string = String(this._seconds);
		if (this._hours < 10) {
			hours = `0${this._hours}`;
		} else {
			hours = `${this._hours}`;
		}
		if (this._minutes < 10) {
			minutes = `0${this._minutes}`;
		} else {
			minutes = `${this._minutes}`;
		}
		if (this._seconds < 10) {
			seconds = `0${this._seconds}`;
		}
		return hours + minutes + seconds;
	}
}
