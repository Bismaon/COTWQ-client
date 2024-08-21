// App.tsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./stylesheet/App.css";
import "./stylesheet/style.css";
import Model from "./pages/Model";
import Menus from "./pages/MainMenu";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import HardMode from "./pages/gameModes/HardMode";
import GameMode from "./pages/gameModes/GameMode";
import ContinentsMode from "./pages/gameModes/ContinentsMode";
import SizeMode from "./pages/gameModes/SizeMode";
import GameSetter from "./pages/GameSetter";

function App() {
	return (
		<Router>
			<div className="grid-container" id="main-container">
				<Model />

				<Routes>
					<Route path="/" element={<Menus />} />
					<Route path="/profile" element={<Profile />} />

					{/* Games Route with Nested Routes */}
					<Route path="/games" element={<Games />}>
						<Route path="normal" element={<SizeMode />}>
							<Route path="classic" element={<GameMode />}>
								<Route path=":mode" element={<GameSetter />} />
							</Route>
							<Route
								path="sequential-random"
								element={<GameMode />}
							>
								<Route path=":mode" element={<GameSetter />} />
							</Route>
							<Route path="hard" element={<HardMode />}>
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
							</Route>
						</Route>
						<Route path="continents" element={<ContinentsMode />}>
							<Route path=":continent" element={<SizeMode />}>
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
						</Route>
					</Route>

					{/* Catch-all for undefined routes */}
					<Route
						path="/*"
						element={<h2>404 Not Found - B o dau</h2>}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;
