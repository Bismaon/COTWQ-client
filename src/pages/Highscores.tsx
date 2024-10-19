import React, { useEffect, useState } from "react";
import "../stylesheet/Quiz.css";
import "../stylesheet/style.css";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { formatGameName, formatTime } from "../utils/utilities";

export interface UserBest extends Highscore {
	username: string;
	game_name: string;
}

export interface Highscore {
	game_id: number;
	score: string;
}

const Highscores = (): JSX.Element => {
	const navigate: NavigateFunction = useNavigate();
	const { t } = useTranslation();

	const [title, setTitle] = useState<string>(""); // Initialize title as a state
	const [error, setError] = useState<string>("");
	const [highscores, setHighscores] = useState<UserBest[]>([]);
	const [currentGameIndex, setCurrentGameIndex] = useState(0);
	const [gameNames, setGameNames] = useState<string[]>([]);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);
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
		console.log("highscores: ", highscores);
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
				console.error(errorText);
				setError(`Failed to get game names: ${errorText}`);
				return null;
			}
		} catch (error) {
			console.error("Failed to get game names:", error);
			setError("An error occurred when getting game_names.");
			return null;
		}
	}

	// Fetch game names once on mount
	useEffect((): void => {
		const fetchGameNames = async () => {
			const gameNamesList: { game_name: string }[] | null =
				await getGameNames();
			console.log("games: ", gameNamesList);

			if (!gameNamesList) return;

			const gameNames: string[] = gameNamesList.map(
				(game: { game_name: string }): string => {
					return game.game_name;
				}
			);
			setGameNames(gameNames);
		};
		fetchGameNames();
	}, []);

	// Fetch highscores whenever the current game or page changes
	useEffect((): void => {
		if (gameNames.length === 0) return;

		const fetchHighscores = async () => {
			const currentGameName: string = gameNames[currentGameIndex];
			const highscoresData: UserBest[] | null =
				await getHighscoresFromGameName(currentGameName);
			if (!highscoresData) return;

			setHighscores(highscoresData);
			setTotalPages(Math.ceil(highscoresData.length / 10));
		};

		fetchHighscores();
	}, [currentGameIndex, currentPage, gameNames]);

	// Function to handle game navigation
	const handleNextGame = (): void => {
		if (currentGameIndex < gameNames.length - 1) {
			setCurrentGameIndex(currentGameIndex + 1);
			setCurrentPage(0); // Reset to the first page when changing game
		}
	};

	const handlePreviousGame = (): void => {
		if (currentGameIndex > 0) {
			setCurrentGameIndex(currentGameIndex - 1);
			setCurrentPage(0); // Reset to the first page when changing game
		}
	};

	// Pagination for highscores
	const handleNextPage = () => {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePreviousPage = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	// Calculate highscores to display on the current page
	const startIndex: number = currentPage * 10;
	const currentHighscores: UserBest[] = highscores.slice(
		startIndex,
		startIndex + 10
	);

	// Title for the current game
	useEffect((): void => {
		if (gameNames.length === 0) return;
		setTitle(
			`${formatGameName(gameNames[currentGameIndex])} - Page ${currentPage + 1}`.toUpperCase()
		);
	}, [currentGameIndex, currentPage, gameNames]);

	return (
		<>
			<div className="grid-item" id="title">
				<h1>{t("Highscores")}</h1>
			</div>
			<div className="grid-item" id="back">
				<i
					className={`fa-solid fa-arrow-left`}
					onClick={(): void => navigate(-1)}
				></i>
			</div>
			<div className="grid-item highscores-container">
				<div className="game-navigation-arrows left">
					<button
						onClick={handlePreviousGame}
						disabled={currentGameIndex === 0}
					>
						&lt; Previous Game
					</button>
				</div>
				<h2>{title}</h2>
				<div className="game-navigation-arrows right">
					<button
						onClick={handleNextGame}
						disabled={currentGameIndex === gameNames.length - 1}
					>
						Next Game &gt;
					</button>
				</div>
				<div className="highscore-navigation-arrows left">
					<button
						onClick={handlePreviousPage}
						disabled={currentPage === 0}
					>
						&lt; Previous Page
					</button>
				</div>
				<div className="highscore-navigation-arrows right">
					<button
						onClick={handleNextPage}
						disabled={currentPage === totalPages - 1}
					>
						Next Page &gt;
					</button>
				</div>
				<table className="highscores-table">
					<thead>
						<tr>
							<th>{t("Rank")}</th>
							<th colSpan={3}>{t("Username")}</th>
							<th>{t("Score")}</th>
						</tr>
					</thead>
					<tbody>
						{currentHighscores.map(
							(user: UserBest, index: number): JSX.Element => {
								return (
									<tr key={index}>
										<td>{startIndex + index + 1}</td>
										<td colSpan={3}>{user.username}</td>
										<td>{formatTime(user.score)}</td>
									</tr>
								);
							}
						)}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default Highscores;
