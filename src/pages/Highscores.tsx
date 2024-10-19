import React, { useEffect, useState } from "react";
import "../stylesheet/Quiz.css";
import "../stylesheet/style.css";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useNavigate } from "react-router-dom";

export interface UserBest extends Highscore {
	username: number;
	game_name: string;
}

export interface Highscore {
	game_id: number;
	score: string;
}
const Highscores = (): JSX.Element => {
	const navigate: NavigateFunction = useNavigate();
	const { t } = useTranslation();
	const [error, setError] = useState<string>("");

	// State to hold the highscores
	const [highscores, setHighscores] = useState<UserBest[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	// Dummy data for demonstration
	const region = "all_regions"; // You would get this from props or state
	const type = "classic"; // You would get this from props or state
	const hard = "true"; // You would get this from props or state
	const gameType = "names"; // You would get this from props or state

	const title = `${region}-${type}-${hard}-${gameType}`
		.replace(/_/g, " ")
		.toUpperCase();

	async function getGameID(game_name: string): Promise<number | null> {
		console.log("Game name: ", game_name);
		try {
			const response: Response = await fetch("/games/get-game_id", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ game_name }),
			});
			if (response.ok) {
				const data = await response.json();
				console.log("Full response data:", data); // Log the full response
				return data.gameID; // This should return the correct ID
			} else {
				const errorText: string = await response.text();
				console.error(`Failed to get game id: ${errorText}`);
				return null;
			}
		} catch (error) {
			console.error("Error getting game id:  ", error);
			return null;
		}
	}

	async function getHighscoresFromGameName(
		game_name: string
	): Promise<UserBest[] | null> {
		const game_id: any | null = await getGameID(game_name);
		if (!game_id) {
			console.error("An error occurred when getting game_id.");
			return null;
		}
		console.log("Game ID: ", game_id);
		const highscores: UserBest[] | null =
			await getHighscoresFromGameID(game_id);
		console.log("Highscores: ", highscores);
		if (!highscores) {
			console.error("An error occurred when getting highscores");
			return null;
		}
		return highscores;
	}
	async function getHighscoresFromGameID(
		game_id: number
	): Promise<UserBest[] | null> {
		try {
			const response: Response = await fetch(
				"/highscores/get-highscores",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ game_id }),
				}
			);

			if (response.ok) {
				const data = await response.json();
				return data.highscoreDB; // Access highscoreDB correctly
			} else {
				const errorText: string = await response.text();
				console.error(
					`Failed to get highscore from game id: ${errorText}`
				);
				return null;
			}
		} catch (error) {
			console.error("Error getting highscores from game id:", error);
			return null;
		}
	}

	async function getGameNames(): Promise<{ game_name: string }[] | null> {
		try {
			const response: Response = await fetch("/games/get-game_names", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const { game_names } = await response.json();
				return game_names;
			} else {
				const errorText: string = await response.text();
				setError(`Failed to get game names: ${errorText}`);
				return null;
			}
		} catch (error) {
			console.error("Failed to get game names:", error);
			setError("An error occurred when getting game_names.");
			return null;
		}
	}
	useEffect(() => {
		if (highscores.length !== 0) {
			return;
		}
		// Function to fetch highscores
		const fetchHighscores = async () => {
			const game_names: { game_name: string }[] | null =
				await getGameNames();
			if (!game_names) {
				return;
			}
			let allHighscores: UserBest[] = [];
			for (let i = 0; i < game_names.length; i++) {
				const game_name = game_names[i].game_name;
				console.log("Game name: ", game_name);
				const response: UserBest[] | null =
					await getHighscoresFromGameName(game_name);
				if (!response) {
					console.warn("Nothing here *sus* ", game_name);
					continue;
				}
				allHighscores = [...allHighscores, ...response];
			}
			setHighscores(allHighscores);
			setTotalPages(Math.ceil(allHighscores.length / 10));
			console.log(allHighscores);
		};

		fetchHighscores().then((r) => console.debug("Done"));
	}, [currentPage, highscores.length]);

	function formatTime(time: string): string {
		let hoursStr: string, minutesStr: string, secondsStr: string;
		const hours: number = Number(time.slice(0, 2));
		if (hours === 0) {
			hoursStr = "";
		} else {
			hoursStr = `${hours}h `;
		}
		const minutes: number = Number(time.slice(2, 4));
		if (minutes === 0) {
			minutesStr = "";
		} else if (minutes < 10 && hours !== 0) {
			minutesStr = `0${minutes}min `;
		} else {
			minutesStr = `${minutes}min `;
		}
		const seconds: number = Number(time.slice(4, 6));
		if (seconds === 0) {
			secondsStr = "";
		} else if (seconds < 10 && minutes !== 0) {
			secondsStr = `0${seconds}sec`;
		} else {
			secondsStr = `${seconds}sec `;
		}
		console.log("base: ", time);
		console.log("str: ", hoursStr + minutesStr + secondsStr);
		return hoursStr + minutesStr + secondsStr;
	}

	const handleNext = () => {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevious = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	// Calculate start and end index for slicing the highscores
	const startIndex = currentPage * 10;
	const endIndex = startIndex + 10;
	const currentHighscores = highscores.slice(startIndex, endIndex);

	return (
		<>
			<div className="grid-item" id="title">
				<h1>{t("title")}</h1>
			</div>
			<div className="grid-item" id="back">
				<i
					className={`fa-solid fa-arrow-left $"grid-item"`}
					onClick={() => navigate(-1)}
				></i>
			</div>
			<div className="grid-item highscores-container">
				<h2>{title}</h2>
				<div className="navigation-arrows">
					<button
						onClick={handlePrevious}
						disabled={currentPage === 0}
					>
						&lt;
					</button>
					<button
						onClick={handleNext}
						disabled={currentPage === totalPages - 1}
					>
						&gt;
					</button>
				</div>
				<table className="highscores-table">
					<thead>
						<tr>
							<th>{t("Rank")}</th>
							<th>{t("User Name")}</th>
							<th>{t("Score")}</th>
						</tr>
					</thead>
					<tbody>
						{currentHighscores.map((user: UserBest, index) => (
							<tr key={index}>
								<td>{startIndex + index + 1}</td>
								<td>{user.username}</td>
								<td>{formatTime(user.score)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default Highscores;
