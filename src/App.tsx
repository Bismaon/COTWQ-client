// App.tsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./stylesheet/style.css";
import Model from "./pages/Model";
import Menus from "./pages/MainMenu";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import HardMode from "./pages/HardMode";
import GameMode from "./pages/GameMode";
import ContinentsMode from "./pages/ContinentsMode";
import SizeMode from "./pages/SizeMode";
import GameSetter from "./pages/GameSetter";
import { ModelProvider } from "./pages/ModelContext";
import Settings from "./pages/Settings";
import "./translation/i18n";
import Highscores from "./pages/Highscores";

function App(): JSX.Element {
	return (
		<Router>
			<ModelProvider>
				<div className="grid-container" id="main-container">
					<Model />
					<Routes>
						<Route path="/" element={<Menus />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="/highscores" element={<Highscores />} />
						<Route path="/games" element={<Games />}>
							<Route path="normal" element={<SizeMode />}>
								<Route path="classic" element={<GameMode />}>
									<Route
										path=":mode"
										element={<GameSetter />}
									/>
								</Route>
								<Route
									path="sequential-random"
									element={<GameMode />}
								>
									<Route
										path=":mode"
										element={<GameSetter />}
									/>
								</Route>
								<Route path="hard" element={<HardMode />}>
									<Route
										path="classic"
										element={<GameMode />}
									>
										<Route
											path=":mode"
											element={<GameSetter />}
										/>
									</Route>
									<Route
										path="sequential-random"
										element={<GameMode />}
									>
										<Route
											path=":mode"
											element={<GameSetter />}
										/>
									</Route>
								</Route>
							</Route>
							<Route
								path="continents"
								element={<ContinentsMode />}
							>
								<Route path=":continent" element={<SizeMode />}>
									<Route
										path="classic"
										element={<GameMode />}
									>
										<Route
											path=":mode"
											element={<GameSetter />}
										/>
									</Route>
									<Route
										path="sequential-random"
										element={<GameMode />}
									>
										<Route
											path=":mode"
											element={<GameSetter />}
										/>
									</Route>
									<Route path="hard" element={<HardMode />}>
										<Route
											path="classic"
											element={<GameMode />}
										>
											<Route
												path=":mode"
												element={<GameSetter />}
											/>
										</Route>
										<Route
											path="sequential-random"
											element={<GameMode />}
										>
											<Route
												path=":mode"
												element={<GameSetter />}
											/>
										</Route>
									</Route>
								</Route>
							</Route>
						</Route>
						{/* Catch-all for undefined routes */}
						<Route
							path="/*"
							element={<h2>404 Not Found - B o dau</h2>}
						/>
					</Routes>
					<footer className="grid-item" id="footer">
						Bismaon 2024
					</footer>
				</div>
			</ModelProvider>
		</Router>
	);
}

export default App;
